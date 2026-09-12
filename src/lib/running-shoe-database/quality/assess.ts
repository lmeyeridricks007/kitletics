/**
 * Assess one Running Shoe Database record.
 * Flags only — never mutates or “fixes” values.
 */

import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  sanityDropMm,
  sanityForefootStackMm,
  sanityHeelStackMm,
  sanityOfferPrice,
  sanityReleaseYear,
  sanityStackDropConsistency,
  sanityWeightG,
  type SanityResult,
} from "@/lib/running-shoe-database/quality/sanity";
import type {
  FieldQualityFinding,
  QualityFieldKey,
  QualityMetricKey,
  RecordQualityStatus,
  ShoeQualityAssessment,
} from "@/lib/running-shoe-database/quality/types";

const GEOMETRY_FOR_VALID: QualityFieldKey[] = [
  "weight",
  "drop",
  "heelStack",
  "forefootStack",
  "plate",
];

const IDENTITY_FOR_VALID: QualityFieldKey[] = [
  "brand",
  "model",
  "primaryImage",
];

function presentFinding(
  field: QualityFieldKey,
  observed?: string | number | boolean | null,
): FieldQualityFinding {
  return { field, status: "valid", code: `${field}_present`, observed: observed ?? null };
}

function absentFinding(field: QualityFieldKey): FieldQualityFinding {
  return { field, status: "absent", code: `${field}_absent` };
}

function fromSanity(
  field: QualityFieldKey,
  result: SanityResult,
  observed: number | string | boolean,
): FieldQualityFinding {
  return {
    field,
    status: result.verdict,
    code: result.code,
    detail: result.detail,
    observed,
  };
}

function worstStatus(fields: FieldQualityFinding[]): RecordQualityStatus {
  if (fields.some((f) => f.status === "invalid")) return "INVALID";
  if (fields.some((f) => f.status === "suspect")) return "SUSPECT";

  const byKey = new Map(fields.map((f) => [f.field, f]));
  for (const key of [...IDENTITY_FOR_VALID, ...GEOMETRY_FOR_VALID]) {
    const f = byKey.get(key);
    if (!f || f.status === "absent") return "PARTIAL";
  }
  return "VALID";
}

function metricKeysFromFields(fields: FieldQualityFinding[]): {
  validMetrics: QualityMetricKey[];
  suspectMetrics: QualityMetricKey[];
  invalidMetrics: QualityMetricKey[];
} {
  const metrics: QualityMetricKey[] = [
    "weight",
    "drop",
    "heelStack",
    "forefootStack",
    "price",
    "plate",
  ];
  const byKey = new Map(fields.map((f) => [f.field, f]));
  const validMetrics: QualityMetricKey[] = [];
  const suspectMetrics: QualityMetricKey[] = [];
  const invalidMetrics: QualityMetricKey[] = [];
  for (const m of metrics) {
    const f = byKey.get(m);
    if (!f) continue;
    if (f.status === "valid") validMetrics.push(m);
    else if (f.status === "suspect") suspectMetrics.push(m);
    else if (f.status === "invalid") invalidMetrics.push(m);
  }
  return { validMetrics, suspectMetrics, invalidMetrics };
}

/**
 * When geometry consistency fails, elevate drop + stack fields that were otherwise valid.
 */
function applyConsistencyElevation(
  fields: FieldQualityFinding[],
  consistency: SanityResult,
): void {
  if (consistency.verdict === "valid") return;
  for (const key of ["drop", "heelStack", "forefootStack"] as const) {
    const f = fields.find((x) => x.field === key);
    if (!f || f.status === "absent") continue;
    if (f.status === "invalid" && consistency.verdict === "suspect") continue;
    if (
      consistency.verdict === "invalid" ||
      (consistency.verdict === "suspect" && f.status === "valid")
    ) {
      f.status = consistency.verdict;
      f.code = consistency.code;
      f.detail = consistency.detail;
    }
  }
}

export function assessRunningShoeQuality(
  record: RunningShoeDatabaseRecord,
): ShoeQualityAssessment {
  const fields: FieldQualityFinding[] = [];

  // Identity
  if (record.brandSlug?.trim() && record.brandName?.trim()) {
    fields.push(presentFinding("brand", record.brandSlug));
  } else {
    fields.push({
      field: "brand",
      status: "invalid",
      code: "brand_missing",
      detail: "Brand slug/name missing on eligible record",
    });
  }

  if (record.name?.trim()) {
    fields.push(presentFinding("model", record.name));
  } else {
    fields.push({
      field: "model",
      status: "invalid",
      code: "model_missing",
      detail: "Model name missing",
    });
  }

  if (record.image?.src?.trim()) {
    fields.push(presentFinding("primaryImage", record.image.src));
  } else {
    fields.push({
      field: "primaryImage",
      status: "invalid",
      code: "primary_image_missing",
      detail: "Primary image missing (should be eligibility-gated)",
    });
  }

  // Primary use — optional
  if (record.primaryUseSlug || record.primaryUseLabel) {
    fields.push(
      presentFinding(
        "primaryUse",
        record.primaryUseSlug ?? record.primaryUseLabel,
      ),
    );
  } else {
    fields.push(absentFinding("primaryUse"));
  }

  // Gender / variant — optional
  const gender =
    record.genderFit.length > 0 ? record.genderFit : record.audiences;
  if (gender.length > 0) {
    fields.push(presentFinding("gender", gender.join(",")));
  } else {
    fields.push(absentFinding("gender"));
  }

  // Weight
  if (record.weightG == null) {
    fields.push(absentFinding("weight"));
  } else {
    fields.push(fromSanity("weight", sanityWeightG(record.weightG), record.weightG));
  }

  // Drop
  if (record.dropMm == null) {
    fields.push(absentFinding("drop"));
  } else {
    fields.push(fromSanity("drop", sanityDropMm(record.dropMm), record.dropMm));
  }

  // Heel
  if (record.heelStackMm == null) {
    fields.push(absentFinding("heelStack"));
  } else {
    fields.push(
      fromSanity(
        "heelStack",
        sanityHeelStackMm(record.heelStackMm),
        record.heelStackMm,
      ),
    );
  }

  // Forefoot
  if (record.forefootStackMm == null) {
    fields.push(absentFinding("forefootStack"));
  } else {
    fields.push(
      fromSanity(
        "forefootStack",
        sanityForefootStackMm(record.forefootStackMm),
        record.forefootStackMm,
      ),
    );
  }

  if (
    record.heelStackMm != null &&
    record.forefootStackMm != null &&
    record.dropMm != null
  ) {
    const consistency = sanityStackDropConsistency(
      record.heelStackMm,
      record.forefootStackMm,
      record.dropMm,
    );
    if (consistency) applyConsistencyElevation(fields, consistency);
  }

  // Price — optional (offer, not MSRP)
  if (!record.price) {
    fields.push(absentFinding("price"));
  } else {
    fields.push(
      fromSanity(
        "price",
        sanityOfferPrice(record.price.amount, record.price.currency),
        record.price.amount,
      ),
    );
  }

  // Release — optional
  if (record.releaseYear == null) {
    fields.push(absentFinding("releaseYear"));
  } else {
    fields.push(
      fromSanity(
        "releaseYear",
        sanityReleaseYear(record.releaseYear),
        record.releaseYear,
      ),
    );
  }

  // Surface — optional
  if (record.surface.length > 0) {
    fields.push(presentFinding("surface", record.surface.join(",")));
  } else {
    fields.push(absentFinding("surface"));
  }

  // Plate — boolean when known
  if (typeof record.plate !== "boolean") {
    fields.push(absentFinding("plate"));
  } else {
    fields.push(presentFinding("plate", record.plate));
  }

  const status = worstStatus(fields);
  const { validMetrics, suspectMetrics, invalidMetrics } =
    metricKeysFromFields(fields);

  return {
    productId: record.id,
    slug: record.slug,
    brandSlug: record.brandSlug,
    status,
    fields,
    validMetrics,
    suspectMetrics,
    invalidMetrics,
  };
}

/** True when this metric’s value may enter market statistics / charts. */
export function isMetricSafeForStatistics(
  assessment: ShoeQualityAssessment,
  metric: QualityMetricKey,
): boolean {
  return assessment.validMetrics.includes(metric);
}
