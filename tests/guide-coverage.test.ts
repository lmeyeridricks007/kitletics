import { describe, expect, it } from "vitest";
import { getBestGuideBySlug } from "@/repositories";
import {
  getGuideCandidateUniverse,
  resolveGuideCoverage,
} from "@/lib/best/guide-coverage";

describe("guide coverage model", () => {
  it("never equates recommendations with considered when set is missing on raw seed", () => {
    // Raw tempo seed may author a considered set; when it does not, coverage
    // must not invent a considered count from recommendation length alone.
    // Repository normalize fills authentic sets from the candidate universe —
    // assert that path produces considered ≥ recommended, never a fake equality
    // that pretends only picks were evaluated when the universe is larger.
    const guide = getBestGuideBySlug("tempo-running-shoes");
    expect(guide).toBeDefined();
    const coverage = resolveGuideCoverage(guide!);
    expect(coverage.hasAuthenticConsideredSet).toBe(true);
    expect(coverage.consideredCount).toBeGreaterThanOrEqual(
      coverage.recommendedCount,
    );
    const universe = getGuideCandidateUniverse(guide!);
    if (universe.length > coverage.recommendedCount) {
      expect(coverage.consideredCount).toBeGreaterThan(
        coverage.recommendedCount,
      );
    }
  });

  it("long-runs has authentic considered broader than recommendations", () => {
    const guide = getBestGuideBySlug("running-shoes-long-runs")!;
    const coverage = resolveGuideCoverage(guide);
    const universe = getGuideCandidateUniverse(guide);
    expect(coverage.hasAuthenticConsideredSet).toBe(true);
    expect(coverage.consideredCount).toBeGreaterThan(coverage.recommendedCount);
    expect(coverage.recommendedCount).toBeGreaterThanOrEqual(6);
    expect(universe.length).toBeGreaterThanOrEqual(20);
    for (const id of coverage.recommendedProductIds) {
      expect(coverage.consideredProductIds).toContain(id);
    }
    for (const id of coverage.shortlistedProductIds) {
      expect(coverage.consideredProductIds).toContain(id);
    }
  });
});
