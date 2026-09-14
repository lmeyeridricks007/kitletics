import {
  MIN_BRAND_SAMPLE_FOR_RANKING,
  MIN_DISTRIBUTION_SAMPLE,
} from "@/lib/padel-racket-database/statistics/helpers";

/**
 * Journalist / researcher facing methodology for the market-insights layer.
 * Derived from eligible catalog counts — not free-form industry claims.
 */
export function getPadelRacketStatisticsMethodology(): {
  title: string;
  paragraphs: string[];
} {
  return {
    title: "How we calculate these numbers",
    paragraphs: [
      "Dataset eligibility: every insight uses the same Padel Racket Database cohort as /padel/rackets/database — category cat-padel-rackets, sport sport-padel, published status, authentic product media (canFeatureProduct). Soft-gated accessory/clothing categories are excluded until ready.",
      "Unit of analysis: one Kitletics product model equals one database record. Variant rows are not counted as separate models.",
      "Missing values: unknown specs and prices are omitted from distributions and averages. They are never treated as zero and never inferred from peers. Each statistic publishes sampleSize, populationSize and coverage.",
      "Weight: published minimum weight (grams) only. We do not invent midpoints from published minimum/maximum weight ranges.",
      "Price basis: lowest verified offer in the site default region (typically EUR). This is not launch/MSRP. Affiliate commission never affects inclusion or sort.",
      `Distribution cards require at least ${MIN_DISTRIBUTION_SAMPLE} models with the relevant known field before they appear. Brand assortment emphasises brands with ≥${MIN_BRAND_SAMPLE_FOR_RANKING} eligible models.`,
      "Update mechanism: insights are computed at request/build time from the live eligible catalog. There is no separately authored statistics content file claiming industry-wide market share.",
    ],
  };
}
