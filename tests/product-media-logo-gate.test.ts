import { describe, expect, it } from "vitest";
import { isLogoOrWordmarkMedia } from "@/lib/product/logo-media";
import { isAuthenticProductMedia } from "@/lib/product/media";
import type { MediaAsset } from "@/domain/shared/types";

function media(partial: Partial<MediaAsset> & Pick<MediaAsset, "src">): MediaAsset {
  return {
    id: "media-test",
    alt: "Test",
    type: "image",
    ...partial,
  };
}

describe("logo / wordmark authentic gate", () => {
  it("rejects MediaAsset type logo and icon", () => {
    expect(
      isAuthenticProductMedia(
        media({
          src: "/images/packs/products/nathan-mirage-pak-hero.jpg",
          type: "logo",
          licence: "manufacturer-marketing",
          sourceUrl: "https://nathansports.com/",
        }),
      ),
    ).toBe(false);
    expect(
      isLogoOrWordmarkMedia(
        media({ src: "/images/x.png", type: "icon" }),
      ),
    ).toBe(true);
  });

  it("rejects brand logo paths even with manufacturer licence", () => {
    expect(
      isAuthenticProductMedia(
        media({
          src: "/images/brands/nathan-logo.svg",
          licence: "manufacturer-marketing",
          sourceUrl: "https://nathansports.com/",
        }),
      ),
    ).toBe(false);
  });

  it("rejects -logo filenames and wordmark attribution", () => {
    expect(
      isLogoOrWordmarkMedia(
        media({ src: "/images/packs/products/nathan-logo-hero.jpg" }),
      ),
    ).toBe(true);
    expect(
      isLogoOrWordmarkMedia(
        media({
          src: "/images/packs/products/foo-hero.jpg",
          attribution: "Brand logo placeholder — not a product photograph",
        }),
      ),
    ).toBe(true);
  });

  it("rejects extreme-aspect UI wordmark dimensions", () => {
    expect(
      isLogoOrWordmarkMedia(
        media({
          src: "/images/packs/products/fake-hero.jpg",
          width: 200,
          height: 48,
        }),
      ),
    ).toBe(true);
  });

  it("still accepts licensed product heroes", () => {
    expect(
      isAuthenticProductMedia(
        media({
          src: "/images/packs/products/nathan-mirage-pak-hero.jpg",
          licence: "manufacturer-marketing",
          sourceUrl: "https://nathansports.com/products/mirage-pack-adjustable-belt",
          width: 1024,
          height: 1365,
        }),
      ),
    ).toBe(true);
  });
});
