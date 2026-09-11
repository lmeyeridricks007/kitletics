/**
 * READ-ONLY pre-launch audit 02 — Product quality & depth.
 * Does not mutate catalog/content.
 *
 * tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-02-product-quality.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { brands as rawBrands } from "@/content/brands";
import { productFamilies as rawFamilies } from "@/content/families";
import { evidence as rawEvidence } from "@/content/evidence";
import { products as rawProducts } from "@/content/products";
import { reviews as rawReviews } from "@/content/reviews";
import { applyRunningAudienceVariants } from "@/content/running/audience-variants";
import { applyProductSpecFill } from "@/content/specs/product-spec-fill";
import { allSpecificationDefinitions } from "@/content/specs/definitions";
import { categories as rawCategories } from "@/content/taxonomy/categories";
import { getPublishRequirement } from "@/domain/catalog/publishability";
import type { Product, ProductVariant } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import {
  assessProductLaunchQuality,
} from "@/domain/launch";
import type { ProductLaunchQuality } from "@/domain/launch";
import {
  getAllProductRelationships,
  getAlternativesFromGraph,
  getDirectCompetitors,
} from "@/repositories/relationships";
import { getComparisons } from "@/repositories/editorial";
import { getOffers } from "@/repositories/commerce";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { resolveRunningCatalogImages } from "@/content/running/media";
import { getProductPageCategoryConfig } from "@/lib/product/category-config";

const rawOffers = getOffers();

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const DEV = { isDev: true as const, now: AUDIT_NOW, region: "NL" as const };
const RUNNING = "sport-running";
const SHOE_CAT = "cat-running-shoes";

export type QualityClass = ProductLaunchQuality;

const LEAK_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "Prompt", re: /\bPrompt\b/ },
  { id: "Agent", re: /\bAgent\b/ },
  { id: "AI synthesis", re: /\bAI synthesis\b/i },
  { id: "catalog pass", re: /\bcatalog pass\b/i },
  { id: "confidence", re: /\bconfidence\b/i },
  { id: "candidate", re: /\bcandidate\b/i },
  { id: "staging", re: /\bstaging\b/i },
  { id: "LLM", re: /\bLLM\b/ },
  { id: "internal IDs", re: /\b(prod-|brand-|cat-|uc-|ev-|offer-|fam-)[a-z0-9-]+\b/i },
];

const GENERIC_PHRASES = [
  "great option for runners",
  "depending on your needs",
  "versatile choice",
  "solid all-rounder",
  "whether you're a beginner or advanced",
  "in today's market",
  "it is worth noting",
  "at the end of the day",
  "this shoe offers",
  "this product offers",
  "perfect for those looking",
];

const SHOE_SPEC_KEYS = [
  "weight",
  "heelStack",
  "forefootStack",
  "drop",
  "cushionLevel",
  "stability",
  "plate",
  "plateMaterial",
  "terrain",
  "widthOptions",
  "widths",
  "outsole",
  "midsole",
  "upper",
] as const;

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function present(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function specPresent(p: Product, key: string): boolean {
  const v = p.specifications[key];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function normalizeTemplateText(text: string, stripTokens: string[]): string {
  let t = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (const tok of stripTokens) {
    if (!tok) continue;
    t = t.split(tok.toLowerCase()).join(" ");
  }
  t = t.replace(/\b\d+(\.\d+)?\b/g, "#");
  t = t.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

// ── Load enriched catalog (same pipeline as inventory) ──────────────────────
const filled = applyProductSpecFill(rawProducts);
const { products: withAudience, variants: audienceVariants } =
  applyRunningAudienceVariants(filled);
const allProducts = resolveRunningCatalogImages(withAudience);

const brandById = new Map(rawBrands.map((b) => [b.id, b]));
const familyById = new Map(rawFamilies.map((f) => [f.id, f]));
const categoryById = new Map(rawCategories.map((c) => [c.id, c]));
const evidenceById = new Map(rawEvidence.map((e) => [e.id, e]));
const variantsByProduct = new Map<string, ProductVariant[]>();
for (const v of audienceVariants) {
  const list = variantsByProduct.get(v.productId) ?? [];
  list.push(v);
  variantsByProduct.set(v.productId, list);
}

const reviewsByProductId = new Map<string, Review[]>();
for (const r of rawReviews) {
  const list = reviewsByProductId.get(r.productId) ?? [];
  list.push(r);
  reviewsByProductId.set(r.productId, list);
}
const reviewById = new Map(rawReviews.map((r) => [r.id, r]));

const offersByProduct = new Map<string, typeof rawOffers>();
for (const o of rawOffers) {
  const list = offersByProduct.get(o.productId) ?? [];
  list.push(o);
  offersByProduct.set(o.productId, list);
}

const allRels = getAllProductRelationships();
const comparisonsAll = getComparisons({ isDev: true }); // include drafts for coverage

const mediaSrcCounts = new Map<string, string[]>();
for (const p of allProducts) {
  for (const img of p.images) {
    if (!img.src) continue;
    const list = mediaSrcCounts.get(img.src) ?? [];
    list.push(p.id);
    mediaSrcCounts.set(img.src, list);
  }
}

type DimStatus = "present" | "weak" | "missing" | "n/a" | "broken";

interface ProductQuality {
  productId: string;
  slug: string;
  fullName: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  sportIds: string[];
  isRunning: boolean;
  lifecycleStatus: string;
  publicationStatus: string;
  productionExposed: boolean;
  route: string;
  classification: QualityClass;
  classificationReasons: string[];
  decisionScore: number;
  decisionFlags: Record<string, boolean>;
  /** Legacy page-assembled flags — diagnostic only; not used for classification. */
  forensicDecisionFlags?: Record<string, boolean>;
  dimensions: Record<string, { status: DimStatus; notes: string[] }>;
  weakAreas: string[];
  reviewStatus:
    | "full_review"
    | "summary_only"
    | "no_review"
    | "review_unlinked_from_product_field"
    | "broken_review_link"
    | "draft_review";
  mediaClass:
    | "real_correct"
    | "missing"
    | "placeholder"
    | "suspected_wrong_generation"
    | "low_quality"
    | "duplicate"
    | "unknown_provenance";
  evidenceClass:
    | "none"
    | "manufacturer_only"
    | "has_independent"
    | "has_editorial"
    | "has_personal_test"
    | "mixed";
  offers: boolean;
  offerCount: number;
  variantIssues: string[];
  evidenceIssues: string[];
  seoIssues: string[];
  pageAssembled: boolean;
  pageSignals?: {
    bestForCount: number;
    notIdealCount: number;
    featuredSpecCount: number;
    altCount: number;
    comparisonCount: number;
    guideCount: number;
    evidenceCount: number;
    hasScore: boolean;
    hasVerdict: boolean;
    hasJsonLdSignals: boolean;
  };
}

function classifyReview(p: Product): ProductQuality["reviewStatus"] {
  if (p.reviewId && !reviewById.has(p.reviewId)) return "broken_review_link";
  const linked = p.reviewId ? reviewById.get(p.reviewId) : undefined;
  const byProduct = reviewsByProductId.get(p.id) ?? [];
  const review = linked ?? byProduct[0];
  if (!review) return "no_review";
  if (!p.reviewId && byProduct.length > 0) return "review_unlinked_from_product_field";
  if (review.status !== "published") return "draft_review";
  const sections = review.sections?.length ?? 0;
  const hasBuyAvoid =
    (review.whoShouldBuy?.length ?? 0) >= 2 &&
    (review.whoShouldAvoid?.length ?? 0) >= 2;
  const hasVerdict = Boolean(review.verdict?.trim() || review.bottomLine?.trim());
  if (sections >= 4 && hasBuyAvoid && hasVerdict) return "full_review";
  return "summary_only";
}

function mediaClassFor(p: Product): ProductQuality["mediaClass"] {
  const primary = getPrimaryProductMedia(p);
  if (!primary) {
    const any = p.images[0];
    if (!any?.src) return "missing";
    if (
      any.src.includes("/fallbacks/") ||
      any.src.endsWith(".svg") ||
      any.licence === "kitletics-owned"
    ) {
      return "placeholder";
    }
    return "missing";
  }
  // generation mismatch heuristic
  const genMatch = (p.generation ?? "").match(/(\d+)/);
  const srcAlt = `${primary.src} ${primary.alt ?? ""}`.toLowerCase();
  if (genMatch) {
    const g = genMatch[1];
    // if src contains a different model number than product generation
    const srcNums = [...srcAlt.matchAll(/(?:^|[^0-9])(\d{1,2})(?:[^0-9]|$)/g)].map(
      (m) => m[1],
    );
    if (
      g &&
      srcNums.some((n) => n !== g && Number(n) >= 2 && Math.abs(Number(n) - Number(g)) === 1)
    ) {
      // weak signal only when alt mentions sibling generation explicitly with model family
      if (new RegExp(`\\b${Number(g) - 1}\\b`).test(srcAlt) || new RegExp(`\\b${Number(g) + 1}\\b`).test(srcAlt)) {
        const brand = brandById.get(p.brandId)?.name?.toLowerCase() ?? "";
        if (brand && srcAlt.includes(brand.split(" ")[0])) {
          return "suspected_wrong_generation";
        }
      }
    }
  }
  const dup = mediaSrcCounts.get(primary.src) ?? [];
  if (dup.length > 3) return "duplicate";
  if (!primary.sourceUrl && !primary.licence && !primary.source) {
    return "unknown_provenance";
  }
  if (
    primary.width &&
    primary.height &&
    primary.width < 400 &&
    primary.height < 400
  ) {
    return "low_quality";
  }
  if (isAuthenticProductMedia(primary)) return "real_correct";
  return "placeholder";
}

function evidenceClassFor(ids: string[]): ProductQuality["evidenceClass"] {
  const items = ids.map((id) => evidenceById.get(id)).filter(Boolean) as Evidence[];
  if (!items.length) return "none";
  const types = new Set(items.map((e) => e.type));
  if (types.has("personal-test")) return "has_personal_test";
  if (types.has("independent-review") || types.has("lab-test")) {
    if (types.size === 1) return "has_independent";
    return "mixed";
  }
  if (types.has("editorial-research") && !types.has("manufacturer")) {
    return "has_editorial";
  }
  if (types.size === 1 && types.has("manufacturer")) return "manufacturer_only";
  if (types.has("editorial-research")) return "has_editorial";
  return "mixed";
}

function variantIssuesFor(p: Product, variants: ProductVariant[]): string[] {
  const issues: string[] = [];
  const footwear =
    /shoe|sock|clothing|vest|pack|belt|hydrat/i.test(p.categoryId) ||
    /shoe|sock|clothing|vest|pack|belt|hydrat/i.test(
      categoryById.get(p.categoryId)?.slug ?? "",
    );

  if (!footwear) return issues;

  if (!variants.length) {
    issues.push("no_variants");
    return issues;
  }

  const audiences = new Set(variants.map((v) => v.audience));
  if (p.categoryId === SHOE_CAT) {
    const isUnisexOnly = audiences.size === 1 && audiences.has("unisex");
    if (!isUnisexOnly && !(audiences.has("men") && audiences.has("women"))) {
      if (!audiences.has("men")) issues.push("missing_men_variant");
      if (!audiences.has("women")) issues.push("missing_women_variant");
    }
  }

  for (const v of variants) {
    if (!v.sizeRangeLabel && !v.referenceSizeLabel && !v.attributes?.size) {
      issues.push(`missing_size:${v.audience}`);
    }
    if (p.categoryId === SHOE_CAT && !(v.widthOptions?.length || v.attributes?.width)) {
      issues.push(`missing_width:${v.audience}`);
    }
    if (
      v.audience === "women" &&
      typeof v.referenceWeightG === "number" &&
      variants.some(
        (m) =>
          m.audience === "men" &&
          m.referenceWeightG === v.referenceWeightG &&
          m.referenceWeightG != null,
      )
    ) {
      issues.push("contextless_or_copied_weight_women_equals_men");
    }
    if (
      typeof v.referenceWeightG === "number" &&
      !v.referenceSizeLabel &&
      !v.weightVerified
    ) {
      issues.push(`contextless_weight:${v.audience}`);
    }
    if ((v.offerIds?.length ?? 0) > 0) {
      for (const oid of v.offerIds ?? []) {
        const offer = rawOffers.find((o) => o.id === oid);
        if (!offer) issues.push(`variant_offer_missing:${oid}`);
        else if (offer.productId !== p.id) {
          issues.push(`variant_offer_product_mismatch:${oid}`);
        } else if (offer.variantId && offer.variantId !== v.id) {
          issues.push(`variant_offer_id_mismatch:${oid}`);
        }
      }
    }
  }

  // Product-level weight without audience context on footwear
  if (
    p.categoryId === SHOE_CAT &&
    specPresent(p, "weight") &&
    !variants.some((v) => v.referenceWeightG && v.referenceSizeLabel)
  ) {
    issues.push("product_weight_without_variant_reference_size");
  }

  return [...new Set(issues)];
}

function evaluateProduct(p: Product): ProductQuality {
  const brand = brandById.get(p.brandId);
  const category = categoryById.get(p.categoryId);
  const family = p.familyId ? familyById.get(p.familyId) : undefined;
  const variants = variantsByProduct.get(p.id) ?? [];
  const productionExposed = isPubliclyVisible(p, PROD) && !p.noindex;
  const route = `/products/${p.slug}`;

  // Assemble page as rendered (dev gate so drafts still assemble)
  const page = getProductPageData(p.slug, DEV);
  const pageAssembled = Boolean(page);

  const reviewStatus = classifyReview(p);
  const mediaClass = mediaClassFor(p);
  const evidenceClass = evidenceClassFor(p.evidenceIds ?? []);
  const evidenceItems = (p.evidenceIds ?? [])
    .map((id) => evidenceById.get(id))
    .filter(Boolean) as Evidence[];

  const offerList = offersByProduct.get(p.id) ?? [];
  const offerCount = new Set([
    ...offerList.map((o) => o.id),
    ...(p.offerIds ?? []).filter((id) => rawOffers.some((o) => o.id === id)),
  ]).size;
  const hasOffers = offerCount > 0;

  const alts = getAlternativesFromGraph(p.id);
  const comps = comparisonsAll.filter((c) => c.productIds.includes(p.id));

  const bestFor = page?.bestFor ?? p.strengths ?? [];
  const notIdeal = page?.notIdealFor ?? p.weaknesses ?? [];
  const hasAnalysis =
    Boolean(p.verdict?.trim()) ||
    Boolean(page?.showScore) ||
    (page?.scoreExplainFactors.length ?? 0) > 0 ||
    reviewStatus === "full_review" ||
    reviewStatus === "summary_only";

  const dims: ProductQuality["dimensions"] = {};

  const setDim = (
    key: string,
    status: DimStatus,
    ...notes: string[]
  ) => {
    dims[key] = { status, notes: notes.filter(Boolean) };
  };

  // identity
  if (p.id && p.slug && p.name && p.fullName) {
    setDim("identity", "present");
  } else {
    setDim("identity", "missing", "missing id/slug/name");
  }

  // brand
  if (!p.brandId) setDim("brand", "missing");
  else if (!brand) setDim("brand", "broken", `brandId ${p.brandId} not found`);
  else setDim("brand", "present", brand.name);

  // family
  if (!p.familyId) {
    setDim(
      "family",
      p.categoryId === SHOE_CAT ? "missing" : "weak",
      "no familyId",
    );
  } else if (!family) setDim("family", "broken", `familyId ${p.familyId} missing`);
  else setDim("family", "present", family.name);

  // generation
  if (present(p.generation) || p.lifecycleStatus) {
    setDim(
      "generation",
      present(p.generation) ? "present" : "weak",
      `lifecycle=${p.lifecycleStatus}`,
      p.generation ? `generation=${p.generation}` : "generation string empty",
    );
  } else setDim("generation", "missing");

  // description
  const descLen = (p.shortDescription ?? "").trim().length;
  if (descLen >= 80) setDim("description", "present", `${descLen} chars`);
  else if (descLen >= 20) setDim("description", "weak", `${descLen} chars`);
  else setDim("description", "missing");

  // positioning (verdict / score / use-case placement)
  if (p.verdict && p.verdict.trim().length >= 40) {
    setDim("positioning", "present");
  } else if (p.recommendationScore != null || (p.useCaseIds?.length ?? 0) > 0) {
    setDim("positioning", "weak", "score/use-cases without verdict");
  } else setDim("positioning", "missing");

  // real media
  if (mediaClass === "real_correct") setDim("real_media", "present", mediaClass);
  else if (mediaClass === "unknown_provenance" || mediaClass === "duplicate") {
    setDim("real_media", "weak", mediaClass);
  } else if (mediaClass === "placeholder" || mediaClass === "low_quality") {
    setDim("real_media", "weak", mediaClass);
  } else if (mediaClass === "suspected_wrong_generation") {
    setDim("real_media", "weak", mediaClass);
  } else setDim("real_media", "missing", mediaClass);

  // specifications
  const req = getPublishRequirement(p.categoryId);
  const defs = allSpecificationDefinitions.filter((d) => d.categoryId === p.categoryId);
  const filledKeys = Object.keys(p.specifications).filter((k) =>
    specPresent(p, k),
  );
  if (req) {
    const missingReq = req.requiredSpecKeys.filter((k) => !specPresent(p, k));
    if (missingReq.length === 0 && filledKeys.length >= req.requiredSpecKeys.length) {
      setDim("specifications", "present", `${filledKeys.length} keys`);
    } else if (filledKeys.length > 0) {
      setDim("specifications", "weak", `missing required: ${missingReq.join(", ")}`);
    } else setDim("specifications", "missing");
  } else if (defs.length === 0) {
    setDim(
      "specifications",
      filledKeys.length ? "present" : "weak",
      "no category spec definitions",
    );
  } else {
    const ratio = filledKeys.length / defs.length;
    if (ratio >= 0.5) setDim("specifications", "present", `${pct(filledKeys.length, defs.length)}% defs`);
    else if (filledKeys.length) setDim("specifications", "weak", `${pct(filledKeys.length, defs.length)}% defs`);
    else setDim("specifications", "missing");
  }

  // variant data
  const vIssues = variantIssuesFor(p, variants);
  if (
    /shoe|clothing|sock|vest|pack|belt|hydrat/i.test(category?.slug ?? p.categoryId)
  ) {
    if (!variants.length) setDim("variant_data", "missing", "no variants");
    else if (vIssues.length === 0) setDim("variant_data", "present", `${variants.length} variants`);
    else if (vIssues.every((i) => i.startsWith("missing_width"))) {
      setDim("variant_data", "weak", ...vIssues.slice(0, 4));
    } else setDim("variant_data", "weak", ...vIssues.slice(0, 6));
  } else {
    setDim(
      "variant_data",
      variants.length ? "present" : "n/a",
      variants.length ? `${variants.length} variants` : "not required for category",
    );
  }

  // use cases
  if ((p.useCaseIds?.length ?? 0) >= 2) setDim("use_cases", "present", `${p.useCaseIds.length}`);
  else if ((p.useCaseIds?.length ?? 0) === 1) setDim("use_cases", "weak", "only 1");
  else setDim("use_cases", "missing");

  // Best For / Not Ideal
  if (bestFor.length >= 2) setDim("best_for", "present", `${bestFor.length} signals`);
  else if (bestFor.length === 1) setDim("best_for", "weak");
  else setDim("best_for", "missing");

  if (notIdeal.length >= 2) setDim("not_ideal_for", "present", `${notIdeal.length} signals`);
  else if (notIdeal.length === 1) setDim("not_ideal_for", "weak");
  else setDim("not_ideal_for", "missing");

  // Pros / Trade-offs (strengths / weaknesses)
  if ((p.strengths?.length ?? 0) >= 2) setDim("pros", "present");
  else if ((p.strengths?.length ?? 0) === 1) setDim("pros", "weak");
  else setDim("pros", "missing");

  if ((p.weaknesses?.length ?? 0) >= 2) setDim("tradeoffs", "present");
  else if ((p.weaknesses?.length ?? 0) === 1) setDim("tradeoffs", "weak");
  else setDim("tradeoffs", "missing");

  // Kitletics analysis
  if (hasAnalysis && (page?.scoreExplainFactors.length ?? 0) >= 2) {
    setDim("kitletics_analysis", "present");
  } else if (hasAnalysis) setDim("kitletics_analysis", "weak", "score/verdict/review without rich factors");
  else setDim("kitletics_analysis", "missing");

  // Review
  if (reviewStatus === "full_review") setDim("review", "present");
  else if (reviewStatus === "summary_only" || reviewStatus === "draft_review") {
    setDim("review", "weak", reviewStatus);
  } else if (reviewStatus === "broken_review_link") setDim("review", "broken", reviewStatus);
  else if (reviewStatus === "review_unlinked_from_product_field") {
    setDim("review", "weak", reviewStatus);
  } else setDim("review", "missing");

  // evidence
  if (evidenceClass === "none") setDim("evidence", "missing");
  else if (evidenceClass === "manufacturer_only") {
    setDim("evidence", "weak", "manufacturer-only");
  } else setDim("evidence", "present", evidenceClass, `${evidenceItems.length} items`);

  // alternatives
  if (alts.length >= 2 || (p.alternativeProductIds?.length ?? 0) >= 2) {
    setDim("alternatives", "present", `${alts.length} graph / ${(p.alternativeProductIds ?? []).length} field`);
  } else if (alts.length === 1 || (p.alternativeProductIds?.length ?? 0) === 1) {
    setDim("alternatives", "weak");
  } else setDim("alternatives", "missing");

  // comparisons
  if (comps.length >= 1) setDim("comparisons", "present", `${comps.length}`);
  else setDim("comparisons", "missing");

  // related guides
  const guideCount =
    (page?.bestGuides.length ?? 0) + (page?.buyingGuides.length ?? 0);
  if (guideCount >= 1) setDim("related_guides", "present", `${guideCount}`);
  else setDim("related_guides", "missing");

  // offers
  if (hasOffers) setDim("offers", "present", `${offerCount}`);
  else setDim("offers", "missing");

  // SEO
  const seoIssues: string[] = [];
  if (!p.seoTitle) seoIssues.push("missing_seoTitle");
  if (!p.seoDescription) seoIssues.push("missing_seoDescription");
  if (p.noindex) seoIssues.push("noindex");
  if (seoIssues.length === 0) setDim("seo_metadata", "present");
  else if (seoIssues.includes("noindex")) setDim("seo_metadata", "broken", ...seoIssues);
  else setDim("seo_metadata", "weak", ...seoIssues);

  // structured data — page emits productJsonLd when rendered; signal = identity + offers/review capability
  if (pageAssembled && brand && (hasOffers || reviewStatus !== "no_review")) {
    setDim("structured_data", "present", "PDP emits Product/Breadcrumb JSON-LD");
  } else if (pageAssembled) {
    setDim("structured_data", "weak", "page assembles but thin Offer/Review inputs");
  } else setDim("structured_data", "missing", "page did not assemble");

  // weak areas list
  const weakAreas: string[] = [];
  for (const [k, v] of Object.entries(dims)) {
    if (v.status === "missing" || v.status === "broken" || v.status === "weak") {
      weakAreas.push(`${k}:${v.status}`);
    }
  }

  const evidenceIssues: string[] = [];
  if (evidenceClass === "none") evidenceIssues.push("no_evidence");
  if (evidenceClass === "manufacturer_only") evidenceIssues.push("manufacturer_only");
  for (const id of p.evidenceIds ?? []) {
    if (!evidenceById.has(id)) evidenceIssues.push(`broken_evidence_id:${id}`);
  }
  if ((p.strengths?.length ?? 0) > 0 && evidenceItems.length === 0) {
    evidenceIssues.push("strengths_without_evidence");
  }

  // Diagnostic-only legacy flags (page-assembled). Classification uses domain SoT.
  const forensicDecisionFlags = {
    whatIsThis: Boolean(p.fullName && descLen >= 20 && brand),
    whoFor: bestFor.length >= 1 || (p.useCaseIds?.length ?? 0) >= 1,
    whoAvoid: notIdeal.length >= 1,
    doesWell: (p.strengths?.length ?? 0) >= 1 || bestFor.length >= 1,
    weaknesses: (p.weaknesses?.length ?? 0) >= 1 || notIdeal.length >= 1,
    howDiffers:
      Boolean(p.verdict?.trim()) ||
      alts.length >= 1 ||
      comps.length >= 1 ||
      (page?.scoreExplainFactors.length ?? 0) >= 1,
    alternatives: alts.length >= 1 || (p.alternativeProductIds?.length ?? 0) >= 1,
    canCompare: comps.length >= 1 || alts.length >= 2,
    canBuy:
      hasOffers &&
      p.lifecycleStatus !== "discontinued" &&
      p.lifecycleStatus !== "upcoming",
    evidenceSupports: evidenceItems.length > 0,
  };

  // Classification — canonical domain assessor (Fix 34)
  const domainAssessed = assessProductLaunchQuality(p, PROD);
  const classification = domainAssessed.quality;
  const classificationReasons = [
    ...domainAssessed.reasons,
    "assessor=domain/assessProductLaunchQuality",
  ];
  const decisionFlags = domainAssessed.decisionFlags;
  const decisionScore = domainAssessed.decisionScore;

  return {
    productId: p.id,
    slug: p.slug,
    fullName: p.fullName,
    brandId: p.brandId,
    brandName: brand?.name ?? p.brandId,
    categoryId: p.categoryId,
    categoryName: category?.name ?? p.categoryId,
    sportIds: p.sportIds,
    isRunning: p.sportIds.includes(RUNNING),
    lifecycleStatus: p.lifecycleStatus,
    publicationStatus: p.status,
    productionExposed,
    route,
    classification,
    classificationReasons,
    decisionScore,
    decisionFlags,
    forensicDecisionFlags,
    dimensions: dims,
    weakAreas,
    reviewStatus,
    mediaClass,
    evidenceClass,
    offers: hasOffers,
    offerCount,
    variantIssues: vIssues,
    evidenceIssues,
    seoIssues,
    pageAssembled,
    pageSignals: page
      ? {
          bestForCount: page.bestFor.length,
          notIdealCount: page.notIdealFor.length,
          featuredSpecCount: page.featuredSpecs.length,
          altCount: page.alternatives.length,
          comparisonCount: page.comparisons.length,
          guideCount: page.bestGuides.length + page.buyingGuides.length,
          evidenceCount: page.evidence.length,
          hasScore: page.showScore,
          hasVerdict: Boolean(page.verdict),
          hasJsonLdSignals: true,
        }
      : undefined,
  };
}

console.log("Evaluating products...");
const results: ProductQuality[] = [];
for (const p of allProducts) {
  results.push(evaluateProduct(p));
}
console.log(`Evaluated ${results.length} products`);

const running = results.filter((r) => r.isRunning);
const shoes = running.filter((r) => r.categoryId === SHOE_CAT);

// ── Classification rules documentation ──────────────────────────────────────
const classificationRules = {
  sourceOfTruth:
    "src/domain/launch/assess-product-quality.ts → assessProductLaunchQuality (Fix 34)",
  overlay:
    "Eligibility may force PUBLIC_NOINDEX for soft-gated categories without redefining quality",
  forensicNote:
    "Dimensional diagnostics (weakAreas, reviewStatus, pageSignals) remain forensic-local and do not set LAUNCH_READY",
  LAUNCH_READY: [
    "productionExposed (published + publishedAt <= now + not noindex)",
    "authentic primary media",
    `shortDescription >= ${40} chars (whatIsThis) OR verdict`,
    "strengths >= 2, weaknesses >= 1",
    "evidenceIds >= 1 OR published review",
    "canPublishProduct.ok",
    "decisionScore >= 80 (10 pts × 10 decision flags)",
  ],
  NEEDS_MINOR_WORK: [
    "productionExposed",
    "decisionScore >= 50",
    "media present",
    "at least one strength or weakness",
    "OR readyCore gaps (thin description, publish fail, missing decision flags)",
  ],
  THIN: [
    "Basics present but decisionScore typically 30–69",
    "OR incomplete positioning while page still partially answers questions",
  ],
  INCOMPLETE: [
    "missing authentic media OR description < 20 chars with other major gaps",
    "OR decisionScore very low with incomplete core dims",
  ],
  BLOCKED: [
    "not productionExposed (draft/review/scheduled/archived or future publishedAt)",
    "OR noindex",
    "OR archived",
    "OR brand missing",
  ],
  decisionQuestions: [
    "What is this?",
    "Who is it for?",
    "Who should avoid it?",
    "What does it do well?",
    "What are its weaknesses?",
    "How does it differ?",
    "What are alternatives?",
    "Can I compare it?",
    "Can I buy it?",
    "What evidence supports the assessment?",
  ],
  decisionScore:
    "10 points per answered decision question (max 100). Domain flags — not page-assembled forensic flags.",
};

// ── Running summary by category ─────────────────────────────────────────────
const runningCats = rawCategories
  .filter((c) => c.sportIds.includes(RUNNING))
  .sort((a, b) => a.sortOrder - b.sortOrder);

const runningSummary = runningCats.map((cat) => {
  const items = running.filter((r) => r.categoryId === cat.id);
  const counts = {
    LAUNCH_READY: items.filter((i) => i.classification === "LAUNCH_READY").length,
    NEEDS_MINOR_WORK: items.filter((i) => i.classification === "NEEDS_MINOR_WORK").length,
    THIN: items.filter((i) => i.classification === "THIN").length,
    INCOMPLETE: items.filter((i) => i.classification === "INCOMPLETE").length,
    BLOCKED: items.filter((i) => i.classification === "BLOCKED").length,
  };
  return {
    categoryId: cat.id,
    category: cat.name,
    products: items.length,
    ...counts,
    readyPct: pct(counts.LAUNCH_READY, items.length),
  };
});

// ── Shoes not launch ready ──────────────────────────────────────────────────
const shoesNotReady = shoes
  .filter((s) => s.classification !== "LAUNCH_READY")
  .sort((a, b) => a.brandName.localeCompare(b.brandName) || a.fullName.localeCompare(b.fullName))
  .map((s) => ({
    product: s.fullName,
    productId: s.productId,
    brand: s.brandName,
    status: s.classification,
    publicationStatus: s.publicationStatus,
    lifecycleStatus: s.lifecycleStatus,
    missingWeakAreas: s.weakAreas.join("; "),
    reviewStatus: s.reviewStatus,
    media: s.mediaClass,
    offers: s.offers,
    variantIssue: s.variantIssues.join("; ") || "—",
    evidenceIssue: s.evidenceIssues.join("; ") || "—",
    seoIssue: s.seoIssues.join("; ") || "—",
    decisionScore: s.decisionScore,
    route: s.route,
  }));

// ── Representative pages (running production-exposed preferred) ─────────────
function depthScore(r: ProductQuality): number {
  const presentDims = Object.values(r.dimensions).filter(
    (d) => d.status === "present",
  ).length;
  const reviewBonus =
    r.reviewStatus === "full_review"
      ? 30
      : r.reviewStatus === "summary_only"
        ? 10
        : 0;
  const relBonus =
    (r.pageSignals?.altCount ?? 0) * 3 +
    (r.pageSignals?.comparisonCount ?? 0) * 4 +
    (r.pageSignals?.guideCount ?? 0) * 2 +
    (r.pageSignals?.evidenceCount ?? 0) * 2;
  const classBonus =
    (
      {
        LAUNCH_READY: 100,
        NEEDS_MINOR_WORK: 40,
        THIN: 10,
        INCOMPLETE: 0,
        BLOCKED: -50,
      } as Record<QualityClass, number>
    )[r.classification] ?? 0;
  return classBonus + r.decisionScore + presentDims * 2 + reviewBonus + relBonus;
}

const ranked = [...running]
  .filter((r) => r.pageAssembled)
  .sort(
    (a, b) => depthScore(b) - depthScore(a) || a.fullName.localeCompare(b.fullName),
  );

function pickDiverse(list: ProductQuality[], n: number): ProductQuality[] {
  const out: ProductQuality[] = [];
  const seenCats = new Set<string>();
  for (const r of list) {
    if (out.length >= n) break;
    if (seenCats.has(r.categoryId) && seenCats.size < Math.min(n, 8)) continue;
    out.push(r);
    seenCats.add(r.categoryId);
  }
  for (const r of list) {
    if (out.length >= n) break;
    if (out.some((x) => x.productId === r.productId)) continue;
    out.push(r);
  }
  return out;
}

function pickRepresentatives(list: ProductQuality[]) {
  return list.map((r) => ({
    product: r.fullName,
    brand: r.brandName,
    category: r.categoryName,
    route: r.route,
    classification: r.classification,
    decisionScore: r.decisionScore,
    depthScore: depthScore(r),
    why: [
      `class=${r.classification}`,
      `decisionScore=${r.decisionScore}`,
      `depthScore=${depthScore(r)}`,
      `review=${r.reviewStatus}`,
      `media=${r.mediaClass}`,
      `evidence=${r.evidenceClass}`,
      `alts=${r.pageSignals?.altCount ?? 0}`,
      `comps=${r.pageSignals?.comparisonCount ?? 0}`,
      `guides=${r.pageSignals?.guideCount ?? 0}`,
      `featuredSpecs=${r.pageSignals?.featuredSpecCount ?? 0}`,
      r.weakAreas.slice(0, 4).join(", ") || "few weak areas",
    ].join(" · "),
  }));
}

const strongest = pickRepresentatives(pickDiverse(ranked, 5));
const weakest = pickRepresentatives(pickDiverse([...ranked].reverse(), 5));
const midStart = Math.max(0, Math.floor(ranked.length / 2) - 8);
const median = pickRepresentatives(pickDiverse(ranked.slice(midStart), 5));

// ── Template / repetition detection ─────────────────────────────────────────
type TemplateHit = {
  kind: string;
  normalized: string;
  count: number;
  examples: { productId: string; fullName: string; raw: string }[];
};

function collectTemplate(kind: string, getText: (p: Product) => string[]): TemplateHit[] {
  const groups = new Map<string, { productId: string; fullName: string; raw: string }[]>();
  for (const p of allProducts) {
    const brand = brandById.get(p.brandId)?.name ?? "";
    const strip = [p.name, p.fullName, brand, p.generation ?? ""];
    for (const raw of getText(p)) {
      if (!raw || raw.trim().length < 12) continue;
      const normalized = normalizeTemplateText(raw, strip);
      if (normalized.length < 10) continue;
      const list = groups.get(normalized) ?? [];
      list.push({ productId: p.id, fullName: p.fullName, raw });
      groups.set(normalized, list);
    }
  }
  return [...groups.entries()]
    .filter(([, items]) => {
      const uniq = new Set(items.map((i) => i.productId));
      return uniq.size >= 3;
    })
    .map(([normalized, items]) => {
      const uniqProducts = new Map<string, (typeof items)[0]>();
      for (const it of items) {
        if (!uniqProducts.has(it.productId)) uniqProducts.set(it.productId, it);
      }
      const examples = [...uniqProducts.values()].slice(0, 5);
      return {
        kind,
        normalized,
        count: uniqProducts.size,
        examples,
      };
    })
    .sort((a, b) => b.count - a.count);
}

const templateHits: TemplateHit[] = [
  ...collectTemplate("shortDescription", (p) => [p.shortDescription]),
  ...collectTemplate("strengths", (p) => p.strengths ?? []),
  ...collectTemplate("weaknesses", (p) => p.weaknesses ?? []),
  ...collectTemplate("verdict", (p) => (p.verdict ? [p.verdict] : [])),
];

const genericAiHits: { productId: string; fullName: string; phrase: string; field: string }[] = [];
for (const p of allProducts) {
  const fields: [string, string][] = [
    ["shortDescription", p.shortDescription],
    ["verdict", p.verdict ?? ""],
    ...p.strengths.map((s) => ["strength", s] as [string, string]),
    ...p.weaknesses.map((s) => ["weakness", s] as [string, string]),
  ];
  for (const [field, text] of fields) {
    const lower = text.toLowerCase();
    for (const phrase of GENERIC_PHRASES) {
      if (lower.includes(phrase)) {
        genericAiHits.push({
          productId: p.id,
          fullName: p.fullName,
          phrase,
          field,
        });
      }
    }
  }
}

// ── Spec completeness per category ──────────────────────────────────────────
const specCompleteness = rawCategories.map((cat) => {
  const products = allProducts.filter((p) => p.categoryId === cat.id);
  const config = getProductPageCategoryConfig(cat.id);
  const req = getPublishRequirement(cat.id);
  const importantKeys = [
    ...new Set([
      ...(req?.requiredSpecKeys ?? []),
      ...(config.featuredSpecificationKeys ?? []),
    ]),
  ];
  const coverage: Record<string, { present: number; pct: number }> = {};
  for (const key of importantKeys) {
    const presentCount = products.filter((p) => specPresent(p, key)).length;
    coverage[key] = {
      present: presentCount,
      pct: pct(presentCount, products.length),
    };
  }
  return {
    categoryId: cat.id,
    category: cat.name,
    productCount: products.length,
    importantKeys,
    coverage,
  };
});

const shoeSpecCoverage: Record<string, { present: number; total: number; pct: number }> = {};
const shoeProducts = allProducts.filter((p) => p.categoryId === SHOE_CAT);
for (const key of SHOE_SPEC_KEYS) {
  const presentCount = shoeProducts.filter((p) => specPresent(p, key)).length;
  shoeSpecCoverage[key] = {
    present: presentCount,
    total: shoeProducts.length,
    pct: pct(presentCount, shoeProducts.length),
  };
}
// weight + reference size (variant-aware)
const weightWithRef = shoeProducts.filter((p) => {
  const vs = variantsByProduct.get(p.id) ?? [];
  return (
    specPresent(p, "weight") &&
    vs.some((v) => v.referenceSizeLabel || v.referenceWeightG)
  );
}).length;
shoeSpecCoverage["weight_plus_reference_size"] = {
  present: weightWithRef,
  total: shoeProducts.length,
  pct: pct(weightWithRef, shoeProducts.length),
};
const withVariants = shoeProducts.filter(
  (p) => (variantsByProduct.get(p.id) ?? []).length > 0,
).length;
shoeSpecCoverage["variants"] = {
  present: withVariants,
  total: shoeProducts.length,
  pct: pct(withVariants, shoeProducts.length),
};
const withUseCases = shoeProducts.filter((p) => (p.useCaseIds?.length ?? 0) > 0).length;
shoeSpecCoverage["use_cases"] = {
  present: withUseCases,
  total: shoeProducts.length,
  pct: pct(withUseCases, shoeProducts.length),
};
const withWidths = shoeProducts.filter(
  (p) =>
    specPresent(p, "widthOptions") ||
    specPresent(p, "widths") ||
    (variantsByProduct.get(p.id) ?? []).some((v) => (v.widthOptions?.length ?? 0) > 0),
).length;
shoeSpecCoverage["widths_product_or_variant"] = {
  present: withWidths,
  total: shoeProducts.length,
  pct: pct(withWidths, shoeProducts.length),
};

// ── Variant quality summary ─────────────────────────────────────────────────
const variantQuality = {
  runningShoes: {
    products: shoes.length,
    withMen: shoes.filter((s) =>
      (variantsByProduct.get(s.productId) ?? []).some((v) => v.audience === "men"),
    ).length,
    withWomen: shoes.filter((s) =>
      (variantsByProduct.get(s.productId) ?? []).some((v) => v.audience === "women"),
    ).length,
    withUnisex: shoes.filter((s) =>
      (variantsByProduct.get(s.productId) ?? []).some((v) => v.audience === "unisex"),
    ).length,
    issueCounts: {} as Record<string, number>,
  },
  allRunningFootwearApparel: {
    products: 0,
    issueCounts: {} as Record<string, number>,
  },
};

for (const s of shoes) {
  for (const issue of s.variantIssues) {
    const key = issue.split(":")[0];
    variantQuality.runningShoes.issueCounts[key] =
      (variantQuality.runningShoes.issueCounts[key] ?? 0) + 1;
  }
}

const apparelCats = new Set([
  SHOE_CAT,
  "cat-running-clothing",
  "cat-running-socks",
  "cat-packs-vests",
  "cat-hydration",
  "cat-running-belts",
]);
const apparelRunning = running.filter((r) => apparelCats.has(r.categoryId));
variantQuality.allRunningFootwearApparel.products = apparelRunning.length;
for (const s of apparelRunning) {
  for (const issue of s.variantIssues) {
    const key = issue.split(":")[0];
    variantQuality.allRunningFootwearApparel.issueCounts[key] =
      (variantQuality.allRunningFootwearApparel.issueCounts[key] ?? 0) + 1;
  }
}

const mediaMismatchNote =
  "ProductVariant schema has no media fields — variant-specific media mismatch cannot be stored; only product-level media evaluated.";

// ── Media quality rollup ────────────────────────────────────────────────────
function countMedia(list: ProductQuality[]) {
  const counts: Record<string, number> = {};
  for (const r of list) {
    counts[r.mediaClass] = (counts[r.mediaClass] ?? 0) + 1;
  }
  return counts;
}

const mediaQuality = {
  allProducts: countMedia(results),
  running: countMedia(running),
  runningShoes: countMedia(shoes),
};

// ── Evidence rollup ─────────────────────────────────────────────────────────
const withEvidence = results.filter((r) => r.evidenceClass !== "none");
const withoutEvidence = results.filter((r) => r.evidenceClass === "none");
const evidenceRollup = {
  all: {
    withEvidence: withEvidence.length,
    withoutEvidence: withoutEvidence.length,
    manufacturerOnly: results.filter((r) => r.evidenceClass === "manufacturer_only").length,
    hasIndependent: results.filter((r) =>
      ["has_independent", "mixed", "has_personal_test"].includes(r.evidenceClass),
    ).length,
    hasPersonalTest: results.filter((r) => r.evidenceClass === "has_personal_test").length,
    strengthsWithoutEvidence: results.filter((r) =>
      r.evidenceIssues.includes("strengths_without_evidence"),
    ).length,
  },
  running: {
    withEvidence: running.filter((r) => r.evidenceClass !== "none").length,
    withoutEvidence: running.filter((r) => r.evidenceClass === "none").length,
    manufacturerOnly: running.filter((r) => r.evidenceClass === "manufacturer_only").length,
    hasIndependent: running.filter((r) =>
      ["has_independent", "mixed", "has_personal_test"].includes(r.evidenceClass),
    ).length,
  },
  runningShoes: {
    withEvidence: shoes.filter((r) => r.evidenceClass !== "none").length,
    withoutEvidence: shoes.filter((r) => r.evidenceClass === "none").length,
    manufacturerOnly: shoes.filter((r) => r.evidenceClass === "manufacturer_only").length,
    hasIndependent: shoes.filter((r) =>
      ["has_independent", "mixed", "has_personal_test"].includes(r.evidenceClass),
    ).length,
  },
  note: "Evidence quality judged only by typed Evidence records linked via product.evidenceIds. Source reputation not externally verified.",
};

// ── Review relationship rollup ──────────────────────────────────────────────
function countReview(list: ProductQuality[]) {
  const counts: Record<string, number> = {};
  for (const r of list) {
    counts[r.reviewStatus] = (counts[r.reviewStatus] ?? 0) + 1;
  }
  return counts;
}

const orphanReviews = rawReviews.filter(
  (r) => !allProducts.some((p) => p.id === r.productId),
);

const reviewRelationship = {
  all: countReview(results),
  running: countReview(running),
  runningShoes: countReview(shoes),
  reviewsWithoutMatchingProduct: orphanReviews.map((r) => ({
    reviewId: r.id,
    slug: r.slug,
    productId: r.productId,
  })),
};

// ── Alternatives / relationships ────────────────────────────────────────────
const relationshipCoverage = {
  running: {
    noAlternatives: running.filter(
      (r) =>
        getAlternativesFromGraph(r.productId).length === 0 &&
        ((allProducts.find((p) => p.id === r.productId)?.alternativeProductIds.length ?? 0) === 0),
    ).length,
    noCompetitors: running.filter(
      (r) => getDirectCompetitors(r.productId).length === 0,
    ).length,
    noFamily: running.filter((r) => {
      const p = allProducts.find((x) => x.id === r.productId);
      return !p?.familyId;
    }).length,
    noComparisons: running.filter(
      (r) => !comparisonsAll.some((c) => c.productIds.includes(r.productId)),
    ).length,
    noRelationshipsAtAll: running.filter((r) => {
      const relCount = allRels.filter(
        (rel) =>
          rel.sourceProductId === r.productId || rel.targetProductId === r.productId,
      ).length;
      return relCount === 0;
    }).length,
  },
  runningShoes: {
    noAlternatives: shoes.filter(
      (r) => getAlternativesFromGraph(r.productId).length === 0,
    ).length,
    noCompetitors: shoes.filter(
      (r) => getDirectCompetitors(r.productId).length === 0,
    ).length,
    noFamily: shoes.filter((r) => {
      const p = allProducts.find((x) => x.id === r.productId);
      return !p?.familyId;
    }).length,
    noComparisons: shoes.filter(
      (r) => !comparisonsAll.some((c) => c.productIds.includes(r.productId)),
    ).length,
  },
};

// ── Public language leakage ─────────────────────────────────────────────────
const leakage: {
  pattern: string;
  productId: string;
  fullName: string;
  field: string;
  excerpt: string;
  publicSurface: "product_record" | "review";
}[] = [];

function scanText(
  pattern: { id: string; re: RegExp },
  text: string,
  meta: { productId: string; fullName: string; field: string; publicSurface: "product_record" | "review" },
) {
  if (!text) return;
  if (pattern.re.test(text)) {
    const idx = text.search(pattern.re);
    const excerpt = text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + 80));
    leakage.push({ pattern: pattern.id, ...meta, excerpt });
  }
}

for (const p of allProducts) {
  const fields: [string, string][] = [
    ["shortDescription", p.shortDescription],
    ["verdict", p.verdict ?? ""],
    ["seoTitle", p.seoTitle ?? ""],
    ["seoDescription", p.seoDescription ?? ""],
    ...p.strengths.map((s, i) => [`strengths[${i}]`, s] as [string, string]),
    ...p.weaknesses.map((s, i) => [`weaknesses[${i}]`, s] as [string, string]),
  ];
  for (const [field, text] of fields) {
    for (const pat of LEAK_PATTERNS) {
      // Skip "confidence" hits inside evidence summaries only handled below;
      // on product copy still flag.
      if (pat.id === "internal IDs" && /^id$/i.test(field)) continue;
      scanText(pat, text, {
        productId: p.id,
        fullName: p.fullName,
        field,
        publicSurface: "product_record",
      });
    }
  }
}

for (const r of rawReviews) {
  const p = allProducts.find((x) => x.id === r.productId);
  const fields: [string, string][] = [
    ["title", r.title],
    ["summary", r.summary],
    ["verdict", r.verdict ?? ""],
    ["bottomLine", r.bottomLine ?? ""],
    ["testingContext", r.testingContext ?? ""],
    ...(r.sections ?? []).flatMap((s, i) => [
      [`sections[${i}].heading`, s.heading] as [string, string],
      [`sections[${i}].body`, s.body] as [string, string],
    ]),
  ];
  for (const [field, text] of fields) {
    for (const pat of LEAK_PATTERNS) {
      scanText(pat, text, {
        productId: r.productId,
        fullName: p?.fullName ?? r.productId,
        field: `review.${field}`,
        publicSurface: "review",
      });
    }
  }
}

// Dedupe leakage noise for internal IDs in seo canonical-like fields — keep all but summarize
const leakageSummary = {
  totalHits: leakage.length,
  byPattern: {} as Record<string, number>,
  sample: leakage.slice(0, 80),
  note: "Hits include legitimate uses (e.g. 'confidence' in evidence prose). Reviewer should inspect samples. Internal ID pattern may match intentional URL slugs containing prod- prefixes — verify context.",
};
for (const hit of leakage) {
  leakageSummary.byPattern[hit.pattern] =
    (leakageSummary.byPattern[hit.pattern] ?? 0) + 1;
}

// ── Global classification counts ────────────────────────────────────────────
const classCounts = (list: ProductQuality[]) => {
  const o: Record<QualityClass, number> = {
    LAUNCH_READY: 0,
    NEEDS_MINOR_WORK: 0,
    THIN: 0,
    INCOMPLETE: 0,
    BLOCKED: 0,
  };
  for (const r of list) o[r.classification]++;
  return o;
};

const indexationEvidence = {
  allProducts: classCounts(results),
  running: classCounts(running),
  runningShoes: classCounts(shoes),
  productionExposedLaunchReady: results.filter(
    (r) => r.productionExposed && r.classification === "LAUNCH_READY",
  ).length,
  productionExposedNotLaunchReady: results.filter(
    (r) => r.productionExposed && r.classification !== "LAUNCH_READY",
  ).length,
  runningProductionExposedLaunchReady: running.filter(
    (r) => r.productionExposed && r.classification === "LAUNCH_READY",
  ).length,
  runningProductionExposedNotLaunchReady: running.filter(
    (r) => r.productionExposed && r.classification !== "LAUNCH_READY",
  ).length,
  shoeLaunchReadyIds: shoes
    .filter((s) => s.classification === "LAUNCH_READY")
    .map((s) => ({ id: s.productId, slug: s.slug, name: s.fullName })),
  note: "This section reports evidence only. It does not recommend whether to index all or a subset on Day 1.",
};

const report = {
  meta: {
    auditId: "02-product-quality",
    title: "Kitletics Pre-Launch Audit 02 — Product Quality & Depth",
    generatedAt: new Date().toISOString(),
    auditClock: AUDIT_NOW.toISOString(),
    mode: "read-only-forensic",
    baselineRule: "No catalog/content mutations; no generation; no backfill",
  },
  classificationRules,
  totals: {
    productsEvaluated: results.length,
    running: running.length,
    runningShoes: shoes.length,
    pageAssembled: results.filter((r) => r.pageAssembled).length,
    classifications: classCounts(results),
  },
  runningSummary,
  shoesNotLaunchReady: shoesNotReady,
  representativePages: {
    strongest,
    median,
    weakest,
  },
  templateRepetition: {
    identicalNormalizedGroups: templateHits.slice(0, 40),
    genericPhraseHits: genericAiHits.slice(0, 60),
    genericPhraseHitCount: genericAiHits.length,
    templateGroupCount: templateHits.length,
  },
  specCompleteness,
  shoeSpecCoverage,
  variantQuality: { ...variantQuality, mediaMismatchNote },
  mediaQuality,
  evidenceRollup,
  reviewRelationship,
  relationshipCoverage,
  publicLanguageLeakage: leakageSummary,
  publicLanguageLeakageAll: leakage,
  indexationEvidence,
  products: results.map((r) => ({
    productId: r.productId,
    slug: r.slug,
    fullName: r.fullName,
    brandName: r.brandName,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    isRunning: r.isRunning,
    classification: r.classification,
    classificationReasons: r.classificationReasons,
    decisionScore: r.decisionScore,
    decisionFlags: r.decisionFlags,
    weakAreas: r.weakAreas,
    reviewStatus: r.reviewStatus,
    mediaClass: r.mediaClass,
    evidenceClass: r.evidenceClass,
    productionExposed: r.productionExposed,
    route: r.route,
    dimensions: r.dimensions,
    pageSignals: r.pageSignals,
  })),
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(
  join(DATA_DIR, "02-product-quality.json"),
  JSON.stringify(report, null, 2),
);

// ── Markdown ────────────────────────────────────────────────────────────────
const lines: string[] = [];
const push = (...xs: string[]) => lines.push(...xs);
const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

push(
  `# Kitletics Pre-Launch Audit 02 — Product Quality & Depth`,
  ``,
  `**Mode:** READ-ONLY forensic`,
  `**Generated:** ${report.meta.generatedAt}`,
  `**Audit clock:** ${report.meta.auditClock}`,
  `**Machine-readable:** [\`data/02-product-quality.json\`](./data/02-product-quality.json)`,
  ``,
  `> No fixes, generation, or backfill. Measurement of Product records and assembled Product Detail page signals only.`,
  ``,
  `---`,
  ``,
  `## Classification rules (exact)`,
  ``,
);

for (const [k, rules] of Object.entries(classificationRules)) {
  if (!Array.isArray(rules)) {
    push(`### ${k}`, ``, String(rules), ``);
    continue;
  }
  push(`### ${k}`, ``);
  for (const rule of rules) push(`- ${rule}`);
  push(``);
}

push(
  `---`,
  ``,
  `## Totals`,
  ``,
  `| Scope | Count |`,
  `|---|---:|`,
  `| Products evaluated | ${results.length} |`,
  `| Running-tagged | ${running.length} |`,
  `| Running shoes | ${shoes.length} |`,
  `| Page assembled via getProductPageData | ${results.filter((r) => r.pageAssembled).length} |`,
  ``,
  `| Classification | All | Running | Shoes |`,
  `|---|---:|---:|---:|`,
);

const allC = classCounts(results);
const runC = classCounts(running);
const shoeC = classCounts(shoes);
for (const k of Object.keys(allC) as QualityClass[]) {
  push(`| ${k} | ${allC[k]} | ${runC[k]} | ${shoeC[k]} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 4. Running summary by category`,
  ``,
  `| Category | Products | Launch Ready | Minor Work | Thin | Incomplete | Blocked | Ready % |`,
  `|---|---:|---:|---:|---:|---:|---:|---:|`,
);
for (const row of runningSummary) {
  push(
    `| ${esc(row.category)} | ${row.products} | ${row.LAUNCH_READY} | ${row.NEEDS_MINOR_WORK} | ${row.THIN} | ${row.INCOMPLETE} | ${row.BLOCKED} | ${row.readyPct} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 5. Running shoes — every product not LAUNCH_READY`,
  ``,
  `Count: **${shoesNotReady.length}** / ${shoes.length}`,
  ``,
  `| Product | Brand | Status | Missing/Weak Areas | Review Status | Media | Offers | Variant Issue | Evidence Issue | SEO Issue |`,
  `|---|---|---|---|---|---|---|---|---|---|`,
);
for (const row of shoesNotReady) {
  push(
    `| ${esc(row.product)} | ${esc(row.brand)} | ${row.status} | ${esc(row.missingWeakAreas || "—")} | ${row.reviewStatus} | ${row.media} | ${row.offers ? "yes" : "no"} | ${esc(row.variantIssue)} | ${esc(row.evidenceIssue)} | ${esc(row.seoIssue)} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 6. Representative page depth`,
  ``,
  `### 5 strongest`,
  ``,
);
for (const r of strongest) {
  push(
    `- **${esc(r.product)}** (\`${r.route}\`) — ${r.classification}, decisionScore=${r.decisionScore}`,
    `  - Why: ${esc(r.why)}`,
  );
}
push(``, `### 5 median`, ``);
for (const r of median) {
  push(
    `- **${esc(r.product)}** (\`${r.route}\`) — ${r.classification}, decisionScore=${r.decisionScore}`,
    `  - Why: ${esc(r.why)}`,
  );
}
push(``, `### 5 weakest`, ``);
for (const r of weakest) {
  push(
    `- **${esc(r.product)}** (\`${r.route}\`) — ${r.classification}, decisionScore=${r.decisionScore}`,
    `  - Why: ${esc(r.why)}`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 7. Template vs unique value`,
  ``,
  `Normalized identical copy groups (≥3 products, product/brand/generation stripped): **${templateHits.length}**`,
  ``,
  `Generic AI-style phrase hits: **${genericAiHits.length}**`,
  ``,
  `### Top repeated copy groups`,
  ``,
);
for (const g of templateHits.slice(0, 15)) {
  push(
    `- **${g.kind}** ×${g.count}: \`${esc(g.normalized.slice(0, 120))}${g.normalized.length > 120 ? "…" : ""}\``,
  );
  for (const ex of g.examples.slice(0, 3)) {
    push(`  - ${esc(ex.fullName)}: “${esc(ex.raw.slice(0, 100))}”`);
  }
}
push(``, `### Generic phrase examples`, ``);
for (const g of genericAiHits.slice(0, 15)) {
  push(`- ${esc(g.fullName)} · ${g.field}: “${esc(g.phrase)}”`);
}

push(
  ``,
  `---`,
  ``,
  `## 8. Spec completeness`,
  ``,
  `### Running shoes (requested keys)`,
  ``,
  `| Spec | Present | Total | % |`,
  `|---|---:|---:|---:|`,
);
for (const [k, v] of Object.entries(shoeSpecCoverage)) {
  push(`| ${k} | ${v.present} | ${v.total} | ${v.pct} |`);
}

push(``, `### Important specs by category (required + featured)`, ``);
for (const cat of specCompleteness.filter((c) => c.productCount > 0 && c.importantKeys.length > 0).slice(0, 25)) {
  push(`#### ${cat.category} (n=${cat.productCount})`, ``);
  push(`| Key | Present | % |`, `|---|---:|---:|`);
  for (const [k, v] of Object.entries(cat.coverage)) {
    push(`| ${k} | ${v.present} | ${v.pct} |`);
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 9. Variant quality`,
  ``,
  `### Running shoes`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Products | ${variantQuality.runningShoes.products} |`,
  `| With men | ${variantQuality.runningShoes.withMen} |`,
  `| With women | ${variantQuality.runningShoes.withWomen} |`,
  `| With unisex | ${variantQuality.runningShoes.withUnisex} |`,
  ``,
  `Issue counts:`,
  ``,
);
for (const [k, v] of Object.entries(variantQuality.runningShoes.issueCounts).sort(
  (a, b) => b[1] - a[1],
)) {
  push(`- \`${k}\`: ${v}`);
}
push(``, `_${mediaMismatchNote}_`, ``);

push(
  `---`,
  ``,
  `## 10. Media quality`,
  ``,
  `| Class | All | Running | Shoes |`,
  `|---|---:|---:|---:|`,
);
const mediaKeys = new Set([
  ...Object.keys(mediaQuality.allProducts),
  ...Object.keys(mediaQuality.running),
  ...Object.keys(mediaQuality.runningShoes),
]);
for (const k of mediaKeys) {
  push(
    `| ${k} | ${mediaQuality.allProducts[k] ?? 0} | ${mediaQuality.running[k] ?? 0} | ${mediaQuality.runningShoes[k] ?? 0} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 11. Evidence`,
  ``,
  `| Metric | All | Running | Shoes |`,
  `|---|---:|---:|---:|`,
  `| With evidence | ${evidenceRollup.all.withEvidence} | ${evidenceRollup.running.withEvidence} | ${evidenceRollup.runningShoes.withEvidence} |`,
  `| Without evidence | ${evidenceRollup.all.withoutEvidence} | ${evidenceRollup.running.withoutEvidence} | ${evidenceRollup.runningShoes.withoutEvidence} |`,
  `| Manufacturer-only | ${evidenceRollup.all.manufacturerOnly} | ${evidenceRollup.running.manufacturerOnly} | ${evidenceRollup.runningShoes.manufacturerOnly} |`,
  `| Independent / mixed / personal | ${evidenceRollup.all.hasIndependent} | ${evidenceRollup.running.hasIndependent} | ${evidenceRollup.runningShoes.hasIndependent} |`,
  `| Personal test | ${evidenceRollup.all.hasPersonalTest} | — | — |`,
  `| Strengths without evidence | ${evidenceRollup.all.strengthsWithoutEvidence} | — | — |`,
  ``,
  `_${evidenceRollup.note}_`,
  ``,
);

push(
  `---`,
  ``,
  `## 12. Review relationship`,
  ``,
  `| Status | All | Running | Shoes |`,
  `|---|---:|---:|---:|`,
);
const revKeys = new Set([
  ...Object.keys(reviewRelationship.all),
  ...Object.keys(reviewRelationship.running),
  ...Object.keys(reviewRelationship.runningShoes),
]);
for (const k of revKeys) {
  push(
    `| ${k} | ${reviewRelationship.all[k] ?? 0} | ${reviewRelationship.running[k] ?? 0} | ${reviewRelationship.runningShoes[k] ?? 0} |`,
  );
}
push(
  ``,
  `Reviews whose productId has no Product record: **${orphanReviews.length}**`,
  ``,
);

push(
  `---`,
  ``,
  `## 13. Alternatives / relationships`,
  ``,
  `### Running`,
  ``,
  `| Gap | Count |`,
  `|---|---:|`,
  `| No alternatives | ${relationshipCoverage.running.noAlternatives} |`,
  `| No competitors | ${relationshipCoverage.running.noCompetitors} |`,
  `| No family | ${relationshipCoverage.running.noFamily} |`,
  `| No comparisons | ${relationshipCoverage.running.noComparisons} |`,
  `| No relationships at all | ${relationshipCoverage.running.noRelationshipsAtAll} |`,
  ``,
  `### Running shoes`,
  ``,
  `| Gap | Count |`,
  `|---|---:|`,
  `| No alternatives | ${relationshipCoverage.runningShoes.noAlternatives} |`,
  `| No competitors | ${relationshipCoverage.runningShoes.noCompetitors} |`,
  `| No family | ${relationshipCoverage.runningShoes.noFamily} |`,
  `| No comparisons | ${relationshipCoverage.runningShoes.noComparisons} |`,
  ``,
);

push(
  `---`,
  ``,
  `## 14. Public language audit`,
  ``,
  `Total pattern hits: **${leakage.length}**`,
  ``,
  `| Pattern | Hits |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(leakageSummary.byPattern).sort(
  (a, b) => b[1] - a[1],
)) {
  push(`| ${k} | ${v} |`);
}
push(``, `### Sample hits (first 40)`, ``);
for (const hit of leakage.slice(0, 40)) {
  push(
    `- [${hit.pattern}] ${esc(hit.fullName)} · ${hit.field} · ${hit.publicSurface}: “${esc(hit.excerpt)}”`,
  );
}
push(``, `_${leakageSummary.note}_`, ``);

push(
  `---`,
  ``,
  `## 15. Indexation evidence (no decision)`,
  ``,
  `This audit does **not** decide Day-1 indexation. Evidence for an external reviewer:`,
  ``,
  `| Evidence | Count |`,
  `|---|---:|`,
  `| All products LAUNCH_READY | ${indexationEvidence.allProducts.LAUNCH_READY} |`,
  `| All products production-exposed & LAUNCH_READY | ${indexationEvidence.productionExposedLaunchReady} |`,
  `| All products production-exposed & not LAUNCH_READY | ${indexationEvidence.productionExposedNotLaunchReady} |`,
  `| Running LAUNCH_READY | ${indexationEvidence.running.LAUNCH_READY} |`,
  `| Running production-exposed & LAUNCH_READY | ${indexationEvidence.runningProductionExposedLaunchReady} |`,
  `| Running production-exposed & not LAUNCH_READY | ${indexationEvidence.runningProductionExposedNotLaunchReady} |`,
  `| Running shoes LAUNCH_READY | ${indexationEvidence.runningShoes.LAUNCH_READY} |`,
  `| Running shoes NEEDS_MINOR_WORK | ${indexationEvidence.runningShoes.NEEDS_MINOR_WORK} |`,
  `| Running shoes THIN | ${indexationEvidence.runningShoes.THIN} |`,
  `| Running shoes INCOMPLETE | ${indexationEvidence.runningShoes.INCOMPLETE} |`,
  `| Running shoes BLOCKED | ${indexationEvidence.runningShoes.BLOCKED} |`,
  ``,
  `Questions left to the external reviewer:`,
  ``,
  `1. Should all Product pages be indexed on Day 1?`,
  `2. Should only a subset be indexed?`,
  `3. Which subset? (see JSON \`indexationEvidence.shoeLaunchReadyIds\` and per-product \`classification\` / \`productionExposed\`)`,
  ``,
  `---`,
  ``,
  `## End of baseline`,
  ``,
  `No fixes recommended here. Measurement only.`,
  ``,
);

writeFileSync(join(OUT_DIR, "02-product-quality.md"), lines.join("\n"));
console.log("Wrote", join(OUT_DIR, "02-product-quality.md"));
console.log("Wrote", join(DATA_DIR, "02-product-quality.json"));
console.log(
  JSON.stringify(
    {
      classifications: allC,
      running: runC,
      shoes: shoeC,
      shoesNotReady: shoesNotReady.length,
      templateGroups: templateHits.length,
      leakage: leakage.length,
    },
    null,
    2,
  ),
);
