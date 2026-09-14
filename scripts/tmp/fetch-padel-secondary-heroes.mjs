/**
 * Fetch authentic padel secondary (balls/bags/grips/accessories) heroes.
 * node scripts/tmp/fetch-padel-secondary-heroes.mjs
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
const REPORT = path.join(ROOT, "data/staging/padel-secondary-hero-fetch.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Product-specific PDPs only (not brand/collection homepages).
 * Prefer manufacturer CDN imageUrl when known; else scrape og:image.
 */
const DRAFTS = [
  // --- already READY in prior passes (kept for re-run / provenance) ---
  {
    id: "prod-kuikma-pb-speed",
    slug: "kuikma-pb-speed",
    sourceUrl:
      "https://www.decathlon.ph/p/pressurised-padel-balls-kuikma-pb-speed-pack-of-3-kuikma-8788980.html",
    sourceName: "Decathlon Kuikma PB Speed",
    imageUrl:
      "https://contents.mediadecathlon.com/p3114672/k$84407111f9979d1a4f1eda720671cf5a/pressurised-padel-balls-kuikma-pb-speed-pack-of-3-kuikma-8788980.jpg",
  },
  {
    id: "prod-nox-at10-team-bag",
    slug: "nox-at10-team-paletero",
    sourceUrl: "https://noxsport.com/en/products/paletero-at10-team-grey-black",
    sourceName: "NOX AT10 TEAM GREY/BLACK",
  },
  {
    id: "prod-babolat-rh-pro-padel",
    slug: "babolat-rh-pro-padel",
    sourceUrl: "https://www.babolat.com/us/rh-pro/759020.html",
    sourceName: "Babolat RH Pro",
  },
  {
    id: "prod-bullpadel-gb1200",
    slug: "bullpadel-hac-overgrip",
    sourceUrl:
      "https://www.zonadepadel.uk/bullpadel/1390-overgrips-gb1200-blancos.html",
    sourceName: "Zona de Padel Bullpadel GB1200",
  },

  // --- priority remaining ---
  {
    id: "prod-head-padel-pro-plus",
    slug: "head-padel-pro-plus",
    sourceUrl:
      "https://www.zonadepadel.es/head-padel/11333-bote-pelotas-head-padel-pro.html",
    sourceName: "Zona de Padel HEAD Padel Pro+",
    imageUrl:
      "https://www.zonadepadel.es/21141-zdp_customer/bote-pelotas-head-padel-pro.jpg",
  },
  {
    id: "prod-head-padel-team",
    slug: "head-padel-team",
    sourceUrl:
      "https://padelmarket.com/en-eu/products/head-padel-team-3-tubes-of-3-balls",
    sourceName: "Padel Market HEAD Team 3-tube pack",
    imageUrl: "https://padelmarket.com/cdn/shop/files/7566.jpg?v=1725947911",
  },
  {
    id: "prod-head-padel-one",
    slug: "head-padel-one",
    sourceUrl:
      "https://padelmarket.com/en-gb/products/head-padel-one-tube-of-3-balls",
    sourceName: "Padel Market HEAD Padel One",
    imageUrl: "https://padelmarket.com/cdn/shop/files/7560.jpg?v=1725950334",
  },
  {
    id: "prod-kuikma-pb-control",
    slug: "kuikma-pb-control",
    sourceUrl:
      "https://www.decathlon.in/p/8750703/pressurised-padel-balls-kuikma-pb-control-pack-of-3",
    sourceName: "Decathlon Kuikma PB Control",
    imageUrl:
      "https://contents.mediadecathlon.com/p3114707/7ab55b812deccb613d8812c30f4fd529/p3114707.jpg",
  },
  {
    id: "prod-wilson-padel-premier",
    slug: "wilson-padel-premier",
    sourceUrl:
      "https://padelmarket.com/en-eu/products/wilson-premier-padel-3-ball-tin",
    sourceName: "Padel Market Wilson Premier",
    imageUrl: "https://padelmarket.com/cdn/shop/files/10390.jpg?v=1725951130",
  },
  {
    id: "prod-wilson-padel-premier-speed",
    slug: "wilson-padel-premier-speed",
    sourceUrl:
      "https://padelmarket.com/en-worldwide/products/wilson-premier-padel-speed-3-ball-set",
    sourceName: "Padel Market Wilson Premier Speed",
    imageUrl: "https://padelmarket.com/cdn/shop/files/10301.jpg?v=1725951119",
  },
  {
    id: "prod-bullpadel-premium-pro",
    slug: "bullpadel-premium-pro",
    sourceUrl:
      "https://padelmarket.com/en-eu/products/bullpadel-premium-pro-tube-of-3-balls",
    sourceName: "Padel Market Bullpadel Premium Pro",
    imageUrl: "https://padelmarket.com/cdn/shop/files/10575.jpg?v=1725947950",
  },
  {
    id: "prod-babolat-court-padel-balls",
    slug: "babolat-court-padel-balls",
    sourceUrl: "https://www.babolat.com/gb/court-x3/501098.html",
    sourceName: "Babolat Court x3",
    imageUrl:
      "https://media.babolat.com/image/upload/v1672847680/Product_Media/2023/501098-COURT_PADELX3-113-1-Face.png",
  },
  {
    id: "prod-dunlop-pro-padel",
    slug: "dunlop-pro-padel",
    sourceUrl:
      "https://www.zonadepadel.uk/dunlop-padel/11377-bottle-balls-dunlop-fort-padel.html",
    sourceName: "Zona de Padel Dunlop Fort Padel",
    imageUrl:
      "https://www.zonadepadel.uk/21162-zdp_customer/bottle-balls-dunlop-fort-padel.jpg",
  },
  {
    id: "prod-bullpadel-vertex-backpack",
    slug: "bullpadel-vertex-geo-backpack",
    sourceUrl:
      "https://padelmarket.com/en/products/bullpadel-bpm-26008-vertex-geo-blue-2026-pablo-cardona-backpack",
    sourceName: "Padel Market Bullpadel Vertex GEO 2026",
    imageUrl:
      "https://padelmarket.com/cdn/shop/files/VERTEXGEO_2.jpg?v=1774350538",
  },
  {
    id: "prod-babolat-court-backpack",
    slug: "babolat-court-backpack",
    sourceUrl: "https://www.babolat.com/us/court-s/102-759022.html",
    sourceName: "Babolat Court S (Court line padel bag)",
    imageUrl:
      "https://media.babolat.com/image/upload/v1720615409/Product_Media/2025/Padel/BAGS/759022-COURT_S-102-1-3_4_Face.png",
  },
  {
    id: "prod-adidas-protour-padel",
    slug: "adidas-protour-padel-bag",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/adidas-padeltas-protour-3-5-blauw-brons-2026",
    sourceName: "PadeLMQ Adidas ProTour 3.5 2026",
    imageUrl:
      "https://www.padelmq.com/cdn/shop/files/adidas-protour-padeltas-blauw-brons-2026.1_1200x1200.jpg?v=1772906230",
  },
  {
    id: "prod-head-elite-backpack",
    slug: "head-elite-padel-backpack",
    sourceUrl:
      "https://www.tennis-point.co.uk/products/head-tour-team-elite-backpack-limeblue-00637502591000",
    sourceName: "Tennis-Point HEAD Tour Team Elite Backpack",
    imageUrl:
      "https://www.tennis-point.co.uk/cdn/shop/files/0063750259100000.jpg?v=1775049293",
  },
  {
    id: "prod-wilson-super-tour-padel",
    slug: "wilson-super-tour-padel-bag",
    sourceUrl:
      "https://global.e-padel.com/wilson-super-tour-padel-bag-wr8913001.html",
    sourceName: "e-padel Wilson Super Tour Padel Bag",
    imageUrl:
      "https://global.e-padel.com/media/catalog/product/cache/e3f192febd5085c1042f4a34b66cbefd/w/r/wr8913001_1_.jpg",
  },
  {
    id: "prod-kuikma-overgrip",
    slug: "kuikma-padel-overgrip",
    sourceUrl: "https://www.decathlon.sg/p/padel-overgrip-pro-kuikma-8981669.html",
    sourceName: "Decathlon Kuikma Padel Overgrip Pro",
    imageUrl:
      "https://contents.mediadecathlon.com/p3034884/k$930bf149a819c5326e40a5a1e8333d64/padel-overgrip-pro-kuikma-8981669.jpg",
  },
  {
    id: "prod-nox-pro-overgrip",
    slug: "nox-pro-overgrip",
    sourceUrl:
      "https://noxsport.com/en/products/bote-overgrips-pro-60-unidades-blanco",
    sourceName: "NOX PRO Overgrips white can",
  },
  {
    id: "prod-babolat-pro-response",
    slug: "babolat-pro-response-overgrip",
    sourceUrl: "https://www.babolat.com/gb/pro-response-x3/653048.html",
    sourceName: "Babolat Pro Response X3",
    imageUrl:
      "https://media.babolat.com/image/upload/v1728905770/Product_Media/2024/653048-PRO_RESPONSE_x3-101-1-Pack_Recto.png",
  },
  {
    id: "prod-babolat-syntec-pro",
    slug: "babolat-syntec-pro-replacement-grip",
    sourceUrl: "https://www.babolat.com/us/syntec-pro/670051.html",
    sourceName: "Babolat Syntec Pro",
    imageUrl:
      "https://media.babolat.com/image/upload/v1728897362/Product_Media/2024/Tennis/Grips%20Surgrips/670051-SYNTEC_PRO_X1-101-1-Pack_Recto.png",
  },
  {
    id: "prod-hesacore-padel",
    slug: "hesacore-padel-grip",
    sourceUrl: "https://shop.hesacore.com/products/padel-hesacore-tour-grip-1",
    sourceName: "Hesacore Original Padel Grip",
  },
  {
    id: "prod-bullpadel-frame-protector",
    slug: "bullpadel-frame-protector-3-pack",
    sourceUrl:
      "https://padelmarket.com/en/products/protector-tape-bullpadel-frame-pro-black-2-pcs",
    sourceName: "Padel Market Bullpadel Frame Pro protector",
    imageUrl:
      "https://padelmarket.com/cdn/shop/files/ProtectoresBullpadel.jpg?v=1760601985",
  },
  {
    id: "prod-head-x3-pressurizer",
    slug: "head-x3-ball-pressurizer",
    sourceUrl:
      "https://www.zonadepadel.es/head-padel/7813-bote-presurizador-head-x-3-pump.html",
    sourceName: "Zona de Padel HEAD X3 Pump",
    imageUrl:
      "https://www.zonadepadel.es/16642-zdp_customer/bote-presurizador-head-x-3-pump.jpg",
  },
  {
    id: "prod-nox-at10-xxl-bag",
    slug: "nox-at10-xxl-padel-bag",
    sourceUrl: "https://noxsport.com/en/products/padel-bag-at10-xxl",
    sourceName: "NOX AT10 XXL Competition bag",
  },
];

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
  const rows = [];
  const mediaEntries = [];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const d of DRAFTS) {
    const row = { id: d.id, slug: d.slug, sourceUrl: d.sourceUrl, status: "BLOCKED" };
    try {
      let imageUrl = d.imageUrl;
      if (!imageUrl) {
        const page = await fetch(d.sourceUrl, {
          headers: { "User-Agent": UA, Accept: "text/html" },
          redirect: "follow",
        });
        if (!page.ok) throw new Error(`page HTTP ${page.status}`);
        const html = await page.text();
        imageUrl = ogImage(html);
        if (!imageUrl) throw new Error("no og:image");
      }
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
        source: d.sourceName,
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
    console.log(`${row.status} ${d.id} ${row.error || row.imageUrl || ""}`);
  }

  fs.writeFileSync(REPORT, JSON.stringify({ rows, mediaEntries }, null, 2));
  console.log(`\nWrote ${REPORT} (${mediaEntries.length} media)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
