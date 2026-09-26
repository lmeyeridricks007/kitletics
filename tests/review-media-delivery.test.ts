import { describe, expect, it } from "vitest";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { padelEstateReviews } from "@/content/padel/reviews";
import {
  isKnownUndeployablePublicImagePath,
  isRenderableReviewMediaSrc,
  resolveDeliverableMediaSrc,
} from "@/lib/media/deliverable-media-src";
import { assessmentVisual } from "@/lib/review/resolve-section-visuals";
import {
  classifyResolvedMediaSrcSync,
  collectResolvedReviewMediaSrcs,
  exactCasePublicFileExists,
} from "@/lib/review/review-media-delivery";
import { getProductById } from "@/repositories/products";
import { getPrimaryProductMedia } from "@/lib/product/media";

describe("review media delivery (Prompt 193)", () => {
  it("remaps undeployed gallery paths to authenticated sourceUrl", () => {
    const remote =
      "https://cdn.shopify.com/s/files/1/0531/2013/9427/files/Bullpadel-Hack-04_2025_Padel_Racket_PadelUSA_store_6.webp";
    expect(
      resolveDeliverableMediaSrc({
        src: "/images/padel/products/bullpadel-hack-04/gallery/bullpadel-hack-04-throat.webp",
        sourceUrl: remote,
      }),
    ).toBe(remote);
  });

  it("rejects known-undeployable local gallery/education paths as renderable", () => {
    expect(
      isRenderableReviewMediaSrc(
        "/images/padel/products/bullpadel-hack-04/gallery/bullpadel-hack-04-throat.webp",
      ),
    ).toBe(false);
    expect(
      isKnownUndeployablePublicImagePath(
        "/images/padel/education/padel-racket-shapes.svg",
      ),
    ).toBe(true);
    expect(
      isRenderableReviewMediaSrc("/media/padel/education/padel-racket-shapes.svg"),
    ).toBe(true);
  });

  it("detects case mismatches on tracked media paths", () => {
    expect(
      exactCasePublicFileExists("/media/padel/education/padel-racket-shapes.svg"),
    ).toBe(true);
    expect(
      exactCasePublicFileExists("/media/padel/education/Padel-Racket-Shapes.svg"),
    ).toBe(false);
  });

  it("Hack assessment resolves to a valid deliverable asset (not undeployed gallery)", () => {
    const product = getProductById("prod-bullpadel-hack-04");
    expect(product).toBeTruthy();
    const gallery = getProductGalleryMedia(
      "prod-bullpadel-hack-04",
      product!.fullName,
    );
    expect(gallery.some((g) => g.usageType === "other" && g.sourceUrl)).toBe(
      true,
    );
    const visual = assessmentVisual({
      seedInput: "review-bullpadel-hack-04",
      productSlug: product!.slug,
      categoryId: product!.categoryId,
      heroSrc: product!.images[0]?.src,
      productImages: product!.images,
    });
    expect(visual?.src).toBeTruthy();
    expect(isRenderableReviewMediaSrc(visual!.src)).toBe(true);
    expect(isKnownUndeployablePublicImagePath(visual!.src)).toBe(false);
    expect(visual!.src.startsWith("https://")).toBe(true);
    expect(visual!.src).toContain("cdn.shopify.com");
  });

  it("resolver never emits known-invalid local gallery/education references for Hack", () => {
    const product = getProductById("prod-bullpadel-hack-04");
    const review = padelEstateReviews.find(
      (r) => r.productId === "prod-bullpadel-hack-04",
    );
    expect(product && review).toBeTruthy();
    const srcs = collectResolvedReviewMediaSrcs({
      review: review!,
      product: product!,
      productImages: product!.images,
      heroSrc: getPrimaryProductMedia(product!)?.src ?? product!.images[0]?.src,
    });
    for (const src of srcs) {
      expect(isKnownUndeployablePublicImagePath(src), src).toBe(false);
      expect(isRenderableReviewMediaSrc(src), src).toBe(true);
      const cls = classifyResolvedMediaSrcSync(src);
      expect(
        ["VALID_LOCAL_ASSET", "VALID_REMOTE_ASSET"].includes(cls),
        `${src} → ${cls}`,
      ).toBe(true);
    }
  });

  it("every local media source for public Padel reviews exists or is a remapped remote", () => {
    expect(padelEstateReviews.length).toBe(26);

    const unique = new Set<string>();
    for (const review of padelEstateReviews) {
      const product = getProductById(review.productId);
      expect(product, review.productId).toBeTruthy();
      const hero =
        getPrimaryProductMedia(product!)?.src ?? product!.images[0]?.src;
      const srcs = collectResolvedReviewMediaSrcs({
        review,
        product: product!,
        productImages: product!.images,
        heroSrc: hero,
      });
      for (const src of srcs) unique.add(src);
    }

    expect(unique.size).toBeGreaterThan(10);

    let missingLocal = 0;
    let caseMismatch = 0;
    let stale = 0;
    let badPath = 0;

    for (const src of unique) {
      expect(isKnownUndeployablePublicImagePath(src), src).toBe(false);
      const cls = classifyResolvedMediaSrcSync(src);
      if (cls === "MISSING_LOCAL_ASSET") missingLocal += 1;
      if (cls === "CASE_MISMATCH") caseMismatch += 1;
      if (cls === "STALE_REFERENCE") stale += 1;
      if (cls === "BAD_PUBLIC_PATH") badPath += 1;
      expect(
        ["VALID_LOCAL_ASSET", "VALID_REMOTE_ASSET"].includes(cls),
        `${src} → ${cls}`,
      ).toBe(true);
    }

    expect(missingLocal).toBe(0);
    expect(caseMismatch).toBe(0);
    expect(stale).toBe(0);
    expect(badPath).toBe(0);
  });

  it("invalid/missing media does not count as renderable (no broken img contract)", () => {
    expect(
      isRenderableReviewMediaSrc(
        "/images/padel/products/missing/gallery/nope.webp",
      ),
    ).toBe(false);
    expect(isRenderableReviewMediaSrc("")).toBe(false);
    expect(isRenderableReviewMediaSrc(undefined)).toBe(false);
  });

  it("does not remap gallery to unsupported or dead remote hosts", () => {
    expect(
      resolveDeliverableMediaSrc({
        src: "/images/padel/products/kuikma-pr-comfort-soft/gallery/kuikma-pr-comfort-soft-angle.jpg",
        sourceUrl:
          "https://en.decathlon.com.sa/cdn/shop/files/pic_34ab91ee-5ec8-48fc-adff-f9d7b554eb92.jpg?v=1790212751&width=1200",
      }),
    ).toBe(
      "/images/padel/products/kuikma-pr-comfort-soft/gallery/kuikma-pr-comfort-soft-angle.jpg",
    );
    expect(
      isRenderableReviewMediaSrc(
        "/images/padel/products/kuikma-pr-comfort-soft/gallery/kuikma-pr-comfort-soft-angle.jpg",
      ),
    ).toBe(false);
  });

  it("resolveRunningProductImages remaps padel gallery to deliverable remotes for PDPs", async () => {
    const { resolveRunningProductImages } = await import("@/content/running/media");
    const { getProductById } = await import("@/repositories/products");
    const product = getProductById("prod-bullpadel-hack-04");
    expect(product).toBeTruthy();
    const resolved = resolveRunningProductImages(product!);
    const gallery = resolved.images.filter((img) => img.usageType && img.usageType !== "hero");
    expect(gallery.length).toBeGreaterThan(0);
    for (const img of gallery) {
      expect(isKnownUndeployablePublicImagePath(img.src), img.src).toBe(false);
      expect(isRenderableReviewMediaSrc(img.src), img.src).toBe(true);
      expect(img.src.startsWith("https://")).toBe(true);
    }
  });

  it("omits Kuikma gallery when only dead Decathlon remotes exist", async () => {
    const { getProductById } = await import("@/repositories/products");
    const product = getProductById("prod-kuikma-pr-comfort-soft");
    expect(product).toBeTruthy();
    const undeployed = (product!.images ?? []).filter(
      (img) =>
        img.src.includes("/gallery/") ||
        img.src.includes("en.decathlon.com.sa"),
    );
    expect(undeployed).toEqual([]);
  });
});
