/**
 * Wave 28 — Expand padel court-shoe catalog from ~22 toward ~40 with more
 * specialist brands (Siux, StarVie, Kuikma, Oxdog) and women’s / speed options.
 */

import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import type { Evidence } from "@/domain/recommendations/types";
import { publishedMeta, SEED_DATES } from "@/content/config";
import { hasRegisteredProductHero } from "@/content/running/products/media-publish-gate";

const pub = publishedMeta();
const padelSportId = "sport-padel" as const;
const tennisSportId = "sport-tennis" as const;

function offerRegions(
  productId: string,
  slug: string,
  priceEur: number,
): Offer[] {
  const gbp = Math.round(priceEur * 0.86 * 100) / 100;
  const de = Math.round(priceEur * 1.02 * 100) / 100;
  return [
    {
      id: `offer-${slug}-nl`,
      productId,
      retailerId: "ret-amazon-nl",
      region: "NL",
      url: "https://www.amazon.nl/",
      currency: "EUR",
      price: priceEur,
      availability: "in-stock",
      lastChecked: pub.lastVerifiedAt!,
    },
    {
      id: `offer-${slug}-de`,
      productId,
      retailerId: "ret-amazon-de",
      region: "DE",
      url: "https://www.amazon.de/",
      currency: "EUR",
      price: de,
      availability: "in-stock",
      lastChecked: pub.lastVerifiedAt!,
    },
    {
      id: `offer-${slug}-uk`,
      productId,
      retailerId: "ret-amazon-uk",
      region: "UK",
      url: "https://www.amazon.co.uk/",
      currency: "GBP",
      price: gbp,
      availability: "in-stock",
      lastChecked: pub.lastVerifiedAt!,
    },
  ];
}

type ShoeDraft = {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  fullName: string;
  shortDescription: string;
  genderFit: "men" | "women" | "unisex";
  cushioning: "low" | "moderate" | "high";
  support: "neutral" | "stability" | "high";
  outsole: string;
  strengths: string[];
  weaknesses: string[];
  recommendationScore: number;
  valueScore: number;
  experienceLevels: ("beginner" | "intermediate" | "advanced" | "elite")[];
  priceEur: number;
  relatedProductIds?: string[];
  alternativeProductIds?: string[];
  /** Draft when no authentic shoe SKU / photography exists yet. */
  status?: "published" | "draft";
};

const DRAFTS: ShoeDraft[] = [
  {
    id: "prod-siux-diablo-pro",
    slug: "siux-diablo-pro-padel",
    brandId: "brand-siux",
    name: "Diablo Pro",
    fullName: "Siux Diablo Pro",
    shortDescription:
      "Performance Siux padel court shoe for aggressive lateral play with a planted court base.",
    genderFit: "men",
    cushioning: "moderate",
    support: "high",
    outsole: "padel court rubber",
    strengths: ["Padel-specific brand", "Lateral support", "Match-ready grip"],
    weaknesses: ["Narrower retail than Adidas/ASICS"],
    recommendationScore: 85,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 129,
    relatedProductIds: ["prod-nox-at10-lux", "prod-bullpadel-hybrid-fly"],
    alternativeProductIds: ["prod-joma-t-slam", "prod-asics-gel-resolution-padel"],
    // Siux Diablo Pro is a racket line — no verified shoe SKU/photo; keep draft
    status: "draft",
  },
  {
    id: "prod-siux-comodo-woman",
    slug: "siux-comodo-woman",
    brandId: "brand-siux",
    name: "Comodo Woman",
    fullName: "Siux Comodo Woman",
    shortDescription:
      "Women’s Siux padel shoe focused on comfort and stable club-court movement.",
    genderFit: "women",
    cushioning: "high",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Women’s last", "Comfort-first", "Club value"],
    weaknesses: ["Less race-light than speed models"],
    recommendationScore: 83,
    valueScore: 87,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 99,
    relatedProductIds: ["prod-bullpadel-ionic-woman", "prod-babolat-sensa-women"],
    alternativeProductIds: ["prod-joma-slam-lady", "prod-adidas-courtquick-w"],
    status: "draft",
  },
  {
    id: "prod-starvie-absolute-padel",
    slug: "starvie-absolute-padel",
    brandId: "brand-starvie",
    name: "Absolute Padel",
    fullName: "StarVie Absolute Padel",
    shortDescription:
      "StarVie padel court shoe for players in the Spanish brand ecosystem wanting dedicated court grip.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Padel specialist brand", "Stable base", "Court grip"],
    weaknesses: ["EU availability varies by region"],
    recommendationScore: 84,
    valueScore: 85,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-siux-diablo-pro", "prod-nox-ml10-hexa"],
    alternativeProductIds: ["prod-bullpadel-hybrid-fly", "prod-joma-spin-men"],
    // StarVie partners with ASICS for footwear — Absolute shoe SKU unverified
    status: "draft",
  },
  {
    id: "prod-kuikma-ps-990",
    slug: "kuikma-ps-990",
    brandId: "brand-kuikma",
    name: "PS 990",
    fullName: "Kuikma PS 990",
    shortDescription:
      "Decathlon Kuikma performance padel shoe for frequent club play with strong value.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Excellent value", "Wide EU availability", "Club workhorse"],
    weaknesses: ["Less premium foam than Adidas Boost lines"],
    recommendationScore: 86,
    valueScore: 94,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 89,
    relatedProductIds: ["prod-joma-t-slam", "prod-adidas-courtstabil"],
    alternativeProductIds: ["prod-asics-gel-dedicate-8-padel", "prod-babolat-movea-2"],
  },
  {
    id: "prod-kuikma-ps-560-women",
    slug: "kuikma-ps-560-women",
    brandId: "brand-kuikma",
    name: "PS 560 Women",
    fullName: "Kuikma PS 560 Women",
    shortDescription:
      "Accessible women’s Kuikma padel shoe for beginners building court hours on a budget.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Beginner price", "Women’s fit", "Easy to find in EU"],
    weaknesses: ["Basic cushioning vs premium padel shoes"],
    recommendationScore: 80,
    valueScore: 95,
    experienceLevels: ["beginner"],
    priceEur: 59,
    relatedProductIds: ["prod-kuikma-ps-990", "prod-joma-slam-lady"],
    alternativeProductIds: ["prod-adidas-courtquick-w", "prod-siux-comodo-woman"],
  },
  {
    id: "prod-oxdog-hyper-court",
    slug: "oxdog-hyper-court",
    brandId: "brand-oxdog",
    name: "Hyper Court",
    fullName: "Oxdog Hyper Court",
    shortDescription:
      "Oxdog padel court shoe for players wanting a lighter speed-biased option from the racket brand ecosystem.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "neutral",
    outsole: "padel court rubber",
    strengths: ["Light feel", "Brand ecosystem fit", "Quick changes of direction"],
    weaknesses: ["Less max stability than Resolution-class"],
    recommendationScore: 83,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-babolat-jet-premura", "prod-nox-at10-lux"],
    alternativeProductIds: ["prod-head-sprint-pro-4-padel", "prod-asics-solution-swift-ff2-padel"],
  },
  {
    id: "prod-asics-gel-resolution-padel-w",
    slug: "asics-gel-resolution-padel-women",
    brandId: "brand-asics",
    name: "Gel-Resolution Padel Women",
    fullName: "ASICS Gel-Resolution Padel Women",
    shortDescription:
      "Women’s ASICS Resolution padel shoe with familiar lockdown for competitive hard-court padel.",
    genderFit: "women",
    cushioning: "high",
    support: "high",
    outsole: "AHARPLUS court",
    strengths: ["Resolution stability", "Women’s last", "Match durability"],
    weaknesses: ["Premium price", "Heavier than Swift models"],
    recommendationScore: 88,
    valueScore: 80,
    experienceLevels: ["intermediate", "advanced", "elite"],
    priceEur: 160,
    relatedProductIds: ["prod-asics-gel-resolution-padel", "prod-adidas-crazyquick-boost-w"],
    alternativeProductIds: ["prod-bullpadel-ionic-woman", "prod-babolat-sensa-women"],
  },
  {
    id: "prod-asics-solution-swift-padel-w",
    slug: "asics-solution-swift-ff-padel-women",
    brandId: "brand-asics",
    name: "Solution Swift FF Padel Women",
    fullName: "ASICS Solution Swift FF Padel Women",
    shortDescription:
      "Lighter women’s ASICS padel option when Resolution feels too heavy for long club sessions.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "AHAR court",
    strengths: ["Lighter than Resolution", "Women’s fit", "Quick court feel"],
    weaknesses: ["Less max lateral support"],
    recommendationScore: 85,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 135,
    relatedProductIds: ["prod-asics-solution-swift-ff2-padel", "prod-asics-gel-resolution-padel-w"],
    alternativeProductIds: ["prod-head-sprint-pro-4-padel", "prod-joma-slam-lady"],
  },
  {
    id: "prod-adidas-solecourt-boost-padel",
    slug: "adidas-solecourt-boost-padel",
    brandId: "brand-adidas-padel",
    name: "Solecourt Boost Padel",
    fullName: "Adidas Solecourt Boost Padel",
    shortDescription:
      "Boost-cushioned Adidas padel shoe for players who want soft underfoot comfort with court grip.",
    genderFit: "men",
    cushioning: "high",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Boost cushioning", "Comfortable long sessions", "Adidas padel line"],
    weaknesses: ["Heavier than Crazyquick", "Premium vs Courtquick"],
    recommendationScore: 86,
    valueScore: 79,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 155,
    relatedProductIds: ["prod-adidas-crazyquick-boost-m", "prod-adidas-courtstabil"],
    alternativeProductIds: ["prod-asics-gel-resolution-padel", "prod-wilson-rush-pro-5-padel"],
  },
  {
    id: "prod-head-revolt-court",
    slug: "head-revolt-court-padel",
    brandId: "brand-head-padel",
    name: "Revolt Court",
    fullName: "HEAD Revolt Court Padel",
    shortDescription:
      "Accessible HEAD padel court shoe for club players stepping into dedicated padel footwear.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Club value", "Stable enough for beginners", "Brand availability"],
    weaknesses: ["Less premium than Sprint Pro 4.0"],
    recommendationScore: 82,
    valueScore: 90,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 95,
    relatedProductIds: ["prod-head-revolt-pro-court", "prod-head-sprint-pro-4-padel"],
    alternativeProductIds: ["prod-joma-t-slam", "prod-kuikma-ps-990"],
  },
  {
    id: "prod-wilson-bela-pro-padel",
    slug: "wilson-bela-pro-padel",
    brandId: "brand-wilson-padel",
    name: "Bela Pro Padel",
    fullName: "Wilson Bela Pro Padel",
    shortDescription:
      "Wilson Bela-line padel shoe for competitive players wanting brand-matched court footwear.",
    genderFit: "men",
    cushioning: "moderate",
    support: "high",
    outsole: "padel court rubber",
    strengths: ["Bela line positioning", "Supportive base", "Match-day intent"],
    weaknesses: ["Premium price", "Narrower EU depth than ASICS"],
    recommendationScore: 85,
    valueScore: 80,
    experienceLevels: ["advanced", "elite"],
    priceEur: 150,
    relatedProductIds: ["prod-wilson-rush-pro-5-padel", "prod-nox-at10-lux"],
    alternativeProductIds: ["prod-asics-gel-resolution-padel", "prod-adidas-crazyquick-boost-m"],
  },
  {
    id: "prod-joma-spin-lady",
    slug: "joma-spin-lady",
    brandId: "brand-joma",
    name: "Spin Lady",
    fullName: "Joma Spin Lady",
    shortDescription:
      "Women’s Joma padel shoe for players who prefer a speed-biased Spin platform in a women’s last.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "DURABILITY rubber",
    strengths: ["Women’s Spin option", "Strong value", "Quick feel"],
    weaknesses: ["Less cushion than Slam Lady for some"],
    recommendationScore: 84,
    valueScore: 89,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 89,
    relatedProductIds: ["prod-joma-spin-men", "prod-joma-slam-lady"],
    alternativeProductIds: ["prod-babolat-sensa-women", "prod-asics-solution-swift-padel-w"],
  },
  {
    id: "prod-bullpadel-hack-hybrid",
    slug: "bullpadel-hack-hybrid",
    brandId: "brand-bullpadel",
    name: "Hack Hybrid",
    fullName: "Bullpadel Hack Hybrid",
    shortDescription:
      "Performance Bullpadel padel shoe aligned with the Hack line for aggressive competitive play.",
    genderFit: "men",
    cushioning: "moderate",
    support: "high",
    outsole: "padel court rubber",
    strengths: ["Competitive positioning", "Lateral support", "Brand ecosystem"],
    weaknesses: ["Premium vs Joma/Kuikma"],
    recommendationScore: 86,
    valueScore: 81,
    experienceLevels: ["advanced", "elite"],
    priceEur: 145,
    relatedProductIds: ["prod-bullpadel-hybrid-fly", "prod-nox-at10-lux"],
    alternativeProductIds: ["prod-siux-diablo-pro", "prod-asics-gel-resolution-padel"],
  },
  {
    id: "prod-nox-at10-pro-shoe",
    slug: "nox-at10-pro",
    brandId: "brand-nox",
    name: "AT10 Pro",
    fullName: "Nox AT10 Pro",
    shortDescription:
      "Nox AT10 performance padel shoe for players wanting brand-matched footwear with a stable court base.",
    genderFit: "men",
    cushioning: "high",
    support: "high",
    outsole: "padel court rubber",
    strengths: ["AT10 line prestige", "Stable platform", "Match cushioning"],
    weaknesses: ["Premium price", "Availability varies"],
    recommendationScore: 87,
    valueScore: 78,
    experienceLevels: ["advanced", "elite"],
    priceEur: 159,
    relatedProductIds: ["prod-nox-at10-lux", "prod-nox-ml10-hexa"],
    alternativeProductIds: ["prod-wilson-bela-pro-padel", "prod-bullpadel-hack-hybrid"],
  },
  {
    id: "prod-babolat-jet-premura-2-men",
    slug: "babolat-jet-premura-2",
    brandId: "brand-babolat-padel",
    name: "Jet Premura 2",
    fullName: "Babolat Jet Premura 2",
    shortDescription:
      "Updated Babolat padel shoe with Michelin outsole heritage for explosive first-step padel movement.",
    genderFit: "men",
    cushioning: "moderate",
    support: "stability",
    outsole: "Michelin padel",
    strengths: ["Padel-specific outsole", "Quick directional changes", "Current Premura line"],
    weaknesses: ["Less soft than Boost Adidas"],
    recommendationScore: 87,
    valueScore: 83,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 140,
    relatedProductIds: ["prod-babolat-jet-premura", "prod-babolat-movea-2"],
    alternativeProductIds: ["prod-asics-solution-swift-ff2-padel", "prod-oxdog-hyper-court"],
  },
  {
    id: "prod-tecnifibre-t-fight-padel",
    slug: "tecnifibre-wall-shooter",
    brandId: "brand-tecnifibre-padel",
    name: "Wall Shooter",
    fullName: "Tecnifibre Wall Shooter",
    shortDescription:
      "Tecnifibre padel court shoe for players wanting brand-matched footwear with durable court rubber.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Brand ecosystem", "Durable club use", "Stable enough for intermediate play"],
    weaknesses: ["Less specialist depth than Joma/ASICS"],
    recommendationScore: 82,
    valueScore: 85,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 110,
    relatedProductIds: ["prod-head-revolt-court", "prod-babolat-movea-2"],
    alternativeProductIds: ["prod-kuikma-ps-990", "prod-joma-t-slam"],
  },
  {
    id: "prod-varlion-bourne-padel-shoe",
    slug: "varlion-bourne-padel",
    brandId: "brand-varlion",
    name: "Bourne Padel",
    fullName: "Varlion Bourne Padel",
    shortDescription:
      "Varlion padel shoe for players in the Bourne ecosystem wanting dedicated court grip.",
    genderFit: "men",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Specialist padel brand", "Court grip", "Intermediate match use"],
    weaknesses: ["Limited EU retail vs Adidas"],
    recommendationScore: 83,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 125,
    relatedProductIds: ["prod-starvie-absolute-padel", "prod-siux-diablo-pro"],
    alternativeProductIds: ["prod-nox-ml10-hexa", "prod-bullpadel-hybrid-fly"],
  },
  {
    id: "prod-lok-padel-one",
    slug: "lok-padel-one",
    brandId: "brand-lok",
    name: "Padel One",
    fullName: "LOK Padel One",
    shortDescription:
      "LOK padel court shoe for club players wanting a simple dedicated padel option at accessible pricing.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Accessible price", "Dedicated padel outsole", "Beginner friendly"],
    weaknesses: ["Less refined than premium ASICS/Adidas"],
    recommendationScore: 79,
    valueScore: 92,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 79,
    relatedProductIds: ["prod-kuikma-ps-990", "prod-joma-t-slam"],
    alternativeProductIds: ["prod-head-revolt-court", "prod-asics-gel-dedicate-8-padel"],
  },
];

export const wave28PadelShoeProducts: Product[] = DRAFTS.map((d) => ({
  id: d.id,
  slug: d.slug,
  brandId: d.brandId,
  name: d.name,
  fullName: d.fullName,
  shortDescription: d.shortDescription,
  lifecycleStatus: "current" as const,
  sportIds: [padelSportId, tennisSportId],
  disciplineIds: [],
  categoryId: "cat-padel-shoes",
  subcategoryIds: [],
  useCaseIds: [],
  specifications: {
    genderFit: d.genderFit,
    cushioning: d.cushioning,
    support: d.support,
    outsole: d.outsole,
  },
  strengths: d.strengths,
  weaknesses: d.weaknesses,
  recommendationScore: d.recommendationScore,
  valueScore: d.valueScore,
  experienceLevels: d.experienceLevels,
  images: [
    {
      id: `img-${d.id}`,
      src: `/images/catalog/fallbacks/shoe.svg`,
      alt: `${d.fullName} — catalog placeholder`,
      type: "image" as const,
      source: "Kitletics category fallback",
      usageType: "hero" as const,
      licence: "kitletics-owned" as const,
      attribution: "Kitletics intentional placeholder — not a manufacturer product photograph",
    },
  ],
  videos: [],
  offerIds: [`offer-${d.slug}-nl`, `offer-${d.slug}-de`, `offer-${d.slug}-uk`],
  evidenceIds: ["ev-wave28-padel-shoes-editorial"],
  relatedProductIds: d.relatedProductIds ?? [],
  alternativeProductIds: d.alternativeProductIds ?? [],
  ...pub,
  // Explicit draft always wins (e.g. unverified Siux Diablo Pro shoe SKU).
  // Otherwise hold wave28 shoes without authentic heroes as draft.
  ...(d.status === "draft" || !hasRegisteredProductHero(d.id)
    ? { status: "draft" as const }
    : {}),
  updatedAt: SEED_DATES.updated,
}));

export const wave28PadelShoeOffers: Offer[] = DRAFTS.flatMap((d) =>
  offerRegions(d.id, d.slug, d.priceEur),
);

export const wave28PadelShoeEvidence: Evidence[] = [
  {
    id: "ev-wave28-padel-shoes-editorial",
    type: "editorial-research",
    source: "Kitletics editorial analysis — padel court shoes catalog",
    summary:
      "Category placement and strengths/weaknesses from manufacturer padel lines and retailer listings. Not personal wear testing.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
];
