#!/usr/bin/env node
/**
 * Mass Padel commerce enrichment.
 * Catalog inclusion ≠ retail availability.
 * Classifies every current product with a terminal research state.
 * Creates Offer rows only when a product listing URL + verified price exist.
 *
 * Usage:
 *   node --import tsx scripts/tmp/enrich-padel-commerce.ts
 *   node --import tsx scripts/tmp/enrich-padel-commerce.ts --fetch
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import { PRODUCT_AFFILIATE_URLS } from "@/content/offers-affiliate-urls";
import { SEED_DATES } from "@/content/config";
import type { Offer } from "@/domain/commerce/types";
import type { Product } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import {
  getOfferFreshness,
  shouldDisplayNumericPrice,
} from "@/domain/commerce/ranking";
import {
  inferBallPack,
  inferGripPackQuantity,
  normalizeBallPack,
  normalizeGripPack,
} from "@/domain/commerce/pack-normalization";
import type {
  CommerceAvailabilityClass,
  CommerceConflict,
  CommerceOfferPresence,
  ProductCommerceEnrichment,
} from "@/content/padel/commerce-enrichment/types";

const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);
const DO_FETCH = process.argv.includes("--fetch");
const INV_PATH = join(ROOT, "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv");
const STORE_PATH = join(ROOT, "src/content/padel/commerce-enrichment/store.ts");
const WAVE_PATH = join(ROOT, "src/content/padel/soft-goods/commerce-wave-offers.ts");
const COVERAGE_PATH = join(ROOT, "docs/padel/data/PADEL-COMMERCE-COVERAGE.csv");
const CONFLICTS_PATH = join(ROOT, "docs/padel/data/PADEL-COMMERCE-CONFLICTS.csv");
const AUDIT_PATH = join(ROOT, "docs/padel/PADEL-COMMERCE-ENRICHMENT-AUDIT.md");

const PADEL_CATS = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
]);

const NL_HOSTS = new Set([
  "padelmq.com",
  "www.padelmq.com",
  "padeldirect.nl",
  "www.padeldirect.nl",
  "justpadel.nl",
  "www.justpadel.nl",
  "justpadel.com",
  "www.justpadel.com",
  "hollandpadel.nl",
  "www.hollandpadel.nl",
  "padel2gether.nl",
  "www.padel2gether.nl",
  "padelnu.nl",
  "www.padelnu.nl",
  "amazon.nl",
  "www.amazon.nl",
  "decathlon.nl",
  "www.decathlon.nl",
]);

const EU_HOSTS = new Set([
  "padelshop.com",
  "www.padelshop.com",
  "padelnuestro.com",
  "www.padelnuestro.com",
  "padelmarket.com",
  "www.padelmarket.com",
  "zonadepadel.com",
  "www.zonadepadel.com",
  "time2padel.com",
  "www.time2padel.com",
  "padelproshop.com",
  "www.padelproshop.com",
  "misterpadel.com",
  "www.misterpadel.com",
  "tradeinn.com",
  "www.tradeinn.com",
  "amazon.de",
  "www.amazon.de",
  "amazon.fr",
  "www.amazon.fr",
  "amazon.es",
  "www.amazon.es",
  "decathlon.de",
  "decathlon.fr",
  "decathlon.be",
  "decathlon.es",
]);

const BRAND_HOSTS = new Set([
  "bullpadel.com",
  "www.bullpadel.com",
  "noxsport.com",
  "www.noxsport.com",
  "babolat.com",
  "www.babolat.com",
  "head.com",
  "www.head.com",
  "wilson.com",
  "www.wilson.com",
  "adidas.com",
  "www.adidas.com",
  "4on.store",
  "www.4on.store",
  "alacran.es",
  "www.alacran.es",
]);

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string) {
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isProductListingUrl(url: string): boolean {
  if (!url) return false;
  if (/amazon\.[a-z.]+\/?$/i.test(url.replace(/\/+$/, ""))) return false;
  if (/decathlon\.[a-z]+\/?$/i.test(url.replace(/\/+$/, ""))) return false;
  return (
    /\/products?\//i.test(url) ||
    /\/dp\/[A-Z0-9]{10}/i.test(url) ||
    /\/gp\/product\//i.test(url) ||
    /descpage/i.test(url) ||
    /\/product\//i.test(url)
  );
}

function isHomepageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname === "/" || u.pathname === "";
  } catch {
    return true;
  }
}

function retailerIdForHost(host: string): string | undefined {
  if (host.includes("padelmq")) return "ret-padelmq";
  if (host.includes("justpadel")) return "ret-justpadel";
  if (host.includes("padel2gether")) return "ret-padel2gether";
  if (host.includes("hollandpadel")) return "ret-holland-padel";
  if (host.includes("padeldirect")) return "ret-padeldirect";
  if (host.includes("padelnu")) return "ret-padelnu";
  if (host.includes("amazon.nl")) return "ret-amazon-nl";
  if (host.includes("amazon.de")) return "ret-amazon-de";
  if (host.includes("amazon.co.uk") || host.includes("amazon.uk"))
    return "ret-amazon-uk";
  if (host.includes("amazon.fr")) return "ret-amazon-fr";
  if (host.includes("amazon.com") && !host.includes("amazon.co"))
    return "ret-amazon-us";
  if (host.includes("decathlon")) return "ret-decathlon";
  return undefined;
}

function regionForRetailer(retailerId: string | undefined): RegionCode {
  if (!retailerId) return "NL";
  if (retailerId === "ret-amazon-de") return "DE";
  if (retailerId === "ret-amazon-uk") return "UK";
  if (retailerId === "ret-amazon-fr") return "FR";
  if (retailerId === "ret-amazon-us") return "US";
  return "NL";
}

const invRows = parseCsv(readFileSync(INV_PATH, "utf8"));
const invByProduct = new Map<string, Record<string, string>>();
for (const r of invRows) {
  const id = r.kitletics_product_id;
  if (id && !invByProduct.has(id)) invByProduct.set(id, r);
}

function inventoryUrls(inv?: Record<string, string>): string[] {
  if (!inv) return [];
  const out: string[] = [];
  if (inv.manufacturer_url) out.push(inv.manufacturer_url);
  for (const u of (inv.retailer_urls || "").split("|")) {
    if (u.trim()) out.push(u.trim());
  }
  return [...new Set(out)];
}

async function fetchListingPrice(
  url: string,
): Promise<{ price: number; currency: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; KitleticsCommerceBot/1.0; +https://kitletics.com)",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ld =
      html.match(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ) ?? [];
    for (const block of ld) {
      const raw = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/i, "");
      try {
        const json = JSON.parse(raw);
        const nodes = Array.isArray(json) ? json : [json];
        for (const node of nodes) {
          const offers = node?.offers ?? node?.Offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;
          const price = Number(offer?.price ?? offer?.lowPrice ?? node?.price);
          const currency = String(
            offer?.priceCurrency ?? node?.priceCurrency ?? "EUR",
          );
          if (Number.isFinite(price) && price > 0 && price < 5000) {
            return { price, currency };
          }
        }
      } catch {
        /* continue */
      }
    }
    const meta = html.match(
      /property=["']product:price:amount["'][^>]*content=["']([0-9.,]+)["']/i,
    ) || html.match(/content=["']([0-9.,]+)["'][^>]*property=["']product:price:amount["']/i);
    if (meta) {
      const price = Number(meta[1].replace(",", "."));
      if (Number.isFinite(price) && price > 0) {
        return { price, currency: "EUR" };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function detectConflicts(
  p: Product,
  offers: Offer[],
): CommerceConflict[] {
  const conflicts: CommerceConflict[] = [];
  const gen =
    String(p.specifications?.generation ?? p.generation ?? "").match(/20\d{2}/)?.[0] ??
    p.name.match(/20\d{2}/)?.[0];
  for (const o of offers) {
    const urlGen = o.url.match(/20\d{2}/)?.[0];
    if (gen && urlGen && Math.abs(Number(gen) - Number(urlGen)) >= 2) {
      conflicts.push({
        productId: p.id,
        categoryId: p.categoryId,
        type: "GENERATION_MISMATCH",
        field: "generation",
        valueA: gen,
        sourceA: "product",
        valueB: urlGen,
        sourceB: o.url,
        resolution: "flagged_identity_conflict_offer_kept_for_review",
      });
    }
    if (
      p.categoryId === "cat-padel-grips" &&
      /60[- ]?pack|50[- ]?pack|24[- ]?pack/i.test(o.url) &&
      !/60|50|24/.test(p.name)
    ) {
      conflicts.push({
        productId: p.id,
        categoryId: p.categoryId,
        type: "PACK_MISMATCH",
        field: "packQuantity",
        valueA: p.name,
        sourceA: "product",
        valueB: o.url,
        sourceB: o.id,
        resolution: "flagged_pack_mismatch",
      });
    }
    if (
      /bundle|set\+|pressurizer.*pump|pump.*pressurizer/i.test(o.url) &&
      !/bundle|set/i.test(p.name)
    ) {
      conflicts.push({
        productId: p.id,
        categoryId: p.categoryId,
        type: "BUNDLE_AS_STANDALONE",
        field: "bundle",
        valueA: "standalone product",
        sourceA: p.id,
        valueB: o.url,
        sourceB: o.id,
        resolution: "flagged_bundle_offer",
      });
    }
    if (
      p.categoryId === "cat-padel-bags" &&
      ((/backpack|rugzak/i.test(o.url) && /paletero|racket.?bag|tournament/i.test(p.name)) ||
        (/paletero|racket.?bag/i.test(o.url) && /backpack|rugzak/i.test(p.name)))
    ) {
      conflicts.push({
        productId: p.id,
        categoryId: p.categoryId,
        type: "BAG_FORM_MISMATCH",
        field: "form",
        valueA: p.name,
        sourceA: "product",
        valueB: o.url,
        sourceB: o.id,
        resolution: "flagged_bag_form_mismatch",
      });
    }
  }
  return conflicts;
}

function classifyAvailability(args: {
  nlOffers: Offer[];
  euOffers: Offer[];
  brandOffers: Offer[];
  evidenceUrls: string[];
  inv?: Record<string, string>;
}): CommerceAvailabilityClass {
  const { nlOffers, euOffers, brandOffers, evidenceUrls, inv } = args;
  const nlInStock = nlOffers.filter((o) => o.availability !== "out-of-stock");
  const nlOos =
    nlOffers.length > 0 && nlOffers.every((o) => o.availability === "out-of-stock");
  if (nlInStock.length > 0) return "NL_AVAILABLE";
  if (nlOos) return "OUT_OF_STOCK";

  const listingEvidence = evidenceUrls.filter(isProductListingUrl);
  const hasNlHost = listingEvidence.some((u) => NL_HOSTS.has(hostOf(u)));
  const hasEuHost = listingEvidence.some((u) => EU_HOSTS.has(hostOf(u)));
  const hasBrandHost = listingEvidence.some((u) => BRAND_HOSTS.has(hostOf(u)));

  if (euOffers.some((o) => o.availability !== "out-of-stock")) {
    // DE/FR/ES specialist listings typically ship to NL
    return "EU_AVAILABLE_TO_NL";
  }
  if (brandOffers.length > 0) return "BRAND_DIRECT";

  const nlFlag = (inv?.NL_available || "").toLowerCase();
  if (hasNlHost || nlFlag === "yes") {
    // Listing evidence without Kitletics priced offer — still researched as NL path
    return hasNlHost || nlFlag === "yes"
      ? "NO_CURRENT_OFFER_FOUND"
      : "NO_CURRENT_OFFER_FOUND";
  }
  // Prefer precise class when inventory says EU but no NL
  if (hasEuHost || (inv?.EU_available || "").toLowerCase() === "yes") {
    if (nlFlag === "no") return "EU_ONLY";
    return "EU_AVAILABLE_TO_NL";
  }
  if (hasBrandHost) return "BRAND_DIRECT";

  // Inventory said likely/yes NL without product URL → researched no Kitletics offer yet
  if (["yes", "likely", "limited"].includes(nlFlag)) {
    return "NO_CURRENT_OFFER_FOUND";
  }
  return "NO_CURRENT_OFFER_FOUND";
}

function offerPresenceFor(
  nlOffers: Offer[],
  euOffers: Offer[],
  conflicts: CommerceConflict[],
  staleCount: number,
  freshCount: number,
): CommerceOfferPresence {
  if (conflicts.length > 0) return "IDENTITY_CONFLICT";
  if (nlOffers.length + euOffers.length === 0) return "NO_OFFER";
  if (staleCount > 0 && freshCount === 0) return "STALE";
  if (nlOffers.length > 0) return "NL_OFFER";
  return "EU_OFFER";
}

const products = padelAllProducts.filter(
  (p) => PADEL_CATS.has(p.categoryId) && p.lifecycleStatus !== "discontinued",
);

const existingByProduct = new Map<string, Offer[]>();
for (const o of padelAllOffers) {
  const list = existingByProduct.get(o.productId) ?? [];
  list.push(o);
  existingByProduct.set(o.productId, list);
}

const newOffers: Offer[] = [];
const allConflicts: CommerceConflict[] = [];
const store: Record<string, ProductCommerceEnrichment> = {};

async function maybeFetchOffers(p: Product, urls: string[]) {
  if (!DO_FETCH) return;
  if (existingByProduct.has(p.id)) return;
  const candidates = urls.filter(
    (u) =>
      isProductListingUrl(u) &&
      !isHomepageUrl(u) &&
      (NL_HOSTS.has(hostOf(u)) || hostOf(u).includes("padelmq")),
  );
  for (const url of candidates.slice(0, 1)) {
    const priced = await fetchListingPrice(url);
    if (!priced) continue;
    const host = hostOf(url);
    const retailerId = retailerIdForHost(host) ?? "ret-padelmq";
    const region = regionForRetailer(retailerId);
    const currency =
      region === "UK" ? "GBP" : region === "US" ? "USD" : priced.currency || "EUR";
    const offer: Offer = {
      id: `offer-${p.slug || p.id.replace(/^prod-/, "")}-commerce-wave-${region.toLowerCase()}`,
      productId: p.id,
      retailerId,
      region,
      url,
      currency,
      price: priced.price,
      availability: "in-stock",
      lastChecked: SEED_DATES.verified,
      source: "manual",
      condition: "new",
      status: "active",
    };
    newOffers.push(offer);
    const list = existingByProduct.get(p.id) ?? [];
    list.push(offer);
    existingByProduct.set(p.id, list);
    break;
  }
}

async function main() {
  let i = 0;
  for (const p of products) {
    i++;
    const inv = invByProduct.get(p.id);
    const evidence = inventoryUrls(inv);
    if (DO_FETCH && i % 25 === 0) {
      console.error(`fetch progress ${i}/${products.length}`);
    }
    await maybeFetchOffers(p, evidence);

    const offers = existingByProduct.get(p.id) ?? [];
    const nlOffers = offers.filter((o) => o.region === "NL");
    const euOffers = offers.filter((o) =>
      ["BE", "DE", "FR", "ES"].includes(o.region),
    );
    const brandOffers = offers.filter((o) => {
      const host = hostOf(o.url);
      return BRAND_HOSTS.has(host);
    });

    const conflicts = detectConflicts(p, offers);
    allConflicts.push(...conflicts);

    let fresh = 0;
    let stale = 0;
    for (const o of offers) {
      const band = getOfferFreshness(o.lastChecked || SEED_DATES.verified);
      // Seed clock will lift these at materialize — treat seed/manual as fresh for research
      if (o.source === "seed" || o.source === "manual" || band === "fresh" || band === "recent") {
        fresh++;
      } else if (band === "stale" || band === "aging") {
        stale++;
      }
    }

    const availabilityClass = classifyAvailability({
      nlOffers,
      euOffers,
      brandOffers,
      evidenceUrls: evidence,
      inv,
    });

    // Refine: evidence of NL listing without Kitletics offer stays NO_CURRENT_OFFER_FOUND
    // Evidence of EU listing only → EU_AVAILABLE_TO_NL when inventory EU yes and no NL offer
    let finalClass = availabilityClass;
    if (nlOffers.length === 0 && euOffers.length === 0) {
      const listing = evidence.filter(isProductListingUrl);
      const hasNl = listing.some((u) => NL_HOSTS.has(hostOf(u)));
      const hasEu = listing.some((u) => EU_HOSTS.has(hostOf(u)));
      const hasBrand = listing.some((u) => BRAND_HOSTS.has(hostOf(u)));
      if (hasBrand && !hasNl && !hasEu) finalClass = "BRAND_DIRECT";
      else if (hasEu && !hasNl) finalClass = "EU_AVAILABLE_TO_NL";
      else if (!hasNl && !hasEu && !hasBrand) finalClass = "NO_CURRENT_OFFER_FOUND";
      else if (hasNl && nlOffers.length === 0) finalClass = "NO_CURRENT_OFFER_FOUND";
    }

    const presence = offerPresenceFor(
      nlOffers,
      euOffers,
      conflicts,
      stale,
      fresh,
    );

    const notes: string[] = [];
    if (PRODUCT_AFFILIATE_URLS[p.id] && nlOffers.length === 0) {
      notes.push(
        "Affiliate shortlink map has URL; materializer may synthesize Amazon NL offer at runtime.",
      );
    }
    if (
      evidence.some(isProductListingUrl) &&
      offers.length === 0
    ) {
      notes.push(
        "Product listing URL researched in inventory — Kitletics Offer price not yet verified (no invented price).",
      );
    }
    if ((inv?.NL_available || "").toLowerCase() === "yes" && offers.length === 0) {
      notes.push("Inventory NL_available=yes without priced Kitletics Offer.");
    }

    let packNormalization: ProductCommerceEnrichment["packNormalization"];
    const bestNl = nlOffers.find((o) => o.price > 0);
    if (bestNl && p.categoryId === "cat-padel-balls") {
      const pack = inferBallPack(p.name, p.specifications ?? {});
      const n = normalizeBallPack({
        packPrice: bestNl.price,
        ballsPerCan: pack.ballsPerCan,
        cans: pack.cans,
        currency: bestNl.currency,
      });
      packNormalization = {
        unitLabel: n.label,
        packQuantity: n.totalBalls,
        packPrice: n.packPrice,
        unitPrice: n.pricePerBall,
        currency: n.currency,
      };
    }
    if (bestNl && p.categoryId === "cat-padel-grips") {
      const qty =
        inferGripPackQuantity(p.name, p.specifications ?? {}) ?? 1;
      const n = normalizeGripPack({
        packPrice: bestNl.price,
        packQuantity: qty,
        currency: bestNl.currency,
      });
      packNormalization = {
        unitLabel: n.label,
        packQuantity: n.packQuantity,
        packPrice: n.packPrice,
        unitPrice: n.pricePerGrip,
        currency: n.currency,
      };
    }

    store[p.id] = {
      productId: p.id,
      categoryId: p.categoryId,
      brandId: p.brandId,
      availabilityClass: finalClass,
      offerPresence: presence,
      researchState: p.lifecycleStatus === "discontinued" ? "BLOCKED" : "RESEARCHED",
      researchedAt: TODAY,
      evidenceUrls: evidence.filter(isProductListingUrl).slice(0, 5),
      nlOfferCount: nlOffers.length,
      euOfferCount: euOffers.length,
      affiliateMapped: Boolean(PRODUCT_AFFILIATE_URLS[p.id]),
      freshOfferCount: fresh,
      staleOfferCount: stale,
      notes: notes.length ? notes : undefined,
      conflicts: conflicts.length ? conflicts : undefined,
      packNormalization,
    };
  }

  // Also mark discontinued padel products as BLOCKED so nothing is unexplained
  for (const p of padelAllProducts.filter(
    (x) => PADEL_CATS.has(x.categoryId) && x.lifecycleStatus === "discontinued",
  )) {
    store[p.id] = {
      productId: p.id,
      categoryId: p.categoryId,
      brandId: p.brandId,
      availabilityClass: "NO_CURRENT_OFFER_FOUND",
      offerPresence: "NO_OFFER",
      researchState: "BLOCKED",
      researchedAt: TODAY,
      evidenceUrls: [],
      nlOfferCount: 0,
      euOfferCount: 0,
      affiliateMapped: false,
      freshOfferCount: 0,
      staleOfferCount: 0,
      notes: ["Discontinued — commerce enrichment blocked."],
    };
  }

  writeFileSync(
    STORE_PATH,
    `/* AUTO-GENERATED by scripts/tmp/enrich-padel-commerce.ts — do not hand-edit */
import type { ProductCommerceEnrichment } from "@/content/padel/commerce-enrichment/types";

export const padelCommerceEnrichmentStore: Record<string, ProductCommerceEnrichment> = ${JSON.stringify(store, null, 2)};
`,
  );

  if (newOffers.length) {
    writeFileSync(
      WAVE_PATH,
      `/* AUTO-GENERATED by scripts/tmp/enrich-padel-commerce.ts --fetch */
import type { Offer } from "@/domain/commerce/types";
import { SEED_DATES } from "@/content/config";

export const padelCommerceWaveOffers: Offer[] = ${JSON.stringify(
        newOffers.map((o) => ({
          ...o,
          lastChecked: "SEED_DATES.verified",
        })),
        null,
        2,
      ).replace(/"SEED_DATES\.verified"/g, "SEED_DATES.verified")};
`,
    );
  }

  // Coverage CSV
  const header = [
    "productId",
    "categoryId",
    "brandId",
    "name",
    "lifecycleStatus",
    "publicationStatus",
    "availabilityClass",
    "offerPresence",
    "researchState",
    "nlOfferCount",
    "euOfferCount",
    "affiliateMapped",
    "freshOfferCount",
    "staleOfferCount",
    "anyOffer",
    "evidenceUrlCount",
    "packUnitLabel",
    "notes",
  ];
  const rows: string[] = [];
  const byCat: Record<
    string,
    {
      n: number;
      nlOffers: number;
      euOffers: number;
      affiliate: number;
      noOffer: number;
      stale: number;
      conflicts: number;
      nlClass: number;
      euClass: number;
      brandDirect: number;
      oos: number;
      noFound: number;
    }
  > = {};

  for (const p of [...products, ...padelAllProducts.filter((x) => PADEL_CATS.has(x.categoryId) && x.lifecycleStatus === "discontinued")]) {
    const e = store[p.id];
    if (!e) continue;
    rows.push(
      [
        p.id,
        p.categoryId,
        p.brandId,
        p.name,
        p.lifecycleStatus,
        p.status,
        e.availabilityClass,
        e.offerPresence,
        e.researchState,
        e.nlOfferCount,
        e.euOfferCount,
        e.affiliateMapped,
        e.freshOfferCount,
        e.staleOfferCount,
        e.nlOfferCount + e.euOfferCount > 0,
        e.evidenceUrls.length,
        e.packNormalization?.unitLabel ?? "",
        (e.notes || []).join("; "),
      ]
        .map((x) => csvEscape(String(x)))
        .join(","),
    );
    const cat = p.categoryId;
    if (!byCat[cat]) {
      byCat[cat] = {
        n: 0,
        nlOffers: 0,
        euOffers: 0,
        affiliate: 0,
        noOffer: 0,
        stale: 0,
        conflicts: 0,
        nlClass: 0,
        euClass: 0,
        brandDirect: 0,
        oos: 0,
        noFound: 0,
      };
    }
    byCat[cat].n++;
    if (e.nlOfferCount > 0) byCat[cat].nlOffers++;
    if (e.euOfferCount > 0) byCat[cat].euOffers++;
    if (e.affiliateMapped) byCat[cat].affiliate++;
    if (e.offerPresence === "NO_OFFER") byCat[cat].noOffer++;
    if (e.offerPresence === "STALE") byCat[cat].stale++;
    if (e.offerPresence === "IDENTITY_CONFLICT") byCat[cat].conflicts++;
    if (e.availabilityClass === "NL_AVAILABLE") byCat[cat].nlClass++;
    if (
      e.availabilityClass === "EU_AVAILABLE_TO_NL" ||
      e.availabilityClass === "EU_ONLY"
    )
      byCat[cat].euClass++;
    if (e.availabilityClass === "BRAND_DIRECT") byCat[cat].brandDirect++;
    if (e.availabilityClass === "OUT_OF_STOCK") byCat[cat].oos++;
    if (e.availabilityClass === "NO_CURRENT_OFFER_FOUND") byCat[cat].noFound++;
  }

  mkdirSync(join(ROOT, "docs/padel/data"), { recursive: true });
  writeFileSync(COVERAGE_PATH, [header.join(","), ...rows].join("\n") + "\n");
  writeFileSync(
    CONFLICTS_PATH,
    [
      "productId,categoryId,type,field,valueA,sourceA,valueB,sourceB,resolution",
      ...allConflicts.map((c) =>
        [
          c.productId,
          c.categoryId,
          c.type,
          c.field,
          c.valueA,
          c.sourceA,
          c.valueB,
          c.sourceB,
          c.resolution,
        ]
          .map((x) => csvEscape(String(x)))
          .join(","),
      ),
    ].join("\n") + "\n",
  );

  const pending = Object.values(store).filter(
    (e) => e.researchState === "COMMERCE_PENDING",
  );
  const researched = Object.values(store).filter((e) => e.researchState === "RESEARCHED");

  // Canaries — pick diverse brands with offers when possible
  function pickCanaries(cat: string, n: number): string[] {
    const pool = products.filter((p) => p.categoryId === cat);
    const withOffer = pool.filter((p) => (existingByProduct.get(p.id) ?? []).length > 0);
    const without = pool.filter((p) => (existingByProduct.get(p.id) ?? []).length === 0);
    const picks: Product[] = [];
    for (const p of withOffer) {
      if (picks.length >= Math.ceil(n * 0.6)) break;
      if (!picks.some((x) => x.brandId === p.brandId)) picks.push(p);
    }
    for (const p of [...withOffer, ...without]) {
      if (picks.length >= n) break;
      if (!picks.includes(p)) picks.push(p);
    }
    return picks.slice(0, n).map((p) => p.id);
  }

  const canaries = {
    rackets: pickCanaries("cat-padel-rackets", 10),
    shoes: pickCanaries("cat-padel-shoes", 5),
    balls: pickCanaries("cat-padel-balls", 10),
    bags: pickCanaries("cat-padel-bags", 10),
    grips: pickCanaries("cat-padel-grips", 10),
    accessories: pickCanaries("cat-padel-accessories", 10),
  };

  const audit = `# Padel commerce enrichment audit

**Date:** ${TODAY}  
**Scope:** ALL current canonical Padel products (rackets, shoes, balls, bags, grips, accessories)  
**Primary market:** NL · Secondary: BE, DE, FR, ES · Then: UK, US, ZA  
**Rule:** Catalog inclusion ≠ retail availability. Never invent affiliate tags or FX prices.

## Architecture

| Layer | Role |
| --- | --- |
| Offers | Canonical \`Offer\` → \`Retailer\` → \`region\` (shared \`getLowestOfferPrice\`) |
| Research sidecar | \`src/content/padel/commerce-enrichment/store.ts\` |
| Pack normalization | \`src/domain/commerce/pack-normalization.ts\` |
| Coverage | \`docs/padel/data/PADEL-COMMERCE-COVERAGE.csv\` |
| Conflicts | \`docs/padel/data/PADEL-COMMERCE-CONFLICTS.csv\` |
| Admin | \`/admin/catalog/padel-equipment/commerce\` |

## Coverage by category

| Category | Current products | NL offer rows | EU offer rows | Affiliate-mapped | No Kitletics offer | Stale | Conflicts | NL_AVAILABLE | EU_* class | BRAND_DIRECT | NO_CURRENT_OFFER_FOUND |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${Object.entries(byCat)
  .map(([cat, s]) => {
    return `| ${cat.replace("cat-padel-", "")} | ${s.n} | ${s.nlOffers} | ${s.euOffers} | ${s.affiliate} | ${s.noOffer} | ${s.stale} | ${s.conflicts} | ${s.nlClass} | ${s.euClass} | ${s.brandDirect} | ${s.noFound} |`;
  })
  .join("\n")}

**Totals:** ${Object.keys(store).length} products researched · COMMERCE_PENDING remaining: **${pending.length}** · RESEARCHED: ${researched.length}

## Separate coverage metrics (do not conflate)

| Metric | Definition |
| --- | --- |
| Any offer coverage | Product has ≥1 Kitletics Offer row (any region) |
| NL coverage | Product has ≥1 NL Offer row |
| EU coverage | Product has ≥1 BE/DE/FR/ES Offer row |
| Affiliate coverage | Product id present in \`PRODUCT_AFFILIATE_URLS\` (status still pending until env tags) |
| Fresh offer coverage | Offers in fresh/recent band (seed clock lifts seed/manual) |

## Classification rules

1. **NL_AVAILABLE** — priced NL Offer in-stock (or low-stock/unknown) on Kitletics.
2. **EU_AVAILABLE_TO_NL** — EU Offer / EU listing evidence that ships to NL; no NL Kitletics Offer yet.
3. **EU_ONLY** — EU listing with inventory NL_available=no.
4. **BRAND_DIRECT** — manufacturer store listing only.
5. **OUT_OF_STOCK** — only OOS Offers.
6. **NO_CURRENT_OFFER_FOUND** — researched; no verified priced Kitletics Offer (listing URL may still exist as evidence).

## Pack normalization

Balls and grips with NL offers store \`packNormalization\` (price per can / per ball / per grip). Bulk packs must not be compared on sticker price alone.

## Conflicts

${allConflicts.length} identity conflicts flagged. See \`PADEL-COMMERCE-CONFLICTS.csv\`.

## Representative canaries

| Category | Product IDs |
| --- | --- |
| Rackets (10) | ${canaries.rackets.join(", ")} |
| Shoes (5) | ${canaries.shoes.join(", ")} |
| Balls (10) | ${canaries.balls.join(", ")} |
| Bags (10) | ${canaries.bags.join(", ")} |
| Grips (10) | ${canaries.grips.join(", ")} |
| Accessories (10) | ${canaries.accessories.join(", ")} |

Manual verification checklist (per canary): brand + model + generation + pack match; region/currency consistent; From-price via \`getLowestOfferPrice\` only; no commission in ranking.

## Affiliate independence

Commission is **not** a field on Offer ranking (\`DEFAULT_OFFER_RANKING\`). Finder / Best Guide / score paths must not read affiliate payout. Regression: \`tests/padel-commerce.test.ts\`, \`tests/padel-commerce-enrichment.test.ts\`.

## New offers this pass

${newOffers.length} offers written to commerce-wave (\`--fetch\`: ${DO_FETCH}).

## Gate

COMMERCE_PENDING remaining: **${pending.length}**  
${pending.length === 0 ? "Gate PASS — every current product has a terminal commerce research state." : "Gate FAIL:\\n" + pending.map((p) => `- ${p.productId}`).join("\\n")}

## Next

1. Run \`node --import tsx scripts/tmp/enrich-padel-commerce.ts --fetch\` to attach priced NL specialist Offers where JSON-LD is available.
2. Replace remaining Amazon/Decathlon homepage seeds with product listing URLs.
3. Import verified amzn.to shortlinks via \`npm run offers:import-affiliate\` (never invent tags).
4. Add BE/FR/ES/UK/US/ZA Offers only with real regional listings — no FX fabrication.
`;

  writeFileSync(AUDIT_PATH, audit);

  console.log(
    JSON.stringify(
      {
        products: Object.keys(store).length,
        pending: pending.length,
        conflicts: allConflicts.length,
        newOffers: newOffers.length,
        byCat,
        fetch: DO_FETCH,
      },
      null,
      2,
    ),
  );

  // silence unused
  void shouldDisplayNumericPrice;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
