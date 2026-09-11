import type { LaunchEligibility } from "@/domain/launch/types";

/**
 * Internal-only eligibility summary for preview/dev debug UI.
 * Never render on production public pages.
 */
export function formatLaunchEligibilityTrace(
  elig: LaunchEligibility,
): string {
  const reasons = elig.reasons
    .map((r) => (r.detail ? `${r.code}(${r.detail})` : r.code))
    .join("; ");
  return [
    `disposition=${elig.disposition}`,
    elig.quality ? `quality=${elig.quality}` : null,
    elig.path ? `path=${elig.path}` : null,
    reasons ? `reasons=${reasons}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}
