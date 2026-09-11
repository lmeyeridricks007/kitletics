/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  collectCanonicalUrls,
  dedupeUrls,
  filterUrlsPresentInSitemap,
  isBlockedIndexNowPath,
  isValidIndexNowKey,
  normalizeIndexNowUrl,
  readIndexNowKey,
  resolveIndexNowConfig,
  submitIndexNowUrls,
} from "@/lib/seo/indexnow";
import { siteConfig } from "@/content/config";

describe("IndexNow key config", () => {
  it("rejects missing or invalid keys", () => {
    expect(readIndexNowKey({})).toBeNull();
    expect(readIndexNowKey({ INDEXNOW_KEY: "short" })).toBeNull();
    expect(readIndexNowKey({ INDEXNOW_KEY: "not valid!!" })).toBeNull();
    expect(isValidIndexNowKey("abcdef12")).toBe(true);
    expect(
      resolveIndexNowConfig({ INDEXNOW_KEY: "" }).enabled,
    ).toBe(false);
  });

  it("enables when a valid key is present", () => {
    const cfg = resolveIndexNowConfig({
      INDEXNOW_KEY: "a1b2c3d4e5f67890",
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.host).toBe("kitletics.com");
    expect(cfg.keyLocation).toBe(`${siteConfig.url}/indexnow-key.txt`);
  });
});

describe("normalizeIndexNowUrl", () => {
  it("accepts canonical kitletics.com URLs and relative paths", () => {
    expect(normalizeIndexNowUrl("/reviews/nike-vomero-18")).toEqual({
      ok: true,
      url: `${siteConfig.url}/reviews/nike-vomero-18`,
      path: "/reviews/nike-vomero-18",
    });
    expect(
      normalizeIndexNowUrl("https://www.kitletics.com/products/x"),
    ).toMatchObject({
      ok: true,
      url: `${siteConfig.url}/products/x`,
    });
  });

  it("rejects invalid hosts and query facets", () => {
    expect(normalizeIndexNowUrl("https://evil.example/products/x")).toEqual({
      ok: false,
      reason: "invalid_host",
    });
    expect(normalizeIndexNowUrl("/reviews?type=hybrid")).toEqual({
      ok: false,
      reason: "query_not_allowed",
    });
  });

  it("blocks draft/preview/go/search/admin/api paths", () => {
    for (const path of [
      "/preview/products/x",
      "/go/offer-1",
      "/api/health",
      "/admin",
      "/search",
    ]) {
      expect(isBlockedIndexNowPath(path)).toBe(true);
      expect(normalizeIndexNowUrl(path).ok).toBe(false);
    }
  });

  it("dedupes URLs", () => {
    expect(
      dedupeUrls([
        `${siteConfig.url}/a`,
        `${siteConfig.url}/a`,
        `${siteConfig.url}/b`,
      ]),
    ).toEqual([`${siteConfig.url}/a`, `${siteConfig.url}/b`]);
  });
});

describe("eligibility filters", () => {
  it("filters upsert candidates to sitemap INDEXABLE set", () => {
    const sitemap = new Set([
      `${siteConfig.url}/reviews/nike-vomero-18`,
      `${siteConfig.url}/products/nike-vomero-18`,
    ]);
    const { urls, rejected } = filterUrlsPresentInSitemap(
      [
        `${siteConfig.url}/reviews/nike-vomero-18`,
        `${siteConfig.url}/reviews/held-or-draft`,
        "https://other.test/x",
        "/go/secret",
      ],
      sitemap,
    );
    expect(urls).toEqual([`${siteConfig.url}/reviews/nike-vomero-18`]);
    expect(rejected.some((r) => r.reason === "not_indexable")).toBe(true);
    expect(rejected.some((r) => r.reason === "invalid_host")).toBe(true);
    expect(rejected.some((r) => r.reason === "blocked_path")).toBe(true);
  });

  it("allows removal URLs that are canonical even if not in sitemap", () => {
    const { urls, rejected } = collectCanonicalUrls(
      [`${siteConfig.url}/products/retired-sku`, "/go/x"],
      "removal",
    );
    expect(urls).toEqual([`${siteConfig.url}/products/retired-sku`]);
    expect(rejected).toHaveLength(1);
  });
});

describe("submitIndexNowUrls", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("no-ops when key is missing", async () => {
    const fetchImpl = vi.fn();
    const result = await submitIndexNowUrls(
      [`${siteConfig.url}/reviews/x`],
      {
        config: resolveIndexNowConfig({}),
        fetchImpl: fetchImpl as unknown as typeof fetch,
      },
    );
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("missing_key");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("batches and dedupes submissions", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 200 }));
    const urlA = `${siteConfig.url}/reviews/a`;
    const urlB = `${siteConfig.url}/reviews/b`;
    const result = await submitIndexNowUrls([urlA, urlA, urlB], {
      config: resolveIndexNowConfig({ INDEXNOW_KEY: "a1b2c3d4e5f67890" }),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      batchSize: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.submitted).toBe(2);
    expect(result.batches).toBe(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const firstCall = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(firstCall[1].body as string);
    expect(body.host).toBe("kitletics.com");
    expect(body.key).toBe("a1b2c3d4e5f67890");
    expect(body.keyLocation).toContain("/indexnow-key.txt");
    expect(body.urlList).toHaveLength(1);
  });

  it("retries on 429 then succeeds", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("slow", { status: 429 }))
      .mockResolvedValueOnce(new Response("", { status: 202 }));
    const pending = submitIndexNowUrls([`${siteConfig.url}/reviews/a`], {
      config: resolveIndexNowConfig({ INDEXNOW_KEY: "a1b2c3d4e5f67890" }),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxRetries: 2,
    });
    await vi.runAllTimersAsync();
    const result = await pending;
    vi.useRealTimers();
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("records errors on hard failures", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 400 }));
    const result = await submitIndexNowUrls([`${siteConfig.url}/reviews/a`], {
      config: resolveIndexNowConfig({ INDEXNOW_KEY: "a1b2c3d4e5f67890" }),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/HTTP 400/);
  });

  it("supports dry-run without network", async () => {
    const fetchImpl = vi.fn();
    const result = await submitIndexNowUrls([`${siteConfig.url}/reviews/a`], {
      config: resolveIndexNowConfig({ INDEXNOW_KEY: "a1b2c3d4e5f67890" }),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      dryRun: true,
    });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("dry_run");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("resolveIndexableEntityUrl uses launch policy", () => {
  it("returns null for unknown slugs (draft/missing)", async () => {
    const { resolveIndexableEntityUrl } = await import("@/lib/seo/indexnow");
    expect(
      resolveIndexableEntityUrl({
        kind: "review",
        slug: "this-review-does-not-exist-zz",
      }),
    ).toBeNull();
    expect(
      resolveIndexableEntityUrl({
        kind: "product",
        slug: "this-product-does-not-exist-zz",
      }),
    ).toBeNull();
  });

  it("returns a canonical URL for a known INDEXABLE review when present", async () => {
    const { getReviews } = await import("@/repositories");
    const { getLaunchEligibility, isIndexableEligibility } = await import(
      "@/domain/launch"
    );
    const { resolveIndexableEntityUrl } = await import("@/lib/seo/indexnow");
    const indexable = getReviews({ isDev: false }).find((r) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, { isDev: false }),
      ),
    );
    if (!indexable) return;
    expect(
      resolveIndexableEntityUrl({ kind: "review", slug: indexable.slug }),
    ).toBe(`${siteConfig.url}/reviews/${indexable.slug}`);
  });

  it("excludes held-vertical / non-INDEXABLE products", async () => {
    const { getProducts } = await import("@/repositories");
    const { getLaunchEligibility, isIndexableEligibility } = await import(
      "@/domain/launch"
    );
    const { resolveIndexableEntityUrl } = await import("@/lib/seo/indexnow");
    const held = getProducts({ isDev: false }).find(
      (p) =>
        !isIndexableEligibility(
          getLaunchEligibility({ kind: "product", entity: p }, { isDev: false }),
        ),
    );
    if (!held) return;
    expect(
      resolveIndexableEntityUrl({ kind: "product", slug: held.slug }),
    ).toBeNull();
  });
});
