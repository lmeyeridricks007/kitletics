import type { Product } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import {
  getOffersForProductInRegion,
  getLowestOfferPrice,
  getBuyingGuideBySlug,
  getBestGuideBySlug,
} from "@/repositories";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { resolveBestGuideImage } from "@/lib/best/resolve-best-guide-image";
import { resolveSemanticImage } from "@/lib/media/semantic-image";

export interface SearchFeatureFacet {
  id: string;
  label: string;
  /** URL value for ?feature= */
  value: string;
  count: number;
}

export interface SearchPriceFacet {
  min: number;
  max: number;
  currency: string;
  /** Selected bounds when applied */
  selectedMin?: number;
  selectedMax?: number;
}

/** When offers exist but none pass display freshness — show message, not slider. */
export type SearchPriceFacetState =
  | { kind: "range"; facet: SearchPriceFacet }
  | { kind: "updating" }
  | { kind: "none" };

type FeatureMatcher = (product: Product) => boolean;

/** Curated, human-readable feature facets per dominant category. */
const CATEGORY_FEATURE_DEFS: Record<
  string,
  { id: string; label: string; value: string; match: FeatureMatcher }[]
> = {
  "cat-running-shoes": [
    {
      id: "carbon-plate",
      label: "Carbon plate",
      value: "carbon-plate",
      match: (p) => p.specifications?.plateMaterial === "carbon",
    },
    {
      id: "wide-fit",
      label: "Wide fit",
      value: "wide-fit",
      match: (p) => {
        const w = p.specifications?.widthOptions;
        if (Array.isArray(w))
          return w.includes("wide") || w.includes("extra-wide");
        return false;
      },
    },
    {
      id: "stability",
      label: "Stability",
      value: "stability",
      match: (p) => {
        const s = p.specifications?.stability;
        return (
          s === "mild-stability" ||
          s === "stability" ||
          s === "maximum-stability"
        );
      },
    },
    {
      id: "high-cushioning",
      label: "High cushioning",
      value: "high-cushioning",
      match: (p) => {
        const c = p.specifications?.cushionLevel;
        return c === "high" || c === "maximum";
      },
    },
    {
      id: "waterproof",
      label: "Waterproof",
      value: "waterproof",
      match: (p) => {
        const water = p.specifications?.waterResistance;
        return water === "waterproof" || water === "water-resistant";
      },
    },
  ],
  "cat-gps-watches": [
    {
      id: "maps",
      label: "Maps",
      value: "maps",
      match: (p) => p.specifications?.maps === true,
    },
    {
      id: "multi-band-gps",
      label: "Multi-band GPS",
      value: "multi-band-gps",
      match: (p) => p.specifications?.multiBandGps === true,
    },
    {
      id: "music",
      label: "Music",
      value: "music",
      match: (p) => p.specifications?.music === true,
    },
    {
      id: "ecg",
      label: "ECG",
      value: "ecg",
      match: (p) => p.specifications?.ecg === true,
    },
  ],
  "cat-padel-rackets": [
    {
      id: "round",
      label: "Round",
      value: "round",
      match: (p) => p.specifications?.shape === "round",
    },
    {
      id: "teardrop",
      label: "Teardrop",
      value: "teardrop",
      match: (p) => p.specifications?.shape === "teardrop",
    },
    {
      id: "diamond",
      label: "Diamond",
      value: "diamond",
      match: (p) => p.specifications?.shape === "diamond",
    },
    {
      id: "control",
      label: "Control",
      value: "control",
      match: (p) => p.useCaseIds.includes("uc-padel-control"),
    },
    {
      id: "power",
      label: "Power",
      value: "power",
      match: (p) => p.useCaseIds.includes("uc-padel-power"),
    },
  ],
};

const MIN_FEATURE_COVERAGE = 3;
/** Top category share of Product hits required to treat as dominant. */
const DOMINANT_CATEGORY_RATIO = 0.4;

export function detectDominantCategoryId(
  products: Product[],
): string | undefined {
  if (products.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [bestId, bestCount] = ranked[0] ?? [];
  if (!bestId || !bestCount) return undefined;
  if (bestCount / products.length < DOMINANT_CATEGORY_RATIO) return undefined;
  // Prefer clear winner: at least 1.25× the runner-up when share is modest
  const second = ranked[1]?.[1] ?? 0;
  if (bestCount / products.length < 0.5 && bestCount < second * 1.25) {
    return undefined;
  }
  return bestId;
}

export function buildFeatureFacets(
  products: Product[],
  dominantCategoryId: string | undefined,
): SearchFeatureFacet[] {
  if (!dominantCategoryId) return [];
  const defs = CATEGORY_FEATURE_DEFS[dominantCategoryId];
  if (!defs) return [];
  const inCategory = products.filter((p) => p.categoryId === dominantCategoryId);

  const facets: SearchFeatureFacet[] = [];
  for (const def of defs) {
    const count = inCategory.filter(def.match).length;
    if (count < MIN_FEATURE_COVERAGE) continue;
    facets.push({
      id: def.id,
      label: def.label,
      value: def.value,
      count,
    });
  }
  return facets;
}

export function productMatchesFeatures(
  product: Product,
  featureValues: string[],
  dominantCategoryId: string | undefined,
): boolean {
  if (!featureValues.length) return true;
  if (!dominantCategoryId) return true;
  const defs = CATEGORY_FEATURE_DEFS[dominantCategoryId];
  if (!defs) return true;
  return featureValues.every((value) => {
    const def = defs.find((d) => d.value === value);
    return def ? def.match(product) : true;
  });
}

export function buildPriceFacet(
  products: Product[],
  region: RegionCode,
  _options: PublishResolverOptions | undefined,
  selectedMin?: number,
  selectedMax?: number,
): SearchPriceFacet | undefined {
  const state = buildPriceFacetState(
    products,
    region,
    _options,
    selectedMin,
    selectedMax,
  );
  return state.kind === "range" ? state.facet : undefined;
}

export function buildPriceFacetState(
  products: Product[],
  region: RegionCode,
  _options: PublishResolverOptions | undefined,
  selectedMin?: number,
  selectedMax?: number,
): SearchPriceFacetState {
  const prices: number[] = [];
  let currency = "EUR";
  let hasAnyOffer = false;
  for (const p of products) {
    const offers = getOffersForProductInRegion(p.id, region);
    if (offers.length) hasAnyOffer = true;
    // Only displayable (fresh/recent) prices drive the slider + filters
    const lowest = getLowestOfferPrice(p.id, region, _options);
    if (!lowest) continue;
    prices.push(lowest.price);
    currency = lowest.currency;
  }
  if (prices.length < 3) {
    return hasAnyOffer ? { kind: "updating" } : { kind: "none" };
  }
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  if (max <= min) {
    return hasAnyOffer ? { kind: "updating" } : { kind: "none" };
  }
  return {
    kind: "range",
    facet: {
      min,
      max,
      currency,
      selectedMin,
      selectedMax,
    },
  };
}

export function productMatchesPrice(
  product: Product,
  region: RegionCode,
  options: PublishResolverOptions | undefined,
  minPrice?: number,
  maxPrice?: number,
): boolean {
  if (minPrice == null && maxPrice == null) return true;
  const lowest = getLowestOfferPrice(product.id, region, options);
  if (!lowest) return false;
  if (minPrice != null && lowest.price < minPrice) return false;
  if (maxPrice != null && lowest.price > maxPrice) return false;
  return true;
}

export function resolveGuideImageSrc(input: {
  slug: string;
  title: string;
  type?: string;
}): string {
  const buying = getBuyingGuideBySlug(input.slug);
  if (buying) return resolveGuideImage(buying).src;

  const best = getBestGuideBySlug(input.slug) ??
    getBestGuideBySlug(input.slug.replace(/^best-/, ""));
  if (best) return resolveBestGuideImage(best).src;

  return resolveSemanticImage({
    pageType: "search",
    placement: "card",
    slug: input.slug,
    title: input.title,
  }).src;
}
