/**
 * READ-ONLY forensic catalog inventory for pre-launch audit 01.
 * Writes docs only — does not mutate catalog content.
 *
 * Usage: tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-01-catalog-inventory.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { brands as rawBrands } from "@/content/brands";
import { productFamilies as rawFamilies } from "@/content/families";
import { offers as rawOffers } from "@/content/offers";
import { products as rawProducts } from "@/content/products";
import { retailers as rawRetailers } from "@/content/retailers";
import { reviews as rawReviews } from "@/content/reviews";
import { applyRunningAudienceVariants } from "@/content/running/audience-variants";
import { applyProductSpecFill } from "@/content/specs/product-spec-fill";
import { allSpecificationDefinitions } from "@/content/specs/definitions";
import { categories as rawCategories } from "@/content/taxonomy/categories";
import { disciplines as rawDisciplines } from "@/content/taxonomy/disciplines";
import { sports as rawSports } from "@/content/taxonomy/sports";
import { subcategories as rawSubcategories } from "@/content/taxonomy/subcategories";
import { useCases as rawUseCases } from "@/content/taxonomy/use-cases";
import { getPublishRequirement } from "@/domain/catalog/publishability";
import type { Product, ProductVariant } from "@/domain/products/types";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { resolveRunningCatalogImages } from "@/content/running/media";
import { getActivities } from "@/repositories/sports";

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD_OPTS = { isDev: false, now: AUDIT_NOW } as const;
const RUNNING_SPORT = "sport-running";
const SHOE_CAT = "cat-running-shoes";

/** Expected section-5 category labels → taxonomy category ids (or null if missing). */
const EXPECTED_OTHER_RUNNING: { label: string; categoryId: string | null }[] = [
  { label: "GPS Watches", categoryId: "cat-gps-watches" },
  { label: "Heart Rate Monitors", categoryId: "cat-hrm" },
  { label: "Hydration", categoryId: "cat-hydration" },
  { label: "Clothing", categoryId: "cat-running-clothing" },
  { label: "Packs/Vests", categoryId: "cat-packs-vests" },
  { label: "Headphones", categoryId: "cat-headphones" },
  { label: "Sunglasses", categoryId: "cat-sunglasses" },
  { label: "Headlamps", categoryId: "cat-running-lights" },
  { label: "Fuel", categoryId: "cat-nutrition" },
  { label: "Recovery", categoryId: "cat-recovery-gear" },
  { label: "Accessories", categoryId: "cat-accessories" },
];

const MAJOR_RUNNING_BRAND_SLUGS = new Set([
  "nike",
  "adidas",
  "asics",
  "brooks",
  "hoka",
  "saucony",
  "new-balance",
  "garmin",
  "coros",
  "polar",
  "suunto",
  "apple",
  "salomon",
  "altra",
  "on",
  "puma",
  "mizuno",
  "under-armour",
  "skechers",
  "topo-athletic",
]);

function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function statusBucket(status: string | undefined): string {
  if (!status) return "unknown";
  if (
    status === "published" ||
    status === "draft" ||
    status === "scheduled" ||
    status === "review" ||
    status === "archived"
  ) {
    return status;
  }
  return "unknown";
}

function isRunningProduct(p: Product): boolean {
  return p.sportIds.includes(RUNNING_SPORT);
}

function hasMedia(p: Product): boolean {
  return Boolean(getPrimaryProductMedia(p));
}

function hasAnyImage(p: Product): boolean {
  return p.images.some((img) => Boolean(img.src));
}

function identityComplete(p: Product): boolean {
  return Boolean(
    p.id &&
      p.slug &&
      p.brandId &&
      p.name?.trim() &&
      p.fullName?.trim() &&
      p.categoryId &&
      p.shortDescription?.trim() &&
      p.lifecycleStatus,
  );
}

function specsComplete(p: Product): boolean {
  const req = getPublishRequirement(p.categoryId);
  const defs = allSpecificationDefinitions.filter((d) => d.categoryId === p.categoryId);
  if (req) {
    return req.requiredSpecKeys.every((key) => {
      const v = p.specifications[key];
      if (v === undefined || v === null) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
  }
  if (defs.length === 0) {
    // Non-spec categories: treat as complete if short description exists
    return Boolean(p.shortDescription?.trim());
  }
  // Require at least 50% of defined specs when no publish requirement
  const filled = defs.filter((d) => {
    const v = p.specifications[d.key];
    if (v === undefined || v === null) return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;
  return filled / defs.length >= 0.5;
}

function variantComplete(
  p: Product,
  variants: ProductVariant[],
  footwearOrApparel: boolean,
): boolean {
  if (!footwearOrApparel) {
    // Non-apparel: complete if no orphan expectation — presence optional
    return true;
  }
  if (variants.length === 0) return false;
  return variants.every((v) => {
    const hasAudience = v.audience === "men" || v.audience === "women" || v.audience === "unisex";
    const hasSizeHint = Boolean(v.sizeRangeLabel || v.referenceSizeLabel || v.attributes?.size);
    return hasAudience && hasSizeHint;
  });
}

function relationshipsPresent(p: Product): boolean {
  return (
    (p.relatedProductIds?.length ?? 0) > 0 ||
    (p.alternativeProductIds?.length ?? 0) > 0 ||
    Boolean(p.familyId)
  );
}

function mdEscape(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function yesNo(v: boolean): string {
  return v ? "yes" : "no";
}

function countByStatus(products: Product[]) {
  const buckets = {
    published: 0,
    draft: 0,
    scheduled: 0,
    review: 0,
    archived: 0,
    unknown: 0,
  };
  for (const p of products) {
    const b = statusBucket(p.status) as keyof typeof buckets;
    if (b in buckets) buckets[b]++;
    else buckets.unknown++;
  }
  return buckets;
}

function audienceFlags(variants: ProductVariant[]) {
  return {
    men: variants.some((v) => v.audience === "men"),
    women: variants.some((v) => v.audience === "women"),
    unisex: variants.some((v) => v.audience === "unisex"),
    unknown: variants.length === 0,
  };
}

// ── Load & enrich (same pipeline as repositories, but ALL statuses) ─────────
const filled = applyProductSpecFill(rawProducts);
const { products: productsWithAudience, variants: audienceVariants } =
  applyRunningAudienceVariants(filled);
const allProducts = resolveRunningCatalogImages(productsWithAudience);

const variantsByProduct = new Map<string, ProductVariant[]>();
for (const v of audienceVariants) {
  const list = variantsByProduct.get(v.productId) ?? [];
  list.push(v);
  variantsByProduct.set(v.productId, list);
}

const brandById = new Map(rawBrands.map((b) => [b.id, b]));
const categoryById = new Map(rawCategories.map((c) => [c.id, c]));
const useCaseById = new Map(rawUseCases.map((u) => [u.id, u]));
const familyById = new Map(rawFamilies.map((f) => [f.id, f]));
const offerById = new Map(rawOffers.map((o) => [o.id, o]));
const offersByProduct = new Map<string, typeof rawOffers>();
for (const o of rawOffers) {
  const list = offersByProduct.get(o.productId) ?? [];
  list.push(o);
  offersByProduct.set(o.productId, list);
}
const reviewByProductId = new Map<string, (typeof rawReviews)[0]>();
for (const r of rawReviews) {
  if (!reviewByProductId.has(r.productId)) reviewByProductId.set(r.productId, r);
}

const productIds = new Set(allProducts.map((p) => p.id));

function productHasOffer(p: Product): boolean {
  if ((offersByProduct.get(p.id)?.length ?? 0) > 0) return true;
  return (p.offerIds ?? []).some((id) => offerById.has(id));
}

function productionVisible(p: Product): boolean {
  return isPubliclyVisible(p, PROD_OPTS) && !p.noindex;
}

const runningProducts = allProducts.filter(isRunningProduct);
const shoeProducts = runningProducts.filter((p) => p.categoryId === SHOE_CAT);

const runningCategories = rawCategories
  .filter((c) => c.sportIds.includes(RUNNING_SPORT))
  .sort((a, b) => a.sortOrder - b.sortOrder);

const FOOTWEAR_APPAREL_CATS = new Set([
  "cat-running-shoes",
  "cat-running-clothing",
  "cat-running-socks",
  "cat-packs-vests",
  "cat-hydration",
  "cat-running-belts",
]);

// ── Global totals ───────────────────────────────────────────────────────────
const rawActivities = getActivities();

const totals = {
  sports: rawSports.length,
  disciplines: rawDisciplines.length,
  activities: rawActivities.length,
  categories: rawCategories.length,
  subcategories: rawSubcategories.length,
  brands: rawBrands.length,
  productFamilies: rawFamilies.length,
  products: allProducts.length,
  productVariants: audienceVariants.length,
  useCases: rawUseCases.length,
  offers: rawOffers.length,
  retailers: rawRetailers.length,
  reviews: rawReviews.length,
};

// ── Sport summary ───────────────────────────────────────────────────────────
const sportSummary = rawSports
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((sport) => {
    const disciplines = rawDisciplines.filter((d) => d.sportId === sport.id);
    const categories = rawCategories.filter((c) => c.sportIds.includes(sport.id));
    const products = allProducts.filter((p) => p.sportIds.includes(sport.id));
    const productIdSet = new Set(products.map((p) => p.id));
    const variants = audienceVariants.filter((v) => productIdSet.has(v.productId));
    const brandIds = new Set(products.map((p) => p.brandId));
    const status = countByStatus(products);
    return {
      sportId: sport.id,
      sport: sport.name,
      slug: sport.slug,
      available: sport.available,
      contentStatus: sport.contentStatus,
      disciplines: disciplines.length,
      categories: categories.length,
      products: products.length,
      variants: variants.length,
      brands: brandIds.size,
      published: status.published,
      draft: status.draft,
      scheduled: status.scheduled,
      review: status.review,
      archived: status.archived,
      unknownStatus: status.unknown,
    };
  });

// ── Running deep dive by category / subcategory ─────────────────────────────
type CatRow = {
  categoryId: string;
  category: string;
  subcategoryId: string | null;
  subcategory: string;
  products: number;
  currentProducts: number;
  previousGeneration: number;
  variants: number;
  brands: number;
  men: number;
  women: number;
  unisex: number;
  unknownAudience: number;
  offers: number;
  productsWithOffers: number;
  productsWithMedia: number;
};

const runningDeepDive: CatRow[] = [];

for (const cat of runningCategories) {
  const catProducts = runningProducts.filter((p) => p.categoryId === cat.id);
  const subs = rawSubcategories
    .filter((s) => s.categoryId === cat.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const emitRow = (
    subcategoryId: string | null,
    subcategory: string,
    products: Product[],
  ) => {
    const ids = new Set(products.map((p) => p.id));
    const variants = audienceVariants.filter((v) => ids.has(v.productId));
    let men = 0;
    let women = 0;
    let unisex = 0;
    let unknownAudience = 0;
    for (const p of products) {
      const flags = audienceFlags(variantsByProduct.get(p.id) ?? []);
      if (flags.unknown) unknownAudience++;
      else {
        if (flags.men) men++;
        if (flags.women) women++;
        if (flags.unisex) unisex++;
      }
    }
    // Prefer unique offer entities linked to products
    const offerIds = new Set<string>();
    for (const p of products) {
      for (const o of offersByProduct.get(p.id) ?? []) offerIds.add(o.id);
      for (const id of p.offerIds ?? []) if (offerById.has(id)) offerIds.add(id);
    }
    runningDeepDive.push({
      categoryId: cat.id,
      category: cat.name,
      subcategoryId,
      subcategory,
      products: products.length,
      currentProducts: products.filter((p) => p.lifecycleStatus === "current").length,
      previousGeneration: products.filter((p) => p.lifecycleStatus === "previous-generation").length,
      variants: variants.length,
      brands: new Set(products.map((p) => p.brandId)).size,
      men,
      women,
      unisex,
      unknownAudience,
      offers: offerIds.size,
      productsWithOffers: products.filter(productHasOffer).length,
      productsWithMedia: products.filter(hasMedia).length,
    });
  };

  if (subs.length === 0) {
    emitRow(null, "(none)", catProducts);
  } else {
    // Products with no subcategory
    const unsubbed = catProducts.filter((p) => (p.subcategoryIds?.length ?? 0) === 0);
    if (unsubbed.length > 0) emitRow(null, "(no subcategory)", unsubbed);
    for (const sub of subs) {
      const products = catProducts.filter((p) => p.subcategoryIds.includes(sub.id));
      emitRow(sub.id, sub.name, products);
    }
  }
}

// ── Running shoes complete inventory ────────────────────────────────────────
function formatUseCaseNames(p: Product): string {
  return (p.useCaseIds ?? [])
    .map((id) => useCaseById.get(id)?.name ?? id)
    .join("; ");
}

const shoeInventory = shoeProducts
  .slice()
  .sort((a, b) => {
    const ba = brandById.get(a.brandId)?.name ?? a.brandId;
    const bb = brandById.get(b.brandId)?.name ?? b.brandId;
    return ba.localeCompare(bb) || a.fullName.localeCompare(b.fullName);
  })
  .map((p) => {
    const flags = audienceFlags(variantsByProduct.get(p.id) ?? []);
    const review = reviewByProductId.get(p.id) ?? (p.reviewId ? rawReviews.find((r) => r.id === p.reviewId) : undefined);
    return {
      brand: brandById.get(p.brandId)?.name ?? p.brandId,
      brandId: p.brandId,
      productId: p.id,
      product: p.fullName,
      slug: p.slug,
      generation: p.generation ?? "",
      lifecycleStatus: p.lifecycleStatus,
      men: flags.men,
      women: flags.women,
      unisex: flags.unisex,
      unknownAudience: flags.unknown,
      useCases: formatUseCaseNames(p),
      useCaseIds: p.useCaseIds ?? [],
      review: Boolean(review),
      reviewId: review?.id ?? p.reviewId ?? null,
      reviewStatus: review?.status ?? null,
      offers: productHasOffer(p),
      offerCount: (() => {
        const ids = new Set<string>();
        for (const o of offersByProduct.get(p.id) ?? []) ids.add(o.id);
        for (const id of p.offerIds ?? []) if (offerById.has(id)) ids.add(id);
        return ids.size;
      })(),
      media: hasMedia(p),
      hasAnyImage: hasAnyImage(p),
      publicationStatus: p.status,
      noindex: Boolean(p.noindex),
      productionExposed: productionVisible(p),
      familyId: p.familyId ?? null,
    };
  });

// ── Other running categories inventories ────────────────────────────────────
function buildCategoryInventory(categoryId: string) {
  const products = runningProducts
    .filter((p) => p.categoryId === categoryId)
    .slice()
    .sort((a, b) => {
      const ba = brandById.get(a.brandId)?.name ?? a.brandId;
      const bb = brandById.get(b.brandId)?.name ?? b.brandId;
      return ba.localeCompare(bb) || a.fullName.localeCompare(b.fullName);
    });

  return products.map((p) => {
    const flags = audienceFlags(variantsByProduct.get(p.id) ?? []);
    const review = reviewByProductId.get(p.id) ?? (p.reviewId ? rawReviews.find((r) => r.id === p.reviewId) : undefined);
    return {
      brand: brandById.get(p.brandId)?.name ?? p.brandId,
      brandId: p.brandId,
      productId: p.id,
      product: p.fullName,
      slug: p.slug,
      generation: p.generation ?? "",
      lifecycleStatus: p.lifecycleStatus,
      men: flags.men,
      women: flags.women,
      unisex: flags.unisex,
      unknownAudience: flags.unknown,
      useCases: formatUseCaseNames(p),
      review: Boolean(review),
      offers: productHasOffer(p),
      media: hasMedia(p),
      publicationStatus: p.status,
      noindex: Boolean(p.noindex),
      productionExposed: productionVisible(p),
      familyId: p.familyId ?? null,
    };
  });
}

const otherRunningInventories: Record<
  string,
  { status: "present" | "MISSING"; categoryId: string | null; categoryName?: string; products: ReturnType<typeof buildCategoryInventory> }
> = {};

for (const expected of EXPECTED_OTHER_RUNNING) {
  if (!expected.categoryId || !categoryById.has(expected.categoryId)) {
    otherRunningInventories[expected.label] = {
      status: "MISSING",
      categoryId: expected.categoryId,
      products: [],
    };
    continue;
  }
  const cat = categoryById.get(expected.categoryId)!;
  otherRunningInventories[expected.label] = {
    status: "present",
    categoryId: cat.id,
    categoryName: cat.name,
    products: buildCategoryInventory(cat.id),
  };
}

// Extra running categories not in the expected list
const expectedIds = new Set(EXPECTED_OTHER_RUNNING.map((e) => e.categoryId).filter(Boolean));
expectedIds.add(SHOE_CAT);
const extraRunningCategories = runningCategories
  .filter((c) => !expectedIds.has(c.id))
  .map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    products: buildCategoryInventory(c.id),
  }));

// ── Brand coverage per running category ─────────────────────────────────────
type BrandCoverageFlag =
  | "only_1_product_from_major_brand"
  | "single_brand_category"
  | "very_small_category";

const brandCoverageByCategory = runningCategories.map((cat) => {
  const products = runningProducts.filter((p) => p.categoryId === cat.id);
  const byBrand = new Map<string, Product[]>();
  for (const p of products) {
    const list = byBrand.get(p.brandId) ?? [];
    list.push(p);
    byBrand.set(p.brandId, list);
  }
  const brands = [...byBrand.entries()]
    .map(([brandId, prods]) => {
      const brand = brandById.get(brandId);
      const flags: BrandCoverageFlag[] = [];
      if (
        brand &&
        MAJOR_RUNNING_BRAND_SLUGS.has(brand.slug) &&
        prods.length === 1
      ) {
        flags.push("only_1_product_from_major_brand");
      }
      return {
        brandId,
        brand: brand?.name ?? brandId,
        brandSlug: brand?.slug ?? null,
        productCount: prods.length,
        currentModels: prods.filter((p) => p.lifecycleStatus === "current").length,
        previousGeneration: prods.filter((p) => p.lifecycleStatus === "previous-generation").length,
        upcoming: prods.filter((p) => p.lifecycleStatus === "upcoming").length,
        discontinued: prods.filter((p) => p.lifecycleStatus === "discontinued").length,
        flags,
      };
    })
    .sort((a, b) => b.productCount - a.productCount || a.brand.localeCompare(b.brand));

  const categoryFlags: BrandCoverageFlag[] = [];
  if (brands.length === 1 && products.length > 0) categoryFlags.push("single_brand_category");
  if (products.length > 0 && products.length <= 3) categoryFlags.push("very_small_category");

  return {
    categoryId: cat.id,
    category: cat.name,
    productCount: products.length,
    brandCount: brands.length,
    categoryFlags,
    brands,
  };
});

// ── Variant coverage ────────────────────────────────────────────────────────
function variantCoverageFor(products: Product[]) {
  let withMen = 0;
  let withWomen = 0;
  let withUnisex = 0;
  let withUnknown = 0;
  let missingSizeData = 0;
  let missingWidthData = 0;
  let missingVariantWeight = 0;
  let missingVariantMedia = 0; // variants have no media fields — always N/A structurally
  let missingVariantOffers = 0;
  let productsWithVariants = 0;

  for (const p of products) {
    const vs = variantsByProduct.get(p.id) ?? [];
    if (vs.length === 0) {
      withUnknown++;
      continue;
    }
    productsWithVariants++;
    const flags = audienceFlags(vs);
    if (flags.men) withMen++;
    if (flags.women) withWomen++;
    if (flags.unisex) withUnisex++;

    const anySize = vs.some((v) => v.sizeRangeLabel || v.referenceSizeLabel || v.attributes?.size);
    const anyWidth = vs.some((v) => (v.widthOptions?.length ?? 0) > 0 || v.attributes?.width);
    const anyWeight = vs.some((v) => typeof v.referenceWeightG === "number");
    const anyOffer = vs.some((v) => (v.offerIds?.length ?? 0) > 0);

    if (!anySize) missingSizeData++;
    if (!anyWidth) missingWidthData++;
    if (!anyWeight) missingVariantWeight++;
    // ProductVariant schema has no media field — count as structural gap
    missingVariantMedia++;
    if (!anyOffer) missingVariantOffers++;
  }

  return {
    productCount: products.length,
    productsWithVariants,
    productsWithMenVariants: withMen,
    productsWithWomenVariants: withWomen,
    productsWithUnisexVariants: withUnisex,
    productsWithUnknownAudience: withUnknown,
    productsMissingSizeData: missingSizeData,
    productsMissingWidthData: missingWidthData,
    productsMissingVariantWeight: missingVariantWeight,
    productsMissingVariantMedia: missingVariantMedia,
    noteVariantMedia:
      "ProductVariant schema has no media fields; variant-specific media cannot be stored in current model.",
    productsMissingVariantOffers: missingVariantOffers,
  };
}

const variantCoverage = {
  runningShoes: variantCoverageFor(shoeProducts),
  runningClothing: variantCoverageFor(
    runningProducts.filter((p) => p.categoryId === "cat-running-clothing"),
  ),
  runningSocks: variantCoverageFor(
    runningProducts.filter((p) => p.categoryId === "cat-running-socks"),
  ),
  packsVests: variantCoverageFor(
    runningProducts.filter((p) => p.categoryId === "cat-packs-vests"),
  ),
  hydration: variantCoverageFor(
    runningProducts.filter((p) => p.categoryId === "cat-hydration"),
  ),
  allRunning: variantCoverageFor(runningProducts),
};

// ── Use-case coverage (running shoes) ───────────────────────────────────────
const runningUseCases = rawUseCases.filter(
  (u) => !u.sportId || u.sportId === RUNNING_SPORT,
);

const shoeUseCaseCoverage = runningUseCases
  .map((uc) => {
    const count = shoeProducts.filter((p) => p.useCaseIds.includes(uc.id)).length;
    return {
      useCaseId: uc.id,
      name: uc.name,
      slug: uc.slug,
      group: uc.group,
      productCount: count,
      sparse: count <= 3,
      sparseLevel: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : null,
    };
  })
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const shoeUseCasesWithZeroOneTwoThree = shoeUseCaseCoverage.filter((u) => u.sparse);

// ── Product family health ───────────────────────────────────────────────────
const slugCounts = new Map<string, string[]>();
const fullNameCounts = new Map<string, string[]>();
for (const p of allProducts) {
  slugCounts.set(p.slug, [...(slugCounts.get(p.slug) ?? []), p.id]);
  const key = p.fullName.trim().toLowerCase();
  fullNameCounts.set(key, [...(fullNameCounts.get(key) ?? []), p.id]);
}

const duplicateSlugs = [...slugCounts.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([slug, ids]) => ({ slug, productIds: ids }));

const duplicateFullNames = [...fullNameCounts.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([fullName, ids]) => ({ fullName, productIds: ids }));

const genderSplitPattern =
  /\b(men'?s|women'?s|mens|womens|male|female)\b/i;
const possibleGenderSplitProducts = allProducts
  .filter((p) => genderSplitPattern.test(p.name) || genderSplitPattern.test(p.fullName) || genderSplitPattern.test(p.slug))
  .map((p) => ({
    productId: p.id,
    fullName: p.fullName,
    slug: p.slug,
    brandId: p.brandId,
    categoryId: p.categoryId,
  }));

// Pair candidates: same brand + similar base name with men/women difference
const genderSplitPairs: { a: string; b: string; note: string }[] = [];
const byBrandCat = new Map<string, Product[]>();
for (const p of allProducts) {
  const key = `${p.brandId}::${p.categoryId}`;
  const list = byBrandCat.get(key) ?? [];
  list.push(p);
  byBrandCat.set(key, list);
}
for (const [, group] of byBrandCat) {
  const normalized = group.map((p) => ({
    p,
    base: p.fullName
      .toLowerCase()
      .replace(/\b(men'?s|women'?s|mens|womens)\b/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  }));
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      if (
        normalized[i].base === normalized[j].base &&
        normalized[i].base.length > 3 &&
        (genderSplitPattern.test(normalized[i].p.fullName) ||
          genderSplitPattern.test(normalized[j].p.fullName))
      ) {
        genderSplitPairs.push({
          a: normalized[i].p.id,
          b: normalized[j].p.id,
          note: `Possible men/women stored as separate products: ${normalized[i].p.fullName} / ${normalized[j].p.fullName}`,
        });
      }
    }
  }
}

// Generation issues: generation string vs lifecycle mismatch signals
const generationConcerns: { productId: string; fullName: string; issue: string }[] = [];
for (const p of allProducts) {
  if (p.lifecycleStatus === "current" && /prev|old|legacy/i.test(p.generation ?? "")) {
    generationConcerns.push({
      productId: p.id,
      fullName: p.fullName,
      issue: "lifecycle=current but generation string suggests previous",
    });
  }
  if (
    p.lifecycleStatus === "previous-generation" &&
    p.generation &&
    /current|latest|new/i.test(p.generation)
  ) {
    generationConcerns.push({
      productId: p.id,
      fullName: p.fullName,
      issue: "lifecycle=previous-generation but generation string suggests current",
    });
  }
}

// Same family with multiple "current" generations that look like duplicates of same gen label
for (const fam of rawFamilies) {
  const members = allProducts.filter((p) => p.familyId === fam.id || fam.productIds.includes(p.id));
  const current = members.filter((p) => p.lifecycleStatus === "current");
  const genLabels = new Map<string, string[]>();
  for (const p of current) {
    const g = (p.generation ?? "").trim() || "(empty)";
    genLabels.set(g, [...(genLabels.get(g) ?? []), p.id]);
  }
  for (const [g, ids] of genLabels) {
    if (g !== "(empty)" && ids.length > 1) {
      generationConcerns.push({
        productId: ids.join(","),
        fullName: fam.name,
        issue: `Family has ${ids.length} current products sharing generation "${g}"`,
      });
    }
  }
}

const orphanVariants = audienceVariants
  .filter((v) => !productIds.has(v.productId))
  .map((v) => ({ variantId: v.id, productId: v.productId }));

const shoesWithoutFamily = shoeProducts
  .filter((p) => !p.familyId)
  .map((p) => ({ productId: p.id, fullName: p.fullName, slug: p.slug }));

// Family productIds pointing to missing products
const familyOrphanRefs = rawFamilies.flatMap((f) =>
  f.productIds
    .filter((id) => !productIds.has(id))
    .map((productId) => ({ familyId: f.id, familyName: f.name, productId })),
);

// Products with familyId that doesn't exist
const productsBadFamily = allProducts
  .filter((p) => p.familyId && !familyById.has(p.familyId))
  .map((p) => ({ productId: p.id, familyId: p.familyId!, fullName: p.fullName }));

// ── Publication status ──────────────────────────────────────────────────────
const publicationAll = countByStatus(allProducts);
const publicationRunning = countByStatus(runningProducts);
const publicationShoes = countByStatus(shoeProducts);

const publicationExtended = {
  allProducts: {
    ...publicationAll,
    future: allProducts.filter(
      (p) =>
        p.status === "scheduled" ||
        p.lifecycleStatus === "upcoming" ||
        (p.scheduledFor && new Date(p.scheduledFor).getTime() > AUDIT_NOW.getTime()),
    ).length,
    blocked: allProducts.filter((p) => p.status === "archived" || p.noindex).length,
    productionExposed: allProducts.filter(productionVisible).length,
    productionHidden: allProducts.filter((p) => !productionVisible(p)).length,
  },
  runningProducts: {
    ...publicationRunning,
    future: runningProducts.filter(
      (p) =>
        p.status === "scheduled" ||
        p.lifecycleStatus === "upcoming" ||
        (p.scheduledFor && new Date(p.scheduledFor).getTime() > AUDIT_NOW.getTime()),
    ).length,
    blocked: runningProducts.filter((p) => p.status === "archived" || p.noindex).length,
    productionExposed: runningProducts.filter(productionVisible).length,
    productionHidden: runningProducts.filter((p) => !productionVisible(p)).length,
  },
  runningShoes: {
    ...publicationShoes,
    future: shoeProducts.filter(
      (p) =>
        p.status === "scheduled" ||
        p.lifecycleStatus === "upcoming" ||
        (p.scheduledFor && new Date(p.scheduledFor).getTime() > AUDIT_NOW.getTime()),
    ).length,
    blocked: shoeProducts.filter((p) => p.status === "archived" || p.noindex).length,
    productionExposed: shoeProducts.filter(productionVisible).length,
    productionHidden: shoeProducts.filter((p) => !productionVisible(p)).length,
  },
};

// ── URL inventory (product URLs) ────────────────────────────────────────────
type UrlClass = "indexable" | "noindex" | "404" | "future_draft_protected" | "unknown";

function classifyProductUrl(p: Product): UrlClass {
  if (p.noindex) return "noindex";
  if (productionVisible(p)) return "indexable";
  if (p.status === "draft" || p.status === "review" || p.status === "scheduled") {
    return "future_draft_protected";
  }
  if (p.status === "archived") return "404";
  if (p.status === "published" && !p.publishedAt) return "404";
  if (
    p.status === "published" &&
    p.publishedAt &&
    new Date(p.publishedAt).getTime() > AUDIT_NOW.getTime()
  ) {
    return "future_draft_protected";
  }
  if (!isPubliclyVisible(p, PROD_OPTS)) return "404";
  return "unknown";
}

const productUrls = allProducts.map((p) => {
  const classification = classifyProductUrl(p);
  return {
    url: `/products/${p.slug}`,
    productId: p.id,
    status: p.status,
    noindex: Boolean(p.noindex),
    classification,
    productionExposed: productionVisible(p),
    sportIds: p.sportIds,
    categoryId: p.categoryId,
  };
});

const urlInventory = {
  totalGeneratedPublicProductUrls: productUrls.length,
  byClassification: {
    indexable: productUrls.filter((u) => u.classification === "indexable").length,
    noindex: productUrls.filter((u) => u.classification === "noindex").length,
    "404": productUrls.filter((u) => u.classification === "404").length,
    future_draft_protected: productUrls.filter((u) => u.classification === "future_draft_protected").length,
    unknown: productUrls.filter((u) => u.classification === "unknown").length,
  },
  notes: [
    "generateStaticParams uses getProducts() which applies production publication resolver + filters noindex — so only indexable/production-visible products are statically generated in production builds.",
    "Draft/scheduled/review products 404 via getProductBySlug in production (isPubliclyVisible).",
    "Preview route /preview/products/[slug] exists and is noindex.",
    `Audit clock fixed at ${AUDIT_NOW.toISOString()} for reproducibility.`,
  ],
  runningProductUrls: {
    total: productUrls.filter((u) => u.sportIds.includes(RUNNING_SPORT)).length,
    byClassification: {
      indexable: productUrls.filter(
        (u) => u.sportIds.includes(RUNNING_SPORT) && u.classification === "indexable",
      ).length,
      noindex: productUrls.filter(
        (u) => u.sportIds.includes(RUNNING_SPORT) && u.classification === "noindex",
      ).length,
      "404": productUrls.filter(
        (u) => u.sportIds.includes(RUNNING_SPORT) && u.classification === "404",
      ).length,
      future_draft_protected: productUrls.filter(
        (u) =>
          u.sportIds.includes(RUNNING_SPORT) &&
          u.classification === "future_draft_protected",
      ).length,
      unknown: productUrls.filter(
        (u) => u.sportIds.includes(RUNNING_SPORT) && u.classification === "unknown",
      ).length,
    },
  },
};

// ── Data completeness per running category ──────────────────────────────────
function completenessForCategory(categoryId: string) {
  const products = runningProducts.filter((p) => p.categoryId === categoryId);
  const n = products.length;
  const footwearOrApparel = FOOTWEAR_APPAREL_CATS.has(categoryId);
  let identity = 0;
  let specs = 0;
  let variant = 0;
  let media = 0;
  let offers = 0;
  let useCases = 0;
  let relationships = 0;

  for (const p of products) {
    if (identityComplete(p)) identity++;
    if (specsComplete(p)) specs++;
    if (variantComplete(p, variantsByProduct.get(p.id) ?? [], footwearOrApparel)) variant++;
    if (hasMedia(p)) media++;
    if (productHasOffer(p)) offers++;
    if ((p.useCaseIds?.length ?? 0) > 0) useCases++;
    if (relationshipsPresent(p)) relationships++;
  }

  return {
    categoryId,
    category: categoryById.get(categoryId)?.name ?? categoryId,
    productCount: n,
    identityComplete: { count: identity, pct: pct(identity, n) },
    specsComplete: { count: specs, pct: pct(specs, n) },
    variantComplete: {
      count: variant,
      pct: pct(variant, n),
      note: footwearOrApparel
        ? "Requires audience + size hint on variants"
        : "Non-footwear/apparel: treated as complete (variants optional)",
    },
    mediaComplete: {
      count: media,
      pct: pct(media, n),
      note: "Authentic primary product media via getPrimaryProductMedia (placeholders excluded)",
    },
    offersPresent: { count: offers, pct: pct(offers, n) },
    useCasesAssigned: { count: useCases, pct: pct(useCases, n) },
    relationshipsPresent: {
      count: relationships,
      pct: pct(relationships, n),
      note: "familyId OR relatedProductIds OR alternativeProductIds",
    },
  };
}

const dataCompleteness = runningCategories.map((c) => completenessForCategory(c.id));

// ── Final narrative buckets ─────────────────────────────────────────────────
const emptyRunningCategories = runningCategories.filter(
  (c) => runningProducts.filter((p) => p.categoryId === c.id).length === 0,
);

const partialSignals = dataCompleteness
  .filter((c) => c.productCount > 0)
  .map((c) => ({
    category: c.category,
    weakAreas: [
      c.identityComplete.pct < 100 ? `identity ${c.identityComplete.pct}%` : null,
      c.specsComplete.pct < 80 ? `specs ${c.specsComplete.pct}%` : null,
      c.variantComplete.pct < 80 ? `variants ${c.variantComplete.pct}%` : null,
      c.mediaComplete.pct < 80 ? `media ${c.mediaComplete.pct}%` : null,
      c.offersPresent.pct < 50 ? `offers ${c.offersPresent.pct}%` : null,
      c.useCasesAssigned.pct < 80 ? `useCases ${c.useCasesAssigned.pct}%` : null,
      c.relationshipsPresent.pct < 50 ? `relationships ${c.relationshipsPresent.pct}%` : null,
    ].filter(Boolean) as string[],
  }))
  .filter((c) => c.weakAreas.length > 0);

const cannotDetermine = [
  "Activities: repository getActivities() returns empty array; taxonomy activities file may be absent or empty — count reported from rawActivities import.",
  "Variant-specific media: ProductVariant has no media field in schema — cannot measure variant media completeness beyond structural absence.",
  "Whether disk hero files exist for every registered media path was not filesystem-verified in this inventory (uses in-memory media resolution only).",
  "External market coverage gaps intentionally not researched.",
  "Offer price freshness / retailer stock accuracy not verified against live retailer APIs.",
  `'Blocked' is inferred as archived OR noindex — there is no explicit blocked publication status in publishStatusSchema.`,
  `'Future' mixes scheduled publish status, upcoming lifecycle, and future scheduledFor — not a first-class status enum value.`,
];

const integrityConcerns = [
  ...(duplicateSlugs.length
    ? [`Duplicate product slugs: ${duplicateSlugs.length} collision group(s)`]
    : []),
  ...(duplicateFullNames.length
    ? [`Duplicate fullName values: ${duplicateFullNames.length} collision group(s)`]
    : []),
  ...(genderSplitPairs.length
    ? [`Possible men/women separate products: ${genderSplitPairs.length} pair(s)`]
    : []),
  ...(orphanVariants.length
    ? [`Orphan variants (productId missing): ${orphanVariants.length}`]
    : []),
  ...(shoesWithoutFamily.length
    ? [`Running shoes without familyId: ${shoesWithoutFamily.length}`]
    : []),
  ...(familyOrphanRefs.length
    ? [`Family.productIds referencing missing products: ${familyOrphanRefs.length}`]
    : []),
  ...(productsBadFamily.length
    ? [`Products with missing familyId target: ${productsBadFamily.length}`]
    : []),
  ...(generationConcerns.length
    ? [`Generation/lifecycle concerns: ${generationConcerns.length}`]
    : []),
  `Test fixture draft product present: prod-draft-example (noindex).`,
  `getProducts() filters noindex AND applies publication resolver — inventory below uses raw+enriched ALL products unless noted.`,
];

// ── Assemble JSON ───────────────────────────────────────────────────────────
const report = {
  meta: {
    auditId: "01-catalog-inventory",
    title: "Kitletics Pre-Launch Audit 01 — Complete Catalog Inventory",
    generatedAt: new Date().toISOString(),
    auditClock: AUDIT_NOW.toISOString(),
    mode: "read-only-forensic",
    baselineRule: "No catalog/content mutations during measurement",
    dataSources: [
      "src/content/products.ts (+ running/fitness/padel/racket waves)",
      "src/content/brands.ts",
      "src/content/families.ts",
      "src/content/offers.ts",
      "src/content/retailers.ts",
      "src/content/reviews.ts (+ waves)",
      "src/content/taxonomy/*",
      "applyProductSpecFill + applyRunningAudienceVariants + resolveRunningCatalogImages",
      "isPubliclyVisible production gate",
    ],
  },
  totals,
  sportSummary,
  runningDeepDive,
  runningShoesInventory: shoeInventory,
  otherRunningCategories: otherRunningInventories,
  extraRunningCategories,
  brandCoverageByCategory,
  variantCoverage,
  useCaseCoverageRunningShoes: {
    all: shoeUseCaseCoverage,
    sparseZeroToThree: shoeUseCasesWithZeroOneTwoThree,
  },
  productFamilyHealth: {
    duplicateSlugs,
    duplicateFullNames,
    possibleGenderSplitProducts,
    genderSplitPairs,
    generationConcerns,
    orphanVariants,
    shoesWithoutFamily,
    familyOrphanRefs,
    productsBadFamily,
  },
  publicationStatus: publicationExtended,
  urlInventory,
  dataCompletenessRunningCategories: dataCompleteness,
  finalSection: {
    whatExists: {
      sports: totals.sports,
      disciplines: totals.disciplines,
      activities: totals.activities,
      categories: totals.categories,
      subcategories: totals.subcategories,
      brands: totals.brands,
      productFamilies: totals.productFamilies,
      products: totals.products,
      productVariants: totals.productVariants,
      useCases: totals.useCases,
      offers: totals.offers,
      retailers: totals.retailers,
      reviews: totals.reviews,
      runningProducts: runningProducts.length,
      runningShoes: shoeProducts.length,
      runningCategoriesWithProducts: runningCategories.filter(
        (c) => runningProducts.some((p) => p.categoryId === c.id),
      ).length,
    },
    whatIsPartiallyPopulated: partialSignals,
    whatIsEmpty: {
      activitiesCount: totals.activities,
      emptyRunningCategories: emptyRunningCategories.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      missingExpectedOtherRunning: EXPECTED_OTHER_RUNNING.filter(
        (e) => otherRunningInventories[e.label]?.status === "MISSING",
      ).map((e) => e.label),
      useCasesWithZeroShoeProducts: shoeUseCaseCoverage
        .filter((u) => u.productCount === 0)
        .map((u) => u.name),
    },
    whatCannotBeDetermined: cannotDetermine,
    dataIntegrityConcerns: integrityConcerns,
  },
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(
  join(DATA_DIR, "01-catalog-inventory.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

// ── Markdown ────────────────────────────────────────────────────────────────
const lines: string[] = [];
const push = (...xs: string[]) => lines.push(...xs);

push(
  `# Kitletics Pre-Launch Audit 01 — Complete Catalog Inventory`,
  ``,
  `**Mode:** READ-ONLY forensic baseline`,
  `**Generated:** ${report.meta.generatedAt}`,
  `**Audit clock:** ${report.meta.auditClock}`,
  `**Machine-readable:** [\`data/01-catalog-inventory.json\`](./data/01-catalog-inventory.json)`,
  ``,
  `> This report measures the repository as-is. No website, catalog, or content mutations were made while measuring.`,
  ``,
  `---`,
  ``,
  `## 1. Actual repository totals`,
  ``,
  `| Entity | Count |`,
  `|---|---:|`,
  `| Sports | ${totals.sports} |`,
  `| Disciplines | ${totals.disciplines} |`,
  `| Activities | ${totals.activities} |`,
  `| Categories | ${totals.categories} |`,
  `| Subcategories | ${totals.subcategories} |`,
  `| Brands | ${totals.brands} |`,
  `| Product Families | ${totals.productFamilies} |`,
  `| Products | ${totals.products} |`,
  `| Product Variants | ${totals.productVariants} |`,
  `| Use Cases | ${totals.useCases} |`,
  `| Offers | ${totals.offers} |`,
  `| Retailers | ${totals.retailers} |`,
  `| Reviews (linked inventory) | ${totals.reviews} |`,
  ``,
  `Notes:`,
  `- Product counts include **all** statuses (draft/review/scheduled/published/archived), after spec-fill + running audience-variant enrichment.`,
  `- Variant counts include generated audience variants from \`applyRunningAudienceVariants\`.`,
  `- Activities: raw taxonomy count (repository \`getActivities()\` is documented as empty).`,
  ``,
  `---`,
  ``,
  `## 2. Sport summary`,
  ``,
  `| Sport | Disciplines | Categories | Products | Variants | Brands | Published | Draft | Scheduled | Unknown Status |`,
  `|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|`,
);

for (const s of sportSummary) {
  push(
    `| ${mdEscape(s.sport)} | ${s.disciplines} | ${s.categories} | ${s.products} | ${s.variants} | ${s.brands} | ${s.published} | ${s.draft} | ${s.scheduled} | ${s.unknownStatus} |`,
  );
}

push(
  ``,
  `Additional status fields (not in table header but present in data): review / archived are in JSON \`sportSummary\`.`,
  ``,
  `| Sport | Review | Archived | Available | Content status |`,
  `|---|---:|---:|---|---|`,
);
for (const s of sportSummary) {
  push(
    `| ${mdEscape(s.sport)} | ${s.review} | ${s.archived} | ${s.available} | ${s.contentStatus} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 3. Running deep dive (all actual categories)`,
  ``,
  `| Category | Subcategory | Products | Current | Previous Gen | Variants | Brands | Men | Women | Unisex | Unknown | Offers | Products With Offers | Products With Media |`,
  `|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|`,
);

for (const row of runningDeepDive) {
  push(
    `| ${mdEscape(row.category)} | ${mdEscape(row.subcategory)} | ${row.products} | ${row.currentProducts} | ${row.previousGeneration} | ${row.variants} | ${row.brands} | ${row.men} | ${row.women} | ${row.unisex} | ${row.unknownAudience} | ${row.offers} | ${row.productsWithOffers} | ${row.productsWithMedia} |`,
  );
}

push(
  ``,
  `Category-level rollups (products may appear in multiple subcategory rows if multi-tagged):`,
  ``,
);

const catRollup = runningCategories.map((cat) => {
  const products = runningProducts.filter((p) => p.categoryId === cat.id);
  return `| ${mdEscape(cat.name)} | ${products.length} | ${new Set(products.map((p) => p.brandId)).size} |`;
});
push(`| Category | Products (unique) | Brands |`, `|---|---:|---:|`, ...catRollup);

push(
  ``,
  `---`,
  ``,
  `## 4. Running shoes — complete inventory`,
  ``,
  `Total running shoe products: **${shoeInventory.length}**`,
  ``,
  `| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |`,
  `|---|---|---|---|---|---|---|---|---|---|---|---|`,
);

for (const row of shoeInventory) {
  push(
    `| ${mdEscape(row.brand)} | ${mdEscape(row.product)} | ${mdEscape(row.generation || "—")} | ${row.lifecycleStatus} | ${yesNo(row.men)} | ${yesNo(row.women)} | ${yesNo(row.unisex)} | ${mdEscape(row.useCases || "—")} | ${yesNo(row.review)} | ${yesNo(row.offers)} | ${yesNo(row.media)} | ${row.publicationStatus}${row.noindex ? " (noindex)" : ""}${row.productionExposed ? "" : " · not prod-exposed"} |`,
  );
}

push(``, `---`, ``, `## 5. Other running categories`, ``);

for (const expected of EXPECTED_OTHER_RUNNING) {
  const block = otherRunningInventories[expected.label];
  push(`### ${expected.label}`, ``);
  if (block.status === "MISSING") {
    push(`**MISSING** — no matching category in taxonomy.`, ``);
    continue;
  }
  push(
    `Category: \`${block.categoryId}\` (${block.categoryName}) — **${block.products.length}** products`,
    ``,
  );
  if (block.products.length === 0) {
    push(`_Category exists but has 0 running products._`, ``);
    continue;
  }
  push(
    `| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |`,
    `|---|---|---|---|---|---|---|---|---|---|---|---|`,
  );
  for (const row of block.products) {
    push(
      `| ${mdEscape(row.brand)} | ${mdEscape(row.product)} | ${mdEscape(row.generation || "—")} | ${row.lifecycleStatus} | ${yesNo(row.men)} | ${yesNo(row.women)} | ${yesNo(row.unisex)} | ${mdEscape(row.useCases || "—")} | ${yesNo(row.review)} | ${yesNo(row.offers)} | ${yesNo(row.media)} | ${row.publicationStatus}${row.noindex ? " (noindex)" : ""}${row.productionExposed ? "" : " · not prod-exposed"} |`,
    );
  }
  push(``);
}

if (extraRunningCategories.length) {
  push(`### Additional running categories (not in expected list above)`, ``);
  for (const extra of extraRunningCategories) {
    push(
      `#### ${extra.categoryName} (\`${extra.categoryId}\`) — ${extra.products.length} products`,
      ``,
    );
    if (!extra.products.length) {
      push(`_Empty._`, ``);
      continue;
    }
    push(
      `| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |`,
      `|---|---|---|---|---|---|---|---|---|---|---|---|`,
    );
    for (const row of extra.products) {
      push(
        `| ${mdEscape(row.brand)} | ${mdEscape(row.product)} | ${mdEscape(row.generation || "—")} | ${row.lifecycleStatus} | ${yesNo(row.men)} | ${yesNo(row.women)} | ${yesNo(row.unisex)} | ${mdEscape(row.useCases || "—")} | ${yesNo(row.review)} | ${yesNo(row.offers)} | ${yesNo(row.media)} | ${row.publicationStatus}${row.noindex ? " (noindex)" : ""}${row.productionExposed ? "" : " · not prod-exposed"} |`,
      );
    }
    push(``);
  }
}

push(`---`, ``, `## 6. Brand coverage (Running, per category)`, ``);

for (const cat of brandCoverageByCategory) {
  push(
    `### ${cat.category}`,
    ``,
    `Products: **${cat.productCount}** · Brands: **${cat.brandCount}**`,
    cat.categoryFlags.length
      ? `Category flags: ${cat.categoryFlags.map((f) => `\`${f}\``).join(", ")}`
      : `Category flags: none`,
    ``,
  );
  if (!cat.brands.length) {
    push(`_No products._`, ``);
    continue;
  }
  push(
    `| Brand | Product count | Current models | Previous generation | Flags |`,
    `|---|---:|---:|---:|---|`,
  );
  for (const b of cat.brands) {
    push(
      `| ${mdEscape(b.brand)} | ${b.productCount} | ${b.currentModels} | ${b.previousGeneration} | ${b.flags.length ? b.flags.join(", ") : "—"} |`,
    );
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 7. Variant coverage`,
  ``,
  `### Running shoes`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Products | ${variantCoverage.runningShoes.productCount} |`,
  `| Products with variants | ${variantCoverage.runningShoes.productsWithVariants} |`,
  `| With men variants | ${variantCoverage.runningShoes.productsWithMenVariants} |`,
  `| With women variants | ${variantCoverage.runningShoes.productsWithWomenVariants} |`,
  `| With unisex variants | ${variantCoverage.runningShoes.productsWithUnisexVariants} |`,
  `| Unknown (no variants) | ${variantCoverage.runningShoes.productsWithUnknownAudience} |`,
  `| Missing size data | ${variantCoverage.runningShoes.productsMissingSizeData} |`,
  `| Missing width data | ${variantCoverage.runningShoes.productsMissingWidthData} |`,
  `| Missing variant-specific weight | ${variantCoverage.runningShoes.productsMissingVariantWeight} |`,
  `| Missing variant media (structural) | ${variantCoverage.runningShoes.productsMissingVariantMedia} |`,
  `| Missing variant offers | ${variantCoverage.runningShoes.productsMissingVariantOffers} |`,
  ``,
  `_${variantCoverage.runningShoes.noteVariantMedia}_`,
  ``,
  `### Running clothing`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Products | ${variantCoverage.runningClothing.productCount} |`,
  `| Products with variants | ${variantCoverage.runningClothing.productsWithVariants} |`,
  `| With men variants | ${variantCoverage.runningClothing.productsWithMenVariants} |`,
  `| With women variants | ${variantCoverage.runningClothing.productsWithWomenVariants} |`,
  `| With unisex variants | ${variantCoverage.runningClothing.productsWithUnisexVariants} |`,
  `| Unknown (no variants) | ${variantCoverage.runningClothing.productsWithUnknownAudience} |`,
  `| Missing size data | ${variantCoverage.runningClothing.productsMissingSizeData} |`,
  `| Missing width data | ${variantCoverage.runningClothing.productsMissingWidthData} |`,
  `| Missing variant-specific weight | ${variantCoverage.runningClothing.productsMissingVariantWeight} |`,
  `| Missing variant offers | ${variantCoverage.runningClothing.productsMissingVariantOffers} |`,
  ``,
  `### All running products`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Products | ${variantCoverage.allRunning.productCount} |`,
  `| Products with variants | ${variantCoverage.allRunning.productsWithVariants} |`,
  `| With men variants | ${variantCoverage.allRunning.productsWithMenVariants} |`,
  `| With women variants | ${variantCoverage.allRunning.productsWithWomenVariants} |`,
  `| With unisex variants | ${variantCoverage.allRunning.productsWithUnisexVariants} |`,
  `| Unknown (no variants) | ${variantCoverage.allRunning.productsWithUnknownAudience} |`,
  `| Missing size data | ${variantCoverage.allRunning.productsMissingSizeData} |`,
  `| Missing width data | ${variantCoverage.allRunning.productsMissingWidthData} |`,
  `| Missing variant-specific weight | ${variantCoverage.allRunning.productsMissingVariantWeight} |`,
  `| Missing variant offers | ${variantCoverage.allRunning.productsMissingVariantOffers} |`,
  ``,
);

push(
  `---`,
  ``,
  `## 8. Use-case coverage (Running Shoes)`,
  ``,
  `| Use case | Group | Products | Sparse (0–3)? |`,
  `|---|---|---:|---|`,
);
for (const uc of shoeUseCaseCoverage) {
  push(
    `| ${mdEscape(uc.name)} | ${uc.group} | ${uc.productCount} | ${uc.sparse ? `YES (${uc.sparseLevel})` : "—"} |`,
  );
}

push(
  ``,
  `### Flagged use cases with 0 / 1 / 2 / 3 shoe products`,
  ``,
  `| Use case | Count |`,
  `|---|---:|`,
);
for (const uc of shoeUseCasesWithZeroOneTwoThree) {
  push(`| ${mdEscape(uc.name)} | ${uc.productCount} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 9. Product family health`,
  ``,
  `| Check | Count |`,
  `|---|---:|`,
  `| Duplicate slugs | ${duplicateSlugs.length} |`,
  `| Duplicate fullNames | ${duplicateFullNames.length} |`,
  `| Name patterns suggesting gender-split products | ${possibleGenderSplitProducts.length} |`,
  `| Paired men/women separate product candidates | ${genderSplitPairs.length} |`,
  `| Generation/lifecycle concerns | ${generationConcerns.length} |`,
  `| Orphan variants | ${orphanVariants.length} |`,
  `| Running shoes without familyId | ${shoesWithoutFamily.length} |`,
  `| Family.productIds → missing product | ${familyOrphanRefs.length} |`,
  `| Product.familyId → missing family | ${productsBadFamily.length} |`,
  ``,
);

if (duplicateSlugs.length) {
  push(`### Duplicate slugs`, ``);
  for (const d of duplicateSlugs) {
    push(`- \`${d.slug}\`: ${d.productIds.join(", ")}`);
  }
  push(``);
}
if (duplicateFullNames.length) {
  push(`### Duplicate fullNames`, ``);
  for (const d of duplicateFullNames) {
    push(`- ${mdEscape(d.fullName)}: ${d.productIds.join(", ")}`);
  }
  push(``);
}
if (genderSplitPairs.length) {
  push(`### Possible men/women as separate products`, ``);
  for (const p of genderSplitPairs) {
    push(`- ${mdEscape(p.note)} (\`${p.a}\` / \`${p.b}\`)`);
  }
  push(``);
}
if (shoesWithoutFamily.length) {
  push(`### Running shoes without ProductFamily`, ``);
  for (const p of shoesWithoutFamily) {
    push(`- ${mdEscape(p.fullName)} (\`${p.productId}\`)`);
  }
  push(``);
}
if (generationConcerns.length) {
  push(`### Generation concerns`, ``);
  for (const g of generationConcerns.slice(0, 50)) {
    push(`- ${mdEscape(g.fullName)} (\`${g.productId}\`): ${mdEscape(g.issue)}`);
  }
  if (generationConcerns.length > 50) {
    push(`- … ${generationConcerns.length - 50} more in JSON`);
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 10. Publication status`,
  ``,
  `### All products`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
  `| Published | ${publicationExtended.allProducts.published} |`,
  `| Draft | ${publicationExtended.allProducts.draft} |`,
  `| Scheduled | ${publicationExtended.allProducts.scheduled} |`,
  `| Review | ${publicationExtended.allProducts.review} |`,
  `| Archived | ${publicationExtended.allProducts.archived} |`,
  `| Unknown | ${publicationExtended.allProducts.unknown} |`,
  `| Future (inferred) | ${publicationExtended.allProducts.future} |`,
  `| Blocked (inferred: archived\\|noindex) | ${publicationExtended.allProducts.blocked} |`,
  `| Production-exposed (\`isPubliclyVisible\` + not noindex) | ${publicationExtended.allProducts.productionExposed} |`,
  `| Not production-exposed | ${publicationExtended.allProducts.productionHidden} |`,
  ``,
  `### Running products`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
  `| Published | ${publicationExtended.runningProducts.published} |`,
  `| Draft | ${publicationExtended.runningProducts.draft} |`,
  `| Scheduled | ${publicationExtended.runningProducts.scheduled} |`,
  `| Review | ${publicationExtended.runningProducts.review} |`,
  `| Archived | ${publicationExtended.runningProducts.archived} |`,
  `| Unknown | ${publicationExtended.runningProducts.unknown} |`,
  `| Future (inferred) | ${publicationExtended.runningProducts.future} |`,
  `| Blocked (inferred) | ${publicationExtended.runningProducts.blocked} |`,
  `| Production-exposed | ${publicationExtended.runningProducts.productionExposed} |`,
  `| Not production-exposed | ${publicationExtended.runningProducts.productionHidden} |`,
  ``,
  `### Running shoes`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
  `| Published | ${publicationExtended.runningShoes.published} |`,
  `| Draft | ${publicationExtended.runningShoes.draft} |`,
  `| Scheduled | ${publicationExtended.runningShoes.scheduled} |`,
  `| Review | ${publicationExtended.runningShoes.review} |`,
  `| Archived | ${publicationExtended.runningShoes.archived} |`,
  `| Unknown | ${publicationExtended.runningShoes.unknown} |`,
  `| Future (inferred) | ${publicationExtended.runningShoes.future} |`,
  `| Blocked (inferred) | ${publicationExtended.runningShoes.blocked} |`,
  `| Production-exposed | ${publicationExtended.runningShoes.productionExposed} |`,
  `| Not production-exposed | ${publicationExtended.runningShoes.productionHidden} |`,
  ``,
  `Production resolver: \`isPubliclyVisible\` in production requires \`status=published\` AND \`publishedAt <= now\`. Scheduled never leaks even if \`scheduledFor\` is past. \`getProducts()\` additionally excludes \`noindex\`.`,
  ``,
);

push(
  `---`,
  ``,
  `## 11. Raw URL inventory (product URLs)`,
  ``,
  `| Classification | Count |`,
  `|---|---:|`,
  `| Total product URLs | ${urlInventory.totalGeneratedPublicProductUrls} |`,
  `| Indexable | ${urlInventory.byClassification.indexable} |`,
  `| Noindex | ${urlInventory.byClassification.noindex} |`,
  `| 404 (prod resolver would not resolve) | ${urlInventory.byClassification["404"]} |`,
  `| Future/draft protected | ${urlInventory.byClassification.future_draft_protected} |`,
  `| Unknown | ${urlInventory.byClassification.unknown} |`,
  ``,
  `### Running-only product URLs`,
  ``,
  `| Classification | Count |`,
  `|---|---:|`,
  `| Total | ${urlInventory.runningProductUrls.total} |`,
  `| Indexable | ${urlInventory.runningProductUrls.byClassification.indexable} |`,
  `| Noindex | ${urlInventory.runningProductUrls.byClassification.noindex} |`,
  `| 404 | ${urlInventory.runningProductUrls.byClassification["404"]} |`,
  `| Future/draft protected | ${urlInventory.runningProductUrls.byClassification.future_draft_protected} |`,
  `| Unknown | ${urlInventory.runningProductUrls.byClassification.unknown} |`,
  ``,
);
for (const n of urlInventory.notes) {
  push(`- ${n}`);
}

push(
  ``,
  `---`,
  ``,
  `## 12. Data completeness summary (Running categories)`,
  ``,
  `| Category | Products | Identity % | Specs % | Variant % | Media % | Offers % | Use cases % | Relationships % |`,
  `|---|---:|---:|---:|---:|---:|---:|---:|---:|`,
);
for (const c of dataCompleteness) {
  push(
    `| ${mdEscape(c.category)} | ${c.productCount} | ${c.identityComplete.pct} | ${c.specsComplete.pct} | ${c.variantComplete.pct} | ${c.mediaComplete.pct} | ${c.offersPresent.pct} | ${c.useCasesAssigned.pct} | ${c.relationshipsPresent.pct} |`,
  );
}

push(
  ``,
  `Counts behind percentages (identity / specs / variant / media / offers / useCases / relationships):`,
  ``,
);
for (const c of dataCompleteness) {
  push(
    `- **${c.category}** (n=${c.productCount}): ${c.identityComplete.count}/${c.productCount}, ${c.specsComplete.count}/${c.productCount}, ${c.variantComplete.count}/${c.productCount}, ${c.mediaComplete.count}/${c.productCount}, ${c.offersPresent.count}/${c.productCount}, ${c.useCasesAssigned.count}/${c.productCount}, ${c.relationshipsPresent.count}/${c.productCount}`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 14. Final section`,
  ``,
  `### WHAT EXISTS`,
  ``,
  `| Item | Count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(report.finalSection.whatExists)) {
  push(`| ${k} | ${v} |`);
}

push(``, `### WHAT IS PARTIALLY POPULATED`, ``);
if (!partialSignals.length) {
  push(`_No category failed the partial-population thresholds used in this audit._`, ``);
} else {
  for (const p of partialSignals) {
    push(`- **${p.category}**: ${p.weakAreas.join("; ")}`);
  }
  push(``);
}

push(``, `### WHAT IS EMPTY`, ``);
push(`- Activities count: **${totals.activities}**`);
push(
  `- Empty running categories: ${
    emptyRunningCategories.length
      ? emptyRunningCategories.map((c) => c.name).join(", ")
      : "none"
  }`,
);
push(
  `- Missing expected other-running labels: ${
    report.finalSection.whatIsEmpty.missingExpectedOtherRunning.length
      ? report.finalSection.whatIsEmpty.missingExpectedOtherRunning.join(", ")
      : "none"
  }`,
);
push(
  `- Running-shoe use cases with 0 products: **${report.finalSection.whatIsEmpty.useCasesWithZeroShoeProducts.length}** (full list in JSON / §8)`,
);
push(``);

push(`### WHAT CANNOT BE DETERMINED`, ``);
for (const item of cannotDetermine) {
  push(`- ${item}`);
}
push(``);

push(`### DATA INTEGRITY CONCERNS`, ``);
for (const item of integrityConcerns) {
  push(`- ${item}`);
}
push(
  ``,
  `---`,
  ``,
  `## End of baseline`,
  ``,
  `No fixes recommended in this document. This is measurement only.`,
  ``,
);

writeFileSync(join(OUT_DIR, "01-catalog-inventory.md"), lines.join("\n"), "utf8");

console.log("Wrote", join(OUT_DIR, "01-catalog-inventory.md"));
console.log("Wrote", join(DATA_DIR, "01-catalog-inventory.json"));
console.log(
  JSON.stringify(
    {
      totals,
      runningProducts: runningProducts.length,
      runningShoes: shoeProducts.length,
      productionExposed: publicationExtended.allProducts.productionExposed,
      urlIndexable: urlInventory.byClassification.indexable,
    },
    null,
    2,
  ),
);
