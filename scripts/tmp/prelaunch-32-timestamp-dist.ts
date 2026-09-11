import { SEED_DATES } from "../../src/content/config";
import { getProducts } from "../../src/repositories/products";
import { getBrands } from "../../src/repositories/products";
import {
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
} from "../../src/repositories/editorial";
import { getSports, getCategories } from "../../src/repositories/sports";

const SEED = new Set(Object.values(SEED_DATES));

function analyze(
  label: string,
  items: {
    slug?: string;
    updatedAt?: string;
    publishedAt?: string;
    lastVerifiedAt?: string;
  }[],
) {
  let nonSeedUpdated = 0;
  let nonSeedPublished = 0;
  let nonSeedVerified = 0;
  const updatedDays: Record<string, number> = {};
  for (const i of items) {
    if (i.updatedAt && !SEED.has(i.updatedAt)) nonSeedUpdated++;
    if (i.publishedAt && !SEED.has(i.publishedAt)) nonSeedPublished++;
    if (i.lastVerifiedAt && !SEED.has(i.lastVerifiedAt)) nonSeedVerified++;
    const d = i.updatedAt?.slice(0, 10) ?? "none";
    updatedDays[d] = (updatedDays[d] || 0) + 1;
  }
  console.log(
    JSON.stringify(
      {
        label,
        n: items.length,
        nonSeedUpdated,
        nonSeedPublished,
        nonSeedVerified,
        updatedDays,
      },
      null,
      2,
    ),
  );
}

const PROD = { isDev: false as const };
analyze("products", getProducts(PROD));
analyze("reviews", getReviews(PROD));
analyze("best", getBestGuides(PROD));
analyze("comparisons", getComparisons(PROD));
analyze("guides", getBuyingGuides(PROD));
analyze("brands", getBrands(PROD));
analyze("sports", getSports(PROD));
analyze("categories", getCategories(PROD));

// sample non-seed products
const nonSeed = getProducts(PROD)
  .filter((p) => p.updatedAt && !SEED.has(p.updatedAt))
  .slice(0, 8)
  .map((p) => ({
    slug: p.slug,
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt,
    lastVerifiedAt: p.lastVerifiedAt,
  }));
console.log("nonSeedProductSample", JSON.stringify(nonSeed, null, 2));
console.log("SEED_DATES", SEED_DATES);
