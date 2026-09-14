/**
 * Padel research story definitions.
 * Findings publish only when readiness gates pass.
 */

export type PadelResearchStorySlug =
  | "padel-racket-market-2026"
  | "padel-racket-prices"
  | "padel-racket-weight"
  | "padel-racket-shapes";

export type PadelResearchRequiredMetric =
  | "shape"
  | "weightMin"
  | "price"
  | "balance";

export interface PadelResearchStoryDefinition {
  slug: PadelResearchStorySlug;
  title: string;
  path: `/research/${PadelResearchStorySlug}`;
  summary: string;
  requiredMetrics: PadelResearchRequiredMetric[];
  /** Absolute count of models with the primary metric known */
  minCoverage: number;
  /** For shapes: also require this many distinct shape classes */
  minDistinctClasses?: number;
  /** Optional secondary gates (e.g. market story needs shapes + weight) */
  requiresStoriesReady?: PadelResearchStorySlug[];
}

export const PADEL_RESEARCH_STORIES: PadelResearchStoryDefinition[] = [
  {
    slug: "padel-racket-shapes",
    title: "Padel racket shapes in the Kitletics catalog",
    path: "/research/padel-racket-shapes",
    summary:
      "Distribution of published shapes among catalog-eligible padel rackets.",
    requiredMetrics: ["shape"],
    minCoverage: 40,
    minDistinctClasses: 3,
  },
  {
    slug: "padel-racket-weight",
    title: "Padel racket weight in the Kitletics catalog",
    path: "/research/padel-racket-weight",
    summary:
      "Published minimum-weight distribution — no invented midpoints from ranges.",
    requiredMetrics: ["weightMin"],
    minCoverage: 35,
  },
  {
    slug: "padel-racket-prices",
    title: "Padel racket verified offer prices",
    path: "/research/padel-racket-prices",
    summary:
      "Verified regional offer-price distribution among priced eligible rackets.",
    requiredMetrics: ["price"],
    minCoverage: 25,
  },
  {
    slug: "padel-racket-market-2026",
    title: "Padel racket market snapshot 2026 (Kitletics cohort)",
    path: "/research/padel-racket-market-2026",
    summary:
      "Composite snapshot requiring shape and weight coverage; prices optional.",
    requiredMetrics: ["shape", "weightMin"],
    minCoverage: 40,
    requiresStoriesReady: ["padel-racket-shapes", "padel-racket-weight"],
  },
];

export const PADEL_RESEARCH_SLUGS = new Set<string>(
  PADEL_RESEARCH_STORIES.map((s) => s.slug),
);

export function getPadelResearchStory(
  slug: string,
): PadelResearchStoryDefinition | undefined {
  return PADEL_RESEARCH_STORIES.find((s) => s.slug === slug);
}
