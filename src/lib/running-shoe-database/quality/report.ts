/**
 * Cohort quality report for the public Running Shoe Database.
 */

import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import { assessRunningShoeQuality } from "@/lib/running-shoe-database/quality/assess";
import type {
  FieldCoverageRow,
  QualityFieldKey,
  QualityMetricKey,
  RecordQualityStatus,
  RunningShoeDatabaseQualityReport,
  ShoeQualityAssessment,
} from "@/lib/running-shoe-database/quality/types";

export const STATISTICS_AFFECTED_BY_QUALITY: string[] = [
  "marketInsights.averageWeightByBrand",
  "marketInsights.averageOfferPriceByBrand",
  "marketInsights.lightestDailyTrainers",
  "marketInsights.highestStackShoes",
  "marketInsights.lowestDropTrainers",
  "marketInsights.bestValueUnderPrice (price + valueScore path)",
  "marketInsights.platedVsNonPlated",
  "marketInsights.summary averages (weight/drop/stack/price)",
  "dataExplorer.weightDistribution",
  "dataExplorer.dropDistribution",
  "dataExplorer.stackDistribution",
  "dataExplorer.priceDistribution",
  "dataExplorer.brandAverage charts",
  "pageInsights.avgWeightG / avgDropMm / avgHeelStackMm",
];

const ALL_FIELDS: QualityFieldKey[] = [
  "brand",
  "model",
  "primaryImage",
  "primaryUse",
  "gender",
  "weight",
  "drop",
  "heelStack",
  "forefootStack",
  "price",
  "releaseYear",
  "surface",
  "plate",
];

const METRICS: QualityMetricKey[] = [
  "weight",
  "drop",
  "heelStack",
  "forefootStack",
  "price",
  "plate",
];

function emptyStatusCounts(): Record<RecordQualityStatus, number> {
  return { VALID: 0, PARTIAL: 0, SUSPECT: 0, INVALID: 0 };
}

function codesFor(a: ShoeQualityAssessment): string[] {
  return [
    ...new Set(
      a.fields
        .filter((f) => f.status === "suspect" || f.status === "invalid")
        .map((f) => f.code ?? `${f.field}_${f.status}`)
        .filter(Boolean),
    ),
  ];
}

function fieldCoverage(
  assessments: ShoeQualityAssessment[],
  populationSize: number,
): FieldCoverageRow[] {
  return ALL_FIELDS.map((field) => {
    let present = 0;
    let valid = 0;
    let absent = 0;
    let suspect = 0;
    let invalid = 0;
    for (const a of assessments) {
      const f = a.fields.find((x) => x.field === field);
      if (!f || f.status === "absent") {
        absent += 1;
        continue;
      }
      present += 1;
      if (f.status === "valid") valid += 1;
      else if (f.status === "suspect") suspect += 1;
      else if (f.status === "invalid") invalid += 1;
    }
    return {
      field,
      present,
      valid,
      absent,
      suspect,
      invalid,
      coveragePresent: populationSize
        ? present / populationSize
        : 0,
      coverageValid: populationSize ? valid / populationSize : 0,
    };
  });
}

export function buildRunningShoeDatabaseQualityReport(
  records: RunningShoeDatabaseRecord[],
  generatedAt: string = new Date().toISOString(),
): RunningShoeDatabaseQualityReport {
  const assessments = records.map(assessRunningShoeQuality);
  const statusCounts = emptyStatusCounts();
  for (const a of assessments) statusCounts[a.status] += 1;

  const validMetricSamples = Object.fromEntries(
    METRICS.map((m) => [
      m,
      assessments.filter((a) => a.validMetrics.includes(m)).length,
    ]),
  ) as Record<QualityMetricKey, number>;

  const suspectRecords = assessments
    .filter((a) => a.status === "SUSPECT")
    .map((a) => ({
      slug: a.slug,
      brandSlug: a.brandSlug,
      codes: codesFor(a),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const invalidRecords = assessments
    .filter((a) => a.status === "INVALID")
    .map((a) => ({
      slug: a.slug,
      brandSlug: a.brandSlug,
      codes: codesFor(a),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return {
    generatedAt,
    populationSize: records.length,
    statusCounts,
    fieldCoverage: fieldCoverage(assessments, records.length),
    validMetricSamples,
    suspectRecords,
    invalidRecords,
    statisticsAffected: [...STATISTICS_AFFECTED_BY_QUALITY],
    assessments,
  };
}

export function formatRunningShoeDatabaseQualityMarkdown(
  report: RunningShoeDatabaseQualityReport,
): string {
  const pct = (n: number, d: number) =>
    d ? `${((n / d) * 100).toFixed(1)}%` : "0%";

  const lines: string[] = [
    "# Running Shoe Database — Quality & Freshness Guard",
    "",
    `Generated: ${report.generatedAt.slice(0, 10)}`,
    "",
    "## Scope",
    "",
    "Quality / freshness classification for the **public Running Shoe Database** cohort (`/running/shoes/database`).",
    "",
    "- Eligible shoes only (same gate as the public page).",
    "- Optional fields are **not** required merely to inflate completeness.",
    "- Suspicious or impossible values are **flagged**, never silently corrected.",
    "- **INVALID** and **SUSPECT** metric values are excluded from market statistics and Data Explorer charts.",
    "- **PARTIAL** records may contribute only metrics whose field status is `valid`.",
    "",
    "## Population",
    "",
    `| Cohort | Count |`,
    `|--------|------:|`,
    `| Eligible shoes assessed | **${report.populationSize}** |`,
    "",
    "## Classification",
    "",
    `| Status | Count | Share |`,
    `|--------|------:|------:|`,
    `| VALID | ${report.statusCounts.VALID} | ${pct(report.statusCounts.VALID, report.populationSize)} |`,
    `| PARTIAL | ${report.statusCounts.PARTIAL} | ${pct(report.statusCounts.PARTIAL, report.populationSize)} |`,
    `| SUSPECT | ${report.statusCounts.SUSPECT} | ${pct(report.statusCounts.SUSPECT, report.populationSize)} |`,
    `| INVALID | ${report.statusCounts.INVALID} | ${pct(report.statusCounts.INVALID, report.populationSize)} |`,
    "",
    "### Status rules (summary)",
    "",
    "- **INVALID** — any field with an impossible / inconsistent value (e.g. negative drop, unit-confused weight, heel−forefoot vs drop mismatch).",
    "- **SUSPECT** — no invalid fields, but at least one outlier or soft inconsistency requiring human review.",
    "- **PARTIAL** — identity OK, no suspect/invalid flags, but missing one or more geometry fields required for a complete VALID row (weight, drop, heel/forefoot stack, plate) or identity image/brand/model gap.",
    "- **VALID** — identity + geometry present and sane; optional fields (primary use, gender, price, release, surface) may be absent.",
    "",
    "## Coverage by field",
    "",
    "| Field | Present | Valid | Absent | Suspect | Invalid | Present % | Valid % |",
    "|-------|--------:|------:|-------:|--------:|--------:|----------:|--------:|",
  ];

  for (const row of report.fieldCoverage) {
    lines.push(
      `| ${row.field} | ${row.present} | ${row.valid} | ${row.absent} | ${row.suspect} | ${row.invalid} | ${pct(row.present, report.populationSize)} | ${pct(row.valid, report.populationSize)} |`,
    );
  }

  lines.push(
    "",
    "## Valid metric samples (statistics-safe)",
    "",
    "Counts of eligible shoes whose field value may enter market insights / charts.",
    "",
    "| Metric | Valid samples |",
    "|--------|--------------:|",
  );
  for (const m of METRICS) {
    lines.push(`| ${m} | ${report.validMetricSamples[m]} |`);
  }

  lines.push(
    "",
    "## Suspect records",
    "",
  );
  if (report.suspectRecords.length === 0) {
    lines.push("_None._", "");
  } else {
    lines.push("| Slug | Brand | Codes |", "|------|-------|-------|");
    for (const r of report.suspectRecords) {
      lines.push(
        `| \`${r.slug}\` | ${r.brandSlug} | ${r.codes.join(", ")} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Invalid records", "");
  if (report.invalidRecords.length === 0) {
    lines.push("_None._", "");
  } else {
    lines.push("| Slug | Brand | Codes |", "|------|-------|-------|");
    for (const r of report.invalidRecords) {
      lines.push(
        `| \`${r.slug}\` | ${r.brandSlug} | ${r.codes.join(", ")} |`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Statistics affected",
    "",
    "These public calculations omit SUSPECT/INVALID field values:",
    "",
  );
  for (const s of report.statisticsAffected) {
    lines.push(`- ${s}`);
  }

  lines.push(
    "",
    "## Sanity rules (defensible bounds)",
    "",
    "| Check | Invalid | Suspect |",
    "|-------|---------|---------|",
    "| Weight (g) | ≤0, <100, >550, or likely oz-as-g (<50) | 100–129 or 451–550 edge |",
    "| Drop (mm) | <0 or >16 | >14 |",
    "| Heel stack (mm) | ≤0 or outside 12–55 | outside 18–48 |",
    "| Forefoot stack (mm) | ≤0 or outside 8–50 | outside 12–42 |",
    "| Geometry | forefoot > heel with drop ≥0, or \\|heel−forefoot−drop\\| > 2.5 | soft mismatch Δ > 1.25 |",
    "| Offer price | ≤0 or >800 | <35, >350, unusual currency, possible cents |",
    "| Release year | non-int or outside 1995–(current+1) | <2018 |",
    "",
    "## Machine-readable output",
    "",
    "CI artifact: `docs/data-products/data/running-shoe-database-quality.json`",
    "",
    "Run: `npm run shoe-database:qa`",
    "",
  );

  return lines.join("\n");
}

/** Compact JSON suitable for CI (omit full per-field dumps unless needed). */
export function toRunningShoeDatabaseQualityCiPayload(
  report: RunningShoeDatabaseQualityReport,
): Record<string, unknown> {
  return {
    generatedAt: report.generatedAt,
    populationSize: report.populationSize,
    statusCounts: report.statusCounts,
    fieldCoverage: report.fieldCoverage,
    validMetricSamples: report.validMetricSamples,
    suspectRecords: report.suspectRecords,
    invalidRecords: report.invalidRecords,
    statisticsAffected: report.statisticsAffected,
    gate: {
      failOnInvalid: true,
      invalidCount: report.statusCounts.INVALID,
      suspectCount: report.statusCounts.SUSPECT,
      passed: report.statusCounts.INVALID === 0,
    },
  };
}
