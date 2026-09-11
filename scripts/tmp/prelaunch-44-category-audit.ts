/**
 * Editorial 44 — category decision-content audit.
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

const sports = getSports({ isDev: false }).filter(
  (s) => s.contentStatus === "live" || s.contentStatus === "partial",
);
const cats = getCategories({ isDev: false });
const rows = [];

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
  rows.push({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    soft,
    products: products.length,
    hasConfig: Boolean(cfg),
    education: cfg?.educationFactors?.length ?? 0,
    terminology: cfg?.terminology?.length ?? 0,
    finder: Boolean(cfg?.finder),
    featuredSubs: cfg?.featuredSubcategoryIds?.length ?? 0,
    best: assembled?.bestGuides?.length ?? 0,
    guides: assembled?.buyingGuides?.length ?? 0,
    comps: assembled?.comparisons?.length ?? 0,
    tools: assembled?.tools?.length ?? 0,
    heroDescLen: (cfg?.hero.description ?? cat.description ?? "").length,
    sportSlug: sport?.slug,
  });
}

const listings = getUseCaseListingConfigs().map((c) => ({
  slug: c.slug,
  title: c.title,
  educationFactors: c.education?.factors?.length ?? 0,
  educationBodyLen: (c.education?.body ?? "").length,
  hasBest: Boolean(c.bestGuideSlug),
  relatedGuides: c.relatedGuideSlugs?.length ?? 0,
}));

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    categories: rows.length,
    withProducts: rows.filter((r) => r.products > 0).length,
    softGated: rows.filter((r) => r.soft).length,
    withConfig: rows.filter((r) => r.hasConfig).length,
  },
  soft: rows.filter((r) => r.soft),
  thinConfig: rows.filter(
    (r) => r.products > 0 && (!r.hasConfig || r.education < 2),
  ),
  listings,
  rows,
};

writeFileSync(join(OUT, "44-category-audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.totals, null, 2));
console.log(
  "soft",
  report.soft.map((r) => ({
    slug: r.slug,
    products: r.products,
    education: r.education,
    finder: r.finder,
    best: r.best,
    guides: r.guides,
  })),
);
console.log("listings", listings.length);
