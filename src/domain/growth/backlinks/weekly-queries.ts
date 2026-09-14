import type { DiscoveryQuery } from "./types";

export const WEEKLY_FIND_BUCKETS = [
  "competitor_gap",
  "resource_page",
  "journalist",
  "data_citation",
  "running_club",
  "newsletter_podcast",
  "forum_thread",
] as const;

export type WeeklyFindBucket = (typeof WEEKLY_FIND_BUCKETS)[number];

const BUCKET_QUERIES: Record<WeeklyFindBucket, Array<{ query: string; assetId: string }>> = {
  competitor_gap: [
    { query: '"runrepeat.com" "running shoe" (database OR stack OR drop)', assetId: "asset-shoe-database" },
    { query: '"doctorsofrunning.com" (resources OR methodology OR drop)', assetId: "asset-shoe-database" },
    { query: '"runningshoesguru.com" (database OR lab OR stack height)', assetId: "asset-shoe-database" },
    { query: '"believeintherun.com" (how we test OR methodology)', assetId: "asset-shoe-database" },
    { query: '"roadtrailrun.com" (stack OR drop OR spec table)', assetId: "asset-shoe-database" },
  ],
  resource_page: [
    { query: 'inurl:resources "running shoes" (drop OR stack OR "how to choose")', assetId: "asset-guide-choose-shoes" },
    { query: '"further reading" "heel-to-toe drop"', assetId: "asset-guide-drop" },
    { query: '"running shoe" (learning center OR expert advice) (drop OR stack)', assetId: "asset-shoe-database" },
  ],
  journalist: [
    { query: '"looking for a source" "running shoes" (data OR database OR statistics)', assetId: "asset-shoe-database" },
    { query: 'HARO OR Qwoted "running shoe" (stack OR drop OR price)', assetId: "asset-shoe-database" },
  ],
  data_citation: [
    { query: '"running shoe database" -runrepeat -site:kitletics.com', assetId: "asset-shoe-database" },
    { query: '"running shoe" ("stack height" OR "heel-to-toe drop") (table OR dataset OR statistics)', assetId: "asset-shoe-database" },
  ],
  running_club: [
    { query: '"running club" ("beginner" OR "getting started") (shoes OR gear) resources', assetId: "asset-shoe-finder" },
    { query: '"for runners" (shoes OR "how to choose") (club OR rrca OR athletics)', assetId: "asset-shoe-finder" },
  ],
  newsletter_podcast: [
    { query: '"running" (newsletter OR "show notes") ("stack height" OR "heel drop" OR "daily trainer")', assetId: "asset-shoe-database" },
    { query: '"running podcast" ("show notes" OR resources) (shoes OR gear)', assetId: "asset-shoe-finder" },
  ],
  forum_thread: [
    { query: '"what running shoes should I buy" (reddit OR forum)', assetId: "asset-shoe-finder" },
    { query: '"best daily trainer" (reddit OR "running forum")', assetId: "asset-best-daily-trainers" },
    { query: '"Novablast vs Ghost"', assetId: "asset-compare" },
    { query: '"what heel drop should I choose"', assetId: "asset-guide-drop" },
    { query: '"best shoe for long runs" reddit', assetId: "asset-best-daily-trainers" },
    { query: '"running shoe database" (reddit OR forum)', assetId: "asset-shoe-database" },
    { query: '"how do I compare running shoes"', assetId: "asset-compare" },
    { query: '"best watch for running" reddit', assetId: "asset-best-running-watches" },
    { query: '"running shoe under" (150 OR euro) reddit', assetId: "asset-shoe-database" },
    { query: '"shoes for HYROX" (reddit OR recommend)', assetId: "asset-shoe-finder" },
    { query: '"best shoes for heavier runners"', assetId: "asset-guide-choose-shoes" },
    { query: '"best shoes for marathon training" reddit', assetId: "asset-best-daily-trainers" },
  ],
};

export function weeklyDiscoveryQueries(): DiscoveryQuery[] {
  const out: DiscoveryQuery[] = [];
  let i = 0;
  for (const bucket of WEEKLY_FIND_BUCKETS) {
    for (const row of BUCKET_QUERIES[bucket]) {
      i += 1;
      out.push({
        id: `q-wk-${bucket}-${String(i).padStart(2, "0")}`,
        query: row.query,
        intent: bucket,
        recommendedAssetId: row.assetId,
      });
    }
  }
  return out;
}
