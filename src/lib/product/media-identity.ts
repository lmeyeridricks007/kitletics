/**
 * Exact-product media identity for Padel PDPs.
 *
 * AUTHENTIC ≠ CORRECT. A licensed -hero JPEG of another SKU must never unlock
 * public/indexable padel product pages.
 *
 * MEDIA_VERIFIED (for padel) requires:
 * - authentic photograph (not SVG / kitletics-owned / logo)
 * - /images/padel/ namespace
 * - brand token match in filename
 * - source URL pathname (when present) does not name another brand or wrong category
 * - model tokens from the product slug appear in filename and/or source pathname
 */

import type { Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import { isAuthenticProductMedia } from "@/lib/product/media-authentic";

export type HeroReuseClass =
  | "UNIQUE"
  | "VALID_VARIANT_REUSE"
  | "VALID_FAMILY_REUSE"
  | "SUSPICIOUS"
  | "INVALID";

export type PadelMediaIdentityResult = {
  /** Satisfies MEDIA_VERIFIED for public readiness. */
  verified: boolean;
  reasons: string[];
  reuse: HeroReuseClass;
};

const GENERIC_TOKENS = new Set([
  "padel",
  "hero",
  "product",
  "products",
  "images",
  "image",
  "pack",
  "the",
  "and",
  "for",
  "with",
  "2024",
  "2025",
  "2026",
  "2027",
  "en",
  "nl",
  "uk",
  "com",
  "www",
  "html",
  "jpg",
  "png",
  "webp",
]);

/** Known padel brand stems used for cross-brand contamination detection. */
export const PADEL_BRAND_STEMS = [
  "adidas",
  "babolat",
  "bullpadel",
  "head",
  "wilson",
  "nox",
  "siux",
  "starvie",
  "kuikma",
  "osaka",
  "tecnifibre",
  "joma",
  "dunlop",
  "4on",
  "hesacore",
  "tourna",
  "shockout",
  "enebe",
  "vibora",
  "softee",
  "pascal",
  "alacran",
  "blackcrown",
  "black-crown",
  "royal",
  "drop",
  "varlion",
  "asics",
  "noene",
  "lok",
  "oxdog",
  "prince",
  "babolat",
  "endless",
  "vibor",
] as const;

const COLORWAY_TOKENS = new Set([
  "black",
  "white",
  "grey",
  "gray",
  "navy",
  "red",
  "blue",
  "green",
  "orange",
  "yellow",
  "pink",
  "purple",
  "silver",
  "gold",
  "bronze",
  "royal",
  "coral",
  "aqua",
  "lime",
  "teal",
  "maroon",
  "burgundy",
  "ivory",
  "charcoal",
  "graphite",
  "beige",
  "cream",
  "zwart",
  "wit",
  "blauw",
  "rood",
]);

const CATEGORY_PATH_HINTS: Record<string, RegExp> = {
  "cat-padel-balls": /ball|ballen|tube|tubes|can|cans|pro-s|premier/i,
  "cat-padel-bags": /bag|bags|tas|tassen|paletero|backpack|rugzak|trolley|schoentas/i,
  "cat-padel-grips": /grip|overgrip|hydrosorb|undergrip|swiftgrip|totalgrip|hesacore/i,
  "cat-padel-accessories":
    /protector|protection|wrist|zweetband|headband|tape|pressur|cone|basket|cesto|smartsorb|antishock|weight.?tape|pick.?up/i,
  "cat-padel-shoes": /shoe|shoes|zapatilla|court|premura|resolution|slam|courtstabil|courtquick|crazyquick/i,
  "cat-padel-rackets": /racket|pala|testracket|padelracket|vertex|hack|metalbone|at10|ml10|viper|bela|coello/i,
};

const WRONG_CATEGORY_FOR: Record<string, RegExp> = {
  "cat-padel-balls": /testracket|padelracket|(?:^|\/)[\w-]*racket(?:-|$)|overgrip|paletero|backpack|zweetband|horloge|sokken/i,
  "cat-padel-bags": /testracket|padelracket|(?<![a-z])racket(?![a-z-])|overgrip|tube(?!.*bag)|ballen|zweetband|horloge|sokken/i,
  "cat-padel-grips": /testracket|padelracket|(?<![a-z])racket(?![a-z-])|paletero|backpack|tube|ballen|horloge|sokken|compressiekous/i,
  "cat-padel-accessories": /testracket|padelracket|(?<![a-z])racket(?![a-z-])|paletero|overgrip|tube|ballen|horloge|sokken/i,
  "cat-padel-shoes": /testracket|padelracket|paletero|overgrip|tube|ballen|zweetband/i,
};

export function isPadelCatalogProduct(product: Pick<Product, "categoryId" | "sportIds">): boolean {
  return (
    (product.categoryId?.startsWith("cat-padel-") ?? false) ||
    (product.sportIds?.includes("sport-padel") ?? false)
  );
}

export function tokenizeMediaIdentity(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !GENERIC_TOKENS.has(t));
}

export function brandStemFromProduct(
  product: Pick<Product, "brandId" | "slug">,
  brandSlug?: string,
): string {
  const raw = (brandSlug || product.brandId.replace(/^brand-/, ""))
    .toLowerCase()
    .replace(/-padel$/, "");
  if (raw === "black-crown" || raw === "blackcrown") return "blackcrown";
  if (raw === "4on") return "4on";
  if (raw === "vibor-a" || raw.startsWith("vibor")) return "vibora";
  return raw.split("-")[0] || raw;
}

function filenameStem(src: string): string {
  return (src.split("/").pop() || "")
    .replace(/\.[^.]+$/, "")
    .replace(/-hero$/i, "")
    .toLowerCase();
}

function sourcePathname(sourceUrl: string | undefined): string | null {
  if (!sourceUrl?.trim()) return null;
  try {
    return new URL(sourceUrl).pathname.toLowerCase();
  } catch {
    return sourceUrl.split("?")[0]?.toLowerCase() ?? null;
  }
}

function otherBrandInHaystack(
  hay: string,
  ownStem: string,
  productSlug: string,
): string | null {
  const compact = hay.replace(/[^a-z0-9]/g, "");
  const slug = productSlug.toLowerCase();
  for (const stem of PADEL_BRAND_STEMS) {
    const normalized = stem.replace(/-/g, "");
    if (normalized === ownStem.replace(/-/g, "")) continue;
    // Colorway tokens that collide with brand stems (e.g. "royal" vs Royal Padel).
    if (COLORWAY_TOKENS.has(stem) || COLORWAY_TOKENS.has(normalized)) continue;
    // Product slug may legitimately include another brand token (e.g. Bullpadel Pascal Box).
    if (slug.includes(stem) || slug.replace(/-/g, "").includes(normalized)) continue;
    if (normalized.length < 3) continue;
    if (hay.includes(stem) || compact.includes(normalized)) {
      if (stem === "drop" && !/(?:^|[^a-z])drop(?:[^a-z]|$)/.test(hay)) continue;
      return stem;
    }
  }
  return null;
}

function distinctiveModelTokens(product: Pick<Product, "slug" | "name">, brandStem: string): string[] {
  const bits = tokenizeMediaIdentity(`${product.slug} ${product.name ?? ""}`);
  const base = bits.filter(
    (t) =>
      t !== brandStem &&
      t.replace(/-/g, "") !== brandStem.replace(/-/g, "") &&
      t.length >= 2 &&
      !COLORWAY_TOKENS.has(t) &&
      !GENERIC_TOKENS.has(t),
  );
  // Compound slug segments (pro-s, at10-team, gb-1201) survive generic filtering.
  const parts = product.slug.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const compounds: string[] = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const a = parts[i]!;
    const b = parts[i + 1]!;
    if (a === brandStem || b === brandStem) continue;
    if (GENERIC_TOKENS.has(a) && GENERIC_TOKENS.has(b)) continue;
    const compound = `${a}-${b}`;
    if (compound.length >= 4) compounds.push(compound);
  }
  return [...new Set([...base, ...compounds])];
}

function foreignPathModelTokens(
  path: string,
  product: Pick<Product, "slug" | "name">,
  brandStem: string,
): string[] {
  const slugHay = `${product.slug} ${product.name ?? ""}`.toLowerCase();
  return tokenizeMediaIdentity(path).filter(
    (t) =>
      t.length >= 5 &&
      t !== brandStem &&
      !slugHay.includes(t) &&
      !COLORWAY_TOKENS.has(t) &&
      !GENERIC_TOKENS.has(t) &&
      ![
        "padelmq",
        "zonadepadel",
        "products",
        "search",
        "busca",
        "controller",
        "en",
        "nl",
      ].includes(t),
  );
}

function modelTokensHit(tokens: string[], hay: string): boolean {
  if (!tokens.length) return true;
  const compact = hay.replace(/[^a-z0-9]/g, "");
  const long = tokens.filter((t) => t.length >= 4);
  const pool = long.length ? long : tokens;
  return pool.some((t) => hay.includes(t) || compact.includes(t.replace(/-/g, "")));
}

/** Retailer path aliases that still name the same SKU family. */
function pathModelAliases(productSlug: string): string[] {
  const s = productSlug.toLowerCase();
  const aliases: string[] = [];
  if (s.includes("pro-plus") || /pro\+/.test(s)) {
    aliases.push("pro-tube", "proplus", "pro-plus", "pro+");
  }
  if (s.includes("pro-s")) aliases.push("pro-s", "pros", "pro-s-");
  if (s.includes("premier")) aliases.push("premier-tube", "premier");
  if (s.includes("vertex-w")) aliases.push("vertex-w", "vertexw");
  return aliases;
}

function modelOrAliasHit(tokens: string[], productSlug: string, hay: string): boolean {
  if (modelTokensHit(tokens, hay)) return true;
  const compact = hay.replace(/[^a-z0-9]/g, "");
  return pathModelAliases(productSlug).some(
    (a) => hay.includes(a) || compact.includes(a.replace(/[^a-z0-9]/g, "")),
  );
}

function isOpaqueCdnPath(path: string): boolean {
  // Shopify / CDN UUID filenames carry no brand/model identity — rely on local src.
  return (
    /\/cdn\/shop\/files\/(?:pic_)?[0-9a-f]{8,}(?:-[0-9a-f]{4,})*/i.test(path) ||
    /(?:^|\/)(?:pic_)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\.[a-z]+)?$/i.test(
      path,
    )
  );
}

function isThinSourcePath(path: string | null): boolean {
  if (!path) return true;
  if (isOpaqueCdnPath(path)) return true;
  const meaningful = tokenizeMediaIdentity(path).filter(
    (t) =>
      !["products", "en", "nl", "uk", "shop", "collections", "files", "cdn"].includes(
        t,
      ),
  );
  return meaningful.length === 0;
}

/**
 * Evaluate whether media is exact-product media for a padel SKU.
 * Non-padel products always return verified=true when authentic (caller gates).
 */
export function evaluatePadelHeroIdentity(
  product: Pick<Product, "id" | "slug" | "name" | "brandId" | "categoryId" | "sportIds">,
  media: Pick<MediaAsset, "src" | "sourceUrl" | "licence" | "attribution"> | null | undefined,
  options?: { brandSlug?: string },
): PadelMediaIdentityResult {
  const reasons: string[] = [];
  if (!media?.src) {
    return { verified: false, reasons: ["missing_src"], reuse: "INVALID" };
  }
  if (!isAuthenticProductMedia(media as MediaAsset)) {
    return {
      verified: false,
      reasons: ["not_authentic_photograph"],
      reuse: "INVALID",
    };
  }
  if (!media.src.includes("/images/padel/")) {
    return {
      verified: false,
      reasons: ["wrong_sport_namespace"],
      reuse: "INVALID",
    };
  }

  const brandStem = brandStemFromProduct(product, options?.brandSlug);
  const stem = filenameStem(media.src);
  const fileHay = stem;
  if (!fileHay.includes(brandStem) && !fileHay.replace(/-/g, "").includes(brandStem.replace(/-/g, ""))) {
    reasons.push(`filename_brand_mismatch:${brandStem}`);
  }

  const modelToks = distinctiveModelTokens(product, brandStem);
  if (!modelTokensHit(modelToks, fileHay)) {
    reasons.push("filename_model_weak");
  }

  // Foreign model stamped in filename (courtquick on courtstabil).
  const slugCompact = product.slug.replace(/[^a-z0-9]/g, "");
  const fileCompact = stem.replace(/[^a-z0-9]/g, "");
  if (
    fileCompact.length >= 8 &&
    slugCompact.length >= 8 &&
    !fileCompact.includes(slugCompact.slice(0, 8)) &&
    !slugCompact.includes(fileCompact.slice(0, 8)) &&
    modelToks.some((t) => t.length >= 5) &&
    !modelTokensHit(modelToks, fileHay)
  ) {
    reasons.push("filename_vs_slug_divergence");
  }

  const path = sourcePathname(media.sourceUrl);
  // Manufacturer homepage / bare domain: rely on filename identity only.
  if (path && !isThinSourcePath(path)) {
    const other = otherBrandInHaystack(path, brandStem, product.slug);
    if (other) reasons.push(`source_other_brand:${other}`);

    const wrongCat = WRONG_CATEGORY_FOR[product.categoryId];
    if (wrongCat?.test(path)) {
      const okHint = CATEGORY_PATH_HINTS[product.categoryId];
      if (!okHint?.test(path)) reasons.push("source_wrong_category");
    }

    // Bags: collection SKU paths without bag/tas/paletero are usually rackets.
    if (
      product.categoryId === "cat-padel-bags" &&
      !/bag|tas|paletero|backpack|rugzak|trolley|schoentas|padeltas/i.test(path) &&
      /metalbone|vertex|hack|at10|ml10|viper|bela|coello|-\d-\d-\d{4}/i.test(path)
    ) {
      reasons.push("source_looks_like_racket_not_bag");
    }

    const foreign = foreignPathModelTokens(path, product, brandStem);
    if (foreign.length && !modelOrAliasHit(modelToks, product.slug, path)) {
      reasons.push(`source_foreign_model:${foreign.slice(0, 3).join(",")}`);
    }

    // Search/query gaming: pathname must carry identity; query tokens do not count.
    if (!modelOrAliasHit(modelToks, product.slug, path) && !path.includes(brandStem)) {
      reasons.push("source_pathname_identity_weak");
    } else if (
      !modelOrAliasHit(modelToks, product.slug, path) &&
      modelToks.some((t) => t.length >= 4 || t.includes("-"))
    ) {
      // Brand in path but model missing — still weak for soft goods.
      if (product.categoryId !== "cat-padel-rackets") {
        reasons.push("source_pathname_model_weak");
      }
    }
  }

  const verified = reasons.length === 0;
  return {
    verified,
    reasons,
    reuse: verified ? "UNIQUE" : "INVALID",
  };
}

/** True when this media may satisfy padel public readiness (MEDIA_VERIFIED). */
export function isPadelMediaVerified(
  product: Pick<Product, "id" | "slug" | "name" | "brandId" | "categoryId" | "sportIds">,
  media: Pick<MediaAsset, "src" | "sourceUrl" | "licence" | "attribution"> | null | undefined,
  options?: { brandSlug?: string },
): boolean {
  if (!isPadelCatalogProduct(product)) {
    return isAuthenticProductMedia(media as MediaAsset);
  }
  return evaluatePadelHeroIdentity(product, media, options).verified;
}

/**
 * Classify shared hero src across product IDs.
 * Colorway-only slug diffs → VALID_VARIANT_REUSE. Everything else shared → INVALID.
 */
export function classifySharedHeroReuse(
  productA: Pick<Product, "id" | "slug" | "brandId" | "categoryId">,
  productB: Pick<Product, "id" | "slug" | "brandId" | "categoryId">,
): HeroReuseClass {
  if (productA.id === productB.id) return "UNIQUE";
  if (productA.brandId !== productB.brandId) return "INVALID";
  if (productA.categoryId !== productB.categoryId) return "INVALID";

  const a = tokenizeMediaIdentity(productA.slug).filter((t) => !COLORWAY_TOKENS.has(t));
  const b = tokenizeMediaIdentity(productB.slug).filter((t) => !COLORWAY_TOKENS.has(t));
  const aOnly = a.filter((t) => !b.includes(t));
  const bOnly = b.filter((t) => !a.includes(t));
  if (aOnly.length === 0 && bOnly.length === 0) return "VALID_VARIANT_REUSE";
  // Same core model tokens with only colorway removed already handled; remaining
  // diffs are different models / generations / sizes.
  return "INVALID";
}
