import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  assembleCategoryPage,
  type AssembledCategoryPage,
} from "@/lib/catalog/assemble";
import {
  getBestGuideBySlug,
  getBrandById,
  getBuyingGuideBySlug,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getProductById,
  getRecommendationsForUseCase,
  getToolBySlug,
} from "@/repositories";
import { getScoreBand } from "@/lib/product/score";
import { getAwardLabel } from "@/lib/best/awards";
import { getPrimaryProductMedia, canFeatureProduct } from "@/lib/product/media";
import {
  runningShoeFinderDefinition,
  withRegionalBudgetOptions,
} from "@/domain/finders/configs/running-shoe-finder";

export interface ShoesCategoryProductCard {
  id: string;
  slug: string;
  brandName: string;
  name: string;
  fullName: string;
  href: string;
  badge: string;
  image?: { src: string; alt: string };
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
  bestFor?: string;
}

export interface ShoesCategoryPageData extends AssembledCategoryPage {
  mockup: true;
  heroProducts: { src: string; alt: string; href: string }[];
  typeNav: {
    title: string;
    items: { id: string; label: string; href: string }[];
  };
  bestSection?: {
    title: string;
    href: string;
    products: ShoesCategoryProductCard[];
  };
  finder: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    footnoteLabel: string;
    footnoteHref: string;
    fields: {
      name: string;
      label: string;
      value: string;
      options: { value: string; label: string }[];
    }[];
  };
  howYouRun: {
    title: string;
    items: {
      id: string;
      label: string;
      description: string;
      href: string;
      image?: {
        src: string;
        alt: string;
        presentation?: "cover" | "contain";
      };
    }[];
    chips: { id: string; label: string; href: string }[];
  };
  guideBlock?: {
    title: string;
    description: string;
    href: string;
    imageSrc: string;
  };
  featuredComparisons: {
    title: string;
    href: string;
    items: {
      id: string;
      href: string;
      productA: { name: string; image?: { src: string; alt: string } };
      productB: { name: string; image?: { src: string; alt: string } };
    }[];
  };
  toolsSection: {
    title: string;
    items: { id: string; title: string; description: string; href: string }[];
  };
  brandStrip: {
    title: string;
    href: string;
    items: { id: string; name: string; href: string; logo?: string }[];
  };
}

function mapCard(
  productId: string,
  badge: string,
  region: RegionCode,
  options?: PublishResolverOptions,
  bestFor?: string,
): ShoesCategoryProductCard | null {
  const product = getProductById(productId, options);
  if (!product || !canFeatureProduct(product)) return null;
  const brand = getBrandById(product.brandId, options);
  const score = product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const lowest = getLowestOfferPrice(product.id, region, options);
  const offerCount = getOffersForProductInRegion(product.id, region).length;
  const media = getPrimaryProductMedia(product);
  return {
    id: product.id,
    slug: product.slug,
    brandName: brand?.name ?? "",
    name: product.name,
    fullName: product.fullName,
    href: `/products/${product.slug}`,
    badge: badge.toUpperCase(),
    image: media ? { src: media.src, alt: media.alt } : undefined,
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: lowest
      ? { amount: lowest.price, currency: lowest.currency }
      : undefined,
    offerCount,
    bestFor,
  };
}

const TYPE_NAV = [
  { id: "daily", label: "Daily Trainers", href: "/running/shoes/daily-trainers" },
  { id: "cushion", label: "Max Cushion", href: "/running/shoes?type=max-cushion" },
  { id: "tempo", label: "Tempo", href: "/running/shoes?type=tempo" },
  { id: "race", label: "Race", href: "/running/shoes/race" },
  { id: "carbon", label: "Carbon Plate", href: "/running/shoes?type=carbon-plate" },
  { id: "stability", label: "Stability", href: "/running/shoes/stability" },
  { id: "trail", label: "Trail", href: "/running/shoes/trail" },
  { id: "wide", label: "Wide", href: "/running/shoes?width=wide" },
] as const;

/** Editorial / atmospheric images for use-case cards (not product placeholders).
 * Sources: Unsplash (photo credits in public/images/running/category/ATTRIBUTION.txt).
 */
const USE_CASE_IMAGES: Record<
  string,
  { src: string; alt: string; presentation?: "cover" | "contain" }
> = {
  daily: {
    src: "/images/running/category/use-daily.jpg",
    alt: "Runner on pavement during a daily training run",
    presentation: "cover",
  },
  long: {
    src: "/images/running/category/use-long.jpg",
    alt: "Runner covering long-distance road miles",
    presentation: "cover",
  },
  tempo: {
    src: "/images/running/category/use-tempo.jpg",
    alt: "Faster tempo session on the road",
    presentation: "cover",
  },
  race: {
    src: "/images/running/category/use-race.jpg",
    alt: "Race day running on asphalt",
    presentation: "cover",
  },
  recovery: {
    src: "/images/running/category/use-recovery.jpg",
    alt: "Easy recovery run",
    presentation: "cover",
  },
  trail: {
    src: "/images/running/category/use-trail.jpg",
    alt: "Trail running on dirt path",
    presentation: "cover",
  },
};

const HOW_YOU_RUN = [
  {
    id: "daily",
    label: "Daily Training",
    description: "Reliable everyday trainers",
    href: "/running/shoes/daily-trainers?training=easy&distance=daily",
    useCaseId: "uc-daily-training",
  },
  {
    id: "long",
    label: "Long Runs",
    description: "Protective high-mileage miles",
    href: "/running/shoes?training=long",
    useCaseId: "uc-long-runs",
  },
  {
    id: "tempo",
    label: "Tempo & Intervals",
    description: "Faster sessions that still recover",
    href: "/running/shoes?type=tempo&training=tempo",
    useCaseId: "uc-tempo-runs",
  },
  {
    id: "race",
    label: "Race Day",
    description: "Light, propulsive race shoes",
    href: "/running/shoes/race?distance=marathon",
    useCaseId: "uc-marathon",
  },
  {
    id: "recovery",
    label: "Recovery",
    description: "Soft easy-day protection",
    href: "/running/shoes?training=recovery",
    useCaseId: "uc-recovery-runs",
  },
  {
    id: "trail",
    label: "Trail Running",
    description: "Grip and protection off-road",
    href: "/running/shoes/trail",
    useCaseId: "uc-trail-training",
  },
] as const;

const CHIPS = [
  { id: "easy", label: "Easy Runs", href: "/running/shoes?training=easy" },
  { id: "5k", label: "5K", href: "/running/shoes/race?distance=5k" },
  { id: "10k", label: "10K", href: "/running/shoes/race?distance=10k" },
  { id: "half", label: "Half Marathon", href: "/running/shoes/race?distance=half" },
  { id: "marathon", label: "Marathon", href: "/running/shoes/race?distance=marathon" },
  { id: "treadmill", label: "Treadmill", href: "/running/shoes?terrain=treadmill" },
  { id: "beginner", label: "Beginner", href: "/running/shoes?usecase=beginners" },
  { id: "wide", label: "Wide Feet", href: "/running/shoes?width=wide" },
  {
    id: "heavy",
    label: "Heavier Runners",
    href: "/running/shoes/heavy-runners",
  },
] as const;

function resolveUseCaseImage(
  id: string,
  useCaseId: string,
  options?: PublishResolverOptions,
):
  | { src: string; alt: string; presentation?: "cover" | "contain" }
  | undefined {
  const editorial = USE_CASE_IMAGES[id];
  // Prefer editorial when file exists at runtime via public path; fall back to product media.
  // Existence is checked by the page using product media when editorial path may 404 —
  // we always attach editorial paths; Next serves them if present.
  if (editorial) return editorial;

  const recs = getRecommendationsForUseCase(useCaseId);
  const featuredId = recs[0]?.productId;
  const product = featuredId ? getProductById(featuredId, options) : undefined;
  const media = product ? getPrimaryProductMedia(product) : undefined;
  if (media) {
    return { src: media.src, alt: media.alt, presentation: "contain" };
  }
  return undefined;
}

export function getRunningShoesCategoryPage(input: {
  searchParams?: Record<string, string | string[] | undefined>;
  region?: RegionCode;
  preview?: boolean;
}): ShoesCategoryPageData | null {
  const region = input.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;

  const base = assembleCategoryPage({
    sportSlug: "running",
    pathSegment: "shoes",
    searchParams: input.searchParams,
    region,
    options,
  });
  if (!base) return null;

  const bestGuide = getBestGuideBySlug("running-shoes", options);
  const bestProducts = (bestGuide?.recommendations ?? [])
    .slice(0, 8)
    .map((rec) =>
      mapCard(
        rec.productId,
        getAwardLabel(rec.awardType) ?? rec.badge ?? `Rank #${rec.rank}`,
        region,
        options,
        rec.summary,
      ),
    )
    .filter((p): p is ShoesCategoryProductCard => Boolean(p))
    .slice(0, 5);

  // Hero composition: daily / cushion / race from best picks + catalog fallbacks
  const heroProducts: ShoesCategoryPageData["heroProducts"] = [];
  for (const card of bestProducts) {
    if (card.image && heroProducts.length < 3) {
      heroProducts.push({
        src: card.image.src,
        alt: card.image.alt,
        href: card.href,
      });
    }
  }
  if (heroProducts.length < 3) {
    for (const row of base.catalog.products) {
      if (heroProducts.length >= 3) break;
      if (!row.image) continue;
      if (heroProducts.some((h) => h.src === row.image!.src)) continue;
      heroProducts.push({
        src: row.image.src,
        alt: row.image.alt,
        href: `/products/${row.slug}`,
      });
    }
  }

  const year = bestGuide?.lastVerifiedAt
    ? new Date(bestGuide.lastVerifiedAt).getFullYear()
    : new Date().getFullYear();

  const finderDef = withRegionalBudgetOptions(
    runningShoeFinderDefinition,
    region,
  );
  const experienceQ = finderDef.questions.find((q) => q.key === "experience");
  const primaryUseQ = finderDef.questions.find((q) => q.key === "primaryUse");
  const cushionQ = finderDef.questions.find((q) => q.key === "cushioning");
  const budgetQ = finderDef.questions.find((q) => q.key === "budget");

  const howYouRunItems = HOW_YOU_RUN.map((item) => {
    const image = resolveUseCaseImage(item.id, item.useCaseId, options);
    // If editorial file may be missing, fall back to authentic product media
    const recs = getRecommendationsForUseCase(item.useCaseId);
    const featuredId = recs[0]?.productId;
    const product = featuredId
      ? getProductById(featuredId, options)
      : undefined;
    const productMedia = product ? getPrimaryProductMedia(product) : undefined;

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      href: item.href,
      image: image ?? (productMedia
        ? {
            src: productMedia.src,
            alt: productMedia.alt,
            presentation: "contain" as const,
          }
        : undefined),
    };
  });

  const guide =
    getBuyingGuideBySlug("how-to-choose-running-shoes", options) ??
    base.buyingGuides[0];

  const featuredComparisons = base.comparisons.slice(0, 5).map((c) => {
    const a = getProductById(c.productIds[0], options);
    const b = getProductById(c.productIds[1], options);
    const mediaA = a ? getPrimaryProductMedia(a) : undefined;
    const mediaB = b ? getPrimaryProductMedia(b) : undefined;
    return {
      id: c.id,
      href: `/compare/${c.slug}`,
      productA: {
        name: a?.name ?? base.comparisonNames[c.id]?.[0] ?? "Shoe A",
        image: mediaA ? { src: mediaA.src, alt: mediaA.alt } : undefined,
      },
      productB: {
        name: b?.name ?? base.comparisonNames[c.id]?.[1] ?? "Shoe B",
        image: mediaB ? { src: mediaB.src, alt: mediaB.alt } : undefined,
      },
    };
  });

  const toolDefs = [
    {
      slug: "running-shoe-finder",
      title: "Running Shoe Finder",
      description: "Get matches in 2 minutes",
    },
    {
      slug: "shoe-rotation-planner",
      title: "Shoe Rotation Planner",
      description: "Build a smarter rotation",
    },
    {
      slug: "compare",
      title: "Compare Shoes",
      description: "Compare up to 4 shoes",
      href: "/compare?category=running-shoes",
    },
  ];

  const toolsSection = {
    title: "RUNNING SHOE TOOLS",
    items: toolDefs.map((t) => {
      if (t.href) {
        return {
          id: t.slug,
          title: t.title,
          description: t.description,
          href: t.href,
        };
      }
      const tool = getToolBySlug(t.slug, options);
      return {
        id: t.slug,
        title: t.title,
        description: t.description,
        href: tool ? `/tools/${tool.slug}` : `/tools/${t.slug}`,
      };
    }),
  };

  return {
    ...base,
    mockup: true,
    heroProducts,
    typeNav: {
      title: "SHOP RUNNING SHOES",
      items: TYPE_NAV.map((t) => ({ ...t })),
    },
    bestSection:
      bestProducts.length > 0
        ? {
            title: `BEST RUNNING SHOES ${year}`,
            href: "/best/running-shoes",
            products: bestProducts,
          }
        : undefined,
    finder: {
      title: "FIND YOUR PERFECT RUNNING SHOE",
      description:
        "Answer a few questions and we'll match you with shoes for your running, goals and preferences.",
      ctaLabel: "FIND MY SHOES",
      ctaHref: "/tools/running-shoe-finder",
      footnoteLabel: "full Running Shoe Finder",
      footnoteHref: "/tools/running-shoe-finder",
      fields: [
        {
          name: "experience",
          label: "Experience",
          value: experienceQ?.options?.[1]?.label ?? "Intermediate",
          options: (experienceQ?.options ?? []).map((o) => ({
            value: String("value" in o && o.value != null ? o.value : o.id),
            label: o.label,
          })),
        },
        {
          name: "primaryUse",
          label: "Main Use",
          value: primaryUseQ?.options?.[0]?.label ?? "Daily Training",
          options: (primaryUseQ?.options ?? []).map((o) => ({
            value: String("value" in o && o.value != null ? o.value : o.id),
            label: o.label,
          })),
        },
        {
          name: "cushioning",
          label: "Cushion",
          value: cushionQ?.options?.[1]?.label ?? "Balanced",
          options: (cushionQ?.options ?? []).map((o) => ({
            value: String("value" in o && o.value != null ? o.value : o.id),
            label: o.label,
          })),
        },
        {
          name: "budget",
          label: "Budget",
          value: budgetQ?.options?.[1]?.label ?? "€100 – €180",
          options: (budgetQ?.options ?? []).map((o) => ({
            value: String("value" in o && o.value != null ? o.value : o.id),
            label: o.label,
          })),
        },
      ],
    },
    howYouRun: {
      title: "SHOP BY HOW YOU RUN",
      items: howYouRunItems,
      chips: CHIPS.map((c) => ({ ...c })),
    },
    guideBlock: guide
      ? {
          title: guide.title.startsWith("How to Choose")
            ? guide.title
            : "How to Choose Running Shoes",
          description:
            "Everything you need to know about cushion, fit, drop, use case and more.",
          href: `/guides/${guide.slug}`,
          imageSrc: "/images/home/guide-running-shoes.jpg",
        }
      : undefined,
    featuredComparisons: {
      title: "FEATURED COMPARISONS",
      href: "/compare?category=running-shoes",
      items: featuredComparisons,
    },
    toolsSection,
    brandStrip: {
      title: "TOP RUNNING SHOE BRANDS",
      href: "/brands",
      items: base.brands.slice(0, 12).map(({ brand }) => ({
        id: brand.id,
        name: brand.name,
        href: `/brands/${brand.slug}`,
        logo: brand.logo,
      })),
    },
  };
}
