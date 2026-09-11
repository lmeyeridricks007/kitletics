/**
 * Simulate Day-1 launch eligibility counts (production context).
 * Used by tests + docs/prelaunch/fixes/13 report — does not hardcode inventory.
 *
 * Fix 84: cache once per process — tallies are immutable for a catalog load.
 */

import {
  getProducts,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getSports,
  getGearSetups,
  getTools,
  getBrands,
} from "@/repositories";
import {
  getLaunchEligibility,
  type LaunchDisposition,
  type LaunchEntityKind,
} from "@/domain/launch";

const PROD = { isDev: false as const };

export type Day1CountRow = {
  kind: LaunchEntityKind | "published_pool";
  published: number;
  INDEXABLE: number;
  PUBLIC_NOINDEX: number;
  HIDDEN_404: number;
};

export type Day1LaunchCounts = {
  asOf: string;
  rows: Day1CountRow[];
  totals: Omit<Day1CountRow, "kind" | "published"> & { published: number };
};

function emptyRow(kind: Day1CountRow["kind"], published: number): Day1CountRow {
  return {
    kind,
    published,
    INDEXABLE: 0,
    PUBLIC_NOINDEX: 0,
    HIDDEN_404: 0,
  };
}

function tally(row: Day1CountRow, disposition: LaunchDisposition): void {
  row[disposition] += 1;
}

function computeDay1LaunchCounts(): Day1LaunchCounts {
  const rows: Day1CountRow[] = [];

  const products = getProducts(PROD);
  const productRow = emptyRow("product", products.length);
  for (const p of products) {
    tally(
      productRow,
      getLaunchEligibility({ kind: "product", entity: p }, PROD).disposition,
    );
  }
  rows.push(productRow);

  const reviews = getReviews(PROD);
  const reviewRow = emptyRow("review", reviews.length);
  for (const r of reviews) {
    tally(
      reviewRow,
      getLaunchEligibility({ kind: "review", entity: r }, PROD).disposition,
    );
  }
  rows.push(reviewRow);

  const best = getBestGuides(PROD);
  const bestRow = emptyRow("best-guide", best.length);
  for (const g of best) {
    tally(
      bestRow,
      getLaunchEligibility({ kind: "best-guide", entity: g }, PROD)
        .disposition,
    );
  }
  rows.push(bestRow);

  const guides = getBuyingGuides(PROD);
  const guideRow = emptyRow("buying-guide", guides.length);
  for (const g of guides) {
    tally(
      guideRow,
      getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD)
        .disposition,
    );
  }
  rows.push(guideRow);

  const comps = getComparisons(PROD);
  const compRow = emptyRow("comparison", comps.length);
  for (const c of comps) {
    tally(
      compRow,
      getLaunchEligibility({ kind: "comparison", entity: c }, PROD)
        .disposition,
    );
  }
  rows.push(compRow);

  const setups = getGearSetups(PROD);
  const setupRow = emptyRow("setup", setups.length);
  for (const s of setups) {
    tally(
      setupRow,
      getLaunchEligibility({ kind: "setup", entity: s }, PROD).disposition,
    );
  }
  rows.push(setupRow);

  const tools = getTools(PROD).filter((t) => t.available);
  const toolRow = emptyRow("tool", tools.length);
  for (const t of tools) {
    tally(
      toolRow,
      getLaunchEligibility({ kind: "tool", entity: t }, PROD).disposition,
    );
  }
  rows.push(toolRow);

  const sports = getSports(PROD).filter((s) => s.contentStatus === "live");
  const sportRow = emptyRow("sport", sports.length);
  for (const s of sports) {
    tally(
      sportRow,
      getLaunchEligibility({ kind: "sport", entity: s }, PROD).disposition,
    );
  }
  rows.push(sportRow);

  const brands = getBrands(PROD);
  const brandRow = emptyRow("brand", brands.length);
  for (const b of brands) {
    tally(
      brandRow,
      getLaunchEligibility({ kind: "brand", entity: b }, PROD).disposition,
    );
  }
  rows.push(brandRow);

  const totals = {
    published: 0,
    INDEXABLE: 0,
    PUBLIC_NOINDEX: 0,
    HIDDEN_404: 0,
  };
  for (const row of rows) {
    totals.published += row.published;
    totals.INDEXABLE += row.INDEXABLE;
    totals.PUBLIC_NOINDEX += row.PUBLIC_NOINDEX;
    totals.HIDDEN_404 += row.HIDDEN_404;
  }

  return {
    asOf: new Date().toISOString().slice(0, 10),
    rows,
    totals,
  };
}

let day1Cache: Day1LaunchCounts | undefined;

export function simulateDay1LaunchCounts(): Day1LaunchCounts {
  if (!day1Cache) day1Cache = computeDay1LaunchCounts();
  return day1Cache;
}

export function clearDay1LaunchCountsCacheForTests(): void {
  day1Cache = undefined;
}
