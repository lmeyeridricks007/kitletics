import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  DATABASE_PRIMARY_USE_SLUGS,
  DEFAULT_DATABASE_FILTERS,
  DROP_BUCKETS,
  PRICE_BUCKETS,
  STACK_BUCKETS,
  WEIGHT_BUCKETS,
  databaseHref,
  inRangeBucket,
  type RangeBucket,
} from "@/lib/running-shoe-database/params";
import {
  MIN_BRAND_SAMPLE_FOR_RANKING,
  averageKnown,
  roundMetric,
} from "@/lib/running-shoe-database/statistics/helpers";
import { qualitySafeExplorerFields } from "@/lib/running-shoe-database/quality";
import type {
  BrandBarChartModel,
  ChartBarPoint,
  CompositionChartModel,
  DataExplorerMetricRow,
  DataExplorerPanel,
  DistributionChartModel,
  RunningShoeDataExplorerPayload,
  UseCountChartModel,
} from "@/lib/running-shoe-database/charts/types";

const PATTERNS: ChartBarPoint["pattern"][] = [
  "solid",
  "striped",
  "dotted",
  "dashed",
  "cross",
];

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return roundMetric(sorted[mid]!, 1);
  return roundMetric((sorted[mid - 1]! + sorted[mid]!) / 2, 1);
}

function patternAt(i: number): ChartBarPoint["pattern"] {
  return PATTERNS[i % PATTERNS.length]!;
}

export function toDataExplorerRows(
  records: RunningShoeDatabaseRecord[],
): DataExplorerMetricRow[] {
  return records.map((r) => {
    const safe = qualitySafeExplorerFields(r);
    return {
      id: r.id,
      brandSlug: r.brandSlug,
      brandName: r.brandName,
      useSlugs: r.useCaseSlugs,
      gender: (r.genderFit.length > 0
        ? r.genderFit
        : r.audiences) as DataExplorerMetricRow["gender"],
      surface: r.surface,
      weightG: safe.weightG,
      dropMm: safe.dropMm,
      heelStackMm: safe.heelStackMm,
      priceEur: safe.priceEur,
      plate: safe.plate,
      carbonPlated:
        safe.plate === true ? r.carbonPlated : false,
      primaryUseSlug: r.primaryUseSlug,
      primaryUseLabel: r.primaryUseLabel,
    };
  });
}

export function filterExplorerRows(
  rows: DataExplorerMetricRow[],
  filters: {
    use?: string[];
    gender?: string[];
    surface?: string[];
    brand?: string[];
  },
): DataExplorerMetricRow[] {
  return rows.filter((r) => {
    if (filters.brand?.length && !filters.brand.includes(r.brandSlug)) {
      return false;
    }
    if (filters.use?.length) {
      if (!filters.use.some((u) => r.useSlugs.includes(u))) return false;
    }
    if (filters.gender?.length) {
      if (!filters.gender.some((g) => r.gender.includes(g as "men" | "women" | "unisex"))) {
        return false;
      }
    }
    if (filters.surface?.length) {
      if (!filters.surface.some((s) => r.surface.includes(s))) return false;
    }
    return true;
  });
}

function bucketDistribution(
  rows: DataExplorerMetricRow[],
  pick: (r: DataExplorerMetricRow) => number | undefined,
  buckets: RangeBucket[],
  hrefFor: (bucketId: string) => string,
): { points: ChartBarPoint[]; values: number[] } {
  const values: number[] = [];
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.id, 0);

  for (const row of rows) {
    const v = pick(row);
    if (v === undefined || !Number.isFinite(v)) continue;
    values.push(v);
    for (const b of buckets) {
      if (inRangeBucket(v, b)) {
        counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
        break;
      }
    }
  }

  const sample = values.length;
  const points: ChartBarPoint[] = buckets.map((b, i) => {
    const count = counts.get(b.id) ?? 0;
    return {
      id: b.id,
      label: b.label,
      count,
      share: sample ? count / sample : 0,
      pattern: patternAt(i),
      href: hrefFor(b.id),
    };
  });

  return { points, values };
}

export function buildWeightDistribution(
  rows: DataExplorerMetricRow[],
): DistributionChartModel {
  const { points, values } = bucketDistribution(
    rows,
    (r) => r.weightG,
    WEIGHT_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        weightBuckets: [id],
        sort: "weight-asc",
      }),
  );
  return {
    kind: "distribution",
    metric: "weight",
    unit: "g",
    points,
    sampleSize: values.length,
    populationSize: rows.length,
    median: median(values),
    mean: averageKnown(values),
  };
}

export function buildDropDistribution(
  rows: DataExplorerMetricRow[],
): DistributionChartModel {
  const { points, values } = bucketDistribution(
    rows,
    (r) => r.dropMm,
    DROP_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        dropBuckets: [id],
        sort: "drop-asc",
      }),
  );
  return {
    kind: "distribution",
    metric: "drop",
    unit: "mm",
    points,
    sampleSize: values.length,
    populationSize: rows.length,
    median: median(values),
    mean: averageKnown(values),
  };
}

export function buildStackDistribution(
  rows: DataExplorerMetricRow[],
): DistributionChartModel {
  const { points, values } = bucketDistribution(
    rows,
    (r) => r.heelStackMm,
    STACK_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        stackBuckets: [id],
        sort: "stack-desc",
      }),
  );
  return {
    kind: "distribution",
    metric: "stack",
    unit: "mm",
    points,
    sampleSize: values.length,
    populationSize: rows.length,
    median: median(values),
    mean: averageKnown(values),
  };
}

/** Current verified offer price — not launch/MSRP. */
export function buildOfferPriceDistribution(
  rows: DataExplorerMetricRow[],
): DistributionChartModel {
  const { points, values } = bucketDistribution(
    rows,
    (r) => r.priceEur,
    PRICE_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        priceBuckets: [id],
        sort: "price-asc",
      }),
  );
  return {
    kind: "distribution",
    metric: "offerPrice",
    unit: "EUR",
    points,
    sampleSize: values.length,
    populationSize: rows.length,
    median: median(values),
    mean: averageKnown(values),
  };
}

function brandMetricBars(
  rows: DataExplorerMetricRow[],
  pick: (r: DataExplorerMetricRow) => number | undefined,
  metric: BrandBarChartModel["metric"],
  unit: string,
  sortAsc: boolean,
  hrefSort: "weight-asc" | "price-asc",
): BrandBarChartModel {
  const byBrand = new Map<
    string,
    { brandSlug: string; brandName: string; values: number[] }
  >();

  for (const row of rows) {
    const v = pick(row);
    if (v === undefined) continue;
    const prev = byBrand.get(row.brandSlug);
    if (prev) prev.values.push(v);
    else {
      byBrand.set(row.brandSlug, {
        brandSlug: row.brandSlug,
        brandName: row.brandName,
        values: [v],
      });
    }
  }

  const ranked = [...byBrand.values()]
    .filter((b) => b.values.length >= MIN_BRAND_SAMPLE_FOR_RANKING)
    .map((b) => ({
      ...b,
      average: averageKnown(b.values) ?? 0,
    }))
    .sort((a, b) =>
      sortAsc
        ? a.average - b.average || a.brandName.localeCompare(b.brandName)
        : b.average - a.average || a.brandName.localeCompare(b.brandName),
    )
    .slice(0, 8);

  const max = Math.max(...ranked.map((b) => b.average), 1);
  const sampleSize = rows.filter((r) => pick(r) !== undefined).length;

  const points: ChartBarPoint[] = ranked.map((b, i) => ({
    id: b.brandSlug,
    label: b.brandName,
    count: Math.round(b.average),
    share: b.average / max,
    pattern: patternAt(i),
    href: databaseHref({
      ...DEFAULT_DATABASE_FILTERS,
      brand: [b.brandSlug],
      sort: hrefSort,
    }),
    secondary: `n=${b.values.length}`,
  }));

  return {
    kind: "brand-bars",
    metric,
    unit,
    points,
    sampleSize,
    populationSize: rows.length,
    minBrandSample: MIN_BRAND_SAMPLE_FOR_RANKING,
  };
}

export function buildAverageWeightByBrand(
  rows: DataExplorerMetricRow[],
): BrandBarChartModel {
  return brandMetricBars(
    rows,
    (r) => r.weightG,
    "weight",
    "g",
    true,
    "weight-asc",
  );
}

export function buildAverageOfferPriceByBrand(
  rows: DataExplorerMetricRow[],
): BrandBarChartModel {
  return brandMetricBars(
    rows,
    (r) => r.priceEur,
    "offerPrice",
    "EUR",
    true,
    "price-asc",
  );
}

export function buildUseCounts(
  rows: DataExplorerMetricRow[],
): UseCountChartModel {
  const allow = new Set<string>(DATABASE_PRIMARY_USE_SLUGS);
  const counts = new Map<string, { label: string; count: number }>();

  for (const row of rows) {
    for (const slug of row.useSlugs) {
      if (!allow.has(slug)) continue;
      const prev = counts.get(slug);
      const label =
        row.primaryUseSlug === slug && row.primaryUseLabel
          ? row.primaryUseLabel
          : slug
              .split("-")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ");
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
  }

  // Prefer canonical labels from first matching primary use
  for (const row of rows) {
    if (row.primaryUseSlug && counts.has(row.primaryUseSlug) && row.primaryUseLabel) {
      counts.get(row.primaryUseSlug)!.label = row.primaryUseLabel;
    }
  }

  const ordered = DATABASE_PRIMARY_USE_SLUGS.map((slug) => {
    const entry = counts.get(slug);
    return entry ? { slug, ...entry } : null;
  }).filter(Boolean) as Array<{ slug: string; label: string; count: number }>;

  const max = Math.max(...ordered.map((o) => o.count), 1);
  const points: ChartBarPoint[] = ordered.map((o, i) => ({
    id: o.slug,
    label: o.label,
    count: o.count,
    share: o.count / max,
    pattern: patternAt(i),
    href: databaseHref({
      ...DEFAULT_DATABASE_FILTERS,
      useCase: [o.slug],
      sort: "recommended",
    }),
  }));

  return {
    kind: "use-counts",
    points,
    sampleSize: rows.length,
    populationSize: rows.length,
  };
}

export function buildPlatedComposition(
  rows: DataExplorerMetricRow[],
): CompositionChartModel {
  const known = rows.filter((r) => typeof r.plate === "boolean");
  const plated = known.filter((r) => r.plate === true).length;
  const nonPlated = known.filter((r) => r.plate === false).length;
  const carbon = rows.filter((r) => r.carbonPlated).length;
  const total = known.length || 1;

  const points: ChartBarPoint[] = [
    {
      id: "plated",
      label: "Plated",
      count: plated,
      share: plated / total,
      pattern: "striped",
      href: databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        plate: "plated",
      }),
      secondary: carbon ? `${carbon} carbon` : undefined,
    },
    {
      id: "non-plated",
      label: "Non-plated",
      count: nonPlated,
      share: nonPlated / total,
      pattern: "solid",
      href: databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        plate: "none",
      }),
    },
  ];

  return {
    kind: "composition",
    points,
    sampleSize: known.length,
    populationSize: rows.length,
  };
}

function panel(
  id: string,
  headline: string,
  interpretation: string,
  sampleNote: string,
  chart: DataExplorerPanel["chart"],
): DataExplorerPanel | null {
  if (chart.kind === "distribution" && chart.sampleSize < 5) return null;
  if (chart.kind === "brand-bars" && chart.points.length < 2) return null;
  if (chart.kind === "use-counts" && chart.points.every((p) => p.count === 0)) {
    return null;
  }
  if (chart.kind === "composition" && chart.sampleSize < 5) return null;
  return { id, headline, interpretation, sampleNote, chart };
}

export function buildDataExplorerPanels(
  rows: DataExplorerMetricRow[],
): DataExplorerPanel[] {
  const weight = buildWeightDistribution(rows);
  const drop = buildDropDistribution(rows);
  const stack = buildStackDistribution(rows);
  const price = buildOfferPriceDistribution(rows);
  const brandWeight = buildAverageWeightByBrand(rows);
  const brandPrice = buildAverageOfferPriceByBrand(rows);
  const uses = buildUseCounts(rows);
  const plated = buildPlatedComposition(rows);

  const panels: Array<DataExplorerPanel | null> = [
    panel(
      "stack-today",
      "Where heel stack sits today",
      stack.median != null
        ? `Median heel stack is ${stack.median} mm across ${stack.sampleSize} models with verified stack in the current eligible set. This is a snapshot — not a claim about year-over-year change.`
        : `Heel stack is shown for ${stack.sampleSize} models with verified measurements.`,
      `Sample: ${stack.sampleSize} of ${stack.populationSize} eligible product models · unit: product model · metric: heel stack (mm)`,
      stack,
    ),
    panel(
      "weight-spread",
      "How shoe weight is distributed",
      weight.median != null
        ? `Median weight is ${weight.median} g (mean ${weight.mean ?? "—"} g) among models with verified weight. Lighter and heavier cohorts are both present — the chart shows the spread, not a single “ideal” shoe.`
        : `Weight distribution across ${weight.sampleSize} models with verified weight.`,
      `Sample: ${weight.sampleSize} of ${weight.populationSize} eligible product models · unit: g`,
      weight,
    ),
    panel(
      "drop-spread",
      "Heel-to-toe drop across the catalog",
      drop.median != null
        ? `Median drop is ${drop.median} mm. Drop is geometry, not a performance score — runners still choose based on feel and injury history.`
        : `Drop distribution for ${drop.sampleSize} models with verified drop.`,
      `Sample: ${drop.sampleSize} of ${drop.populationSize} eligible product models · unit: mm`,
      drop,
    ),
    panel(
      "offer-price-spread",
      "Where verified offer prices land",
      price.median != null
        ? `Median verified offer is €${Math.round(price.median)} among priced models. These are current lowest verified regional offers — not launch/MSRP (no canonical launch price field exists).`
        : `Offer-price distribution for ${price.sampleSize} priced models.`,
      `Sample: ${price.sampleSize} of ${price.populationSize} eligible product models · default-region verified offers (EUR)`,
      price,
    ),
    panel(
      "brand-weight",
      "Average weight by brand",
      brandWeight.points.length
        ? `Among brands with at least ${brandWeight.minBrandSample} weighted models, average product weight ranges from ${brandWeight.points[0]?.count ?? "—"} g upward in this snapshot.`
        : "Not enough brand samples for a ranked weight comparison.",
      `Ranked brands require n≥${brandWeight.minBrandSample} · sample models with weight: ${brandWeight.sampleSize}`,
      brandWeight,
    ),
    panel(
      "brand-offer-price",
      "Average verified offer by brand",
      brandPrice.points.length
        ? `Average verified offers among ranked brands (n≥${brandPrice.minBrandSample}). Labelled as offer price — not launch price.`
        : "Not enough brand samples for a ranked offer-price comparison.",
      `Ranked brands require n≥${brandPrice.minBrandSample} · priced models: ${brandPrice.sampleSize}`,
      brandPrice,
    ),
    panel(
      "use-counts",
      "Catalog coverage by primary use tags",
      uses.points.length
        ? `Counts show how many eligible models carry each curated use-case tag. A shoe can appear in more than one use — this is tag coverage, not mutually exclusive market share.`
        : "No primary use tags available.",
      `Eligible models: ${uses.populationSize} · taxonomy use-case tags only`,
      uses,
    ),
    panel(
      "plated-mix",
      "Plated vs non-plated composition",
      plated.sampleSize
        ? `${plated.points.find((p) => p.id === "plated")?.count ?? 0} plated and ${plated.points.find((p) => p.id === "non-plated")?.count ?? 0} non-plated models among those with a known plate flag.`
        : "Plate status coverage is too thin for composition.",
      `Sample with plate flag: ${plated.sampleSize} of ${plated.populationSize} · carbon called out when present`,
      plated,
    ),
  ];

  return panels.filter((p): p is DataExplorerPanel => p !== null);
}

export function buildRunningShoeDataExplorer(
  records: RunningShoeDatabaseRecord[],
): RunningShoeDataExplorerPayload {
  const rows = toDataExplorerRows(records);
  const panels = buildDataExplorerPanels(rows);

  const useLabels = new Map<string, string>();
  for (const r of rows) {
    r.useSlugs.forEach((slug) => {
      if (!DATABASE_PRIMARY_USE_SLUGS.includes(slug as (typeof DATABASE_PRIMARY_USE_SLUGS)[number])) {
        return;
      }
      if (!useLabels.has(slug)) {
        useLabels.set(
          slug,
          r.primaryUseSlug === slug && r.primaryUseLabel
            ? r.primaryUseLabel
            : slug,
        );
      }
    });
    if (r.primaryUseSlug && r.primaryUseLabel) {
      useLabels.set(r.primaryUseSlug, r.primaryUseLabel);
    }
  }

  const brands = new Map<string, string>();
  for (const r of rows) brands.set(r.brandSlug, r.brandName);

  const surfaces = new Set<string>();
  for (const r of rows) r.surface.forEach((s) => surfaces.add(s));

  return {
    eligibleCount: records.length,
    unitOfAnalysis: "product-model",
    panels,
    rows,
    filterOptions: {
      use: DATABASE_PRIMARY_USE_SLUGS.filter((s) => useLabels.has(s)).map(
        (value) => ({
          value,
          label: useLabels.get(value) ?? value,
        }),
      ),
      gender: [
        { value: "men", label: "Men" },
        { value: "women", label: "Women" },
        { value: "unisex", label: "Unisex" },
      ],
      surface: [...surfaces]
        .sort()
        .map((value) => ({
          value,
          label: value
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" "),
        })),
      brand: [...brands.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
  };
}
