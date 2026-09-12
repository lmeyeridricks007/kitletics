import { describe, expect, it } from "vitest";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database/get-page-data";
import {
  RUNNING_SHOE_DATASET_META,
  buildRunningShoeResearchExportRows,
  serializeRunningShoeResearchCsv,
  RESEARCH_EXPORT_COLUMNS,
} from "@/lib/running-shoe-database/citation";

describe("running shoe dataset citation layer", () => {
  it("builds about payload with dynamic counts and no fake freshness date", () => {
    const page = getRunningShoeDatabasePageData({ options: { isDev: false } });
    const about = page.datasetAbout;

    expect(about.shoeCount).toBe(page.total);
    expect(about.brandCount).toBe(page.insights.market.brandCount);
    expect(about.brandNames.length).toBe(about.brandCount);
    expect(about.citationText).toContain("Kitletics Running Shoe Database");
    expect(about.citationText).toContain(about.canonicalUrl);
    expect(about.citationText.toLowerCase()).not.toContain("peer-reviewed");

    // Seed boilerplate is not a reliable dataset stamp
    expect(RUNNING_SHOE_DATASET_META.updatedOn).toBeNull();
    expect(about.datasetUpdatedOn).toBeNull();
    expect(about.sections.some((s) => s.id === "affiliate")).toBe(true);
    expect(about.contact.correctionsHref).toContain("mailto:hello@kitletics.com");
  });

  it("exports a limited research CSV without scores or affiliate fields", () => {
    const page = getRunningShoeDatabasePageData({ options: { isDev: false } });
    const rows = buildRunningShoeResearchExportRows(page.records);
    expect(rows.length).toBe(page.total);
    expect(RESEARCH_EXPORT_COLUMNS).not.toContain("recommendationScore");
    expect(RESEARCH_EXPORT_COLUMNS).not.toContain("url");

    for (const row of rows) {
      expect(row.launch_price).toBe("");
      expect(Object.keys(row).sort()).toEqual([...RESEARCH_EXPORT_COLUMNS].sort());
    }

    const csv = serializeRunningShoeResearchCsv(rows);
    expect(csv).toContain("brand,model,release_year");
    expect(csv.toLowerCase()).not.toContain("affiliate");
    expect(csv).not.toMatch(/recommendationScore|valueScore|amzn\.to/);
  });
});
