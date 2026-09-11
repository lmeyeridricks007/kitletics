/**
 * Batch-download P1 catalog hero images from manufacturer / authorized-retailer CDNs.
 * node scripts/batch-fetch-p1-catalog-media.mjs
 *
 * Writes files under public/images/{vertical}/products/{slug}-hero.{ext}
 * and data/staging/p1-catalog-media-batch.json for registry generation.
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** @type {{ id: string, slug: string, dir: string, remotes: string[], sourceUrl: string, source: string, licence: string }[]} */
const PRODUCTS = [
  // —— 3 missing running shoes ——
  {
    id: "prod-clifton-pro",
    slug: "clifton-pro",
    dir: "running/products",
    remotes: [
      "https://media.nz.hoka.com/cdn-cgi/image/fit=scale-down,f=auto,w=1200/products/a2291e7c-f806-4861-8699-29954969e2d2/d63d8fd6/1176510-bkcs_bkcs_01.jpg",
    ],
    sourceUrl: "https://nz.hoka.com/products/clifton-pro-1176510-bkcs-bkcs",
    source: "Manufacturer official product catalog (HOKA)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-endorphin-pro-3",
    slug: "endorphin-pro-3",
    dir: "running/products",
    remotes: [
      "https://s7d4.scene7.com/is/image/WolverineWorldWide/S10755-40_1?$dw-pdp-primary$",
    ],
    sourceUrl: "https://www.saucony.com/en/endorphin-pro-3/59686W.html",
    source: "Manufacturer official product catalog (Saucony)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-trailfly-ultra-g-300-max",
    slug: "trailfly-ultra-g-300-max",
    dir: "running/products",
    remotes: [
      "https://www.inov8.com/media/catalog/product/cache/5c3f4d0bf04d0cd73f3487a4ca5b7cff/0/0/000977-gnbk-s-01-trailfly-ultra-g-300-max-mens-ultra-running-shoe-green-black-side_1_.jpg",
      "https://keypowersports.sg/cdn/shop/products/000977-GNBK-S-01-trailfly-ultra-g-300-max-mens-ultra-running-shoe-green-black-side.jpg?v=1679302193&width=1200",
    ],
    sourceUrl: "https://www.inov8.com/us/trailfly-ultra-g-300-max-mens-ultra-running-shoes",
    source: "Manufacturer official product catalog (Inov-8)",
    licence: "manufacturer-marketing",
  },

  // —— GPS watches (Garmin CDN) ——
  {
    id: "prod-forerunner-965",
    slug: "garmin-forerunner-965",
    dir: "watches/products",
    remotes: ["https://res.garmin.com/en/products/010-02809-00/g/cf-lg.jpg"],
    sourceUrl: "https://www.garmin.com/en-US/p/886725/pn/010-02809-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-forerunner-970",
    slug: "garmin-forerunner-970",
    dir: "watches/products",
    remotes: ["https://res.garmin.com/en/products/010-02969-00/g/cf-lg.jpg"],
    sourceUrl: "https://www.garmin.com/en-US/p/1462801/pn/010-02969-00/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-forerunner-570",
    slug: "garmin-forerunner-570",
    dir: "watches/products",
    remotes: [
      "https://res.garmin.com/en/products/010-02970-01/g/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02971-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/en-US/p/1463821/pn/010-02970-01/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-forerunner-265",
    slug: "garmin-forerunner-265",
    dir: "watches/products",
    remotes: ["https://res.garmin.com/en/products/010-02810-00/g/cf-lg.jpg"],
    sourceUrl: "https://www.garmin.com/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-forerunner-165",
    slug: "garmin-forerunner-165",
    dir: "watches/products",
    remotes: [
      "https://res.garmin.com/en/products/010-02803-10/g/cf-lg.jpg",
      "https://res.garmin.com/en/products/010-02803-00/g/cf-lg.jpg",
    ],
    sourceUrl: "https://www.garmin.com/",
    source: "Manufacturer official product catalog (Garmin)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-coros-pace-3",
    slug: "coros-pace-3",
    dir: "watches/products",
    remotes: [
      "https://www.furtherfaster.co.nz/cdn/shop/files/Coros-Pace-3-GPS-Sport-Watch-Nylon-Black-NZ-01.jpg?v=1757291379&width=1200",
    ],
    sourceUrl: "https://coros.com/pace3",
    source: "Authorized retailer product photography (Further Faster / COROS)",
    licence: "retailer-authorized",
  },
];

async function fetchBuf(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 8000) return null;
    if (buf.slice(0, 15).toString().toLowerCase().includes("html")) return null;
    const ct = r.headers.get("content-type") || "";
    return { buf, ct, finalUrl: r.url };
  } catch {
    return null;
  }
}

const results = [];
for (const p of PRODUCTS) {
  process.stdout.write(`… ${p.slug} `);
  let hit = null;
  for (const remote of p.remotes) {
    hit = await fetchBuf(remote);
    if (hit) break;
  }
  if (!hit) {
    console.log("FAIL");
    results.push({ ...p, ok: false });
    continue;
  }
  const dest = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.jpg`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const written = await writeWebMaster(hit.buf, dest, { role: "hero" });
  const file = path.basename(written.dest);
  console.log("OK", written.bytes);
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/${p.dir}/${file}`,
    sourceUrl: p.sourceUrl,
    licence: p.licence,
    source: p.source,
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  });
}

const outJson = path.join(ROOT, "data/staging/p1-catalog-media-batch.json");
fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
console.log(
  `\nDone ${results.filter((r) => r.ok).length}/${results.length} → ${outJson}`,
);
