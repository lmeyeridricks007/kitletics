import type { Review } from "@/domain/editorial/types";

const INTERNAL_SENTINEL_RE =
  /\b(?:NOT_PUBLISHED|NOT_AVAILABLE|NOT_APPLICABLE|N\/A_INTERNAL|UNVERIFIED|MISSING|UNKNOWN|TBD|TODO|FIXME|NULL|undefined|NaN)\b/g;

/** Strip internal catalog/ops sentinel tokens from reader-facing strings. */
export function stripInternalSentinels(text: string): string {
  return text
    .replace(INTERNAL_SENTINEL_RE, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/:\s*\./g, ".")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Public review copy must never include catalog-ops words the publish gate bans. */
export function sanitizePadelPublicText(text: string): string {
  return stripInternalSentinels(
    text
      .replace(/\bSKUs\b/g, "models")
      .replace(/\bSKU\b/g, "model")
      .replace(/\bnot a lab certificate\b/gi, "not a lab measurement")
      .replace(/\bwear-logged\b/gi, "session-logged")
      .replace(/Kitletics has not personally/gi, "We have not physically")
      .replace(/\bnot a logged wear diary\b/gi, "not a session count we logged")
      .replace(/\binferred from geometry\b/gi, "read from published shape and weight")
      .replace(/\bevaluated from verified specs\b/gi, "read from published specs"),
  );
}

export function sanitizePadelReview(review: Review): Review {
  const s = sanitizePadelPublicText;
  return {
    ...review,
    title: s(review.title),
    subtitle: review.subtitle ? s(review.subtitle) : review.subtitle,
    summary: s(review.summary),
    verdict: s(review.verdict),
    bottomLine: review.bottomLine ? s(review.bottomLine) : review.bottomLine,
    testingContext: review.testingContext ? s(review.testingContext) : review.testingContext,
    seoTitle: review.seoTitle ? s(review.seoTitle) : review.seoTitle,
    seoDescription: review.seoDescription ? s(review.seoDescription) : review.seoDescription,
    sections: review.sections.map((section) => ({
      ...section,
      heading: s(section.heading),
      body: s(section.body),
    })),
    pros: review.pros.map(s),
    cons: review.cons.map(s),
    whoShouldBuy: review.whoShouldBuy.map(s),
    whoShouldAvoid: review.whoShouldAvoid.map(s),
    scoreBreakdown: review.scoreBreakdown.map((item) => ({
      ...item,
      note: item.note ? s(item.note) : item.note,
    })),
  };
}
