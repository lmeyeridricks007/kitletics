#!/usr/bin/env tsx
/**
 * Offer validation — URLs, refs, currency, duplicates, affiliate config.
 * Usage: npm run offers:validate
 */
import { retailers } from "@/content/retailers";
import { offers } from "@/content/offers";
import { affiliatePrograms } from "@/content/affiliate-programs";
import { products } from "@/content/products";
import { REGION_META } from "@/domain/shared/types";
import { offerSchema, retailerSchema } from "@/domain/commerce/schemas";
import { getOfferFreshness, isOfferActive } from "@/domain/commerce/ranking";
import { hostAllowed } from "@/domain/commerce/affiliates";

let errors = 0;
let warnings = 0;

function err(msg: string) {
  console.error(`ERROR: ${msg}`);
  errors++;
}
function warn(msg: string) {
  console.warn(`WARN:  ${msg}`);
  warnings++;
}

const productIds = new Set(products.map((p) => p.id));
const retailerIds = new Set(retailers.map((r) => r.id));
const retailersById = new Map(retailers.map((r) => [r.id, r]));

for (const r of retailers) {
  const parsed = retailerSchema.safeParse(r);
  if (!parsed.success) err(`Retailer ${r.id}: ${parsed.error.message}`);
}

const seenIds = new Set<string>();
const dedupeKeys = new Map<string, string>();

for (const o of offers) {
  const parsed = offerSchema.safeParse(o);
  if (!parsed.success) err(`Offer ${o.id}: ${parsed.error.message}`);

  if (seenIds.has(o.id)) err(`Duplicate offer id ${o.id}`);
  seenIds.add(o.id);

  if (!productIds.has(o.productId)) err(`Offer ${o.id}: missing product ${o.productId}`);
  if (!retailerIds.has(o.retailerId)) err(`Offer ${o.id}: missing retailer ${o.retailerId}`);

  const expectedCurrency = REGION_META[o.region]?.currency;
  if (expectedCurrency && o.currency !== expectedCurrency) {
    warn(
      `Offer ${o.id}: currency ${o.currency} ≠ region default ${expectedCurrency}`,
    );
  }

  try {
    const u = new URL(o.url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      err(`Offer ${o.id}: invalid protocol ${u.protocol}`);
    }
  } catch {
    err(`Offer ${o.id}: invalid URL`);
  }

  const retailer = retailersById.get(o.retailerId);
  if (retailer && !hostAllowed(o.url, retailer)) {
    err(`Offer ${o.id}: URL host not in retailer allowlist`);
  }

  if (o.price === 0) warn(`Offer ${o.id}: price is 0`);
  if (o.affiliateUrl) {
    warn(
      `Offer ${o.id}: stored affiliateUrl — prefer /go resolver; ensure program is active`,
    );
  }

  if (isOfferActive(o) && getOfferFreshness(o.lastChecked) === "stale") {
    warn(`Offer ${o.id}: stale lastChecked ${o.lastChecked}`);
  }

  const key = [
    o.productId,
    o.variantId ?? "",
    o.retailerId,
    o.sellerName ?? "",
    o.region,
  ].join("|");
  const prev = dedupeKeys.get(key);
  if (prev) err(`Duplicate offer identity ${o.id} ~ ${prev} (${key})`);
  else dedupeKeys.set(key, o.id);
}

for (const p of affiliatePrograms) {
  if (p.status === "active" && !p.trackingIdEnvKey && !p.trackingTemplate) {
    err(`Active program ${p.id} missing tracking config`);
  }
  if (p.trackingTemplate?.includes("PLACEHOLDER")) {
    warn(`Program ${p.id}: trackingTemplate still has PLACEHOLDER`);
  }
  if (!retailerIds.has(p.retailerId)) {
    err(`Program ${p.id}: missing retailer ${p.retailerId}`);
  }
}

console.log(`\nOffers validated: ${offers.length}`);
console.log(`Errors: ${errors} · Warnings: ${warnings}\n`);
process.exit(errors > 0 ? 1 : 0);
