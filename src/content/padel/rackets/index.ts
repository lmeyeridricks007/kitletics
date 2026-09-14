import type { Product, ProductVariant } from "@/domain/products/types";
import type {
  AlternativeRelationship,
  Evidence,
  Recommendation,
} from "@/domain/recommendations/types";
import { applyMediaPublishGate } from "@/content/running/products/media-publish-gate";
import type {
  PadelDecisionAttribute,
  PadelRacketPdpCopy,
} from "@/domain/padel/racket-decision";
import {
  toAlternatives,
  toDecisionAttributes,
  toEvidence,
  toPdpCopy,
  toProduct,
  toProductPatch,
  toRecommendations,
  toVariants,
  mergeFamilies,
  type RacketDraft,
} from "@/content/padel/rackets/build";
import { noxDrafts } from "@/content/padel/rackets/nox";
import { bullpadelDrafts } from "@/content/padel/rackets/bullpadel";
import { adidasDrafts } from "@/content/padel/rackets/adidas";
import { headBabolatDrafts } from "@/content/padel/rackets/head-babolat";
import { wilsonSiuxStarvieDrafts } from "@/content/padel/rackets/wilson-siux-starvie";
import { valueAndSpecialistDrafts } from "@/content/padel/rackets/value-and-specialists";
import { extraRacketDrafts } from "@/content/padel/rackets/extras";
import { padelRacketFamilies } from "@/content/padel/rackets/families";

export const padelRacketDrafts: RacketDraft[] = [
  ...noxDrafts(),
  ...bullpadelDrafts(),
  ...adidasDrafts(),
  ...headBabolatDrafts(),
  ...wilsonSiuxStarvieDrafts(),
  ...valueAndSpecialistDrafts(),
  ...extraRacketDrafts(),
];

const draftById = new Map(padelRacketDrafts.map((d) => [d.id, d]));

export function getPadelRacketDraft(productId: string): RacketDraft | undefined {
  return draftById.get(productId);
}

export const padelRacketCatalogPatches: Record<string, Partial<Product>> = {};
export const padelRacketCatalogProductsRaw: Product[] = [];

padelRacketDrafts.forEach((draft, i) => {
  if (draft.existing) {
    padelRacketCatalogPatches[draft.id] = toProductPatch(draft, i);
  } else {
    padelRacketCatalogProductsRaw.push(toProduct(draft, i));
  }
});

export const padelRacketMediaPendingIds = new Set(
  padelRacketDrafts.map((d) => d.id),
);

export const padelRacketCatalogProducts: Product[] = applyMediaPublishGate(
  padelRacketCatalogProductsRaw,
  padelRacketMediaPendingIds,
);

export const padelRacketCatalogEvidence: Evidence[] =
  padelRacketDrafts.flatMap(toEvidence);

export const padelRacketCatalogRecommendations: Recommendation[] =
  padelRacketDrafts.flatMap(toRecommendations);

export const padelRacketPdpCopyById: Record<string, PadelRacketPdpCopy> =
  Object.fromEntries(padelRacketDrafts.map((d) => [d.id, toPdpCopy(d)]));

export const padelRacketDecisionAttributesById: Record<
  string,
  PadelDecisionAttribute[]
> = Object.fromEntries(
  padelRacketDrafts.map((d) => [d.id, toDecisionAttributes(d)]),
);

export const padelRacketVariants: ProductVariant[] =
  padelRacketDrafts.flatMap(toVariants);

export const padelRacketCatalogAlternatives: AlternativeRelationship[] =
  toAlternatives(padelRacketDrafts);

export const padelRacketCatalogFamilies = mergeFamilies(
  padelRacketDrafts,
  padelRacketFamilies,
);

export function getPadelRacketPdpCopy(
  productId: string,
): PadelRacketPdpCopy | undefined {
  return padelRacketPdpCopyById[productId];
}

export function getPadelRacketDecisionAttributes(
  productId: string,
): PadelDecisionAttribute[] | undefined {
  return padelRacketDecisionAttributesById[productId];
}
