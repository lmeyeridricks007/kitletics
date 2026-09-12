import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  buildRunningShoeDatabaseInsights,
  getRunningShoeDatabaseRecords,
} from "@/lib/running-shoe-database/build-records";
import { RUNNING_SHOE_DATABASE_PATH } from "@/lib/running-shoe-database/constants";
import { DATABASE_PRIMARY_USE_SLUGS } from "@/lib/running-shoe-database/params";
import { humanizeToken } from "@/lib/running-shoe-database/query";
import { computeRunningShoeMarketInsights } from "@/lib/running-shoe-database/statistics/insights";
import { getRunningShoeStatisticsMethodology } from "@/lib/running-shoe-database/statistics/methodology";
import { buildRunningShoeDataExplorer } from "@/lib/running-shoe-database/charts/build-explorer-data";
import { buildRunningShoeDatasetAbout } from "@/lib/running-shoe-database/citation/about-dataset";
import type {
  RunningShoeDatabaseFacetOption,
  RunningShoeDatabasePageData,
  RunningShoeDatabaseRecord,
} from "@/lib/running-shoe-database/types";

function facetFrom(
  records: RunningShoeDatabaseRecord[],
  pick: (r: RunningShoeDatabaseRecord) => string[],
  labelOf?: (value: string, r: RunningShoeDatabaseRecord) => string,
): RunningShoeDatabaseFacetOption[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const r of records) {
    for (const value of pick(r)) {
      const label = labelOf?.(value, r) ?? humanizeToken(value);
      const prev = map.get(value);
      map.set(value, { label, count: (prev?.count ?? 0) + 1 });
    }
  }
  return [...map.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getRunningShoeDatabasePageData(input?: {
  region?: RegionCode;
  options?: PublishResolverOptions;
}): RunningShoeDatabasePageData {
  const region = input?.region ?? DEFAULT_REGION;
  const records = getRunningShoeDatabaseRecords(region, input?.options);
  const insights = buildRunningShoeDatabaseInsights(records);
  const marketInsights = computeRunningShoeMarketInsights(records);
  const dataExplorer = buildRunningShoeDataExplorer(records);
  const statisticsMethodology = getRunningShoeStatisticsMethodology();
  const year = new Date().getFullYear();

  const title = `Running Shoe Database ${year}`;
  const description = `Explore ${records.length} running shoes. Find and compare shoes by how you run — then inspect the specs and Kitletics analysis behind each model.`;

  const useCaseAllow = new Set<string>(DATABASE_PRIMARY_USE_SLUGS);
  const useCases = facetFrom(
    records,
    (r) => r.useCaseSlugs.filter((s) => useCaseAllow.has(s)),
    (value, r) => {
      const i = r.useCaseSlugs.indexOf(value);
      return i >= 0 ? r.useCaseLabels[i]! : humanizeToken(value);
    },
  ).sort((a, b) => {
    const ai = DATABASE_PRIMARY_USE_SLUGS.indexOf(
      a.value as (typeof DATABASE_PRIMARY_USE_SLUGS)[number],
    );
    const bi = DATABASE_PRIMARY_USE_SLUGS.indexOf(
      b.value as (typeof DATABASE_PRIMARY_USE_SLUGS)[number],
    );
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return {
    path: RUNNING_SHOE_DATABASE_PATH,
    title,
    description,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Running", href: "/running" },
      { label: "Shoes", href: "/running/shoes" },
      { label: "Database" },
    ],
    total: records.length,
    region,
    records,
    insights,
    marketInsights,
    dataExplorer,
    facets: {
      brands: facetFrom(
        records,
        (r) => [r.brandSlug],
        (value, r) =>
          value === r.brandSlug ? r.brandName : humanizeToken(value),
      ).sort((a, b) => a.label.localeCompare(b.label)),
      types: facetFrom(
        records,
        (r) => r.typeSlugs,
        (value, r) => {
          const i = r.typeSlugs.indexOf(value);
          return i >= 0 ? r.typeLabels[i]! : humanizeToken(value);
        },
      ),
      useCases,
      cushion: facetFrom(records, (r) =>
        r.cushionLevel ? [r.cushionLevel] : [],
      ),
      stability: facetFrom(records, (r) =>
        r.stability ? [r.stability] : [],
      ),
      terrain: facetFrom(records, (r) => r.terrain),
      surface: facetFrom(records, (r) => r.surface),
      distance: facetFrom(records, (r) => r.recommendedDistance),
      width: facetFrom(records, (r) => r.widthOptions),
      gender: facetFrom(records, (r) => {
        const g = r.genderFit.length > 0 ? r.genderFit : r.audiences;
        return g;
      }),
    },
    related: {
      tools: [
        {
          title: "Running Shoe Finder",
          href: "/tools/running-shoe-finder",
          description:
            "Answer a short questionnaire and get ranked shoe matches with trade-offs explained.",
        },
        {
          title: "Compare running shoes",
          href: "/compare?sport=running&category=running-shoes",
          description:
            "Build a side-by-side comparison on stack, drop, weight and intended use.",
        },
        {
          title: "Shoe rotation planner",
          href: "/tools/shoe-rotation-planner",
          description:
            "Plan daily, long-run and race shoes without overlapping the wrong duties.",
        },
      ],
      editorial: [
        {
          title: "How to choose running shoes",
          href: "/guides/how-to-choose-running-shoes",
          description:
            "Fit, cushioning, stability and terrain — the decision order that actually matters.",
        },
        {
          title: "Best running shoes",
          href: "/best/running-shoes",
          description:
            "Editor shortlists by use case, not a dump of every SKU in the catalog.",
        },
        {
          title: "Carbon vs nylon plates",
          href: "/guides/carbon-vs-nylon-plates",
          description:
            "When a plate helps — and when it is marketing for easy miles.",
        },
        {
          title: "Browse all running shoes",
          href: "/running/shoes",
          description:
            "Shop-style category view with Kitletics Match and featured types.",
        },
      ],
    },
    methodology: {
      title: "How this database is built",
      paragraphs: [
        "Every row is derived from the same Kitletics product catalog that powers product pages, reviews and finders — not a parallel spreadsheet.",
        "Shoes appear only when they pass the Running launch publication policy: published status, authentic product media, and launch-listable eligibility. Draft, held, blocked and media-gated products are excluded.",
        "Specifications such as weight, stack, drop, cushioning and plate status are shown only when present on the product record. Missing values are left blank — we do not infer specs from peers or marketing copy.",
        "Recommended sort uses Kitletics recommendation scores — never affiliate commission or retailer payout. Prices reflect the lowest verified offer in the default region when available.",
      ],
    },
    statisticsMethodology,
    datasetAbout: buildRunningShoeDatasetAbout(records, region),
  };
}

