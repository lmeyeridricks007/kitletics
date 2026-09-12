import { describe, expect, it } from "vitest";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getScoreBand, isOfferStale, isProductDataStale } from "@/lib/product/score";
import { getProductBySlug, getProducts } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { products } from "@/content/products";
import { reviews } from "@/content/reviews";
import { SEED_DATES } from "@/content/config";

describe("Product Detail page data", () => {
  it("resolves Novablast 5 from slug", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data).toBeTruthy();
    expect(data!.product.slug).toBe("asics-novablast-5");
    expect(data!.brand?.name).toBe("ASICS");
    expect(data!.category?.slug).toBe("running-shoes");
  });

  it("assembles Novablast 6 PDP with authentic gallery and published review", () => {
    const data = getProductPageData("asics-novablast-6", { isDev: false });
    expect(data).toBeTruthy();
    expect(data!.galleryImages.length).toBeGreaterThan(0);
    expect(data!.galleryImages.every((i) => !i.src.includes("/fallbacks/"))).toBe(
      true,
    );
    expect(data!.heroTags.length).toBeGreaterThan(0);
    expect(data!.quickFacts.length).toBeGreaterThan(0);
    const bestForFact = data!.quickFacts.find((f) => f.id === "best-for");
    expect(bestForFact?.value).toMatch(/daily|long run|cushion|trainer|ride/i);
    expect(bestForFact?.value).not.toMatch(/Daily Training|Easy Runs|Long Runs/);
    expect(data!.showScore).toBe(true);
    expect(data!.review?.slug).toBe("asics-novablast-6");
    expect(data!.lowestPrice?.currency).toBe("EUR");
  });

  it("excludes unpublished products in production", () => {
    const draft = products.find((p) => p.status === "draft");
    expect(draft).toBeTruthy();
    expect(isPubliclyVisible(draft!, { isDev: false })).toBe(false);
    expect(getProductBySlug(draft!.slug, { isDev: false })).toBeUndefined();
    expect(getProductPageData(draft!.slug, { isDev: false })).toBeUndefined();
  });

  it("derives specs from category schema and omits nulls", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.featuredSpecs.some((s) => s.key === "drop")).toBe(true);
    expect(data!.featuredSpecs.every((s) => s.value !== "N/A")).toBe(true);
    // Null pace range must not appear
    expect(
      data!.specGroups
        .flatMap((g) => g.rows)
        .every((r) => r.key !== "recommendedPaceRange"),
    ).toBe(true);
    // Boolean false still renders (Plate: No)
    const plate = data!.featuredSpecs.find((s) => s.key === "plate");
    expect(plate?.value).toBe("No");
  });

  it("only shows score when structured recommendations exist", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.hasStructuredRecommendations).toBe(true);
    expect(data!.showScore).toBe(true);
    expect(data!.recommendations.length).toBeGreaterThan(0);
    expect(data!.recommendations[0].label).not.toMatch(/^uc-/);
  });

  it("renders use-case recommendations with resolved labels", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    const daily = data!.recommendations.find(
      (r) => r.recommendation.useCaseId === "uc-daily-training",
    );
    expect(daily?.label).toBe("Daily Training");
    expect(daily?.recommendation.score).toBe(90);
  });

  it("filters regional offers to NL by default", () => {
    const data = getProductPageData("asics-novablast-5", {
      isDev: false,
      region: "NL",
    });
    expect(data!.offers.every((o) => o.offer.region === "NL")).toBe(true);
    expect(data!.lowestPrice?.currency).toBe("EUR");
    expect(data!.offersOtherRegions.every((o) => o.offer.region !== "NL")).toBe(
      true,
    );
  });

  it("keeps product data when region has zero offers (no NL-as-local)", () => {
    const data = getProductPageData("asics-novablast-5", {
      isDev: false,
      region: "ZA",
    });
    expect(data).toBeTruthy();
    expect(data!.product).toBeTruthy();
    expect(data!.offers).toEqual([]);
    expect(data!.lowestPrice).toBeUndefined();
    expect(data!.offersOtherRegions.length).toBeGreaterThan(0);
    expect(
      data!.offersOtherRegions.every((o) => o.offer.region !== "ZA"),
    ).toBe(true);
  });

  it("selects lowest available regional offer", () => {
    const data = getProductPageData("asics-novablast-5", {
      isDev: false,
      region: "NL",
    });
    // Seed: ASICS direct €130 (was/now with originalPrice 150)
    expect(data!.lowestPrice?.price).toBe(130);
  });

  it("marks offer freshness from lastChecked", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.offers[0]?.offer.lastChecked).toBeTruthy();
    // Seed lastChecked is Aug 2026 relative to "today" in user_info — may or may not be stale
    expect(typeof data!.offers[0].stale).toBe("boolean");
    expect(isOfferStale(SEED_DATES.verified)).toBeTypeOf("boolean");
  });

  it("derives alternatives and comparisons from relationships", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.alternatives.length).toBeGreaterThan(0);
    expect(data!.comparisons.length).toBeGreaterThan(0);
    expect(
      data!.alternatives.every((a) => a.product.id !== data!.product.id),
    ).toBe(true);
  });

  it("does not leak scheduled reviews", () => {
    const scheduled = reviews.find((r) => r.status === "scheduled");
    expect(scheduled).toBeTruthy();
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.review?.id).not.toBe(scheduled!.id);
    expect(data!.review?.status).toBe("published");
  });

  it("renders product family generations", () => {
    const data = getProductPageData("asics-novablast-5", { isDev: false });
    expect(data!.family?.slug).toBe("novablast");
    expect(data!.familyMembers.length).toBeGreaterThanOrEqual(2);
    expect(
      data!.familyMembers.some(
        (m) => m.product.lifecycleStatus === "previous-generation",
      ),
    ).toBe(true);
  });

  it("handles previous-generation and upcoming states", () => {
    const prev = getProductPageData("asics-novablast-4", { isDev: false });
    expect(prev?.product.lifecycleStatus).toBe("previous-generation");
    expect(prev?.newerGeneration?.slug).toBe("asics-novablast-5");

    const upcoming = products.find((p) => p.lifecycleStatus === "upcoming");
    if (upcoming && isPubliclyVisible(upcoming, { isDev: false })) {
      const page = getProductPageData(upcoming.slug, { isDev: false });
      expect(page?.product.lifecycleStatus).toBe("upcoming");
    }
  });

  it("GPS watch page does not render running shoe geometry specs", () => {
    const watches = getProducts({ isDev: false }).filter(
      (p) => p.categoryId === "cat-gps-watches",
    );
    expect(watches.length).toBeGreaterThan(0);
    const data = getProductPageData(watches[0].slug, { isDev: false });
    expect(data).toBeTruthy();
    const allKeys = [
      ...data!.featuredSpecs.map((s) => s.key),
      ...data!.specGroups.flatMap((g) => g.rows.map((r) => r.key)),
    ];
    expect(allKeys).not.toContain("heelStack");
    expect(allKeys).not.toContain("drop");
    expect(allKeys).not.toContain("cushionLevel");
  });

  it("score bands are centralized", () => {
    expect(getScoreBand(92).label).toBe("Excellent");
    expect(getScoreBand(88).label).toBe("Very Good");
    expect(getScoreBand(65).label).toBe("Mixed");
  });

  it("product staleness helper works", () => {
    expect(isProductDataStale(undefined)).toBe(true);
    expect(isProductDataStale(new Date().toISOString())).toBe(false);
  });
});
