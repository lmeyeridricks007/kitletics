import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import {
  ROTATION_ROLES,
  ROLE_BY_ID,
  type RotationRoleId,
} from "@/domain/shoe-rotation/roles";
import type {
  ManualOwnedShoe,
  ProductRoleProfile,
  RoleSuitability,
  RotationProfile,
} from "@/domain/shoe-rotation/types";

function maxRecScore(
  productId: string,
  useCaseIds: string[],
  recommendations: Recommendation[],
): { score: number; useCaseId?: string } | undefined {
  let best: { score: number; useCaseId: string } | undefined;
  for (const uc of useCaseIds) {
    const rec = recommendations.find(
      (r) => r.productId === productId && r.useCaseId === uc,
    );
    if (rec && (!best || rec.score > best.score)) {
      best = { score: rec.score, useCaseId: uc };
    }
  }
  return best;
}

/**
 * Role suitability for a catalog product from Recommendation contexts.
 * Unknown → neutral-ish inferred score, never automatic 0.
 */
export function productRoleSuitability(
  product: Product,
  roleId: RotationRoleId,
  recommendations: Recommendation[],
  raceDistances?: string[],
): RoleSuitability {
  const role = ROLE_BY_ID[roleId];
  let useCaseIds = role.useCaseIds;

  // Narrow race suitability to selected race distances when available
  if (roleId === "race" && raceDistances && raceDistances.length > 0) {
    const map: Record<string, string> = {
      "5k": "uc-5k",
      "10k": "uc-10k",
      half: "uc-half",
      marathon: "uc-marathon",
      ultra: "uc-ultra",
    };
    const narrowed = raceDistances.map((d) => map[d]).filter(Boolean);
    if (narrowed.length) useCaseIds = narrowed;
  }

  const fromRec = maxRecScore(product.id, useCaseIds, recommendations);
  if (fromRec) {
    return {
      roleId,
      score: fromRec.score,
      confidence: "recommendation",
      useCaseId: fromRec.useCaseId,
    };
  }

  // Soft inference from product.useCaseIds membership
  const overlap = useCaseIds.filter((id) => product.useCaseIds.includes(id));
  if (overlap.length > 0) {
    return {
      roleId,
      score: 72,
      confidence: "inferred",
      useCaseId: overlap[0],
    };
  }

  // Terrain hard signal for trail
  if (roleId === "trail") {
    const terrains = product.specifications.terrain;
    const list = Array.isArray(terrains) ? terrains.map(String) : terrains ? [String(terrains)] : [];
    if (list.includes("trail") || list.includes("mixed")) {
      return { roleId, score: 75, confidence: "inferred" };
    }
    if (list.length > 0 && list.every((t) => t === "road" || t === "treadmill")) {
      return { roleId, score: 25, confidence: "inferred" };
    }
  }

  return { roleId, score: 55, confidence: "unknown" };
}

export function buildProductRoleProfile(
  product: Product,
  recommendations: Recommendation[],
  profile: RotationProfile,
  roleOverride?: RotationRoleId[],
): ProductRoleProfile {
  const roles: RoleSuitability[] = ROTATION_ROLES.map((r) =>
    productRoleSuitability(
      product,
      r.id,
      recommendations,
      profile.raceDistances,
    ),
  );

  // Session override: boost declared roles, soft-downplay others for coverage analysis
  if (roleOverride && roleOverride.length > 0) {
    for (const rs of roles) {
      if (roleOverride.includes(rs.roleId)) {
        rs.score = Math.max(rs.score, 88);
        rs.confidence = "manual";
      }
    }
  }

  const byRole: ProductRoleProfile["byRole"] = {};
  for (const rs of roles) byRole[rs.roleId] = rs;

  const relevant = profile.requiredRoles.length
    ? roles.filter((r) => profile.requiredRoles.includes(r.roleId))
    : roles;
  const known = relevant.filter(
    (r) => r.confidence === "recommendation" || r.confidence === "inferred",
  ).length;
  const dataCoverage = relevant.length ? known / relevant.length : 0;

  return {
    productId: product.id,
    kind: "catalog",
    roles,
    byRole,
    dataCoverage,
  };
}

export function buildManualRoleProfile(
  shoe: ManualOwnedShoe,
): ProductRoleProfile {
  const roles: RoleSuitability[] = ROTATION_ROLES.map((r) => ({
    roleId: r.id,
    score: shoe.roleIds.includes(r.id) ? 85 : 40,
    confidence: "manual" as const,
  }));
  const byRole: ProductRoleProfile["byRole"] = {};
  for (const rs of roles) byRole[rs.roleId] = rs;
  return {
    productId: shoe.id,
    kind: "manual",
    label: shoe.label,
    roles,
    byRole,
    dataCoverage: 1,
  };
}

export function primaryAndSecondaryRoles(
  profile: ProductRoleProfile,
  requiredRoles: RotationRoleId[],
): { primary: RotationRoleId[]; secondary: RotationRoleId[] } {
  const scored = requiredRoles
    .map((id) => ({ id, score: profile.byRole[id]?.score ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const primary = scored.filter((s) => s.score >= 80).slice(0, 2).map((s) => s.id);
  if (primary.length === 0 && scored[0]) primary.push(scored[0].id);

  const secondary = scored
    .filter((s) => !primary.includes(s.id) && s.score >= 70)
    .slice(0, 3)
    .map((s) => s.id);

  return { primary, secondary };
}
