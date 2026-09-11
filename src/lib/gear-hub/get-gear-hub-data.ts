import type { RegionCode } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getSports,
  getSportBySlug,
  getCategoryBySlug,
  getProductsByCategory,
  getProductsBySport,
  getProductsByBrand,
  getProductsByUseCase,
  getBrandById,
  getProductById,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getToolBySlug,
  getBestGuideBySlug,
} from "@/repositories";
import { getBrands } from "@/repositories/products";
import { getUseCases } from "@/repositories/sports";
import { getScoreBand } from "@/lib/product/score";
import { getAwardLabel } from "@/lib/best/awards";
import { getToolHref } from "@/lib/tools/href";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  GEAR_HUB_BEST_FOR,
  GEAR_HUB_FEATURED_CATEGORIES,
  GEAR_HUB_FINDER_SLUGS,
  GEAR_HUB_HERO_MONTAGE,
  GEAR_HUB_PICK_GUIDES,
  GEAR_HUB_PRICE_STOPS,
  GEAR_HUB_SHOP_CARDS,
} from "@/lib/gear-hub/config";
import { getCategoryHref } from "@/lib/navigation/category-href";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
  isLaunchListable,
} from "@/domain/launch";
import type {
  GearHubFiltersState,
  GearHubPageData,
  GearHubProductPick,
} from "@/lib/gear-hub/types";

function publishOpts(preview?: boolean): PublishResolverOptions | undefined {
  return preview ? { isDev: true } : undefined;
}

function categoryHref(
  categorySlug: string,
  options?: PublishResolverOptions,
): string {
  return getCategoryHref(categorySlug, options);
}

function sportHref(sportSlug: string): string {
  if (sportSlug === "hyrox") return "/fitness/hyrox";
  return `/${sportSlug}`;
}

function filterProducts(
  productIds: string[],
  filters: GearHubFiltersState,
  region: RegionCode,
  options?: PublishResolverOptions,
): string[] {
  let ids = productIds;

  if (filters.sport) {
    const sport = getSportBySlug(filters.sport, options);
    if (sport) {
      const allowed = new Set(
        getProductsBySport(sport.id, options).map((p) => p.id),
      );
      ids = ids.filter((id) => allowed.has(id));
    }
  }

  if (filters.usecase) {
    const uc = getUseCases().find((u) => u.slug === filters.usecase);
    if (uc) {
      const allowed = new Set(
        getProductsByUseCase(uc.id).map((p) => p.id),
      );
      ids = ids.filter((id) => allowed.has(id));
    }
  }

  if (filters.brand) {
    const brand = getBrands(options).find((b) => b.slug === filters.brand);
    if (brand) {
      const allowed = new Set(
        getProductsByBrand(brand.id, options).map((p) => p.id),
      );
      ids = ids.filter((id) => allowed.has(id));
    }
  }

  if (filters.maxPrice != null && filters.maxPrice > 0) {
    ids = ids.filter((id) => {
      const lowest = getLowestOfferPrice(id, region, options);
      if (!lowest) return true; // unknown price stays discoverable
      return lowest.price <= filters.maxPrice!;
    });
  }

  return ids;
}

function mapPick(
  productId: string,
  role: string,
  region: RegionCode,
  options?: PublishResolverOptions,
): GearHubProductPick | null {
  const product = getProductById(productId, options);
  if (!product) return null;
  const media = getPrimaryProductMedia(product);
  if (!media) return null;
  const brand = getBrandById(product.brandId, options);
  const score = product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const lowest = getLowestOfferPrice(product.id, region, options);
  const offerCount = getOffersForProductInRegion(product.id, region).length;

  return {
    id: product.id,
    fullName: product.fullName,
    brandName: brand?.name ?? "",
    name: product.name,
    href: `/products/${product.slug}`,
    role,
    image: { src: media.src, alt: media.alt },
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: lowest
      ? { amount: lowest.price, currency: lowest.currency }
      : undefined,
    offerCount,
  };
}

export function parseGearHubFilters(
  searchParams: Record<string, string | string[] | undefined>,
): GearHubFiltersState {
  const one = (key: string) => {
    const v = searchParams[key];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  const maxRaw = one("maxPrice");
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;
  return {
    sport: one("sport"),
    usecase: one("usecase"),
    brand: one("brand"),
    maxPrice:
      maxPrice != null && Number.isFinite(maxPrice) && maxPrice > 0
        ? maxPrice
        : undefined,
  };
}

export function getGearHubData(input: {
  region?: RegionCode;
  filters?: GearHubFiltersState;
  preview?: boolean;
}): GearHubPageData {
  const region = input.region ?? DEFAULT_REGION;
  const options = publishOpts(input.preview);
  const filters = input.filters ?? {};

  const liveSports = getSports(options).filter(
    (s) => s.contentStatus === "live" && s.available,
  );

  const browse = [
    {
      id: "all",
      label: "All Categories",
      href: "/gear",
      isActive: !filters.sport,
    },
    ...liveSports
      .filter((s) => !s.parentSportId || s.slug === "hyrox" || s.slug === "padel" || s.slug === "tennis")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        id: s.id,
        label: s.name.replace(" & Training", ""),
        href: `/gear?sport=${s.slug}`,
        sportFilter: s.slug,
        isActive: filters.sport === s.slug,
      })),
  ];

  // Deduplicate browse by slug
  const seenBrowse = new Set<string>();
  const browseUnique = browse.filter((item) => {
    if (seenBrowse.has(item.id)) return false;
    seenBrowse.add(item.id);
    return true;
  });

  const categories = GEAR_HUB_SHOP_CARDS.map((card) => {
    let productIds: string[] = [];
    let href = "#";
    let imageSrc = card.imageSrc;
    let imageAlt = card.imageAlt ?? card.title;

    if (card.type === "category" && card.categorySlug) {
      const category = getCategoryBySlug(card.categorySlug, options);
      if (!category) return null;
      productIds = getProductsByCategory(category.id, options).map((p) => p.id);
      href = categoryHref(card.categorySlug, options);
      if (!imageSrc) {
        const withMedia = productIds
          .map((id) => getProductById(id, options))
          .find((p) => p && getPrimaryProductMedia(p));
        const media = withMedia
          ? getPrimaryProductMedia(withMedia)
          : undefined;
        if (media) {
          imageSrc = media.src;
          imageAlt = media.alt;
        }
      }
    } else if (card.type === "sport" && card.sportSlug) {
      const sport = getSportBySlug(card.sportSlug, options);
      if (!sport) return null;
      productIds = getProductsBySport(sport.id, options).map((p) => p.id);
      href = sportHref(card.sportSlug);
    }

    const listableIds = productIds.filter((id) => {
      const product = getProductById(id, options);
      return (
        product &&
        isLaunchListable(
          getLaunchEligibility({ kind: "product", entity: product }, options),
        )
      );
    });
    const filtered = filterProducts(listableIds, filters, region, options);
    if (filtered.length === 0) return null;

    return {
      id: card.id,
      title: card.title,
      shortDescription: card.shortDescription,
      href,
      imageSrc: imageSrc ?? "/images/catalog/fallbacks/accessory.svg",
      imageAlt,
      publishedProductCount: filtered.length,
    };
  }).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const tools = GEAR_HUB_FINDER_SLUGS.map((slug) => getToolBySlug(slug, options))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .filter((t) => t.available)
    .filter((t) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "tool", entity: t }, options),
      ),
    )
    .filter((t) => {
      if (!filters.sport) return true;
      const sport = getSportBySlug(filters.sport, options);
      if (!sport) return true;
      return t.sportIds.includes(sport.id) || t.sportIds.length === 0;
    })
    .map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.shortDescription ?? tool.description,
      href: getToolHref(tool),
      icon: tool.icon ?? "Wrench",
    }));

  // If sport filter emptied tools, fall back to all featured finders
  const toolItems =
    tools.length > 0
      ? tools
      : GEAR_HUB_FINDER_SLUGS.map((slug) => getToolBySlug(slug, options))
          .filter((t): t is NonNullable<typeof t> => Boolean(t))
          .filter((t) => t.available)
          .filter((t) =>
            shouldPromotePublicly(
              getLaunchEligibility({ kind: "tool", entity: t }, options),
            ),
          )
          .map((tool) => ({
            id: tool.id,
            slug: tool.slug,
            name: tool.name,
            description: tool.shortDescription ?? tool.description,
            href: getToolHref(tool),
            icon: tool.icon ?? "Wrench",
          }));

  const picks: GearHubProductPick[] = [];
  const usedProductIds = new Set<string>();
  for (const slot of GEAR_HUB_PICK_GUIDES) {
    if (picks.length >= 4) break;
    const guide = getBestGuideBySlug(slot.guideSlug, options);
    if (!guide?.recommendations?.length) continue;
    for (const rec of guide.recommendations) {
      if (usedProductIds.has(rec.productId)) continue;
      const filtered = filterProducts(
        [rec.productId],
        filters,
        region,
        options,
      );
      if (filtered.length === 0) continue;
      const role =
        getAwardLabel(rec.awardType, rec.badge) ?? slot.roleFallback;
      const pick = mapPick(rec.productId, role, region, options);
      if (!pick) continue;
      usedProductIds.add(rec.productId);
      picks.push(pick);
      break;
    }
  }

  const brandCounts = getBrands(options)
    .map((brand) => {
      let ids = getProductsByBrand(brand.id, options).map((p) => p.id);
      ids = filterProducts(ids, filters, region, options);
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        productCount: ids.length,
      };
    })
    .filter((b) => b.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);

  const brandCards = brandCounts.slice(0, 8).map((b) => ({
    id: b.id,
    name: b.name,
    href: `/brands/${b.slug}`,
    logo: b.logo,
    productCount: b.productCount,
  }));

  const bestForFacets = GEAR_HUB_BEST_FOR.map((opt) => {
    const uc = getUseCases().find((u) => u.slug === opt.useCaseSlug);
    if (!uc) return null;
    let ids = getProductsByUseCase(uc.id).map((p) => p.id);
    ids = filterProducts(
      ids,
      { ...filters, usecase: undefined },
      region,
      options,
    );
    if (ids.length === 0) return null;
    return {
      id: uc.id,
      label: opt.label,
      value: opt.value,
      count: ids.length,
    };
  }).filter((f): f is NonNullable<typeof f> => Boolean(f));

  const brandFacets = brandCounts.slice(0, 12).map((b) => ({
    id: b.id,
    label: b.name,
    value: b.slug,
    count: b.productCount,
  }));

  return {
    region,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Gear Hub" },
    ],
    hero: {
      eyebrow: "GEAR HUB",
      titleLines: ["All the gear.", "Every sport."],
      description:
        "Explore every equipment category on Kitletics. Compare, learn and find what fits your goals.",
      montage: [...GEAR_HUB_HERO_MONTAGE],
      trust: [
        {
          title: "Independent methodology",
          description: "No brand sponsorships of rankings",
          icon: "BadgeCheck",
        },
        {
          title: "Structured Product data",
          description: "Specs and evidence you can compare",
          icon: "Database",
        },
        {
          title: "Current retailer offers",
          description: "Regional prices with last-checked times",
          icon: "Tag",
        },
        {
          title: "Built for sport decisions",
          description: "Finders, guides and comparisons",
          icon: "Target",
        },
      ],
    },
    browse: browseUnique,
    facets: {
      bestFor: bestForFacets,
      brands: brandFacets,
      priceStops: [...GEAR_HUB_PRICE_STOPS],
    },
    filters,
    categories,
    tools: {
      title: "Find the right gear",
      description:
        "Not sure where to start? Our tools match you with gear for your sport and goals.",
      items: toolItems.slice(0, 4),
      viewAllHref: "/tools",
    },
    featuredCategories: {
      title: "Featured categories",
      items: GEAR_HUB_FEATURED_CATEGORIES,
    },
    brands: {
      title: "Featured brands",
      items: brandCards,
      viewAllHref: "/brands",
    },
    picks: {
      title: "Kitletics picks",
      items: picks,
      viewAllHref: "/best",
      viewAllLabel: "View Best Guides →",
    },
    learn: {
      title: "Learn & compare",
      items: [
        {
          id: "compare",
          title: "Gear Comparisons",
          description: "Side-by-side product comparisons",
          href: "/compare",
          icon: "compare",
        },
        {
          id: "guides",
          title: "Buying Guides",
          description: "Decision guides by category",
          href: "/guides",
          icon: "guides",
        },
        {
          id: "best",
          title: "Best Guides",
          description: "Editorial shortlists for use cases",
          href: "/best",
          icon: "best",
        },
        {
          id: "reviews",
          title: "Gear Reviews",
          description: "Structured product reviews",
          href: "/reviews",
          icon: "reviews",
        },
      ],
      viewAllHref: "/guides",
    },
    help: {
      title: "Need help choosing?",
      description:
        "Use decision tools and buying guides — we don’t offer live chat support.",
      primary: { label: "Find a tool", href: "/tools" },
      secondary: { label: "Contact us", href: "/contact" },
    },
    bottomTrust: [
      {
        title: "Independent methodology",
        description: "Rankings aren’t sold to brands.",
        icon: "BadgeCheck",
      },
      {
        title: "Structured evidence",
        description: "Claims tied to Product and Evidence data.",
        icon: "Database",
      },
      {
        title: "Current retailer offers",
        description: "Prices from connected retailers when fresh.",
        icon: "Tag",
      },
      {
        title: "Transparent affiliate model",
        description: "Commission never ranks Products or Tools.",
        icon: "Sparkles",
      },
      {
        title: "Find what fits you",
        description: "Finders and guides for real decisions.",
        icon: "Target",
      },
    ],
  };
}
