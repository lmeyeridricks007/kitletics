export type BuilderRoleId =
  | "PRIMARY_STRENGTH_STATION"
  | "BENCH"
  | "BARBELL"
  | "PLATES"
  | "FREE_WEIGHTS"
  | "VERTICAL_PULL"
  | "DIP_STATION"
  | "CABLE_TRAINING"
  | "CARDIO"
  | "CONDITIONING"
  | "FUNCTIONAL"
  | "CALISTHENICS"
  | "FLOORING"
  | "STORAGE"
  | "MOBILITY";

export const ROLE_TO_CATEGORY: Record<BuilderRoleId, string> = {
  PRIMARY_STRENGTH_STATION: "cat-power-racks",
  BENCH: "cat-weight-benches",
  BARBELL: "cat-barbells",
  PLATES: "cat-weight-plates",
  FREE_WEIGHTS: "cat-adjustable-dumbbells",
  VERTICAL_PULL: "cat-pull-up-bars",
  DIP_STATION: "cat-pull-up-bars",
  CABLE_TRAINING: "cat-power-racks",
  CARDIO: "cat-rowing-machines",
  CONDITIONING: "cat-rowing-machines",
  FUNCTIONAL: "cat-functional-fitness",
  CALISTHENICS: "cat-parallettes",
  FLOORING: "cat-gym-flooring",
  STORAGE: "cat-gym-storage",
  MOBILITY: "cat-recovery-gear",
};

/** Roles a category can cover without a separate product */
export const CATEGORY_COVERED_ROLES: Record<string, BuilderRoleId[]> = {
  "cat-power-racks": ["PRIMARY_STRENGTH_STATION", "VERTICAL_PULL"],
  "cat-weight-benches": ["BENCH"],
  "cat-barbells": ["BARBELL"],
  "cat-weight-plates": ["PLATES"],
  "cat-adjustable-dumbbells": ["FREE_WEIGHTS"],
  "cat-pull-up-bars": ["VERTICAL_PULL", "CALISTHENICS"],
  "cat-rowing-machines": ["CARDIO", "CONDITIONING"],
  "cat-air-bikes": ["CARDIO", "CONDITIONING"],
  "cat-treadmills": ["CARDIO"],
  "cat-ski-ergs": ["CARDIO", "CONDITIONING"],
  "cat-parallettes": ["CALISTHENICS"],
  "cat-gymnastic-rings": ["CALISTHENICS", "VERTICAL_PULL"],
  "cat-functional-fitness": ["FUNCTIONAL", "CONDITIONING"],
  "cat-gym-flooring": ["FLOORING"],
  "cat-gym-storage": ["STORAGE"],
};

export type ExerciseId =
  | "squat"
  | "bench-press"
  | "deadlift"
  | "overhead-press"
  | "pull-ups"
  | "dips"
  | "rows"
  | "dumbbell-work"
  | "kettlebell-work"
  | "olympic-lifts"
  | "sled"
  | "wall-balls"
  | "box-jumps"
  | "burpees"
  | "rowing"
  | "cycling"
  | "running"
  | "skierg"
  | "rings"
  | "handstands"
  | "muscle-ups"
  | "mobility";

export type ExerciseCoverage = "supported" | "partial" | "not-supported";

export interface ExerciseRequirement {
  id: ExerciseId;
  label: string;
  equipmentRoles: BuilderRoleId[];
  minSpaceMm2?: number;
  /** Minimum ceiling for comfortable performance */
  minHeightMm?: number;
  preferredSpaceMm2?: number;
  notes?: string;
}

export const EXERCISE_REQUIREMENTS: ExerciseRequirement[] = [
  { id: "squat", label: "Squat", equipmentRoles: ["PRIMARY_STRENGTH_STATION", "BARBELL", "PLATES"], minHeightMm: 2200 },
  { id: "bench-press", label: "Bench Press", equipmentRoles: ["BENCH", "BARBELL", "PLATES"] },
  { id: "deadlift", label: "Deadlift", equipmentRoles: ["BARBELL", "PLATES"], preferredSpaceMm2: 4_000_000 },
  { id: "overhead-press", label: "Overhead Press", equipmentRoles: ["BARBELL", "PLATES"], minHeightMm: 2300 },
  { id: "pull-ups", label: "Pull-Ups", equipmentRoles: ["VERTICAL_PULL"], minHeightMm: 2300 },
  { id: "dips", label: "Dips", equipmentRoles: ["DIP_STATION", "PRIMARY_STRENGTH_STATION"] },
  { id: "rows", label: "Rows", equipmentRoles: ["BARBELL", "FREE_WEIGHTS"] },
  { id: "dumbbell-work", label: "Dumbbell Work", equipmentRoles: ["FREE_WEIGHTS"], preferredSpaceMm2: 2_000_000 },
  { id: "kettlebell-work", label: "Kettlebell Work", equipmentRoles: ["FREE_WEIGHTS", "FUNCTIONAL"] },
  { id: "olympic-lifts", label: "Olympic Lifts", equipmentRoles: ["BARBELL", "PLATES"], minHeightMm: 2500, preferredSpaceMm2: 6_000_000 },
  { id: "sled", label: "Sled Push", equipmentRoles: ["FUNCTIONAL"], minSpaceMm2: 12_000_000, notes: "Meaningful sled runway is rare indoors." },
  { id: "wall-balls", label: "Wall Balls", equipmentRoles: ["FUNCTIONAL"], minHeightMm: 2700 },
  { id: "box-jumps", label: "Box Jumps", equipmentRoles: [], preferredSpaceMm2: 2_000_000, minHeightMm: 2500 },
  { id: "burpees", label: "Burpees", equipmentRoles: [], preferredSpaceMm2: 2_000_000 },
  { id: "rowing", label: "Rowing", equipmentRoles: ["CARDIO", "CONDITIONING"] },
  { id: "cycling", label: "Cycling", equipmentRoles: ["CARDIO"] },
  { id: "running", label: "Running", equipmentRoles: ["CARDIO"] },
  { id: "skierg", label: "SkiErg", equipmentRoles: ["CARDIO"], minHeightMm: 2200 },
  { id: "rings", label: "Rings", equipmentRoles: ["CALISTHENICS"], minHeightMm: 2500 },
  { id: "handstands", label: "Handstands", equipmentRoles: [], preferredSpaceMm2: 2_500_000 },
  { id: "muscle-ups", label: "Muscle-Ups", equipmentRoles: ["VERTICAL_PULL"], minHeightMm: 2600 },
  { id: "mobility", label: "Mobility", equipmentRoles: ["MOBILITY", "FLOORING"], preferredSpaceMm2: 2_000_000 },
];

export function exercisesForGoals(
  goals: string[],
): ExerciseId[] {
  const set = new Set<ExerciseId>();
  if (goals.some((g) => ["strength", "powerlifting", "bodybuilding", "mixed", "general-fitness"].includes(g))) {
    (["squat", "bench-press", "deadlift", "overhead-press", "rows", "dumbbell-work"] as ExerciseId[]).forEach((e) => set.add(e));
  }
  if (goals.includes("powerlifting")) {
    (["squat", "bench-press", "deadlift"] as ExerciseId[]).forEach((e) => set.add(e));
  }
  if (goals.includes("olympic-lifting") || goals.includes("olympic")) {
    set.add("olympic-lifts");
  }
  if (goals.includes("calisthenics")) {
    (["pull-ups", "dips", "rings", "handstands", "muscle-ups"] as ExerciseId[]).forEach((e) => set.add(e));
  }
  if (goals.includes("hyrox") || goals.includes("functional-fitness")) {
    (
      [
        "sled",
        "wall-balls",
        "burpees",
        "rowing",
        "dumbbell-work",
        "kettlebell-work",
        "skierg",
      ] as ExerciseId[]
    ).forEach((e) => set.add(e));
  }
  if (goals.includes("conditioning") || goals.includes("hyrox")) {
    (["rowing", "cycling", "skierg"] as ExerciseId[]).forEach((e) => set.add(e));
  }
  if (goals.includes("cardio") || goals.includes("conditioning")) {
    set.add("running");
  }
  return [...set];
}

export function evaluateExerciseCoverage(input: {
  exerciseIds: ExerciseId[];
  coveredRoles: Set<BuilderRoleId>;
  roomHeightMm: number;
  roomAreaMm2: number;
  openTrainingMm2: number;
  /** Longest room side — for sled runway realism */
  roomMaxSideMm?: number;
}): { id: ExerciseId; label: string; coverage: ExerciseCoverage; note?: string }[] {
  return input.exerciseIds.map((id) => {
    const req = EXERCISE_REQUIREMENTS.find((e) => e.id === id)!;
    const roleOk =
      req.equipmentRoles.length === 0 ||
      req.equipmentRoles.some((r) => input.coveredRoles.has(r));

    if (id === "sled") {
      const maxSide = input.roomMaxSideMm ?? Math.sqrt(input.roomAreaMm2);
      if (maxSide < 8000 || input.roomAreaMm2 < 20_000_000) {
        return {
          id,
          label: req.label,
          coverage: "not-supported" as const,
          note: "Insufficient runway for a meaningful sled push indoors.",
        };
      }
    }

    if (!roleOk) {
      return {
        id,
        label: req.label,
        coverage: "not-supported" as const,
        note: "Required equipment role not in this build.",
      };
    }

    if (req.minHeightMm && input.roomHeightMm < req.minHeightMm) {
      return {
        id,
        label: req.label,
        coverage: "partial" as const,
        note: `Limited — ceiling ${Math.round(input.roomHeightMm / 10) / 100} m below comfortable ${req.minHeightMm / 1000} m.`,
      };
    }

    if (
      req.preferredSpaceMm2 &&
      input.openTrainingMm2 < req.preferredSpaceMm2 * 0.5
    ) {
      return {
        id,
        label: req.label,
        coverage: "partial" as const,
        note: "Limited open training space.",
      };
    }

    return { id, label: req.label, coverage: "supported" as const };
  });
}
