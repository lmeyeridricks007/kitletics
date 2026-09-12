import type { RegionCode } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getSportBySlug,
  getDisciplineBySlug,
  getBestGuideBySlug,
  getBuyingGuideBySlug,
  getBrandById,
  getProductById,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getToolBySlug,
} from "@/repositories";
import { getScoreBand } from "@/lib/product/score";
import { getAwardLabel } from "@/lib/best/awards";
import { getToolHref } from "@/lib/tools/href";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  getDisciplineHubConfig,
  hasMockupDisciplineHub,
} from "@/lib/discipline-hub/config";
import type { DisciplineHubPageData } from "@/lib/discipline-hub/types";

export { hasMockupDisciplineHub, getDisciplineHubConfig };

function productMatchesDiscipline(
  productId: string,
  disciplineId: string,
  categoryId: string,
  options?: PublishResolverOptions,
): boolean {
  const product = getProductById(productId, options);
  if (!product) return false;
  if (product.categoryId !== categoryId) return false;
  return product.disciplineIds.includes(disciplineId);
}

function mapProductCard(
  productId: string,
  role: string,
  region: RegionCode,
  options?: PublishResolverOptions,
) {
  const product = getProductById(productId, options);
  if (!product) return null;
  const brand = getBrandById(product.brandId, options);
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
    role,
    image: product.images[0]
      ? { src: product.images[0].src, alt: product.images[0].alt }
      : undefined,
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: lowest
      ? { amount: lowest.price, currency: lowest.currency }
      : undefined,
    offerCount,
  };
}

const TRUST = [
  {
    title: "Expert & Independent",
    description: "We don't sell gear. Advice is independent and structured.",
    icon: "BadgeCheck",
  },
  {
    title: "Always Up to Date",
    description: "Products, prices and releases are continually reviewed.",
    icon: "RefreshCw",
  },
  {
    title: "Real Prices",
    description: "Regional retailer offers with last-checked timestamps.",
    icon: "Database",
  },
  {
    title: "Find What Fits You",
    description: "Tools match gear to your sport, goals and budget.",
    icon: "Sparkles",
  },
  {
    title: "Built for athletes",
    description: "Decision hubs for disciplines — not generic shopping pages.",
    icon: "Target",
  },
] as const;

export function getDisciplineHubData(input: {
  sportSlug: string;
  disciplineSlug: string;
  region?: RegionCode;
  preview?: boolean;
}): DisciplineHubPageData | undefined {
  const config = getDisciplineHubConfig(input.sportSlug, input.disciplineSlug);
  if (!config) return undefined;

  const region = input.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;

  const sport = getSportBySlug(config.sportSlug, options);
  const discipline = getDisciplineBySlug(
    config.sportSlug,
    config.disciplineSlug,
    options,
  );
  if (!sport || !discipline) return undefined;

  const bestGuide = getBestGuideBySlug(config.bestGuideSlug, options);

  const featuredProducts = (bestGuide?.recommendations ?? [])
    .filter((rec) =>
      productMatchesDiscipline(
        rec.productId,
        config.disciplineId,
        config.primaryCategoryId,
        options,
      ),
    )
    .slice(0, 5)
    .map((rec) => {
      const role =
        getAwardLabel(rec.awardType, rec.badge) ??
        rec.summary?.split(".")[0] ??
        "Recommended";
      return mapProductCard(rec.productId, role, region, options);
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const tools = config.toolSlugs
    .map((slug) => getToolBySlug(slug, options))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .filter((t) => t.available)
    .map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.shortDescription ?? tool.description,
      href: getToolHref(tool),
      icon: tool.icon ?? "tool",
      available: tool.available,
    }));

  const guides = config.guideSlugs
    .map((slug) => getBuyingGuideBySlug(slug, options))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      title: g.title,
      description: g.shortDescription ?? g.subtitle ?? "",
      href: `/guides/${g.slug}`,
      imageSrc: resolveGuideImage(g).src,
    }));

  const productsSection =
    bestGuide && featuredProducts.length > 0
      ? {
          title: config.bestSectionTitle.toUpperCase(),
          href: `/best/${bestGuide.slug}`,
          viewAllLabel: `View all ${discipline.name.toLowerCase()} shoes →`,
          items: featuredProducts,
        }
      : featuredProducts.length > 0
        ? {
            title: `RECOMMENDED ${discipline.name.toUpperCase()} SHOES`,
            href: config.categoryBrowseHref,
            viewAllLabel: `Explore ${discipline.name.toLowerCase()} shoes →`,
            items: featuredProducts,
          }
        : undefined;

  const localNav = [
    { id: "overview", label: "Overview", href: "#overview" },
    { id: "training", label: "Training", href: "#training" },
    { id: "gear", label: "Gear", href: "#gear" },
    { id: "races", label: "Race day", href: "#races" },
    { id: "guides", label: "Guides", href: "#guides" },
    { id: "tools", label: "Tools", href: "#tools" },
    { id: "related", label: "Related", href: "#related" },
  ];

  return {
    sportSlug: sport.slug,
    disciplineSlug: discipline.slug,
    sportName: sport.name,
    disciplineName: discipline.name,
    region,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: sport.name, href: `/${sport.slug}` },
      { label: discipline.name },
    ],
    eyebrow: config.disciplineEyebrow.toUpperCase(),
    hero: {
      title: discipline.name,
      description: config.hero.description,
      imageSrc: config.hero.imageSrc,
      imageAlt: config.hero.imageAlt,
    },
    pillars: config.pillars,
    focusCard: {
      mode: "factual",
      title: `${discipline.name} at a glance`,
      bestFor: config.glance.bestFor,
      typicalTerrain: config.glance.typicalTerrain,
      keyGear: config.glance.keyGear,
      ctaLabel: config.glance.ctaLabel,
      ctaHref: config.glance.ctaHref,
    },
    localNav,
    why: config.why,
    goals: {
      title: "Common goals",
      items: config.goals,
      seeAllHref: config.categoryBrowseHref,
    },
    tools: {
      title: `${discipline.name} tools`.toUpperCase(),
      items: tools,
    },
    atAGlance: {
      title: "At a glance",
      metrics: [
        { label: "Primary surface", value: config.glance.typicalTerrain },
        {
          label: "Common race distances",
          value:
            config.disciplineSlug === "trail"
              ? "Trail races, ultras"
              : config.disciplineSlug === "racing"
                ? "5K – Marathon"
                : "5K, 10K, Half, Marathon",
        },
        { label: "Core gear categories", value: config.glance.keyGear },
        { label: "Tools available", value: String(tools.length) },
        { label: "Buying guides", value: String(guides.length) },
      ],
    },
    products: productsSection,
    raceDay: {
      title: "Race-day essentials",
      items: config.raceDayEssentials,
    },
    guides: {
      title: `${discipline.name} guides`.toUpperCase(),
      href: "/guides",
      items: guides,
    },
    related: {
      title: "Related disciplines",
      items: config.relatedDisciplines,
    },
    trust: [...TRUST],
    footer: config.footer,
  };
}
