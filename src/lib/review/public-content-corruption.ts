/**
 * Public-content corruption detector.
 *
 * Catches uniqueness-token stamps and other machine values that must never
 * appear in Review / PDP / derived public copy. Not brand- or SKU-specific.
 */

const SPEC_FIELD_KEYS = [
  "weight",
  "heelstack",
  "forefootstack",
  "drop",
  "cushionlevel",
  "cushionfeel",
  "stability",
  "ridecharacter",
  "energyreturn",
  "flexibility",
  "platematerial",
  "widthoptions",
  "archsupport",
  "stackheight",
  "midsole",
] as const;

const CONCAT_TOKEN_EXPLAIN =
  /is the concatenated\s+\S+\s+token\b/i;
const CONCAT_TOKEN_GENERIC =
  /\bconcatenated\s+(?:\S+\s+)?tokens?\b/i;
const SKU_SLUG = /\bskuslug/i;
const SKU_ID = /\bskuid/i;
const OBJECT_OBJECT = /\[object Object\]/;
const BARE_UNDEFINED = /(?:^|[^\w.])undefined(?:[^\w.]|$)/;
const BARE_NAN = /(?:^|[^\w.])NaN(?:[^\w.]|$)/;
const MACHINE_NULL = /(?:[=:]\s*null\b)|(?:\bnull\b\s*[,}\]])|(?:\[\s*null\s*\])/;
const CAMEL_SPEC =
  /\b(skuSlug|skuId|intendedJob)\b/;
const RAW_JSONISH = /"productId"\s*:|"reviewId"\s*:|\{[^{}]{0,80}"slug"\s*:/;
const AGENT_LANGUAGE: Array<{ name: string; re: RegExp }> = [
  { name: "prompt_n", re: /\bPrompt\s*\d+/i },
  { name: "ai_synthesis", re: /\bAI synthesis\b/i },
  { name: "catalog_pass", re: /\bcatalog pass\b/i },
  { name: "agent_readiness", re: /\bagent readiness\b/i },
  { name: "llm", re: /\bLLM\b/ },
  { name: "unique_token_list", re: /\buniqueTokenList\b/ },
  { name: "sku_stamp", re: /\bskuStamp\b/i },
  { name: "staging_path", re: /staging\// },
  { name: "product_review_agent", re: /\bproduct review agent\b/i },
  { name: "research_agent", re: /\bresearch agent\b/i },
];

export type PublicCorruptionHit =
  | "skuslug"
  | "skuid"
  | "concatenated_token"
  | "spec_stamp"
  | "object_object"
  | "undefined"
  | "NaN"
  | "null_serialization"
  | "camel_spec"
  | "raw_json"
  | "agent_language";

const SKIP_KEYS = new Set([
  "id",
  "slug",
  "productId",
  "reviewerId",
  "evidenceIds",
  "alternativeProductIds",
  "comparisonIds",
  "faqIds",
  "relatedBuyingGuideIds",
  "editorialSource",
  "src",
  "href",
  "canonical",
]);

function compactAlnum(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokenLooksLikeSpecStamp(token: string): boolean {
  // Uniqueness stamps are compact identifiers. Hyphenated product slugs
  // (adidas-adipower-weightlifting-2) are legitimate public strings.
  if (/[-_]/.test(token)) return false;
  const t = compactAlnum(token);
  if (t.length < 10) return false;
  if (t.startsWith("skuslug") || t.startsWith("skuid")) return true;
  if (/^gen\d+[a-z]{6,}$/.test(t)) return true;

  for (const field of SPEC_FIELD_KEYS) {
    const idx = t.indexOf(field);
    if (idx < 0) continue;
    const before = t.slice(0, idx);
    const after = t.slice(idx + field.length);
    if (before.length < 1 || after.length < 4) continue;
    const hasDigit = /\d/.test(before) || /\d/.test(after);
    const slugish =
      /[a-z]{4,}/.test(before) ||
      /[a-z]{4,}/.test(after) ||
      /[a-z]+\d+/.test(before) ||
      /[a-z]+\d+/.test(after);
    if (hasDigit && slugish) return true;
    if (before.length >= 4 && after.length >= 4) return true;
  }
  return false;
}

export function flattenPublicContent(input: unknown): string {
  if (input == null) return "";
  if (typeof input === "string") return input;
  if (typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }
  if (Array.isArray(input)) {
    return input.map(flattenPublicContent).filter(Boolean).join("\n");
  }
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const parts: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_KEYS.has(key)) continue;
      if (value == null) continue;
      const nested = flattenPublicContent(value);
      if (nested) parts.push(nested);
    }
    return parts.join("\n");
  }
  return "";
}

/**
 * Named leak kinds found in visible copy. Empty = clean.
 */
export function inspectPublicContentCorruption(input: unknown): PublicCorruptionHit[] {
  const text = flattenPublicContent(input);
  if (!text.trim()) return [];

  const hits = new Set<PublicCorruptionHit>();
  if (OBJECT_OBJECT.test(text)) hits.add("object_object");
  if (BARE_UNDEFINED.test(text)) hits.add("undefined");
  if (BARE_NAN.test(text)) hits.add("NaN");
  if (MACHINE_NULL.test(text)) hits.add("null_serialization");
  if (SKU_SLUG.test(text)) hits.add("skuslug");
  if (SKU_ID.test(text)) hits.add("skuid");
  if (CONCAT_TOKEN_EXPLAIN.test(text) || CONCAT_TOKEN_GENERIC.test(text)) {
    hits.add("concatenated_token");
  }
  if (CAMEL_SPEC.test(text)) hits.add("camel_spec");
  if (RAW_JSONISH.test(text)) hits.add("raw_json");
  if (AGENT_LANGUAGE.some((p) => p.re.test(text))) hits.add("agent_language");

  for (const raw of text.split(/\s+/)) {
    if (tokenLooksLikeSpecStamp(raw)) {
      hits.add("spec_stamp");
      break;
    }
  }
  return [...hits];
}

/**
 * True when copy contains uniqueness stamps, concatenated-token explanations,
 * compact spec+field+slug concatenations, or standalone machine values.
 */
export function containsPublicContentCorruption(input: unknown): boolean {
  return inspectPublicContentCorruption(input).length > 0;
}

export function isIdentifierUniquenessToken(token: string): boolean {
  const t = token.trim();
  if (!t) return false;
  if (/^(skuslug|skuid)/i.test(t)) return true;
  if (SKU_SLUG.test(t) || SKU_ID.test(t)) return true;
  return tokenLooksLikeSpecStamp(t);
}
