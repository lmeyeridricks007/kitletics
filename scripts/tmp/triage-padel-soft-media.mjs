/**
 * Triage MEDIA_CANDIDATE + re-fetch MEDIA_MISSING for padel soft goods.
 *
 * Approve: product-looking CDN URLs with score ≥75 (or ≥70 on PadeLMQ PDP), unique bytes.
 * Reject: logos/collection OG/blog covers, shared-hero collisions, wrong-product search hits.
 * Hold: only when score mid-band and URL is ambiguous (rare).
 *
 * Usage:
 *   node scripts/tmp/triage-padel-soft-media.mjs
 *   node scripts/tmp/triage-padel-soft-media.mjs --dry-run
 *   node scripts/tmp/triage-padel-soft-media.mjs --approve-only
 *   node scripts/tmp/triage-padel-soft-media.mjs --missing-only
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
const MEDIA_TS = path.join(ROOT, "src/content/padel/soft-goods/product-media.ts");
const DECISIONS = path.join(
  ROOT,
  "data/staging/padel-soft-media-triage.json",
);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const approveOnly = args.includes("--approve-only");
const missingOnly = args.includes("--missing-only");

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
    .filter(
      (t) =>
        t.length > 2 &&
        !["padel", "the", "and", "for", "with", "pack", "tube", "family"].includes(
          t,
        ),
    );
}

function identityScore(model, brand, imageUrl, pageUrl) {
  const hay = `${imageUrl} ${pageUrl}`.toLowerCase();
  const modelToks = tokens(model);
  const brandTok = brand.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)[0];
  let hit = 0;
  for (const t of modelToks) if (hay.includes(t)) hit++;
  const modelRatio = modelToks.length ? hit / modelToks.length : 0;
  const brandHit = brandTok && hay.includes(brandTok) ? 1 : 0;
  let score = Math.round(40 + modelRatio * 45 + brandHit * 15);
  score += Math.min(10, Math.floor(manufacturerHostScore(imageUrl) / 10));
  if (/tennis(?!pro)|running|nike-vomero|hyrox/i.test(hay) && !/padel/i.test(hay))
    score -= 40;
  if (/logo[_-]|wordmark|og_image\.png|collections\/|portada-blog|inn\.jpg/i.test(hay))
    score -= 50;
  return Math.max(0, Math.min(99, score));
}

function isLogoOrBanner(url) {
  return /logo[_-]|wordmark|og_image\.png|\/collections\/|portada-blog|bolsas-marcas|inn\.jpg|guide-et-comparatif|best-padel-grips|actu-padel-top-3|tourna-logo/i.test(
    url || "",
  );
}

function isProductCdn(url) {
  return /padelmq\.com\/cdn\/shop\/files|cdn\.shopify\.com\/s\/files|padelmarket\.com\/cdn\/shop\/files|zonadepadel|decathlon|assets\.|scene7|varlion\.com|tubo\.plus|bullpadel\.com|babolat\.com\/on\/demandware|padelproshop\.com\/cdn\/shop\/files|padellifeshop|tennisshot\.gr\/image|padelnuestro\.com\/media\/catalog\/product|time2padel\.com|totalpadel\.com|oudetennisballen\.com|dunlopsports\.com|head\.com|yonex\.com|shockout|extreme-tennis/i.test(
    url || "",
  );
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
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  return m?.[1] || null;
}

function extractJsonLdImages(html) {
  const out = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1]);
      const stack = Array.isArray(j) ? j : [j];
      for (const node of stack) {
        const img = node?.image;
        if (typeof img === "string") out.push(img);
        else if (Array.isArray(img))
          out.push(
            ...img
              .map((x) => (typeof x === "string" ? x : x?.url))
              .filter(Boolean),
          );
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
    const handle = u.pathname
      .split("/products/")[1]
      ?.split("/")[0]
      ?.split("?")[0];
    if (!handle) return null;
    const jsonUrl = `${u.origin}/products/${handle}.json`;
    const { text } = await fetchText(jsonUrl);
    const j = JSON.parse(text);
    return j?.product?.image?.src || j?.product?.images?.[0]?.src || null;
  } catch {
    return null;
  }
}

async function searchPadelmq(brand, model) {
  const q = encodeURIComponent(`${brand} ${model}`.trim());
  const url = `https://www.padelmq.com/search/suggest.json?q=${q}&resources[type]=product&resources[limit]=8`;
  try {
    const { text } = await fetchText(url);
    const j = JSON.parse(text);
    const products = j?.resources?.results?.products || [];
    return products
      .map((p) => ({
        imageUrl: p.image || p.featured_image,
        pageUrl: p.url?.startsWith("http")
          ? p.url
          : `https://www.padelmq.com${p.url || `/products/${p.handle}`}`,
        title: p.title || "",
        sourceType: "padelmq-suggest",
      }))
      .filter((p) => p.imageUrl);
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
  return (
    { balls: "balls", bags: "bags", grips: "grips", accessories: "accessories" }[
      cat
    ] || "products"
  );
}

function appendMediaRegistry(entries) {
  if (!entries.length) return;
  let src = fs.readFileSync(MEDIA_TS, "utf8");
  // Skip IDs already present
  const fresh = entries.filter((e) => !src.includes(`"${e.id}":`));
  if (!fresh.length) return;
  const insertAt = src.lastIndexOf("};");
  if (insertAt < 0) throw new Error("cannot find registry end");
  const block = fresh
    .map(
      (e) => `  "${e.id}": {
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
`,
    )
    .join("");
  src = src.slice(0, insertAt) + block + src.slice(insertAt);
  fs.writeFileSync(MEDIA_TS, src);
}

async function researchFromUrls(row, urls) {
  const candidates = [];
  for (const pageUrl of urls.slice(0, 6)) {
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
      for (const img of extractJsonLdImages(text).slice(0, 4)) {
        candidates.push({
          imageUrl: img,
          pageUrl: finalUrl || pageUrl,
          sourceType: "json-ld",
        });
      }
      // TuboPlus / manufacturer product cards: grab large product images
      const imgRe =
        /(?:src|data-src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
      let im;
      while ((im = imgRe.exec(text))) {
        const u = im[1];
        if (/logo|icon|sprite|favicon|badge|banner|portada/i.test(u)) continue;
        if (/tubo\.plus|varlion|bullpadel|decathlon|padelmq|shopify/i.test(u)) {
          candidates.push({
            imageUrl: u,
            pageUrl: finalUrl || pageUrl,
            sourceType: "page-img",
          });
        }
      }
    } catch {
      /* next */
    }
  }
  for (const hit of await searchPadelmq(row.brand, row.model)) {
    candidates.push(hit);
  }
  // Extra search variants for short model names
  const alt = `${row.brand} ${row.model}`.replace(/\//g, " ");
  if (alt !== `${row.brand} ${row.model}`) {
    for (const hit of await searchPadelmq(row.brand, alt)) candidates.push(hit);
  }

  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    if (!c.imageUrl) continue;
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
  return uniq;
}

function decideCandidate(row) {
  const notes = row.notes || "";
  const img = row.candidateImage || "";
  const score = Number(row.identityConfidence || 0);

  if (/shared-hero/i.test(notes)) {
    return {
      decision: "REJECT",
      reason: "shared-hero_collision",
    };
  }
  if (isLogoOrBanner(img) || score < 35) {
    return {
      decision: "REJECT",
      reason: score < 35 ? `low_score_${score}_logo_or_junk` : "logo_or_banner_url",
    };
  }
  // Blog / magazine / placeholder hostages
  if (
    /padelmagazine|actu-padel|tradeinn\.com\/web\/web\/inn|megapadel\.store\/cdn\/shop\/collections|noxsport\.com\/cdn\/shop\/files\/logo/i.test(
      img,
    )
  ) {
    return { decision: "REJECT", reason: "non_product_source" };
  }

  const productLike = isProductCdn(img);
  if (score >= 75 && productLike) {
    return { decision: "APPROVE", reason: `score_${score}_product_cdn` };
  }
  if (score >= 70 && /padelmq\.com/i.test(img) && /\/products\//i.test(row.candidateSource || "")) {
    return { decision: "APPROVE", reason: `score_${score}_padelmq_pdp` };
  }
  if (score >= 80 && productLike) {
    return { decision: "APPROVE", reason: `score_${score}_near_auto` };
  }
  if (score < 55) {
    return { decision: "REJECT", reason: `low_score_${score}` };
  }
  // Mid-band: attempt re-research rather than keep forever as candidate
  return { decision: "RERESEARCH", reason: `mid_score_${score}` };
}

async function verifyAndRegister(row, imageUrl, pageUrl, sourceType) {
  const buf = await downloadImage(imageUrl);
  const jpeg = await sharp(buf)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  assertUniqueHeroBytes(jpeg, { label: row.productId });

  const slug = row.productId.replace(/^prod-/, "");
  const dir = path.join(ROOT, "public/images/padel", categoryDir(row.category));
  fs.mkdirSync(dir, { recursive: true });
  const file = `${slug}-hero.jpg`;
  const abs = path.join(dir, file);
  if (!dryRun) {
    fs.writeFileSync(abs, jpeg);
    rememberHeroFile(abs);
  }
  const rel = `/images/padel/${categoryDir(row.category)}/${file}`;
  const meta = await sharp(jpeg).metadata();
  const licence = /padelmq|padelshop|zonadepadel|padelnuestro|padelmarket|decathlon/i.test(
    pageUrl || "",
  )
    ? "retailer-authorized"
    : "manufacturer-marketing";

  return {
    id: row.productId,
    src: rel,
    sourceUrl: pageUrl || imageUrl,
    source: `${sourceType || "triage"} · ${row.brand} ${row.model}`,
    licence,
    width: meta.width || 1200,
    height: meta.height || 1200,
    retrievedAt: new Date().toISOString().slice(0, 10),
    bytes: jpeg.length,
  };
}

async function main() {
  const coverage = parseCsv(COVERAGE);
  const invRows = parseCsv(INV);
  const invById = new Map();
  for (const r of invRows) {
    if (r.kitletics_product_id && !invById.has(r.kitletics_product_id)) {
      invById.set(r.kitletics_product_id, r);
    }
  }

  const decisions = [];
  const registryEntries = [];
  const candidates = coverage.filter((r) => r.status === "MEDIA_CANDIDATE");
  const missing = coverage.filter((r) => r.status === "MEDIA_MISSING");

  if (!missingOnly) {
    for (const row of candidates) {
      const d = decideCandidate(row);
      const entry = {
        productId: row.productId,
        category: row.category,
        brand: row.brand,
        model: row.model,
        priorScore: Number(row.identityConfidence || 0),
        candidateImage: row.candidateImage,
        ...d,
      };

      if (d.decision === "REJECT") {
        decisions.push(entry);
        console.log("REJECT", row.productId, d.reason);
        continue;
      }

      if (d.decision === "APPROVE") {
        try {
          if (dryRun) {
            entry.decision = "DRY_APPROVE";
            decisions.push(entry);
            console.log("DRY_APPROVE", row.productId, d.reason);
            continue;
          }
          const reg = await verifyAndRegister(
            row,
            row.candidateImage,
            row.candidateSource,
            "manual-approve",
          );
          registryEntries.push(reg);
          entry.decision = "APPROVED";
          entry.src = reg.src;
          decisions.push(entry);
          console.log("APPROVED", row.productId, reg.src);
        } catch (e) {
          entry.decision = "REJECT";
          entry.reason = `approve_failed_${String(e?.message || e).slice(0, 120)}`;
          decisions.push(entry);
          console.log("REJECT", row.productId, entry.reason);
        }
        continue;
      }

      // RERESEARCH mid-band
      if (approveOnly) {
        entry.decision = "HOLD";
        decisions.push(entry);
        console.log("HOLD", row.productId, d.reason);
        continue;
      }

      const inv = invById.get(row.productId);
      const urls = [];
      if (inv?.manufacturer_url) urls.push(inv.manufacturer_url);
      if (inv?.retailer_urls) {
        for (const u of inv.retailer_urls.split("|")) {
          const t = u.trim();
          if (t) urls.push(t);
        }
      }
      const found = await researchFromUrls(row, urls);
      const best = found.find(
        (c) =>
          !isLogoOrBanner(c.imageUrl) &&
          c.score >= 75 &&
          isProductCdn(c.imageUrl),
      );
      if (!best) {
        entry.decision = "REJECT";
        entry.reason = `reresearch_no_safe_hero_best_${found[0]?.score ?? 0}`;
        decisions.push(entry);
        console.log("REJECT", row.productId, entry.reason);
        continue;
      }
      try {
        if (dryRun) {
          entry.decision = "DRY_APPROVE_RERESEARCH";
          entry.candidateImage = best.imageUrl;
          entry.priorScore = best.score;
          decisions.push(entry);
          console.log("DRY_RERESEARCH", row.productId, best.score);
          continue;
        }
        const reg = await verifyAndRegister(
          row,
          best.imageUrl,
          best.pageUrl,
          best.sourceType,
        );
        registryEntries.push(reg);
        entry.decision = "APPROVED";
        entry.reason = `reresearch_score_${best.score}`;
        entry.src = reg.src;
        entry.candidateImage = best.imageUrl;
        decisions.push(entry);
        console.log("APPROVED", row.productId, best.score, reg.src);
      } catch (e) {
        entry.decision = "REJECT";
        entry.reason = `reresearch_failed_${String(e?.message || e).slice(0, 120)}`;
        decisions.push(entry);
        console.log("REJECT", row.productId, entry.reason);
      }
    }
  }

  if (!approveOnly) {
    for (const row of missing) {
      const inv = invById.get(row.productId);
      const urls = [];
      // Extra manufacturer deep links for known hard families
      if (/tuboplus/i.test(row.brand) || /tuboplus/i.test(row.productId)) {
        urls.push(
          "https://tubo.plus/en/padel-ball-pressurizers/",
          "https://tubo.plus/en/comparador/",
          "https://tubo.plus/",
        );
      }
      if (/varlion/i.test(row.brand)) {
        urls.push(
          "https://www.varlion.com/gb/balls/",
          "https://www.varlion.com/gb/padel/bags/padel-racket-bags/",
        );
      }
      if (inv?.manufacturer_url) urls.push(inv.manufacturer_url);
      if (inv?.retailer_urls) {
        for (const u of inv.retailer_urls.split("|")) {
          const t = u.trim();
          if (t) urls.push(t);
        }
      }
      // Prefer inventory PDP URLs from coverage notes
      const hint = (row.notes || "").match(/https?:\/\/[^\s|]+/g) || [];
      urls.push(...hint);

      const found = await researchFromUrls(row, [...new Set(urls)]);
      const best = found.find(
        (c) =>
          !isLogoOrBanner(c.imageUrl) &&
          c.score >= 72 &&
          isProductCdn(c.imageUrl),
      );
      const entry = {
        productId: row.productId,
        category: row.category,
        brand: row.brand,
        model: row.model,
        priorScore: best?.score ?? 0,
        candidateImage: best?.imageUrl || "",
        decision: "MISSING",
        reason: "no_safe_distinct_image",
      };
      if (!best) {
        if (found[0] && /shared|collision/i.test("")) {
          /* noop */
        }
        decisions.push(entry);
        console.log(
          "STILL_MISSING",
          row.productId,
          found[0]?.score ?? 0,
          (found[0]?.imageUrl || "").slice(0, 70),
        );
        continue;
      }
      try {
        if (dryRun) {
          entry.decision = "DRY_APPROVE_MISSING";
          entry.reason = `score_${best.score}`;
          decisions.push(entry);
          console.log("DRY_MISSING", row.productId, best.score);
          continue;
        }
        const reg = await verifyAndRegister(
          row,
          best.imageUrl,
          best.pageUrl,
          best.sourceType,
        );
        registryEntries.push(reg);
        entry.decision = "APPROVED";
        entry.reason = `missing_fetch_score_${best.score}`;
        entry.src = reg.src;
        decisions.push(entry);
        console.log("APPROVED_MISSING", row.productId, best.score, reg.src);
      } catch (e) {
        entry.decision = "MISSING";
        entry.reason = String(e?.message || e).slice(0, 160);
        decisions.push(entry);
        console.log("STILL_MISSING", row.productId, entry.reason);
      }
    }
  }

  if (registryEntries.length && !dryRun) {
    appendMediaRegistry(registryEntries);
  }

  const summary = {
    approved: decisions.filter((d) => d.decision === "APPROVED").length,
    rejected: decisions.filter((d) => d.decision === "REJECT").length,
    stillMissing: decisions.filter((d) => d.decision === "MISSING").length,
    hold: decisions.filter((d) => d.decision === "HOLD").length,
    dry: decisions.filter((d) => String(d.decision).startsWith("DRY")).length,
  };

  fs.mkdirSync(path.dirname(DECISIONS), { recursive: true });
  fs.writeFileSync(
    DECISIONS,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun,
        summary,
        decisions,
        registryEntries: registryEntries.map((e) => ({
          id: e.id,
          src: e.src,
          sourceUrl: e.sourceUrl,
        })),
      },
      null,
      2,
    ),
  );

  console.log("\nSummary", summary);
  console.log("Wrote", DECISIONS);
  console.log("Registry appends", registryEntries.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
