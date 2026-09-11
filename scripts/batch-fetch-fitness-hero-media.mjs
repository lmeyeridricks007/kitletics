/**
 * Fetch authentic fitness product heroes from manufacturer / authorized-retailer CDNs.
 * node scripts/batch-fetch-fitness-hero-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  assertUniqueHeroBytes,
  preferManufacturerRemotes,
  rememberHeroFile,
  sha256Hex,
} from "./lib/hero-download.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const OUT_DIR = path.join(ROOT, "public/images/fitness/products");
const REPORT = path.join(ROOT, "data/staging/fitness-hero-fetch-report.json");
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");

/** Placeholder / logo hashes to reject (Mirafit CDN returns brand logo for missing paths). */
const REJECT_SHA256_PREFIXES = new Set([
  "8f34363fff41", // Mirafit logo placeholder (~50KB)
]);

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   remotes: string[],
 *   sourceUrl: string,
 *   source: string,
 *   licence?: "manufacturer-marketing" | "retailer-authorized",
 * }} ProductSpec
 */

/** @type {ProductSpec[]} */
const PRODUCTS = [
  // —— Concept2 (6) ——
  {
    id: "prod-concept2-rowerg",
    slug: "concept2-rowerg",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2024-02/RowERG_Standard_FlyFrontAngle_Gator_1920px.png?itok=vdsr5YUv",
    ],
    sourceUrl: "https://www.concept2.com/ergs/rowerg",
    source: "Concept2 CMS (RowErg Standard packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-concept2-bikeerg",
    slug: "concept2-bikeerg",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2024-02/BIKE_ERG_BLACK_F3Q_1_1920px.png?itok=NcPMMxn1",
    ],
    sourceUrl: "https://www.concept2.com/ergs/bikeerg",
    source: "Concept2 CMS (BikeErg packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-concept2-skierg",
    slug: "concept2-skierg",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2026-04/SkiErg-Front.png?itok=45qOoT4Y",
    ],
    sourceUrl: "https://www.concept2.com/ergs/skierg",
    source: "Concept2 CMS (SkiErg front packshot)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-concept2-skierg-stand",
    slug: "concept2-skierg-floor-stand",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2024-04/2372-skierg-floor-stand.jpg?itok=LKrmILRx",
    ],
    sourceUrl: "https://www.concept2.com/ergs/skierg",
    source: "Concept2 CMS (SkiErg Floor Stand)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-concept2-skierg-pm5-bundle",
    slug: "concept2-skierg-with-stand",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2026-04/SkiErg-W-Stand-Front.png?itok=WFpl3uLi",
    ],
    sourceUrl: "https://www.concept2.com/ergs/skierg",
    source: "Concept2 CMS (SkiErg + Floor Stand)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-concept2-rowerg-dynamic",
    slug: "concept2-rowerg-dynamic",
    remotes: [
      "https://cms.concept2.com/sites/default/files/styles/max_2048/public/2024-02/Dynamic%20Three-Quarter%20Shot.png?itok=hSCxODk0",
    ],
    sourceUrl: "https://www.concept2.com/ergs/dynamic-rowerg",
    source: "Concept2 CMS (Dynamic RowErg packshot)",
    licence: "manufacturer-marketing",
  },

  // —— Rogue (~11 verified) ——
  {
    id: "prod-rogue-ohio",
    slug: "rogue-ohio-bar",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Weightlifting%20Bars%20and%20Plates/Barbells/Mens%2020KG%20Barbells/RA0539-BLBR/2023%20Update/RA2889-BLBR-H_NEW_tzv9q0.png",
    ],
    sourceUrl: "https://www.roguefitness.com/the-ohio-bar-black-zinc",
    source: "Rogue Fitness CDN (Ohio Bar)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-ohio-power",
    slug: "rogue-ohio-power-bar",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Weightlifting%20Bars%20and%20Plates/Barbells/Mens%2020KG%20Barbells/RA0586-BLBR/2024%20Update/RA2895-BLBR-H_ua63b3.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-ohio-power-bar",
    source: "Rogue Fitness CDN (Ohio Power Bar)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-echo-bike",
    slug: "rogue-echo-bike",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Conditioning/Endurance%20/Bikes/ECHOBIKE/ECHOBIKE-H_t5871p.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-echo-bike",
    source: "Rogue Fitness CDN (Echo Bike)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-dog-sled",
    slug: "rogue-dog-sled",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Strength%20Equipment/Strength%20Training/Sleds/ECHODOGSLED/ECHODOGSLED-H_ocmz7v.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-echo-dog-sled",
    source: "Rogue Fitness CDN (Echo Dog Sled)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-sandbag",
    slug: "rogue-sandbag",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Strongman/Sandbags%20and%20Stone%20Molds/Strongman%20Sandbags/RA1160/RA1160-H_V1_ypsmf5.jpg",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-strongman-sandbags",
    source: "Rogue Fitness CDN (Strongman Sandbags)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-wall-ball",
    slug: "rogue-wall-ball",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Conditioning/Strength%20Equipment/Medicine%20Balls/ROGUEMB/ROGUEMB-h_c6n9tu.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-medicine-balls",
    source: "Rogue Fitness CDN (Medicine / Wall Ball)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-kettlebell",
    slug: "rogue-kettlebell",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Conditioning/Strength%20Equipment/Kettlebells/IP0670/IP0670-H_j6gkfw.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-kettlebells",
    source: "Rogue Fitness CDN (Ductile Iron Kettlebell)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-wrist-wraps",
    slug: "rogue-wrist-wraps",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Straps%20Wraps%20and%20Support%20/Straps%20and%20Wraps/Wrist%20Wraps/PS000W/PS0015-H_ckrksu.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-wrist-wraps",
    source: "Rogue Fitness CDN (Wrist Wraps)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-storage",
    slug: "rogue-plate-tree",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Weightlifting%20Bars%20and%20Plates/Storage/Plate%20Storage/RF0644/RF0644-H_depvyi.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-vertical-plate-tree-2-0",
    source: "Rogue Fitness CDN (Vertical Plate Tree 2.0)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rogue-weighted-vest",
    slug: "rogue-plate-carrier-vest",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Bodyweight%20and%20Gymnastics/Bodyweight%20/Weighted%20Vests/PLATE-CARRIER/PLATE-CARRIER-H_ndcko4.png",
    ],
    sourceUrl: "https://www.roguefitness.com/rogue-plate-carrier",
    source: "Rogue Fitness CDN (Plate Carrier)",
    licence: "manufacturer-marketing",
  },

  // —— Eleiko (4) ——
  {
    id: "prod-eleiko-performance",
    slug: "eleiko-performance-weightlifting-bar",
    remotes: ["https://media.eleiko.com/images/upload/4x5/3070100_10.jpg"],
    sourceUrl:
      "https://eleiko.com/en/equipment/bars/hybridbars/3085911-eleiko-performance-bar-20-kg",
    source: "Eleiko media CDN (Performance Weightlifting Bar 20 kg, art. 3070100)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-eleiko-xf",
    slug: "eleiko-xf-bar",
    remotes: ["https://media.eleiko.com/images/upload/4x5/3085116_10.jpg"],
    sourceUrl: "https://media.eleiko.com/admin/download-product-sheet.aspx?articlecode=3085116&language=en-us&view=true",
    source: "Eleiko media CDN (XF Bar 20 kg, art. 3085116)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-eleiko-kb",
    slug: "eleiko-kettlebell",
    remotes: ["https://media.eleiko.com/images/upload/4x5/3085433_10.jpg"],
    sourceUrl: "https://media.eleiko.com/admin/download-product-sheet.aspx?articlecode=3085433&language=en-us&view=true",
    source: "Eleiko media CDN (Competition Kettlebell representative, art. 3085433)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-eleiko-collars",
    slug: "eleiko-sport-collars",
    remotes: ["https://media.eleiko.com/images/upload/4x5/3000241_10.jpg"],
    sourceUrl: "https://media.eleiko.com/admin/download-product-sheet.aspx?articlecode=3000241&language=en&view=true",
    source: "Eleiko media CDN (IWF Training Collars / Sport training collars, art. 3000241)",
    licence: "manufacturer-marketing",
  },

  // —— Mirafit (verified CDN paths only — missing paths return logo placeholder) ——
  {
    id: "prod-mirafit-air-bike",
    slug: "mirafit-air-bike",
    remotes: [
      "https://imagely.mirafit.co.uk/media/catalog/product/M/i/Mirafit-Air-Bike_1.jpg",
    ],
    sourceUrl: "https://mirafit.co.uk/mirafit-air-bike.html",
    source: "Mirafit imagely CDN (Air Bike packshot)",
    licence: "manufacturer-marketing",
  },

  // —— Assault Fitness (authorized CA Shopify + manufacturer Astro) ——
  {
    id: "prod-assault-classic",
    slug: "assaultbike-classic",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0552/2096/1473/products/AssaultBikeClassicAngledshot.png?v=1628794823",
      "https://www.assaultfitness.com/_astro/assault_bike_classic_1_2x_374e588b-597b-4525-926f-5c93e3c1c615.Dt52bxOo_Z1iY2ax.webp",
    ],
    sourceUrl: "https://www.assaultfitness.com/bikes/assault-bike-classic/",
    source: "Assault Fitness authorized retailer CDN (CA) / manufacturer site",
    licence: "retailer-authorized",
  },
  {
    id: "prod-assault-elite",
    slug: "assaultbike-elite",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0552/2096/1473/products/AssaultBikeEliteAngled2Shot.png?v=1628794823",
      "https://www.assaultfitness.com/_astro/assault_bike_elite_1_2x_c1793ed3-8c1c-434b-b3e4-ab3ba6083e69.DnMT-69O_Z8iz3W.webp",
    ],
    sourceUrl: "https://www.assaultfitness.com/bikes/assault-bike-elite/",
    source: "Assault Fitness authorized retailer CDN (CA) / manufacturer site",
    licence: "retailer-authorized",
  },
  {
    id: "prod-assault-runner",
    slug: "assaultrunner-pro",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0552/2096/1473/products/AssaultRunnerProAngledShot.png?v=1628794823",
      "https://www.assaultfitness.com/_astro/assault_runner_pro_1_2x_61e19690-ea36-4fe3-94af-e7ed669f8d6d.DPCL6yUh_ZI6zIc.webp",
    ],
    sourceUrl: "https://www.assaultfitness.com/treadmills/assault-runner-pro/",
    source: "Assault Fitness authorized retailer CDN (CA) / manufacturer site",
    licence: "retailer-authorized",
  },
  {
    id: "prod-assault-runner-elite",
    slug: "assaultrunner-elite",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0552/2096/1473/products/AssaultRunnerEliteAngledLeftSideShot.png?v=1628794823",
      "https://www.assaultfitness.com/_astro/assault_runner_elite_1_2x_dcc5e8f9-57d6-4798-aee9-d46d76a53f8b.BWYdCKr0_X6yFx.webp",
    ],
    sourceUrl: "https://www.assaultfitness.com/treadmills/assault-runner-elite/",
    source: "Assault Fitness authorized retailer CDN (CA) / manufacturer site",
    licence: "retailer-authorized",
  },

  // —— REP Fitness ——
  {
    id: "prod-rep-kettlebell",
    slug: "rep-fitness-kettlebell",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0574/1215/7598/t/16/assets/acf.Shopify-KB-3002-16-1120.jpg?v=1657830906",
      "http://repfitness.com/cdn/shop/products/Shopify-KB-3002-16-Thumbnail.jpg?v=1736200777",
    ],
    sourceUrl: "https://repfitness.com/products/kettlebells-kg",
    source: "REP Fitness Shopify CDN (Kettlebell)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rep-slam-ball",
    slug: "rep-slam-ball",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0574/1215/7598/t/16/assets/acf.SB-3000-Main2.png?v=1636052798",
      "http://repfitness.com/cdn/shop/products/Shopify-SB-3000-Thumbnail.jpg?v=1638281308",
    ],
    sourceUrl: "https://repfitness.com/products/slam-balls",
    source: "REP Fitness Shopify CDN (Slam Ball)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rep-colorado",
    slug: "rep-colorado-bar",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0574/1215/7598/products/ColoradoBar-20KG-HardChrome-thumbnail.jpg?v=1685637768",
    ],
    sourceUrl: "https://repfitness.com/products/colorado-bar-20kg",
    source: "REP Fitness Shopify CDN (Colorado Bar 20kg)",
    licence: "manufacturer-marketing",
  },

  // —— PULLUP & DIP ——
  {
    id: "prod-pullup-dip-doorway",
    slug: "pullup-and-dip-doorway-bar",
    remotes: [
      "https://www.pullup-dip.com/cdn/shop/files/doorway-pullup-bar-new-1.jpg?v=1769607488",
    ],
    sourceUrl: "https://www.pullup-dip.com/products/doorway-pull-up-bar",
    source: "PULLUP & DIP Shopify CDN",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-pullup-dip-wall",
    slug: "pullup-and-dip-wall-bar",
    remotes: [
      "https://www.pullup-dip.com/cdn/shop/files/wall-pullup-bar-mat-1.jpg?v=1769607890",
    ],
    sourceUrl: "https://www.pullup-dip.com/products/wall-mounted-pull-up-bar",
    source: "PULLUP & DIP Shopify CDN",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-pullup-dip-parallettes",
    slug: "pullup-and-dip-parallettes",
    remotes: [
      "https://www.pullup-dip.com/cdn/shop/files/fitness-parallettes-1.jpg",
      "https://www.pullup-dip.com/cdn/shop/products/fitness-parallettes.jpg",
    ],
    sourceUrl: "https://www.pullup-dip.com/products/fitness-parallettes",
    source: "PULLUP & DIP Shopify CDN (Fitness Parallettes)",
    licence: "manufacturer-marketing",
  },

  // —— Sole / Woodway ——
  {
    id: "prod-sole-f80",
    slug: "sole-f80-treadmill",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0768/0950/3023/files/SOLE-F80-20260318-15943_a6350b09-2c23-4191-bc95-18e2e82e950f.png?v=1782144249",
    ],
    sourceUrl: "https://www.soletreadmills.com/products/sole-f80-treadmill",
    source: "SOLE Fitness Shopify CDN (F80)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-woodway-curve",
    slug: "woodway-curve-trainer",
    remotes: [
      "https://www.woodway.com/wp-content/uploads/2024/02/curve-trainer-thumbnail@2x.png",
    ],
    sourceUrl: "https://www.woodway.com/treadmills/curve-trainer/",
    source: "Woodway manufacturer media (Curve Trainer)",
    licence: "manufacturer-marketing",
  },
];

/** Products we intentionally skip (no verified SKU packshot). */
const PRE_SKIPPED = [
  { slug: "rogue-echo-kettlebell", reason: "Echo Kettlebell product page not found on Rogue CDN (likely discontinued)" },
  { slug: "rogue-monster-lite-pull-up-bar", reason: "Monster Lite pull-up bar SKU page 404 / not verified" },
  { slug: "rogue-flogging-horse-stall-mat-note", reason: "Horse stall mats discontinued / no verified Rogue packshot" },
  { slug: "mirafit-battle-rope", reason: "Mirafit site bot-blocked; CDN path for battle rope not verified (placeholder logo returned)" },
  { slug: "mirafit-cast-iron-kettlebell", reason: "Mirafit CDN path not verified (placeholder logo for guessed filenames)" },
  { slug: "mirafit-folding-rower", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-folding-treadmill", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-gym-mats", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-magnetic-rower", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-olympic-barbell", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-wall-pull-up-bar", reason: "Mirafit CDN path not verified" },
  { slug: "mirafit-weighted-vest", reason: "Mirafit CDN path not verified" },
  { slug: "blackroll-ball", reason: "BLACKROLL product page URL not resolved" },
  { slug: "blackroll-duoball", reason: "BLACKROLL product page URL not resolved" },
  { slug: "blackroll-med", reason: "BLACKROLL product page URL not resolved" },
  { slug: "blackroll-standard", reason: "BLACKROLL product page URL not resolved" },
  { slug: "gornation-gymnastic-rings", reason: "GORNATION product page URL not resolved" },
  { slug: "gornation-parallettes-pro", reason: "GORNATION product page URL not resolved" },
  { slug: "gornation-premium-pull-up-bar", reason: "GORNATION product page URL not resolved" },
  { slug: "gravity-fitness-gymnastic-rings", reason: "Gravity Fitness product page URL not resolved" },
  { slug: "gravity-fitness-parallettes", reason: "Gravity Fitness product page URL not resolved" },
  { slug: "gravity-fitness-pull-up-station", reason: "Gravity Fitness product page URL not resolved" },
  { slug: "gravity-fitness-weighted-vest", reason: "Gravity Fitness product page URL not resolved" },
  { slug: "rep-bumper-plate-storage", reason: "REP plate storage product URL not verified" },
  { slug: "horizon-t202-treadmill", reason: "Horizon T202 product page URL not resolved" },
  { slug: "hydrow-wave", reason: "Hydrow rate-limited / page not fetched" },
  { slug: "schwinn-airdyne-ad8", reason: "Schwinn AD8 product page URL not resolved" },
  { slug: "waterrower-a1", reason: "WaterRower site blocked (403)" },
  { slug: "xebex-ski-erg", reason: "Xebex Ski Erg product page URL not resolved" },
  { slug: "skierg2-wall-mount", reason: "Xebex SkiErg2 Wall product page URL not resolved" },
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
  const prefix = sha256Hex(buf).slice(0, 12);
  if (REJECT_SHA256_PREFIXES.has(prefix)) throw new Error(`rejected placeholder hash ${prefix}`);
  return buf;
}

async function writeHero(buf, destJpg, { productId, src } = {}) {
  if (productId) {
    assertUniqueHeroBytes(buf, {
      excludeSrc: src,
      label: productId,
    });
  }
  fs.mkdirSync(path.dirname(destJpg), { recursive: true });
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  // Collision check on final JPEG too (resize can theoretically match another)
  if (productId) {
    assertUniqueHeroBytes(out, { excludeSrc: src, label: `${productId}-jpeg` });
  }
  fs.writeFileSync(destJpg, out);
  rememberHeroFile(destJpg);
  const meta = await sharp(out).metadata();
  return { bytes: out.length, width: meta.width || 1000, height: meta.height || 1000 };
}

function registryBlock(entry) {
  return `  "${entry.productId}": {
    productId: "${entry.productId}",
    src: "${entry.src}",
    sourceUrl: "${entry.sourceUrl}",
    source: "${entry.source}",
    licence: "${entry.licence}",
    attribution: "© Brand — official / authorized product photography",
    width: ${entry.width},
    height: ${entry.height},
  },`;
}

function upsertRegistry(entries) {
  let src = fs.readFileSync(REGISTRY, "utf8");
  for (const entry of entries) {
    const re = new RegExp(`  "${entry.productId}": \\{[\\s\\S]*?\\},\\n`);
    const block = registryBlock(entry) + "\n";
    if (re.test(src)) {
      src = src.replace(re, block);
    } else {
      const idx = src.lastIndexOf("\n};");
      if (idx === -1) throw new Error("Cannot find CATALOG_PRODUCT_MEDIA end");
      src = src.slice(0, idx) + "\n" + block + src.slice(idx);
    }
  }
  fs.writeFileSync(REGISTRY, src);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fetched = [];
  const skipped = [...PRE_SKIPPED];

  // Also skip any list products not in PRODUCTS and not already in PRE_SKIPPED
  const list = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/staging/fitness-reviews-to-publish.json"), "utf8"),
  );
  const covered = new Set([
    ...PRODUCTS.map((p) => p.slug),
    ...PRE_SKIPPED.map((s) => s.slug),
  ]);

  for (const p of PRODUCTS) {
    const dest = path.join(OUT_DIR, `${p.slug}-hero.jpg`);
    const src = `/images/fitness/products/${p.slug}-hero.jpg`;
    let ok = false;
    let lastErr = null;
    let usedRemote = null;
    let dims = null;
    for (const remote of preferManufacturerRemotes(p.remotes)) {
      try {
        const buf = await download(remote);
        dims = await writeHero(buf, dest, { productId: p.id, src });
        ok = true;
        usedRemote = remote;
        console.log("OK", p.id, dims.bytes, remote.slice(0, 90));
        break;
      } catch (e) {
        lastErr = String(e.message || e);
        console.log("FAIL", p.id, lastErr, remote.slice(0, 70));
      }
    }
    if (ok && dims) {
      fetched.push({
        productId: p.id,
        slug: p.slug,
        src: `/images/fitness/products/${p.slug}-hero.jpg`,
        sourceUrl: p.sourceUrl,
        source: p.source,
        licence: p.licence || "manufacturer-marketing",
        remote: usedRemote,
        width: 1000,
        height: 1000,
        bytes: dims.bytes,
      });
    } else {
      skipped.push({ slug: p.slug, reason: lastErr || "download failed" });
    }
  }

  for (const item of list) {
    if (!covered.has(item.productSlug)) {
      skipped.push({
        slug: item.productSlug,
        reason: "No verified manufacturer/retailer packshot found in this pass",
      });
    }
  }

  // Dedupe skipped by slug
  const seen = new Set();
  const skippedUnique = [];
  for (const s of skipped) {
    if (seen.has(s.slug)) continue;
    seen.add(s.slug);
    skippedUnique.push(s);
  }

  upsertRegistry(
    fetched.map((f) => ({
      productId: f.productId,
      src: f.src,
      sourceUrl: f.sourceUrl,
      source: f.source,
      licence: f.licence,
      width: 1000,
      height: 1000,
    })),
  );

  const report = {
    fetched: fetched.map(({ productId, slug, src, sourceUrl, source, licence, remote, bytes }) => ({
      productId,
      slug,
      src,
      sourceUrl,
      source,
      licence,
      remote,
      bytes,
    })),
    skipped: skippedUnique,
    counts: { fetched: fetched.length, skipped: skippedUnique.length, totalList: list.length },
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(`\nFetched ${fetched.length} / skipped ${skippedUnique.length} → ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
