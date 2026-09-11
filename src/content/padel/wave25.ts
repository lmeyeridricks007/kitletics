/**
 * Prompt 25 — Additional padel rackets with richer specs, offers and recommendations.
 * Does not enable finders or mutate padel/seed.ts — products/offers/recs only.
 * Merged via padel/index when wired.
 */

import type { Product, Brand } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import type { Recommendation, Evidence } from "@/domain/recommendations/types";
import { publishedMeta, SEED_DATES } from "@/content/config";

const pub = publishedMeta();
const padelSportId = "sport-padel" as const;

const RACKET_SVGS = [
  "/images/padel/products/racket-1.svg",
  "/images/padel/products/racket-2.svg",
  "/images/padel/products/racket-3.svg",
  "/images/padel/products/racket-4.svg",
  "/images/padel/products/racket-5.svg",
] as const;

function padelImg(productId: string, index: number, alt: string) {
  return [
    {
      id: `img-${productId}`,
      src: RACKET_SVGS[index % RACKET_SVGS.length]!,
      alt: `${alt} — intentional catalog placeholder (product photograph unavailable)`,
      type: "image" as const,
      source: "Kitletics padel placeholder",
      usageType: "hero" as const,
      licence: "kitletics-owned" as const,
    },
  ];
}

function offerTriplet(
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

/** Brands not already in padel/seed.ts */
export const wave25Brands: Brand[] = [
  {
    id: "brand-kuikma",
    name: "Kuikma",
    slug: "kuikma",
    country: "France",
    description: "Decathlon padel brand for value and club rackets.",
    homepage: "https://www.decathlon.nl/",
    ...pub,
  },
  {
    id: "brand-drop-shot",
    name: "Drop Shot",
    slug: "drop-shot",
    country: "Spain",
    description: "Spanish padel rackets and court gear.",
    homepage: "https://www.dropshot.es",
    ...pub,
  },
  {
    id: "brand-varlion",
    name: "Varlion",
    slug: "varlion",
    country: "Spain",
    description: "Spanish padel rackets with distinctive LW geometry.",
    homepage: "https://www.varlion.com",
    ...pub,
  },
];

type Wave25Draft = {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  fullName: string;
  shortDescription: string;
  useCaseIds: string[];
  specifications: Product["specifications"];
  strengths: string[];
  weaknesses: string[];
  recommendationScore: number;
  valueScore: number;
  experienceLevels: Product["experienceLevels"];
  priceEur: number;
  imgIndex: number;
  relatedProductIds?: string[];
  alternativeProductIds?: string[];
};

const wave25Drafts: Wave25Draft[] = [
  {
    id: "prod-starvie-titania-kepler",
    slug: "starvie-titania-kepler-2026",
    brandId: "brand-starvie",
    name: "Titania Kepler 2026",
    fullName: "StarVie Titania Kepler 2026",
    shortDescription:
      "Teardrop hybrid racket with a wide sweet spot for intermediate all-court play.",
    useCaseIds: ["uc-padel-balanced"],
    specifications: {
      shape: "teardrop",
      balance: "medium",
      weightMin: 355,
      weightMax: 375,
      core: "EVA Soft",
      face: "carbon",
      thicknessMm: 38,
      powerPositioning: "balanced",
      controlPositioning: "balanced",
      playerLevel: "intermediate",
      sweetSpot: "large-central",
    },
    strengths: ["Forgiving sweet spot", "Hybrid versatility"],
    weaknesses: ["Not pure smash power"],
    recommendationScore: 88,
    valueScore: 84,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 229,
    imgIndex: 0,
    relatedProductIds: ["prod-nox-at10-18k-2026"],
    alternativeProductIds: ["prod-adidas-metalbone-hrd"],
  },
  {
    id: "prod-adidas-metalbone-hrd",
    slug: "adidas-metalbone-hrd-2026",
    brandId: "brand-adidas-padel",
    name: "Metalbone HRD 2026",
    fullName: "Adidas Metalbone HRD 2026",
    shortDescription:
      "Attacking diamond Metalbone with high rigidity for advanced finishers.",
    useCaseIds: ["uc-padel-power"],
    specifications: {
      shape: "diamond",
      balance: "head-heavy",
      weightMin: 360,
      weightMax: 375,
      core: "EVA High Memory",
      face: "aluminised carbon",
      thicknessMm: 38,
      powerPositioning: "high",
      controlPositioning: "moderate",
      playerLevel: "advanced",
      sweetSpot: "upper",
    },
    strengths: ["Finishing power", "Stiff attack response"],
    weaknesses: ["Demanding for beginners"],
    recommendationScore: 91,
    valueScore: 78,
    experienceLevels: ["advanced", "elite"],
    priceEur: 289,
    imgIndex: 1,
    relatedProductIds: ["prod-babolat-technical-viper"],
    alternativeProductIds: ["prod-bullpadel-hack-03"],
  },
  {
    id: "prod-kuikma-pr-soft-500",
    slug: "kuikma-pr-soft-500",
    brandId: "brand-kuikma",
    name: "PR Soft 500",
    fullName: "Kuikma PR Soft 500",
    shortDescription:
      "Value round control racket for beginners prioritising forgiveness.",
    useCaseIds: ["uc-padel-beginner", "uc-padel-control"],
    specifications: {
      shape: "round",
      balance: "low",
      weightMin: 350,
      weightMax: 365,
      core: "soft EVA",
      face: "fiberglass",
      thicknessMm: 38,
      powerPositioning: "low",
      controlPositioning: "high",
      playerLevel: "beginner",
      sweetSpot: "large-central",
    },
    strengths: ["Forgiveness", "Strong value"],
    weaknesses: ["Less premium face materials"],
    recommendationScore: 82,
    valueScore: 95,
    experienceLevels: ["beginner", "intermediate"],
    priceEur: 89,
    imgIndex: 2,
    relatedProductIds: ["prod-head-coello-pro"],
    alternativeProductIds: ["prod-siux-diablo"],
  },
  {
    id: "prod-drop-shot-canyon-pro",
    slug: "drop-shot-canyon-pro-2026",
    brandId: "brand-drop-shot",
    name: "Canyon Pro 2026",
    fullName: "Drop Shot Canyon Pro 2026",
    shortDescription:
      "Teardrop Canyon Pro balancing control and mid-court redirection.",
    useCaseIds: ["uc-padel-balanced", "uc-padel-control"],
    specifications: {
      shape: "teardrop",
      balance: "medium",
      weightMin: 355,
      weightMax: 370,
      core: "EVA Soft",
      face: "12K carbon",
      thicknessMm: 38,
      powerPositioning: "moderate",
      controlPositioning: "high",
      playerLevel: "intermediate",
      sweetSpot: "central",
    },
    strengths: ["Control bias", "Stable mid-court"],
    weaknesses: ["Less explosive on smash"],
    recommendationScore: 86,
    valueScore: 85,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 199,
    imgIndex: 3,
    relatedProductIds: ["prod-bullpadel-vertex-04"],
    alternativeProductIds: ["prod-starvie-titania-kepler"],
  },
  {
    id: "prod-varlion-lw-carbon-difusor",
    slug: "varlion-lw-carbon-difusor-2026",
    brandId: "brand-varlion",
    name: "LW Carbon Difusor 2026",
    fullName: "Varlion LW Carbon Difusor 2026",
    shortDescription:
      "Round LW control racket with Difusor technology for defensive play.",
    useCaseIds: ["uc-padel-control"],
    specifications: {
      shape: "round",
      balance: "low",
      weightMin: 350,
      weightMax: 365,
      core: "Hypersoft",
      face: "carbon",
      thicknessMm: 38,
      powerPositioning: "low",
      controlPositioning: "high",
      playerLevel: "intermediate-advanced",
      sweetSpot: "large-central",
    },
    strengths: ["Defensive control", "Maneuverability"],
    weaknesses: ["Limited smash authority"],
    recommendationScore: 87,
    valueScore: 80,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 249,
    imgIndex: 4,
    relatedProductIds: ["prod-siux-diablo"],
    alternativeProductIds: ["prod-bullpadel-vertex-04"],
  },
  {
    id: "prod-nox-ml10-pro-cup",
    slug: "nox-ml10-pro-cup-2026",
    brandId: "brand-nox",
    name: "ML10 Pro Cup 2026",
    fullName: "Nox ML10 Pro Cup 2026",
    shortDescription:
      "Classic round ML10 control frame for placement-first players.",
    useCaseIds: ["uc-padel-control", "uc-padel-beginner"],
    specifications: {
      shape: "round",
      balance: "low",
      weightMin: 360,
      weightMax: 375,
      core: "HR3",
      face: "fiberglass/carbon",
      thicknessMm: 38,
      powerPositioning: "moderate",
      controlPositioning: "high",
      playerLevel: "intermediate",
      sweetSpot: "large-central",
    },
    strengths: ["Control heritage", "Forgiving geometry"],
    weaknesses: ["Less diamond-style power"],
    recommendationScore: 89,
    valueScore: 86,
    experienceLevels: ["beginner", "intermediate", "advanced"],
    priceEur: 179,
    imgIndex: 0,
    relatedProductIds: ["prod-nox-at10-18k-2026"],
    alternativeProductIds: ["prod-varlion-lw-carbon-difusor"],
  },
  {
    id: "prod-bullpadel-hack-03",
    slug: "bullpadel-hack-03-2026",
    brandId: "brand-bullpadel",
    name: "Hack 03 2026",
    fullName: "Bullpadel Hack 03 2026",
    shortDescription:
      "Aggressive diamond Hack for advanced attackers seeking finishing power.",
    useCaseIds: ["uc-padel-power"],
    specifications: {
      shape: "diamond",
      balance: "head-heavy",
      weightMin: 365,
      weightMax: 380,
      core: "MultiEva",
      face: "12K carbon",
      thicknessMm: 38,
      powerPositioning: "high",
      controlPositioning: "moderate",
      playerLevel: "advanced",
      sweetSpot: "upper",
    },
    strengths: ["Explosive smash", "Attacking profile"],
    weaknesses: ["Less forgiving off-centre"],
    recommendationScore: 90,
    valueScore: 79,
    experienceLevels: ["advanced", "elite"],
    priceEur: 279,
    imgIndex: 1,
    relatedProductIds: ["prod-bullpadel-vertex-04"],
    alternativeProductIds: ["prod-adidas-metalbone-hrd"],
  },
  {
    id: "prod-babolat-counter-viper",
    slug: "babolat-counter-viper-2026",
    brandId: "brand-babolat-padel",
    name: "Counter Viper 2026",
    fullName: "Babolat Counter Viper 2026",
    shortDescription:
      "Hybrid Counter Viper for players who counterpunch then finish.",
    useCaseIds: ["uc-padel-balanced", "uc-padel-power"],
    specifications: {
      shape: "teardrop",
      balance: "medium-high",
      weightMin: 360,
      weightMax: 375,
      core: "Black EVA",
      face: "carbon",
      thicknessMm: 38,
      powerPositioning: "high",
      controlPositioning: "balanced",
      playerLevel: "advanced",
      sweetSpot: "central-upper",
    },
    strengths: ["Counter-to-attack transition", "Solid power reserve"],
    weaknesses: ["Stiffer than soft beginner frames"],
    recommendationScore: 88,
    valueScore: 80,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 269,
    imgIndex: 2,
    relatedProductIds: ["prod-babolat-technical-viper"],
    alternativeProductIds: ["prod-nox-at10-18k-2026"],
  },
  {
    id: "prod-head-extreme-pro-padel",
    slug: "head-extreme-pro-padel-2026",
    brandId: "brand-head-padel",
    name: "Extreme Pro 2026",
    fullName: "Head Extreme Pro Padel 2026",
    shortDescription:
      "Power-leaning Extreme Pro for players who want spin and aggressiveness.",
    useCaseIds: ["uc-padel-power", "uc-padel-balanced"],
    specifications: {
      shape: "diamond",
      balance: "head-heavy",
      weightMin: 360,
      weightMax: 375,
      core: "Power Foam",
      face: "carbon",
      thicknessMm: 38,
      powerPositioning: "high",
      controlPositioning: "moderate",
      playerLevel: "intermediate-advanced",
      sweetSpot: "upper",
    },
    strengths: ["Attacking spin window", "Head Extreme geometry"],
    weaknesses: ["Less round-frame forgiveness"],
    recommendationScore: 85,
    valueScore: 83,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 219,
    imgIndex: 3,
    relatedProductIds: ["prod-head-coello-pro"],
    alternativeProductIds: ["prod-wilson-blade-pro-padel"],
  },
  {
    id: "prod-wilson-blade-pro-padel",
    slug: "wilson-blade-pro-v2-padel-2026",
    brandId: "brand-wilson-padel",
    name: "Blade Pro V2 2026",
    fullName: "Wilson Blade Pro V2 Padel 2026",
    shortDescription:
      "Control-oriented Blade Pro for precise placement and redirected defence.",
    useCaseIds: ["uc-padel-control", "uc-padel-balanced"],
    specifications: {
      shape: "teardrop",
      balance: "medium",
      weightMin: 355,
      weightMax: 370,
      core: "EVA",
      face: "carbon",
      thicknessMm: 38,
      powerPositioning: "moderate",
      controlPositioning: "high",
      playerLevel: "intermediate-advanced",
      sweetSpot: "central",
    },
    strengths: ["Control feel", "Stable redirects"],
    weaknesses: ["Less raw smash than Metalbone/Hack"],
    recommendationScore: 86,
    valueScore: 82,
    experienceLevels: ["intermediate", "advanced"],
    priceEur: 239,
    imgIndex: 4,
    relatedProductIds: ["prod-wilson-bela-pro"],
    alternativeProductIds: ["prod-drop-shot-canyon-pro"],
  },
  {
    id: "prod-starvie-basalto-osiris",
    slug: "starvie-basalto-osiris-2026",
    brandId: "brand-starvie",
    name: "Basalto Osiris 2026",
    fullName: "StarVie Basalto Osiris 2026",
    shortDescription:
      "Diamond Basalto with firm response for advanced power players.",
    useCaseIds: ["uc-padel-power"],
    specifications: {
      shape: "diamond",
      balance: "head-heavy",
      weightMin: 360,
      weightMax: 375,
      core: "EVA Soft 30",
      face: "basalt/carbon",
      thicknessMm: 38,
      powerPositioning: "high",
      controlPositioning: "moderate",
      playerLevel: "advanced",
      sweetSpot: "upper",
    },
    strengths: ["Attacking diamond profile", "Firm finishing punch"],
    weaknesses: ["Less beginner-friendly"],
    recommendationScore: 87,
    valueScore: 81,
    experienceLevels: ["advanced", "elite"],
    priceEur: 259,
    imgIndex: 0,
    relatedProductIds: ["prod-starvie-titania-kepler"],
    alternativeProductIds: ["prod-adidas-metalbone-hrd"],
  },
];

export const wave25Products: Product[] = wave25Drafts.map((d) => ({
  id: d.id,
  slug: d.slug,
  brandId: d.brandId,
  name: d.name,
  fullName: d.fullName,
  shortDescription: d.shortDescription,
  lifecycleStatus: "current" as const,
  sportIds: [padelSportId],
  disciplineIds: [],
  categoryId: "cat-padel-rackets",
  subcategoryIds: [],
  useCaseIds: d.useCaseIds,
  specifications: d.specifications,
  strengths: d.strengths,
  weaknesses: d.weaknesses,
  recommendationScore: d.recommendationScore,
  valueScore: d.valueScore,
  experienceLevels: d.experienceLevels,
  images: padelImg(d.id, d.imgIndex, d.fullName),
  videos: [],
  offerIds: [`offer-${d.slug}-nl`, `offer-${d.slug}-de`, `offer-${d.slug}-uk`],
  evidenceIds: ["ev-wave25-editorial"],
  relatedProductIds: d.relatedProductIds ?? [],
  alternativeProductIds: d.alternativeProductIds ?? [],
  ...pub,
}));

export const wave25Offers: Offer[] = wave25Drafts.flatMap((d) =>
  offerTriplet(d.id, d.slug, d.priceEur),
);

export const wave25Evidence: Evidence[] = [
  {
    id: "ev-wave25-editorial",
    type: "editorial-research",
    source: "Kitletics editorial analysis — padel catalog",
    summary:
      "Richer padel racket specs and positioning from manufacturer pages and reputable EU retailers. Not personal lab testing.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
];

function padelRec(input: {
  id: string;
  productId: string;
  useCaseId: string;
  score: number;
  factors: Recommendation["factors"];
  strengths: string[];
  compromises: string[];
  explanation: string;
}): Recommendation {
  return {
    ...input,
    sportId: padelSportId,
    evidenceIds: ["ev-wave25-editorial"],
  };
}

export const wave25Recommendations: Recommendation[] = [
  padelRec({
    id: "rec-starvie-titania-balanced",
    productId: "prod-starvie-titania-kepler",
    useCaseId: "uc-padel-balanced",
    score: 88,
    factors: [
      { key: "versatility", label: "Versatility", score: 90, weight: 0.45 },
      { key: "sweetspot", label: "Sweet spot", score: 88, weight: 0.35 },
      { key: "value", label: "Value", score: 84, weight: 0.2 },
    ],
    strengths: ["Hybrid teardrop", "Forgiving sweet spot"],
    compromises: ["Not max power"],
    explanation: "All-court StarVie hybrid when balance matters more than pure smash.",
  }),
  padelRec({
    id: "rec-metalbone-power",
    productId: "prod-adidas-metalbone-hrd",
    useCaseId: "uc-padel-power",
    score: 92,
    factors: [
      { key: "power", label: "Power", score: 95, weight: 0.55 },
      { key: "stiffness", label: "Stiffness", score: 90, weight: 0.25 },
      { key: "control", label: "Control", score: 72, weight: 0.2 },
    ],
    strengths: ["Finishing authority", "Rigid attack response"],
    compromises: ["Hard for beginners"],
    explanation: "Aggressive Metalbone pick for advanced attackers.",
  }),
  padelRec({
    id: "rec-kuikma-beginner",
    productId: "prod-kuikma-pr-soft-500",
    useCaseId: "uc-padel-beginner",
    score: 90,
    factors: [
      { key: "forgiveness", label: "Forgiveness", score: 94, weight: 0.5 },
      { key: "value", label: "Value", score: 96, weight: 0.35 },
      { key: "power", label: "Power", score: 60, weight: 0.15 },
    ],
    strengths: ["Soft round control", "Budget-friendly"],
    compromises: ["Less premium materials"],
    explanation: "Best-value beginner control racket when forgiveness comes first.",
  }),
  padelRec({
    id: "rec-kuikma-control",
    productId: "prod-kuikma-pr-soft-500",
    useCaseId: "uc-padel-control",
    score: 84,
    factors: [
      { key: "control", label: "Control", score: 88, weight: 0.55 },
      { key: "value", label: "Value", score: 95, weight: 0.45 },
    ],
    strengths: ["Round control geometry"],
    compromises: ["Not elite-level face tech"],
    explanation: "Control-first value option for club defence.",
  }),
  padelRec({
    id: "rec-drop-shot-balanced",
    productId: "prod-drop-shot-canyon-pro",
    useCaseId: "uc-padel-balanced",
    score: 85,
    factors: [
      { key: "control", label: "Control", score: 88, weight: 0.4 },
      { key: "versatility", label: "Versatility", score: 84, weight: 0.4 },
      { key: "value", label: "Value", score: 85, weight: 0.2 },
    ],
    strengths: ["Teardrop balance", "Stable mid-court"],
    compromises: ["Less smash peak"],
    explanation: "Balanced Drop Shot when placement leads the point construction.",
  }),
  padelRec({
    id: "rec-varlion-control",
    productId: "prod-varlion-lw-carbon-difusor",
    useCaseId: "uc-padel-control",
    score: 89,
    factors: [
      { key: "control", label: "Control", score: 94, weight: 0.55 },
      { key: "maneuverability", label: "Maneuverability", score: 90, weight: 0.3 },
      { key: "power", label: "Power", score: 65, weight: 0.15 },
    ],
    strengths: ["LW defence", "Difusor control"],
    compromises: ["Limited finishing power"],
    explanation: "Premium round control when defence and placement dominate.",
  }),
  padelRec({
    id: "rec-ml10-control",
    productId: "prod-nox-ml10-pro-cup",
    useCaseId: "uc-padel-control",
    score: 90,
    factors: [
      { key: "control", label: "Control", score: 92, weight: 0.5 },
      { key: "forgiveness", label: "Forgiveness", score: 90, weight: 0.3 },
      { key: "value", label: "Value", score: 86, weight: 0.2 },
    ],
    strengths: ["ML10 control heritage", "Approachable"],
    compromises: ["Less diamond power"],
    explanation: "Classic Nox control frame spanning beginner to intermediate.",
  }),
  padelRec({
    id: "rec-ml10-beginner",
    productId: "prod-nox-ml10-pro-cup",
    useCaseId: "uc-padel-beginner",
    score: 87,
    factors: [
      { key: "forgiveness", label: "Forgiveness", score: 90, weight: 0.5 },
      { key: "control", label: "Control", score: 88, weight: 0.35 },
      { key: "value", label: "Value", score: 86, weight: 0.15 },
    ],
    strengths: ["Round forgiveness", "Room to grow"],
    compromises: ["Heavier than some soft starters"],
    explanation: "Beginner-friendly control with a path into club play.",
  }),
  padelRec({
    id: "rec-hack-power",
    productId: "prod-bullpadel-hack-03",
    useCaseId: "uc-padel-power",
    score: 91,
    factors: [
      { key: "power", label: "Power", score: 94, weight: 0.55 },
      { key: "attack", label: "Attack", score: 92, weight: 0.3 },
      { key: "forgiveness", label: "Forgiveness", score: 68, weight: 0.15 },
    ],
    strengths: ["Explosive smash", "Diamond attack"],
    compromises: ["Demanding sweet spot"],
    explanation: "Bullpadel Hack for advanced finishers.",
  }),
  padelRec({
    id: "rec-counter-viper-balanced",
    productId: "prod-babolat-counter-viper",
    useCaseId: "uc-padel-balanced",
    score: 88,
    factors: [
      { key: "versatility", label: "Versatility", score: 88, weight: 0.4 },
      { key: "power", label: "Power", score: 90, weight: 0.4 },
      { key: "control", label: "Control", score: 82, weight: 0.2 },
    ],
    strengths: ["Counter-to-attack", "Hybrid teardrop"],
    compromises: ["Stiffer than soft control frames"],
    explanation: "Balanced Counter Viper when transitions matter as much as smash.",
  }),
  padelRec({
    id: "rec-counter-viper-power",
    productId: "prod-babolat-counter-viper",
    useCaseId: "uc-padel-power",
    score: 86,
    factors: [
      { key: "power", label: "Power", score: 90, weight: 0.55 },
      { key: "versatility", label: "Versatility", score: 85, weight: 0.45 },
    ],
    strengths: ["Power reserve", "Hybrid geometry"],
    compromises: ["Less pure diamond than Hack/Metalbone"],
    explanation: "Power-capable hybrid when you still want mid-court control.",
  }),
  padelRec({
    id: "rec-head-extreme-power",
    productId: "prod-head-extreme-pro-padel",
    useCaseId: "uc-padel-power",
    score: 84,
    factors: [
      { key: "power", label: "Power", score: 88, weight: 0.5 },
      { key: "spin", label: "Spin", score: 86, weight: 0.3 },
      { key: "value", label: "Value", score: 83, weight: 0.2 },
    ],
    strengths: ["Attacking spin", "Extreme geometry"],
    compromises: ["Less round forgiveness"],
    explanation: "Head Extreme Pro when spin-assisted attack is the goal.",
  }),
  padelRec({
    id: "rec-wilson-blade-control",
    productId: "prod-wilson-blade-pro-padel",
    useCaseId: "uc-padel-control",
    score: 86,
    factors: [
      { key: "control", label: "Control", score: 90, weight: 0.5 },
      { key: "feel", label: "Feel", score: 86, weight: 0.3 },
      { key: "power", label: "Power", score: 74, weight: 0.2 },
    ],
    strengths: ["Blade control feel", "Stable redirects"],
    compromises: ["Less smash peak"],
    explanation: "Wilson Blade Pro for placement-first intermediates.",
  }),
  padelRec({
    id: "rec-wilson-blade-balanced",
    productId: "prod-wilson-blade-pro-padel",
    useCaseId: "uc-padel-balanced",
    score: 84,
    factors: [
      { key: "versatility", label: "Versatility", score: 86, weight: 0.5 },
      { key: "control", label: "Control", score: 88, weight: 0.5 },
    ],
    strengths: ["Teardrop balance", "Control bias"],
    compromises: ["Not a pure power diamond"],
    explanation: "Balanced Blade Pro when control still leads the setup.",
  }),
  padelRec({
    id: "rec-basalto-power",
    productId: "prod-starvie-basalto-osiris",
    useCaseId: "uc-padel-power",
    score: 87,
    factors: [
      { key: "power", label: "Power", score: 90, weight: 0.55 },
      { key: "stiffness", label: "Response", score: 88, weight: 0.25 },
      { key: "value", label: "Value", score: 81, weight: 0.2 },
    ],
    strengths: ["Diamond attack", "Firm finishing punch"],
    compromises: ["Less beginner-friendly"],
    explanation: "StarVie Basalto for advanced power players.",
  }),
];
