/**
 * Editorial Fix 40 — Buying Guide journey enrichment:
 * relatedBestGuideIds / relatedToolSlugs + long-form /best decisionLinks.
 */

import type { BuyingGuide } from "@/domain/editorial/types";

type DecisionLinkConfig = {
  guideSlug: string;
  decisionLinks?: { label: string; href: string }[];
};

export interface GuideP40JourneyLink {
  /** Best guide entity ids (e.g. best-running-jackets) */
  relatedBestGuideIds: string[];
  /** Best URL slugs for /best/<slug> decisionLinks */
  bestSlugs: string[];
  /** Labels paired with bestSlugs (same length) */
  bestLabels: string[];
  /** Tools to add only when the guide currently has none */
  relatedToolSlugs?: string[];
}

/**
 * Journey targets for guides that previously lacked Best CTAs
 * (and a few that already have Best ids — enrichment is idempotent).
 */
export const GUIDE_P40_JOURNEY_BY_SLUG: Record<string, GuideP40JourneyLink> = {
  "optical-wrist-hr-vs-chest-strap": {
    relatedBestGuideIds: [
      "best-heart-rate-monitors-running",
      "best-heart-rate-monitors-chest-straps",
    ],
    bestSlugs: [
      "heart-rate-monitors-running",
      "heart-rate-monitors-chest-straps",
    ],
    bestLabels: [
      "Best heart-rate monitors for running →",
      "Best chest strap HR monitors →",
    ],
    relatedToolSlugs: ["running-hrm-finder"],
  },
  "running-watch-battery-life-explained": {
    relatedBestGuideIds: ["best-running-watches"],
    bestSlugs: ["running-watches"],
    bestLabels: ["Best running watches →"],
    relatedToolSlugs: ["fitness-watch-finder"],
  },
  "maps-navigation-running-watches": {
    relatedBestGuideIds: [
      "best-running-watches",
      "best-running-watches-trail",
    ],
    bestSlugs: ["running-watches", "running-watches-trail"],
    bestLabels: ["Best running watches →", "Best trail running watches →"],
    relatedToolSlugs: ["fitness-watch-finder"],
  },
  "beginner-vs-advanced-running-watch": {
    relatedBestGuideIds: [
      "best-running-watches",
      "best-running-watches-beginners",
    ],
    bestSlugs: ["running-watches", "running-watches-beginners"],
    bestLabels: [
      "Best running watches →",
      "Best running watches for beginners →",
    ],
    relatedToolSlugs: ["fitness-watch-finder"],
  },
  "soft-flasks-vs-bladders-explained": {
    relatedBestGuideIds: ["best-running-hydration-vests"],
    bestSlugs: ["running-hydration-vests"],
    bestLabels: ["Best running hydration vests →"],
    relatedToolSlugs: ["running-hydration-finder"],
  },
  "how-to-choose-running-belt": {
    relatedBestGuideIds: ["best-running-belts"],
    bestSlugs: ["running-belts"],
    bestLabels: ["Best running belts →"],
    relatedToolSlugs: ["running-hydration-finder"],
  },
  "handheld-bottles-for-running": {
    relatedBestGuideIds: ["best-handheld-running-bottles"],
    bestSlugs: ["handheld-running-bottles"],
    bestLabels: ["Best handheld running bottles →"],
    relatedToolSlugs: ["running-hydration-finder"],
  },
  "hydration-for-marathon-training": {
    relatedBestGuideIds: ["best-hydration-marathon-training"],
    bestSlugs: ["hydration-marathon-training"],
    bestLabels: ["Best hydration for marathon training →"],
    relatedToolSlugs: ["running-hydration-finder"],
  },
  "how-to-choose-running-socks": {
    relatedBestGuideIds: ["best-running-socks"],
    bestSlugs: ["running-socks"],
    bestLabels: ["Best running socks →"],
    relatedToolSlugs: ["running-clothing-finder"],
  },
  "running-jackets-explained": {
    relatedBestGuideIds: ["best-running-jackets"],
    bestSlugs: ["running-jackets"],
    bestLabels: ["Best running jackets →"],
    relatedToolSlugs: ["running-clothing-finder"],
  },
  "hot-weather-running-apparel": {
    relatedBestGuideIds: ["best-running-clothing-hot-weather"],
    bestSlugs: ["running-clothing-hot-weather"],
    bestLabels: ["Best hot-weather running clothing →"],
    relatedToolSlugs: ["running-clothing-finder"],
  },
  "winter-layering-for-runners": {
    relatedBestGuideIds: ["best-running-gear-winter"],
    bestSlugs: ["running-gear-winter"],
    bestLabels: ["Best winter running gear →"],
    relatedToolSlugs: ["running-clothing-finder"],
  },
  "shoe-jobs-by-session-type": {
    relatedBestGuideIds: ["best-running-shoes", "best-daily-trainers"],
    bestSlugs: ["running-shoes", "daily-trainers"],
    bestLabels: ["Best running shoes →", "Best daily trainers →"],
    relatedToolSlugs: ["running-shoe-finder", "shoe-rotation-planner"],
  },
  "first-marathon-gear-checklist": {
    relatedBestGuideIds: ["best-marathon-shoes", "best-running-shoes"],
    bestSlugs: ["marathon-shoes", "running-shoes"],
    bestLabels: ["Best marathon shoes →", "Best running shoes →"],
    relatedToolSlugs: ["running-shoe-finder"],
  },
  "trail-race-kit-essentials": {
    relatedBestGuideIds: [
      "best-hydration-vests-trail",
      "best-trail-running-shoes",
    ],
    bestSlugs: ["hydration-vests-trail", "trail-running-shoes"],
    bestLabels: [
      "Best trail hydration vests →",
      "Best trail running shoes →",
    ],
    relatedToolSlugs: ["running-hydration-finder"],
  },
  "beginner-running-gear-stack": {
    relatedBestGuideIds: [
      "best-running-shoes-beginners",
      "best-running-watches-beginners",
    ],
    bestSlugs: ["running-shoes-beginners", "running-watches-beginners"],
    bestLabels: [
      "Best running shoes for beginners →",
      "Best running watches for beginners →",
    ],
    relatedToolSlugs: ["running-shoe-finder", "fitness-watch-finder"],
  },
  "when-to-use-a-massage-gun": {
    relatedBestGuideIds: ["best-running-recovery-gear"],
    bestSlugs: ["running-recovery-gear"],
    bestLabels: ["Best running recovery gear →"],
    relatedToolSlugs: ["running-recovery-finder"],
  },
  "recovery-sandals-for-runners": {
    relatedBestGuideIds: ["best-running-recovery-gear"],
    bestSlugs: ["running-recovery-gear"],
    bestLabels: ["Best running recovery gear →"],
    relatedToolSlugs: ["running-recovery-finder"],
  },
  "how-to-choose-padel-shoes": {
    relatedBestGuideIds: ["best-padel-rackets"],
    bestSlugs: ["padel-rackets"],
    bestLabels: ["Best padel rackets →"],
    relatedToolSlugs: ["padel-racket-finder"],
  },
  "padel-grips-overgrips-explained": {
    relatedBestGuideIds: ["best-padel-rackets"],
    bestSlugs: ["padel-rackets"],
    bestLabels: ["Best padel rackets →"],
    relatedToolSlugs: ["padel-racket-finder"],
  },
  "how-to-choose-a-tennis-racket": {
    relatedBestGuideIds: ["best-tennis-rackets"],
    bestSlugs: ["tennis-rackets"],
    bestLabels: ["Best tennis rackets →"],
    relatedToolSlugs: ["tennis-racket-finder"],
  },
  "how-to-build-a-home-gym": {
    relatedBestGuideIds: ["best-home-gym-equipment"],
    bestSlugs: ["home-gym-equipment"],
    bestLabels: ["Best home gym equipment →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-to-choose-training-shoes": {
    relatedBestGuideIds: ["best-training-shoes"],
    bestSlugs: ["training-shoes"],
    bestLabels: ["Best training shoes →"],
    relatedToolSlugs: ["training-shoe-finder"],
  },
  "adjustable-vs-fixed-dumbbells": {
    relatedBestGuideIds: ["best-adjustable-dumbbells"],
    bestSlugs: ["adjustable-dumbbells"],
    bestLabels: ["Best adjustable dumbbells →"],
    relatedToolSlugs: ["adjustable-dumbbell-finder"],
  },
  "hyrox-home-training-setup": {
    relatedBestGuideIds: ["best-hyrox-shoes", "best-home-gym-equipment"],
    bestSlugs: ["hyrox-shoes", "home-gym-equipment"],
    bestLabels: ["Best HYROX shoes →", "Best home gym equipment →"],
    relatedToolSlugs: ["hyrox-shoe-finder", "home-gym-builder"],
  },
  "pull-up-bar-mounting-guide": {
    relatedBestGuideIds: ["best-pull-up-bars"],
    bestSlugs: ["pull-up-bars"],
    bestLabels: ["Best pull-up bars →"],
    relatedToolSlugs: ["pull-up-bar-finder"],
  },
  "power-rack-sizing-and-hole-spacing": {
    relatedBestGuideIds: ["best-power-racks"],
    bestSlugs: ["power-racks"],
    bestLabels: ["Best power racks →"],
    relatedToolSlugs: ["power-rack-finder"],
  },
  "how-to-choose-a-power-rack": {
    relatedBestGuideIds: ["best-power-racks"],
    bestSlugs: ["power-racks"],
    bestLabels: ["Best power racks →"],
    relatedToolSlugs: ["power-rack-finder", "home-gym-builder"],
  },
  "how-to-choose-a-weight-bench": {
    relatedBestGuideIds: ["best-adjustable-benches"],
    bestSlugs: ["adjustable-benches"],
    bestLabels: ["Best adjustable benches →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-to-choose-adjustable-dumbbells": {
    relatedBestGuideIds: ["best-adjustable-dumbbells"],
    bestSlugs: ["adjustable-dumbbells"],
    bestLabels: ["Best adjustable dumbbells →"],
    relatedToolSlugs: ["adjustable-dumbbell-finder"],
  },
  "how-to-choose-a-home-treadmill": {
    relatedBestGuideIds: ["best-treadmills-home"],
    bestSlugs: ["treadmills-for-home"],
    bestLabels: ["Best treadmills for home →"],
    relatedToolSlugs: ["treadmill-finder"],
  },
  "how-to-choose-a-rowing-machine": {
    relatedBestGuideIds: ["best-rowing-machines"],
    bestSlugs: ["rowing-machines"],
    bestLabels: ["Best rowing machines →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-much-space-do-you-need-for-a-home-gym": {
    relatedBestGuideIds: ["best-home-gym-equipment"],
    bestSlugs: ["home-gym-equipment"],
    bestLabels: ["Best home gym equipment →"],
    relatedToolSlugs: ["home-gym-builder", "power-rack-finder"],
  },
  "bumper-plates-vs-iron-plates": {
    relatedBestGuideIds: ["best-weight-plates"],
    bestSlugs: ["weight-plates"],
    bestLabels: ["Best weight plates →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-to-choose-hyrox-shoes": {
    relatedBestGuideIds: ["best-hyrox-shoes"],
    bestSlugs: ["hyrox-shoes"],
    bestLabels: ["Best HYROX shoes →"],
    relatedToolSlugs: ["hyrox-shoe-finder"],
  },
  "hyrox-race-shoes-vs-training-shoes": {
    relatedBestGuideIds: ["best-hyrox-shoes", "best-training-shoes"],
    bestSlugs: ["hyrox-shoes", "training-shoes"],
    bestLabels: ["Best HYROX shoes →", "Best training shoes →"],
    relatedToolSlugs: ["hyrox-shoe-finder", "training-shoe-finder"],
  },
  "rowerg-vs-skierg-for-hyrox-training": {
    relatedBestGuideIds: ["best-rowing-machines", "best-home-gym-equipment"],
    bestSlugs: ["rowing-machines", "home-gym-equipment"],
    bestLabels: ["Best rowing machines →", "Best home gym equipment →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-to-choose-a-hyrox-training-sled": {
    relatedBestGuideIds: ["best-home-gym-equipment"],
    bestSlugs: ["home-gym-equipment"],
    bestLabels: ["Best home gym equipment →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "hyrox-equipment-standards": {
    relatedBestGuideIds: ["best-hyrox-shoes", "best-home-gym-equipment"],
    bestSlugs: ["hyrox-shoes", "home-gym-equipment"],
    bestLabels: ["Best HYROX shoes →", "Best home gym equipment →"],
  },
  "hyrox-race-day-gear-checklist": {
    relatedBestGuideIds: [
      "best-hyrox-shoes",
      "best-heart-rate-monitors-hyrox",
    ],
    bestSlugs: ["hyrox-shoes", "heart-rate-monitors-hyrox"],
    bestLabels: ["Best HYROX shoes →", "Best HR monitors for HYROX →"],
    relatedToolSlugs: ["hyrox-race-kit-builder"],
  },
  "hyrox-heart-rate-monitor": {
    relatedBestGuideIds: [
      "best-heart-rate-monitors-hyrox",
      "best-heart-rate-monitors-chest-straps",
    ],
    bestSlugs: ["heart-rate-monitors-hyrox", "heart-rate-monitors-chest-straps"],
    bestLabels: [
      "Best HR monitors for HYROX →",
      "Best chest strap HR monitors →",
    ],
    relatedToolSlugs: ["running-hrm-finder"],
  },
  "what-gear-do-you-need-for-hyrox": {
    relatedBestGuideIds: ["best-hyrox-shoes", "best-home-gym-equipment"],
    bestSlugs: ["hyrox-shoes", "home-gym-equipment"],
    bestLabels: ["Best HYROX shoes →", "Best home gym equipment →"],
    relatedToolSlugs: ["hyrox-race-kit-builder", "hyrox-shoe-finder"],
  },
  "how-to-build-a-hyrox-home-gym": {
    relatedBestGuideIds: ["best-home-gym-equipment"],
    bestSlugs: ["home-gym-equipment"],
    bestLabels: ["Best home gym equipment →"],
    relatedToolSlugs: ["home-gym-builder"],
  },
  "how-to-choose-a-hyrox-watch": {
    relatedBestGuideIds: ["best-running-watches"],
    bestSlugs: ["running-watches"],
    bestLabels: ["Best running watches →"],
    relatedToolSlugs: ["fitness-watch-finder"],
  },
};

/** Also ensure long-form decisionLinks for guides that already had Best ids. */
const EXTRA_DECISION_BEST_BY_SLUG: Record<
  string,
  { bestSlugs: string[]; bestLabels: string[] }
> = {
  "how-to-choose-running-shoes": {
    bestSlugs: ["running-shoes"],
    bestLabels: ["Best running shoes →"],
  },
  "running-shoe-drop": {
    bestSlugs: ["running-shoes"],
    bestLabels: ["Best running shoes →"],
  },
  "running-shoe-cushioning": {
    bestSlugs: ["max-cushion-running-shoes"],
    bestLabels: ["Best max-cushion running shoes →"],
  },
  "stability-shoes-explained": {
    bestSlugs: ["stability-running-shoes"],
    bestLabels: ["Best stability running shoes →"],
  },
  "carbon-vs-nylon-plates": {
    bestSlugs: ["race-shoes", "tempo-running-shoes"],
    bestLabels: ["Best race shoes →", "Best tempo running shoes →"],
  },
  "what-is-a-daily-trainer": {
    bestSlugs: ["daily-trainers"],
    bestLabels: ["Best daily trainers →"],
  },
  "running-shoe-rotation": {
    bestSlugs: ["daily-trainers", "running-shoes"],
    bestLabels: ["Best daily trainers →", "Best running shoes →"],
  },
  "running-shoe-terminology": {
    bestSlugs: ["running-shoes"],
    bestLabels: ["Best running shoes →"],
  },
  "road-vs-trail-running-shoes": {
    bestSlugs: ["trail-running-shoes", "running-shoes"],
    bestLabels: ["Best trail running shoes →", "Best running shoes →"],
  },
  "how-to-choose-running-watch": {
    bestSlugs: ["running-watches"],
    bestLabels: ["Best running watches →"],
  },
  "multi-band-gps-running-watches": {
    bestSlugs: ["running-watches"],
    bestLabels: ["Best running watches →"],
  },
  "how-to-choose-heart-rate-monitor": {
    bestSlugs: ["heart-rate-monitors-running"],
    bestLabels: ["Best heart-rate monitors for running →"],
  },
  "how-to-choose-running-hydration-vest": {
    bestSlugs: ["running-hydration-vests"],
    bestLabels: ["Best running hydration vests →"],
  },
  "hydration-vest-vs-running-belt": {
    bestSlugs: ["running-hydration-vests", "running-belts"],
    bestLabels: ["Best running hydration vests →", "Best running belts →"],
  },
  "how-to-choose-running-headlamp": {
    bestSlugs: ["running-headlamps"],
    bestLabels: ["Best running headlamps →"],
  },
  "open-ear-vs-in-ear-running-headphones": {
    bestSlugs: ["running-headphones"],
    bestLabels: ["Best running headphones →"],
  },
  "running-gels-explained": {
    bestSlugs: ["running-race-fuel"],
    bestLabels: ["Best running race fuel →"],
  },
  "how-to-carry-fuel-on-long-runs": {
    bestSlugs: ["running-race-fuel", "running-hydration-vests"],
    bestLabels: ["Best running race fuel →", "Best running hydration vests →"],
  },
  "gel-vs-drink-mix-vs-chews": {
    bestSlugs: ["running-race-fuel"],
    bestLabels: ["Best running race fuel →"],
  },
  "caffeine-in-running-fuel-explained": {
    bestSlugs: ["running-race-fuel"],
    bestLabels: ["Best running race fuel →"],
  },
  "massage-guns-explained": {
    bestSlugs: ["running-recovery-gear"],
    bestLabels: ["Best running recovery gear →"],
  },
  "foam-rolling-for-runners": {
    bestSlugs: ["running-recovery-gear"],
    bestLabels: ["Best running recovery gear →"],
  },
  "recovery-tools-what-evidence-shows": {
    bestSlugs: ["running-recovery-gear"],
    bestLabels: ["Best running recovery gear →"],
  },
  "how-to-choose-a-padel-racket": {
    bestSlugs: ["padel-rackets"],
    bestLabels: ["Best padel rackets →"],
  },
};

function decisionBestForSlug(slug: string): {
  bestSlugs: string[];
  bestLabels: string[];
} | undefined {
  const journey = GUIDE_P40_JOURNEY_BY_SLUG[slug];
  if (journey) {
    return { bestSlugs: journey.bestSlugs, bestLabels: journey.bestLabels };
  }
  return EXTRA_DECISION_BEST_BY_SLUG[slug];
}

/**
 * Sets relatedBestGuideIds (and relatedToolSlugs where missing) for guides
 * that lack Best CTAs. Preserves existing ids/tools; merge is additive.
 */
export function applyGuideP40JourneyEnrichment(
  guides: BuyingGuide[],
): BuyingGuide[] {
  return guides.map((guide) => {
    const journey = GUIDE_P40_JOURNEY_BY_SLUG[guide.slug];
    if (!journey) return guide;

    const existingBest = guide.relatedBestGuideIds ?? [];
    const relatedBestGuideIds = [
      ...new Set([...existingBest, ...journey.relatedBestGuideIds]),
    ];

    const existingTools = guide.relatedToolSlugs ?? [];
    const relatedToolSlugs =
      existingTools.length > 0
        ? existingTools
        : journey.relatedToolSlugs && journey.relatedToolSlugs.length > 0
          ? [...journey.relatedToolSlugs]
          : existingTools;

    if (
      relatedBestGuideIds.length === existingBest.length &&
      relatedBestGuideIds.every((id, i) => id === existingBest[i]) &&
      relatedToolSlugs === existingTools
    ) {
      return guide;
    }

    return {
      ...guide,
      relatedBestGuideIds,
      ...(relatedToolSlugs.length > 0 ? { relatedToolSlugs } : {}),
    };
  });
}

/**
 * Ensure long-form configs expose at least one /best/<slug> decisionLink.
 */
export function enrichLongFormDecisionLinks<T extends DecisionLinkConfig>(
  config: T,
): T {
  const mapping = decisionBestForSlug(config.guideSlug);
  if (!mapping || mapping.bestSlugs.length === 0) return config;

  const existing = config.decisionLinks ?? [];
  const haveBest = existing.some((l) => l.href.startsWith("/best/"));
  if (haveBest) return config;

  const added = mapping.bestSlugs.map((slug, i) => ({
    label: mapping.bestLabels[i] ?? `Best ${slug.replace(/-/g, " ")} →`,
    href: `/best/${slug}`,
  }));

  return {
    ...config,
    decisionLinks: [...existing, ...added],
  };
}
