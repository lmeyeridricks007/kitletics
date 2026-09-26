/**
 * Experience-quality gates for Padel pages.
 * Unique assets are file identities. Derived hero crops and repeated <img> tags do not add credit.
 */

import { isDerivedHeroCrop } from "@/lib/media/semantic-role";

export type GuideHeroAssignment = {
  slug: string;
  src: string;
};

export function normalizeAssetPath(src: string | undefined | null): string {
  if (!src) return "";
  const bare = src.split("?")[0] ?? src;
  try {
    if (bare.includes("/_next/image")) {
      const url = new URL(bare, "https://kitletics.com");
      const inner = url.searchParams.get("url");
      if (inner) return decodeURIComponent(inner).split("?")[0] ?? inner;
    }
  } catch {
    /* keep bare */
  }
  return bare;
}

/** Same file on two different guides. The same guide in two rails is not a collision. */
export function unrelatedGuideHeroCollisions(
  assignments: GuideHeroAssignment[],
): Array<{ src: string; slugs: string[] }> {
  const bySrc = new Map<string, Set<string>>();
  for (const row of assignments) {
    const src = normalizeAssetPath(row.src);
    if (!src) continue;
    const slugs = bySrc.get(src) ?? new Set<string>();
    slugs.add(row.slug);
    bySrc.set(src, slugs);
  }
  return [...bySrc.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([src, slugs]) => ({ src, slugs: [...slugs].sort() }));
}

export function uniqueMeaningfulAssets(srcs: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of srcs) {
    const src = normalizeAssetPath(raw);
    if (!src || isDerivedHeroCrop(src) || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

/** Same asset repeated inside one page. `allow` is the highest count that stays unflagged. */
export function excessiveAssetRepeats(
  srcs: Array<string | undefined | null>,
  allow = 1,
): Array<{ src: string; count: number }> {
  const counts = new Map<string, number>();
  for (const raw of srcs) {
    const src = normalizeAssetPath(raw);
    if (!src || isDerivedHeroCrop(src)) continue;
    counts.set(src, (counts.get(src) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > allow)
    .map(([src, count]) => ({ src, count }));
}

/** Repeated paragraph bodies inside one review. Empty bodies are ignored. */
export function duplicateReviewBodies(bodies: string[]): string[] {
  const counts = new Map<string, number>();
  for (const body of bodies) {
    const key = body.replace(/\s+/g, " ").trim();
    if (key.length < 40) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([body]) => body);
}

export const RACKET_SPEC_KEYS = [
  "shape",
  "balance",
  "weightMin",
  "thicknessMm",
  "face",
  "frameMaterial",
  "core",
  "surfaceTexture",
  "sweetSpot",
  "feel",
  "playerLevel",
] as const;

export function presentSpecKeys(
  specs: Record<string, unknown> | undefined,
  keys: readonly string[],
): { present: string[]; missing: string[] } {
  const present: string[] = [];
  const missing: string[] = [];
  for (const key of keys) {
    const value = specs?.[key];
    if (value === undefined || value === null || value === "") missing.push(key);
    else present.push(key);
  }
  return { present, missing };
}
