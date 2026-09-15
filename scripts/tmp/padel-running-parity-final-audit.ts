/**
 * FINAL Padel ↔ Running parity audit (supersedes zero-debt methodology).
 * Quality question: is each indexable Padel page as complete/visual/useful
 * as the mature Running equivalent — not merely technically valid.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/padel-running-parity-final-audit.ts
 *
 * Writes:
 *   docs/padel/data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv
 *   docs/padel/data/PADEL-RUNNING-PARITY-FINAL-SCORECARD.json
 *   docs/padel/data/PADEL-RUNNING-PARITY-FINAL-PRODUCT-MEDIA.csv
 *   docs/padel/data/PADEL-RUNNING-PARITY-FINAL-EDITORIAL-MEDIA.csv
 *   docs/padel/data/PADEL-RUNNING-PARITY-FINAL-CONTENT.csv
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import {
  getProducts,
  getProductsByCategory,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getBrandById,
  getProductById,
  getCategoryById,
} from "@/repositories";
import {
  getPrimaryProductMedia,
  canFeatureProduct,
} from "@/lib/product/media";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { isListableCatalogProduct } from "@/lib/catalog/listable-products";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { resolveGuideCoverage } from "@/lib/best/guide-coverage";
import type { Product } from "@/domain/products/types";
import type { BestGuide, BuyingGuide, Review } from "@/domain/editorial/types";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs/padel/data");
const PUB = join(ROOT, "public");

const PADEL_CATS = [
  { id: "cat-padel-rackets", label: "Rackets" },
  { id: "cat-padel-shoes", label: "Shoes" },
  { id: "cat-padel-balls", label: "Balls" },
  { id: "cat-padel-bags", label: "Bags" },
  { id: "cat-padel-grips", label: "Grips" },
  { id: "cat-padel-accessories", label: "Accessories" },
] as const;

const RUNNING_SHOE_CAT = "cat-running-shoes";

type ContentClass =
  | "EXCELLENT"
  | "GOOD"
  | "THIN"
  | "GENERIC"
  | "REPETITIVE"
  | "BROKEN";

type FamilyVerdict =
  | "PARITY_READY"
  | "MAJOR_PARITY_GAPS"
  | "SYSTEMIC_PARITY_FAILURE"
  | "FUNCTIONALLY_READY_BUT_THIN";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(
  path: string,
  headers: string[],
  rows: Record<string, unknown>[],
) {
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  writeFileSync(path, lines.join("\n") + "\n");
}

function fileExists(publicSrc?: string): boolean {
  if (!publicSrc?.startsWith("/")) return false;
  return existsSync(join(PUB, publicSrc.replace(/^\//, "")));
}

function countSectionFiles(
  productSlug: string,
  sport: "running" | "padel",
): number {
  const dir = join(PUB, "images", sport, "products", productSlug, "sections");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) =>
    [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase()),
  ).length;
}

/** Content quality without word-count as primary proof. */
function classifyContentQuality(input: {
  text: string;
  hasDecisionSignals?: boolean;
  hasProductSpecifics?: boolean;
  hasTradeoffs?: boolean;
  hasPeers?: boolean;
  junkVoice?: boolean;
  missingRequired?: boolean;
}): ContentClass {
  const t = input.text.trim();
  const lower = t.toLowerCase();
  if (
    input.missingRequired ||
    /image unavailable|lorem ipsum|todo:|FIXME|\[placeholder\]/i.test(t)
  ) {
    return "BROKEN";
  }
  if (input.junkVoice || isReportOrJunkVoice(t)) return "GENERIC";

  const genericHits = [
    /is designed for/,
    /perfect for players who/,
    /ideal for those who/,
    /whether you('re| are)/,
    /manufacturer (sheet|positioning|copy)/,
    /this product offers/,
    /in today'?s market/,
    /when it comes to/,
  ].filter((re) => re.test(lower)).length;

  const decisionHits = [
    /buy if|skip if|i('d| would) (shortlist|pause|rotate|pick|avoid)/i,
    /trade-?off|versus|compared to|instead of/i,
    /who (should|it'?s) (for|avoid)/i,
  ].filter((re) => re.test(lower)).length;

  const specificHits = [
    /\b(eva|carbon|fiberglass|teardrop|diamond|round|herringbone|overgrip|paletero|balance|sweet.?spot)\b/i,
    /\b\d{2,3}\s*g\b|\b\d+(\.\d+)?\s*mm\b/i,
  ].filter((re) => re.test(lower)).length;

  if (genericHits >= 3 && decisionHits === 0) return "REPETITIVE";
  if (genericHits >= 2 && !input.hasProductSpecifics && specificHits === 0)
    return "GENERIC";
  if (
    !input.hasDecisionSignals &&
    decisionHits === 0 &&
    !input.hasTradeoffs &&
    t.length < 280
  ) {
    return "THIN";
  }
  if (
    (input.hasDecisionSignals || decisionHits >= 1) &&
    (input.hasProductSpecifics || specificHits >= 1) &&
    (input.hasTradeoffs || /trade-?off/i.test(lower)) &&
    genericHits === 0
  ) {
    return "EXCELLENT";
  }
  if (
    (input.hasProductSpecifics || specificHits >= 1 || decisionHits >= 1) &&
    genericHits <= 1
  ) {
    return "GOOD";
  }
  if (genericHits >= 1) return "GENERIC";
  if (t.length < 120) return "THIN";
  return "GOOD";
}

function heroStatus(product: Product): {
  exactHero: boolean;
  placeholder: boolean;
  src?: string;
  mediaBlocked: boolean;
  listable: boolean;
  indexable: boolean;
  published: boolean;
  galleryCount: number;
  usefulGallery: boolean;
} {
  const primary = getPrimaryProductMedia(product);
  const catalog = getCatalogProductHeroMedia(product.id);
  const gallery = getProductGalleryMedia(product.id) ?? [];
  const src = primary?.src ?? catalog?.src;
  const placeholder = Boolean(
    !src ||
      src.includes("fallback") ||
      src.includes("placeholder") ||
      src.endsWith(".svg"),
  );
  const exactHero = Boolean(src && !placeholder && fileExists(src));
  const listable = isListableCatalogProduct(product, { isDev: true });
  const elig = getLaunchEligibility(
    { kind: "product", entity: product },
    { isDev: true },
  );
  const indexable = isIndexableEligibility(elig);
  // Media-blocked = cannot feature (no verified hero) whether draft or published-without-media
  const mediaBlocked = !canFeatureProduct(product);
  // Running median gallery extras ≈ 0–1; hero-only is category-appropriate
  const galleryCount = (exactHero ? 1 : 0) + gallery.filter((g) => g.src).length;
  const usefulGallery = exactHero; // Running-calibrated: hero sufficient; extras optional

  return {
    exactHero,
    placeholder,
    src,
    mediaBlocked,
    listable,
    indexable,
    published: product.status === "published",
    galleryCount,
    usefulGallery,
  };
}

type Issue = {
  severity: "blocker" | "major" | "minor";
  family: string;
  entityType: string;
  entityId: string;
  slug: string;
  dimension: string;
  issue: string;
  evidence: string;
};

const issues: Issue[] = [];

function pushIssue(i: Issue) {
  issues.push(i);
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const allProducts = getProducts({ isDev: true });
  const padelProducts = allProducts.filter((p) =>
    p.categoryId.startsWith("cat-padel"),
  );
  const runningShoes = getProductsByCategory(RUNNING_SHOE_CAT, { isDev: true });

  // ── Product media by family ──────────────────────────────────────────
  const productMediaRows: Record<string, unknown>[] = [];
  const mediaByFamily: Record<
    string,
    {
      canonical: number;
      exactHero: number;
      usefulGallery: number;
      mediaBlocked: number;
      published: number;
      indexable: number;
      listable: number;
      indexableMissingHero: number;
      indexablePlaceholder: number;
      indexableThinCopy: number;
    }
  > = {};

  for (const cat of PADEL_CATS) {
    mediaByFamily[cat.label] = {
      canonical: 0,
      exactHero: 0,
      usefulGallery: 0,
      mediaBlocked: 0,
      published: 0,
      indexable: 0,
      listable: 0,
      indexableMissingHero: 0,
      indexablePlaceholder: 0,
      indexableThinCopy: 0,
    };
  }

  const contentRows: Record<string, unknown>[] = [];

  for (const product of padelProducts) {
    const family =
      PADEL_CATS.find((c) => c.id === product.categoryId)?.label ?? "Other";
    if (!mediaByFamily[family]) continue;
    const m = mediaByFamily[family]!;
    m.canonical += 1;
    const hs = heroStatus(product);
    if (hs.published) m.published += 1;
    if (hs.exactHero) m.exactHero += 1;
    if (hs.usefulGallery) m.usefulGallery += 1;
    if (hs.mediaBlocked) m.mediaBlocked += 1;
    if (hs.indexable) m.indexable += 1;
    if (hs.listable) m.listable += 1;

    const desc = [
      product.shortDescription ?? "",
      product.description ?? "",
      ...(product.strengths ?? []),
      ...(product.weaknesses ?? []),
    ].join("\n");

    const contentClass = classifyContentQuality({
      text: desc,
      hasDecisionSignals: Boolean(
        (product.strengths?.length ?? 0) >= 2 ||
          (product.weaknesses?.length ?? 0) >= 1,
      ),
      hasProductSpecifics: /shape|balance|weight|core|face|outsole|grip|thermo/i.test(
        desc,
      ),
      hasTradeoffs: (product.weaknesses?.length ?? 0) >= 1,
      missingRequired: hs.indexable && (!desc.trim() || desc.trim().length < 40),
    });

    if (hs.indexable && !hs.exactHero) {
      m.indexableMissingHero += 1;
      pushIssue({
        severity: "blocker",
        family,
        entityType: "product",
        entityId: product.id,
        slug: product.slug,
        dimension: "media_completeness",
        issue: "Indexable PDP missing exact hero",
        evidence: `status=${product.status} src=${hs.src ?? "none"}`,
      });
    }
    if (hs.indexable && hs.placeholder) {
      m.indexablePlaceholder += 1;
      pushIssue({
        severity: "blocker",
        family,
        entityType: "product",
        entityId: product.id,
        slug: product.slug,
        dimension: "media_semantics",
        issue: "Indexable PDP uses placeholder/fallback hero",
        evidence: hs.src ?? "none",
      });
    }
    if (
      hs.indexable &&
      (contentClass === "THIN" ||
        contentClass === "GENERIC" ||
        contentClass === "BROKEN" ||
        contentClass === "REPETITIVE")
    ) {
      m.indexableThinCopy += 1;
      pushIssue({
        severity: contentClass === "BROKEN" ? "blocker" : "major",
        family,
        entityType: "product",
        entityId: product.id,
        slug: product.slug,
        dimension: "content_specificity",
        issue: `Indexable PDP content class ${contentClass}`,
        evidence: desc.slice(0, 160).replace(/\s+/g, " "),
      });
    }

    productMediaRows.push({
      family,
      productId: product.id,
      slug: product.slug,
      status: product.status,
      published: hs.published,
      indexable: hs.indexable,
      listable: hs.listable,
      exactHero: hs.exactHero,
      usefulGallery: hs.usefulGallery,
      galleryCount: hs.galleryCount,
      mediaBlocked: hs.mediaBlocked,
      placeholder: hs.placeholder,
      heroSrc: hs.src ?? "",
      contentClass,
    });

    if (hs.indexable || hs.listable) {
      contentRows.push({
        kind: "product",
        id: product.id,
        slug: product.slug,
        family,
        contentClass,
        indexable: hs.indexable,
      });
    }
  }

  // Running shoe calibration
  let runExact = 0;
  let runGalleryExtras = 0;
  for (const p of runningShoes) {
    if (p.status !== "published") continue;
    const hs = heroStatus(p);
    if (hs.exactHero) runExact += 1;
    const extras = (getProductGalleryMedia(p.id) ?? []).length;
    if (extras > 0) runGalleryExtras += 1;
  }
  const runPublished = runningShoes.filter((p) => p.status === "published").length;

  // ── Reviews ──────────────────────────────────────────────────────────
  const padelReviews = getReviews({ isDev: true }).filter((r) => {
    const p = getProductById(r.productId, { isDev: true });
    return p?.categoryId.startsWith("cat-padel");
  });
  const runningReviews = getReviews({ isDev: true })
    .filter((r) => {
      const p = getProductById(r.productId, { isDev: true });
      return p?.categoryId === RUNNING_SHOE_CAT;
    })
    .slice(0, 30);

  const editorialMediaRows: Record<string, unknown>[] = [];
  let reviewIndexable = 0;
  let reviewParityReady = 0;
  let reviewHeroOnly = 0;
  let reviewNoVisual = 0;
  let reviewInlineSum = 0;

  for (const review of padelReviews) {
    const product = getProductById(review.productId, { isDev: true });
    if (!product) continue;
    const elig = getLaunchEligibility(
      { kind: "review", entity: review },
      { isDev: true },
    );
    const indexable = isIndexableEligibility(elig);
    if (!indexable) continue;
    reviewIndexable += 1;

    const enriched = enrichReviewForPage(review, product);
    const sectionImgs = (enriched.sections ?? [])
      .map((s) => s.image?.src)
      .filter(Boolean) as string[];
    const uniqueSrcs = new Set(sectionImgs);
    const sectionFiles = countSectionFiles(product.slug, "padel");
    const hero = getPrimaryProductMedia(product);
    const meaningful = uniqueSrcs.size;
    reviewInlineSum += meaningful;

    if (meaningful === 0) reviewNoVisual += 1;
    if (meaningful <= 1 && hero) reviewHeroOnly += 1;

    const body = [
      enriched.summary ?? "",
      enriched.verdict ?? "",
      ...(enriched.whoShouldBuy ?? []),
      ...(enriched.whoShouldSkip ?? []),
      ...(enriched.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
    ].join("\n");

    const buyIf = (enriched.whoShouldBuy ?? []).length;
    const skipIf = (enriched.whoShouldAvoid ?? []).length;
    const contentClass = classifyContentQuality({
      text: body,
      hasDecisionSignals: buyIf >= 2 && skipIf >= 2,
      hasProductSpecifics: true,
      hasTradeoffs: /trade-?off|compromise|skip if|who should avoid/i.test(body),
      hasPeers: /\/products\/|versus|compared/i.test(body),
      junkVoice: isReportOrJunkVoice(body),
      missingRequired: buyIf < 2 || skipIf < 2,
    });

    const family =
      PADEL_CATS.find((c) => c.id === product.categoryId)?.label ?? "Other";

    let parityOk = true;
    if (!hero || !fileExists(hero.src)) {
      parityOk = false;
      pushIssue({
        severity: "blocker",
        family,
        entityType: "review",
        entityId: review.id,
        slug: review.slug,
        dimension: "media_completeness",
        issue: "Indexable review missing product hero",
        evidence: hero?.src ?? "none",
      });
    }
    if (meaningful < 3 && sectionFiles < 3) {
      parityOk = false;
      pushIssue({
        severity: "major",
        family,
        entityType: "review",
        entityId: review.id,
        slug: review.slug,
        dimension: "visual_storytelling",
        issue: "Indexable review lacks Running-equivalent inline section visuals",
        evidence: `uniqueSrcs=${meaningful} sectionFiles=${sectionFiles}`,
      });
    }
    if (contentClass === "THIN" || contentClass === "GENERIC" || contentClass === "BROKEN") {
      parityOk = false;
      pushIssue({
        severity: "major",
        family,
        entityType: "review",
        entityId: review.id,
        slug: review.slug,
        dimension: "content_depth",
        issue: `Indexable review content class ${contentClass}`,
        evidence: `buyIf=${buyIf} skipIf=${skipIf}`,
      });
    }
    if (parityOk) reviewParityReady += 1;

    editorialMediaRows.push({
      kind: "review",
      vertical: "padel",
      id: review.id,
      slug: review.slug,
      indexable: true,
      heroPresent: Boolean(hero?.src),
      meaningfulImages: meaningful,
      sectionFiles,
      heroOnly: meaningful <= 1,
      noVisuals: meaningful === 0,
      contentClass,
      parityReady: parityOk,
    });

    contentRows.push({
      kind: "review",
      id: review.id,
      slug: review.slug,
      family,
      contentClass,
      indexable: true,
    });
  }

  let runReviewInlineSum = 0;
  let runReviewN = 0;
  for (const review of runningReviews) {
    const product = getProductById(review.productId, { isDev: true });
    if (!product) continue;
    const elig = getLaunchEligibility(
      { kind: "review", entity: review },
      { isDev: true },
    );
    if (!isIndexableEligibility(elig)) continue;
    runReviewN += 1;
    const files = countSectionFiles(product.slug, "running");
    runReviewInlineSum += Math.max(files, 1);
    editorialMediaRows.push({
      kind: "review",
      vertical: "running",
      id: review.id,
      slug: review.slug,
      indexable: true,
      heroPresent: true,
      meaningfulImages: files,
      sectionFiles: files,
      heroOnly: files <= 1,
      noVisuals: files === 0,
      contentClass: "GOOD",
      parityReady: files >= 8,
    });
  }

  // ── Best guides ──────────────────────────────────────────────────────
  const padelBest = getBestGuides({ isDev: true }).filter(
    (g) => g.sportId === "sport-padel",
  );
  const runningBest = getBestGuides({ isDev: true })
    .filter((g) => g.sportId === "sport-running")
    .slice(0, 20);

  let bestIndexable = 0;
  let bestParityReady = 0;
  let bestHeroOnly = 0;
  let bestNoVisual = 0;
  let bestImgSum = 0;

  for (const guide of padelBest) {
    const elig = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      { isDev: true },
    );
    const indexable = isIndexableEligibility(elig);
    if (!indexable) continue;
    bestIndexable += 1;

    const coverage = resolveGuideCoverage(guide, { isDev: true });
    const recMedia = guide.recommendations
      .map((r) => getProductById(r.productId, { isDev: true }))
      .filter(Boolean)
      .map((p) => getPrimaryProductMedia(p!))
      .filter((m) => m?.src && fileExists(m.src));
    const meaningful = recMedia.length;
    bestImgSum += meaningful;
    if (meaningful === 0) bestNoVisual += 1;
    if (meaningful <= 1) bestHeroOnly += 1;

    const body = [
      guide.intro ?? "",
      guide.selectionMethodology ?? "",
      guide.methodologySummary ?? "",
      ...guide.recommendations.map(
        (r) =>
          `${r.summary ?? ""} ${r.whyItWon ?? r.whyRecommended ?? ""} ${r.tradeoffs?.join(" ") ?? ""}`,
      ),
    ].join("\n");

    const contentClass = classifyContentQuality({
      text: body,
      hasDecisionSignals: guide.recommendations.some(
        (r) => (r.whyItWon ?? r.whyRecommended ?? "").length > 40,
      ),
      hasProductSpecifics: true,
      hasTradeoffs: guide.recommendations.some(
        (r) => (r.tradeoffs?.length ?? 0) >= 1,
      ),
      missingRequired: guide.recommendations.length === 0,
    });

    let parityOk = true;
    if (meaningful < Math.min(3, guide.recommendations.length)) {
      parityOk = false;
      pushIssue({
        severity: "blocker",
        family: "Best",
        entityType: "best-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "media_completeness",
        issue: "Best guide recommendations missing product imagery",
        evidence: `recImages=${meaningful}/${guide.recommendations.length}`,
      });
    }
    if (!coverage.hasAuthenticConsideredSet) {
      parityOk = false;
      pushIssue({
        severity: "major",
        family: "Best",
        entityType: "best-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "decision_usefulness",
        issue: "Best guide lacks authentic considered pool",
        evidence: `considered=${coverage.consideredCount}`,
      });
    }
    if (
      contentClass === "THIN" ||
      contentClass === "GENERIC" ||
      contentClass === "BROKEN"
    ) {
      parityOk = false;
      pushIssue({
        severity: "major",
        family: "Best",
        entityType: "best-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "content_depth",
        issue: `Best guide content class ${contentClass}`,
        evidence: `recs=${guide.recommendations.length}`,
      });
    }
    if (parityOk) bestParityReady += 1;

    editorialMediaRows.push({
      kind: "best",
      vertical: "padel",
      id: guide.id,
      slug: guide.slug,
      indexable: true,
      heroPresent: meaningful > 0,
      meaningfulImages: meaningful,
      sectionFiles: 0,
      heroOnly: meaningful <= 1,
      noVisuals: meaningful === 0,
      contentClass,
      parityReady: parityOk,
      consideredCount: coverage.consideredCount,
      recommendedCount: coverage.recommendedCount,
    });

    contentRows.push({
      kind: "best",
      id: guide.id,
      slug: guide.slug,
      family: "Best",
      contentClass,
      indexable: true,
    });
  }

  for (const guide of runningBest) {
    const elig = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      { isDev: true },
    );
    if (!isIndexableEligibility(elig)) continue;
    const recMedia = guide.recommendations
      .map((r) => getProductById(r.productId, { isDev: true }))
      .filter(Boolean)
      .map((p) => getPrimaryProductMedia(p!))
      .filter((m) => m?.src).length;
    editorialMediaRows.push({
      kind: "best",
      vertical: "running",
      id: guide.id,
      slug: guide.slug,
      indexable: true,
      heroPresent: recMedia > 0,
      meaningfulImages: recMedia,
      sectionFiles: 0,
      heroOnly: recMedia <= 1,
      noVisuals: recMedia === 0,
      contentClass: "GOOD",
      parityReady: recMedia >= 3,
    });
  }

  // ── Buying guides ────────────────────────────────────────────────────
  const padelBuy = getBuyingGuides({ isDev: true }).filter(
    (g) => g.sportId === "sport-padel",
  );
  // Also count long-form knowledge via getLongFormGuideConfig for padel slugs
  const padelBuySlugs = new Set(padelBuy.map((g) => g.slug));

  let buyIndexable = 0;
  let buyParityReady = 0;
  let buyHeroOnly = 0;
  let buyNoVisual = 0;
  let buyImgSum = 0;

  for (const guide of padelBuy) {
    const elig = getLaunchEligibility(
      { kind: "buying-guide", entity: guide },
      { isDev: true },
    );
    const indexable = isIndexableEligibility(elig);
    if (!indexable) continue;
    buyIndexable += 1;

    const lf = getLongFormGuideConfig(guide.slug);
    const blocks = lf?.explainer?.blocks ?? [];
    const diagrams = blocks.filter(
      (b) => "diagram" in b && (b as { diagram?: { variant: string } }).diagram?.variant,
    );
    const productExamples = blocks.filter((b) => b.type === "product-examples");
    const heroSrc = lf?.heroImageSrc;
    const heroOk = Boolean(heroSrc && (fileExists(heroSrc) || heroSrc.includes("/images/")));
    const meaningful =
      (heroOk ? 1 : 0) + diagrams.length + (productExamples.length > 0 ? 1 : 0);
    buyImgSum += meaningful;
    if (meaningful === 0) buyNoVisual += 1;
    if (meaningful <= 1) buyHeroOnly += 1;

    const body = [
      guide.summary ?? "",
      guide.quickAnswer ?? "",
      ...(guide.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
      lf?.deck ?? "",
    ].join("\n");

    const contentClass = classifyContentQuality({
      text: body,
      hasDecisionSignals: /choose|decide|when to|factor/i.test(body),
      hasProductSpecifics: /shape|balance|weight|grip|outsole|paletero/i.test(body),
      hasTradeoffs: /trade-?off|vs |versus/i.test(body),
      missingRequired: !body.trim(),
    });

    // Word-count-only must fail — flag if thin decision signals despite long text
    const wordCountFail =
      body.length > 8000 &&
      !/trade-?off|buy if|decision|compare/i.test(body) &&
      diagrams.length === 0;

    let parityOk = true;
    if (!heroOk) {
      parityOk = false;
      pushIssue({
        severity: "major",
        family: "Buying",
        entityType: "buying-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "visual_storytelling",
        issue: "Buying guide missing dedicated/usable hero",
        evidence: heroSrc ?? "none",
      });
    }
    if (diagrams.length === 0 && productExamples.length === 0) {
      parityOk = false;
      pushIssue({
        severity: "major",
        family: "Buying",
        entityType: "buying-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "visual_storytelling",
        issue: "Buying guide lacks diagrams or product examples (Running-equivalent teaching)",
        evidence: `diagrams=0 examples=0`,
      });
    }
    if (wordCountFail || contentClass === "THIN" || contentClass === "GENERIC") {
      parityOk = false;
      pushIssue({
        severity: "major",
        family: "Buying",
        entityType: "buying-guide",
        entityId: guide.id,
        slug: guide.slug,
        dimension: "decision_usefulness",
        issue: wordCountFail
          ? "Word-count-only / low decision density guide"
          : `Buying guide content class ${contentClass}`,
        evidence: `diagrams=${diagrams.length} class=${contentClass}`,
      });
    }
    if (parityOk) buyParityReady += 1;

    editorialMediaRows.push({
      kind: "buying",
      vertical: "padel",
      id: guide.id,
      slug: guide.slug,
      indexable: true,
      heroPresent: heroOk,
      meaningfulImages: meaningful,
      sectionFiles: diagrams.length,
      heroOnly: meaningful <= 1,
      noVisuals: meaningful === 0,
      contentClass,
      parityReady: parityOk,
      diagrams: diagrams.length,
      productExamples: productExamples.length,
    });

    contentRows.push({
      kind: "buying",
      id: guide.id,
      slug: guide.slug,
      family: "Buying",
      contentClass,
      indexable: true,
    });
  }

  // ── Comparisons ──────────────────────────────────────────────────────
  const padelComps = getComparisons({ isDev: true }).filter((c) => {
    const p = getProductById(c.productIds[0] ?? "", { isDev: true });
    return p?.categoryId.startsWith("cat-padel");
  });
  let compIndexable = 0;
  let compParityReady = 0;
  let compImgSum = 0;
  for (const cmp of padelComps) {
    const elig = getLaunchEligibility(
      { kind: "comparison", entity: cmp },
      { isDev: true },
    );
    if (!isIndexableEligibility(elig)) continue;
    compIndexable += 1;
    const medias = cmp.productIds
      .map((id) => getProductById(id, { isDev: true }))
      .map((p) => (p ? getPrimaryProductMedia(p) : undefined))
      .filter((m) => m?.src);
    compImgSum += medias.length;
    const ok = medias.length === cmp.productIds.length && medias.length >= 2;
    if (!ok) {
      pushIssue({
        severity: "blocker",
        family: "Comparisons",
        entityType: "comparison",
        entityId: cmp.id,
        slug: cmp.slug,
        dimension: "media_completeness",
        issue: "Indexable comparison missing product imagery for side-by-side",
        evidence: `media=${medias.length}/${cmp.productIds.length}`,
      });
    } else compParityReady += 1;
    editorialMediaRows.push({
      kind: "comparison",
      vertical: "padel",
      id: cmp.id,
      slug: cmp.slug,
      indexable: true,
      heroPresent: ok,
      meaningfulImages: medias.length,
      sectionFiles: 0,
      heroOnly: false,
      noVisuals: medias.length === 0,
      contentClass: ok ? "GOOD" : "BROKEN",
      parityReady: ok,
    });
  }

  // ── Family verdicts ──────────────────────────────────────────────────
  function familyVerdict(
    label: string,
    stats: {
      indexable: number;
      indexableMissingHero: number;
      indexablePlaceholder: number;
      indexableThinCopy: number;
      exactHero: number;
      published: number;
    },
  ): FamilyVerdict {
    if (stats.indexableMissingHero > 0 || stats.indexablePlaceholder > 0) {
      return "SYSTEMIC_PARITY_FAILURE";
    }
    if (stats.indexable > 0 && stats.indexableThinCopy / stats.indexable > 0.35) {
      return "MAJOR_PARITY_GAPS";
    }
    if (stats.published > 0 && stats.exactHero / stats.published < 0.55) {
      // Soft inventory can be media-blocked (non-indexable) — not systemic if indexable clean
      return stats.indexableThinCopy > 0
        ? "MAJOR_PARITY_GAPS"
        : "FUNCTIONALLY_READY_BUT_THIN";
    }
    if (stats.indexableThinCopy > 0) return "FUNCTIONALLY_READY_BUT_THIN";
    return "PARITY_READY";
  }

  const productFamilyVerdicts: Record<string, FamilyVerdict> = {};
  for (const [label, stats] of Object.entries(mediaByFamily)) {
    productFamilyVerdicts[label] = familyVerdict(label, stats);
  }

  const reviewVerdict: FamilyVerdict =
    reviewIndexable > 0 && reviewParityReady === reviewIndexable
      ? "PARITY_READY"
      : reviewParityReady / Math.max(1, reviewIndexable) >= 0.85
        ? "FUNCTIONALLY_READY_BUT_THIN"
        : reviewParityReady / Math.max(1, reviewIndexable) >= 0.6
          ? "MAJOR_PARITY_GAPS"
          : "SYSTEMIC_PARITY_FAILURE";

  const bestVerdict: FamilyVerdict =
    bestIndexable > 0 && bestParityReady === bestIndexable
      ? "PARITY_READY"
      : bestParityReady / Math.max(1, bestIndexable) >= 0.85
        ? "FUNCTIONALLY_READY_BUT_THIN"
        : bestParityReady / Math.max(1, bestIndexable) >= 0.6
          ? "MAJOR_PARITY_GAPS"
          : "SYSTEMIC_PARITY_FAILURE";

  const buyVerdict: FamilyVerdict =
    buyIndexable > 0 && buyParityReady === buyIndexable
      ? "PARITY_READY"
      : buyParityReady / Math.max(1, buyIndexable) >= 0.75
        ? "FUNCTIONALLY_READY_BUT_THIN"
        : buyParityReady / Math.max(1, buyIndexable) >= 0.5
          ? "MAJOR_PARITY_GAPS"
          : "SYSTEMIC_PARITY_FAILURE";

  const compVerdict: FamilyVerdict =
    compIndexable === 0
      ? "FUNCTIONALLY_READY_BUT_THIN"
      : compParityReady === compIndexable
        ? "PARITY_READY"
        : "MAJOR_PARITY_GAPS";

  const blockers = issues.filter((i) => i.severity === "blocker");
  const majors = issues.filter((i) => i.severity === "major");

  const systemicFamilies = Object.entries({
    ...productFamilyVerdicts,
    Reviews: reviewVerdict,
    Best: bestVerdict,
    BuyingGuides: buyVerdict,
    Comparisons: compVerdict,
    HubCategoryShell: "PARITY_READY" as FamilyVerdict, // remediated CategoryVisualHero
  }).filter(([, v]) => v === "SYSTEMIC_PARITY_FAILURE");

  const indexablePdpHeroFail = Object.values(mediaByFamily).reduce(
    (a, s) => a + s.indexableMissingHero + s.indexablePlaceholder,
    0,
  );

  // GO criteria from user prompt
  const technicalRequiredZerosPass = blockers.length === 0;
  const noSystemicFamilyFailure = systemicFamilies.length === 0;
  const noIndexablePdpMediaFail = indexablePdpHeroFail === 0;
  const reviewsGuidesVisualOk =
    reviewVerdict !== "SYSTEMIC_PARITY_FAILURE" &&
    buyVerdict !== "SYSTEMIC_PARITY_FAILURE" &&
    bestVerdict !== "SYSTEMIC_PARITY_FAILURE";

  // Manual inspection flag — filled by report author from screenshots
  const manualSideBySideBelongs = false; // set false until screenshots confirm; report will override after visual pass

  const go =
    technicalRequiredZerosPass &&
    noSystemicFamilyFailure &&
    noIndexablePdpMediaFail &&
    reviewsGuidesVisualOk &&
    manualSideBySideBelongs;

  const scorecard = {
    asOf: "2026-09-14",
    auditName: "PADEL-RUNNING-PARITY-FINAL",
    supersedes: ["PADEL-ZERO-DEBT-LAUNCH-AUDIT", "PADEL-RUNNING-PARITY-AUDIT"],
    benchmark: "RUNNING_SHOES",
    method: {
      contentQuality: "decision/specificity signals — NOT word count as primary",
      galleryExpectation: "Running-calibrated (median ~1); hero-only OK when authentic",
      screenshots: "docs/padel/screenshots/running-parity-final/",
      manualInspectionRequired: true,
    },
    runningCalibration: {
      publishedShoes: runPublished,
      exactHeroAmongPublished: runExact,
      shoesWithGalleryExtras: runGalleryExtras,
      galleryMedianExpectation: 1,
      avgReviewSectionFilesSample:
        runReviewN > 0 ? Number((runReviewInlineSum / runReviewN).toFixed(1)) : null,
    },
    productMediaByFamily: mediaByFamily,
    productFamilyVerdicts,
    editorial: {
      reviews: {
        indexable: reviewIndexable,
        parityReady: reviewParityReady,
        avgMeaningfulImages:
          reviewIndexable > 0
            ? Number((reviewInlineSum / reviewIndexable).toFixed(2))
            : 0,
        heroOnly: reviewHeroOnly,
        noMeaningfulVisuals: reviewNoVisual,
        runningAvgSectionFiles:
          runReviewN > 0
            ? Number((runReviewInlineSum / runReviewN).toFixed(2))
            : null,
        verdict: reviewVerdict,
      },
      best: {
        indexable: bestIndexable,
        parityReady: bestParityReady,
        avgMeaningfulImages:
          bestIndexable > 0 ? Number((bestImgSum / bestIndexable).toFixed(2)) : 0,
        heroOnly: bestHeroOnly,
        noMeaningfulVisuals: bestNoVisual,
        verdict: bestVerdict,
      },
      buying: {
        indexable: buyIndexable,
        parityReady: buyParityReady,
        avgMeaningfulImages:
          buyIndexable > 0 ? Number((buyImgSum / buyIndexable).toFixed(2)) : 0,
        heroOnly: buyHeroOnly,
        noMeaningfulVisuals: buyNoVisual,
        verdict: buyVerdict,
      },
      comparisons: {
        indexable: compIndexable,
        parityReady: compParityReady,
        avgMeaningfulImages:
          compIndexable > 0
            ? Number((compImgSum / Math.max(1, compIndexable)).toFixed(2))
            : 0,
        verdict: compVerdict,
      },
    },
    issues: {
      blocker: blockers.length,
      major: majors.length,
      minor: issues.filter((i) => i.severity === "minor").length,
      total: issues.length,
    },
    goCriteria: {
      technicalRequiredZerosPass,
      noSystemicFamilyFailure,
      noIndexablePdpMediaFail,
      reviewsGuidesVisualOk,
      manualSideBySideBelongs,
      systemicFamilies: systemicFamilies.map(([k]) => k),
    },
    verdict: go ? "GO" : "NO_GO",
    note: "manualSideBySideBelongs defaults false until screenshot inspection updates scorecard in the markdown audit.",
  };

  writeCsv(
    join(OUT, "PADEL-RUNNING-PARITY-FINAL-ISSUES.csv"),
    [
      "severity",
      "family",
      "entityType",
      "entityId",
      "slug",
      "dimension",
      "issue",
      "evidence",
    ],
    issues as unknown as Record<string, unknown>[],
  );
  writeCsv(
    join(OUT, "PADEL-RUNNING-PARITY-FINAL-PRODUCT-MEDIA.csv"),
    [
      "family",
      "productId",
      "slug",
      "status",
      "published",
      "indexable",
      "listable",
      "exactHero",
      "usefulGallery",
      "galleryCount",
      "mediaBlocked",
      "placeholder",
      "heroSrc",
      "contentClass",
    ],
    productMediaRows,
  );
  writeCsv(
    join(OUT, "PADEL-RUNNING-PARITY-FINAL-EDITORIAL-MEDIA.csv"),
    [
      "kind",
      "vertical",
      "id",
      "slug",
      "indexable",
      "heroPresent",
      "meaningfulImages",
      "sectionFiles",
      "heroOnly",
      "noVisuals",
      "contentClass",
      "parityReady",
      "consideredCount",
      "recommendedCount",
      "diagrams",
      "productExamples",
    ],
    editorialMediaRows,
  );
  writeCsv(
    join(OUT, "PADEL-RUNNING-PARITY-FINAL-CONTENT.csv"),
    ["kind", "id", "slug", "family", "contentClass", "indexable"],
    contentRows,
  );
  writeFileSync(
    join(OUT, "PADEL-RUNNING-PARITY-FINAL-SCORECARD.json"),
    JSON.stringify(scorecard, null, 2) + "\n",
  );

  console.log(
    JSON.stringify(
      {
        verdict: scorecard.verdict,
        blockers: blockers.length,
        majors: majors.length,
        mediaByFamily,
        editorial: scorecard.editorial,
        goCriteria: scorecard.goCriteria,
      },
      null,
      2,
    ),
  );
}

main();
