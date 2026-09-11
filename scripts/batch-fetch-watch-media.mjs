/**
 * Batch-download GPS watch hero images (watches-wave2 placeholders)
 * from manufacturer / authorized-retailer CDNs.
 *
 * node scripts/batch-fetch-watch-media.mjs
 *
 * Writes: public/images/watches/products/{slug}-hero.{jpg|png}
 * Staging: data/staging/watch-media-batch.json
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/images/watches/products");
const MIN_BYTES = 10_000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   remotes: string[],
 *   sourceUrl: string,
 *   source: string,
 *   licence: "manufacturer-marketing" | "retailer-authorized",
 * }} WatchMediaProduct
 */

/** @type {WatchMediaProduct[]} */
const PRODUCTS = [
  // —— Garmin (res.garmin.com — prefer /v/cf-lg.jpg on newer SKUs) ——
  {
    id: "prod-fenix-8",
    slug: "garmin-fenix-8",
    remotes: [
      "https://res.garmin.com/en/products/010-02904-00/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02904-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/1228429/pn/010-02904-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-enduro-3",
    slug: "garmin-enduro-3",
    remotes: [
      "https://res.garmin.com/en/products/010-02751-00/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02751-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/851039/pn/010-02751-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-instinct-3",
    slug: "garmin-instinct-3",
    remotes: [
      "https://res.garmin.com/en/products/010-02935-00/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02935-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/1462811/pn/010-02935-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-vivoactive-6",
    slug: "garmin-vivoactive-6",
    remotes: [
      "https://res.garmin.com/en/products/010-02985-00/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02985-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/1555457/pn/010-02985-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-forerunner-265s",
    slug: "garmin-forerunner-265s",
    remotes: [
      "https://res.garmin.com/en/products/010-02810-04/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02810-04/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/886689/pn/010-02810-04/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-garmin-epix-pro-gen2",
    slug: "garmin-epix-pro-gen-2",
    remotes: [
      "https://res.garmin.com/en/products/010-02804-00/v/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02804-00/g/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02805-00/v/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/87582/pn/010-02804-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },

  // —— COROS (Shopify CDN) ——
  {
    id: "prod-coros-apex-4",
    slug: "coros-apex-4",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1672/6075/files/APEX4B1.png?v=1760168885",
    ],
    sourceUrl: "https://coros.com/buy/apex4",
    source: "Manufacturer official product catalog (COROS Shopify CDN)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-coros-pace-4",
    slug: "coros-pace-4",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1672/6075/files/PACE4B2.png?v=1773036292",
      "https://cdn.shopify.com/s/files/1/1672/6075/files/Front_three-quarter_view_of_the_COROSPACE_4_White_watch_with_White_Nylon_Band.png?v=1773043666",
    ],
    sourceUrl: "https://coros.com/buy/pace4",
    source: "Manufacturer official product catalog (COROS Shopify CDN)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-coros-vertix-2s",
    slug: "coros-vertix-2s",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1672/6075/files/VERTIX_2S_Earth_Nylon1.png?v=1750939126",
    ],
    sourceUrl: "https://coros.com/vertix2s",
    source: "Manufacturer official product catalog (COROS Shopify CDN)",
    licence: "manufacturer-marketing",
  },

  // —— Suunto ——
  {
    id: "prod-suunto-vertical-2",
    slug: "suunto-vertical-2",
    remotes: [
      "https://www.suunto.com/globalassets/productimages/suunto-vertical-2/all-black/suunto_vertical_2_all_black_front_1200x1200px.png",
    ],
    sourceUrl: "https://www.suunto.com/Products/sports-watches/suunto-vertical-2/",
    source: "Manufacturer official product catalog (Suunto)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-suunto-run",
    slug: "suunto-run",
    remotes: [
      "https://www.suunto.com/globalassets/productimages/suunto-run/all-black/suunto-run-all-black-front-1200x1200px-2.png",
    ],
    sourceUrl: "https://www.suunto.com/Products/sports-watches/suunto-run/",
    source: "Manufacturer official product catalog (Suunto)",
    licence: "manufacturer-marketing",
  },

  // —— Polar ——
  {
    id: "prod-polar-grit-x2",
    slug: "polar-grit-x2",
    remotes: [
      "https://www.polar.com/img/cms/204ed20baf7de52699d771aa1fd7d55b994e2945-1000x1000-600.png",
      "https://www.polar.com/img/cms/ce1e6802e59273c914f7fc5c821d1e20651aada9-1000x1000-600.png",
    ],
    sourceUrl: "https://www.polar.com/en/grit-x2",
    source: "Polar CMS CDN",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-polar-pacer",
    slug: "polar-pacer",
    remotes: [
      "https://www.polar.com/img/static/pacer/Fall-in-love-with-running-device-l.png",
      "https://www.polar.com/img/cms/57ddd3233147109800d8c866ac870bce75d3d9c1-4000x4000-600.png",
    ],
    sourceUrl: "https://www.polar.com/en/pacer",
    source: "Polar CMS CDN",
    licence: "manufacturer-marketing",
  },

  // —— Apple (store CDN) ——
  {
    id: "prod-apple-watch-ultra-3",
    slug: "apple-watch-ultra-3",
    remotes: [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ultra-case-unselect-gallery-1-202509?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=0",
      "https://www.apple.com/v/apple-watch-ultra-3/a/images/overview/product-viewer/product_landing__d0d4mw4gk282_large.jpg",
    ],
    sourceUrl: "https://www.apple.com/shop/buy-watch/apple-watch-ultra",
    source: "Manufacturer official product catalog (Apple Store CDN)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-apple-watch-series-10",
    slug: "apple-watch-series-10",
    remotes: [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/watch-case-46-aluminum-jetblack-nc-s10?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=0",
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/watch-case-46-aluminum-jetblack-nc-s10_VW_PF?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=0",
    ],
    sourceUrl: "https://www.apple.com/apple-watch-series-10/",
    source: "Manufacturer official product catalog (Apple Store CDN)",
    licence: "manufacturer-marketing",
  },

  // —— Samsung ——
  {
    id: "prod-samsung-galaxy-watch-ultra",
    slug: "samsung-galaxy-watch-ultra",
    remotes: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/sm-l705uza4xaa/gallery/us-galaxy-watch-ultra-2025-l705-556192-sm-l705uza4xaa-553339895?$650_519_PNG$",
      "https://images.samsung.com/is/image/samsung/p6pim/us/sm-l705uza4xaa/gallery/us-galaxy-watch-ultra-2025-l705-556192-sm-l705uza4xaa-553339895",
    ],
    sourceUrl:
      "https://www.samsung.com/us/watches/galaxy-watch-ultra-2025/buy/galaxy-watch-ultra-47mm-titanium-gray-sku-sm-l705uza4xaa/",
    source: "Manufacturer official product catalog (Samsung)",
    licence: "manufacturer-marketing",
  },

  // —— Amazfit ——
  {
    id: "prod-amazfit-t-rex-3-pro",
    slug: "amazfit-t-rex-3-pro",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0461/7057/0902/files/PP-Black_ce4a6104-effd-487c-b07b-f7f6286e470d.png?v=1784019383",
      "https://cdn.shopify.com/s/files/1/0406/4500/1379/files/2_37665803-87bd-41be-8f37-e5ff29eb9441.jpg?v=1787233440",
    ],
    sourceUrl: "https://uk.amazfit.com/products/t-rex-3-pro",
    source: "Manufacturer official product catalog (Amazfit Shopify CDN)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-amazfit-active-2",
    slug: "amazfit-active-2",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0461/7057/0902/files/Active_2-Black-1.png?v=1740552457",
      "https://cdn.shopify.com/s/files/1/0461/7057/0902/files/Active_2-Leather-1.png?v=1740552457",
    ],
    sourceUrl: "https://uk.amazfit.com/products/amazfit-active-2",
    source: "Manufacturer official product catalog (Amazfit Shopify CDN)",
    licence: "manufacturer-marketing",
  },
];

/**
 * @param {string} url
 * @returns {Promise<{ buf: Buffer, ct: string, finalUrl: string } | null>}
 */
async function fetchBuf(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < MIN_BYTES) return null;
    if (buf.slice(0, 15).toString().toLowerCase().includes("html")) return null;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    if (!isJpeg && !isPng) return null;
    const ct = r.headers.get("content-type") || "";
    return { buf, ct, finalUrl: r.url };
  } catch {
    return null;
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
for (const p of PRODUCTS) {
  process.stdout.write(`… ${p.slug} `);
  let hit = null;
  let usedRemote = null;
  for (const remote of p.remotes) {
    hit = await fetchBuf(remote);
    if (hit) {
      usedRemote = remote;
      break;
    }
  }
  if (!hit || !usedRemote) {
    console.log("FAIL");
    results.push({
      id: p.id,
      slug: p.slug,
      ok: false,
      remotesTried: p.remotes,
      sourceUrl: p.sourceUrl,
    });
    continue;
  }
  const dest = path.join(OUT_DIR, `${p.slug}-hero.jpg`);
  const written = await writeWebMaster(hit.buf, dest, { role: "hero" });
  const file = path.basename(written.dest);
  console.log("OK", written.bytes, "jpg");
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/watches/products/${file}`,
    bytes: hit.buf.length,
    remoteUrl: usedRemote,
    sourceUrl: p.sourceUrl,
    licence: p.licence,
    source: p.source,
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  });
}

const outJson = path.join(ROOT, "data/staging/watch-media-batch.json");
fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(results, null, 2));

const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
console.log(`\nDone ${ok.length}/${results.length} → ${outJson}`);
if (fail.length) {
  console.log("Failures:", fail.map((f) => f.slug).join(", "));
}
