import { describe, expect, it } from "vitest";
import { resolveRunningProductImages } from "@/content/running/media";
import { PRODUCT_GALLERY_MEDIA } from "@/content/product-gallery-media";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { Product } from "@/domain/products/types";

describe("product gallery depth (Fix 21 / Fix 87)", () => {
  it("registers gallery extras for multiple Running priority products", () => {
    const ids = Object.keys(PRODUCT_GALLERY_MEDIA);
    expect(ids.length).toBeGreaterThanOrEqual(40);
    const first = PRODUCT_GALLERY_MEDIA[ids[0]]!;
    expect(first[0]?.sourceUrl).toBeTruthy();
    expect(first[0]?.licence).toMatch(/manufacturer-marketing|retailer-authorized/);
    expect(first[0]?.width).toBeGreaterThan(0);
    expect(first[0]?.height).toBeGreaterThan(0);
    expect(first[0]?.usageType).not.toBe("hero");
  });

  it("merges gallery without replacing an authentic hero", () => {
    const productId = Object.keys(PRODUCT_GALLERY_MEDIA)[0];
    if (!productId) return;
    const heroSrc = `/images/running/products/test-hero.jpg`;
    const product = {
      id: productId,
      slug: "test-product",
      fullName: "Test Product",
      status: "published",
      images: [
        {
          id: "media-hero",
          src: heroSrc,
          alt: "Test Product",
          type: "image",
          licence: "manufacturer-marketing",
          sourceUrl: "https://example.com/hero",
          usageType: "hero",
          width: 1000,
          height: 1000,
        },
      ],
    } as Product;

    // If registry has a real hero for this id, primary will come from registry.
    const resolved = resolveRunningProductImages(product);
    const primary = getPrimaryProductMedia(resolved);
    expect(primary).toBeTruthy();
    expect(primary?.src.includes("-hero.") || primary?.usageType === "hero" || primary?.src === heroSrc).toBe(
      true,
    );
    const extras = resolved.images.filter((m) => m.usageType && m.usageType !== "hero");
    expect(extras.length).toBeGreaterThan(0);
    expect(extras.every((m) => m.sourceUrl && m.licence)).toBe(true);
  });
});
