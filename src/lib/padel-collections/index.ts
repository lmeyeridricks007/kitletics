/**
 * Padel collection / family discovery — only verified family ↔ kit relationships.
 * Not an admin table; editorial commerce shortlists.
 */

import { padelRacketFamilies } from "@/content/padel/rackets/families";
import { getBrandById, getProductById } from "@/repositories";
import type { Brand, Product, ProductFamily } from "@/domain/products/types";

export type PadelCollectionRelated = {
  productId: string;
  role: "bag" | "backpack" | "accessory" | "grip" | "ball" | "shoe";
  note: string;
};

/** Public collection slugs (subset of families with clear shopper recognition). */
export const PADEL_COLLECTION_SLUGS = [
  "nox-at10-genius",
  "nox-ml10",
  "bullpadel-vertex",
  "bullpadel-hack",
  "head-coello",
  "wilson-bela",
  "adidas-metalbone",
] as const;

export type PadelCollectionSlug = (typeof PADEL_COLLECTION_SLUGS)[number];

/**
 * Soft-goods links only when the relationship is verified in catalog
 * (same brand line / named companion kit — not invented cross-sell).
 */
const RELATED_BY_FAMILY: Partial<
  Record<PadelCollectionSlug, PadelCollectionRelated[]>
> = {
  "nox-at10-genius": [
    {
      productId: "prod-nox-at10-team-bag",
      role: "bag",
      note: "AT10 Team club paletero — same AT10 kit line.",
    },
    {
      productId: "prod-nox-at10-xxl-bag",
      role: "bag",
      note: "AT10 XXL tournament volume when verified in catalog.",
    },
    {
      productId: "prod-nox-frame-protector",
      role: "accessory",
      note: "Nox transparent frame protector.",
    },
  ],
  "bullpadel-vertex": [
    {
      productId: "prod-bullpadel-vertex-backpack",
      role: "backpack",
      note: "Vertex backpack — same Vertex kit naming.",
    },
    {
      productId: "prod-bullpadel-frame-protector",
      role: "accessory",
      note: "Bullpadel frame protector 3-pack.",
    },
  ],
  "bullpadel-hack": [
    {
      productId: "prod-bullpadel-bpm26002-hack",
      role: "backpack",
      note: "Hack backpack when present in bag catalog.",
    },
    {
      productId: "prod-bullpadel-frame-protector",
      role: "accessory",
      note: "Bullpadel frame protector 3-pack.",
    },
  ],
  "wilson-bela": [
    {
      productId: "prod-wilson-bela-backpack",
      role: "backpack",
      note: "Bela backpack companion when stocked.",
    },
    {
      productId: "prod-wilson-super-tour-padel",
      role: "bag",
      note: "Wilson Super Tour Bela tournament paletero.",
    },
  ],
  "adidas-metalbone": [
    {
      productId: "prod-adidas-protour-padel",
      role: "bag",
      note: "Adidas ProTour padel bag when verified.",
    },
  ],
  "head-coello": [
    {
      productId: "prod-head-x3-pressurizer",
      role: "accessory",
      note: "HEAD X3 pressurizer — brand accessory, not Coello-exclusive.",
    },
  ],
};

export type PadelCollectionCard = {
  slug: PadelCollectionSlug;
  name: string;
  description: string;
  brandName: string;
  brandSlug: string;
  racketCount: number;
  href: string;
};

export type PadelCollectionPageData = {
  family: ProductFamily;
  brand?: Brand;
  rackets: Product[];
  related: Array<PadelCollectionRelated & { product: Product }>;
  path: string;
  title: string;
  summary: string;
};

function familyBySlug(slug: string): ProductFamily | undefined {
  return padelRacketFamilies.find((f) => f.slug === slug);
}

export function listPadelCollections(): PadelCollectionCard[] {
  const cards: PadelCollectionCard[] = [];
  for (const slug of PADEL_COLLECTION_SLUGS) {
    const family = familyBySlug(slug);
    if (!family) continue;
    const brand = getBrandById(family.brandId);
    const rackets = family.productIds
      .map((id) => getProductById(id))
      .filter((p): p is Product => Boolean(p && p.status === "published"));
    if (rackets.length === 0) continue;
    cards.push({
      slug,
      name: family.name,
      description: family.description ?? `${family.name} padel collection.`,
      brandName: brand?.name ?? "Padel",
      brandSlug: brand?.slug ?? "",
      racketCount: rackets.length,
      href: `/padel/collections/${slug}`,
    });
  }
  return cards;
}

export function getPadelCollectionPageData(
  slug: string,
): PadelCollectionPageData | null {
  if (!PADEL_COLLECTION_SLUGS.includes(slug as PadelCollectionSlug)) {
    return null;
  }
  const family = familyBySlug(slug);
  if (!family) return null;
  const brand = getBrandById(family.brandId);
  const rackets = family.productIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p && p.status === "published"));
  if (rackets.length === 0) return null;

  const relatedRaw = RELATED_BY_FAMILY[slug as PadelCollectionSlug] ?? [];
  const related = relatedRaw
    .map((row) => {
      const product = getProductById(row.productId);
      if (!product || product.status !== "published") return null;
      return { ...row, product };
    })
    .filter((r): r is PadelCollectionRelated & { product: Product } =>
      Boolean(r),
    );

  return {
    family,
    brand,
    rackets,
    related,
    path: `/padel/collections/${slug}`,
    title: `${brand?.name ?? ""} ${family.name}`.trim(),
    summary:
      family.description ??
      `${family.name} rackets and verified companion kit on Kitletics.`,
  };
}
