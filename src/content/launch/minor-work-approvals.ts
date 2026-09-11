/**
 * Explicit launch approvals for NEEDS_MINOR_WORK entities.
 * Default: none — minor-work content is held from indexation unless listed.
 */

export const launchMinorWorkApprovals = {
  asOf: "2026-09-06",
  /** Product slugs approved to INDEXABLE despite NEEDS_MINOR_WORK */
  productSlugs: [] as string[],
  /** Review slugs approved to INDEXABLE despite NEEDS_MINOR_WORK */
  reviewSlugs: [] as string[],
  /** Best guide slugs — Best policy is LAUNCH_READY-only; keep empty */
  bestGuideSlugs: [] as string[],
} as const;

export function isMinorWorkProductApproved(slug: string): boolean {
  return launchMinorWorkApprovals.productSlugs.includes(slug);
}

export function isMinorWorkReviewApproved(slug: string): boolean {
  return launchMinorWorkApprovals.reviewSlugs.includes(slug);
}
