import { scoreOpportunity } from "./scoring";
import { assessLinkRisk } from "./risk";
import { pitchForAsset } from "./matching";
import { getAssetById, getLinkableAssets } from "./assets";
import { generateDiscoveryQueries } from "./queries";
import { buildResearchIdeas } from "./research-ideas";
import { INITIAL_QUEUE } from "./initial-queue";
import { seedCommunities } from "./communities";
import type { SeedSpec } from "./queue-types";
import type {
  BacklinkOpportunity,
  BacklinkProspect,
  BacklinkWorkspace,
  ContactRole,
  ContactStatus,
  GrowthSettings,
  JournalistRecord,
  OutreachCampaign,
} from "./types";
import { DEFAULT_OUTREACH_SCORE_WEIGHTS, DEFAULT_SCORE_WEIGHTS } from "./types";
import { hydrateWorkspace } from "./hydrate-actionable";

const NOW = "2026-09-13T08:00:00.000Z";

export const DEFAULT_COMPETITOR_DOMAINS = [
  "runrepeat.com",
  "runningshoesguru.com",
  "doctorsofrunning.com",
  "roadtrailrun.com",
  "believeintherun.com",
];

export const DEFAULT_SETTINGS: GrowthSettings = {
  scoreWeights: DEFAULT_SCORE_WEIGHTS,
  outreachScoreWeights: DEFAULT_OUTREACH_SCORE_WEIGHTS,
  competitorDomains: DEFAULT_COMPETITOR_DOMAINS,
  followUpDays: 6,
  maxFollowUps: 2,
};

const SEEDS: SeedSpec[] = INITIAL_QUEUE;

export function normalizeProspectDomain(domain: string): string {
  return domain.replace(/^www\./i, "").toLowerCase();
}

export function prospectIdForDomain(domain: string): string {
  return `prospect-${normalizeProspectDomain(domain).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function confirmedContact(spec: SeedSpec): {
  contactStatus: ContactStatus;
  contactEmail?: string;
  contactSource?: string;
} {
  const email = spec.contactEmail?.trim();
  const source = spec.contactSource?.trim();
  if (spec.contactStatus === "CONFIRMED" && email && source) {
    return {
      contactStatus: "CONFIRMED",
      contactEmail: email,
      contactSource: source,
    };
  }
  return { contactStatus: "CONTACT_UNKNOWN" };
}

function toProspect(spec: SeedSpec, extra?: Partial<BacklinkProspect>): BacklinkProspect {
  const confirmed = confirmedContact(spec);
  return {
    id: prospectIdForDomain(spec.domain),
    name: spec.name.replace(/\s+—.*$/, "").replace(/\s+\(.*\)$/, ""),
    domain: spec.domain,
    homepageUrl: spec.homepageUrl,
    category: spec.category,
    country: spec.country,
    language: spec.language,
    market: spec.market,
    whyRelevant: spec.whyRelevant,
    contactStatus: confirmed.contactStatus,
    contactName: spec.contactName,
    contactRole: spec.contactRole ?? "unknown",
    contactEmail: confirmed.contactEmail,
    contactUrl: spec.publicContactRoute.startsWith("http")
      ? spec.publicContactRoute
      : spec.homepageUrl,
    contactSource: confirmed.contactSource,
    competitor: spec.competitor,
    notes: [
      spec.mix,
      spec.publicContactRoute,
      confirmed.contactEmail
        ? `Verified public inbox from ${confirmed.contactSource}.`
        : "No email on file. Do not invent one.",
    ].join(" · "),
    ...extra,
  };
}

function mergeProspect(existing: BacklinkProspect, spec: SeedSpec): BacklinkProspect {
  const next = toProspect(spec);
  const confirmedWins =
    next.contactStatus === "CONFIRMED" && existing.contactStatus !== "CONFIRMED";
  return {
    ...existing,
    whyRelevant: `${existing.whyRelevant} ${spec.whyRelevant}`.slice(0, 600),
    competitor: existing.competitor || spec.competitor,
    contactName: confirmedWins ? next.contactName : existing.contactName ?? next.contactName,
    contactRole:
      existing.contactRole !== "unknown"
        ? existing.contactRole
        : next.contactRole,
    contactStatus: confirmedWins ? "CONFIRMED" : existing.contactStatus,
    contactEmail: confirmedWins ? next.contactEmail : existing.contactEmail,
    contactSource: confirmedWins ? next.contactSource : existing.contactSource,
    contactUrl: existing.contactUrl ?? next.contactUrl,
    notes: existing.notes,
  };
}

function resolveAsset(spec: SeedSpec) {
  const assets = getLinkableAssets();
  const pinned = getAssetById(spec.recommendedAssetId, assets);
  return pinned ?? assets[0]!;
}

function toOpportunity(spec: SeedSpec): BacklinkOpportunity {
  const asset = resolveAsset(spec);
  const generated = pitchForAsset(asset, {
    topic: spec.topic,
    opportunityType: spec.type,
    text: spec.whyRelevant,
  });
  const fit = Math.min(
    100,
    asset.linkabilityScore - (asset.status === "planned" ? 12 : 0),
  );
  const scored = scoreOpportunity({
    relevance: spec.relevance,
    authority: spec.authority,
    assetFit: fit,
    likelihood: spec.likelihood,
    editorialQuality: spec.editorial,
    relationship: spec.relationship,
    reasons: [
      spec.whyTheyMightLink,
      `Asset: ${asset.title} (${asset.status})`,
      spec.doNotSend
        ? "Watchlist / do-not-send this month (competitor import or brand PR)."
        : `Likelihood ${spec.likelihood} — outreach is not automatic.`,
    ],
  });
  const risk = assessLinkRisk({
    domain: spec.domain,
    url: spec.url,
    opportunityType: spec.type,
    notes:
      spec.category === "RETAILERS" || spec.category === "BRANDS"
        ? "paid placement risk"
        : spec.competitor
          ? "competitor peer — import referring domains first"
          : undefined,
  });
  const confirmed = confirmedContact(spec);
  return {
    id: `opp-${spec.id}`,
    prospectId: prospectIdForDomain(spec.domain),
    siteName: spec.name,
    domain: spec.domain,
    url: spec.url,
    opportunityType: spec.type,
    contactName: spec.contactName,
    contactRole: spec.contactRole ?? "unknown",
    contactEmail: confirmed.contactEmail,
    contactUrl: spec.publicContactRoute.startsWith("http")
      ? spec.publicContactRoute
      : undefined,
    country: spec.country,
    language: spec.language,
    market: spec.market,
    topic: spec.topic,
    sport: "running",
    subtopic: spec.subtopic,
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
    recommendedAnchorContext: generated.anchorContext,
    pitchAngle: spec.pitchOverride || generated.angle,
    whyTheyMightLink: spec.whyTheyMightLink,
    whyThisSite: spec.whyRelevant,
    whyThisAsset: generated.why,
    whyThisAngle: spec.pitchOverride || generated.angle,
    evidence: spec.evidence,
    risk: risk.band,
    riskReasons: risk.reasons,
    sourceType: "seed",
    sourceUrl: spec.url,
    discoveredAt: NOW,
    status: "CANDIDATE",
    priority: scored.band,
    notes: [
      `Subject: ${spec.subjectLine}`,
      `Mix: ${spec.mix}`,
      `Contact route: ${spec.publicContactRoute}`,
      spec.competitorGap ? `Competitor gap: ${spec.competitorGap}` : undefined,
      spec.doNotSend ? "DO NOT SEND this month." : "Awaiting human APPROVE.",
    ]
      .filter(Boolean)
      .join(" "),
    outreachStatus: "not_contacted",
    responseStatus: "none",
    campaignId: spec.campaignId,
    metricSource: "editorial_judgment",
  };
}

function buildProspects(specs: SeedSpec[]): BacklinkProspect[] {
  const byId = new Map<string, BacklinkProspect>();
  for (const spec of specs) {
    const id = prospectIdForDomain(spec.domain);
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, toProspect(spec));
    } else {
      byId.set(id, mergeProspect(existing, spec));
    }
  }
  return [...byId.values()];
}

function campaigns(specs: SeedSpec[]): OutreachCampaign[] {
  const defs: OutreachCampaign[] = [
    {
      id: "campaign-database",
      name: "Running Shoe Database",
      assetId: "asset-shoe-database",
      angle: "Market data / drop-stack-weight lookup / research source",
      audience: "running publications, coaches, data journalists, clubs, gear writers",
      market: "NL + EN running media",
      startDate: "2026-09-13",
      prospectIds: [],
      opportunityIds: [],
      status: "active",
    },
    {
      id: "campaign-finder",
      name: "Running Shoe Finder",
      assetId: "asset-shoe-finder",
      angle: "Help runners narrow shoe choice",
      audience: "running clubs, beginner sites, coaches, training resources",
      market: "NL + EN community",
      startDate: "2026-09-13",
      prospectIds: [],
      opportunityIds: [],
      status: "active",
    },
    {
      id: "campaign-market-2026",
      name: "Running Shoe Market 2026",
      assetId: "asset-research-market-2026",
      angle: "Data-led findings — do not pitch unpublished numbers",
      audience: "journalists, consumer media, running media, sports-business",
      market: "global EN",
      prospectIds: [],
      opportunityIds: [],
      status: "planned",
    },
    {
      id: "campaign-forum-answers",
      name: "Forum Helpful Answers",
      assetId: "asset-shoe-finder",
      angle: "Answer the question first; include a Kitletics URL only when it materially helps",
      audience: "Reddit, running forums, HYROX and club communities",
      market: "EN + NL communities",
      startDate: "2026-09-13",
      prospectIds: [],
      opportunityIds: [],
      status: "active",
    },
    {
      id: "campaign-journalist-requests",
      name: "Journalist Source Requests",
      assetId: "asset-shoe-database",
      angle: "Answer source-request platforms with catalog evidence — never invented stats",
      audience: "journalists on HARO, Qwoted, Featured, SourceBottle, Source of Sources",
      market: "EN",
      startDate: "2026-09-13",
      prospectIds: [],
      opportunityIds: [],
      status: "active",
    },
  ];
  return defs.map((c) => {
    const rows = specs.filter((s) => s.campaignId === c.id);
    const prospectIds = [
      ...new Set(rows.map((s) => prospectIdForDomain(s.domain))),
    ];
    return {
      ...c,
      prospectIds,
      opportunityIds: rows.map((s) => `opp-${s.id}`),
    };
  });
}

export function ensureCampaigns(existing: OutreachCampaign[]): OutreachCampaign[] {
  const stubs = campaigns([]);
  const have = new Set(existing.map((c) => c.id));
  return [...existing, ...stubs.filter((c) => !have.has(c.id))];
}

function journalistsFromQueue(specs: SeedSpec[]): JournalistRecord[] {
  const named = new Map<string, JournalistRecord>();
  for (const spec of specs) {
    const name = spec.contactName?.trim();
    if (!name) continue;
    const key = `${name.toLowerCase()}|${normalizeProspectDomain(spec.domain)}`;
    if (named.has(key)) continue;
    const confirmed = confirmedContact(spec);
    named.set(key, {
      id: `jour-${key.replace(/[^a-z0-9]+/g, "-")}`,
      name,
      publication: spec.name,
      domain: spec.domain,
      role: (spec.contactRole ?? "unknown") as ContactRole,
      topics: [spec.topic, "running shoes"],
      recentCoverage: spec.url,
      country: spec.country,
      language: spec.language,
      contactStatus: confirmed.contactStatus,
      contactMethod: spec.publicContactRoute,
      contactEmail: confirmed.contactEmail,
      contactSource: confirmed.contactSource,
      relevantAssetIds: [spec.recommendedAssetId],
      relationshipStatus: "none",
      notes: confirmed.contactEmail
        ? `Public inbox verified at ${confirmed.contactSource}.`
        : "Named from a public byline or about page. No email stored.",
    });
  }
  return [
    {
      id: "jour-roles-template",
      name: "(unnamed — add from masthead)",
      publication: "Running publications",
      role: "gear_editor",
      topics: ["running shoes", "gear"],
      country: "NL",
      language: "nl",
      contactStatus: "CONTACT_UNKNOWN",
      relevantAssetIds: ["asset-shoe-database"],
      relationshipStatus: "none",
      notes:
        "Placeholder role row. Add named journalists only with a provenance URL. Platforms: HARO, Qwoted, Featured, SourceBottle, Source of Sources — manual capture only.",
    },
    ...named.values(),
  ];
}

export function buildSeedWorkspace(): BacklinkWorkspace {
  const prospects = buildProspects(SEEDS);
  const opportunities = SEEDS.map(toOpportunity).sort(
    (a, b) => b.overallScore - a.overallScore,
  );
  return hydrateWorkspace({
    version: 1,
    updatedAt: NOW,
    settings: DEFAULT_SETTINGS,
    prospects,
    opportunities,
    journalists: journalistsFromQueue(SEEDS),
    sourceRequests: [],
    campaigns: campaigns(SEEDS),
    earnedLinks: [],
    researchIdeas: buildResearchIdeas(),
    discoveryQueries: generateDiscoveryQueries(DEFAULT_COMPETITOR_DOMAINS),
    weeklyRuns: [],
    communities: seedCommunities(),
    communityHistory: [],
  });
}
