#!/usr/bin/env node
/**
 * Fix 77 — inventory public/images masters by byte size.
 * node scripts/tmp/prelaunch-77-inventory-masters.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const IMAGES = join(ROOT, "public/images");
const OUT_DIR = join(ROOT, "docs/prelaunch/data/rc-77");

const MB = 1024 * 1024;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(name)) {
      acc.push({ abs: p, bytes: st.size });
    }
  }
  return acc;
}

function usageOf(rel) {
  const n = rel.toLowerCase();
  if (/\/sections\//.test(n) || /\/reviews\//.test(n)) return "review-section";
  if (/\/gallery\//.test(n)) return "gallery";
  if (/-hero\./.test(n) || /\/hero\./.test(n)) return "hero";
  if (/guide-/.test(n) || /\/guides\//.test(n)) return "editorial";
  if (/\/brands\//.test(n)) return "brand";
  return "other";
}

function productHint(rel) {
  const m =
    rel.match(/products\/([^/]+)/i) ||
    rel.match(/([^/]+)-hero\./i);
  return m?.[1] ?? null;
}

const files = walk(IMAGES);
const over1 = files.filter((f) => f.bytes > MB).sort((a, b) => b.bytes - a.bytes);
const over3 = over1.filter((f) => f.bytes > 3 * MB);
const over5 = over1.filter((f) => f.bytes > 5 * MB);

async function enrich(list) {
  const out = [];
  for (const f of list) {
    const rel = "/" + relative(join(ROOT, "public"), f.abs).split("/").join("/");
    let meta = {};
    try {
      const m = await sharp(f.abs).metadata();
      meta = {
        format: m.format,
        width: m.width,
        height: m.height,
        hasAlpha: Boolean(m.hasAlpha),
        space: m.space,
      };
    } catch (e) {
      meta = { error: String(e.message || e) };
    }
    out.push({
      src: rel,
      bytes: f.bytes,
      mb: Number((f.bytes / MB).toFixed(2)),
      usage: usageOf(rel),
      productHint: productHint(rel),
      ...meta,
    });
  }
  return out;
}

const byExt = {};
const byUsage = {};
const byFolder = {};
for (const f of over1) {
  const rel = relative(IMAGES, f.abs);
  const ext = extname(f.abs).toLowerCase() || "none";
  byExt[ext] = (byExt[ext] || 0) + 1;
  const usage = usageOf("/images/" + rel.split("\\").join("/"));
  byUsage[usage] = (byUsage[usage] || 0) + 1;
  const folder = rel.split("/")[0] || "root";
  byFolder[folder] = (byFolder[folder] || 0) + 1;
}

mkdirSync(OUT_DIR, { recursive: true });

const over5e = await enrich(over5);
const over3e = await enrich(over3);

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    allImageFiles: files.length,
    over1mb: over1.length,
    over3mb: over3.length,
    over5mb: over5.length,
  },
  over1mb: {
    byExt,
    byUsage,
    byFolder,
  },
  over5mb: over5e,
  over3mb: over3e,
};

writeFileSync(join(OUT_DIR, "master-inventory.json"), JSON.stringify(summary, null, 2));

const over1csv = ["src,bytes,mb,usage,productHint"]
  .concat(
    over1.map((f) => {
      const rel = "/" + relative(join(ROOT, "public"), f.abs).split("/").join("/");
      return [rel, f.bytes, (f.bytes / MB).toFixed(2), usageOf(rel), productHint(rel) ?? ""].join(",");
    }),
  )
  .join("\n");
writeFileSync(join(OUT_DIR, "masters-over-1mb.csv"), over1csv);

console.log(JSON.stringify(summary.totals, null, 2));
console.log("\n>5MB:");
for (const r of over5e) {
  console.log(
    `${r.mb}MB  ${r.format} ${r.width}x${r.height} alpha=${r.hasAlpha}  ${r.usage}  ${r.src}`,
  );
}
console.log("\n>3MB (not already in >5):");
for (const r of over3e.filter((x) => x.bytes <= 5 * MB)) {
  console.log(
    `${r.mb}MB  ${r.format} ${r.width}x${r.height} alpha=${r.hasAlpha}  ${r.usage}  ${r.src}`,
  );
}
console.log("\n>1MB by usage", byUsage);
console.log(">1MB by ext", byExt);
console.log("wrote", OUT_DIR);
