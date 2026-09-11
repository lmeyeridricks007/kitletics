#!/usr/bin/env tsx
/**
 * Commercial QA — Offer coverage, freshness, affiliate config (secrets redacted).
 * Usage: npm run commerce:qa
 */
import { retailers } from "@/content/retailers";
import { offers } from "@/content/offers";
import {
  affiliatePrograms,
  affiliateNetworks,
  retailerStorefronts,
} from "@/content/affiliate-programs";
import { products } from "@/content/products";
import { categories } from "@/content/taxonomy/categories";
import { REGIONS, REGION_META } from "@/domain/shared/types";
import {
  getOfferFreshness,
  isOfferActive,
  shouldDisplayNumericPrice,
} from "@/domain/commerce/ranking";
import {
  hostAllowed,
  resolveCommercialUrl,
} from "@/domain/commerce/affiliates";
import { isPubliclyVisible } from "@/lib/publishing/resolver";

/** Fail commerce QA when fewer than this share of NL-covered products have a displayable price. */
const MIN_DISPLAYABLE_NL_RATE = 0.95;
/** Fail when core launch categories are missing NL offers. */
const REQUIRED_NL_CATEGORY_IDS = [
  "cat-running-shoes",
  "cat-gps-watches",
] as const;

const now = new Date();
const published = products.filter((p) =>
  isPubliclyVisible(p, { isDev: false, now }),
);

console.log("\n=== Kitletics Commercial QA ===\n");

console.log(`Retailers:            ${retailers.length}`);
console.log(`Storefronts:          ${retailerStorefronts.length}`);
console.log(`Affiliate networks:   ${affiliateNetworks.length}`);
console.log(`Affiliate programs:   ${affiliatePrograms.length}`);
console.log(
  `  active:              ${affiliatePrograms.filter((p) => p.status === "active").length}`,
);
console.log(
  `  pending:             ${affiliatePrograms.filter((p) => p.status === "pending").length}`,
);
console.log(`Offers (all):         ${offers.length}`);
console.log(
  `Offers (active):      ${offers.filter(isOfferActive).length}`,
);
console.log(`Published products:   ${published.length}`);

// Freshness
const bands = { fresh: 0, recent: 0, aging: 0, stale: 0 };
for (const o of offers.filter(isOfferActive)) {
  bands[getOfferFreshness(o.lastChecked, now)]++;
}
console.log("\n--- Freshness (active Offers) ---");
for (const [k, v] of Object.entries(bands)) {
  console.log(`  ${k.padEnd(8)} ${v}`);
}

// Coverage by region
console.log("\n--- Offer coverage by region ---");
for (const region of REGIONS) {
  const regional = offers.filter((o) => o.region === region && isOfferActive(o));
  const productIds = new Set(regional.map((o) => o.productId));
  const withOffers = published.filter((p) => productIds.has(p.id)).length;
  console.log(
    `  ${region} (${REGION_META[region].currency}): ${regional.length} offers · ${withOffers}/${published.length} published products`,
  );
}

// Coverage by category (Running shoes focus)
console.log("\n--- Offer coverage by category (published) ---");
for (const cat of categories) {
  const catProducts = published.filter((p) => p.categoryId === cat.id);
  if (catProducts.length === 0) continue;
  const withOffer = catProducts.filter((p) =>
    offers.some((o) => o.productId === p.id && isOfferActive(o)),
  );
  console.log(
    `  ${cat.slug}: ${withOffer.length}/${catProducts.length} with offers`,
  );
}

// Affiliate vs non-affiliate (active programs only — currently none)
const activeProgramKeys = new Set(
  affiliatePrograms
    .filter((p) => p.status === "active")
    .flatMap((p) => p.regionIds.map((r) => `${p.retailerId}:${r}`)),
);
let affOffers = 0;
let nonAffOffers = 0;
for (const o of offers.filter(isOfferActive)) {
  if (activeProgramKeys.has(`${o.retailerId}:${o.region}`)) affOffers++;
  else nonAffOffers++;
}
console.log("\n--- Affiliate Offer coverage ---");
console.log(`  Affiliate-eligible (active program): ${affOffers}`);
console.log(`  Non-affiliate / pending program:     ${nonAffOffers}`);

console.log("\n--- Affiliate programs (secrets redacted) ---");
for (const p of affiliatePrograms) {
  const envConfigured = p.trackingIdEnvKey
    ? Boolean(
        process.env[p.trackingIdEnvKey] &&
          !String(process.env[p.trackingIdEnvKey]).includes("PLACEHOLDER"),
      )
    : false;
  console.log(
    `  ${p.id}: ${p.status} · network=${p.networkId} · regions=${p.regionIds.join(",")} · env=${p.trackingIdEnvKey ?? "—"} configured=${envConfigured}`,
  );
}

// Redirect sanity (no live HTTP)
console.log("\n--- Redirect resolution (local, no live fetch) ---");
let ok = 0;
let fail = 0;
const retailersById = new Map(retailers.map((r) => [r.id, r]));
for (const o of offers.filter(isOfferActive).slice(0, 80)) {
  const retailer = retailersById.get(o.retailerId);
  if (!retailer) {
    fail++;
    console.log(`  FAIL missing retailer: ${o.id}`);
    continue;
  }
  const resolved = resolveCommercialUrl({ offer: o, retailer });
  if (!hostAllowed(resolved.destinationUrl, retailer)) {
    fail++;
    console.log(`  FAIL host: ${o.id} → ${resolved.destinationUrl}`);
    continue;
  }
  ok++;
}
console.log(`  Resolved OK: ${ok} · Failures: ${fail}`);

// Products without offers (NL)
const nlOfferProducts = new Set(
  offers
    .filter((o) => o.region === "NL" && isOfferActive(o))
    .map((o) => o.productId),
);
const withoutNl = published.filter((p) => !nlOfferProducts.has(p.id));
console.log(`\n--- Published products without NL Offers: ${withoutNl.length} ---`);
for (const p of withoutNl.slice(0, 25)) {
  console.log(`  ${p.id} (${p.slug})`);
}
if (withoutNl.length > 25) console.log(`  … +${withoutNl.length - 25} more`);

// Displayable NL price gate (fresh/recent only)
let nlCovered = 0;
let nlDisplayable = 0;
for (const p of published) {
  const regional = offers.filter(
    (o) => o.productId === p.id && o.region === "NL" && isOfferActive(o),
  );
  if (regional.length === 0) continue;
  nlCovered++;
  if (regional.some((o) => shouldDisplayNumericPrice(o, now))) nlDisplayable++;
}
const displayableRate = nlCovered === 0 ? 0 : nlDisplayable / nlCovered;
console.log("\n--- Displayable NL prices (fresh/recent) ---");
console.log(`  Covered products:     ${nlCovered}`);
console.log(`  Displayable products: ${nlDisplayable}`);
console.log(
  `  Rate:                 ${(displayableRate * 100).toFixed(1)}% (min ${(MIN_DISPLAYABLE_NL_RATE * 100).toFixed(0)}%)`,
);

let gateFail = 0;
if (displayableRate < MIN_DISPLAYABLE_NL_RATE) {
  console.error(
    `\nGATE FAIL: displayable NL rate ${(displayableRate * 100).toFixed(1)}% < ${(MIN_DISPLAYABLE_NL_RATE * 100).toFixed(0)}% — refresh offer lastChecked / feeds.`,
  );
  gateFail++;
}

for (const catId of REQUIRED_NL_CATEGORY_IDS) {
  const catProducts = published.filter((p) => p.categoryId === catId);
  const missing = catProducts.filter((p) => !nlOfferProducts.has(p.id));
  const cat = categories.find((c) => c.id === catId);
  console.log(
    `\n--- Required NL coverage: ${cat?.slug ?? catId}: ${catProducts.length - missing.length}/${catProducts.length} ---`,
  );
  if (missing.length > 0) {
    console.error(
      `GATE FAIL: ${missing.length} ${cat?.slug ?? catId} products lack NL offers:`,
    );
    for (const p of missing.slice(0, 15)) {
      console.error(`  ${p.slug}`);
    }
    gateFail++;
  }
}

console.log("\n=== End Commercial QA ===\n");
process.exit(fail > 0 || gateFail > 0 ? 1 : 0);
