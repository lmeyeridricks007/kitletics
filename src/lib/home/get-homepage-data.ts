import type { RegionCode } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getBestGuideBySlug,
  getBuyingGuideBySlug,
  getBuyingGuides,
  getComparisonBySlug,
  getComparisons,
  getBrandById,
  getProductById,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getToolBySlug,
} from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getScoreBand, formatVerifiedDate } from "@/lib/product/score";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
  isLaunchListable,
} from "@/domain/launch";
import type {
  HomepageBestSection,
  HomepageComparisonRow,
  HomepageData,
  HomepageProductCard,
} from "@/lib/home/types";

/** Curated homepage best strips — Day-1 indexable Running only. */
const BEST_STRIP_SLUGS: { slug: string; eyebrow: string }[] = [
  { slug: "running-shoes", eyebrow: "Running" },
  { slug: "running-watches", eyebrow: "GPS watches" },
  { slug: "trail-running-shoes", eyebrow: "Trail" },
  { slug: "running-headphones", eyebrow: "Running gear" },
];

const FEATURED_GUIDE_CANDIDATES: {
  slug: string;
  description: string;
  imageSrc: string;
}[] = [
  {
    slug: "how-to-choose-running-watch",
    description:
      "Battery, maps, HR accuracy and when a Forerunner beats a Fenix — or a phone.",
    imageSrc: "/images/home/guide-how-to-choose.jpg",
  },
  {
    slug: "how-to-choose-running-shoes",
    description:
      "Everything you need to know about fit, cushion, use case and more.",
    imageSrc: "/images/home/guide-running-shoes.jpg",
  },
];

/** Prefer a mixed vertical set over the default shoe-only comparison head. */
const FEATURED_COMPARISON_SLUGS = [
  "garmin-forerunner-970-vs-coros-pace-pro",
  "asics-novablast-6-vs-brooks-ghost-18",
  "garmin-hrm-pro-plus-vs-polar-h10",
  "salomon-adv-skin-12-vs-nathan-vaporair-2",
];

const LATEST_GUIDE_SLUGS = [
  "how-to-choose-running-watch",
  "how-to-choose-running-shoes",
  "open-ear-vs-in-ear-running-headphones",
];

const GUIDE_IMAGES: Record<string, string> = {
  "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
  "how-to-choose-running-watch": "/images/home/guide-how-to-choose.jpg",
  "how-to-choose-a-padel-racket": "/images/home/guide-tennis.jpg",
  "how-to-build-a-home-gym": "/images/home/guide-home-gym.jpg",
  "how-to-choose-adjustable-dumbbells": "/images/home/guide-home-gym.jpg",
  "open-ear-vs-in-ear-running-headphones":
    "/images/home/guide-how-to-choose.jpg",
};

const JOURNAL_IMAGES = [
  "/images/home/guide-tennis.jpg",
  "/images/home/guide-how-to-choose.jpg",
  "/images/home/guide-home-gym.jpg",
];

function estimateReadingMinutes(sections: { body: string }[]): number {
  const words = sections.reduce(
    (sum, s) => sum + s.body.split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(3, Math.round(words / 180) || 4);
}

function verifiedYear(iso?: string): number {
  if (!iso) return new Date().getFullYear();
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

function productCard(
  productId: string,
  region: RegionCode,
  options: PublishResolverOptions | undefined,
  badge: string,
): HomepageProductCard | null {
  const product = getProductById(productId, options);
  if (!product || product.status !== "published") return null;
  if (
    !isLaunchListable(
      getLaunchEligibility({ kind: "product", entity: product }, options),
    )
  ) {
    return null;
  }
  const brand = getBrandById(product.brandId, options);
  const media = getPrimaryProductMedia(product);
  const score = product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const lowest = getLowestOfferPrice(product.id, region, options);
  const offerCount = getOffersForProductInRegion(product.id, region).length;

  return {
    id: product.id,
    slug: product.slug,
    brandName: brand?.name ?? "",
    name: product.name,
    fullName: product.fullName,
    href: `/products/${product.slug}`,
    badge,
    image: media
      ? { src: media.src, alt: media.alt ?? product.fullName }
      : undefined,
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: lowest
      ? { amount: lowest.price, currency: lowest.currency }
      : undefined,
    offerCount,
  };
}

function buildBestSection(
  guideSlug: string,
  eyebrow: string,
  region: RegionCode,
  options: PublishResolverOptions | undefined,
): HomepageBestSection | null {
  const guide = getBestGuideBySlug(guideSlug, options);
  if (!guide || guide.status !== "published") return null;
  if (
    !shouldPromotePublicly(
      getLaunchEligibility({ kind: "best-guide", entity: guide }, options),
    )
  ) {
    return null;
  }

  const products: HomepageProductCard[] = [];
  const used = new Set<string>();

  for (const rec of guide.recommendations ?? []) {
    if (products.length >= 5) break;
    const card = productCard(
      rec.productId,
      region,
      options,
      (rec.badge ?? `Rank #${rec.rank}`).toUpperCase(),
    );
    if (!card) continue;
    products.push(card);
    used.add(card.id);
  }

  for (const productId of guide.comparisonProductIds ?? []) {
    if (products.length >= 5) break;
    if (used.has(productId)) continue;
    const card = productCard(productId, region, options, "EDITOR PICK");
    if (!card) continue;
    products.push(card);
    used.add(card.id);
  }

  if (products.length < 3) return null;

  const year = verifiedYear(guide.lastVerifiedAt ?? guide.updatedAt);
  const guideTitle = guide.title.toUpperCase();
  const titleHasYear = guideTitle.includes(String(year));

  return {
    id: guide.id,
    eyebrow,
    title: titleHasYear ? guideTitle : `${guideTitle} ${year}`,
    href: `/best/${guide.slug}`,
    products,
  };
}

function buildComparisonRow(
  slug: string,
  options: PublishResolverOptions | undefined,
): HomepageComparisonRow | null {
  const cmp = getComparisonBySlug(slug, options);
  if (!cmp) return null;
  if (
    !shouldPromotePublicly(
      getLaunchEligibility({ kind: "comparison", entity: cmp }, options),
    )
  ) {
    return null;
  }
  const products = cmp.productIds
    .slice(0, 2)
    .map((id) => {
      const product = getProductById(id, options);
      if (!product || product.status !== "published") return null;
      const brand = getBrandById(product.brandId, options);
      const media = getPrimaryProductMedia(product);
      return {
        id: product.id,
        name: product.fullName,
        brandName: brand?.name,
        image: media
          ? { src: media.src, alt: media.alt ?? product.fullName }
          : undefined,
        href: `/products/${product.slug}`,
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length < 2) return null;

  return {
    id: cmp.id,
    slug: cmp.slug,
    href: `/compare/${cmp.slug}`,
    productA: products[0]!,
    productB: products[1]!,
  };
}

export function getHomepageData(input?: {
  region?: RegionCode;
  preview?: boolean;
}): HomepageData {
  const region = input?.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input?.preview
    ? { isDev: true }
    : undefined;

  const bestSections = BEST_STRIP_SLUGS.map(({ slug, eyebrow }) =>
    buildBestSection(slug, eyebrow, region, options),
  ).filter((s): s is HomepageBestSection => Boolean(s));

  const featuredGuideMeta =
    FEATURED_GUIDE_CANDIDATES.map((c) => {
      const guide = getBuyingGuideBySlug(c.slug, options);
      if (!guide || guide.status !== "published") return null;
      if (
        !shouldPromotePublicly(
          getLaunchEligibility(
            { kind: "buying-guide", entity: guide },
            options,
          ),
        )
      ) {
        return null;
      }
      return { guide, ...c };
    }).find(Boolean) ?? null;

  const comparisonItems: HomepageComparisonRow[] = [];
  for (const slug of FEATURED_COMPARISON_SLUGS) {
    if (comparisonItems.length >= 3) break;
    const row = buildComparisonRow(slug, options);
    if (row) comparisonItems.push(row);
  }
  if (comparisonItems.length < 3) {
    const used = new Set(comparisonItems.map((c) => c.slug));
    for (const cmp of getComparisons(options)) {
      if (comparisonItems.length >= 3) break;
      if (used.has(cmp.slug)) continue;
      const row = buildComparisonRow(cmp.slug, options);
      if (row) {
        comparisonItems.push(row);
        used.add(row.slug);
      }
    }
  }

  const buyingGuides = getBuyingGuides(options);
  const latestFromSlugs = LATEST_GUIDE_SLUGS.map((slug) =>
    getBuyingGuideBySlug(slug, options),
  ).filter(
    (g): g is NonNullable<typeof g> =>
      g != null &&
      g.status === "published" &&
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, options),
      ),
  );
  const latestSource =
    latestFromSlugs.length >= 3
      ? latestFromSlugs
      : [
          ...latestFromSlugs,
          ...buyingGuides.filter(
            (g) =>
              g.status === "published" &&
              shouldPromotePublicly(
                getLaunchEligibility(
                  { kind: "buying-guide", entity: g },
                  options,
                ),
              ),
          ),
        ];

  const seenGuide = new Set<string>();
  const latestGuides = latestSource
    .filter((g) => {
      if (seenGuide.has(g.id)) return false;
      seenGuide.add(g.id);
      return true;
    })
    .slice(0, 3)
    .map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      href: `/guides/${g.slug}`,
      updatedLabel: g.updatedAt
        ? `Updated ${formatVerifiedDate(g.updatedAt)}`
        : undefined,
      imageSrc: GUIDE_IMAGES[g.slug] ?? "/images/home/guide-how-to-choose.jpg",
    }));

  const journalItems = latestGuides.map((g, i) => {
    const full = getBuyingGuideBySlug(g.slug, options);
    return {
      id: `journal-${g.id}`,
      title: g.title,
      href: g.href,
      dateLabel: full?.updatedAt
        ? new Date(full.updatedAt).toLocaleDateString("en-GB", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
      readingTime: `${estimateReadingMinutes(full?.sections ?? [])} min read`,
      imageSrc: JOURNAL_IMAGES[i] ?? JOURNAL_IMAGES[0]!,
    };
  });

  const shoeFinder = getToolBySlug("running-shoe-finder", options);

  return {
    region,
    hero: {
      headlineLead: "FIND THE RIGHT",
      headlineAccent: "GEAR. PLAY BETTER.",
      accentPhrase: "PLAY BETTER.",
      description:
        "Unbiased reviews, smart tools and real-time prices across running, racket sports, fitness and more.",
      primaryCta: { label: "FIND YOUR GEAR", href: "/tools?type=finder" },
      secondaryCta: { label: "BROWSE ALL SPORTS", href: "/gear" },
      imageSrc: "/images/home/hero-gear-composite.png",
      imageAlt:
        "Sports gear collage with racket, performance shoe and kettlebell on a training surface",
    },
    finder: {
      title: "Find your perfect match",
      footnotePrefix: "Not sure yet? Start with our",
      footnoteLinkLabel: "Running Shoe Finder",
      footnoteHref: "/tools/running-shoe-finder",
      ctaLabel: "FIND MY SHOE",
      ctaHref: "/tools/running-shoe-finder",
      shoeFinderHref: shoeFinder
        ? `/tools/${shoeFinder.slug}`
        : "/tools?type=finder",
    },
    bestSections,
    bestSection: bestSections[0],
    featuredGuide: featuredGuideMeta
      ? {
          eyebrow: "HOW TO CHOOSE",
          title: featuredGuideMeta.guide.title,
          description: featuredGuideMeta.description,
          href: `/guides/${featuredGuideMeta.guide.slug}`,
          ctaLabel: "READ THE GUIDE",
          imageSrc: featuredGuideMeta.imageSrc,
        }
      : undefined,
    comparisons: {
      title: "FEATURED COMPARISONS",
      href: "/compare",
      items: comparisonItems,
    },
    latestGuides,
    journalItems,
  };
}
