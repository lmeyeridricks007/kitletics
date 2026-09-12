import type { Review } from "@/domain/editorial/types";

/**
 * Rewrite uniqueness-era skip templates into spoken consumer English.
 *
 * Root defect: generators concatenated a weakness ("not a stability shoe")
 * into "I'd pause if ${weakness} shows up often in your week."
 * That is unreadable when the weakness already starts with "not a".
 */

const UNIQUENESS_ERA_SKIP =
  /i['’]d pause if not\b|look elsewhere if not\b|shows up often in your week|shows up every week|look elsewhere if that is most of your week|i['’]d pause if you need a different specialty lane/i;

/** Known limitations → one clear skip reason. Not a generic stamp. */
function skipIfYouNeed(thing: string): string {
  const t = thing.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/g, "");
  const lower = t.charAt(0).toLowerCase() + t.slice(1);

  if (/stability shoe|added stability|guidance/i.test(t)) {
    return "Skip it if you need a stability shoe for most of your training.";
  }
  if (/^running shoe/i.test(t)) {
    return "Skip it if you're looking for a shoe designed for running.";
  }
  if (/waterproof|storm shell|race shell/i.test(t)) {
    return "Choose another jacket if you need full waterproof protection.";
  }
  if (/race-day half-tight/i.test(t)) {
    return "Skip it if you want a race-day half-tight look.";
  }
  if (/race-minimal singlet/i.test(t)) {
    return "Skip it if you want a race-cut singlet.";
  }
  if (/carbohydrate fuel/i.test(t) && /flavour|flavor|drink/i.test(t)) {
    return "Skip it if you need carbohydrate fuel or a flavoured drink.";
  }
  if (/carbohydrate fuel/i.test(t)) {
    return "Skip it if you need this as your main carbohydrate fuel.";
  }
  if (/primary carbohydrate/i.test(t)) {
    return "Skip it if you need a primary carbohydrate source.";
  }
  if (/commercial curved sprint/i.test(t)) {
    return "Skip it if you need a commercial curved sprint deck.";
  }
  if (/\bhandheld\b/i.test(t)) {
    return "Skip it if you need a handheld bottle rather than vest or belt carry.";
  }
  if (/max-cushion easy shoe/i.test(t)) {
    return "Skip it if you need a max-cushion easy shoe.";
  }
  if (/full carbon racer/i.test(t)) {
    return "Skip it if you need a full carbon racer.";
  }
  if (/pure road running shoe/i.test(t)) {
    return "Skip it if you need a dedicated road running shoe.";
  }
  if (/easy mileage|easy-day shoe|easy recovery/i.test(t)) {
    return "Skip it if most of your week is easy recovery miles.";
  }
  if (/long road connector/i.test(t)) {
    return "Skip it if most of your week is long road connectors.";
  }
  return `Skip it if you need ${lower}.`;
}

/**
 * Turn a catalog weakness / pause seed into a consumer skip sentence.
 */
export function skipSentenceFromLimitation(limitation: string): string {
  const raw = limitation.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/g, "");
  if (!raw) return "Skip it if this role is not most of your week.";

  const notA = /^(?:not|n't)\s+(?:a |an )(.+)$/i.exec(raw);
  if (notA) return skipIfYouNeed(notA[1]!.trim());

  const notFor = /^(?:not|n't)\s+(?:for |built for |ideal (?:for |on ))(.+)$/i.exec(
    raw,
  );
  if (notFor) {
    const rest = notFor[1]!.trim();
    if (/easy mileage|easy recovery|easy-day/i.test(rest)) {
      return "Skip it if most of your week is easy recovery miles.";
    }
    return `Skip it if you need something ${rest.charAt(0).toLowerCase()}${rest.slice(1)}.`;
  }

  if (/^not /i.test(raw)) {
    return skipIfYouNeed(raw.replace(/^not\s+/i, ""));
  }

  const lower = raw.charAt(0).toLowerCase() + raw.slice(1);
  if (/^you /i.test(raw)) {
    return `Skip it if ${lower}.`;
  }
  return `Skip it if ${lower} is most of your week.`;
}

function extractLimitation(chunk: string): string {
  return chunk
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\s+(?:would\s+)?shows?\s+up(?:\s+often)?(?:\s+in your week|\s+every week)?/gi,
      "",
    )
    .replace(/\s*[—–-]\s*.*$/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

export function containsUniquenessEraSkipTemplate(text: string): boolean {
  return UNIQUENESS_ERA_SKIP.test(text);
}

/**
 * Rewrite uniqueness-era skip templates in any public prose blob.
 * Leaves unrelated editorial ("I'd shortlist it when you want…") intact.
 */
export function rewriteUniquenessEraSkipProse(text: string): string {
  if (!text?.trim()) return text;
  if (!containsUniquenessEraSkipTemplate(text) && !/look elsewhere if /i.test(text)) {
    return text;
  }

  let out = text;

  out = out.replace(
    /i['’]d pause if (not\b[^.]+)\.?/gi,
    (_m, rest: string) => skipSentenceFromLimitation(extractLimitation(rest)),
  );

  out = out.replace(
    /look elsewhere if (not\b[^.]+)\.?/gi,
    (_m, rest: string) => skipSentenceFromLimitation(extractLimitation(rest)),
  );

  out = out.replace(
    /i['’]d pause if ([^.]+?)\s+(?:would\s+)?shows?\s+up(?:\s+often)?(?:\s+in your week|\s+every week)\.?/gi,
    (_m, rest: string) => skipSentenceFromLimitation(extractLimitation(rest)),
  );

  out = out.replace(
    /the trade-off is ([^.]+?) — look elsewhere if that is most of your week\.?/gi,
    (_m, rest: string) => {
      const limitation = extractLimitation(rest);
      return `The trade-off is ${limitation.charAt(0).toLowerCase()}${limitation.slice(1)}. ${skipSentenceFromLimitation(limitation)}`;
    },
  );

  out = out.replace(
    /i['’]d pause if you need a different specialty lane\.?/gi,
    "Skip it if you need a different specialty.",
  );

  out = out.replace(/look elsewhere if that is most of your week\.?/gi, "");

  return out.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();
}

export function sanitizePublicCopyList(lines: string[] | undefined): string[] {
  return (lines ?? [])
    .map((l) => rewriteUniquenessEraSkipProse(l))
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Walk public review fields so leftover generator copy cannot render. */
export function sanitizePublicReview(review: Review): Review {
  return {
    ...review,
    summary: rewriteUniquenessEraSkipProse(review.summary ?? ""),
    verdict: rewriteUniquenessEraSkipProse(review.verdict ?? ""),
    bottomLine: review.bottomLine
      ? rewriteUniquenessEraSkipProse(review.bottomLine)
      : review.bottomLine,
    testingContext: review.testingContext
      ? rewriteUniquenessEraSkipProse(review.testingContext)
      : review.testingContext,
    whoShouldBuy: sanitizePublicCopyList(review.whoShouldBuy),
    whoShouldAvoid: sanitizePublicCopyList(review.whoShouldAvoid),
    pros: sanitizePublicCopyList(review.pros),
    cons: sanitizePublicCopyList(review.cons),
    sections: (review.sections ?? []).map((s) => ({
      ...s,
      body: rewriteUniquenessEraSkipProse(s.body),
    })),
  };
}
