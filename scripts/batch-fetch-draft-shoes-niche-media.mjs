/**
 * Fetch authentic heroes for remaining draft shoes + easy niche racket/string gaps.
 * node scripts/batch-fetch-draft-shoes-niche-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const REPORT = path.join(ROOT, "data/staging/draft-shoes-niche-fetch.json");
const REGISTRY = path.join(ROOT, "src/content/catalog-product-media.ts");

const tw = (code) =>
  `https://img.tennis-warehouse.com/watermark/rs.php?path=${code}&nw=1000`;

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   dir: string,
 *   remotes: string[],
 *   sourceUrl: string,
 *   source: string,
 *   licence?: "manufacturer-marketing" | "retailer-authorized",
 *   categorySlug: string,
 * }} ProductSpec
 */

/** @type {ProductSpec[]} */
const PRODUCTS = [
  // —— Tennis strings (TW CDN, gauge-matched) ——
  {
    id: "prod-babolat-rpm-blast",
    slug: "babolat-rpm-blast-1-25",
    dir: "tennis/products",
    remotes: [tw("BRPMB17-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Babolat_RPM_Blast_17_125_String/descpage-BRPMB17.html",
    source: "Tennis Warehouse CDN (Babolat RPM Blast 17/1.25)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },
  {
    id: "prod-tecnifibre-black-code",
    slug: "tecnifibre-black-code-1-28",
    dir: "tennis/products",
    remotes: [tw("TBC16-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Tecnifibre_Black_Code_16_128_String/descpage-TBC16.html",
    source: "Tennis Warehouse CDN (Tecnifibre Black Code 16/1.28)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },
  {
    id: "prod-luxilon-alu-power",
    slug: "luxilon-alu-power",
    dir: "tennis/products",
    remotes: [tw("ALUSTR-BL-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Luxilon_ALU_Power_16L_125_String/descpage-ALUSTR.html",
    source: "Tennis Warehouse CDN (Luxilon ALU Power 16L/1.25)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },
  {
    id: "prod-wilson-nxt",
    slug: "wilson-nxt",
    dir: "tennis/products",
    remotes: [tw("NXT16-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/Wilson_NXT_16_130_String/descpage-NXT16.html",
    source: "Tennis Warehouse CDN (Wilson NXT 16/1.30)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },
  {
    id: "prod-tecnifibre-x-one-biphase",
    slug: "tecnifibre-x-one-biphase",
    dir: "tennis/products",
    remotes: [tw("X117-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Tecnifibre_X-One_Biphase_17_124_String/descpage-X117.html",
    source: "Tennis Warehouse CDN (Tecnifibre X-One Biphase 17/1.24)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },
  {
    id: "prod-solinco-hyper-g",
    slug: "solinco-hyper-g",
    dir: "tennis/products",
    remotes: [tw("SHG16LG-GN-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Solinco_Hyper-G_16L_125_String/descpage-SHG16LG.html",
    source: "Tennis Warehouse CDN (Solinco Hyper-G 16L/1.25)",
    licence: "retailer-authorized",
    categorySlug: "tennis-strings",
  },

  // —— Pickleball (manufacturer Shopify CDNs) ——
  {
    id: "prod-joola-ben-johns-hyperion-cfs",
    slug: "joola-ben-johns-hyperion-cfs-16",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0685/6943/2278/files/Ben-Johns-Hyperion-CFS-16-18502-Web-01.png",
    ],
    sourceUrl: "https://www.joola.com/products/ben-johns-hyperion-cfs-16mm-pickleball-paddle",
    source: "JOOLA manufacturer Shopify CDN (Hyperion CFS 16)",
    licence: "manufacturer-marketing",
    categorySlug: "pickleball-paddles",
  },
  {
    id: "prod-joola-perseus-16",
    slug: "joola-perseus-16",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0685/6943/2278/files/JOOLA_WBG_2025_ProIV_Perseus-Perseus16mm-01.jpg",
    ],
    sourceUrl: "https://www.joola.com/products/joola-perseus-iv-16mm-pickleball-paddle-1",
    source: "JOOLA manufacturer Shopify CDN (Perseus Pro IV 16mm)",
    licence: "manufacturer-marketing",
    categorySlug: "pickleball-paddles",
  },
  {
    id: "prod-selkirk-ampsed-epic",
    slug: "selkirk-ampsed-epic",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0152/5763/2822/files/Selkirk-AMPED-Control-Pickleball-Paddle-Epic-LT-blue.png",
    ],
    sourceUrl: "https://www.selkirk.com/products/amped-control-epic",
    source: "Selkirk manufacturer Shopify CDN (AMPED Control Epic)",
    licence: "manufacturer-marketing",
    categorySlug: "pickleball-paddles",
  },

  // —— Badminton (Badminton Warehouse Shopify + Yonex manufacturer) ——
  {
    id: "prod-yonex-astrox-88d-pro",
    slug: "yonex-astrox-88d-pro",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1238/5608/files/3ax88d-p_076-1_02.webp",
    ],
    sourceUrl:
      "https://www.badmintonwarehouse.com/collections/yonex-astrox-badminton-rackets",
    source: "Badminton Warehouse authorized Shopify CDN (Astrox 88D Pro 3rd Gen)",
    licence: "retailer-authorized",
    categorySlug: "badminton-rackets",
  },
  {
    id: "prod-yonex-nanoflare-800-pro",
    slug: "yonex-nanoflare-800-pro",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1238/5608/files/Nanoflare_800_Pro_Badminton_Racket_Frame_New.jpg",
    ],
    sourceUrl:
      "https://www.badmintonwarehouse.com/collections/yonex-nanoflare-badminton-rackets",
    source: "Badminton Warehouse authorized Shopify CDN (Nanoflare 800 Pro)",
    licence: "retailer-authorized",
    categorySlug: "badminton-rackets",
  },
  {
    id: "prod-yonex-astrox-99-pro",
    slug: "yonex-astrox-99-pro",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1238/5608/files/astrox_99Pro_2.webp",
    ],
    sourceUrl:
      "https://www.badmintonwarehouse.com/collections/yonex-astrox-badminton-rackets",
    source: "Badminton Warehouse authorized Shopify CDN (Astrox 99 Pro 3rd Gen)",
    licence: "retailer-authorized",
    categorySlug: "badminton-rackets",
  },
  {
    id: "prod-yonex-arcsaber-11-pro",
    slug: "yonex-arcsaber-11-pro",
    dir: "tennis/products",
    remotes: [
      "https://www.yonex.com/media/catalog/product/a/r/arc11-p.png",
      "https://cdn.shopify.com/s/files/1/1238/5608/products/arcsaber_11_pro_badminton_racket_frame.jpg",
    ],
    sourceUrl: "https://www.yonex.com/badminton/racquets/arcsaber/arc11-p",
    source: "Yonex manufacturer catalog (ArcSaber 11 Pro)",
    licence: "manufacturer-marketing",
    categorySlug: "badminton-rackets",
  },
  {
    id: "prod-victor-thruster-k-falcon",
    slug: "victor-thruster-k-falcon",
    dir: "tennis/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1238/5608/products/Thruster_F_Enhanced_Edition_Badminton_Racket_Frame.jpg",
    ],
    sourceUrl: "https://www.badmintonwarehouse.com/collections/victor-badminton-rackets",
    source: "Badminton Warehouse authorized Shopify CDN (Victor TK-F Falcon)",
    licence: "retailer-authorized",
    categorySlug: "badminton-rackets",
  },
];

/** Pre-skipped: no verified manufacturer/authorized packshot in this pass */
const PRE_SKIPPED = [
  {
    id: "prod-starvie-absolute-padel",
    slug: "starvie-absolute-padel",
    categorySlug: "padel-shoes",
    reason:
      "SKU unverified in catalog notes (StarVie partners with ASICS); no manufacturer/authorized packshot found",
  },
  {
    id: "prod-kuikma-ps-560-women",
    slug: "kuikma-ps-560-women",
    categorySlug: "padel-shoes",
    reason: "Decathlon CDN blocked (403/CF challenge); no alternate authorized packshot",
  },
  {
    id: "prod-adidas-solecourt-boost-padel",
    slug: "adidas-solecourt-boost-padel",
    categorySlug: "padel-shoes",
    reason:
      "Discontinued Solecourt Boost; Adidas/TW PDPs 403/404; no verified padel-specific packshot",
  },
  {
    id: "prod-head-revolt-court",
    slug: "head-revolt-court-padel",
    categorySlug: "padel-shoes",
    reason:
      "HEAD Revolt Court not on TW padel/tennis catalogs (Revolt Pro/Evo 5.0 only); HEAD.com 429",
  },
  {
    id: "prod-nike-zoom-gp-turbo-2",
    slug: "nike-zoom-gp-turbo-hc-2",
    categorySlug: "tennis-shoes",
    reason:
      "GP Turbo HC 2 discontinued on TW (current line is GP Challenge); Nike PDP 404; no verified CDN still serving this SKU",
  },
  {
    id: "prod-wilson-kaos-rapide-30",
    slug: "wilson-kaos-rapide-3-0",
    categorySlug: "tennis-shoes",
    reason: "Not in current TW Wilson shoe catalog; Wilson.com 403",
  },
  {
    id: "prod-nb-lav-v2",
    slug: "new-balance-fresh-foam-x-lav-v2",
    categorySlug: "tennis-shoes",
    reason:
      "Lav v2 not stocked on TW (NB CT Rally 2 under /MSNEWLAV/); nb.scene7 and NB.com 403",
  },
  {
    id: "prod-draft-example",
    slug: "example-unpublished-trainer",
    categorySlug: "running-shoes",
    reason: "Placeholder draft product (Example Unpublished Trainer) — skip",
  },
  {
    id: "prod-selkirk-vanguard-power-air",
    slug: "selkirk-vanguard-power-air",
    categorySlug: "pickleball-paddles",
    reason:
      "Vanguard Power Air Invikta not on Selkirk catalog (only Vanguard Power Air S2 / Amped Pro Air Invikta)",
  },
  {
    id: "prod-head-extreme-pro-pickleball",
    slug: "head-extreme-pro-pickleball",
    categorySlug: "pickleball-paddles",
    reason: "HEAD.com rate-limited (429); no verified alternate CDN in this pass",
  },
  {
    id: "prod-wilson-blade-elite-pickleball",
    slug: "wilson-blade-elite-v2-pickleball",
    categorySlug: "pickleball-paddles",
    reason: "Wilson.com 403; no verified alternate CDN in this pass",
  },
  {
    id: "prod-li-ning-aeronaut-9000",
    slug: "li-ning-aeronaut-9000-c",
    categorySlug: "badminton-rackets",
    reason: "Not found on Badminton Warehouse Li-Ning collection / search",
  },
  {
    id: "prod-tecnifibre-carboflex-125",
    slug: "tecnifibre-carboflex-125-x-top",
    categorySlug: "squash-rackets",
    reason: "Squash Warehouse unreachable from this environment",
  },
  {
    id: "prod-dunlop-sonic-core-revelation",
    slug: "dunlop-sonic-core-revelation-pro",
    categorySlug: "squash-rackets",
    reason: "Squash Warehouse unreachable from this environment",
  },
  {
    id: "prod-head-extreme-120-squash",
    slug: "head-extreme-120-squash",
    categorySlug: "squash-rackets",
    reason: "Squash Warehouse unreachable from this environment",
  },
  {
    id: "prod-wilson-blade-black-squash",
    slug: "wilson-blade-black-squash",
    categorySlug: "squash-rackets",
    reason: "Squash Warehouse unreachable from this environment",
  },
  {
    id: "prod-dunlop-cx-200-squash",
    slug: "dunlop-cx-tour-squash",
    categorySlug: "squash-rackets",
    reason: "Squash Warehouse unreachable from this environment",
  },
];

function download(url) {
  const dest = path.join(
    ROOT,
    "data/staging/draft-shoes-niche-tmp",
    `dl-${Buffer.from(url).toString("base64url").slice(0, 40)}.bin`,
  );
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync(
    "curl",
    ["-fsSL", "-A", UA, "--max-time", "45", "-o", dest, url],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  const buf = fs.readFileSync(dest);
  if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  // Yonex Magento placeholder (~1.6KB) already filtered by size
  return buf;
}

async function writeHero(buf, destJpg) {
  fs.mkdirSync(path.dirname(destJpg), { recursive: true });
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(destJpg, out);
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
  const fetched = [];
  const skipped = [...PRE_SKIPPED];

  for (const p of PRODUCTS) {
    const dest = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.jpg`);
    let ok = false;
    let lastErr = null;
    let usedRemote = null;
    let dims = null;
    for (const remote of p.remotes) {
      try {
        const buf = download(remote);
        dims = await writeHero(buf, dest);
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
        categorySlug: p.categorySlug,
        src: `/images/${p.dir}/${p.slug}-hero.jpg`,
        sourceUrl: p.sourceUrl,
        source: p.source,
        licence: p.licence || "manufacturer-marketing",
        remote: usedRemote,
        width: dims.width,
        height: dims.height,
        bytes: dims.bytes,
      });
    } else {
      skipped.push({
        id: p.id,
        slug: p.slug,
        categorySlug: p.categorySlug,
        reason: lastErr || "download failed",
      });
    }
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
    fetched: fetched.map(
      ({ productId, slug, categorySlug, src, sourceUrl, source, licence, remote, bytes }) => ({
        productId,
        slug,
        categorySlug,
        src,
        sourceUrl,
        source,
        licence,
        remote,
        bytes,
      }),
    ),
    skipped,
    counts: {
      ok: fetched.length,
      fail: skipped.length,
      attemptedDownloads: PRODUCTS.length,
      shoeTargets: 8,
      shoeOk: fetched.filter((f) =>
        ["padel-shoes", "tennis-shoes", "running-shoes"].includes(f.categorySlug),
      ).length,
      shoeFail: skipped.filter((s) =>
        ["padel-shoes", "tennis-shoes", "running-shoes"].includes(s.categorySlug),
      ).length,
      nicheOk: fetched.filter(
        (f) =>
          !["padel-shoes", "tennis-shoes", "running-shoes"].includes(f.categorySlug),
      ).length,
    },
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(`\nOK ${report.counts.ok} / FAIL ${report.counts.fail} → ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
