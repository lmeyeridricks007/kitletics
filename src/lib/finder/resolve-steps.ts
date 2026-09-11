import type { FinderDefinition, FinderQuestion, FinderResponses } from "@/domain/finders/types";
import { getVisibleQuestions } from "@/domain/finders/normalization";
import type {
  FinderUiConfig,
  FinderUiStep,
} from "@/lib/finder/finder-ui-config";

export interface ResolvedFinderStep {
  id: string;
  title: string;
  shortTitle: string;
  questions: FinderQuestion[];
  /** True for the terminal results/review step */
  isResults: boolean;
}

export function resolveFinderSteps(
  definition: FinderDefinition,
  responses: FinderResponses,
  ui: FinderUiConfig,
): ResolvedFinderStep[] {
  const config = ui;
  const visible = getVisibleQuestions(definition, responses);

  if (!config.steps.length) {
    const questionSteps = visible.map((q) => ({
      id: q.id,
      title: q.title,
      shortTitle: q.title.split(" ").slice(0, 3).join(" "),
      questions: [q],
      isResults: false,
    }));
    return [
      ...questionSteps,
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questions: [],
        isResults: true,
      },
    ];
  }

  const byKey = new Map(visible.map((q) => [q.key, q]));
  const steps: ResolvedFinderStep[] = [];

  for (const step of config.steps) {
    if (step.id === "results" || step.questionKeys.length === 0) {
      steps.push({
        id: step.id,
        title: step.title,
        shortTitle: step.shortTitle,
        questions: [],
        isResults: true,
      });
      continue;
    }
    const questions = step.questionKeys
      .map((k) => byKey.get(k))
      .filter((q): q is FinderQuestion => Boolean(q));
    if (questions.length === 0) continue;
    steps.push({
      id: step.id,
      title: step.title,
      shortTitle: step.shortTitle,
      questions,
      isResults: false,
    });
  }

  // Append any visible questions not covered by config (safety)
  const covered = new Set(steps.flatMap((s) => s.questions.map((q) => q.key)));
  for (const q of visible) {
    if (covered.has(q.key)) continue;
    steps.splice(Math.max(0, steps.length - 1), 0, {
      id: q.id,
      title: q.title,
      shortTitle: q.title.split(" ").slice(0, 3).join(" "),
      questions: [q],
      isResults: false,
    });
  }

  if (!steps.some((s) => s.isResults)) {
    steps.push({
      id: "results",
      title: "Results",
      shortTitle: "Results",
      questions: [],
      isResults: true,
    });
  }

  return steps;
}

export function hasAnswer(
  value: FinderResponses[string] | undefined,
): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export function stepIsComplete(
  step: ResolvedFinderStep,
  responses: FinderResponses,
): boolean {
  if (step.isResults) return false;
  for (const q of step.questions) {
    if (!q.required) continue;
    if (!hasAnswer(responses[q.key])) return false;
  }
  return step.questions.every(
    (q) => !q.required || hasAnswer(responses[q.key]),
  );
}

export function formatResponseLabel(
  definition: FinderDefinition,
  key: string,
  responses: FinderResponses,
): string | undefined {
  const value = responses[key];
  if (!hasAnswer(value)) return undefined;
  const question = definition.questions.find((q) => q.key === key);
  if (!question) return String(value);

  if (Array.isArray(value)) {
    return value
      .map(
        (v) =>
          question.options?.find((o) => o.value === v)?.label ?? String(v),
      )
      .join(", ");
  }
  if (typeof value === "object" && value && "value" in value) {
    return `${value.value} ${value.unit}`;
  }
  return (
    question.options?.find((o) => o.value === String(value))?.label ??
    String(value)
  );
}

export function autoStepsFromConfig(
  configSteps: FinderUiStep[],
): FinderUiStep[] {
  return configSteps;
}
