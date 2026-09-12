import { getAllProductRelationships } from "@/repositories/relationships";
import {
  getEligibleRunningShoes,
  getRunningShoeDatabaseRecords,
} from "@/lib/running-shoe-database/build-records";
import { buildHistoricalObservationsFromCatalog } from "@/lib/running-shoe-database/historical/build-observations";
import { assessHistoricalPublicInsightsReadiness } from "@/lib/running-shoe-database/historical/trend-eligibility";
import type { HistoricalPublicInsightsReadiness } from "@/lib/running-shoe-database/historical/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";

export interface HistoricalCoverageAudit {
  generatedAt: string;
  populationSize: number;
  fields: Array<{
    field: string;
    source: string;
    present: number;
    coverage: number;
    publicTrendReady: boolean;
    notes: string;
  }>;
  releaseYearDistribution: Record<string, number>;
  families: {
    unique: number;
    multiMember: number;
    multiMemberWithMultipleYears: number;
  };
  generationRelationshipsAmongShoes: number;
  readiness: HistoricalPublicInsightsReadiness;
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return n / total;
}

/**
 * Live coverage audit for historical dimensions on the eligible shoe cohort.
 */
export function auditRunningShoeHistoricalCoverage(
  options?: PublishResolverOptions,
): HistoricalCoverageAudit {
  const records = getRunningShoeDatabaseRecords(undefined, options);
  const products = getEligibleRunningShoes(options);
  const productIds = new Set(products.map((p) => p.id));
  const observations = buildHistoricalObservationsFromCatalog(records);

  const withYear = observations.filter((o) => o.releaseYear != null);
  const yearDist = withYear.reduce(
    (acc, o) => {
      const k = String(o.releaseYear);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const famMembers = new Map<string, typeof observations>();
  for (const o of observations) {
    if (!o.familyId) continue;
    const list = famMembers.get(o.familyId) ?? [];
    list.push(o);
    famMembers.set(o.familyId, list);
  }
  const multiMember = [...famMembers.values()].filter((m) => m.length > 1);
  const multiYear = multiMember.filter((m) => {
    const years = new Set(
      m.map((x) => x.releaseYear).filter((y): y is number => y != null),
    );
    return years.size > 1;
  });

  const rels = getAllProductRelationships().filter(
    (r) => r.type === "previous-generation" || r.type === "next-generation",
  );
  const genRelCount = rels.filter(
    (r) =>
      productIds.has(r.sourceProductId) || productIds.has(r.targetProductId),
  ).length;

  const n = observations.length;
  const fields: HistoricalCoverageAudit["fields"] = [
    {
      field: "release year",
      source: "Product.releaseDate → year",
      present: withYear.length,
      coverage: pct(withYear.length, n),
      publicTrendReady: false,
      notes: "Do not invent from generation label or product name",
    },
    {
      field: "generation",
      source: "Product.generation",
      present: observations.filter((o) => o.generationLabel).length,
      coverage: pct(observations.filter((o) => o.generationLabel).length, n),
      publicTrendReady: false,
      notes: "Label only — not comparable across brands as a time axis",
    },
    {
      field: "product family",
      source: "Product.familyId",
      present: observations.filter((o) => o.familyId).length,
      coverage: pct(observations.filter((o) => o.familyId).length, n),
      publicTrendReady: false,
      notes: `${multiMember.length} multi-member families; ${multiYear.length} with multiple verified years`,
    },
    {
      field: "launch price",
      source: "(none)",
      present: 0,
      coverage: 0,
      publicTrendReady: false,
      notes: "No canonical launchPrice — never use offer price",
    },
    {
      field: "weight",
      source: "specifications.weight",
      present: observations.filter((o) => o.weightG != null).length,
      coverage: pct(observations.filter((o) => o.weightG != null).length, n),
      publicTrendReady: false,
      notes: "Current-model observation; year-trend blocked by release-year gap",
    },
    {
      field: "heel stack",
      source: "specifications.heelStack",
      present: observations.filter((o) => o.heelStackMm != null).length,
      coverage: pct(observations.filter((o) => o.heelStackMm != null).length, n),
      publicTrendReady: false,
      notes: "Current-model observation; year-trend blocked by release-year gap",
    },
    {
      field: "forefoot stack",
      source: "specifications.forefootStack",
      present: observations.filter((o) => o.forefootStackMm != null).length,
      coverage: pct(
        observations.filter((o) => o.forefootStackMm != null).length,
        n,
      ),
      publicTrendReady: false,
      notes: "Current-model observation; year-trend blocked by release-year gap",
    },
    {
      field: "drop",
      source: "specifications.drop",
      present: observations.filter((o) => o.dropMm != null).length,
      coverage: pct(observations.filter((o) => o.dropMm != null).length, n),
      publicTrendReady: false,
      notes: "Current-model observation; year-trend blocked by release-year gap",
    },
    {
      field: "plate status",
      source: "specifications.plate",
      present: observations.filter((o) => typeof o.plate === "boolean").length,
      coverage: pct(
        observations.filter((o) => typeof o.plate === "boolean").length,
        n,
      ),
      publicTrendReady: false,
      notes: "Current-model observation; year-trend blocked by release-year gap",
    },
    {
      field: "primary use",
      source: "Product.useCaseIds",
      present: observations.filter((o) => o.primaryUseSlug).length,
      coverage: pct(observations.filter((o) => o.primaryUseSlug).length, n),
      publicTrendReady: false,
      notes: "Taxonomy on current SKUs",
    },
  ];

  const readiness = assessHistoricalPublicInsightsReadiness(observations, {
    populationSize: n,
    familyMultiYearCount: multiYear.length,
    generationRelationshipCount: genRelCount,
  });

  return {
    generatedAt: new Date().toISOString(),
    populationSize: n,
    fields,
    releaseYearDistribution: yearDist,
    families: {
      unique: famMembers.size,
      multiMember: multiMember.length,
      multiMemberWithMultipleYears: multiYear.length,
    },
    generationRelationshipsAmongShoes: genRelCount,
    readiness,
  };
}
