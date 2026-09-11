import type { Product } from "@/domain/products/types";
import type { SpecificationDefinition } from "@/domain/products/types";
import { allSpecificationDefinitions } from "@/content/specs/definitions";

export type CompletenessTier = "complete" | "usable" | "partial" | "insufficient";

export interface PublishRequirement {
  categoryId: string;
  /** Spec keys that must be present and non-null for publish eligibility */
  requiredSpecKeys: string[];
  requireEvidence: boolean;
  requireHeroImage: boolean;
  requireShortDescription: boolean;
}

/**
 * Category-specific minimums for public product pages.
 * Offers are never required. Drop is never required for watches.
 */
export const PUBLISH_REQUIREMENTS: PublishRequirement[] = [
  {
    categoryId: "cat-running-shoes",
    requiredSpecKeys: ["drop", "cushionLevel", "stability", "terrain", "plateMaterial"],
    requireEvidence: true,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-gps-watches",
    requiredSpecKeys: ["displayType", "multiBandGps", "heartRate"],
    requireEvidence: true,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-hrm",
    requiredSpecKeys: ["type", "connectivity"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-packs-vests",
    requiredSpecKeys: ["raceSuitability"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-hydration",
    requiredSpecKeys: ["type"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-running-belts",
    requiredSpecKeys: ["phoneCompatible"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-running-clothing",
    requiredSpecKeys: ["fit"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-running-socks",
    requiredSpecKeys: ["height"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-headphones",
    requiredSpecKeys: ["type"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-sunglasses",
    requiredSpecKeys: ["lensType"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-running-lights",
    requiredSpecKeys: ["lumens"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-safety",
    requiredSpecKeys: ["type"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-recovery-gear",
    requiredSpecKeys: ["type"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
  {
    categoryId: "cat-accessories",
    requiredSpecKeys: ["type"],
    requireEvidence: false,
    requireHeroImage: true,
    requireShortDescription: true,
  },
];

export interface PublishCheckResult {
  ok: boolean;
  tier: CompletenessTier;
  reasons: string[];
  missingSpecs: string[];
}

function hasHero(product: Product): boolean {
  return product.images.some(
    (img) => img.usageType === "hero" || img.type === "image",
  );
}

function specPresent(product: Product, key: string): boolean {
  const v = product.specifications[key];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

export function getPublishRequirement(categoryId: string): PublishRequirement | undefined {
  return PUBLISH_REQUIREMENTS.find((r) => r.categoryId === categoryId);
}

/**
 * Soft publish gate for catalog QA. Does not replace isPubliclyVisible —
 * that remains the production publication resolver.
 */
export function canPublishProduct(product: Product): PublishCheckResult {
  const reasons: string[] = [];
  const missingSpecs: string[] = [];
  const req = getPublishRequirement(product.categoryId);

  if (!product.brandId) reasons.push("missing brand");
  if (!product.categoryId) reasons.push("missing category");
  if (!product.lifecycleStatus) reasons.push("missing lifecycle status");
  if (!product.shortDescription?.trim()) reasons.push("missing short description");

  if (req?.requireHeroImage && !hasHero(product)) {
    reasons.push("missing hero image (or accepted fallback)");
  }
  if (req?.requireEvidence && (!product.evidenceIds || product.evidenceIds.length === 0)) {
    reasons.push("missing evidence");
  }
  if (req) {
    for (const key of req.requiredSpecKeys) {
      if (!specPresent(product, key)) {
        missingSpecs.push(key);
        reasons.push(`missing required spec: ${key}`);
      }
    }
  }

  const defs = allSpecificationDefinitions.filter(
    (d) => d.categoryId === product.categoryId,
  );
  const filled = defs.filter((d) => specPresent(product, d.key)).length;
  const ratio = defs.length ? filled / defs.length : 0;

  let tier: CompletenessTier = "insufficient";
  if (reasons.length === 0 && ratio >= 0.7) tier = "complete";
  else if (reasons.length === 0 && ratio >= 0.4) tier = "usable";
  else if (product.shortDescription && hasHero(product) && product.brandId) tier = "partial";

  return {
    ok: reasons.length === 0,
    tier,
    reasons,
    missingSpecs,
  };
}

export function coreSpecCoverage(
  products: Product[],
  categoryId: string,
  keys: string[],
): Record<string, number> {
  const inCat = products.filter(
    (p) => p.categoryId === categoryId && p.status === "published",
  );
  const out: Record<string, number> = {};
  for (const key of keys) {
    if (!inCat.length) {
      out[key] = 0;
      continue;
    }
    const withVal = inCat.filter((p) => specPresent(p, key)).length;
    out[key] = Math.round((withVal / inCat.length) * 100);
  }
  return out;
}

export function listCategorySpecDefs(categoryId: string): SpecificationDefinition[] {
  return allSpecificationDefinitions.filter((d) => d.categoryId === categoryId);
}
