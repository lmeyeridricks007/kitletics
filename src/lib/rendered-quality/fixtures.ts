/**
 * Permanent regression fixtures — known public failures that must keep failing
 * the detectors. These are not live pages; they lock the gate.
 */

import type { VisiblePage } from "./types";

export const FIXTURE_NOVABLAST_SKU_STAMP: VisiblePage = {
  path: "/reviews/asics-novablast-6",
  url: "https://kitletics.com/reviews/asics-novablast-6",
  template: "review",
  entity: { kind: "review", id: "review-novablast-6", slug: "asics-novablast-6" },
  assembled: true,
  components: [
    {
      id: "testingContext",
      text:
        "skuslugasicsnovablast6 skuidprodnovablast6 255gweightasicsnovablast6 41mmheelstackasicsnovablast6",
    },
  ],
  images: [],
};

export const FIXTURE_CONCATENATED_METHODOLOGY: VisiblePage = {
  path: "/reviews/asics-novablast-6",
  url: "https://kitletics.com/reviews/asics-novablast-6",
  template: "review",
  entity: { kind: "review", id: "review-novablast-6", slug: "asics-novablast-6" },
  assembled: true,
  components: [
    {
      id: "methodology",
      text:
        "255gweight is the concatenated weight token for ASICS Novablast 6 (255g).",
    },
  ],
  images: [],
};

export const FIXTURE_MACHINE_BUY_IF: VisiblePage = {
  path: "/reviews/asics-novablast-6",
  url: "https://kitletics.com/reviews/asics-novablast-6",
  template: "review",
  entity: { kind: "review", id: "review-novablast-6", slug: "asics-novablast-6" },
  assembled: true,
  decision: {
    bestFor: ["Daily training with a soft, energetic ride."],
    notIdealFor: ["Runners who need a stability last."],
    buyIf: [
      "Novablast 6 fits buyers who already decided the lane is tempo trainer.",
      "You're looking for a daily trainer.",
    ],
    skipIf: [
      "I'd pause if you need a stability last most days.",
      "You'd skip it when race-day snap is the actual job.",
    ],
    pros: ["Soft daily foam", "Energetic ride"],
    cons: ["Not a plated racer", "Not a stability shoe"],
  },
  components: [
    {
      id: "buyIf[0]",
      text: "Novablast 6 fits buyers who already decided the lane is tempo trainer.",
    },
  ],
  images: [],
};

export const FIXTURE_PADEL_RUNNING_WATCH_IMAGE: VisiblePage = {
  path: "/guides/how-to-choose-running-watch",
  url: "https://kitletics.com/guides/how-to-choose-running-watch",
  template: "buying-guide",
  entity: { kind: "guide", id: "guide-watch", slug: "how-to-choose-running-watch" },
  assembled: true,
  components: [{ id: "title", text: "How to Choose a Running Watch" }],
  images: [
    {
      src: "/images/home/guide-how-to-choose.jpg",
      alt: "How to choose",
      component: "guide.hero",
      placement: "hero",
    },
  ],
};

export const FIXTURE_SKYLINE_WATCH_GUIDE: VisiblePage = {
  path: "/best/running-watches",
  url: "https://kitletics.com/best/running-watches",
  template: "best-guide",
  entity: { kind: "best-guide", id: "best-running-watches", slug: "running-watches" },
  assembled: true,
  components: [{ id: "title", text: "Best Running Watches" }],
  images: [
    {
      src: "/images/brands/heroes/urban-dusk.jpg",
      alt: "City skyline at dusk",
      component: "best.hero",
      placement: "hero",
    },
  ],
};

export const FIXTURE_WRONG_PRODUCT_CARD: VisiblePage = {
  path: "/products/nike-vomero-18",
  url: "https://kitletics.com/products/nike-vomero-18",
  template: "product",
  entity: { kind: "product", id: "prod-vomero-18", slug: "nike-vomero-18" },
  assembled: true,
  components: [{ id: "title", text: "Nike Vomero 18" }],
  images: [
    {
      src: "/images/running/products/asics-gel-nimbus-27/asics-gel-nimbus-27-hero.jpg",
      alt: "ASICS Gel-Nimbus 27",
      component: "pdp.gallery",
      placement: "primary",
    },
  ],
};

export const REGRESSION_FIXTURES: VisiblePage[] = [
  FIXTURE_NOVABLAST_SKU_STAMP,
  FIXTURE_CONCATENATED_METHODOLOGY,
  FIXTURE_MACHINE_BUY_IF,
  FIXTURE_PADEL_RUNNING_WATCH_IMAGE,
  FIXTURE_SKYLINE_WATCH_GUIDE,
  FIXTURE_WRONG_PRODUCT_CARD,
];
