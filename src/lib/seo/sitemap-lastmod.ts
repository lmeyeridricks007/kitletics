import { SEED_DATES } from "@/content/config";

/**
 * Global catalog seed stamps from `publishedMeta()` / commerce refresh.
 * These are mass-applied defaults — not per-URL editorial change dates.
 * Never emit them as sitemap lastmod (omit instead of fabricating freshness).
 */
const GLOBAL_SEED_TIMESTAMPS = new Set<string>(Object.values(SEED_DATES));

export function isGlobalSeedTimestamp(
  value: string | undefined | null,
): boolean {
  if (!value) return false;
  return GLOBAL_SEED_TIMESTAMPS.has(value);
}

/**
 * Newest genuine content timestamp among candidates.
 * Skips empty/invalid values and global SEED_DATES stamps.
 * Returns undefined when nothing reliable remains — caller must omit lastmod.
 *
 * Do not pass: build/deploy/today, SEED_DATES.*, or lastVerifiedAt
 * (verification / offer freshness ≠ page content change).
 */
export function sitemapLastModified(
  ...candidates: Array<string | undefined | null>
): Date | undefined {
  let best = Number.NaN;
  for (const raw of candidates) {
    if (!raw || isGlobalSeedTimestamp(raw)) continue;
    const t = Date.parse(raw);
    if (Number.isNaN(t)) continue;
    // Reject future-dated content stamps (clock skew / bad seeds)
    if (t > Date.now() + 24 * 60 * 60 * 1000) continue;
    if (Number.isNaN(best) || t > best) best = t;
  }
  if (Number.isNaN(best)) return undefined;
  return new Date(best);
}

/** Spread into a sitemap entry only when a real lastmod exists. */
export function withSitemapLastModified<
  T extends Record<string, unknown>,
>(entry: T, ...candidates: Array<string | undefined | null>): T & {
  lastModified?: Date;
} {
  const lastModified = sitemapLastModified(...candidates);
  if (!lastModified) return entry;
  return { ...entry, lastModified };
}
