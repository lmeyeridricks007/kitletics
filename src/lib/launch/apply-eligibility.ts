import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { LaunchEligibility } from "@/domain/launch/types";
import {
  shouldNoindex,
  shouldRenderPublicly,
} from "@/domain/launch/get-launch-eligibility";

/**
 * Apply launch disposition to page rendering.
 * HIDDEN_404 → notFound() in production; preview may continue.
 */
export function enforceLaunchEligibility(elig: LaunchEligibility): void {
  if (!shouldRenderPublicly(elig)) {
    notFound();
  }
}

/** Merge robots noindex when disposition is not INDEXABLE. */
export function withLaunchRobots(
  meta: Metadata,
  elig: LaunchEligibility,
): Metadata {
  if (!shouldNoindex(elig)) return meta;
  return {
    ...meta,
    robots: { index: false, follow: false },
  };
}

export { formatLaunchEligibilityTrace } from "@/lib/launch/format-trace";
