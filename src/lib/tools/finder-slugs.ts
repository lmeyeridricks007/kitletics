/**
 * Finder tool slugs — keep this list tiny and free of domain/catalog imports
 * so middleware and route routers can branch without pulling Finder configs.
 */
export const FINDER_TOOL_SLUGS = [
  "running-shoe-finder",
  "training-shoe-finder",
  "hyrox-shoe-finder",
  "adjustable-dumbbell-finder",
  "power-rack-finder",
  "treadmill-finder",
  "pull-up-bar-finder",
  "fitness-watch-finder",
  "running-hydration-finder",
  "running-hrm-finder",
  "running-clothing-finder",
  "running-fuel-finder",
  "running-recovery-finder",
  "running-accessories-finder",
  "padel-racket-finder",
  "tennis-racket-finder",
] as const;

export type FinderToolSlug = (typeof FINDER_TOOL_SLUGS)[number];

const FINDER_SLUG_SET = new Set<string>(FINDER_TOOL_SLUGS);

export function isFinderToolSlug(slug: string): boolean {
  return FINDER_SLUG_SET.has(slug);
}
