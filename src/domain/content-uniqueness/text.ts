/**
 * Content uniqueness — normalize, scrub entity names, compare text.
 *
 * Identifier strings, numbers, SKUs, slugs and spec dumps contribute ZERO
 * to editorial uniqueness. A review is unique because its analysis is
 * product-specific. Natural domain language is not penalized.
 */
import { isIdentifierUniquenessToken } from "@/lib/review/public-content-corruption";

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "as",
  "is",
  "are",
  "was",
  "be",
  "it",
  "this",
  "that",
  "you",
  "your",
  "i",
  "i'd",
  "we",
  "when",
  "than",
  "not",
  "at",
  "from",
  "by",
  "its",
  "into",
  "more",
  "most",
  "also",
  "can",
  "will",
  "just",
]);

/** Shared scaffold phrases from programmatic review generation */
export const REVIEW_SCAFFOLD_PHRASES = [
  "is built for a specific job in the category — use that job as your first filter",
  "when its main job matches most of your week — not as a default for every session",
  "weight and stack shape how protective or lively a shoe feels",
  "specs will not tell you blister risk, late-run foam feel",
  "check live street price in the offers module",
  "if more than half your week sits in the “look elsewhere” list",
  "we put this guide together from published specs and similar products",
  "affiliate links do not change the verdict",
  "you are mainly paying for",
  "those limits matter when they hit your primary sessions",
  "neutral last — no medial post",
  "wear the socks you train in",
  "practical plan: pair soft easy miles here with a firmer daily",
] as const;

export function scrubEntityNames(
  text: string,
  names: string[],
): string {
  let out = text;
  const sorted = [...names]
    .filter((n) => n && n.trim().length >= 2)
    .sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "gi"), " ENTITY ");
  }
  return out;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Natural running/watch/gear vocabulary. Sharing these words is not a
 * uniqueness failure — every honest shoe review talks about cushion.
 */
export const DOMAIN_GENERIC_TOKENS = new Set([
  "running",
  "run",
  "runner",
  "runners",
  "shoe",
  "shoes",
  "trainer",
  "trainers",
  "watch",
  "watches",
  "gps",
  "gear",
  "cushion",
  "cushioning",
  "drop",
  "stack",
  "foam",
  "midsole",
  "outsole",
  "upper",
  "fit",
  "ride",
  "stability",
  "grip",
  "trail",
  "road",
  "daily",
  "training",
  "race",
  "racing",
  "tempo",
  "easy",
  "miles",
  "kilometres",
  "kilometers",
  "long",
  "short",
  "soft",
  "firm",
  "plush",
  "responsive",
  "protective",
  "light",
  "lightweight",
  "heavy",
  "battery",
  "display",
  "heart",
  "rate",
  "product",
  "model",
  "pair",
  "session",
  "sessions",
  "week",
  "weekdays",
  "buy",
  "skip",
  "review",
  "guide",
  "best",
  "option",
  "choice",
  "feel",
  "feels",
  "feelings",
  "need",
  "needs",
  "want",
  "looking",
  "primary",
  "intended",
]);

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** True when a token must not count toward uniqueness (SKU/slug/spec dump/number). */
export function isZeroUniquenessToken(token: string): boolean {
  if (!token) return false;
  if (isIdentifierUniquenessToken(token)) return true;
  if (/^\d+$/.test(token)) return true;
  if (/^\d+[a-z]{0,4}$/.test(token)) return true; // 255g, 41mm, 8mm
  if (/^(sku|prod|rev|cat|ev)-[a-z0-9-]+$/i.test(token)) return true;
  if (/^[a-z]+-[a-z0-9-]{6,}$/.test(token) && /\d/.test(token)) return true; // product slugs
  return false;
}

/** Tokens that may count as editorial language (identifiers stripped). */
export function editorialTokens(text: string): string[] {
  return tokenize(text).filter((t) => !isZeroUniquenessToken(t));
}

/**
 * Product-specific analysis tokens: identifiers AND domain-generic words
 * removed. Two reviews that only swap SKUs or share "cushion/drop/foam"
 * language do not look unique or duplicative from those strings alone.
 */
export function analysisTokens(text: string): string[] {
  return editorialTokens(text).filter((t) => !DOMAIN_GENERIC_TOKENS.has(t));
}

export function shingles(tokens: string[], n = 3): Set<string> {
  const out = new Set<string>();
  if (tokens.length < n) {
    if (tokens.length) out.add(tokens.join(" "));
    return out;
  }
  for (let i = 0; i <= tokens.length - n; i++) {
    out.add(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function tokenJaccard(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  return jaccard(ta, tb);
}

export function shingleJaccard(a: string, b: string, n = 3): number {
  return jaccard(shingles(tokenize(a), n), shingles(tokenize(b), n));
}

/** Combined similarity: max of token + shingle Jaccard */
export function textSimilarity(a: string, b: string): number {
  if (!a.trim() || !b.trim()) return 0;
  if (a === b) return 1;
  const tok = tokenJaccard(a, b);
  const sh = shingleJaccard(a, b, 3);
  return Math.max(tok, sh);
}

/**
 * Editorial uniqueness similarity. Identifier dumps score 0; shared
 * domain vocabulary is not treated as duplication.
 */
export function editorialSimilarity(a: string, b: string): number {
  const ta = analysisTokens(a);
  const tb = analysisTokens(b);
  if (ta.length === 0 && tb.length === 0) return 0;
  const tok = jaccard(new Set(ta), new Set(tb));
  const sh = jaccard(shingles(ta, 3), shingles(tb, 3));
  return Math.max(tok, sh);
}

/**
 * Share of tokens that are product-specific analysis — never inflated by
 * SKUs, numbers, or spec concatenations.
 */
export function uniqueAnalysisRatio(text: string): number {
  const editorial = editorialTokens(text);
  if (!editorial.length) return 0;
  return analysisTokens(text).length / editorial.length;
}

export function scaffoldHitCount(text: string): number {
  const norm = normalizeText(text);
  let hits = 0;
  for (const phrase of REVIEW_SCAFFOLD_PHRASES) {
    if (norm.includes(normalizeText(phrase))) hits++;
  }
  return hits;
}

export function paragraphHashes(
  text: string,
  scrubNames: string[],
): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => normalizeText(scrubEntityNames(p, scrubNames)))
    .filter((p) => p.split(" ").length >= 12)
    .map((p) => p.slice(0, 240));
}

export type UniquenessClass =
  | "GENUINELY_UNIQUE"
  | "TEMPLATE_SIMILAR_ACCEPTABLE"
  | "NEEDS_DIFFERENTIATION"
  | "DUPLICATIVE"
  | "HOLD";

/**
 * Classify a page given its strongest within-category peer similarity
 * and scaffold density.
 */
export function classifyUniqueness(input: {
  maxPeerSimilarity: number;
  scaffoldHits: number;
  uniqueSignalRatio: number;
  held?: boolean;
}): UniquenessClass {
  if (input.held) return "HOLD";
  const { maxPeerSimilarity: s, scaffoldHits, uniqueSignalRatio } = input;

  if (s >= 0.9 || (s >= 0.82 && scaffoldHits >= 5)) {
    return "DUPLICATIVE";
  }
  if (s >= 0.72 || (s >= 0.62 && scaffoldHits >= 4 && uniqueSignalRatio < 0.25)) {
    return "NEEDS_DIFFERENTIATION";
  }
  if (s >= 0.48 || scaffoldHits >= 3) {
    return "TEMPLATE_SIMILAR_ACCEPTABLE";
  }
  return "GENUINELY_UNIQUE";
}
