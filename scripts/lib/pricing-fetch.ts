/**
 * Price discovery helpers — JSON-LD / RunRepeat / optional Amazon Creators API.
 * Never invent affiliate tracking URLs; store clean product URLs only.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface DiscoveredPrice {
  price: number;
  currency: string;
  url: string;
  source: "runrepeat" | "json-ld" | "amazon-creators" | "seed-refresh";
  title?: string;
  asin?: string;
  confidence: "high" | "medium" | "low";
  detail?: string;
}

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const UA =
  "Mozilla/5.0 (compatible; KitleticsPricingBot/1.0; +https://kitletics.com)";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseMoney(raw: unknown): number | null {
  if (typeof raw === "number" && raw > 0 && raw < 50_000) return raw;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && n > 0 && n < 50_000) return n;
  }
  return null;
}

function walkOffers(node: unknown, out: DiscoveredPrice[], pageUrl: string): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkOffers(item, out, pageUrl);
    return;
  }
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  if (types.some((t) => String(t).toLowerCase().includes("offer"))) {
    const price = parseMoney(obj.price ?? (obj.priceSpecification as { price?: unknown })?.price);
    const currency =
      typeof obj.priceCurrency === "string"
        ? obj.priceCurrency
        : typeof (obj.priceSpecification as { priceCurrency?: string })?.priceCurrency ===
            "string"
          ? (obj.priceSpecification as { priceCurrency: string }).priceCurrency
          : "USD";
    if (price) {
      out.push({
        price,
        currency,
        url: typeof obj.url === "string" ? obj.url : pageUrl,
        source: "json-ld",
        confidence: "medium",
        detail: "schema.org Offer",
      });
    }
  }
  if (obj.offers) walkOffers(obj.offers, out, pageUrl);
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") walkOffers(v, out, pageUrl);
  }
}

/** Extract schema.org offers from a product page. */
export async function discoverPriceFromPage(
  pageUrl: string,
): Promise<DiscoveredPrice | null> {
  const html = await fetchText(pageUrl);
  if (!html) return null;
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  const found: DiscoveredPrice[] = [];
  for (const m of blocks) {
    try {
      const data = JSON.parse(m[1]!);
      walkOffers(data, found, pageUrl);
    } catch {
      /* ignore */
    }
  }
  const plausible = found.filter((p) => p.price >= 20 && p.price <= 2000);
  plausible.sort((a, b) => a.price - b.price);
  return plausible[0] ?? null;
}

/**
 * RunRepeat often lists street MSRP as $NNN near the product hero.
 * Prefer explicit "$140" style near "MSRP" over opaque numeric ids.
 */
export async function discoverPriceFromRunRepeat(
  slug: string,
): Promise<DiscoveredPrice | null> {
  const url = `https://runrepeat.com/${slug}`;
  const html = await fetchText(url);
  if (!html) return null;

  const msrpNear = html.match(/MSRP[^$]{0,40}\$(\d{2,4}(?:\.\d{2})?)/i);
  if (msrpNear) {
    const price = Number(msrpNear[1]);
    if (price >= 40 && price <= 500) {
      return {
        price,
        currency: "USD",
        url,
        source: "runrepeat",
        confidence: "medium",
        detail: "RunRepeat MSRP $",
      };
    }
  }

  const dollars = [...html.matchAll(/\$(\d{2,3})(?:\.\d{2})?\b/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 60 && n <= 400);
  if (dollars.length) {
    // Mode / median of common shoe price band
    dollars.sort((a, b) => a - b);
    const mid = dollars[Math.floor(dollars.length / 2)]!;
    return {
      price: mid,
      currency: "USD",
      url,
      source: "runrepeat",
      confidence: "low",
      detail: "RunRepeat $ heuristic",
    };
  }

  return discoverPriceFromPage(url);
}

/** Approximate EUR street from USD list (seed commerce uses EUR for NL). */
export function usdToEurList(usd: number): number {
  return Math.round(usd * 0.95);
}

// --- Amazon Creators (optional) ---

type AmazonListing = {
  asin?: string;
  detailPageURL?: string;
  itemInfo?: { title?: { displayValue?: string } };
  offersV2?: {
    listings?: Array<{
      price?: { money?: { amount?: number; currency?: string } };
    }>;
  };
};

function amazonConfigured(): boolean {
  return Boolean(
    process.env.AMAZON_CREATORS_CREDENTIAL_ID &&
      process.env.AMAZON_CREATORS_CREDENTIAL_SECRET &&
      (process.env.AMAZON_ASSOCIATES_TAG_US ||
        process.env.AMAZON_CREATORS_PARTNER_TAG),
  );
}

function tokenEndpointForVersion(version: string): string {
  if (version.startsWith("3.1")) return "https://api.amazon.com/auth/o2/token";
  if (version.startsWith("3.2")) return "https://api.amazon.co.uk/auth/o2/token";
  if (version.startsWith("3.3")) return "https://api.amazon.co.jp/auth/o2/token";
  return "https://api.amazon.com/auth/o2/token";
}

let cachedAmazonToken: { value: string; expiresAt: number } | null = null;

async function amazonAccessToken(): Promise<string | null> {
  if (!amazonConfigured()) return null;
  if (cachedAmazonToken && Date.now() < cachedAmazonToken.expiresAt - 60_000) {
    return cachedAmazonToken.value;
  }
  const id = process.env.AMAZON_CREATORS_CREDENTIAL_ID!;
  const secret = process.env.AMAZON_CREATORS_CREDENTIAL_SECRET!;
  const version = (
    process.env.AMAZON_CREATORS_CREDENTIAL_VERSION ?? "3.1"
  ).replace(/^v/i, "");
  const endpoint = tokenEndpointForVersion(version);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
      scope: "creatorsapi::default",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) return null;
  cachedAmazonToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedAmazonToken.value;
}

function cacheDir(): string {
  const dir = resolve(process.cwd(), "data/staging/pricing-cache");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function discoverPriceFromAmazon(
  keywords: string,
): Promise<DiscoveredPrice | null> {
  const token = await amazonAccessToken();
  if (!token) return null;
  const partnerTag =
    process.env.AMAZON_ASSOCIATES_TAG_US ??
    process.env.AMAZON_CREATORS_PARTNER_TAG!;
  const marketplace =
    process.env.AMAZON_CREATORS_MARKETPLACE ?? "www.amazon.com";
  const cachePath = resolve(
    cacheDir(),
    `amz-${createHash("sha1").update(keywords).digest("hex").slice(0, 12)}.json`,
  );
  if (existsSync(cachePath)) {
    try {
      return JSON.parse(readFileSync(cachePath, "utf8")) as DiscoveredPrice;
    } catch {
      /* continue */
    }
  }

  const res = await fetch(
    "https://creatorsapi.amazon/catalog/v1/searchItems",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-marketplace": marketplace,
      },
      body: JSON.stringify({
        keywords,
        partnerTag,
        marketplace,
        itemCount: 5,
        resources: ["itemInfo.title", "offersV2.listings.price"],
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    searchResult?: { items?: AmazonListing[] };
  };
  const items = data.searchResult?.items ?? [];
  for (const item of items) {
    const money = item.offersV2?.listings?.[0]?.price?.money;
    const amount = money?.amount;
    const currency = money?.currency ?? "USD";
    if (!amount || amount < 20) continue;
    const asin = item.asin;
    const url = asin
      ? `https://${marketplace}/dp/${asin}`
      : item.detailPageURL;
    if (!url) continue;
    const hit: DiscoveredPrice = {
      price: Math.round(amount * 100) / 100,
      currency,
      url: url.split("?")[0]!,
      source: "amazon-creators",
      title: item.itemInfo?.title?.displayValue,
      asin,
      confidence: "high",
      detail: "Amazon Creators SearchItems",
    };
    writeFileSync(cachePath, JSON.stringify(hit, null, 2));
    return hit;
  }
  return null;
}

export function canUseAmazonCreators(): boolean {
  return amazonConfigured();
}

