import type {
  AwardType,
  BestGuide,
  BestGuideRecommendation,
  ConsideredProductNote,
  GuideChooseInsteadWhen,
  GuideLookForFactor,
  SelectionCriterion,
} from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export const PADEL_SPORT = "sport-padel" as const;

export function ev(productId: string): string[] {
  return [`ev-${productId}-editorial`, `ev-${productId}-mfr`, "ev-catalog-editorial"];
}

export type Instead = {
  productId: string;
  when: string;
  label?: string;
};

export function pick(input: {
  productId: string;
  rank: number;
  awardType?: AwardType;
  badge?: string;
  role: string;
  summary: string;
  whyWon: string;
  whyFits: [string, string, ...string[]];
  bestFor: string[];
  tradeoff: string;
  extraTradeoffs?: string[];
  avoid: string[];
  instead: Instead[];
  useCaseIds?: string[];
  works?: string[];
  lessSuited?: string[];
  evidenceIds?: string[];
}): BestGuideRecommendation {
  const chooseInsteadWhen: GuideChooseInsteadWhen[] = input.instead.map((row) => ({
    productId: row.productId,
    when: row.when,
    label: row.label,
  }));
  const tradeoffs = [input.tradeoff, ...(input.extraTradeoffs ?? [])];
  return {
    productId: input.productId,
    rank: input.rank,
    awardType: input.awardType,
    badge: input.badge,
    summary: input.summary,
    whyRecommended: input.whyWon,
    whyItWon: input.whyWon,
    whyItFits: input.whyFits,
    rationale: input.summary,
    decisionRole: input.role,
    useCaseStrengths: input.bestFor.slice(0, 3),
    strengths: input.bestFor.slice(0, 3),
    tradeoffs,
    compromises: tradeoffs,
    bestForProfiles: input.bestFor,
    notIdealFor: input.avoid,
    whoShouldAvoid: input.avoid,
    chooseInsteadWhen,
    considerInsteadProductIds: input.instead.map((row) => row.productId),
    evidenceIds: input.evidenceIds ?? ev(input.productId),
    useCaseIds: input.useCaseIds,
    worksWellFor: input.works ?? input.bestFor,
    lessSuitedTo: input.lessSuited ?? input.avoid,
  };
}

export function considered(
  productId: string,
  reason: string,
  kind: NonNullable<ConsideredProductNote["kind"]>,
  extra?: Partial<ConsideredProductNote>,
): ConsideredProductNote {
  return { productId, reason, kind, ...extra };
}

export function method(intent: string): {
  selectionMethodology: string;
  methodologySummary: string;
} {
  const selectionMethodology = `Considered: published current padel products whose specs and manufacturer job match ${intent}. Previous-generation and photo-blocked drafts stay labelled, not awarded. Shortlist requires a distinct role in this guide — not a clone of another pick. Recommended products won that specific use case on shape, balance, weight band, face/core, and honest skip signals. Affiliate commission does not influence considered, shortlisted, recommended, rank, or award decisions.`;
  return {
    selectionMethodology,
    methodologySummary: selectionMethodology,
  };
}

export function baseGuide(
  input: Omit<
    BestGuide,
    | "faqIds"
    | "status"
    | "publishedAt"
    | "createdAt"
    | "updatedAt"
    | "useCaseIds"
    | "comparisonProductIds"
  > & {
    faqIds?: string[];
    useCaseIds?: string[];
    comparisonProductIds?: string[];
  },
): BestGuide {
  const recIds = input.recommendations.map((r) => r.productId);
  const consideredIds = unique([
    ...(input.consideredProductIds ?? []),
    ...(input.consideredProducts ?? []).map((n) => n.productId),
    ...recIds,
  ]);
  const shortlisted = unique([
    ...(input.shortlistedProductIds ?? recIds),
    ...recIds,
  ]);
  const evidenceIds = unique([
    ...(input.evidenceIds ?? ["ev-catalog-editorial", "ev-catalog-mfr"]),
    ...input.recommendations.flatMap((r) => r.evidenceIds ?? []),
  ]);
  const comparisonProductIds =
    input.comparisonProductIds && input.comparisonProductIds.length > 0
      ? input.comparisonProductIds
      : recIds;
  return {
    authorId: "author-kitletics-editorial",
    faqIds: input.faqIds ?? [],
    useCaseIds: input.useCaseIds ?? [],
    nextReviewAt: "2026-11-01",
    ...pub,
    ...input,
    consideredProductIds: consideredIds,
    shortlistedProductIds: shortlisted,
    comparisonProductIds,
    evidenceIds,
  };
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

export const racketCriteria: SelectionCriterion[] = [
  {
    key: "shape",
    label: "Shape",
    description:
      "Round, hybrid/teardrop or diamond — the first filter for sweet-spot height and swing tax.",
  },
  {
    key: "balance",
    label: "Balance",
    description: "Low/medium for handling; high for finishing. Not a personality type.",
  },
  {
    key: "weight",
    label: "Published weight",
    description: "Manufacturer gram band. A 350 g hybrid is not the same job as a 370 g diamond.",
  },
  {
    key: "level",
    label: "Player level",
    description: "Beginner and professional listings are filters, not marketing compliments.",
  },
  {
    key: "construction",
    label: "Face and core",
    description: "Soft/round vs stiff carbon. K-count is a family label, not a quality rank.",
  },
];

export const shoeCriteria: SelectionCriterion[] = [
  {
    key: "surface",
    label: "Padel-specific outsole",
    description:
      "Herringbone or listed padel court rubber. Tennis crossovers stay labelled, not awarded as padel defaults.",
  },
  {
    key: "lateral",
    label: "Lateral stability",
    description: "High lateral last for glass-court cuts — not a running-stability shoe.",
  },
  {
    key: "cushion",
    label: "Court cushioning",
    description: "Plush vs connected court feel. Boost/GEL is a comfort spend, not a ranking bonus.",
  },
  {
    key: "last",
    label: "Last and fit",
    description:
      "Men’s, women’s, and unisex lasts are different lasts. A lighter men’s shoe is not a women’s last.",
  },
];

export const gripCriteria: SelectionCriterion[] = [
  {
    key: "gripType",
    label: "Overgrip vs replacement grip",
    description: "Overgrips wrap over the base. Replacement grips and comfort sleeves are different jobs.",
  },
  {
    key: "tack",
    label: "Tack vs absorption",
    description: "Thin tack for feel; absorbent wraps when sweat kills Wilson Pro mid-set.",
  },
  {
    key: "thickness",
    label: "Thickness",
    description: "Thin overgrips keep grip size. Comfort sleeves change handle diameter.",
  },
];

export const bagCriteria: SelectionCriterion[] = [
  {
    key: "form",
    label: "Paletero vs backpack",
    description: "Club paletero, tournament duffel, or commute backpack — three different carry jobs.",
  },
  {
    key: "thermo",
    label: "Thermal protection",
    description: "Thermo pockets keep frames out of the sun. Day backpacks may skip that.",
  },
  {
    key: "capacity",
    label: "Racket and shoe capacity",
    description: "Published litre / racket counts. A 42 L Team bag is not a 62 L RH Pro.",
  },
];

export const racketLookFor: GuideLookForFactor[] = [
  {
    key: "shape",
    label: "Shape and sweet-spot height",
    whyItMatters:
      "Round centres the sweet spot; diamond lifts it for finishing and punishes late preparation.",
    importance: "high",
  },
  {
    key: "balance",
    label: "Balance and swing tax",
    whyItMatters:
      "High balance adds smash mass; low/medium keeps defence and volleys on time.",
    importance: "high",
  },
  {
    key: "weight",
    label: "Published gram band",
    whyItMatters:
      "350–360 g and 365–375 g are different handling jobs even inside one family.",
    importance: "high",
  },
  {
    key: "level",
    label: "Manufacturer player level",
    whyItMatters:
      "A professional diamond will not teach timing. Beginner rounds exist for a reason.",
    importance: "high",
  },
  {
    key: "core",
    label: "Face and core",
    whyItMatters:
      "SoftEva / Fibrix / 12K / 18K change feel. K-count is not a quality ladder.",
    importance: "medium",
  },
];

export function racketGuide(
  input: Omit<BestGuide, "faqIds" | "status" | "publishedAt" | "createdAt" | "updatedAt" | "sportId" | "categoryId" | "selectionCriteria" | "selectionMethodology" | "methodologySummary"> & {
    intent: string;
    faqIds?: string[];
    selectionCriteria?: SelectionCriterion[];
    relatedGuideIds?: string[];
  },
): BestGuide {
  const m = method(input.intent);
  const { intent: _intent, ...rest } = input;
  void _intent;
  return baseGuide({
    sportId: PADEL_SPORT,
    categoryId: "cat-padel-rackets",
    relatedBuyingGuideIds: [
      "guide-choose-padel-racket",
      "guide-padel-racket-shapes",
      "guide-round-vs-teardrop-vs-diamond",
      "guide-padel-racket-balance",
      "guide-soft-vs-hard-padel-rackets",
      "guide-beginner-padel-gear",
    ],
    relatedToolSlugs: ["padel-racket-finder"],
    selectionCriteria: input.selectionCriteria ?? racketCriteria,
    whatWeLookFor: input.whatWeLookFor ?? racketLookFor,
    ...m,
    ...rest,
  });
}

export const shoeLookFor: GuideLookForFactor[] = [
  {
    key: "outsole",
    label: "Padel court outsole",
    whyItMatters:
      "Herringbone or listed padel rubber on sand-filled turf. Tennis crossovers are labelled, not awarded as defaults.",
    importance: "high",
  },
  {
    key: "lateral",
    label: "Lateral last",
    whyItMatters: "Glass-court cuts need a court last, not a running-stability post.",
    importance: "high",
  },
  {
    key: "last",
    label: "GenderFit last",
    whyItMatters:
      "Men’s, women’s, and unisex lasts are different. A lighter men’s shoe is not a women’s last.",
    importance: "high",
  },
  {
    key: "cushion",
    label: "Court cushioning",
    whyItMatters: "Boost/GEL is a comfort spend on court. Connected racers are a different job.",
    importance: "medium",
  },
];

export function shoeEv(productId: string): string[] {
  return [`ev-${productId}-editorial`, "ev-catalog-editorial"];
}

export function shoeGuide(
  input: Omit<
    BestGuide,
    | "faqIds"
    | "status"
    | "publishedAt"
    | "createdAt"
    | "updatedAt"
    | "sportId"
    | "categoryId"
    | "selectionCriteria"
    | "selectionMethodology"
    | "methodologySummary"
  > & {
    intent: string;
    faqIds?: string[];
  },
): BestGuide {
  const m = method(input.intent);
  const { intent: _intent, ...rest } = input;
  void _intent;
  return baseGuide({
    sportId: PADEL_SPORT,
    categoryId: "cat-padel-shoes",
    relatedBuyingGuideIds: [
      "guide-choose-padel-shoes",
      "guide-padel-vs-tennis-shoes",
      "guide-padel-shoe-outsoles",
    ],
    selectionCriteria: shoeCriteria,
    whatWeLookFor: input.whatWeLookFor ?? shoeLookFor,
    ...m,
    ...rest,
  });
}

export const RACKET_RELATED = [
  "best-padel-rackets",
  "best-padel-rackets-beginners",
  "best-padel-rackets-intermediate",
  "best-padel-rackets-advanced",
  "best-padel-rackets-control",
  "best-padel-rackets-power",
  "best-padel-rackets-all-round",
  "best-padel-rackets-lightweight",
  "best-padel-rackets-comfort",
  "best-padel-rackets-maneuverability",
  "best-padel-rackets-women",
  "best-padel-rackets-value",
] as const;

export const SHOE_RELATED = [
  "best-padel-shoes",
  "best-padel-shoes-men",
  "best-padel-shoes-women",
  "best-padel-shoes-stability",
  "best-padel-shoes-comfort",
  "best-padel-shoes-lightweight",
  "best-padel-shoes-value",
] as const;
