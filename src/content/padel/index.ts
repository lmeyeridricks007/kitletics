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
import {
  padelRacketCatalogPatches,
  padelRacketCatalogProducts,
  padelRacketCatalogEvidence,
  padelRacketCatalogRecommendations,
  padelRacketCatalogAlternatives,
  padelRacketCatalogFamilies,
  padelRacketMediaPendingIds,
} from "@/content/padel/rackets";
import {
  padelSoftGoodsBrands,
  padelSoftGoodsPatches,
  padelSoftGoodsProducts,
  padelSoftGoodsEvidence,
  padelSoftGoodsOffers,
  padelCommerceWaveOffers,
  padelShoeCatalogPatches,
  padelSecondaryMediaPendingIds,
  padelSoftGoodsAlternatives,
} from "@/content/padel/soft-goods";
import { padelFinalParityOffers } from "@/content/padel/final-parity-offers";
import { applyMediaPublishGate } from "@/content/running/products/media-publish-gate";
import { stripDeprecatedRacketSpecs } from "@/content/padel/rackets/build";
import { applySpecEnrichmentToProducts } from "@/content/padel/spec-enrichment";
import { applyPadelPdpEditorialToProducts } from "@/content/padel/pdp-editorial";

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

function hygienePadelRackets(product: Product): Product {
  if (product.categoryId !== "cat-padel-rackets") return product;
  return {
    ...product,
    specifications: stripDeprecatedRacketSpecs(product.specifications),
    recommendationScore: padelRacketMediaPendingIds.has(product.id)
      ? undefined
      : product.recommendationScore,
  };
}

function applyPadelCatalogPatches(products: Product[]): Product[] {
  return applyPatches(
    applyPatches(
      applyPatches(products, padelRacketCatalogPatches),
      padelShoeCatalogPatches,
    ),
    padelSoftGoodsPatches,
  );
}

const padelMediaPendingIds = new Set([
  ...padelRacketMediaPendingIds,
  ...padelSecondaryMediaPendingIds,
]);

const mergedBase = applyPadelCatalogPatches(
  applyPatches(
    applyPatches([...seedProducts, ...wave25Products], wave26ProductPatches),
    wave27ProductPatches,
  ),
);

export const padelAllBrands = [
  ...seedBrands,
  ...wave25Brands,
  ...wave26Brands,
  ...padelSoftGoodsBrands,
];

/** Catalog before field-level spec enrichment (used by enrich scripts). */
export const padelAllProductsBeforeSpecEnrichment = applyMediaPublishGate(
  [
    ...mergedBase,
    ...applyPadelCatalogPatches(
      applyPatches(wave26Products, wave27ProductPatches),
    ),
    ...applyPadelCatalogPatches(wave27Products),
    ...applyPadelCatalogPatches(wave28PadelShoeProducts),
    ...padelRacketCatalogProducts,
    ...padelSoftGoodsProducts,
  ].map(hygienePadelRackets),
  padelMediaPendingIds,
);

export const padelAllProducts = applyPadelPdpEditorialToProducts(
  applySpecEnrichmentToProducts(padelAllProductsBeforeSpecEnrichment),
);

/** Offers merge into the canonical commerce pipeline — listing-URL gate lives in repositories/commerce.ts */
export const padelAllOffers = [
  ...seedOffers,
  ...wave25Offers,
  ...wave26Offers,
  ...wave27Offers,
  ...wave28PadelShoeOffers,
  ...padelSoftGoodsOffers,
  ...padelCommerceWaveOffers,
  ...padelFinalParityOffers,
];

export const padelAllComparisons = [
  ...seedComparisons,
  ...wave26Comparisons,
];
export const padelAllFamilies = padelRacketCatalogFamilies;
export const padelAllAlternatives = [
  ...wave26Alternatives.filter(
    (a) =>
      !padelRacketCatalogAlternatives.some(
        (n) =>
          n.sourceProductId === a.sourceProductId &&
          n.alternativeProductId === a.alternativeProductId,
      ),
  ),
  ...padelRacketCatalogAlternatives,
  ...padelSoftGoodsAlternatives,
];
export const padelAllRelationships = wave26Relationships;

const catalogProductIds = new Set(padelRacketMediaPendingIds);

export const wave25EvidenceMerged = [
  ...padelSeedEvidence,
  ...wave25Evidence,
  ...wave26Evidence,
  ...wave28PadelShoeEvidence,
  ...padelRacketCatalogEvidence,
  ...padelSoftGoodsEvidence,
];
export const wave25RecommendationsMerged = [
  ...padelSeedRecommendations.filter((r) => !catalogProductIds.has(r.productId)),
  ...wave25Recommendations.filter((r) => !catalogProductIds.has(r.productId)),
  ...wave26Recommendations.filter((r) => !catalogProductIds.has(r.productId)),
  ...padelRacketCatalogRecommendations,
];
export {
  wave25EvidenceMerged as wave25Evidence,
  wave25RecommendationsMerged as wave25Recommendations,
};

/** Finder tool forced live — seed keeps available:false as archival default */
export const padelToolsLive = seedTools.map((t) =>
  t.id === "tool-padel-racket-finder" ? { ...t, available: true } : t,
);
