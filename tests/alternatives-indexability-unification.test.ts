import { describe, expect, it } from "vitest";
import {
  assessAlternativesIndexability,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getProducts,
  getProductBySlug,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getBrands,
} from "@/repositories";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { getAllProductRelationships } from "@/repositories/relationships";
import { ALTERNATIVES_HOLD_DUPLICATE_INTENT } from "@/content/alternatives-p65-completion";
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { countRankedReasonGroups } from "@/lib/product/alternatives-quality-signals";
import {
  getSitemapPathSetFixture,
  getSitemapPathsFixture,
} from "./helpers/sitemap-fixture";

/**
 * Catalog-integration suite (Fix 82 / 84).
 * Sitemap is warmed by tests/helpers/warm-sitemap-setup.ts (isolate:false).
 */
const PROD = { isDev: false as const };

describe("Fix 82 Alternatives indexability unification", () => {
  it("counts reason groups from ranked reasonIds, not config-only tabs", () => {
    const data = getAlternativesPageData("garmin-forerunner-255", PROD);
    expect(data).toBeDefined();
    expect(countRankedReasonGroups(data!.alternatives)).toBeGreaterThanOrEqual(
      2,
    );
    expect(data!.reasonGroups.length).toBeGreaterThanOrEqual(2);
    const assessment = assessAlternativesIndexability(data!.product, PROD);
    expect(assessment.indexable).toBe(true);
  });

  it("keeps sitemap Alternatives ⇔ assessAlternativesIndexability().indexable", () => {
    const paths = getSitemapPathsFixture().filter(
      (p) => p.startsWith("/products/") && p.endsWith("/alternatives"),
    );
    expect(paths.length).toBeGreaterThan(50);

    for (const path of paths) {
      const slug = path
        .slice("/products/".length)
        .replace(/\/alternatives$/, "");
      const product = getProductBySlug(slug, PROD);
      expect(product, path).toBeTruthy();
      const assessment = assessAlternativesIndexability(product!, PROD);
      expect(assessment.indexable, path).toBe(true);
      const elig = getLaunchEligibility(
        { kind: "alternatives", entity: product! },
        PROD,
      );
      expect(isIndexableEligibility(elig), path).toBe(true);
    }
  });

  it("never puts held Alternatives in the sitemap", () => {
    const paths = getSitemapPathSetFixture();
    const catalog = getProducts(PROD);
    const rels = getAllProductRelationships();

    for (const product of catalog) {
      const hold = classifyAlternativesHold(product, rels, catalog);
      if (
        hold === "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET" ||
        hold === "HOLD_DUPLICATE_INTENT" ||
        hold === "HOLD_OBSOLETE_SOURCE"
      ) {
        expect(
          paths.has(`/products/${product.slug}/alternatives`),
          `${product.slug} held as ${hold}`,
        ).toBe(false);
        const assessment = assessAlternativesIndexability(product, PROD);
        expect(assessment.indexable, product.slug).toBe(false);
        expect(assessment.publishable, product.slug).toBe(false);
      }
    }
  });

  it("holds duplicate-intent and insufficient-market examples", () => {
    for (const slug of ALTERNATIVES_HOLD_DUPLICATE_INTENT) {
      const product = getProductBySlug(slug, PROD);
      if (!product) continue;
      const assessment = assessAlternativesIndexability(product, PROD);
      expect(assessment.indexable, slug).toBe(false);
      expect(assessment.publishable, slug).toBe(false);
    }

    const insufficient = [
      "ciele-gocap-athletics",
      "brooks-notch-thermal-beanie",
      "horizon-t202-treadmill",
      "woodway-curve-trainer",
    ];
    for (const slug of insufficient) {
      const product = getProductBySlug(slug, PROD)!;
      const assessment = assessAlternativesIndexability(product, PROD);
      expect(assessment.indexable, slug).toBe(false);
      expect(assessment.publishable, slug).toBe(false);
      expect(String(assessment.holdReason)).toMatch(/INSUFFICIENT|thin/i);
    }
  });

  it("keeps non-indexable categories non-indexable even when graph is rich", () => {
    const outside = getProducts(PROD).find(
      (p) =>
        p.status === "published" &&
        !ALTERNATIVES_INDEXABLE_CATEGORIES.has(p.categoryId),
    );
    if (!outside) return;
    const assessment = assessAlternativesIndexability(outside, PROD);
    expect(assessment.qualitySignals.categoryIndexable).toBe(false);
    expect(assessment.indexable).toBe(false);
  });

  it("removes weak single-reason / thin substantive pages from indexability", () => {
    const paths = getSitemapPathSetFixture();
    for (const slug of [
      "polar-h9",
      "saucony-endorphin-pro-3",
      "nike-pegasus-trail-5",
    ]) {
      const product = getProductBySlug(slug, PROD);
      if (!product) continue;
      const assessment = assessAlternativesIndexability(product, PROD);
      expect(assessment.indexable, slug).toBe(false);
      const elig = getLaunchEligibility(
        { kind: "alternatives", entity: product },
        PROD,
      );
      expect(isIndexableEligibility(elig), slug).toBe(false);
      expect(paths.has(`/products/${slug}/alternatives`), slug).toBe(false);
    }
  });
});

describe("Fix 82 sitemap ⇔ indexable invariant (content types)", () => {
  it("every sitemap product URL is INDEXABLE", () => {
    for (const path of getSitemapPathsFixture().filter(
      (p) =>
        p.startsWith("/products/") &&
        !p.endsWith("/alternatives") &&
        p !== "/products",
    )) {
      const slug = path.replace("/products/", "");
      const product = getProductBySlug(slug, PROD);
      expect(product, path).toBeTruthy();
      expect(
        isIndexableEligibility(
          getLaunchEligibility({ kind: "product", entity: product! }, PROD),
        ),
        path,
      ).toBe(true);
    }
  });

  it("every sitemap review URL is INDEXABLE", () => {
    for (const path of getSitemapPathsFixture().filter((p) =>
      p.startsWith("/reviews/"),
    )) {
      const slug = path.replace("/reviews/", "");
      const review = getReviews(PROD).find((r) => r.slug === slug);
      expect(review, path).toBeTruthy();
      expect(
        isIndexableEligibility(
          getLaunchEligibility({ kind: "review", entity: review! }, PROD),
        ),
        path,
      ).toBe(true);
    }
  });

  it("every sitemap best / guide / comparison / brand URL is INDEXABLE", () => {
    for (const path of getSitemapPathsFixture()) {
      if (path.startsWith("/best/") && path !== "/best") {
        const guide = getBestGuides(PROD).find(
          (g) => g.slug === path.replace("/best/", ""),
        );
        expect(guide, path).toBeTruthy();
        expect(
          isIndexableEligibility(
            getLaunchEligibility(
              { kind: "best-guide", entity: guide! },
              PROD,
            ),
          ),
          path,
        ).toBe(true);
      }
      if (path.startsWith("/guides/") && path !== "/guides") {
        const guide = getBuyingGuides(PROD).find(
          (g) => g.slug === path.replace("/guides/", ""),
        );
        expect(guide, path).toBeTruthy();
        expect(
          isIndexableEligibility(
            getLaunchEligibility(
              { kind: "buying-guide", entity: guide! },
              PROD,
            ),
          ),
          path,
        ).toBe(true);
      }
      if (path.startsWith("/compare/") && path !== "/compare") {
        const cmp = getComparisons(PROD).find(
          (c) => c.slug === path.replace("/compare/", ""),
        );
        expect(cmp, path).toBeTruthy();
        expect(
          isIndexableEligibility(
            getLaunchEligibility({ kind: "comparison", entity: cmp! }, PROD),
          ),
          path,
        ).toBe(true);
      }
      if (path.startsWith("/brands/") && path !== "/brands") {
        const brand = getBrands().find(
          (b) => b.slug === path.replace("/brands/", ""),
        );
        expect(brand, path).toBeTruthy();
        expect(
          isIndexableEligibility(
            getLaunchEligibility({ kind: "brand", entity: brand! }, PROD),
          ),
          path,
        ).toBe(true);
      }
    }
  });
});
