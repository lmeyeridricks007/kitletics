import type { Product } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { canFeatureProduct } from "@/lib/product/media";
import {
  PADEL_RACKET_CATEGORY_ID,
  PADEL_SPORT_ID,
} from "@/lib/padel-racket-database/constants";

export {
  PADEL_RACKET_CATEGORY_ID,
  PADEL_SPORT_ID,
  PADEL_RACKET_DATABASE_PATH,
  PADEL_RACKET_CATEGORY_SLUG,
  PADEL_RACKET_COMPARE_CATEGORY_SLUG,
} from "@/lib/padel-racket-database/constants";

/**
 * Database inclusion for padel rackets.
 *
 * IMPORTANT: Padel vertical is currently `disabled`, so `isLaunchListable`
 * would yield 0 rows (deep PDPs are HIDDEN_404). This cohort is intentionally:
 * category + sport + canFeatureProduct (published + authentic media + not discontinued).
 *
 * Documented as “catalog-eligible with authentic media; vertical still held
 * for deep URLs.”
 */
export function isPadelRacketDatabaseEligible(
  product: Product,
  _options?: PublishResolverOptions,
): boolean {
  if (product.categoryId !== PADEL_RACKET_CATEGORY_ID) return false;
  if (!product.sportIds.includes(PADEL_SPORT_ID)) return false;
  return canFeatureProduct(product);
}
