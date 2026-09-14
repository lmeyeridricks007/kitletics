/**
 * Wave 27 — Expand padel court-shoe catalog + genderFit overlays.
 * Does not mutate seed/wave25/wave26 source arrays; products/offers/patches only.
 */

import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import { publishedMeta, SEED_DATES } from "@/content/config";

const pub = publishedMeta();
const padelSportId = "sport-padel" as const;

function offerRegions(
  productId: string,
  slug: string,
  priceEur: number,
  opts?: { decathlon?: boolean },
): Offer[] {
  const gbp = Math.round(priceEur * 0.86 * 100) / 100;
  const de = Math.round(priceEur * 1.02 * 100) / 100;
  const offers: Offer[] = [
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
  if (opts?.decathlon) {
    offers.push({
      id: `offer-${slug}-decathlon-nl`,
      productId,
      retailerId: "ret-decathlon",
      region: "NL",
      url: "https://www.decathlon.nl/",
      currency: "EUR",
      price: Math.round(priceEur * 0.97 * 100) / 100,
      availability: "in-stock",
      lastChecked: pub.lastVerifiedAt!,
    });
  }
  return offers;
}

function offerIdsFor(slug: string, decathlon?: boolean): string[] {
  const ids = [`offer-${slug}-nl`, `offer-${slug}-de`, `offer-${slug}-uk`];
  if (decathlon) ids.push(`offer-${slug}-decathlon-nl`);
  return ids;
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
  decathlonOffer?: boolean;
  relatedProductIds?: string[];
  alternativeProductIds?: string[];
};

const wave27ShoeDrafts: ShoeDraft[] = [
  {
    id: "prod-adidas-crazyquick-boost-m",
    slug: "adidas-crazyquick-boost-padel",
    brandId: "brand-adidas-padel",
    name: "Crazyquick Boost Padel",
    fullName: "Adidas Crazyquick Boost Padel",
    shortDescription:
      "Boost-cushioned Adidas padel court shoe for explosive first-step speed and lateral change of direction.",
    genderFit: "men",
    cushioning: "high",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Boost cushioning", "Quick lateral response", "Current Adidas padel line"],
    weaknesses: ["Premium vs club value shoes"],
    recommendationScore: 87,
    valueScore: 76,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 149,
    relatedProductIds: ["prod-adidas-courtstabil", "prod-babolat-jet-premura"],
    alternativeProductIds: ["prod-asics-gel-resolution-padel", "prod-nox-at10-lux"],
  },
  {
    id: "prod-adidas-courtquick-w",
    slug: "adidas-courtquick-padel-women",
    brandId: "brand-adidas-padel",
    name: "Courtquick Padel Women",
    fullName: "Adidas Courtquick Padel Women",
    shortDescription:
      "Women’s Adidas Courtquick padel shoe with court grip and a lighter everyday club fit.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Women’s last option", "Stable base", "Strong value"],
    weaknesses: ["Less premium foam than Crazyquick Boost"],
    recommendationScore: 84,
    valueScore: 88,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 99,
    decathlonOffer: true,
    relatedProductIds: ["prod-adidas-crazyquick-boost-w", "prod-babolat-sensa-women"],
    alternativeProductIds: ["prod-joma-slam-lady", "prod-bullpadel-ionic-woman"],
  },
  {
    id: "prod-adidas-crazyquick-boost-w",
    slug: "adidas-crazyquick-boost-padel-women",
    brandId: "brand-adidas-padel",
    name: "Crazyquick Boost Padel Women",
    fullName: "Adidas Crazyquick Boost Padel Women",
    shortDescription:
      "Women’s Crazyquick Boost for padel players who want softer cushioning without giving up lateral hold.",
    genderFit: "women",
    cushioning: "high",
    support: "stability",
    outsole: "padel court rubber",
    strengths: ["Boost comfort", "Women’s fit", "Match-day speed"],
    weaknesses: ["Higher price than Courtquick"],
    recommendationScore: 86,
    valueScore: 78,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 149,
    relatedProductIds: ["prod-adidas-courtquick-w", "prod-babolat-sensa-women"],
    alternativeProductIds: ["prod-asics-solution-swift-ff2-padel", "prod-bullpadel-ionic-woman"],
  },
  {
    id: "prod-asics-gel-dedicate-8-padel",
    slug: "asics-gel-dedicate-8-padel",
    brandId: "brand-asics",
    name: "Gel-Dedicate 8 Padel",
    fullName: "ASICS Gel-Dedicate 8 Padel",
    shortDescription:
      "Accessible ASICS padel court shoe with GEL cushioning for club players stepping up from multipurpose trainers.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "AHAR court",
    strengths: ["Approachable price", "GEL comfort", "Durable outsole"],
    weaknesses: ["Less lockdown than Resolution"],
    recommendationScore: 83,
    valueScore: 90,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 89,
    decathlonOffer: true,
    relatedProductIds: ["prod-asics-gel-challenger-court", "prod-asics-game-ff-padel"],
    alternativeProductIds: ["prod-joma-t-slam", "prod-adidas-courtstabil"],
  },
  {
    id: "prod-asics-game-ff-padel",
    slug: "asics-game-ff-padel",
    brandId: "brand-asics",
    name: "Game FF Padel",
    fullName: "ASICS Game FF Padel",
    shortDescription:
      "FLYTEFOAM court shoe for padel and hard-court tennis when you want a lighter ASICS option than Resolution.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "AHARPLUS court",
    strengths: ["Lighter ride", "Good lateral platform", "Dual-court use"],
    weaknesses: ["Not as plush as max-cushion court shoes"],
    recommendationScore: 85,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-asics-gel-resolution-padel", "prod-asics-gel-dedicate-8-padel"],
    alternativeProductIds: ["prod-babolat-jet-premura", "prod-head-sprint-pro-4-padel"],
  },
  {
    id: "prod-asics-solution-swift-ff2-padel",
    slug: "asics-solution-swift-ff2-padel",
    brandId: "brand-asics",
    name: "Solution Swift FF 2 Padel",
    fullName: "ASICS Solution Swift FF 2 Padel",
    shortDescription:
      "Speed-oriented ASICS court shoe popular with padel players who prioritise quick direction changes.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "high",
    outsole: "AHAR court",
    strengths: ["Quick feel", "Strong lateral support", "Court pedigree"],
    weaknesses: ["Firmer ride than Dedicate"],
    recommendationScore: 86,
    valueScore: 80,
    experienceLevels: ["intermediate", "advanced", "elite"],
    priceEur: 129,
    relatedProductIds: ["prod-asics-gel-resolution-padel", "prod-asics-game-ff-padel"],
    alternativeProductIds: ["prod-babolat-jet-premura", "prod-wilson-rush-pro-5-padel"],
  },
  {
    id: "prod-bullpadel-hybrid-fly",
    slug: "bullpadel-hybrid-fly",
    brandId: "brand-bullpadel",
    name: "Hybrid Fly",
    fullName: "Bullpadel Hybrid Fly",
    shortDescription:
      "Bullpadel padel-specific court shoe aimed at agile club and competitive players.",
    genderFit: "men",
    cushioning: "moderate",
    support: "high",
    outsole: "padel herringbone",
    strengths: ["Padel-first design", "Lateral grip", "Brand ecosystem"],
    weaknesses: ["Narrower EU availability than ASICS/Adidas"],
    recommendationScore: 85,
    valueScore: 82,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-nox-at10-lux", "prod-bullpadel-ionic-woman"],
    alternativeProductIds: ["prod-joma-spin-men", "prod-babolat-movea-2"],
  },
  {
    id: "prod-bullpadel-ionic-woman",
    slug: "bullpadel-ionic-woman",
    brandId: "brand-bullpadel",
    name: "Ionic Woman",
    fullName: "Bullpadel Ionic Woman",
    shortDescription:
      "Women’s Bullpadel Ionic court shoe for padel with a stability-biased base and club-friendly cushioning.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "padel herringbone",
    strengths: ["Women’s last", "Stable platform", "Padel-specific outsole"],
    weaknesses: ["Less cushion than Boost models"],
    recommendationScore: 84,
    valueScore: 85,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 109,
    relatedProductIds: ["prod-babolat-sensa-women", "prod-joma-slam-lady"],
    alternativeProductIds: ["prod-adidas-courtquick-w", "prod-adidas-crazyquick-boost-w"],
  },
  {
    id: "prod-nox-at10-lux",
    slug: "nox-at10-lux",
    brandId: "brand-nox",
    name: "AT10 Lux",
    fullName: "Nox AT10 Lux",
    shortDescription:
      "Nox AT10 Lux padel shoe paired with the AT10 racket family — built for aggressive lateral work on sand/artificial turf courts.",
    genderFit: "men",
    cushioning: "high",
    support: "high",
    outsole: "padel clay/sand",
    strengths: ["Padel-native brand", "High support", "Tour-inspired styling"],
    weaknesses: ["Fit can feel firm out of box"],
    recommendationScore: 86,
    valueScore: 79,
    experienceLevels: ["intermediate", "advanced", "elite"],
    priceEur: 139,
    relatedProductIds: ["prod-nox-ml10-hexa", "prod-bullpadel-hybrid-fly"],
    alternativeProductIds: ["prod-asics-gel-resolution-padel", "prod-babolat-jet-premura"],
  },
  {
    id: "prod-nox-ml10-hexa",
    slug: "nox-ml10-hexa",
    brandId: "brand-nox",
    name: "ML10 Hexa",
    fullName: "Nox ML10 Hexa",
    shortDescription:
      "Nox ML10 Hexa court shoe with a hexagonal traction pattern for padel movement patterns.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "stability",
    outsole: "hexa padel",
    strengths: ["Distinct traction", "Club comfort", "Nox ecosystem"],
    weaknesses: ["Less widely stocked than ASICS"],
    recommendationScore: 84,
    valueScore: 83,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 119,
    relatedProductIds: ["prod-nox-at10-lux", "prod-joma-t-slam"],
    alternativeProductIds: ["prod-bullpadel-hybrid-fly", "prod-adidas-courtstabil"],
  },
  {
    id: "prod-babolat-movea-2",
    slug: "babolat-movea-2",
    brandId: "brand-babolat-padel",
    name: "Movea 2",
    fullName: "Babolat Movea 2",
    shortDescription:
      "Babolat Movea 2 men’s padel shoe balancing cushioning and durability for frequent club play.",
    genderFit: "men",
    cushioning: "moderate",
    support: "stability",
    outsole: "Michelin padel",
    strengths: ["Michelin outsole", "Durable upper", "Club mileage"],
    weaknesses: ["Heavier than Jet Premura"],
    recommendationScore: 85,
    valueScore: 84,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-babolat-jet-premura", "prod-joma-spin-men"],
    alternativeProductIds: ["prod-head-revolt-pro-court", "prod-asics-gel-challenger-court"],
  },
  {
    id: "prod-babolat-sensa-women",
    slug: "babolat-sensa-women",
    brandId: "brand-babolat-padel",
    name: "Sensa Women",
    fullName: "Babolat Sensa Women",
    shortDescription:
      "Women’s Babolat Sensa padel shoe with Michelin traction and a softer everyday court ride.",
    genderFit: "women",
    cushioning: "moderate",
    support: "stability",
    outsole: "Michelin padel",
    strengths: ["Women’s fit", "Michelin grip", "Comfortable daily court shoe"],
    weaknesses: ["Not a race-light speed shoe"],
    recommendationScore: 85,
    valueScore: 84,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 119,
    relatedProductIds: ["prod-adidas-courtquick-w", "prod-joma-slam-lady"],
    alternativeProductIds: ["prod-bullpadel-ionic-woman", "prod-adidas-crazyquick-boost-w"],
  },
  {
    id: "prod-joma-slam-lady",
    slug: "joma-slam-lady",
    brandId: "brand-joma",
    name: "Slam Lady",
    fullName: "Joma Slam Lady",
    shortDescription:
      "Women’s Joma Slam padel shoe — the club favourite Slam platform in a women’s last.",
    genderFit: "women",
    cushioning: "moderate",
    support: "high",
    outsole: "DURABILITY rubber",
    strengths: ["Proven Slam stability", "Women’s last", "Strong value"],
    weaknesses: ["Can feel firm initially"],
    recommendationScore: 85,
    valueScore: 89,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 99,
    decathlonOffer: true,
    relatedProductIds: ["prod-joma-t-slam", "prod-babolat-sensa-women"],
    alternativeProductIds: ["prod-adidas-courtquick-w", "prod-bullpadel-ionic-woman"],
  },
  {
    id: "prod-joma-spin-men",
    slug: "joma-spin-men",
    brandId: "brand-joma",
    name: "Spin Men",
    fullName: "Joma Spin Men",
    shortDescription:
      "Joma Spin men’s padel shoe for players who want a lighter, quicker alternative to Slam.",
    genderFit: "men",
    cushioning: "moderate",
    support: "stability",
    outsole: "DURABILITY rubber",
    strengths: ["Lighter than Slam", "Good value", "Quick court feel"],
    weaknesses: ["Less protective cushioning on long sessions"],
    recommendationScore: 84,
    valueScore: 88,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 99,
    relatedProductIds: ["prod-joma-t-slam", "prod-babolat-movea-2"],
    alternativeProductIds: ["prod-asics-game-ff-padel", "prod-bullpadel-hybrid-fly"],
  },
  {
    id: "prod-head-sprint-pro-4-padel",
    slug: "head-sprint-pro-4-padel",
    brandId: "brand-head-padel",
    name: "Sprint Pro 4.0 Padel",
    fullName: "Head Sprint Pro 4.0 Padel",
    shortDescription:
      "Head Sprint Pro 4.0 padel court shoe for players who want a lighter alternative to Revolt Pro.",
    genderFit: "men",
    cushioning: "moderate",
    support: "stability",
    outsole: "Hybrasion court",
    strengths: ["Lighter Head option", "Decent lateral hold", "Wide EU stock"],
    weaknesses: ["Less plush than Revolt on long match days"],
    recommendationScore: 84,
    valueScore: 83,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 129,
    relatedProductIds: ["prod-head-revolt-pro-court", "prod-asics-game-ff-padel"],
    alternativeProductIds: ["prod-wilson-rush-pro-5-padel", "prod-babolat-jet-premura"],
  },
  {
    id: "prod-wilson-rush-pro-5-padel",
    slug: "wilson-rush-pro-5-padel",
    brandId: "brand-wilson-padel",
    name: "Rush Pro 5 Padel",
    fullName: "Wilson Rush Pro 5 Padel",
    shortDescription:
      "Wilson Rush Pro 5 adapted for padel courts — familiar tennis-court DNA with padel traction priorities.",
    genderFit: "unisex",
    cushioning: "moderate",
    support: "high",
    outsole: "Endofoot padel",
    strengths: ["Rush Pro stability", "Dual-court pedigree", "Secure lockdown"],
    weaknesses: ["Can feel firm for recovery days"],
    recommendationScore: 85,
    valueScore: 81,
    experienceLevels: ["intermediate", "advanced", "elite"],
    priceEur: 135,
    relatedProductIds: ["prod-asics-gel-resolution-padel", "prod-head-sprint-pro-4-padel"],
    alternativeProductIds: ["prod-babolat-jet-premura", "prod-nox-at10-lux"],
  },
];

export const wave27Products: Product[] = wave27ShoeDrafts.map((d) => ({
  id: d.id,
  slug: d.slug,
  brandId: d.brandId,
  name: d.name,
  fullName: d.fullName,
  shortDescription: d.shortDescription,
  lifecycleStatus: "current" as const,
  sportIds: [padelSportId],
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
      src: `/images/padel/products/${d.slug}-hero.jpg`,
      alt: `${d.fullName} padel court shoe`,
      type: "image" as const,
      source: "Zona de Padel authorized product photography",
      usageType: "hero" as const,
      licence: "retailer-authorized" as const,
      sourceUrl: `https://www.zonadepadel.es/busca?controller=search&s=${encodeURIComponent(d.fullName)}`,
    },
  ],
  videos: [],
  offerIds: offerIdsFor(d.slug, d.decathlonOffer),
  evidenceIds: [],
  relatedProductIds: d.relatedProductIds ?? [],
  alternativeProductIds: d.alternativeProductIds ?? [],
  ...pub,
  updatedAt: SEED_DATES.updated,
}));

export const wave27Offers: Offer[] = wave27ShoeDrafts.flatMap((d) =>
  offerRegions(d.id, d.slug, d.priceEur, { decathlon: d.decathlonOffer }),
);

/** Overlay patches for earlier padel shoes — gender + normalised specs + CourtStabil refresh. */
export const wave27ProductPatches: Record<string, Partial<Product>> = {
  "prod-adidas-courtstabil": {
    slug: "adidas-courtquick-padel",
    name: "Courtquick Padel",
    fullName: "Adidas Courtquick Padel",
    shortDescription:
      "Current Adidas Courtquick padel court shoe for stable lateral movement.",
    specifications: {
      genderFit: "men",
      cushioning: "moderate",
      support: "stability",
      outsole: "padel court rubber",
    },
    strengths: ["Court grip", "Lateral support", "Strong club value"],
    weaknesses: ["Less Boost cushioning than Crazyquick"],
    relatedProductIds: [
      "prod-adidas-crazyquick-boost-m",
      "prod-joma-t-slam",
      "prod-asics-gel-dedicate-8-padel",
    ],
    alternativeProductIds: [
      "prod-asics-gel-challenger-court",
      "prod-babolat-movea-2",
    ],
  },
  "prod-asics-gel-resolution-padel": {
    specifications: {
      genderFit: "unisex",
      cushioning: "high",
      support: "high",
      outsole: "AHAR court",
    },
  },
  "prod-asics-gel-challenger-court": {
    specifications: {
      genderFit: "unisex",
      cushioning: "moderate",
      support: "stability",
      outsole: "court rubber",
    },
  },
  "prod-babolat-jet-premura": {
    specifications: {
      genderFit: "men",
      cushioning: "moderate",
      support: "high",
      outsole: "Michelin padel",
    },
  },
  "prod-joma-t-slam": {
    specifications: {
      genderFit: "men",
      cushioning: "moderate",
      support: "high",
      outsole: "DURABILITY rubber",
    },
  },
  "prod-head-revolt-pro-court": {
    specifications: {
      genderFit: "men",
      cushioning: "moderate",
      support: "stability",
      outsole: "Hybrasion court",
    },
  },
};
