/**
 * IndexNow eligibility — reuses launch INDEXABLE policy (no second rule set).
 */

import { siteConfig } from "@/content/config";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getProductBySlug,
  getReviewBySlug,
  getBestGuideBySlug,
  getBuyingGuideBySlug,
  getComparisonBySlug,
} from "@/repositories";
import { normalizeIndexNowUrl, dedupeUrls } from "./normalize";

export type IndexNowEntityRef =
  | { kind: "product"; slug: string }
  | { kind: "review"; slug: string }
  | { kind: "best"; slug: string }
  | { kind: "guide"; slug: string }
  | { kind: "comparison"; slug: string }
  | { kind: "alternatives"; slug: string };

export type IndexNowSubmitMode = "upsert" | "removal";

const prodCtx = { isDev: false as const };

function absoluteFromPath(path: string): string {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

/**
 * Resolve an entity to its canonical path + INDEXABLE check.
 * Returns null when the entity is missing or not INDEXABLE.
 */
export function resolveIndexableEntityUrl(
  ref: IndexNowEntityRef,
): string | null {
  switch (ref.kind) {
    case "product": {
      const product = getProductBySlug(ref.slug, prodCtx);
      if (!product) return null;
      const elig = getLaunchEligibility(
        { kind: "product", entity: product },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/products/${product.slug}`);
    }
    case "review": {
      const review = getReviewBySlug(ref.slug, prodCtx);
      if (!review) return null;
      const elig = getLaunchEligibility(
        { kind: "review", entity: review },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/reviews/${review.slug}`);
    }
    case "best": {
      const guide = getBestGuideBySlug(ref.slug, prodCtx);
      if (!guide) return null;
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: guide },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/best/${guide.slug}`);
    }
    case "guide": {
      const guide = getBuyingGuideBySlug(ref.slug, prodCtx);
      if (!guide) return null;
      const elig = getLaunchEligibility(
        { kind: "buying-guide", entity: guide },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/guides/${guide.slug}`);
    }
    case "comparison": {
      const cmp = getComparisonBySlug(ref.slug, prodCtx);
      if (!cmp) return null;
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: cmp },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/compare/${cmp.slug}`);
    }
    case "alternatives": {
      const product = getProductBySlug(ref.slug, prodCtx);
      if (!product) return null;
      const elig = getLaunchEligibility(
        { kind: "alternatives", entity: product },
        prodCtx,
      );
      if (!isIndexableEligibility(elig)) return null;
      return absoluteFromPath(`/products/${product.slug}/alternatives`);
    }
    default:
      return null;
  }
}

/**
 * For removals: allow notifying engines about a departed public URL without
 * requiring current INDEXABLE status. Still enforces host + blocked paths.
 */
export function resolveRemovalUrl(input: string): string | null {
  const normalized = normalizeIndexNowUrl(input);
  return normalized.ok ? normalized.url : null;
}

export function collectIndexableUrlsFromEntities(
  refs: IndexNowEntityRef[],
): string[] {
  const urls: string[] = [];
  for (const ref of refs) {
    const url = resolveIndexableEntityUrl(ref);
    if (url) urls.push(url);
  }
  return dedupeUrls(urls);
}

/**
 * Filter candidate absolute URLs to those currently in the sitemap
 * (same INDEXABLE set as publication policy).
 */
export function filterUrlsPresentInSitemap(
  candidates: string[],
  sitemapUrls: Iterable<string>,
): { urls: string[]; rejected: Array<{ input: string; reason: string }> } {
  const allowed = new Set(sitemapUrls);
  const urls: string[] = [];
  const rejected: Array<{ input: string; reason: string }> = [];
  for (const input of candidates) {
    const normalized = normalizeIndexNowUrl(input);
    if (!normalized.ok) {
      rejected.push({ input, reason: normalized.reason });
      continue;
    }
    if (!allowed.has(normalized.url)) {
      rejected.push({ input, reason: "not_indexable" });
      continue;
    }
    urls.push(normalized.url);
  }
  return { urls: dedupeUrls(urls), rejected };
}

export function collectCanonicalUrls(
  inputs: string[],
  _mode: IndexNowSubmitMode,
): { urls: string[]; rejected: Array<{ input: string; reason: string }> } {
  const urls: string[] = [];
  const rejected: Array<{ input: string; reason: string }> = [];

  for (const input of inputs) {
    const normalized = normalizeIndexNowUrl(input);
    if (!normalized.ok) {
      rejected.push({ input, reason: normalized.reason });
      continue;
    }
    urls.push(normalized.url);
  }

  return { urls: dedupeUrls(urls), rejected };
}
