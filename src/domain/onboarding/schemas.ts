import { z } from "zod";

const httpUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Must be http(s) URL" },
  );

export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const researchProviderResultSchema = z.object({
  sources: z.array(
    z.object({
      url: httpUrlSchema,
      domain: z.string().min(1),
      sourceType: z.enum([
        "manufacturer",
        "manufacturer-documentation",
        "manufacturer-news",
        "retailer",
        "independent-review",
        "lab",
        "editorial",
        "other",
      ]),
      title: z.string().optional(),
      publisher: z.string().optional(),
      publishedAt: z.string().optional(),
      retrievedAt: z.string(),
      authorityLevel: z.enum([
        "primary",
        "secondary",
        "supporting",
        "untrusted",
      ]),
    }),
  ),
  facts: z.array(
    z.object({
      field: z.string().min(1),
      rawValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
      unit: z.string().optional(),
      sourceUrl: httpUrlSchema,
      confidence: confidenceSchema,
      context: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
  media: z.array(
    z.object({
      src: z.union([httpUrlSchema, z.string().startsWith("/")]),
      alt: z.string().min(1),
      sourceUrl: z.string().optional(),
      usageType: z.enum(["hero", "side", "detail", "other"]),
      width: z.number().optional(),
      height: z.number().optional(),
      generationHint: z.string().optional(),
    }),
  ),
  identityHints: z
    .object({
      brandName: z.string().optional(),
      modelName: z.string().optional(),
      fullName: z.string().optional(),
      familyName: z.string().optional(),
      generation: z.string().optional(),
      categorySlug: z.string().optional(),
      officialUrl: httpUrlSchema.optional(),
      lifecycleHint: z
        .enum(["upcoming", "current", "previous-generation", "discontinued"])
        .optional(),
      aliases: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ValidatedResearchProviderResult = z.infer<
  typeof researchProviderResultSchema
>;

export function validateResearchProviderResult(raw: unknown) {
  return researchProviderResultSchema.safeParse(raw);
}
