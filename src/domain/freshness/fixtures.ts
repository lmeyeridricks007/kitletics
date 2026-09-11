import type { DiscoveryCandidate } from "@/domain/onboarding/types";
import { FIXTURE_ASICS_LINEUP } from "@/domain/onboarding/fixtures";
import type { ContentScanTarget } from "@/domain/freshness/monitoring/content";

export const FIXTURE_BRAND_LINEUPS: Record<string, DiscoveryCandidate[]> = {
  "brand-asics": FIXTURE_ASICS_LINEUP,
};

/** Padel multi-sport fixture — proves monitoring is not Running-only */
export const FIXTURE_PADEL_LINEUP: DiscoveryCandidate[] = [
  {
    brandName: "Bullpadel",
    modelName: "Vertex 04",
    fullName: "Bullpadel Vertex 04",
    familyName: "Vertex",
    generation: "04",
    categorySlug: "padel-rackets",
    priority: "LOW",
    reason: "Existing catalog Product",
    kind: "existing",
  },
  {
    brandName: "Bullpadel",
    modelName: "Vertex 06",
    fullName: "Bullpadel Vertex 06",
    familyName: "Vertex",
    generation: "06",
    categorySlug: "padel-rackets",
    priority: "HIGH",
    reason: "New generation of major padel racket family",
    kind: "new-generation",
  },
];

export const FIXTURE_CONTENT_YEAR_GUIDE: ContentScanTarget = {
  id: "guide-best-running-shoes-2026",
  entityType: "best-guide",
  title: "Best Running Shoes 2026",
  body: "Our latest picks for the current generation of daily trainers. The lightest shoe here costs €149.",
};

export const FIXTURE_NO_CHANGE_LINEUP: DiscoveryCandidate[] = [
  {
    brandName: "ASICS",
    modelName: "Novablast 6",
    fullName: "ASICS Novablast 6",
    familyName: "Novablast",
    generation: "6",
    categorySlug: "running-shoes",
    priority: "LOW",
    reason: "Already in catalog",
    kind: "existing",
  },
];
