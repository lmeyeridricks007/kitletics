/**
 * Fix 75 — contextual watch recs + alternative edges for catalog-gap SKUs.
 */
import type { Recommendation, AlternativeRelationship } from "@/domain/recommendations/types";

const EVIDENCE = ["ev-catalog-editorial", "ev-catalog-mfr"] as const;

type Factor = Recommendation["factors"][number];

function watchFactors(input: {
  gps: number;
  gpsNote: string;
  battery: number;
  batteryNote: string;
  screen: number;
  comfort: number;
  comfortNote: string;
  training: number;
  nav: number;
  navNote: string;
  eco: number;
  ease: number;
  smart: number;
  durable: number;
  value: number;
}): Factor[] {
  return [
    { key: "gps-accuracy", label: "GPS accuracy", score: input.gps, weight: 0.12, explanation: input.gpsNote },
    { key: "battery", label: "Battery", score: input.battery, weight: 0.12, explanation: input.batteryNote },
    { key: "screen-readability", label: "Screen readability", score: input.screen, weight: 0.08, explanation: "Bright AMOLED class display." },
    { key: "comfort", label: "Comfort & weight", score: input.comfort, weight: 0.08, explanation: input.comfortNote },
    { key: "training-analytics", label: "Training analytics", score: input.training, weight: 0.1, explanation: "Training / recovery tools for this class." },
    { key: "navigation", label: "Navigation & mapping", score: input.nav, weight: 0.1, explanation: input.navNote },
    { key: "ecosystem", label: "Ecosystem", score: input.eco, weight: 0.08, explanation: "App, sensors and third-party sync fit." },
    { key: "ease-of-use", label: "Ease of use", score: input.ease, weight: 0.07, explanation: "Menu depth vs beginner friendliness." },
    { key: "smartwatch", label: "Smartwatch features", score: input.smart, weight: 0.07, explanation: "Music/payments/lifestyle features matter here." },
    { key: "sensors", label: "Sensor support", score: 78, weight: 0.06, explanation: "Optical HR and related sensors for the class." },
    { key: "durability", label: "Durability", score: input.durable, weight: 0.06, explanation: "Build intent for daily vs adventure use." },
    { key: "value", label: "Value", score: input.value, weight: 0.06, explanation: "Feature set vs typical street price band." },
  ];
}

function recsFor(
  productId: string,
  name: string,
  uses: { id: string; score: number }[],
  strengths: string[],
  compromises: string[],
  factors: Factor[],
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
    explanation: `${name} suitability for ${u.id.replace(/-/g, " ")} based on GPS, battery, training tools, navigation and ecosystem — not shoe-style cushioning factors.`,
    evidenceIds: [...EVIDENCE],
  }));
}

const balanceFactors = watchFactors({
  gps: 90,
  gpsNote: "Dual-band six-system GNSS.",
  battery: 88,
  batteryNote: "About 41h accuracy GPS / 21-day typical (claimed).",
  screen: 90,
  comfort: 70,
  comfortNote: "55g without strap; 51 mm hybrid case.",
  training: 80,
  nav: 88,
  navNote: "64GB contour maps and turn-by-turn.",
  eco: 72,
  ease: 78,
  smart: 74,
  durable: 82,
  value: 88,
});

const cheetahFactors = watchFactors({
  gps: 90,
  gpsNote: "Dual-band GNSS with offline maps.",
  battery: 82,
  batteryNote: "About 31h accurate GPS / 20-day typical (claimed).",
  screen: 92,
  comfort: 88,
  comfortNote: "45.6g without strap; 48 mm titanium.",
  training: 86,
  nav: 84,
  navNote: "32GB offline maps.",
  eco: 72,
  ease: 80,
  smart: 70,
  durable: 80,
  value: 82,
});

const ultra2Factors = watchFactors({
  gps: 88,
  gpsNote: "L1+L5 dual GPS. Dedicated GPS hours unpublished.",
  battery: 62,
  batteryNote: "Up to 60h AOD-on smartwatch claim; GPS hours not published.",
  screen: 96,
  comfort: 68,
  comfortNote: "61.5g / 47 mm titanium ultra.",
  training: 76,
  nav: 82,
  navNote: "Wear OS / Samsung maps on 64GB.",
  eco: 92,
  ease: 84,
  smart: 94,
  durable: 90,
  value: 66,
});

const watch9Factors = watchFactors({
  gps: 84,
  gpsNote: "Dual GPS. Dedicated GPS hours unpublished.",
  battery: 55,
  batteryNote: "Up to 40h AOD off / 30h AOD on (claimed).",
  screen: 86,
  comfort: 92,
  comfortNote: "31.5g / 40 mm compact Wear OS.",
  training: 72,
  nav: 70,
  navNote: "Wear OS navigation; not offline topo.",
  eco: 90,
  ease: 90,
  smart: 92,
  durable: 74,
  value: 76,
});

export const p75WatchRecommendations: Recommendation[] = [
  ...recsFor(
    "prod-amazfit-balance-3",
    "Amazfit Balance 3",
    [
      { id: "beginners", score: 74 },
      { id: "daily-training", score: 86 },
      { id: "half", score: 82 },
      { id: "marathon", score: 80 },
      { id: "trail-training", score: 84 },
      { id: "hyrox-training", score: 88 },
    ],
    ["1.5\" sapphire maps on a hybrid chassis", "HYROX modes and HybridCharge"],
    ["51 mm case", "Zepp, not Garmin Connect"],
    balanceFactors,
  ),
  ...recsFor(
    "prod-amazfit-cheetah-2-pro",
    "Amazfit Cheetah 2 Pro",
    [
      { id: "beginners", score: 70 },
      { id: "daily-training", score: 88 },
      { id: "5k", score: 90 },
      { id: "half", score: 88 },
      { id: "marathon", score: 86 },
      { id: "trail-training", score: 78 },
    ],
    ["Titanium 45.6g runner with gait/power", "Zepp Coach 5K–marathon"],
    ["5 ATM", "Zepp ecosystem vs Garmin/COROS"],
    cheetahFactors,
  ),
  ...recsFor(
    "prod-samsung-galaxy-watch-ultra-2",
    "Samsung Galaxy Watch Ultra2",
    [
      { id: "beginners", score: 68 },
      { id: "daily-training", score: 82 },
      { id: "half", score: 76 },
      { id: "trail-training", score: 78 },
      { id: "advanced", score: 74 },
    ],
    ["5000-nit titanium Wear OS ultra", "L1+L5 GPS and Running Coach"],
    ["GPS hours unpublished", "Galaxy/Android lock-in"],
    ultra2Factors,
  ),
  ...recsFor(
    "prod-samsung-galaxy-watch-9",
    "Samsung Galaxy Watch9",
    [
      { id: "beginners", score: 84 },
      { id: "daily-training", score: 80 },
      { id: "first-5k", score: 86 },
      { id: "first-10k", score: 82 },
      { id: "half", score: 70 },
    ],
    ["31.5g compact Wear OS daily", "Dual GPS and Samsung Pay"],
    ["Nightly charging", "GPS hours unpublished"],
    watch9Factors,
  ),
];

export const p75WatchAlternatives: AlternativeRelationship[] = [
  {
    id: "alt-amazfit-balance-3-vivoactive-6",
    sourceProductId: "prod-amazfit-balance-3",
    alternativeProductId: "prod-vivoactive-6",
    similarityScore: 80,
    reasons: [
      "Switch to Vivoactive 6 when Garmin Connect and Garmin Pay matter more than Zepp contour maps.",
      "Stay with Balance 3 when 64GB maps, HybridCharge and HYROX modes are the week and you accept Zepp.",
    ],
    relationshipType: "premium" as AlternativeRelationship["relationshipType"],
  },
  {
    id: "alt-amazfit-cheetah-2-pro-coros-pace-4",
    sourceProductId: "prod-amazfit-cheetah-2-pro",
    alternativeProductId: "prod-coros-pace-4",
    similarityScore: 82,
    reasons: [
      "Switch to Pace 4 when COROS battery and Training Hub beat Zepp gait/power.",
      "Stay with Cheetah 2 Pro when titanium AMOLED maps plus lactate/gait tools are the runner job.",
    ],
    relationshipType: "better-value" as AlternativeRelationship["relationshipType"],
  },
  {
    id: "alt-samsung-galaxy-watch-ultra-2-apple-watch-ultra-3",
    sourceProductId: "prod-samsung-galaxy-watch-ultra-2",
    alternativeProductId: "prod-apple-watch-ultra-3",
    similarityScore: 84,
    reasons: [
      "Switch to Apple Watch Ultra 3 when iPhone is the phone — Wear OS is the wrong ecosystem.",
      "Stay with Ultra2 when Galaxy Health, Samsung Pay and 5000-nit Wear OS are why you shopped an ultra.",
    ],
    relationshipType: "premium" as AlternativeRelationship["relationshipType"],
  },
  {
    id: "alt-samsung-galaxy-watch-9-forerunner-165",
    sourceProductId: "prod-samsung-galaxy-watch-9",
    alternativeProductId: "prod-forerunner-165",
    similarityScore: 80,
    reasons: [
      "Switch to Forerunner 165 when a charger-light beginner Garmin beats Wear OS notifications.",
      "Stay with Watch9 when Galaxy apps, Pay and a 31.5 g daily are the job.",
    ],
    relationshipType: "better-value" as AlternativeRelationship["relationshipType"],
  },
];
