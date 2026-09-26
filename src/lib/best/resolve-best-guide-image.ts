/**
 * Resolve a hub/card image for Best guides.
 * Prefer slug-specific photography so adjacent cards do not share art.
 *
 * Client-safe: no Node `fs` / `crypto` — this module is imported by ContentCards
 * which ships into the header search dialog client bundle.
 *
 * Uniqueness rematch is topic-scoped: a colliding watch card never receives
 * a padel racket or city skyline.
 */

import type { BestGuide } from "@/domain/editorial/types";
import { getBestGuideCategoryConfig } from "@/lib/best/category-config";
import { getUseCaseGuideConfig } from "@/lib/best/use-case-config";
import {
  inferEditorialTopic,
  isSemanticallyCompatible,
  resolveSemanticImage,
  TOPIC_DEDUPE_RESERVES,
} from "@/lib/media/semantic-image";

/** Distinct visuals by published Best guide slug — keep one unique src per card. */
const SLUG_IMAGES: Record<string, string> = {
  "running-shoes": "/images/home/guide-running-shoes.jpg",
  "daily-trainers": "/images/running/category/use-daily.jpg",
  "running-shoes-long-runs": "/images/running/category/use-long.jpg",
  "max-cushion-running-shoes":
    "/images/running/products/bondi-9-hero.jpg",
  "tempo-running-shoes": "/images/running/category/use-tempo.jpg",
  "race-shoes": "/images/running/category/use-race.jpg",
  "race-day-shoes": "/images/running/category/use-race.jpg",
  "carbon-plated-running-shoes":
    "/images/running/products/vaporfly-4-hero.jpg",
  "marathon-shoes": "/images/running/best-hub/best-marathon-running.jpg",
  "stability-running-shoes":
    "/images/running/products/kayano-32-hero.jpg",
  "trail-running-shoes": "/images/running/category/hero-trail.jpg",
  "running-shoes-heavy-runners":
    "/images/running/products/nimbus-27-hero.jpg",
  "running-shoes-beginners":
    "/images/running/best-hub/best-beginners-running.jpg",
  "running-shoes-wide-feet":
    "/images/running/best-hub/best-wide-feet-running.jpg",
  "gps-watches": "/images/running/best-hub/best-gps-watches-running.jpg",
  "running-watches": "/images/running/best-hub/best-gps-watches-running.jpg",
  "running-watches-beginners":
    "/images/watches/products/garmin-forerunner-165-hero.jpg",
  "running-watches-marathon":
    "/images/watches/products/garmin-forerunner-970-hero.jpg",
  "running-watches-trail": "/images/watches/products/garmin-fenix-8-hero.jpg",
  "running-watches-ultra": "/images/watches/products/garmin-enduro-3-hero.jpg",
  "running-watches-budget": "/images/watches/products/coros-pace-3-hero.jpg",
  "running-watches-music":
    "/images/watches/products/garmin-forerunner-265-hero.jpg",
  "running-watches-small-wrists":
    "/images/watches/products/garmin-forerunner-265s-hero.jpg",
  "heart-rate-monitors-running":
    "/images/running/best-hub/best-hrm-running.jpg",
  "heart-rate-monitors-chest-straps":
    "/images/hrm/products/polar-h10-hero.png",
  "heart-rate-monitors-intervals":
    "/images/hrm/products/garmin-hrm-600-hero.jpg",
  "heart-rate-monitors-hyrox":
    "/images/hrm/products/wahoo-trackr-hero.jpg",
  "running-hydration-vests":
    "/images/running/best-hub/best-hydration-vests.jpg",
  "running-packs":
    "/images/packs/products/black-diamond-distance-15-hero.jpg",
  "running-belts": "/images/running/best-hub/best-running-belts.jpg",
  "running-headphones":
    "/images/running/best-hub/best-running-headphones.jpg",
  "running-socks": "/images/running/best-hub/best-running-socks.jpg",
  "running-headlamps":
    "/images/running/best-hub/best-running-headlamps.jpg",
  "running-sunglasses":
    "/images/running/accessories/oakley-radar-ev-path-hero.png",
  "running-safety-visibility":
    "/images/clothing/products/brooks-canopy-jacket-men-hero.jpg",
  "running-race-fuel":
    "/images/running/accessories/flipbelt-classic-hero.jpg",
  "running-recovery-gear":
    "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
  "handheld-running-bottles":
    "/images/hydration/products/hydrapak-skyflask-speed-500-hero.jpg",
  // Padel Best guides — one unique product/hero src per public intent.
  // Prefer authentic product photography over shared category stock
  // (/images/padel/hero.jpg, choose-shoes.jpg, grips.jpg).
  "padel-rackets": "/images/padel/products/bullpadel-vertex-05-hero.png",
  "padel-rackets-beginners": "/images/padel/products/bullpadel-indiga-ctr-hero.jpg",
  "padel-rackets-intermediate":
    "/images/padel/products/bullpadel-ionic-light-hero.jpg",
  "padel-rackets-advanced":
    "/images/padel/products/adidas-metalbone-3-5-2026-hero.jpg",
  "padel-rackets-control":
    "/images/padel/products/nox-ml10-pro-cup-2026-hero.jpg",
  "padel-rackets-power": "/images/padel/products/bullpadel-hack-04-hero.png",
  "padel-rackets-all-round":
    "/images/padel/products/bullpadel-vertex-05-hybrid-hero.jpg",
  "padel-rackets-lightweight":
    "/images/padel/products/head-one-ultralight-hero.jpg",
  "padel-rackets-comfort":
    "/images/padel/products/kuikma-pr-comfort-soft-hero.jpg",
  "padel-rackets-maneuverability":
    "/images/padel/products/babolat-air-viper-hero.jpg",
  "padel-rackets-women":
    "/images/padel/products/bullpadel-vertex-05-w-hero.jpg",
  "padel-rackets-value":
    "/images/padel/products/kuikma-pr-hybrid-carbon-hero.jpg",
  "padel-shoes": "/images/padel/products/asics-gel-resolution-padel-hero.jpg",
  "padel-shoes-men": "/images/padel/products/adidas-courtquick-padel-hero.jpg",
  "padel-shoes-women":
    "/images/padel/products/adidas-courtquick-padel-women-hero.jpg",
  "padel-shoes-stability": "/images/padel/products/joma-t-slam-hero.jpg",
  "padel-shoes-comfort":
    "/images/padel/products/adidas-crazyquick-boost-padel-hero.jpg",
  "padel-shoes-lightweight":
    "/images/padel/products/babolat-jet-premura-hero.jpg",
  "padel-shoes-value": "/images/padel/products/kuikma-ps-990-hero.jpg",
  "padel-balls": "/images/padel/products/head-padel-pro-s-hero.jpg",
  "padel-competition-balls":
    "/images/padel/products/head-padel-pro-plus-hero.jpg",
  "padel-training-balls":
    "/images/padel/products/tecnifibre-padel-team-balls-hero.jpg",
  "padel-fast-balls":
    "/images/padel/balls/drop-shot-tournament-tech-hero.jpg",
  "padel-value-balls": "/images/padel/products/kuikma-pb-speed-hero.jpg",
  "padel-overgrips": "/images/padel/products/wilson-padel-overgrip-hero.jpg",
  "padel-overgrips-sweaty-hands":
    "/images/padel/products/nox-pro-overgrip-hero.jpg",
  "padel-tacky-overgrips":
    "/images/padel/products/head-xtreme-soft-overgrip-hero.jpg",
  "padel-dry-feel-overgrips":
    "/images/padel/products/bullpadel-hac-overgrip-hero.jpg",
  "padel-value-overgrips-multipacks":
    "/images/padel/products/kuikma-padel-overgrip-hero.jpg",
  "padel-ergonomic-grip-systems":
    "/images/padel/products/hesacore-padel-grip-hero.jpg",
  "padel-bags": "/images/padel/products/adidas-protour-padel-bag-hero.jpg",
  "padel-backpacks":
    "/images/padel/products/tecnifibre-tour-endurance-padel-backpack-hero.jpg",
  "large-padel-bags": "/images/padel/products/babolat-rh-pro-padel-hero.jpg",
  "padel-tournament-bags":
    "/images/padel/products/nox-at10-xxl-padel-bag-hero.jpg",
  "padel-bags-commuting":
    "/images/padel/products/bullpadel-vertex-geo-backpack-hero.jpg",
  "padel-bags-with-shoe-compartments":
    "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  "compact-padel-bags":
    "/images/padel/bags/head-tour-team-elite-hero.jpg",
  "padel-ball-pressurizers":
    "/images/padel/products/bullpadel-pascal-box-3b-hero.jpg",
  "padel-racket-protectors":
    "/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg",
  "tennis-rackets": "/images/home/guide-tennis.jpg",
  "training-shoes":
    "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
  "hyrox-shoes": "/images/training/products/tyr-cxt-2-hero.jpg",
};

export function resolveBestGuideImage(guide: BestGuide): {
  src: string;
  alt: string;
} {
  const useCase = getUseCaseGuideConfig(guide);
  const category = getBestGuideCategoryConfig(guide.categoryId);
  const topic = inferEditorialTopic({
    slug: guide.slug,
    title: guide.title,
    categoryId: guide.categoryId,
  });

  // Prefer per-guide hub art (unique per intent) before slug map / category pool.
  const dedicated =
    (guide.hubImageSrc &&
    isSemanticallyCompatible(guide.hubImageSrc, topic, "hero")
      ? guide.hubImageSrc
      : undefined) ??
    SLUG_IMAGES[guide.slug] ??
    (useCase?.heroImageSrc &&
    isSemanticallyCompatible(useCase.heroImageSrc, topic, "hero")
      ? useCase.heroImageSrc
      : undefined) ??
    (category.heroImageSrc &&
    isSemanticallyCompatible(category.heroImageSrc, topic, "hero")
      ? category.heroImageSrc
      : undefined);

  const resolved = resolveSemanticImage({
    pageType: "best",
    placement: "hero",
    slug: guide.slug,
    title: guide.title,
    categoryId: guide.categoryId,
    sportId: guide.sportId,
    dedicatedSrc: dedicated,
    dedicatedAlt: `${guide.title} — Kitletics Best guide`,
  });

  return { src: resolved.src, alt: resolved.alt };
}

export function resolveBestGuideMethodologyImage(guide: BestGuide): string {
  const category = getBestGuideCategoryConfig(guide.categoryId);
  const resolved = resolveSemanticImage({
    pageType: "best",
    placement: "methodology",
    slug: guide.slug,
    title: guide.title,
    categoryId: guide.categoryId,
    sportId: guide.sportId,
    dedicatedSrc: category.methodologyImageSrc,
    dedicatedAlt: `${guide.title} methodology`,
  });
  return resolved.src;
}

/**
 * Resolve images for a set of guides with uniqueness on image `src` path.
 * Rematch uses the colliding guide's topic pool — never a cross-sport filler.
 */
export function resolveUniqueBestGuideImages(
  guides: BestGuide[],
): Map<string, { src: string; alt: string }> {
  const out = new Map<string, { src: string; alt: string }>();
  const usedSrc = new Set<string>();
  const reserveCursor = new Map<string, number>();

  for (const guide of guides) {
    let image = resolveBestGuideImage(guide);
    const topic = inferEditorialTopic({
      slug: guide.slug,
      title: guide.title,
      categoryId: guide.categoryId,
    });

    if (usedSrc.has(image.src)) {
      const reserves = TOPIC_DEDUPE_RESERVES[topic] ?? [];
      let idx = reserveCursor.get(topic) ?? 0;
      while (idx < reserves.length) {
        const candidate = reserves[idx++]!;
        reserveCursor.set(topic, idx);
        if (usedSrc.has(candidate)) continue;
        if (!isSemanticallyCompatible(candidate, topic, "card")) continue;
        image = {
          src: candidate,
          alt: `${guide.title} — Kitletics Best guide`,
        };
        break;
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
