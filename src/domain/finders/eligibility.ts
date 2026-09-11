import type { Product } from "@/domain/products/types";
import type {
  EligibilityExclusion,
  EligibilityResult,
  FinderNormalizedProfile,
} from "@/domain/finders/types";
import type { SpecValue } from "@/domain/products/types";

function asArray(value: SpecValue | undefined): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

/**
 * Hard eligibility only — preference mismatches are soft scores.
 *
 * AFFILIATE NEUTRALITY: affiliate status / commission / retailer payout
 * must never appear in eligibility or scoring.
 */
export function evaluateEligibility(
  product: Product,
  profile: FinderNormalizedProfile,
): EligibilityResult {
  const exclusions: EligibilityExclusion[] = [];

  if (product.status !== "published") {
    exclusions.push({
      ruleId: "unpublished",
      reason: "Product is not published",
    });
  }

  if (product.categoryId !== profile.categoryId) {
    const allowed = profile.categoryIds ?? [profile.categoryId];
    if (!allowed.includes(product.categoryId)) {
      exclusions.push({
        ruleId: "wrong-category",
        reason: "Product category does not match finder",
      });
    }
  }

  if (product.lifecycleStatus === "upcoming") {
    exclusions.push({
      ruleId: "upcoming",
      reason: "Upcoming products are excluded from standard recommendations",
    });
  }

  if (product.lifecycleStatus === "discontinued") {
    exclusions.push({
      ruleId: "discontinued",
      reason: "Discontinued products are excluded from top recommendations",
    });
  }

  // Terrain hard exclusion: trail-only users need trail-capable shoes
  if (profile.terrain === "trail") {
    const terrains = asArray(product.specifications.terrain as SpecValue);
    const trailOk =
      terrains.includes("trail") || terrains.includes("mixed");
    if (terrains.length > 0 && !trailOk) {
      exclusions.push({
        ruleId: "terrain-trail",
        reason: "Road-focused shoe does not support trail terrain requirement",
      });
    }
  }

  if (profile.terrain === "road" || profile.terrain === "treadmill") {
    const terrains = asArray(product.specifications.terrain as SpecValue);
    // Trail-only shoes excluded for road/treadmill users
    const trailOnly =
      terrains.length > 0 &&
      terrains.every((t) => t === "trail");
    if (trailOnly) {
      exclusions.push({
        ruleId: "terrain-road",
        reason: "Trail-only shoe is a poor fit for primarily road/treadmill use",
      });
    }
  }

  // Fit / sizing range — hard exclude when user chose men or women specifically
  if (
    profile.sizingRange === "men" ||
    profile.sizingRange === "women" ||
    profile.sizingRange === "unisex"
  ) {
    const fits = asArray(product.specifications.genderFit as SpecValue);
    if (fits.length > 0 && !fits.includes(profile.sizingRange)) {
      exclusions.push({
        ruleId: "sizing-range",
        reason: `Shoe is not listed in ${profile.sizingRange} sizing`,
      });
    }
  }

  // Explicit wide / extra-wide: hard exclude known incompatible
  if (profile.width === "wide" || profile.width === "extra-wide") {
    const widths = asArray(product.specifications.widthOptions as SpecValue);
    if (widths.length > 0) {
      const ok =
        profile.width === "extra-wide"
          ? widths.includes("extra-wide")
          : widths.includes("wide") || widths.includes("extra-wide");
      if (!ok) {
        exclusions.push({
          ruleId: "width-required",
          reason: `Shoe does not list ${profile.width} width options`,
        });
      }
    }
    // Unknown width → do not hard exclude (handled in soft scoring)
  }

  if (profile.width === "narrow") {
    const widths = asArray(product.specifications.widthOptions as SpecValue);
    if (widths.length > 0 && !widths.includes("narrow") && !widths.includes("standard")) {
      exclusions.push({
        ruleId: "width-narrow",
        reason: "Shoe does not list narrow or standard width options",
      });
    }
  }

  // Hard space constraint: product taller than room is ineligible
  if (profile.ceilingHeightCm != null) {
    const heightMm = product.specifications.heightMm;
    if (typeof heightMm === "number") {
      const heightCm = heightMm / 10;
      // Kitletics planning clearance (~5 cm) — not a manufacturer install spec
      if (heightCm + 5 > profile.ceilingHeightCm) {
        exclusions.push({
          ruleId: "ceiling-height",
          reason: `Product height (${Math.round(heightCm)} cm) exceeds room ceiling (${profile.ceilingHeightCm} cm) with planning clearance`,
        });
      }
    }
  }

  return {
    productId: product.id,
    eligible: exclusions.length === 0,
    exclusions,
  };
}
