import type { Evidence } from "@/domain/recommendations/types";

const INTERNAL_SOURCE_PATTERNS = [
  /prompt\s*\d+/i,
  /\bcatalog\s+pass\b/i,
  /\bcatalog\s+synthesis\b/i,
  /\bcatalog\s+research\b/i,
  /\bresearch\s+agent\b/i,
  /\bproduct\s*review\s*agent\b/i,
  /\bai\s+synthesis\b/i,
  /\bai\s+generated\b/i,
  /\b\bllm\b/i,
  /\bingestion\b/i,
  /\bstaging\b/i,
  /\bcandidate\b/i,
  /\bresearch\s+pass\b/i,
  /\bmedium\s+confidence\b/i,
];

const SOURCE_OVERRIDES: Record<string, string> = {
  "ev-catalog-mfr": "Official product specifications",
  "ev-catalog-editorial": "Independent expert reviews & Kitletics editorial analysis",
};

const SUMMARY_OVERRIDES: Record<string, string> = {
  "ev-catalog-mfr":
    "Used to verify identity, published measurements, materials and official features.",
  "ev-catalog-editorial":
    "Used to cross-check ride, fit, category placement and buying trade-offs. Not a Kitletics personal wear-test.",
};

/**
 * Consumer-facing evidence presentation.
 * Internal provenance strings stay on the Evidence entity for admin/debug.
 */
export function getPublicEvidenceCard(evidence: Evidence): {
  title: string;
  body: string;
  typeLabel: string;
  verifiedAt?: string;
  sourceUrl?: string;
} {
  const typeLabel =
    evidence.type === "personal-test"
      ? "First-hand testing"
      : evidence.type === "manufacturer"
        ? "Verified specification"
        : evidence.type === "independent-review"
          ? "Independent expert reviews"
          : evidence.type === "lab-test"
            ? "Lab & test data"
            : evidence.type === "retailer"
              ? "Retailer product data"
              : evidence.type === "user-feedback"
                ? "Aggregated public feedback"
                : "Editorial research";

  let title = SOURCE_OVERRIDES[evidence.id] ?? evidence.source;
  if (INTERNAL_SOURCE_PATTERNS.some((re) => re.test(title))) {
    title =
      evidence.type === "manufacturer"
        ? "Official product specifications"
        : "Kitletics editorial analysis";
  }

  let body = SUMMARY_OVERRIDES[evidence.id] ?? evidence.summary;
  if (INTERNAL_SOURCE_PATTERNS.some((re) => re.test(body))) {
    body =
      evidence.type === "manufacturer"
        ? "Used to verify published specifications and official features."
        : "Used to cross-check performance characteristics and category placement.";
  }

  return {
    title,
    body,
    typeLabel,
    verifiedAt: evidence.verifiedAt,
    sourceUrl: evidence.sourceUrl,
  };
}

export function scrubInternalWording(text: string): string {
  return text
    .replace(/Kitletics Prompt\s*\d+[^.]*\.?/gi, "")
    .replace(/\bcatalog (pass|synthesis|research)\b/gi, "editorial analysis")
    .replace(/\bresearch agent\b/gi, "editorial research")
    .replace(/\bAI (synthesis|generated)\b/gi, "editorial analysis")
    .replace(/\bmedium confidence\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
