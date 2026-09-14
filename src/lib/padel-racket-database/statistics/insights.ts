import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";
import {
  DEFAULT_DATABASE_FILTERS,
  PRICE_BUCKETS,
  WEIGHT_BUCKETS,
  databaseHref,
  inRangeBucket,
} from "@/lib/padel-racket-database/params";
import { humanizeToken } from "@/lib/padel-racket-database/query";
import {
  knownPriceEur,
  knownWeightMinG,
  withKnownMetric,
} from "@/lib/padel-racket-database/quality";
import {
  MIN_BRAND_SAMPLE_FOR_RANKING,
  MIN_DISTRIBUTION_SAMPLE,
  statisticResult,
} from "@/lib/padel-racket-database/statistics/helpers";
import type {
  BrandAssortmentStat,
  DistributionStatRow,
  InsightCardModel,
  PadelRacketMarketInsights,
  StatisticResult,
} from "@/lib/padel-racket-database/statistics/types";

function categoricalDistribution(
  records: PadelRacketDatabaseRecord[],
  pick: (r: PadelRacketDatabaseRecord) => string | undefined,
): { rows: DistributionStatRow[]; sampleSize: number } {
  const map = new Map<string, number>();
  for (const r of records) {
    const v = pick(r);
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  const sampleSize = [...map.values()].reduce((a, b) => a + b, 0);
  const rows = [...map.entries()]
    .map(([value, count]) => ({
      value,
      label: humanizeToken(value),
      count,
      share: sampleSize ? count / sampleSize : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return { rows, sampleSize };
}

function bucketDistribution(
  values: number[],
  buckets: typeof WEIGHT_BUCKETS,
): DistributionStatRow[] {
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.id, 0);
  for (const v of values) {
    for (const b of buckets) {
      if (inRangeBucket(v, b)) {
        counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
        break;
      }
    }
  }
  const sample = values.length || 1;
  return buckets.map((b) => {
    const count = counts.get(b.id) ?? 0;
    return {
      value: b.id,
      label: b.label,
      count,
      share: count / sample,
    };
  });
}

export function computeShapeDistribution(
  records: PadelRacketDatabaseRecord[],
): StatisticResult<DistributionStatRow[]> {
  const { rows, sampleSize } = categoricalDistribution(records, (r) => r.shape);
  return statisticResult(
    {
      id: "shape-distribution",
      label: "Shape distribution",
      definition:
        "Share of eligible padel racket models with a published shape (round / teardrop / diamond / etc.). Unknown shapes are omitted — never inferred.",
      unitOfAnalysis: "product-model-with-metric",
    },
    rows,
    sampleSize,
    records.length,
  );
}

export function computeBalanceDistribution(
  records: PadelRacketDatabaseRecord[],
): StatisticResult<DistributionStatRow[]> {
  const { rows, sampleSize } = categoricalDistribution(
    records,
    (r) => r.balance,
  );
  return statisticResult(
    {
      id: "balance-distribution",
      label: "Balance distribution",
      definition:
        "Share of eligible models with a published balance class. Unknown balances are omitted.",
      unitOfAnalysis: "product-model-with-metric",
    },
    rows,
    sampleSize,
    records.length,
  );
}

export function computeWeightDistribution(
  records: PadelRacketDatabaseRecord[],
): StatisticResult<DistributionStatRow[]> {
  const known = withKnownMetric(records, knownWeightMinG).map((x) => x.value);
  const rows = bucketDistribution(known, WEIGHT_BUCKETS).filter(
    (r) => r.count > 0,
  );
  return statisticResult(
    {
      id: "weight-distribution",
      label: "Minimum weight distribution",
      definition:
        "Bucketed published minimum weight (g) among eligible models. Maximum weight is never averaged into a midpoint. Unknown weights stay unknown.",
      unitOfAnalysis: "product-model-with-metric",
      caveat:
        "Uses manufacturer or catalog minimum weight only — not a lab weigh-in.",
    },
    rows,
    known.length,
    records.length,
  );
}

export function computeMaterialDistribution(
  records: PadelRacketDatabaseRecord[],
): StatisticResult<DistributionStatRow[]> {
  const { rows, sampleSize } = categoricalDistribution(
    records,
    (r) => r.faceMaterial,
  );
  return statisticResult(
    {
      id: "material-distribution",
      label: "Face material distribution",
      definition:
        "Share of eligible models with a published face material. Missing materials are omitted.",
      unitOfAnalysis: "product-model-with-metric",
    },
    rows,
    sampleSize,
    records.length,
  );
}

export function computePriceDistribution(
  records: PadelRacketDatabaseRecord[],
): StatisticResult<DistributionStatRow[]> {
  const known = withKnownMetric(records, knownPriceEur).map((x) => x.value);
  const rows = bucketDistribution(known, PRICE_BUCKETS).filter(
    (r) => r.count > 0,
  );
  return statisticResult(
    {
      id: "price-distribution",
      label: "Verified offer price distribution",
      definition:
        "Bucketed lowest verified regional offer (EUR) among priced eligible models. Not launch/MSRP. Affiliate commission is never used.",
      unitOfAnalysis: "product-model-with-metric",
      caveat:
        "Unpriced models are excluded from the sample — coverage is priced models / eligible catalog.",
    },
    rows,
    known.length,
    records.length,
  );
}

export function computeBrandAssortment(
  records: PadelRacketDatabaseRecord[],
  minSample = MIN_BRAND_SAMPLE_FOR_RANKING,
): StatisticResult<BrandAssortmentStat[]> {
  const byBrand = new Map<
    string,
    { brandId: string; brandSlug: string; brandName: string; count: number }
  >();
  for (const r of records) {
    const prev = byBrand.get(r.brandId);
    if (prev) prev.count += 1;
    else {
      byBrand.set(r.brandId, {
        brandId: r.brandId,
        brandSlug: r.brandSlug,
        brandName: r.brandName,
        count: 1,
      });
    }
  }
  const rows = [...byBrand.values()]
    .map((b) => ({
      ...b,
      ranked: b.count >= minSample,
    }))
    .sort((a, b) => b.count - a.count || a.brandName.localeCompare(b.brandName));

  return statisticResult(
    {
      id: "brand-assortment",
      label: "Brand assortment sizes",
      definition: `Count of eligible product models per brand. Brands with fewer than ${minSample} models are retained for transparency but not emphasised as market-leading assortment.`,
      unitOfAnalysis: "product-model",
    },
    rows,
    records.length,
    records.length,
  );
}

function distributionCard(
  stat: StatisticResult<DistributionStatRow[]>,
  viewAllHref: string,
  viewAllLabel: string,
  hrefFor: (row: DistributionStatRow) => string,
  minSample: number,
): InsightCardModel | null {
  if (stat.sampleSize < minSample || stat.value.length === 0) return null;
  return {
    id: `card-${stat.id}`,
    eyebrow: "Market insight",
    title: stat.label,
    definition: stat.definition,
    caveat: stat.caveat,
    sampleSize: stat.sampleSize,
    populationSize: stat.populationSize,
    coverage: stat.coverage,
    rows: stat.value.slice(0, 5).map((row, i) => ({
      rank: i + 1,
      label: row.label,
      detail: `${row.count} · ${Math.round(row.share * 100)}%`,
      href: hrefFor(row),
    })),
    viewAllHref,
    viewAllLabel,
  };
}

export function buildInsightCards(
  insights: Omit<PadelRacketMarketInsights, "cards" | "generatedAt">,
): InsightCardModel[] {
  const minN = insights.minDistributionSample;
  const cards: Array<InsightCardModel | null> = [
    distributionCard(
      insights.shapeDistribution,
      databaseHref({ ...DEFAULT_DATABASE_FILTERS, sort: "recommended" }),
      "Browse by shape",
      (row) =>
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          shape: [row.value],
        }),
      minN,
    ),
    distributionCard(
      insights.weightDistribution,
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        sort: "weight-asc",
      }),
      "Browse by weight",
      (row) =>
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          weightBuckets: [row.value],
          sort: "weight-asc",
        }),
      minN,
    ),
    distributionCard(
      insights.balanceDistribution,
      databaseHref({ ...DEFAULT_DATABASE_FILTERS }),
      "Browse by balance",
      (row) =>
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          balance: [row.value],
        }),
      minN,
    ),
    distributionCard(
      insights.materialDistribution,
      databaseHref({ ...DEFAULT_DATABASE_FILTERS }),
      "Browse by face material",
      (row) =>
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          faceMaterial: [row.value],
        }),
      minN,
    ),
    distributionCard(
      insights.priceDistribution,
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        sort: "price-asc",
      }),
      "Browse by price",
      (row) =>
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          priceBuckets: [row.value],
          sort: "price-asc",
        }),
      // Align with research price-story gate — thin priced cohorts stay withheld.
      Math.max(minN, 25),
    ),
  ];

  const rankedBrands = insights.brandAssortment.value
    .filter((b) => b.ranked)
    .slice(0, 5);
  if (rankedBrands.length > 0) {
    cards.push({
      id: "card-brand-assortment",
      eyebrow: "Market insight",
      title: insights.brandAssortment.label,
      definition: insights.brandAssortment.definition,
      sampleSize: insights.brandAssortment.sampleSize,
      populationSize: insights.brandAssortment.populationSize,
      coverage: insights.brandAssortment.coverage,
      rows: rankedBrands.map((b, i) => ({
        rank: i + 1,
        label: b.brandName,
        detail: `${b.count} models`,
        href: databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          brand: [b.brandSlug],
        }),
      })),
      viewAllHref: databaseHref({ ...DEFAULT_DATABASE_FILTERS }),
      viewAllLabel: "Browse all brands",
    });
  }

  return cards.filter((c): c is InsightCardModel => c !== null);
}

export function computePadelRacketMarketInsights(
  records: PadelRacketDatabaseRecord[],
  options?: { minBrandSample?: number; minDistributionSample?: number },
): PadelRacketMarketInsights {
  const minBrandSample =
    options?.minBrandSample ?? MIN_BRAND_SAMPLE_FOR_RANKING;
  const minDistributionSample =
    options?.minDistributionSample ?? MIN_DISTRIBUTION_SAMPLE;

  const base = {
    eligibleCount: records.length,
    unitOfAnalysis: "product-model" as const,
    minBrandSampleForRanking: minBrandSample,
    minDistributionSample,
    shapeDistribution: computeShapeDistribution(records),
    balanceDistribution: computeBalanceDistribution(records),
    weightDistribution: computeWeightDistribution(records),
    materialDistribution: computeMaterialDistribution(records),
    priceDistribution: computePriceDistribution(records),
    brandAssortment: computeBrandAssortment(records, minBrandSample),
  };

  return {
    ...base,
    generatedAt: new Date().toISOString(),
    cards: buildInsightCards(base),
  };
}
