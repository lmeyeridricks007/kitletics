export {
  MIN_BRAND_SAMPLE_FOR_RANKING,
  BEST_VALUE_PRICE_CEILING_EUR,
  coverageRatio,
  averageKnown,
  withKnownMetric,
  withValidStatisticMetric,
} from "@/lib/running-shoe-database/statistics/helpers";
export {
  computeRunningShoeMarketInsights,
  computeLightestDailyTrainers,
  computeHighestStackShoes,
  computeLowestDropTrainers,
  computeBestValueUnderPrice,
  computeAverageWeightByBrand,
  computeAverageOfferPriceByBrand,
  computePlatedVsNonPlated,
  buildInsightCards,
} from "@/lib/running-shoe-database/statistics/insights";
export { getRunningShoeStatisticsMethodology } from "@/lib/running-shoe-database/statistics/methodology";
export type {
  StatisticResult,
  RankedShoeStat,
  BrandAverageStat,
  GroupAverageStat,
  InsightCardModel,
  RunningShoeMarketInsights,
} from "@/lib/running-shoe-database/statistics/types";
