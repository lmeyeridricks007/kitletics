import { describe, expect, it } from "vitest";
import {
  getEligibleRunningShoes,
  getRunningShoeDatabasePageData,
  getRunningShoeDatabaseRecords,
  isRunningShoeDatabaseEligible,
  queryRunningShoeDatabase,
  DEFAULT_DATABASE_FILTERS,
  RUNNING_SHOE_DATABASE_PATH,
  parseDatabaseSearchParams,
  databaseHref,
  countActiveDatabaseFilters,
} from "@/lib/running-shoe-database";
import { getProductsByCategory, getProductById } from "@/repositories/products";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { siteConfig } from "@/content/config";
import { hasNonCanonicalQueryState } from "@/lib/seo/query-state";

const opts = { isDev: false as const };

describe("Running Shoe Database", () => {
  it("eligible count derives from catalog launch policy", () => {
    const all = getProductsByCategory("cat-running-shoes", opts);
    const eligible = getEligibleRunningShoes(opts);
    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.length).toBeLessThanOrEqual(all.length);

    for (const p of eligible) {
      expect(isRunningShoeDatabaseEligible(p, opts)).toBe(true);
      expect(p.status).toBe("published");
      expect(p.categoryId).toBe("cat-running-shoes");
    }
  });

  it("does not leak draft products", () => {
    const drafts = getProductsByCategory("cat-running-shoes", {
      isDev: true,
    }).filter((p) => p.status === "draft");
    const eligibleIds = new Set(getEligibleRunningShoes(opts).map((p) => p.id));
    for (const d of drafts) {
      expect(eligibleIds.has(d.id)).toBe(false);
      expect(isRunningShoeDatabaseEligible(d, opts)).toBe(false);
    }
  });

  it("page total matches record count (never hardcodes inventory)", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    const page = getRunningShoeDatabasePageData({ region: "NL", options: opts });
    expect(page.total).toBe(records.length);
    expect(page.records.length).toBe(records.length);
    expect(page.description).toContain(String(records.length));
    expect(page.path).toBe(RUNNING_SHOE_DATABASE_PATH);
    expect(page.insights.market.total).toBe(records.length);
  });

  it("missing specs stay undefined (no inference)", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    for (const r of records) {
      if (r.weightG !== undefined) {
        expect(typeof r.weightG).toBe("number");
      }
      if (r.carbonPlated) {
        expect(r.plate).toBe(true);
        expect(r.plateMaterial).toBe("carbon");
      }
    }
  });

  it("gender/variant audiences are valid enums", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    for (const r of records) {
      for (const a of [...r.audiences, ...r.genderFit]) {
        expect(["men", "women", "unisex"]).toContain(a);
      }
    }
  });

  it("database links point at real product slugs with authentic media", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    expect(records.length).toBeGreaterThan(0);
    for (const r of records) {
      expect(r.productHref).toBe(`/products/${r.slug}`);
      expect(r.categoryId).toBe("cat-running-shoes");
      expect(r.categorySlug).toBe("running-shoes");
      const product = getProductById(r.id, opts);
      expect(product).toBeTruthy();
      expect(product!.slug).toBe(r.slug);
      const media = getPrimaryProductMedia(product!);
      expect(media?.src).toBeTruthy();
      expect(r.image?.src).toBe(media!.src);
      expect(r.image!.src.includes("/fallbacks/")).toBe(false);
    }
  });

  it("canonical path is the public database URL", () => {
    const page = getRunningShoeDatabasePageData({ options: opts });
    expect(`${siteConfig.url}${page.path}`).toBe(
      `${siteConfig.url}/running/shoes/database`,
    );
  });

  it("filters do not invent rows and carbon filter uses validated flag", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    const carbon = queryRunningShoeDatabase(records, {
      ...DEFAULT_DATABASE_FILTERS,
      plate: "carbon",
    });
    expect(carbon.every((r) => r.carbonPlated)).toBe(true);
    expect(carbon.length).toBe(records.filter((r) => r.carbonPlated).length);
  });

  it("recommended sort uses Kitletics score, not price or affiliate", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    const sorted = queryRunningShoeDatabase(records, {
      ...DEFAULT_DATABASE_FILTERS,
      sort: "recommended",
    });
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1]!.score ?? 0).toBeGreaterThanOrEqual(
        sorted[i]!.score ?? 0,
      );
    }
  });

  it("URL params round-trip and filtered states are non-canonical for SEO", () => {
    const parsed = parseDatabaseSearchParams({
      brand: "asics",
      use: "daily-training",
      drop: "5-8",
      sort: "weight-asc",
    });
    expect(parsed.brand).toEqual(["asics"]);
    expect(parsed.useCase).toEqual(["daily-training"]);
    expect(parsed.dropBuckets).toEqual(["5-8"]);
    expect(parsed.sort).toBe("weight-asc");
    expect(countActiveDatabaseFilters(parsed)).toBeGreaterThan(0);

    const href = databaseHref(parsed);
    expect(href.startsWith("/running/shoes/database?")).toBe(true);
    expect(href).toContain("brand=asics");
    expect(href).toContain("use=daily-training");

    expect(
      hasNonCanonicalQueryState({
        brand: "asics",
        use: "daily-training",
      }),
    ).toBe(true);
    expect(hasNonCanonicalQueryState({})).toBe(false);
  });

  it("market summary type counts are subsets of total", () => {
    const page = getRunningShoeDatabasePageData({ options: opts });
    const { market } = page.insights;
    expect(market.dailyTrainers).toBeLessThanOrEqual(market.total);
    expect(market.raceShoes).toBeLessThanOrEqual(market.total);
    expect(market.trailShoes).toBeLessThanOrEqual(market.total);
    expect(market.brandCount).toBeGreaterThan(0);
  });

  it("eligible shoes that are INDEXABLE remain a subset of database rows", () => {
    const records = getRunningShoeDatabaseRecords("NL", opts);
    const indexableCount = getEligibleRunningShoes(opts).filter((p) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "product", entity: p }, opts),
      ),
    ).length;
    expect(indexableCount).toBeLessThanOrEqual(records.length);
  });
});
