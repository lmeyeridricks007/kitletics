import { z } from "zod";
import { publishFieldsSchema, seoFieldsSchema } from "@/domain/shared/schemas";

export const contentSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string(),
  body: z.string(),
  evidenceIds: z.array(z.string()).optional(),
});

export const reviewTypeSchema = z.enum([
  "first-hand-test",
  "expert-research",
  "hybrid",
]);

export const productSourceSchema = z.enum([
  "purchased-by-kitletics",
  "purchased-by-reviewer",
  "provided-by-brand",
  "loaned-by-brand",
  "retailer-sample",
  "other",
]);

export const reviewTestingContextSchema = z.object({
  distanceKm: z.number().nonnegative().optional(),
  durationDays: z.number().nonnegative().optional(),
  durationHours: z.number().nonnegative().optional(),
  surfaces: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  runnerProfile: z.string().optional(),
  comparisonShoes: z.array(z.string()).optional(),
  productSource: productSourceSchema.optional(),
  notes: z.string().optional(),
});

export const authorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().optional(),
  bio: z.string().min(1),
  sportIds: z.array(z.string()),
  expertise: z.array(z.string()),
  image: z
    .object({
      id: z.string(),
      src: z.string(),
      alt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      type: z.enum(["image", "video", "logo", "icon"]),
      credit: z.string().optional(),
    })
    .optional(),
  socialLinks: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .optional(),
  disclosure: z.string().optional(),
});

export const reviewCriteriaDefinitionSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  weight: z.number().min(0).max(1).optional(),
});

export const faqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  sportId: z.string().optional(),
});

export const scoreBreakdownItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number(),
  max: z.number().optional(),
  note: z.string().optional(),
});

export const reviewSchema = publishFieldsSchema.merge(seoFieldsSchema).extend({
  id: z.string().min(1),
  slug: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  reviewType: reviewTypeSchema,
  verdict: z.string(),
  bottomLine: z.string().optional(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  reviewerId: z.string().optional(),
  testingContext: z.string().optional(),
  testingDetails: reviewTestingContextSchema.optional(),
  productSource: productSourceSchema.optional(),
  editorialDisclosure: z.string().optional(),
  sections: z.array(contentSectionSchema),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  whoShouldBuy: z.array(z.string()),
  whoShouldAvoid: z.array(z.string()),
  scoreBreakdown: z.array(scoreBreakdownItemSchema),
  evidenceIds: z.array(z.string()).min(1),
  alternativeProductIds: z.array(z.string()),
  comparisonIds: z.array(z.string()),
  relatedBuyingGuideIds: z.array(z.string()).optional(),
  faqIds: z.array(z.string()),
});

export const awardTypeSchema = z.enum([
  "best-overall",
  "best-value",
  "best-premium",
  "best-beginner",
  "best-daily",
  "best-long-run",
  "best-race",
  "best-cushioned",
  "best-stability",
  "best-trail",
  "best-tempo",
  "best-lightweight",
  "best-durable",
  "best-fit",
  "editors-pick",
]);

export const selectionCriterionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  weight: z.number().min(0).max(1).optional(),
});

export const consideredProductNoteSchema = z.object({
  productId: z.string().min(1),
  reason: z.string().min(1),
  kind: z
    .enum([
      "considered",
      "shortlisted",
      "recommended",
      "honorable-mention",
      "previous-pick",
      "removed",
      "rejected",
    ])
    .optional(),
  reasonCode: z
    .enum([
      "overlap",
      "previous-generation",
      "context-mismatch",
      "niche",
      "lower-context-fit",
      "insufficient-evidence",
      "availability",
      "value",
      "redundant-role",
    ])
    .optional(),
  stillConsiderIf: z.string().optional(),
  closestRecommendedProductId: z.string().optional(),
});

export const guideChooseInsteadWhenSchema = z.object({
  when: z.string().min(1),
  productId: z.string().optional(),
  label: z.string().optional(),
});

export const guideLookForFactorSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  whyItMatters: z.string().min(1),
  importance: z.enum(["high", "medium", "low"]).optional(),
});

export const guideDecisionShortcutSchema = z.object({
  need: z.string().min(1),
  productId: z.string().min(1),
  reason: z.string().optional(),
});

export const bestGuideRecommendationSchema = z.object({
  productId: z.string().min(1),
  rank: z.number().int().positive(),
  awardType: awardTypeSchema.optional(),
  badge: z.string().optional(),
  summary: z.string().optional(),
  whyRecommended: z.string().optional(),
  rationale: z.string().min(1),
  whyItFits: z.array(z.string()).optional(),
  whyItWon: z.string().optional(),
  useCaseStrengths: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  tradeoffs: z.array(z.string()).optional(),
  compromises: z.array(z.string()).optional(),
  bestForProfiles: z.array(z.string()).optional(),
  notIdealFor: z.array(z.string()).optional(),
  whoShouldAvoid: z.array(z.string()).optional(),
  chooseInsteadWhen: z.array(guideChooseInsteadWhenSchema).optional(),
  decisionRole: z.string().optional(),
  paceCharacter: z.string().optional(),
  worksWellFor: z.array(z.string()).optional(),
  lessSuitedTo: z.array(z.string()).optional(),
  useCaseIds: z.array(z.string()).optional(),
  recommendationId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  considerInsteadProductIds: z.array(z.string()).optional(),
});

export const bestGuideSchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    shortDescription: z.string().optional(),
    sportId: z.string().min(1),
    categoryId: z.string().min(1),
    sportIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    useCaseIds: z.array(z.string()),
    disciplineIds: z.array(z.string()).optional(),
    rankingMode: z.enum(["ranked", "category-picks"]),
    guideKind: z.enum(["category", "use-case"]).optional(),
    intro: z.string(),
    whatMattersIntro: z.string().optional(),
    whatWeLookFor: z.array(guideLookForFactorSchema).optional(),
    quickTake: z.array(z.string()).optional(),
    decisionShortcuts: z.array(guideDecisionShortcutSchema).optional(),
    methodologySummary: z.string().optional(),
    selectionMethodology: z.string(),
    selectionCriteria: z.array(selectionCriterionSchema),
    criteriaChangePoints: z
      .array(
        z.object({
          label: z.string(),
          explanation: z.string(),
        }),
      )
      .optional(),
    recommendations: z.array(bestGuideRecommendationSchema).min(1),
    consideredProducts: z.array(consideredProductNoteSchema).optional(),
    consideredProductIds: z.array(z.string().min(1)).optional(),
    shortlistedProductIds: z.array(z.string().min(1)).optional(),
    intentionallyNarrow: z.boolean().optional(),
    comparisonProductIds: z.array(z.string()),
    buyingAdvice: z.string(),
    howToChooseSections: z.array(contentSectionSchema).optional(),
    faqIds: z.array(z.string()),
    authorId: z.string().optional(),
    evidenceIds: z.array(z.string()).optional(),
    relatedGuideIds: z.array(z.string()).optional(),
    relatedBuyingGuideIds: z.array(z.string()).optional(),
    relatedToolSlugs: z.array(z.string()).optional(),
    relatedComparisonIds: z.array(z.string()).optional(),
    useCaseShortcuts: z
      .array(
        z.object({
          useCaseId: z.string(),
          label: z.string(),
          href: z.string(),
        }),
      )
      .optional(),
    nextReviewAt: z.string().optional(),
  });

export const comparisonCriterionSchema = z.object({
  key: z.string(),
  label: z.string(),
  specKey: z.string().optional(),
  winnerProductId: z.string().optional(),
  notes: z.string().optional(),
});

export const comparisonUseCasePickSchema = z.object({
  useCaseId: z.string(),
  productId: z.string(),
  rationale: z.string(),
});

export const comparisonKeyDifferenceSchema = z.object({
  key: z.string().optional(),
  label: z.string().min(1),
  productImpacts: z.array(
    z.object({ productId: z.string(), impact: z.string() }),
  ),
  explanation: z.string(),
  evidenceIds: z.array(z.string()).optional(),
});

export const comparisonChooseReasonSchema = z.object({
  productId: z.string().min(1),
  context: z.string().optional(),
  reason: z.string().min(1),
  evidenceIds: z.array(z.string()).optional(),
});

export const comparisonSchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    shortDescription: z.string().optional(),
    productIds: z.array(z.string()).min(2),
    categoryId: z.string().optional(),
    comparisonType: z.enum(["editorial", "generated", "hybrid"]),
    summary: z.string(),
    winnerProductId: z.string().optional(),
    winnerReason: z.string().optional(),
    criteria: z.array(comparisonCriterionSchema),
    recommendationsByUseCase: z.array(comparisonUseCasePickSchema),
    keyDifferences: z.array(comparisonKeyDifferenceSchema).optional(),
    chooseProductReasons: z.array(comparisonChooseReasonSchema).optional(),
    editorialSections: z.array(contentSectionSchema).optional(),
    evidenceIds: z.array(z.string()).optional(),
    verdict: z.string(),
    faqIds: z.array(z.string()),
    isGenerationComparison: z.boolean().optional(),
    upgradeAdvice: z
      .object({
        upgradeIf: z.array(z.string()),
        keepOlderIf: z.array(z.string()),
      })
      .optional(),
  });

export const buyingGuideSchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    shortDescription: z.string().optional(),
    sportId: z.string().min(1),
    categoryId: z.string().optional(),
    relatedProductIds: z.array(z.string()),
    relatedUseCaseIds: z.array(z.string()),
    sections: z.array(contentSectionSchema),
    quickAnswer: z.string().optional(),
    faqIds: z.array(z.string()),
    authorId: z.string().optional(),
    relatedBestGuideIds: z.array(z.string()).optional(),
    relatedToolSlugs: z.array(z.string()).optional(),
    relatedComparisonIds: z.array(z.string()).optional(),
    relatedGuideIds: z.array(z.string()).optional(),
    guideType: z
      .enum([
        "buying",
        "explainer",
        "comparison",
        "setup",
        "decision",
        "technical",
      ])
      .optional(),
    topicIds: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    startHere: z.boolean().optional(),
    priority: z.number().int().optional(),
    hubImageSrc: z.string().optional(),
    hubImageAlt: z.string().optional(),
  });

export const gearSetupItemImportanceSchema = z.enum([
  "required",
  "recommended",
  "optional",
  "future-addition",
]);

export const gearSetupItemSchema = z.object({
  productId: z.string().min(1),
  role: z.string(),
  roleLabel: z.string().optional(),
  importance: gearSetupItemImportanceSchema.optional(),
  rationale: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  notes: z.string().optional(),
  optional: z.boolean().optional(),
  alternativeProductIds: z.array(z.string()).optional(),
  evidenceIds: z.array(z.string()).optional(),
});

export const gearSetupNextItemSchema = z.object({
  productId: z.string().min(1),
  role: z.string(),
  roleLabel: z.string().optional(),
  notes: z.string().optional(),
  contextLabel: z.string().optional(),
});

export const gearSetupSchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    slug: z.string().min(1),
    slugAliases: z.array(z.string()).optional(),
    sportId: z.string().min(1),
    disciplineId: z.string().optional(),
    title: z.string().min(1),
    description: z.string(),
    useCaseIds: z.array(z.string()),
    budgetRange: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string(),
      })
      .optional(),
    items: z.array(gearSetupItemSchema),
    nextItems: z.array(gearSetupNextItemSchema).optional(),
    variantSetupIds: z.array(z.string()).optional(),
    relatedGuideIds: z.array(z.string()).optional(),
    relatedBestGuideIds: z.array(z.string()).optional(),
    finderToolSlug: z.string().optional(),
    builderToolSlug: z.string().optional(),
    howWeChooseHref: z.string().optional(),
    eyebrow: z.string().optional(),
    heroImageSrc: z.string().optional(),
    whyTitle: z.string().optional(),
    whyReasons: z.array(z.string()).optional(),
    summaryFocus: z
      .array(z.object({ title: z.string(), detail: z.string() }))
      .optional(),
    curatedBy: z.string().optional(),
    nextReviewAt: z.string().optional(),
    checklist: z.array(z.string()).optional(),
    setupType: z.enum(["editorial", "generated", "hybrid"]).optional(),
    experienceLevel: z.string().optional(),
    goalLabel: z.string().optional(),
  });
