import { serializeCsv } from "./csv";
import { INITIAL_QUEUE } from "./initial-queue";
import { buildSeedWorkspace } from "./seed";
import { getAssetById } from "./assets";
import type { BacklinkOpportunity, PriorityBand } from "./types";
import type { ProspectMix, SeedSpec } from "./queue-types";

const BAND_ORDER: PriorityBand[] = ["MUST_PURSUE", "HIGH", "MEDIUM", "LOW"];

const MIX_LABEL: Record<ProspectMix, string> = {
  publication: "running publications/blogs",
  coach: "running coaches/training resources",
  club: "running clubs/communities",
  research: "sports-science/research sites",
  journalist: "journalists/writers",
  newsletter: "newsletters",
  podcast: "podcasts",
  mainstream: "mainstream fitness/gear/consumer media",
  brand: "brand/PR opportunities",
  retailer: "retailer/resource opportunities",
};

export const INITIAL_PROSPECT_CSV_HEADERS = [
  "priority",
  "overall_score",
  "site",
  "domain",
  "prospect_type",
  "mix",
  "relevant_page",
  "contact_person",
  "role",
  "public_contact_route",
  "country",
  "language",
  "authority_signal",
  "relevance_score",
  "asset_fit",
  "likelihood",
  "recommended_asset",
  "recommended_asset_url",
  "why_they_might_link",
  "pitch_angle",
  "example_subject",
  "competitor_gap",
  "do_not_send",
  "risk",
  "campaign",
] as const;

export function specByOpportunityId(id: string): SeedSpec | undefined {
  return INITIAL_QUEUE.find((s) => `opp-${s.id}` === id);
}

export function mixCounts(specs = INITIAL_QUEUE): Record<ProspectMix, number> {
  const counts = {
    publication: 0,
    coach: 0,
    club: 0,
    research: 0,
    journalist: 0,
    newsletter: 0,
    podcast: 0,
    mainstream: 0,
    brand: 0,
    retailer: 0,
  } satisfies Record<ProspectMix, number>;
  for (const spec of specs) counts[spec.mix] += 1;
  return counts;
}

function uniqueDomains(specs: SeedSpec[]): number {
  return new Set(specs.map((s) => s.domain.replace(/^www\./, "").toLowerCase())).size;
}

export function isFirstContact(spec: SeedSpec): boolean {
  if (spec.doNotSend) return false;
  if (spec.subjectLine.toLowerCase().startsWith("not a send")) return false;
  // Hard desks with no named inbox are in the queue, not the first-contact list.
  if (spec.likelihood < 40) return false;
  return true;
}

export function top20FirstContact(opps: BacklinkOpportunity[]): BacklinkOpportunity[] {
  const used = new Set<string>();
  const out: BacklinkOpportunity[] = [];
  const ranked = [...opps].sort((a, b) => {
    const band = BAND_ORDER.indexOf(a.priority) - BAND_ORDER.indexOf(b.priority);
    if (band !== 0) return band;
    return b.overallScore - a.overallScore;
  });
  for (const opp of ranked) {
    const spec = specByOpportunityId(opp.id);
    if (!spec || !isFirstContact(spec)) continue;
    const host = spec.domain.replace(/^www\./, "").toLowerCase();
    if (used.has(host)) continue;
    used.add(host);
    out.push(opp);
    if (out.length >= 20) break;
  }
  return out;
}

function csvRows(opps: BacklinkOpportunity[]) {
  return [...opps]
    .sort((a, b) => {
      const band = BAND_ORDER.indexOf(a.priority) - BAND_ORDER.indexOf(b.priority);
      if (band !== 0) return band;
      return b.overallScore - a.overallScore;
    })
    .map((opp) => {
      const spec = specByOpportunityId(opp.id);
      const asset = getAssetById(opp.targetAssetId);
      return {
        priority: opp.priority,
        overall_score: opp.overallScore,
        site: opp.siteName,
        domain: opp.domain,
        prospect_type: opp.opportunityType,
        mix: spec?.mix ?? "",
        relevant_page: opp.url,
        contact_person: spec?.contactName ?? "",
        role: spec?.contactRole ?? opp.contactRole,
        public_contact_route: spec?.publicContactRoute ?? "",
        country: opp.country,
        language: opp.language,
        authority_signal: opp.authorityScore,
        relevance_score: opp.relevanceScore,
        asset_fit: opp.assetFitScore,
        likelihood: opp.likelihoodScore,
        recommended_asset: asset?.title ?? opp.targetAssetId,
        recommended_asset_url: asset?.url ?? opp.targetUrl,
        why_they_might_link: spec?.whyTheyMightLink ?? opp.whyTheyMightLink,
        pitch_angle: opp.pitchAngle,
        example_subject: spec?.subjectLine ?? "",
        competitor_gap: spec?.competitorGap ?? "",
        do_not_send: spec?.doNotSend ? "yes" : "no",
        risk: opp.risk,
        campaign: opp.campaignId,
      };
    });
}

function bandSection(opps: BacklinkOpportunity[], band: PriorityBand): string {
  const rows = opps.filter((o) => o.priority === band);
  if (rows.length === 0) return `_None in ${band}._\n`;
  return rows
    .map((opp) => {
      const spec = specByOpportunityId(opp.id)!;
      const asset = getAssetById(opp.targetAssetId);
      const watch = spec.doNotSend ? " · **do not send this month**" : "";
      return [
        `### ${opp.siteName} — ${opp.overallScore} ${band}${watch}`,
        "",
        `| | |`,
        `| --- | --- |`,
        `| **Domain** | ${opp.domain} |`,
        `| **Type / mix** | ${opp.opportunityType} / ${spec.mix} |`,
        `| **Page** | ${opp.url} |`,
        `| **Contact** | ${spec.contactName ?? "unknown"} · ${spec.contactRole ?? "unknown"} |`,
        `| **Route** | ${spec.publicContactRoute} |`,
        `| **Country / language** | ${opp.country} / ${opp.language} |`,
        `| **Scores** | authority ${opp.authorityScore} · relevance ${opp.relevanceScore} · asset fit ${opp.assetFitScore} · likelihood ${opp.likelihoodScore} · overall ${opp.overallScore} |`,
        `| **Asset** | ${asset?.title ?? opp.targetAssetId} (${asset?.url || "planned — no public URL"}) |`,
        `| **Why they might link** | ${spec.whyTheyMightLink} |`,
        `| **Pitch** | ${opp.pitchAngle} |`,
        `| **Subject** | ${spec.subjectLine} |`,
        spec.competitorGap ? `| **Competitor gap** | ${spec.competitorGap} |` : undefined,
        `| **Risk** | ${opp.risk} |`,
        "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

export function renderInitialProspectsMarkdown(): string {
  const ws = buildSeedWorkspace();
  const specs = INITIAL_QUEUE;
  const counts = mixCounts(specs);
  const domains = uniqueDomains(specs);
  const sendable = specs.filter(isFirstContact);
  const watch = specs.filter((s) => s.doNotSend);
  const top = top20FirstContact(ws.opportunities);
  const bands = {
    MUST_PURSUE: ws.opportunities.filter((o) => o.priority === "MUST_PURSUE").length,
    HIGH: ws.opportunities.filter((o) => o.priority === "HIGH").length,
    MEDIUM: ws.opportunities.filter((o) => o.priority === "MEDIUM").length,
    LOW: ws.opportunities.filter((o) => o.priority === "LOW").length,
  };

  const mixLines = (Object.keys(MIX_LABEL) as ProspectMix[])
    .map((k) => `| ${MIX_LABEL[k]} | ${counts[k]} |`)
    .join("\n");

  const topBlock = top
    .map((opp, i) => {
      const spec = specByOpportunityId(opp.id)!;
      const asset = getAssetById(opp.targetAssetId);
      return [
        `### ${i + 1}. ${spec.contactName ?? spec.name}`,
        "",
        `| | |`,
        `| --- | --- |`,
        `| **WHO** | ${spec.contactName ?? "unnamed — confirm masthead"} (${spec.name}) |`,
        `| **PAGE** | ${spec.url} |`,
        `| **ASSET** | ${asset?.title ?? spec.recommendedAssetId} · ${asset?.url || "(planned)"} |`,
        `| **ANGLE** | ${spec.pitchOverride} |`,
        `| **WHY NOW** | ${spec.evidence} |`,
        "",
      ].join("\n");
    })
    .join("\n");

  return `# Initial backlink prospecting queue

**Date:** 13 Sep 2026  
**System:** \`buildSeedWorkspace()\` from \`src/domain/growth/backlinks/initial-queue.ts\`  
**Outreach:** none sent. Every opportunity stays \`CANDIDATE\` until a human APPROVE.

This is **not** 100 rows. A domain that is merely about running was not enough. Each row had to already teach shoe choice, publish specs, cite data, or maintain a resource page.

## Snapshot

| | |
| --- | --- |
| **Rows** | ${specs.length} page-level opportunities |
| **Unique domains** | ${domains} |
| **First-contact eligible** | ${sendable.length} (likelihood ≥ 40; watchlist / do-not-send: ${watch.length}) |
| **MUST PURSUE / HIGH / MEDIUM / LOW** | ${bands.MUST_PURSUE} / ${bands.HIGH} / ${bands.MEDIUM} / ${bands.LOW} |
| **Confirmed editorial inboxes** | Mario Fraioli at The Morning Shakeout only. Every other contact is unknown. |

## Why this is not 100

Club, podcast, and brand-PR quotas are thin because those surfaces rarely publish a page that already demonstrates link intent. Padding them with federation homepages, event homepages, or “running newsletter” subscribe URLs would violate the targeting rule.

Sports-science is similarly constrained: many lab papers are PDFs without a curator who links out. We kept clinic/education URLs (AAPSM, Cleveland Clinic, ModPod, NextGait, Michigan Foot Doctors) and one original 2026 catalog study (ShoeFitLab), not random .edu homepages.

Competitor sites (Believe in the Run, Doctors of Running, Road Trail Run) are in the queue as **gap-import sources**, marked do-not-send. ASICS, Nike, and Altra education pages are brand watchlist, not cold link-asks.

If Ahrefs/Semrush imports later show referring pages that already cite RunRepeat or Doctors of Running, those pages join the queue as new \`COMPETITOR_LINK_GAP\` rows. That is how the list grows past this first cut — not by inventing club homepages.

## Mix vs target

Target was roughly 20 publications, 15 coaches, 10 clubs, 10 research, 10 journalists, 10 newsletters, 5 podcasts, 10 mainstream, 5 brand/PR, 5 retailers. Evidence pulled the mix toward **publications + coaches + retailer Learn pages**, which is where the education URLs actually exist.

| Mix bucket | Count |
| --- | --- |
${mixLines}

Journalist names appear on bylines (Mark Dredge, Alex Hutchinson, Mario Fraioli, Laura Norris, Jason Fitzgerald, Matt Klein, Lexi Miller, Greg McMillan, Christina Schilero, Kate Van Buskirk, Bas Stigter). That is not the same as ten separate journalist-only domains — several sit on publication rows.

## Scores

Editorial 0–100, not DA/DR. Weights: relevance 30%, authority 20%, asset fit 20%, likelihood 15%, editorial 10%, relationship 5%.

Likelihood is capped because almost every contact is unknown. A MUST PURSUE band is rare until a named inbox is confirmed.

Primary assets pitched: Running Shoe Database, Running Shoe Finder, Best Running Shoes, Best Daily Trainers, How to Choose Running Shoes, drop guide, comparisons. **Running Shoe Market 2026 is planned** — do not pitch unpublished numbers. If a journalist needs data today, send the live database.

---

## TOP 20 TO CONTACT FIRST

One owner per domain. Likelihood below 40 (Wirecutter, Guardian Filter, Runner’s World masthead) stays in the queue, not this list. Confirm the public route before sending. Do not invent emails. Do not use shop inboxes as editorial.

${topBlock}

---

## MUST PURSUE

${bandSection(ws.opportunities, "MUST_PURSUE")}

## HIGH

${bandSection(ws.opportunities, "HIGH")}

## MEDIUM

${bandSection(ws.opportunities, "MEDIUM")}

## LOW / watchlist

${bandSection(ws.opportunities, "LOW")}

---

## Competitor gap (configured)

Sites that already link to RunRepeat, Doctors of Running, Running Shoes Guru, Road Trail Run, or Believe in the Run are the expansion set. Confirmed in this pass:

- **Veloci Running** drop guide already cites **RunRepeat**. Complementary offer: a current, filterable catalog with regional From-price — not a duplicate lab.
- **Strength Running × Matt Klein** already points readers at **Doctors of Running**. Complementary offer: a living spec table, not a second clinical review.
- **BITR / DoR / RTR** themselves: import their backlinks. Do not send a reciprocal ask.

CSV: \`docs/growth/data/INITIAL-100-BACKLINK-PROSPECTS.csv\`  
Admin: \`/admin/growth/backlinks\` (not publicly indexable).
`;
}

export function renderInitialProspectsCsv(): string {
  const ws = buildSeedWorkspace();
  return serializeCsv(
    [...INITIAL_PROSPECT_CSV_HEADERS],
    csvRows(ws.opportunities),
  );
}
