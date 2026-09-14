import type {
  FinderDefinition,
  FinderNormalizedProfile,
  FinderQuestion,
  FinderResponses,
  FinderResponseValue,
  FinderShowWhen,
} from "@/domain/finders/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";

function matchesShowWhen(
  when: FinderShowWhen,
  responses: FinderResponses,
): boolean {
  const raw = responses[when.key];
  if (raw === undefined || raw === null) return false;
  if (when.equals !== undefined) {
    if (Array.isArray(raw)) return raw.includes(when.equals);
    return String(raw) === when.equals;
  }
  if (when.anyOf) {
    if (Array.isArray(raw)) {
      return when.anyOf.some((v) => raw.includes(v));
    }
    return when.anyOf.includes(String(raw));
  }
  return true;
}

export function isQuestionVisible(
  question: FinderQuestion,
  responses: FinderResponses,
): boolean {
  if (!question.showWhen) return true;
  return matchesShowWhen(question.showWhen, responses);
}

export function getVisibleQuestions(
  definition: FinderDefinition,
  responses: FinderResponses,
): FinderQuestion[] {
  return definition.questions.filter((q) => isQuestionVisible(q, responses));
}

function asStringArray(value: FinderResponseValue): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "object" && "value" in value) return [];
  return [String(value)];
}

function toKg(value: number, unit: string): number {
  if (unit === "lb" || unit === "lbs") return value * 0.45359237;
  return value;
}

/**
 * Normalize display answers into canonical AthleteProfile-like structure.
 * Exact body weight stays session-only (not for share URLs).
 */
export function normalizeFinderResponses(
  definition: FinderDefinition,
  responses: FinderResponses,
  region: RegionCode = DEFAULT_REGION,
): FinderNormalizedProfile {
  const terrain = responses.terrain
    ? String(responses.terrain)
    : undefined;
  const primaryUses = asStringArray(responses.primaryUse);
  const distances = asStringArray(responses.distances);
  const raceDistance = responses.raceDistance
    ? String(responses.raceDistance)
    : undefined;
  const cushioning = responses.cushioning
    ? String(responses.cushioning)
    : undefined;
  const stability = responses.stability
    ? String(responses.stability)
    : undefined;
  const width = responses.width ? String(responses.width) : undefined;
  const sizingRange = responses.sizingRange
    ? String(responses.sizingRange)
    : undefined;
  const experience = responses.experience
    ? (String(responses.experience) as FinderNormalizedProfile["experienceLevel"])
    : undefined;
  const priorities = asStringArray(responses[definition.priorityKey]).slice(
    0,
    3,
  );
  const priorityList = [...priorities];

  // Expand single primary priority into scoring priorities
  if (priorityList.includes("balanced")) {
    priorityList.push("control", "power");
  }
  if (priorityList.includes("comfort")) {
    priorityList.push("forgiveness");
  }
  if (priorityList.includes("maneuverability")) {
    priorityList.push("forgiveness");
  }
  // Beginners: always keep forgiveness on the table unless they chose pure power
  if (
    (primaryUses.includes("beginner") || experience === "beginner") &&
    !priorityList.includes("power")
  ) {
    priorityList.push("forgiveness", "comfort");
  }

  let weightKg: number | undefined;
  const weightRaw = responses.weight;
  if (
    weightRaw &&
    typeof weightRaw === "object" &&
    "value" in weightRaw &&
    typeof weightRaw.value === "number"
  ) {
    weightKg = toKg(weightRaw.value, weightRaw.unit);
  }

  const budgetBandId = responses[definition.budgetKey]
    ? String(responses[definition.budgetKey])
    : undefined;
  const budgetConfig =
    definition.regionalBudgets.find((b) => b.region === region) ??
    definition.regionalBudgets[0];
  const band = budgetConfig?.bands.find((b) => b.id === budgetBandId);

  const ceilingRaw = responses.ceilingHeightCm;
  const ceilingHeightCm =
    typeof ceilingRaw === "number"
      ? ceilingRaw
      : typeof ceilingRaw === "object" &&
          ceilingRaw &&
          "value" in ceilingRaw
        ? Number((ceilingRaw as { value: number }).value)
        : undefined;

  // Racket Match: experience often answered via primaryUse
  const experienceFromPrimary = primaryUses.find((u) =>
    ["beginner", "intermediate", "advanced", "competitive", "elite"].includes(u),
  ) as FinderNormalizedProfile["experienceLevel"] | undefined;

  const playingStyleRaw = responses.playingStyle
    ? String(responses.playingStyle)
    : experienceFromPrimary === "beginner" || primaryUses.includes("beginner")
      ? "figuring-out"
      : undefined;
  const playingStyle =
    playingStyleRaw === "defensive"
      ? "control"
      : playingStyleRaw === "all-round"
        ? "balanced"
        : playingStyleRaw === "aggressive"
          ? "aggressive"
          : playingStyleRaw === "dont-know"
            ? "figuring-out"
            : playingStyleRaw;
  const weightPreferenceRaw = responses.weightPreference
    ? String(responses.weightPreference)
    : undefined;
  const weightPreference =
    weightPreferenceRaw === "dont-know" || weightPreferenceRaw === "any"
      ? undefined
      : weightPreferenceRaw;
  const balancePreferenceRaw = responses.balancePreference
    ? String(responses.balancePreference)
    : undefined;
  const balancePreference =
    balancePreferenceRaw === "dont-know" || balancePreferenceRaw === "any"
      ? undefined
      : balancePreferenceRaw;
  const feelPreferenceRaw = responses.feelPreference
    ? String(responses.feelPreference)
    : undefined;
  const feelPreference =
    feelPreferenceRaw === "dont-know" || feelPreferenceRaw === "any"
      ? undefined
      : feelPreferenceRaw;
  const currentEquipmentId = responses.currentEquipmentId
    ? String(responses.currentEquipmentId)
    : undefined;
  const changeGoals = asStringArray(responses.changeGoals);
  for (const g of changeGoals) {
    if (g === "more-control") priorityList.push("control");
    if (g === "more-power") priorityList.push("power");
    if (g === "lighter" || g === "more-forgiving") {
      priorityList.push("maneuverability");
      priorityList.push("forgiveness");
    }
    if (g === "softer-feel") {
      priorityList.push("comfort");
      priorityList.push("forgiveness");
    }
    if (g === "more-spin") priorityList.push("spin");
  }
  const armComfortRaw = responses.armComfortPriority;
  const armComfortPriority =
    armComfortRaw === undefined || armComfortRaw === null
      ? undefined
      : String(armComfortRaw) === "yes" || armComfortRaw === true;
  if (armComfortPriority) {
    priorityList.push("comfort", "forgiveness");
  }
  const courtPositionRaw = responses.courtPosition
    ? String(responses.courtPosition)
    : undefined;
  const courtPosition =
    courtPositionRaw === "dont-know" ? undefined : courtPositionRaw;
  // Soft position bias — never a hard filter
  if (courtPosition === "left" && !priorityList.includes("power")) {
    priorityList.push("power");
  }
  if (courtPosition === "right" && !priorityList.includes("control")) {
    priorityList.push("control");
  }
  const uniquePriorities = [...new Set(priorityList)]
    .filter((p) => p !== "balanced")
    .slice(0, 4);

  const needsMapsRaw = responses.needsMaps;
  const needsMaps =
    needsMapsRaw === undefined || needsMapsRaw === null
      ? undefined
      : String(needsMapsRaw) === "yes" || needsMapsRaw === true;

  const formFactor = responses.formFactor
    ? String(responses.formFactor)
    : undefined;
  const needsDynamicsRaw = responses.needsDynamics;
  const needsDynamics =
    needsDynamicsRaw === undefined || needsDynamicsRaw === null
      ? undefined
      : String(needsDynamicsRaw) === "yes" || needsDynamicsRaw === true;

  return {
    sportIds: [definition.sportId],
    categoryId: definition.categoryId,
    categoryIds: definition.categoryIds ?? [definition.categoryId],
    terrain,
    primaryUses,
    distances,
    raceDistance,
    cushioning,
    stability,
    width,
    sizingRange,
    experienceLevel: experience ?? experienceFromPrimary,
    weightKg,
    priorities: uniquePriorities,
    budgetBandId,
    budgetMin: band?.min,
    budgetMax: band?.max,
    budgetCurrency: band?.currency ?? budgetConfig?.currency,
    region,
    ceilingHeightCm:
      ceilingHeightCm !== undefined && !Number.isNaN(ceilingHeightCm)
        ? ceilingHeightCm
        : undefined,
    needsMaps,
    formFactor,
    needsDynamics,
    playingStyle,
    weightPreference,
    balancePreference,
    feelPreference,
    currentEquipmentId,
    changeGoals: changeGoals.length > 0 ? changeGoals : undefined,
    courtPosition,
    armComfortPriority,
  };
}

export function validateResponses(
  definition: FinderDefinition,
  responses: FinderResponses,
): { ok: boolean; missingKeys: string[] } {
  const visible = getVisibleQuestions(definition, responses);
  const missingKeys: string[] = [];
  for (const q of visible) {
    if (!q.required) continue;
    const v = responses[q.key];
    if (v === undefined || v === null || v === "") {
      missingKeys.push(q.key);
      continue;
    }
    if (Array.isArray(v) && v.length === 0) missingKeys.push(q.key);
  }
  return { ok: missingKeys.length === 0, missingKeys };
}
