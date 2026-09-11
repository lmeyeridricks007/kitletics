#!/usr/bin/env node
/**
 * Fix 77 — archive >5MB masters out of public/, write JPEG web masters.
 * node scripts/tmp/prelaunch-77-remediate-extreme-masters.mjs
 */
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "../lib/media-ingest.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const ORIG = join(ROOT, "data/media-originals");
const MANIFEST = join(ORIG, "manifest.json");

function join(...parts) {
  return path.join(...parts);
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

const JOBS = [
  {
    src: "/images/packs/products/on-ultra-vest-pro/gallery/side-1.png",
    role: "gallery",
    productId: "prod-on-ultra-vest-pro",
    usage: "gallery-side",
    sourceUrl:
      "https://images.ctfassets.net/hnk2vsx53n6l/4i4taGom3YOHVS9TDolp3N/7da61b1d15b5bb1104fbf6c50ea5dcc7/ee4989fd85f8dad51150bad1c6b02037bffe9613.png",
    source: "On Contentful CDN",
    licence: "manufacturer-marketing",
  },
  {
    src: "/images/packs/products/on-ultra-vest-pro/gallery/detail-2.png",
    role: "gallery",
    productId: "prod-on-ultra-vest-pro",
    usage: "gallery-detail",
    sourceUrl:
      "https://images.ctfassets.net/hnk2vsx53n6l/1j2LrTWIoYCXc4sn95ztnt/a9aca11345125edb25ed5165e2e33dc2/1a4ae98322ce7b72cc4e08ae922c8c7b04d5ee11.png",
    source: "On Contentful CDN",
    licence: "manufacturer-marketing",
  },
  {
    src: "/images/packs/products/on-ultra-vest-pro/gallery/rear-3.png",
    role: "gallery",
    productId: "prod-on-ultra-vest-pro",
    usage: "gallery-rear",
    sourceUrl:
      "https://images.ctfassets.net/hnk2vsx53n6l/2uStRCM6XiOLioXxyG9PA8/d7d1f354ef39c8247ca01c55dc688caf/8cc78e8f1d0e4620c8a813e004d33086898fb3a9.png",
    source: "On Contentful CDN",
    licence: "manufacturer-marketing",
  },
  {
    src: "/images/packs/products/on-ultra-vest-pro-hero.png",
    role: "hero",
    productId: "prod-on-ultra-vest-pro",
    usage: "unused-duplicate-of-side",
    deleteOnly: true,
    keepPublicJpg: "/images/packs/products/on-ultra-vest-pro-hero.jpg",
    sourceUrl: "https://www.on.com/en-us/products/ultra-vest-pro-u-2uf3013/unisex",
    source: "On Contentful CDN (unregistered PNG leftover; registered hero is JPEG)",
    licence: "manufacturer-marketing",
  },
  {
    src: "/images/running/products/glycerin-22-hero.png",
    role: "hero",
    productId: "prod-glycerin-22",
    usage: "hero",
    sourceUrl:
      "https://cdn.runrepeat.com/storage/gallery/product_content/40658/brooks-glycerin-22-22723204-main.jpg",
    source: "Independent lab product photography (RunRepeat)",
    licence: "retailer-authorized",
  },
];

const rows = [];

for (const job of JOBS) {
  const abs = join(PUBLIC, job.src.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    console.warn("missing", job.src);
    continue;
  }
  const buf = fs.readFileSync(abs);
  const meta = await sharp(abs).metadata();
  const archiveRel = job.src.replace(/^\//, "");
  const archiveAbs = join(ORIG, archiveRel);
  fs.mkdirSync(path.dirname(archiveAbs), { recursive: true });
  fs.copyFileSync(abs, archiveAbs);

  const row = {
    productId: job.productId,
    usage: job.usage,
    publicSrcBefore: job.src,
    originalArchive: `/data/media-originals/${archiveRel}`,
    sourceUrl: job.sourceUrl,
    source: job.source,
    licence: job.licence,
    original: {
      format: meta.format,
      width: meta.width,
      height: meta.height,
      hasAlpha: Boolean(meta.hasAlpha),
      bytes: buf.length,
      sha256: sha256(buf),
    },
  };

  if (job.deleteOnly) {
    fs.unlinkSync(abs);
    row.action = "archived-and-removed-from-public";
    row.publicSrcAfter = job.keepPublicJpg;
    row.note = "Registered hero is already JPEG; PNG was an unused 8.3MB duplicate.";
    rows.push(row);
    console.log("removed leftover", job.src);
    continue;
  }

  const written = await writeWebMaster(buf, abs, { role: job.role });
  if (written.dest !== abs && fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
  const publicAfter =
    "/" + path.relative(PUBLIC, written.dest).split(path.sep).join("/");
  row.action = "web-master";
  row.publicSrcAfter = publicAfter;
  row.webMaster = {
    format: written.format,
    width: written.width,
    height: written.height,
    bytes: written.bytes,
  };
  rows.push(row);
  console.log(
    job.src,
    `${(buf.length / 1024 / 1024).toFixed(2)}MB →`,
    publicAfter,
    `${(written.bytes / 1024).toFixed(0)}KB`,
    `${written.width}x${written.height}`,
  );
}

fs.mkdirSync(ORIG, { recursive: true });
const manifest = {
  generatedAt: new Date().toISOString(),
  note: "Binaries in this folder are gitignored. Canonical originals remain at sourceUrl.",
  files: rows,
};
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
fs.writeFileSync(
  join(ROOT, "docs/prelaunch/data/rc-77/extreme-remediation.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("wrote", MANIFEST);
