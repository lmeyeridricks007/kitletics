import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  resolvePublished,
  resolvePublishedById,
  resolvePublishedBySlug,
} from "@/lib/publishing/resolver";
import { brands as rawBrands } from "@/content/brands";
import { productFamilies as rawFamilies } from "@/content/families";
import { products as rawProducts } from "@/content/products";
import { applyProductSpecFill } from "@/content/specs/product-spec-fill";
import { applyRunningAudienceVariants } from "@/content/running/audience-variants";
import { padelRacketVariants } from "@/content/padel/rackets";
import { allSpecificationDefinitions } from "@/content/specs/definitions";
import { isNonSpecCategory } from "@/content/specs/category-spec-policy";
import type {
  Brand,
  Product,
  ProductFamily,
  ProductVariant,
  SpecificationDefinition,
  SpecValue,
} from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { pickLowestDisplayableOffer } from "@/domain/commerce/ranking";
import { getOffersForProduct } from "@/repositories/commerce";
import {
  resolveRunningProductImages,
  resolveRunningCatalogImages,
} from "@/content/running/media";

function withRunningImages(product: Product | undefined): Product | undefined {
  return product ? resolveRunningProductImages(product) : undefined;
}

export function getBrands(options?: PublishResolverOptions): Brand[] {
  return resolvePublished(rawBrands, options);
}

export function getBrandBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Brand | undefined {
  return resolvePublishedBySlug(rawBrands, slug, options);
}

export function getBrandById(
  id: string,
  options?: PublishResolverOptions,
): Brand | undefined {
  return resolvePublishedById(rawBrands, id, options);
}

export function getProductFamilies(): ProductFamily[] {
  return [...rawFamilies];
}

export function getProductFamilyById(id: string): ProductFamily | undefined {
  return rawFamilies.find((f) => f.id === id);
}

const filled = applyProductSpecFill(rawProducts);
const { products: productsWithAudience, variants: audienceVariants } =
  applyRunningAudienceVariants(filled);
const variantsByProductId = new Map<string, ProductVariant[]>();
for (const v of [...audienceVariants, ...padelRacketVariants]) {
  const list = variantsByProductId.get(v.productId) ?? [];
  list.push(v);
  variantsByProductId.set(v.productId, list);
}

const productsWithSpecFill = productsWithAudience;

export function getProductVariants(): ProductVariant[] {
  return [...audienceVariants, ...padelRacketVariants];
}

export function getVariantById(id: string): ProductVariant | undefined {
  return (
    audienceVariants.find((v) => v.id === id) ??
    padelRacketVariants.find((v) => v.id === id)
  );
}

export function getVariantsForProduct(productId: string): ProductVariant[] {
  return variantsByProductId.get(productId) ?? [];
}

export function getProducts(options?: PublishResolverOptions): Product[] {
  return resolveRunningCatalogImages(
    resolvePublished(productsWithSpecFill, options).filter((p) => !p.noindex),
  );
}

export function getProductBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Product | undefined {
  return withRunningImages(
    resolvePublishedBySlug(productsWithSpecFill, slug, options),
  );
}

export function getProductById(
  id: string,
  options?: PublishResolverOptions,
): Product | undefined {
  return withRunningImages(
    resolvePublishedById(productsWithSpecFill, id, options),
  );
}

export function getProductsBySport(
  sportId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) => p.sportIds.includes(sportId));
}

export function getProductsByCategory(
  categoryId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) => p.categoryId === categoryId);
}

export function getProductsByUseCase(
  useCaseId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) => p.useCaseIds.includes(useCaseId));
}

export function getProductsByBrand(
  brandId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) => p.brandId === brandId);
}

export function getProductsByDiscipline(
  disciplineId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) =>
    p.disciplineIds.includes(disciplineId),
  );
}

export function getProductsBySubcategory(
  subcategoryId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProducts(options).filter((p) =>
    p.subcategoryIds.includes(subcategoryId),
  );
}

export function getSpecificationDefinitions(
  categoryId?: string,
): SpecificationDefinition[] {
  if (!categoryId) return [...allSpecificationDefinitions];
  if (isNonSpecCategory(categoryId)) return [];
  return allSpecificationDefinitions.filter((s) => s.categoryId === categoryId);
}

export function getSpecificationDefinition(
  categoryId: string,
  key: string,
): SpecificationDefinition | undefined {
  return allSpecificationDefinitions.find(
    (s) => s.categoryId === categoryId && s.key === key,
  );
}

/** Specs ordered for comparison tables — only keys present on definitions. */
export function getComparableSpecs(
  products: Product[],
): { key: string; label: string; unit?: string; values: Record<string, SpecValue> }[] {
  if (products.length === 0) return [];
  const categoryId = products[0].categoryId;
  const defs = getSpecificationDefinitions(categoryId)
    .filter((d) => d.comparisonPriority > 0)
    .sort((a, b) => b.comparisonPriority - a.comparisonPriority);

  return defs
    .map((def) => {
      const values: Record<string, SpecValue> = {};
      for (const product of products) {
        values[product.id] = product.specifications[def.key] ?? null;
      }
      const anyPresent = Object.values(values).some((v) => v !== null && v !== undefined);
      if (!anyPresent) return null;
      return {
        key: def.key,
        label: def.label,
        unit: def.unit,
        values,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export function getLowestOfferPrice(
  productId: string,
  region?: RegionCode,
  options?: PublishResolverOptions,
): { price: number; currency: string; offerId?: string } | undefined {
  const product = getProductById(productId, options);
  if (!product) return undefined;
  const r = region ?? DEFAULT_REGION;
  const offers = getOffersForProduct(product.id, r);
  const lowest = pickLowestDisplayableOffer(offers, new Date(), r);
  if (!lowest) return undefined;
  return { price: lowest.price, currency: lowest.currency, offerId: lowest.id };
}
