import type { SpecValue } from "@/domain/products/types";
import type { ProductResearchConfig } from "@/domain/onboarding/types";

/** Convert common weight units to grams */
export function normalizeWeightToGrams(
  value: number,
  unit?: string,
): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  const u = (unit ?? "g").toLowerCase();
  if (u === "g" || u === "gram" || u === "grams") return value;
  if (u === "oz" || u === "ounce" || u === "ounces") {
    return Math.round(value * 28.3495);
  }
  if (u === "kg") return Math.round(value * 1000);
  return undefined;
}

export function normalizeLengthToMm(
  value: number,
  unit?: string,
): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  const u = (unit ?? "mm").toLowerCase();
  if (u === "mm") return value;
  if (u === "cm") return value * 10;
  if (u === "m" || u === "metre" || u === "meter") return value * 1000;
  if (u === "in" || u === "inch" || u === "inches") {
    return Math.round(value * 25.4 * 10) / 10;
  }
  return undefined;
}

const CUSHION_MAP: Record<string, string> = {
  maximum: "maximum",
  max: "maximum",
  "highly cushioned": "maximum",
  "maximum cushioning": "maximum",
  high: "high",
  cushioned: "high",
  medium: "moderate",
  moderate: "moderate",
  firm: "firm",
  low: "low",
  minimal: "minimal",
};

export function normalizeCushionLevel(raw: string): string | undefined {
  const key = raw.trim().toLowerCase();
  return CUSHION_MAP[key];
}

/**
 * Normalize a research raw value into SpecValue for a known field.
 * Returns undefined if cannot safely normalize — leave unknown.
 */
export function normalizeFindingValue(
  field: string,
  rawValue: string | number | boolean | null,
  unit?: string,
): SpecValue | undefined {
  if (rawValue === null || rawValue === undefined) return null;

  if (field === "weight" && typeof rawValue === "number") {
    return normalizeWeightToGrams(rawValue, unit) ?? undefined;
  }
  if (
    (field === "heelStack" ||
      field === "forefootStack" ||
      field === "drop" ||
      field === "lugDepth") &&
    typeof rawValue === "number"
  ) {
    return normalizeLengthToMm(rawValue, unit ?? "mm") ?? undefined;
  }
  if (field === "cushionLevel" && typeof rawValue === "string") {
    return normalizeCushionLevel(rawValue);
  }
  if (typeof rawValue === "boolean" || typeof rawValue === "number") {
    return rawValue;
  }
  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed) return undefined;
    // Do not coerce "unknown"/"n/a" to 0/false
    if (/^(unknown|n\/a|na|not available|-)$/i.test(trimmed)) return null;
    return trimmed;
  }
  return undefined;
}

export function detectSpecOutlier(
  field: string,
  value: SpecValue,
  config: ProductResearchConfig,
): string | undefined {
  if (typeof value !== "number") return undefined;
  const bounds = config.outlierBounds?.[field];
  if (!bounds) return undefined;
  if (bounds.min != null && value < bounds.min) {
    return `${field}=${value} below expected min ${bounds.min}`;
  }
  if (bounds.max != null && value > bounds.max) {
    return `${field}=${value} above expected max ${bounds.max}`;
  }
  return undefined;
}

/** Never invent derived stack from drop alone */
export function rejectUnsafeDerivation(
  field: string,
  method: string,
): boolean {
  if (
    (field === "forefootStack" || field === "heelStack") &&
    method.includes("derived-from-drop")
  ) {
    return true;
  }
  return false;
}
