import { describe, expect, it } from "vitest";
import {
  getPadelRacketDatabaseRecords,
  getPadelRacketDatabasePageData,
  filterPadelRacketDatabaseRecords,
  sortPadelRacketDatabaseRecords,
  DEFAULT_DATABASE_FILTERS,
  isPadelRacketDatabaseEligible,
} from "@/lib/padel-racket-database";
import { getEligiblePadelRackets } from "@/lib/padel-racket-database/build-records";
import { getPadelRacketStatisticsMethodology } from "@/lib/padel-racket-database/statistics/methodology";
import { assessPadelResearchStoryReadiness } from "@/lib/padel-research";
import { canFeatureProduct } from "@/lib/product/media";
import { PADEL_RACKET_DATASET_META } from "@/lib/padel-racket-database/citation/dataset-meta";

describe("Padel Racket Database", () => {
  it("eligible records > 0 with canFeatureProduct gate", () => {
    const products = getEligiblePadelRackets();
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(isPadelRacketDatabaseEligible(p)).toBe(true);
      expect(canFeatureProduct(p)).toBe(true);
    }
    const records = getPadelRacketDatabaseRecords();
    expect(records.length).toBeGreaterThan(0);
    expect(records.length).toBe(products.length);
  });

  it("filters by shape work", () => {
    const records = getPadelRacketDatabaseRecords();
    const withShape = records.find((r) => r.shape);
    expect(withShape?.shape).toBeTruthy();
    const filtered = filterPadelRacketDatabaseRecords(records, {
      ...DEFAULT_DATABASE_FILTERS,
      shape: [withShape!.shape!],
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((r) => r.shape === withShape!.shape)).toBe(true);
  });

  it("sort recommended is deterministic", () => {
    const records = getPadelRacketDatabaseRecords();
    const a = sortPadelRacketDatabaseRecords(records, "recommended");
    const b = sortPadelRacketDatabaseRecords(records, "recommended");
    expect(a.map((r) => r.id)).toEqual(b.map((r) => r.id));
    for (let i = 1; i < a.length; i++) {
      const prev = a[i - 1]!.score ?? 0;
      const cur = a[i]!.score ?? 0;
      if (prev === cur) {
        expect(
          a[i - 1]!.fullName.localeCompare(a[i]!.fullName),
        ).toBeLessThanOrEqual(0);
      } else {
        expect(prev).toBeGreaterThanOrEqual(cur);
      }
    }
  });

  it("research readiness: prices withheld if priced < threshold; shapes may be ready", () => {
    const records = getPadelRacketDatabaseRecords();
    const readiness = assessPadelResearchStoryReadiness(records);
    const prices = readiness.find((r) => r.slug === "padel-racket-prices");
    const shapes = readiness.find((r) => r.slug === "padel-racket-shapes");
    const weight = readiness.find((r) => r.slug === "padel-racket-weight");
    expect(prices).toBeTruthy();
    expect(shapes).toBeTruthy();
    expect(weight).toBeTruthy();

    const priced = records.filter((r) => r.price).length;
    if (priced < 25) {
      expect(prices!.ready).toBe(false);
    }

    const shapeKnown = records.filter((r) => r.shape).length;
    const shapeClasses = new Set(
      records.map((r) => r.shape).filter(Boolean),
    ).size;
    if (shapeKnown >= 40 && shapeClasses >= 3) {
      expect(shapes!.ready).toBe(true);
    }
  });

  it("no invented industry claims in methodology strings", () => {
    const methodology = getPadelRacketStatisticsMethodology();
    const page = getPadelRacketDatabasePageData();
    const blobs = [
      ...methodology.paragraphs,
      ...page.methodology.paragraphs,
      ...page.datasetAbout.sections.map((s) => s.body),
    ].join("\n");

    const lower = blobs.toLowerCase();
    // Must disclaim industry-wide framing — never assert global market share as fact.
    expect(lower).toMatch(
      /not industry-wide|not a claim.*industry|claiming industry-wide/,
    );
    expect(lower).toMatch(/kitletics cohort|eligible/);
    expect(lower).toMatch(/affiliate commission/);
    expect(lower).not.toMatch(
      /represents \d+% of the (global|worldwide) padel/,
    );
    expect(PADEL_RACKET_DATASET_META.updatedOn).toBeNull();
  });

  it("does not invent weight midpoints on records", () => {
    const records = getPadelRacketDatabaseRecords();
    for (const r of records) {
      if (r.weightMinG !== undefined && r.weightMaxG !== undefined) {
        // No synthetic midpoint field exists; range stays as min/max.
        expect(
          Object.prototype.hasOwnProperty.call(r, "weightMidG"),
        ).toBe(false);
      }
    }
  });
});
