import { z } from "zod";
import { publishFieldsSchema, seoFieldsSchema } from "@/domain/shared/schemas";

export const sportSchema = publishFieldsSchema.merge(seoFieldsSchema).extend({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  featured: z.boolean(),
  available: z.boolean(),
  contentStatus: z.enum(["live", "partial", "coming-soon"]),
  parentSportId: z.string().optional(),
  sortOrder: z.number(),
});

export const disciplineSchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    sportId: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    sortOrder: z.number(),
  });

export const activitySchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    sportId: z.string().min(1),
    disciplineId: z.string().optional(),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
  });

export const productCategorySchema = publishFieldsSchema
  .merge(seoFieldsSchema)
  .extend({
    id: z.string().min(1),
    sportIds: z.array(z.string().min(1)).min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    pathSegment: z.string().min(1),
    icon: z.string(),
    description: z.string(),
    sortOrder: z.number(),
  });

export const productSubcategorySchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  sortOrder: z.number(),
});

export const useCaseSchema = z.object({
  id: z.string().min(1),
  sportId: z.string().optional(),
  group: z.enum(["runner", "training", "racing", "goals", "general"]),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
});
