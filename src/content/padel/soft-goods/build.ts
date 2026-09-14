import type { Product } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import { publishedMeta, SEED_DATES } from "@/content/config";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";

export interface SoftDraft {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  fullName: string;
  categoryId:
    | "cat-padel-balls"
    | "cat-padel-bags"
    | "cat-padel-grips"
    | "cat-padel-accessories"
    | "cat-padel-shoes";
  /** Patch an existing seed/wave product instead of inserting a duplicate. */
  existing?: boolean;
  lifecycle?: Product["lifecycleStatus"];
  experienceLevels?: Product["experienceLevels"];
  sourceUrl: string;
  sourceName: string;
  shortDescription: string;
  verdict?: string;
  specifications: Product["specifications"];
  strengths: string[];
  weaknesses: string[];
  relatedProductIds?: string[];
  alternativeProductIds?: string[];
}

const PLACEHOLDERS: Record<SoftDraft["categoryId"], string> = {
  "cat-padel-balls": "/images/padel/products/balls.svg",
  "cat-padel-bags": "/images/padel/products/bag.svg",
  "cat-padel-grips": "/images/padel/products/grips.svg",
  "cat-padel-accessories": "/images/catalog/fallbacks/accessory.svg",
  "cat-padel-shoes": "/images/catalog/fallbacks/shoe.svg",
};

function placeholderImages(draft: SoftDraft) {
  return [
    {
      id: `img-${draft.id}`,
      src: PLACEHOLDERS[draft.categoryId],
      alt: `${draft.fullName} — catalog placeholder — authentic product photograph pending`,
      type: "image" as const,
      source: "Kitletics padel placeholder",
      usageType: "hero" as const,
      licence: "kitletics-owned" as const,
    },
  ];
}

export function softImages(draft: SoftDraft) {
  const registered = getCatalogProductHeroMedia(draft.id, draft.fullName);
  if (registered?.[0]) return registered;
  return placeholderImages(draft);
}

export function toSoftProductPatch(draft: SoftDraft): Partial<Product> {
  return {
    slug: draft.slug,
    name: draft.name,
    fullName: draft.fullName,
    lifecycleStatus: draft.lifecycle ?? "current",
    shortDescription: draft.shortDescription,
    verdict: draft.verdict,
    sportIds: ["sport-padel"],
    specifications: draft.specifications,
    strengths: draft.strengths,
    weaknesses: draft.weaknesses,
    relatedProductIds: draft.relatedProductIds ?? [],
    alternativeProductIds: draft.alternativeProductIds ?? [],
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
    images: softImages(draft),
  };
}

export function toSoftProduct(draft: SoftDraft): Product {
  return {
    id: draft.id,
    slug: draft.slug,
    brandId: draft.brandId,
    name: draft.name,
    fullName: draft.fullName,
    shortDescription: draft.shortDescription,
    verdict: draft.verdict,
    lifecycleStatus: draft.lifecycle ?? "current",
    sportIds: ["sport-padel"],
    disciplineIds: [],
    categoryId: draft.categoryId,
    subcategoryIds: [],
    useCaseIds: [],
    specifications: draft.specifications,
    strengths: draft.strengths,
    weaknesses: draft.weaknesses,
    experienceLevels: draft.experienceLevels ?? [
      "beginner",
      "intermediate",
      "advanced",
    ],
    images: softImages(draft),
    videos: [],
    offerIds: [],
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
    relatedProductIds: draft.relatedProductIds ?? [],
    alternativeProductIds: draft.alternativeProductIds ?? [],
    ...publishedMeta(),
  };
}

export function toSoftEvidence(draft: SoftDraft): Evidence[] {
  return [
    {
      id: `ev-${draft.id}-mfr`,
      type: "manufacturer",
      source: draft.sourceName,
      sourceUrl: draft.sourceUrl,
      summary: `Manufacturer or official-store specifications for ${draft.fullName}. Not a Kitletics lab measurement.`,
      verifiedAt: SEED_DATES.verified,
      confidence: "high",
    },
    {
      id: `ev-${draft.id}-editorial`,
      type: "editorial-research",
      source: "Kitletics padel secondary catalog research",
      sourceUrl: draft.sourceUrl,
      summary: `Editorial synthesis of manufacturer copy for ${draft.fullName}. Not first-hand testing.`,
      verifiedAt: SEED_DATES.verified,
      confidence: "medium",
    },
  ];
}
