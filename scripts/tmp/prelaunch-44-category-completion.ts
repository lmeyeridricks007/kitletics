/**
 * Editorial 44 — category / subcategory / use-case decision readiness.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getCategories, getSports } from "@/repositories";
import { getProductsByCategory } from "@/repositories/products";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { assembleCategoryPage } from "@/lib/catalog/assemble";
import { getUseCaseListingConfigs } from "@/lib/use-case-listing";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

type Verdict = "READY" | "NOT_READY";

function decisionComplete(
  d: NonNullable<ReturnType<typeof getCategoryPageConfig>>["decision"],
): boolean {
  if (!d) return false;
  return (
    d.whatItIs.length >= 40 &&
    d.productTypes.length >= 2 &&
    d.whatMatters.length >= 3 &&
    d.specsThatMatter.length >= 2 &&
    d.tradeOffs.length >= 1 &&
    d.useCaseShifts.length >= 2 &&
    d.beginnerStart.length >= 40 &&
    Boolean(d.relatedBestHref || d.relatedFinderHref)
  );
}

const sports = getSports({ isDev: false }).filter(
  (s) => s.contentStatus === "live" || s.contentStatus === "partial",
);
const cats = getCategories({ isDev: false });

const categoryRows = [];

for (const cat of cats) {
  const products = getProductsByCategory(cat.id, { isDev: false });
  const soft = isSoftGatedCategory(cat);
  const sport = sports.find(
    (s) => cat.sportIds.includes(s.id) && s.slug !== "hyrox",
  );
  const cfg = sport
    ? getCategoryPageConfig(sport.slug, cat.slug)
    : undefined;
  let assembled:
    | ReturnType<typeof assembleCategoryPage>
    | undefined;
  if (sport) {
    assembled = assembleCategoryPage({
      sportSlug: sport.slug,
      pathSegment: cat.pathSegment,
    });
  }

  const decisionOk = decisionComplete(cfg?.decision);
  const educationOk = (cfg?.educationFactors?.length ?? 0) >= 3;
  const finderOk = Boolean(cfg?.finder || cfg?.decision?.relatedFinderHref);
  const bestOk =
    (assembled?.bestGuides?.length ?? 0) >= 1 ||
    Boolean(cfg?.decision?.relatedBestHref);
  const productOk = products.length >= 8;
  const thinShelf = products.length > 0 && products.length < 8;

  const gaps: string[] = [];
  if (products.length === 0) gaps.push("empty_catalog");
  if (!cfg) gaps.push("no_category_config");
  if (!decisionOk) gaps.push("incomplete_decision_block");
  if (!educationOk) gaps.push("education_lt_3");
  if (!finderOk) gaps.push("no_finder");
  if (!bestOk) gaps.push("no_best_link");
  if (!productOk && products.length > 0) gaps.push("thin_catalog_lt_8");
  if (soft) gaps.push("soft_gated");

  let verdict: Verdict = "NOT_READY";
  if (
    products.length > 0 &&
    decisionOk &&
    educationOk &&
    finderOk &&
    bestOk &&
    productOk &&
    !soft
  ) {
    verdict = "READY";
  }

  categoryRows.push({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    sportSlug: sport?.slug ?? null,
    products: products.length,
    soft,
    hasConfig: Boolean(cfg),
    decisionOk,
    education: cfg?.educationFactors?.length ?? 0,
    terminology: cfg?.terminology?.length ?? 0,
    finder: Boolean(cfg?.finder),
    best: assembled?.bestGuides?.length ?? 0,
    guides: assembled?.buyingGuides?.length ?? 0,
    comps: assembled?.comparisons?.length ?? 0,
    thinShelf,
    gaps,
    verdict,
  });
}

const listings = getUseCaseListingConfigs().map((c) => {
  const edu = c.education;
  const distinct =
    Boolean(edu.beginnerStart) &&
    (edu.tradeOffs?.length ?? 0) >= 1 &&
    edu.body.length >= 80 &&
    edu.factors.length >= 4;
  const gaps: string[] = [];
  if (!edu.beginnerStart) gaps.push("no_beginner_start");
  if ((edu.tradeOffs?.length ?? 0) < 1) gaps.push("no_tradeoffs");
  if (edu.body.length < 80) gaps.push("thin_body");
  if (!c.bestGuideSlug) gaps.push("no_best");
  if ((c.relatedGuideSlugs?.length ?? 0) < 2) gaps.push("few_guides");

  return {
    slug: c.slug,
    title: c.title,
    kind: c.subcategorySlug ? "subcategory" : "use_case",
    educationFactors: edu.factors.length,
    hasTradeOffs: (edu.tradeOffs?.length ?? 0) > 0,
    hasBeginner: Boolean(edu.beginnerStart),
    hasBest: Boolean(c.bestGuideSlug),
    relatedGuides: c.relatedGuideSlugs?.length ?? 0,
    gaps,
    verdict: (distinct && gaps.length === 0 ? "READY" : "NOT_READY") as Verdict,
  };
});

/** Sport hubs: presence of shop categories + finder is enough for sport index; deep decision lives on product categories. */
const sportRows = sports.map((s) => {
  const sportCats = categoryRows.filter((r) => r.sportSlug === s.slug);
  const readyCats = sportCats.filter((r) => r.verdict === "READY").length;
  const withProducts = sportCats.filter((r) => r.products > 0).length;
  const verdict: Verdict =
    s.slug === "running" && readyCats >= 8
      ? "READY"
      : withProducts > 0 && readyCats === 0
        ? "NOT_READY"
        : readyCats > 0
          ? "READY"
          : "NOT_READY";
  return {
    slug: s.slug,
    name: s.name,
    categories: sportCats.length,
    withProducts,
    readyCategories: readyCats,
    verdict,
    note:
      s.slug === "running"
        ? "Sport hub + product-category decision graph"
        : "Browse/grid only — product categories lack decision configs",
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  criteria: {
    categoryReady:
      "products≥8 · complete decision block · education≥3 · finder · best link · not soft-gated",
    listingReady:
      "distinct body · ≥4 factors · beginnerStart · tradeOffs · best + ≥2 guides",
  },
  totals: {
    categories: categoryRows.length,
    categoryReady: categoryRows.filter((r) => r.verdict === "READY").length,
    categoryNotReady: categoryRows.filter((r) => r.verdict === "NOT_READY")
      .length,
    softGated: categoryRows.filter((r) => r.soft).length,
    listings: listings.length,
    listingsReady: listings.filter((r) => r.verdict === "READY").length,
    sportsReady: sportRows.filter((r) => r.verdict === "READY").length,
  },
  formerlySoftGated: {
    ungated: ["running-clothing", "sunglasses", "nutrition-fuel"],
    stillHeld: ["accessories"],
  },
  sports: sportRows,
  categories: categoryRows.sort((a, b) =>
    a.verdict.localeCompare(b.verdict) || a.slug.localeCompare(b.slug),
  ),
  listings,
};

writeFileSync(
  join(OUT, "44-category-content-completion.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report.totals, null, 2));
console.log(
  "READY cats",
  report.categories.filter((c) => c.verdict === "READY").map((c) => c.slug),
);
console.log(
  "soft still",
  report.categories.filter((c) => c.soft).map((c) => c.slug),
);
console.log(
  "listings",
  report.listings.map((l) => `${l.slug}:${l.verdict}`),
);
