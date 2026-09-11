/**
 * Fix 79 — validate all active Day-1 INDEXABLE Running Offer URLs.
 *
 *   npm run offers:validate-urls:day1
 *   npm run offers:validate-urls:day1 -- --inventory
 *   npm run offers:validate-urls:day1 -- --concurrency=8
 *
 * Merges into src/content/offers-url-validation.ts (does not wipe non-Day-1 rows).
 * INVALID stays in the overlay (hidden from CTAs); seed rows are not deleted.
 */
import fs from "node:fs";
import path from "node:path";
import { getLaunchEligibility } from "@/domain/launch/get-launch-eligibility";
import { getProducts, getBrandById } from "@/repositories/products";
import {
  getActiveOffers,
  getOffers,
  resolveOfferDestination,
} from "@/repositories/commerce";
import { OFFER_URL_VALIDATION } from "@/content/offers-url-validation";
import {
  classifyOfferUrlObservations,
  classifyOfferUrlStructure,
  type OfferUrlCheckObservation,
  type OfferUrlValidationRecord,
} from "@/domain/commerce/offer-url-validation";
import {
  assessOfferDestinationIdentity,
  type OfferIdentityStatus,
} from "@/domain/commerce/offer-destination-identity";
import type { Offer } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TIMEOUT_MS = 10_000;
const PROD = { isDev: false } as const;
const REGION_RANK: Record<string, number> = { NL: 0, DE: 1, UK: 2 };

const args = process.argv.slice(2);
const inventoryOnly = args.includes("--inventory");
const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
const CONCURRENCY = Math.max(
  1,
  Number(concurrencyArg?.split("=")[1] ?? 6) || 6,
);

function regionRank(region: string): number {
  return REGION_RANK[region] ?? 10;
}

function indexableRunningProductIds(): Set<string> {
  const ids = new Set<string>();
  for (const product of getProducts(PROD)) {
    if (!product.sportIds.includes("sport-running")) continue;
    const elig = getLaunchEligibility({ kind: "product", entity: product }, PROD);
    if (elig.disposition === "INDEXABLE") ids.add(product.id);
  }
  return ids;
}

function day1RunningOffers(): Offer[] {
  const ids = indexableRunningProductIds();
  return getActiveOffers()
    .filter((o) => ids.has(o.productId) && Boolean(o.url))
    .sort((a, b) => {
      const r = regionRank(a.region) - regionRank(b.region);
      return r !== 0 ? r : a.id.localeCompare(b.id);
    });
}

async function mapPool<T, R>(
  items: T[],
  n: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
  return out;
}

async function observe(
  method: "HEAD" | "GET",
  url: string,
): Promise<OfferUrlCheckObservation> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent": UA,
        Accept: method === "GET" ? "text/html,application/xhtml+xml,*/*" : "*/*",
      },
    });
    let bodyHint: string | undefined;
    if (method === "GET") {
      const text = await res.text();
      bodyHint = text.slice(0, 8_000);
    } else {
      await res.arrayBuffer().catch(() => undefined);
    }
    return {
      method,
      status: res.status,
      finalUrl: res.url,
      bodyHint,
      elapsedMs: Date.now() - started,
    };
  } catch (e) {
    return {
      method,
      error: e instanceof Error ? e.message : String(e),
      elapsedMs: Date.now() - started,
    };
  }
}

export interface Day1ValidationRow extends OfferUrlValidationRecord {
  region: RegionCode;
  retailerId: string;
  productId: string;
  identity: OfferIdentityStatus;
  identityNotes: string;
  shallow: boolean;
}

async function validateOne(offer: Offer): Promise<Day1ValidationRow> {
  const product = getProducts(PROD).find((p) => p.id === offer.productId);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const structural = classifyOfferUrlStructure(offer.url);
  if (structural) {
    const identity = assessOfferDestinationIdentity({
      url: offer.url,
      productName: product?.name ?? "",
      brandName: brand?.name,
    });
    return {
      offerId: offer.id,
      url: offer.url,
      ...structural,
      region: offer.region,
      retailerId: offer.retailerId,
      productId: offer.productId,
      identity: identity.status,
      identityNotes: identity.notes,
      shallow: identity.status === "shallow_url",
    };
  }

  const observations: OfferUrlCheckObservation[] = [];
  observations.push(await observe("HEAD", offer.url));
  const head = observations[0]!;
  const needGet =
    !head.status ||
    head.status >= 400 ||
    head.status === 405 ||
    Boolean(head.error);

  if (needGet) {
    observations.push(await observe("GET", offer.url));
  }

  const result = classifyOfferUrlObservations(offer.url, observations);
  const identity = assessOfferDestinationIdentity({
    url: offer.url,
    productName: product?.name ?? "",
    brandName: brand?.name,
    bodyHint: observations.find((o) => o.method === "GET")?.bodyHint,
    httpStatus: result.httpStatus,
    botBlocked: result.failureReason === "bot_blocked",
  });

  const notes = [result.notes, identity.status !== "skipped" ? `identity:${identity.status}` : ""]
    .filter(Boolean)
    .join(" · ");

  return {
    offerId: offer.id,
    url: offer.url,
    ...result,
    notes: notes || result.notes,
    region: offer.region,
    retailerId: offer.retailerId,
    productId: offer.productId,
    identity: identity.status,
    identityNotes: identity.notes,
    shallow: identity.status === "shallow_url",
  };
}

function writeOverlay(records: OfferUrlValidationRecord[]) {
  const merged: Record<
    string,
    Omit<OfferUrlValidationRecord, "offerId" | "url"> & { url?: string }
  > = { ...OFFER_URL_VALIDATION };

  for (const r of records) {
    merged[r.offerId] = {
      state: r.state,
      checkedAt: r.checkedAt,
      httpStatus: r.httpStatus,
      redirectUrl: r.redirectUrl,
      failureReason: r.failureReason,
      notes: r.notes,
      url: r.url,
    };
  }

  const lines: string[] = [
    `/**`,
    ` * Offer URL validation overlay — auto-generated (Fix 22 / Fix 79).`,
    ` * Do not hand-edit bulk entries; re-run offers:validate-urls:day1.`,
    ` * INVALID → hidden from CTAs. LIKELY_VALID (bot-block) remains displayable.`,
    ` */`,
    `import type { OfferUrlValidationRecord } from "@/domain/commerce/offer-url-validation";`,
    ``,
    `export const OFFER_URL_VALIDATION: Record<`,
    `  string,`,
    `  Omit<OfferUrlValidationRecord, "offerId" | "url"> & { url?: string }`,
    `> = {`,
  ];

  for (const id of Object.keys(merged).sort()) {
    const r = merged[id]!;
    lines.push(`  ${JSON.stringify(id)}: {`);
    lines.push(`    state: ${JSON.stringify(r.state)},`);
    lines.push(`    checkedAt: ${JSON.stringify(r.checkedAt)},`);
    if (r.httpStatus != null) lines.push(`    httpStatus: ${r.httpStatus},`);
    if (r.redirectUrl) {
      lines.push(`    redirectUrl: ${JSON.stringify(r.redirectUrl)},`);
    }
    if (r.failureReason) {
      lines.push(`    failureReason: ${JSON.stringify(r.failureReason)},`);
    }
    if (r.notes) lines.push(`    notes: ${JSON.stringify(r.notes)},`);
    if (r.url) lines.push(`    url: ${JSON.stringify(r.url)},`);
    lines.push(`  },`);
  }
  lines.push(`};`);
  lines.push(``);

  fs.writeFileSync(
    path.join(ROOT, "src/content/offers-url-validation.ts"),
    lines.join("\n"),
  );
}

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function goProbe() {
  const samples: { label: string; offerId: string; expectNetwork?: string }[] = [
    { label: "Amazon NL", offerId: "offer-pegasus41-nl" },
    { label: "Amazon DE", offerId: "offer-nb6-de" },
    { label: "Amazon UK", offerId: "offer-nb5-uk" },
    { label: "Decathlon / Awin pending", offerId: "offer-nb4-nl" },
    { label: "Garmin / Impact pending", offerId: "offer-fr965-nl" },
    { label: "All4Running specialist", offerId: "offer-vf4-nl-a4r" },
    { label: "ASICS brand-direct", offerId: "offer-nb5-nl" },
  ];

  return samples.map((s) => {
    const dest = resolveOfferDestination(s.offerId);
    if (!dest.ok) {
      return {
        label: s.label,
        offerId: s.offerId,
        ok: false,
        reason: dest.reason,
      };
    }
    const host = new URL(dest.resolved.destinationUrl).hostname;
    const destUrl = dest.resolved.destinationUrl;
    const leakedSecret =
      /tag=A[A-Z0-9]{8,}|awinaffid=\d{4,}|click\.impact\.com/i.test(destUrl) &&
      dest.resolved.isAffiliate;
    return {
      label: s.label,
      offerId: s.offerId,
      ok: true,
      isAffiliate: dest.resolved.isAffiliate,
      network: dest.resolved.network ?? null,
      host,
      passthrough: !dest.resolved.isAffiliate,
      retailerUrlHost: new URL(dest.offer.url).hostname,
      destinationIsHttp: destUrl.startsWith("http"),
      inventedTracking: Boolean(leakedSecret),
    };
  });
}

function inventoryReport() {
  const runningIds = indexableRunningProductIds();
  const all = getOffers();
  const active = getActiveOffers();
  const day1 = day1RunningOffers();
  const overlayIds = new Set(Object.keys(OFFER_URL_VALIDATION));
  const byRegion = countBy(day1, (o) => o.region);
  const overlayDay1 = day1.filter((o) => overlayIds.has(o.id));
  return {
    generatedAt: new Date().toISOString(),
    offersAll: all.length,
    offersActive: active.length,
    indexableRunningProducts: runningIds.size,
    day1RunningActiveOffers: day1.length,
    day1ByRegion: byRegion,
    overlayRows: overlayIds.size,
    day1AlreadyOverlay: overlayDay1.length,
    day1Unvalidated: day1.length - overlayDay1.length,
    inactiveOrExpired: all.filter(
      (o) => o.status === "inactive" || o.status === "expired",
    ).length,
  };
}

async function main() {
  const inv = inventoryReport();
  fs.mkdirSync(path.join(ROOT, "docs/prelaunch/data/rc-79"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "docs/prelaunch/data/rc-79/inventory.json"),
    JSON.stringify(inv, null, 2),
  );
  console.log("Inventory", inv);
  if (inventoryOnly) return;

  const targets = day1RunningOffers();
  console.log(
    `Validating ${targets.length} Day-1 Running offers (concurrency ${CONCURRENCY})…`,
  );

  const records = await mapPool(targets, CONCURRENCY, async (offer, i) => {
    const rec = await validateOne(offer);
    process.stdout.write(
      `[${i + 1}/${targets.length}] ${offer.region} ${offer.id} ${rec.state} ${rec.identity}\n`,
    );
    return rec;
  });

  writeOverlay(records);

  const byState = countBy(records, (r) => r.state);
  const byReason = countBy(
    records.filter((r) => r.failureReason),
    (r) => r.failureReason ?? "none",
  );
  const byIdentity = countBy(records, (r) => r.identity);
  const byRegionState: Record<string, Record<string, number>> = {};
  for (const r of records) {
    byRegionState[r.region] ??= {};
    byRegionState[r.region]![r.state] =
      (byRegionState[r.region]![r.state] ?? 0) + 1;
  }

  const go = goProbe();
  const overlayRowsAfter = Object.keys(OFFER_URL_VALIDATION).length +
    records.filter((r) => !(r.offerId in OFFER_URL_VALIDATION)).length;

  const report = {
    generatedAt: new Date().toISOString(),
    inventory: inv,
    checked: records.length,
    byState,
    byReason,
    byIdentity,
    byRegionState,
    invalid: records
      .filter((r) => r.state === "INVALID")
      .map((r) => ({
        offerId: r.offerId,
        url: r.url,
        failureReason: r.failureReason,
        httpStatus: r.httpStatus,
      })),
    unknown: records
      .filter((r) => r.state === "UNKNOWN")
      .map((r) => ({
        offerId: r.offerId,
        region: r.region,
        failureReason: r.failureReason,
        notes: r.notes,
      })),
    identityMismatch: records
      .filter((r) => r.identity === "mismatch")
      .map((r) => ({
        offerId: r.offerId,
        url: r.url,
        notes: r.identityNotes,
      })),
    goProbe: go,
    overlayRowsAfter,
  };

  fs.writeFileSync(
    path.join(ROOT, "docs/prelaunch/data/rc-79/validation.json"),
    JSON.stringify(report, null, 2),
  );

  console.log("\nSummary", byState);
  console.log("Identity", byIdentity);
  console.log("Regions", byRegionState);
  console.log("INVALID", report.invalid.length);
  console.log("Wrote overlay + docs/prelaunch/data/rc-79/validation.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
