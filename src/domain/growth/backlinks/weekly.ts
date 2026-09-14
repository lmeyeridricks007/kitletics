import { scoreOpportunity, shouldRecommendEngagement } from "./scoring";
import { pickAssetForOpportunity, pitchForAsset } from "./matching";
import { assessLinkRisk } from "./risk";
import { shouldBlockFollowUp } from "./outreach";
import {
  classifyCompetitorIntent,
  isDuplicateProspect,
  mapImportedBacklinks,
  mapSourceRequests,
  parseCsv,
  prospectKey,
} from "./csv";
import { buildLearningReport, formatRate, type LearningReport } from "./learning";
import { weeklyDiscoveryQueries } from "./weekly-queries";
import { hydrateWorkspace, hydrateOpportunity } from "./hydrate-actionable";
import {
  buildActionQueue,
  isForumReady,
  nextActionLine,
  resolvedAssetUrl,
  type ActionQueueSnapshot,
} from "./action-queue";
import { kitleticsPublicUrl } from "./public-url";
import type {
  BacklinkOpportunity,
  BacklinkProspect,
  BacklinkWorkspace,
  LinkableAsset,
  OpportunityType,
  ProspectCategory,
  SourceRequest,
  WeeklyIngestCounts,
  WeeklyRunRecord,
} from "./types";
import { resolveOpportunityType, isForumOpportunityType } from "./type-aliases";
import {
  isDuplicateOpportunity,
} from "./opportunity-dedupe";

export { isDuplicateOpportunity, normalizeOpportunityUrl, opportunityFingerprint } from "./opportunity-dedupe";

function stableOppId(prefix: string, url: string): string {
  const slug = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36)
    .toLowerCase();
  let h = 0;
  for (const ch of url) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return `${prefix}-${slug}-${h.toString(16)}`;
}

function categoryForType(type: OpportunityType): ProspectCategory {
  if (
    type === "RUNNING_CLUB" ||
    type === "COMMUNITY_RESOURCE" ||
    isForumOpportunityType(type)
  ) {
    return "COMMUNITY";
  }
  if (type === "NEWSLETTER") return "NEWSLETTERS";
  if (type === "PODCAST") return "PODCASTS";
  if (type === "UNIVERSITY_RESEARCH" || type === "RESEARCH_CITATION") return "DATA_RESEARCH";
  if (type === "RETAILER_RESOURCE") return "RETAILERS";
  if (type === "BRAND_PR") return "BRANDS";
  if (type === "DIGITAL_PR" || type === "JOURNALIST_SOURCE_REQUEST") return "MAINSTREAM_MEDIA";
  return "RUNNING_MEDIA";
}

function parseOpportunityType(raw: string | undefined): OpportunityType {
  return resolveOpportunityType(raw, "RESOURCE_PAGE");
}

function ensureProspect(
  ws: BacklinkWorkspace,
  spec: {
    name: string;
    domain: string;
    url: string;
    category: ProspectCategory;
    whyRelevant: string;
    country?: string;
    language?: string;
  },
): BacklinkProspect {
  const domain = prospectKey(spec.domain);
  const existing = ws.prospects.find((p) => prospectKey(p.domain) === domain);
  if (existing) return existing;
  const prospect: BacklinkProspect = {
    id: `prospect-wk-${domain.replace(/\W+/g, "-")}`,
    name: spec.name,
    domain,
    homepageUrl: `https://${domain}`,
    category: spec.category,
    country: spec.country ?? "unknown",
    language: spec.language ?? "en",
    market: spec.country ?? "unknown",
    whyRelevant: spec.whyRelevant,
    contactStatus: "CONTACT_UNKNOWN",
    contactRole: "unknown",
  };
  ws.prospects.push(prospect);
  return prospect;
}

function scoredOpportunity(input: {
  id: string;
  prospect: BacklinkProspect;
  url: string;
  type: OpportunityType;
  topic: string;
  evidence: string;
  why: string;
  contactRoute?: string;
  contactName?: string;
  sourceType: BacklinkOpportunity["sourceType"];
  competitorTargetUrl?: string;
  now: string;
  assets: LinkableAsset[];
  weights: BacklinkWorkspace["settings"]["scoreWeights"];
}): BacklinkOpportunity | undefined {
  const asset = pickAssetForOpportunity(input.assets, {
    topic: input.topic,
    opportunityType: input.type,
    text: `${input.why} ${input.evidence}`,
    competitorTargetUrl: input.competitorTargetUrl,
  });
  if (!asset) return undefined;
  const pitch = pitchForAsset(asset, {
    topic: input.topic,
    opportunityType: input.type,
    text: input.evidence,
    competitorTargetUrl: input.competitorTargetUrl,
  });
  const hints =
    input.sourceType === "competitor_gap"
      ? { relevance: 90, authority: 62, likelihood: 55, editorial: 72, relationship: 10 }
      : input.sourceType === "weekly_request" || input.sourceType === "source_request"
        ? { relevance: 86, authority: 68, likelihood: 58, editorial: 80, relationship: 12 }
        : { relevance: 84, authority: 58, likelihood: 50, editorial: 74, relationship: 10 };
  const scored = scoreOpportunity({
    relevance: hints.relevance,
    authority: hints.authority,
    assetFit: Math.min(100, asset.linkabilityScore - (asset.status === "planned" ? 12 : 0)),
    likelihood: hints.likelihood,
    editorialQuality: hints.editorial,
    relationship: hints.relationship,
    weights: input.weights,
    reasons: [input.why, `Asset: ${asset.title} (${asset.status})`],
  });
  const risk = assessLinkRisk({
    domain: input.prospect.domain,
    url: input.url,
    opportunityType: input.type,
  });
  return {
    id: input.id,
    prospectId: input.prospect.id,
    siteName: input.prospect.name,
    domain: input.prospect.domain,
    url: input.url,
    opportunityType: input.type,
    contactName: input.contactName,
    contactRole: "unknown",
    contactUrl: input.contactRoute,
    country: input.prospect.country,
    language: input.prospect.language,
    market: input.prospect.market,
    topic: input.topic,
    sport: "running",
    authorityScore: scored.authority,
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
    whyTheyMightLink: input.why,
    whyThisSite: input.why,
    whyThisAsset: pitch.why,
    whyThisAngle: pitch.angle,
    evidence: input.evidence,
    risk: risk.band,
    riskReasons: risk.reasons,
    sourceType: input.sourceType,
    sourceUrl: input.url,
    discoveredAt: input.now,
    status: "CANDIDATE",
    priority: scored.band,
    notes: input.contactRoute
      ? `Contact route: ${input.contactRoute}. Awaiting human APPROVE.`
      : "Awaiting human APPROVE. Contact unknown.",
    outreachStatus: "not_contacted",
    responseStatus: "none",
    metricSource: "editorial_judgment",
    competitorTargetUrl: input.competitorTargetUrl,
  };
}

export interface WeeklyRunInputs {
  since?: string;
  now?: string;
  competitorCsv?: string;
  journalistRequestCsv?: string;
  newPagesCsv?: string;
  searchPerformanceCsv?: string;
}

export interface WeeklyCard {
  id: string;
  who: string;
  why: string;
  asset: string;
  assetUrl: string;
  angle: string;
  contactRoute: string;
  score: number;
  priority: string;
  url: string;
  type: string;
}

export interface SearchPerformanceNote {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
}

export interface WeeklySendBlock {
  publication: string;
  person?: string;
  targetUrl: string;
  contact: string;
  contactHere: string;
  promote: string;
  subject: string;
  message: string;
  followUp: string;
  placement: string;
  nextAction: string;
  id: string;
}

export interface WeeklyDigest {
  ranAt: string;
  since: string;
  ingested: WeeklyIngestCounts;
  newMustPursue: WeeklyCard[];
  newHigh: WeeklyCard[];
  followUpDue: WeeklyCard[];
  forumsToRespond: WeeklyCard[];
  journalistDeadlines: SourceRequest[];
  linksEarned: Array<{ id: string; sourceUrl: string; targetUrl: string; status: string }>;
  mentionsEarned: Array<{ id: string; sourceUrl: string; targetUrl: string; status: string }>;
  linksLost: Array<{ id: string; sourceUrl: string; targetUrl: string; status: string }>;
  learning: LearningReport;
  newLiveAssets: Array<{ assetId: string; title: string; url: string }>;
  pitchReadyResearch: Array<{ id: string; headline: string; status: string }>;
  openSourceRequests: SourceRequest[];
  discoveryQueries: ReturnType<typeof weeklyDiscoveryQueries>;
  searchPerformance: SearchPerformanceNote[];
  skippedDuplicates: number;
  notes: string[];
  doTheseToday: WeeklySendBlock[];
  applyNow: ActionQueueSnapshot["applyNow"];
  respondToday: WeeklySendBlock[];
  needsContactResearchCount: number;
}

function card(
  opp: BacklinkOpportunity,
  assets: LinkableAsset[],
): WeeklyCard {
  const asset = assets.find((a) => a.assetId === opp.targetAssetId);
  const promote = resolvedAssetUrl(opp) || kitleticsPublicUrl(asset?.url);
  return {
    id: opp.id,
    who: opp.contactName ? `${opp.contactName} (${opp.siteName})` : opp.siteName,
    why: opp.whyTheyMightLink,
    asset: asset?.title ?? opp.targetAssetId,
    assetUrl: promote,
    angle: opp.pitchAngle,
    contactRoute: nextActionLine(opp),
    score: opp.overallScore,
    priority: opp.priority,
    url: opp.url,
    type: opp.opportunityType,
  };
}

function sendBlock(opp: BacklinkOpportunity): WeeklySendBlock {
  return {
    id: opp.id,
    publication: opp.siteName,
    person: opp.contactName,
    targetUrl: opp.url,
    contact: opp.contactName
      ? `${opp.contactName}${opp.contactRole ? ` (${opp.contactRole})` : ""}`
      : "unnamed desk",
    contactHere: opp.contactEmail
      ? `${opp.contactEmail} · ${opp.contactUrl ?? ""}`
      : opp.applicationUrl || opp.contactUrl || opp.url,
    promote: resolvedAssetUrl(opp),
    subject: opp.outreachSubject ?? "",
    message: opp.outreachMessage ?? opp.suggestedResponse ?? "",
    followUp: opp.followUpMessage ?? "",
    placement: opp.suggestedPlacement ?? "",
    nextAction: nextActionLine(opp),
  };
}

function ingestCompetitor(
  ws: BacklinkWorkspace,
  csv: string,
  assets: LinkableAsset[],
  now: string,
): { created: number; skipped: number } {
  const rows = mapImportedBacklinks(csv);
  let created = 0;
  let skipped = 0;
  const existingDomains = ws.prospects.map((p) => p.domain);
  for (const row of rows) {
    const domain = prospectKey(row.referringDomain);
    const intent = classifyCompetitorIntent(
      row.referringPage,
      row.anchor,
      row.targetPage,
    );
    const type: OpportunityType =
      intent === "data_citation" || intent === "statistics"
        ? "DATABASE_CITATION"
        : intent === "tool"
          ? "TOOL_CITATION"
          : intent === "roundup" || intent === "best_guide"
            ? "ROUNDUP_INCLUSION"
            : intent === "resource_page"
              ? "RESOURCE_PAGE"
              : "COMPETITOR_LINK_GAP";
    const dummyAsset = pickAssetForOpportunity(assets, {
      topic: row.anchor ?? row.referringPage,
      opportunityType: type,
      competitorTargetUrl: row.targetPage,
      text: row.referringPage,
    });
    if (
      isDuplicateOpportunity(ws.opportunities, {
        url: row.referringPage,
        domain,
        opportunityType: type,
        targetAssetId: dummyAsset?.assetId ?? "",
      })
    ) {
      skipped += 1;
      continue;
    }
    if (!isDuplicateProspect(existingDomains, domain)) {
      existingDomains.push(domain);
    }
    const prospect = ensureProspect(ws, {
      name: domain,
      domain,
      url: row.referringPage,
      category: "RUNNING_MEDIA",
      whyRelevant: `Linked to a competitor (${row.targetPage ?? "unknown"}).`,
    });
    const opp = scoredOpportunity({
      id: stableOppId("opp-wk-comp", row.referringPage),
      prospect,
      url: row.referringPage,
      type,
      topic: row.anchor ?? intent,
      evidence: `Competitor import ${row.metricSource}. Anchor: ${row.anchor ?? "n/a"}.`,
      why: `They already linked to ${row.targetPage ?? "a competitor"}. Complementary Kitletics catalog/tool, not a reciprocal ask.`,
      sourceType: "competitor_gap",
      competitorTargetUrl: row.targetPage,
      now,
      assets,
      weights: ws.settings.scoreWeights,
    });
    if (!opp) {
      skipped += 1;
      continue;
    }
    if (ws.opportunities.some((o) => o.id === opp.id)) {
      skipped += 1;
      continue;
    }
    ws.opportunities.push(opp);
    created += 1;
  }
  return { created, skipped };
}

function ingestRequests(
  ws: BacklinkWorkspace,
  csv: string,
  assets: LinkableAsset[],
  now: string,
): { created: number; skipped: number } {
  const rows = mapSourceRequests(csv);
  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    if (
      ws.sourceRequests.some(
        (s) =>
          s.requestTitle.toLowerCase() === row.requestTitle.toLowerCase() &&
          (s.publication ?? "") === (row.publication ?? ""),
      )
    ) {
      skipped += 1;
      continue;
    }
    const req: SourceRequest = {
      id: `sr-wk-${stableOppId("sr", row.requestTitle)}`,
      platform: "manual",
      requestTitle: row.requestTitle,
      journalist: row.journalist,
      publication: row.publication,
      deadline: row.deadline,
      topic: row.topic,
      requirements: row.requirements,
      opportunityScore: 72,
      suggestedResponseAngle:
        "Offer the Running Shoe Database if the query is data/spec related; Finder for club/beginner asks. Live URL only.",
      status: "new",
    };
    ws.sourceRequests.push(req);
    const host = (row.publication ?? "")
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      ?.replace(/^www\./, "")
      .toLowerCase();
    if (!host || !host.includes(".")) {
      created += 1;
      continue;
    }
    const type: OpportunityType = "JOURNALIST_SOURCE_REQUEST";
    if (
      isDuplicateOpportunity(ws.opportunities, {
        url: `https://${host}`,
        domain: host,
        opportunityType: type,
        targetAssetId: "asset-shoe-database",
      })
    ) {
      skipped += 1;
      continue;
    }
    const prospect = ensureProspect(ws, {
      name: row.publication ?? host,
      domain: host,
      url: `https://${host}`,
      category: "MAINSTREAM_MEDIA",
      whyRelevant: row.requestTitle,
    });
    const opp = scoredOpportunity({
      id: stableOppId("opp-wk-req", `${host}-${row.requestTitle}`),
      prospect,
      url: `https://${host}`,
      type,
      topic: row.topic,
      evidence: `${row.platform}: ${row.requestTitle}. ${row.requirements}`,
      why: `Open source request: ${row.requestTitle}`,
      contactName: row.journalist,
      contactRoute: "Source-request platform — do not invent an email",
      sourceType: "weekly_request",
      now,
      assets,
      weights: ws.settings.scoreWeights,
    });
    if (opp && !ws.opportunities.some((o) => o.id === opp.id)) {
      ws.opportunities.push(opp);
    }
    created += 1;
  }
  return { created, skipped };
}

function ingestPages(
  ws: BacklinkWorkspace,
  csv: string,
  assets: LinkableAsset[],
  now: string,
): { created: number; skipped: number } {
  const { rows } = parseCsv(csv);
  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    const url = (row.url || row.URL || row.page || "").trim();
    if (!url) continue;
    let domain = (row.domain || row.Domain || "").trim();
    if (!domain) {
      try {
        domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      } catch {
        skipped += 1;
        continue;
      }
    }
    domain = prospectKey(domain);
    const type = parseOpportunityType(row.type || row.Type || row.intent);
    if (
      isDuplicateOpportunity(ws.opportunities, {
        url,
        domain,
        opportunityType: type,
        targetAssetId: "",
      })
    ) {
      skipped += 1;
      continue;
    }
    const prospect = ensureProspect(ws, {
      name: row.site || row.name || row.who || domain,
      domain,
      url,
      category: categoryForType(type),
      whyRelevant: row.evidence || row.why || url,
      country: row.country,
      language: row.language,
    });
    const opp = scoredOpportunity({
      id: stableOppId("opp-wk-page", url),
      prospect,
      url,
      type,
      topic: row.topic || row.title || type,
      evidence: row.evidence || row.why || "Weekly research page with demonstrated link intent.",
      why: row.why || row.evidence || `Existing education/resource URL: ${url}`,
      contactRoute: row.contact_route || row.contact || undefined,
      contactName: row.who || row.contact_person || undefined,
      sourceType: "weekly_page",
      now,
      assets,
      weights: ws.settings.scoreWeights,
    });
    if (!opp || ws.opportunities.some((o) => o.id === opp.id)) {
      skipped += 1;
      continue;
    }
    if (
      isDuplicateOpportunity(
        ws.opportunities,
        {
          url: opp.url,
          domain: opp.domain,
          opportunityType: opp.opportunityType,
          targetAssetId: opp.targetAssetId,
        },
      )
    ) {
      skipped += 1;
      continue;
    }
    ws.opportunities.push(opp);
    created += 1;
  }
  return { created, skipped };
}

function convertOpenRequests(
  ws: BacklinkWorkspace,
  assets: LinkableAsset[],
  now: string,
): { created: number; skipped: number } {
  let created = 0;
  let skipped = 0;
  for (const req of ws.sourceRequests) {
    if (req.status !== "new") continue;
    const pub = req.publication ?? "";
    const host = pub.replace(/^https?:\/\//, "").split("/")[0]?.replace(/^www\./, "").toLowerCase();
    if (!host || !host.includes(".")) {
      skipped += 1;
      continue;
    }
    if (
      isDuplicateOpportunity(ws.opportunities, {
        url: `https://${host}`,
        domain: host,
        opportunityType: "JOURNALIST_SOURCE_REQUEST",
        targetAssetId: req.recommendedAssetId ?? "asset-shoe-database",
      })
    ) {
      skipped += 1;
      continue;
    }
    const prospect = ensureProspect(ws, {
      name: pub,
      domain: host,
      url: `https://${host}`,
      category: "MAINSTREAM_MEDIA",
      whyRelevant: req.requestTitle,
    });
    const opp = scoredOpportunity({
      id: stableOppId("opp-wk-open", `${host}-${req.id}`),
      prospect,
      url: `https://${host}`,
      type: "JOURNALIST_SOURCE_REQUEST",
      topic: req.topic,
      evidence: req.requestTitle,
      why: `Unconverted source request still open: ${req.requestTitle}`,
      contactName: req.journalist,
      contactRoute: `${req.platform} — do not invent an email`,
      sourceType: "source_request",
      now,
      assets,
      weights: ws.settings.scoreWeights,
    });
    if (opp) {
      ws.opportunities.push(opp);
      created += 1;
    }
  }
  return { created, skipped };
}

function parseGsc(csv?: string): SearchPerformanceNote[] {
  if (!csv?.trim()) return [];
  const { rows } = parseCsv(csv);
  return rows
    .map((row) => ({
      query: row.Query || row.query || "",
      page: row.Page || row.page || row.URL || "",
      clicks: Number(row.Clicks || row.clicks || 0),
      impressions: Number(row.Impressions || row.impressions || 0),
    }))
    .filter((r) => r.query && r.page)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 12);
}

function followUpsDue(ws: BacklinkWorkspace, now: string): BacklinkOpportunity[] {
  const t = new Date(now).getTime();
  return ws.opportunities.filter((o) => {
    if (shouldBlockFollowUp({
      outreachStatus: o.outreachStatus,
      followUpCount: o.followUpCount,
      maxFollowUps: ws.settings.maxFollowUps,
    })) {
      return false;
    }
    if (o.outreachStatus === "follow_up_due") return true;
    if (o.outreachStatus === "contacted" && o.nextFollowUpAt) {
      return new Date(o.nextFollowUpAt).getTime() <= t;
    }
    return false;
  });
}

export function forumsToRespond(ws: BacklinkWorkspace): BacklinkOpportunity[] {
  return ws.opportunities
    .filter((o) => {
      if (!isForumOpportunityType(o.opportunityType)) return false;
      if (o.status === "REJECTED" || o.status === "DEFERRED") return false;
      if (!["not_contacted", "draft_ready"].includes(o.outreachStatus)) return false;
      return shouldRecommendEngagement({
        helpfulness: o.helpfulnessScore ?? 0,
        communityFit: o.communityFitScore ?? 0,
        spamRisk: o.spamRiskScore ?? 100,
      }).ok;
    })
    .sort((a, b) => (b.responseUrgencyScore ?? 0) - (a.responseUrgencyScore ?? 0));
}

export function journalistDeadlines(
  ws: BacklinkWorkspace,
  now: string,
  withinDays = 7,
): SourceRequest[] {
  const t = new Date(now).getTime();
  const horizon = t + withinDays * 86400000;
  return ws.sourceRequests.filter((s) => {
    if (s.status !== "new" && s.status !== "drafting") return false;
    if (!s.deadline) return false;
    const d = new Date(s.deadline).getTime();
    if (Number.isNaN(d)) return false;
    return d <= horizon;
  });
}

export function mentionsEarnedInWindow(ws: BacklinkWorkspace, since: string) {
  const fromLinks = ws.earnedLinks.filter(
    (l) => l.linkType === "mention" && l.firstSeen >= since,
  );
  const fromOpps = ws.opportunities.filter((o) => {
    if (o.outreachStatus !== "mention_earned") return false;
    const at = o.lastContactedAt ?? o.discoveredAt;
    return at >= since;
  });
  return {
    links: fromLinks,
    opportunities: fromOpps,
  };
}

export function runWeeklyWorkflow(
  workspace: BacklinkWorkspace,
  inputs: WeeklyRunInputs,
  assets: LinkableAsset[],
): { workspace: BacklinkWorkspace; digest: WeeklyDigest; record: WeeklyRunRecord } {
  const now = inputs.now ?? new Date().toISOString();
  const last = workspace.weeklyRuns?.at(-1);
  const since = inputs.since ?? last?.ranAt ?? now;
  const base = hydrateWorkspace(workspace);
  const ws: BacklinkWorkspace = {
    ...base,
    prospects: [...base.prospects],
    opportunities: [...base.opportunities],
    journalists: [...base.journalists],
    sourceRequests: [...base.sourceRequests],
    campaigns: [...base.campaigns],
    earnedLinks: [...base.earnedLinks],
    researchIdeas: [...base.researchIdeas],
    discoveryQueries: [...base.discoveryQueries],
    weeklyRuns: [...(base.weeklyRuns ?? [])],
    communities: [...(base.communities ?? [])],
    communityHistory: [...(base.communityHistory ?? [])],
  };

  const ingested: WeeklyIngestCounts = {
    competitor: 0,
    requests: 0,
    pages: 0,
    skippedDuplicates: 0,
  };
  const createdIds = new Set<string>();
  const beforeIds = new Set(base.opportunities.map((o) => o.id));

  if (inputs.competitorCsv?.trim()) {
    const r = ingestCompetitor(ws, inputs.competitorCsv, assets, now);
    ingested.competitor = r.created;
    ingested.skippedDuplicates += r.skipped;
  }
  if (inputs.journalistRequestCsv?.trim()) {
    const r = ingestRequests(ws, inputs.journalistRequestCsv, assets, now);
    ingested.requests = r.created;
    ingested.skippedDuplicates += r.skipped;
  }
  if (inputs.newPagesCsv?.trim()) {
    const r = ingestPages(ws, inputs.newPagesCsv, assets, now);
    ingested.pages = r.created;
    ingested.skippedDuplicates += r.skipped;
  }
  const converted = convertOpenRequests(ws, assets, now);
  ingested.requests += converted.created;
  ingested.skippedDuplicates += converted.skipped;

  ws.opportunities = ws.opportunities.map(hydrateOpportunity);

  for (const o of ws.opportunities) {
    if (!beforeIds.has(o.id)) createdIds.add(o.id);
  }

  const newOpps = ws.opportunities.filter((o) => createdIds.has(o.id));
  const newMust = newOpps
    .filter((o) => o.priority === "MUST_PURSUE" && o.risk !== "AVOID")
    .sort((a, b) => b.overallScore - a.overallScore);
  const newHigh = newOpps
    .filter((o) => o.priority === "HIGH" && o.risk !== "AVOID")
    .sort((a, b) => b.overallScore - a.overallScore);

  const due = followUpsDue(ws, now);
  const forums = forumsToRespond(ws).filter(isForumReady);
  const deadlines = journalistDeadlines(ws, now);
  const queue = buildActionQueue(ws);
  const mentions = mentionsEarnedInWindow(ws, since);
  const earned = ws.earnedLinks.filter(
    (l) => l.status === "LIVE" && l.firstSeen >= since,
  );
  const lost = ws.earnedLinks.filter(
    (l) =>
      (l.status === "REMOVED" || l.status === "CHANGED") &&
      (l.lastChecked ?? l.firstSeen) >= since,
  );

  const prevAssets = new Set(last?.liveAssetIds ?? []);
  const live = assets.filter((a) => a.status === "live");
  const newLive = last
    ? live.filter((a) => !prevAssets.has(a.assetId))
    : [];

  const learning = buildLearningReport(ws, assets);
  const notes: string[] = [
    createdIds.size === 0
      ? "No new scored opportunities this run. Seed rows are not recycled as NEW."
      : `Created ${createdIds.size} new opportunity row(s) after dedupe.`,
    ...learning.suggestions,
  ];

  const digest: WeeklyDigest = {
    ranAt: now,
    since,
    ingested,
    newMustPursue: newMust.map((o) => card(o, assets)),
    newHigh: newHigh.map((o) => card(o, assets)),
    followUpDue: due.map((o) => card(o, assets)),
    forumsToRespond: forums.map((o) => card(o, assets)),
    journalistDeadlines: deadlines,
    linksEarned: earned.map((l) => ({
      id: l.id,
      sourceUrl: l.sourceUrl,
      targetUrl: l.targetUrl,
      status: l.status,
    })),
    mentionsEarned: [
      ...mentions.links.map((l) => ({
        id: l.id,
        sourceUrl: l.sourceUrl,
        targetUrl: l.targetUrl,
        status: l.status,
      })),
      ...mentions.opportunities.map((o) => ({
        id: o.id,
        sourceUrl: o.url,
        targetUrl: o.targetUrl || o.earnedLinkTarget || "UNKNOWN",
        status: o.outreachStatus,
      })),
    ],
    linksLost: lost.map((l) => ({
      id: l.id,
      sourceUrl: l.sourceUrl,
      targetUrl: l.targetUrl,
      status: l.status,
    })),
    learning,
    newLiveAssets: newLive.map((a) => ({
      assetId: a.assetId,
      title: a.title,
      url: a.url,
    })),
    pitchReadyResearch: ws.researchIdeas
      .filter((r) => r.status === "computable" || r.status === "ready_to_pitch")
      .map((r) => ({ id: r.id, headline: r.headline, status: r.status })),
    openSourceRequests: ws.sourceRequests.filter((s) => s.status === "new"),
    discoveryQueries: weeklyDiscoveryQueries(),
    searchPerformance: parseGsc(inputs.searchPerformanceCsv),
    skippedDuplicates: ingested.skippedDuplicates,
    notes,
    doTheseToday: queue.doTheseToday.map(sendBlock),
    applyNow: queue.applyNow,
    respondToday: queue.respondToday.map(sendBlock),
    needsContactResearchCount: queue.needsContactResearch.length,
  };

  const record: WeeklyRunRecord = {
    id: `weekly-${now.slice(0, 10)}`,
    ranAt: now,
    since,
    ingested,
    newMustPursueIds: newMust.map((o) => o.id),
    newHighIds: newHigh.map((o) => o.id),
    followUpDueIds: due.map((o) => o.id),
    earnedIds: earned.map((l) => l.id),
    lostIds: lost.map((l) => l.id),
    liveAssetIds: live.map((a) => a.assetId),
    newLiveAssetIds: newLive.map((a) => a.assetId),
    forumToRespondIds: forums.map((o) => o.id),
    journalistDeadlineIds: deadlines.map((s) => s.id),
    mentionIds: [
      ...mentions.links.map((l) => l.id),
      ...mentions.opportunities.map((o) => o.id),
    ],
    notes,
  };
  ws.weeklyRuns = [...(ws.weeklyRuns ?? []), record].slice(-52);
  ws.updatedAt = now;
  ws.discoveryQueries = ws.discoveryQueries.length
    ? ws.discoveryQueries
    : weeklyDiscoveryQueries();

  return { workspace: ws, digest, record };
}

function rateTable(title: string, rows: LearningReport["byAsset"]): string {
  const shown = rows.filter((r) => r.contacted > 0).slice(0, 12);
  if (shown.length === 0) return `### ${title}\n\n_No contacted rows yet._\n`;
  const body = shown
    .map((r) => `| ${r.key} | ${r.contacted} | ${r.responses} | ${r.earned} | ${formatRate(r)} |`)
    .join("\n");
  return `### ${title}\n\n| Key | Contacted | Responses | Earned | Rate |\n| --- | --- | --- | --- | --- |\n${body}\n`;
}

function cardSection(title: string, cards: WeeklyCard[]): string {
  if (cards.length === 0) return `## ${title}\n\n_None this run._\n`;
  return `## ${title}\n\n${cards
    .map(
      (c) => `### ${c.who} — ${c.score} ${c.priority}

| | |
| --- | --- |
| **Page** | ${c.url} |
| **Type** | ${c.type} |
| **Why** | ${c.why} |
| **Asset** | ${c.asset} (${c.assetUrl || "planned"}) |
| **Angle** | ${c.angle} |
| **Contact route** | ${c.contactRoute} |
| **Score** | ${c.score} |
`,
    )
    .join("\n")}`;
}

function sendBlockSection(title: string, blocks: WeeklySendBlock[]): string {
  if (blocks.length === 0) return `## ${title}\n\n_None. Unready rows sit in NEEDS CONTACT RESEARCH, not this list._\n`;
  return `## ${title}\n\n${blocks
    .map(
      (b, i) => `${i + 1}. **${b.publication}**

Target:
${b.targetUrl}

Contact:
${b.contact}

Contact here:
${b.contactHere}

Promote:
${b.promote}

Subject:
${b.subject}

Placement:
${b.placement}

Send:
${b.message}

Follow-up (5–7 days):
${b.followUp}

Action:
${b.nextAction}
`,
    )
    .join("\n")}`;
}

export function renderWeeklyReport(digest: WeeklyDigest): string {
  const gsc =
    digest.searchPerformance.length === 0
      ? "_No GSC CSV this run. Search performance is optional; do not invent clicks._"
      : [
          "| Query | Page | Clicks | Impressions |",
          "| --- | --- | --- | --- |",
          ...digest.searchPerformance.map(
            (r) => `| ${r.query} | ${r.page} | ${r.clicks} | ${r.impressions} |`,
          ),
        ].join("\n");

  const queries = digest.discoveryQueries
    .map((q) => `- \`${q.query}\` · ${q.intent}`)
    .join("\n");

  return `# Weekly backlink report

**Ran:** ${digest.ranAt}  
**Window starts:** ${digest.since}  
**Outreach:** none sent by this workflow.

Items appear under **DO THESE TODAY** / **RESPOND TODAY** / **APPLY NOW** only when the last action is possible immediately (email, form URL, or thread URL). CONTACT_UNKNOWN stays in NEEDS CONTACT RESEARCH.

## Snapshot

| | |
| --- | --- |
| **DO THESE TODAY** | ${digest.doTheseToday.length} |
| **APPLY NOW** | ${digest.applyNow.length} |
| **RESPOND TODAY** | ${digest.respondToday.length} |
| **NEEDS CONTACT RESEARCH** | ${digest.needsContactResearchCount} |
| **New competitor gaps** | ${digest.ingested.competitor} |
| **New journalist requests** | ${digest.ingested.requests} |
| **New research pages** | ${digest.ingested.pages} |
| **Skipped duplicates** | ${digest.skippedDuplicates} |
| **NEW MUST PURSUE** | ${digest.newMustPursue.length} |
| **NEW HIGH** | ${digest.newHigh.length} |
| **FORUMS TO RESPOND TO** | ${digest.forumsToRespond.length} |
| **JOURNALIST DEADLINES** | ${digest.journalistDeadlines.length} |
| **FOLLOW-UP DUE** | ${digest.followUpDue.length} |
| **LINKS EARNED** | ${digest.linksEarned.length} |
| **EARNED MENTIONS** | ${digest.mentionsEarned.length} |
| **LINKS LOST** | ${digest.linksLost.length} |

${digest.notes.map((n) => `- ${n}`).join("\n")}

${sendBlockSection("DO THESE TODAY", digest.doTheseToday)}

## APPLY NOW

${
  digest.applyNow.length === 0
    ? "_None with an exact application URL._"
    : digest.applyNow
        .map(
          (a) => `### ${a.platform}

- What: ${a.what}
- Apply: ${a.applyUrl}
- Requirements: ${a.requirements}
- Cost: ${a.cost}
- Deadline: ${a.deadline}
`,
        )
        .join("\n")
}

${sendBlockSection("RESPOND TODAY", digest.respondToday)}

${cardSection("NEW MUST PURSUE", digest.newMustPursue)}

${cardSection("NEW HIGH", digest.newHigh)}

${cardSection("FORUMS TO RESPOND TO", digest.forumsToRespond)}

## JOURNALIST DEADLINES

${
  digest.journalistDeadlines.length === 0
    ? "_None due in the next 7 days._"
    : digest.journalistDeadlines
        .map(
          (s) =>
            `- ${s.platform}: ${s.requestTitle} · journalist ${s.journalist ?? "UNKNOWN"} · ${s.publication ?? "UNKNOWN"} · due ${s.deadline ?? "UNKNOWN"}`,
        )
        .join("\n")
}

${cardSection("FOLLOW-UP DUE", digest.followUpDue)}

## LINKS EARNED

${
  digest.linksEarned.length === 0
    ? "_None verified LIVE in this window._"
    : digest.linksEarned
        .map((l) => `- ${l.sourceUrl} → ${l.targetUrl} (${l.status})`)
        .join("\n")
}

## EARNED MENTIONS

${
  digest.mentionsEarned.length === 0
    ? "_None verified in this window._"
    : digest.mentionsEarned
        .map((l) => `- ${l.sourceUrl} → ${l.targetUrl} (${l.status})`)
        .join("\n")
}

## LINKS LOST

${
  digest.linksLost.length === 0
    ? "_None marked REMOVED/CHANGED in this window._"
    : digest.linksLost
        .map((l) => `- ${l.sourceUrl} → ${l.targetUrl} (${l.status})`)
        .join("\n")
}

## Learning loop

Rates appear only when a bucket has **≥10 contacted** rows. Below that, the cell says insufficient evidence. Score weights are **not** changed by this run.

**Overall:** ${formatRate(digest.learning.overall)}

${rateTable("Response / earned by asset", digest.learning.byAsset)}

${rateTable("By opportunity type", digest.learning.byOpportunityType)}

${rateTable("By publication type", digest.learning.byPublicationType)}

${rateTable("By subject line (draft, not sent)", digest.learning.bySubject)}

${rateTable("By pitch angle", digest.learning.byPitchAngle)}

${rateTable("Earned-link rate by prospect / opportunity type", digest.learning.byProspectType)}

${rateTable("By community (forum drafts that were later marked contacted)", digest.learning.byCommunity)}

${rateTable("By link recommendation", digest.learning.byLinkRecommendation)}

### Scoring suggestions (human review only)

${digest.learning.suggestions.map((s) => `- ${s}`).join("\n")}

## New Kitletics assets this window

${
  digest.newLiveAssets.length === 0
    ? "_No new live assets vs the previous weekly snapshot (first run stores the baseline)._"
    : digest.newLiveAssets.map((a) => `- ${a.title} \`${a.url}\``).join("\n")
}

## Pitch-ready research

${
  digest.pitchReadyResearch.length === 0
    ? "_None computable / ready to pitch._"
    : digest.pitchReadyResearch
        .map((r) => `- ${r.headline} (${r.status})`)
        .join("\n")
}

Do not pitch unpublished Market 2026 numbers. If a journalist needs data today, send the live database.

## Open journalist requests still in CRM

${
  digest.openSourceRequests.length === 0
    ? "_None._"
    : digest.openSourceRequests
        .map((s) => `- ${s.requestTitle} (${s.platform}${s.deadline ? `, due ${s.deadline}` : ""})`)
        .join("\n")
}

## Search performance (optional GSC import)

${gsc}

## Discovery queries for next week (run yourself — we do not scrape Google)

${queries}

## How to run again

\`\`\`bash
npm run growth:weekly -- --competitor=path/to/ahrefs.csv --requests=path/to/haro.csv --pages=path/to/new-pages.csv --gsc=path/to/gsc.csv
\`\`\`

Admin: \`/admin/growth/backlinks/weekly\`
`;
}
