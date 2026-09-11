import type { CompetitionFormat } from "@/domain/competition/types";
import type { Evidence } from "@/domain/recommendations/types";
import { SEED_DATES } from "@/content/config";

/**
 * Evidence for HYROX Season 26/27 singles rulebook loads.
 * Source: official HYROX Singles Rulebook Season 26/27 (published rulebook PDF).
 * Kitletics is not an official HYROX partner — descriptive use only.
 */
export const hyroxCompetitionEvidence: Evidence[] = [
  {
    id: "ev-hyrox-rulebook-26-27",
    type: "manufacturer",
    source: "HYROX Singles Rulebook Season 26/27",
    sourceUrl: "https://hyrox.com",
    summary:
      "Official singles rulebook: 8×1 km run + 8 stations; division loads for sled, farmers, lunges, wall balls; SkiErg/Row/BBJ unweighted.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-hyrox-editorial-format",
    type: "editorial-research",
    source: "Kitletics competition-format synthesis",
    summary:
      "Station order and division load table transcribed for CompetitionFormat. Re-verify against current rulebook before each season.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
];

const E = ["ev-hyrox-rulebook-26-27", "ev-hyrox-editorial-format"];

/**
 * Season 26/27 Singles format.
 * Division columns in rulebook:
 * - Women Open
 * - Men Open / Women Pro (shared load column)
 * - Men Pro
 * Wall balls: 4 kg / 6 kg / 9 kg respectively; 100 reps.
 */
export const hyroxSinglesFormat2627: CompetitionFormat = {
  id: "fmt-hyrox-singles-26-27",
  slug: "hyrox-singles-26-27",
  name: "HYROX Singles — Season 26/27",
  sportId: "sport-hyrox",
  seasonLabel: "26/27",
  formatKind: "singles",
  runningSegments: Array.from({ length: 8 }, (_, i) => ({
    order: i + 1,
    distanceM: 1000,
    label: `Run ${i + 1}`,
  })),
  stations: [
    {
      id: "st-ski-erg",
      order: 1,
      type: "ski-erg",
      name: "SkiErg",
      precedingRunDistanceM: 1000,
      distanceM: 1000,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open" },
        { divisionId: "men-open" },
        { divisionId: "women-pro" },
        { divisionId: "men-pro" },
      ],
      evidenceIds: E,
      notes: "No external load — identical across divisions.",
    },
    {
      id: "st-sled-push",
      order: 2,
      type: "sled-push",
      name: "Sled Push",
      precedingRunDistanceM: 1000,
      distanceM: 50,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open", loadKg: 102, notes: "Incl. sled" },
        { divisionId: "men-open", loadKg: 152, notes: "Incl. sled" },
        { divisionId: "women-pro", loadKg: 152, notes: "Same column as Men Open" },
        { divisionId: "men-pro", loadKg: 202, notes: "Incl. sled" },
      ],
      evidenceIds: E,
      notes: "4 × 12.5 m. Load includes sled.",
    },
    {
      id: "st-sled-pull",
      order: 3,
      type: "sled-pull",
      name: "Sled Pull",
      precedingRunDistanceM: 1000,
      distanceM: 50,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open", loadKg: 78, notes: "Incl. sled" },
        { divisionId: "men-open", loadKg: 103, notes: "Incl. sled" },
        { divisionId: "women-pro", loadKg: 103 },
        { divisionId: "men-pro", loadKg: 153, notes: "Incl. sled" },
      ],
      evidenceIds: E,
      notes: "4 × 12.5 m. Load includes sled.",
    },
    {
      id: "st-bbj",
      order: 4,
      type: "burpee-broad-jumps",
      name: "Burpee Broad Jumps",
      precedingRunDistanceM: 1000,
      distanceM: 80,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open" },
        { divisionId: "men-open" },
        { divisionId: "women-pro" },
        { divisionId: "men-pro" },
      ],
      evidenceIds: E,
    },
    {
      id: "st-row",
      order: 5,
      type: "rowing",
      name: "Rowing",
      precedingRunDistanceM: 1000,
      distanceM: 1000,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open" },
        { divisionId: "men-open" },
        { divisionId: "women-pro" },
        { divisionId: "men-pro" },
      ],
      evidenceIds: E,
    },
    {
      id: "st-farmers",
      order: 6,
      type: "farmers-carry",
      name: "Farmers Carry",
      precedingRunDistanceM: 1000,
      distanceM: 200,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open", loadKgPerHand: 16 },
        { divisionId: "men-open", loadKgPerHand: 24 },
        { divisionId: "women-pro", loadKgPerHand: 24 },
        { divisionId: "men-pro", loadKgPerHand: 32 },
      ],
      evidenceIds: E,
      notes: "Kettlebell farmers carry.",
    },
    {
      id: "st-lunges",
      order: 7,
      type: "sandbag-lunges",
      name: "Sandbag Lunges",
      precedingRunDistanceM: 1000,
      distanceM: 100,
      unit: "m",
      divisionRules: [
        { divisionId: "women-open", loadKg: 10 },
        { divisionId: "men-open", loadKg: 20 },
        { divisionId: "women-pro", loadKg: 20 },
        { divisionId: "men-pro", loadKg: 30 },
      ],
      evidenceIds: E,
    },
    {
      id: "st-wall-balls",
      order: 8,
      type: "wall-balls",
      name: "Wall Balls",
      precedingRunDistanceM: 1000,
      repetitions: 100,
      unit: "reps",
      divisionRules: [
        {
          divisionId: "women-open",
          loadKg: 4,
          repetitions: 100,
          targetHeightM: 2.7,
        },
        {
          divisionId: "men-open",
          loadKg: 6,
          repetitions: 100,
          targetHeightM: 3.0,
        },
        {
          divisionId: "women-pro",
          loadKg: 6,
          repetitions: 100,
          targetHeightM: 2.7,
        },
        {
          divisionId: "men-pro",
          loadKg: 9,
          repetitions: 100,
          targetHeightM: 3.0,
        },
      ],
      evidenceIds: E,
      notes:
        "Target heights commonly cited as 2.70 m women / 3.00 m men — confirm against current event setup.",
    },
  ],
  totalRunningDistanceM: 8000,
  sourceIds: ["ev-hyrox-rulebook-26-27"],
  evidenceIds: E,
  effectiveFrom: "2026-06-01",
  effectiveTo: "2027-05-31",
  lastVerifiedAt: SEED_DATES.verified,
  status: "published",
  notes:
    "Loads transcribed from Season 26/27 Singles Rulebook table. Re-verify if HYROX publishes mid-season amendments.",
};

export const competitionFormats: CompetitionFormat[] = [hyroxSinglesFormat2627];

export function getCompetitionFormatBySlug(
  slug: string,
): CompetitionFormat | undefined {
  return competitionFormats.find(
    (f) => f.slug === slug && f.status === "published",
  );
}

export function getCurrentHyroxSinglesFormat(): CompetitionFormat {
  return hyroxSinglesFormat2627;
}
