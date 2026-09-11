/**
 * Prelaunch 21 — fetch secondary gallery media for priority products.
 * Never overwrites *-hero.* primaries. Manufacturer / authorized retailer CDNs only.
 *
 * node scripts/tmp/prelaunch-21-fetch-gallery-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "../lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MIN_BYTES = 12_000;
const ASICS_ANGLES = [
  { code: "SL_LT", usage: "side" },
  { code: "SR_LT", usage: "side" },
  { code: "SB_BT", usage: "outsole" },
];

/** Known ASICS Scene7 bases (colorway) — from prior hero fetches / CDN sourceUrls. */
const ASICS_SKU_BY_PRODUCT = {
  "prod-nimbus-27": "1011B872_001",
  "prod-cumulus-27": "1011B960_100",
  "prod-novablast-5": "1011B974_001",
  "prod-novablast-4": "1011B593_001",
  "prod-superblast-2": "1013A124_001",
  "prod-gt-2000-14": "1011B863_001",
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isImageBuf(buf) {
  if (!buf || buf.length < MIN_BYTES) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true; // jpeg
  if (buf[0] === 0x89 && buf[1] === 0x50) return true; // png
  if (buf.slice(0, 4).toString() === "RIFF") return true; // webp
  return false;
}

function extFor(buf, ct = "") {
  if (buf[0] === 0x89) return "png";
  if (buf.slice(0, 4).toString() === "RIFF") return "webp";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  return "jpg";
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
    return { buf, ct: r.headers.get("content-type") || "", finalUrl: r.url };
  } catch {
    return null;
  }
}

function readJpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

function dims(buf) {
  return readJpegSize(buf) ?? { width: 1000, height: 1000 };
}

function publicPathFor(heroSrc, usage, ext) {
  // /images/running/products/nimbus-27-hero.jpg → .../nimbus-27/gallery/side.jpg
  const rel = heroSrc.replace(/^\//, "");
  const dir = path.dirname(rel);
  const base = path.basename(rel).replace(/-hero\.[^.]+$/, "");
  return path.join(dir, base, "gallery", `${usage}.${ext}`);
}

async function expandAsics(productId, skuBase, heroSrc) {
  const out = [];
  const usedUsages = new Set();
  for (const { code, usage } of ASICS_ANGLES) {
    if (usage === "side" && usedUsages.has("side")) continue;
    const candidates = [
      `https://images.asics.com/is/image/asics/${skuBase}_${code}_GLB?$sfcc-product$&wid=1200&hei=1200`,
      `https://images.asics.com/is/image/asics/${skuBase}_${code}_GLB?wid=1200&hei=1200&fmt=jpg`,
    ];
    let img = null;
    let url = candidates[0];
    for (const candidate of candidates) {
      img = await fetchBuf(candidate);
      if (img) {
        url = candidate;
        break;
      }
    }
    if (!img) continue;
    usedUsages.add(usage);
    const size = dims(img.buf);
    if (Math.min(size.width || 1000, size.height || 1000) < 400) continue;
    const rel = publicPathFor(heroSrc, usage, extFor(img.buf, img.ct));
    const abs = path.join(ROOT, "public", rel);
    ensureDir(path.dirname(abs));
    const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
    const src = `/${path.relative(path.join(ROOT, "public"), written.dest).split(path.sep).join("/")}`;
    out.push({
      productId,
      src,
      sourceUrl: url,
      source: "Manufacturer product CDN (ASICS Scene7)",
      licence: "manufacturer-marketing",
      attribution: "© Brand — official / authorized product photography",
      width: size.width,
      height: size.height,
      usageType: usage,
    });
  }
  return out;
}

async function expandNb(productId, sceneUrl, heroSrc) {
  const m = sceneUrl.match(/\/is\/image\/NB\/([^?]+)/);
  if (!m) return [];
  const id = m[1];
  const out = [];
  const usageByIndex = {
    1: "other",
    3: "side",
    4: "outsole",
    5: "rear",
    6: "detail",
    7: "top",
  };
  for (let i = 1; i <= 7; i++) {
    if (i === 2) continue; // often the hero packshot already registered
    const nextId = id.replace(/_nb_\d+_i/, `_nb_0${i}_i`);
    const url = `https://nb.scene7.com/is/image/NB/${nextId}?$pdpflexf22x$&wid=1200&hei=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const usage = usageByIndex[i] || "other";
    const size = dims(img.buf);
    const rel = publicPathFor(heroSrc, `${usage}-${i}`, extFor(img.buf, img.ct));
    const abs = path.join(ROOT, "public", rel);
    ensureDir(path.dirname(abs));
    const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
    const src = `/${path.relative(path.join(ROOT, "public"), written.dest).split(path.sep).join("/")}`;
    out.push({
      productId,
      src,
      sourceUrl: url,
      source: "Manufacturer product CDN (New Balance Scene7)",
      licence: "manufacturer-marketing",
      attribution: "© Brand — official / authorized product photography",
      width: size.width,
      height: size.height,
      usageType: usage === "other" ? "detail" : usage,
    });
  }
  return out;
}

async function expandGarmin(productId, pageUrl, heroSrc) {
  if (!pageUrl || !/garmin\.com/i.test(pageUrl)) return [];
  try {
    const r = await fetch(pageUrl, { headers: { "User-Agent": UA } });
    if (!r.ok) return [];
    const html = await r.text();
    const urls = [
      ...new Set(
        [...html.matchAll(/https:\/\/res\.garmin\.com\/[^"'\\\s]+/g)].map((m) =>
          m[0].replace(/\\u002F/g, "/"),
        ),
      ),
    ];

    const productShots = urls.filter((u) => {
      if (!/\/g\/.+\.jpe?g$/i.test(u)) return false;
      if (/FAN|VID|strength|stage|TN-|DESK-|MOBILE-|homepage/i.test(u)) {
        // Keep wrist / on-body product frames
        if (/ON-WRIST|on-wrist|worn/i.test(u)) return true;
        return false;
      }
      // Packshots + alternate angles (cf is usually hero — skip)
      if (/\/g\/cf-lg\.jpg$/i.test(u)) return false;
      if (/\/g\/(rf|lf|bk|tp)-lg\.jpg$/i.test(u)) return true;
      if (/\/g\/pd-\d+-lg\.jpg$/i.test(u)) return true;
      if (/\/g\/\d+-\d+\.jpg$/i.test(u)) return true;
      if (/\/g\/[A-Za-z0-9]+-\d+\.jpg$/i.test(u)) return true;
      if (/ON-WRIST|on-wrist/i.test(u)) return true;
      return false;
    });

    const out = [];
    const usageFor = (url) => {
      if (/ON-WRIST|on-wrist|worn/i.test(url)) return "on-foot";
      if (/\/g\/rf-lg/i.test(url)) return "side";
      if (/\/g\/lf-lg/i.test(url)) return "side";
      if (/\/g\/bk-lg/i.test(url)) return "rear";
      if (/\/g\/tp-lg/i.test(url)) return "top";
      if (/\/g\/pd-/i.test(url)) return "detail";
      return "detail";
    };

    let n = 0;
    for (const url of productShots.slice(0, 8)) {
      const img = await fetchBuf(url);
      if (!img) continue;
      const usage = usageFor(url);
      n += 1;
      const size = dims(img.buf);
      if ((size.width || 1000) < 300) continue;
      const rel = publicPathFor(
        heroSrc,
        `${usage}-${n}`,
        extFor(img.buf, img.ct),
      );
      const abs = path.join(ROOT, "public", rel);
      ensureDir(path.dirname(abs));
      const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
      const src = `/${path.relative(path.join(ROOT, "public"), written.dest).split(path.sep).join("/")}`;
      out.push({
        productId,
        src,
        sourceUrl: url,
        source: "Manufacturer official product catalog (Garmin)",
        licence: "manufacturer-marketing",
        attribution: "© Brand — official / authorized product photography",
        width: size.width,
        height: size.height,
        usageType: usage,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function expandFromAsicsSourceUrl(productId, sourceUrl, heroSrc) {
  const m = sourceUrl.match(
    /images\.asics\.com\/is\/image\/asics\/([A-Z0-9]+_[A-Z0-9]+)_[A-Z]+_[A-Z]+_GLB/i,
  );
  if (!m) return [];
  return expandAsics(productId, m[1], heroSrc);
}

async function expandManufacturerPage(productId, pageUrl, heroSrc) {
  try {
    const r = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    });
    if (!r.ok) return [];
    const html = await r.text();
    const urls = new Set();
    for (const m of html.matchAll(
      /https?:\/\/cdn\.shopify\.com\/[^"'\\\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s]*)?/gi,
    )) {
      urls.add(m[0].replace(/\\u0026/g, "&").split("&width=")[0]);
    }
    for (const m of html.matchAll(
      /https?:\/\/[^"'\\\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s]*)?/gi,
    )) {
      const u = m[0];
      if (/logo|favicon|icon|sprite|badge|pixel|1x1|social|og-default/i.test(u))
        continue;
      if (
        /(cdn\.shopify|images\.ctfassets|cloudinary|imgix|osprey\.com\/.*\/images|nathansports|hydrapak|polar\.cdn|coros)/i.test(
          u,
        )
      ) {
        urls.add(u);
      }
    }
    // Shopify product JSON embedded images
    for (const m of html.matchAll(
      /"src":"(https:\\\/\\\/cdn\.shopify\.com\\\/[^"]+)"/g,
    )) {
      urls.add(m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/"));
    }

    const list = [...urls].slice(0, 12);
    const out = [];
    const usageCycle = ["side", "detail", "rear", "top", "lifestyle", "on-foot"];
    let n = 0;
    for (const url of list) {
      const img = await fetchBuf(url);
      if (!img) continue;
      // Skip near-duplicates of tiny thumbs
      if (img.buf.length < 20_000) continue;
      const usage = usageCycle[n % usageCycle.length];
      n += 1;
      const size = dims(img.buf);
      const rel = publicPathFor(
        heroSrc,
        `${usage}-${n}`,
        extFor(img.buf, img.ct),
      );
      const abs = path.join(ROOT, "public", rel);
      ensureDir(path.dirname(abs));
      const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
      const src = `/${path.relative(path.join(ROOT, "public"), written.dest).split(path.sep).join("/")}`;
      out.push({
        productId,
        src,
        sourceUrl: url,
        source: "Manufacturer / authorized retailer product photography",
        licence: "manufacturer-marketing",
        attribution: "© Brand — official / authorized product photography",
        width: size.width,
        height: size.height,
        usageType: usage,
      });
      if (out.length >= 4) break;
    }
    return out;
  } catch {
    return [];
  }
}

function loadPriority() {
  const p = path.join(ROOT, "data/staging/21-priority-products.json");
  if (!fs.existsSync(p)) {
    console.error("Missing priority list — generate first");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadWatchBatchRemote() {
  const map = {};
  for (const file of [
    "watch-media-batch.json",
    "hrm-media-batch.json",
    "running-media-batch.json",
  ]) {
    const p = path.join(ROOT, "data/staging", file);
    if (!fs.existsSync(p)) continue;
    const rows = JSON.parse(fs.readFileSync(p, "utf8"));
    for (const r of rows) {
      if (r.ok && (r.sourceUrl || r.remoteUrl)) map[r.id] = r;
    }
  }
  return map;
}

function writeRegistry(entriesByProduct) {
  const lines = [
    `import type { MediaAsset } from "@/domain/shared/types";`,
    ``,
    `/**`,
    ` * Secondary PDP gallery media (non-hero). Primaries stay in`,
    ` * \`running/product-media.ts\` / \`catalog-product-media.ts\` and must not be replaced.`,
    ` */`,
    `export interface ProductGalleryMediaSource {`,
    `  productId: string;`,
    `  src: string;`,
    `  sourceUrl: string;`,
    `  source: string;`,
    `  licence: "manufacturer-marketing" | "retailer-authorized";`,
    `  attribution: string;`,
    `  width: number;`,
    `  height: number;`,
    `  usageType:`,
    `    | "side"`,
    `    | "top"`,
    `    | "rear"`,
    `    | "outsole"`,
    `    | "detail"`,
    `    | "on-foot"`,
    `    | "lifestyle"`,
    `    | "other";`,
    `  alt?: string;`,
    `}`,
    ``,
    `export const PRODUCT_GALLERY_MEDIA: Record<string, ProductGalleryMediaSource[]> = {`,
  ];

  const ids = Object.keys(entriesByProduct).sort();
  for (const id of ids) {
    const entries = entriesByProduct[id];
    lines.push(`  ${JSON.stringify(id)}: [`);
    for (const e of entries) {
      lines.push(`    {`);
      lines.push(`      productId: ${JSON.stringify(e.productId)},`);
      lines.push(`      src: ${JSON.stringify(e.src)},`);
      lines.push(`      sourceUrl: ${JSON.stringify(e.sourceUrl)},`);
      lines.push(`      source: ${JSON.stringify(e.source)},`);
      lines.push(`      licence: ${JSON.stringify(e.licence)},`);
      lines.push(`      attribution: ${JSON.stringify(e.attribution)},`);
      lines.push(`      width: ${e.width},`);
      lines.push(`      height: ${e.height},`);
      lines.push(`      usageType: ${JSON.stringify(e.usageType)},`);
      lines.push(`    },`);
    }
    lines.push(`  ],`);
  }
  lines.push(`};`);
  lines.push(``);
  lines.push(`export function getProductGalleryMedia(`);
  lines.push(`  productId: string,`);
  lines.push(`  productName: string,`);
  lines.push(`): MediaAsset[] {`);
  lines.push(`  const entries = PRODUCT_GALLERY_MEDIA[productId];`);
  lines.push(`  if (!entries?.length) return [];`);
  lines.push(`  return entries.map((entry, index) => ({`);
  lines.push(`    id: \`media-\${productId}-gallery-\${entry.usageType}-\${index}\`,`);
  lines.push(`    src: entry.src,`);
  lines.push(
    `    alt: entry.alt ?? \`\${productName} — \${entry.usageType.replace("-", " ")} view\`,`,
  );
  lines.push(`    width: entry.width,`);
  lines.push(`    height: entry.height,`);
  lines.push(`    type: "image" as const,`);
  lines.push(`    source: entry.source,`);
  lines.push(`    sourceUrl: entry.sourceUrl,`);
  lines.push(`    licence: entry.licence,`);
  lines.push(`    attribution: entry.attribution,`);
  lines.push(`    usageType: entry.usageType,`);
  lines.push(`  }));`);
  lines.push(`}`);
  lines.push(``);

  fs.writeFileSync(
    path.join(ROOT, "src/content/product-gallery-media.ts"),
    lines.join("\n"),
  );
}

async function main() {
  const priority = loadPriority();
  const mediaBatch = loadWatchBatchRemote();
  const byProduct = {};
  const report = [];

  for (const row of priority) {
    const heroSrc = row.heroSrc;
    if (!heroSrc || !heroSrc.includes("-hero.")) {
      report.push({ id: row.id, slug: row.slug, ok: false, reason: "no-hero" });
      continue;
    }
    process.stdout.write(`… ${row.slug} `);
    let extras = [];

    const asicsSku = ASICS_SKU_BY_PRODUCT[row.id];
    if (asicsSku) {
      extras = extras.concat(await expandAsics(row.id, asicsSku, heroSrc));
    } else if (/images\.asics\.com\/is\/image/i.test(row.sourceUrl || "")) {
      extras = extras.concat(
        await expandFromAsicsSourceUrl(row.id, row.sourceUrl, heroSrc),
      );
    }

    if (/nb\.scene7\.com/i.test(row.sourceUrl || "")) {
      extras = extras.concat(
        await expandNb(row.id, row.sourceUrl, heroSrc),
      );
    }

    const batch = mediaBatch[row.id];
    let garminPage =
      row.sourceUrl && /garmin\.com\/en-US\/p\//i.test(row.sourceUrl)
        ? row.sourceUrl
        : batch?.sourceUrl && /garmin\.com\/en-US\/p\//i.test(batch.sourceUrl)
          ? batch.sourceUrl
          : null;
    // Derive PDP from res.garmin.com product id when page URL missing
    if (!garminPage && batch?.remoteUrl) {
      const m = batch.remoteUrl.match(
        /res\.garmin\.com\/en\/products\/(\d{3}-\d{5}-\d{2})\//,
      );
      if (m) {
        garminPage = `https://www.garmin.com/en-US/p/pn/${m[1]}/`;
        // Prefer batch sourceUrl when it is a real product path
      }
    }
    if (!garminPage && batch?.sourceUrl && /garmin\.com/i.test(batch.sourceUrl)) {
      garminPage = batch.sourceUrl;
    }
    if (garminPage && /garmin\.com/i.test(garminPage)) {
      extras = extras.concat(await expandGarmin(row.id, garminPage, heroSrc));
    }

    // Manufacturer page galleries (packs / Polar / Coros) — Shopify-style JSON images
    if (
      extras.length < 2 &&
      row.sourceUrl &&
      /(ultimatedirection|osprey|nathansports|hydrapak|polar\.com|coros\.com|scosche|wahoofitness|suunto\.com|camelbak\.com|on\.com|blackdiamondequipment|bergfreunde|procamper)/i.test(
        row.sourceUrl,
      )
    ) {
      extras = extras.concat(
        await expandManufacturerPage(row.id, row.sourceUrl, heroSrc),
      );
    }

    // Dedup by src
    const seen = new Set();
    extras = extras.filter((e) => {
      if (seen.has(e.src)) return false;
      seen.add(e.src);
      return true;
    });

    if (extras.length) {
      byProduct[row.id] = extras;
      console.log(`OK +${extras.length}`);
      report.push({
        id: row.id,
        slug: row.slug,
        ok: true,
        count: extras.length,
        usages: extras.map((e) => e.usageType),
      });
    } else {
      console.log("skip");
      report.push({
        id: row.id,
        slug: row.slug,
        ok: false,
        reason: "no-cdn-angles",
      });
    }
  }

  writeRegistry(byProduct);
  ensureDir(path.join(ROOT, "data/staging"));
  fs.writeFileSync(
    path.join(ROOT, "data/staging/21-gallery-fetch-report.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        productsWithGallery: Object.keys(byProduct).length,
        totalExtras: Object.values(byProduct).reduce(
          (s, a) => s + a.length,
          0,
        ),
        report,
      },
      null,
      2,
    ),
  );
  console.log(
    `\nGallery products: ${Object.keys(byProduct).length}; extras: ${Object.values(byProduct).reduce((s, a) => s + a.length, 0)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
