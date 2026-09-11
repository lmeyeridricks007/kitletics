/**
 * Enrich catalog products with Amazon Creators API SearchItems → Excel sheet.
 *
 * Requires .env.local:
 *   AMAZON_CREATORS_CREDENTIAL_ID
 *   AMAZON_CREATORS_CREDENTIAL_SECRET
 *   AMAZON_CREATORS_CREDENTIAL_VERSION   (e..g. 3.1)
 *   AMAZON_ASSOCIATES_TAG_US            (partner tag for marketplace)
 *   AMAZON_CREATORS_MARKETPLACE         (default www.amazon.com)
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/amazon-creators-enrich-products.ts
 *   npx tsx --tsconfig tsconfig.json scripts/amazon-creators-enrich-products.ts --limit=5
 *   npx tsx --tsconfig tsconfig.json scripts/amazon-creators-enrich-products.ts --resume
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { brands } from "@/content/brands";
import { products } from "@/content/products";
import { categories } from "@/content/taxonomy/categories";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnvLocal() {
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

const CREDENTIAL_ID = required("AMAZON_CREATORS_CREDENTIAL_ID");
const CREDENTIAL_SECRET = required("AMAZON_CREATORS_CREDENTIAL_SECRET");
const CREDENTIAL_VERSION = (
  process.env.AMAZON_CREATORS_CREDENTIAL_VERSION ?? "3.1"
).replace(/^v/i, "");
const PARTNER_TAG =
  process.env.AMAZON_ASSOCIATES_TAG_US ??
  process.env.AMAZON_CREATORS_PARTNER_TAG;
const MARKETPLACE =
  process.env.AMAZON_CREATORS_MARKETPLACE ?? "www.amazon.com";

if (!PARTNER_TAG) {
  throw new Error(
    "Set AMAZON_ASSOCIATES_TAG_US or AMAZON_CREATORS_PARTNER_TAG",
  );
}

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env ${key}`);
  return v;
}

/** Version 3.x → Login with Amazon; 2.x → Cognito (legacy). */
function tokenEndpointForVersion(version: string): string {
  if (version.startsWith("3.1")) return "https://api.amazon.com/auth/o2/token";
  if (version.startsWith("3.2")) return "https://api.amazon.co.uk/auth/o2/token";
  if (version.startsWith("3.3")) return "https://api.amazon.co.jp/auth/o2/token";
  if (version.startsWith("2.1"))
    return "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token";
  if (version.startsWith("2.2"))
    return "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token";
  if (version.startsWith("2.3"))
    return "https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token";
  // Default NA LwA
  return "https://api.amazon.com/auth/o2/token";
}

function authHeader(token: string): string {
  if (CREDENTIAL_VERSION.startsWith("2.")) {
    return `Bearer, Version ${CREDENTIAL_VERSION} ${token}`;
  }
  return `Bearer ${token}`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : undefined;
const RESUME = args.includes("--resume");
const DELAY_MS = Number(process.env.AMAZON_CREATORS_DELAY_MS ?? "1100");

const CACHE_DIR = resolve(process.cwd(), "data/amazon-creators-cache");
const OUT_XLS = resolve(
  process.cwd(),
  "kitletics-products-amazon-urls.xls",
);
const OUT_JSON = resolve(
  process.cwd(),
  "data/amazon-creators-enrichment.json",
);

mkdirSync(CACHE_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const endpoint = tokenEndpointForVersion(CREDENTIAL_VERSION);
  const isV3 = CREDENTIAL_VERSION.startsWith("3.");

  let res: Response;
  if (isV3) {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: CREDENTIAL_ID,
        client_secret: CREDENTIAL_SECRET,
        scope: "creatorsapi::default",
      }),
    });
  } else {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CREDENTIAL_ID,
      client_secret: CREDENTIAL_SECRET,
      scope: "creatorsapi::default",
    });
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token request failed ${res.status}: ${text.slice(0, 500)}`);
  }
  const json = JSON.parse(text) as {
    access_token: string;
    expires_in?: number;
  };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

// ---------------------------------------------------------------------------
// SearchItems
// ---------------------------------------------------------------------------

type SearchItem = {
  asin?: string;
  detailPageURL?: string;
  itemInfo?: { title?: { displayValue?: string } };
};

type SearchResponse = {
  searchResult?: { items?: SearchItem[]; totalResultCount?: number };
  errors?: Array<{ code?: string; message?: string }>;
};

async function searchItems(keywords: string): Promise<SearchResponse> {
  const token = await getAccessToken();
  const res = await fetch(
    "https://creatorsapi.amazon/catalog/v1/searchItems",
    {
      method: "POST",
      headers: {
        Authorization: authHeader(token),
        "Content-Type": "application/json",
        "x-marketplace": MARKETPLACE,
      },
      body: JSON.stringify({
        keywords,
        partnerTag: PARTNER_TAG,
        marketplace: MARKETPLACE,
        itemCount: 5,
        resources: [
          "itemInfo.title",
          "images.primary.small",
          "offersV2.listings.price",
        ],
      }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SearchItems ${res.status}: ${text.slice(0, 800)}`);
  }
  return JSON.parse(text) as SearchResponse;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function cacheKey(slug: string, keywords: string): string {
  const h = createHash("sha1").update(keywords).digest("hex").slice(0, 10);
  return resolve(CACHE_DIR, `${slug}_${h}.json`);
}

function scoreMatch(
  productTitle: string,
  brandName: string,
  amazonTitle: string,
): { score: number; notes: string } {
  const hay = amazonTitle.toLowerCase();
  const brand = brandName.toLowerCase();
  const tokens = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && t !== brand);

  let score = 0;
  const notes: string[] = [];
  if (brand && hay.includes(brand)) {
    score += 40;
    notes.push("brand");
  } else if (brand) {
    notes.push("no-brand");
  }

  let hit = 0;
  for (const t of tokens) {
    if (hay.includes(t)) hit += 1;
  }
  if (tokens.length) {
    const ratio = hit / tokens.length;
    score += Math.round(ratio * 60);
    notes.push(`tokens ${hit}/${tokens.length}`);
  }

  return { score, notes: notes.join(", ") };
}

function pickBest(
  productFullName: string,
  brandName: string,
  items: SearchItem[],
): {
  asin: string;
  amazonUrl: string;
  matchTitle: string;
  matchScore: number;
  matchNotes: string;
} | null {
  let best: {
    asin: string;
    amazonUrl: string;
    matchTitle: string;
    matchScore: number;
    matchNotes: string;
  } | null = null;

  for (const item of items) {
    const asin = item.asin;
    if (!asin) continue;
    const title = item.itemInfo?.title?.displayValue ?? "";
    const url =
      item.detailPageURL ??
      `https://${MARKETPLACE}/dp/${asin}`;
    const { score, notes } = scoreMatch(productFullName, brandName, title);
    if (!best || score > best.matchScore) {
      best = {
        asin,
        amazonUrl: stripAffiliateTag(url),
        matchTitle: title,
        matchScore: score,
        matchNotes: notes,
      };
    }
  }
  return best;
}

/** Store clean product URLs — Kitletics /go adds the tag. */
function stripAffiliateTag(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("tag");
    u.searchParams.delete("linkCode");
    u.searchParams.delete("ref_");
    // Prefer canonical /dp/ASIN when possible
    const m = u.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (m) {
      return `${u.protocol}//${u.host}/dp/${m[1].toUpperCase()}`;
    }
    return u.toString();
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Excel (SpreadsheetML)
// ---------------------------------------------------------------------------

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cell(value: string): string {
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

const HEADERS = [
  "id",
  "slug",
  "name",
  "fullName",
  "brand",
  "category",
  "lifecycleStatus",
  "asin",
  "amazonUrl",
  "matchTitle",
  "matchScore",
  "matchStatus",
  "error",
] as const;

type Row = Record<(typeof HEADERS)[number], string>;

function writeExcel(rows: Row[], path: string) {
  const headerRow = `<Row>${HEADERS.map((h) => cell(h)).join("")}</Row>`;
  const dataRows = rows
    .map((r) => `<Row>${HEADERS.map((h) => cell(r[h] ?? "")).join("")}</Row>`)
    .join("\n");
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Products">
  <Table>
${headerRow}
${dataRows}
  </Table>
 </Worksheet>
</Workbook>
`;
  writeFileSync(path, workbook, "utf8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const brandById = new Map(brands.map((b) => [b.id, b.name]));
const categoryById = new Map(categories.map((c) => [c.id, c.name]));

type Enrichment = {
  productId: string;
  slug: string;
  keywords: string;
  asin?: string;
  amazonUrl?: string;
  matchTitle?: string;
  matchScore?: number;
  matchStatus: "ok" | "weak" | "none" | "error";
  error?: string;
  fetchedAt: string;
};

async function enrichOne(
  product: (typeof products)[number],
): Promise<Enrichment> {
  const brandName = brandById.get(product.brandId) ?? "";
  const keywords = product.fullName;
  const file = cacheKey(product.slug, keywords);

  if (RESUME && existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, "utf8")) as Enrichment;
    // Retry previous API/eligibility failures; keep successful lookups.
    if (cached.matchStatus !== "error") return cached;
  }

  try {
    const data = await searchItems(keywords);
    if (data.errors?.length) {
      const err = data.errors.map((e) => e.message ?? e.code).join("; ");
      const row: Enrichment = {
        productId: product.id,
        slug: product.slug,
        keywords,
        matchStatus: "error",
        error: err,
        fetchedAt: new Date().toISOString(),
      };
      writeFileSync(file, JSON.stringify(row, null, 2));
      return row;
    }

    const items = data.searchResult?.items ?? [];
    const best = pickBest(product.fullName, brandName, items);
    if (!best) {
      const row: Enrichment = {
        productId: product.id,
        slug: product.slug,
        keywords,
        matchStatus: "none",
        fetchedAt: new Date().toISOString(),
      };
      writeFileSync(file, JSON.stringify(row, null, 2));
      return row;
    }

    const matchStatus: Enrichment["matchStatus"] =
      best.matchScore >= 70 ? "ok" : best.matchScore >= 45 ? "weak" : "none";

    const row: Enrichment = {
      productId: product.id,
      slug: product.slug,
      keywords,
      asin: best.asin,
      amazonUrl: best.amazonUrl,
      matchTitle: best.matchTitle,
      matchScore: best.matchScore,
      matchStatus: matchStatus === "none" ? "weak" : matchStatus,
      fetchedAt: new Date().toISOString(),
    };
    // If score is very low, still keep ASIN but mark weak for review
    if (best.matchScore < 45) {
      row.matchStatus = "weak";
    }
    writeFileSync(file, JSON.stringify(row, null, 2));
    return row;
  } catch (e) {
    const row: Enrichment = {
      productId: product.id,
      slug: product.slug,
      keywords,
      matchStatus: "error",
      error: e instanceof Error ? e.message : String(e),
      fetchedAt: new Date().toISOString(),
    };
    writeFileSync(file, JSON.stringify(row, null, 2));
    return row;
  }
}

async function main() {
  console.log(`Marketplace: ${MARKETPLACE}`);
  console.log(`Partner tag: ${PARTNER_TAG}`);
  console.log(`Credential version: ${CREDENTIAL_VERSION}`);
  console.log("Fetching access token…");
  await getAccessToken();
  console.log("Token OK");

  const list = [...products]
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .slice(0, LIMIT);

  console.log(`Enriching ${list.length} products (delay ${DELAY_MS}ms)…`);

  const enrichments: Enrichment[] = [];
  let i = 0;
  for (const p of list) {
    i += 1;
    const fromCache = RESUME && existsSync(cacheKey(p.slug, p.fullName));
    const row = await enrichOne(p);
    enrichments.push(row);
    const label =
      row.matchStatus === "ok"
        ? row.asin
        : row.matchStatus === "weak"
          ? `${row.asin} (weak)`
          : row.matchStatus;
    console.log(
      `[${i}/${list.length}] ${p.fullName} → ${label}${fromCache ? " [cache]" : ""}`,
    );
    if (!fromCache && i < list.length) await sleep(DELAY_MS);
  }

  writeFileSync(OUT_JSON, JSON.stringify(enrichments, null, 2));

  const byId = new Map(enrichments.map((e) => [e.productId, e]));
  const excelRows: Row[] = list.map((p) => {
    const e = byId.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      fullName: p.fullName,
      brand: brandById.get(p.brandId) ?? p.brandId,
      category: categoryById.get(p.categoryId) ?? p.categoryId,
      lifecycleStatus: p.lifecycleStatus,
      asin: e?.asin ?? "",
      amazonUrl: e?.amazonUrl ?? "",
      matchTitle: e?.matchTitle ?? "",
      matchScore: e?.matchScore != null ? String(e.matchScore) : "",
      matchStatus: e?.matchStatus ?? "",
      error: e?.error ?? "",
    };
  });

  writeExcel(excelRows, OUT_XLS);

  const ok = enrichments.filter((e) => e.matchStatus === "ok").length;
  const weak = enrichments.filter((e) => e.matchStatus === "weak").length;
  const none = enrichments.filter((e) => e.matchStatus === "none").length;
  const err = enrichments.filter((e) => e.matchStatus === "error").length;
  console.log(`\nDone. ok=${ok} weak=${weak} none=${none} error=${err}`);
  console.log(`Excel: ${OUT_XLS}`);
  console.log(`JSON:  ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
