/**
 * Fetch remaining fitness hero images (15 gaps).
 * node scripts/batch-fetch-fitness-hero-media-remaining.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OUT_DIR = path.join(ROOT, "public/images/fitness/products");
const REPORT = path.join(ROOT, "data/staging/fitness-hero-fetch-remaining.json");
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");
const PLACEHOLDER_MD5 = "a6c7399b9ac99d1409b51df6f6b3aca3";
const MIRAIFT_LOGO_MD5 = "13b7da6cc8a284d94e501412c46683c0";

const PRODUCTS = [
  {
    id: "prod-hydrow-wave",
    slug: "hydrow-wave",
    remotes: [
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/dd07541a-15db-4b6f-ab1e-c0c32cccab94.jpg",
    ],
    sourceUrl: "https://www.bestbuy.com/site/hydrow-wave-rowing-machine-black/6508018.p?skuId=6508018",
    source: "Best Buy authorized retailer CDN (Hydrow Wave Black packshot)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-mirafit-battle-rope",
    slug: "mirafit-battle-rope",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/l/e/le-Rope-on-White-Background463853_1.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-38mm-black-orange-battle-rope-9-12-15m.html",
    source: "Mirafit imagely CDN (38mm black/orange battle rope packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-kb",
    slug: "mirafit-cast-iron-kettlebell",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-Cast-Iron-24kg-Kettlebell.jpg",
      "https://m.media-amazon.com/images/I/81ViEuOtj5L._AC_SL1500_.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-cast-iron-kettlebell-choice-of-weight.html",
    source: "Mirafit imagely CDN (Cast Iron 24kg kettlebell packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-folding-rower",
    slug: "mirafit-folding-rower",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/S/t/Storing-Mirafit-Rowing-Machine-Upright.jpg",
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-Rowing-Machine.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-rowing-machine.html",
    source: "Mirafit imagely CDN (Rowing Machine upright/storage angle — folding use case)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-rower",
    slug: "mirafit-magnetic-rower",
    remotes: [
      // Catalog name is legacy magnetic; Mirafit's current rower is air-resistance.
      // Distinct angle from folding-rower to avoid shared-hero hash collision.
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-Rowing-Machine.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-rowing-machine.html",
    source: "Mirafit imagely CDN (current Mirafit Rowing Machine packshot; magnetic SKU discontinued)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-flooring",
    slug: "mirafit-gym-mats",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-Interlocking-Floor-Mats-Set-of-4.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-interlocking-floor-mats.html",
    source: "Mirafit imagely CDN (Interlocking Floor Mats set of 4)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-olympic-bar",
    slug: "mirafit-olympic-barbell",
    remotes: [
      // Budget multi-length bar CDN returns logo placeholder; M2 20kg is current Mirafit Olympic bar line.
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-M2-20kg-Olympic-Barbell.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/weights-and-bars.html",
    source: "Mirafit imagely CDN (M2 20kg Olympic Barbell — current Olympic bar line)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-treadmill",
    slug: "mirafit-folding-treadmill",
    remotes: [],
    sourceUrl: "https://mirafit.co.uk/",
    source: "Mirafit folding treadmill",
    licence: "manufacturer-marketing",
    skipReason:
      "No verified Mirafit folding-treadmill packshot; imagely/mirafit media return logo placeholders; BH Nyman is wrong brand",
  },
  {
    id: "prod-mirafit-pullup",
    slug: "mirafit-wall-pull-up-bar",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/B/l/Black-M3-Mirafit-Wall-Mounted-Pull-Up-Bar-Front.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-wall-mounted-pull-up-bar.html",
    source: "Mirafit imagely CDN (M3 wall-mounted pull-up bar front packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-mirafit-vest",
    slug: "mirafit-weighted-vest",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/2/0/20Kg-Mirafit-Weighted-Vest_1.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-adjustable-weighted-vest.html",
    source: "Mirafit imagely CDN (20kg adjustable weighted vest packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-echo-kb",
    slug: "rogue-echo-kettlebell",
    remotes: [
      // Echo competition-window kettlebell discontinued; Competition KB is the current
      // Rogue competition-style kettlebell with uniform window sizing.
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Conditioning/Strength%20Equipment/Kettlebells/IP0631/IP0631-H_if6pi3.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-competition-kettlebells",
    source: "Rogue Fitness CDN (Competition Kettlebell — current competition-window line replacing discontinued Echo KB)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-flooring",
    slug: "rogue-flogging-horse-stall-mat-note",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Gear%20and%20Accessories/Gym%20Essentials%20/Flooring%20and%20Rubber/HM0001/HM0001-web1_sacppd.png",
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Gear%20and%20Accessories/Gym%20Essentials%20/Flooring%20and%20Rubber/HM0001/HM0001-THe_yznzcp.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-gym-mat-25-piece-bundle-black",
    source: "Rogue Fitness CDN (Gym Mats / stall-mat style flooring)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-pullup-bar",
    slug: "rogue-monster-lite-pull-up-bar",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Rigs%20and%20Racks/Rig%20and%20Rack%20Accessories/Monster%20Lite%20Accessories/MLSOCKET/MLSOCKET-Black-Smooth-H_f8mqsr.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-monster-lite-socket-pull-up-bar",
    source: "Rogue Fitness CDN (Monster Lite Socket Pull-Up Bar)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-schwinn-airdyne-ad8",
    slug: "schwinn-airdyne-ad8",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0740/3503/6249/files/Schwinn_Airdyne_AD8_2000x2000_4712f52b-a1b0-4b4e-9dad-524073b5bc52.png?v=1784744341",
      "https://cdn.shopify.com/s/files/1/0309/2656/9603/files/fitness_warehouse_schwinn_ad8_bike.jpg?v=1685683650",
    ],
    sourceUrl: "https://global.schwinnfitness.com/products/schwinn-airdyne-ad8",
    source: "Schwinn Global Shopify CDN (Airdyne AD8 packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-waterrower-a1",
    slug: "waterrower-a1",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0639/3508/6851/products/Waterrower-A1-Home-1.jpg?v=1650186756",
    ],
    sourceUrl: "https://www.elitefitness.com.au/products/waterrower-a1-home",
    source: "Elite Fitness authorized retailer Shopify CDN (WaterRower A1 Home)",
    licence: "retailer-authorized",
  },
];

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
  const md5 = createHash("md5").update(buf).digest("hex");
  if (md5 === PLACEHOLDER_MD5 || md5 === MIRAIFT_LOGO_MD5) throw new Error("mirafit logo/placeholder");
  return buf;
}

async function writeHero(buf, destJpg) {
  fs.mkdirSync(path.dirname(destJpg), { recursive: true });
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(destJpg, out);
  return out.length;
}

function registryBlock(entry) {
  return `  "${entry.productId}": {
    productId: "${entry.productId}",
    src: "${entry.src}",
    sourceUrl: "${entry.sourceUrl}",
    source: "${entry.source}",
    licence: "${entry.licence}",
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  },`;
}

function upsertRegistry(entries) {
  let src = fs.readFileSync(REGISTRY, "utf8");
  for (const entry of entries) {
    const re = new RegExp(`  "${entry.productId}": \\{[\\s\\S]*?\\},\\n`);
    const block = registryBlock(entry) + "\n";
    if (re.test(src)) src = src.replace(re, block);
    else {
      const idx = src.lastIndexOf("\n};");
      if (idx < 0) throw new Error("Could not find CATALOG_PRODUCT_MEDIA closing };");
      src = src.slice(0, idx) + "\n" + block + src.slice(idx);
    }
  }
  fs.writeFileSync(REGISTRY, src);
}

async function resolveExtraRemotes() {
  // no-op: remotes are curated + verified above
}

async function main() {
  await resolveExtraRemotes();

  const fetched = [];
  const skipped = [];

  for (const p of PRODUCTS) {
    const dest = path.join(OUT_DIR, `${p.slug}-hero.jpg`);
    if (!p.remotes.length) {
      skipped.push({
        slug: p.slug,
        productId: p.id,
        reason: p.skipReason || "No verified authentic manufacturer/retailer packshot URL found",
      });
      console.log("SKIP", p.slug, p.skipReason || "no remotes");
      continue;
    }
    let ok = false;
    let lastErr = null;
    let used = null;
    for (const remote of p.remotes) {
      try {
        const buf = await download(remote);
        const bytes = await writeHero(buf, dest);
        ok = true;
        used = remote;
        console.log("OK", p.id, bytes, remote.slice(0, 100));
        break;
      } catch (e) {
        lastErr = String(e.message || e);
        console.log("FAIL", p.id, lastErr, remote.slice(0, 80));
      }
    }
    if (ok) {
      fetched.push({
        productId: p.id,
        slug: p.slug,
        src: `/images/fitness/products/${p.slug}-hero.jpg`,
        sourceUrl: p.sourceUrl,
        source: p.source,
        licence: p.licence,
        remote: used,
      });
    } else {
      skipped.push({ slug: p.slug, productId: p.id, reason: lastErr || "download failed" });
    }
  }

  upsertRegistry(
    fetched.map((f) => ({
      productId: f.productId,
      src: f.src,
      sourceUrl: f.sourceUrl,
      source: f.source,
      licence: f.licence,
    })),
  );

  const report = {
    fetched,
    skipped,
    counts: { fetched: fetched.length, skipped: skipped.length, total: PRODUCTS.length },
    generatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(`\nFetched ${fetched.length}, skipped ${skipped.length}. Report: ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
