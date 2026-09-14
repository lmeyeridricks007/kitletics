import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  buildPadelRacketDatabaseInsights,
  getPadelRacketDatabaseRecords,
} from "@/lib/padel-racket-database/build-records";
import { PADEL_RACKET_DATABASE_PATH } from "@/lib/padel-racket-database/constants";
import { DATABASE_PLAY_STYLE_SLUGS } from "@/lib/padel-racket-database/params";
import { humanizeToken } from "@/lib/padel-racket-database/query";
import { computePadelRacketMarketInsights } from "@/lib/padel-racket-database/statistics/insights";
import { getPadelRacketStatisticsMethodology } from "@/lib/padel-racket-database/statistics/methodology";
import { buildPadelRacketDataExplorer } from "@/lib/padel-racket-database/charts/build-explorer-data";
import { buildPadelRacketDatasetAbout } from "@/lib/padel-racket-database/citation/about-dataset";
import type {
  PadelRacketDatabaseFacetOption,
  PadelRacketDatabasePageData,
  PadelRacketDatabaseRecord,
} from "@/lib/padel-racket-database/types";

/** Soft-gate facets when coverage is below this share of eligible catalog. */
const FACET_MIN_COVERAGE = 0.15;
const FACET_MIN_ABSOLUTE = 5;
/** Feel is thin in the cohort — require higher coverage before exposing. */
const FEEL_FACET_MIN_COVERAGE = 0.4;

function facetFrom(
  records: PadelRacketDatabaseRecord[],
  pick: (r: PadelRacketDatabaseRecord) => string[],
  labelOf?: (value: string, r: PadelRacketDatabaseRecord) => string,
): PadelRacketDatabaseFacetOption[] {
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
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function coverageOk(
  facetCount: number,
  total: number,
  minCoverage = FACET_MIN_COVERAGE,
): boolean {
  if (facetCount < FACET_MIN_ABSOLUTE) return false;
  return facetCount / Math.max(total, 1) >= minCoverage;
}

export function getPadelRacketDatabasePageData(input?: {
  region?: RegionCode;
  options?: PublishResolverOptions;
}): PadelRacketDatabasePageData {
  const region = input?.region ?? DEFAULT_REGION;
  const records = getPadelRacketDatabaseRecords(region, input?.options);
  const insights = buildPadelRacketDatabaseInsights(records);
  const marketInsights = computePadelRacketMarketInsights(records);
  const dataExplorer = buildPadelRacketDataExplorer(records);
  const statisticsMethodology = getPadelRacketStatisticsMethodology();
  const year = new Date().getFullYear();

  const title = `Padel Racket Database ${year}`;
  const description = `Explore ${records.length} padel rackets in the Kitletics catalog-eligible cohort. Filter by shape, balance, minimum weight and play style — specs from stored product records, not industry-wide market claims.`;

  const playStyleAllow = new Set<string>(DATABASE_PLAY_STYLE_SLUGS);
  const playStyles = facetFrom(
    records,
    (r) => r.useCaseSlugs.filter((s) => playStyleAllow.has(s)),
    (value, r) => {
      const i = r.useCaseSlugs.indexOf(value);
      return i >= 0 ? r.useCaseLabels[i]! : humanizeToken(value);
    },
  );

  const shapes = facetFrom(records, (r) => (r.shape ? [r.shape] : []));
  const balances = facetFrom(records, (r) => (r.balance ? [r.balance] : []));
  const playerLevels = facetFrom(records, (r) =>
    r.playerLevel ? [r.playerLevel] : [],
  );
  const faceMaterials = facetFrom(records, (r) =>
    r.faceMaterial ? [r.faceMaterial] : [],
  );
  const cores = facetFrom(records, (r) => (r.core ? [r.core] : []));
  const feels = facetFrom(records, (r) => (r.feel ? [r.feel] : []));
  const surfaces = facetFrom(records, (r) =>
    r.surfaceTexture ? [r.surfaceTexture] : [],
  );

  const softGatedFacets: string[] = [];
  const gate = (
    name: string,
    options: PadelRacketDatabaseFacetOption[],
    minCoverage = FACET_MIN_COVERAGE,
  ): PadelRacketDatabaseFacetOption[] => {
    const covered = options.reduce((a, o) => a + o.count, 0);
    if (!coverageOk(covered, records.length, minCoverage)) {
      softGatedFacets.push(name);
      return [];
    }
    return options;
  };

  return {
    path: PADEL_RACKET_DATABASE_PATH,
    title,
    description,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Padel", href: "/padel" },
      { label: "Rackets", href: "/padel/rackets" },
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
      shapes: gate("shape", shapes),
      balances: gate("balance", balances),
      playerLevels: gate("playerLevel", playerLevels),
      playStyles: gate("playStyle", playStyles),
      faceMaterials: gate("faceMaterial", faceMaterials),
      surfaces: gate("surface", surfaces),
      cores: gate("core", cores),
      feels: gate("feel", feels, FEEL_FACET_MIN_COVERAGE),
    },
    softGatedFacets,
    related: {
      tools: [
        {
          title: "Padel Racket Finder",
          href: "/tools/padel-racket-finder",
          description:
            "Answer a short questionnaire and get ranked racket matches with trade-offs explained.",
        },
        {
          title: "Compare padel rackets",
          href: "/compare?category=padel-rackets",
          description:
            "Build a side-by-side comparison on shape, balance, weight and play style.",
        },
      ],
      editorial: [
        {
          title: "How to choose a padel racket",
          href: "/guides/how-to-choose-a-padel-racket",
          description:
            "Shape, balance, weight and feel — the decision order that actually matters.",
        },
        {
          title: "Best padel rackets",
          href: "/best/padel-rackets",
          description:
            "Editor shortlists by use case, not a dump of every model in the catalog.",
        },
        {
          title: "Browse all padel rackets",
          href: "/padel/rackets",
          description: "Category view for padel rackets.",
        },
      ],
    },
    methodology: {
      title: "How this database is built",
      paragraphs: [
        "Every row is derived from the same Kitletics product catalog that powers product pages, reviews and finders — not a parallel spreadsheet.",
        "Rackets appear when they pass catalog-eligible gates: category cat-padel-rackets, sport sport-padel, published status, and authentic product media (canFeatureProduct). Draft and media-gated products are excluded. Soft-gated accessory and clothing categories stay out of this cohort until they are ready.",
        "Specifications such as shape, balance, minimum and maximum weight, core and face material are shown only when present on the product record. Missing values are left blank — we do not invent weight midpoints or infer specs from peers.",
        "Recommended sort uses Kitletics recommendation scores — never affiliate commission or retailer payout. Prices reflect the lowest verified offer in the default region when available.",
        "Statistics describe only this eligible Kitletics cohort. They are not industry-wide claims about the global padel racket market.",
      ],
    },
    statisticsMethodology,
    datasetAbout: buildPadelRacketDatasetAbout(records, region),
  };
}
