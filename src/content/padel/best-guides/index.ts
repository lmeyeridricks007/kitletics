import type { BestGuide } from "@/domain/editorial/types";
import { padelRacketsCategoryGuide } from "@/content/padel/best-guides/rackets-category";
import {
  padelRacketsAdvancedGuide,
  padelRacketsBeginnersGuide,
  padelRacketsIntermediateGuide,
} from "@/content/padel/best-guides/rackets-level";
import {
  padelRacketsAllRoundGuide,
  padelRacketsControlGuide,
  padelRacketsPowerGuide,
} from "@/content/padel/best-guides/rackets-style";
import {
  padelRacketsComfortGuide,
  padelRacketsLightweightGuide,
  padelRacketsManeuverabilityGuide,
  padelRacketsWomenGuide,
} from "@/content/padel/best-guides/rackets-handling";
import { padelRacketsValueGuide } from "@/content/padel/best-guides/rackets-value";
import {
  padelShoesCategoryGuide,
  padelShoesComfortGuide,
  padelShoesLightweightGuide,
  padelShoesMenGuide,
  padelShoesStabilityGuide,
  padelShoesValueGuide,
  padelShoesWomenGuide,
} from "@/content/padel/best-guides/shoes";
import {
  padelBagsGuide,
  padelOvergripsGuide,
} from "@/content/padel/best-guides/accessories";
import {
  padelBallPressurizersGuide,
  padelRacketProtectorsGuide,
} from "@/content/padel/best-guides/accessories-intents";
import {
  padelDryFeelOvergripsGuide,
  padelErgonomicGripsGuide,
  padelOvergripsSweatyGuide,
  padelTackyOvergripsGuide,
  padelValueOvergripsGuide,
} from "@/content/padel/best-guides/grips-intents";
import { padelBallsGuide } from "@/content/padel/best-guides/balls";
import {
  padelBallsCompetitionGuide,
  padelBallsFastGuide,
  padelBallsTrainingGuide,
  padelBallsValueGuide,
} from "@/content/padel/best-guides/balls-intents";
import {
  padelBagsBackpacksGuide,
  padelBagsCommutingGuide,
  padelBagsCompactGuide,
  padelBagsLargeGuide,
  padelBagsShoeGuide,
  padelBagsTournamentGuide,
} from "@/content/padel/best-guides/bags-intents";

export const padelBestGuides: BestGuide[] = [
  padelRacketsCategoryGuide,
  padelRacketsBeginnersGuide,
  padelRacketsIntermediateGuide,
  padelRacketsAdvancedGuide,
  padelRacketsControlGuide,
  padelRacketsPowerGuide,
  padelRacketsAllRoundGuide,
  padelRacketsLightweightGuide,
  padelRacketsComfortGuide,
  padelRacketsManeuverabilityGuide,
  padelRacketsWomenGuide,
  padelRacketsValueGuide,
  padelShoesCategoryGuide,
  padelShoesMenGuide,
  padelShoesWomenGuide,
  padelShoesStabilityGuide,
  padelShoesComfortGuide,
  padelShoesLightweightGuide,
  padelShoesValueGuide,
  padelBallsGuide,
  padelBallsCompetitionGuide,
  padelBallsTrainingGuide,
  padelBallsFastGuide,
  padelBallsValueGuide,
  padelOvergripsGuide,
  padelOvergripsSweatyGuide,
  padelTackyOvergripsGuide,
  padelDryFeelOvergripsGuide,
  padelValueOvergripsGuide,
  padelErgonomicGripsGuide,
  padelBagsGuide,
  padelBagsBackpacksGuide,
  padelBagsLargeGuide,
  padelBagsCompactGuide,
  padelBagsShoeGuide,
  padelBagsTournamentGuide,
  padelBagsCommutingGuide,
  padelBallPressurizersGuide,
  padelRacketProtectorsGuide,
];
