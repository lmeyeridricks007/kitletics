/**
 * Editorial Fix 47 — contextual internal link graph helpers.
 * Prefer page-data fallbacks; this module documents category→guide defaults
 * used when explicit related* ids are empty.
 */

/** Default buying-guide ids by product category when product-scoped links are thin. */
export const CATEGORY_DEFAULT_BUYING_GUIDE_IDS: Record<string, string[]> = {
  "cat-running-shoes": ["guide-choose-shoes", "guide-cushioning", "guide-terminology"],
  "cat-training-shoes": ["guide-choose-training-shoes", "guide-choose-hyrox-shoes"],
  "cat-gps-watches": [
    "guide-choose-watch",
    "guide-density-beginner-vs-advanced-running-watch",
  ],
  "cat-hrm": ["guide-choose-hrm", "guide-density-optical-wrist-hr-vs-chest-strap"],
  "cat-heart-rate-monitors": ["guide-choose-hrm", "guide-hyrox-hr"],
  "cat-packs-vests": ["guide-choose-hydration-vest", "guide-vest-vs-belt"],
  "cat-hydration": [
    "guide-density-soft-flasks-vs-bladders-explained",
    "guide-density-handheld-bottles-for-running",
  ],
  "cat-running-belts": ["guide-density-how-to-choose-running-belt", "guide-vest-vs-belt"],
  "cat-headphones": ["guide-headphones-types"],
  "cat-running-lights": ["guide-choose-headlamp"],
  "cat-running-clothing": [
    "guide-density-running-jackets-explained",
    "guide-density-hot-weather-running-apparel",
  ],
  "cat-running-socks": ["guide-density-how-to-choose-running-socks"],
  "cat-nutrition": ["guide-running-gels-explained", "guide-gel-vs-drink-vs-chews"],
  "cat-recovery-gear": [
    "guide-massage-guns-explained",
    "guide-recovery-tools-evidence",
  ],
  "cat-sunglasses": ["guide-density-beginner-running-gear-stack"],
  "cat-accessories": ["guide-density-anti-chafe-for-runners"],
  "cat-padel-rackets": ["guide-choose-padel-racket"],
  "cat-padel-shoes": ["guide-choose-padel-shoes"],
  "cat-padel-grips": ["guide-padel-grips"],
  "cat-tennis-rackets": ["guide-choose-tennis-racket"],
  "cat-power-racks": ["guide-choose-power-rack", "guide-build-home-gym"],
  "cat-adjustable-dumbbells": ["guide-choose-adb", "guide-adjustable-vs-fixed"],
  "cat-weight-benches": ["guide-choose-bench"],
  "cat-treadmills": ["guide-choose-treadmill"],
  "cat-tennis-shoes": ["guide-choose-tennis-racket"],
  "cat-tennis-strings": ["guide-choose-tennis-racket"],
  "cat-safety": ["guide-choose-headlamp", "guide-density-beginner-running-gear-stack"],
  "cat-air-bikes": ["guide-hyrox-home-setup", "guide-choose-rower"],
  "cat-barbells": ["guide-build-home-gym", "guide-bumper-vs-iron"],
  "cat-weight-plates": ["guide-bumper-vs-iron", "guide-build-home-gym"],
  "cat-functional-fitness": ["guide-hyrox-sled", "guide-hyrox-home-setup"],
  "cat-pull-up-bars": ["guide-pull-up-bar-mounting", "guide-build-home-gym"],
  "cat-rowing-machines": ["guide-choose-rower", "guide-hyrox-home-setup"],
};

/** Peer buying-guide clusters (learn-more, not rankings). */
export const GUIDE_PEER_CLUSTERS: string[][] = [
  [
    "guide-choose-shoes",
    "guide-cushioning",
    "guide-stability",
    "guide-daily-trainer",
    "guide-terminology",
  ],
  [
    "guide-plates",
    "guide-shoe-rotation",
    "guide-choose-shoes",
    "guide-terminology",
  ],
  ["guide-road-vs-trail", "guide-choose-shoes", "guide-choose-hydration-vest"],
  [
    "guide-choose-watch",
    "guide-choose-hyrox-watch",
    "guide-multiband-gps",
    "guide-density-beginner-vs-advanced-running-watch",
    "guide-density-running-watch-battery-life-explained",
  ],
  ["guide-density-how-to-choose-running-socks", "guide-density-anti-chafe-for-runners"],
  [
    "guide-choose-hydration-vest",
    "guide-vest-vs-belt",
    "guide-density-soft-flasks-vs-bladders-explained",
  ],
  ["guide-headphones-types"],
  ["guide-choose-headlamp"],
  [
    "guide-density-running-jackets-explained",
    "guide-density-hot-weather-running-apparel",
    "guide-density-winter-layering-for-runners",
    "guide-density-beginner-running-gear-stack",
  ],
  [
    "guide-running-gels-explained",
    "guide-carry-fuel-long-runs",
    "guide-gel-vs-drink-vs-chews",
    "guide-caffeine-running-fuel",
  ],
  [
    "guide-massage-guns-explained",
    "guide-foam-rolling-runners",
    "guide-recovery-tools-evidence",
  ],
  [
    "guide-choose-hyrox-shoes",
    "guide-hyrox-race-vs-training-shoes",
    "guide-choose-training-shoes",
  ],
  [
    "guide-hyrox-home-setup",
    "guide-choose-rower",
    "guide-rowerg-vs-skierg-hyrox",
    "guide-build-hyrox-home-gym",
  ],
  [
    "guide-choose-padel-racket",
    "guide-choose-padel-shoes",
    "guide-padel-grips",
  ],
  [
    "guide-build-home-gym",
    "guide-choose-power-rack",
    "guide-power-rack-sizing",
    "guide-choose-bench",
  ],
];

export function peerGuideIdsFor(guideId: string, limit = 4): string[] {
  for (const cluster of GUIDE_PEER_CLUSTERS) {
    if (!cluster.includes(guideId)) continue;
    return cluster.filter((id) => id !== guideId).slice(0, limit);
  }
  return [];
}
