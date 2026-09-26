import { describe, expect, it } from "vitest";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { padelBuyingGuides } from "@/content/padel/buying-guides";
import { racketReviewFromDraft } from "@/content/padel/reviews/build-racket-review";
import { getPadelRacketDraft } from "@/content/padel/rackets";
import { PADEL_KNOWLEDGE_PLANS } from "@/lib/guides/explainers/padel-knowledge-plans";
import { isDerivedHeroCrop } from "@/lib/media/semantic-role";
import {
  duplicateReviewBodies,
  excessiveAssetRepeats,
  unrelatedGuideHeroCollisions,
} from "@/lib/padel/experience-gates";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { resolveReviewSectionVisuals } from "@/lib/review/resolve-section-visuals";
import { getBestGuides } from "@/repositories/editorial";
import type { ContentSection } from "@/domain/editorial/types";

describe("padel experience parity foundation", () => {
  it("gives each padel knowledge guide a distinct hero", () => {
    const srcs = PADEL_KNOWLEDGE_PLANS.map((plan) => plan.heroImageSrc);
    const dupes = srcs.filter((src, index) => srcs.indexOf(src) !== index);
    expect(dupes).toEqual([]);
    expect(srcs.some((src) => src.endsWith("/images/padel/hero.jpg"))).toBe(false);
    expect(srcs.filter((src) => src.endsWith("/guides/choose-racket.jpg"))).toEqual([
      "/images/padel/guides/choose-racket.jpg",
    ]);
  });

  it("does not treat a section crop as a second photograph", () => {
    expect(
      isDerivedHeroCrop(
        "/images/padel/products/bullpadel-vertex-05-2026/sections/power.png",
      ),
    ).toBe(true);
    expect(
      isDerivedHeroCrop(
        "/images/padel/products/bullpadel-vertex-05/gallery/bullpadel-vertex-05-angle.webp",
      ),
    ).toBe(false);
  });

  it("accepts Vertex gallery angles as that racket and assigns each once", () => {
    const images = getProductGalleryMedia(
      "prod-bullpadel-vertex-05",
      "Bullpadel Vertex 05",
    );
    expect(images.map((img) => img.usageType)).toEqual([
      "side",
      "rear",
      "top",
      "detail",
      "other",
    ]);
    const product = {
      id: "prod-bullpadel-vertex-05",
      slug: "bullpadel-vertex-05-2026",
      name: "Vertex 05",
      brandId: "brand-bullpadel",
      categoryId: "cat-padel-rackets",
      sportIds: ["sport-padel"],
    };
    for (const img of images) {
      const identity = evaluatePadelHeroIdentity(product, img, {
        brandSlug: "bullpadel",
      });
      expect(identity.verified, identity.reasons.join(",")).toBe(true);
    }

    const sections: ContentSection[] = [
      { id: "sec-construction", heading: "Construction", body: "Frame." },
      { id: "sec-shape", heading: "Shape and balance", body: "Diamond." },
      { id: "sec-power", heading: "Power", body: "Attack." },
      { id: "sec-spin", heading: "Spin", body: "Texture." },
      { id: "sec-sweetspot", heading: "Sweet spot / forgiveness", body: "Mishits." },
    ];
    const resolved = resolveReviewSectionVisuals(sections, {
      categoryId: "cat-padel-rackets",
      productSlug: "bullpadel-vertex-05-2026",
      productHero: {
        id: "hero",
        src: "/images/padel/products/bullpadel-vertex-05-hero.png",
        alt: "Vertex 05",
        type: "image",
      },
      productImages: [
        {
          id: "hero",
          src: "/images/padel/products/bullpadel-vertex-05-hero.png",
          alt: "Vertex 05",
          type: "image",
        },
        ...images,
        {
          id: "crop",
          src: "/images/padel/products/bullpadel-vertex-05-2026/sections/power.png",
          alt: "crop",
          type: "image",
        },
      ],
    });
    const srcs = resolved.map((section) => section.image?.src).filter(Boolean);
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(srcs.some((src) => src?.includes("/sections/"))).toBe(false);
    expect(srcs.some((src) => src?.includes("-hero"))).toBe(false);
    // Leftover authentic gallery angles round-robin onto remaining major sections.
    expect(resolved.find((s) => s.id === "sec-sweetspot")?.image?.src).toBeTruthy();
    // Construction prefers face-filling side/detail/top — not sparse edge-profile.
    const constructionSrc =
      resolved.find((s) => s.id === "sec-construction")?.image?.src ?? "";
    expect(constructionSrc).toBeTruthy();
    expect(constructionSrc).not.toContain("profile");
    expect(srcs.length).toBe(5);
  });

  it("does not reuse one hero across unrelated padel guides", () => {
    const planHero = new Map(
      PADEL_KNOWLEDGE_PLANS.map((plan) => [plan.slug, plan.heroImageSrc]),
    );
    const assignments = padelBuyingGuides.map((guide) => ({
      slug: guide.slug,
      src: planHero.get(guide.slug) ?? guide.hubImageSrc ?? "",
    }));
    const collisions = unrelatedGuideHeroCollisions(assignments);
    expect(collisions).toEqual([]);
    expect(assignments.filter((row) => !row.src)).toEqual([]);
  });

  it("keeps racket review sections on distinct evidence", () => {
    const draft = getPadelRacketDraft("prod-bullpadel-vertex-05");
    expect(draft).toBeTruthy();
    const review = racketReviewFromDraft({
      draft: draft!,
      reviewId: "review-bullpadel-vertex-05",
    });
    expect(review.reviewType).toBe("expert-research");
    expect(review.whoShouldBuy.length).toBeGreaterThanOrEqual(2);
    expect(review.whoShouldAvoid.length).toBeGreaterThanOrEqual(2);
    expect(duplicateReviewBodies(review.sections.map((section) => section.body))).toEqual(
      [],
    );
    const stamped = review.sections.filter((section) =>
      /not a smash-speed test|I'd shortlist it when that job shows up/i.test(section.body),
    );
    expect(stamped).toEqual([]);
  });

  it("flags a guide image reused inside one article", () => {
    const hero = "/images/padel/products/bullpadel-vertex-05-hybrid-hero.jpg";
    const repeats = excessiveAssetRepeats([hero, hero, "/images/padel/guides/choose-shoes.jpg"]);
    expect(repeats).toEqual([{ src: hero, count: 2 }]);
    expect(
      excessiveAssetRepeats([
        "/images/padel/guides/choose-racket.jpg",
        "/images/padel/guides/choose-shoes.jpg",
      ]),
    ).toEqual([]);
  });

  it("does not reuse one card image across unrelated padel best guides", () => {
    const assignments = getBestGuides()
      .filter((guide) => guide.sportId === "sport-padel")
      .map((guide) => ({ slug: guide.slug, src: guide.hubImageSrc ?? "" }));
    const collisions = unrelatedGuideHeroCollisions(assignments);
    expect(assignments.filter((row) => !row.src)).toEqual([]);
    expect(collisions).toEqual([]);
  });

  it("rejects generator residue and numbered-heading glue in public padel copy pathways", () => {
    const draft = getPadelRacketDraft("prod-kuikma-pr-comfort-soft");
    expect(draft).toBeTruthy();
    const review = racketReviewFromDraft({
      draft: draft!,
      reviewId: "review-kuikma-pr-comfort-soft",
    });
    const blob = [
      ...(review.whoShouldBuy ?? []),
      ...(review.whoShouldAvoid ?? []),
      ...(review.pros ?? []),
      ...(review.cons ?? []),
      ...review.sections.map((s) => s.body),
    ].join("\n");
    expect(blob).not.toMatch(/Live NL product URL/i);
    expect(blob).not.toMatch(/should still be attached/i);
    expect(blob).not.toMatch(/\bTODO\b|\bFIXME\b/);

    for (const plan of PADEL_KNOWLEDGE_PLANS) {
      expect(plan.factors?.title).not.toMatch(/^\d/);
      expect(plan.examples?.title).not.toMatch(/^\d/);
      expect(plan.factors?.title).toBe("Factors that should drive the choice");
      expect(plan.examples?.title).toBe("Approaches for this decision");
    }
  });

  it("registers extra photographs for flagship rackets, not only Vertex", () => {
    for (const id of [
      "prod-bullpadel-hack-04",
      "prod-nox-at10-12k-2026",
      "prod-head-coello-pro",
      "prod-babolat-technical-viper",
    ]) {
      expect(getProductGalleryMedia(id, id).length).toBeGreaterThanOrEqual(3);
    }
  });
});
