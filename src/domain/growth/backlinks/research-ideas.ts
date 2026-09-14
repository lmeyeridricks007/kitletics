import {
  getRunningShoeDatabaseRecords,
} from "@/lib/running-shoe-database/build-records";
import { computeRunningShoeMarketInsights } from "@/lib/running-shoe-database/statistics/insights";
import type { ResearchIdea } from "./types";

function idea(
  partial: ResearchIdea,
  finding?: { summary: string; proven: boolean },
): ResearchIdea {
  if (!finding) return { ...partial, findingProven: false };
  return {
    ...partial,
    findingSummary: finding.summary,
    findingProven: finding.proven,
    status: finding.proven ? "computable" : partial.status,
    coverage: finding.proven ? finding.summary : partial.coverage,
  };
}

/**
 * Research board. Findings are attached only when the canonical database can compute them.
 */
export function buildResearchIdeas(): ResearchIdea[] {
  const records = getRunningShoeDatabaseRecords("NL", { isDev: false });
  const insights = records.length
    ? computeRunningShoeMarketInsights(records)
    : null;

  const lightest = insights?.lightestDailyTrainers;
  const stack = insights?.highestStackShoes;
  const drop = insights?.lowestDropTrainers;
  const price = insights?.averageOfferPriceByBrand;
  const plated = insights?.platedVsNonPlated;

  return [
    idea(
      {
        id: "idea-lightest-brands",
        headline: "Which brands make the lightest daily trainers?",
        datasetRequired: "Running Shoe Database weight + daily-trainer flag + quality gate",
        newsworthiness: 78,
        seasonality: "evergreen",
        targetPublications: ["running media", "gear newsletters"],
        targetJournalistIds: [],
        targetAssetId: "asset-shoe-database",
        status: "idea",
        findingProven: false,
      },
      lightest?.value?.length
        ? {
            proven: true,
            summary: `Computable now: ${lightest.value
              .slice(0, 3)
              .map((r) => `${r.brandName} ${r.name} ${r.metricValue}${r.metricUnit}`)
              .join("; ")}. n=${lightest.sampleSize}/${lightest.populationSize}.`,
          }
        : undefined,
    ),
    idea(
      {
        id: "idea-price-by-brand",
        headline: "Average running shoe From-price by brand (NL)",
        datasetRequired: "Displayable regional From-prices — not MSRP",
        newsworthiness: 88,
        seasonality: "Q4 / marathon season",
        targetPublications: ["consumer media", "running media"],
        targetJournalistIds: [],
        targetAssetId: "asset-research-price",
        status: "needs_data",
        findingProven: false,
      },
      price?.value?.length
        ? {
            proven: true,
            summary: `Computable brand averages from verified NL offers (n=${price.sampleSize}). Not launch/MSRP.`,
          }
        : undefined,
    ),
    idea({
      id: "idea-highest-stack",
      headline: "Highest-stack running shoes in the current catalog",
      datasetRequired: "Quality-valid heel stack (mm)",
      newsworthiness: 72,
      targetPublications: ["running media"],
      targetJournalistIds: [],
      targetAssetId: "asset-shoe-database",
      status: "idea",
      findingProven: false,
      coverage: stack?.value?.length
        ? `Computable: ${stack.value.map((r) => `${r.name} ${r.metricValue}mm`).join("; ")}`
        : undefined,
    }),
    idea({
      id: "idea-lowest-drop",
      headline: "Lowest-drop daily trainers",
      datasetRequired: "Quality-valid drop (mm) on daily trainers",
      newsworthiness: 70,
      targetPublications: ["running media", "coaches"],
      targetJournalistIds: [],
      targetAssetId: "asset-guide-drop",
      status: "idea",
      findingProven: Boolean(drop?.value?.length),
      coverage: drop?.value?.length
        ? `Computable: ${drop.value.map((r) => `${r.name} ${r.metricValue}mm`).join("; ")}`
        : undefined,
    }),
    idea({
      id: "idea-carbon-price",
      headline: "Carbon vs non-carbon pricing",
      datasetRequired: "Plate flag + displayable From-price + exclusions",
      newsworthiness: 80,
      targetPublications: ["running media", "sports-business"],
      targetJournalistIds: [],
      targetAssetId: "asset-research-carbon",
      status: plated ? "computable" : "needs_data",
      findingProven: Boolean(plated),
      coverage: plated
        ? "Plated vs non-plated cohort averages are computed with per-metric sample sizes."
        : undefined,
    }),
    idea({
      id: "idea-under-150",
      headline: "Most shoes under €150 (NL From-price)",
      datasetRequired: "Displayable NL From-price ≤ 150",
      newsworthiness: 76,
      seasonality: "Black Friday / spring sale",
      targetPublications: ["consumer media", "newsletters"],
      targetJournalistIds: [],
      targetAssetId: "asset-shoe-database",
      status: "idea",
      findingProven: false,
    }),
    idea({
      id: "idea-daily-weight",
      headline: "Daily trainer weight comparison",
      datasetRequired: "Daily-trainer cohort weights",
      newsworthiness: 64,
      targetPublications: ["coaches", "clubs"],
      targetJournalistIds: [],
      targetAssetId: "asset-best-daily-trainers",
      status: "idea",
      findingProven: Boolean(lightest?.value?.length),
    }),
    idea({
      id: "idea-race-premium",
      headline: "Race shoe price premium vs daily trainers",
      datasetRequired: "Subcategory + From-price coverage",
      newsworthiness: 82,
      targetPublications: ["sports-business", "running media"],
      targetJournalistIds: [],
      targetAssetId: "asset-research-market-2026",
      status: "needs_data",
      findingProven: false,
    }),
    idea({
      id: "idea-brand-breadth",
      headline: "Brand range breadth in the catalog",
      datasetRequired: "Eligible models per brand",
      newsworthiness: 58,
      targetPublications: ["trade", "brand PR"],
      targetJournalistIds: [],
      targetAssetId: "asset-shoe-database",
      status: "idea",
      findingProven: false,
    }),
    idea({
      id: "idea-trends",
      headline: "Running shoe trends over time",
      datasetRequired: "Historical catalog snapshots — not yet a public time series",
      newsworthiness: 90,
      seasonality: "year-in-review",
      targetPublications: ["mainstream", "running media"],
      targetJournalistIds: [],
      targetAssetId: "asset-research-market-2026",
      status: "parked",
      findingProven: false,
      coverage: "Do not pitch until Kitletics has dated snapshots. Current DB is a live cohort, not a trendline.",
    }),
  ];
}
