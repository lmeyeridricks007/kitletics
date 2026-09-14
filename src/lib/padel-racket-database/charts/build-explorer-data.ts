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
} from "@/lib/padel-racket-database/quality";
import { MIN_DISTRIBUTION_SAMPLE } from "@/lib/padel-racket-database/statistics/helpers";
import type {
  ChartBarPoint,
  CompositionChartModel,
  PadelRacketDataExplorerPayload,
  PadelRacketDataExplorerPanel,
} from "@/lib/padel-racket-database/charts/types";

function categoricalChart(
  records: PadelRacketDatabaseRecord[],
  metric: string,
  pick: (r: PadelRacketDatabaseRecord) => string | undefined,
  hrefFor: (value: string) => string,
): CompositionChartModel {
  const map = new Map<string, number>();
  for (const r of records) {
    const v = pick(r);
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  const sampleSize = [...map.values()].reduce((a, b) => a + b, 0);
  const points: ChartBarPoint[] = [...map.entries()]
    .map(([id, count]) => ({
      id,
      label: humanizeToken(id),
      count,
      share: sampleSize ? count / sampleSize : 0,
      href: hrefFor(id),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    kind: "composition",
    metric,
    points,
    sampleSize,
    populationSize: records.length,
  };
}

function bucketChart(
  records: PadelRacketDatabaseRecord[],
  metric: string,
  pick: (r: PadelRacketDatabaseRecord) => number | undefined,
  buckets: typeof WEIGHT_BUCKETS,
  hrefFor: (bucketId: string) => string,
): CompositionChartModel {
  const values: number[] = [];
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.id, 0);
  for (const r of records) {
    const v = pick(r);
    if (v === undefined) continue;
    values.push(v);
    for (const b of buckets) {
      if (inRangeBucket(v, b)) {
        counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
        break;
      }
    }
  }
  const sample = values.length || 1;
  const points: ChartBarPoint[] = buckets.map((b) => {
    const count = counts.get(b.id) ?? 0;
    return {
      id: b.id,
      label: b.label,
      count,
      share: count / sample,
      href: hrefFor(b.id),
    };
  });

  return {
    kind: "composition",
    metric,
    points: points.filter((p) => p.count > 0),
    sampleSize: values.length,
    populationSize: records.length,
  };
}

function panel(
  id: string,
  headline: string,
  interpretation: string,
  sampleNote: string,
  chart: CompositionChartModel,
  threshold = MIN_DISTRIBUTION_SAMPLE,
): PadelRacketDataExplorerPanel | null {
  if (chart.sampleSize < threshold) return null;
  return { id, headline, interpretation, sampleNote, chart };
}

export function buildPadelRacketDataExplorer(
  records: PadelRacketDatabaseRecord[],
): PadelRacketDataExplorerPayload {
  const shape = categoricalChart(
    records,
    "shape",
    (r) => r.shape,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        shape: [id],
      }),
  );
  const balance = categoricalChart(
    records,
    "balance",
    (r) => r.balance,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        balance: [id],
      }),
  );
  const weight = bucketChart(
    records,
    "weight",
    knownWeightMinG,
    WEIGHT_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        weightBuckets: [id],
        sort: "weight-asc",
      }),
  );
  const materials = categoricalChart(
    records,
    "faceMaterial",
    (r) => r.faceMaterial,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        faceMaterial: [id],
      }),
  );
  const price = bucketChart(
    records,
    "price",
    knownPriceEur,
    PRICE_BUCKETS,
    (id) =>
      databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        priceBuckets: [id],
        sort: "price-asc",
      }),
  );

  const candidates: Array<PadelRacketDataExplorerPanel | null> = [
    panel(
      "shape-mix",
      "Shape mix in the eligible catalog",
      shape.sampleSize
        ? `${shape.points[0]?.label ?? "—"} leads among ${shape.sampleSize} models with a published shape in this Kitletics cohort — not an industry-wide claim.`
        : "Shape coverage is too thin.",
      `Sample: ${shape.sampleSize} of ${shape.populationSize} eligible models`,
      shape,
    ),
    panel(
      "balance-mix",
      "Balance classes",
      balance.sampleSize
        ? `Balance classes among ${balance.sampleSize} models with published balance.`
        : "Balance coverage is too thin.",
      `Sample: ${balance.sampleSize} of ${balance.populationSize}`,
      balance,
    ),
    panel(
      "weight-spread",
      "Minimum weight distribution",
      weight.sampleSize
        ? `Published minimum weight across ${weight.sampleSize} models. Ranges are not collapsed into midpoints.`
        : "Weight coverage is too thin.",
      `Sample: ${weight.sampleSize} of ${weight.populationSize} · metric: minimum weight (g)`,
      weight,
    ),
    panel(
      "materials",
      "Face materials",
      materials.sampleSize
        ? `Face material tags among ${materials.sampleSize} models with a published face material.`
        : "Material coverage is too thin.",
      `Sample: ${materials.sampleSize} of ${materials.populationSize}`,
      materials,
    ),
    panel(
      "offer-prices",
      "Verified offer prices",
      price.sampleSize
        ? `Verified regional offers among ${price.sampleSize} priced models — not launch/MSRP.`
        : "Price coverage is too thin for a chart.",
      `Sample: ${price.sampleSize} of ${price.populationSize}`,
      price,
      25,
    ),
  ];

  const panels = candidates.filter(
    (p): p is PadelRacketDataExplorerPanel => p !== null,
  );
  const withheldNotes: string[] = [];
  if (price.sampleSize < MIN_DISTRIBUTION_SAMPLE) {
    withheldNotes.push(
      `Offer-price chart withheld: ${price.sampleSize} priced models (need ≥${MIN_DISTRIBUTION_SAMPLE}).`,
    );
  }

  return {
    eligibleCount: records.length,
    unitOfAnalysis: "product-model",
    panels,
    withheldNotes,
  };
}
