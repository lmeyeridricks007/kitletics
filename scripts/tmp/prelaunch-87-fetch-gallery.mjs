/**
 * Fix 87 — deepen PDP galleries for P1 Running products.
 * Manufacturer / authorized-retailer CDNs only. Never overwrite *-hero.*.
 * Quality over count: max 4 distinct useful views per product.
 *
 * node scripts/tmp/prelaunch-87-fetch-gallery.mjs
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
const MIN_BYTES = 14_000;
const MAX_VIEWS = 4;
const OUT_DIR = path.join(ROOT, "docs/prelaunch/data/rc-87");

/** Curated authentic CDN bases — never invent; only expand known manufacturer codes. */
const ASICS_SKU = {
  "prod-novablast-6": "1011C243_001",
  "prod-kayano-32": "1011C052_001",
  "prod-nimbus-27": "1011B872_001",
  "prod-novablast-5": "1011B974_001",
  "prod-superblast-2": "1013A124_001",
  "prod-cumulus-27": "1011B960_100",
  "prod-gt-2000-14": "1011B863_001",
};

const ASICS_ANGLES = [
  { code: "SL_LT", usage: "side" },
  { code: "SB_BT", usage: "outsole" },
  { code: "SR_RT", usage: "side" }, // fallback if SL missing
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isImageBuf(buf) {
  if (!buf || buf.length < MIN_BYTES) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.slice(0, 4).toString() === "RIFF") return true;
  return false;
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

async function dims(buf) {
  try {
    const m = await sharp(buf).metadata();
    return { width: m.width || 1000, height: m.height || 1000 };
  } catch {
    return { width: 1000, height: 1000 };
  }
}

function publicPathFor(heroSrc, usage, ext) {
  const rel = heroSrc.replace(/^\//, "");
  const dir = path.dirname(rel);
  const base = path.basename(rel).replace(/-hero\.[^.]+$/, "");
  return path.join(dir, base, "gallery", `${usage}.${ext}`);
}

function extFor(buf, ct = "") {
  if (buf[0] === 0x89) return "png";
  if (buf.slice(0, 4).toString() === "RIFF") return "webp";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  return "jpg";
}

async function writeEntry(productId, heroSrc, usage, img, sourceUrl, source) {
  const size = await dims(img.buf);
  if (Math.min(size.width, size.height) < 350) return null;
  const rel = publicPathFor(heroSrc, usage, extFor(img.buf, img.ct));
  const abs = path.join(ROOT, "public", rel);
  ensureDir(path.dirname(abs));
  const written = await writeWebMaster(img.buf, abs, { role: "gallery" });
  const src = `/${path
    .relative(path.join(ROOT, "public"), written.dest)
    .split(path.sep)
    .join("/")}`;
  return {
    productId,
    src,
    sourceUrl,
    source,
    licence: "manufacturer-marketing",
    attribution: "© Brand — official / authorized product photography",
    width: written.width || size.width,
    height: written.height || size.height,
    usageType: usage,
  };
}

async function expandAsics(productId, skuBase, heroSrc) {
  const out = [];
  const used = new Set();
  for (const { code, usage } of ASICS_ANGLES) {
    if (used.has(usage)) continue;
    const url = `https://images.asics.com/is/image/asics/${skuBase}_${code}_GLB?$sfcc-product$&wid=1200&hei=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry(
      productId,
      heroSrc,
      usage === "side" && used.has("side") ? "detail" : usage,
      img,
      url,
      "Manufacturer product CDN (ASICS Scene7)",
    );
    if (!entry) continue;
    used.add(entry.usageType);
    out.push(entry);
    if (out.length >= MAX_VIEWS) break;
  }
  return out;
}

async function expandNbFromHeroUrl(productId, sceneUrl, heroSrc) {
  const m = sceneUrl.match(/\/is\/image\/NB\/([^?]+)/i);
  if (!m) return [];
  const id = m[1];
  const usageByIndex = {
    3: "side",
    4: "outsole",
    5: "rear",
    6: "detail",
    7: "top",
  };
  const out = [];
  for (const i of [3, 4, 5, 6, 7]) {
    const nextId = id.replace(/_nb_\d+_i/i, `_nb_0${i}_i`);
    const url = `https://nb.scene7.com/is/image/NB/${nextId}?$pdpflexf22x$&wid=1200&hei=1200`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry(
      productId,
      heroSrc,
      usageByIndex[i],
      img,
      url,
      "Manufacturer product CDN (New Balance Scene7)",
    );
    if (!entry) continue;
    out.push(entry);
    if (out.length >= MAX_VIEWS) break;
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
    ].filter((u) => {
      if (!/\/g\/.+\.jpe?g$/i.test(u)) return false;
      if (/\/g\/cf-lg\.jpg$/i.test(u)) return false;
      if (/\/g\/(rf|lf|bk|tp)-lg\.jpg$/i.test(u)) return true;
      if (/\/g\/pd-\d+-lg\.jpg$/i.test(u)) return true;
      if (/ON-WRIST|on-wrist/i.test(u)) return true;
      return false;
    });

    const usageFor = (url) => {
      if (/ON-WRIST|on-wrist/i.test(url)) return "on-foot";
      if (/\/g\/rf-lg|\/g\/lf-lg/i.test(url)) return "side";
      if (/\/g\/bk-lg/i.test(url)) return "rear";
      if (/\/g\/tp-lg/i.test(url)) return "top";
      return "detail";
    };

    const out = [];
    const used = new Set();
    let n = 0;
    for (const url of urls) {
      const usage = usageFor(url);
      if (used.has(usage) && usage !== "detail") continue;
      const img = await fetchBuf(url);
      if (!img) continue;
      n += 1;
      const entry = await writeEntry(
        productId,
        heroSrc,
        `${usage}-${n}`,
        img,
        url,
        "Manufacturer official product catalog (Garmin)",
      );
      if (!entry) continue;
      entry.usageType = usage;
      used.add(usage);
      out.push(entry);
      if (out.length >= MAX_VIEWS) break;
    }
    return out;
  } catch {
    return [];
  }
}

async function expandBigCommerceFamily(productId, imageUrl, heroSrc) {
  // SportsShoes / RW-style stencil: .../products/ID/IMG/NAME_1__xxx.jpg → try _2 _3 _4
  const m = imageUrl.match(/^(https:\/\/cdn11\.bigcommerce\.com\/[^?]+\D)(\d+)(__[^?]+\.(?:jpe?g|png|webp))/i);
  if (!m) return [];
  const out = [];
  const usages = ["side", "detail", "rear", "outsole", "top"];
  let ui = 0;
  for (let i = 2; i <= 6; i++) {
    const url = `${m[1]}${i}${m[3]}`;
    const img = await fetchBuf(url);
    if (!img) continue;
    const entry = await writeEntry(
      productId,
      heroSrc,
      usages[ui++ % usages.length],
      img,
      url,
      "Authorized retailer product photography (BigCommerce CDN)",
    );
    if (!entry) continue;
    entry.licence = "retailer-authorized";
    out.push(entry);
    if (out.length >= MAX_VIEWS) break;
  }
  return out;
}

async function expandRunningWarehouse(productId, pageUrl, heroSrc) {
  if (!pageUrl || !/runningwarehouse\.com/i.test(pageUrl)) return [];
  try {
    const r = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    if (!r.ok) return [];
    const html = await r.text();
    const urls = [
      ...new Set(
        [
          ...html.matchAll(
            /https?:\/\/img\.runningwarehouse\.com\/[^"'\\\s]+\.(?:jpg|jpeg|png)/gi,
          ),
          ...html.matchAll(
            /https?:\/\/[^"'\\\s]*runningwarehouse[^"'\\\s]*\/(?:watermark\/rs\.php\?path=)[^"'\\\s]+/gi,
          ),
        ].map((m) => m[0].replace(/&amp;/g, "&")),
      ),
    ].filter((u) => !/logo|icon|sprite|badge/i.test(u));

    const out = [];
    const usages = ["side", "detail", "rear", "top"];
    let n = 0;
    for (const url of urls.slice(0, 10)) {
      const img = await fetchBuf(url);
      if (!img || img.buf.length < 20_000) continue;
      const entry = await writeEntry(
        productId,
        heroSrc,
        usages[n % usages.length],
        img,
        url,
        "Authorized retailer product photography (Running Warehouse)",
      );
      if (!entry) continue;
      entry.licence = "retailer-authorized";
      n += 1;
      out.push(entry);
      if (out.length >= MAX_VIEWS) break;
    }
    return out;
  } catch {
    return [];
  }
}

async function expandManufacturerPage(productId, pageUrl, heroSrc, hostAllow) {
  if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) return [];
  if (/asics\.com\/?$/i.test(pageUrl) || /runrepeat\.com\/?$/i.test(pageUrl)) {
    return []; // homepage placeholders — not product pages
  }
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
      urls.add(m[0].split("&width=")[0]);
    }
    for (const m of html.matchAll(
      /https?:\/\/[^"'\\\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s]*)?/gi,
    )) {
      const u = m[0];
      if (/logo|favicon|icon|sprite|badge|pixel|1x1|social/i.test(u)) continue;
      if (hostAllow && !hostAllow.test(u)) continue;
      urls.add(u);
    }
    const out = [];
    const usages = ["side", "detail", "rear", "top"];
    let n = 0;
    for (const url of [...urls].slice(0, 14)) {
      const img = await fetchBuf(url);
      if (!img || img.buf.length < 22_000) continue;
      const entry = await writeEntry(
        productId,
        heroSrc,
        usages[n % usages.length],
        img,
        url,
        "Manufacturer / authorized retailer product photography",
      );
      if (!entry) continue;
      n += 1;
      out.push(entry);
      if (out.length >= MAX_VIEWS) break;
    }
    return out;
  } catch {
    return [];
  }
}

function dedupeByUsage(entries) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    const key = e.usageType;
    if (seen.has(key) && key !== "detail") continue;
    seen.add(key);
    out.push(e);
    if (out.length >= MAX_VIEWS) break;
  }
  return out;
}

function writeRegistry(entriesByProduct) {
  const lines = [
    `import type { MediaAsset } from "@/domain/shared/types";`,
    ``,
    `/**`,
    ` * Secondary PDP gallery media (non-hero). Primaries stay in`,
    ` * \`running/product-media.ts\` / \`catalog-product-media.ts\` and must not be replaced.`,
    ` * Fix 21 + Fix 87 depth passes.`,
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
    if (!entries?.length) continue;
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
  lines.push(
    `    id: \`media-\${productId}-gallery-\${entry.usageType}-\${index}\`,`,
  );
  lines.push(`    src: entry.src,`);
  lines.push(`    alt: entry.alt ?? \`\${productName} — \${entry.usageType} view\`,`);
  lines.push(`    width: entry.width,`);
  lines.push(`    height: entry.height,`);
  lines.push(`    licence: entry.licence,`);
  lines.push(`    attribution: entry.attribution,`);
  lines.push(`    sourceUrl: entry.sourceUrl,`);
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
  ensureDir(OUT_DIR);
  const p1 = JSON.parse(
    fs.readFileSync(path.join(OUT_DIR, "p1-top-50.json"), "utf8"),
  );
  const existingPath = path.join(OUT_DIR, "existing-gallery.json");
  if (!fs.existsSync(existingPath)) {
    console.error("Run dump of existing gallery first");
    process.exit(1);
  }
  const existing = JSON.parse(fs.readFileSync(existingPath, "utf8"));
  const merged = { ...existing };

  const report = {
    deepened: [],
    alreadyHad: [],
    couldNotSource: [],
    errors: [],
  };

  for (const row of p1) {
    const before = merged[row.productId]?.length ?? 0;
    if (before >= 2) {
      report.alreadyHad.push({
        productId: row.productId,
        slug: row.slug,
        galleryBefore: before,
        galleryAfter: before,
      });
      continue;
    }

    const heroSrc = row.heroSrc;
    if (!heroSrc) {
      report.couldNotSource.push({
        productId: row.productId,
        slug: row.slug,
        reason: "no_hero_src",
      });
      continue;
    }

    let found = [];
    try {
      if (ASICS_SKU[row.productId]) {
        found = await expandAsics(
          row.productId,
          ASICS_SKU[row.productId],
          heroSrc,
        );
      }
      if (
        found.length < 2 &&
        row.heroSourceUrl &&
        /nb\.scene7\.com/i.test(row.heroSourceUrl)
      ) {
        found = found.concat(
          await expandNbFromHeroUrl(
            row.productId,
            row.heroSourceUrl,
            heroSrc,
          ),
        );
      }
      if (
        found.length < 2 &&
        row.heroSourceUrl &&
        /garmin\.com/i.test(row.heroSourceUrl)
      ) {
        found = found.concat(
          await expandGarmin(row.productId, row.heroSourceUrl, heroSrc),
        );
      }
      if (
        found.length < 2 &&
        row.heroSourceUrl &&
        /bigcommerce\.com/i.test(row.heroSourceUrl)
      ) {
        found = found.concat(
          await expandBigCommerceFamily(
            row.productId,
            row.heroSourceUrl,
            heroSrc,
          ),
        );
      }
      if (
        found.length < 2 &&
        row.heroSourceUrl &&
        /runningwarehouse\.com/i.test(row.heroSourceUrl)
      ) {
        found = found.concat(
          await expandRunningWarehouse(
            row.productId,
            row.heroSourceUrl,
            heroSrc,
          ),
        );
      }
      if (
        found.length < 2 &&
        row.heroSourceUrl &&
        /(polar\.com|wahoofitness|coros\.com|suunto\.com|hydrapak|ultimatedirection|janji\.com|osprey\.com|bergfreunde)/i.test(
          row.heroSourceUrl,
        )
      ) {
        found = found.concat(
          await expandManufacturerPage(
            row.productId,
            row.heroSourceUrl,
            heroSrc,
            /(cdn\.shopify|polar|wahoo|coros|suunto|hydrapak|ultimatedirection|janji|osprey|bergfreunde|bfgcdn|cloudinary)/i,
          ),
        );
      }
    } catch (e) {
      report.errors.push({ slug: row.slug, error: String(e) });
    }

    found = dedupeByUsage(found);
    if (found.length === 0) {
      report.couldNotSource.push({
        productId: row.productId,
        slug: row.slug,
        brand: row.brand,
        categorySlug: row.categorySlug,
        reason: "no_safe_authentic_cdn_angles",
        heroSourceUrl: row.heroSourceUrl,
      });
      continue;
    }

    const prev = merged[row.productId] ?? [];
    const bySrc = new Map(prev.map((e) => [e.src, e]));
    for (const e of found) bySrc.set(e.src, e);
    merged[row.productId] = [...bySrc.values()].slice(0, MAX_VIEWS);
    report.deepened.push({
      productId: row.productId,
      slug: row.slug,
      galleryBefore: before,
      galleryAfter: merged[row.productId].length,
      usages: merged[row.productId].map((e) => e.usageType),
      provenance: merged[row.productId].map((e) => ({
        usageType: e.usageType,
        sourceUrl: e.sourceUrl,
        licence: e.licence,
        source: e.source,
      })),
    });
    console.log(
      `deepened ${row.slug}: ${before} → ${merged[row.productId].length}`,
    );
  }

  writeRegistry(merged);
  fs.writeFileSync(
    path.join(OUT_DIR, "gallery-fetch-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        deepened: report.deepened.length,
        alreadyHad: report.alreadyHad.length,
        couldNotSource: report.couldNotSource.length,
        registryProducts: Object.keys(merged).length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
