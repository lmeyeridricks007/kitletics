import type {
  AlternativeRelationship,
  Recommendation,
} from "@/domain/recommendations/types";
import {
  runningCatalogAlternatives,
  runningCatalogRecommendations,
} from "@/content/running/recommendations";
import {
  runningWatchAlternatives,
  runningWatchRecommendations,
} from "@/content/running/watch-recommendations";
import {
  runningHrmAlternatives,
  runningHrmRecommendations,
} from "@/content/running/hrm-recommendations";
import {
  runningHydrationAlternatives,
  runningHydrationRecommendations,
} from "@/content/running/hydration-recommendations";
import {
  runningClothingAlternatives,
  runningClothingRecommendations,
} from "@/content/running/clothing-recommendations";
import { runningPacksCarryRecommendations } from "@/content/running/packs-carry-recommendations";
import { runningHeadphonesRecommendations } from "@/content/running/headphones-recommendations";
import { runningSunglassesRecommendations } from "@/content/running/sunglasses-recommendations";
import { runningHeadlampsRecommendations } from "@/content/running/headlamps-recommendations";
import { runningSafetyRecommendations } from "@/content/running/safety-recommendations";
import { runningNutritionRecommendations } from "@/content/running/nutrition-recommendations";
import { runningRecoveryRecommendations } from "@/content/running/recovery-recommendations";
import { fitnessRecommendations } from "@/content/fitness";
import { hyroxExtraRecommendations } from "@/content/hyrox/editorial";
import { wave25Recommendations } from "@/content/padel";
import {
  racketRecommendations,
  racketAlternatives,
} from "@/content/racket";
import { padelAllAlternatives } from "@/content/padel";

/**
 * Context-specific suitability scores (Scenario G).
 * Scores are explainable via weighted factors — not arbitrary AI %.
 */
export const recommendations: Recommendation[] = [
  {
    id: "rec-boston-daily",
    productId: "prod-boston-12",
    sportId: "sport-running",
    useCaseId: "uc-daily-training",
    score: 94,
    factors: [
      { key: "responsiveness", score: 92, weight: 0.3, explanation: "Responds well for mixed daily paces." },
      { key: "versatility", score: 96, weight: 0.35, explanation: "Covers easy-to-tempo without a shoe change." },
      { key: "durability", score: 90, weight: 0.2, explanation: "Built for training volume." },
      { key: "cushion", score: 85, weight: 0.15, explanation: "Adequate daily cushion; not max plush." },
    ],
    strengths: ["One-shoe training versatility"],
    compromises: ["Less plush than Nimbus/Clifton for pure easy days"],
    explanation:
      "Strong daily trainer when workouts and easy miles share a rotation slot.",
    evidenceIds: ["ev-boston-editorial"],
  },
  {
    id: "rec-boston-marathon",
    productId: "prod-boston-12",
    sportId: "sport-running",
    useCaseId: "uc-marathon",
    score: 82,
    factors: [
      { key: "race-efficiency", score: 84, weight: 0.4, explanation: "Plated tempo platform helps late-race efficiency." },
      { key: "protection", score: 78, weight: 0.3, explanation: "Protective enough for many marathoners." },
      { key: "weight", score: 80, weight: 0.3, explanation: "Not the lightest pure racer." },
    ],
    strengths: ["Capable marathon option for tempo-shoe fans"],
    compromises: ["Dedicated carbon racers score higher for PB attempts"],
    explanation: "Solid marathon shoe for athletes who train in Boston.",
    evidenceIds: ["ev-boston-editorial"],
  },
  {
    id: "rec-boston-5k",
    productId: "prod-boston-12",
    sportId: "sport-running",
    useCaseId: "uc-5k",
    score: 69,
    factors: [
      { key: "race-weight", score: 65, weight: 0.5, explanation: "Heavier than dedicated 5K racers." },
      { key: "responsiveness", score: 78, weight: 0.5, explanation: "Still quick enough for shorter races." },
    ],
    strengths: ["Works if it is your only race shoe"],
    compromises: ["Specialist 5K racers are better for pure speed"],
    explanation: "Serviceable 5K shoe; not the category peak.",
    evidenceIds: ["ev-boston-editorial"],
  },
  {
    id: "rec-boston-hyrox",
    productId: "prod-boston-12",
    sportId: "sport-hyrox",
    useCaseId: "uc-hyrox-training",
    score: 91,
    factors: [
      { key: "station-grip", score: 88, weight: 0.3, explanation: "Stable enough for mixed HYROX movements." },
      { key: "run-legs", score: 94, weight: 0.4, explanation: "Strong on the 1km run segments." },
      { key: "durability", score: 90, weight: 0.3, explanation: "Handles gym + run training load." },
    ],
    strengths: ["Excellent hybrid training shoe"],
    compromises: ["Not a pure lifting shoe"],
    explanation: "High suitability for HYROX run/station training contexts.",
    evidenceIds: ["ev-boston-editorial"],
  },
  {
    id: "rec-boston-trail",
    productId: "prod-boston-12",
    sportId: "sport-running",
    useCaseId: "uc-trail-training",
    score: 18,
    factors: [
      { key: "grip", score: 10, weight: 0.6, explanation: "Road outsole — poor aggressive trail traction." },
      { key: "protection", score: 30, weight: 0.4, explanation: "Limited rock protection vs trail shoes." },
    ],
    strengths: [],
    compromises: ["Wrong tool for real trail terrain"],
    explanation: "Not recommended for trail running.",
    evidenceIds: ["ev-boston-editorial"],
  },
  {
    id: "rec-nb5-daily",
    productId: "prod-novablast-5",
    sportId: "sport-running",
    useCaseId: "uc-daily-training",
    score: 90,
    factors: [
      { key: "cushion", score: 94, weight: 0.35, explanation: "Soft high stack for daily miles." },
      { key: "energy", score: 90, weight: 0.35, explanation: "Bouncy midsole keeps easy runs lively." },
      { key: "versatility", score: 86, weight: 0.3, explanation: "Best as easy/long; less for sharp intervals." },
    ],
    strengths: ["Fun daily ride", "Long-run friendly", "Strong value as prior gen"],
    compromises: ["Superseded by Novablast 6", "Not a stability shoe"],
    explanation: "Still an excellent soft daily trainer when discounted.",
    evidenceIds: ["ev-nb5-editorial", "ev-nb5-mfr"],
  },
  {
    id: "rec-nb5-long",
    productId: "prod-novablast-5",
    sportId: "sport-running",
    useCaseId: "uc-long-runs",
    score: 88,
    factors: [
      { key: "protection", score: 90, weight: 0.5, explanation: "High stack protects on long efforts." },
      { key: "energy", score: 88, weight: 0.5, explanation: "Bounce helps late in long runs." },
    ],
    strengths: ["Excellent long-run companion"],
    compromises: ["Prefer Novablast 6 for current-gen wet grip"],
    explanation: "High suitability for long runs.",
    evidenceIds: ["ev-nb5-editorial"],
  },
  {
    id: "rec-nb5-easy",
    productId: "prod-novablast-5",
    sportId: "sport-running",
    useCaseId: "uc-easy-runs",
    score: 91,
    factors: [
      { key: "comfort", score: 93, weight: 0.5, explanation: "Soft ride suits easy pacing." },
      { key: "energy", score: 88, weight: 0.5, explanation: "Keeps easy miles from feeling dead." },
    ],
    strengths: ["Comfortable easy-day shoe"],
    compromises: ["Overkill if you prefer firmer easy trainers"],
    explanation: "Excellent for easy and recovery-paced road miles.",
    evidenceIds: ["ev-nb5-editorial"],
  },
  {
    id: "rec-nb5-tempo",
    productId: "prod-novablast-5",
    sportId: "sport-running",
    useCaseId: "uc-tempo-runs",
    score: 76,
    factors: [
      { key: "responsiveness", score: 78, weight: 0.5, explanation: "Bounce helps but geometry is daily-oriented." },
      { key: "weight", score: 72, weight: 0.5, explanation: "Heavier than dedicated tempo shoes." },
    ],
    strengths: ["Usable for moderate tempos"],
    compromises: ["Tempo specialists score higher for threshold work"],
    explanation: "Serviceable for occasional tempos; not a workout specialist.",
    evidenceIds: ["ev-nb5-editorial"],
  },
  {
    id: "rec-nb5-trail",
    productId: "prod-novablast-5",
    sportId: "sport-running",
    useCaseId: "uc-trail-training",
    score: 22,
    factors: [
      { key: "grip", score: 18, weight: 0.6, explanation: "Road outsole lacks trail bite." },
      { key: "protection", score: 28, weight: 0.4, explanation: "No rock plate or aggressive upper." },
    ],
    strengths: [],
    compromises: ["Wrong tool for technical trails"],
    explanation: "Not recommended for trail running.",
    evidenceIds: ["ev-nb5-editorial"],
  },
  {
    id: "rec-ghost-beginners",
    productId: "prod-ghost-16",
    sportId: "sport-running",
    useCaseId: "uc-beginners",
    score: 88,
    factors: [
      { key: "forgiveness", score: 92, weight: 0.4, explanation: "Soft, approachable ride." },
      { key: "widths", score: 96, weight: 0.3, explanation: "Broad width range aids fit success." },
      { key: "availability", score: 90, weight: 0.3, explanation: "Easy to try and buy as prior gen." },
    ],
    strengths: ["Beginner-friendly fit story", "Value as previous generation"],
    compromises: ["Prefer Ghost 18 for current generation"],
    explanation: "Still a strong beginner shoe when priced as prior gen.",
    evidenceIds: ["ev-catalog-editorial"],
  },
  ...runningCatalogRecommendations,
  ...runningWatchRecommendations,
  ...runningHrmRecommendations,
  ...runningHydrationRecommendations,
  ...runningPacksCarryRecommendations,
  ...runningHeadphonesRecommendations,
  ...runningSunglassesRecommendations,
  ...runningHeadlampsRecommendations,
  ...runningSafetyRecommendations,
  ...runningNutritionRecommendations,
  ...runningRecoveryRecommendations,
  ...runningClothingRecommendations,
  ...fitnessRecommendations,
  ...hyroxExtraRecommendations,
  ...wave25Recommendations,
  ...racketRecommendations,
];

export const alternatives: AlternativeRelationship[] = [
  {
    id: "alt-nb5-ghost",
    sourceProductId: "prod-novablast-5",
    alternativeProductId: "prod-ghost-16",
    similarityScore: 78,
    reasons: ["Both neutral daily trainers", "Ghost offers more width options"],
    relationshipType: "beginner-friendly",
  },
  {
    id: "alt-nb5-clifton",
    sourceProductId: "prod-novablast-5",
    alternativeProductId: "prod-clifton-9",
    similarityScore: 82,
    reasons: ["Both soft high-stack dailies", "Clifton is more max-cushion oriented"],
    relationshipType: "more-cushioned",
  },
  {
    id: "alt-nb5-nimbus",
    sourceProductId: "prod-novablast-5",
    alternativeProductId: "prod-nimbus-27",
    similarityScore: 80,
    reasons: ["Same brand ecosystem", "Nimbus is plusher and more protective"],
    relationshipType: "more-cushioned",
  },
  {
    id: "alt-boston-speed",
    sourceProductId: "prod-boston-12",
    alternativeProductId: "prod-endorphin-speed-4",
    similarityScore: 85,
    reasons: ["Both plated tempo platforms", "Speed is nylon-plated race/workout hybrid"],
    relationshipType: "faster",
  },
  {
    id: "alt-fr965-pace3",
    sourceProductId: "prod-forerunner-965",
    alternativeProductId: "prod-coros-pace-3",
    similarityScore: 70,
    reasons: ["Lighter and cheaper", "Fewer maps/smart features"],
    relationshipType: "cheaper",
  },
  {
    id: "alt-fr965-255",
    sourceProductId: "prod-forerunner-965",
    alternativeProductId: "prod-forerunner-255",
    similarityScore: 75,
    reasons: ["Same ecosystem", "255 is better value without AMOLED/maps"],
    relationshipType: "better-value",
  },
  ...runningCatalogAlternatives,
  ...runningWatchAlternatives,
  ...runningHrmAlternatives,
  ...runningHydrationAlternatives,
  ...runningClothingAlternatives,
  ...padelAllAlternatives,
  ...racketAlternatives,
];
