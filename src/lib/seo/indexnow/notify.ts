/**
 * High-level IndexNow notify API for content lifecycle scripts.
 */

import sitemap from "@/app/sitemap";
import {
  collectIndexableUrlsFromEntities,
  filterUrlsPresentInSitemap,
  resolveRemovalUrl,
  type IndexNowEntityRef,
  type IndexNowSubmitMode,
} from "./eligibility";
import {
  submitIndexNowUrls,
  type IndexNowSubmitOptions,
  type IndexNowSubmitResult,
} from "./client";
import { dedupeUrls } from "./normalize";

export type NotifyIndexNowInput = {
  /** Prefer entity refs — eligibility is checked via launch policy. */
  entities?: IndexNowEntityRef[];
  /**
   * Absolute or relative URLs. Upsert mode keeps only URLs present in the
   * current sitemap (INDEXABLE). Removal mode allows departed public paths.
   */
  urls?: string[];
  mode?: IndexNowSubmitMode;
} & IndexNowSubmitOptions;

/**
 * Notify IndexNow for published/updated (upsert) or removed URLs.
 * Never submits the full sitemap unless the caller explicitly passes that list.
 */
export async function notifyIndexNow(
  input: NotifyIndexNowInput,
): Promise<IndexNowSubmitResult & { urls: string[]; rejectedCount: number }> {
  const mode = input.mode ?? "upsert";
  let urls: string[] = [];
  let rejectedCount = 0;

  if (input.entities?.length) {
    if (mode === "removal") {
      for (const ref of input.entities) {
        const path =
          ref.kind === "alternatives"
            ? `/products/${ref.slug}/alternatives`
            : ref.kind === "product"
              ? `/products/${ref.slug}`
              : ref.kind === "review"
                ? `/reviews/${ref.slug}`
                : ref.kind === "best"
                  ? `/best/${ref.slug}`
                  : ref.kind === "guide"
                    ? `/guides/${ref.slug}`
                    : `/compare/${ref.slug}`;
        const url = resolveRemovalUrl(path);
        if (url) urls.push(url);
        else rejectedCount += 1;
      }
    } else {
      const before = input.entities.length;
      urls.push(...collectIndexableUrlsFromEntities(input.entities));
      rejectedCount += Math.max(0, before - urls.length);
    }
  }

  if (input.urls?.length) {
    if (mode === "removal") {
      for (const raw of input.urls) {
        const url = resolveRemovalUrl(raw);
        if (url) urls.push(url);
        else rejectedCount += 1;
      }
    } else {
      const sitemapUrls = sitemap().map((e) => e.url);
      const filtered = filterUrlsPresentInSitemap(input.urls, sitemapUrls);
      urls.push(...filtered.urls);
      rejectedCount += filtered.rejected.length;
    }
  }

  urls = dedupeUrls(urls);
  const result = await submitIndexNowUrls(urls, input);
  return { ...result, urls, rejectedCount };
}

/** Convenience: notify product + optional review + alternatives when indexable. */
export async function notifyIndexNowForProductPublish(
  productSlug: string,
  opts?: IndexNowSubmitOptions & {
    includeAlternatives?: boolean;
    reviewSlug?: string;
  },
): Promise<IndexNowSubmitResult & { urls: string[]; rejectedCount: number }> {
  const entities: IndexNowEntityRef[] = [{ kind: "product", slug: productSlug }];
  if (opts?.reviewSlug) {
    entities.push({ kind: "review", slug: opts.reviewSlug });
  }
  if (opts?.includeAlternatives !== false) {
    entities.push({ kind: "alternatives", slug: productSlug });
  }
  return notifyIndexNow({ entities, ...opts });
}
