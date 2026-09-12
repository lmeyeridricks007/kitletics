import { describe, expect, it } from "vitest";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { getBuyingGuideBySlug, getBestGuideBySlug } from "@/repositories";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  resolveBestGuideImage,
  resolveBestGuideMethodologyImage,
  resolveUniqueBestGuideImages,
} from "@/lib/best/resolve-best-guide-image";
import { getBestIndexData } from "@/lib/best/get-best-guide-page-data";
import { resolveGuideImageSrc } from "@/lib/search/facets";
import {
  classifySemanticPlacement,
  inferEditorialTopic,
  isSemanticallyCompatible,
  resolveSemanticImage,
} from "@/lib/media/semantic-image";

const PADEL = "/images/home/guide-how-to-choose.jpg";
const SKYLINE = "/images/brands/heroes/urban-dusk.jpg";

describe("semantic image resolver", () => {
  it("never treats the padel how-to-choose file as a running-watch image", () => {
    expect(
      isSemanticallyCompatible(PADEL, "gps_watches", "card"),
    ).toBe(false);
    expect(
      isSemanticallyCompatible(SKYLINE, "gps_watches", "hero"),
    ).toBe(false);
    expect(isSemanticallyCompatible(PADEL, "padel_rackets", "card")).toBe(true);
  });

  it("resolves How to Choose a Running Watch to watch photography", () => {
    const guide = getBuyingGuideBySlug("how-to-choose-running-watch");
    expect(guide).toBeTruthy();
    const image = resolveGuideImage(guide!);
    expect(image.src).toMatch(/watches\//);
    expect(image.src).not.toMatch(/guide-how-to-choose|urban-dusk/);
    const cls = classifySemanticPlacement({
      src: image.src,
      slug: guide!.slug,
      title: guide!.title,
      categoryId: guide!.categoryId,
    });
    expect(cls.class).not.toMatch(/WRONG_/);
  });

  it("keeps homepage featured/latest watch cards on watch photography", () => {
    const data = getHomepageData({ region: "NL" });
    expect(data.featuredGuide?.href).toMatch(/how-to-choose-running-/);
    expect(data.featuredGuide?.imageSrc).not.toMatch(
      /guide-how-to-choose|urban-dusk|guide-tennis/,
    );
    const watch = data.latestGuides.find(
      (g) => g.slug === "how-to-choose-running-watch",
    );
    expect(watch?.imageSrc).toMatch(/watches\//);
    expect(data.journalItems[0]?.imageSrc).toBe(data.latestGuides[0]?.imageSrc);
  });

  it("resolves Best running-watch surfaces without skyline or padel", () => {
    const guide = getBestGuideBySlug("running-watches");
    expect(guide).toBeTruthy();
    const image = resolveBestGuideImage(guide!);
    expect(image.src).not.toMatch(/urban-dusk|guide-how-to-choose|running-urban/);
    expect(image.src).toMatch(/watches|best-gps-watches/);
    expect(resolveBestGuideMethodologyImage(guide!)).not.toMatch(
      /guide-how-to-choose|urban-dusk/,
    );
  });

  it("does not assign padel or skyline when unique-matching watch hub cards", () => {
    const { guides } = getBestIndexData();
    const unique = resolveUniqueBestGuideImages(guides);
    for (const guide of guides) {
      const image = unique.get(guide.id) ?? resolveBestGuideImage(guide);
      const topic = inferEditorialTopic({
        slug: guide.slug,
        title: guide.title,
        categoryId: guide.categoryId,
      });
      if (topic === "gps_watches" || topic === "hrm") {
        expect(
          image.src,
          `${guide.slug} → ${image.src}`,
        ).not.toMatch(/guide-how-to-choose|urban-dusk|guide-tennis/);
      }
      if (topic === "running_shoes") {
        expect(image.src).not.toMatch(/guide-how-to-choose|urban-dusk/);
      }
    }
  });

  it("search how-to-choose cards follow the article, not a padel filler", () => {
    expect(
      resolveGuideImageSrc({
        slug: "how-to-choose-running-watch",
        title: "How to Choose a Running Watch",
      }),
    ).toMatch(/watches\//);
    expect(
      resolveGuideImageSrc({
        slug: "how-to-choose-running-shoes",
        title: "How to Choose Running Shoes",
      }),
    ).not.toMatch(/guide-how-to-choose/);
    expect(
      resolveGuideImageSrc({
        slug: "how-to-choose-a-padel-racket",
        title: "How to Choose a Padel Racket",
      }),
    ).toMatch(/padel|guide-how-to-choose/);
  });

  it("maps sunglasses and safety away from shoe crops and skyline", () => {
    const sunglasses = getBestGuideBySlug("running-sunglasses");
    const safety = getBestGuideBySlug("running-safety-visibility");
    if (sunglasses) {
      expect(resolveBestGuideImage(sunglasses).src).not.toMatch(
        /daily-vs-long|urban-dusk|guide-how-to-choose/,
      );
    }
    if (safety) {
      expect(resolveBestGuideImage(safety).src).not.toMatch(
        /urban-dusk|guide-how-to-choose|daily-vs-long/,
      );
    }
  });

  it("does not classify UNKNOWN as CORRECT", () => {
    const cls = classifySemanticPlacement({
      src: "/images/running/reviews/review-research-assessment.jpg",
      slug: "how-to-choose-running-watch",
      title: "How to Choose a Running Watch",
      categoryId: "cat-gps-watches",
    });
    expect(cls.class).toBe("UNKNOWN");
  });

  it("resolver never returns padel for a watch topic", () => {
    const resolved = resolveSemanticImage({
      pageType: "guide",
      placement: "card",
      slug: "how-to-choose-running-watch",
      title: "How to Choose a Running Watch",
      categoryId: "cat-gps-watches",
      dedicatedSrc: PADEL,
    });
    expect(resolved.src).not.toBe(PADEL);
    expect(resolved.src).toMatch(/watches|best-gps/);
  });
});
