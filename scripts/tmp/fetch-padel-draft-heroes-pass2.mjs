/**
 * Second pass: explicit packshot URLs only (no default placeholders).
 * node scripts/tmp/fetch-padel-draft-heroes-pass2.mjs
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
const OUT_DIR = path.join(ROOT, "public/images/padel/products/_draft-review");
const REPORT = path.join(ROOT, "data/staging/padel-draft-hero-fetch-pass2.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const JOBS = [
  {
    id: "prod-bullpadel-hack-04-comfort",
    dest: "bullpadel-hack-04-comfort-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13555-bullpadel-hack-04-comfort-2026.html",
    image:
      "https://www.zonadepadel.es/27761-zdp_customer/bullpadel-hack-04-comfort-2026.jpg",
  },
  {
    id: "prod-bullpadel-neuron-02-edge",
    dest: "bullpadel-neuron-02-edge-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13558-bullpadel-neuron-02-edge-2026.html",
    image:
      "https://www.zonadepadel.com/27772-zdp_customer/bullpadel-neuron-02-edge-2026.jpg",
  },
  {
    id: "prod-bullpadel-xplo",
    dest: "bullpadel-xplo-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13559-bullpadel-xplo-2026.html",
    image: "https://www.zonadepadel.com/27775-zdp_customer/bullpadel-xplo-2026.jpg",
  },
  {
    id: "prod-bullpadel-xplo-comfort",
    dest: "bullpadel-xplo-comfort-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13560-bullpadel-xplo-comfort-2026.html",
    image:
      "https://www.zonadepadel.es/27779-zdp_customer/bullpadel-xplo-comfort-2026.jpg",
  },
  {
    id: "prod-bullpadel-ionic-light",
    dest: "bullpadel-ionic-light-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13575-bullpadel-ionic-light-2026.html",
    image:
      "https://www.zonadepadel.com/28634-zdp_customer/bullpadel-ionic-light-2026.jpg",
  },
  {
    id: "prod-bullpadel-vertex-advance",
    dest: "bullpadel-vertex-advance-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/14397-bullpadel-vertex-advance-2026.html",
    image:
      "https://www.zonadepadel.com/29910-zdp_customer/bullpadel-vertex-advance-2026.jpg",
  },
  {
    id: "prod-adidas-metalbone-3-3-2026",
    dest: "adidas-metalbone-3-3-hero.jpg",
    page: "https://www.zonadepadel.com/adidas-padel/9362-adidas-metalbone-33.html",
    image: "https://www.zonadepadel.com/16817-zdp_customer/adidas-metalbone-33.jpg",
  },
  {
    id: "prod-head-gravity-pro",
    dest: "head-gravity-pro-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-gravity-pro-2024",
    image:
      "https://www.padelreference.com/storage/10576/yYat6gjXpwQuaztfz5D7jIkbzYLDQo-metaMjI0MDA0X0dyYXZpdHkgUHJvIDIwMjRfMl8xLnBuZw%3D%3D-.webp",
  },
  {
    id: "prod-head-gravity-motion",
    dest: "head-gravity-motion-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-gravity-motion-2024",
    image:
      "https://www.padelreference.com/storage/10581/F0VNQM7BvkzP4U8HJ7Sh95sC4uMfCk-metaMjI0MDE0X0dyYXZpdHkgTW90aW9uIDIwMjRfMl8xLnBuZw%3D%3D-.webp",
  },
  {
    id: "prod-head-coello-team",
    dest: "head-coello-team-hero.jpg",
    page: "https://www.padelreference.com/en/raquettes-de-padel/p/head-coello-team-2026",
    image:
      "https://www.padelreference.com/storage/22260/ioncCgSenppyBT8Aiad5rlghmeVVhp-metaMS5wbmc%3D-.webp",
  },
  {
    id: "prod-head-coello-motion",
    dest: "head-coello-motion-hero.jpg",
    page: "https://padelusa.com/products/head-coello-motion-2026-padel-racket",
  },
  {
    id: "prod-head-one-ultralight",
    dest: "head-one-ultralight-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-one-ultralight-black-2025",
  },
  {
    id: "prod-bullpadel-indiga-ctr",
    dest: "bullpadel-indiga-ctr-hero.jpg",
    page: "https://padelmarket.com/en/products/bullpadel-indiga-ctr-2026-racket-1",
  },
  {
    id: "prod-bullpadel-indiga-ctr-alt",
    dest: "bullpadel-indiga-ctr-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/bullpadel-indiga-ctr-26",
  },
  {
    id: "prod-kuikma-pr-hybrid-carbon",
    dest: "kuikma-pr-hybrid-carbon-hero.jpg",
    page: "https://en.decathlon.com.sa/search?q=kuikma%20hybrid%20carbon",
  },
  {
    id: "prod-kuikma-pr-soft-500",
    dest: "kuikma-pr-soft-500-hero.jpg",
    page: "https://en.decathlon.com.sa/search?q=kuikma%20pr%20soft",
  },
  {
    id: "prod-black-crown-special-one-soft",
    dest: "black-crown-special-one-soft-hero.jpg",
    page: "https://www.padelnuestro.com/int/search?q=special+one+soft",
  },
  {
    id: "prod-nox-at10-attack-12k-alt",
    dest: "nox-at10-genius-attack-12k-2026-alt.jpg",
    page: "https://www.zonadepadel.com/nox/13772-nox-at10-luxury-genius-attack-12k-alum-xtrem-2026.html",
    image:
      "https://www.zonadepadel.com/27991-large_default/nox-at10-luxury-genius-attack-12k-alum-xtrem-2026.jpg",
  },
];

function collectImages(html, pageUrl) {
  const urls = new Set();
  for (const m of html.matchAll(/https?:\/\/[^"'>\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?/gi)) {
    urls.add(m[0]);
  }
  for (const m of html.matchAll(/"(https?:\\\/\\\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"));
  }
  for (const m of html.matchAll(/src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)) {
    urls.add(m[1]);
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

function preferPackshot(urls) {
  const scored = urls
    .filter(
      (u) =>
        !/logo|favicon|sprite|icono|surgrip|flag|expand_more|generated|\/img\/p\/|default-zdp/i.test(
          u,
        ),
    )
    .map((u) => {
      let score = 0;
      if (/cdn\.shopify\.com/i.test(u)) score += 55;
      if (/zdp_customer/.test(u) && !/\/img\/p\//.test(u)) score += 50;
      if (/mediadecathlon|decathlonimages/i.test(u)) score += 70;
      if (/padelnuestro\.com\/media\/catalog\/product/i.test(u) && /1500x1500/.test(u)) score += 45;
      if (/storage\/\d+\//.test(u) && /padelreference/.test(u) && !/surgrip|generated|balls/.test(u))
        score += 35;
      if (/cdn\.shopify|files\/.*padel/i.test(u)) score += 40;
      return { u, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.u;
}

async function download(url, referer) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: referer || url,
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  return buf;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, html: await res.text(), finalUrl: res.url };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rows = [];
  for (const job of JOBS) {
    const row = { id: job.id, dest: job.dest, page: job.page, status: "BLOCKED" };
    try {
      let imageUrl = job.image;
      if (!imageUrl) {
        const page = await fetchHtml(job.page);
        row.pageStatus = page.status;
        if (!page.ok) throw new Error(`page HTTP ${page.status}`);
        const images = collectImages(page.html, page.finalUrl || job.page);
        row.candidates = images.slice(0, 10);
        imageUrl = preferPackshot(images);
        if (!imageUrl) throw new Error("no packshot");
      }
      row.imageUrl = imageUrl;
      const buf = await download(imageUrl, job.page);
      const dest = path.join(OUT_DIR, job.dest);
      const src = `/images/padel/products/_draft-review/${job.dest}`;
      try {
        assertUniqueHeroBytes(buf, { excludeSrc: src, label: job.id });
      } catch (err) {
        row.uniqueError = String(err.message || err);
      }
      const out = await sharp(buf)
        .rotate()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
      try {
        assertUniqueHeroBytes(out, { excludeSrc: src, label: `${job.id}-jpeg` });
      } catch (err) {
        row.uniqueJpegError = String(err.message || err);
      }
      fs.writeFileSync(dest, out);
      rememberHeroFile(dest);
      const meta = await sharp(out).metadata();
      row.width = meta.width;
      row.height = meta.height;
      row.bytes = out.length;
      row.status = row.uniqueError || row.uniqueJpegError ? "COLLISION" : "READY_REVIEW";
    } catch (err) {
      row.error = String(err?.message || err);
    }
    rows.push(row);
    console.log(`${row.status} ${job.id} ${row.error || row.uniqueError || row.imageUrl || ""}`);
  }
  fs.writeFileSync(REPORT, JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
