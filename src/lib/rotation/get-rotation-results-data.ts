import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { normalizeRotationResponses } from "@/domain/shoe-rotation/normalization";
import { runRotationPlanner } from "@/domain/shoe-rotation/engine";
import { primaryAndSecondaryRoles } from "@/domain/shoe-rotation/suitability";
import { buildProductRoleProfile } from "@/domain/shoe-rotation/suitability";
import { ROLE_BY_ID } from "@/domain/shoe-rotation/roles";
import type {
  RotationResponses,
  RotationResult,
} from "@/domain/shoe-rotation/types";
import {
  getProductsByCategory,
  getBrandById,
  getRecommendations,
  getLowestOfferPrice,
  getReviewByProduct,
  getProductById,
  getOffersForProduct,
} from "@/repositories";
import type { Product, Brand } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { buildCompareHref } from "@/lib/comparison/selection";
import { buildCompareProductIndex } from "@/lib/comparison/product-index";

export interface RotationProductCard {
  product: Product;
  brand?: Brand;
  review?: Review;
  lowestPrice?: { price: number; currency: string };
  offerCount: number;
  primaryRoles: string[];
  secondaryRoles: string[];
}

export interface RotationResultsPageData {
  result: RotationResult;
  ownedCards: RotationProductCard[];
  recommendedCards: RotationProductCard[];
  additionCards: (RotationProductCard & {
    addition: RotationResult["additions"][number];
  })[];
  alternativeCards: {
    id: string;
    label: string;
    reason: string;
    cards: RotationProductCard[];
    estimatedCost?: number;
    missingPriceCount: number;
  }[];
  compareRotationHref?: string;
  productIndex: ReturnType<typeof buildCompareProductIndex>;
  debug?: boolean;
}

function toCard(
  productId: string,
  result: RotationResult,
  options?: PublishResolverOptions,
  region: RegionCode = DEFAULT_REGION,
): RotationProductCard | undefined {
  const product = getProductById(productId, options);
  if (!product) return undefined;
  const brand = getBrandById(product.brandId, options);
  const review = getReviewByProduct(product.id, options);
  const lowestPrice = getLowestOfferPrice(product.id, region, options);
  const offers = getOffersForProduct(product.id, region);
  const profile = buildProductRoleProfile(
    product,
    getRecommendations(),
    result.profile,
    result.profile.roleOverrides[product.id],
  );
  const { primary, secondary } = primaryAndSecondaryRoles(
    profile,
    result.profile.requiredRoles,
  );
  return {
    product,
    brand,
    review,
    lowestPrice,
    offerCount: offers.length,
    primaryRoles: primary.map((r) => ROLE_BY_ID[r].label),
    secondaryRoles: secondary.map((r) => ROLE_BY_ID[r].label),
  };
}

export function getRotationResultsData(input: {
  responses: RotationResponses;
  region?: RegionCode;
  options?: PublishResolverOptions;
  debug?: boolean;
}): RotationResultsPageData | undefined {
  const region = input.region ?? DEFAULT_REGION;
  const profile = normalizeRotationResponses(input.responses, region);
  const products = getProductsByCategory("cat-running-shoes", input.options);
  const recommendations = getRecommendations().filter((r) =>
    products.some((p) => p.id === r.productId),
  );

  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of products) {
    lowestByProduct[p.id] = getLowestOfferPrice(p.id, region, input.options);
  }

  const result = runRotationPlanner({
    profile,
    products,
    recommendations,
    lowestByProduct,
  });

  const ownedCards = profile.ownedProductIds
    .map((id) => toCard(id, result, input.options, region))
    .filter((c): c is RotationProductCard => Boolean(c));

  const recommendedCards = result.recommendedProductIds
    .map((id) => toCard(id, result, input.options, region))
    .filter((c): c is RotationProductCard => Boolean(c));

  const additionCards = result.additions
    .map((addition) => {
      const card = toCard(addition.productId, result, input.options, region);
      if (!card) return undefined;
      return { ...card, addition };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const alternativeCards = result.alternatives.map((alt) => ({
    id: alt.id,
    label: alt.label,
    reason: alt.reason,
    estimatedCost: alt.set.estimatedCost,
    missingPriceCount: alt.set.missingPriceCount,
    cards: alt.set.productIds
      .map((id) => toCard(id, result, input.options, region))
      .filter((c): c is RotationProductCard => Boolean(c)),
  }));

  const compareSlugs = recommendedCards.slice(0, 4).map((c) => c.product.slug);

  return {
    result,
    ownedCards,
    recommendedCards,
    additionCards,
    alternativeCards,
    compareRotationHref:
      compareSlugs.length >= 2
        ? buildCompareHref({
            categorySlug: "running-shoes",
            productSlugs: compareSlugs,
          })
        : undefined,
    productIndex: buildCompareProductIndex(input.options).filter(
      (i) => i.categoryId === "cat-running-shoes",
    ),
    debug: input.debug,
  };
}
