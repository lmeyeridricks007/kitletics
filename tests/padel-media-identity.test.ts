import { describe, expect, it } from "vitest";
import { getBrands, getProductBySlug, getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import {
  classifySharedHeroReuse,
  evaluatePadelHeroIdentity,
  isPadelMediaVerified,
} from "@/lib/product/media-identity";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";

const PROD = { isDev: false as const };
const DEV = { isDev: true as const };
const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));

function registered(productId: string, fullName?: string) {
  return (
    getRunningProductHeroMedia(productId, fullName ?? productId)?.[0] ||
    CATALOG_PRODUCT_MEDIA[productId] ||
    PADEL_SECONDARY_PRODUCT_MEDIA[productId]
  );
}

describe("Padel media identity gate", () => {
  it("4ON ball must not use HEAD Pro S hero (exact Pro T1 manufacturer media only)", () => {
    const p = getProductBySlug("4on-pro-t1", DEV)!;
    expect(p).toBeTruthy();
    const media = registered(p.id, p.fullName);
    expect(media?.src ?? "").not.toContain("head-padel-pro-s");
    expect(media?.src).toContain("4on-pro-t1");
    expect(media?.sourceUrl ?? "").toMatch(/4on\.store.*pro-t1/i);
    expect(media?.sourceUrl ?? "").not.toContain("totalgrip");
    const identity = evaluatePadelHeroIdentity(p, media, {
      brandSlug: brands[p.brandId]?.slug,
    });
    expect(identity.verified).toBe(true);
    expect(getPrimaryProductMedia(p)?.src).toContain("4on-pro-t1");
    expect(p.status).toBe("published");
  });

  it("Adidas bag must not use Nox AT10 hero", () => {
    const bags = getProducts(DEV).filter(
      (p) => p.categoryId === "cat-padel-bags" && p.brandId.includes("adidas"),
    );
    expect(bags.length).toBeGreaterThan(0);
    for (const p of bags) {
      const media = registered(p.id, p.fullName);
      expect(media?.src ?? "").not.toContain("nox-at10-team-paletero");
      if (media) {
        const otherBrand = evaluatePadelHeroIdentity(
          p,
          {
            ...media,
            src: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
            sourceUrl:
              "https://www.padelmq.com/products/nox-at10-team-paletero",
          },
          { brandSlug: brands[p.brandId]?.slug },
        );
        expect(otherBrand.verified).toBe(false);
        expect(otherBrand.reasons.join("|")).toMatch(
          /filename_brand_mismatch|source_other_brand/,
        );
      }
    }
  });

  it("non-Wilson grip must not use Wilson overgrip hero", () => {
    const grips = getProducts(DEV).filter(
      (p) =>
        p.categoryId === "cat-padel-grips" && !p.brandId.includes("wilson"),
    );
    expect(grips.length).toBeGreaterThan(0);
    for (const p of grips.slice(0, 40)) {
      const media = registered(p.id, p.fullName);
      expect(media?.src ?? "").not.toContain("wilson-padel-overgrip");
      const forged = evaluatePadelHeroIdentity(
        p,
        {
          src: "/images/padel/products/wilson-padel-overgrip-hero.jpg",
          sourceUrl: "https://example.com/wilson-padel-overgrip",
          licence: "retailer-authorized",
          attribution: "test",
        },
        { brandSlug: brands[p.brandId]?.slug },
      );
      expect(forged.verified).toBe(false);
    }
  });

  it("non-Bullpadel accessory must not use Bullpadel protector hero", () => {
    const accessories = getProducts(DEV).filter(
      (p) =>
        p.categoryId === "cat-padel-accessories" &&
        !p.brandId.includes("bullpadel"),
    );
    expect(accessories.length).toBeGreaterThan(0);
    for (const p of accessories.slice(0, 40)) {
      const media = registered(p.id, p.fullName);
      expect(media?.src ?? "").not.toContain("bullpadel-frame-protector");
      const forged = evaluatePadelHeroIdentity(
        p,
        {
          src: "/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg",
          sourceUrl: "https://example.com/bullpadel-frame-protector-3-pack",
          licence: "retailer-authorized",
          attribution: "test",
        },
        { brandSlug: brands[p.brandId]?.slug },
      );
      expect(forged.verified).toBe(false);
    }
  });

  it("published padel products resolve MEDIA_VERIFIED primary heroes only", () => {
    const published = getProducts(PROD).filter(
      (p) =>
        p.status === "published" &&
        p.categoryId.startsWith("cat-padel-") &&
        p.categoryId !== "cat-padel-rackets",
    );
    for (const p of published) {
      const primary = getPrimaryProductMedia(p);
      expect(primary, p.slug).toBeTruthy();
      expect(
        isPadelMediaVerified(p, primary, { brandSlug: brands[p.brandId]?.slug }),
      ).toBe(true);
    }
  });

  it("shared hero across unrelated brands is INVALID", () => {
    const a = getProductBySlug("wilson-padel-overgrip-pack", DEV)!;
    const b = getProductBySlug("4on-swiftgrip", DEV)!;
    expect(classifySharedHeroReuse(a, b)).toBe("INVALID");
  });
});
