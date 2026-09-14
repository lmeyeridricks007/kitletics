/**
 * Research + fetch authentic heroes for MEDIA_MISSING padel soft goods.
 *
 * Strategy:
 * 1. Read PADEL-MEDIA-COVERAGE.csv + inventory URLs
 * 2. Prefer PadeLMQ / Shopify product.json image, then og:image from manufacturer/retailer PDPs
 * 3. Score identity tokens in URL/filename vs model name
 * 4. Download + jpeg optimize + unique-byte check
 * 5. Append registry entries to soft-goods/product-media.ts
 * 6. Never auto-approve score < 85
 *
 * Usage:
 *   node scripts/tmp/fetch-padel-soft-media-wave.mjs
 *   node scripts/tmp/fetch-padel-soft-media-wave.mjs --limit=40 --brand=head
 *   node scripts/tmp/fetch-padel-soft-media-wave.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  assertUniqueHeroBytes,
  manufacturerHostScore,
  rememberHeroFile,
} from "../lib/hero-download.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const COVERAGE = path.join(ROOT, "docs/padel/data/PADEL-MEDIA-COVERAGE.csv");
const INV = path.join(ROOT, "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv");
const MEDIA_TS = path.join(
  ROOT,
  "src/content/padel/soft-goods/product-media.ts",
);
const REPORT = path.join(
  ROOT,
  "data/staging/padel-soft-media-wave.json",
);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const brandArg = args.find((a) => a.startsWith("--brand="));
const catArg = args.find((a) => a.startsWith("--category="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 50;
const BRAND_FILTER = brandArg ? brandArg.split("=")[1].toLowerCase() : "";
const CAT_FILTER = catArg ? catArg.split("=")[1].toLowerCase() : "";

function splitCsvLine(line) {
  const out = [];
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

function parseCsv(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function tokens(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["padel", "the", "and", "for", "with", "pack", "tube"].includes(t));
}

function identityScore(model, brand, imageUrl, pageUrl) {
  // Query strings must NOT count — PadeLMQ search hits embed the query in
  // `_psq=` while the pathname is often a different product.
  let pathOnly = "";
  try {
    pathOnly = new URL(pageUrl).pathname.toLowerCase();
  } catch {
    pathOnly = String(pageUrl || "")
      .split("?")[0]
      .toLowerCase();
  }
  const imgPath = String(imageUrl || "")
    .split("?")[0]
    .toLowerCase();
  const hay = `${imgPath} ${pathOnly}`;
  const modelToks = tokens(model);
  const brandTok = brand.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)[0];
  let hit = 0;
  for (const t of modelToks) if (hay.includes(t)) hit++;
  const modelRatio = modelToks.length ? hit / modelToks.length : 0;
  const brandHit = brandTok && hay.includes(brandTok) ? 1 : 0;
  let score = Math.round(40 + modelRatio * 45 + brandHit * 15);
  score += Math.min(10, Math.floor(manufacturerHostScore(imageUrl) / 10));
  // Penalize obvious tennis / wrong sport markers
  if (/tennis(?!pro)|running|nike-vomero|hyrox/i.test(hay) && !/padel/i.test(hay))
    score -= 40;
  // Reject brand logos / collection banners posing as product heroes
  if (/logo[_-]|wordmark|og_image\.png|collections\/|portada-blog/i.test(hay))
    score -= 50;
  // Cross-product search hits: pathname names a different category/SKU family
  if (
    /testracket|padelracket|(?:^|\/)[\w-]*racket(?:-|$)/i.test(pathOnly) &&
    !/grip|overgrip|bag|tas|tube|ball|protector|wrist/i.test(pathOnly)
  ) {
    score -= 35;
  }
  return Math.max(0, Math.min(99, score));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { text: await res.text(), finalUrl: res.url };
}

function extractOgImage(html) {
  const m =
    html.match(
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    ) ||
    html.match(
      /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    );
  return m?.[1] || null;
}

function extractJsonLdImages(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1]);
      const stack = Array.isArray(j) ? j : [j];
      for (const node of stack) {
        const img = node?.image;
        if (typeof img === "string") out.push(img);
        else if (Array.isArray(img))
          out.push(...img.map((x) => (typeof x === "string" ? x : x?.url)).filter(Boolean));
        else if (img?.url) out.push(img.url);
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

async function resolveShopifyProductImage(productUrl) {
  try {
    const u = new URL(productUrl);
    const handle = u.pathname.split("/products/")[1]?.split("/")[0]?.split("?")[0];
    if (!handle) return null;
    const jsonUrl = `${u.origin}/products/${handle}.json`;
    const { text } = await fetchText(jsonUrl);
    const j = JSON.parse(text);
    return j?.product?.image?.src || j?.product?.images?.[0]?.src || null;
  } catch {
    return null;
  }
}

/** PadeLMQ / Shopify suggest search → product handle + image */
async function searchPadelmq(brand, model) {
  const q = encodeURIComponent(`${brand} ${model}`.trim());
  const url = `https://www.padelmq.com/search/suggest.json?q=${q}&resources[type]=product&resources[limit]=6`;
  try {
    const { text } = await fetchText(url);
    const j = JSON.parse(text);
    const products = j?.resources?.results?.products || [];
    return products.map((p) => ({
      imageUrl: p.image || p.featured_image,
      pageUrl: p.url?.startsWith("http")
        ? p.url
        : `https://www.padelmq.com${p.url || `/products/${p.handle}`}`,
      title: p.title || "",
      sourceType: "padelmq-suggest",
    })).filter((p) => p.imageUrl);
  } catch {
    return [];
  }
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`img HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html"))
    throw new Error("html body");
  return buf;
}

function categoryDir(cat) {
  const map = {
    balls: "balls",
    bags: "bags",
    grips: "grips",
    accessories: "accessories",
  };
  return map[cat] || "products";
}

function appendMediaRegistry(entries) {
  if (!entries.length) return;
  let src = fs.readFileSync(MEDIA_TS, "utf8");
  const insertAt = src.lastIndexOf("};");
  if (insertAt < 0) throw new Error("cannot find registry end");
  const block = entries
    .map((e) => {
      return `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "${e.licence}",
    attribution: "© Brand — official / authorized product photography",
    width: ${e.width},
    height: ${e.height},
    retrievedAt: "${e.retrievedAt}",
  },
`;
    })
    .join("");
  src = src.slice(0, insertAt) + block + src.slice(insertAt);
  fs.writeFileSync(MEDIA_TS, src);
}

async function researchCandidate(row, invById) {
  const inv = invById.get(row.productId);
  const urls = [];
  if (inv?.manufacturer_url) urls.push(inv.manufacturer_url);
  if (inv?.retailer_urls) {
    for (const u of inv.retailer_urls.split("|")) {
      const t = u.trim();
      if (t) urls.push(t);
    }
  }
  // Prefer specialist retailers with product.json
  urls.sort((a, b) => {
    const score = (u) =>
      /padelmq\.com|padelshop\.com|zonadepadel|padelnuestro|padelmarket/i.test(u)
        ? 0
        : 1;
    return score(a) - score(b);
  });

  const candidates = [];
  for (const pageUrl of urls.slice(0, 4)) {
    try {
      if (/\/products\//i.test(pageUrl)) {
        const shopifyImg = await resolveShopifyProductImage(pageUrl);
        if (shopifyImg) {
          candidates.push({
            imageUrl: shopifyImg,
            pageUrl,
            sourceType: "retailer-shopify-json",
          });
        }
      }
      const { text, finalUrl } = await fetchText(pageUrl);
      const og = extractOgImage(text);
      if (og) {
        candidates.push({
          imageUrl: og,
          pageUrl: finalUrl || pageUrl,
          sourceType: "og:image",
        });
      }
      for (const img of extractJsonLdImages(text).slice(0, 3)) {
        candidates.push({
          imageUrl: img,
          pageUrl: finalUrl || pageUrl,
          sourceType: "json-ld",
        });
      }
    } catch {
      /* try next */
    }
  }

  // Specialist search fallback when inventory lacks product PDPs
  if (candidates.length < 2) {
    for (const hit of await searchPadelmq(row.brand, row.model)) {
      candidates.push(hit);
    }
  }

  // Dedup by image URL
  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    const key = c.imageUrl.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const score = identityScore(
      row.model,
      row.brand,
      `${c.imageUrl} ${c.title || ""}`,
      c.pageUrl,
    );
    uniq.push({ ...c, score });
  }
  uniq.sort((a, b) => b.score - a.score);
  return uniq[0] || null;
}

async function main() {
  const coverage = parseCsv(COVERAGE).filter((r) => r.status === "MEDIA_MISSING");
  const invRows = parseCsv(INV);
  const invById = new Map();
  for (const r of invRows) {
    if (r.kitletics_product_id && !invById.has(r.kitletics_product_id)) {
      invById.set(r.kitletics_product_id, r);
    }
  }

  let queue = coverage.filter((r) => {
    if (BRAND_FILTER && !r.brand.toLowerCase().includes(BRAND_FILTER)) return false;
    if (CAT_FILTER && r.category !== CAT_FILTER) return false;
    return true;
  });

  // Prefer brands with richer PDP URLs first within filter
  queue = queue.slice(0, LIMIT);

  const results = [];
  const registryEntries = [];

  for (const row of queue) {
    const result = {
      productId: row.productId,
      category: row.category,
      brand: row.brand,
      model: row.model,
      status: "MEDIA_MISSING",
    };
    try {
      const best = await researchCandidate(row, invById);
      if (!best) {
        result.status = "MEDIA_MISSING";
        result.reason = "no_candidate_from_inventory_or_search";
        results.push(result);
        console.log("MISSING", row.productId, result.reason);
        continue;
      }
      result.candidateImage = best.imageUrl;
      result.candidateSource = best.pageUrl;
      result.identityConfidence = best.score;
      result.sourceType = best.sourceType;

      if (best.score < 85) {
        result.status = "MEDIA_CANDIDATE";
        result.reason = `score_${best.score}_needs_manual_review`;
        results.push(result);
        console.log("CANDIDATE", row.productId, best.score, best.imageUrl.slice(0, 80));
        continue;
      }

      if (dryRun) {
        result.status = "DRY_RUN_WOULD_VERIFY";
        results.push(result);
        console.log("DRY", row.productId, best.score);
        continue;
      }

      const buf = await downloadImage(best.imageUrl);
      const jpeg = await sharp(buf)
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
      assertUniqueHeroBytes(jpeg, row.productId);

      const slug = row.productId.replace(/^prod-/, "");
      const dir = path.join(
        ROOT,
        "public/images/padel",
        categoryDir(row.category),
      );
      fs.mkdirSync(dir, { recursive: true });
      const file = `${slug}-hero.jpg`;
      const abs = path.join(dir, file);
      fs.writeFileSync(abs, jpeg);
      rememberHeroFile(abs);
      const rel = `/images/padel/${categoryDir(row.category)}/${file}`;

      const meta = await sharp(jpeg).metadata();
      const licence = /padelmq|padelshop|zonadepadel|padelnuestro|padelmarket|decathlon/i.test(
        best.pageUrl,
      )
        ? "retailer-authorized"
        : "manufacturer-marketing";

      registryEntries.push({
        id: row.productId,
        src: rel,
        sourceUrl: best.pageUrl,
        source: `${best.sourceType} · ${row.brand} ${row.model}`,
        licence,
        width: meta.width || 1200,
        height: meta.height || 1200,
        retrievedAt: new Date().toISOString().slice(0, 10),
      });

      result.status = "MEDIA_VERIFIED";
      result.src = rel;
      result.bytes = jpeg.length;
      results.push(result);
      console.log("VERIFIED", row.productId, best.score, rel);
    } catch (e) {
      result.status = "MEDIA_MISSING";
      result.reason = String(e?.message || e).slice(0, 200);
      results.push(result);
      console.log("MISSING", row.productId, result.reason);
    }
  }

  if (registryEntries.length && !dryRun) {
    appendMediaRegistry(registryEntries);
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(
    REPORT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun,
        limit: LIMIT,
        brandFilter: BRAND_FILTER || null,
        categoryFilter: CAT_FILTER || null,
        summary: {
          verified: results.filter((r) => r.status === "MEDIA_VERIFIED").length,
          candidate: results.filter((r) => r.status === "MEDIA_CANDIDATE").length,
          blocked: results.filter((r) => r.status === "MEDIA_BLOCKED").length,
        },
        results,
        registryEntries,
      },
      null,
      2,
    ),
  );
  console.log("\nWrote", REPORT);
  console.log(
    "verified",
    results.filter((r) => r.status === "MEDIA_VERIFIED").length,
    "candidate",
    results.filter((r) => r.status === "MEDIA_CANDIDATE").length,
    "blocked",
    results.filter((r) => r.status === "MEDIA_BLOCKED").length,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
