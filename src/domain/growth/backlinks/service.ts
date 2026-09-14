import { loadWorkspace, saveWorkspace, writesEnabled } from "./store";
import { getLinkableAssets, getAssetById } from "./assets";
import { scoreOpportunity, priorityBand } from "./scoring";
import { pickAssetForOpportunity, pitchForAsset } from "./matching";
import { assessLinkRisk } from "./risk";
import { draftOutreach, suggestedFollowUpIso, shouldBlockFollowUp } from "./outreach";
import {
  classifyCompetitorIntent,
  isDuplicateProspect,
  mapImportedBacklinks,
  mapManualProspects,
  mapSourceRequests,
  parseCsv,
  prospectKey,
  serializeCsv,
} from "./csv";
import { buildResearchIdeas } from "./research-ideas";
import { generateDiscoveryQueries } from "./queries";
import { runWeeklyWorkflow, type WeeklyRunInputs } from "./weekly";
import { mergeCommunityRegistry } from "./communities";
import { ingestForumThreads, type ForumThreadInput } from "./outreach-agent";
import { ensureCampaigns } from "./seed";
import { DEFAULT_OUTREACH_SCORE_WEIGHTS } from "./types";
import { hydrateWorkspace } from "./hydrate-actionable";
import type {
  BacklinkOpportunity,
  BacklinkWorkspace,
  OpportunityStatus,
  OutreachStatus,
  SourceRequestPlatform,
} from "./types";
import { SOURCE_REQUEST_PLATFORMS } from "./types";

export function getWorkspace(): BacklinkWorkspace {
  const ws = loadWorkspace();
  return hydrateWorkspace({
    ...ws,
    settings: {
      ...ws.settings,
      outreachScoreWeights:
        ws.settings.outreachScoreWeights ?? DEFAULT_OUTREACH_SCORE_WEIGHTS,
    },
    campaigns: ensureCampaigns(ws.campaigns),
    communities: mergeCommunityRegistry(ws.communities),
    communityHistory: ws.communityHistory ?? [],
    researchIdeas: ws.researchIdeas.length ? ws.researchIdeas : buildResearchIdeas(),
    discoveryQueries: ws.discoveryQueries.length
      ? ws.discoveryQueries
      : generateDiscoveryQueries(ws.settings.competitorDomains),
  });
}

export function dashboardStats(ws = getWorkspace()) {
  const opps = ws.opportunities;
  const due = opps.filter(
    (o) =>
      o.outreachStatus === "follow_up_due" ||
      (o.nextFollowUpAt && new Date(o.nextFollowUpAt) <= new Date()),
  );
  const funnel = {
    prospects: ws.prospects.length,
    contacted: opps.filter((o) =>
      ["contacted", "follow_up_due", "responded", "interested", "declined", "link_earned", "mention_earned", "no_response"].includes(
        o.outreachStatus,
      ),
    ).length,
    responses: opps.filter((o) =>
      ["responded", "interested", "declined", "link_earned", "mention_earned"].includes(
        o.outreachStatus,
      ),
    ).length,
    earned: opps.filter((o) =>
      o.outreachStatus === "link_earned" || o.outreachStatus === "mention_earned",
    ).length,
  };
  const byType: Record<string, { total: number; earned: number }> = {};
  for (const o of opps) {
    const slot = (byType[o.opportunityType] ??= { total: 0, earned: 0 });
    slot.total += 1;
    if (o.outreachStatus === "link_earned") slot.earned += 1;
  }
  const byCampaign = ws.campaigns.map((c) => {
    const rows = opps.filter((o) => o.campaignId === c.id);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      total: rows.length,
      earned: rows.filter((o) => o.outreachStatus === "link_earned").length,
    };
  });
  const topAssets = getLinkableAssets()
    .filter((a) => a.status === "live")
    .slice(0, 8);
  return {
    totalProspects: ws.prospects.length,
    highPriority: opps.filter(
      (o) =>
        o.status !== "REJECTED" &&
        (o.priority === "MUST_PURSUE" || o.priority === "HIGH"),
    ).length,
    outreachDue: due.length,
    responses: funnel.responses,
    earnedLinks: ws.earnedLinks.filter((l) => l.status === "LIVE").length,
    earnedMentions: opps.filter((o) => o.outreachStatus === "mention_earned").length,
    referringDomains: new Set(ws.earnedLinks.map((l) => l.sourceDomain)).size,
    topAssets,
    byCampaign,
    byType,
    funnel,
    candidates: opps.filter((o) => o.status === "CANDIDATE").length,
  };
}

export function filterOpportunities(
  ws: BacklinkWorkspace,
  q: {
    type?: string;
    sport?: string;
    country?: string;
    language?: string;
    asset?: string;
    status?: string;
    campaign?: string;
    contact?: string;
    topic?: string;
    minScore?: number;
    risk?: string;
  },
): BacklinkOpportunity[] {
  return ws.opportunities.filter((o) => {
    if (q.type && o.opportunityType !== q.type) return false;
    if (q.sport && o.sport !== q.sport) return false;
    if (q.country && o.country !== q.country) return false;
    if (q.language && o.language !== q.language) return false;
    if (q.asset && o.targetAssetId !== q.asset) return false;
    if (q.status && o.status !== q.status) return false;
    if (q.campaign && o.campaignId !== q.campaign) return false;
    if (q.risk && o.risk !== q.risk) return false;
    if (q.minScore != null && o.overallScore < q.minScore) return false;
    if (q.topic && !o.topic.toLowerCase().includes(q.topic.toLowerCase())) {
      return false;
    }
    if (q.contact === "yes" && !o.contactEmail) return false;
    if (q.contact === "no" && o.contactEmail) return false;
    return true;
  });
}

export function reviewOpportunity(
  id: string,
  status: OpportunityStatus,
  notes?: string,
): BacklinkWorkspace {
  const ws = getWorkspace();
  const next = {
    ...ws,
    opportunities: ws.opportunities.map((o) =>
      o.id === id
        ? {
            ...o,
            status,
            notes: notes ?? o.notes,
            outreachStatus:
              status === "APPROVED" && o.outreachStatus === "not_contacted"
                ? "draft_ready"
                : o.outreachStatus,
          }
        : o,
    ),
  };
  saveWorkspace(next);
  return next;
}

export function setOutreachStatus(
  id: string,
  outreachStatus: OutreachStatus,
): BacklinkWorkspace {
  const ws = getWorkspace();
  const opp = ws.opportunities.find((o) => o.id === id);
  if (!opp) throw new Error("opportunity_not_found");
  if (
    shouldBlockFollowUp({
      outreachStatus: opp.outreachStatus,
      followUpCount: opp.followUpCount,
      maxFollowUps: ws.settings.maxFollowUps,
    }) &&
    outreachStatus === "follow_up_due"
  ) {
    throw new Error("follow_up_blocked");
  }
  const now = new Date().toISOString();
  const next = {
    ...ws,
    opportunities: ws.opportunities.map((o) => {
      if (o.id !== id) return o;
      const patch: BacklinkOpportunity = { ...o, outreachStatus };
      if (outreachStatus === "contacted") {
        patch.firstContactedAt = o.firstContactedAt ?? now;
        patch.lastContactedAt = now;
        patch.nextFollowUpAt = suggestedFollowUpIso(
          new Date(),
          ws.settings.followUpDays,
        );
      }
      if (outreachStatus === "follow_up_due") {
        patch.lastContactedAt = now;
        patch.followUpCount = (o.followUpCount ?? 0) + 1;
      }
      return patch;
    }),
  };
  saveWorkspace(next);
  return next;
}

export function importCompetitorCsv(csvText: string): {
  created: number;
  skippedDuplicates: number;
} {
  const ws = getWorkspace();
  const rows = mapImportedBacklinks(csvText);
  const assets = getLinkableAssets();
  const existing = ws.prospects.map((p) => p.domain);
  let created = 0;
  let skippedDuplicates = 0;
  const next = { ...ws };

  for (const row of rows) {
    if (isDuplicateProspect(existing, row.referringDomain) &&
        next.opportunities.some((o) => o.url === row.referringPage)) {
      skippedDuplicates += 1;
      continue;
    }
    const intent = classifyCompetitorIntent(
      row.referringPage,
      row.anchor,
      row.targetPage,
    );
    const type =
      intent === "data_citation" || intent === "statistics"
        ? "DATABASE_CITATION"
        : intent === "tool"
          ? "TOOL_CITATION"
          : intent === "roundup" || intent === "best_guide"
            ? "ROUNDUP_INCLUSION"
            : "COMPETITOR_LINK_GAP";
    const asset = pickAssetForOpportunity(assets, {
      topic: row.anchor ?? row.referringPage,
      opportunityType: type,
      competitorTargetUrl: row.targetPage,
      text: `${row.referringPage} ${row.anchor ?? ""}`,
    });
    if (!asset) continue;
    const pitch = pitchForAsset(asset, {
      topic: row.anchor ?? "competitor citation",
      opportunityType: type,
      competitorTargetUrl: row.targetPage,
    });
    const authority = row.authority != null && Number.isFinite(row.authority)
      ? Math.max(20, Math.min(85, row.authority))
      : 50;
    const scored = scoreOpportunity({
      relevance: 70,
      authority,
      assetFit: asset.linkabilityScore,
      likelihood: 45,
      editorialQuality: 60,
      relationship: 5,
      reasons: [
        `Competitor page ${row.targetPage ?? "(unknown target)"} earned a link.`,
        row.authority != null
          ? `Imported ${row.metricSource} metric ${row.authority} labeled — not Kitletics DA/DR.`
          : "No vendor metric on this row.",
        pitch.why,
      ],
    });
    const risk = assessLinkRisk({
      domain: row.referringDomain,
      url: row.referringPage,
    });
    const domain = prospectKey(row.referringDomain);
    if (!isDuplicateProspect(existing, domain)) {
      existing.push(domain);
      next.prospects.push({
        id: `prospect-imp-${domain.replace(/\W+/g, "-")}`,
        name: domain,
        domain,
        homepageUrl: `https://${domain}`,
        category: "RUNNING_MEDIA",
        country: "unknown",
        language: "en",
        market: "unknown",
        whyRelevant: `Linked to a competitor (${row.targetPage ?? "unknown page"}).`,
        contactStatus: "CONTACT_UNKNOWN",
        contactRole: "unknown",
      });
    }
    const prospect = next.prospects.find((p) => p.domain === domain)!;
    next.opportunities.push({
      id: `opp-imp-${created}-${domain.replace(/\W+/g, "-").slice(0, 24)}`,
      prospectId: prospect.id,
      siteName: prospect.name,
      domain,
      url: row.referringPage,
      opportunityType: type,
      contactRole: "unknown",
      country: "unknown",
      language: "en",
      market: "unknown",
      topic: row.anchor ?? intent,
      sport: "running",
      authorityScore: scored.authority,
      trafficEstimate: row.traffic,
      relevanceScore: scored.relevance,
      likelihoodScore: scored.likelihood,
      assetFitScore: scored.assetFit,
      relationshipScore: scored.relationship,
      editorialQualityScore: scored.editorialQuality,
      overallScore: scored.overall,
      scoreReasons: scored.reasons,
      targetAssetId: asset.assetId,
      targetUrl: asset.url,
      recommendedAnchorContext: pitch.anchorContext,
      pitchAngle: pitch.angle,
      whyTheyMightLink: `They already linked to ${row.targetPage ?? "a competitor"}.`,
      whyThisSite: "Referring page in a competitor backlink export.",
      whyThisAsset: pitch.why,
      whyThisAngle: pitch.angle,
      evidence: `Import ${row.metricSource}. Anchor: ${row.anchor ?? "n/a"}.`,
      risk: risk.band,
      riskReasons: risk.reasons,
      sourceType: "competitor_gap",
      sourceUrl: row.referringPage,
      discoveredAt: new Date().toISOString(),
      status: "CANDIDATE",
      priority: scored.band,
      outreachStatus: "not_contacted",
      responseStatus: "none",
      competitorTargetUrl: row.targetPage,
      competitorIntent: intent,
      importedAuthority: row.authority,
      metricSource: row.metricSource,
      nofollow: row.nofollow,
    });
    created += 1;
  }
  saveWorkspace(next);
  return { created, skippedDuplicates };
}

export function importProspectsCsv(csvText: string): { created: number; skipped: number } {
  const ws = getWorkspace();
  const rows = mapManualProspects(csvText);
  const existing = ws.prospects.map((p) => p.domain);
  let created = 0;
  let skipped = 0;
  const next = { ...ws, prospects: [...ws.prospects] };
  for (const row of rows) {
    if (isDuplicateProspect(existing, row.domain)) {
      skipped += 1;
      continue;
    }
    existing.push(row.domain);
    next.prospects.push({
      id: `prospect-man-${row.domain.replace(/\W+/g, "-")}`,
      name: row.name,
      domain: row.domain,
      homepageUrl: row.homepageUrl,
      category: "RUNNING_MEDIA",
      country: row.country ?? "unknown",
      language: "en",
      market: row.country ?? "unknown",
      whyRelevant: row.whyRelevant ?? "Manual import",
      contactStatus: row.contactStatus,
      contactEmail: row.contactEmail,
      contactRole: "unknown",
      contactSource: row.contactEmail ? "manual_csv" : undefined,
    });
    created += 1;
  }
  saveWorkspace(next);
  return { created, skipped };
}

export function importSourceRequestCsv(csvText: string): number {
  const ws = getWorkspace();
  const rows = mapSourceRequests(csvText);
  const next = { ...ws, sourceRequests: [...ws.sourceRequests] };
  for (const row of rows) {
    const platform = (SOURCE_REQUEST_PLATFORMS as readonly string[]).includes(
      row.platform,
    )
      ? (row.platform as SourceRequestPlatform)
      : "manual";
    next.sourceRequests.push({
      id: `sr-${next.sourceRequests.length + 1}-${Date.now()}`,
      platform,
      requestTitle: row.requestTitle,
      journalist: row.journalist,
      publication: row.publication,
      deadline: row.deadline,
      topic: row.topic,
      requirements: row.requirements,
      opportunityScore: 70,
      suggestedResponseAngle: "Offer the Running Shoe Database as a citeable dataset if the query is data/spec related.",
      status: "new",
    });
  }
  saveWorkspace(next);
  return rows.length;
}

export function exportPriorityCsv(ws = getWorkspace()): string {
  const headers = [
    "id",
    "siteName",
    "domain",
    "priority",
    "overallScore",
    "opportunityType",
    "targetUrl",
    "pitchAngle",
    "contactStatus",
    "outreachStatus",
    "risk",
  ];
  const ranked = [...ws.opportunities]
    .filter((o) => o.status !== "REJECTED")
    .sort((a, b) => b.overallScore - a.overallScore);
  return serializeCsv(
    headers,
    ranked.map((o) => ({
      id: o.id,
      siteName: o.siteName,
      domain: o.domain,
      priority: o.priority,
      overallScore: o.overallScore,
      opportunityType: o.opportunityType,
      targetUrl: o.targetUrl,
      pitchAngle: o.pitchAngle,
      contactStatus: o.contactEmail ? "CONFIRMED" : "CONTACT_UNKNOWN",
      outreachStatus: o.outreachStatus,
      risk: o.risk,
    })),
  );
}

export function exportEarnedCsv(ws = getWorkspace()): string {
  return serializeCsv(
    ["sourceDomain", "sourceUrl", "targetUrl", "anchor", "status", "nofollow"],
    ws.earnedLinks,
  );
}

export function exportProspectsCsv(ws = getWorkspace()): string {
  return serializeCsv(
    ["id", "name", "domain", "category", "country", "language", "contactStatus", "whyRelevant"],
    ws.prospects,
  );
}

export function exportCampaignsCsv(ws = getWorkspace()): string {
  return serializeCsv(
    ["id", "name", "status", "assetId", "angle", "audience", "market"],
    ws.campaigns,
  );
}

export function persistWeeklyRun(inputs: WeeklyRunInputs = {}) {
  const ws = getWorkspace();
  const assets = getLinkableAssets();
  const result = runWeeklyWorkflow(ws, inputs, assets);
  if (writesEnabled()) saveWorkspace(result.workspace);
  return result;
}

export function persistForumThreadIngest(
  threads: ForumThreadInput[],
  now?: string,
) {
  const ws = getWorkspace();
  const assets = getLinkableAssets();
  const result = ingestForumThreads(ws, threads, assets, now);
  if (writesEnabled()) saveWorkspace(result.workspace);
  return result;
}

export { parseCsv, getAssetById, draftOutreach, writesEnabled, priorityBand };
