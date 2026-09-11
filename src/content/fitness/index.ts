import {
  fitnessCategories,
  fitnessSubcategories,
  fitnessUseCases,
  fitnessBrands as seedBrands,
  fitnessSpecificationDefinitions as seedSpecs,
  fitnessProducts as seedProducts,
  fitnessRecommendations as seedRecs,
  fitnessEvidence as seedEvidence,
  fitnessOffers as seedOffers,
  fitnessBestGuides as seedBest,
  fitnessBuyingGuides as seedGuides,
  fitnessGearSetups as seedSetups,
  fitnessTools as seedTools,
  fitnessComparisons as seedComparisons,
} from "@/content/fitness/seed";
import {
  wave24Brands,
  wave24SpecificationDefinitions,
  wave24Products,
  wave24Recommendations,
  wave24Evidence,
  wave24Offers,
  wave24BestGuides,
  wave24BuyingGuides,
  wave24GearSetups,
  wave24Tools,
  wave24Comparisons,
} from "@/content/fitness/wave24";
import {
  trainingShoesWaveBrands,
  trainingShoesWaveProducts,
  trainingShoesWaveOffers,
  trainingShoesWaveEvidence,
} from "@/content/fitness/training-shoes-wave";

export { fitnessCategories, fitnessSubcategories, fitnessUseCases };

export const fitnessBrands = [
  ...seedBrands,
  ...wave24Brands,
  ...trainingShoesWaveBrands,
];
export const fitnessSpecificationDefinitions = [
  ...seedSpecs,
  ...wave24SpecificationDefinitions,
];
export const fitnessProducts = [
  ...seedProducts,
  ...wave24Products,
  ...trainingShoesWaveProducts,
];
export const fitnessRecommendations = [...seedRecs, ...wave24Recommendations];
export const fitnessEvidence = [
  ...seedEvidence,
  ...wave24Evidence,
  ...trainingShoesWaveEvidence,
];
export const fitnessOffers = [
  ...seedOffers,
  ...wave24Offers,
  ...trainingShoesWaveOffers,
];
export const fitnessBestGuides = [...seedBest, ...wave24BestGuides];
export const fitnessBuyingGuides = [...seedGuides, ...wave24BuyingGuides];
export const fitnessGearSetups = [...seedSetups, ...wave24GearSetups];
export const fitnessTools = [...seedTools, ...wave24Tools];
export const fitnessComparisons = [...seedComparisons, ...wave24Comparisons];

export { fitnessCompatibilities } from "@/content/fitness/compatibility";
