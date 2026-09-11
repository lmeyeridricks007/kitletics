/**
 * Editorial Completion 46 — sitewide intent map + cannibalization audit.
 *
 * Maps every editorial URL's primary/secondary intent, detects role collisions,
 * and emits consolidation actions (merge / redirect / canonical / hold / keep).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getGearSetups,
  getReviews,
} from "@/repositories/editorial";
import { getProducts } from "@/repositories/products";
import {
  getCategories,
  getCategoryById,
  getSportById,
  getTools,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { getUseCaseListingConfigs } from "@/lib/use-case-listing";
import { getAllProductRelationships } from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });
const PROD = { isDev: false as const };

type PageType =
  | "product"
  | "review"
  | "best"
  | "guide"
  | "comparison"
  | "alternatives"
  | "category"
  | "listing"
  | "setup"
  | "finder"
  | "brand";

type Action = "keep" | "hold" | "redirect" | "canonical" | "merge";

interface IntentRow {
  path: string;
  type: PageType;
  id: string;
  slug: string;
  title: string;
  primaryIntent: string;
  secondaryIntent: string;
  targetDecision: string;
  relatedProductOrCategory: string;
  sportSlug: string;
  categoryId: string;
  indexable: boolean;
  disposition: string;
  intentKey: string;
  action: Action;
  actionTarget?: string;
  actionNote?: string;
  collisionTags: string[];
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "best",
  "guide",
  "guides",
  "how",
  "what",
  "vs",
  "your",
  "you",
  "our",
  "kit",
  "gear",
  "2024",
  "2025",
  "2026",
  "explained",
  "running",
  "from",
  "into",
  "that",
  "this",
  "are",
  "can",
]);

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter || 1);
}

function sportSlugFromId(id?: string): string {
  if (!id) return "";
  return getSportById(id)?.slug ?? "";
}

function catLabel(categoryId?: string): string {
  if (!categoryId) return "";
  const c = getCategoryById(categoryId);
  return c ? `${c.slug}` : categoryId;
}

const rows: IntentRow[] = [];

// ——— Products ———
for (const p of getProducts(PROD).filter((x) => x.status === "published")) {
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  const cat = getCategoryById(p.categoryId);
  const sport = sportSlugFromId(p.sportIds[0]);
  rows.push({
    path: `/products/${p.slug}`,
    type: "product",
    id: p.id,
    slug: p.slug,
    title: p.fullName,
    primaryIntent: `understand and buy ${p.fullName}`,
    secondaryIntent: "specs, offers, alternatives entry",
    targetDecision: `Is ${p.name} the right purchase?`,
    relatedProductOrCategory: cat?.slug ?? p.categoryId,
    sportSlug: sport,
    categoryId: p.categoryId,
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `product:${p.id}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Reviews ———
for (const r of getReviews(PROD)) {
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  const product = getProducts(PROD).find((p) => p.id === r.productId);
  const catId = product?.categoryId ?? "";
  const sport = sportSlugFromId(product?.sportIds[0] ?? r.sportIds?.[0]);
  rows.push({
    path: `/reviews/${r.slug}`,
    type: "review",
    id: r.id,
    slug: r.slug,
    title: r.title,
    primaryIntent: `assess ${product?.fullName ?? r.slug} as a buying decision`,
    secondaryIntent: "strengths, trade-offs, who should buy/skip",
    targetDecision: `Should I buy ${product?.name ?? "this product"} after a deep assessment?`,
    relatedProductOrCategory: product?.slug ?? r.productId,
    sportSlug: sport,
    categoryId: catId,
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `review:${r.productId}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Best ———
for (const g of getBestGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  const sport = sportSlugFromId(g.sportId);
  const intentCore = [
    g.slug,
    g.title,
    g.audienceLabel ?? "",
    g.shortDescription ?? "",
  ]
    .join(" ")
    .toLowerCase();
  rows.push({
    path: `/best/${g.slug}`,
    type: "best",
    id: g.id,
    slug: g.slug,
    title: g.title,
    primaryIntent: `shortlist products for ${g.title.replace(/^Best\s+/i, "").toLowerCase()}`,
    secondaryIntent: "ranked roles / awards for a specific context",
    targetDecision: `Which products should I shortlist for this job?`,
    relatedProductOrCategory: catLabel(g.categoryId),
    sportSlug: sport,
    categoryId: g.categoryId ?? "",
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `best:${g.categoryId ?? "x"}:${[...tokens(intentCore)].sort().slice(0, 8).join("-")}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Guides ———
for (const g of getBuyingGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
  const sport = sportSlugFromId(g.sportId);
  const intentCore = [g.slug, g.title, g.guideType ?? "", g.quickAnswer ?? ""]
    .join(" ")
    .toLowerCase();
  rows.push({
    path: `/guides/${g.slug}`,
    type: "guide",
    id: g.id,
    slug: g.slug,
    title: g.title,
    primaryIntent: `learn: ${g.title.toLowerCase()}`,
    secondaryIntent:
      g.guideType === "comparison"
        ? "concept comparison / framework"
        : "explain concepts and decision framework",
    targetDecision: `What do I need to understand before choosing?`,
    relatedProductOrCategory: catLabel(g.categoryId),
    sportSlug: sport,
    categoryId: g.categoryId ?? "",
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `guide:${g.categoryId ?? "x"}:${[...tokens(intentCore)].sort().slice(0, 8).join("-")}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Comparisons ———
for (const c of getComparisons(PROD)) {
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  const ids = [...c.productIds].sort().join("|");
  const sport = sportSlugFromId(c.sportId);
  rows.push({
    path: `/compare/${c.slug}`,
    type: "comparison",
    id: c.id,
    slug: c.slug,
    title: c.title,
    primaryIntent: `choose between ${c.title}`,
    secondaryIntent: "A vs B decision with choose-neither",
    targetDecision: `Which of these two (or neither) fits my need?`,
    relatedProductOrCategory: ids,
    sportSlug: sport,
    categoryId: c.categoryId ?? "",
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `comparison:${ids}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Alternatives (product-rooted) ———
const allRels = getAllProductRelationships(PROD);
for (const p of getProducts(PROD).filter((x) => x.status === "published")) {
  const elig = canPublishAlternativesPage(p, allRels);
  if (!elig.ok) continue;
  const data = getAlternativesPageData(p.slug, {
    region: DEFAULT_REGION,
    ...PROD,
  });
  if (!data) continue;
  const indexable = data.indexable;
  rows.push({
    path: `/products/${p.slug}/alternatives`,
    type: "alternatives",
    id: `alt-${p.id}`,
    slug: `${p.slug}-alternatives`,
    title: `Alternatives to ${p.fullName}`,
    primaryIntent: `replace ${p.fullName} with a peer`,
    secondaryIntent: "why switch / stay / better / worse",
    targetDecision: `What should replace ${p.name} if it is wrong for me?`,
    relatedProductOrCategory: p.slug,
    sportSlug: sportSlugFromId(p.sportIds[0]),
    categoryId: p.categoryId,
    indexable,
    disposition: indexable ? "INDEXABLE" : "PUBLIC_NOINDEX",
    intentKey: `alternatives:${p.id}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Categories ———
for (const cat of getCategories(PROD)) {
  const sport = getSportById(cat.sportIds[0]);
  if (!sport) continue;
  const soft =
    cat.slug === "accessories" ||
    cat.slug === "padel-accessories" ||
    cat.slug === "padel-clothing";
  rows.push({
    path: `/${sport.slug}/${cat.pathSegment}`,
    type: "category",
    id: cat.id,
    slug: cat.slug,
    title: cat.name,
    primaryIntent: `browse ${cat.name} catalog`,
    secondaryIntent: "filter, compare entry, decision scaffolding",
    targetDecision: `Which products in ${cat.name} should I explore?`,
    relatedProductOrCategory: cat.slug,
    sportSlug: sport.slug,
    categoryId: cat.id,
    indexable: !soft && cat.contentStatus !== "hidden",
    disposition: soft ? "PUBLIC_NOINDEX" : "INDEXABLE",
    intentKey: `category:${cat.id}`,
    action: soft ? "hold" : "keep",
    actionNote: soft ? "Soft-gated thin category" : undefined,
    collisionTags: soft ? ["soft_gated"] : [],
  });
}

// ——— Use-case listings ———
for (const listing of getUseCaseListingConfigs()) {
  rows.push({
    path: `/${listing.sportSlug}/${listing.categoryPathSegment}/${listing.slug}`,
    type: "listing",
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    primaryIntent: `browse ${listing.title} within category`,
    secondaryIntent: "type-specific selection education",
    targetDecision: `Which ${listing.title.toLowerCase()} fit my need?`,
    relatedProductOrCategory: listing.categoryId,
    sportSlug: listing.sportSlug,
    categoryId: listing.categoryId,
    indexable: true,
    disposition: "INDEXABLE",
    intentKey: `listing:${listing.categoryId}:${listing.slug}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Setups ———
for (const s of getGearSetups(PROD)) {
  const elig = getLaunchEligibility({ kind: "setup", entity: s }, PROD);
  rows.push({
    path: `/setups/${s.slug}`,
    type: "setup",
    id: s.id,
    slug: s.slug,
    title: s.title,
    primaryIntent: `assemble kit for scenario: ${s.scenario?.slice(0, 80) ?? s.title}`,
    secondaryIntent: "system roles + compatibility",
    targetDecision: `What full kit do I need for this scenario?`,
    relatedProductOrCategory: s.items.map((i) => i.productId).join("|"),
    sportSlug: sportSlugFromId(s.sportId),
    categoryId: "",
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `setup:${s.slug}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Finders ———
for (const t of getTools(PROD).filter((x) => x.type === "finder" && x.available)) {
  const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
  rows.push({
    path: `/tools/${t.slug}`,
    type: "finder",
    id: t.id,
    slug: t.slug,
    title: t.name,
    primaryIntent: `personalized recommendation via ${t.name}`,
    secondaryIntent: "interactive shortlist",
    targetDecision: `Which products match my answers?`,
    relatedProductOrCategory: (t.categoryIds ?? []).join("|"),
    sportSlug: sportSlugFromId(t.sportIds[0]),
    categoryId: t.categoryIds?.[0] ?? "",
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    intentKey: `finder:${t.slug}`,
    action: "keep",
    collisionTags: [],
  });
}

// ——— Collision detection ———
interface Collision {
  kind: string;
  a: string;
  b: string;
  score: number;
  recommendedAction: Action;
  actionTarget?: string;
  note: string;
}

const collisions: Collision[] = [];

const byType = (t: PageType) => rows.filter((r) => r.type === t);
const indexable = (rs: IntentRow[]) => rs.filter((r) => r.indexable);

// Review vs Product (same product) — expected complementary; flag only if review tries to be PDP
for (const review of byType("review")) {
  const product = byType("product").find(
    (p) => p.slug === review.relatedProductOrCategory || p.id === review.relatedProductOrCategory,
  );
  if (!product) continue;
  if (review.indexable && product.indexable) {
    // Healthy pair — roles differ. Tag for map clarity, no consolidation.
    review.collisionTags.push("paired_with_product");
    product.collisionTags.push("paired_with_review");
  } else if (!review.indexable && product.indexable) {
    review.action = "hold";
    review.actionNote = "Review held; Product remains buy/understand page";
    review.collisionTags.push("review_held_product_keeps");
  }
}

// Guide vs Best — same category + high title token overlap
const bests = indexable(byType("best"));
const guides = indexable(byType("guide"));
for (const best of bests) {
  const bestTok = tokens(`${best.slug} ${best.title}`);
  for (const guide of guides) {
    if (best.categoryId && guide.categoryId && best.categoryId !== guide.categoryId)
      continue;
    if (best.sportSlug && guide.sportSlug && best.sportSlug !== guide.sportSlug)
      continue;
    const guideTok = tokens(`${guide.slug} ${guide.title}`);
    const score = jaccard(bestTok, guideTok);
    // "best X" vs "how to choose X" is complementary; collision when guide is ranking-shaped
    const guideLooksLikeBest =
      /^(best-|top-)/.test(guide.slug) ||
      /^best\s/i.test(guide.title) ||
      guide.secondaryIntent.includes("framework") === false &&
        /shortlist|ranked|top\s*\d/i.test(guide.title + guide.primaryIntent);
    const nearTwin =
      score >= 0.55 &&
      ([...bestTok].filter((t) => guideTok.has(t)).length >= 3);
    if (nearTwin && (guideLooksLikeBest || score >= 0.72)) {
      collisions.push({
        kind: "guide_vs_best",
        a: guide.path,
        b: best.path,
        score,
        recommendedAction: "hold",
        actionTarget: best.path,
        note: "Guide intent overlaps Best shortlist — hold/noindex weaker learn page or differentiate to pure education",
      });
      guide.collisionTags.push("collides_best");
      best.collisionTags.push("collides_guide");
      if (guide.action === "keep") {
        guide.action = "hold";
        guide.actionTarget = best.path;
        guide.actionNote =
          "Overlaps Best shortlist intent — keep as learn-only noindex or differentiate";
      }
    }
  }
}

// Best vs Best — same category, high overlap
for (let i = 0; i < bests.length; i++) {
  for (let j = i + 1; j < bests.length; j++) {
    const a = bests[i];
    const b = bests[j];
    if (a.categoryId && b.categoryId && a.categoryId !== b.categoryId) continue;
    if (a.sportSlug !== b.sportSlug) continue;
    const score = jaccard(
      tokens(`${a.slug} ${a.title}`),
      tokens(`${b.slug} ${b.title}`),
    );
    if (score >= 0.5) {
      collisions.push({
        kind: "best_vs_best",
        a: a.path,
        b: b.path,
        score,
        recommendedAction: score >= 0.75 ? "canonical" : "keep",
        actionTarget: score >= 0.75 ? a.path : undefined,
        note:
          score >= 0.75
            ? "Near-duplicate Best intents — differentiate further or canonical weaker to stronger"
            : "Related Best pair — keep if ranking constraints differ (P39 style)",
      });
      a.collisionTags.push(`best_peer:${b.slug}`);
      b.collisionTags.push(`best_peer:${a.slug}`);
    }
  }
}

// Guide vs Guide
for (let i = 0; i < guides.length; i++) {
  for (let j = i + 1; j < guides.length; j++) {
    const a = guides[i];
    const b = guides[j];
    if (a.categoryId && b.categoryId && a.categoryId !== b.categoryId) continue;
    if (a.sportSlug && b.sportSlug && a.sportSlug !== b.sportSlug) continue;
    const score = jaccard(
      tokens(`${a.slug} ${a.title}`),
      tokens(`${b.slug} ${b.title}`),
    );
    if (score >= 0.55) {
      collisions.push({
        kind: "guide_vs_guide",
        a: a.path,
        b: b.path,
        score,
        recommendedAction: score >= 0.7 ? "merge" : "keep",
        actionTarget: score >= 0.7 ? a.path : undefined,
        note:
          score >= 0.7
            ? "Near-duplicate learn intents — merge weaker into stronger + redirect"
            : "Related guides — keep if frameworks differ",
      });
      a.collisionTags.push(`guide_peer:${b.slug}`);
      b.collisionTags.push(`guide_peer:${a.slug}`);
    }
  }
}

// Best vs Category — Best that is just "best {category}" with no constraint
for (const best of bests) {
  const cat = byType("category").find(
    (c) => c.categoryId === best.categoryId && c.sportSlug === best.sportSlug,
  );
  if (!cat || !cat.indexable) continue;
  const catTok = tokens(cat.title + " " + cat.slug);
  const bestTok = tokens(best.title + " " + best.slug);
  const score = jaccard(catTok, bestTok);
  const unconstrained =
    /^(best-)?(running-)?(shoes|watches|headphones|socks|belts|packs|vests|hydration)$/i.test(
      best.slug.replace(/^best-/, ""),
    ) || score >= 0.65;
  if (unconstrained && score >= 0.4) {
    collisions.push({
      kind: "best_vs_category",
      a: best.path,
      b: cat.path,
      score,
      recommendedAction: "keep",
      note: "Best shortlist vs Category browse — keep both if Best has ranked context; ensure Best is not a mirror of the catalog grid",
    });
    best.collisionTags.push("near_category_browse");
    cat.collisionTags.push("near_best_shortlist");
  }
}

// Comparison vs Alternatives — same two products
const comps = byType("comparison");
const alts = byType("alternatives");
for (const comp of comps) {
  const ids = comp.relatedProductOrCategory.split("|").filter(Boolean);
  if (ids.length !== 2) continue;
  for (const alt of alts) {
    const rootId = alt.id.replace(/^alt-/, "");
    if (!ids.includes(rootId)) continue;
    // Alternatives for A that prominently feature B as peer is complementary if comparison is A vs B
    collisions.push({
      kind: "comparison_vs_alternatives",
      a: comp.path,
      b: alt.path,
      score: 0.6,
      recommendedAction: "keep",
      note: "Comparison is A vs B; Alternatives is replace-X graph — complementary if copy stays role-correct",
    });
    comp.collisionTags.push("paired_alternatives");
    alt.collisionTags.push("paired_comparison");
  }
}

// Listing vs Best (daily-trainers listing vs best daily trainers)
for (const listing of byType("listing")) {
  for (const best of bests) {
    const score = jaccard(
      tokens(listing.slug + " " + listing.title),
      tokens(best.slug + " " + best.title),
    );
    if (score >= 0.45 && listing.categoryId === best.categoryId) {
      collisions.push({
        kind: "listing_vs_best",
        a: listing.path,
        b: best.path,
        score,
        recommendedAction: "keep",
        note: "Listing=browse type facet; Best=ranked shortlist — complementary when Best links from listing",
      });
    }
  }
}

// Deduplicate collisions
const seen = new Set<string>();
const uniqueCollisions = collisions.filter((c) => {
  const key = [c.kind, ...[c.a, c.b].sort()].join("|");
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Apply consolidation policies for high-severity guide_vs_guide / best_vs_best
const consolidations: {
  action: Action;
  from: string;
  to?: string;
  reason: string;
}[] = [];

for (const c of uniqueCollisions) {
  if (c.kind === "guide_vs_guide" && c.score >= 0.7 && c.actionTarget) {
    const weaker = c.a === c.actionTarget ? c.b : c.a;
    const stronger = c.actionTarget;
    const weakRow = rows.find((r) => r.path === weaker);
    const strongRow = rows.find((r) => r.path === stronger);
    if (weakRow && strongRow && weakRow.indexable) {
      // Prefer hold over redirect until human confirms merge — mark hold for indexation
      weakRow.action = "hold";
      weakRow.actionTarget = stronger;
      weakRow.actionNote = `Intent twin of ${stronger} (jaccard ${c.score.toFixed(2)}) — hold from index; learn content retained`;
      consolidations.push({
        action: "hold",
        from: weaker,
        to: stronger,
        reason: weakRow.actionNote,
      });
    }
  }
  if (c.kind === "best_vs_best" && c.score >= 0.78 && c.actionTarget) {
    const weaker = c.a === c.actionTarget ? c.b : c.a;
    const weakRow = rows.find((r) => r.path === weaker);
    if (weakRow && weakRow.indexable) {
      weakRow.action = "canonical";
      weakRow.actionTarget = c.actionTarget;
      weakRow.actionNote = `Near-duplicate Best intent vs ${c.actionTarget} — set canonical / hold weaker`;
      consolidations.push({
        action: "canonical",
        from: weaker,
        to: c.actionTarget,
        reason: weakRow.actionNote,
      });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  roleModel: {
    product: "understand/buy one Product",
    review: "assess one Product",
    best: "shortlist products for specific context",
    guide: "learn",
    comparison: "A vs B",
    alternatives: "replace Product X",
    category: "browse",
    listing: "browse type/use-case facet",
    setup: "scenario kit system",
    finder: "personalized recommendation",
  },
  totals: {
    urls: rows.length,
    indexable: rows.filter((r) => r.indexable).length,
    byType: Object.fromEntries(
      (
        [
          "product",
          "review",
          "best",
          "guide",
          "comparison",
          "alternatives",
          "category",
          "listing",
          "setup",
          "finder",
        ] as PageType[]
      ).map((t) => [t, rows.filter((r) => r.type === t).length]),
    ),
    collisions: uniqueCollisions.length,
    byCollisionKind: Object.fromEntries(
      [
        "guide_vs_best",
        "best_vs_best",
        "guide_vs_guide",
        "best_vs_category",
        "comparison_vs_alternatives",
        "listing_vs_best",
      ].map((k) => [k, uniqueCollisions.filter((c) => c.kind === k).length]),
    ),
    actions: {
      keep: rows.filter((r) => r.action === "keep").length,
      hold: rows.filter((r) => r.action === "hold").length,
      redirect: rows.filter((r) => r.action === "redirect").length,
      canonical: rows.filter((r) => r.action === "canonical").length,
      merge: rows.filter((r) => r.action === "merge").length,
    },
  },
  consolidations,
  collisions: uniqueCollisions.sort(
    (a, b) => b.score - a.score || a.kind.localeCompare(b.kind),
  ),
  rows,
};

writeFileSync(
  join(OUT, "46-editorial-intent-audit.json"),
  JSON.stringify(report, null, 2),
);

// CSV
const csvEscape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
const csvHeader = [
  "path",
  "type",
  "slug",
  "title",
  "primary_intent",
  "secondary_intent",
  "target_decision",
  "related_product_or_category",
  "sport",
  "indexable",
  "disposition",
  "intent_key",
  "action",
  "action_target",
  "action_note",
  "collision_tags",
].join(",");
const csvLines = rows.map((r) =>
  [
    r.path,
    r.type,
    r.slug,
    r.title,
    r.primaryIntent,
    r.secondaryIntent,
    r.targetDecision,
    r.relatedProductOrCategory,
    r.sportSlug,
    String(r.indexable),
    r.disposition,
    r.intentKey,
    r.action,
    r.actionTarget ?? "",
    r.actionNote ?? "",
    r.collisionTags.join(";"),
  ]
    .map(csvEscape)
    .join(","),
);
writeFileSync(
  join(OUT, "editorial-intent-map.csv"),
  [csvHeader, ...csvLines].join("\n"),
);
// Also copy to docs path expected by brief
writeFileSync(
  join(process.cwd(), "docs/prelaunch/editorial/data/editorial-intent-map.csv"),
  [csvHeader, ...csvLines].join("\n"),
);

console.log(JSON.stringify(report.totals, null, 2));
console.log("consolidations", consolidations.length);
console.log(
  "top collisions",
  uniqueCollisions.slice(0, 15).map((c) => `${c.kind} ${c.score.toFixed(2)} ${c.a} ↔ ${c.b}`),
);
