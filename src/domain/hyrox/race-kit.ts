import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";

export type RaceKitRole =
  | "FOOTWEAR"
  | "BOTTOM"
  | "TOP"
  | "SOCKS"
  | "TIMING"
  | "HEART_RATE"
  | "ACCESSORIES"
  | "WARM_UP"
  | "POST_RACE";

export type RaceKitTier = "essential" | "useful" | "optional" | "owned";

export interface RaceKitProfile {
  divisionHint?: string;
  experience: "beginner" | "intermediate" | "advanced";
  runningStrength: "strong" | "balanced" | "developing";
  priority: "speed" | "stability" | "versatility" | "value";
  budgetEur: number;
  budgetMode: "strict" | "flexible";
  ownedProductIds: string[];
  ownedRoles: RaceKitRole[];
  needCompleteKit: boolean;
  trainLocation: "commercial-gym" | "home" | "mixed";
}

export interface RaceKitItem {
  role: RaceKitRole;
  productId: string;
  productName: string;
  tier: RaceKitTier;
  estimatedPrice?: number;
  rationale: string;
  existing: boolean;
}

export interface RaceKitResult {
  title: string;
  items: RaceKitItem[];
  totalNewSpend: number;
  unknownPriceCount: number;
  essentialCount: number;
  optionalCount: number;
  ownedCount: number;
  explanations: string[];
}

const ROLE_CANDIDATES: {
  role: RaceKitRole;
  categoryIds: string[];
  productIds?: string[];
  tier: RaceKitTier;
  defaultRationale: string;
}[] = [
  {
    role: "FOOTWEAR",
    categoryIds: ["cat-training-shoes", "cat-running-shoes"],
    productIds: [
      "prod-tyr-cxt-2",
      "prod-reebok-nano-x4",
      "prod-nike-metcon-9",
      "prod-nobull-trainer",
      "prod-boston-12",
      "prod-inov8-flite-235-v3",
    ],
    tier: "essential",
    defaultRationale:
      "Race footwear balancing running legs with station stability.",
  },
  {
    role: "TIMING",
    categoryIds: ["cat-gps-watches"],
    productIds: ["prod-forerunner-965", "prod-forerunner-255", "prod-coros-pace-3"],
    tier: "useful",
    defaultRationale:
      "Multisport watch for splits — not a substitute for the event timing chip.",
  },
  {
    role: "HEART_RATE",
    categoryIds: ["cat-heart-rate-monitors"],
    productIds: ["prod-hrm-pro-plus", "prod-polar-h10"],
    tier: "optional",
    defaultRationale:
      "Chest strap can improve HR fidelity under station movement vs wrist-only.",
  },
];

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

function scoreShoe(
  product: Product,
  profile: RaceKitProfile,
): number {
  let s = product.recommendationScore ?? 70;
  const hyrox = String(product.specifications?.hyroxSuitability ?? "");
  if (hyrox === "very-high") s += 12;
  if (hyrox === "high") s += 8;
  if (profile.runningStrength === "strong") {
    if (product.categoryId === "cat-running-shoes") s += 10;
    if (product.categoryId === "cat-training-shoes") s -= 2;
  }
  if (profile.runningStrength === "developing" || profile.priority === "stability") {
    if (product.categoryId === "cat-training-shoes") s += 10;
  }
  if (profile.priority === "value") {
    s += 5;
  }
  return s;
}

/**
 * Builds a lean HYROX race kit. Does not pad with bags/massage guns.
 * Owned roles/products are kept, not replaced.
 */
export function buildHyroxRaceKit(input: {
  profile: RaceKitProfile;
  products: Product[];
  offers: Offer[];
}): RaceKitResult {
  const { profile, products, offers } = input;
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: RaceKitItem[] = [];
  const explanations: string[] = [];
  let spent = 0;
  const cap =
    profile.budgetMode === "flexible"
      ? profile.budgetEur * 1.08
      : profile.budgetEur;

  for (const ownedId of profile.ownedProductIds) {
    const p = byId.get(ownedId);
    if (!p) continue;
    items.push({
      role: inferRole(p),
      productId: p.id,
      productName: p.fullName,
      tier: "owned",
      estimatedPrice: 0,
      rationale: "Already owned — kept in baseline.",
      existing: true,
    });
  }

  for (const def of ROLE_CANDIDATES) {
    if (profile.ownedRoles.includes(def.role)) {
      explanations.push(`${def.role}: skipped — marked as already owned.`);
      continue;
    }
    if (items.some((i) => i.role === def.role && i.existing)) continue;
    if (def.tier === "optional" && !profile.needCompleteKit) {
      // still allow if budget leftover later
    }

    const pool = products.filter((p) => {
      if (p.status !== "published") return false;
      if (p.lifecycleStatus === "discontinued") return false;
      if (def.productIds?.length) return def.productIds.includes(p.id);
      return def.categoryIds.includes(p.categoryId);
    });

    const ranked = pool
      .map((p) => ({
        product: p,
        score:
          def.role === "FOOTWEAR"
            ? scoreShoe(p, profile)
            : (p.recommendationScore ?? 70),
        price: lowestPrice(p.id, offers),
      }))
      .sort((a, b) => {
        if (profile.priority === "value") {
          return (a.price ?? 9999) - (b.price ?? 9999);
        }
        return b.score - a.score;
      });

    const pick = ranked[0];
    if (!pick) continue;

    if (def.tier === "optional" && profile.experience === "beginner") {
      continue;
    }

    if (pick.price !== undefined && spent + pick.price > cap) {
      if (def.tier === "essential") {
        const cheaper = ranked.find(
          (r) => r.price !== undefined && spent + r.price <= cap,
        );
        if (!cheaper) {
          explanations.push(
            `${def.role}: no candidate within remaining budget.`,
          );
          continue;
        }
        pushItem(cheaper.product, cheaper.price, def);
        spent += cheaper.price ?? 0;
        continue;
      }
      continue;
    }

    pushItem(pick.product, pick.price, def);
    if (pick.price !== undefined) spent += pick.price;
  }

  function pushItem(
    product: Product,
    price: number | undefined,
    def: (typeof ROLE_CANDIDATES)[0],
  ) {
    let rationale = def.defaultRationale;
    if (def.role === "FOOTWEAR") {
      if (profile.runningStrength === "strong") {
        rationale =
          "Chosen to favour running legs while remaining usable on stations.";
      } else if (profile.priority === "stability") {
        rationale =
          "Chosen for station stability (sled / lunges) with acceptable run trade-off.";
      }
    }
    items.push({
      role: def.role,
      productId: product.id,
      productName: product.fullName,
      tier: def.tier,
      estimatedPrice: price,
      rationale,
      existing: false,
    });
  }

  if (profile.trainLocation === "commercial-gym") {
    explanations.push(
      "You train at a commercial gym — this kit focuses on race-day personal gear, not machines.",
    );
  }

  return {
    title: "YOUR HYROX RACE KIT",
    items,
    totalNewSpend: spent,
    unknownPriceCount: items.filter((i) => !i.existing && i.estimatedPrice === undefined)
      .length,
    essentialCount: items.filter((i) => i.tier === "essential").length,
    optionalCount: items.filter((i) => i.tier === "optional" || i.tier === "useful")
      .length,
    ownedCount: items.filter((i) => i.existing).length,
    explanations,
  };
}

function inferRole(p: Product): RaceKitRole {
  if (
    p.categoryId === "cat-training-shoes" ||
    p.categoryId === "cat-running-shoes"
  ) {
    return "FOOTWEAR";
  }
  if (p.categoryId === "cat-gps-watches") return "TIMING";
  if (p.categoryId === "cat-heart-rate-monitors") return "HEART_RATE";
  return "ACCESSORIES";
}
