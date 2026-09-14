/**
 * Restore overwritten packshots and try a few remaining manufacturer PDPs.
 * node scripts/tmp/restore-padel-racket-heroes.mjs
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
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const JOBS = [
  {
    id: "prod-starvie-titania-kepler",
    dest: "starvie-titania-kepler-hero.jpg",
    page: "https://www.zonadepadel.es/star-vie/8032-star-vie-titania-kepler-pro-20.html",
  },
  {
    id: "prod-tecnifibre-wall-breaker-365-2026",
    dest: "tecnifibre-wall-breaker-365-hero.jpg",
    page: "https://www.greavessports.com/products/wall-breaker-365-padel-racket-black-yellow",
  },
  {
    id: "prod-black-crown-special-one-soft",
    dest: "black-crown-special-one-soft-hero.jpg",
    page: "https://www.zonadepadel.com/black-crown/8073-black-crown-special-soft-2023.html",
  },
  {
    id: "prod-nox-at10-attack-12k-2026",
    dest: "nox-at10-genius-attack-12k-2026-hero.jpg",
    page: "https://noxsport.com/en/products/pala-at10-genius-attack-12k-alum-xtrem-2026-by-agustin-tapia",
  },
  {
    id: "prod-kuikma-pr-hybrid-carbon",
    dest: "kuikma-pr-hybrid-carbon-hero.jpg",
    page: "https://www.decathlon.fr/p/raquette-de-padel-kuikma-pr-hybrid-carbon-coki-nieto/341828/m8979558",
  },
];

function collectImageUrls(html, pageUrl) {
  const urls = new Set();
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og?.[1]) urls.add(og[1]);
  for (const m of html.matchAll(/https?:\/\/[^"'>\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?/gi)) {
    urls.add(m[0]);
  }
  for (const m of html.matchAll(/"(https?:\\\/\\\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"));
  }
  return [...urls]
    .map((u) => {
      try {
        return new URL(u.replace(/&amp;/g, "&"), pageUrl).href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*", Referer: url },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 12000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  return buf;
}

async function main() {
  const report = [];
  for (const job of JOBS) {
    const row = { id: job.id, page: job.page, status: "BLOCKED" };
    try {
      const page = await fetch(job.page, {
        headers: { "User-Agent": UA, Accept: "text/html", Referer: job.page },
        redirect: "follow",
      });
      if (!page.ok) throw new Error(`page HTTP ${page.status}`);
      const html = await page.text();
      const candidates = collectImageUrls(html, job.page);
      row.candidates = candidates.length;
      let lastErr = "no image";
      for (const imageUrl of candidates.slice(0, 25)) {
        try {
          const buf = await download(imageUrl);
          const dest = path.join(OUT_DIR, job.dest);
          const src = `/images/padel/products/${job.dest}`;
          assertUniqueHeroBytes(buf, { excludeSrc: src, label: job.id });
          const out = await sharp(buf)
            .rotate()
            .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
            .flatten({ background: "#ffffff" })
            .jpeg({ quality: 88, mozjpeg: true })
            .toBuffer();
          assertUniqueHeroBytes(out, { excludeSrc: src, label: `${job.id}-jpeg` });
          fs.writeFileSync(dest, out);
          rememberHeroFile(dest);
          row.status = "READY";
          row.imageUrl = imageUrl;
          row.bytes = out.length;
          break;
        } catch (err) {
          lastErr = String(err?.message ?? err);
        }
      }
      if (row.status !== "READY") row.error = lastErr;
    } catch (err) {
      row.error = String(err?.message ?? err);
    }
    report.push(row);
    console.log(JSON.stringify(row));
  }
  fs.writeFileSync(
    path.join(ROOT, "data/staging/padel-racket-restore-heroes.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
