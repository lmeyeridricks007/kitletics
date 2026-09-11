import type { BuyingGuide, Comparison, GearSetup } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  padelBuyingGuides,
  padelSetups,
} from "@/content/padel/seed";
import { padelAllComparisons } from "@/content/padel";
import {
  racketBuyingGuides,
  racketComparisons,
  racketSetups,
} from "@/content/racket";
import {
  fitnessBuyingGuides,
  fitnessComparisons,
  fitnessGearSetups,
} from "@/content/fitness";
import { hyroxBuyingGuides } from "@/content/hyrox/editorial";
import { runningComparisons } from "@/content/running/comparisons";
import { runningBuyingGuides } from "@/content/running/buying-guides";
import { runningDensityBuyingGuides } from "@/content/running/buying-guides-density";
import { runningGearSetups } from "@/content/running/setups";
import { applyGearSetupP45Enrichment } from "@/content/gear-setups-p45";
import { buyingGuideMetadataFill } from "@/content/buying-guide-metadata-fill";
import { applyComparisonDepthEnrichment } from "@/content/running/comparison-depth-enrichment";
import { applyComparisonP41Completion } from "@/content/comparisons-p41-completion";
import { applyBuyingGuideComparisonLinks } from "@/content/running/buying-guide-compare-links";
import { applyGuideP40JourneyEnrichment } from "@/content/guides-p40-journey";
import { applyGuideP46IntentRoles } from "@/content/guides-p46-intent-roles";

export { bestGuides } from "@/content/best-guides";

const pub = publishedMeta();

export const comparisons: Comparison[] = applyComparisonP41Completion(
  applyComparisonDepthEnrichment([
  ...runningComparisons,  {
    id: "cmp-nb5-nimbus",
    slug: "asics-novablast-5-vs-asics-gel-nimbus-27",
    title: "ASICS Novablast 5 vs ASICS GEL-Nimbus 27",
    shortDescription:
      "Versatile energetic daily trainer versus maximum-cushion comfort shoe.",
    productIds: ["prod-novablast-5", "prod-nimbus-27"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Novablast 5 is the more versatile, livelier option. Nimbus 27 is the better choice for maximum cushioning and easy mileage.",
    winnerProductId: undefined,
    winnerReason:
      "No universal winner — pick by ride preference and weekly mix.",
    criteria: [
      {
        key: "cushion",
        label: "Cushion",
        specKey: "cushionLevel",
        winnerProductId: "prod-nimbus-27",
        notes: "More plush maximum cushioning",
      },
      {
        key: "energy",
        label: "Energy / bounce",
        specKey: "energyReturn",
        winnerProductId: "prod-novablast-5",
        notes: "Livelier energy return for mixed paces",
      },
      { key: "drop", label: "Drop", specKey: "drop" },
      {
        key: "widths",
        label: "Width options",
        specKey: "widthOptions",
        winnerProductId: "prod-nimbus-27",
        notes: "Wide width options",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-5",
        rationale:
          "More versatile across easy and moderate-paced running.",
      },
      {
        useCaseId: "uc-recovery-runs",
        productId: "prod-nimbus-27",
        rationale: "Softer, more protective ride for recovery.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-nimbus-27",
        rationale: "More cushioning and comfort-focused ride.",
      },
      {
        useCaseId: "uc-heavy",
        productId: "prod-nimbus-27",
        rationale: "Maximum cushion and width options.",
      },
    ],
    keyDifferences: [
      {
        key: "ride",
        label: "Ride character",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "Livelier, more versatile" },
          { productId: "prod-nimbus-27", impact: "Softer, more protective" },
        ],
        explanation:
          "Novablast suits more varied paces; Nimbus prioritises comfort on easy and long miles.",
        evidenceIds: ["ev-nb5-editorial", "ev-nimbus-editorial"],
      },
      {
        key: "cushionLevel",
        label: "Cushion level",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "High" },
          { productId: "prod-nimbus-27", impact: "Maximum" },
        ],
        explanation:
          "Both are cushioned road shoes; Nimbus sits at the max-cushion end of the spectrum.",
        evidenceIds: ["ev-nb5-mfr", "ev-nimbus-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-5",
        reason: "You want one shoe for varied weekly training.",
        evidenceIds: ["ev-nb5-editorial"],
      },
      {
        productId: "prod-novablast-5",
        reason: "You want something lighter and more responsive.",
      },
      {
        productId: "prod-novablast-5",
        reason: "You mix easy mileage with occasional faster work.",
      },
      {
        productId: "prod-nimbus-27",
        reason: "Comfort is your priority.",
        evidenceIds: ["ev-nimbus-editorial"],
      },
      {
        productId: "prod-nimbus-27",
        reason: "Most runs are easy or long.",
      },
      {
        productId: "prod-nimbus-27",
        reason: "You prefer maximum cushioning and width options.",
      },
    ],
    editorialSections: [
      {
        id: "strengths-nb5",
        heading: "Novablast 5 relative strengths",
        body: "More versatile weekly training tool, livelier ride, better when you mix paces.",
      },
      {
        id: "strengths-nimbus",
        heading: "Nimbus 27 relative strengths",
        body: "More cushioned, better recovery-run comfort, more protective easy-mile ride.",
      },
      {
        id: "tradeoffs",
        heading: "Trade-offs",
        body: "Novablast is less plush than Nimbus and not a dedicated race shoe. Nimbus is heavier and less suited to faster work.",
      },
    ],
    evidenceIds: ["ev-nb5-mfr", "ev-nb5-editorial", "ev-nimbus-editorial"],
    verdict:
      "Choose Novablast 5 for fun daily energy and mixed training; choose Nimbus 27 when maximum plush and widths matter most.",
    faqIds: [
      "faq-compare-nb5-nimbus-1",
      "faq-compare-nb5-nimbus-2",
      "faq-compare-nb5-nimbus-3",
      "faq-compare-1",
    ],
    seoTitle: "ASICS Novablast 5 vs GEL-Nimbus 27: Which Is Better? | Kitletics",
    seoDescription:
      "Compare cushioning, weight, ride, use cases and current pricing to see which ASICS shoe better fits your training.",
    ...pub,
  },
  {
    id: "cmp-nb5-ghost",
    slug: "asics-novablast-5-vs-brooks-ghost-16",
    title: "ASICS Novablast 5 vs Brooks Ghost 16",
    shortDescription: "Energetic ASICS daily vs soft, fit-friendly Brooks classic.",
    productIds: ["prod-novablast-5", "prod-ghost-16"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary: "Energetic ASICS daily vs soft, fit-friendly Brooks classic.",
    criteria: [
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "drop", label: "Drop", specKey: "drop" },
      {
        key: "widths",
        label: "Width options",
        specKey: "widthOptions",
        winnerProductId: "prod-ghost-16",
        notes: "Broader width range",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginners",
        productId: "prod-ghost-16",
        rationale: "Width range and approachable ride.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-5",
        rationale: "More energetic daily feel.",
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-5",
        reason: "You want a livelier daily trainer.",
      },
      {
        productId: "prod-ghost-16",
        reason: "Fit flexibility and width options matter most.",
      },
    ],
    evidenceIds: ["ev-nb5-editorial"],
    verdict: "Ghost wins fit flexibility; Novablast wins bounce.",
    faqIds: ["faq-compare-1"],
    seoTitle: "ASICS Novablast 5 vs Brooks Ghost 16: Which Is Better? | Kitletics",
    seoDescription:
      "Compare ride, cushioning, fit and use cases to choose between Novablast 5 and Ghost 16.",
    ...pub,
  },
  {
    id: "cmp-nb4-nb5",
    slug: "asics-novablast-4-vs-asics-novablast-5",
    title: "ASICS Novablast 4 vs ASICS Novablast 5",
    shortDescription: "Previous vs current Novablast generation.",
    productIds: ["prod-novablast-4", "prod-novablast-5"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    isGenerationComparison: true,
    summary:
      "Novablast 5 is the current daily trainer in the family. Novablast 4 remains useful when discounted, but is previous-generation.",
    winnerProductId: "prod-novablast-5",
    winnerReason: "Current generation with fuller structured recommendation coverage.",
    criteria: [
      { key: "drop", label: "Drop", specKey: "drop" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-5",
        rationale: "Current generation with stronger daily-training coverage.",
      },
    ],
    keyDifferences: [
      {
        label: "Generation status",
        productImpacts: [
          { productId: "prod-novablast-4", impact: "Previous generation" },
          { productId: "prod-novablast-5", impact: "Current generation" },
        ],
        explanation:
          "Novablast 5 supersedes Novablast 4 as the current family daily trainer.",
        evidenceIds: ["ev-nb5-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-5",
        reason: "You want the current Novablast daily trainer.",
      },
      {
        productId: "prod-novablast-4",
        reason: "You find a strong discount and already like the Novablast ride.",
      },
    ],
    upgradeAdvice: {
      upgradeIf: [
        "Your Novablast 4 is worn out and you still like the family ride.",
        "You want the current model with fuller Kitletics recommendation coverage.",
      ],
      keepOlderIf: [
        "Your Novablast 4 still feels good and has remaining life.",
        "A heavily discounted 4 meets your easy-mileage needs.",
      ],
    },
    evidenceIds: ["ev-nb5-editorial"],
    verdict:
      "Upgrade to Novablast 5 when replacing a worn pair; keep Novablast 4 if it still feels good or is heavily discounted.",
    faqIds: ["faq-compare-nb4-nb5-1"],
    seoTitle: "ASICS Novablast 4 vs Novablast 5: Worth Upgrading? | Kitletics",
    seoDescription:
      "See what changed between Novablast generations and whether upgrading from 4 to 5 makes sense for your training.",
    ...pub,
  },
  ...padelAllComparisons,
  ...racketComparisons,
  ...fitnessComparisons,
  ]),
);

const buyingGuidesBase: BuyingGuide[] = [
  ...runningBuyingGuides,
  ...runningDensityBuyingGuides,
  ...padelBuyingGuides,
  ...racketBuyingGuides,
  ...fitnessBuyingGuides,
  ...hyroxBuyingGuides,
].map((guide) => {
  const fill = buyingGuideMetadataFill[guide.id];
  if (!fill) return guide;
  return {
    ...guide,
    shortDescription: guide.shortDescription?.trim()
      ? guide.shortDescription
      : fill.shortDescription,
    quickAnswer: guide.quickAnswer?.trim()
      ? guide.quickAnswer
      : fill.quickAnswer,
    relatedProductIds:
      guide.relatedProductIds.length > 0
        ? guide.relatedProductIds
        : (fill.relatedProductIds ?? guide.relatedProductIds),
  };
});

export const buyingGuides: BuyingGuide[] = applyGuideP46IntentRoles(
  applyGuideP40JourneyEnrichment(
    applyBuyingGuideComparisonLinks(buyingGuidesBase, comparisons),
  ),
);

export const gearSetups: GearSetup[] = [
  ...runningGearSetups,
  ...padelSetups,
  ...racketSetups,
  ...fitnessGearSetups,
].map(applyGearSetupP45Enrichment);
