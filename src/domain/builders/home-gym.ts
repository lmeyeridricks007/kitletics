import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import { hasHardIncompatibility } from "@/domain/compatibility";
import {
  CATEGORY_COVERED_ROLES,
  evaluateExerciseCoverage,
  exercisesForGoals,
  ROLE_TO_CATEGORY,
  type BuilderRoleId,
  type ExerciseId,
} from "@/domain/room-planner/exercises";
import { assessProductFit } from "@/domain/room-planner/fit";
import { generateLayout } from "@/domain/room-planner/layout";
import {
  canUseInRoomPlanner,
  noiseProfileForCategory,
  resolveProductDimensions,
} from "@/domain/room-planner/product-geometry";
import { createRectangularRoom, roomAreaM2 } from "@/domain/room-planner/room";
import type {
  FitStatus,
  LayoutResult,
  MountingAnswer,
  NoiseImportance,
  Room,
} from "@/domain/room-planner/types";

export type HomeGymGoal =
  | "general-fitness"
  | "strength"
  | "powerlifting"
  | "bodybuilding"
  | "functional-fitness"
  | "hyrox"
  | "calisthenics"
  | "conditioning"
  | "mixed";

export type BuilderFitBand = "excellent" | "strong" | "good" | "limited";

export type BudgetMode = "strict" | "target" | "flexible";

export type BuilderMode = "scratch" | "improve" | "around-owned";

export type BuildDepth = "quick" | "advanced";

export type PriorityId =
  | "performance"
  | "value"
  | "small-footprint"
  | "open-space"
  | "versatility"
  | "heavy-lifting"
  | "quiet"
  | "easy-storage"
  | "future-expansion"
  | "premium";

export type SpendStyle = "minimal" | "maximize-budget";

/** Legacy RoomProfile — maps to Room */
export interface RoomProfile {
  lengthM: number;
  widthM: number;
  heightM: number;
  wallMountAllowed: boolean;
  floorMountAllowed: boolean;
  noiseSensitive: boolean;
}

export interface HomeGymBuilderInput {
  room: RoomProfile;
  budgetEur: number;
  budgetMode: "strict" | "flexible" | BudgetMode;
  goals: HomeGymGoal[];
  experience: "beginner" | "intermediate" | "advanced";
  ownedCategories: string[];
  unitSystem: "metric" | "imperial";
}

export type SetupRole =
  | "primary-strength-station"
  | "barbell-loading"
  | "benching"
  | "free-weights"
  | "vertical-pulling"
  | "conditioning"
  | "floor-protection"
  | "storage";

export interface BuilderSetItem {
  role: SetupRole;
  productId: string;
  productName: string;
  categoryId: string;
  tier: "essential" | "recommended" | "upgrade";
  estimatedPrice?: number;
  rationale: string;
  fit: "fits" | "likely-fits" | "unknown" | "does-not-fit";
}

export interface HomeGymBuilderResult {
  band: BuilderFitBand;
  items: BuilderSetItem[];
  totalEstimated: number;
  budgetRemaining: number;
  explanations: string[];
  layoutSketch: string[];
  skippedRoles: { role: SetupRole; reason: string }[];
  confidenceNotes: string[];
}

export interface AdvancedBuilderProfile {
  mode: BuilderMode;
  depth: BuildDepth;
  room: Room;
  wallMount: MountingAnswer;
  floorMount: MountingAnswer;
  goals: HomeGymGoal[];
  /** Ordered primary → secondary */
  goalPriority: HomeGymGoal[];
  exercises: ExerciseId[];
  priorities: PriorityId[];
  noiseImportance: NoiseImportance;
  budgetEur: number;
  budgetMode: BudgetMode;
  spendStyle: SpendStyle;
  experience: "beginner" | "intermediate" | "advanced";
  ownedProductIds: string[];
  ownedCategories: string[];
  cardioPreference?: "run" | "row" | "bike" | "ski" | "low-impact" | "none" | "any";
  storagePriority?: "minimal" | "normal" | "high";
}

export interface BuildItemDetailed {
  productId: string;
  productName: string;
  categoryId: string;
  roleIds: BuilderRoleId[];
  tier: "essential" | "recommended" | "upgrade" | "owned";
  estimatedPrice?: number;
  priceKnown: boolean;
  rationale: string;
  fitStatus: FitStatus;
  whyNotAlternatives?: string;
  existing: boolean;
}

export interface UpgradeStep {
  stage: "start" | "next" | "later" | "optional";
  productId?: string;
  label: string;
  capability: string;
  estimatedPrice?: number;
}

export interface AlternativeBuildSummary {
  id: string;
  label: string;
  tagline: string;
  totalEstimated: number;
  itemCount: number;
  openTrainingM2: number;
  productIds: string[];
}

export interface AdvancedBuildResult {
  band: BuilderFitBand;
  title: string;
  items: BuildItemDetailed[];
  layout: LayoutResult;
  exerciseCoverage: ReturnType<typeof evaluateExerciseCoverage>;
  goalCoverage: { goal: HomeGymGoal; band: string }[];
  totalKnown: number;
  unknownPriceCount: number;
  budgetRemaining: number;
  explanations: string[];
  confidenceNotes: string[];
  upgradePath: UpgradeStep[];
  alternatives: AlternativeBuildSummary[];
  retailersUsed: number;
  skipped: { role: BuilderRoleId; reason: string }[];
}

const LEGACY_ROLE_MAP: Record<SetupRole, BuilderRoleId> = {
  "primary-strength-station": "PRIMARY_STRENGTH_STATION",
  "barbell-loading": "BARBELL",
  benching: "BENCH",
  "free-weights": "FREE_WEIGHTS",
  "vertical-pulling": "VERTICAL_PULL",
  conditioning: "CONDITIONING",
  "floor-protection": "FLOORING",
  storage: "STORAGE",
};

function lowestPrice(productId: string, offers: Offer[]): number | undefined {
  const prices = offers
    .filter(
      (o) =>
        o.productId === productId &&
        o.status !== "inactive" &&
        typeof o.price === "number",
    )
    .map((o) => o.price);
  if (!prices.length) return undefined;
  return Math.min(...prices);
}

function budgetCap(mode: BudgetMode, budget: number): number {
  if (mode === "strict") return budget;
  if (mode === "target") return budget * 1.05;
  return budget * 1.08;
}

function rolesNeeded(goals: HomeGymGoal[], priorities: PriorityId[]): BuilderRoleId[] {
  const roles: BuilderRoleId[] = [];
  const add = (r: BuilderRoleId) => {
    if (!roles.includes(r)) roles.push(r);
  };

  const strengthish = goals.some((g) =>
    ["strength", "powerlifting", "bodybuilding", "mixed"].includes(g),
  );
  const compact =
    priorities.includes("small-footprint") || priorities.includes("open-space");

  if (goals.includes("calisthenics") && !strengthish) {
    add("VERTICAL_PULL");
    add("CALISTHENICS");
    add("FLOORING");
    return roles;
  }
  if (strengthish) {
    if (!compact || !priorities.includes("small-footprint")) {
      add("PRIMARY_STRENGTH_STATION");
    }
    add("BARBELL");
    add("PLATES");
    add("BENCH");
    add("FREE_WEIGHTS");
    add("FLOORING");
    if (priorities.includes("easy-storage") || goals.includes("powerlifting")) {
      add("STORAGE");
    }
  }
  if (goals.includes("general-fitness") && !strengthish) {
    add("FREE_WEIGHTS");
    add("FLOORING");
  }
  if (
    goals.includes("hyrox") ||
    goals.includes("conditioning") ||
    goals.includes("functional-fitness")
  ) {
    add("CONDITIONING");
    add("FREE_WEIGHTS");
    add("FLOORING");
    if (goals.includes("hyrox")) add("FUNCTIONAL");
  }
  if (goals.includes("calisthenics")) {
    add("VERTICAL_PULL");
    add("CALISTHENICS");
  }
  return roles;
}

function fitToLegacy(
  status: FitStatus,
): BuilderSetItem["fit"] {
  if (status === "does-not-fit") return "does-not-fit";
  if (status === "unknown") return "unknown";
  if (status === "tight-fit" || status === "fits-with-limitations") {
    return "likely-fits";
  }
  return "fits";
}

/**
 * Legacy entry — used by Prompt 21 tests and simple callers.
 */
export function runHomeGymBuilder(input: {
  profile: HomeGymBuilderInput;
  products: Product[];
  offers: Offer[];
}): HomeGymBuilderResult {
  const room = createRectangularRoom({
    widthM: input.profile.room.widthM,
    lengthM: input.profile.room.lengthM,
    heightM: input.profile.room.heightM,
    wallMount: input.profile.room.wallMountAllowed ? "yes" : "no",
  });

  const advanced = runAdvancedHomeGymBuilder({
    profile: {
      mode: "scratch",
      depth: "quick",
      room,
      wallMount: input.profile.room.wallMountAllowed ? "yes" : "no",
      floorMount: input.profile.room.floorMountAllowed ? "yes" : "no",
      goals: input.profile.goals,
      goalPriority: input.profile.goals,
      exercises: exercisesForGoals(input.profile.goals),
      priorities: input.profile.room.noiseSensitive
        ? ["quiet", "value"]
        : ["value", "performance"],
      noiseImportance: input.profile.room.noiseSensitive
        ? "very"
        : "not-important",
      budgetEur: input.profile.budgetEur,
      budgetMode:
        input.profile.budgetMode === "flexible" ? "flexible" : "strict",
      spendStyle: "minimal",
      experience: input.profile.experience,
      ownedProductIds: [],
      ownedCategories: input.profile.ownedCategories,
    },
    products: input.products,
    offers: input.offers,
  });

  const items: BuilderSetItem[] = advanced.items
    .filter((i) => !i.existing)
    .map((i) => {
      const role =
        (Object.entries(LEGACY_ROLE_MAP).find(([, v]) =>
          i.roleIds.includes(v),
        )?.[0] as SetupRole) ?? "free-weights";
      return {
        role,
        productId: i.productId,
        productName: i.productName,
        categoryId: i.categoryId,
        tier:
          i.tier === "owned"
            ? "essential"
            : (i.tier as BuilderSetItem["tier"]),
        estimatedPrice: i.estimatedPrice,
        rationale: i.rationale,
        fit: fitToLegacy(i.fitStatus),
      };
    });

  const layoutSketch = [
    "FRONT WALL",
    items.some((i) => i.role === "primary-strength-station")
      ? "[ POWER RACK ]"
      : items.some((i) => i.role === "vertical-pulling")
        ? "[ PULL-UP ]"
        : "[ OPEN ]",
    "",
    "CENTER",
    items.some((i) => i.role === "benching")
      ? "[ BENCH / FREE SPACE ]"
      : "[ FREE SPACE ]",
    "",
    "SIDE",
    items.some((i) => i.role === "free-weights")
      ? "[ DUMBBELLS ]"
      : "[ STORAGE ]",
    "",
    "BACK",
    items.some((i) => i.role === "conditioning")
      ? "[ ROWER / CARDIO ]"
      : "[ CLEARANCE ]",
  ];

  return {
    band: advanced.band,
    items,
    totalEstimated: advanced.totalKnown,
    budgetRemaining: advanced.budgetRemaining,
    explanations: advanced.explanations,
    layoutSketch,
    skippedRoles: advanced.skipped.map((s) => ({
      role:
        (Object.entries(LEGACY_ROLE_MAP).find(([, v]) => v === s.role)?.[0] as SetupRole) ??
        "storage",
      reason: s.reason,
    })),
    confidenceNotes: advanced.confidenceNotes,
  };
}

function pickCandidates(
  role: BuilderRoleId,
  profile: AdvancedBuilderProfile,
  products: Product[],
  offers: Offer[],
  already: BuildItemDetailed[],
): { product: Product; price?: number; fit: FitStatus; score: number }[] {
  let categoryId = ROLE_TO_CATEGORY[role];
  if (
    role === "CONDITIONING" &&
    profile.cardioPreference === "bike"
  ) {
    categoryId = "cat-air-bikes";
  }
  if (role === "CONDITIONING" && profile.cardioPreference === "run") {
    categoryId = "cat-treadmills";
  }
  if (role === "CONDITIONING" && profile.cardioPreference === "ski") {
    categoryId = "cat-ski-ergs";
  }

  // Skip vertical pull if rack already covers it
  if (
    role === "VERTICAL_PULL" &&
    already.some((i) => i.categoryId === "cat-power-racks")
  ) {
    return [];
  }

  return products
    .filter(
      (p) =>
        p.status === "published" &&
        p.categoryId === categoryId &&
        p.lifecycleStatus !== "discontinued" &&
        p.lifecycleStatus !== "upcoming",
    )
    .map((p) => {
      const fit = assessProductFit({
        product: p,
        room: profile.room,
        wallMount: profile.wallMount,
        floorMount: profile.floorMount,
      });
      const price = lowestPrice(p.id, offers);
      let score = 100;
      if (fit.status === "does-not-fit") score = -1000;
      if (fit.status === "unknown") score -= 40;
      if (fit.status === "tight-fit") score -= 10;
      if (fit.status === "fits-with-limitations") score -= 15;
      if (price === undefined) score -= 5;
      else score -= price / 100;
      if (
        profile.noiseImportance === "very" &&
        noiseProfileForCategory(p.categoryId) === "loud"
      ) {
        score -= 50;
      }
      if (
        profile.priorities.includes("small-footprint") &&
        canUseInRoomPlanner(p)
      ) {
        const d = resolveProductDimensions(p);
        score -= ((d.widthMm ?? 0) * (d.depthMm ?? 0)) / 500_000;
      }
      if (
        profile.priorities.includes("open-space") &&
        p.categoryId === "cat-power-racks"
      ) {
        const d = resolveProductDimensions(p);
        if ((d.foldedWidthMm ?? 0) > 0) score += 15;
      }
      // Prefer planner-ready when similar
      if (canUseInRoomPlanner(p)) score += 8;
      else score -= 20;
      return { product: p, price, fit: fit.status, score };
    })
    .filter((c) => c.fit !== "does-not-fit" && c.score > -500)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function buildOnce(
  profile: AdvancedBuilderProfile,
  products: Product[],
  offers: Offer[],
  variant: "recommended" | "value" | "premium" | "open-space",
): {
  items: BuildItemDetailed[];
  skipped: AdvancedBuildResult["skipped"];
  explanations: string[];
  confidenceNotes: string[];
} {
  const explanations: string[] = [];
  const confidenceNotes: string[] = [];
  const skipped: AdvancedBuildResult["skipped"] = [];
  const items: BuildItemDetailed[] = [];
  let spent = 0;
  const cap =
    variant === "premium"
      ? budgetCap("flexible", profile.budgetEur)
      : budgetCap(profile.budgetMode, profile.budgetEur);
  const valueBias = variant === "value" || profile.spendStyle === "minimal";

  const owned = products.filter((p) =>
    profile.ownedProductIds.includes(p.id),
  );
  for (const p of owned) {
    const roles = CATEGORY_COVERED_ROLES[p.categoryId] ?? [];
    items.push({
      productId: p.id,
      productName: p.fullName,
      categoryId: p.categoryId,
      roleIds: roles,
      tier: "owned",
      estimatedPrice: 0,
      priceKnown: true,
      rationale: "Already owned — locked into baseline.",
      fitStatus: assessProductFit({
        product: p,
        room: profile.room,
        wallMount: profile.wallMount,
        floorMount: profile.floorMount,
      }).status,
      existing: true,
    });
  }

  let roles = rolesNeeded(profile.goals, profile.priorities);
  if (variant === "open-space") {
    roles = roles.filter((r) => r !== "PRIMARY_STRENGTH_STATION");
    if (!roles.includes("FREE_WEIGHTS")) roles.unshift("FREE_WEIGHTS");
    explanations.push(
      "Open-space variant: prefers adjustable free weights over a full rack.",
    );
  }
  if (variant === "premium" && !roles.includes("CONDITIONING")) {
    roles.push("CONDITIONING");
  }

  // Compact rooms: demote rack
  const area = roomAreaM2(profile.room);
  if (area < 9 || profile.room.heightMm < 2350) {
    roles = [
      ...roles.filter((r) => r !== "PRIMARY_STRENGTH_STATION"),
      ...(roles.includes("PRIMARY_STRENGTH_STATION")
        ? (["PRIMARY_STRENGTH_STATION"] as BuilderRoleId[])
        : []),
    ];
    explanations.push(
      "Compact or low-ceiling room: prioritize free weights and pull-up solutions before full racks.",
    );
  }

  if (profile.noiseImportance === "very") {
    explanations.push(
      "Noise is very important — loud cardio and high-impact options are penalized.",
    );
  }

  for (const role of roles) {
    if (profile.ownedCategories.includes(ROLE_TO_CATEGORY[role])) {
      skipped.push({
        role,
        reason: "User already owns this category — no duplicate recommended",
      });
      continue;
    }
    if (items.some((i) => i.roleIds.includes(role))) continue;

    const candidates = pickCandidates(role, profile, products, offers, items);
    if (!candidates.length) {
      skipped.push({ role, reason: "No eligible products for this role" });
      continue;
    }

    let pick = candidates[0];
    if (valueBias) {
      pick = [...candidates].sort(
        (a, b) => (a.price ?? 99999) - (b.price ?? 99999),
      )[0];
    }
    if (variant === "premium") {
      pick = candidates[0];
    }

    // Compatibility: don't pair incompatible with existing
    for (const other of items) {
      if (hasHardIncompatibility(pick.product.id, other.productId)) {
        const alt = candidates.find(
          (c) => !hasHardIncompatibility(c.product.id, other.productId),
        );
        if (alt) pick = alt;
        else {
          skipped.push({
            role,
            reason: "Incompatible with equipment already in the build",
          });
          pick = null as unknown as typeof pick;
          break;
        }
      }
    }
    if (!pick) continue;

    if (pick.price !== undefined && spent + pick.price > cap) {
      // try cheaper
      const cheaper = candidates.find(
        (c) =>
          c.price !== undefined &&
          spent + c.price <= cap &&
          c.product.id !== pick.product.id,
      );
      if (!cheaper) {
        skipped.push({
          role,
          reason: `Would exceed ${profile.budgetMode} budget`,
        });
        continue;
      }
      pick = cheaper;
    }

    if (pick.price === undefined) {
      confidenceNotes.push(
        `${pick.product.fullName}: no reliable regional price — not counted as €0`,
      );
    }
    if (pick.fit === "unknown") {
      confidenceNotes.push(
        `${pick.product.fullName}: incomplete dimensions — fit confidence reduced`,
      );
    }

    const runnerUp = candidates.find((c) => c.product.id !== pick.product.id);
    let whyNot: string | undefined;
    if (runnerUp) {
      if (runnerUp.fit === "does-not-fit") {
        whyNot = `Chosen over ${runnerUp.product.name} because that option does not fit your room.`;
      } else if (
        typeof runnerUp.product.specifications?.heightMm === "number" &&
        (runnerUp.product.specifications.heightMm as number) + 50 >
          profile.room.heightMm
      ) {
        whyNot = `Chosen over ${runnerUp.product.name} because it exceeds your ceiling.`;
      } else if (
        pick.price !== undefined &&
        runnerUp.price !== undefined &&
        runnerUp.price > pick.price
      ) {
        whyNot = `Chosen over ${runnerUp.product.name} for better value in this budget.`;
      }
    }

    const tier: BuildItemDetailed["tier"] =
      role === "STORAGE" || role === "CONDITIONING" || role === "FUNCTIONAL"
        ? "recommended"
        : "essential";

    items.push({
      productId: pick.product.id,
      productName: pick.product.fullName,
      categoryId: pick.product.categoryId,
      roleIds: CATEGORY_COVERED_ROLES[pick.product.categoryId] ?? [role],
      tier,
      estimatedPrice: pick.price,
      priceKnown: pick.price !== undefined,
      rationale: rationale(role, pick.product.fullName, profile),
      fitStatus: pick.fit,
      whyNotAlternatives: whyNot,
      existing: false,
    });
    if (pick.price !== undefined) spent += pick.price;
  }

  return { items, skipped, explanations, confidenceNotes };
}

function rationale(
  role: BuilderRoleId,
  name: string,
  profile: AdvancedBuilderProfile,
): string {
  const h = (profile.room.heightMm / 1000).toFixed(2);
  switch (role) {
    case "PRIMARY_STRENGTH_STATION":
      return `${name} is the strength station within your ${h} m ceiling.`;
    case "BARBELL":
      return `${name} enables loaded barbell work with plates.`;
    case "PLATES":
      return `${name} loads the barbell — required for strength progression.`;
    case "BENCH":
      return `${name} covers horizontal pressing.`;
    case "FREE_WEIGHTS":
      return `${name} adds unilateral and accessory work with a smaller footprint.`;
    case "VERTICAL_PULL":
      return `${name} covers pull-ups; muscle-up claims need verified clearance.`;
    case "CONDITIONING":
    case "CARDIO":
      return `${name} covers conditioning without forcing a full cardio fleet.`;
    case "FLOORING":
      return `${name} protects flooring for loaded training.`;
    case "STORAGE":
      return `${name} keeps plates organized as the setup expands.`;
    case "FUNCTIONAL":
      return `${name} supports functional / HYROX station work.`;
    case "CALISTHENICS":
      return `${name} supports bodyweight skill work.`;
    default:
      return name;
  }
}

export function runAdvancedHomeGymBuilder(input: {
  profile: AdvancedBuilderProfile;
  products: Product[];
  offers: Offer[];
}): AdvancedBuildResult {
  const { profile, products, offers } = input;
  const primary = buildOnce(profile, products, offers, "recommended");

  const productMap = new Map(products.map((p) => [p.id, p]));
  const layoutItems = primary.items
    .map((i) => {
      const product = productMap.get(i.productId);
      if (!product) return null;
      return {
        product,
        roleIds: i.roleIds,
        locked: i.existing,
        existing: i.existing,
        source: i.existing ? ("owned" as const) : ("generated" as const),
      };
    })
    .filter(Boolean) as Parameters<typeof generateLayout>[0]["items"];

  const layout = generateLayout({
    room: profile.room,
    items: layoutItems,
    preserveOpenSpace:
      profile.priorities.includes("open-space") ||
      profile.goals.includes("hyrox") ||
      profile.goals.includes("functional-fitness") ||
      profile.goals.includes("calisthenics"),
  });

  const coveredRoles = new Set<BuilderRoleId>();
  for (const i of primary.items) {
    for (const r of i.roleIds) coveredRoles.add(r);
  }

  const exerciseCoverage = evaluateExerciseCoverage({
    exerciseIds:
      profile.exercises.length > 0
        ? profile.exercises
        : exercisesForGoals(profile.goals),
    coveredRoles,
    roomHeightMm: profile.room.heightMm,
    roomAreaMm2: profile.room.widthMm * profile.room.lengthMm,
    openTrainingMm2: layout.utilization.openTrainingMm2,
    roomMaxSideMm: Math.max(profile.room.widthMm, profile.room.lengthMm),
  });

  const totalKnown = primary.items
    .filter((i) => !i.existing && i.priceKnown)
    .reduce((s, i) => s + (i.estimatedPrice ?? 0), 0);
  const unknownPriceCount = primary.items.filter(
    (i) => !i.existing && !i.priceKnown,
  ).length;

  const essentials = primary.items.filter((i) => i.tier === "essential").length;
  const band: BuilderFitBand =
    essentials >= 4
      ? "excellent"
      : essentials >= 3
        ? "strong"
        : essentials >= 2
          ? "good"
          : "limited";

  const goalCoverage = profile.goals.map((goal) => {
    const ex = exercisesForGoals([goal]);
    const cov = exerciseCoverage.filter((e) => ex.includes(e.id));
    const ok = cov.filter((c) => c.coverage === "supported").length;
    const gBand =
      ok >= Math.max(1, cov.length - 1)
        ? "Excellent"
        : ok >= 1
          ? "Strong"
          : "Basic";
    return { goal, band: gBand };
  });

  const title = `${profile.goals
    .slice(0, 2)
    .map((g) => g.replace(/-/g, " "))
    .join(" + ")
    .toUpperCase()} HOME GYM`;

  // Alternatives
  const alternatives: AlternativeBuildSummary[] = [];
  for (const v of ["value", "open-space", "premium"] as const) {
    const alt = buildOnce(profile, products, offers, v);
    const ids = alt.items.filter((i) => !i.existing).map((i) => i.productId);
    const primaryIds = primary.items
      .filter((i) => !i.existing)
      .map((i) => i.productId);
    const overlap =
      ids.filter((id) => primaryIds.includes(id)).length /
      Math.max(ids.length, 1);
    if (overlap > 0.85) continue;
    const total = alt.items
      .filter((i) => !i.existing && i.priceKnown)
      .reduce((s, i) => s + (i.estimatedPrice ?? 0), 0);
    const altLayout = generateLayout({
      room: profile.room,
      items: alt.items
        .map((i) => {
          const product = productMap.get(i.productId);
          if (!product) return null;
          return { product, roleIds: i.roleIds };
        })
        .filter(Boolean) as Parameters<typeof generateLayout>[0]["items"],
      preserveOpenSpace: true,
    });
    alternatives.push({
      id: v,
      label:
        v === "value"
          ? "LOWER COST"
          : v === "open-space"
            ? "MORE OPEN SPACE"
            : "PREMIUM",
      tagline:
        v === "value"
          ? "Spends less while covering core goals."
          : v === "open-space"
            ? "Favours compact / folding gear and free space."
            : "Adds capability where budget allows — not required.",
      totalEstimated: total,
      itemCount: alt.items.filter((i) => !i.existing).length,
      openTrainingM2: altLayout.utilization.openTrainingMm2 / 1_000_000,
      productIds: ids,
    });
  }

  const upgradePath: UpgradeStep[] = [
    {
      stage: "start",
      label: "Core setup",
      capability: primary.items
        .filter((i) => i.tier === "essential" || i.tier === "owned")
        .map((i) => i.productName)
        .slice(0, 4)
        .join(", "),
    },
  ];
  const next = primary.items.find((i) => i.tier === "recommended");
  if (next) {
    upgradePath.push({
      stage: "next",
      productId: next.productId,
      label: next.productName,
      capability: next.rationale,
      estimatedPrice: next.estimatedPrice,
    });
  }
  upgradePath.push({
    stage: "later",
    label: "Cable / attachment expandability",
    capability: "Adds cable and accessory work if your rack ecosystem supports it.",
  });
  if (!primary.items.some((i) => i.roleIds.includes("CONDITIONING"))) {
    upgradePath.push({
      stage: "optional",
      label: "Rower or air bike",
      capability: "Adds conditioning when space and budget allow.",
    });
  }

  const retailerIds = new Set(
    offers
      .filter((o) => primary.items.some((i) => i.productId === o.productId))
      .map((o) => o.retailerId),
  );

  if (profile.goals.includes("hyrox")) {
    primary.explanations.push(
      "HYROX: preserve open floor for burpees, lunges and carries — sled runway is rarely realistic indoors.",
    );
  }

  return {
    band,
    title,
    items: primary.items,
    layout,
    exerciseCoverage,
    goalCoverage,
    totalKnown,
    unknownPriceCount,
    budgetRemaining: Math.max(0, profile.budgetEur - totalKnown),
    explanations: primary.explanations,
    confidenceNotes: primary.confidenceNotes,
    upgradePath,
    alternatives,
    retailersUsed: retailerIds.size,
    skipped: primary.skipped,
  };
}

export { createRectangularRoom, exercisesForGoals };
