import type { DiscoveryQuery, LinkableAsset } from "./types";
import { weeklyDiscoveryQueries } from "./weekly-queries";

const PATTERNS: Array<{ query: string; intent: string; assetId?: string }> = [
  { query: '"running shoe" resources', intent: "resource_page", assetId: "asset-shoe-database" },
  { query: '"running shoe database"', intent: "data_citation", assetId: "asset-shoe-database" },
  { query: '"running shoe statistics"', intent: "statistics", assetId: "asset-shoe-database" },
  { query: '"running gear" resources', intent: "resource_page", assetId: "asset-guide-choose-shoes" },
  { query: '"running coach" shoe guide', intent: "coach", assetId: "asset-guide-choose-shoes" },
  { query: '"running shoe weight" data', intent: "research", assetId: "asset-shoe-database" },
  { query: '"running shoe stack height" research', intent: "research", assetId: "asset-shoe-database" },
  { query: '"running shoe drop" guide', intent: "explainer", assetId: "asset-guide-drop" },
  { query: '"marathon gear" resources', intent: "resource_page", assetId: "asset-shoe-finder" },
  { query: '"best running shoes" methodology', intent: "roundup", assetId: "asset-best-running-shoes" },
  { query: 'inurl:resources "running shoes"', intent: "resource_page", assetId: "asset-shoe-database" },
  { query: '"further reading" "heel-to-toe drop"', intent: "explainer", assetId: "asset-guide-drop" },
];

export function generateDiscoveryQueries(
  competitorDomains: string[] = [],
  assets: LinkableAsset[] = [],
): DiscoveryQuery[] {
  const queries: DiscoveryQuery[] = PATTERNS.map((p, i) => ({
    id: `q-${String(i + 1).padStart(2, "0")}`,
    query: p.query,
    intent: p.intent,
    recommendedAssetId: p.assetId,
  }));

  for (const domain of competitorDomains) {
    const host = domain.replace(/^www\./, "");
    queries.push({
      id: `q-comp-${host.replace(/\W+/g, "-")}`,
      query: `site:${host} "running shoe" OR database OR "stack height"`,
      intent: "competitor_mention",
      recommendedAssetId: assets[0]?.assetId,
    });
  }

  queries.push(...weeklyDiscoveryQueries());
  return queries;
}
