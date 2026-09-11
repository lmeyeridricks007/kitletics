import type {
  BestGuide,
  Comparison,
  Product,
  Review,
} from "@/domain/index";
import type { Offer } from "@/domain/commerce/types";
import type { Recommendation, AlternativeRelationship } from "@/domain/recommendations/types";
import type {
  ChangeClassification,
  EntityImpact,
} from "@/domain/freshness/types";
import { HIGH_IMPACT_FIELDS } from "@/domain/freshness/types";

export interface DependencyCatalog {
  products: Product[];
  recommendations: Recommendation[];
  guides: BestGuide[];
  comparisons: Comparison[];
  alternatives: AlternativeRelationship[];
  offers: Offer[];
  reviews: Review[];
}

/**
 * Build Product → dependent entities index once per job (avoid N×catalog scans).
 */
export function buildDependencyIndex(catalog: DependencyCatalog) {
  const byProduct = new Map<string, EntityImpact>();

  const ensure = (id: string): EntityImpact => {
    let row = byProduct.get(id);
    if (!row) {
      row = {
        entityId: id,
        recommendations: [],
        guides: [],
        comparisons: [],
        alternatives: [],
        relationships: [],
        offers: [],
        reviews: [],
        finderRelevant: false,
        rotationRelevant: false,
        searchRelevant: true,
        severity: "informational",
      };
      byProduct.set(id, row);
    }
    return row;
  };

  for (const r of catalog.recommendations) {
    const row = ensure(r.productId);
    row.recommendations.push(r.id);
    row.finderRelevant = true;
    if (
      r.useCaseId?.includes("easy") ||
      r.useCaseId?.includes("long") ||
      r.useCaseId?.includes("tempo") ||
      r.useCaseId?.includes("race") ||
      r.useCaseId?.includes("trail")
    ) {
      row.rotationRelevant = true;
    }
  }

  for (const g of catalog.guides) {
    for (const rec of g.recommendations ?? []) {
      const pid = rec.productId;
      if (!pid) continue;
      const row = ensure(pid);
      if (!row.guides.includes(g.id)) row.guides.push(g.id);
    }
  }

  for (const c of catalog.comparisons) {
    for (const pid of c.productIds ?? []) {
      const row = ensure(pid);
      if (!row.comparisons.includes(c.id)) row.comparisons.push(c.id);
    }
  }

  for (const a of catalog.alternatives) {
    const row = ensure(a.sourceProductId);
    if (!row.alternatives.includes(a.id)) row.alternatives.push(a.id);
    row.relationships.push(a.id);
    const target = ensure(a.alternativeProductId);
    if (!target.alternatives.includes(a.id)) target.alternatives.push(a.id);
  }

  for (const o of catalog.offers) {
    const row = ensure(o.productId);
    if (!row.offers.includes(o.id)) row.offers.push(o.id);
  }

  for (const rev of catalog.reviews) {
    if (!rev.productId) continue;
    const row = ensure(rev.productId);
    if (!row.reviews.includes(rev.id)) row.reviews.push(rev.id);
  }

  return {
    getEntityImpact(
      entityId: string,
      field?: string,
    ): EntityImpact {
      const base = byProduct.get(entityId) ?? {
        entityId,
        recommendations: [],
        guides: [],
        comparisons: [],
        alternatives: [],
        relationships: [],
        offers: [],
        reviews: [],
        finderRelevant: false,
        rotationRelevant: false,
        searchRelevant: true,
        severity: "informational" as ChangeClassification,
      };
      return {
        ...base,
        severity: severityForField(field, base),
      };
    },
    size: byProduct.size,
  };
}

function severityForField(
  field: string | undefined,
  impact: EntityImpact,
): ChangeClassification {
  if (!field) {
    if (impact.guides.length > 0) return "editorial-impacting";
    if (impact.recommendations.length > 0) return "recommendation-impacting";
    return "informational";
  }
  if (field === "lifecycleStatus" || field === "generation") {
    return "editorial-impacting";
  }
  if (HIGH_IMPACT_FIELDS.has(field)) {
    return "recommendation-impacting";
  }
  if (field.startsWith("offer.") || field === "price") {
    return "commercial-impacting";
  }
  return "low-impact";
}

export type DependencyIndex = ReturnType<typeof buildDependencyIndex>;
