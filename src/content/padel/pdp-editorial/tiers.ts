import type { Product } from "@/domain/products/types";
import type {
  PadelEditorialCategory,
  PadelEditorialDepth,
  PadelEditorialTier,
} from "@/domain/padel/soft-pdp-copy";

const CAT: Record<string, PadelEditorialCategory> = {
  "cat-padel-rackets": "rackets",
  "cat-padel-shoes": "shoes",
  "cat-padel-balls": "balls",
  "cat-padel-bags": "bags",
  "cat-padel-grips": "grips",
  "cat-padel-accessories": "accessories",
};

export function padelEditorialCategory(
  product: Product,
): PadelEditorialCategory | null {
  return CAT[product.categoryId] ?? null;
}

/** Decision-complexity tier for PDP depth. */
export function classifyEditorialTier(product: Product): PadelEditorialTier {
  const cat = padelEditorialCategory(product);
  if (!cat) return "C";
  if (cat === "rackets" || cat === "shoes") return "A";

  const name = `${product.name} ${product.fullName}`.toLowerCase();
  const specs = product.specifications ?? {};
  const accessoryType = String(specs.accessoryType ?? specs.type ?? "").toLowerCase();
  const bagType = String(specs.bagType ?? specs.carryStyle ?? "").toLowerCase();
  const gripType = String(specs.gripType ?? "").toLowerCase();

  if (cat === "bags") {
    if (
      /thermo|pro series|competition|tour|elite|luxury|xxl|master|vertex|hack|xplo|summum|ambassador/i.test(
        name,
      ) ||
      /thermo|thermal/i.test(bagType) ||
      Number(specs.racketCapacity ?? 0) >= 4
    ) {
      return "A";
    }
    return "B";
  }

  if (cat === "accessories") {
    if (
      /pressurizer|pascal|tuboplus|bounce|ball rescuer|press/i.test(name) ||
      /pressurizer/i.test(accessoryType)
    ) {
      return "A";
    }
    if (
      /protector|weight|custom|hesacore|pickup|pump/i.test(name) ||
      /protector|customization/i.test(accessoryType)
    ) {
      return "B";
    }
    return "C";
  }

  if (cat === "grips") {
    if (
      /hesacore|dual|replacement|under.?grip|sensogrip|fixogrip|hydrosorb/i.test(
        name,
      ) ||
      /replacement|undergrip/i.test(gripType)
    ) {
      return "A";
    }
    return "B";
  }

  // balls
  return "B";
}

export function depthForTier(
  tier: PadelEditorialTier,
  blocked: boolean,
): PadelEditorialDepth {
  if (blocked) return "blocked";
  if (tier === "A") return "deep";
  if (tier === "B") return "substantive";
  return "light";
}
