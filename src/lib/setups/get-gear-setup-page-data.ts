import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { MediaAsset } from "@/domain/shared/types";
import type { Product, Brand } from "@/domain/products/types";
import type { ProductCategory, Sport } from "@/domain/sports/types";
import type {
  GearSetup,
  GearSetupItem,
  GearSetupItemImportance,
  Review,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import {
  getGearSetupBySlug,
  getGearSetupById,
  getProductById,
  getBrandById,
  getCategoryById,
  getSportById,
  getLowestOfferPrice,
  getBuyingGuideById,
  getBestGuideById,
  getToolBySlug,
} from "@/repositories";
import { getReviewByProduct } from "@/repositories/editorial";
import { getOffersForProduct } from "@/repositories/commerce";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getScoreBand } from "@/lib/product/score";
import { calculateSetupPrice } from "@/lib/setups/calculate-setup-price";
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { siteConfig } from "@/content/config";
import { promotableReviewSlug } from "@/domain/launch";

function resolveImportance(
  item: GearSetupItem,
): GearSetupItemImportance {
  if (item.importance) return item.importance;
  if (item.optional) return "optional";
  return "required";
}

function formatMonthYear(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function roleLabelFor(item: GearSetupItem): string {
  if (item.roleLabel) return item.roleLabel;
  const cleaned = item.role.replace(/^(Essential|Useful|Optional)\s*[·•-]\s*/i, "");
  return cleaned.toUpperCase();
}

export interface GearSetupPageItem {
  item: GearSetupItem;
  importance: GearSetupItemImportance;
  order: number;
  roleLabel: string;
  product: Product;
  brand?: Brand;
  category?: ProductCategory;
  media?: MediaAsset;
  score?: number;
  scoreLabel?: string;
  price?: { price: number; currency: string };
  offerCount: number;
  review?: Review;
  reviewSlug?: string;
  productHref: string;
  compareHref: string;
  alternativesHref: string;
  strengths: string[];
  rationale: string;
  whyNeeded?: string;
  systemRole?: string;
  tradeOffs?: string;
  canOmit?: string;
  cheaperAlternative?: string;
  upgradePath?: string;
  compatibilityNotes?: string;
  alternativeProducts: {
    product: Product;
    brand?: Brand;
    media?: MediaAsset;
    score?: number;
    scoreLabel?: string;
    price?: { price: number; currency: string };
    href: string;
  }[];
}

export interface GearSetupNextPageItem {
  product: Product;
  brand?: Brand;
  media?: MediaAsset;
  role: string;
  roleLabel: string;
  contextLabel?: string;
  notes?: string;
  price?: { price: number; currency: string };
  href: string;
}

export interface GearSetupVariantLink {
  setup: GearSetup;
  href: string;
  title: string;
}

export interface GearSetupRelatedGuide {
  title: string;
  href: string;
  description?: string;
  imageSrc?: string;
}

export interface GearSetupPageData {
  setup: GearSetup;
  sport?: Sport;
  breadcrumbs: { label: string; href?: string }[];
  eyebrow: string;
  heroImageSrc?: string;
  whyTitle: string;
  whyReasons: string[];
  curatedBy?: string;
  updatedLabel?: string;
  nextReviewLabel?: string;
  coreItemCount: number;
  coreItems: GearSetupPageItem[];
  optionalItems: GearSetupPageItem[];
  allListItems: GearSetupPageItem[];
  nextItems: GearSetupNextPageItem[];
  nextSectionLabel: string;
  variants: GearSetupVariantLink[];
  relatedGuides: GearSetupRelatedGuide[];
  finder?: { tool: Tool; href: string; label: string };
  builder?: { tool: Tool; href: string; label: string };
  customizeHref: string;
  customizeLabel: string;
  howWeChooseHref?: string;
  knownTotal: number | null;
  unknownPriceCount: number;
  currency: string;
  priceNote: string;
  summaryFocus: { title: string; detail: string }[];
  goalLabel: string;
  experienceLevel: string;
  scenario?: string;
  compatibilityNotes: string[];
  /** Only populated when live offers support the tier claims */
  budgetTiers: { label: string; note: string; approxMax?: number; currency?: string }[];
  showBudgetRange: boolean;
  keyPriorities: string[];
  checklist: string[];
  indexable: boolean;
  eligibilityReasons: string[];
  region: RegionCode;
}

function enrichItem(
  item: GearSetupItem,
  order: number,
  region: RegionCode,
  options?: PublishResolverOptions,
): GearSetupPageItem | null {
  const product = getProductById(item.productId, options);
  if (!product || product.status !== "published") return null;

  const brand = getBrandById(product.brandId);
  const category = getCategoryById(product.categoryId);
  const media = getPrimaryProductMedia(product);
  const score =
    typeof product.recommendationScore === "number"
      ? product.recommendationScore
      : undefined;
  const scoreLabel =
    typeof score === "number" ? getScoreBand(score).label : undefined;
  const lowest = getLowestOfferPrice(product.id, region);
  const offers = getOffersForProduct(product.id, region);
  const review = getReviewByProduct(product.id, options);
  const importance = resolveImportance(item);
  const categorySlug = category?.slug ?? "products";

  const altIds =
    item.alternativeProductIds ??
    product.alternativeProductIds?.slice(0, 2) ??
    [];

  const alternativeProducts = altIds
    .filter((id) => id !== product.id)
    .map((id) => getProductById(id, options))
    .filter((p): p is Product => Boolean(p) && p!.status === "published")
    .slice(0, 2)
    .map((p) => {
      const altScore =
        typeof p.recommendationScore === "number"
          ? p.recommendationScore
          : undefined;
      return {
        product: p,
        brand: getBrandById(p.brandId),
        media: getPrimaryProductMedia(p),
        score: altScore,
        scoreLabel:
          typeof altScore === "number"
            ? getScoreBand(altScore).label
            : undefined,
        price: getLowestOfferPrice(p.id, region),
        href: `/products/${p.slug}`,
      };
    });

  return {
    item,
    importance,
    order,
    roleLabel: roleLabelFor(item),
    product,
    brand,
    category,
    media,
    score,
    scoreLabel,
    price: lowest,
    offerCount: offers.length,
    review,
    reviewSlug: promotableReviewSlug(review, options),
    productHref: `/products/${product.slug}`,
    compareHref: `/compare?category=${encodeURIComponent(categorySlug)}&products=${encodeURIComponent(product.slug)}`,
    alternativesHref: `/products/${product.slug}/alternatives`,
    strengths: item.strengths?.slice(0, 4) ?? [],
    rationale:
      item.rationale ??
      item.notes ??
      `${brand?.name ?? ""} ${product.name} for this kit role.`.trim(),
    whyNeeded: item.whyNeeded,
    systemRole: item.systemRole,
    tradeOffs: item.tradeOffs,
    canOmit: item.canOmit,
    cheaperAlternative: item.cheaperAlternative,
    upgradePath: item.upgradePath,
    compatibilityNotes: item.compatibilityNotes,
    alternativeProducts,
  };
}

export function getGearSetupPageData(
  setupSlug: string,
  opts?: {
    region?: RegionCode;
    preview?: boolean;
  } & PublishResolverOptions,
): GearSetupPageData | null {
  const region = opts?.region ?? DEFAULT_REGION;
  const publishOpts: PublishResolverOptions = {
    isDev: opts?.preview ? true : opts?.isDev,
    now: opts?.now,
  };

  const setup = getGearSetupBySlug(setupSlug, publishOpts);
  if (!setup) return null;

  const eligibility = canPublishGearSetup(setup);
  const sport = getSportById(setup.sportId);
  const enriched = setup.items
    .map((item, i) => enrichItem(item, i + 1, region, publishOpts))
    .filter((x): x is GearSetupPageItem => Boolean(x));

  const coreItems = enriched.filter(
    (i) => i.importance === "required" || i.importance === "recommended",
  );
  const optionalItems = enriched.filter(
    (i) => i.importance === "optional" || i.importance === "future-addition",
  );

  /** Kit list shows required + recommended first, then optional */
  const allListItems = [...coreItems, ...optionalItems].map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));

  const priceResult = calculateSetupPrice({
    items: coreItems.map((i) => ({ productId: i.product.id })),
    region,
  });

  const kitProductIds = new Set(enriched.map((i) => i.product.id));

  const nextItems: GearSetupNextPageItem[] = (setup.nextItems ?? []).flatMap(
    (n) => {
      if (kitProductIds.has(n.productId)) return [];
      const product = getProductById(n.productId, publishOpts);
      if (!product || product.status !== "published") return [];
      return [
        {
          product,
          brand: getBrandById(product.brandId),
          media: getPrimaryProductMedia(product),
          role: n.role,
          roleLabel: n.roleLabel ?? n.role.toUpperCase(),
          contextLabel: n.contextLabel,
          notes: n.notes,
          price: getLowestOfferPrice(product.id, region),
          href: `/products/${product.slug}`,
        },
      ];
    },
  );
  const variants: GearSetupVariantLink[] = (setup.variantSetupIds ?? [])
    .map((id) => getGearSetupById(id, publishOpts))
    .filter((s): s is GearSetup => Boolean(s) && s!.id !== setup.id)
    .map((s) => ({
      setup: s,
      href: `/setups/${s.slug}`,
      title: s.title,
    }));

  const relatedGuides: GearSetupRelatedGuide[] = [];
  for (const id of setup.relatedBestGuideIds ?? []) {
    const g = getBestGuideById(id, publishOpts);
    if (g) {
      relatedGuides.push({
        title: g.title,
        href: `/best/${g.slug}`,
        description:
          g.shortDescription?.slice(0, 120) ?? g.intro?.slice(0, 120),
      });
    }
  }
  for (const id of setup.relatedGuideIds ?? []) {
    const g = getBuyingGuideById(id, publishOpts);
    if (g) {
      relatedGuides.push({
        title: g.title,
        href: `/guides/${g.slug}`,
        description:
          g.shortDescription?.slice(0, 120) ?? g.quickAnswer?.slice(0, 120),
      });
    }
  }

  const finderTool = setup.finderToolSlug
    ? getToolBySlug(setup.finderToolSlug, publishOpts)
    : undefined;
  const builderTool = setup.builderToolSlug
    ? getToolBySlug(setup.builderToolSlug, publishOpts)
    : undefined;

  const customizeHref = builderTool
    ? `/tools/${builderTool.slug}?setup=${encodeURIComponent(setup.slug)}`
    : variants.length > 0
      ? "#make-it-your-own"
      : finderTool
        ? `/tools/${finderTool.slug}?setup=${encodeURIComponent(setup.slug)}`
        : `/setups`;

  const customizeLabel = builderTool
    ? "Customize your kit"
    : variants.length > 0
      ? "Customize your kit"
      : finderTool
        ? "Personalize footwear"
        : "Browse setups";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(sport
      ? [{ label: sport.name, href: `/${sport.slug}` }]
      : [{ label: "Setups", href: "/setups" }]),
    { label: "Gear Kits", href: "/setups" },
    { label: setup.title },
  ];

  const summaryFocus =
    setup.summaryFocus ??
    ([
      {
        title: "Role coverage",
        detail: `${coreItems.length} core roles covered`,
      },
      {
        title: "Context fit",
        detail: setup.goalLabel ?? "Matched to this goal",
      },
    ] as { title: string; detail: string }[]);

  /** Budget range only when known core total sits near the declared band. */
  const showBudgetRange = (() => {
    const range = setup.budgetRange;
    const total = priceResult.knownTotal;
    if (!range || total == null) return false;
    if (priceResult.unknownCount > coreItems.length / 2) return false;
    const min = range.min ?? 0;
    const max = range.max ?? Number.POSITIVE_INFINITY;
    return total >= min * 0.65 && total <= max * 1.35;
  })();

  const budgetTiers = (setup.budgetTiers ?? []).filter((tier) => {
    if (tier.approxMax == null) return Boolean(tier.label && tier.note);
    if (priceResult.knownTotal == null) return false;
    return tier.approxMax >= priceResult.knownTotal * 0.4;
  });

  return {
    setup,
    sport,
    breadcrumbs,
    eyebrow: setup.eyebrow ?? "GEAR KIT",
    heroImageSrc: setup.heroImageSrc,
    whyTitle: setup.whyTitle ?? "Why a complete kit?",
    whyReasons: setup.whyReasons ?? [
      "Covers the core gear categories for this goal",
      "Items selected for the same context",
      "Clear essential vs optional roles",
      "Related variants when needs differ",
    ],
    curatedBy: setup.curatedBy,
    updatedLabel: formatMonthYear(setup.updatedAt ?? setup.lastVerifiedAt),
    nextReviewLabel: formatMonthYear(setup.nextReviewAt),
    coreItemCount: coreItems.length,
    coreItems,
    optionalItems,
    allListItems,
    nextItems,
    nextSectionLabel:
      nextItems[0]?.contextLabel ?? "WHAT TO BUY NEXT",
    variants,
    relatedGuides: relatedGuides.slice(0, 4),
    finder: finderTool
      ? {
          tool: finderTool,
          href: `/tools/${finderTool.slug}?setup=${encodeURIComponent(setup.slug)}`,
          label: `Try the ${finderTool.name}`,
        }
      : undefined,
    builder: builderTool
      ? {
          tool: builderTool,
          href: `/tools/${builderTool.slug}?setup=${encodeURIComponent(setup.slug)}`,
          label: `Open ${builderTool.name}`,
        }
      : undefined,
    customizeHref,
    customizeLabel,
    howWeChooseHref: setup.howWeChooseHref,
    knownTotal: priceResult.knownTotal,
    unknownPriceCount: priceResult.unknownCount,
    currency: priceResult.currency,
    priceNote:
      "Estimated total using current lowest verified offers. Prices may come from different retailers and can vary by size/availability. Retailer shipping may vary.",
    summaryFocus,
    goalLabel: setup.goalLabel ?? setup.title,
    experienceLevel: setup.experienceLevel ?? "All levels",
    scenario: setup.scenario,
    compatibilityNotes: setup.compatibilityNotes ?? [],
    budgetTiers,
    showBudgetRange,
    keyPriorities: [
      "Role coverage",
      "Context suitability",
      "Regional availability",
    ],
    checklist: setup.checklist ?? [],
    indexable: eligibility.ok && setup.status === "published",
    eligibilityReasons: eligibility.reasons,
    region,
  };
}

export function getGearSetupCanonicalPath(setup: GearSetup): string {
  return `${siteConfig.url}/setups/${setup.slug}`;
}
