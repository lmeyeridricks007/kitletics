import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGIONS } from "@/domain/shared/types";

/**
 * Launch commerce posture from pre-launch audit (06-media-offers-trust).
 * Do not invent parity across markets — NL is primary until Offer data improves.
 *
 * Update when Offer inventory materially changes (see docs/padel/PADEL-COMMERCE-AUDIT.md).
 *
 * | Region | Posture |
 * | NL     | primary |
 * | DE/UK  | partial |
 * | US     | limited |
 * | FR     | limited (Amazon.fr retailer ready; listings sparse) |
 * | BE/ZA  | none until verified listing Offers exist |
 */
export type RegionCommerceCoverage =
  | "primary"
  | "partial"
  | "limited"
  | "none";

export const PRIMARY_COMMERCE_REGION: RegionCode = DEFAULT_REGION;

/** Static launch readiness — update when Offer inventory materially changes. */
export const REGION_COMMERCE_COVERAGE: Record<
  RegionCode,
  RegionCommerceCoverage
> = {
  NL: "primary",
  DE: "partial",
  UK: "partial",
  US: "limited",
  FR: "limited",
  BE: "none",
  ZA: "none",
};

const COVERAGE_HINT: Record<RegionCommerceCoverage, string> = {
  primary: "Strong coverage",
  partial: "Limited offers",
  limited: "Very limited offers",
  none: "No verified offers",
};

export function regionCommerceCoverage(
  code: RegionCode,
): RegionCommerceCoverage {
  return REGION_COMMERCE_COVERAGE[code];
}

/** Short label for region switcher — never implies equal retailer coverage. */
export function regionCommerceCoverageHint(code: RegionCode): string {
  return COVERAGE_HINT[REGION_COMMERCE_COVERAGE[code]];
}

export function regionHasVerifiedOffersConfigured(code: RegionCode): boolean {
  const coverage = REGION_COMMERCE_COVERAGE[code];
  return coverage === "primary" || coverage === "partial";
}

export function allRegionsWithCommerceHints(): {
  code: RegionCode;
  coverage: RegionCommerceCoverage;
  coverageHint: string;
}[] {
  return REGIONS.map((code) => ({
    code,
    coverage: REGION_COMMERCE_COVERAGE[code],
    coverageHint: COVERAGE_HINT[REGION_COMMERCE_COVERAGE[code]],
  }));
}

/** Neutral empty-state copy when the active region has no Offer rows. */
export const NO_REGIONAL_OFFERS_MESSAGE =
  "No verified Netherlands-shipping retailer is currently available.";
