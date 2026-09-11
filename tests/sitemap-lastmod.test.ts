import { describe, expect, it } from "vitest";
import {
  isGlobalSeedTimestamp,
  sitemapLastModified,
  withSitemapLastModified,
} from "@/lib/seo/sitemap-lastmod";
import { SEED_DATES } from "@/content/config";
import {
  getSitemapEntriesFixture,
  getSitemapPathsFixture,
} from "./helpers/sitemap-fixture";

describe("sitemapLastModified", () => {
  it("ignores global SEED_DATES stamps (no fabricated freshness)", () => {
    expect(
      sitemapLastModified(
        SEED_DATES.published,
        SEED_DATES.updated,
        SEED_DATES.verified,
      ),
    ).toBeUndefined();
  });

  it("picks the newest non-seed content timestamp", () => {
    const d = sitemapLastModified(
      SEED_DATES.updated,
      "2026-03-15T12:00:00.000Z",
      "2026-06-01T09:00:00.000Z",
    );
    expect(d?.toISOString()).toBe("2026-06-01T09:00:00.000Z");
  });

  it("ignores empty or invalid values without inventing freshness", () => {
    expect(
      sitemapLastModified(undefined, "", "not-a-date", SEED_DATES.published),
    ).toBeUndefined();
  });

  it("returns undefined when no usable candidates exist", () => {
    expect(sitemapLastModified(undefined, null, "")).toBeUndefined();
  });

  it("rejects far-future dates", () => {
    expect(
      sitemapLastModified("2099-01-01T00:00:00.000Z"),
    ).toBeUndefined();
  });

  it("identifies global seed timestamps", () => {
    expect(isGlobalSeedTimestamp(SEED_DATES.verified)).toBe(true);
    expect(isGlobalSeedTimestamp("2026-06-01T09:00:00.000Z")).toBe(false);
  });

  it("withSitemapLastModified omits lastModified when unknown", () => {
    const entry = withSitemapLastModified(
      { changeFrequency: "weekly", priority: 0.5 },
      SEED_DATES.updated,
    );
    expect(entry).toEqual({ changeFrequency: "weekly", priority: 0.5 });
    expect("lastModified" in entry).toBe(false);
  });
});

describe("sitemap lastmod integrity", () => {
  it("does not mass-stamp SEED_DATES.verified or updated on indexable URLs", () => {
    const entries = getSitemapEntriesFixture();
    expect(entries.length).toBeGreaterThan(100);

    const seedInstants = new Set(
      Object.values(SEED_DATES).map((d) => Date.parse(d)),
    );
    let withLastmod = 0;
    let seedExact = 0;

    for (const e of entries) {
      if (!e.lastModified) continue;
      withLastmod++;
      if (seedInstants.has(new Date(e.lastModified).getTime())) seedExact++;
    }

    expect(seedExact).toBe(0);
    expect(withLastmod).toBeLessThan(entries.length * 0.25);
  });

  it("never emits epoch or future lastmod", () => {
    const now = Date.now() + 24 * 60 * 60 * 1000;
    for (const e of getSitemapEntriesFixture()) {
      if (!e.lastModified) continue;
      const t = new Date(e.lastModified).getTime();
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThanOrEqual(now);
    }
  });

  it("keeps indexable product URLs in the sitemap (lastmod optional)", () => {
    const paths = getSitemapPathsFixture();
    expect(paths.some((p) => p.startsWith("/products/"))).toBe(true);
    expect(paths).toContain("/running");
  });
});
