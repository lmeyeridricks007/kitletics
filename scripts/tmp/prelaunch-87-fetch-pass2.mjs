/**
 * Fix 87 pass 2 — remaining P1 with updated Garmin/NB/RW patterns.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { writeWebMaster } from "../lib/media-ingest.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OUT = path.join(ROOT, "docs/prelaunch/data/rc-87");
const MAX = 4;
const MIN = 14000;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isImageBuf(buf) {
  if (!buf || buf.length < MIN) return false;
  return (
    (buf[0] === 0xff && buf[1] === 0xd8) ||
    buf[0] === 0x89 ||
    buf.slice(0, 4).toString() === "RIFF"
  );
}

async function fetchBuf(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (!isImageBuf(buf)) return null;
    return { buf, ct: r.headers.get("content-type") || "" };
  } catch {
    return null;
  }
}

async function dims(buf) {
  try {
    const m = await sharp(buf).metadata();
    return { width: m.width || 1000, height: m.height || 1000 };
  } catch {
    return { width: 1000, height: 1000 };
  }
}

function publicPathFor(heroSrc, usage) {
  const rel = heroSrc.replace(/^\//, "");
  const dir = path.dirname(rel);
  const base = path.basename(rel).replace(/-hero\.[^.]+$/, "");
  return path.join(dir, base, "gallery", `${usage}.jpg`);
}

async function writeEntry2(productId, heroSrc, usageType, tag, img, sourceUrl, source, licence) {
  const size = await dims(img.buf);
  if (Math.min(size.width, size.height) < 300) return null;
  const abs = path.join(ROOT, "public", publicPathFor(heroSrc, `${usageType}-${tag}`));
  ensureDir(path.dirname(abs));
  const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
  const src = `/${path.relative(path.join(ROOT, "public"), written.dest).split(path.sep).join("/")}`;
  return {
    productId,
    src,
    sourceUrl,
    source,
    licence: licence || "manufacturer-marketing",
    attribution: "© Brand — official / authorized product photography",
    width: written.width || size.width,
    height: written.height || size.height,
    usageType,
  };
}

async function expandGarminModern(productId, pageUrl, heroSrc) {
  const r = await fetch(pageUrl, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const html = await r.text();
  const urls = [
    ...new Set(
      [...html.matchAll(/https:\/\/res\.garmin\.com\/[^"'\\\s]+\.jpe?g/gi)].map(
        (m) => m[0],
      ),
    ),
  ].filter((u) => {
    if (/VID|FAN|DESK|MOBILE|homepage|strength|stage/i.test(u)) return false;
    if (/\/g\/cf-lg\.jpg$/i.test(u)) return false; // often hero
    // Modern pack: 74281-D-2.jpg etc — skip -1 (often hero duplicate), take D (desktop)
    if (/\/g\/\d+-D-\d+\.jpg$/i.test(u)) return true;
    if (/\/g\/\d+-\d+-D\.jpg$/i.test(u)) return true;
    if (/\/g\/(rf|lf|bk|tp)-lg\.jpg$/i.test(u)) return true;
    if (/\/g\/pd-\d+-lg\.jpg$/i.test(u)) return true;
    if (/ON-WRIST|on-wrist/i.test(u)) return true;
    return false;
  });

  // Prefer higher index D shots, skip first frame when numbered
  const ranked = urls.sort((a, b) => {
    const na = Number((a.match(/-D-(\d+)/i) || a.match(/-(\d+)-D/i) || [])[1] || 99);
    const nb = Number((b.match(/-D-(\d+)/i) || b.match(/-(\d+)-D/i) || [])[1] || 99);
    return na - nb;
  });

  const out = [];
  const usages = ["side", "detail", "rear", "top", "on-foot"];
  let i = 0;
  for (const url of ranked) {
    const num = Number((url.match(/-D-(\d+)/i) || url.match(/-(\d+)-D/i) || [])[1] || 0);
    if (num === 1) continue; // likely primary packshot
    const img = await fetchBuf(url);
    if (!img) continue;
    const usage = /ON-WRIST|on-wrist/i.test(url)
      ? "on-foot"
      : usages[i % usages.length];
    const entry = await writeEntry2(
      productId,
      heroSrc,
      usage,
      String(i + 1),
      img,
      url,
      "Manufacturer official product catalog (Garmin)",
    );
    if (!entry) continue;
    i += 1;
    out.push(entry);
    if (out.length >= MAX) break;
  }
  return out;
}

async function expandNb(productId, baseId, heroSrc) {
  const usageByIndex = { 3: "side", 4: "outsole", 5: "rear", 6: "detail", 7: "top" };
  const out = [];
  for (const i of [3, 4, 5, 6, 7]) {
    const url = `https://nb.scene7.com/is/image/NB/${baseId.replace(/_nb_\d+_i/i, `_nb_0${i}_i`)}?$pdpflexf22x$&wid=1200&hei=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry2(
      productId,
      heroSrc,
      usageByIndex[i],
      String(i),
      img,
      url,
      "Manufacturer product CDN (New Balance Scene7)",
    );
    if (!entry) continue;
    out.push(entry);
    if (out.length >= MAX) break;
  }
  return out;
}

async function expandRwWatermark(productId, pathStem, heroSrc) {
  // N3SCTM5-1.jpg → 2..5
  const out = [];
  const usages = ["side", "detail", "rear", "outsole", "top"];
  let ui = 0;
  for (let i = 2; i <= 6; i++) {
    const url = `https://img.runningwarehouse.com/watermark/rs.php?path=${pathStem}-${i}.jpg&nw=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry2(
      productId,
      heroSrc,
      usages[ui++],
      String(i),
      img,
      url,
      "Authorized retailer product photography (Running Warehouse)",
      "retailer-authorized",
    );
    if (!entry) continue;
    out.push(entry);
    if (out.length >= MAX) break;
  }
  return out;
}

async function expandAsics(productId, sku, heroSrc) {
  const out = [];
  const angles = [
    ["SL_LT", "side"],
    ["SB_BT", "outsole"],
    ["SR_RT", "side"],
  ];
  const used = new Set();
  for (const [code, usage] of angles) {
    if (used.has(usage)) continue;
    const url = `https://images.asics.com/is/image/asics/${sku}_${code}_GLB?$sfcc-product$&wid=1200&hei=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry2(
      productId,
      heroSrc,
      usage,
      code,
      img,
      url,
      "Manufacturer product CDN (ASICS Scene7)",
    );
    if (!entry) continue;
    used.add(usage);
    out.push(entry);
    if (out.length >= MAX) break;
  }
  return out;
}

const TARGETS = [
  {
    productId: "prod-forerunner-970",
    slug: "garmin-forerunner-970",
    heroSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
    kind: "garmin",
    page: "https://www.garmin.com/en-US/p/1462801/pn/010-02969-00/",
  },
  {
    productId: "prod-enduro-3",
    slug: "garmin-enduro-3",
    heroSrc: "/images/watches/products/garmin-enduro-3-hero.jpg",
    kind: "garmin",
    page: "https://www.garmin.com/en-US/p/851039/pn/010-02751-00/",
  },
  {
    productId: "prod-hrm-600",
    slug: "garmin-hrm-600",
    heroSrc: "/images/hrm/products/garmin-hrm-600-hero.jpg",
    kind: "garmin",
    page: "https://www.garmin.com/en-US/p/1469990/",
  },
  {
    productId: "prod-1080-v14",
    slug: "new-balance-fresh-foam-x-1080-v14",
    heroSrc: "/images/running/products/1080-v14-hero.jpg",
    kind: "nb",
    baseId: "m1080b14_nb_02_i",
  },
  {
    productId: "prod-sc-trainer-v3",
    slug: "new-balance-fuelcell-supercomp-trainer-v3",
    heroSrc: "/images/running/products/sc-trainer-v3-hero.jpg",
    kind: "rw",
    stem: "N3SCTM5",
  },
  {
    productId: "prod-superblast-2",
    slug: "asics-superblast-2",
    heroSrc: "/images/running/products/superblast-2-hero.jpg",
    kind: "asics",
    sku: "1013A124_001",
  },
];

// Fix hero paths from p1 json where possible
const p1 = JSON.parse(fs.readFileSync(path.join(OUT, "p1-top-50.json"), "utf8"));
const byId = Object.fromEntries(p1.map((r) => [r.productId, r]));
for (const t of TARGETS) {
  if (byId[t.productId]?.heroSrc) t.heroSrc = byId[t.productId].heroSrc;
}

// Load merged state from the TS file by requiring a JSON we write in shell before this script
const merged = JSON.parse(
  fs.readFileSync(path.join(OUT, "gallery-merged-before-pass2.json"), "utf8"),
);

const report = { deepened: [], failed: [] };

for (const t of TARGETS) {
  if ((merged[t.productId]?.length || 0) >= 2) {
    console.log("skip already", t.slug);
    continue;
  }
  let found = [];
  try {
    if (t.kind === "garmin") found = await expandGarminModern(t.productId, t.page, t.heroSrc);
    if (t.kind === "nb") found = await expandNb(t.productId, t.baseId, t.heroSrc);
    if (t.kind === "rw") found = await expandRwWatermark(t.productId, t.stem, t.heroSrc);
    if (t.kind === "asics") found = await expandAsics(t.productId, t.sku, t.heroSrc);
  } catch (e) {
    report.failed.push({ slug: t.slug, error: String(e) });
    continue;
  }
  // dedupe usage
  const seen = new Set();
  const uniq = [];
  for (const e of found) {
    if (seen.has(e.usageType) && e.usageType !== "detail") continue;
    seen.add(e.usageType);
    uniq.push(e);
    if (uniq.length >= MAX) break;
  }
  if (!uniq.length) {
    report.failed.push({ slug: t.slug, reason: "empty" });
    console.log("empty", t.slug);
    continue;
  }
  merged[t.productId] = uniq;
  report.deepened.push({
    slug: t.slug,
    galleryAfter: uniq.length,
    usages: uniq.map((e) => e.usageType),
    provenance: uniq.map((e) => ({
      usageType: e.usageType,
      sourceUrl: e.sourceUrl,
      licence: e.licence,
      source: e.source,
    })),
  });
  console.log("deepened", t.slug, uniq.length, uniq.map((e) => e.usageType).join(","));
}

fs.writeFileSync(path.join(OUT, "gallery-fetch-pass2.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, "gallery-merged-after-pass2.json"), JSON.stringify(merged, null, 2));
console.log(JSON.stringify({ deepened: report.deepened.length, failed: report.failed.length }, null, 2));
