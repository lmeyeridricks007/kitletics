/**
 * Fix 48 — unified editorial readiness gate.
 * INDEXABLE ⊆ editorial READY for Review / Best / Guide / Comparison.
 * No absolute URL count ceilings.
 */

import { describe, expect, it } from "vitest";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessEditorialReadiness,
  isEditorialReady,
} from "@/domain/launch";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getReviews,
} from "@/repositories";

const PROD = { isDev: false as const };

describe("editorial readiness gate (Fix 48)", () => {
  it("every indexable Review is editorial READY", () => {
    const indexable = getReviews(PROD).filter((r) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      ),
    );
    expect(indexable.length).toBeGreaterThan(0);
    for (const review of indexable) {
      const editorial = assessEditorialReadiness(
        { kind: "review", entity: review },
        PROD,
      );
      expect(editorial.ready, review.slug).toBe(true);
      expect(editorial.workState).toBe("READY");
      expect(editorial.dimensions.quality.ok).toBe(true);
      expect(editorial.dimensions.uniqueness.ok).toBe(true);
      expect(editorial.dimensions.evidenceSafety.ok).toBe(true);
      expect(editorial.dimensions.intentUniqueness.ok).toBe(true);
      expect(editorial.dimensions.relationships.ok).toBe(true);
      expect(editorial.dimensions.references.ok).toBe(true);
    }
  });

  it("every indexable Best guide is editorial READY", () => {
    const indexable = getBestGuides(PROD).filter((g) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
      ),
    );
    expect(indexable.length).toBeGreaterThan(0);
    for (const guide of indexable) {
      expect(
        isEditorialReady({ kind: "best-guide", entity: guide }, PROD),
        guide.slug,
      ).toBe(true);
    }
    // No absolute count ceiling — inventory is quality-driven
    expect(indexable.length).toBeLessThan(getBestGuides(PROD).length);
  });

  it("every indexable Guide is editorial READY", () => {
    const indexable = getBuyingGuides(PROD).filter((g) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
      ),
    );
    expect(indexable.length).toBeGreaterThan(0);
    for (const guide of indexable) {
      const editorial = assessEditorialReadiness(
        { kind: "buying-guide", entity: guide },
        PROD,
      );
      expect(editorial.ready, `${guide.slug}: ${editorial.gaps.join(",")}`).toBe(
        true,
      );
    }
  });

  it("every indexable Comparison is editorial READY", () => {
    const indexable = getComparisons(PROD).filter((c) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "comparison", entity: c }, PROD),
      ),
    );
    expect(indexable.length).toBeGreaterThan(0);
    for (const comparison of indexable) {
      const editorial = assessEditorialReadiness(
        { kind: "comparison", entity: comparison },
        PROD,
      );
      expect(
        editorial.ready,
        `${comparison.slug}: ${editorial.gaps.join(",")}`,
      ).toBe(true);
      expect(editorial.dimensions.references.ok).toBe(true);
    }
  });

  it("does not use absolute Review / Best / Guide URL quotas", () => {
    const reviews = getReviews(PROD).filter((r) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      ),
    );
    const best = getBestGuides(PROD).filter((g) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
      ),
    );
    const guides = getBuyingGuides(PROD).filter((g) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
      ),
    );

    // Output of quality + vertical gates — not hard-coded ceilings
    // (legacy ≤12 Best and “~43 Reviews” were inventory snapshots, not quotas)
    expect(best.length).toBeGreaterThan(12);
    expect(reviews.length).toBeGreaterThan(0);
    expect(guides.length).toBeGreaterThan(0);
  });

  it("uniqueness-held reviews are not READY and not INDEXABLE", () => {
    const held = getReviews(PROD).filter((r) => {
      const editorial = assessEditorialReadiness(
        { kind: "review", entity: r },
        PROD,
      );
      return editorial.gaps.some((g) => g.includes("uniqueness"));
    });
    // Corpus may or may not still list holds; when present they must not index
    for (const review of held.slice(0, 20)) {
      expect(
        isIndexableEligibility(
          getLaunchEligibility({ kind: "review", entity: review }, PROD),
        ),
      ).toBe(false);
      expect(
        isEditorialReady({ kind: "review", entity: review }, PROD),
      ).toBe(false);
    }
  });
});
