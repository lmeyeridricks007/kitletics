/**
 * Supplemental fitness hero fetch (BLACKROLL, Horizon, Gravity, Xebex).
 * node scripts/batch-fetch-fitness-hero-media-pass2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OUT_DIR = path.join(ROOT, "public/images/fitness/products");
const REPORT = path.join(ROOT, "data/staging/fitness-hero-fetch-report.json");
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");

const PRODUCTS = [
  {
    id: "prod-blackroll-standard",
    slug: "blackroll-standard",
    remotes: [
      "https://cldn.cdn-blackroll.com/image/upload/f_auto,q_85,g_center,c_fill,w_2228/oneworld-prod/assets/product-images/blackroll-standard/default/4114353_blackroll-standard-angle-1.png?v=1780951319",
    ],
    sourceUrl: "https://blackroll.com/eu/en/products/blackroll-standard",
    source: "BLACKROLL CDN (STANDARD foam roller)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-blackroll-med",
    slug: "blackroll-med",
    remotes: [
      "https://cldn.cdn-blackroll.com/image/upload/f_auto,q_85,g_center,c_fill,w_2228/oneworld-prod/assets/product-images/blackroll-med/default/4116935_blackroll-med-angle-1.png?v=1780951308",
    ],
    sourceUrl: "https://blackroll.com/eu/en/products/blackroll-med",
    source: "BLACKROLL CDN (MED foam roller)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-blackroll-ball",
    slug: "blackroll-ball",
    remotes: [
      "https://cldn.cdn-blackroll.com/image/upload/f_auto,q_85,g_center,c_fill,w_2228/oneworld-prod/assets/product-images/blackroll-ball-08/default/4117196_blackroll-ball-08-angle-1.png?v=1780951313",
    ],
    sourceUrl: "https://blackroll.com/eu/en/products/blackroll-ball-08",
    source: "BLACKROLL CDN (BALL 08)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-blackroll-duoball",
    slug: "blackroll-duoball",
    remotes: [
      "https://cldn.cdn-blackroll.com/image/upload/f_auto,q_85,g_center,c_fill,w_2228/oneworld-prod/assets/product-images/blackroll-duoball-12/default/4117317_blackroll-duoball-12-angle-1.png?v=1780951297",
    ],
    sourceUrl: "https://blackroll.com/eu/en/products/blackroll-duoball-12",
    source: "BLACKROLL CDN (DUOBALL 12)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-horizon-t202",
    slug: "horizon-t202-treadmill",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0930/5558/2483/files/T202_Hero_grey.jpg?v=1761179193",
    ],
    sourceUrl: "https://www.horizonfitness.com/products/t202-treadmill",
    source: "Horizon Fitness Shopify CDN (T202)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-gravity-rings",
    slug: "gravity-fitness-gymnastic-rings",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0276/0635/1961/files/GymnasticRings.webp?v=1786539912",
    ],
    sourceUrl: "https://gravity.fitness/products/gravity-fitness-wooden-gymnastic-rings",
    source: "Gravity Fitness Shopify CDN (Wooden Gymnastic Rings)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-gravity-parallettes",
    slug: "gravity-fitness-parallettes",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0276/0635/1961/files/001-GravityFintess-MediumProHybridParallettes_a5595d0a-81b3-4bab-a7d5-1e4e0f0e0e0e.webp",
      "https://cdn.shopify.com/s/files/1/0276/0635/1961/files/001-GravityFintess-MediumProHybridParallettes.webp",
    ],
    sourceUrl: "https://gravity.fitness/products/gravity-fitness-medium-pro-parallettes-3-0-38mm-bars",
    source: "Gravity Fitness Shopify CDN (Medium Pro Parallettes)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-gravity-pullup-station",
    slug: "gravity-fitness-pull-up-station",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0276/0635/1961/files/PortablePullUpRack.webp?v=1786539915",
    ],
    sourceUrl: "https://gravity.fitness/products/gravity-fitness-portable-bodyweight-pull-up-rack",
    source: "Gravity Fitness Shopify CDN (Portable Pull-Up Rack / station)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-gravity-weighted-vest",
    slug: "gravity-fitness-weighted-vest",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0276/0635/1961/files/WeightVest.webp?v=1786539909",
    ],
    sourceUrl: "https://gravity.fitness/products/gravity-fitness-20kg-weighted-vest",
    source: "Gravity Fitness Shopify CDN (Weighted Vest)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-xebex-skierg",
    slug: "xebex-ski-erg",
    remotes: [
      "https://xebexfitness.com/wp-content/uploads/aski_01-1.jpg",
    ],
    sourceUrl: "https://xebexfitness.com/product/aski-bundle/",
    source: "Xebex Fitness media (Ski Trainer / ASKI)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-skierg2-wall",
    slug: "skierg2-wall-mount",
    remotes: [
      "https://xebexfitness.com/wp-content/uploads/aski-wm_brackets.jpg",
      "https://xebexfitness.com/wp-content/uploads/APSKI-200-BA_FS-3-2.jpg",
    ],
    sourceUrl: "https://xebexfitness.com/product/xebex-fitness-ski-trainer-wall-mount-brackets/",
    source: "Xebex Fitness media (Ski Trainer wall mount)",
    licence: "manufacturer-marketing",
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
      src = src.slice(0, idx) + "\n" + block + src.slice(idx);
    }
  }
  fs.writeFileSync(REGISTRY, src);
}

async function main() {
  // Fix Gravity parallettes URL via live JSON
  try {
    const res = await fetch("https://gravity.fitness/products.json?limit=250", {
      headers: { "User-Agent": UA },
    });
    const data = await res.json();
    const p = data.products.find((x) => x.handle.includes("medium-pro-parallettes"));
    if (p?.images?.[0]?.src) {
      const item = PRODUCTS.find((x) => x.id === "prod-gravity-parallettes");
      item.remotes = [p.images[0].src, ...item.remotes];
      console.log("parallettes URL", p.images[0].src);
    }
  } catch (e) {
    console.log("parallettes resolve fail", e.message);
  }

  const fetched = [];
  const failed = [];
  for (const p of PRODUCTS) {
    const dest = path.join(OUT_DIR, `${p.slug}-hero.jpg`);
    let ok = false;
    let lastErr = null;
    let used = null;
    for (const remote of p.remotes) {
      try {
        const buf = await download(remote);
        const bytes = await writeHero(buf, dest);
        ok = true;
        used = remote;
        console.log("OK", p.id, bytes, remote.slice(0, 90));
        break;
      } catch (e) {
        lastErr = String(e.message || e);
        console.log("FAIL", p.id, lastErr, remote.slice(0, 70));
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
      failed.push({ slug: p.slug, reason: lastErr || "failed" });
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

  const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  const fetchedSlugs = new Set(report.fetched.map((f) => f.slug));
  for (const f of fetched) {
    if (!fetchedSlugs.has(f.slug)) report.fetched.push(f);
  }
  report.skipped = report.skipped.filter((s) => !fetched.some((f) => f.slug === s.slug));
  for (const f of failed) {
    if (!report.skipped.some((s) => s.slug === f.slug)) report.skipped.push(f);
  }
  report.counts = {
    fetched: report.fetched.length,
    skipped: report.skipped.length,
    totalList: 63,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(`\nPass2 fetched ${fetched.length}, failed ${failed.length}. Total fetched ${report.counts.fetched}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
