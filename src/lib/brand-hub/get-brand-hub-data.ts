import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { Product } from "@/domain/products/types";
import {
  getBrandBySlug,
  getBuyingGuideBySlug,
  getCategoryById,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getProductById,
  getProductFamilies,
  getProductsByBrand,
  getBestGuidesForProduct,
  getReviews,
  getComparisonsForProduct,
  getVariantsForProduct,
} from "@/repositories";
import { getAwardLabel } from "@/lib/best/awards";
import { getScoreBand } from "@/lib/product/score";
import { canFeatureProduct, getPrimaryProductMedia } from "@/lib/product/media";
import {
  canPublishBrandHub,
  getDefaultBrandHubConfig,
} from "@/lib/brand-hub/config";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { buildBrandHubEditorial } from "@/lib/brand-hub/brand-hub-editorial";
import { getCategoryHref } from "@/lib/navigation/category-href";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
  isLaunchListable,
} from "@/domain/launch";
import type {
  BrandHubMedia,
  BrandHubPageData,
  BrandHubProductCard,
  BrandHubLinkCard,
} from "@/lib/brand-hub/types";
import type { AudienceFit } from "@/domain/products/types";

function mediaOf(product: Product): BrandHubMedia | undefined {
  const m = getPrimaryProductMedia(product);
  if (!m) return undefined;
  return { src: m.src, alt: m.alt };
}

function toProductCard(
  product: Product,
  brandName: string,
  role: string,
  region: RegionCode,
  options?: PublishResolverOptions,
): BrandHubProductCard {
  const price = getLowestOfferPrice(product.id, region, options);
  const offerCount = getOffersForProductInRegion(product.id, region).length;
  const score = product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName,
    fullName: product.fullName,
    href: `/products/${product.slug}`,
    role,
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: price
      ? { amount: price.price, currency: price.currency }
      : undefined,
    offerCount,
    image: mediaOf(product),
  };
}

function collectBrandProducts(
  brandId: string,
  relatedBrandIds: string[] | undefined,
  options?: PublishResolverOptions,
): Product[] {
  const ids = [brandId, ...(relatedBrandIds ?? [])];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const id of ids) {
    for (const p of getProductsByBrand(id, options)) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

function categoryHref(
  categoryId: string,
  brandSlug: string,
  options?: PublishResolverOptions,
): string {
  const cat = getCategoryById(categoryId, options);
  if (!cat) return `/brands/${brandSlug}`;
  return getCategoryHref(cat, { ...options, query: { brand: brandSlug } });
}

export function getBrandHubPageData(input: {
  brandSlug: string;
  region?: RegionCode;
  preview?: boolean;
}): BrandHubPageData | null {
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;
  const region = input.region ?? DEFAULT_REGION;
  const brand = getBrandBySlug(input.brandSlug, options);
  if (!brand) return null;

  const listableProduct = (product: Product) =>
    isLaunchListable(
      getLaunchEligibility({ kind: "product", entity: product }, options),
    );

  const config = getDefaultBrandHubConfig(brand.slug);
  const products = collectBrandProducts(
    brand.id,
    config.relatedBrandIds,
    options,
  );
  if (products.length === 0) return null;

  const featureable = products.filter(canFeatureProduct);

  // Categories with counts
  const byCat = new Map<string, Product[]>();
  for (const p of products) {
    const list = byCat.get(p.categoryId) ?? [];
    list.push(p);
    byCat.set(p.categoryId, list);
  }

  if (
    !canPublishBrandHub({
      productCount: products.length,
      categoryCount: byCat.size,
      familyCount: getProductFamilies().filter((f) => f.brandId === brand.id)
        .length,
      strengthSignalCount: products.filter(
        (p) => (p.strengths?.length ?? 0) > 0,
      ).length,
    })
  ) {
    return null;
  }

  const awardByProductId: Record<string, string> = {};
  for (const product of products) {
    for (const guide of getBestGuidesForProduct(product.id, options)) {
      for (const rec of guide.recommendations ?? []) {
        if (rec.productId !== product.id) continue;
        const label = getAwardLabel(rec.awardType, rec.badge);
        if (label && !awardByProductId[product.id]) {
          awardByProductId[product.id] = label;
        }
      }
    }
  }

  const heroProductEntity =
    (config.featuredProductId
      ? getProductById(config.featuredProductId, options)
      : undefined) ??
    [...featureable].sort(
      (a, b) =>
        (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0),
    )[0];
  const heroCandidate =
    heroProductEntity && listableProduct(heroProductEntity)
      ? heroProductEntity
      : [...featureable].find(listableProduct);

  const heroProduct =
    heroCandidate && canFeatureProduct(heroCandidate)
      ? toProductCard(
          heroCandidate,
          brand.name,
          awardByProductId[heroCandidate.id] ?? "Featured",
          region,
          options,
        )
      : undefined;

  const categories = [...byCat.entries()]
    .map(([categoryId, list]) => {
      const cat = getCategoryById(categoryId, options);
      if (!cat) return null;
      const imgProduct = list.find(canFeatureProduct);
      return {
        id: cat.id,
        name: cat.name,
        count: list.length,
        href: categoryHref(categoryId, brand.slug, options),
        image: imgProduct ? mediaOf(imgProduct) : undefined,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .sort((a, b) => b.count - a.count);

  const allFamilies = getProductFamilies().filter((f) => f.brandId === brand.id);
  const orderedFamilies = config.familyIds?.length
    ? config.familyIds
        .map((id) => allFamilies.find((f) => f.id === id))
        .filter((f): f is NonNullable<typeof f> => Boolean(f))
    : allFamilies;

  const familiesRaw = orderedFamilies
    .map((fam) => {
      const current =
        fam.productIds
          .map((id) => getProductById(id, options))
          .find(
            (p) =>
              p && canFeatureProduct(p) && p.lifecycleStatus === "current",
          ) ??
        fam.productIds
          .map((id) => getProductById(id, options))
          .find((p) => p && canFeatureProduct(p));
      if (!current) return null;
      return fam;
    })
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const editorial = buildBrandHubEditorial({
    brand,
    products,
    families: familiesRaw,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.count,
    })),
    editorialSummary: config.editorialSummary,
    howLinesDiffer: config.howLinesDiffer,
    generationContext: config.generationContext,
    pillars: config.pillars,
    whyItems: config.whyItems,
  });

  if (!editorial.decisionDepthOk) {
    return null;
  }

  const mediaByProductId = new Map<string, BrandHubMedia | undefined>();
  for (const p of products) {
    mediaByProductId.set(p.id, mediaOf(p));
  }

  const families = editorial.familyEditorials.map((f) => ({
    id: f.id,
    name: f.name,
    description: [f.description, f.whoSuits, f.generationLabel]
      .filter(Boolean)
      .join(" "),
    href: f.currentProductId
      ? (() => {
          const product = getProductById(f.currentProductId, options);
          return product && listableProduct(product)
            ? `/products/${f.currentProductSlug}`
            : "#families";
        })()
      : `#families`,
    image: f.currentProductId
      ? mediaByProductId.get(f.currentProductId)
      : undefined,
    whoSuits: f.whoSuits,
    generationLabel: f.generationLabel,
  }));

  const featuredPool = (
    config.featuredCategoryId
      ? featureable.filter((p) => p.categoryId === config.featuredCategoryId)
      : featureable
  ).filter(listableProduct);

  // Prefer award diversity within category — not cross-category score ranking
  const featuredProducts = [...featuredPool]
    .sort((a, b) => {
      const life = (p: Product) =>
        p.lifecycleStatus === "current"
          ? 0
          : p.lifecycleStatus === "previous-generation"
            ? 1
            : 2;
      const ld = life(a) - life(b);
      if (ld !== 0) return ld;
      const awardA = awardByProductId[a.id] ? 0 : 1;
      const awardB = awardByProductId[b.id] ? 0 : 1;
      if (awardA !== awardB) return awardA - awardB;
      return (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0);
    })
    .slice(0, 5)
    .map((p) =>
      toProductCard(
        p,
        brand.name,
        awardByProductId[p.id] ?? p.shortDescription?.split(".")[0] ?? "Explore",
        region,
        options,
      ),
    );

  const brandProductIds = new Set(products.map((p) => p.id));
  const reviews = getReviews(options)
    .filter((r) => brandProductIds.has(r.productId))
    .filter((r) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "review", entity: r }, options),
      ),
    )
    .slice(0, 4)
    .map((r) => {
      const product = getProductById(r.productId, options);
      const score = product?.recommendationScore;
      const band = score !== undefined ? getScoreBand(score) : undefined;
      return {
        id: r.id,
        title: r.title,
        productName: product?.fullName ?? "Product review",
        href: `/reviews/${r.slug}`,
        score: score !== undefined ? score / 10 : undefined,
        scoreLabel: band?.label,
        verdict: r.summary || r.verdict,
        dateLabel: r.publishedAt
          ? new Date(r.publishedAt).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })
          : undefined,
      };
    });

  const comparisonCards: BrandHubLinkCard[] = [];
  const seenCmp = new Set<string>();
  for (const p of products) {
    for (const cmp of getComparisonsForProduct(p.id, options)) {
      if (seenCmp.has(cmp.id) || comparisonCards.length >= 4) continue;
      if (
        !shouldPromotePublicly(
          getLaunchEligibility({ kind: "comparison", entity: cmp }, options),
        )
      ) {
        continue;
      }
      seenCmp.add(cmp.id);
      comparisonCards.push({
        id: cmp.id,
        title: cmp.title,
        description: clipText(cmp.summary || cmp.shortDescription || "", 120),
        href: `/compare/${cmp.slug}`,
        meta: "Comparison",
      });
    }
    if (comparisonCards.length >= 4) break;
  }

  const bestCards: BrandHubLinkCard[] = [];
  const seenBest = new Set<string>();
  for (const p of products) {
    for (const guide of getBestGuidesForProduct(p.id, options)) {
      if (
        !shouldPromotePublicly(
          getLaunchEligibility({ kind: "best-guide", entity: guide }, options),
        )
      ) {
        continue;
      }
      for (const rec of guide.recommendations ?? []) {
        if (rec.productId !== p.id) continue;
        const key = `${guide.id}-${p.id}`;
        if (seenBest.has(key) || bestCards.length >= 4) continue;
        seenBest.add(key);
        const award = getAwardLabel(rec.awardType, rec.badge);
        bestCards.push({
          id: key,
          title: guide.title,
          description: `${p.fullName}${award ? ` — ${award}` : ""}`,
          href: `/best/${guide.slug}`,
          meta: award ?? "Best guide",
        });
      }
      if (bestCards.length >= 4) break;
    }
    if (bestCards.length >= 4) break;
  }

  const guideSlugList = [
    ...new Set([...(config.guideSlugs ?? []), ...editorial.guideSlugs]),
  ].slice(0, 3);
  const guides = guideSlugList
    .map((slug) => getBuyingGuideBySlug(slug, options))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .filter((g) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, options),
      ),
    )
    .slice(0, 3)
    .map((g) => ({
      id: g.id,
      title: g.title,
      description: g.shortDescription ?? g.subtitle ?? "",
      href: `/guides/${g.slug}`,
      imageSrc: resolveGuideImage(g).src,
    }));

  const currentCount = products.filter(
    (p) => p.lifecycleStatus === "current",
  ).length;

  const overviewMetrics = [
    {
      id: "products",
      value: String(products.length),
      label: "Products on Kitletics",
    },
    {
      id: "categories",
      value: String(categories.length),
      label: "Categories",
    },
    {
      id: "current",
      value: String(currentCount || products.length),
      label: "Current generation",
    },
  ];

  const aboutMetrics = [
    ...overviewMetrics,
    ...(families.length > 0
      ? [
          {
            id: "families",
            value: String(families.length),
            label: "Product families",
          },
        ]
      : []),
  ];

  const localNav = [
    { id: "overview", label: "Overview", href: "#overview" },
    ...categories.slice(0, 4).map((c) => ({
      id: c.id,
      label: c.name,
      href: c.href,
    })),
    ...(families.length > 0
      ? [{ id: "families", label: "Families", href: "#families" }]
      : []),
    ...(config.technologies && config.technologies.length > 0
      ? [{ id: "technology", label: "Technology", href: "#technology" }]
      : []),
    ...(reviews.length > 0
      ? [{ id: "reviews", label: "Reviews", href: "#reviews" }]
      : []),
    ...(comparisonCards.length > 0
      ? [{ id: "comparisons", label: "Comparisons", href: "#comparisons" }]
      : []),
    ...(bestCards.length > 0
      ? [{ id: "best", label: "Best guides", href: "#best-appearances" }]
      : []),
    ...(guides.length > 0
      ? [{ id: "guides", label: "Guides", href: "#guides" }]
      : []),
  ];

  const pillars = editorial.pillars;

  const allProductsHref =
    featuredProducts.length > 0 && config.featuredCategoryId
      ? categoryHref(config.featuredCategoryId, brand.slug, options)
      : `/search?q=${encodeURIComponent(brand.name)}`;

  const audienceSet = new Set<AudienceFit>();
  for (const p of products) {
    for (const v of getVariantsForProduct(p.id)) {
      audienceSet.add(v.audience);
    }
  }
  const runningShoeProducts = products.filter(
    (p) => p.categoryId === "cat-running-shoes",
  );
  const fitChips =
    runningShoeProducts.length >= 2 && audienceSet.size > 0
      ? [
          {
            label: "All sizing",
            href: `/running/shoes?brand=${encodeURIComponent(brand.slug)}`,
          },
          ...(["men", "women", "unisex"] as AudienceFit[])
            .filter((a) => audienceSet.has(a))
            .map((a) => ({
              label:
                a === "men"
                  ? "Men’s sizing"
                  : a === "women"
                    ? "Women’s sizing"
                    : "Unisex sizing",
              href: `/running/shoes?brand=${encodeURIComponent(brand.slug)}&gender=${a}`,
            })),
        ]
      : undefined;

  return {
    brand: {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      summary: editorial.summary,
      logoSrc: brand.logo,
      foundedYear: brand.foundedYear,
      originCity: brand.originCity,
      country: brand.country,
      homepage: brand.homepage,
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Brands", href: "/brands" },
      { label: brand.name },
    ],
    pillars,
    heroProduct,
    overview: {
      mode: "factual",
      metrics: overviewMetrics,
      blurb: editorial.overviewBlurb,
      ctaLabel: `Explore ${brand.name} products`,
      ctaHref: allProductsHref,
    },
    localNav,
    about: {
      title: `${brand.name} buying map`,
      body: editorial.aboutBody,
      metrics: aboutMetrics,
      howLinesDiffer: editorial.howLinesDiffer,
      generationContext: editorial.generationContext,
    },
    products: {
      title: `Kitletics picks from ${brand.name}`,
      href: allProductsHref,
      items: featuredProducts,
      fitChips,
    },
    families: {
      title: `${brand.name} families`,
      items: families,
    },
    technologies: {
      title: `${brand.name} technologies`,
      items: config.technologies ?? [],
    },
    reviews: {
      title: `${brand.name} reviews on Kitletics`,
      href: `/reviews?q=${encodeURIComponent(brand.name)}`,
      items: reviews,
    },
    comparisons: {
      title: `${brand.name} comparisons`,
      items: comparisonCards,
    },
    bestAppearances: {
      title: `${brand.name} in Best guides`,
      items: bestCards,
    },
    categories: {
      title: `${brand.name} categories`,
      href: allProductsHref,
      items: categories,
    },
    knownFor: {
      title: config.whyTitle ?? `What ${brand.name} is known for on Kitletics`,
      items: editorial.whyItems,
    },
    guides: {
      title: `${brand.name} guides`,
      href: "/guides",
      items: guides,
    },
    officialSite: brand.homepage
      ? {
          title: `Official ${brand.name} website`,
          description: `You'll leave Kitletics to visit the official ${brand.name} website.`,
          href: brand.homepage,
          ctaLabel: `Visit ${brand.name} →`,
        }
      : undefined,
    trust: [
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
        description: "Commission never ranks Products.",
        icon: "Sparkles",
      },
      {
        title: "Find what fits you",
        description: "Finders and guides for real decisions.",
        icon: "Target",
      },
    ],
    region,
    publishedProductCount: products.length,
  };
}

function clipText(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Alias matching task naming */
export const getBrandHubData = getBrandHubPageData;
