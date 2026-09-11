/**
 * Recommendations for padel/seed flagship rackets (Prompt 25).
 */
import type { Recommendation } from "@/domain/recommendations/types";
import { SEED_DATES } from "@/content/config";

const padelSportId = "sport-padel" as const;

function rec(
  partial: Omit<Recommendation, "sportId" | "evidenceIds"> & {
    evidenceIds?: string[];
  },
): Recommendation {
  return {
    sportId: padelSportId,
    evidenceIds: partial.evidenceIds ?? ["ev-padel-seed-editorial"],
    ...partial,
  };
}

export const padelSeedEvidence = [
  {
    id: "ev-padel-seed-editorial",
    type: "editorial-research" as const,
    source: "Kitletics padel seed research",
    summary:
      "Manufacturer positioning and EU retailer specs for flagship padel rackets. Not personal lab testing.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium" as const,
  },
];

export const padelSeedRecommendations: Recommendation[] = [
  rec({
    id: "rec-nox-at10-balanced",
    productId: "prod-nox-at10-18k-2026",
    useCaseId: "uc-padel-balanced",
    score: 94,
    factors: [
      { key: "versatility", label: "Versatility", score: 95, weight: 0.4 },
      { key: "control", label: "Control", score: 90, weight: 0.35 },
      { key: "power", label: "Power", score: 82, weight: 0.25 },
    ],
    strengths: ["Hybrid all-court balance", "Strong intermediate fit"],
    compromises: ["Not the lightest option"],
    explanation: "Flagship hybrid when you want control without giving up attack.",
  }),
  rec({
    id: "rec-nox-at10-control",
    productId: "prod-nox-at10-18k-2026",
    useCaseId: "uc-padel-control",
    score: 90,
    factors: [
      { key: "control", label: "Control", score: 92, weight: 0.55 },
      { key: "sweetspot", label: "Sweet spot", score: 86, weight: 0.45 },
    ],
    strengths: ["Placed attacking balls"],
    compromises: ["Less smash-first than pure diamonds"],
    explanation: "Control-leaning hybrid for placement-first intermediates.",
  }),
  rec({
    id: "rec-vertex-power",
    productId: "prod-bullpadel-vertex-04",
    useCaseId: "uc-padel-power",
    score: 93,
    factors: [
      { key: "power", label: "Power", score: 94, weight: 0.55 },
      { key: "stability", label: "Stability", score: 88, weight: 0.45 },
    ],
    strengths: ["Finishing power", "Stable diamond frame"],
    compromises: ["Demanding for new players"],
    explanation: "Attacking Vertex pick for advanced finishers.",
  }),
  rec({
    id: "rec-viper-power",
    productId: "prod-babolat-technical-viper",
    useCaseId: "uc-padel-power",
    score: 95,
    factors: [
      { key: "power", label: "Power", score: 96, weight: 0.6 },
      { key: "control", label: "Control", score: 70, weight: 0.4 },
    ],
    strengths: ["Explosive smash"],
    compromises: ["Compact sweet spot"],
    explanation: "Maximum attacking bias among seed flagships.",
  }),
  rec({
    id: "rec-coello-beginner",
    productId: "prod-head-coello-pro",
    useCaseId: "uc-padel-beginner",
    score: 91,
    factors: [
      { key: "forgiveness", label: "Forgiveness", score: 92, weight: 0.5 },
      { key: "value", label: "Value", score: 94, weight: 0.5 },
    ],
    strengths: ["Approachable handling", "Strong value"],
    compromises: ["Less premium face construction"],
    explanation: "Forgiving hybrid when budget and ease matter.",
  }),
  rec({
    id: "rec-coello-control",
    productId: "prod-head-coello-pro",
    useCaseId: "uc-padel-control",
    score: 86,
    factors: [
      { key: "control", label: "Control", score: 88, weight: 0.6 },
      { key: "maneuverability", label: "Maneuverability", score: 84, weight: 0.4 },
    ],
    strengths: ["Easy placement"],
    compromises: ["Not a pure power frame"],
    explanation: "Control-friendly value hybrid.",
  }),
  rec({
    id: "rec-diablo-beginner",
    productId: "prod-siux-diablo",
    useCaseId: "uc-padel-beginner",
    score: 93,
    factors: [
      { key: "forgiveness", label: "Forgiveness", score: 94, weight: 0.45 },
      { key: "maneuverability", label: "Maneuverability", score: 95, weight: 0.55 },
    ],
    strengths: ["Round sweet spot", "Light handling"],
    compromises: ["Gives up finishing power"],
    explanation: "Best seed match for easy handling and forgiveness.",
  }),
  rec({
    id: "rec-diablo-control",
    productId: "prod-siux-diablo",
    useCaseId: "uc-padel-control",
    score: 92,
    factors: [
      { key: "control", label: "Control", score: 93, weight: 0.55 },
      { key: "maneuverability", label: "Maneuverability", score: 94, weight: 0.45 },
    ],
    strengths: ["Defensive speed", "Placement"],
    compromises: ["Low power ceiling"],
    explanation: "Control and maneuverability first.",
  }),
  rec({
    id: "rec-bela-power",
    productId: "prod-wilson-bela-pro",
    useCaseId: "uc-padel-power",
    score: 90,
    factors: [
      { key: "power", label: "Power", score: 91, weight: 0.6 },
      { key: "stability", label: "Stability", score: 85, weight: 0.4 },
    ],
    strengths: ["Attacking profile"],
    compromises: ["Advanced-oriented"],
    explanation: "Attacking Wilson diamond for advanced players.",
  }),
];
