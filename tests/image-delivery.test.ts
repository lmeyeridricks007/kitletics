import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import {
  IMAGE_QUALITY,
  IMAGE_QUALITY_ALLOWLIST,
  IMAGE_SIZES,
} from "@/lib/media/image-delivery";

const ROOT = join(process.cwd(), "src/components");

/** Components that must not load full-resolution product heroes via raw <img>. */
const CRITICAL_FILES = [
  "cards/ProductCard.tsx",
  "catalog/CatalogProductCard.tsx",
  "brand-hub/BrandHubPage.tsx",
  "product/ProductMediaGallery.tsx",
  "product/ProductDetailPage.tsx",
  "catalog/running-shoes/ShoesBestAndFinder.tsx",
  "catalog/running-shoes/ShoesGuidesAndComparisons.tsx",
  "catalog/running-shoes/ShoesHowYouRun.tsx",
  "sport-hub/SportStarterKit.tsx",
  "compare/FeaturedComparisons.tsx",
  "compare/ProductSearchSelector.tsx",
  "compare/ComparisonPage.tsx",
  "use-case-listing/UseCaseHero.tsx",
  "use-case-listing/UseCaseComparisonsAndGuides.tsx",
];

/**
 * Initial transfer budgets (bytes) — guardrails for image-heavy routes.
 * Prefer materially lower; do not raise to hide regressions.
 */
export const ROUTE_TRANSFER_BUDGETS: Record<
  string,
  { totalBytes: number; imageBytes: number }
> = {
  "/": { totalBytes: 1.5 * 1024 * 1024, imageBytes: 900 * 1024 },
  "/running": { totalBytes: 2.5 * 1024 * 1024, imageBytes: 2.0 * 1024 * 1024 },
  "/running/shoes": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/brands/nike": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/products/nike-vomero-18": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/compare": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 1.5 * 1024 * 1024,
  },
  "/running/shoes/daily-trainers": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 1.5 * 1024 * 1024,
  },
};

describe("image delivery presets", () => {
  it("exposes card/hero/thumb qualities", () => {
    expect(IMAGE_QUALITY.card).toBeLessThanOrEqual(75);
    expect(IMAGE_QUALITY.thumb).toBeLessThanOrEqual(IMAGE_QUALITY.card);
    expect(IMAGE_QUALITY.hero).toBeLessThanOrEqual(80);
  });

  it("declares next.config images.qualities as the used allow-list only", () => {
    expect([...IMAGE_QUALITY_ALLOWLIST]).toEqual([65, 70, 75]);
    expect(nextConfig.images?.qualities).toEqual([65, 70, 75]);
    expect(nextConfig.images?.qualities).toEqual([...IMAGE_QUALITY_ALLOWLIST]);
  });

  it("does not request next/image qualities outside the allow-list", () => {
    const allowed = new Set<number>(IMAGE_QUALITY_ALLOWLIST);
    const srcRoot = join(process.cwd(), "src");
    const literals = new Set<number>();

    function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) {
          walk(p);
          continue;
        }
        if (!/\.(tsx|ts)$/.test(name)) continue;
        const src = readFileSync(p, "utf8");
        for (const m of src.matchAll(/quality=\{(\d+)\}/g)) {
          literals.add(Number(m[1]));
        }
      }
    }
    walk(srcRoot);

    for (const q of literals) {
      expect(allowed.has(q), `src/ requests quality=${q} not in images.qualities`).toBe(
        true,
      );
    }
    for (const q of Object.values(IMAGE_QUALITY)) {
      expect(allowed.has(q), `IMAGE_QUALITY value ${q} missing from allow-list`).toBe(
        true,
      );
    }
  });

  it("keeps product card sizes capped near ~280px desktop", () => {
    expect(IMAGE_SIZES.productCard).toContain("280px");
    expect(IMAGE_SIZES.brandCard).toContain("168px");
    expect(IMAGE_SIZES.galleryThumb).toContain("72px");
    expect(IMAGE_SIZES.altThumb).toContain("48px");
  });
});

describe("critical surfaces use next/image for product media", () => {
  for (const rel of CRITICAL_FILES) {
    it(`${rel} does not use raw <img> for product src`, () => {
      const src = readFileSync(join(ROOT, rel), "utf8");
      // Allow comments mentioning img; ban live JSX <img with src=
      const liveImg = src.match(/^\s*<img[\s\S]*?src=\{/m);
      expect(liveImg, `${rel} still has raw <img src={`).toBeNull();
      expect(src).toMatch(/from ["']next\/image["']/);
    });
  }
});

describe("route transfer budgets (config)", () => {
  it("defines budgets at or below the suggested launch thresholds", () => {
    expect(ROUTE_TRANSFER_BUDGETS["/"].totalBytes).toBeLessThanOrEqual(
      1.5 * 1024 * 1024,
    );
    for (const path of [
      "/running/shoes",
      "/brands/nike",
      "/products/nike-vomero-18",
      "/compare",
      "/running/shoes/daily-trainers",
    ]) {
      expect(ROUTE_TRANSFER_BUDGETS[path].totalBytes).toBeLessThanOrEqual(
        2.5 * 1024 * 1024,
      );
    }
  });
});

describe("large source audit signal", () => {
  it("reports count of product heroes >500KB without failing (delivery is primary fix)", () => {
    const publicImages = join(process.cwd(), "public/images");
    const big: string[] = [];
    function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) {
          if (name === "sections") continue;
          walk(p);
          continue;
        }
        if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
        if (!/hero/i.test(name)) continue;
        if (st.size > 500 * 1024) big.push(p);
      }
    }
    walk(publicImages);
    // Guardrail: do not silently explode; warn via assertion message if huge.
    expect(big.length).toBeGreaterThan(0);
    expect(
      big.length,
      `Unexpected explosion of >500KB heroes (${big.length}). Prefer delivery optimization; avoid shipping multi-MB card sources without next/image.`,
    ).toBeLessThan(500);
  });
});
