/**
 * Typed statistics for the Padel Racket Database market-insights layer.
 * Unit of analysis: one eligible Product model = one PadelRacketDatabaseRecord.
 */

export type StatisticUnitOfAnalysis =
  | "product-model"
  | "product-model-with-metric";

export interface StatisticMeta {
  id: string;
  label: string;
  definition: string;
  unitOfAnalysis: StatisticUnitOfAnalysis;
  caveat?: string;
}

export interface StatisticResult<T> extends StatisticMeta {
  value: T;
  sampleSize: number;
  populationSize: number;
  coverage: number;
}

export interface DistributionStatRow {
  value: string;
  label: string;
  count: number;
  share: number;
}

export interface BrandAssortmentStat {
  brandId: string;
  brandSlug: string;
  brandName: string;
  count: number;
  ranked: boolean;
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
  viewAllHref: string;
  viewAllLabel: string;
}

export interface PadelRacketMarketInsights {
  generatedAt: string;
  eligibleCount: number;
  unitOfAnalysis: "product-model";
  minBrandSampleForRanking: number;
  minDistributionSample: number;
  shapeDistribution: StatisticResult<DistributionStatRow[]>;
  balanceDistribution: StatisticResult<DistributionStatRow[]>;
  weightDistribution: StatisticResult<DistributionStatRow[]>;
  materialDistribution: StatisticResult<DistributionStatRow[]>;
  priceDistribution: StatisticResult<DistributionStatRow[]>;
  brandAssortment: StatisticResult<BrandAssortmentStat[]>;
  cards: InsightCardModel[];
}
