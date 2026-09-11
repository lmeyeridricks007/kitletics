import { ROLE_BY_ID, type RotationRoleId } from "@/domain/shoe-rotation/roles";
import type {
  ProductRoleProfile,
  RotationOverlap,
  RotationProfile,
} from "@/domain/shoe-rotation/types";

function roleSimilarity(a: RotationRoleId, b: RotationRoleId): number {
  if (a === b) return 1;
  const ra = ROLE_BY_ID[a];
  if (ra.relatedRoleIds.includes(b)) return 0.55;
  return 0;
}

/**
 * Overlap from role suitability similarity — not raw specs.
 * High-mileage / multiple daily trainers can make overlap "useful".
 */
export function detectOverlaps(
  profiles: ProductRoleProfile[],
  profile: RotationProfile,
  requiredRoles: RotationRoleId[],
): RotationOverlap[] {
  const overlaps: RotationOverlap[] = [];
  const catalog = profiles.filter((p) => p.kind === "catalog");

  for (let i = 0; i < catalog.length; i++) {
    for (let j = i + 1; j < catalog.length; j++) {
      const a = catalog[i];
      const b = catalog[j];
      const overlappingRoles: RotationRoleId[] = [];
      let similaritySum = 0;
      let count = 0;

      for (const roleId of requiredRoles) {
        const sa = a.byRole[roleId]?.score ?? 0;
        const sb = b.byRole[roleId]?.score ?? 0;
        if (sa >= 80 && sb >= 80) {
          overlappingRoles.push(roleId);
          similaritySum += 1;
          count++;
        } else if (sa >= 75 && sb >= 75) {
          const sim = roleSimilarity(roleId, roleId);
          similaritySum += sim * 0.7;
          count++;
          if (!overlappingRoles.includes(roleId)) overlappingRoles.push(roleId);
        }
      }

      if (overlappingRoles.length < 2 && similaritySum < 1.2) continue;

      const overlapScore = count > 0 ? similaritySum / Math.max(count, 1) : 0;
      const highVolume =
        profile.weeklyFrequency === "5" ||
        profile.weeklyFrequency === "6+" ||
        profile.weeklyDistance === "60-80" ||
        profile.weeklyDistance === "80-plus";

      const mostlyDailyLong = overlappingRoles.every((r) =>
        ["daily", "easy-recovery", "long-run"].includes(r),
      );
      const useful = highVolume && mostlyDailyLong;

      overlaps.push({
        productIds: [a.productId, b.productId],
        overlappingRoles,
        overlapScore,
        useful,
        explanation: useful
          ? "These shoes cover similar training roles. That can still make sense if you rotate daily trainers or run higher weekly mileage."
          : "These shoes cover very similar roles, so together they add less new coverage than a complementary specialist would.",
      });
    }
  }

  return overlaps.sort((a, b) => b.overlapScore - a.overlapScore);
}

/**
 * Overlap penalty for a set — rewards complementarity.
 * Related-role pairs are discounted vs identical strong roles.
 */
export function overlapPenaltyForSet(
  profiles: ProductRoleProfile[],
  requiredRoles: RotationRoleId[],
  profile: RotationProfile,
): number {
  const overlaps = detectOverlaps(profiles, profile, requiredRoles);
  if (overlaps.length === 0) return 0;

  let penalty = 0;
  for (const o of overlaps) {
    if (o.useful) {
      penalty += 2;
    } else {
      penalty += 8 + o.overlappingRoles.length * 3;
    }
  }
  return Math.min(35, penalty);
}
