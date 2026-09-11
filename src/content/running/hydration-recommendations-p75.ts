/**
 * Fix 75 — Kiprun 900 Race 5L and Proteam 10 hydration recs / alternatives.
 */
import type { Recommendation, AlternativeRelationship } from "@/domain/recommendations/types";

const ev = ["ev-catalog-editorial", "ev-catalog-mfr"] as const;

const race5Factors = [
  { key: "capacity", label: "Capacity", score: 72, weight: 0.14, explanation: "5L race-vest volume." },
  { key: "bounce-control", label: "Bounce control", score: 72, weight: 0.12, explanation: "Value race harness, not Sensifit." },
  { key: "comfort-fit", label: "Comfort & fit", score: 78, weight: 0.12, explanation: "2XS–XL ladder, three chest clips." },
  { key: "race-kit", label: "Race-kit capacity", score: 70, weight: 0.1, explanation: "10 pockets; no poles/quiver." },
  { key: "phone-carry", label: "Phone carry", score: 80, weight: 0.08, explanation: "Phone-capable front/stretch storage." },
  { key: "versatility", label: "Versatility", score: 78, weight: 0.1, explanation: "Road and trail race days." },
  { key: "weight", label: "Weight", score: 90, weight: 0.1, explanation: "190 g empty." },
  { key: "value", label: "Value", score: 94, weight: 0.08, explanation: "Decathlon ~€40 class." },
  { key: "flask-access", label: "Flask access", score: 86, weight: 0.08, explanation: "Twin 500 ml sleeves; flasks not included." },
  { key: "reservoir-option", label: "Reservoir option", score: 20, weight: 0.08, explanation: "No bladder sleeve." },
];

const proteamFactors = [
  { key: "capacity", label: "Capacity", score: 88, weight: 0.14, explanation: "10L race-kit volume." },
  { key: "bounce-control", label: "Bounce control", score: 74, weight: 0.12, explanation: "Race harness, not Sensifit." },
  { key: "comfort-fit", label: "Comfort & fit", score: 80, weight: 0.12, explanation: "Six sizes; 170 g at M." },
  { key: "race-kit", label: "Race-kit capacity", score: 86, weight: 0.1, explanation: "14 pockets plus quiver." },
  { key: "phone-carry", label: "Phone carry", score: 82, weight: 0.08, explanation: "Phone-capable pocket count." },
  { key: "versatility", label: "Versatility", score: 80, weight: 0.1, explanation: "Trail/ultra flask racing." },
  { key: "weight", label: "Weight", score: 92, weight: 0.1, explanation: "170 g listed at M." },
  { key: "value", label: "Value", score: 88, weight: 0.08, explanation: "€110 Decathlon class." },
  { key: "flask-access", label: "Flask access", score: 88, weight: 0.08, explanation: "2–3×500 ml sleeves; flasks not included." },
  { key: "reservoir-option", label: "Reservoir option", score: 15, weight: 0.08, explanation: "No bladder — flask-only." },
];

function vestRecs(
  productId: string,
  uses: { id: string; score: number }[],
  strengths: string[],
  compromises: string[],
  explanation: string,
  factors: Recommendation["factors"],
): Recommendation[] {
  return uses.map((u) => ({
    id: `rec-${productId.replace(/^prod-/, "")}-${u.id}`,
    productId,
    sportId: "sport-running",
    useCaseId: `uc-${u.id}`,
    score: u.score,
    factors,
    strengths,
    compromises,
    explanation,
    evidenceIds: [...ev],
  }));
}

export const p75HydrationRecommendations: Recommendation[] = [
  ...vestRecs(
    "prod-kiprun-900-race-5",
    [
      { id: "trail-training", score: 84 },
      { id: "marathon", score: 82 },
      { id: "long-runs", score: 80 },
    ],
    ["190 g 5L at Decathlon pricing", "Twin flask sleeves, 10 pockets"],
    ["Flasks not included", "No bladder or quiver"],
    "900 Race 5L for flask-first 5L race days at value price.",
    race5Factors,
  ),
  ...vestRecs(
    "prod-kiprun-proteam-10",
    [
      { id: "trail-training", score: 88 },
      { id: "ultra", score: 84 },
      { id: "long-runs", score: 84 },
    ],
    ["170 g (M) 10L flask vest", "14 pockets and quiver"],
    ["Flasks not included", "No bladder sleeve"],
    "Proteam 10 for current Kiprun 10L race-kit trail days.",
    proteamFactors,
  ),
];

export const p75HydrationAlternatives: AlternativeRelationship[] = [
  {
    id: "alt-kiprun-900-race-5-salomon-adv-skin-5",
    sourceProductId: "prod-kiprun-900-race-5",
    alternativeProductId: "prod-salomon-adv-skin-5",
    similarityScore: 80,
    reasons: [
      "Switch to ADV Skin 5 when Sensifit bounce and included flasks beat Decathlon value.",
      "Stay with 900 Race 5L when €40 and a 2XS–XL ladder are the buy and you already own flasks.",
    ],
    relationshipType: "premium" as AlternativeRelationship["relationshipType"],
  },
  {
    id: "alt-kiprun-proteam-10-camelbak-circuit",
    sourceProductId: "prod-kiprun-proteam-10",
    alternativeProductId: "prod-camelbak-circuit",
    similarityScore: 78,
    reasons: [
      "Switch to Circuit when CamelBak flask geometry and specialty-shop fit beat Kiprun.",
      "Stay with Proteam 10 when 10L / 14 pockets at €110 Decathlon is the trail-kit job.",
    ],
    relationshipType: "premium" as AlternativeRelationship["relationshipType"],
  },
];
