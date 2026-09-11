import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/content/config";
import {
  getSportBySlug,
  getSportById,
  getCategoryBySlug,
  getCategoryById,
  getCategoryByPathSegment,
  getDisciplineBySlug,
  getProductBySlug,
  getProductById,
  getBrandBySlug,
  getReviewBySlug,
  getBestGuideBySlug,
  getComparisonBySlug,
  getBuyingGuideBySlug,
  getToolBySlug,
  getGearSetupBySlug,
} from "@/repositories";

export type BreadcrumbContext =
  | { type: "home" }
  | { type: "sport"; sportSlug: string }
  | { type: "sport-segment"; sportSlug: string; segment: string }
  | { type: "product"; productSlug: string }
  | { type: "product-alternatives"; productSlug: string }
  | { type: "brand"; brandSlug: string }
  | { type: "category"; categorySlug: string }
  | { type: "review"; reviewSlug: string }
  | { type: "best"; guideSlug: string }
  | {
      type: "compare";
      comparisonSlug?: string;
      /** Interactive Compare Builder — Home > Compare > Category */
      categorySlug?: string;
      categoryName?: string;
    }
  | { type: "guide"; guideSlug: string }
  | { type: "tool"; toolSlug: string }
  | { type: "setup"; setupSlug: string }
  | { type: "gear" }
  | { type: "brands" }
  | { type: "tools" }
  | { type: "finders" }
  | { type: "search"; query?: string }
  | { type: "page"; title: string; href?: string };

const home: BreadcrumbItem = { label: "Home", href: "/" };

export function resolveBreadcrumbs(ctx: BreadcrumbContext): BreadcrumbItem[] {
  switch (ctx.type) {
    case "home":
      return [home];
    case "sport": {
      const sport = getSportBySlug(ctx.sportSlug);
      return [home, { label: sport?.name ?? ctx.sportSlug }];
    }
    case "sport-segment": {
      const sport = getSportBySlug(ctx.sportSlug);
      if (!sport) return [home, { label: ctx.segment }];
      const disc = getDisciplineBySlug(ctx.sportSlug, ctx.segment);
      const cat = getCategoryByPathSegment(sport.id, ctx.segment);
      const label = disc?.name ?? cat?.name ?? ctx.segment;
      return [
        home,
        { label: sport.name, href: `/${sport.slug}` },
        { label },
      ];
    }
    case "product": {
      const product = getProductBySlug(ctx.productSlug);
      return [
        home,
        { label: "Products", href: "/gear" },
        { label: product?.fullName ?? ctx.productSlug },
      ];
    }
    case "product-alternatives": {
      const product = getProductBySlug(ctx.productSlug);
      const category = product
        ? getCategoryById(product.categoryId)
        : undefined;
      const sport = product?.sportIds[0]
        ? getSportById(product.sportIds[0])
        : undefined;
      return [
        home,
        ...(sport
          ? [{ label: sport.name, href: `/${sport.slug}` }]
          : []),
        ...(category
          ? [
              {
                label: category.name,
                href: sport
                  ? `/${sport.slug}/${category.pathSegment}`
                  : `/gear/${category.pathSegment ?? category.slug}`,
              },
            ]
          : []),
        {
          label: `${product?.fullName ?? ctx.productSlug} Alternatives`,
        },
      ];
    }
    case "brand": {
      const brand = getBrandBySlug(ctx.brandSlug);
      return [
        home,
        { label: "Brands", href: "/brands" },
        { label: brand?.name ?? ctx.brandSlug },
      ];
    }
    case "category": {
      const cat = getCategoryBySlug(ctx.categorySlug);
      return [
        home,
        { label: "Gear", href: "/gear" },
        { label: cat?.name ?? ctx.categorySlug },
      ];
    }
    case "review": {
      const review = getReviewBySlug(ctx.reviewSlug);
      return [
        home,
        { label: "Reviews", href: "/reviews" },
        { label: review?.slug.replace(/-/g, " ") ?? ctx.reviewSlug },
      ];
    }
    case "best": {
      const guide = getBestGuideBySlug(ctx.guideSlug);
      return [
        home,
        { label: "Best", href: "/best" },
        { label: guide?.title ?? ctx.guideSlug },
      ];
    }
    case "compare": {
      if (!ctx.comparisonSlug) {
        const crumbs: BreadcrumbItem[] = [
          home,
          { label: "Compare", href: "/compare" },
        ];
        const catName =
          ctx.categoryName ??
          (ctx.categorySlug
            ? getCategoryBySlug(ctx.categorySlug)?.name
            : undefined);
        if (catName) crumbs.push({ label: catName });
        return crumbs;
      }
      const cmp = getComparisonBySlug(ctx.comparisonSlug);
      const product = cmp?.productIds[0]
        ? getProductById(cmp.productIds[0])
        : undefined;
      const sport = product?.sportIds[0]
        ? getSportById(product.sportIds[0])
        : undefined;
      const category = cmp?.categoryId
        ? getCategoryById(cmp.categoryId)
        : product
          ? getCategoryById(product.categoryId)
          : undefined;
      const crumbs: BreadcrumbItem[] = [home];
      if (sport) {
        crumbs.push({ label: sport.name, href: `/${sport.slug}` });
      }
      if (category) {
        crumbs.push({
          label: category.name,
          href:
            sport && category.pathSegment
              ? `/${sport.slug}/${category.pathSegment}`
              : `/gear/${category.slug}`,
        });
      }
      crumbs.push({ label: cmp?.title ?? ctx.comparisonSlug });
      return crumbs;
    }
    case "guide": {
      const guide = getBuyingGuideBySlug(ctx.guideSlug);
      return [
        home,
        { label: "Guides", href: "/guides" },
        { label: guide?.title ?? ctx.guideSlug },
      ];
    }
    case "tool": {
      const tool = getToolBySlug(ctx.toolSlug);
      return [
        home,
        { label: "Tools", href: "/tools" },
        { label: tool?.name ?? ctx.toolSlug },
      ];
    }
    case "setup": {
      const setup = getGearSetupBySlug(ctx.setupSlug);
      return [
        home,
        { label: "Setups", href: "/setups" },
        { label: setup?.title ?? ctx.setupSlug },
      ];
    }
    case "gear":
      return [home, { label: "Gear" }];
    case "brands":
      return [home, { label: "Brands" }];
    case "tools":
      return [home, { label: "Tools" }];
    case "finders":
      return [home, { label: "Finders" }];
    case "search":
      return [
        home,
        {
          label: ctx.query ? `Search “${ctx.query}”` : "Search",
        },
      ];
    case "page":
      return [home, { label: ctx.title, href: ctx.href }];
    default:
      return [home];
  }
}

export function breadcrumbsJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? {
            item: item.href.startsWith("http")
              ? item.href
              : `${siteConfig.url}${item.href}`,
          }
        : {}),
    })),
  };
}
