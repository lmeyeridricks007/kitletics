export type {
  CompatibilityStatus,
  CompatibilityType,
  ProductCompatibility,
} from "@/domain/compatibility/types";

import type { ProductCompatibility } from "@/domain/compatibility/types";
import { fitnessCompatibilities } from "@/content/fitness/compatibility";

const ALL: ProductCompatibility[] = [...fitnessCompatibilities];

export function getAllCompatibilities(): ProductCompatibility[] {
  return ALL;
}

export function getCompatibilitiesForProduct(
  productId: string,
): ProductCompatibility[] {
  return ALL.filter(
    (c) =>
      c.sourceProductId === productId || c.targetProductId === productId,
  );
}

export function areEcosystemsCompatible(
  sourceProductId: string,
  targetProductId: string,
): boolean | "unknown" {
  const links = ALL.filter(
    (c) =>
      c.compatibilityType === "ecosystem-compatible" ||
      c.compatibilityType === "compatible-with" ||
      c.compatibilityType === "incompatible-with",
  );
  const direct = links.find(
    (c) =>
      (c.sourceProductId === sourceProductId &&
        c.targetProductId === targetProductId) ||
      (c.sourceProductId === targetProductId &&
        c.targetProductId === sourceProductId),
  );
  if (!direct) return "unknown";
  if (direct.compatibilityType === "incompatible-with") return false;
  return true;
}

/** Hard incompatibility — Builder must not pair these. */
export function hasHardIncompatibility(
  sourceProductId: string,
  targetProductId: string,
): boolean {
  return ALL.some(
    (c) =>
      c.compatibilityType === "incompatible-with" &&
      ((c.sourceProductId === sourceProductId &&
        c.targetProductId === targetProductId) ||
        (c.sourceProductId === targetProductId &&
          c.targetProductId === sourceProductId)),
  );
}
