/**
 * Guides Hub featureability — keep Featured / Start Here on complete guides.
 */

import type { BuyingGuide } from "@/domain/editorial/types";
import {
  assessGuideQuality,
  canFeatureGuideByQuality,
} from "@/lib/guides/assess-guide-quality";

export type GuideHubQuality = "complete" | "eligible" | "thin";

export function assessGuideHubQuality(guide: BuyingGuide): GuideHubQuality {
  const q = assessGuideQuality(guide);
  if (q.status === "complete") return "complete";
  if (q.status === "needs-research" || q.status === "needs-editorial-review") {
    return "eligible";
  }
  return "thin";
}

/**
 * Featured / Start Here eligibility.
 * Thin guides may remain public but must not lead the hub.
 */
export function canFeatureGuide(guide: BuyingGuide): boolean {
  return canFeatureGuideByQuality(guide);
}

export { canPublishGuide } from "@/lib/guides/assess-guide-quality";
