/**
 * Content uniqueness — normalize, scrub entity names, compare text.
 * Used by prelaunch Fix 25 audit + launch eligibility holds.
 */

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

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
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
