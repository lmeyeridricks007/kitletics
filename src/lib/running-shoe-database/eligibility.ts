import type { Product } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { canFeatureProduct } from "@/lib/product/media";
import {
  getLaunchEligibility,
  isLaunchListable,
} from "@/domain/launch";
import {
  RUNNING_SHOE_CATEGORY_ID,
  RUNNING_SPORT_ID,
} from "@/lib/running-shoe-database/constants";

export {
  RUNNING_SHOE_CATEGORY_ID,
  RUNNING_SPORT_ID,
  RUNNING_SHOE_DATABASE_PATH,
  RUNNING_SHOE_CATEGORY_SLUG,
} from "@/lib/running-shoe-database/constants";

/**
 * Database inclusion mirrors the public Running shoes catalog listing gate:
 * authentic media + published + launch-listable (excludes draft / held / blocked).
 */
export function isRunningShoeDatabaseEligible(
  product: Product,
  options?: PublishResolverOptions,
): boolean {
  if (product.categoryId !== RUNNING_SHOE_CATEGORY_ID) return false;
  if (!product.sportIds.includes(RUNNING_SPORT_ID)) return false;
  if (!canFeatureProduct(product)) return false;
  return isLaunchListable(
    getLaunchEligibility({ kind: "product", entity: product }, options),
  );
}
