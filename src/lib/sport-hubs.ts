/**
 * Sport hub routing — single entry decision for `/[sport]` pages.
 *
 * Two presentation stacks exist by design:
 * 1. `lib/sport-hub` + `components/sport-hub` — declarative hubs (running, padel)
 * 2. `lib/hubs` + `components/hub` — assemble hubs (fitness only)
 *
 * Running previously had a parallel assemble config in `lib/hubs/running.ts`
 * that never rendered (sport-hub wins first). That dead path was removed.
 */
export {
  getSportHubData,
  hasMockupSportHub as hasDeclarativeSportHub,
  getMockupSportHubConfig as getDeclarativeSportHubConfig,
} from "@/lib/sport-hub";
export type { SportHubPageData } from "@/lib/sport-hub";

export {
  assembleSportHubData,
  hasSportHub as hasAssembleSportHub,
  getSportHubConfig as getAssembleSportHubConfig,
} from "@/lib/hubs";
export type { SportHubData as AssembleSportHubData } from "@/lib/hubs";
