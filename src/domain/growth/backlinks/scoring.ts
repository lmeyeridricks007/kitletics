import {
  DEFAULT_OUTREACH_SCORE_WEIGHTS,
  DEFAULT_SCORE_WEIGHTS,
  ENGAGEMENT_GATES,
  OUTREACH_SPAM_PENALTY,
  type OutreachScoreBreakdown,
  type OutreachScoreWeights,
  type PriorityBand,
  type ScoreBreakdown,
  type ScoreWeights,
} from "./types";

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function priorityBand(overall: number): PriorityBand {
  if (overall >= 90) return "MUST_PURSUE";
  if (overall >= 75) return "HIGH";
  if (overall >= 60) return "MEDIUM";
  return "LOW";
}

export function normalizeWeights(weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS): ScoreWeights {
  const sum =
    weights.relevance +
    weights.authority +
    weights.assetFit +
    weights.likelihood +
    weights.editorialQuality +
    weights.relationship;
  if (sum <= 0) return DEFAULT_SCORE_WEIGHTS;
  return {
    relevance: weights.relevance / sum,
    authority: weights.authority / sum,
    assetFit: weights.assetFit / sum,
    likelihood: weights.likelihood / sum,
    editorialQuality: weights.editorialQuality / sum,
    relationship: weights.relationship / sum,
  };
}

/**
 * Transparent opportunity score. Authority is editorial judgment 0–100,
 * not DA/DR. Imported vendor metrics must be labeled separately.
 */
export function scoreOpportunity(input: {
  relevance: number;
  authority: number;
  assetFit: number;
  likelihood: number;
  editorialQuality: number;
  relationship: number;
  reasons?: string[];
  weights?: ScoreWeights;
}): ScoreBreakdown {
  const w = normalizeWeights(input.weights);
  const relevance = clamp(input.relevance);
  const authority = clamp(input.authority);
  const assetFit = clamp(input.assetFit);
  const likelihood = clamp(input.likelihood);
  const editorialQuality = clamp(input.editorialQuality);
  const relationship = clamp(input.relationship);
  const overall = clamp(
    relevance * w.relevance +
      authority * w.authority +
      assetFit * w.assetFit +
      likelihood * w.likelihood +
      editorialQuality * w.editorialQuality +
      relationship * w.relationship,
  );
  const band = priorityBand(overall);
  const reasons = input.reasons?.filter(Boolean) ?? [];
  if (reasons.length === 0) {
    reasons.push(
      `Relevance ${relevance}/100 (${Math.round(w.relevance * 100)}%)`,
      `Authority ${authority}/100 editorial (${Math.round(w.authority * 100)}%) — not DA/DR`,
      `Asset fit ${assetFit}/100`,
      `Likelihood ${likelihood}/100`,
      `Editorial quality ${editorialQuality}/100`,
      `Relationship ${relationship}/100`,
    );
  }
  return {
    relevance,
    authority,
    assetFit,
    likelihood,
    editorialQuality,
    relationship,
    overall,
    band,
    reasons,
  };
}

/** Map imported DR/DA into a conservative editorial authority hint — never treat as truth. */
export function authorityFromImportedMetric(
  value: number | undefined,
  source: string,
): { score: number; reason: string } | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  const score = clamp(value);
  return {
    score,
    reason: `Imported ${source} metric ${score} used only as a labeled hint, not as Kitletics authority.`,
  };
}

export function normalizeOutreachWeights(
  weights: OutreachScoreWeights = DEFAULT_OUTREACH_SCORE_WEIGHTS,
): OutreachScoreWeights {
  const sum =
    weights.relevance +
    weights.assetFit +
    weights.likelihood +
    weights.authority +
    weights.helpfulness +
    weights.relationship;
  if (sum <= 0) return DEFAULT_OUTREACH_SCORE_WEIGHTS;
  return {
    relevance: weights.relevance / sum,
    assetFit: weights.assetFit / sum,
    likelihood: weights.likelihood / sum,
    authority: weights.authority / sum,
    helpfulness: weights.helpfulness / sum,
    relationship: weights.relationship / sum,
  };
}

/**
 * Outreach-agent score. Same bands as editorial CRM.
 * Spam risk is a penalty, not a positive weight.
 * Does not mutate DEFAULT_SCORE_WEIGHTS used by seed prospects.
 */
export function scoreOutreachOpportunity(input: {
  relevance: number;
  assetFit: number;
  likelihood: number;
  authority: number;
  helpfulness: number;
  relationship: number;
  spamRisk: number;
  communityFit: number;
  linkNecessity: number;
  responseUrgency: number;
  reasons?: string[];
  weights?: OutreachScoreWeights;
}): OutreachScoreBreakdown {
  const w = normalizeOutreachWeights(input.weights);
  const relevance = clamp(input.relevance);
  const assetFit = clamp(input.assetFit);
  const likelihood = clamp(input.likelihood);
  const authority = clamp(input.authority);
  const helpfulness = clamp(input.helpfulness);
  const relationship = clamp(input.relationship);
  const spamRisk = clamp(input.spamRisk);
  const communityFit = clamp(input.communityFit);
  const linkNecessity = clamp(input.linkNecessity);
  const responseUrgency = clamp(input.responseUrgency);
  const weighted = clamp(
    relevance * w.relevance +
      assetFit * w.assetFit +
      likelihood * w.likelihood +
      authority * w.authority +
      helpfulness * w.helpfulness +
      relationship * w.relationship,
  );
  const penalty = Math.round(spamRisk * OUTREACH_SPAM_PENALTY);
  const overall = clamp(weighted - penalty);
  const band = priorityBand(overall);
  const reasons = input.reasons?.filter(Boolean) ?? [];
  if (reasons.length === 0) {
    reasons.push(
      `Relevance ${relevance}/100 (${Math.round(w.relevance * 100)}%)`,
      `Asset fit ${assetFit}/100 (${Math.round(w.assetFit * 100)}%)`,
      `Likelihood ${likelihood}/100 (${Math.round(w.likelihood * 100)}%)`,
      `Authority ${authority}/100 editorial (${Math.round(w.authority * 100)}%) — not DA/DR`,
      `Helpfulness ${helpfulness}/100 (${Math.round(w.helpfulness * 100)}%)`,
      `Relationship ${relationship}/100 (${Math.round(w.relationship * 100)}%)`,
      `Spam risk ${spamRisk}/100 → −${penalty} (penalty ${OUTREACH_SPAM_PENALTY}×)`,
      `Community fit ${communityFit}/100 (gate, not a weight)`,
      `Link necessity ${linkNecessity}/100 (does not raise the score)`,
      `Response urgency ${responseUrgency}/100 (queue order, not a weight)`,
    );
  }
  return {
    relevance,
    authority,
    assetFit,
    likelihood,
    editorialQuality: helpfulness,
    relationship,
    overall,
    band,
    reasons,
    helpfulness,
    spamRisk,
    communityFit,
    linkNecessity,
    responseUrgency,
  };
}

export function shouldRecommendEngagement(input: {
  helpfulness: number;
  communityFit: number;
  spamRisk: number;
}): { ok: boolean; blockers: string[] } {
  const blockers: string[] = [];
  if (input.helpfulness < ENGAGEMENT_GATES.minHelpfulness) {
    blockers.push(
      `helpfulness ${input.helpfulness} < ${ENGAGEMENT_GATES.minHelpfulness}`,
    );
  }
  if (input.communityFit < ENGAGEMENT_GATES.minCommunityFit) {
    blockers.push(
      `communityFit ${input.communityFit} < ${ENGAGEMENT_GATES.minCommunityFit}`,
    );
  }
  if (input.spamRisk > ENGAGEMENT_GATES.maxSpamRisk) {
    blockers.push(`spamRisk ${input.spamRisk} > ${ENGAGEMENT_GATES.maxSpamRisk}`);
  }
  return { ok: blockers.length === 0, blockers };
}
