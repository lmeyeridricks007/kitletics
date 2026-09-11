/**
 * Fetch authentic hero images for remaining draft running-clothing SKUs.
 * node scripts/fetch-clothing-draft-remaining.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OUT_DIR = path.join(ROOT, "public/images/clothing/products");
const REPORT = path.join(ROOT, "data/staging/clothing-media-fetch-remaining.json");
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");
const MIN_BYTES = 5000;

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   remotes: string[],
 *   sourceUrl: string,
 *   source: string,
 *   licence?: "manufacturer-marketing" | "retailer-authorized",
 *   attribution?: string,
 * }} ProductSpec
 */

/** Verified manufacturer / authorized-retailer packshots only. */
/** @type {ProductSpec[]} */
const PRODUCTS = [
  {
    id: "prod-craft-adv-essence-tight-men",
    slug: "craft-adv-essence-tight-men",
    remotes: [
      "https://craftsportswear.centracdn.net/client/dynamic/images/852_a9b183319b-1909606-349000-1-full.jpg",
    ],
    sourceUrl:
      "https://www.craftsportswear.com/global/adv-essence-wind-tights-m-men-blaze-1909606-396000",
    source: "Manufacturer product photography (Craft Sportswear CDN)",
    licence: "manufacturer-marketing",
    attribution: "© Craft — manufacturer product photography",
  },
  {
    id: "prod-odlo-active-warm-eco-men",
    slug: "odlo-active-warm-eco-men",
    remotes: [
      "https://mrsg-live.cdn.scayle.cloud/images/810d166334e06a02312d91b0f95ba2ca.jpeg",
    ],
    sourceUrl: "https://www.odlo.com/us-en/p/active-warm-base-layer-top-159102.html",
    source: "Manufacturer product photography (Odlo / Scayle CDN)",
    licence: "manufacturer-marketing",
    attribution: "© Odlo — manufacturer product photography",
  },
  {
    id: "prod-odlo-active-warm-eco-bottom-men",
    slug: "odlo-active-warm-eco-bottom-men",
    remotes: [
      "https://mrsg-live.cdn.scayle.cloud/images/fcdf5fabc1bb452739f9c0fce36f3f9b.jpeg",
    ],
    sourceUrl:
      "https://www.odlo.com/us-en/p/active-warm-base-layer-bottoms-159122.html",
    source: "Manufacturer product photography (Odlo / Scayle CDN)",
    licence: "manufacturer-marketing",
    attribution: "© Odlo — manufacturer product photography",
  },
  {
    id: "prod-janji-run-tee-men",
    slug: "janji-run-tee-men",
    remotes: [
      "https://janji.com/cdn/shop/files/JANJI-MT19B-TURBO_CHOOK_CARBON-01.jpg?crop=center&height=1200&v=1772044726&width=1200",
      "https://cdn.shopify.com/s/files/1/0536/9705/files/JANJI-MT19B-TURBO_CHOOK_CARBON-01.jpg?v=1772044726",
    ],
    sourceUrl: "https://www.janji.com/products/ms-run-all-day-tee",
    source: "Manufacturer product photography (Janji)",
    licence: "manufacturer-marketing",
    attribution: "© Janji — manufacturer product photography",
  },
  {
    id: "prod-brooks-method-tight-women",
    slug: "brooks-method-tight-women",
    remotes: [
      "https://www.brooksrunning.com/on/demandware.static/-/Sites-brooks-master-catalog/default/dwba0bdf38/original/221524/221524-001-lf-method-crop-womens-running-tight.png",
    ],
    sourceUrl:
      "https://www.brooksrunning.com/en_gb/womens/running-leggings/method-7%2F8-tight/221524.html",
    source: "Manufacturer product photography (Brooks Running)",
    licence: "manufacturer-marketing",
    attribution: "© Brooks Running — manufacturer product photography",
  },
  {
    id: "prod-brooks-notch-thermal-beanie",
    slug: "brooks-notch-thermal-beanie",
    remotes: [
      "https://www.brooksrunning.com/on/demandware.static/-/Sites-brooks-master-catalog/default/dw98b19ec7/original/280540/280540-001-lf-notch-thermal-unisex-beanie-2.png",
      "https://cdn.sportsshoes.com/product/B/BRO3573/BRO3573_1000_1.jpg",
    ],
    sourceUrl:
      "https://www.brooksrunning.com/en_us/featured/accessories/notch-thermal-beanie-2.0/280540.html",
    source: "Manufacturer product photography (Brooks Running)",
    licence: "manufacturer-marketing",
    attribution: "© Brooks Running — manufacturer product photography",
  },
  {
    id: "prod-nike-fast-tight-men",
    slug: "nike-fast-tight-men",
    remotes: [
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/6ca02930-39b1-4254-88cb-adba53a1b0ff/M+NK+DF+FAST+BF+HALF+TIGHT.png",
    ],
    sourceUrl:
      "https://www.nike.com/t/fast-mens-dri-fit-brief-lined-running-1-2-length-tights-TkBgpW/FN3371-010",
    source: "Manufacturer product photography (Nike)",
    licence: "manufacturer-marketing",
    attribution: "© Nike — manufacturer product photography",
  },
  {
    id: "prod-nike-aerobill-cap",
    slug: "nike-aerobill-cap",
    remotes: [
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/1e73c461-d429-4631-bcce-cf9bba2670a1/U+NK+DF+CLUB+CAP+U+AB+FL+P.png",
    ],
    sourceUrl:
      "https://www.nike.com/t/dri-fit-club-unstructured-featherlight-cap-b0cNxd/FB5682-010",
    source: "Manufacturer product photography (Nike Dri-FIT Club Cap)",
    licence: "manufacturer-marketing",
    attribution: "© Nike — manufacturer product photography",
  },
  {
    id: "prod-nike-dri-fit-miler-women",
    slug: "nike-dri-fit-miler-women",
    remotes: [
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/xhhhzy2lmqjydpncnbyg/W+NK+MILER+TANK.png",
    ],
    sourceUrl: "https://www.nike.com/t/miler-womens-running-tank-jJr9Hl/AJ8102-010",
    source: "Manufacturer product photography (Nike Miler)",
    licence: "manufacturer-marketing",
    attribution: "© Nike — manufacturer product photography",
  },
  {
    id: "prod-nike-therma-fit-glove",
    slug: "nike-therma-fit-glove",
    remotes: [
      "https://cdn.sportsshoes.com/product/N/NIK24883/NIK24883_1000_1.jpg",
      "https://static.nike.com/a/images/t_default/ad266bff-d915-499a-9b22-af17beeccd12/NIKE+W+PACER+SPHERE+MW+RG.png",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/products/search?q=nike%20therma-fit%20pacer%20gloves",
    source: "Authorized retailer product photography (SportsShoes)",
    licence: "retailer-authorized",
    attribution: "© SportsShoes — product photography",
  },
  {
    id: "prod-asics-race-short",
    slug: "asics-core-split-short",
    remotes: [
      "https://cdn.sportsshoes.com/product/A/ASI16839/ASI16839_1000_1.jpg",
      "https://images.asics.com/is/image/asics/1011B978_001_SR_RT_GLB?wid=1000&fmt=jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/products/search?q=asics%20core%20split%20short",
    source: "Authorized retailer product photography (SportsShoes)",
    licence: "retailer-authorized",
    attribution: "© SportsShoes — product photography",
  },
  {
    id: "prod-nb-rc-essential-short-men",
    slug: "nb-rc-essential-short-men",
    remotes: [
      "https://cdn.sportsshoes.com/product/N/NEW696856/NEW696856_1000_1.jpg",
      "https://cdn.sportsshoes.com/product/N/NEW696857/NEW696857_1000_1.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/products/search?q=new%20balance%20rc%20essential%205%20inch",
    source: "Authorized retailer product photography (SportsShoes)",
    licence: "retailer-authorized",
    attribution: "© SportsShoes — product photography",
  },
  {
    id: "prod-on-performance-tight-women",
    slug: "on-performance-tight-women",
    remotes: [
      "https://cdn.sportsshoes.com/product/O/ONR829/ONR829_1000_1.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/products/search?q=on%20performance%207%2F8%20tights",
    source: "Authorized retailer product photography (SportsShoes)",
    licence: "retailer-authorized",
    attribution: "© SportsShoes — product photography",
  },
];

/** Explicit fails: no verified authentic packshot for this exact catalog SKU. */
const PRE_FAILED = [
  {
    id: "prod-lululemon-pace-breaker-men",
    slug: "lululemon-pace-breaker-men",
    reason: "lululemon.com / CDN blocked or placeholder; no verified packshot URL",
  },
  {
    id: "prod-lululemon-hotty-hot-women",
    slug: "lululemon-hotty-hot-women",
    reason: "lululemon.com / CDN blocked or placeholder; no verified packshot URL",
  },
  {
    id: "prod-lululemon-fast-and-free-women",
    slug: "lululemon-fast-and-free-women",
    reason: "lululemon.com / CDN blocked or placeholder; no verified packshot URL",
  },
  {
    id: "prod-lululemon-energy-bra",
    slug: "lululemon-energy-bra",
    reason: "lululemon.com / CDN blocked or placeholder; no verified packshot URL",
  },
  {
    id: "prod-lululemon-always-in-motion-men",
    slug: "lululemon-always-in-motion-men",
    reason: "lululemon.com / CDN blocked or placeholder; no verified packshot URL",
  },
  {
    id: "prod-nike-impossibly-light-men",
    slug: "nike-impossibly-light-men",
    reason: "Impossibly Light jacket not found on Nike/SportsShoes; no verified packshot",
  },
  {
    id: "prod-nike-element-ls-men",
    slug: "nike-element-ls-men",
    reason: "Element / Therma LS not found as current Nike running SKU; no verified packshot",
  },
  {
    id: "prod-tnf-flight-series-jacket-men",
    slug: "tnf-flight-series-jacket-men",
    reason: "TNF Flight Series page 403 / not found on SportsShoes; no verified packshot",
  },
  {
    id: "prod-tracksmith-harrier-singlet-men",
    slug: "tracksmith-harrier-singlet-men",
    reason: "Harrier Singlet discontinued (Harrier Tee/LS only); refusing substitute singlet",
  },
  {
    id: "prod-tracksmith-brighton-bra",
    slug: "tracksmith-brighton-bra",
    reason: "Brighton Bra product page not found on Tracksmith; no verified packshot",
  },
  {
    id: "prod-saxx-kinetic-hd-men",
    slug: "saxx-kinetic-hd-men",
    reason: "Kinetic HD discontinued; only Kinetic Light-Compression Mesh available (wrong SKU)",
  },
  {
    id: "prod-brooks-dare-crossback",
    slug: "brooks-dare-crossback",
    reason: "Dare Crossback discontinued; only Scoopback/Racerback found (wrong SKU)",
  },
  {
    id: "prod-brooks-ghost-short-sleeve",
    slug: "brooks-ghost-short-sleeve",
    reason: "Ghost Short Sleeve apparel not found on Brooks/SportsShoes; no verified packshot",
  },
  {
    id: "prod-brooks-lsd-thermal-vest-men",
    slug: "brooks-lsd-thermal-vest-men",
    reason: "LSD Thermal Vest not found on Brooks/SportsShoes; no verified packshot",
  },
  {
    id: "prod-brooks-cascadia-jacket",
    slug: "brooks-cascadia-jacket",
    reason: "Cascadia Jacket not found (Canopy/High Point only); refusing substitute",
  },
  {
    id: "prod-asics-race-singlet-men",
    slug: "asics-race-singlet-men",
    reason: "ASICS Race Singlet not found on manufacturer/retailer CDNs; no verified packshot",
  },
];

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_BYTES) throw new Error(`too small ${buf.length}`);
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
  if (out.length < MIN_BYTES) throw new Error(`output too small ${out.length}`);
  fs.writeFileSync(destJpg, out);
  const meta = await sharp(out).metadata();
  return { bytes: out.length, width: meta.width || 1000, height: meta.height || 1000 };
}

function registryBlock(entry) {
  const attribution = JSON.stringify(
    entry.attribution || "© Brand — official / authorized product photography",
  );
  return `  "${entry.productId}": {
    productId: "${entry.productId}",
    src: "${entry.src}",
    sourceUrl: "${entry.sourceUrl}",
    source: ${JSON.stringify(entry.source)},
    licence: "${entry.licence}",
    attribution: ${attribution},
    width: ${entry.width},
    height: ${entry.height},
  },`;
}

function upsertRegistry(entries) {
  let src = fs.readFileSync(REGISTRY, "utf8");
  let added = 0;
  let updated = 0;
  for (const entry of entries) {
    const re = new RegExp(`  "${entry.productId}": \\{[\\s\\S]*?\\},\\n`);
    const block = registryBlock(entry) + "\n";
    if (re.test(src)) {
      src = src.replace(re, block);
      updated += 1;
    } else {
      const idx = src.lastIndexOf("\n};");
      if (idx === -1) throw new Error("Cannot find CATALOG_PRODUCT_MEDIA end");
      src = src.slice(0, idx) + "\n" + block + src.slice(idx);
      added += 1;
    }
  }
  fs.writeFileSync(REGISTRY, src);
  return { added, updated };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });

  const ok = [];
  const fail = [...PRE_FAILED];

  for (const p of PRODUCTS) {
    const dest = path.join(OUT_DIR, `${p.slug}-hero.jpg`);
    let succeeded = false;
    let lastErr = null;
    let usedRemote = null;
    let dims = null;
    for (const remote of p.remotes) {
      try {
        const buf = await download(remote);
        dims = await writeHero(buf, dest);
        succeeded = true;
        usedRemote = remote;
        console.log("OK", p.id, dims.bytes, remote.slice(0, 90));
        break;
      } catch (e) {
        lastErr = String(e.message || e);
        console.log("FAIL try", p.id, lastErr, remote.slice(0, 70));
      }
    }
    if (succeeded && dims) {
      ok.push({
        id: p.id,
        slug: p.slug,
        ok: true,
        src: `/images/clothing/products/${p.slug}-hero.jpg`,
        sourceUrl: p.sourceUrl,
        source: p.source,
        licence: p.licence || "manufacturer-marketing",
        attribution:
          p.attribution || "© Brand — official / authorized product photography",
        imageUrl: usedRemote,
        width: dims.width,
        height: dims.height,
        bytes: dims.bytes,
      });
    } else {
      fail.push({
        id: p.id,
        slug: p.slug,
        ok: false,
        reason: lastErr || "download failed",
      });
    }
  }

  const { added, updated } = upsertRegistry(
    ok.map((f) => ({
      productId: f.id,
      src: f.src,
      sourceUrl: f.sourceUrl,
      source: f.source,
      licence: f.licence,
      attribution: f.attribution,
      width: f.width,
      height: f.height,
    })),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    okCount: ok.length,
    failCount: fail.length,
    registry: { added, updated },
    ok,
    fail,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(
    `\nDone: ok=${ok.length} fail=${fail.length} registry +${added}/~${updated}`,
  );
  console.log(`Report: ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
