/**
 * Shared helpers for catalog hero downloads: prefer manufacturer CDNs and
 * reject buffers that collide with another product's on-disk hero (Nathan /
 * RunRepeat re-host failure mode).
 *
 * Usage (ESM):
 *   import {
 *     preferManufacturerRemotes,
 *     assertUniqueHeroBytes,
 *     sha256Hex,
 *   } from "./lib/hero-download.mjs";
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/** Higher = preferred. Manufacturer / brand CDNs beat aggregator re-hosts. */
const HOST_SCORE = [
  { re: /assets\.roguefitness\.com|roguefitness\.com\/media/i, score: 90 },
  { re: /static\.nike\.com|assets\.adidas\.com|images\.asics\.com|nb\.scene7\.com/i, score: 95 },
  { re: /cdn\.shopify\.com|images\.ctfassets\.net|cloudinary\.com/i, score: 70 },
  { re: /sportsshoes\.com|runningwarehouse\.com|tennis-warehouse|bergfreunde|bfgcdn/i, score: 60 },
  { re: /tyr\.(com|eu)|nathansports|garmin\.com|brooksrunning/i, score: 92 },
  { re: /runrepeat\.com|product_primary|lab[-_]?cutaway/i, score: 15 },
];

export function manufacturerHostScore(url) {
  try {
    const host = new URL(url).hostname;
    let best = 40;
    for (const row of HOST_SCORE) {
      if (row.re.test(url) || row.re.test(host)) best = Math.max(best, row.score);
    }
    return best;
  } catch {
    return 0;
  }
}

/** Stable sort: manufacturer CDNs first, RunRepeat-style re-hosts last. */
export function preferManufacturerRemotes(urls) {
  return [...urls].sort(
    (a, b) => manufacturerHostScore(b) - manufacturerHostScore(a) || a.localeCompare(b),
  );
}

export function sha256Hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

let heroHashIndexCache = null;

/**
 * Build sha256 → relative public src for every `*-hero.*` under public/images.
 * Cached per process; call `invalidateHeroHashIndex()` after writing a new hero.
 */
export function buildHeroHashIndex(root = ROOT) {
  const index = new Map();
  const imagesRoot = path.join(root, "public/images");
  if (!fs.existsSync(imagesRoot)) return index;

  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (/-hero\.(jpe?g|png|webp)$/i.test(ent.name)) {
        const hash = sha256Hex(fs.readFileSync(abs));
        const src = `/${path.relative(path.join(root, "public"), abs).split(path.sep).join("/")}`;
        const list = index.get(hash) ?? [];
        list.push(src);
        index.set(hash, list);
      }
    }
  };
  walk(imagesRoot);
  return index;
}

export function getHeroHashIndex(root = ROOT) {
  if (!heroHashIndexCache) heroHashIndexCache = buildHeroHashIndex(root);
  return heroHashIndexCache;
}

export function invalidateHeroHashIndex() {
  heroHashIndexCache = null;
}

/**
 * Throws if `buf` matches another product hero on disk (excluding `excludeSrc`).
 * Call after download, before registering a new product hero.
 * @param {Buffer|Uint8Array} buf
 * @param {{ excludeSrc?: string, root?: string, label?: string }} [opts]
 * @returns {string} sha256 hex
 */
export function assertUniqueHeroBytes(
  buf,
  { excludeSrc, root = ROOT, label = "hero" } = {},
) {
  const hash = sha256Hex(buf);
  const index = getHeroHashIndex(root);
  const hits = (index.get(hash) ?? []).filter((src) => src !== excludeSrc);
  if (hits.length > 0) {
    throw new Error(
      `shared-hero hash collision for ${label}: same bytes as ${hits.join(", ")}`,
    );
  }
  return hash;
}

/**
 * After writing a hero file, update the in-memory index so subsequent downloads
 * in the same process see the new hash.
 */
export function rememberHeroFile(absPath, root = ROOT) {
  const index = getHeroHashIndex(root);
  const hash = sha256Hex(fs.readFileSync(absPath));
  const src = `/${path.relative(path.join(root, "public"), absPath).split(path.sep).join("/")}`;
  const list = index.get(hash) ?? [];
  if (!list.includes(src)) list.push(src);
  index.set(hash, list);
  return hash;
}
