import type { CalculatorDefinition } from "@/domain/calculators/types";
import {
  paceCalculatorDefinition,
  racePredictorDefinition,
} from "@/domain/calculators/definitions";

const BY_SLUG: Record<string, CalculatorDefinition> = {
  [paceCalculatorDefinition.slug]: paceCalculatorDefinition,
  [racePredictorDefinition.slug]: racePredictorDefinition,
};

export function getCalculatorDefinition(
  slug: string,
): CalculatorDefinition | undefined {
  return BY_SLUG[slug];
}

export function getAllCalculatorDefinitions(): CalculatorDefinition[] {
  return Object.values(BY_SLUG);
}

export function getCalculatorDefinitionByToolId(
  toolId: string,
): CalculatorDefinition | undefined {
  return getAllCalculatorDefinitions().find((d) => d.toolId === toolId);
}
