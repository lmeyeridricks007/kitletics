/**
 * Consumer editorial quality — machine templates and uniqueness-era voice.
 * Complements containsPublicContentCorruption (identifier stamps).
 */

import type { Review } from "@/domain/editorial/types";
import {
  containsPublicContentCorruption,
  flattenPublicContent,
} from "@/lib/review/public-content-corruption";

const MACHINE_TEMPLATE_PATTERNS: RegExp[] = [
  /already decided the lane/i,
  /headline trait/i,
  /whatever\s+\S[\s\S]{0,40}?optimizes for/i,
  /shows up more often in your plan/i,
  /gates\s+[A-Z]/,
  /\bintendedJob\b/,
  /one-tool-for-every-session/i,
  /\bwalk if\b/i,
  /is why you walk/i,
  /catalog pass/i,
  /\bconcatenated\b/i,
  /\btokens?\b/i,
  /\bSKU\b/,
  /\btaxonomy\b/i,
  /use-case ids?\b/i,
  /when its main job matches most of your week/i,
  /catalogued as a /i,
  /not a crossover default/i,
  /catalog role makes sense/i,
  /keep paying for week after week/i,
  /Kitletics Expert Research Review\. How we assessed it:/i,
  /is built for a specific job — use that job as your first filter/i,
  /Here are the catalog fields that matter/i,
];

export function containsMachineTemplateCopy(input: unknown): boolean {
  const text = flattenPublicContent(input);
  if (!text.trim()) return false;
  return MACHINE_TEMPLATE_PATTERNS.some((re) => re.test(text));
}

export function isUnusablePublicEditorial(review: Review): boolean {
  return (
    containsPublicContentCorruption(review) ||
    containsMachineTemplateCopy(review)
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isConsumerDecisionLine(line: string): boolean {
  const t = line.trim();
  const words = t.split(/\s+/).filter(Boolean).length;
  if (words < 5) return false;
  return /^(you(?:'re| are)? looking|you want|you prefer|you need|you(?:'re| are)? primarily|i(?:'d| would) (?:shortlist|pause|skip|rotate))/i.test(
    t,
  );
}

function decisionLinesReadable(lines: string[] | undefined, min: number): boolean {
  const list = (lines ?? []).map((l) => l.trim()).filter(Boolean);
  if (list.length < min) return false;
  const usable = list.filter((l) => {
    if (containsMachineTemplateCopy(l)) return false;
    if (containsPublicContentCorruption(l)) return false;
    if (isConsumerDecisionLine(l)) return true;
    return countWords(l) >= 5 && countWords(l) <= 18;
  });
  return usable.length >= min;
}

export function isKeepableEditorialSection(body: string): boolean {
  const t = body?.trim() ?? "";
  if (!t) return false;
  if (containsMachineTemplateCopy(t) || containsPublicContentCorruption(t)) {
    return false;
  }
  if (countWords(t) < 40) return false;
  const sentences = t
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 8);
  if (sentences.length < 2) return false;
  const bullets = (t.match(/^\s*[•\-*]/gm) ?? []).length;
  if (bullets >= 4 && sentences.length < 3) return false;
  return true;
}

function hasProductSpecificAnalysis(review: Review): boolean {
  const bodies = (review.sections ?? [])
    .map((s) => s.body?.trim() ?? "")
    .filter(Boolean);
  return bodies.filter(isKeepableEditorialSection).length >= 3;
}

export type ConsumerCopyAssessment = {
  ok: boolean;
  corruption: boolean;
  machineTemplate: boolean;
  missingEvidence: boolean;
  thinDecision: boolean;
  missingAnalysis: boolean;
  reasons: string[];
};

export function assessConsumerCopyQuality(
  review: Review,
): ConsumerCopyAssessment {
  const reasons: string[] = [];
  const corruption = containsPublicContentCorruption(review);
  const machineTemplate = containsMachineTemplateCopy(review);
  const missingEvidence = !(review.evidenceIds?.length >= 1);
  const thinDecision =
    !decisionLinesReadable(review.whoShouldBuy, 2) ||
    !decisionLinesReadable(review.whoShouldAvoid, 2);
  const missingAnalysis = !hasProductSpecificAnalysis(review);

  if (corruption) reasons.push("PUBLIC_CONTENT_CORRUPTION");
  if (machineTemplate) reasons.push("MACHINE_TEMPLATE_COPY");
  if (missingEvidence) reasons.push("MISSING_EVIDENCE");
  if (thinDecision) reasons.push("DECISION_BULLETS_UNREADABLE");
  if (missingAnalysis) reasons.push("MISSING_PRODUCT_SPECIFIC_ANALYSIS");

  return {
    ok:
      !corruption &&
      !machineTemplate &&
      !missingEvidence &&
      !thinDecision &&
      !missingAnalysis,
    corruption,
    machineTemplate,
    missingEvidence,
    thinDecision,
    missingAnalysis,
    reasons,
  };
}

/** Page-time enricher: skip longform scaffolds when seed copy is already usable. */
export function isConsumerEditorialReady(review: Review): boolean {
  const assessment = assessConsumerCopyQuality(review);
  return assessment.ok;
}
