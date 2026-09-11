import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { getProductById, getBrandById } from "@/repositories/products";
import {
  getCategoryById,
  getSportById,
  getUseCaseById,
  getDisciplinesBySport,
  getCategoriesBySport,
} from "@/repositories/sports";
import {
  getReviewByProduct,
  getComparisonsForProduct,
  getBestGuidesForProduct,
  getBuyingGuidesForProduct,
  getToolsBySport,
  getBestGuides,
  getBuyingGuides,
  getGearSetups,
  getTools,
  getComparisons,
} from "@/repositories/editorial";
import {
  getAlternativesForProduct,
  getRecommendationsForProduct,
  getEvidenceForIds,
} from "@/repositories/recommendations";
import { getOffersForProduct } from "@/repositories/commerce";
import { getProductsBySport, getProductsByCategory, getProductsByBrand } from "@/repositories/products";
import type { RegionCode } from "@/domain/shared/types";

/**
 * Content graph helpers for automatic internal linking.
 * All queries respect the publication resolver via repositories.
 */

export function getProductGraph(
  productId: string,
  options?: PublishResolverOptions & { region?: RegionCode },
) {
  const product = getProductById(productId, options);
  if (!product) return undefined;

  return {
    product,
    brand: getBrandById(product.brandId, options),
    category: getCategoryById(product.categoryId, options),
    sports: product.sportIds
      .map((id) => getSportById(id, options))
      .filter(Boolean),
    useCases: product.useCaseIds
      .map((id) => getUseCaseById(id))
      .filter(Boolean),
    review: getReviewByProduct(productId, options),
    comparisons: getComparisonsForProduct(productId, options),
    alternatives: getAlternativesForProduct(productId),
    bestGuides: getBestGuidesForProduct(productId, options),
    buyingGuides: getBuyingGuidesForProduct(productId, options),
    recommendations: getRecommendationsForProduct(productId),
    evidence: getEvidenceForIds(product.evidenceIds),
    offers: getOffersForProduct(productId, options?.region),
    relatedProducts: product.relatedProductIds
      .map((id) => getProductById(id, options))
      .filter(Boolean),
  };
}

export function getCategoryGraph(
  categoryId: string,
  options?: PublishResolverOptions,
) {
  const category = getCategoryById(categoryId, options);
  if (!category) return undefined;

  const products = getProductsByCategory(categoryId, options);
  const brandIds = [...new Set(products.map((p) => p.brandId))];

  return {
    category,
    products,
    bestGuides: getBestGuides(options).filter(
      (g) => g.categoryId === categoryId,
    ),
    buyingGuides: getBuyingGuides(options).filter(
      (g) => g.categoryId === categoryId,
    ),
    tools: getTools(options).filter((t) =>
      t.categoryIds.includes(categoryId),
    ),
    useCases: [
      ...new Set(products.flatMap((p) => p.useCaseIds)),
    ]
      .map((id) => getUseCaseById(id))
      .filter(Boolean),
    brands: brandIds
      .map((id) => getBrandById(id, options))
      .filter(Boolean),
  };
}

export function getSportGraph(
  sportId: string,
  options?: PublishResolverOptions,
) {
  const sport = getSportById(sportId, options);
  if (!sport) return undefined;

  const products = getProductsBySport(sportId, options);
  const productIds = new Set(products.map((p) => p.id));
  const brandIds = [...new Set(products.map((p) => p.brandId))];

  return {
    sport,
    disciplines: getDisciplinesBySport(sportId, options),
    categories: getCategoriesBySport(sportId, options),
    products,
    guides: getBuyingGuides(options).filter((g) => g.sportId === sportId),
    bestGuides: getBestGuides(options).filter((g) => g.sportId === sportId),
    tools: getToolsBySport(sportId, options),
    setups: getGearSetups(options).filter((s) => s.sportId === sportId),
    brands: brandIds
      .map((id) => getBrandById(id, options))
      .filter(Boolean),
    comparisons: getComparisons(options).filter((c) =>
      c.productIds.every((id) => productIds.has(id)),
    ),
  };
}

export function getBrandGraph(
  brandId: string,
  options?: PublishResolverOptions,
) {
  const brand = getBrandById(brandId, options);
  if (!brand) return undefined;
  return {
    brand,
    products: getProductsByBrand(brandId, options),
  };
}
