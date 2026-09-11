/**
 * Sport-scoped Guides Hub editorial configuration.
 * Prefer guide fields when present; this config fills gaps and hub imagery.
 */

import type { BuyingGuide } from "@/domain/editorial/types";

export type BuyingGuideType = NonNullable<BuyingGuide["guideType"]>;

export interface GuideHubMeta {
  guideType: BuyingGuideType;
  topicIds: string[];
  featured?: boolean;
  startHere?: boolean;
  priority?: number;
  hubImageSrc?: string;
  hubImageAlt?: string;
}

export interface GuidesHubSportConfig {
  sportId: string;
  sportSlug: string;
  eyebrow: string;
  title: string;
  deck: string;
  primaryCta: { label: string; href: string };
  featuredSlug?: string;
  startHereSlugs: string[];
  topicOrder: string[];
  relatedBestGuideIds: string[];
  toolSlugs: string[];
  compareHref?: string;
  finderPanel: {
    title: string;
    body: string;
    ctaLabel: string;
    href: string;
  };
  /** Slug → hub metadata */
  guideMeta: Record<string, GuideHubMeta>;
}

const runningMeta: Record<string, GuideHubMeta> = {
  "how-to-choose-running-shoes": {
    guideType: "buying",
    topicIds: ["topic-running-shoes"],
    featured: true,
    startHere: true,
    priority: 1,
    hubImageSrc: "/images/home/guide-running-shoes.jpg",
    hubImageAlt: "Modern cushioned running shoes on a studio surface",
  },
  "running-shoe-terminology": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes"],
    startHere: true,
    priority: 2,
    hubImageSrc: "/images/running/products/novablast-6-hero.jpg",
    hubImageAlt: "Running shoe used for terminology education",
  },
  "running-shoe-cushioning": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes"],
    startHere: true,
    priority: 3,
    hubImageSrc: "/images/running/products/bondi-9-hero.jpg",
    hubImageAlt: "Max-cushion running shoe midsole profile",
  },
  "running-shoe-rotation": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes", "topic-training-racing"],
    startHere: true,
    priority: 4,
    hubImageSrc: "/images/running/products/pegasus-42-hero.jpg",
    hubImageAlt: "Daily trainer used in a shoe rotation",
  },
  "stability-shoes-explained": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes"],
    priority: 5,
    hubImageSrc: "/images/running/products/kayano-32-hero.jpg",
    hubImageAlt: "ASICS GEL-Kayano 32 stability running shoe",
  },
  "running-shoe-drop": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes"],
    priority: 6,
    hubImageSrc: "/images/running/products/clifton-10-hero.jpg",
    hubImageAlt: "Running shoe side profile illustrating stack geometry",
  },
  "carbon-vs-nylon-plates": {
    guideType: "comparison",
    topicIds: ["topic-running-shoes", "topic-training-racing"],
    priority: 7,
    hubImageSrc: "/images/running/products/vaporfly-4-hero.jpg",
    hubImageAlt: "Carbon-plated racing shoe",
  },
  "what-is-a-daily-trainer": {
    guideType: "explainer",
    topicIds: ["topic-running-shoes"],
    priority: 8,
    hubImageSrc: "/images/running/products/ghost-18.png",
    hubImageAlt: "Daily trainer running shoe",
  },
  "road-vs-trail-running-shoes": {
    guideType: "comparison",
    topicIds: ["topic-running-shoes"],
    priority: 9,
    hubImageSrc: "/images/running/products/peregrine-15-hero.jpg",
    hubImageAlt: "Trail running shoe",
  },
  "how-to-choose-running-watch": {
    guideType: "buying",
    topicIds: ["topic-wearables"],
    priority: 10,
    hubImageSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
    hubImageAlt: "Garmin Forerunner 970 GPS running watch",
  },
  "multi-band-gps-running-watches": {
    guideType: "explainer",
    topicIds: ["topic-wearables"],
    priority: 11,
    hubImageSrc: "/images/watches/products/coros-pace-pro-hero.png",
    hubImageAlt: "COROS Pace Pro multi-band GPS running watch",
  },
  "how-to-choose-heart-rate-monitor": {
    guideType: "buying",
    topicIds: ["topic-wearables"],
    priority: 12,
    hubImageSrc: "/images/hrm/products/polar-h10-hero.png",
    hubImageAlt: "Polar H10 chest heart-rate monitor",
  },
  "how-to-choose-running-hydration-vest": {
    guideType: "buying",
    topicIds: ["topic-hydration"],
    priority: 13,
    hubImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    hubImageAlt: "Salomon ADV Skin 12 running hydration vest",
  },
  "hydration-vest-vs-running-belt": {
    guideType: "comparison",
    topicIds: ["topic-hydration"],
    priority: 14,
    hubImageSrc: "/images/packs/products/nathan-vaporair-2-hero.png",
    hubImageAlt: "Nathan VaporAir 2 running hydration vest",
  },
  "how-to-choose-running-headlamp": {
    guideType: "buying",
    topicIds: ["topic-apparel-accessories"],
    priority: 15,
    hubImageSrc: "/images/headlamps/products/petzl-swift-rl-hero.jpg",
    hubImageAlt: "Petzl Swift RL running headlamp",
  },
  "open-ear-vs-in-ear-running-headphones": {
    guideType: "comparison",
    topicIds: ["topic-apparel-accessories"],
    priority: 16,
    hubImageSrc: "/images/headphones/products/shokz-openrun-pro-2-hero.png",
    hubImageAlt: "Shokz OpenRun Pro 2 open-ear running headphones",
  },
  // Orphan fuel / recovery seeds — now visible on the hub
  "running-gels-explained": {
    guideType: "explainer",
    topicIds: ["topic-fuel-nutrition"],
    priority: 17,
    hubImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    hubImageAlt: "Long-run fuel context for runners",
  },
  "how-to-carry-fuel-on-long-runs": {
    guideType: "decision",
    topicIds: ["topic-fuel-nutrition", "topic-hydration"],
    priority: 18,
    hubImageSrc: "/images/running/accessories/flipbelt-classic-hero.jpg",
    hubImageAlt: "Running belt used to carry fuel",
  },
  "gel-vs-drink-mix-vs-chews": {
    guideType: "comparison",
    topicIds: ["topic-fuel-nutrition"],
    priority: 19,
    hubImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    hubImageAlt: "Endurance fuel formats for runners",
  },
  "caffeine-in-running-fuel-explained": {
    guideType: "explainer",
    topicIds: ["topic-fuel-nutrition"],
    priority: 20,
    hubImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    hubImageAlt: "Caffeine fuel context for runners",
  },
  "massage-guns-explained": {
    guideType: "explainer",
    topicIds: ["topic-recovery"],
    priority: 21,
    hubImageSrc: "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
    hubImageAlt: "Theragun Mini massage gun",
  },
  "foam-rolling-for-runners": {
    guideType: "explainer",
    topicIds: ["topic-recovery"],
    priority: 22,
    hubImageSrc: "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
    hubImageAlt: "Recovery tools context for runners",
  },
  "recovery-tools-what-evidence-shows": {
    guideType: "technical",
    topicIds: ["topic-recovery"],
    priority: 23,
    hubImageSrc: "/images/running/accessories/oofos-ooriginal-hero.jpg",
    hubImageAlt: "Recovery sandal for post-run comfort",
  },
  // Density batch
  "optical-wrist-hr-vs-chest-strap": {
    guideType: "comparison",
    topicIds: ["topic-wearables"],
    priority: 24,
    hubImageSrc: "/images/hrm/products/polar-h10-hero.png",
    hubImageAlt: "Polar H10 chest heart-rate monitor",
  },
  "running-watch-battery-life-explained": {
    guideType: "explainer",
    topicIds: ["topic-wearables"],
    priority: 25,
    hubImageSrc: "/images/watches/products/coros-pace-4-hero.png",
    hubImageAlt: "COROS Pace 4 GPS running watch",
  },
  "maps-navigation-running-watches": {
    guideType: "explainer",
    topicIds: ["topic-wearables"],
    priority: 26,
    hubImageSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
    hubImageAlt: "Garmin Forerunner 970 GPS running watch",
  },
  "beginner-vs-advanced-running-watch": {
    guideType: "decision",
    topicIds: ["topic-wearables"],
    priority: 27,
    hubImageSrc: "/images/watches/products/coros-pace-3-hero.jpg",
    hubImageAlt: "COROS Pace 3 GPS running watch",
  },
  "soft-flasks-vs-bladders-explained": {
    guideType: "comparison",
    topicIds: ["topic-hydration"],
    priority: 28,
    hubImageSrc: "/images/hydration/products/hydrapak-softflask-speed-500-hero.jpg",
    hubImageAlt: "HydraPak soft flask for running",
  },
  "how-to-choose-running-belt": {
    guideType: "buying",
    topicIds: ["topic-hydration"],
    priority: 29,
    hubImageSrc: "/images/running/accessories/flipbelt-classic-hero.jpg",
    hubImageAlt: "FlipBelt classic running belt",
  },
  "handheld-bottles-for-running": {
    guideType: "buying",
    topicIds: ["topic-hydration"],
    priority: 30,
    hubImageSrc: "/images/hydration/products/nathan-exoshot-2-hero.jpg",
    hubImageAlt: "Nathan ExoShot handheld running bottle",
  },
  "hydration-for-marathon-training": {
    guideType: "decision",
    topicIds: ["topic-hydration", "topic-training-racing"],
    priority: 31,
    hubImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    hubImageAlt: "Salomon ADV Skin running hydration vest",
  },
  "how-to-choose-running-socks": {
    guideType: "buying",
    topicIds: ["topic-apparel-accessories"],
    priority: 32,
    hubImageSrc: "/images/running/accessories/feetures-elite-light-cushion-hero.jpg",
    hubImageAlt: "Feetures Elite Light Cushion running socks",
  },
  "running-jackets-explained": {
    guideType: "explainer",
    topicIds: ["topic-apparel-accessories"],
    priority: 33,
    hubImageSrc: "/images/catalog/fallbacks/clothing.svg",
    hubImageAlt: "Running jacket weather layer",
  },
  "hot-weather-running-apparel": {
    guideType: "decision",
    topicIds: ["topic-apparel-accessories"],
    priority: 34,
    hubImageSrc: "/images/running/best-hub/best-running-socks.jpg",
    hubImageAlt: "Warm-weather running apparel context",
  },
  "winter-layering-for-runners": {
    guideType: "setup",
    topicIds: ["topic-apparel-accessories"],
    priority: 35,
    hubImageSrc: "/images/catalog/fallbacks/clothing.svg",
    hubImageAlt: "Running jacket for cool weather",
  },
  "shoe-jobs-by-session-type": {
    guideType: "decision",
    topicIds: ["topic-training-racing", "topic-running-shoes"],
    priority: 36,
    hubImageSrc: "/images/running/products/pegasus-42-hero.jpg",
    hubImageAlt: "Nike Pegasus daily trainer",
  },
  "first-marathon-gear-checklist": {
    guideType: "setup",
    topicIds: ["topic-training-racing"],
    priority: 37,
    hubImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    hubImageAlt: "Marathon training gear context",
  },
  "trail-race-kit-essentials": {
    guideType: "setup",
    topicIds: ["topic-training-racing"],
    priority: 38,
    hubImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    hubImageAlt: "Trail race hydration vest",
  },
  "beginner-running-gear-stack": {
    guideType: "setup",
    topicIds: ["topic-training-racing"],
    priority: 39,
    hubImageSrc: "/images/home/guide-running-shoes.jpg",
    hubImageAlt: "Beginner running shoes",
  },
  "when-to-use-a-massage-gun": {
    guideType: "decision",
    topicIds: ["topic-recovery"],
    priority: 40,
    hubImageSrc: "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
    hubImageAlt: "Theragun Mini massage gun",
  },
  "recovery-sandals-for-runners": {
    guideType: "buying",
    topicIds: ["topic-recovery"],
    priority: 41,
    hubImageSrc: "/images/running/accessories/oofos-ooriginal-hero.jpg",
    hubImageAlt: "OOFOS OOriginal recovery sandal",
  },
  "anti-chafe-for-runners": {
    guideType: "buying",
    topicIds: ["topic-apparel-accessories"],
    priority: 42,
    hubImageSrc: "/images/running/accessories/body-glide-original-hero.png",
    hubImageAlt: "Body Glide Original anti-chafe stick",
  },
};

export const RUNNING_GUIDES_HUB_CONFIG: GuidesHubSportConfig = {
  sportId: "sport-running",
  sportSlug: "running",
  eyebrow: "Running guides",
  title: "Understand the gear. Choose with confidence.",
  deck: "Practical buying guides, explainers and comparison advice to help you understand running gear before you buy.",
  primaryCta: {
    label: "Start with running shoes",
    href: "/guides/how-to-choose-running-shoes",
  },
  featuredSlug: "how-to-choose-running-shoes",
  startHereSlugs: [
    "how-to-choose-running-shoes",
    "stability-shoes-explained",
    "running-shoe-drop",
    "running-shoe-cushioning",
  ],
  topicOrder: [
    "topic-running-shoes",
    "topic-wearables",
    "topic-hydration",
    "topic-apparel-accessories",
    "topic-fuel-nutrition",
    "topic-recovery",
    "topic-training-racing",
  ],
  relatedBestGuideIds: [
    "best-running-shoes",
    "best-daily-trainers",
    "best-running-shoes-long-runs",
    "best-stability-running-shoes",
  ],
  toolSlugs: [
    "running-shoe-finder",
    "shoe-rotation-planner",
  ],
  compareHref: "/compare?category=running-shoes",
  finderPanel: {
    title: "Ready to choose?",
    body: "Use the Running Shoe Finder to turn what you’ve learned into a personalized shortlist — based on how you run, not a medical gait exam.",
    ctaLabel: "Running Shoe Finder →",
    href: "/tools/running-shoe-finder",
  },
  guideMeta: runningMeta,
};

const HUB_CONFIGS: GuidesHubSportConfig[] = [RUNNING_GUIDES_HUB_CONFIG];

export function getGuidesHubSportConfig(
  sportSlug?: string,
): GuidesHubSportConfig | undefined {
  if (!sportSlug) return undefined;
  return HUB_CONFIGS.find((c) => c.sportSlug === sportSlug);
}

export function enrichBuyingGuideWithHubMeta(
  guide: BuyingGuide,
  meta?: GuideHubMeta,
): BuyingGuide {
  if (!meta) return guide;
  return {
    ...guide,
    guideType: guide.guideType ?? meta.guideType,
    topicIds: guide.topicIds?.length ? guide.topicIds : meta.topicIds,
    featured: guide.featured ?? meta.featured,
    startHere: guide.startHere ?? meta.startHere,
    priority: guide.priority ?? meta.priority,
    hubImageSrc: guide.hubImageSrc ?? meta.hubImageSrc,
    hubImageAlt: guide.hubImageAlt ?? meta.hubImageAlt,
  };
}
