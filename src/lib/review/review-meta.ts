import type { ReviewType } from "@/domain/editorial/types";

export const REVIEW_TYPE_META: Record<
  ReviewType,
  { label: string; shortLabel: string; description: string }
> = {
  "first-hand-test": {
    label: "First-Hand Tested",
    shortLabel: "First-Hand Tested",
    description:
      "Used only when Kitletics or an identified reviewer personally tested the product and personal-test evidence is on the page. Kitletics currently publishes no first-hand reviews.",
  },
  "expert-research": {
    label: "Expert Research Review",
    shortLabel: "Expert Research",
    description:
      "How we assessed this product: published specs, catalog comparisons, and editorial research — not hands-on testing unless the page says otherwise.",
  },
  hybrid: {
    label: "Tested + Guide",
    shortLabel: "Tested + Guide",
    description:
      "Personal testing plus research — requires the same personal-test evidence gate as first-hand. Not used without that evidence.",
  },
};

export const PRODUCT_SOURCE_LABELS: Record<string, string> = {
  "purchased-by-kitletics": "Purchased by Kitletics",
  "purchased-by-reviewer": "Purchased by the reviewer",
  "provided-by-brand": "Provided by the manufacturer",
  "loaned-by-brand": "Loaned by the brand",
  "retailer-sample": "Retailer sample",
  other: "Other arrangement",
};
