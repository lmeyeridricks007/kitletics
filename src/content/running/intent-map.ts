/**
 * Canonical Running content intent map — prevents keyword cannibalisation.
 * Internal SEO / editorial architecture (Prompt 16).
 */

export type ContentIntentPageType =
  | "category"
  | "listing"
  | "best-guide"
  | "buying-guide"
  | "comparison"
  | "product"
  | "review"
  | "alternatives"
  | "finder"
  | "calculator"
  | "planner"
  | "setup"
  | "hub"
  | "discipline";

export interface ContentIntentEntry {
  /** Normalised topic / query intent */
  topic: string;
  pageType: ContentIntentPageType;
  canonicalPath: string;
  /** Supporting pages that may rank for related long-tail */
  supportingPaths?: string[];
  priority: "P0" | "P1" | "P2" | "P3";
}

export const runningContentIntentMap: ContentIntentEntry[] = [
  {
    topic: "running",
    pageType: "hub",
    canonicalPath: "/running",
    priority: "P0",
  },
  {
    topic: "running shoes",
    pageType: "category",
    canonicalPath: "/running/shoes",
    supportingPaths: ["/best/running-shoes", "/guides/how-to-choose-running-shoes"],
    priority: "P0",
  },
  {
    topic: "best running shoes",
    pageType: "best-guide",
    canonicalPath: "/best/running-shoes",
    supportingPaths: ["/best/daily-trainers", "/tools/running-shoe-finder"],
    priority: "P0",
  },
  {
    topic: "how to choose running shoes",
    pageType: "buying-guide",
    canonicalPath: "/guides/how-to-choose-running-shoes",
    priority: "P0",
  },
  {
    topic: "running shoe finder",
    pageType: "finder",
    canonicalPath: "/tools/running-shoe-finder",
    priority: "P0",
  },
  {
    topic: "shoe rotation planner",
    pageType: "planner",
    canonicalPath: "/tools/shoe-rotation-planner",
    supportingPaths: ["/guides/running-shoe-rotation"],
    priority: "P0",
  },
  {
    topic: "running shoe rotation",
    pageType: "buying-guide",
    canonicalPath: "/guides/running-shoe-rotation",
    supportingPaths: ["/tools/shoe-rotation-planner"],
    priority: "P1",
  },
  {
    topic: "daily trainers",
    pageType: "best-guide",
    canonicalPath: "/best/daily-trainers",
    supportingPaths: ["/guides/what-is-a-daily-trainer"],
    priority: "P1",
  },
  {
    topic: "best long run shoes",
    pageType: "best-guide",
    canonicalPath: "/best/running-shoes-long-runs",
    priority: "P1",
  },
  {
    topic: "race shoes",
    pageType: "listing",
    canonicalPath: "/running/shoes/race",
    supportingPaths: ["/best/race-shoes", "/running/shoes?type=race"],
    priority: "P1",
  },
  {
    topic: "best race shoes",
    pageType: "best-guide",
    canonicalPath: "/best/race-shoes",
    supportingPaths: ["/running/shoes/race"],
    priority: "P1",
  },
  {
    topic: "stability shoes",
    pageType: "listing",
    canonicalPath: "/running/shoes/stability",
    supportingPaths: [
      "/best/stability-running-shoes",
      "/guides/stability-shoes-explained",
    ],
    priority: "P1",
  },
  {
    topic: "trail shoes",
    pageType: "listing",
    canonicalPath: "/running/shoes/trail",
    supportingPaths: ["/best/trail-running-shoes"],
    priority: "P1",
  },
  {
    topic: "shoes for heavier runners",
    pageType: "listing",
    canonicalPath: "/running/shoes/heavy-runners",
    supportingPaths: ["/best/running-shoes-heavy-runners"],
    priority: "P2",
  },
  {
    topic: "best marathon shoes",
    pageType: "best-guide",
    canonicalPath: "/best/marathon-shoes",
    supportingPaths: ["/best/race-shoes", "/setups/marathon-race-day-kit"],
    priority: "P1",
  },
  {
    topic: "best tempo shoes",
    pageType: "best-guide",
    canonicalPath: "/best/tempo-running-shoes",
    priority: "P1",
  },
  {
    topic: "best stability shoes",
    pageType: "best-guide",
    canonicalPath: "/best/stability-running-shoes",
    supportingPaths: [
      "/guides/stability-shoes-explained",
      "/running/shoes/stability",
    ],
    priority: "P1",
  },
  {
    topic: "best trail shoes",
    pageType: "best-guide",
    canonicalPath: "/best/trail-running-shoes",
    supportingPaths: ["/running/shoes/trail"],
    priority: "P1",
  },
  {
    topic: "best running watches",
    pageType: "best-guide",
    canonicalPath: "/best/running-watches",
    supportingPaths: ["/guides/how-to-choose-running-watch"],
    priority: "P1",
  },
  {
    topic: "best heart rate monitors",
    pageType: "best-guide",
    canonicalPath: "/best/heart-rate-monitors-running",
    priority: "P1",
  },
  {
    topic: "best hydration vests",
    pageType: "best-guide",
    canonicalPath: "/best/running-hydration-vests",
    priority: "P1",
  },
  {
    topic: "running shoe drop",
    pageType: "buying-guide",
    canonicalPath: "/guides/running-shoe-drop",
    priority: "P1",
  },
  {
    topic: "running shoe cushioning",
    pageType: "buying-guide",
    canonicalPath: "/guides/running-shoe-cushioning",
    priority: "P1",
  },
  {
    topic: "carbon vs nylon plates",
    pageType: "buying-guide",
    canonicalPath: "/guides/carbon-vs-nylon-plates",
    supportingPaths: ["/best/carbon-plated-running-shoes"],
    priority: "P1",
  },
  {
    topic: "novablast 6",
    pageType: "product",
    canonicalPath: "/products/asics-novablast-6",
    supportingPaths: [
      "/products/asics-novablast-6/alternatives",
      "/compare/asics-novablast-6-vs-asics-novablast-5",
    ],
    priority: "P0",
  },
  {
    topic: "pace calculator",
    pageType: "calculator",
    canonicalPath: "/tools/running-pace-calculator",
    priority: "P1",
  },
  {
    topic: "race time predictor",
    pageType: "calculator",
    canonicalPath: "/tools/race-time-predictor",
    priority: "P1",
  },
  {
    topic: "beginner running setup",
    pageType: "setup",
    canonicalPath: "/setups/beginner-running-setup",
    priority: "P1",
  },
  {
    topic: "marathon race day kit",
    pageType: "setup",
    canonicalPath: "/setups/marathon-race-day-kit",
    priority: "P1",
  },
];

export function findIntentCollisions(
  entries: ContentIntentEntry[] = runningContentIntentMap,
): { topic: string; paths: string[] }[] {
  const byTopic = new Map<string, string[]>();
  for (const e of entries) {
    const key = e.topic.toLowerCase().trim();
    const list = byTopic.get(key) ?? [];
    list.push(e.canonicalPath);
    byTopic.set(key, list);
  }
  return [...byTopic.entries()]
    .filter(([, paths]) => new Set(paths).size > 1)
    .map(([topic, paths]) => ({ topic, paths: [...new Set(paths)] }));
}
