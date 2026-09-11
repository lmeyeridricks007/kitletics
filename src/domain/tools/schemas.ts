import { z } from "zod";
import { publishFieldsSchema, seoFieldsSchema } from "@/domain/shared/schemas";

export const toolSchema = publishFieldsSchema.merge(seoFieldsSchema).extend({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  shortDescription: z.string().optional(),
  type: z.enum(["finder", "calculator", "planner", "builder", "comparison"]),
  sportIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  useCaseIds: z.array(z.string()),
  goalTags: z.array(z.string()),
  icon: z.string(),
  available: z.boolean(),
  estimatedTimeMinutes: z.number().positive().optional(),
  featured: z.boolean().optional(),
  priority: z.number().optional(),
  hubImageSrc: z.string().optional(),
  href: z.string().optional(),
});
