"use server";

import { getDynamicComparisonData } from "@/lib/comparison/get-comparison-page-data";
import type { ComparisonPageData } from "@/lib/comparison/get-comparison-page-data";

/**
 * Client Compare Builder recompute — catalog stays server-side.
 */
export async function loadDynamicComparisonAction(
  productSlugs: string[],
): Promise<ComparisonPageData | null> {
  if (productSlugs.length < 2) return null;
  return getDynamicComparisonData(productSlugs, { isDev: false }) ?? null;
}
