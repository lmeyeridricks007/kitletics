/**
 * Category specification policy.
 *
 * - `full` — category has (or should have) a complete comparison/finder spec schema
 * - `minimal` — keep a small set of filterable specs only (accessory / niche cats)
 * - `none` — intentionally non-spec: taxonomy / merchandising only; no Comparison
 *   tables or finder scoring. Do not invent placeholder specs.
 *
 * Categories not listed inherit `full` when they already have definitions in
 * `allSpecificationDefinitions`, otherwise treat as needing a policy decision.
 */
export type CategorySpecPolicy = "full" | "minimal" | "none";

export const CATEGORY_SPEC_POLICY: Record<string, CategorySpecPolicy> = {
  // Court footwear — minimal court-relevant attributes (not full running geometry)
  "cat-padel-shoes": "minimal",
  "cat-tennis-shoes": "minimal",

  // Racket accessories with sparse catalog — minimal commercial filters
  "cat-tennis-strings": "minimal",
  "cat-padel-bags": "minimal",
  "cat-padel-balls": "minimal",
  "cat-padel-grips": "minimal",

  // Fitness accessories / functional gear — minimal operational specs
  "cat-kettlebells": "minimal",
  "cat-parallettes": "minimal",
  "cat-gymnastic-rings": "minimal",
  "cat-weighted-vests": "minimal",
  "cat-functional-fitness": "minimal",
  "cat-gym-flooring": "minimal",
  "cat-gym-storage": "minimal",
  "cat-lifting-accessories": "minimal",

  // Empty / merchandising-only categories — explicitly non-spec
  "cat-padel-accessories": "none",
  "cat-padel-clothing": "none",
};

export function getCategorySpecPolicy(categoryId: string): CategorySpecPolicy {
  return CATEGORY_SPEC_POLICY[categoryId] ?? "full";
}

export function isNonSpecCategory(categoryId: string): boolean {
  return getCategorySpecPolicy(categoryId) === "none";
}
