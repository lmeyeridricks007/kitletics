import { getPadelRacketDatabaseRecords } from "@/lib/padel-racket-database/build-records";
import { PADEL_RACKET_DATASET_META } from "@/lib/padel-racket-database/citation/dataset-meta";
import { computePadelRacketMarketInsights } from "@/lib/padel-racket-database/statistics/insights";
import { getPadelRacketStatisticsMethodology } from "@/lib/padel-racket-database/statistics/methodology";
import { buildPadelRacketDataExplorer } from "@/lib/padel-racket-database/charts/build-explorer-data";
import {
  getStoryReadiness,
} from "@/lib/padel-research/assess-story-readiness";
import {
  getPadelResearchStory,
  type PadelResearchStorySlug,
} from "@/lib/padel-research/stories";
import type { StoryReadiness } from "@/lib/padel-research/assess-story-readiness";
import type { DistributionStatRow } from "@/lib/padel-racket-database/statistics/types";

export interface PadelResearchPageData {
  slug: PadelResearchStorySlug;
  title: string;
  path: string;
  summary: string;
  published: boolean;
  readiness: StoryReadiness;
  sampleSize: number;
  eligibleCount: number;
  /** Always null until intentional dataset stamp */
  dataDate: string | null;
  methodology: {
    title: string;
    paragraphs: string[];
  };
  limitations: string[];
  charts: Array<{
    id: string;
    title: string;
    rows: DistributionStatRow[];
    sampleSize: number;
    populationSize: number;
  }>;
  withheldMessage: string | null;
}

export function getPadelResearchPageData(
  slug: string,
): PadelResearchPageData | null {
  const story = getPadelResearchStory(slug);
  if (!story) return null;

  const records = getPadelRacketDatabaseRecords();
  const readiness = getStoryReadiness(records, story.slug);
  if (!readiness) return null;

  const insights = computePadelRacketMarketInsights(records);
  const explorer = buildPadelRacketDataExplorer(records);
  const published = readiness.ready;

  const charts: PadelResearchPageData["charts"] = [];
  if (published) {
    if (
      story.slug === "padel-racket-shapes" ||
      story.slug === "padel-racket-market-2026"
    ) {
      charts.push({
        id: "shapes",
        title: "Shape distribution (eligible cohort)",
        rows: insights.shapeDistribution.value,
        sampleSize: insights.shapeDistribution.sampleSize,
        populationSize: insights.shapeDistribution.populationSize,
      });
    }
    if (
      story.slug === "padel-racket-weight" ||
      story.slug === "padel-racket-market-2026"
    ) {
      charts.push({
        id: "weight",
        title: "Minimum weight distribution (eligible cohort)",
        rows: insights.weightDistribution.value,
        sampleSize: insights.weightDistribution.sampleSize,
        populationSize: insights.weightDistribution.populationSize,
      });
    }
    if (story.slug === "padel-racket-prices") {
      charts.push({
        id: "prices",
        title: "Verified offer price distribution",
        rows: insights.priceDistribution.value,
        sampleSize: insights.priceDistribution.sampleSize,
        populationSize: insights.priceDistribution.populationSize,
      });
    }
    if (
      story.slug === "padel-racket-market-2026" &&
      insights.priceDistribution.sampleSize >= 25
    ) {
      charts.push({
        id: "prices-optional",
        title: "Verified offer prices (optional section)",
        rows: insights.priceDistribution.value,
        sampleSize: insights.priceDistribution.sampleSize,
        populationSize: insights.priceDistribution.populationSize,
      });
    }
  }

  const primaryKnown =
    readiness.metrics.find((m) =>
      story.requiredMetrics.includes(m.metric),
    )?.known ?? 0;

  return {
    slug: story.slug,
    title: story.title,
    path: story.path,
    summary: story.summary,
    published,
    readiness,
    sampleSize: primaryKnown,
    eligibleCount: records.length,
    dataDate: PADEL_RACKET_DATASET_META.updatedOn,
    methodology: getPadelRacketStatisticsMethodology(),
    limitations: [
      "Figures describe the Kitletics catalog-eligible padel racket cohort only — not industry-wide market share.",
      "The padel vertical is currently held for deep product URLs; database eligibility uses canFeatureProduct rather than launch-listable.",
      "Missing specs stay blank; weight midpoints are never invented from min/max ranges.",
      "Affiliate commission never affects inclusion or ranking.",
      ...(explorer.withheldNotes.length
        ? explorer.withheldNotes
        : []),
      ...(!published
        ? [
            "Findings are withheld until coverage thresholds pass. Methodology and sample size remain visible.",
          ]
        : []),
    ],
    charts,
    withheldMessage: published
      ? null
      : "Not yet published — coverage insufficient for reliable findings from this Kitletics cohort.",
  };
}
