import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";

/**
 * Limited public research extract — factual catalog fields only.
 * Excludes recommendation scores, affiliate URLs, offers.
 */
export interface PadelRacketResearchExportRow {
  brand: string;
  model: string;
  shape: string;
  balance: string;
  weight_min_g: string;
  weight_max_g: string;
  face_material: string;
  core: string;
  feel: string;
  player_level: string;
  primary_use: string;
}

export const RESEARCH_EXPORT_COLUMNS: Array<
  keyof PadelRacketResearchExportRow
> = [
  "brand",
  "model",
  "shape",
  "balance",
  "weight_min_g",
  "weight_max_g",
  "face_material",
  "core",
  "feel",
  "player_level",
  "primary_use",
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

export function buildPadelRacketResearchExportRows(
  records: PadelRacketDatabaseRecord[],
): PadelRacketResearchExportRow[] {
  return [...records]
    .sort(
      (a, b) =>
        a.brandName.localeCompare(b.brandName) ||
        a.name.localeCompare(b.name),
    )
    .map((r) => ({
      brand: r.brandName,
      model: r.name,
      shape: cell(r.shape),
      balance: cell(r.balance),
      weight_min_g: cell(r.weightMinG),
      weight_max_g: cell(r.weightMaxG),
      face_material: cell(r.faceMaterial),
      core: cell(r.core),
      feel: cell(r.feel),
      player_level: cell(r.playerLevel),
      primary_use: cell(r.useCaseLabels[0] ?? r.useCaseSlugs[0]),
    }));
}

export function serializePadelRacketResearchCsv(
  rows: PadelRacketResearchExportRow[],
): string {
  const header = RESEARCH_EXPORT_COLUMNS.join(",");
  const lines = rows.map((row) =>
    RESEARCH_EXPORT_COLUMNS.map((col) => csvEscape(row[col])).join(","),
  );
  const note =
    "# Kitletics Padel Racket Database — limited research extract. weight_min_g is published min weight (no invented midpoints). Not a full catalog dump. Not peer-reviewed. Not industry-wide market share.";
  return `${note}\n${header}\n${lines.join("\n")}\n`;
}
