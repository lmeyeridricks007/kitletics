import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import type {
  HistoricalFieldEvidence,
  HistoricalShoeObservation,
} from "@/lib/running-shoe-database/historical/types";

function evidence(
  kind: HistoricalFieldEvidence["kind"],
  productId: string,
  sourceField: string,
  observedAt: string,
  notes?: string,
): HistoricalFieldEvidence {
  return { kind, sourceEntityId: productId, sourceField, observedAt, notes };
}

/**
 * Materialise historical observations from current catalog records.
 *
 * Each observation uses ONLY that product’s own fields.
 * Specs are never copied from another generation or peer.
 * Missing releaseYear / launchPrice stay undefined — never inferred.
 */
export function buildHistoricalObservationsFromCatalog(
  records: RunningShoeDatabaseRecord[],
  options?: { observedAt?: string },
): HistoricalShoeObservation[] {
  const observedAt = options?.observedAt ?? new Date().toISOString();

  return records.map((r) => {
    const ev: HistoricalShoeObservation["evidence"] = {};

    if (r.releaseYear != null) {
      ev.releaseYear = evidence(
        "catalog-product-field",
        r.id,
        "Product.releaseDate",
        observedAt,
        "UTC year derived from verified releaseDate only",
      );
      ev.releaseDate = evidence(
        "catalog-product-field",
        r.id,
        "Product.releaseDate",
        observedAt,
      );
    }

    if (r.familyId) {
      ev.familyId = evidence(
        "catalog-product-field",
        r.id,
        "Product.familyId",
        observedAt,
      );
    }
    if (r.generation) {
      ev.generationLabel = evidence(
        "catalog-product-field",
        r.id,
        "Product.generation",
        observedAt,
        "Label only — not a calendar year",
      );
    }
    if (r.weightG != null) {
      ev.weightG = evidence(
        "catalog-specification",
        r.id,
        "specifications.weight",
        observedAt,
      );
    }
    if (r.heelStackMm != null) {
      ev.heelStackMm = evidence(
        "catalog-specification",
        r.id,
        "specifications.heelStack",
        observedAt,
      );
    }
    if (r.forefootStackMm != null) {
      ev.forefootStackMm = evidence(
        "catalog-specification",
        r.id,
        "specifications.forefootStack",
        observedAt,
      );
    }
    if (r.dropMm != null) {
      ev.dropMm = evidence(
        "catalog-specification",
        r.id,
        "specifications.drop",
        observedAt,
      );
    }
    if (typeof r.plate === "boolean") {
      ev.plate = evidence(
        "catalog-specification",
        r.id,
        "specifications.plate",
        observedAt,
      );
    }
    if (r.plateMaterial) {
      ev.plateMaterial = evidence(
        "catalog-specification",
        r.id,
        "specifications.plateMaterial",
        observedAt,
      );
    }
    if (r.primaryUseSlug) {
      ev.primaryUseSlug = evidence(
        "catalog-product-field",
        r.id,
        "Product.useCaseIds",
        observedAt,
      );
    }
    if (r.surface.length > 0) {
      ev.surface = evidence(
        "catalog-specification",
        r.id,
        "specifications.surface",
        observedAt,
      );
    }

    // launchPriceEur intentionally omitted — no canonical field.
    // Do not attach offer price as launch evidence.

    return {
      id: `hist-obs-${r.id}`,
      productId: r.id,
      productSlug: r.slug,
      brandId: r.brandId,
      brandSlug: r.brandSlug,
      brandName: r.brandName,
      familyId: r.familyId,
      familySlug: r.familySlug,
      familyName: r.familyName,
      generationLabel: r.generation,
      lifecycleStatus: "current-catalog-snapshot",
      releaseYear: r.releaseYear,
      releaseDate: undefined,
      launchPriceEur: undefined,
      weightG: r.weightG,
      heelStackMm: r.heelStackMm,
      forefootStackMm: r.forefootStackMm,
      dropMm: r.dropMm,
      plate: r.plate,
      plateMaterial: r.plateMaterial,
      primaryUseSlug: r.primaryUseSlug,
      primaryUseLabel: r.primaryUseLabel,
      surface: [...r.surface],
      evidence: ev,
    };
  });
}
