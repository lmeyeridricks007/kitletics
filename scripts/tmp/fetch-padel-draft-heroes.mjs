/**
 * Fetch remaining draft racket packshots from SKU PDPs (not collection og:images).
 * node scripts/tmp/fetch-padel-draft-heroes.mjs
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
const REPORT = path.join(ROOT, "data/staging/padel-draft-hero-fetch.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const JOBS = [
  {
    id: "prod-bullpadel-vertex-05-hybrid",
    dest: "bullpadel-vertex-05-hybrid-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13550-bullpadel-vertex-05-hybrid-2026.html",
    image:
      "https://www.zonadepadel.com/27738-zdp_customer/bullpadel-vertex-05-hybrid-2026.jpg",
  },
  {
    id: "prod-bullpadel-vertex-05-w",
    dest: "bullpadel-vertex-05-w-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13552-bullpadel-vertex-05-woman-2026.html",
    image:
      "https://www.zonadepadel.com/27790-zdp_customer/bullpadel-vertex-05-woman-2026.jpg",
  },
  {
    id: "prod-bullpadel-hack-04-hybrid",
    dest: "bullpadel-hack-04-hybrid-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13554-bullpadel-hack-04-hybrid-2026.html",
    image:
      "https://www.zonadepadel.es/27750-zdp_customer/bullpadel-hack-04-hybrid-2026.jpg",
  },
  {
    id: "prod-bullpadel-hack-04-comfort",
    dest: "bullpadel-hack-04-comfort-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13555-bullpadel-hack-04-comfort-2026.html",
  },
  {
    id: "prod-bullpadel-neuron-02",
    dest: "bullpadel-neuron-02-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13556-bullpadel-neuron-02-2026.html",
    image:
      "https://www.zonadepadel.es/27771-zdp_customer/bullpadel-neuron-02-2026.jpg",
  },
  {
    id: "prod-bullpadel-neuron-02-edge",
    dest: "bullpadel-neuron-02-edge-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13558-bullpadel-neuron-02-edge-2026.html",
  },
  {
    id: "prod-bullpadel-xplo",
    dest: "bullpadel-xplo-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13559-bullpadel-xplo-2026.html",
  },
  {
    id: "prod-bullpadel-xplo-comfort",
    dest: "bullpadel-xplo-comfort-hero.jpg",
    page: "https://www.zonadepadel.es/bullpadel/13560-bullpadel-xplo-comfort-2026.html",
  },
  {
    id: "prod-bullpadel-ionic-light",
    dest: "bullpadel-ionic-light-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/13575-bullpadel-ionic-light-2026.html",
  },
  {
    id: "prod-bullpadel-vertex-advance",
    dest: "bullpadel-vertex-advance-hero.jpg",
    page: "https://www.zonadepadel.com/bullpadel/14397-bullpadel-vertex-advance-2026.html",
  },
  {
    id: "prod-bullpadel-indiga-ctr",
    dest: "bullpadel-indiga-ctr-hero.jpg",
    page: "https://www.padelnuestro.com/int/bullpadel-indiga-ctr-26",
  },
  {
    id: "prod-adidas-cross-it-light",
    dest: "adidas-cross-it-light-2026-hero.jpg",
    page: "https://allforpadel.com/en/padel-rackets/7528-padel-racket-adidas-cross-it-light-2026-martita-ortega-8435739405956.html",
    image:
      "https://allforpadel.com/9137/padel-racket-adidas-cross-it-light-2026-martita-ortega.jpg",
  },
  {
    id: "prod-adidas-cross-it-ctrl",
    dest: "adidas-cross-it-ctrl-2026-hero.jpg",
    page: "https://allforpadel.com/en/padel-rackets/7527-padel-racket-adidas-cross-it-ctrl-2026-8435739405949.html",
    image:
      "https://allforpadel.com/9127/padel-racket-adidas-cross-it-ctrl-2026.jpg",
  },
  {
    id: "prod-adidas-arrow-hit-attk",
    dest: "adidas-arrow-hit-attk-2026-hero.jpg",
    page: "https://allforpadel.com/en/padel-rackets/7523-padel-racket-adidas-arrow-hit-8435739405888.html",
    image: "https://allforpadel.com/9099/padel-racket-adidas-arrow-hit.jpg",
  },
  {
    id: "prod-adidas-metalbone-3-3-2026",
    dest: "adidas-metalbone-3-3-hero.jpg",
    page: "https://www.zonadepadel.com/adidas-padel/9362-adidas-metalbone-33.html",
  },
  {
    id: "prod-head-coello-motion",
    dest: "head-coello-motion-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-coello-motion-2026",
    image:
      "https://www.padelreference.com/storage/22257/hqrVnnKtQpdmeYFEL64oEnl3VQ1BXt-metaMS5wbmc%3D-.webp",
  },
  {
    id: "prod-head-coello-team",
    dest: "head-coello-team-hero.jpg",
    page: "https://www.padelreference.com/en/raquettes-de-padel/p/head-coello-team-2026",
    image:
      "https://www.padelreference.com/storage/22260/ioncCgSenppyBT8Aiad5rlghmeVVhp-metaMS5wbmc%3D-.webp",
  },
  {
    id: "prod-head-gravity-pro",
    dest: "head-gravity-pro-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-gravity-pro-2024",
    image:
      "https://www.padelreference.com/storage/10581/F0VNQM7BvkzP4U8HJ7Sh95sC4uMfCk-metaMjI0MDE0X0dyYXZpdHkgTW90aW9uIDIwMjRfMl8xLnBuZw%3D%3D-.webp",
  },
  {
    id: "prod-head-gravity-motion",
    dest: "head-gravity-motion-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-gravity-motion-2024",
    image:
      "https://www.padelreference.com/storage/10581/F0VNQM7BvkzP4U8HJ7Sh95sC4uMfCk-metaMjI0MDE0X0dyYXZpdHkgTW90aW9uIDIwMjRfMl8xLnBuZw%3D%3D-.webp",
  },
  {
    id: "prod-head-speed-pro",
    dest: "head-speed-pro-hero.jpg",
    page: "https://www.padelreference.com/en/palas-de-padel/p/head-speed-pro-2025",
    image:
      "https://www.padelreference.com/storage/11890/0JX1bs7sym1HisrDW6L936wWMddFIp-metaMjIxMDY1X1NwZWVkIFBybyAyMDI1XzJfMS5wbmc%3D-.webp",
  },
  {
    id: "prod-head-one-ultralight",
    dest: "head-one-ultralight-hero.jpg",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-one-ultralight-white-2025",
    image:
      "https://www.padelreference.com/storage/11299/f2xzQNOHw1SjGkfGdcYPPiMpCXJZOX-metaNjUucG5n-.webp",
  },
  {
    id: "prod-babolat-air-viper",
    dest: "babolat-air-viper-hero.jpg",
    page: "https://www.babolat.com/us/air-viper-2.6/150176.html",
    image:
      "https://media.babolat.com/image/upload/v1741095800/Product_Media/2026/Padel/RACQUETS/150176-AIR_VIPER_2.6-100-1-Face.png",
  },
  {
    id: "prod-babolat-air-veron",
    dest: "babolat-air-veron-hero.jpg",
    page: "https://www.babolat.com/us/air-veron-2.6/150180.html",
    image:
      "https://media.babolat.com/image/upload/v1738159651/Product_Media/2026/Padel/RACQUETS/150180-AIR_VERON_2.6-100-1-Face.png",
  },
  {
    id: "prod-siux-electra",
    dest: "siux-electra-pro-2026-hero.jpg",
    page: "https://www.zonadepadel.com/siux/13932-siux-electra-pro-fire-red-2026.html",
    image:
      "https://www.zonadepadel.com/28483-zdp_customer/siux-electra-pro-fire-red-2026.jpg",
  },
  {
    id: "prod-siux-fenix",
    dest: "siux-fenix-pro-2026-hero.jpg",
    page: "https://www.zonadepadel.com/siux/13935-siux-fenix-pro-black-2026.html",
    image:
      "https://www.zonadepadel.com/28491-zdp_customer/siux-fenix-pro-black-2026.jpg",
  },
  {
    id: "prod-nox-at10-attack-12k-2026",
    dest: "nox-at10-genius-attack-12k-2026-hero.jpg",
    page: "https://www.zonadepadel.com/nox/13772-nox-at10-luxury-genius-attack-12k-alum-xtrem-2026.html",
    image:
      "https://www.zonadepadel.com/27990-zdp_customer/nox-at10-luxury-genius-attack-12k-alum-xtrem-2026.jpg",
  },
  {
    id: "prod-drop-shot-canyon-pro",
    dest: "drop-shot-canyon-pro-hero.jpg",
    page: "https://www.zonadepadel.com/drop-shot/14427-drop-shot-canyon-pro-confort-20-2026.html",
    note: "REVIEW ONLY — catalog Canyon Pro is not Attack; Comfort 2.0 may still be the wrong sibling",
  },
  {
    id: "prod-kuikma-pr-soft-500",
    dest: "kuikma-pr-soft-500-hero.jpg",
    page: "https://www.decathlon.nl/search?Ntt=kuikma%20pr%20soft%20500",
  },
  {
    id: "prod-kuikma-pr-hybrid-carbon",
    dest: "kuikma-pr-hybrid-carbon-hero.jpg",
    page: "https://www.decathlon.fr/p/raquette-de-padel-kuikma-pr-hybrid-carbon-coki-nieto/341828/m8979558",
  },
  {
    id: "prod-black-crown-special-one-soft",
    dest: "black-crown-special-one-soft-hero.jpg",
    page: "https://www.zonadepadel.com/recherche?controller=search&s=special+one+soft",
  },
];

function collectImages(html, pageUrl) {
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
    .filter((u) => !/logo|favicon|sprite|icono|surgrip|flag|expand_more|generated/i.test(u))
    .map((u) => {
      let score = 0;
      if (/zdp_customer|thickbox|_customer/i.test(u)) score += 50;
      if (/media\.babolat\.com/i.test(u)) score += 80;
      if (/contents\.mediadecathlon|decathlonimages/i.test(u)) score += 70;
      if (/allforpadel\.com\/\d+\//i.test(u) && !/_(large|medium|home|small)_default/.test(u)) score += 40;
      if (/padelnuestro\.com\/media\/catalog\/product/i.test(u) && /1500x1500/.test(u)) score += 45;
      if (/Face\.png/i.test(u)) score += 30;
      if (/large_default/.test(u)) score += 10;
      if (/storage\/\d+\//.test(u) && /padelreference/.test(u)) score += 20;
      return { u, score };
    })
    .sort((a, b) => b.score - a.score || a.u.length - b.u.length);
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
  if (buf.length < 12000) throw new Error(`too small ${buf.length}`);
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
        row.candidates = images.slice(0, 8);
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
  console.log(`wrote ${REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
