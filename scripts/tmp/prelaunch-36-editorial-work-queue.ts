/**
 * Editorial Completion 36 — master editorial readiness queue (READ-ONLY).
 * Does not mutate content.
 *
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-36-editorial-work-queue.ts
 */
import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessReviewLaunchQuality,
  assessBestGuideLaunchQuality,
  assessComparisonLaunchQuality,
} from "@/domain/launch";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { isUseCaseGuide } from "@/lib/best/use-case-config";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAlternativesFromGraph } from "@/repositories/relationships";
import { getAllProductRelationships } from "@/repositories/relationships";
import {
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getGearSetups,
} from "@/repositories/editorial";
import {
  getProducts,
  getBrands,
  getProductById,
} from "@/repositories/products";
import {
  getCategories,
  getSportById,
} from "@/repositories/sports";
import {
  CATEGORY_PAGE_CONFIGS,
  getCategoryPageConfig,
} from "@/lib/catalog/running-shoes";

const PROD = { isDev: false as const };
const OUT_DIR = join(process.cwd(), "docs/prelaunch/editorial");
const DATA_DIR = join(OUT_DIR, "data");
mkdirSync(DATA_DIR, { recursive: true });

export type WorkState =
  | "READY"
  | "NEEDS_UNIQUE_REWRITE"
  | "NEEDS_RESEARCH"
  | "NEEDS_EVIDENCE"
  | "NEEDS_RELATIONSHIP_FIX"
  | "NEEDS_INTENT_DIFFERENTIATION"
  | "BROKEN"
  | "BLOCKED_INTENTIONALLY";

export type Priority = "P0" | "P1" | "P2";

export type EditorialType =
  | "review"
  | "best-guide"
  | "best-guide-use-case"
  | "buying-guide"
  | "long-form-guide"
  | "explainer"
  | "comparison"
  | "alternatives"
  | "gear-setup"
  | "brand-hub"
  | "category-decision";

type UniquenessClass =
  | "GENUINELY_UNIQUE"
  | "TEMPLATE_SIMILAR_ACCEPTABLE"
  | "NEEDS_DIFFERENTIATION"
  | "DUPLICATIVE"
  | "UNKNOWN"
  | "N/A";

interface QueueRow {
  id: string;
  slug: string;
  route: string;
  type: EditorialType;
  sport: string;
  sportIds: string[];
  status: string;
  qualityClassification: string;
  uniquenessClassification: UniquenessClass;
  workState: WorkState;
  workStateReasons: string[];
  priority: Priority;
  productRelationships: string[];
  evidenceCoverage: string;
  internalLinks: string;
  indexability: string;
  reasonHeld: string;
  title?: string;
}

const WORK_RANK: Record<WorkState, number> = {
  BROKEN: 0,
  NEEDS_UNIQUE_REWRITE: 1,
  NEEDS_INTENT_DIFFERENTIATION: 2,
  NEEDS_RELATIONSHIP_FIX: 3,
  NEEDS_EVIDENCE: 4,
  NEEDS_RESEARCH: 5,
  BLOCKED_INTENTIONALLY: 6,
  READY: 7,
};

function pickPrimary(states: WorkState[]): WorkState {
  return [...states].sort((a, b) => WORK_RANK[a] - WORK_RANK[b])[0]!;
}

function sportSlug(sportIds: string[]): string {
  if (!sportIds.length) return "unknown";
  if (sportIds.includes("sport-running")) return "running";
  if (sportIds.includes("sport-training") || sportIds.includes("sport-hyrox"))
    return "fitness";
  if (sportIds.includes("sport-padel")) return "padel";
  if (sportIds.includes("sport-tennis")) return "tennis";
  const s = getSportById(sportIds[0]!);
  return s?.slug ?? sportIds[0]!;
}

function priorityFor(sport: string, type: EditorialType): Priority {
  if (sport === "running") {
    if (
      [
        "review",
        "best-guide",
        "best-guide-use-case",
        "buying-guide",
        "long-form-guide",
        "explainer",
        "comparison",
        "alternatives",
        "gear-setup",
        "category-decision",
      ].includes(type)
    ) {
      return "P0";
    }
    if (type === "brand-hub") return "P0";
  }
  if (sport === "fitness" || sport === "hyrox" || sport === "padel" || sport === "tennis") {
    return "P1";
  }
  // Multi-sport / unknown racket-ish
  if (["padel", "tennis"].some((s) => sport.includes(s))) return "P1";
  return "P2";
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

// ── Uniqueness maps from Fix 25 artifact ───────────────────────────────────
const uniquenessByKey = new Map<string, UniquenessClass>();

function loadUniqueness() {
  const path = "docs/prelaunch/data/25-content-uniqueness.json";
  if (!existsSync(path)) return;
  const data = JSON.parse(readFileSync(path, "utf8")) as {
    holdSlugs?: string[];
    clusters?: {
      reviewsDuplicative?: { slug?: string; id?: string }[];
      reviewsNeedsDiff?: { slug?: string; id?: string }[];
      comparisonsNeedsDiff?: { slug?: string; id?: string }[];
    };
    topBestPairs?: { a: string; b: string; score: number }[];
    topGuidePairs?: { a: string; b: string; score: number }[];
    topComparisonPairs?: { a: string; b: string; score: number }[];
  };

  for (const row of data.clusters?.reviewsDuplicative ?? []) {
    const slug = row.slug ?? row.id?.replace(/^review-/, "");
    if (slug) uniquenessByKey.set(`review:${slug}`, "DUPLICATIVE");
  }
  for (const row of data.clusters?.reviewsNeedsDiff ?? []) {
    const slug = row.slug ?? row.id?.replace(/^review-/, "");
    if (slug) uniquenessByKey.set(`review:${slug}`, "NEEDS_DIFFERENTIATION");
  }
  for (const row of data.clusters?.comparisonsNeedsDiff ?? []) {
    const slug = row.slug ?? row.id?.replace(/^comparison-/, "");
    if (slug) uniquenessByKey.set(`comparison:${slug}`, "NEEDS_DIFFERENTIATION");
  }
  for (const slug of data.holdSlugs ?? []) {
    const key = `review:${slug}`;
    if (!uniquenessByKey.has(key)) uniquenessByKey.set(key, "DUPLICATIVE");
  }

  // Mild best/guide/comparison pairs → acceptable template unless needs-diff already set
  for (const pair of data.topBestPairs ?? []) {
    for (const slug of [pair.a, pair.b]) {
      const key = `best:${slug}`;
      if (!uniquenessByKey.has(key)) {
        uniquenessByKey.set(
          key,
          pair.score >= 0.75
            ? "NEEDS_DIFFERENTIATION"
            : "TEMPLATE_SIMILAR_ACCEPTABLE",
        );
      }
    }
  }
  for (const pair of data.topGuidePairs ?? []) {
    for (const slug of [pair.a, pair.b]) {
      const key = `guide:${slug}`;
      if (!uniquenessByKey.has(key)) {
        uniquenessByKey.set(
          key,
          pair.score >= 0.75
            ? "NEEDS_DIFFERENTIATION"
            : "TEMPLATE_SIMILAR_ACCEPTABLE",
        );
      }
    }
  }
  for (const pair of data.topComparisonPairs ?? []) {
    for (const slug of [pair.a, pair.b]) {
      const key = `comparison:${slug}`;
      if (!uniquenessByKey.has(key) && pair.score >= 0.7) {
        uniquenessByKey.set(key, "TEMPLATE_SIMILAR_ACCEPTABLE");
      }
    }
  }
}

function uniquenessFor(
  kind: string,
  slug: string,
  fallback: UniquenessClass = "UNKNOWN",
): UniquenessClass {
  return uniquenessByKey.get(`${kind}:${slug}`) ?? fallback;
}

loadUniqueness();

const rows: QueueRow[] = [];
const allRels = getAllProductRelationships();

function evidenceLabel(ids: string[] | undefined): string {
  const n = ids?.length ?? 0;
  if (n === 0) return "none";
  if (n === 1) return "thin (1)";
  if (n <= 3) return `moderate (${n})`;
  return `strong (${n})`;
}

// ── Reviews ────────────────────────────────────────────────────────────────
for (const review of getReviews({ isDev: true })) {
  const product = getProductById(review.productId, { isDev: true });
  const sportIds = product?.sportIds ?? [];
  const sport = sportSlug(sportIds);
  const assessed = assessReviewLaunchQuality(review, PROD);
  const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);

  let uniq = uniquenessFor("review", review.slug);
  if (isContentUniquenessReviewHeld(review.slug) && uniq === "UNKNOWN") {
    uniq = "DUPLICATIVE";
  }
  if (assessed.quality === "DUPLICATIVE") uniq = "DUPLICATIVE";
  if (uniq === "UNKNOWN" && assessed.quality === "LAUNCH_READY") {
    uniq = "GENUINELY_UNIQUE";
  }

  const states: WorkState[] = [];
  const reasons: string[] = [];

  if (!product) {
    states.push("BROKEN");
    reasons.push("orphan_product");
  }
  if (review.status === "archived") {
    states.push("BLOCKED_INTENTIONALLY");
    reasons.push("archived");
  }
  if (uniq === "DUPLICATIVE" || assessed.quality === "DUPLICATIVE") {
    states.push("NEEDS_UNIQUE_REWRITE");
    reasons.push("uniqueness_duplicative");
  } else if (uniq === "NEEDS_DIFFERENTIATION") {
    states.push("NEEDS_INTENT_DIFFERENTIATION");
    reasons.push("uniqueness_needs_diff");
  }
  if ((review.evidenceIds?.length ?? 0) === 0) {
    states.push("NEEDS_EVIDENCE");
    reasons.push("no_evidence_ids");
  }
  if (
    assessed.quality === "THIN" ||
    assessed.quality === "INCOMPLETE" ||
    assessed.quality === "NEEDS_MINOR_WORK"
  ) {
    states.push("NEEDS_RESEARCH");
    reasons.push(`quality_${assessed.quality}`);
  }
  if (
    states.length === 0 &&
    (assessed.quality === "LAUNCH_READY" ||
      (assessed.quality === "NEEDS_MINOR_WORK" && uniq === "GENUINELY_UNIQUE"))
  ) {
    // NMW still needs research unless already pushed
  }
  if (
    assessed.quality === "LAUNCH_READY" &&
    (uniq === "GENUINELY_UNIQUE" ||
      uniq === "TEMPLATE_SIMILAR_ACCEPTABLE" ||
      uniq === "UNKNOWN") &&
    (review.evidenceIds?.length ?? 0) >= 1 &&
    product
  ) {
    states.push("READY");
    reasons.push("launch_ready_unique");
  } else if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  // If READY and also other states, pickPrimary drops READY unless alone
  const workState = pickPrimary(states);
  const type: EditorialType = "review";

  rows.push({
    id: review.id,
    slug: review.slug,
    route: `/reviews/${review.slug}`,
    type,
    sport,
    sportIds,
    status: review.status,
    qualityClassification: assessed.quality,
    uniquenessClassification: uniq,
    workState,
    workStateReasons: reasons,
    priority: priorityFor(sport, type),
    productRelationships: product
      ? [`product:${product.slug}`]
      : [`missing:${review.productId}`],
    evidenceCoverage: evidenceLabel(review.evidenceIds),
    internalLinks: [
      review.alternativeProductIds?.length
        ? `alts:${review.alternativeProductIds.length}`
        : "",
      review.comparisonIds?.length ? `comps:${review.comparisonIds.length}` : "",
    ]
      .filter(Boolean)
      .join("|") || "sparse",
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: review.title,
  });
}

// ── Best guides ────────────────────────────────────────────────────────────
for (const guide of getBestGuides({ isDev: true })) {
  const sportIds = guide.sportId ? [guide.sportId] : [];
  const sport = sportSlug(sportIds);
  const assessed = assessBestGuideLaunchQuality(guide, PROD);
  const elig = getLaunchEligibility(
    { kind: "best-guide", entity: guide },
    PROD,
  );
  const useCase = isUseCaseGuide(guide);
  const type: EditorialType = useCase ? "best-guide-use-case" : "best-guide";
  const uniq = uniquenessFor("best", guide.slug, "GENUINELY_UNIQUE");

  const states: WorkState[] = [];
  const reasons: string[] = [];
  const missingProducts: string[] = [];
  for (const rec of guide.recommendations ?? []) {
    const p = getProductById(rec.productId, { isDev: true });
    if (!p) missingProducts.push(rec.productId);
  }
  if (missingProducts.length) {
    states.push("BROKEN");
    reasons.push(`missing_products:${missingProducts.length}`);
  }
  if (uniq === "DUPLICATIVE") {
    states.push("NEEDS_UNIQUE_REWRITE");
    reasons.push("uniqueness_duplicative");
  } else if (uniq === "NEEDS_DIFFERENTIATION") {
    states.push("NEEDS_INTENT_DIFFERENTIATION");
    reasons.push("uniqueness_needs_diff");
  }
  if ((guide.evidenceIds?.length ?? 0) === 0 && !guide.methodologySummary) {
    states.push("NEEDS_EVIDENCE");
    reasons.push("no_evidence_or_methodology");
  }
  if (
    assessed.quality === "THIN" ||
    assessed.quality === "NEEDS_MINOR_WORK" ||
    assessed.quality === "INCOMPLETE"
  ) {
    states.push("NEEDS_RESEARCH");
    reasons.push(`quality_${assessed.quality}`);
  }
  if (assessed.quality === "LAUNCH_READY" && missingProducts.length === 0) {
    if (
      uniq === "GENUINELY_UNIQUE" ||
      uniq === "TEMPLATE_SIMILAR_ACCEPTABLE" ||
      uniq === "UNKNOWN"
    ) {
      states.push("READY");
      reasons.push("launch_ready");
    }
  }
  if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  rows.push({
    id: guide.id,
    slug: guide.slug,
    route: `/best/${guide.slug}`,
    type,
    sport,
    sportIds,
    status: guide.status,
    qualityClassification: assessed.quality,
    uniquenessClassification: uniq,
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, type),
    productRelationships: (guide.recommendations ?? [])
      .slice(0, 12)
      .map((r) => {
        const p = getProductById(r.productId, { isDev: true });
        return p ? `product:${p.slug}` : `missing:${r.productId}`;
      }),
    evidenceCoverage: evidenceLabel(guide.evidenceIds),
    internalLinks: guide.methodologySummary ? "methodology" : "thin_links",
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: guide.title,
  });
}

// ── Buying / long-form / explainer guides ──────────────────────────────────
for (const guide of getBuyingGuides({ isDev: true })) {
  const sportIds = guide.sportId ? [guide.sportId] : [];
  const sport = sportSlug(sportIds);
  const assessed = assessGuideQuality(guide);
  const elig = getLaunchEligibility(
    { kind: "buying-guide", entity: guide },
    PROD,
  );
  const lf = getLongFormGuideConfig(guide.slug);
  const isExplainer = lf?.layout === "explainer";
  const isLongForm = Boolean(lf);
  const type: EditorialType = isExplainer
    ? "explainer"
    : isLongForm
      ? "long-form-guide"
      : "buying-guide";

  const uniq = uniquenessFor("guide", guide.slug, "GENUINELY_UNIQUE");
  const states: WorkState[] = [];
  const reasons: string[] = [];

  if (uniq === "DUPLICATIVE") {
    states.push("NEEDS_UNIQUE_REWRITE");
    reasons.push("uniqueness_duplicative");
  } else if (uniq === "NEEDS_DIFFERENTIATION") {
    states.push("NEEDS_INTENT_DIFFERENTIATION");
    reasons.push("uniqueness_needs_diff");
  }
  if (
    assessed.status === "needs-research" ||
    assessed.status === "thin" ||
    assessed.status === "stale" ||
    assessed.status === "needs-editorial-review"
  ) {
    if (assessed.status === "needs-research") {
      states.push("NEEDS_RESEARCH");
    } else if (assessed.status === "thin" || assessed.status === "stale") {
      states.push("NEEDS_RESEARCH");
    } else {
      states.push("NEEDS_RESEARCH");
    }
    reasons.push(`guide_${assessed.status}`);
  }
  if (assessed.status === "blocked") {
    states.push("BLOCKED_INTENTIONALLY");
    reasons.push("guide_blocked");
  }
  if (
    !assessed.blockCoverage.evidenceNote &&
    (guide.evidenceIds?.length ?? 0) === 0
  ) {
    states.push("NEEDS_EVIDENCE");
    reasons.push("weak_evidence");
  }
  if (assessed.status === "complete") {
    states.push("READY");
    reasons.push("guide_complete");
  }
  if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  rows.push({
    id: guide.id,
    slug: guide.slug,
    route: `/guides/${guide.slug}`,
    type,
    sport,
    sportIds,
    status: guide.status,
    qualityClassification: assessed.status,
    uniquenessClassification: uniq,
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, type),
    productRelationships: (guide.relatedProductIds ?? [])
      .slice(0, 8)
      .map((id) => {
        const p = getProductById(id, { isDev: true });
        return p ? `product:${p.slug}` : `missing:${id}`;
      }),
    evidenceCoverage: evidenceLabel(guide.evidenceIds),
    internalLinks: [
      assessed.blockCoverage.finderCta ? "finder" : "",
      assessed.blockCoverage.bestGuideCta ? "best" : "",
      assessed.blockCoverage.compareLink ? "compare" : "",
      assessed.blockCoverage.relatedGuides ? "related" : "",
    ]
      .filter(Boolean)
      .join("|") || "sparse",
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: guide.title,
  });
}

// ── Comparisons ────────────────────────────────────────────────────────────
for (const cmp of getComparisons({ isDev: true })) {
  const products = cmp.productIds
    .map((id) => getProductById(id, { isDev: true }))
    .filter(Boolean);
  const sportIds = [
    ...new Set(products.flatMap((p) => p!.sportIds)),
  ];
  const sport = sportSlug(sportIds);
  const assessed = assessComparisonLaunchQuality(cmp, PROD);
  const elig = getLaunchEligibility(
    { kind: "comparison", entity: cmp },
    PROD,
  );
  const uniq = uniquenessFor("comparison", cmp.slug, "GENUINELY_UNIQUE");

  const states: WorkState[] = [];
  const reasons: string[] = [];
  const missing = cmp.productIds.filter(
    (id) => !getProductById(id, { isDev: true }),
  );
  if (missing.length || products.length < 2) {
    states.push("BROKEN");
    reasons.push(
      missing.length
        ? `missing_peers:${missing.length}`
        : "insufficient_products",
    );
  }
  if (uniq === "DUPLICATIVE") {
    states.push("NEEDS_UNIQUE_REWRITE");
    reasons.push("uniqueness_duplicative");
  } else if (uniq === "NEEDS_DIFFERENTIATION") {
    states.push("NEEDS_INTENT_DIFFERENTIATION");
    reasons.push("uniqueness_needs_diff");
  }
  if (
    assessed.quality === "THIN" ||
    assessed.quality === "INCOMPLETE" ||
    assessed.quality === "BLOCKED"
  ) {
    if (assessed.quality === "BLOCKED") {
      states.push("BLOCKED_INTENTIONALLY");
    } else {
      states.push("NEEDS_RESEARCH");
    }
    reasons.push(`quality_${assessed.quality}`);
  }
  if (assessed.quality === "MEANINGFUL" && missing.length === 0) {
    states.push("READY");
    reasons.push("meaningful_comparison");
  }
  if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  rows.push({
    id: cmp.id,
    slug: cmp.slug,
    route: `/compare/${cmp.slug}`,
    type: "comparison",
    sport,
    sportIds,
    status: cmp.status,
    qualityClassification: assessed.quality,
    uniquenessClassification: uniq,
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, "comparison"),
    productRelationships: cmp.productIds.map((id) => {
      const p = getProductById(id, { isDev: true });
      return p ? `product:${p.slug}` : `missing:${id}`;
    }),
    evidenceCoverage: "n/a",
    internalLinks: "pairwise",
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: cmp.title,
  });
}

// ── Alternatives pages ─────────────────────────────────────────────────────
for (const product of getProducts({ isDev: true })) {
  if (product.status === "archived") continue;
  const graphAlts = getAlternativesFromGraph(product.id);
  const rels = allRels.filter((r) => r.sourceProductId === product.id);
  const gate = canPublishAlternativesPage(product, rels);
  // Include pages that exist in estate (have any alts OR product lists alternatives)
  const hasFieldAlts = (product.alternativeProductIds?.length ?? 0) > 0;
  if (!gate.ok && graphAlts.length === 0 && !hasFieldAlts) continue;

  const sport = sportSlug(product.sportIds);
  const elig = getLaunchEligibility(
    { kind: "alternatives", entity: product },
    PROD,
  );
  const states: WorkState[] = [];
  const reasons: string[] = [];

  if (!gate.ok) {
    states.push("NEEDS_RELATIONSHIP_FIX");
    reasons.push(...gate.reasons.slice(0, 4));
  }
  if (graphAlts.length === 0 && hasFieldAlts) {
    states.push("NEEDS_RELATIONSHIP_FIX");
    reasons.push("field_alts_without_graph");
  }
  if (gate.ok) {
    states.push("READY");
    reasons.push("alternatives_eligible");
  }
  if (states.length === 0) {
    states.push("NEEDS_RELATIONSHIP_FIX");
    reasons.push("incomplete_alts");
  }

  rows.push({
    id: `alts-${product.id}`,
    slug: product.slug,
    route: `/products/${product.slug}/alternatives`,
    type: "alternatives",
    sport,
    sportIds: product.sportIds,
    status: product.status,
    qualityClassification: gate.ok ? "ELIGIBLE" : "INELIGIBLE",
    uniquenessClassification: "N/A",
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, "alternatives"),
    productRelationships: [
      `source:${product.slug}`,
      ...graphAlts.slice(0, 8).map((a) => {
        const p = getProductById(a.targetProductId, { isDev: true });
        return p ? `alt:${p.slug}` : `missing:${a.targetProductId}`;
      }),
    ],
    evidenceCoverage: "n/a",
    internalLinks: `alts:${gate.alternativeCount}|types:${gate.uniqueTypes}`,
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: `${product.fullName} alternatives`,
  });
}

// ── Gear setups ────────────────────────────────────────────────────────────
for (const setup of getGearSetups({ isDev: true })) {
  const sportIds = setup.sportId ? [setup.sportId] : [];
  const sport = sportSlug(sportIds);
  const elig = getLaunchEligibility({ kind: "setup", entity: setup }, PROD);
  const states: WorkState[] = [];
  const reasons: string[] = [];
  const missing: string[] = [];
  for (const item of setup.items ?? []) {
    if (!getProductById(item.productId, { isDev: true })) {
      missing.push(item.productId);
    }
  }
  if (missing.length) {
    states.push("BROKEN");
    reasons.push(`missing_products:${missing.length}`);
  }
  if ((setup.items?.length ?? 0) < 3) {
    states.push("NEEDS_RESEARCH");
    reasons.push("thin_kit");
  }
  const descLen = (setup.description ?? "").trim().length;
  if (descLen < 40) {
    states.push("NEEDS_RESEARCH");
    reasons.push("thin_description");
  }
  if (
    missing.length === 0 &&
    (setup.items?.length ?? 0) >= 3 &&
    descLen >= 40
  ) {
    states.push("READY");
    reasons.push("setup_complete");
  }
  if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  rows.push({
    id: setup.id,
    slug: setup.slug,
    route: `/setups/${setup.slug}`,
    type: "gear-setup",
    sport,
    sportIds,
    status: setup.status,
    qualityClassification:
      missing.length === 0 && (setup.items?.length ?? 0) >= 3
        ? "STRUCTURALLY_OK"
        : "THIN",
    uniquenessClassification: "N/A",
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, "gear-setup"),
    productRelationships: (setup.items ?? []).map((i) => {
      const p = getProductById(i.productId, { isDev: true });
      return p ? `product:${p.slug}` : `missing:${i.productId}`;
    }),
    evidenceCoverage: "n/a",
    internalLinks: "kit",
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: setup.title,
  });
}

// ── Brand hubs ─────────────────────────────────────────────────────────────
for (const brand of getBrands({ isDev: true })) {
  const brandProducts = getProducts({ isDev: true }).filter(
    (p) => p.brandId === brand.id && p.status === "published",
  );
  if (brandProducts.length === 0) continue;
  const sportIds = [...new Set(brandProducts.flatMap((p) => p.sportIds))];
  const sport = sportSlug(sportIds);
  const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
  const descLen = (brand.description ?? "").trim().length;
  const states: WorkState[] = [];
  const reasons: string[] = [];

  if (descLen < 40) {
    states.push("NEEDS_RESEARCH");
    reasons.push("thin_brand_description");
  }
  if (descLen >= 120) {
    states.push("READY");
    reasons.push("brand_copy_ok");
  } else if (descLen >= 40) {
    states.push("NEEDS_RESEARCH");
    reasons.push("brand_copy_shallow");
  }
  if (states.length === 0) {
    states.push("NEEDS_RESEARCH");
    reasons.push("not_ready_default");
  }

  rows.push({
    id: brand.id,
    slug: brand.slug,
    route: `/brands/${brand.slug}`,
    type: "brand-hub",
    sport,
    sportIds,
    status: brand.status,
    qualityClassification:
      descLen >= 120 ? "ADEQUATE" : descLen >= 40 ? "SHALLOW" : "THIN",
    uniquenessClassification: "N/A",
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, "brand-hub"),
    productRelationships: brandProducts
      .slice(0, 8)
      .map((p) => `product:${p.slug}`),
    evidenceCoverage: "n/a",
    internalLinks: `products:${brandProducts.length}`,
    indexability: elig.disposition,
    reasonHeld: isIndexableEligibility(elig)
      ? ""
      : elig.reasons.map((r) => r.code).join("|"),
    title: brand.name,
  });
}

// ── Category decision content ──────────────────────────────────────────────
for (const [configKey, cfg] of Object.entries(CATEGORY_PAGE_CONFIGS)) {
  const [sportKey, categorySlug] = configKey.split(":");
  const sport = sportKey ?? "running";
  const intro =
    cfg.hero?.description ??
    cfg.finder?.description ??
    cfg.educationFactors?.map((f) => f.body).join(" ") ??
    "";
  const states: WorkState[] = [];
  const reasons: string[] = [];
  if (intro.trim().length < 80) {
    states.push("NEEDS_RESEARCH");
    reasons.push("thin_category_decision_copy");
  } else {
    states.push("READY");
    reasons.push("category_decision_present");
  }

  const route =
    categorySlug === "running-shoes"
      ? "/running/shoes"
      : `/running/${categorySlug}`;

  rows.push({
    id: `cat-decision-${configKey}`,
    slug: categorySlug ?? configKey,
    route,
    type: "category-decision",
    sport,
    sportIds: sport === "running" ? ["sport-running"] : [],
    status: "published",
    qualityClassification:
      intro.trim().length >= 80 ? "CONFIGURED" : "THIN_CONFIG",
    uniquenessClassification: "N/A",
    workState: pickPrimary(states),
    workStateReasons: reasons,
    priority: priorityFor(sport, "category-decision"),
    productRelationships: [],
    evidenceCoverage: "n/a",
    internalLinks: "category_config",
    indexability: "N/A",
    reasonHeld: "",
    title: cfg.hero?.title ?? categorySlug,
  });
}

// Also flag Running categories lacking a deep config
for (const cat of getCategories({ isDev: true })) {
  if (!cat.sportIds?.includes("sport-running")) continue;
  if (getCategoryPageConfig("running", cat.slug)) continue;
  rows.push({
    id: `cat-decision-missing-${cat.id}`,
    slug: cat.slug,
    route: `/running/${cat.slug}`,
    type: "category-decision",
    sport: "running",
    sportIds: ["sport-running"],
    status: "published",
    qualityClassification: "MISSING_CONFIG",
    uniquenessClassification: "N/A",
    workState: "NEEDS_RESEARCH",
    workStateReasons: ["missing_category_decision_config"],
    priority: "P0",
    productRelationships: [],
    evidenceCoverage: "n/a",
    internalLinks: "none",
    indexability: "N/A",
    reasonHeld: "",
    title: cat.name,
  });
}

// ── Sort & aggregate ───────────────────────────────────────────────────────
rows.sort((a, b) => {
  const p = a.priority.localeCompare(b.priority);
  if (p) return p;
  const w = WORK_RANK[a.workState] - WORK_RANK[b.workState];
  if (w) return w;
  return a.route.localeCompare(b.route);
});

const byWorkState: Record<string, number> = {};
const byPriority: Record<string, number> = {};
const byType: Record<string, number> = {};
const bySport: Record<string, number> = {};
const byPriorityWork: Record<string, Record<string, number>> = {};

for (const r of rows) {
  byWorkState[r.workState] = (byWorkState[r.workState] || 0) + 1;
  byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
  byType[r.type] = (byType[r.type] || 0) + 1;
  bySport[r.sport] = (bySport[r.sport] || 0) + 1;
  if (!byPriorityWork[r.priority]) byPriorityWork[r.priority] = {};
  byPriorityWork[r.priority]![r.workState] =
    (byPriorityWork[r.priority]![r.workState] || 0) + 1;
}

const p0NotReady = rows.filter(
  (r) => r.priority === "P0" && r.workState !== "READY",
);

const payload = {
  generatedAt: new Date().toISOString(),
  policy:
    "Complete entire existing editorial estate before launch. Indexation ≠ editorial readiness.",
  totals: {
    items: rows.length,
    byWorkState,
    byPriority,
    byType,
    bySport,
    byPriorityWork,
    p0NotReady: p0NotReady.length,
    ready: byWorkState.READY ?? 0,
  },
  remediationCounts: {
    NEEDS_UNIQUE_REWRITE: byWorkState.NEEDS_UNIQUE_REWRITE ?? 0,
    NEEDS_INTENT_DIFFERENTIATION:
      byWorkState.NEEDS_INTENT_DIFFERENTIATION ?? 0,
    NEEDS_RESEARCH: byWorkState.NEEDS_RESEARCH ?? 0,
    NEEDS_EVIDENCE: byWorkState.NEEDS_EVIDENCE ?? 0,
    NEEDS_RELATIONSHIP_FIX: byWorkState.NEEDS_RELATIONSHIP_FIX ?? 0,
    BROKEN: byWorkState.BROKEN ?? 0,
    BLOCKED_INTENTIONALLY: byWorkState.BLOCKED_INTENTIONALLY ?? 0,
    READY: byWorkState.READY ?? 0,
  },
  items: rows,
};

writeFileSync(
  join(DATA_DIR, "editorial-work-queue.json"),
  JSON.stringify(payload, null, 2),
);

const header = [
  "priority",
  "workState",
  "type",
  "sport",
  "slug",
  "route",
  "status",
  "qualityClassification",
  "uniquenessClassification",
  "indexability",
  "reasonHeld",
  "evidenceCoverage",
  "internalLinks",
  "productRelationships",
  "workStateReasons",
  "title",
];

const csvLines = [
  header.join(","),
  ...rows.map((r) =>
    [
      r.priority,
      r.workState,
      r.type,
      r.sport,
      r.slug,
      r.route,
      r.status,
      r.qualityClassification,
      r.uniquenessClassification,
      r.indexability,
      r.reasonHeld,
      r.evidenceCoverage,
      r.internalLinks,
      r.productRelationships.join(";"),
      r.workStateReasons.join(";"),
      r.title ?? "",
    ]
      .map((x) => csvEscape(String(x)))
      .join(","),
  ),
];
writeFileSync(join(DATA_DIR, "editorial-work-queue.csv"), csvLines.join("\n"));

console.log(
  JSON.stringify(
    {
      items: rows.length,
      remediationCounts: payload.remediationCounts,
      byPriority,
      byType,
      p0NotReady: p0NotReady.length,
      p0Ready: rows.filter((r) => r.priority === "P0" && r.workState === "READY")
        .length,
    },
    null,
    2,
  ),
);
