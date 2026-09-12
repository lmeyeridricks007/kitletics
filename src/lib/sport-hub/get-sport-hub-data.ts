import type { RegionCode } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getSportBySlug,
  getBestGuideBySlug,
  getBuyingGuides,
  getBuyingGuideBySlug,
  getComparisons,
  getBrandById,
  getProductById,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getToolBySlug,
  getGearSetupBySlug,
  getProductsByCategory,
} from "@/repositories";
import type { Product } from "@/domain/products/types";
import { getScoreBand } from "@/lib/product/score";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  getMockupSportHubConfig,
  hasMockupSportHub,
} from "@/lib/sport-hub/config";
import type {
  SportHubPageData,
  SportHubProductCard,
} from "@/lib/sport-hub/types";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
  isLaunchListable,
} from "@/domain/launch";

export { hasMockupSportHub, getMockupSportHubConfig };

function verifiedYear(iso?: string): number | undefined {
  if (!iso) return undefined;
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? y : undefined;
}

function productImage(product: Product) {
  const primary = getPrimaryProductMedia(product);
  if (primary) return { src: primary.src, alt: primary.alt || product.fullName };
  return undefined;
}

function bestGuideTitle(
  guide: { title: string; lastVerifiedAt?: string; updatedAt?: string },
  override?: string,
): string {
  if (override) return override.toUpperCase();
  const year = verifiedYear(guide.lastVerifiedAt ?? guide.updatedAt);
  const base = guide.title.toUpperCase();
  if (!year || /\b20\d{2}\b/.test(base)) return base;
  return `${base} ${year}`;
}

function mapGuideProducts(
  guide: { recommendations?: { productId: string; badge?: string; rank: number }[] },
  region: RegionCode,
  options: PublishResolverOptions | undefined,
  limit: number,
): SportHubProductCard[] {
  const out: SportHubProductCard[] = [];
  for (const rec of guide.recommendations ?? []) {
    if (out.length >= limit) break;
    const product = getProductById(rec.productId, options);
    if (!product) continue;
    if (
      !isLaunchListable(
        getLaunchEligibility({ kind: "product", entity: product }, options),
      )
    ) {
      continue;
    }
    // Hub strips only show products with authentic heroes — never "image unavailable".
    const image = productImage(product);
    if (!image) continue;
    const brand = getBrandById(product.brandId, options);
    const score = product.recommendationScore;
    const band = score !== undefined ? getScoreBand(score) : undefined;
    const lowest = getLowestOfferPrice(product.id, region, options);
    const offerCount = getOffersForProductInRegion(product.id, region).length;
    const hubRank = out.length + 1;
    out.push({
      id: product.id,
      slug: product.slug,
      brandName: brand?.name ?? "",
      name: product.name,
      fullName: product.fullName,
      href: `/products/${product.slug}`,
      badge: `RANK #${hubRank}`,
      image,
      score: score !== undefined ? score / 10 : undefined,
      scoreLabel: band?.label,
      price: lowest
        ? { amount: lowest.price, currency: lowest.currency }
        : undefined,
      offerCount,
    });
  }
  return out;
}

function publicHubActionHref(
  href: string,
  options: PublishResolverOptions | undefined,
): boolean {
  const [path, query] = href.split("?");
  if (query) return true;
  const parts = (path ?? "/").split("/").filter(Boolean);
  if (parts[0] === "tools" && parts[1]) {
    const tool = getToolBySlug(parts[1], options);
    return Boolean(
      tool &&
        shouldPromotePublicly(
          getLaunchEligibility({ kind: "tool", entity: tool }, options),
        ),
    );
  }
  if (parts[0] === "best" && parts[1]) {
    const guide = getBestGuideBySlug(parts[1], options);
    return Boolean(
      guide &&
        shouldPromotePublicly(
          getLaunchEligibility({ kind: "best-guide", entity: guide }, options),
        ),
    );
  }
  if (parts[0] === "guides" && parts[1]) {
    const guide = getBuyingGuideBySlug(parts[1], options);
    return Boolean(
      guide &&
        shouldPromotePublicly(
          getLaunchEligibility({ kind: "buying-guide", entity: guide }, options),
        ),
    );
  }
  return true;
}

export function getSportHubData(input: {
  sportSlug: string;
  region?: RegionCode;
  preview?: boolean;
}): SportHubPageData | undefined {
  const config = getMockupSportHubConfig(input.sportSlug);
  if (!config) return undefined;

  const region = input.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;

  const sport = getSportBySlug(config.sportSlug, options);
  if (!sport || sport.contentStatus !== "live") return undefined;

  const bestGuideRaw = getBestGuideBySlug(config.bestGuideSlug, options);
  const bestGuide =
    bestGuideRaw &&
    shouldPromotePublicly(
      getLaunchEligibility({ kind: "best-guide", entity: bestGuideRaw }, options),
    )
      ? bestGuideRaw
      : undefined;
  const featuredProducts = bestGuide
    ? mapGuideProducts(bestGuide, region, options, 5)
    : [];

  const finderByToolSlug = new Map(
    (config.categoryFinders ?? []).map((card) => [card.toolSlug, card]),
  );

  const moreBestSections = (config.moreBestSections ?? [])
    .map((section) => {
      const guide = getBestGuideBySlug(section.bestGuideSlug, options);
      if (
        !guide ||
        !shouldPromotePublicly(
          getLaunchEligibility({ kind: "best-guide", entity: guide }, options),
        )
      ) {
        return null;
      }
      const products = mapGuideProducts(
        guide,
        region,
        options,
        section.productLimit ?? 5,
      );
      if (products.length === 0) return null;

      let finder: SportHubPageData["finder"] | undefined;
      if (section.finderToolSlug) {
        const tool = getToolBySlug(section.finderToolSlug, options);
        const card =
          finderByToolSlug.get(section.finderToolSlug) ??
          config.categoryFinders?.find(
            (c) => c.toolSlug === section.finderToolSlug,
          );
        if (
          tool &&
          tool.available !== false &&
          card &&
          shouldPromotePublicly(
            getLaunchEligibility({ kind: "tool", entity: tool }, options),
          )
        ) {
          const href = `/tools/${tool.slug}`;
          finder = {
            title: card.title,
            description: card.description,
            ctaLabel: card.ctaLabel,
            ctaHref: href,
            footnoteLabel: tool.name,
            footnoteHref: href,
            fields: card.fields,
          };
        }
      }

      return {
        id: guide.id,
        title: bestGuideTitle(guide, section.title),
        href: `/best/${guide.slug}`,
        products,
        finder,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const finderToolRaw = getToolBySlug(config.finderToolSlug, options);
  const finderTool =
    finderToolRaw &&
    shouldPromotePublicly(
      getLaunchEligibility({ kind: "tool", entity: finderToolRaw }, options),
    )
      ? finderToolRaw
      : undefined;

  const guides = getBuyingGuides(options)
    .filter((g) => g.sportId === sport.id)
    .filter((g) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, options),
      ),
    )
    .slice(0, 3)
    .map((g) => ({
      id: g.id,
      title: g.title,
      description:
        g.sections[0]?.body ??
        "Structured buying advice for choosing the right gear.",
      href: `/guides/${g.slug}`,
      imageSrc: resolveGuideImage(g).src,
    }));

  const comparisons = getComparisons(options)
    .filter((c) => {
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: c },
        options,
      );
      // Broken peer refs must never promote on hubs (Fix 29).
      // Held-vertical comps stay off Day-1 hubs.
      return (
        !elig.reasons.some((r) => r.code === "missing_comparison_product") &&
        shouldPromotePublicly(elig)
      );
    })
    .filter((c) =>
      c.productIds.some((id) => {
        const p = getProductById(id, options);
        return p?.sportIds.includes(sport.id);
      }),
    )
    .slice(0, 4)
    .map((cmp) => {
      const products = cmp.productIds.slice(0, 2).map((id) => {
        const product = getProductById(id, options);
        if (!product) return null;
        return {
          name: product.fullName,
          image: productImage(product),
        };
      });
      if (!products[0] || !products[1]) return null;
      return {
        id: cmp.id,
        href: `/compare/${cmp.slug}`,
        productA: products[0],
        productB: products[1],
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const setupRaw = config.starterKitSlug
    ? getGearSetupBySlug(config.starterKitSlug, options)
    : undefined;
  const setup =
    setupRaw &&
    isLaunchListable(
      getLaunchEligibility({ kind: "setup", entity: setupRaw }, options),
    )
      ? setupRaw
      : undefined;

  let starterKit: SportHubPageData["starterKit"];
  if (setup) {
    let missing = 0;
    let total = 0;
    let currency = "EUR";
    const items = setup.items.map((item) => {
      const product = getProductById(item.productId, options);
      const price = product
        ? getLowestOfferPrice(product.id, region, options)
        : undefined;
      if (price) {
        total += price.price;
        currency = price.currency;
      } else {
        missing += 1;
      }
      return {
        productId: item.productId,
        label: item.role,
        href: product ? `/products/${product.slug}` : `/setups/${setup.slug}`,
        image: product ? productImage(product) : undefined,
        price: price
          ? { amount: price.price, currency: price.currency }
          : undefined,
      };
    });
    starterKit = {
      title: setup.title.toUpperCase(),
      href: `/setups/${setup.slug}`,
      items,
      total: missing === 0 ? { amount: total, currency } : undefined,
      missingPriceCount: missing,
    };
  }

  const orderedBrands = config.brandIds
    .map((id) => getBrandById(id, options))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      href: `/brands/${brand.slug}`,
      logo: brand.logo,
    }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(config.parentNavLabel
      ? [{ label: config.parentNavLabel, href: config.parentNavHref }]
      : []),
    { label: sport.name },
  ];

  const finderHref = finderTool
    ? `/tools/${finderTool.slug}`
    : `/tools?sport=${sport.slug}`;

  const withCounts = (item: {
    categoryId?: string;
    label: string;
    href: string;
    icon: string;
  }) => ({
    id: item.categoryId ?? item.label,
    label: item.label,
    href: item.href,
    icon: item.icon,
    productCount: item.categoryId
      ? getProductsByCategory(item.categoryId, options).length
      : undefined,
  });

  return {
    sportSlug: sport.slug,
    sportName: sport.name,
    region,
    breadcrumbs,
    hero: {
      title:
        config.hero.title ?? `${sport.name.toUpperCase()} GEAR`,
      description: config.hero.description,
      imageSrc: config.hero.imageSrc,
      imageAlt: config.hero.imageAlt,
    },
    quickActions: config.quickActions.filter((a) =>
      publicHubActionHref(a.href, options),
    ),
    shopCategories: config.shopCategories.map(withCounts),
    shopGroups: config.shopGroups?.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items.map(withCounts),
    })),
    bestSection:
      bestGuide && featuredProducts.length > 0
        ? {
            title: bestGuideTitle(bestGuide),
            href: `/best/${bestGuide.slug}`,
            products: featuredProducts,
          }
        : undefined,
    moreBestSections,
    // Finders are inlined on each moreBest strip for running; keep empty here.
    categoryFinders: [],
    finder: {
      title: config.finder.title,
      description: config.finder.description,
      ctaLabel: config.finder.ctaLabel,
      ctaHref: finderHref,
      footnoteLabel: config.finder.footnoteLabel,
      footnoteHref: finderHref,
      fields: config.finderFields,
    },
    benefits: config.benefits,
    guides: {
      title: config.guidesTitle,
      href: "/guides",
      items: guides,
    },
    comparisons: {
      title: config.comparisonsTitle,
      href: "/compare",
      items: comparisons,
    },
    starterKit,
    brands: {
      title: config.brandsTitle,
      href: "/brands",
      items: orderedBrands,
    },
    footer: config.footer,
  };
}
