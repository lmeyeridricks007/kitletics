/**
 * Editorial Completion 46 — consolidations applied after sitewide intent audit.
 * Prefer keep + differentiate. Only redirect/hold when two weak URLs share one intent.
 */
export type IntentConsolidationAction =
  | "keep"
  | "hold"
  | "redirect"
  | "canonical"
  | "merge";

export interface IntentConsolidation {
  action: IntentConsolidationAction;
  from: string;
  to?: string;
  reason: string;
}

/**
 * Applied consolidations (P46). Soft-gated categories and review uniqueness holds
 * live in their own modules — listed here only when this audit owns the decision.
 */
export const P46_INTENT_CONSOLIDATIONS: IntentConsolidation[] = [
  // Complementary roles — explicit KEEP (no URL removal)
  {
    action: "keep",
    from: "/best/running-shoes",
    to: "/running/shoes",
    reason:
      "Best = ranked role shortlist; Category = browse/filter grid. Differentiated via P46 category-mirror copy + browse CTA.",
  },
  {
    action: "keep",
    from: "/running/shoes/daily-trainers",
    to: "/best/daily-trainers",
    reason:
      "Listing = type browse + education; Best = ranked shortlist. Linked via listing bestGuideSlug.",
  },
  {
    action: "keep",
    from: "/guides/handheld-bottles-for-running",
    to: "/best/handheld-running-bottles",
    reason:
      "Guide = learn when/how; Best = shortlist. P46 learnFocus + Best CTA wired.",
  },
  {
    action: "keep",
    from: "/guides/stability-shoes-explained",
    to: "/best/stability-running-shoes",
    reason: "Guide explains systems; Best ranks stability shoes.",
  },
  {
    action: "keep",
    from: "/best/running-hydration-vests",
    to: "/best/hydration-vests-trail",
    reason:
      "Road/general vest shortlist vs trail-specific vest shortlist (P39 + P46 sibling links).",
  },
  {
    action: "keep",
    from: "/best/race-shoes",
    to: "/best/carbon-plated-running-shoes",
    reason:
      "Race-day distance roles vs carbon-plate taxonomy (P39 shortlist split).",
  },
  {
    action: "keep",
    from: "/best/running-watches-beginners",
    to: "/best/running-watches-budget",
    reason:
      "Simplicity vs price-ceiling constraints; shared entry GPS pool expected (P39).",
  },
  {
    action: "keep",
    from: "/compare/*",
    to: "/products/*/alternatives",
    reason:
      "Comparison = A vs B; Alternatives = replace-X graph. Complementary when copy stays role-correct.",
  },
  // Soft-gate holds (already enforced in category-href) — recorded for intent map
  {
    action: "keep",
    from: "/running/accessories",
    to: "/best/running-anti-chafe",
    reason:
      "Specialist anti-chafe shelf (Fix 58) — category browse + Best ranking; not a general accessories mall.",
  },
];
