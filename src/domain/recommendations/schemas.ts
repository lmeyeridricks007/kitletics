import { z } from "zod";

export const recommendationFactorSchema = z.object({
  key: z.string().min(1),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  explanation: z.string(),
});

export const recommendationSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sportId: z.string().min(1),
  disciplineId: z.string().optional(),
  useCaseId: z.string().optional(),
  score: z.number().min(0).max(100),
  factors: z.array(recommendationFactorSchema),
  strengths: z.array(z.string()),
  compromises: z.array(z.string()),
  explanation: z.string(),
  evidenceIds: z.array(z.string()),
});

export const productSourceSchema = z.enum([
  "purchased-by-kitletics",
  "purchased-by-reviewer",
  "provided-by-brand",
  "loaned-by-brand",
  "retailer-sample",
  "other",
]);

export const evidenceSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "personal-test",
    "manufacturer",
    "retailer",
    "independent-review",
    "lab-test",
    "user-feedback",
    "editorial-research",
  ]),
  source: z.string().min(1),
  sourceUrl: z.string().optional(),
  summary: z.string(),
  verifiedAt: z.string().datetime(),
  confidence: z.enum(["low", "medium", "high"]),
  testerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  distanceKm: z.number().nonnegative().optional(),
  durationHours: z.number().nonnegative().optional(),
  activities: z.array(z.string()).optional(),
  surfaces: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  productSource: productSourceSchema.optional(),
  notes: z.string().optional(),
});

export const alternativeRelationshipSchema = z.object({
  id: z.string().min(1),
  sourceProductId: z.string().min(1),
  alternativeProductId: z.string().min(1),
  similarityScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  relationshipType: z.enum([
    "cheaper",
    "premium",
    "faster",
    "more-cushioned",
    "more-stable",
    "lighter",
    "better-value",
    "trail-capable",
    "beginner-friendly",
  ]),
});
