/**
 * Sport/category-approved editorial photography. Never padel-as-generic,
 * never skyline-as-watch.
 */

import type { EditorialTopic } from "./types";

export const PADEL_HOW_TO_CHOOSE = "/images/home/guide-how-to-choose.jpg";
export const TENNIS_GUIDE = "/images/home/guide-tennis.jpg";
export const RUNNING_SHOES_GUIDE = "/images/home/guide-running-shoes.jpg";
export const HOME_GYM_GUIDE = "/images/home/guide-home-gym.jpg";
export const GPS_WATCH_EDITORIAL =
  "/images/running/best-hub/best-gps-watches-running.jpg";
export const GPS_WATCH_METHODOLOGY =
  "/images/watches/guides/gps-open-sky-running.jpg";
export const HRM_EDITORIAL = "/images/running/best-hub/best-hrm-running.jpg";

/** Primary editorial candidates per topic, most specific first. */
export const TOPIC_EDITORIAL_POOL: Record<EditorialTopic, readonly string[]> = {
  running_shoes: [
    RUNNING_SHOES_GUIDE,
    "/images/running/category/use-daily.jpg",
    "/images/running/products/novablast-6-hero.jpg",
  ],
  training_shoes: [
    "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
    "/images/training/products/tyr-cxt-2-hero.jpg",
  ],
  gps_watches: [
    GPS_WATCH_EDITORIAL,
    GPS_WATCH_METHODOLOGY,
    "/images/watches/products/garmin-forerunner-970-hero.jpg",
    "/images/watches/products/coros-pace-pro-hero.png",
  ],
  hrm: [
    HRM_EDITORIAL,
    "/images/hrm/products/polar-h10-hero.png",
    "/images/hrm/products/garmin-hrm-pro-plus-hero.jpg",
  ],
  headphones: [
    "/images/running/best-hub/best-running-headphones.jpg",
    "/images/headphones/products/shokz-openrun-pro-2-hero.png",
  ],
  headlamps: [
    "/images/running/best-hub/best-running-headlamps.jpg",
    "/images/headlamps/products/petzl-swift-rl-hero.jpg",
  ],
  hydration: [
    "/images/running/best-hub/best-hydration-vests.jpg",
    "/images/packs/products/salomon-adv-skin-12-hero.jpg",
  ],
  belts: [
    "/images/running/best-hub/best-running-belts.jpg",
    "/images/running/accessories/flipbelt-classic-hero.jpg",
  ],
  packs: [
    "/images/packs/products/black-diamond-distance-15-hero.jpg",
    "/images/packs/products/camelbak-circuit-run-vest-hero.jpg",
  ],
  clothing: [
    "/images/clothing/products/patagonia-capilene-cool-daily-men-hero.jpg",
    "/images/clothing/products/brooks-canopy-jacket-men-hero.jpg",
  ],
  socks: [
    "/images/running/best-hub/best-running-socks.jpg",
    "/images/running/accessories/feetures-elite-light-cushion-hero.jpg",
  ],
  safety: [
    "/images/clothing/products/brooks-canopy-jacket-men-hero.jpg",
    "/images/running/best-hub/best-running-headlamps.jpg",
  ],
  sunglasses: [
    "/images/running/accessories/oakley-radar-ev-path-hero.png",
    "/images/running/accessories/oakley-sutro-lite-hero.png",
  ],
  fuel: [
    "/images/running/accessories/flipbelt-classic-hero.jpg",
  ],
  recovery: [
    "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
  ],
  padel_rackets: [
    "/images/padel/hero.jpg",
    "/images/padel/guides/choose-racket.jpg",
    PADEL_HOW_TO_CHOOSE,
  ],
  tennis_rackets: [TENNIS_GUIDE],
  fitness: [HOME_GYM_GUIDE],
  running_generic: [
    RUNNING_SHOES_GUIDE,
    "/images/brands/heroes/running-urban.jpg",
  ],
  mixed_home: ["/images/home/hero-gear-composite.png"],
  unknown: [],
};

/**
 * Unique rematch reserves by topic. Hub uniqueness must never steal a
 * padel racket or city skyline for a watch/shoe/gear card.
 */
export const TOPIC_DEDUPE_RESERVES: Record<EditorialTopic, readonly string[]> = {
  running_shoes: [
    "/images/running/guides/concepts/daily-trainer-hero.jpg",
    "/images/running/products/endorphin-speed-5-hero.jpg",
    "/images/running/products/nimbus-27-hero.jpg",
    "/images/running/products/superblast-2-hero.jpg",
    "/images/running/products/adrenaline-gts-25-hero.png",
    "/images/running/products/pegasus-42-hero.jpg",
    "/images/running/products/ghost-18-hero.png",
    "/images/running/products/clifton-10-hero.jpg",
  ],
  training_shoes: [
    "/images/training/products/tyr-cxt-2-hero.jpg",
  ],
  gps_watches: [
    "/images/watches/products/garmin-forerunner-165-hero.jpg",
    "/images/watches/products/garmin-forerunner-265-hero.jpg",
    "/images/watches/products/garmin-forerunner-265s-hero.jpg",
    "/images/watches/products/garmin-enduro-3-hero.jpg",
    "/images/watches/products/garmin-fenix-8-hero.jpg",
    "/images/watches/products/coros-pace-3-hero.jpg",
    "/images/watches/products/coros-pace-4-hero.png",
    "/images/watches/products/coros-apex-4-hero.png",
    "/images/watches/products/apple-watch-ultra-2-hero.jpg",
    GPS_WATCH_METHODOLOGY,
  ],
  hrm: [
    "/images/hrm/products/polar-h10-hero.png",
    "/images/hrm/products/polar-h9-hero.png",
    "/images/hrm/products/garmin-hrm-600-hero.jpg",
    "/images/hrm/products/garmin-hrm-200-hero.jpg",
    "/images/hrm/products/coros-heart-rate-monitor-hero.png",
    "/images/hrm/products/wahoo-trackr-hero.jpg",
  ],
  headphones: [
    "/images/headphones/products/shokz-openrun-hero.png",
    "/images/headphones/products/shokz-openfit-2-hero.png",
    "/images/headphones/products/bose-ultra-open-hero.jpg",
  ],
  headlamps: [
    "/images/headlamps/products/petzl-actik-core-hero.jpg",
    "/images/headlamps/products/black-diamond-spot-400-r-hero.jpg",
  ],
  hydration: [
    "/images/packs/products/nathan-vaporair-2-hero.png",
    "/images/hydration/products/hydrapak-skyflask-speed-500-hero.jpg",
  ],
  belts: [
    "/images/packs/products/amphipod-airflow-lite-belt-hero.webp",
    "/images/packs/products/fitletic-fully-loaded-hero.jpg",
  ],
  packs: [
    "/images/packs/products/black-diamond-distance-22-hero.jpg",
    "/images/packs/products/compressport-ultrun-s-pack-hero.jpg",
  ],
  clothing: [
    "/images/clothing/products/adidas-own-the-run-tee-men-hero.jpg",
    "/images/clothing/products/brooks-chaser-5-women-hero.jpg",
  ],
  socks: [
    "/images/running/accessories/cep-run-compression-sock-3-hero.png",
    "/images/running/accessories/wrightsock-coolmesh-ii-hero.jpg",
  ],
  safety: [
    "/images/headlamps/products/petzl-nao-rl-hero.jpg",
    "/images/clothing/products/craft-adv-essence-light-wind-men-hero.jpg",
  ],
  sunglasses: [
    "/images/running/accessories/oakley-sutro-lite-hero.png",
    "/images/running/accessories/oakley-kato-hero.png",
    "/images/running/accessories/oakley-flak-2-0-xl-hero.png",
  ],
  fuel: [],
  recovery: [
    "/images/running/accessories/therabody-theragun-prime-hero.png",
  ],
  padel_rackets: [
    "/images/padel/guides/choose-racket.jpg",
    PADEL_HOW_TO_CHOOSE,
  ],
  tennis_rackets: [TENNIS_GUIDE],
  fitness: [HOME_GYM_GUIDE],
  running_generic: [RUNNING_SHOES_GUIDE],
  mixed_home: [],
  unknown: [],
};
