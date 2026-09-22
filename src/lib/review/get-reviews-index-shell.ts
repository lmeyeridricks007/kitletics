import { getLaunchEligibility, shouldPromotePublicly } from "@/domain/launch";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { resolveVisibleReviewType } from "@/lib/review/visible-type";
import {
  REVIEW_SHOE_CATEGORY_IDS,
  type ReviewIndexCard,
  type ReviewIndexGender,
  type ReviewIndexShellData,
} from "@/lib/review/reviews-index-shared";
import {
  getBrandById,
  getCategoryById,
  getEvidenceForIds,
  getProductById,
  getReviews,
  getSportById,
  getSubcategoryById,
} from "@/repositories";

export {
  REVIEW_HUB_MAX_PER_CATEGORY,
  REVIEW_SHOE_CATEGORY_IDS,
} from "@/lib/review/reviews-index-shared";
export type {
  ReviewIndexCard,
  ReviewIndexGender,
  ReviewIndexShellData,
} from "@/lib/review/reviews-index-shared";

function resolveGender(raw: unknown): ReviewIndexGender {
  if (raw === "men" || raw === "women" || raw === "unisex") return raw;
  return "unisex";
}

export function getReviewsIndexShellData(): ReviewIndexShellData {
  const cards: ReviewIndexCard[] = [];
  for (const review of getReviews()) {
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "review", entity: review }),
      )
    ) {
      continue;
    }
    const product = getProductById(review.productId);
    const brand = product ? getBrandById(product.brandId) : undefined;
    const category = product ? getCategoryById(product.categoryId) : undefined;
    const evidence = getEvidenceForIds(review.evidenceIds);
    const visibleReviewType = resolveVisibleReviewType(review, evidence);
    const media = product ? getPrimaryProductMedia(product) : undefined;
    const sportSlugs = (product?.sportIds ?? [])
      .map((id) => getSportById(id)?.slug)
      .filter((s): s is string => Boolean(s));
    const shoeTypes = (product?.subcategoryIds ?? [])
      .map((id) => getSubcategoryById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({ slug: s.slug, name: s.name }));
    const displayScore =
      product?.recommendationScore !== undefined
        ? product.recommendationScore
        : review.score;

    cards.push({
      id: review.id,
      slug: review.slug,
      title: review.title,
      summary: review.summary.slice(0, 220),
      reviewType: visibleReviewType,
      score: review.score,
      displayScore,
      productName: product?.name ?? review.title,
      brandName: brand?.name,
      brandSlug: brand?.slug,
      sportSlugs,
      categoryId: category?.id ?? "other",
      categorySlug: category?.slug ?? "other",
      categoryName: category?.name ?? "Other",
      gender: resolveGender(product?.specifications?.genderFit),
      shoeTypes,
      isShoe: product ? REVIEW_SHOE_CATEGORY_IDS.has(product.categoryId) : false,
      image: media ? { src: media.src, alt: media.alt } : undefined,
    });
  }

  return { cards };
}
