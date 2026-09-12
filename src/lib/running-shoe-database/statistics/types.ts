/**
 * Typed statistics for the Running Shoe Database market-insights layer.
 *
 * Unit of analysis (unless a calculator states otherwise):
 * one eligible Product model = one RunningShoeDatabaseRecord.
 * Men/women ProductVariant rows are not separate models in this dataset.
 */

export type StatisticUnitOfAnalysis =
  | "product-model"
  | "product-model-with-metric";

export interface StatisticMeta {
  /** Machine id for reuse in reports / exports */
  id: string;
  label: string;
  /** Human-readable formula / selection rule */
  definition: string;
  unitOfAnalysis: StatisticUnitOfAnalysis;
  /** Optional journalist-facing caveat */
  caveat?: string;
}

/** Scalar or structured value with mandatory coverage metadata. */
export interface StatisticResult<T> extends StatisticMeta {
  value: T;
  /** Models included in the calculation (known metric only) */
  sampleSize: number;
  /** Denominator for coverage (usually eligible catalog size or cohort size) */
  populationSize: number;
  /** sampleSize / populationSize, 0–1 */
  coverage: number;
}

export interface RankedShoeStat {
  rank: number;
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  href: string;
  metricLabel: string;
  metricValue: number;
  metricUnit: string;
}

export interface BrandAverageStat {
  brandId: string;
  brandSlug: string;
  brandName: string;
  average: number;
  sampleSize: number;
  /** Included in ranked market comparison (meets min sample) */
  ranked: boolean;
}

export interface GroupAverageStat {
  groupId: string;
  groupLabel: string;
  average: number | null;
  sampleSize: number;
  populationSize: number;
  coverage: number;
}

export interface InsightCardModel {
  id: string;
  eyebrow: string;
  title: string;
  definition: string;
  caveat?: string;
  sampleSize: number;
  populationSize: number;
  coverage: number;
  rows: Array<{
    rank: number;
    label: string;
    detail: string;
    href: string;
  }>;
  /** Deep-link into filtered database explorer */
  viewAllHref: string;
  viewAllLabel: string;
}

export interface RunningShoeMarketInsights {
  generatedAt: string;
  eligibleCount: number;
  unitOfAnalysis: "product-model";
  minBrandSampleForRanking: number;
  lightestDailyTrainers: StatisticResult<RankedShoeStat[]>;
  highestStackShoes: StatisticResult<RankedShoeStat[]>;
  lowestDropTrainers: StatisticResult<RankedShoeStat[]>;
  /**
   * Best Kitletics value under a price ceiling.
   * Uses Product.valueScore + verified offer price — never affiliate commission.
   */
  bestValueUnderPrice: StatisticResult<RankedShoeStat[]> & {
    priceCeiling: number;
    currency: string;
  };
  /**
   * Average verified offer price by brand (not MSRP / launch price —
   * no canonical launchPrice field exists).
   */
  averageOfferPriceByBrand: StatisticResult<BrandAverageStat[]>;
  averageWeightByBrand: StatisticResult<BrandAverageStat[]>;
  platedVsNonPlated: StatisticResult<{
    plated: GroupAverageStat[];
    nonPlated: GroupAverageStat[];
    platedCount: number;
    nonPlatedCount: number;
    carbonPlatedCount: number;
  }>;
  cards: InsightCardModel[];
}
