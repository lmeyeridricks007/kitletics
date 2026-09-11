import type { FreshnessPolicy, MaintenanceEventType } from "@/domain/freshness/types";

const SPEC_TRIGGERS: MaintenanceEventType[] = [
  "SPECIFICATION_CHANGED",
  "SOURCE_CONFLICT",
  "MANUFACTURER_PAGE_CHANGED",
];

/** Category-aware freshness policies — not a single global expiry */
export const FRESHNESS_POLICIES: FreshnessPolicy[] = [
  {
    id: "product-specs-default",
    entityType: "product",
    freshForDays: 90,
    reviewSoonAfterDays: 120,
    staleAfterDays: 180,
    triggers: SPEC_TRIGGERS,
    description: "Core Product specifications",
  },
  {
    id: "product-specs-running-shoes",
    entityType: "product",
    categoryId: "cat-running-shoes",
    freshForDays: 90,
    reviewSoonAfterDays: 120,
    staleAfterDays: 180,
    triggers: [...SPEC_TRIGGERS, "NEW_GENERATION_DISCOVERED"],
    description: "Running shoe specs",
  },
  {
    id: "product-lifecycle",
    entityType: "product",
    field: "lifecycleStatus",
    freshForDays: 30,
    reviewSoonAfterDays: 45,
    staleAfterDays: 90,
    triggers: [
      "NEW_GENERATION_DISCOVERED",
      "PRODUCT_STATUS_CHANGED",
      "SOURCE_REMOVED",
    ],
    description: "Lifecycle reviewed more often around generation changes",
  },
  {
    id: "evidence-manufacturer",
    entityType: "evidence",
    freshForDays: 90,
    reviewSoonAfterDays: 150,
    staleAfterDays: 240,
    triggers: ["SOURCE_REMOVED", "MANUFACTURER_PAGE_CHANGED"],
  },
  {
    id: "recommendation",
    entityType: "recommendation",
    freshForDays: 90,
    reviewSoonAfterDays: 120,
    staleAfterDays: 180,
    triggers: [
      "RECOMMENDATION_DEPENDENCY_CHANGED",
      "SPECIFICATION_CHANGED",
      "NEW_EVIDENCE",
    ],
  },
  {
    id: "best-guide",
    entityType: "best-guide",
    freshForDays: 60,
    reviewSoonAfterDays: 90,
    staleAfterDays: 150,
    triggers: [
      "GUIDE_DEPENDENCY_CHANGED",
      "NEW_GENERATION_DISCOVERED",
      "NEW_PRODUCT_DISCOVERED",
    ],
  },
  {
    id: "comparison",
    entityType: "comparison",
    freshForDays: 90,
    reviewSoonAfterDays: 120,
    staleAfterDays: 180,
    triggers: ["SPECIFICATION_CHANGED", "NEW_GENERATION_DISCOVERED"],
  },
  {
    id: "offer-price",
    entityType: "offer",
    freshForDays: 1,
    reviewSoonAfterDays: 3,
    staleAfterDays: 7,
    triggers: ["OFFER_STALE", "OFFER_CHANGED"],
    description: "Offer prices change quickly",
  },
  {
    id: "media-hero",
    entityType: "media",
    freshForDays: 30,
    reviewSoonAfterDays: 60,
    staleAfterDays: 120,
    triggers: ["MEDIA_BROKEN"],
  },
  {
    id: "padel-racket-specs",
    entityType: "product",
    categoryId: "cat-padel-rackets",
    freshForDays: 120,
    reviewSoonAfterDays: 180,
    staleAfterDays: 270,
    triggers: SPEC_TRIGGERS,
    description: "Padel racket specs (slower cadence)",
  },
];

export function getPolicy(
  entityType: FreshnessPolicy["entityType"],
  opts?: { categoryId?: string; field?: string },
): FreshnessPolicy {
  if (opts?.field) {
    const byField = FRESHNESS_POLICIES.find(
      (p) => p.entityType === entityType && p.field === opts.field,
    );
    if (byField) return byField;
  }
  if (opts?.categoryId) {
    const byCat = FRESHNESS_POLICIES.find(
      (p) => p.entityType === entityType && p.categoryId === opts.categoryId,
    );
    if (byCat) return byCat;
  }
  const fallback = FRESHNESS_POLICIES.find(
    (p) => p.entityType === entityType && !p.categoryId && !p.field,
  );
  if (fallback) return fallback;
  return {
    id: "unknown-fallback",
    entityType,
    freshForDays: 90,
    reviewSoonAfterDays: 120,
    staleAfterDays: 180,
    triggers: [],
  };
}

/** Brand monitoring tiers — not a public quality ranking */
export const BRAND_MONITORING_TIERS: Record<
  string,
  { tier: "tier-1" | "tier-2" | "tier-3"; cadenceDays: number }
> = {
  "brand-asics": { tier: "tier-1", cadenceDays: 7 },
  "brand-nike": { tier: "tier-1", cadenceDays: 7 },
  "brand-hoka": { tier: "tier-1", cadenceDays: 7 },
  "brand-brooks": { tier: "tier-1", cadenceDays: 7 },
  "brand-garmin": { tier: "tier-1", cadenceDays: 14 },
  "brand-bullpadel": { tier: "tier-2", cadenceDays: 14 },
  "brand-nox": { tier: "tier-2", cadenceDays: 14 },
};

export function getBrandMonitoringTier(brandId: string) {
  return (
    BRAND_MONITORING_TIERS[brandId] ?? {
      tier: "tier-3" as const,
      cadenceDays: 30,
    }
  );
}
