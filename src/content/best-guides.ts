import type { BestGuide } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import { padelBestGuides } from "@/content/padel/seed";
import { fitnessBestGuides } from "@/content/fitness";
import { racketBestGuides } from "@/content/racket";
import { runningBestGuides } from "@/content/running/best-guides";
import { runningGearBestGuides } from "@/content/running/best-guides-gear";
import { applyBestGuideP0LaunchReadyEnrichment } from "@/content/running/best-guides-p0-launch-ready";
import { applyBestGuideP1LaunchReadyEnrichment } from "@/content/running/best-guides-p1-launch-ready";
import { applyBestGuideP2VerticalLaunchReadyEnrichment } from "@/content/best-guides-p2-vertical-launch-ready";
import { applyBestGuideCannibalizationDifferentiation } from "@/content/best-guides-p2-cannibalization";
import { applyBestGuideP46IntentRoles } from "@/content/best-guides-p46-intent-roles";
import { applyBestGuideComparisonLinks } from "@/content/running/best-guide-compare-links";
import { runningComparisons } from "@/content/running/comparisons";
import { applyComparisonP41Completion } from "@/content/comparisons-p41-completion";

// Re-export helper used by older imports that expected shoeCriteria inline
void publishedMeta;

export const bestGuides: BestGuide[] = applyBestGuideComparisonLinks(
  applyBestGuideP46IntentRoles(
    applyBestGuideCannibalizationDifferentiation(
      applyBestGuideP2VerticalLaunchReadyEnrichment(
        applyBestGuideP1LaunchReadyEnrichment(
          applyBestGuideP0LaunchReadyEnrichment([
            ...runningBestGuides,
            ...runningGearBestGuides,
            ...padelBestGuides,
            ...racketBestGuides,
            ...fitnessBestGuides,
          ]),
        ),
      ),
    ),
  ),
  applyComparisonP41Completion(runningComparisons),
);
