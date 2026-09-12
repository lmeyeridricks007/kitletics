import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";

/**
 * Limited public research extract — factual catalog fields only.
 * Excludes recommendation scores, affiliate URLs, offers, evidence internals.
 */
export interface RunningShoeResearchExportRow {
  brand: string;
  model: string;
  release_year: string;
  weight_g: string;
  drop_mm: string;
  heel_stack_mm: string;
  forefoot_stack_mm: string;
  primary_use: string;
  surface: string;
  launch_price: string;
}

export const RESEARCH_EXPORT_COLUMNS: Array<keyof RunningShoeResearchExportRow> =
  [
    "brand",
    "model",
    "release_year",
    "weight_g",
    "drop_mm",
    "heel_stack_mm",
    "forefoot_stack_mm",
    "primary_use",
    "surface",
    "launch_price",
  ];

function cell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Build research rows from eligible database records.
 * launch_price stays empty until a canonical launch/MSRP field exists
 * (never filled from affiliate or regional offers).
 */
export function buildRunningShoeResearchExportRows(
  records: RunningShoeDatabaseRecord[],
): RunningShoeResearchExportRow[] {
  return [...records]
    .sort(
      (a, b) =>
        a.brandName.localeCompare(b.brandName) ||
        a.name.localeCompare(b.name),
    )
    .map((r) => ({
      brand: r.brandName,
      model: r.name,
      release_year: cell(r.releaseYear),
      weight_g: cell(r.weightG),
      drop_mm: cell(r.dropMm),
      heel_stack_mm: cell(r.heelStackMm),
      forefoot_stack_mm: cell(r.forefootStackMm),
      primary_use: cell(r.primaryUseLabel ?? r.primaryUseSlug),
      surface: r.surface.join("; "),
      launch_price: "",
    }));
}

export function serializeRunningShoeResearchCsv(
  rows: RunningShoeResearchExportRow[],
): string {
  const header = RESEARCH_EXPORT_COLUMNS.join(",");
  const lines = rows.map((row) =>
    RESEARCH_EXPORT_COLUMNS.map((col) => csvEscape(row[col])).join(","),
  );
  const note =
    "# Kitletics Running Shoe Database — limited research extract. launch_price is blank until canonical launch/MSRP exists. Not a full catalog dump. Not peer-reviewed.";
  return `${note}\n${header}\n${lines.join("\n")}\n`;
}
