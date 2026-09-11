/**
 * Shoe rotation set optimizer.
 *
 * Flow:
 * 1. Build role profiles for products
 * 2. Existing coverage / gaps / overlaps
 * 3. Candidate pruning (top N per role)
 * 4. Evaluate combinations within pool
 * 5. Incremental additions for improve mode
 *
 * AFFILIATE NEUTRALITY: commission never enters scoring.
 */

import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import {
  ACCEPTABLE_COVERAGE_THRESHOLD,
  AFFILIATE_NEUTRALITY,
  MAX_COMBINATION_POOL,
  ROLE_BY_ID,
  ROTATION_PLANNER_VERSION,
  TOP_CANDIDATES_PER_ROLE,
} from "@/domain/shoe-rotation/roles";
import {
  computeRoleCoverage,
  detectGaps,
  rolesGainedByAdding,
  weightedCoverageScore,
} from "@/domain/shoe-rotation/coverage";
import {
  detectOverlaps,
  overlapPenaltyForSet,
} from "@/domain/shoe-rotation/overlap";
import {
  buildManualRoleProfile,
  buildProductRoleProfile,
  primaryAndSecondaryRoles,
} from "@/domain/shoe-rotation/suitability";
import type {
  ProductRoleProfile,
  RotationAddition,
  RotationProfile,
  RotationResult,
  ScoredRotationSet,
} from "@/domain/shoe-rotation/types";

export { AFFILIATE_NEUTRALITY };

export interface RunRotationInput {
  profile: RotationProfile;
  products: Product[];
  recommendations: Recommendation[];
  /** productId → lowest regional price */
  lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  >;
}

function eligibleProduct(p: Product, categoryId = "cat-running-shoes"): boolean {
  if (p.status !== "published") return false;
  if (p.categoryId !== categoryId) return false;
  if (p.lifecycleStatus === "upcoming" || p.lifecycleStatus === "discontinued") {
    return false;
  }
  return true;
}

function scoreBudget(
  cost: number | undefined,
  missingPrices: number,
  profile: RotationProfile,
): number {
  if (!profile.budgetBandId || profile.budgetBandId === "no-limit") {
    return 80;
  }
  if (cost === undefined && missingPrices > 0) {
    return 55;
  }
  if (cost === undefined) return 55;

  const max = profile.budgetMax;
  const min = profile.budgetMin ?? 0;
  if (max === undefined) {
    return cost >= min ? 100 : 85;
  }
  if (cost >= min && cost <= max) return 100;
  if (cost < min) return 90;
  const over = (cost - max) / Math.max(max, 1);
  if (profile.strictBudget) return 0;
  if (over <= 0.15) return 70;
  if (over <= 0.4) return 45;
  return 25;
}

function estimateCost(
  productIds: string[],
  lowestByProduct: RunRotationInput["lowestByProduct"],
  currency?: string,
): { cost?: number; missing: number } {
  let sum = 0;
  let known = 0;
  let missing = 0;
  for (const id of productIds) {
    const offer = lowestByProduct[id];
    if (!offer) {
      missing++;
      continue;
    }
    if (currency && offer.currency !== currency) {
      missing++;
      continue;
    }
    sum += offer.price;
    known++;
  }
  if (known === 0) return { cost: undefined, missing };
  return { cost: sum, missing };
}

function evaluateSet(
  productIds: string[],
  profileMap: Map<string, ProductRoleProfile>,
  profile: RotationProfile,
  lowestByProduct: RunRotationInput["lowestByProduct"],
  /** IDs that count toward budget (additions only in improve mode) */
  budgetProductIds: string[],
): ScoredRotationSet {
  const profiles = productIds
    .map((id) => profileMap.get(id))
    .filter((p): p is ProductRoleProfile => Boolean(p));

  const roleCoverage = computeRoleCoverage(profiles, profile);
  const coverageScore = weightedCoverageScore(roleCoverage);
  const overlapPenalty = overlapPenaltyForSet(
    profiles,
    profile.requiredRoles,
    profile,
  );

  const { cost, missing } = estimateCost(
    budgetProductIds,
    lowestByProduct,
    profile.budgetCurrency,
  );
  const budgetScore = scoreBudget(cost, missing, profile);

  // Size penalty: prefer smaller when minimal/value, soft otherwise
  const size = productIds.length;
  let sizePenalty = 0;
  if (profile.preferMinimal) {
    sizePenalty = (size - 1) * 6;
  } else if (profile.preferValue) {
    sizePenalty = (size - 1) * 3;
  } else {
    sizePenalty = Math.max(0, size - 3) * 2;
  }

  let priorityScore = 0;
  if (profile.preferRace) {
    const race = roleCoverage.find((c) => c.roleId === "race");
    if (race && race.bestCoverage >= 85) priorityScore += 8;
  }
  if (profile.preferValue && budgetScore >= 90) priorityScore += 5;

  const totalScore =
    coverageScore -
    overlapPenalty +
    budgetScore * 0.15 +
    priorityScore -
    sizePenalty;

  return {
    productIds: [...productIds].sort(),
    coverageScore,
    overlapPenalty,
    budgetScore,
    sizePenalty,
    priorityScore,
    totalScore,
    roleCoverage,
    estimatedCost: cost,
    missingPriceCount: missing,
  };
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const result: T[][] = [];
  const helper = (start: number, path: T[]) => {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      helper(i + 1, path);
      path.pop();
    }
  };
  helper(0, []);
  return result;
}

function buildCandidatePool(
  profile: RotationProfile,
  profileMap: Map<string, ProductRoleProfile>,
  ownedIds: Set<string>,
): string[] {
  const pool = new Set<string>();
  for (const roleId of profile.requiredRoles) {
    const ranked = [...profileMap.values()]
      .filter((p) => p.kind === "catalog" && !ownedIds.has(p.productId))
      .filter((p) => p.dataCoverage >= 0.35)
      .map((p) => ({
        id: p.productId,
        score: p.byRole[roleId]?.score ?? 0,
      }))
      .filter((x) => x.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_CANDIDATES_PER_ROLE);
    for (const r of ranked) pool.add(r.id);
  }

  // Cap pool size deterministically
  const list = [...pool].sort();
  if (list.length <= MAX_COMBINATION_POOL) return list;

  // Keep highest average required-role score
  return list
    .map((id) => {
      const p = profileMap.get(id)!;
      const avg =
        profile.requiredRoles.reduce(
          (s, r) => s + (p.byRole[r]?.score ?? 0),
          0,
        ) / profile.requiredRoles.length;
      return { id, avg };
    })
    .sort((a, b) => b.avg - a.avg || a.id.localeCompare(b.id))
    .slice(0, MAX_COMBINATION_POOL)
    .map((x) => x.id)
    .sort();
}

function resolveTargetSizes(profile: RotationProfile): number[] {
  if (profile.desiredSize === "recommend") {
    return profile.preferMinimal ? [1, 2, 3] : [1, 2, 3, 4];
  }
  return [profile.desiredSize];
}

function resolveMaxAdditions(profile: RotationProfile): number {
  if (profile.maxAdditions === "recommend") {
    return profile.preferMinimal ? 1 : 2;
  }
  return profile.maxAdditions;
}

function sizeExplanation(
  size: number,
  coverage: number,
  profile: RotationProfile,
): string {
  if (size === 1) {
    return coverage >= ACCEPTABLE_COVERAGE_THRESHOLD * 100
      ? "A one-shoe setup covers your selected roles well enough. Extra pairs would add specialization, not necessity."
      : "A one-shoe rotation works for your training, but you'll compromise on some roles.";
  }
  if (profile.preferMinimal) {
    return `We recommend ${size} shoes — enough to cover your needs without unnecessary extras.`;
  }
  return `A ${size}-shoe rotation balances coverage across your selected training roles.`;
}

function findBestIncrementalAddition(
  baseIds: string[],
  candidates: string[],
  profileMap: Map<string, ProductRoleProfile>,
  profile: RotationProfile,
  lowestByProduct: RunRotationInput["lowestByProduct"],
): { productId: string; scored: ScoredRotationSet; before: number } | undefined {
  const baseProfiles = baseIds
    .map((id) => profileMap.get(id))
    .filter((p): p is ProductRoleProfile => Boolean(p));
  const beforeCoverage = weightedCoverageScore(
    computeRoleCoverage(baseProfiles, profile),
  );

  let best:
    | { productId: string; scored: ScoredRotationSet; before: number }
    | undefined;

  for (const cand of candidates) {
    if (baseIds.includes(cand)) continue;
    const nextIds = [...baseIds, cand];
    const scored = evaluateSet(
      nextIds,
      profileMap,
      profile,
      lowestByProduct,
      [cand],
    );
    if (profile.strictBudget && scored.budgetScore < 50) continue;

    if (
      !best ||
      scored.coverageScore - beforeCoverage >
        best.scored.coverageScore - best.before ||
      (Math.abs(
        scored.coverageScore -
          beforeCoverage -
          (best.scored.coverageScore - best.before),
      ) < 0.5 &&
        scored.totalScore > best.scored.totalScore)
    ) {
      // Prefer addition that improves coverage most, then total score
      const gain = scored.coverageScore - beforeCoverage;
      const bestGain = best
        ? best.scored.coverageScore - best.before
        : -Infinity;
      if (gain > bestGain + 0.25 || (Math.abs(gain - bestGain) <= 0.25 && (!best || scored.totalScore > best.scored.totalScore))) {
        best = { productId: cand, scored, before: beforeCoverage };
      }
    }
  }

  return best;
}

export function runRotationPlanner(input: RunRotationInput): RotationResult {
  const { profile, products, recommendations, lowestByProduct } = input;

  const eligible = products.filter((p) => eligibleProduct(p));
  const profileMap = new Map<string, ProductRoleProfile>();

  for (const p of eligible) {
    profileMap.set(
      p.id,
      buildProductRoleProfile(
        p,
        recommendations,
        profile,
        profile.roleOverrides[p.id],
      ),
    );
  }
  for (const m of profile.manualShoes) {
    profileMap.set(m.id, buildManualRoleProfile(m));
  }

  const ownedIds = [
    ...profile.ownedProductIds.filter((id) => profileMap.has(id)),
    ...profile.manualShoes.map((m) => m.id),
  ];

  const existingProfiles = ownedIds
    .map((id) => profileMap.get(id)!)
    .filter(Boolean);
  const existingCoverage = computeRoleCoverage(existingProfiles, profile);
  const gaps = detectGaps(existingCoverage);
  const overlaps = detectOverlaps(
    existingProfiles,
    profile,
    profile.requiredRoles,
  );

  const ownedSet = new Set(ownedIds);
  const candidates = buildCandidatePool(profile, profileMap, ownedSet);

  let primarySet: ScoredRotationSet;
  const additions: RotationAddition[] = [];
  let recommendedProductIds: string[] = [];
  let recommendedSize = 1;
  const alternatives: RotationResult["alternatives"] = [];

  if (profile.mode === "improve" && ownedIds.length > 0) {
    const maxAdd = resolveMaxAdditions(profile);
    const current = [...ownedIds.filter((id) => !id.startsWith("manual-"))];
    // Include manuals in coverage base but not as catalog recommendations
    const baseAll = [...ownedIds];

    for (let step = 0; step < maxAdd; step++) {
      const pick = findBestIncrementalAddition(
        baseAll,
        candidates,
        profileMap,
        profile,
        lowestByProduct,
      );
      if (!pick) break;
      const gain = pick.scored.coverageScore - pick.before;
      if (gain < 3 && step > 0) break;

      const beforeCov = computeRoleCoverage(
        baseAll.map((id) => profileMap.get(id)!).filter(Boolean),
        profile,
      );
      const afterCov = pick.scored.roleCoverage;
      const rolesAdded = rolesGainedByAdding(beforeCov, afterCov);
      const productProfile = profileMap.get(pick.productId)!;
      const { primary, secondary } = primaryAndSecondaryRoles(
        productProfile,
        profile.requiredRoles,
      );

      additions.push({
        productId: pick.productId,
        rank: step + 1,
        coverageBefore: pick.before,
        coverageAfter: pick.scored.coverageScore,
        rolesAdded,
        strengths: [
          ...rolesAdded.map(
            (r) => `Adds ${ROLE_BY_ID[r].label} coverage`,
          ),
          secondary.length
            ? `Also strong for ${secondary.map((r) => ROLE_BY_ID[r].label).join(", ")}`
            : `Primary role: ${primary.map((r) => ROLE_BY_ID[r].label).join(" + ")}`,
        ].filter(Boolean),
        compromises: productProfile.roles
          .filter(
            (r) =>
              profile.requiredRoles.includes(r.roleId) && r.score < 65,
          )
          .slice(0, 2)
          .map(
            (r) =>
              `Less suitable for ${ROLE_BY_ID[r.roleId].label.toLowerCase()}`,
          ),
        overlapNote:
          pick.scored.overlapPenalty <= 8
            ? "Low overlap with your current shoes"
            : "Some role overlap remains with your current shoes",
      });

      baseAll.push(pick.productId);
      current.push(pick.productId);
    }

    recommendedProductIds = current;
    recommendedSize = current.length;
    primarySet = evaluateSet(
      baseAll.filter((id) => profileMap.get(id)?.kind === "catalog"),
      profileMap,
      profile,
      lowestByProduct,
      additions.map((a) => a.productId),
    );
    // Re-attach full role coverage including manuals
    primarySet.roleCoverage = computeRoleCoverage(
      baseAll.map((id) => profileMap.get(id)!).filter(Boolean),
      profile,
    );
    primarySet.coverageScore = weightedCoverageScore(primarySet.roleCoverage);
  } else {
    // From scratch
    const sizes = resolveTargetSizes(profile);
    const pool = candidates.length > 0 ? candidates : [...profileMap.keys()].filter(
      (id) => profileMap.get(id)?.kind === "catalog",
    );

    let best: ScoredRotationSet | undefined;
    const scoredBySize: ScoredRotationSet[] = [];

    for (const size of sizes) {
      if (pool.length < size) continue;
      const combos = combinations(pool, size);
      for (const combo of combos) {
        const scored = evaluateSet(
          combo,
          profileMap,
          profile,
          lowestByProduct,
          combo,
        );
        if (profile.strictBudget && scored.budgetScore < 50) continue;
        scoredBySize.push(scored);
        if (!best || scored.totalScore > best.totalScore) {
          best = scored;
        }
      }
    }

    // Prefer minimal size that meets coverage threshold when recommend + minimal
    if (profile.desiredSize === "recommend" && profile.preferMinimal) {
      const acceptable = scoredBySize
        .filter(
          (s) =>
            s.coverageScore >= ACCEPTABLE_COVERAGE_THRESHOLD * 100,
        )
        .sort(
          (a, b) =>
            a.productIds.length - b.productIds.length ||
            b.totalScore - a.totalScore,
        );
      if (acceptable[0]) best = acceptable[0];
    }

    if (!best) {
      // Fallback: best single product by coverage
      let fallback: ScoredRotationSet | undefined;
      for (const id of pool) {
        const scored = evaluateSet(
          [id],
          profileMap,
          profile,
          lowestByProduct,
          [id],
        );
        if (!fallback || scored.totalScore > fallback.totalScore) {
          fallback = scored;
        }
      }
      best = fallback ?? {
        productIds: [],
        coverageScore: 0,
        overlapPenalty: 0,
        budgetScore: 55,
        sizePenalty: 0,
        priorityScore: 0,
        totalScore: 0,
        roleCoverage: computeRoleCoverage([], profile),
        missingPriceCount: 0,
      };
    }

    primarySet = best;
    recommendedProductIds = best.productIds;
    recommendedSize = best.productIds.length;

    // Alternatives: lower cost / more performance
    const sameSize = scoredBySize
      .filter((s) => s.productIds.length === recommendedSize)
      .filter(
        (s) =>
          s.productIds.join() !== primarySet.productIds.join(),
      )
      .sort((a, b) => b.totalScore - a.totalScore);

    const cheaper = sameSize
      .filter(
        (s) =>
          s.estimatedCost !== undefined &&
          primarySet.estimatedCost !== undefined &&
          s.estimatedCost < primarySet.estimatedCost! * 0.9,
      )
      .sort((a, b) => (a.estimatedCost ?? 0) - (b.estimatedCost ?? 0))[0];

    if (cheaper) {
      alternatives.push({
        id: "lower-cost",
        label: "Lower-cost option",
        reason: "Best if value matters more than maximum specialization.",
        set: cheaper,
      });
    }

    const raceAlt = sameSize
      .filter((s) => {
        const race = s.roleCoverage.find((c) => c.roleId === "race");
        const baseRace = primarySet.roleCoverage.find((c) => c.roleId === "race");
        return (
          race &&
          baseRace &&
          race.bestCoverage >= baseRace.bestCoverage + 5
        );
      })
      .sort((a, b) => b.totalScore - a.totalScore)[0];

    if (raceAlt && raceAlt.productIds.join() !== cheaper?.productIds.join()) {
      alternatives.push({
        id: "performance",
        label: "More performance-focused",
        reason: "Stronger race / speed coverage with a similar shoe count.",
        set: raceAlt,
      });
    }
  }

  const strongRolesCovered = primarySet.roleCoverage.filter(
    (c) => c.status === "strong" || c.status === "covered",
  ).length;

  return {
    version: ROTATION_PLANNER_VERSION,
    profile,
    existingCoverage,
    gaps: profile.mode === "improve" ? gaps : detectGaps(primarySet.roleCoverage),
    overlaps:
      profile.mode === "improve"
        ? overlaps
        : detectOverlaps(
            recommendedProductIds
              .map((id) => profileMap.get(id)!)
              .filter(Boolean),
            profile,
            profile.requiredRoles,
          ),
    recommendedProductIds,
    additions,
    recommendedSize,
    sizeExplanation: sizeExplanation(
      recommendedSize,
      primarySet.coverageScore,
      profile,
    ),
    primarySet,
    alternatives: alternatives.slice(0, 2),
    strongRolesCovered,
    requiredRolesCount: profile.requiredRoles.length,
    coverageSummary: `${strongRolesCovered} of ${profile.requiredRoles.length} selected training roles strongly covered`,
    catalogCoverageMessage:
      "Recommendations use products currently included in the Kitletics catalog.",
  };
}

export { primaryAndSecondaryRoles };
