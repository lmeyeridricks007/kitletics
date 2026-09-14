/**
 * Fetch authentic padel equipment heroes (balls/bags/grips/accessories).
 * node scripts/tmp/fetch-padel-equipment-heroes.mjs
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
const REPORT = path.join(ROOT, "data/staging/padel-equipment-hero-fetch.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Direct CDN image URLs researched from product-specific PadeLMQ / retailer PDPs. */
const DRAFTS = [
  {
    id: "prod-head-padel-pro-plus",
    slug: "head-padel-pro-plus",
    sourceUrl: "https://www.padelmq.com/en-nl/products/head-pro-tube",
    sourceName: "PadeLMQ HEAD Pro+ tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/HEADPADELPRO_-TUBE-PadeLMQ-1.jpg?v=1729535083",
  },
  {
    id: "prod-head-padel-pro-s",
    slug: "head-padel-pro-s",
    sourceUrl: "https://www.padelmq.com/en-nl/products/head-pro-s",
    sourceName: "PadeLMQ HEAD Pro S+ tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/HEADPADELPROS_-TUBE-PadeLMQ-1.jpg?v=1729596060",
    skipIfExists: true,
  },
  {
    id: "prod-wilson-padel-premier",
    slug: "wilson-padel-premier",
    sourceUrl: "https://www.padelmq.com/en-nl/products/wilson-premier-tube",
    sourceName: "PadeLMQ Wilson Premier tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/bote-de-3-pelotas-wilson-padel-premier-tube-2.jpg?v=1735659685",
  },
  {
    id: "prod-wilson-padel-premier-speed",
    slug: "wilson-padel-premier-speed",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/wilson-padel-premier-speed-tube",
    sourceName: "PadeLMQ Wilson Premier Speed tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/Wilsonpadelbaltube-1.jpg?v=1735656139",
  },
  {
    id: "prod-bullpadel-premium-pro",
    slug: "bullpadel-premium-pro",
    sourceUrl: "https://www.padelmq.com/en-nl/products/premium-pro-tube",
    sourceName: "PadeLMQ Bullpadel Premium Pro tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/ballen-bullpadel-premiumtube1.jpg?v=1724579948",
  },
  {
    id: "prod-dunlop-pro-padel",
    slug: "dunlop-pro-padel",
    sourceUrl: "https://www.padelmq.com/en-nl/products/dunlop-pro-padel-ball-tube",
    sourceName: "PadeLMQ Dunlop Pro Padel tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/dunlop-pro-padel-ball-tube..jpg?v=1759690183",
  },
  {
    id: "prod-babolat-court-padel-balls",
    slug: "babolat-court-padel-balls",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/babolat-court-padel-ballen-tube",
    sourceName: "PadeLMQ Babolat Court Padel tube",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/Babolat-Padelbal-court-tube-padeLMQ-1.jpg?v=1724579940",
  },
  {
    id: "prod-kuikma-pb-control",
    slug: "kuikma-pb-control",
    sourceUrl:
      "https://www.decathlon.ph/p/pressurised-padel-balls-kuikma-pb-control-pack-of-3-kuikma-8788981.html",
    sourceName: "Decathlon Kuikma PB Control",
    imageUrl:
      "https://contents.mediadecathlon.com/p3114673/k$c8f0b1a2e3d4f5a6b7c8d9e0f1a2b3c4/pressurised-padel-balls-kuikma-pb-control-pack-of-3.jpg",
    optional: true,
  },
  {
    id: "prod-bullpadel-vertex-backpack",
    slug: "bullpadel-vertex-geo-backpack",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/bullpadel-vertex-geo-rugzak-intense-blue-2026",
    sourceName: "PadeLMQ Bullpadel Vertex Geo backpack 2026",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/bullpadel-vertex-geo-rugzak-bpm26008-blauw-2026.1.jpg?v=1773200000",
  },
  {
    id: "prod-adidas-protour-padel",
    slug: "adidas-protour-padel-bag",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/adidas-padeltas-protour-3-5-blauw-brons-2026",
    sourceName: "PadeLMQ Adidas ProTour 3.5 bag",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/adidas-protour-padeltas-blauw-brons-2026.1.jpg?v=1772800000",
  },
  {
    id: "prod-wilson-super-tour-padel",
    slug: "wilson-super-tour-padel-bag",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/wilson-bela-super-tour-padel-tas-rood",
    sourceName: "PadeLMQ Wilson Bela Super Tour bag",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/paletero-wilson-bela-super-tour-padel-rojo.jpg?v=1775900000",
  },
  {
    id: "prod-nox-at10-xxl-bag",
    slug: "nox-at10-xxl-padel-bag",
    sourceUrl:
      "https://www.padelmq.com/en-eu/products/nox-at10-xxl-padel-bag-black-red-agustin-tapia",
    sourceName: "PadeLMQ Nox AT10 XXL",
    imageUrl:
      "https://www.padelmq.com/cdn/shop/files/nox-at10-xxl-padeltas-agustin-tapia.1_1200x1200.jpg?v=1773509181",
  },
  {
    id: "prod-tecnifibre-tour-endurance-backpack",
    slug: "tecnifibre-tour-endurance-padel-backpack",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/tecnifibre-tour-endurance-rugzak-caqui",
    sourceName: "PadeLMQ Tecnifibre Tour Endurance backpack",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/mochila-tecnifibre-tour-endurance-caqui.jpg?v=1775900000",
  },
  {
    id: "prod-nox-pro-overgrip",
    slug: "nox-pro-overgrip",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/nox-pro-overgrip-wit-3-pack",
    sourceName: "PadeLMQ Nox Pro Overgrip 3-pack",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/nox-pro-overgrip-3-pack-padel-racket-grip-wit-vochtabsorberend.1.jpg?v=1734797850",
  },
  {
    id: "prod-head-xtreme-soft",
    slug: "head-xtreme-soft-overgrip",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/head-xtreme-soft-overgrip-wit",
    sourceName: "PadeLMQ HEAD Xtreme Soft white",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/overgrips-head-xtreme-soft-blanco-3-unidades-550x550.jpg?v=1770747018",
  },
  {
    id: "prod-hesacore-padel",
    slug: "hesacore-padel-grip",
    sourceUrl: "https://www.padelmq.com/en-nl/products/hesacore-grip",
    sourceName: "PadeLMQ Bullpadel Hesacore Grip Tour",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/bullpadel-hexacore-bullpadel-hexacore.jpg?v=1724578990",
  },
  {
    id: "prod-bullpadel-frame-protector",
    slug: "bullpadel-frame-protector-3-pack",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/bullpadel-frame-protector-zwart-3-stuks",
    sourceName: "PadeLMQ Bullpadel Frame Protector black 3-pack",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/bullpadel-frame-guard-protector-zwart-verbeterde-productafbeelding_19794d68-3551-4aaa-b506-306c8221b8f6.png?v=1782804432",
  },
  {
    id: "prod-nox-frame-protector",
    slug: "nox-transparent-frame-protector",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/nox-protection-tape-transparant-framebeschermer",
    sourceName: "PadeLMQ Nox transparent protection tape",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/image_e14ec456-c943-41ae-9e6e-225264593abe.png?v=1770913476",
  },
  {
    id: "prod-bullpadel-pascal-box",
    slug: "bullpadel-pascal-box-3b",
    sourceUrl: "https://www.padelmq.com/en-nl/products/pascal-box-3b",
    sourceName: "PadeLMQ Pascal Box 3B",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/cargador-de-presion-pelotas-pascal-box-1000x1000.jpg?v=1772312313",
  },
  {
    id: "prod-head-x3-pressurizer",
    slug: "head-x3-ball-pressurizer",
    sourceUrl: "https://padelproshop.com/en/products/pressurizer-head-x3-pump",
    sourceName: "PadelPROShop HEAD X3 PUMP",
    imageUrl:
      "https://padelproshop.com/cdn/shop/files/34098-tm_large_default.webp?v=1760950046",
  },
  {
    id: "prod-bullpadel-custom-weight",
    slug: "bullpadel-protector-custom-weight",
    sourceUrl:
      "https://www.padelmq.com/en-nl/products/bullpadel-protector-custom-weight-4-stuks",
    sourceName: "PadeLMQ Bullpadel Protector Custom Weight",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0881/5132/7069/files/protector-bullpadel-custom-weight-4x3gr.1.jpg?v=1745740026",
  },
];

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  return buf;
}

async function resolveShopifyImage(handleHint) {
  // When our guessed CDN URL 404s, fetch product.json for the real image.
  const url = `https://www.padelmq.com/products/${handleHint}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const j = await res.json();
  return j?.product?.image?.src || j?.product?.images?.[0]?.src || null;
}

async function main() {
  const rows = [];
  const mediaEntries = [];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const d of DRAFTS) {
    const outPath = path.join(OUT_DIR, `${d.slug}-hero.jpg`);
    const row = {
      id: d.id,
      slug: d.slug,
      sourceUrl: d.sourceUrl,
      status: "BLOCKED",
    };
    try {
      if (d.skipIfExists && fs.existsSync(outPath)) {
        row.status = "SKIP_EXISTS";
        rows.push(row);
        continue;
      }
      let imageUrl = d.imageUrl;
      let buf;
      try {
        buf = await download(imageUrl);
      } catch (e) {
        const handle = d.sourceUrl.split("/products/")[1]?.split("?")[0];
        if (handle) {
          const alt = await resolveShopifyImage(handle);
          if (!alt) throw e;
          imageUrl = alt;
          buf = await download(imageUrl);
          row.resolvedFromJson = true;
        } else throw e;
      }
      const jpeg = await sharp(buf)
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
      assertUniqueHeroBytes(jpeg, d.id);
      fs.writeFileSync(outPath, jpeg);
      rememberHeroFile(outPath);
      const rel = `/images/padel/products/${d.slug}-hero.jpg`;
      row.status = "OK";
      row.src = rel;
      row.bytes = jpeg.length;
      row.imageUrl = imageUrl;
      mediaEntries.push({
        id: d.id,
        src: rel,
        sourceUrl: d.sourceUrl,
        source: d.sourceName,
      });
    } catch (e) {
      row.status = d.optional ? "OPTIONAL_FAIL" : "BLOCKED";
      row.error = String(e?.message || e);
    }
    rows.push(row);
    console.log(row.status, d.id, row.error || row.src || "");
  }

  fs.writeFileSync(
    REPORT,
    JSON.stringify({ generatedAt: new Date().toISOString(), rows, mediaEntries }, null, 2),
  );
  console.log("\nWrote", REPORT);
  console.log(
    "OK",
    rows.filter((r) => r.status === "OK").length,
    "/",
    rows.length,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
