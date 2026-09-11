import { z } from "zod";
import {
  mediaAssetSchema,
  publishFieldsSchema,
  seoFieldsSchema,
} from "@/domain/shared/schemas";

export const productLifecycleStatusSchema = z.enum([
  "upcoming",
  "current",
  "previous-generation",
  "discontinued",
]);

export const experienceLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "elite",
]);

export const specValueTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "enum",
  "multi-enum",
  "measurement",
  "range",
]);

export const specificationDefinitionSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  type: specValueTypeSchema,
  unit: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
  comparisonPriority: z.number(),
  finderRelevant: z.boolean(),
  filterable: z.boolean(),
  description: z.string().optional(),
  directionality: z
    .enum(["higher-better", "lower-better", "contextual", "neutral"])
    .optional(),
});

export const specValueSchema: z.ZodType = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
  z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
]);

export const brandSchema = publishFieldsSchema.merge(seoFieldsSchema).extend({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().optional(),
  logoOnDark: z.string().optional(),
  country: z.string(),
  description: z.string(),
  homepage: z.string().optional(),
  foundedYear: z.number().int().optional(),
  originCity: z.string().optional(),
  positioning: z.string().optional(),
});

export const productFamilySchema = z.object({
  id: z.string().min(1),
  brandId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  productIds: z.array(z.string()),
});

export const audienceFitSchema = z.enum(["men", "women", "unisex"]);

export const productVariantSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sku: z.string().optional(),
  label: z.string().min(1),
  audience: audienceFitSchema,
  attributes: z.record(z.string(), z.string()),
  referenceWeightG: z.number().positive().optional(),
  referenceSizeLabel: z.string().optional(),
  sizeRangeLabel: z.string().optional(),
  widthOptions: z.array(z.string()).optional(),
  offerIds: z.array(z.string()).optional(),
  availabilityVerified: z.boolean(),
  weightVerified: z.boolean().optional(),
});

export const productSchema = publishFieldsSchema.merge(seoFieldsSchema).extend({
  id: z.string().min(1),
  slug: z.string().min(1),
  brandId: z.string().min(1),
  familyId: z.string().optional(),
  generation: z.string().optional(),
  name: z.string().min(1),
  fullName: z.string().min(1),
  shortDescription: z.string(),
  verdict: z.string().optional(),
  releaseDate: z.string().optional(),
  lifecycleStatus: productLifecycleStatusSchema,
  sportIds: z.array(z.string()).min(1),
  disciplineIds: z.array(z.string()),
  categoryId: z.string().min(1),
  subcategoryIds: z.array(z.string()),
  useCaseIds: z.array(z.string()),
  specifications: z.record(z.string(), specValueSchema),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendationScore: z.number().min(0).max(100).optional(),
  valueScore: z.number().min(0).max(100).optional(),
  experienceLevels: z.array(experienceLevelSchema),
  images: z.array(mediaAssetSchema),
  videos: z.array(mediaAssetSchema),
  offerIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  relatedProductIds: z.array(z.string()),
  alternativeProductIds: z.array(z.string()),
  reviewId: z.string().optional(),
});
