import {
  coverageStatus,
  type RotationRoleId,
} from "@/domain/shoe-rotation/roles";
import type {
  ProductRoleProfile,
  RoleCoverageEntry,
  RotationGap,
  RotationProfile,
} from "@/domain/shoe-rotation/types";

/**
 * Role coverage = max suitability in the set (does not sum duplicates).
 * Optional small second-best bonus for high-volume resilience.
 */
export function computeRoleCoverage(
  profiles: ProductRoleProfile[],
  profile: RotationProfile,
): RoleCoverageEntry[] {
  return profile.requiredRoles.map((roleId) => {
    const coveredBy = profiles
      .map((p) => ({
        productId: p.productId,
        suitability: p.byRole[roleId]?.score ?? 0,
        label: p.label,
      }))
      .filter((c) => c.suitability > 0)
      .sort((a, b) => b.suitability - a.suitability);

    const bestCoverage = coveredBy[0]?.suitability ?? 0;
    const secondBest = coveredBy[1]?.suitability;

    return {
      roleId,
      required: true,
      importance: profile.roleWeights[roleId] ?? 1,
      coveredBy,
      bestCoverage,
      secondBest,
      status: coverageStatus(bestCoverage),
    };
  });
}

export function detectGaps(coverage: RoleCoverageEntry[]): RotationGap[] {
  return coverage
    .filter((c) => c.status === "gap" || c.status === "weak")
    .map((c) => ({
      roleId: c.roleId,
      bestCoverage: c.bestCoverage,
      explanation:
        c.status === "gap"
          ? `None of your current shoes is a strong match for ${c.roleId.replace(/-/g, " ")}.`
          : `Coverage for ${c.roleId.replace(/-/g, " ")} is only weak (${Math.round(c.bestCoverage)}).`,
    }));
}

/**
 * Weighted coverage score 0–100 using best suitability per role.
 * Second-best contributes a small resilience bonus.
 */
export function weightedCoverageScore(
  coverage: RoleCoverageEntry[],
): number {
  if (coverage.length === 0) return 0;
  let sum = 0;
  let weightSum = 0;
  for (const c of coverage) {
    const w = c.importance;
    let score = c.bestCoverage;
    if (c.secondBest !== undefined && c.secondBest >= 80) {
      score = Math.min(100, score + 3);
    }
    sum += score * w;
    weightSum += w;
  }
  return weightSum > 0 ? sum / weightSum : 0;
}

export function rolesGainedByAdding(
  before: RoleCoverageEntry[],
  after: RoleCoverageEntry[],
): RotationRoleId[] {
  const gained: RotationRoleId[] = [];
  for (const a of after) {
    const b = before.find((x) => x.roleId === a.roleId);
    const beforeBest = b?.bestCoverage ?? 0;
    if (a.bestCoverage - beforeBest >= 8 && a.bestCoverage >= 80) {
      gained.push(a.roleId);
    } else if (
      (b?.status === "gap" || b?.status === "weak") &&
      (a.status === "strong" || a.status === "covered")
    ) {
      gained.push(a.roleId);
    }
  }
  return gained;
}
