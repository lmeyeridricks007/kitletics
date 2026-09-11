/**
 * Vertical launch strategy — Day-1 sport enablement.
 * Does not delete content; eligibility gates decide indexation / visibility.
 */

import type { LaunchEntityKind } from "@/domain/launch/types";

export type VerticalLaunchMode = "enabled" | "selective" | "disabled";

export interface VerticalSportPolicy {
  sportId: string;
  /** Sport slug for matching */
  slug: string;
  mode: VerticalLaunchMode;
  /**
   * When mode=selective: only these entity kinds may be INDEXABLE (still subject to quality).
   * Empty = nothing indexable from this sport.
   */
  indexableKinds?: LaunchEntityKind[];
  notes?: string;
}

/**
 * Single source for which sports are commercially/editorially “on” at launch.
 * Update here when opening fitness / racket / etc. — do not scatter flags.
 */
export const verticalLaunchStrategy = {
  asOf: "2026-09-06",
  /** Sports not listed inherit defaultMode */
  defaultMode: "disabled" as VerticalLaunchMode,
  sports: [
    {
      sportId: "sport-running",
      slug: "running",
      mode: "enabled",
      notes: "Primary Day-1 vertical",
    },
    {
      sportId: "sport-training",
      slug: "fitness",
      mode: "selective",
      // Hub may stay public; deep product/editorial indexation held until ready
      indexableKinds: [],
      notes: "Fitness hub selective — no deep entity indexation at Day-1",
    },
    {
      sportId: "sport-hyrox",
      slug: "hyrox",
      mode: "disabled",
      notes: "Alias/child of fitness — hold",
    },
    {
      sportId: "sport-calisthenics",
      slug: "calisthenics",
      mode: "disabled",
    },
    {
      sportId: "sport-padel",
      slug: "padel",
      mode: "disabled",
      notes: "Racket vertical held",
    },
    {
      sportId: "sport-tennis",
      slug: "tennis",
      mode: "disabled",
    },
    {
      sportId: "sport-racket",
      slug: "racket",
      mode: "disabled",
      notes: "Umbrella racket hub held",
    },
  ] satisfies VerticalSportPolicy[],
} as const;

export type VerticalLaunchStrategy = typeof verticalLaunchStrategy;

export function getVerticalSportPolicy(
  sportIdOrSlug: string,
): VerticalSportPolicy {
  const found = verticalLaunchStrategy.sports.find(
    (s) => s.sportId === sportIdOrSlug || s.slug === sportIdOrSlug,
  );
  if (found) return found;
  return {
    sportId: sportIdOrSlug,
    slug: sportIdOrSlug,
    mode: verticalLaunchStrategy.defaultMode,
    notes: "defaultMode",
  };
}

/**
 * Resolve policy for an entity that may span multiple sports.
 * Prefer enabled > selective > disabled among matched sports.
 */
export function resolveEntityVerticalPolicy(
  sportIds: string[],
): VerticalSportPolicy {
  if (sportIds.length === 0) {
    return {
      sportId: "unknown",
      slug: "unknown",
      mode: verticalLaunchStrategy.defaultMode,
      notes: "no_sport_ids",
    };
  }
  const policies = sportIds.map(getVerticalSportPolicy);
  const enabled = policies.find((p) => p.mode === "enabled");
  if (enabled) return enabled;
  const selective = policies.find((p) => p.mode === "selective");
  if (selective) return selective;
  return policies[0]!;
}

export function verticalAllowsIndexation(
  policy: VerticalSportPolicy,
  kind: LaunchEntityKind,
): boolean {
  if (policy.mode === "enabled") return true;
  if (policy.mode === "disabled") return false;
  return (policy.indexableKinds ?? []).includes(kind);
}

/**
 * Disabled verticals: hide deep entities in production.
 * Selective with empty kinds: same for deep entities.
 * Sport hubs themselves are handled separately (PUBLIC_NOINDEX).
 */
export function verticalHidesDeepEntities(
  policy: VerticalSportPolicy,
  kind: LaunchEntityKind,
): boolean {
  if (kind === "sport" || kind === "static" || kind === "brand" || kind === "author") {
    return false;
  }
  if (policy.mode === "disabled") return true;
  if (policy.mode === "selective" && !verticalAllowsIndexation(policy, kind)) {
    return true;
  }
  return false;
}
