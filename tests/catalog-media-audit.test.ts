/**
 * Fix 83 — catalog media auditor unit coverage.
 * Uses the same getPrimaryProductMedia / classifyGap path as media:ci.
 */
import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";
import { classifyGap } from "../scripts/lib/catalog-media-audit";
import { scanHeroIdentities } from "../scripts/lib/hero-identity";
import { hasRegisteredProductHero } from "@/content/running/products/media-publish-gate";
import { getProductBySlug, getProducts } from "@/repositories";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PROD = { isDev: false as const };

function baseProduct(overrides: Partial<Product> & { id: string; slug: string }): Product {
  const { id, slug, ...rest } = overrides;
  return {
    id,
    slug,
    brandId: "brand-asics",
    categoryId: "cat-running-shoes",
    sportIds: ["sport-running"],
    disciplineIds: [],
    subcategoryIds: [],
    name: "Test Shoe",
    fullName: "Test Shoe",
    shortDescription: "Fixture product for media CI",
    status: "published",
    lifecycleStatus: "current",
    images: [],
    videos: [],
    useCaseIds: [],
    specifications: {},
    strengths: [],
    weaknesses: [],
    experienceLevels: [],
    offerIds: [],
    evidenceIds: [],
    relatedProductIds: [],
    alternativeProductIds: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    publishedAt: "2024-01-01T00:00:00.000Z",
    ...rest,
  };
}

function authenticHero(src: string): MediaAsset {
  return {
    id: "media-test-hero",
    src,
    alt: "Test",
    width: 1000,
    height: 1000,
    type: "image",
    licence: "manufacturer-marketing",
    sourceUrl: "https://example.com/product",
    source: "Manufacturer",
    usageType: "hero",
  };
}

describe("Fix 83 catalog media auditor", () => {
  it("uses canonical getPrimaryProductMedia (not a duplicate helper)", () => {
    const novablast = getProductBySlug("asics-novablast-6", PROD);
    expect(novablast).toBeTruthy();
    const media = getPrimaryProductMedia(novablast!);
    expect(media?.src).toBeTruthy();
    expect(isAuthenticProductMedia(media)).toBe(true);
    expect(classifyGap(novablast!)).toBeNull();
  });

  it("flags missing primary", () => {
    const product = baseProduct({
      id: "prod-media-ci-missing",
      slug: "media-ci-missing",
      images: [],
    });
    expect(getPrimaryProductMedia(product)).toBeUndefined();
    expect(classifyGap(product)?.reason).toBe("no-primary");
  });

  it("flags placeholder-only media", () => {
    const product = baseProduct({
      id: "prod-media-ci-placeholder",
      slug: "media-ci-placeholder",
      images: [
        {
          id: "ph",
          src: "/fallbacks/product.svg",
          alt: "Placeholder",
          type: "image",
          licence: "kitletics-owned",
        },
      ],
    });
    expect(getPrimaryProductMedia(product)).toBeUndefined();
    expect(classifyGap(product)?.reason).toBe("placeholder-only");
  });

  it("flags broken file when authentic src is missing on disk", () => {
    const product = baseProduct({
      id: "prod-media-ci-broken",
      slug: "media-ci-broken",
      images: [
        authenticHero("/images/running/products/__does-not-exist-hero.jpg"),
      ],
    });
    expect(getPrimaryProductMedia(product)?.src).toContain("does-not-exist");
    expect(classifyGap(product)?.reason).toBe("broken-file");
  });

  it("flags invalid association when only non-authentic images exist", () => {
    const product = baseProduct({
      id: "prod-media-ci-illustration",
      slug: "media-ci-illustration",
      images: [
        {
          id: "ill",
          src: "/images/running/products/some-illustration.png",
          alt: "Illustration",
          type: "image",
          licence: "kitletics-owned",
          attribution: "Kitletics illustration — not a product photograph",
        },
      ],
    });
    expect(getPrimaryProductMedia(product)).toBeUndefined();
    const gap = classifyGap(product);
    expect(gap?.reason).toBe("placeholder-only");
  });

  it("permits intentional media-gated drafts (gate keeps them unpublished)", () => {
    const drafts = getProducts({ isDev: true }).filter(
      (p) => p.status === "draft" && p.slug.includes("kiprun"),
    );
    // Trail 10 (and similar) stay draft until a licensed hero is registered.
    const trail = getProducts({ isDev: true }).find(
      (p) => p.slug === "kiprun-trail-10",
    );
    if (trail) {
      const gated =
        trail.status === "draft" || !hasRegisteredProductHero(trail.id);
      expect(gated).toBe(true);
    }
    // Production audit scope is published-only — drafts never enter P0.
    const publishedDrafts = getProducts(PROD).filter(
      (p) => p.status === "draft",
    );
    expect(publishedDrafts.length).toBe(0);
    void drafts;
  });

  it("flags shared-hero (wrong-brand / duplicate packshot mapping)", () => {
    const dir = mkdtempSync(join(tmpdir(), "media-ci-shared-"));
    try {
      const bytes = Buffer.from(
        "fake-shared-hero-bytes-for-wrong-brand-mapping-test",
      );
      const aPath = join(dir, "a-hero.jpg");
      const bPath = join(dir, "b-hero.jpg");
      writeFileSync(aPath, bytes);
      writeFileSync(bPath, bytes);
      const productA = baseProduct({
        id: "prod-shared-a",
        slug: "shared-a",
        fullName: "Shared A",
      });
      const productB = baseProduct({
        id: "prod-shared-b",
        slug: "shared-b",
        fullName: "Shared B",
        brandId: "brand-hoka",
      });
      const hits = scanHeroIdentities(
        [
          { product: productA, src: "/tmp/a-hero.jpg", absPath: aPath },
          { product: productB, src: "/tmp/b-hero.jpg", absPath: bPath },
        ],
        { ocr: false },
      );
      expect(hits.some((h) => h.reason === "shared-hero")).toBe(true);
      expect(hits.map((h) => h.slug).sort()).toEqual(["shared-a", "shared-b"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
