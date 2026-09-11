export {
  padelCategories,
  padelBrands,
  padelProducts,
  padelOffers,
  padelBestGuides,
  padelBuyingGuides,
  padelComparisons,
  padelSetups,
  padelTools,
} from "@/content/padel/seed";

import type { Product } from "@/domain/products/types";
import {
  padelBrands as seedBrands,
  padelProducts as seedProducts,
  padelOffers as seedOffers,
  padelTools as seedTools,
  padelComparisons as seedComparisons,
} from "@/content/padel/seed";
import {
  wave25Brands,
  wave25Products,
  wave25Offers,
  wave25Evidence,
  wave25Recommendations,
} from "@/content/padel/wave25";
import {
  padelSeedEvidence,
  padelSeedRecommendations,
} from "@/content/padel/seed-recommendations";
import {
  wave26Brands,
  wave26Products,
  wave26ProductPatches,
  wave26Offers,
  wave26Evidence,
  wave26Recommendations,
  wave26Alternatives,
  wave26Families,
  wave26Comparisons,
  wave26Relationships,
} from "@/content/padel/wave26";
import {
  wave27Products,
  wave27Offers,
  wave27ProductPatches,
} from "@/content/padel/wave27";
import {
  wave28PadelShoeProducts,
  wave28PadelShoeOffers,
  wave28PadelShoeEvidence,
} from "@/content/padel/wave28-shoes";

function applyPatches(
  products: Product[],
  patches: Record<string, Partial<Product>>,
): Product[] {
  return products.map((p) => {
    const patch = patches[p.id];
    if (!patch) return p;
    return {
      ...p,
      ...patch,
      specifications: {
        ...p.specifications,
        ...(patch.specifications ?? {}),
      },
    };
  });
}

const mergedBase = applyPatches(
  applyPatches([...seedProducts, ...wave25Products], wave26ProductPatches),
  wave27ProductPatches,
);

export const padelAllBrands = [
  ...seedBrands,
  ...wave25Brands,
  ...wave26Brands,
];
export const padelAllProducts = [
  ...mergedBase,
  // Also apply wave27 patches to wave26 products (genderFit etc.)
  ...applyPatches(wave26Products, wave27ProductPatches),
  ...wave27Products,
  ...wave28PadelShoeProducts,
];
export const padelAllOffers = [
  ...seedOffers,
  ...wave25Offers,
  ...wave26Offers,
  ...wave27Offers,
  ...wave28PadelShoeOffers,
];
export const padelAllComparisons = [
  ...seedComparisons,
  ...wave26Comparisons,
];
export const padelAllFamilies = wave26Families;
export const padelAllAlternatives = wave26Alternatives;
export const padelAllRelationships = wave26Relationships;

export const wave25EvidenceMerged = [
  ...padelSeedEvidence,
  ...wave25Evidence,
  ...wave26Evidence,
  ...wave28PadelShoeEvidence,
];
export const wave25RecommendationsMerged = [
  ...padelSeedRecommendations,
  ...wave25Recommendations,
  ...wave26Recommendations,
];
export {
  wave25EvidenceMerged as wave25Evidence,
  wave25RecommendationsMerged as wave25Recommendations,
};

/** Finder tool forced live — seed keeps available:false as archival default */
export const padelToolsLive = seedTools.map((t) =>
  t.id === "tool-padel-racket-finder" ? { ...t, available: true } : t,
);
