export const siteConfig = {
  name: "Kitletics",
  displayName: "KITLETICS",
  tagline: "Find the right gear for how you train, compete and play.",
  description:
    "Structured sports equipment discovery, recommendations, comparisons and buying guides — built around your sport, goals and experience.",
  url: "https://kitletics.com",
  defaultRegion: "NL" as const,
} as const;

/** Shared publish timestamps for seed entities */
export const SEED_DATES = {
  created: "2026-01-15T10:00:00.000Z",
  updated: "2026-09-01T08:00:00.000Z",
  published: "2026-02-01T10:00:00.000Z",
  /**
   * Keep within commercial display window (≤72h = recent).
   * Bump when seed offers would otherwise age out of UI.
   */
  verified: "2026-09-09T06:04:57.161Z",
  scheduledFuture: "2027-06-01T10:00:00.000Z",
} as const;

export function publishedMeta() {
  return {
    status: "published" as const,
    publishedAt: SEED_DATES.published,
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
    lastVerifiedAt: SEED_DATES.verified,
  };
}

export function draftMeta() {
  return {
    status: "draft" as const,
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  };
}

export function scheduledMeta() {
  return {
    status: "scheduled" as const,
    scheduledFor: SEED_DATES.scheduledFuture,
    publishedAt: SEED_DATES.scheduledFuture,
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  };
}
