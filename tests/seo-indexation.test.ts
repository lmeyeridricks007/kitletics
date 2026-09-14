import { describe, expect, it } from "vitest";
import { siteConfig } from "@/content/config";
import { hasNonCanonicalQueryState } from "@/lib/seo/query-state";
import { isBrandHubIndexable } from "@/lib/seo/brand-indexability";
import { resolveChildSportRedirect } from "@/lib/seo/category-canonical";
import { getCategoryHref } from "@/lib/navigation/category-href";
import {
  getBrands,
  getCategoryByPathSegment,
  getSportBySlug,
} from "@/repositories";
import {
  getSitemapEntriesFixture,
  getSitemapPathSetFixture,
} from "./helpers/sitemap-fixture";
import {
  PADEL_RESEARCH_STORIES,
  getPadelResearchPageData,
} from "@/lib/padel-research";

describe("SEO query-state indexability", () => {
  it("treats sort-only state as non-canonical", () => {
    expect(hasNonCanonicalQueryState({ sort: "price-asc" })).toBe(true);
  });

  it("treats filter and pagination params as non-canonical", () => {
    expect(hasNonCanonicalQueryState({ brand: "asics" })).toBe(true);
    expect(hasNonCanonicalQueryState({ gender: "men" })).toBe(true);
    expect(hasNonCanonicalQueryState({ page: "2" })).toBe(true);
    expect(hasNonCanonicalQueryState({ type: "finder" })).toBe(true);
  });

  it("allows clean URLs with no query", () => {
    expect(hasNonCanonicalQueryState({})).toBe(false);
  });
});

describe("Brand hub sitemap eligibility", () => {
  it("only marks substantive brands indexable", () => {
    const brands = getBrands();
    const indexable = brands.filter((b) => isBrandHubIndexable(b));
    expect(indexable.length).toBeGreaterThan(50);
    expect(indexable.length).toBeLessThan(brands.length);
  });

  it("sitemap brands are a subset of indexable hubs", () => {
    const entries = getSitemapEntriesFixture();
    const brandUrls = entries
      .map((e) => e.url.replace(siteConfig.url, ""))
      .filter((p) => p.startsWith("/brands/") && p !== "/brands");
    expect(brandUrls.length).toBeGreaterThan(50);
    for (const path of brandUrls) {
      const slug = path.replace("/brands/", "");
      const brand = getBrands().find((b) => b.slug === slug);
      expect(brand, path).toBeTruthy();
      expect(isBrandHubIndexable(brand!), path).toBe(true);
    }
  });
});

describe("Category / sport canonical shells", () => {
  it("does not treat hyrox shoe shell as canonical when running owns shoes", () => {
    const hyrox = getSportBySlug("hyrox")!;
    const shoes = getCategoryByPathSegment(hyrox.id, "shoes");
    if (!shoes) return;
    expect(getCategoryHref(shoes)).not.toBe("/hyrox/shoes");
  });

  it("redirects racket child disciplines to live child sports", () => {
    const racket = getSportBySlug("racket")!;
    expect(resolveChildSportRedirect(racket, "padel")).toBe("/padel");
    expect(resolveChildSportRedirect(racket, "tennis")).toBe("/tennis");
  });

  it("sitemap excludes known duplicate orphan shells", () => {
    const paths = getSitemapPathSetFixture();
    expect(paths.has("/hyrox/shoes")).toBe(false);
    expect(paths.has("/racket/padel")).toBe(false);
    expect(paths.has("/tools/compare-products")).toBe(false);
    expect(paths.has("/search")).toBe(false);
    expect(paths.has("/running/shoes")).toBe(true);
    expect(paths.has("/padel")).toBe(true);
    for (const category of ["rackets", "shoes", "bags", "balls", "grips", "accessories"]) {
      expect(paths.has(`/padel/${category}`)).toBe(true);
    }
    expect(paths.has("/padel/clothing")).toBe(false);
    expect(paths.has("/padel/rackets/database")).toBe(true);
    expect(paths.has("/padel/collections")).toBe(true);
    for (const story of PADEL_RESEARCH_STORIES) {
      const research = getPadelResearchPageData(story.slug);
      expect(paths.has(story.path)).toBe(research?.published === true);
    }
    expect(paths.has("/tennis")).toBe(false);
    expect(paths.has("/fitness/hyrox")).toBe(false);
    expect(paths.has("/hyrox")).toBe(false);
  });
});
