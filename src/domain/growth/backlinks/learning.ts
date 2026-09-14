import { draftOutreach } from "./outreach";
import type {
  BacklinkOpportunity,
  BacklinkWorkspace,
  LinkableAsset,
  WeeklyLearningBucket,
} from "./types";

/** Do not publish a rate or change weights below this contacted count. */
export const LEARNING_MIN_SAMPLE = 10;

const CONTACTED: ReadonlySet<string> = new Set([
  "contacted",
  "follow_up_due",
  "responded",
  "interested",
  "declined",
  "link_earned",
  "mention_earned",
  "no_response",
]);

const RESPONDED: ReadonlySet<string> = new Set([
  "responded",
  "interested",
  "declined",
  "link_earned",
  "mention_earned",
]);

const EARNED: ReadonlySet<string> = new Set(["link_earned", "mention_earned"]);

export function normalizeLearningKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 80);
}

function emptyBucket(key: string): WeeklyLearningBucket {
  return { key, contacted: 0, responses: 0, earned: 0, declined: 0 };
}

function tally(
  buckets: Map<string, WeeklyLearningBucket>,
  key: string,
  opp: BacklinkOpportunity,
): void {
  if (!CONTACTED.has(opp.outreachStatus)) return;
  const slot = buckets.get(key) ?? emptyBucket(key);
  slot.contacted += 1;
  if (RESPONDED.has(opp.outreachStatus)) slot.responses += 1;
  if (EARNED.has(opp.outreachStatus)) slot.earned += 1;
  if (opp.outreachStatus === "declined" || opp.responseStatus === "declined") {
    slot.declined += 1;
  }
  buckets.set(key, slot);
}

function finalize(buckets: Map<string, WeeklyLearningBucket>): WeeklyLearningBucket[] {
  return [...buckets.values()]
    .map((b) => {
      if (b.contacted < LEARNING_MIN_SAMPLE) return b;
      return {
        ...b,
        responseRate: b.responses / b.contacted,
        earnedRate: b.earned / b.contacted,
      };
    })
    .sort((a, b) => b.contacted - a.contacted);
}

export interface LearningReport {
  overall: WeeklyLearningBucket;
  byAsset: WeeklyLearningBucket[];
  byOpportunityType: WeeklyLearningBucket[];
  byPublicationType: WeeklyLearningBucket[];
  bySubject: WeeklyLearningBucket[];
  byPitchAngle: WeeklyLearningBucket[];
  byProspectType: WeeklyLearningBucket[];
  byCommunity: WeeklyLearningBucket[];
  byLinkRecommendation: WeeklyLearningBucket[];
  suggestions: string[];
}

export function buildLearningReport(
  ws: BacklinkWorkspace,
  assets: LinkableAsset[] = [],
): LearningReport {
  const overallMap = new Map<string, WeeklyLearningBucket>();
  const byAsset = new Map<string, WeeklyLearningBucket>();
  const byType = new Map<string, WeeklyLearningBucket>();
  const byPub = new Map<string, WeeklyLearningBucket>();
  const bySubject = new Map<string, WeeklyLearningBucket>();
  const byAngle = new Map<string, WeeklyLearningBucket>();
  const byProspect = new Map<string, WeeklyLearningBucket>();
  const byCommunity = new Map<string, WeeklyLearningBucket>();
  const byLink = new Map<string, WeeklyLearningBucket>();
  const prospectById = new Map(ws.prospects.map((p) => [p.id, p]));

  for (const opp of ws.opportunities) {
    tally(overallMap, "overall", opp);
    tally(byAsset, opp.targetAssetId || "(none)", opp);
    tally(byType, opp.opportunityType, opp);
    const category = prospectById.get(opp.prospectId)?.category ?? "UNKNOWN";
    tally(byPub, category, opp);
    tally(byProspect, opp.opportunityType, opp);
    tally(byAngle, normalizeLearningKey(opp.pitchAngle || "(none)"), opp);
    if (opp.communityId) tally(byCommunity, opp.communityId, opp);
    if (opp.linkRecommendation) tally(byLink, opp.linkRecommendation, opp);
    const asset = assets.find((a) => a.assetId === opp.targetAssetId);
    if (asset) {
      const subject = draftOutreach({ opportunity: opp, asset }).subject;
      tally(bySubject, normalizeLearningKey(subject), opp);
    }
  }

  const overall = finalize(overallMap)[0] ?? emptyBucket("overall");
  const suggestions: string[] = [];
  if (overall.contacted < LEARNING_MIN_SAMPLE) {
    suggestions.push(
      `Insufficient evidence to change score weights (contacted n=${overall.contacted}, need ${LEARNING_MIN_SAMPLE}).`,
    );
  } else {
    const typeRows = finalize(byType).filter((b) => b.earnedRate != null);
    const overallEarned = overall.earnedRate ?? 0;
    for (const row of typeRows) {
      if ((row.earnedRate ?? 0) >= overallEarned * 1.5 && row.earned >= 3) {
        suggestions.push(
          `Evidence only: ${row.key} earned ${row.earned}/${row.contacted} vs overall ${overall.earned}/${overall.contacted}. Consider +5 likelihood for that type after a human review — do not auto-apply.`,
        );
      }
    }
    if (suggestions.length === 0) {
      suggestions.push(
        `n=${overall.contacted} is enough to report rates. No type beat overall earned-link rate by 1.5× with ≥3 earned. Leave weights unchanged.`,
      );
    }
  }

  return {
    overall,
    byAsset: finalize(byAsset),
    byOpportunityType: finalize(byType),
    byPublicationType: finalize(byPub),
    bySubject: finalize(bySubject),
    byPitchAngle: finalize(byAngle),
    byProspectType: finalize(byProspect),
    byCommunity: finalize(byCommunity),
    byLinkRecommendation: finalize(byLink),
    suggestions,
  };
}

export function formatRate(bucket: WeeklyLearningBucket): string {
  if (bucket.contacted < LEARNING_MIN_SAMPLE) {
    return `insufficient evidence (n=${bucket.contacted})`;
  }
  const rr = Math.round((bucket.responseRate ?? 0) * 100);
  const er = Math.round((bucket.earnedRate ?? 0) * 100);
  return `response ${rr}% · earned ${er}% (n=${bucket.contacted})`;
}
