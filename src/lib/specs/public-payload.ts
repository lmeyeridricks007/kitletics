/**
 * Public serialization boundary.
 *
 * Canonical internal model
 *         ↓
 * Public view model
 *         ↓
 * Client / RSC payload
 *
 * Only shopper-required fields cross this boundary. Canonical catalog keys
 * stay on the server for ranking, filters, and editorial generation.
 */

import type { Product } from "@/domain/products/types";
import type { CatalogFilterState, CatalogProductRow } from "@/lib/catalog/types";
import type {
  GuideLookForFactor,
  SelectionCriterion,
} from "@/domain/editorial/types";
import {
  KITLETICS_INTERNAL_SCHEMA_KEYS,
  isInternalSchemaKey,
  publicSpecRowKey,
  toPublicCriterionLabel,
  toPublicSpecifications,
} from "@/lib/specs/public-label";

const TECHNICAL_ID_KEYS = new Set([
  "id",
  "productId",
  "slug",
  "href",
  "src",
  "url",
  "value",
  "group",
  "factor",
  "metric",
  "enumValues",
]);

/** Accessory / filter enum tokens may remain as values, never as public keys. */
function isAllowedPublicEnumValue(value: string): boolean {
  return isInternalSchemaKey(value) && value.includes("_");
}

export interface PublicSpecField {
  label: string;
  value: string;
}

export function toPublicProduct<T extends Product>(product: T): T {
  return {
    ...product,
    specifications: toPublicSpecifications(
      product.specifications as Record<string, unknown>,
    ) as T["specifications"],
  };
}

export function toPublicCatalogFilterState(
  state: CatalogFilterState,
): CatalogFilterState {
  const specs: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(state.specs)) {
    specs[publicSpecRowKey(key)] = values;
  }
  return { ...state, specs };
}

export function toPublicCatalogProductRow(
  row: CatalogProductRow,
): CatalogProductRow {
  const clone = { ...row } as CatalogProductRow & {
    cushionLevel?: string;
    cushionRank?: number;
  };
  delete clone.cushionLevel;
  delete clone.cushionRank;
  if (clone.filterTokens?.specs) {
    const specs: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(clone.filterTokens.specs)) {
      specs[isInternalSchemaKey(key) ? publicSpecRowKey(key) : key] = values.map(
        (value) =>
          isInternalSchemaKey(value) ? publicSpecRowKey(value) : value,
      );
    }
    clone.filterTokens = { ...clone.filterTokens, specs };
  }
  return clone;
}

export function toPublicSelectionCriterion(
  criterion: SelectionCriterion,
): SelectionCriterion {
  return {
    ...criterion,
    key: publicSpecRowKey(criterion.key),
    label: toPublicCriterionLabel(criterion.label, criterion.key),
    description: criterion.description,
  };
}

export function toPublicLookForFactor(
  factor: GuideLookForFactor,
): GuideLookForFactor {
  return {
    ...factor,
    key: publicSpecRowKey(factor.key),
    label: toPublicCriterionLabel(factor.label, factor.key),
  };
}

export function toPublicEditorialGuide<T>(guide: T): T {
  const g = guide as T & {
    selectionCriteria?: SelectionCriterion[];
    whatWeLookFor?: GuideLookForFactor[];
  };
  return {
    ...g,
    selectionCriteria: g.selectionCriteria?.map(toPublicSelectionCriterion),
    whatWeLookFor: g.whatWeLookFor?.map(toPublicLookForFactor),
  };
}

export function toPublicComparisonCriteria<
  T extends {
    criteria?: Array<{ specKey?: string; key?: string; label?: string }>;
  },
>(comparison: T): T {
  return {
    ...comparison,
    criteria: comparison.criteria?.map((criterion) => ({
      ...criterion,
      key: criterion.key ? publicSpecRowKey(criterion.key) : criterion.key,
      specKey: criterion.specKey
        ? publicSpecRowKey(criterion.specKey)
        : criterion.specKey,
      label: criterion.label
        ? toPublicCriterionLabel(
            criterion.label,
            criterion.specKey ?? criterion.key,
          )
        : criterion.label,
    })),
  };
}

export function toPublicSpecDiffKey(key: string): string {
  return publicSpecRowKey(key);
}

/** Object-key leaks of Kitletics catalog/editorial schema in a public payload. */
export function findSerializedInternalSchemaKeys(
  payload: unknown,
  path = "",
): string[] {
  const hits: string[] = [];
  walk(payload, path, hits, false);
  return [...new Set(hits)];
}

function walk(
  value: unknown,
  path: string,
  hits: string[],
  parentIsTechnicalId: boolean,
): void {
  if (value == null) return;
  if (typeof value === "string") {
    if (
      !parentIsTechnicalId &&
      isInternalSchemaKey(value) &&
      !isAllowedPublicEnumValue(value)
    ) {
      hits.push(`${path}=${value}`);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, i) =>
      walk(item, `${path}[${i}]`, hits, parentIsTechnicalId),
    );
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const next = path ? `${path}.${key}` : key;
    if (isInternalSchemaKey(key)) {
      hits.push(next);
    }
    const technical = TECHNICAL_ID_KEYS.has(key);
    if (
      (key === "specKey" ||
        key === "key" ||
        key === "factor" ||
        key === "metric") &&
      typeof child === "string" &&
      isInternalSchemaKey(child)
    ) {
      hits.push(`${next}=${child}`);
    }
    walk(child, next, hits, technical);
  }
}

/** Visible shopper copy that still contains raw schema identifiers. */
export function findVisibleInternalLanguage(
  payload: unknown,
  key?: string,
): string[] {
  if (
    key === "specifications" ||
    key === "id" ||
    key === "productId" ||
    key === "specKey" ||
    key === "key" ||
    key === "value" ||
    key === "enumValues" ||
    key === "href" ||
    key === "src"
  ) {
    return [];
  }
  if (typeof payload === "string") {
    const hits: string[] = [];
    for (const schemaKey of KITLETICS_INTERNAL_SCHEMA_KEYS) {
      if (new RegExp(`\\b${schemaKey}\\b`, "i").test(payload)) {
        hits.push(schemaKey);
      }
    }
    return hits;
  }
  if (payload == null || typeof payload !== "object") return [];
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => findVisibleInternalLanguage(item));
  }
  return Object.entries(payload as Record<string, unknown>).flatMap(([k, v]) =>
    findVisibleInternalLanguage(v, k),
  );
}
