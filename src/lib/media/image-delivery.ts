/**
 * Shared delivery presets for next/image — keep card/thumb requests small.
 * Prefer these over raw <img> for catalog media under /public or remotePatterns.
 */
export const IMAGE_QUALITY = {
  /** Listing / brand / hub cards */
  card: 70,
  /** PDP / review hero (LCP candidates) */
  hero: 75,
  /** Tiny thumbs in tables / rails */
  thumb: 65,
} as const;

/**
 * next/image qualities actually requested in production.
 * next.config.ts `images.qualities` is this list (Next 15.5+ allow-list).
 * Do not add values that are not used — extra qualities widen the optimizer attack surface.
 */
export const IMAGE_QUALITY_ALLOWLIST = [
  IMAGE_QUALITY.thumb,
  IMAGE_QUALITY.card,
  IMAGE_QUALITY.hero,
] as const;

export const IMAGE_SIZES = {
  /** Category / catalog grid cards (~280px desktop cell) */
  productCard: "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 280px",
  /** Sport hub / carousel / compact listing cards (~180–200px) */
  productCardCompact: "(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 200px",
  /** Brand hub product tiles */
  brandCard: "(max-width: 1024px) 168px, 18vw",
  /** PDP compare rail */
  compareRail: "140px",
  /** Alternatives / related row thumb */
  altThumb: "48px",
  /** Gallery vertical thumbs */
  galleryThumb: "72px",
  /** PDP main gallery */
  pdpHero: "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 560px",
  /** Brand hub hero product */
  brandHero: "(max-width: 1024px) 90vw, 480px",
  /** Guide / editorial cover cards */
  guideCover: "(max-width: 1024px) 100vw, 420px",
  /** Category use-case chips */
  useCaseChip: "(max-width: 640px) 45vw, 200px",
  /** Comparison vs thumbs */
  compareThumb: "40px",
  /** Featured compare builder cards (~72px cell) */
  compareFeaturedThumb: "(max-width: 640px) 64px, 72px",
  /** Compare builder selected product card */
  compareSelectedCard: "(max-width: 1024px) 45vw, 220px",
  /** Search dropdown result thumb */
  compareSearchThumb: "40px",
  /** Use-case / category listing hero (right column) */
  listingHero: "(max-width: 1024px) 100vw, 55vw",
  /** Use-case listing related guide cover */
  listingGuideCover: "96px",
} as const;
