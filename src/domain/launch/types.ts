/**
 * Unified launch eligibility types.
 * PUBLISHED ≠ INDEXABLE — indexation requires publication + quality + vertical + technical gates.
 */

export type LaunchDisposition = "INDEXABLE" | "PUBLIC_NOINDEX" | "HIDDEN_404";

export type LaunchEntityKind =
  | "product"
  | "review"
  | "best-guide"
  | "buying-guide"
  | "comparison"
  | "setup"
  | "tool"
  | "sport"
  | "brand"
  | "alternatives"
  | "author"
  | "static";

/** Quality classes used in launch policy (aligned with pre-launch audits). */
export type ProductLaunchQuality =
  | "LAUNCH_READY"
  | "NEEDS_MINOR_WORK"
  | "THIN"
  | "INCOMPLETE"
  | "BLOCKED";

export type ReviewLaunchQuality =
  | "LAUNCH_READY"
  | "NEEDS_MINOR_WORK"
  | "THIN"
  | "DUPLICATIVE"
  | "BLOCKED";

export type BestGuideLaunchQuality =
  | "LAUNCH_READY"
  | "NEEDS_MINOR_WORK"
  | "THIN"
  | "BLOCKED";

export type GuideLaunchQuality =
  | "COMPLETE"
  | "THIN"
  | "RESEARCH"
  | "STALE"
  | "BLOCKED"
  | "EDITORIAL_REVIEW";

export type ComparisonLaunchQuality = "MEANINGFUL" | "THIN" | "BLOCKED";

export type LaunchQualityClass =
  | ProductLaunchQuality
  | ReviewLaunchQuality
  | BestGuideLaunchQuality
  | GuideLaunchQuality
  | ComparisonLaunchQuality
  | "N/A";

export interface LaunchEligibilityReason {
  code: string;
  detail?: string;
}

export interface LaunchEligibility {
  disposition: LaunchDisposition;
  kind: LaunchEntityKind;
  /** Entity id when applicable */
  id?: string;
  /** Public path when known */
  path?: string;
  quality?: LaunchQualityClass;
  reasons: LaunchEligibilityReason[];
  /** True when preview/dev may still render HIDDEN entities */
  previewVisible: boolean;
}

export interface LaunchEligibilityContext {
  /** Override clock / publication resolver */
  now?: Date;
  isDev?: boolean;
  /**
   * When true, HIDDEN_404 entities remain renderable (noindex) for inspection.
   * Defaults from NODE_ENV / VERCEL_ENV / KITLETICS_LAUNCH_PREVIEW.
   */
  preview?: boolean;
}
