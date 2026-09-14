export {
  MIN_BRAND_SAMPLE_FOR_RANKING,
  MIN_DISTRIBUTION_SAMPLE,
  coverageRatio,
  averageKnown,
} from "@/lib/padel-racket-database/statistics/helpers";
export {
  computePadelRacketMarketInsights,
  computeShapeDistribution,
  computeBalanceDistribution,
  computeWeightDistribution,
  computeMaterialDistribution,
  computePriceDistribution,
  computeBrandAssortment,
  buildInsightCards,
} from "@/lib/padel-racket-database/statistics/insights";
export { getPadelRacketStatisticsMethodology } from "@/lib/padel-racket-database/statistics/methodology";
export type {
  StatisticResult,
  DistributionStatRow,
  BrandAssortmentStat,
  InsightCardModel,
  PadelRacketMarketInsights,
} from "@/lib/padel-racket-database/statistics/types";
