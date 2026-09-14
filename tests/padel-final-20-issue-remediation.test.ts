/**
 * Regression: final 20-issue padel launch cleanup (setups + schema leaks).
 */
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { getGearSetups, getProducts, getReviews } from "@/repositories";
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { getLaunchEligibility } from "@/domain/launch/get-launch-eligibility";
import { buildPadelRacketDatasetAbout } from "@/lib/padel-racket-database/citation/about-dataset";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { extendPadelLongformSectionBody } from "@/lib/review/padel-longform";
import {
  formatPublicAccessoryTypeNoun,
  formatPublicSpecCue,
  isRawPublicSpecKey,
  publicSpecRowKey,
} from "@/lib/specs/public-label";
import { inspectPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { padelSoftPdpEditorialStore } from "@/content/padel/pdp-editorial/store.generated";

const PROD = { isDev: false as const };
const PADEL_SETUPS = [
  "padel-starter-kit",
  "padel-beginner-kit",
  "padel-budget-starter-kit",
  "padel-club-player-kit",
  "padel-commuter-kit",
  "padel-competitive-player-kit",
  "padel-tournament-day-kit",
] as const;

const ACCESSORY_ENUMS = [
  "customization_weight",
  "frame_tape",
  "grip_system",
  "training_aid",
  "ball_basket",
] as const;

function flattenPublicCopy(value: unknown, key?: string): string {
  if (
    key === "specifications" ||
    key === "id" ||
    key === "productId" ||
    key === "specKey" ||
    key === "key" ||
    key === "defaultSectionKeys" ||
    key === "keySpecKeys" ||
    key === "glanceKeys" ||
    key === "comparisonKeys" ||
    key === "enumValues"
  ) {
    return "";
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map((v) => flattenPublicCopy(v)).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => flattenPublicCopy(v, k))
      .join("\n");
  }
  return "";
}

describe("padel final 20-issue remediation", () => {
  it("inventories every published padel setup with an explicit disposition", () => {
    const setups = getGearSetups(PROD).filter(
      (s) => s.sportId === "sport-padel" || s.slug.startsWith("padel-"),
    );
    expect(setups.map((s) => s.slug).sort()).toEqual([...PADEL_SETUPS].sort());

    for (const setup of setups) {
      const eligibility = getLaunchEligibility(
        { kind: "setup", entity: setup },
        PROD,
      );
      expect(
        ["INDEXABLE", "PUBLIC_NOINDEX", "HIDDEN_404"],
        setup.slug,
      ).toContain(eligibility.disposition);
      expect(canPublishGearSetup(setup).ok, setup.slug).toBe(true);
      expect(eligibility.disposition, setup.slug).toBe("INDEXABLE");
    }
  });

  it("keeps every sitemap padel setup URL on a published gear setup", () => {
    const setupSlugs = new Set(
      getGearSetups(PROD)
        .filter((s) => s.sportId === "sport-padel" || s.slug.startsWith("padel-"))
        .map((s) => s.slug),
    );
    const site = sitemap();
    const padelSetupPaths = site
      .map((e) => new URL(e.url).pathname)
      .filter((p) => p.startsWith("/setups/padel"));
    expect(padelSetupPaths.length).toBeGreaterThanOrEqual(PADEL_SETUPS.length);
    for (const path of padelSetupPaths) {
      const slug = path.replace(/^\/setups\//, "");
      expect(setupSlugs.has(slug), path).toBe(true);
    }
  });

  it("never prints customization_weight or accessory snake enums in soft PDP copy", () => {
    expect(formatPublicAccessoryTypeNoun("customization_weight")).toBe(
      "racket balance-adjustment accessory",
    );
    expect(formatPublicSpecCue("type", "customization_weight")).toBe(
      "type customization weight",
    );
    expect(isRawPublicSpecKey("is a customization_weight accessory")).toBe(
      true,
    );

    const accessories = getProducts(PROD).filter(
      (p) => p.categoryId === "cat-padel-accessories" && p.status === "published",
    );
    expect(accessories.length).toBeGreaterThan(0);
    for (const product of accessories) {
      const page = getProductPageData(product.slug, PROD);
      expect(page, product.slug).toBeTruthy();
      const text = flattenPublicCopy(page);
      for (const raw of ACCESSORY_ENUMS) {
        expect(text, `${product.slug} leaked ${raw}`).not.toContain(raw);
      }
      expect(text, product.slug).not.toContain("curated_seed");
      expect(isRawPublicSpecKey(text), product.slug).toBe(false);
    }

    for (const [id, copy] of Object.entries(padelSoftPdpEditorialStore)) {
      const blob = `${copy.whatItIs ?? ""}\n${(copy.buyIf ?? []).join("\n")}`;
      expect(blob, id).not.toContain("customization_weight");
    }
  });

  it("does not interpolate courtFeel schema keys into padel shoe review extenders", () => {
    const review = getReviews(PROD).find(
      (r) => r.slug === "adidas-courtquick-padel",
    );
    const product = getProducts(PROD).find(
      (p) => p.slug === "adidas-courtquick-padel",
    );
    expect(review && product).toBeTruthy();
    for (const pass of [1, 2, 3]) {
      const body = extendPadelLongformSectionBody(
        "courtFeel",
        product!,
        review!,
        pass,
      );
      expect(body).not.toMatch(/\bcourtFeel\b/);
      expect(body).not.toMatch(/\bthis court feel job\b/i);
      expect(isRawPublicSpecKey(body)).toBe(false);
    }

    const page = getReviewPageData("adidas-courtquick-padel", PROD);
    expect(page).toBeTruthy();
    expect(page!.config.keySpecKeys).not.toContain("courtFeel");
    expect(page!.config.keySpecKeys).not.toContain("genderFit");
    expect(page!.config.glanceKeys).not.toContain("genderFit");
    const text = flattenPublicCopy(page);
    expect(text).not.toMatch(/\bcourtFeel\b/);
    expect(text).not.toMatch(/\bgenderFit\b/);
  });

  it("keeps public spec row keys spoken, not camelCase", () => {
    expect(publicSpecRowKey("genderFit")).toBe("fit");
    expect(publicSpecRowKey("courtFeel")).toBe("court-feel");
  });

  it("does not expose database implementation prose", () => {
    const about = buildPadelRacketDatasetAbout([], "NL");
    const blob = about.sections.map((s) => s.body).join("\n");
    expect(blob).not.toMatch(/updatedOn/);
    expect(blob).not.toMatch(/stays null/i);
    expect(blob).not.toMatch(/intentional stamp/i);
    expect(inspectPublicContentCorruption(blob)).toEqual([]);
  });
});
