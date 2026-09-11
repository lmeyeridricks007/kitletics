import type { FinderDefinition } from "@/domain/finders/types";
import {
  runningShoeFinderDefinition,
  withRegionalBudgetOptions,
} from "@/domain/finders/configs/running-shoe-finder";
import { fitnessFinderDefinitions } from "@/domain/finders/configs/fitness-finders";
import { runningHydrationFinderDefinitions } from "@/domain/finders/configs/running-hydration-finder";
import { runningHrmFinderDefinitions } from "@/domain/finders/configs/running-hrm-finder";
import { runningGearFinderDefinitions } from "@/domain/finders/configs/running-gear-finders";
import { racketFinderDefinitions } from "@/domain/finders/configs/racket-finders";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";

const BY_SLUG: Record<string, FinderDefinition> = {
  [runningShoeFinderDefinition.slug]: runningShoeFinderDefinition,
  ...Object.fromEntries(fitnessFinderDefinitions.map((d) => [d.slug, d])),
  ...Object.fromEntries(runningHydrationFinderDefinitions.map((d) => [d.slug, d])),
  ...Object.fromEntries(runningHrmFinderDefinitions.map((d) => [d.slug, d])),
  ...Object.fromEntries(runningGearFinderDefinitions.map((d) => [d.slug, d])),
  ...Object.fromEntries(racketFinderDefinitions.map((d) => [d.slug, d])),
};

export function getFinderDefinition(
  slug: string,
  region: RegionCode = DEFAULT_REGION,
): FinderDefinition | undefined {
  const base = BY_SLUG[slug];
  if (!base) return undefined;
  return withRegionalBudgetOptions(base, region);
}

export function getAllFinderDefinitions(): FinderDefinition[] {
  return Object.values(BY_SLUG);
}

export { runningShoeFinderDefinition };
export { fitnessFinderDefinitions };
export { runningHydrationFinderDefinitions };
export { runningHrmFinderDefinitions };
export { runningGearFinderDefinitions };
export { racketFinderDefinitions };
