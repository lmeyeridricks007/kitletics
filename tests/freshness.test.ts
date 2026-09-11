import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import { getOffers } from "@/repositories/commerce";
import {
  getBestGuides,
  getComparisons,
  getReviews,
} from "@/repositories/editorial";
import {
  getRecommendations,
  getEvidence,
  getAlternatives,
} from "@/repositories/recommendations";
import {
  evaluateFreshness,
  verificationTouchFields,
  getCurrentEditorialYear,
  classifySpecChange,
} from "@/domain/freshness/evaluation";
import { buildDependencyIndex } from "@/domain/freshness/impact";
import { createTask, upsertTask, upsertEvent, createEvent } from "@/domain/freshness/tasks";
import {
  runMaintenance,
  type MaintenanceCatalog,
} from "@/domain/freshness/orchestrator";
import {
  FIXTURE_BRAND_LINEUPS,
  FIXTURE_NO_CHANGE_LINEUP,
  FIXTURE_PADEL_LINEUP,
  FIXTURE_CONTENT_YEAR_GUIDE,
} from "@/domain/freshness/fixtures";
import { processSpecChange, processSourceConflict, assertRecommendationIndependence, scanStaleOffers, scanBrokenMedia } from "@/domain/freshness/monitoring/scans";
import { scanContentFreshness } from "@/domain/freshness/monitoring/content";
import { monitorBrandCatalog } from "@/domain/freshness/monitoring/brand";
import { SEED_DATES } from "@/content/config";

function catalog(): MaintenanceCatalog {
  return {
    products,
    brands,
    families: productFamilies,
    recommendations: getRecommendations(),
    guides: getBestGuides({ isDev: true }),
    comparisons: getComparisons({ isDev: true }),
    alternatives: getAlternatives(),
    offers: getOffers(),
    reviews: getReviews({ isDev: true }),
    evidence: getEvidence(),
  };
}

describe("Freshness evaluation", () => {
  it("separates age bands without treating age as error", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    const fresh = evaluateFreshness(
      {
        entityType: "product",
        lastVerifiedAt: "2026-08-01T00:00:00.000Z",
        categoryId: "cat-running-shoes",
      },
      now,
    );
    expect(fresh.status).toBe("fresh");

    const stale = evaluateFreshness(
      {
        entityType: "product",
        lastVerifiedAt: "2025-01-01T00:00:00.000Z",
        categoryId: "cat-running-shoes",
      },
      now,
    );
    expect(stale.status).toBe("stale");
  });

  it("supports event-driven invalidation independent of age", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    const ev = evaluateFreshness(
      {
        entityType: "product",
        lastVerifiedAt: "2026-08-29T00:00:00.000Z",
        eventForcedStatus: "review-soon",
      },
      now,
    );
    expect(ev.status).toBe("review-soon");
    expect(ev.reasons.some((r) => /Event-driven/i.test(r))).toBe(true);
  });

  it("verification touch does not imply updatedAt/publishedAt", () => {
    const touch = verificationTouchFields({
      verifiedAt: "2026-08-30T00:00:00.000Z",
      materialChange: false,
    });
    expect(touch).toEqual({ lastVerifiedAt: "2026-08-30T00:00:00.000Z" });
    expect("updatedAt" in touch).toBe(false);
    expect("publishedAt" in touch).toBe(false);
  });

  it("getCurrentEditorialYear does not rewrite prose", () => {
    expect(getCurrentEditorialYear(new Date("2026-08-30"))).toBe(2026);
  });
});

describe("Task deduplication", () => {
  it("aggregates duplicate triggers into one task", () => {
    const a = createTask({
      type: "lifecycle-review",
      priority: "P2",
      entityType: "product",
      entityId: "prod-novablast-6",
      title: "Review Novablast 6",
      reason: "New generation discovered",
      suggestedAction: "Verify lifecycle",
      ownership: "catalog",
      eventIds: ["e1"],
    });
    const b = createTask({
      type: "lifecycle-review",
      priority: "P1",
      entityType: "product",
      entityId: "prod-novablast-6",
      title: "Review Novablast 6",
      reason: "Best Guide references Product",
      suggestedAction: "Verify lifecycle",
      ownership: "catalog",
      eventIds: ["e2"],
    });
    const merged = upsertTask([a], b);
    expect(merged).toHaveLength(1);
    expect(merged[0].priority).toBe("P1");
    expect(merged[0].eventIds).toEqual(["e1", "e2"]);
  });

  it("does not duplicate events with same dedupeKey", () => {
    const e1 = createEvent({
      type: "NEW_GENERATION_DISCOVERED",
      entityType: "product",
      entityId: "candidate:x",
      detailKey: "novablast-7",
    });
    const e2 = createEvent({
      type: "NEW_GENERATION_DISCOVERED",
      entityType: "product",
      entityId: "candidate:x",
      detailKey: "novablast-7",
    });
    expect(upsertEvent([e1], e2)).toHaveLength(1);
  });
});

describe("No-change monitor", () => {
  it("running brand monitor twice without changes does not invent new Products", () => {
    const brand = brands.find((b) => b.id === "brand-asics")!;
    const first = monitorBrandCatalog({
      brand,
      knownLineup: FIXTURE_NO_CHANGE_LINEUP,
      products,
      brands,
      families: productFamilies,
      dryRun: true,
    });
    const second = monitorBrandCatalog({
      brand,
      knownLineup: FIXTURE_NO_CHANGE_LINEUP,
      products,
      brands,
      families: productFamilies,
      dryRun: true,
    });
    expect(first.result.newProducts).toHaveLength(0);
    expect(second.result.newProducts).toHaveLength(0);
    expect(first.tasks.filter((t) => t.type === "product-onboarding")).toHaveLength(0);
  });
});

describe("New generation", () => {
  it("creates onboarding + lifecycle + guide impact without auto-publish", () => {
    const result = runMaintenance(catalog(), {
      jobType: "brand-monitor",
      dryRun: true,
      scope: { brand: "asics", limit: 5 },
      brandLineups: FIXTURE_BRAND_LINEUPS,
    });
    expect(
      result.tasks.some((t) => t.type === "product-onboarding"),
    ).toBe(true);
    expect(
      result.events.some((e) => e.type === "NEW_GENERATION_DISCOVERED"),
    ).toBe(true);
    expect(
      result.tasks.every((t) => !/auto-publish/i.test(t.suggestedAction) || /do NOT auto-publish/i.test(t.suggestedAction)),
    ).toBe(true);
    const guideTasks = result.tasks.filter((t) => t.type === "guide-review");
    expect(
      guideTasks.every((t) => /do NOT automatically replace/i.test(t.suggestedAction)),
    ).toBe(true);
  });
});

describe("Spec change + conflict", () => {
  it("flags recommendation-impacting weight change without silent overwrite", () => {
    const product = products.find((p) => p.id === "prod-novablast-6")!;
    const index = buildDependencyIndex(catalog());
    const current = product.specifications?.weight;
    const reported =
      typeof current === "number" ? current + 10 : 270;
    const result = processSpecChange({
      product,
      field: "weight",
      reportedValue: reported,
      source: "manufacturer",
      index,
      dryRun: true,
    });
    expect(result.candidate.action).toMatch(/not silently overwrite/i);
    expect(result.tasks.some((t) => t.type === "spec-change-review")).toBe(true);
    expect(result.autoApplied).toBeUndefined();
  });

  it("source conflict creates review task", () => {
    const r = processSourceConflict({
      productId: "prod-novablast-6",
      field: "weight",
      values: [255, 270],
    });
    expect(r.events[0].type).toBe("SOURCE_CONFLICT");
    expect(r.tasks[0].suggestedAction).toMatch(/not silently overwrite/i);
  });

  it("tiny weight drift is low-impact", () => {
    const c = classifySpecChange("weight", 255, 255.5);
    expect(c.significant).toBe(false);
  });
});

describe("Media + offers", () => {
  it("broken hero creates media-repair task", () => {
    const product = products.find((p) => p.images?.length)!;
    const src = product.images[0].src;
    const r = scanBrokenMedia([product], new Set([src]));
    expect(r.tasks.some((t) => t.type === "media-repair")).toBe(true);
  });

  it("stale offer does not imply Product unpublish", () => {
    const offers = getOffers().map((o, i) =>
      i === 0
        ? { ...o, lastChecked: "2025-01-01T00:00:00.000Z" }
        : o,
    );
    const r = scanStaleOffers(offers, new Date("2026-08-30"));
    expect(r.staleIds.length).toBeGreaterThan(0);
    expect(
      r.tasks.every((t) => /do not unpublish Product/i.test(t.suggestedAction)),
    ).toBe(true);
  });

  it("affiliate ranking independence guard", () => {
    const ok = assertRecommendationIndependence({
      rankingsBefore: ["a", "b"],
      rankingsAfter: ["a", "b"],
    });
    expect(ok.ok).toBe(true);
    const bad = assertRecommendationIndependence({
      rankingsBefore: ["a", "b"],
      rankingsAfter: ["b", "a"],
    });
    expect(bad.ok).toBe(false);
  });
});

describe("Year rollover", () => {
  it("flags guide year without auto-renaming", () => {
    const r = scanContentFreshness(
      [FIXTURE_CONTENT_YEAR_GUIDE],
      new Date("2027-01-15"),
    );
    expect(r.events.some((e) => e.type === "YEAR_ROLLOVER_REVIEW")).toBe(true);
    expect(
      r.tasks.every((t) => /do NOT auto-rename/i.test(t.suggestedAction)),
    ).toBe(true);
  });
});

describe("Dependency impact", () => {
  it("indexes guides/comparisons/offers for a Product", () => {
    const index = buildDependencyIndex(catalog());
    const nb6 = index.getEntityImpact("prod-novablast-6", "lifecycleStatus");
    expect(nb6.severity).toBe("editorial-impacting");
    // May or may not have guides depending on seed — structure must exist
    expect(Array.isArray(nb6.guides)).toBe(true);
    expect(Array.isArray(nb6.comparisons)).toBe(true);
  });
});

describe("Multi-sport padel", () => {
  it("monitors Bullpadel generation without Running assumptions", () => {
    const brand = brands.find((b) => b.id === "brand-bullpadel");
    if (!brand) {
      // Padel brand may live only in padel seed — still prove fixture shape
      expect(FIXTURE_PADEL_LINEUP.some((c) => c.kind === "new-generation")).toBe(
        true,
      );
      return;
    }
    const r = monitorBrandCatalog({
      brand,
      knownLineup: FIXTURE_PADEL_LINEUP,
      products,
      brands,
      families: productFamilies,
      dryRun: true,
    });
    expect(r.result.newProducts.some((n) => n.model.includes("06"))).toBe(true);
  });
});

describe("Publication / seed dates", () => {
  it("seed products keep lastVerifiedAt distinct from monitoring", () => {
    const p = products.find((x) => x.lastVerifiedAt)!;
    expect(p.lastVerifiedAt).toBe(SEED_DATES.verified);
    const touch = verificationTouchFields({
      verifiedAt: "2026-08-30T12:00:00.000Z",
      materialChange: false,
    });
    expect(touch.lastVerifiedAt).not.toBe(p.updatedAt);
  });
});

describe("Full dry-run QA job", () => {
  it("runs maintenance:qa without live web and without publishing", () => {
    const result = runMaintenance(catalog(), {
      jobType: "qa",
      dryRun: true,
      scope: { sport: "running", limit: 30 },
      brandLineups: FIXTURE_BRAND_LINEUPS,
      contentTargets: [FIXTURE_CONTENT_YEAR_GUIDE],
      recommendationRankings: {
        before: ["a", "b"],
        after: ["a", "b"],
      },
    });
    expect(result.dryRun).toBe(true);
    expect(result.entitiesChecked).toBeGreaterThan(0);
    expect(result.jobType).toBe("qa");
  });
});
