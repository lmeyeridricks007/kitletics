/**
 * Fetch authentic padel racket heroes from manufacturer / official-store pages.
 * node scripts/tmp/fetch-padel-racket-heroes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  assertUniqueHeroBytes,
  rememberHeroFile,
} from "../lib/hero-download.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/images/padel/products");
const REPORT = path.join(ROOT, "data/staging/padel-racket-hero-fetch.json");
const MEDIA = path.join(ROOT, "src/content/padel/rackets/product-media.ts");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function loadDrafts() {
  const file = path.join(ROOT, "data/staging/padel-racket-source-urls.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ogImage(html) {
  const m =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return m?.[1];
}

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  return buf;
}

async function main() {
  const drafts = loadDrafts();
  const rows = [];
  const mediaEntries = [];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const d of drafts) {
    const row = { id: d.id, slug: d.slug, sourceUrl: d.sourceUrl, status: "BLOCKED" };
    try {
      const page = await fetch(d.sourceUrl, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        redirect: "follow",
      });
      if (!page.ok) throw new Error(`page HTTP ${page.status}`);
      const html = await page.text();
      const imageUrl = ogImage(html);
      if (!imageUrl) throw new Error("no og:image");
      const abs = new URL(imageUrl, d.sourceUrl).href;
      row.imageUrl = abs;
      const buf = await download(abs);
      const dest = path.join(OUT_DIR, `${d.slug}-hero.jpg`);
      const src = `/images/padel/products/${d.slug}-hero.jpg`;
      assertUniqueHeroBytes(buf, { excludeSrc: src, label: d.id });
      const out = await sharp(buf)
        .rotate()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
      assertUniqueHeroBytes(out, { excludeSrc: src, label: `${d.id}-jpeg` });
      fs.writeFileSync(dest, out);
      rememberHeroFile(dest);
      const meta = await sharp(out).metadata();
      mediaEntries.push({
        productId: d.id,
        src,
        sourceUrl: d.sourceUrl,
        source: d.sourceName.replace(/"/g, '\\"'),
        licence: "manufacturer-marketing",
        width: meta.width || 1000,
        height: meta.height || 1000,
      });
      row.status = "READY";
      row.bytes = out.length;
    } catch (err) {
      row.error = String(err?.message || err);
    }
    rows.push(row);
    console.log(`${row.status} ${d.id} ${row.error || ""}`);
  }

  const body = mediaEntries
    .map(
      (e) => `  "${e.productId}": {
    productId: "${e.productId}",
    src: "${e.src}",
    sourceUrl: "${e.sourceUrl}",
    source: "${e.source}",
    licence: "${e.licence}",
    attribution: "© Brand — official / authorized product photography",
    width: ${e.width},
    height: ${e.height},
  },`,
    )
    .join("\n");

  fs.writeFileSync(
    MEDIA,
    `import type { CatalogProductMediaSource } from "@/content/catalog-product-media";

export const PADEL_RACKET_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {
${body}
};
`,
  );
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
  console.log(`wrote ${mediaEntries.length} heroes`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
