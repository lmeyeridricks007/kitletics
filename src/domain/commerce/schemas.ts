import { z } from "zod";
import { regionCodeSchema } from "@/domain/shared/schemas";

export const retailerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  legalName: z.string().optional(),
  logo: z.string().optional(),
  regions: z.array(regionCodeSchema).min(1),
  currencies: z.array(z.string()).optional(),
  retailerType: z
    .enum([
      "marketplace",
      "specialist-retailer",
      "general-sports-retailer",
      "brand-direct",
      "department-store",
      "other",
    ])
    .optional(),
  affiliateNetwork: z
    .enum([
      "amazon",
      "awin",
      "impact",
      "cj",
      "rakuten",
      "tradedoubler",
      "partnerize",
      "direct",
      "other",
    ])
    .optional(),
  shippingRegions: z.array(regionCodeSchema).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  allowedHosts: z.array(z.string()).optional(),
  homepage: z.string().url(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastVerifiedAt: z.string().optional(),
});

export const offerSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().optional(),
  retailerId: z.string().min(1),
  region: regionCodeSchema,
  url: z.string().url(),
  affiliateUrl: z.string().url().optional(),
  currency: z.string().min(1),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  availability: z.enum([
    "in-stock",
    "low-stock",
    "out-of-stock",
    "preorder",
    "backorder",
    "unknown",
  ]),
  condition: z.enum(["new", "refurbished", "used", "unknown"]).optional(),
  shipping: z.string().optional(),
  shippingCost: z.number().nonnegative().optional(),
  sellerName: z.string().optional(),
  status: z.enum(["active", "inactive", "expired"]).optional(),
  source: z
    .enum(["api", "affiliate-feed", "merchant-feed", "manual", "seed"])
    .optional(),
  evidenceId: z.string().optional(),
  externalIds: z
    .object({
      asin: z.string().optional(),
      gtin: z.string().optional(),
      sku: z.string().optional(),
    })
    .optional(),
  lastChecked: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  urlValidationState: z
    .enum(["VALID", "LIKELY_VALID", "UNKNOWN", "INVALID"])
    .optional(),
  urlValidationCheckedAt: z.string().datetime().optional(),
  urlValidationHttpStatus: z.number().int().optional(),
  urlValidationRedirectUrl: z.string().optional(),
  urlValidationFailureReason: z.string().optional(),
});

export const affiliateProgramSchema = z.object({
  id: z.string().min(1),
  retailerId: z.string().min(1),
  networkId: z.enum([
    "amazon",
    "awin",
    "impact",
    "cj",
    "rakuten",
    "tradedoubler",
    "partnerize",
    "direct",
    "other",
  ]),
  regionIds: z.array(regionCodeSchema).min(1),
  status: z.enum(["active", "pending", "inactive", "rejected", "expired"]),
  trackingTemplate: z.string().optional(),
  deepLinkMode: z.enum(["passthrough", "template", "provider"]).optional(),
  trackingIdEnvKey: z.string().optional(),
  disclosureRequired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastVerifiedAt: z.string().optional(),
});

export const retailerStorefrontSchema = z.object({
  id: z.string().min(1),
  retailerId: z.string().min(1),
  regionId: regionCodeSchema,
  domain: z.string().min(1),
  currency: z.string().min(1),
  affiliateProgramId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
});
