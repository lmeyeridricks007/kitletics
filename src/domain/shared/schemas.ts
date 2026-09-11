import { z } from "zod";

export const publishStatusSchema = z.enum([
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);

export const publishFieldsSchema = z.object({
  status: publishStatusSchema,
  publishedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastVerifiedAt: z.string().datetime().optional(),
});

export const seoFieldsSchema = z.object({
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonical: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  noindex: z.boolean().optional(),
});

export const mediaAssetSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  type: z.enum(["image", "video", "logo", "icon"]),
  credit: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  licence: z.string().optional(),
  attribution: z.string().optional(),
  usageType: z
    .enum([
      "hero",
      "side",
      "top",
      "rear",
      "outsole",
      "detail",
      "on-foot",
      "lifestyle",
      "other",
    ])
    .optional(),
});

export const regionCodeSchema = z.enum([
  "NL",
  "DE",
  "FR",
  "BE",
  "UK",
  "US",
  "ZA",
]);
