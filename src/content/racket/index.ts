/**
 * Racket sports merge index — tennis wave26 overlays + seed.
 */

import type { Product } from "@/domain/products/types";
import {
  racketProducts as seedProducts,
  racketBrands as seedBrands,
  racketOffers as seedOffers,
  racketRecommendations as seedRecommendations,
  racketEvidence as seedEvidence,
  racketBestGuides,
  racketBuyingGuides,
  racketComparisons as seedComparisons,
  racketSetups,
  racketTools,
  racketCategories,
  racketUseCases,
} from "@/content/racket/seed";
import {
  wave26TennisBrands,
  wave26TennisProducts,
  wave26TennisOffers,
  wave26TennisPatches,
  wave26TennisFamilies,
  wave26TennisEvidence,
  wave26TennisRecommendations,
  wave26TennisAlternatives,
  wave26TennisRelationships,
  wave26TennisComparisons,
} from "@/content/racket/wave26-tennis";
import {
  wave28TennisShoeBrands,
  wave28TennisShoeProducts,
  wave28TennisShoeOffers,
  wave28TennisShoeEvidence,
} from "@/content/racket/wave28-tennis-shoes";
import { padelAllRelationships } from "@/content/padel";

function applyPatches(products: Product[]): Product[] {
  return products.map((p) => {
    const patch = wave26TennisPatches[p.id];
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

export {
  racketBestGuides,
  racketBuyingGuides,
  racketSetups,
  racketTools,
  racketCategories,
  racketUseCases,
};

export const racketBrands = [
  ...seedBrands,
  ...wave26TennisBrands,
  ...wave28TennisShoeBrands,
];
export const racketProducts = [
  ...applyPatches(seedProducts),
  ...wave26TennisProducts,
  ...wave28TennisShoeProducts,
];
export const racketOffers = [
  ...seedOffers,
  ...wave26TennisOffers,
  ...wave28TennisShoeOffers,
];
export const racketRecommendations = [
  ...seedRecommendations,
  ...wave26TennisRecommendations,
];
export const racketEvidence = [
  ...seedEvidence,
  ...wave26TennisEvidence,
  ...wave28TennisShoeEvidence,
];
export const racketComparisons = [
  ...seedComparisons,
  ...wave26TennisComparisons,
];
export const racketAlternatives = wave26TennisAlternatives;
export const racketFamilies = wave26TennisFamilies;
export const racketProductRelationships = [
  ...wave26TennisRelationships,
  ...padelAllRelationships,
];
