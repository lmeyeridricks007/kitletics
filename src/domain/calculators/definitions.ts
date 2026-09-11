import type { CalculatorDefinition } from "@/domain/calculators/types";
import { RACE_DISTANCES } from "@/domain/calculators/running/distances";

export const paceCalculatorDefinition: CalculatorDefinition = {
  id: "calc-running-pace",
  slug: "running-pace-calculator",
  toolId: "tool-pace-calc",
  title: "Running Pace Calculator",
  description:
    "Convert between distance, time and pace — plus race splits and target finish times.",
  kind: "pace",
  version: "v1",
  sportIds: ["sport-running"],
  relatedToolSlugs: [
    "race-time-predictor",
    "running-shoe-finder",
    "shoe-rotation-planner",
  ],
  relatedGuideSlugs: [
    "running-shoes",
    "how-to-choose-running-shoes",
  ],
  methodologyTitle: "How it works",
  methodologyBody: [
    "Pace is simply time divided by distance. Speed is the inverse relationship.",
    "We convert everything internally to metres and seconds, then format results to the nearest second for pace and finish times.",
    "Splits are calculated from absolute distance × pace so rounding does not accumulate drift.",
  ],
  faqs: [
    {
      question: "How do I calculate running pace?",
      answer:
        "Divide your finish time by the distance. Example: 25:00 for 5K is 5:00 per kilometre. Use Distance + Time mode on this calculator.",
      exampleQuery: "mode=pace&distance=5k&time=1500",
    },
    {
      question: "What is the difference between pace and speed?",
      answer:
        "Pace is time per unit distance (e.g. min/km). Speed is distance per unit time (e.g. km/h). They describe the same effort in inverse units.",
    },
    {
      question: "How do I convert min/km to min/mile?",
      answer:
        "Multiply min/km by 1.609344 (or use this calculator — both units are always shown).",
    },
    {
      question: "What pace do I need for a sub-2-hour half marathon?",
      answer:
        "A 1:59:59 half needs about 5:41 per kilometre (9:09 per mile). Use Distance + Pace or the Half Marathon target presets.",
      exampleQuery: "mode=time&distance=half&time=7199",
    },
    {
      question: "What pace do I need for a 4-hour marathon?",
      answer:
        "A 4:00:00 marathon is about 5:41 per kilometre (9:09 per mile). Try the Sub 4:00 marathon shortcut.",
      exampleQuery: "mode=time&distance=marathon&time=14400",
    },
  ],
  presets: [
    {
      id: "5k-25",
      label: "5K in 25:00",
      params: { mode: "pace", distance: "5k", time: "1500" },
    },
    {
      id: "10k-50",
      label: "10K in 50:00",
      params: { mode: "pace", distance: "10k", time: "3000" },
    },
    {
      id: "half-2h",
      label: "Half in 2:00",
      params: { mode: "pace", distance: "half", time: "7200" },
    },
    {
      id: "mara-4h",
      label: "Marathon in 4:00",
      params: { mode: "pace", distance: "marathon", time: "14400" },
    },
    {
      id: "half-sub130",
      label: "Sub 1:30 half",
      params: { mode: "time", distance: "half", time: "5400" },
    },
    {
      id: "half-sub145",
      label: "Sub 1:45 half",
      params: { mode: "time", distance: "half", time: "6300" },
    },
    {
      id: "half-sub2",
      label: "Sub 2:00 half",
      params: { mode: "time", distance: "half", time: "7200" },
    },
    {
      id: "mara-sub3",
      label: "Sub 3:00 marathon",
      params: { mode: "time", distance: "marathon", time: "10800" },
    },
    {
      id: "mara-sub330",
      label: "Sub 3:30 marathon",
      params: { mode: "time", distance: "marathon", time: "12600" },
    },
    {
      id: "mara-sub4",
      label: "Sub 4:00 marathon",
      params: { mode: "time", distance: "marathon", time: "14400" },
    },
    {
      id: "mara-sub430",
      label: "Sub 4:30 marathon",
      params: { mode: "time", distance: "marathon", time: "16200" },
    },
    {
      id: "mara-sub5",
      label: "Sub 5:00 marathon",
      params: { mode: "time", distance: "marathon", time: "18000" },
    },
  ],
  seoTitle: "Running Pace Calculator: Pace, Time & Distance | Kitletics",
  seoDescription:
    "Calculate running pace in min/km or min/mile, finish times, race splits and speed — free and shareable.",
};

export const racePredictorDefinition: CalculatorDefinition = {
  id: "calc-race-time-predictor",
  slug: "race-time-predictor",
  toolId: "tool-race-predictor",
  title: "Race Time Predictor",
  description:
    "Estimate equivalent race times at other distances from a recent result using the Riegel model.",
  kind: "race-predictor",
  version: "v1",
  sportIds: ["sport-running"],
  relatedToolSlugs: [
    "running-pace-calculator",
    "running-shoe-finder",
    "shoe-rotation-planner",
  ],
  relatedGuideSlugs: ["running-shoes", "how-to-choose-running-shoes"],
  methodologyTitle: "How predictions work",
  methodologyBody: [
    "The prediction estimates equivalent performance at another distance based on your supplied result.",
    "It assumes broadly comparable fitness and race conditions — not a guarantee of race-day outcome.",
    "We use the Riegel formula, a widely used race-equivalency model for road running.",
  ],
  formulaDisplay: "T₂ = T₁ × (D₂ / D₁)^1.06",
  formulaDefinitions: [
    { symbol: "T₁", meaning: "Known finish time" },
    { symbol: "D₁", meaning: "Known distance" },
    { symbol: "D₂", meaning: "Target distance" },
    { symbol: "T₂", meaning: "Predicted time" },
  ],
  limitations: [
    "Less reliable when source and target distances differ a lot",
    "Training that is highly distance-specific can change outcomes",
    "Terrain, weather, pacing and fueling can materially change actual results",
  ],
  faqs: [
    {
      question: "How accurate are race time predictors?",
      answer:
        "They estimate equivalent fitness, not guaranteed outcomes. Closer distances are usually more reliable than large jumps (e.g. 5K → marathon).",
    },
    {
      question: "Can a 5K predict my marathon time?",
      answer:
        "It can give a broader estimate only. Marathon performance depends heavily on endurance training, fueling and pacing — treat long-range predictions cautiously.",
    },
    {
      question: "What is the Riegel formula?",
      answer:
        "T₂ = T₁ × (D₂ / D₁)^1.06. It models how finish times typically scale with distance for runners of similar fitness.",
    },
    {
      question:
        "Why is my predicted marathon slower than simply doubling my half-marathon time?",
      answer:
        "Doubling ignores the extra fatigue of a longer race. The Riegel exponent (>1) builds in that performance decay.",
    },
  ],
  presets: [
    {
      id: "10k-to-half",
      label: "10K → Half",
      params: { from: "10k", time: "2910", to: "half" },
    },
    {
      id: "half-to-mara",
      label: "Half → Marathon",
      params: { from: "half", time: "5400", to: "marathon" },
    },
    {
      id: "5k-to-10k",
      label: "5K → 10K",
      params: { from: "5k", time: "1500", to: "10k" },
    },
  ],
  seoTitle: "Race Time Predictor: 5K, 10K, Half & Marathon | Kitletics",
  seoDescription:
    "Estimate equivalent race times across 5K, 10K, half marathon and marathon from a recent result using the Riegel model.",
};

/** Expose distance presets for UI without hardcoding in components */
export const PACE_DISTANCE_PRESET_IDS = RACE_DISTANCES.map((d) => d.id);
