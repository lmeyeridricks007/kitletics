import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getGearSetups,
  getTools,
} from "@/repositories";
import { getProducts } from "@/repositories/products";

export interface RelatedEditorialResult {
  bestGuides: { id: string; slug: string; title: string }[];
  buyingGuides: { id: string; slug: string; title: string }[];
  comparisons: { id: string; slug: string; title: string }[];
  setups: { id: string; slug: string; title: string }[];
  tools: { slug: string; name: string }[];
  products: { id: string; slug: string; name: string }[];
}

/**
 * Related editorial modules — explicit IDs outrank automatic similarity.
 */
export function getRelatedEditorial(
  input: {
    contentId: string;
    sportId?: string;
    categoryId?: string;
    useCaseIds?: string[];
    productIds?: string[];
    explicitBestGuideIds?: string[];
    explicitBuyingGuideIds?: string[];
    explicitToolSlugs?: string[];
  },
  options?: PublishResolverOptions,
): RelatedEditorialResult {
  const best = getBestGuides(options).filter((g) => g.id !== input.contentId);
  const buying = getBuyingGuides(options).filter(
    (g) => g.id !== input.contentId,
  );
  const comparisons = getComparisons(options);
  const setups = getGearSetups(options);
  const tools = getTools(options);
  const products = getProducts(options);

  const explicitBest = new Set(input.explicitBestGuideIds ?? []);
  const explicitBuying = new Set(input.explicitBuyingGuideIds ?? []);
  const explicitTools = new Set(input.explicitToolSlugs ?? []);
  const productSet = new Set(input.productIds ?? []);
  const useCases = new Set(input.useCaseIds ?? []);

  const scoreBest = (g: (typeof best)[0]) => {
    let s = 0;
    if (explicitBest.has(g.id)) s += 100;
    if (input.sportId && g.sportId === input.sportId) s += 10;
    if (input.categoryId && g.categoryId === input.categoryId) s += 20;
    s += g.useCaseIds.filter((u) => useCases.has(u)).length * 5;
    s += g.recommendations.filter((r) => productSet.has(r.productId)).length * 8;
    return s;
  };

  const scoreBuying = (g: (typeof buying)[0]) => {
    let s = 0;
    if (explicitBuying.has(g.id)) s += 100;
    if (input.sportId && g.sportId === input.sportId) s += 10;
    if (input.categoryId && g.categoryId === input.categoryId) s += 20;
    s += g.relatedUseCaseIds.filter((u) => useCases.has(u)).length * 5;
    s += g.relatedProductIds.filter((p) => productSet.has(p)).length * 8;
    return s;
  };

  return {
    bestGuides: best
      .map((g) => ({ g, s: scoreBest(g) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map(({ g }) => ({ id: g.id, slug: g.slug, title: g.title })),
    buyingGuides: buying
      .map((g) => ({ g, s: scoreBuying(g) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map(({ g }) => ({ id: g.id, slug: g.slug, title: g.title })),
    comparisons: comparisons
      .filter(
        (c) =>
          (input.categoryId && c.categoryId === input.categoryId) ||
          c.productIds.some((p) => productSet.has(p)),
      )
      .slice(0, 6)
      .map((c) => ({ id: c.id, slug: c.slug, title: c.title })),
    setups: setups
      .filter(
        (s) =>
          (!input.sportId || s.sportId === input.sportId) &&
          (s.useCaseIds.some((u) => useCases.has(u)) ||
            s.items.some((i) => productSet.has(i.productId))),
      )
      .slice(0, 4)
      .map((s) => ({ id: s.id, slug: s.slug, title: s.title })),
    tools: tools
      .filter(
        (t) =>
          explicitTools.has(t.slug) ||
          (input.sportId && t.sportIds?.includes(input.sportId)),
      )
      .slice(0, 4)
      .map((t) => ({ slug: t.slug, name: t.name })),
    products: products
      .filter((p) => productSet.has(p.id))
      .slice(0, 8)
      .map((p) => ({ id: p.id, slug: p.slug, name: p.name })),
  };
}
