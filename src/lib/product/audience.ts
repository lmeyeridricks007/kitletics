/**
 * Audience / Fit-sizing helpers for footwear (and apparel later).
 * Source of truth: ProductVariant.audience when present; else specifications.genderFit.
 */

import type {
  AudienceFit,
  Product,
  ProductVariant,
} from "@/domain/products/types";

export type { AudienceFit };

export const AUDIENCE_LABELS: Record<AudienceFit, string> = {
  men: "Men's",
  women: "Women's",
  unisex: "Unisex",
};

export const AUDIENCE_SHORT: Record<AudienceFit, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

const AUDIENCE_SET = new Set<string>(["men", "women", "unisex"]);

export function isAudienceFit(value: string): value is AudienceFit {
  return AUDIENCE_SET.has(value);
}

export function parseAudienceParam(
  raw: string | null | undefined,
): AudienceFit | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "mens" || v === "men's" || v === "men") return "men";
  if (v === "womens" || v === "women's" || v === "women") return "women";
  if (v === "unisex") return "unisex";
  return undefined;
}

/** Serialize for URL — keep existing `gender=` catalog convention. */
export function audienceToGenderParam(audience: AudienceFit): string {
  return audience;
}

function fromGenderFitSpec(raw: unknown): AudienceFit[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map(String).filter(isAudienceFit);
  }
  if (typeof raw === "string" && isAudienceFit(raw)) return [raw];
  return [];
}

/**
 * Audiences this product model is sold in.
 * Prefer variants; fall back to genderFit spec.
 */
export function getProductAudiences(
  product: Product,
  variants?: ProductVariant[],
): AudienceFit[] {
  const fromVariants = (variants ?? [])
    .filter((v) => v.availabilityVerified)
    .map((v) => v.audience);
  if (fromVariants.length > 0) {
    return [...new Set(fromVariants)];
  }
  return fromGenderFitSpec(product.specifications?.genderFit);
}

export function productHasAudience(
  product: Product,
  audience: AudienceFit,
  variants?: ProductVariant[],
): boolean {
  return getProductAudiences(product, variants).includes(audience);
}

export function formatAudienceAvailability(
  audiences: AudienceFit[],
): string | undefined {
  if (audiences.length === 0) return undefined;
  if (audiences.length === 1) {
    if (audiences[0] === "unisex") return "Unisex";
    return AUDIENCE_LABELS[audiences[0]!];
  }
  const hasMen = audiences.includes("men");
  const hasWomen = audiences.includes("women");
  const hasUnisex = audiences.includes("unisex");
  if (hasMen && hasWomen && !hasUnisex) return "Men + Women";
  if (hasMen && hasWomen && hasUnisex) return "Men + Women + Unisex";
  return audiences.map((a) => AUDIENCE_SHORT[a]).join(" + ");
}

export function pickVariant(
  variants: ProductVariant[],
  audience: AudienceFit | undefined,
): ProductVariant | undefined {
  if (!variants.length) return undefined;
  if (audience) {
    const hit = variants.find(
      (v) => v.audience === audience && v.availabilityVerified,
    );
    if (hit) return hit;
  }
  return (
    variants.find((v) => v.audience === "unisex" && v.availabilityVerified) ??
    variants.find((v) => v.availabilityVerified) ??
    variants[0]
  );
}

/** Card/list weight: only when verified for the active audience context. */
export function variantDisplayWeight(
  product: Product,
  variant: ProductVariant | undefined,
  activeAudience?: AudienceFit,
): { grams?: number; label?: string } {
  if (variant?.weightVerified && variant.referenceWeightG != null) {
    return {
      grams: variant.referenceWeightG,
      label: variant.referenceSizeLabel
        ? `${AUDIENCE_LABELS[variant.audience]} · ${variant.referenceSizeLabel}`
        : AUDIENCE_LABELS[variant.audience],
    };
  }
  // All / no audience: men's reference weight is the catalog default when dual-last
  if (!activeAudience || activeAudience === "men") {
    const w = product.specifications?.weight;
    if (typeof w === "number") {
      return {
        grams: w,
        label: activeAudience === "men" ? "Men's · US 9" : "Ref. · Men's US 9",
      };
    }
  }
  // Women's without verified weight — omit rather than invent
  return {};
}

export const PREFERRED_SIZING_KEY = "kitletics_preferred_sizing";

export function readPreferredSizing(): AudienceFit | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = window.localStorage.getItem(PREFERRED_SIZING_KEY);
    return v && isAudienceFit(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

export function writePreferredSizing(audience: AudienceFit | undefined): void {
  if (typeof window === "undefined") return;
  try {
    if (!audience) window.localStorage.removeItem(PREFERRED_SIZING_KEY);
    else window.localStorage.setItem(PREFERRED_SIZING_KEY, audience);
  } catch {
    /* ignore */
  }
}
