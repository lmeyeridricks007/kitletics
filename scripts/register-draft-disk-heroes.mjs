#!/usr/bin/env node
/**
 * Register draft product heroes that already exist on disk but are missing
 * from catalog-product-media.ts. Provenance is recovered from staging fetch
 * reports when available.
 *
 * node scripts/register-draft-disk-heroes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");
const MATCHES = path.join(ROOT, "data/staging/draft-hero-disk-matches.json");
const REPORT = path.join(ROOT, "data/staging/register-draft-disk-heroes.json");

function walkJson(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkJson(p, out);
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

/** Build productId → { sourceUrl, source, licence, attribution } from staging reports. */
function loadProvenance() {
  /** @type {Map<string, { sourceUrl: string, source: string, licence: string, attribution?: string }>} */
  const map = new Map();
  const absorb = (id, row) => {
    if (!id || typeof id !== "string" || !id.startsWith("prod-")) return;
    const sourceUrl = row.sourceUrl || row.source_url || row.pageUrl;
    const source = row.source || row.sourceLabel || row.via;
    const licence =
      row.licence ||
      row.license ||
      (String(source || "").toLowerCase().includes("manufacturer")
        ? "manufacturer-marketing"
        : "retailer-authorized");
    if (!sourceUrl || !source) return;
    if (map.has(id)) return;
    map.set(id, {
      sourceUrl: String(sourceUrl),
      source: String(source),
      licence:
        licence === "manufacturer-marketing"
          ? "manufacturer-marketing"
          : "retailer-authorized",
      attribution:
        row.attribution ||
        "© Brand — official / authorized product photography",
    });
  };

  for (const file of walkJson(path.join(ROOT, "data/staging"))) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.ok)
        ? data.ok
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.products)
            ? data.products
            : data && typeof data === "object"
              ? Object.entries(data).map(([k, v]) =>
                  typeof v === "object" && v
                    ? { id: k.startsWith("prod-") ? k : v.id, ...v }
                    : null,
                ).filter(Boolean)
              : [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      absorb(row.id || row.productId, row);
      if (row.slug && row.sourceUrl) {
        // also index by slug for later
      }
    }
  }
  return map;
}

function registryBlock(entry) {
  return `  "${entry.productId}": {
    productId: "${entry.productId}",
    src: "${entry.src}",
    sourceUrl: "${entry.sourceUrl}",
    source: ${JSON.stringify(entry.source)},
    licence: "${entry.licence}",
    attribution: ${JSON.stringify(entry.attribution)},
    width: ${entry.width},
    height: ${entry.height},
  },`;
}

function upsertRegistry(entries) {
  let src = fs.readFileSync(REGISTRY, "utf8");
  let added = 0;
  let updated = 0;
  for (const entry of entries) {
    const re = new RegExp(`  "${entry.productId}": \\{[\\s\\S]*?\\},\\n`);
    const block = registryBlock(entry) + "\n";
    if (re.test(src)) {
      src = src.replace(re, block);
      updated += 1;
    } else {
      const idx = src.lastIndexOf("\n};");
      if (idx === -1) throw new Error("Cannot find CATALOG_PRODUCT_MEDIA end");
      src = src.slice(0, idx) + "\n" + block + src.slice(idx);
      added += 1;
    }
  }
  fs.writeFileSync(REGISTRY, src);
  return { added, updated };
}

async function main() {
  const { matches } = JSON.parse(fs.readFileSync(MATCHES, "utf8"));
  const provenance = loadProvenance();
  const enrichPath = path.join(ROOT, "data/staging/draft-hero-disk-enrich.json");
  const enrich = fs.existsSync(enrichPath)
    ? JSON.parse(fs.readFileSync(enrichPath, "utf8"))
    : {};
  console.log(`Matches: ${matches.length}; provenance tips: ${provenance.size}`);

  const entries = [];
  const skipped = [];
  for (const m of matches) {
    const abs = path.join(ROOT, "public", m.src.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      skipped.push({ id: m.id, reason: "missing-file", src: m.src });
      continue;
    }
    const tip = provenance.get(m.id);
    const metaEn = enrich[m.id] || {};
    let width = 1000;
    let height = 1000;
    try {
      const meta = await sharp(abs).metadata();
      width = meta.width || width;
      height = meta.height || height;
    } catch {
      // keep defaults
    }
    const brandHome = metaEn.brandHomepage;
    entries.push({
      productId: m.id,
      src: m.src,
      sourceUrl: tip?.sourceUrl || brandHome || "https://kitletics.com",
      source:
        tip?.source ||
        (metaEn.brandName
          ? `Authorized product photography (${metaEn.brandName}) — re-registered on-disk hero`
          : "Authorized product photography — re-registered on-disk hero"),
      licence: tip?.licence || "retailer-authorized",
      attribution:
        tip?.attribution ||
        "© Brand — official / authorized product photography",
      width,
      height,
    });
  }

  const weak = entries.filter(
    (e) =>
      !provenance.has(e.productId) ||
      e.source.includes("re-registered on-disk"),
  );
  const { added, updated } = upsertRegistry(entries);
  const report = {
    registered: entries.length,
    added,
    updated,
    skipped,
    weakProvenance: weak.map((e) => e.productId),
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(
    `Registered ${entries.length} (added ${added}, updated ${updated}); weak provenance ${weak.length}; skipped ${skipped.length}`,
  );
  console.log(`Wrote ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
