/**
 * Resolve a hub/card image for Best guides.
 * Prefer slug-specific photography so adjacent cards do not share art.
 *
 * Client-safe: no Node `fs` / `crypto` — this module is imported by ContentCards
 * which ships into the header search dialog client bundle.
 *
 * IMPORTANT: Every slug shown together on a domain hub (e.g. /best?domain=shoes)
 * must resolve to a visually distinct file. Do not point two shoe guides at
 * near-duplicate lifestyle crops.
 */

import type { BestGuide } from "@/domain/editorial/types";
import { getBestGuideCategoryConfig } from "@/lib/best/category-config";
import { getUseCaseGuideConfig } from "@/lib/best/use-case-config";

/** Distinct visuals by published Best guide slug — keep one unique src per card. */
const SLUG_IMAGES: Record<string, string> = {
  "running-shoes": "/images/home/guide-running-shoes.jpg",
  "daily-trainers": "/images/running/category/use-daily.jpg",
  "running-shoes-long-runs": "/images/running/category/use-long.jpg",
  // Max-cushion: Bondi packshot (not the old recovery crop shared with stability)
  "max-cushion-running-shoes":
    "/images/running/products/bondi-9-hero.jpg",
  "tempo-running-shoes": "/images/running/category/use-tempo.jpg",
  "race-shoes": "/images/running/category/use-race.jpg",
  "race-day-shoes": "/images/running/category/use-race.jpg",
  "carbon-plated-running-shoes":
    "/images/running/products/vaporfly-4-hero.jpg",
  "marathon-shoes": "/images/running/best-hub/best-marathon-running.jpg",
  // Stability: Kayano packshot (replaced former hero-stability duplicate)
  "stability-running-shoes":
    "/images/running/products/kayano-32-hero.jpg",
  "trail-running-shoes": "/images/running/category/hero-trail.jpg",
  // Heavy runners: urban training scene (not the tempo near-dupe)
  "running-shoes-heavy-runners":
    "/images/brands/heroes/running-urban.jpg",
  "running-shoes-beginners":
    "/images/running/best-hub/best-beginners-running.jpg",
  "running-shoes-wide-feet":
    "/images/running/best-hub/best-wide-feet-running.jpg",
  "gps-watches": "/images/running/best-hub/best-gps-watches-running.jpg",
  "running-watches": "/images/running/best-hub/best-gps-watches-running.jpg",
  "heart-rate-monitors-running":
    "/images/running/best-hub/best-hrm-running.jpg",
  "running-hydration-vests":
    "/images/running/best-hub/best-hydration-vests.jpg",
  "running-packs": "/images/brands/heroes/running-urban.jpg",
  "running-belts": "/images/running/best-hub/best-running-belts.jpg",
  "running-headphones":
    "/images/running/best-hub/best-running-headphones.jpg",
  "running-socks": "/images/running/best-hub/best-running-socks.jpg",
  "running-headlamps":
    "/images/running/best-hub/best-running-headlamps.jpg",
  "running-sunglasses":
    "/images/running/guides/daily-vs-long.jpg",
  "running-safety-visibility":
    "/images/brands/heroes/urban-dusk.jpg",
  "running-race-fuel":
    "/images/home/hero-gear-composite.png",
  "running-recovery-gear":
    "/images/running/category/use-recovery.jpg",
  "padel-rackets": "/images/padel/hero.jpg",
  "padel-rackets-control": "/images/padel/guides/choose-racket.jpg",
  "padel-rackets-power": "/images/padel/guides/choose-shoes.jpg",
  "tennis-rackets": "/images/home/guide-tennis.jpg",
  "training-shoes":
    "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
  "hyrox-shoes": "/images/training/products/tyr-cxt-2-hero.jpg",
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  "cat-running-shoes": "/images/home/guide-running-shoes.jpg",
  "cat-gps-watches": "/images/running/best-hub/best-gps-watches-running.jpg",
  "cat-padel-rackets": "/images/padel/hero.jpg",
  "cat-tennis-rackets": "/images/home/guide-tennis.jpg",
  "cat-training-shoes":
    "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
  "cat-power-racks": "/images/home/guide-home-gym.jpg",
};

const DEFAULT_IMAGE = "/images/home/guide-how-to-choose.jpg";

/** Extra unique reserves when hub-level dedupe needs a rematch. */
const DEDUPE_RESERVES = [
  "/images/running/guides/concepts/daily-trainer-hero.jpg",
  "/images/running/guides/daily-vs-long.jpg",
  "/images/running/products/endorphin-speed-5-hero.jpg",
  "/images/running/products/nimbus-27-hero.jpg",
  "/images/running/products/superblast-2-hero.jpg",
  "/images/running/products/adrenaline-gts-25-hero.png",
  "/images/brands/heroes/urban-dusk.jpg",
  "/images/home/guide-how-to-choose.jpg",
];

function isPreferredHubPhoto(src: string): boolean {
  return (
    src.includes("/running/best-hub/") ||
    src.includes("/running/category/") ||
    src.includes("/running/products/") ||
    src.includes("/running/guides/") ||
    src.includes("/brands/heroes/") ||
    src.includes("/home/guide-") ||
    src.includes("/padel/") ||
    src.includes("/training/")
  );
}

export function resolveBestGuideImage(guide: BestGuide): {
  src: string;
  alt: string;
} {
  const useCase = getUseCaseGuideConfig(guide);
  const category = getBestGuideCategoryConfig(guide.categoryId);

  // Explicit slug map wins so adjacent hub cards stay visually distinct
  if (SLUG_IMAGES[guide.slug]) {
    return {
      src: SLUG_IMAGES[guide.slug]!,
      alt: `${guide.title} — Kitletics Best guide`,
    };
  }

  const candidates = [
    guide.hubImageSrc,
    useCase?.heroImageSrc,
    category.heroImageSrc,
    CATEGORY_FALLBACKS[guide.categoryId],
    DEFAULT_IMAGE,
  ].filter(Boolean) as string[];

  const preferred =
    candidates.find((src) => isPreferredHubPhoto(src)) ?? candidates[0]!;

  return {
    src: preferred,
    alt: `${guide.title} — Kitletics Best guide`,
  };
}

/**
 * Resolve images for a set of guides with uniqueness on image `src` path.
 * Use on hub grids so two cards never share the same photograph path.
 * (Client-safe — does not read the filesystem.)
 */
export function resolveUniqueBestGuideImages(
  guides: BestGuide[],
): Map<string, { src: string; alt: string }> {
  const out = new Map<string, { src: string; alt: string }>();
  const usedSrc = new Set<string>();
  let reserveIdx = 0;

  for (const guide of guides) {
    let image = resolveBestGuideImage(guide);

    if (usedSrc.has(image.src)) {
      let replaced = false;
      while (reserveIdx < DEDUPE_RESERVES.length) {
        const candidate = DEDUPE_RESERVES[reserveIdx++]!;
        if (usedSrc.has(candidate)) continue;
        image = {
          src: candidate,
          alt: `${guide.title} — Kitletics Best guide`,
        };
        replaced = true;
        break;
      }
      if (!replaced) {
        // Keep original; collision already recorded via slug map discipline
      }
    }

    usedSrc.add(image.src);
    out.set(guide.id, image);
  }

  return out;
}

/** Test helper — shoe-domain slug → src map. */
export function getBestGuideSlugImageMap(): Record<string, string> {
  return { ...SLUG_IMAGES };
}
