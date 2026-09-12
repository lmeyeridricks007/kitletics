import {
  BEST_VALUE_PRICE_CEILING_EUR,
  MIN_BRAND_SAMPLE_FOR_RANKING,
} from "@/lib/running-shoe-database/statistics/helpers";

/**
 * Journalist / researcher facing methodology for the market-insights layer.
 * Derived from the statistics engine constants — not free-form marketing copy.
 */
export function getRunningShoeStatisticsMethodology(): {
  title: string;
  paragraphs: string[];
} {
  return {
    title: "How we calculate these numbers",
    paragraphs: [
      "Dataset eligibility: every insight uses the same Running Shoe Database cohort as /running/shoes/database — published, launch-listable product models with authentic media. Draft, held, blocked and media-gated products are excluded.",
      "Unit of analysis: one Kitletics product model equals one database record. Men’s and women’s ProductVariant rows are not counted as separate models, so averages are not double-counted across gender variants unless a calculator explicitly states otherwise.",
      "Missing values: unknown specs and prices are omitted from averages and rankings. They are never treated as zero. Each statistic publishes sampleSize, populationSize and coverage so “average weight across 80 shoes with verified weight” is distinguishable from implying every shoe has that field.",
      "Quality gate: SUSPECT and INVALID field values (impossible weights, negative drop, heel/forefoot/drop inconsistency, price outliers, unit-confusion flags, etc.) are excluded from market insights and Data Explorer charts. They are never silently corrected. PARTIAL records may still contribute metrics whose individual field status is valid. See docs/data-products/RUNNING-SHOE-DATABASE-QUALITY.md.",
      "Weight: grams as stored on the product specification (product-level figure used by the database record). Units are not mixed.",
      `Price basis: lowest verified offer in the site default region (typically EUR). There is no canonical launch/MSRP field in the catalog, so brand price averages use current verified offers — labelled accordingly, not as launch price.`,
      `Brand sample thresholds: a brand must contribute at least ${MIN_BRAND_SAMPLE_FOR_RANKING} models with the relevant metric before it appears in ranked brand comparisons. Smaller samples remain available with their n for transparency but are not ranked as market leaders.`,
      `Best Kitletics value under €${BEST_VALUE_PRICE_CEILING_EUR}: ranks models with verified offer ≤ €${BEST_VALUE_PRICE_CEILING_EUR} by Product.valueScore. Affiliate commission and retailer payout are never used.`,
      "Update mechanism: insights are computed at request/build time from the live eligible catalog. When the catalog changes, the next page render recalculates — there is no separately authored statistics content file.",
    ],
  };
}
