import { describe, expect, it } from "vitest";
import { getGearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";
import { calculateSetupPrice } from "@/lib/setups/calculate-setup-price";
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { getGearSetupBySlug, getGearSetups } from "@/repositories";
import { DEFAULT_REGION } from "@/domain/shared/types";

describe("Gear Setup page", () => {
  it("resolves marathon-race-day-kit and alias", () => {
    const primary = getGearSetupBySlug("marathon-race-day-kit");
    const alias = getGearSetupBySlug("marathon-race-day");
    expect(primary?.slug).toBe("marathon-race-day-kit");
    expect(alias?.id).toBe(primary?.id);
  });

  it("builds page data with dynamic totals and roles", () => {
    const data = getGearSetupPageData("marathon-race-day-kit", {
      region: DEFAULT_REGION,
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.indexable).toBe(true);
    expect(data!.coreItemCount).toBeGreaterThanOrEqual(4);
    expect(data!.allListItems.length).toBeGreaterThanOrEqual(5);
    expect(data!.variants.length).toBeGreaterThanOrEqual(2);
    expect(data!.relatedGuides.length).toBeGreaterThanOrEqual(2);
    expect(data!.customizeHref).toBe("#make-it-your-own");

    for (const item of data!.allListItems) {
      expect(item.product.status).toBe("published");
      expect(item.roleLabel.length).toBeGreaterThan(0);
      expect(item.compareHref).toContain("category=");
      expect(item.compareHref).not.toContain(",");
    }
  });

  it("does not invent nutrition products for race-day kit", () => {
    const data = getGearSetupPageData("marathon-race-day-kit", {
      isDev: false,
    });
    const cats = data!.allListItems.map((i) => i.product.categoryId);
    expect(cats.some((c) => c.includes("nutrition"))).toBe(false);
  });

  it("calculateSetupPrice never treats unknown as zero", () => {
    const result = calculateSetupPrice({
      items: [
        { productId: "prod-vaporfly-4" },
        { productId: "prod-missing-offer-fixture" },
      ],
      region: DEFAULT_REGION,
    });
    expect(result.unknownCount).toBeGreaterThanOrEqual(1);
    expect(result.knownTotal).not.toBe(0);
    if (result.knownTotal != null) {
      expect(result.knownTotal).toBeGreaterThan(0);
    }
  });

  it("canPublishGearSetup passes for marathon kit", () => {
    const setup = getGearSetupBySlug("marathon-race-day-kit")!;
    const result = canPublishGearSetup(setup);
    expect(result.ok).toBe(true);
  });

  it("template works for non-running setups without running leakage", () => {
    const hyrox = getGearSetups({ isDev: false }).find((s) =>
      s.slug.includes("hyrox"),
    );
    if (!hyrox) return;
    const data = getGearSetupPageData(hyrox.slug, { isDev: false });
    expect(data).toBeDefined();
    expect(data!.eyebrow.toLowerCase()).not.toContain("running shoe");
    expect(JSON.stringify(data!.whyReasons).toLowerCase()).not.toContain(
      "marathon race-day",
    );
  });

  it("padel or short kits still build balanced page data", () => {
    const short = getGearSetups({ isDev: false }).find(
      (s) => s.items.length <= 5 && s.sportId !== "sport-running",
    );
    if (!short) return;
    const data = getGearSetupPageData(short.slug, { isDev: false });
    expect(data!.allListItems.length).toBeGreaterThanOrEqual(1);
    expect(data!.coreItemCount).toBeLessThanOrEqual(short.items.length);
  });
});
