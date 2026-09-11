/**
 * Batch-fetch hydration / vest / belt heroes from manufacturer & authorized CDNs.
 * node scripts/batch-fetch-hydration-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** @type {{ id: string, slug: string, dir: string, remotes: string[], sourceUrl: string, source: string }[]} */
const PRODUCTS = [
  {
    id: "prod-salomon-adv-skin-5",
    slug: "salomon-adv-skin-5",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=SAD5-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.runningwarehouse.com/Salomon_Adv_Skin_5_Set_Pack/descpage-SAD5.html",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-nathan-vaporair-4",
    slug: "nathan-vaporair-4",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NVAP48-BK-1.jpg&nw=1000",
      "https://cdn.shopify.com/s/files/1/0519/4415/8551/files/vaporair-4.jpg",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-nathan-pinnacle-12",
    slug: "nathan-pinnacle-12",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NPIN12-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ud-race-vest-6",
    slug: "ultimate-direction-race-vest-6",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=UDRV6-BK-1.jpg&nw=1000",
      "https://ultimatedirection.com/cdn/shop/files/race-vest-6.jpg",
    ],
    sourceUrl: "https://ultimatedirection.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-camelbak-zephyr-pro",
    slug: "camelbak-zephyr-pro",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CBZP-BK-1.jpg&nw=1000",
      "https://www.camelbak.com/on/demandware.static/-/Sites-camelbak-master-catalog/default/images/large/zephyr-pro.jpg",
    ],
    sourceUrl: "https://www.camelbak.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-camelbak-circuit",
    slug: "camelbak-circuit-run-vest",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CBCRV-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.camelbak.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-camelbak-apex-pro",
    slug: "camelbak-apex-pro",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CBAPX-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.camelbak.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-osprey-duro-lt",
    slug: "osprey-duro-lt",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=OSDLT-BK-1.jpg&nw=1000",
      "https://www.osprey.com/media/catalog/product/d/u/duro_lt.jpg",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-osprey-dyna-lt",
    slug: "osprey-dyna-lt",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=OSDYLT-PK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=OSD15-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-patagonia-slope-runner",
    slug: "patagonia-slope-runner-vest",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=PASR-BK-1.jpg&nw=1000",
      "https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw/slope-runner.jpg",
    ],
    sourceUrl: "https://www.patagonia.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-uswe-pace-8",
    slug: "uswe-pace-8",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=USWP8-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://uswe.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ultraspire-alpha-6",
    slug: "ultraspire-alpha-6",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=USA6-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://ultraspire.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ultraspire-spry-5",
    slug: "ultraspire-spry-5",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=USS5-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://ultraspire.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-compressport-ultrun-s-pack",
    slug: "compressport-ultrun-s-pack",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CSUSP-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-raidlight-responsiv-12",
    slug: "raidlight-responsiv-12",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=RLR12-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.raidlight.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-nnormal-race-vest",
    slug: "nnormal-race-vest",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NNRV-BK-1.jpg&nw=1000",
      "https://www.nnormal.com/cdn/shop/files/race-vest.jpg",
    ],
    sourceUrl: "https://www.nnormal.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-on-ultra-vest-pro",
    slug: "on-ultra-vest-pro",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=ONUVP-BK-1.jpg&nw=1000",
      "https://www.on.com/dw/image/v2/AAKY_PRD/on/demandware.static/-/Sites-on-master-catalog/default/images/product/ultra-vest-pro.jpg",
    ],
    sourceUrl: "https://www.on.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-black-diamond-distance-8",
    slug: "black-diamond-distance-8",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BDD8-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.blackdiamondequipment.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-kiprun-trail-10",
    slug: "kiprun-trail-10",
    dir: "packs/products",
    remotes: [
      "https://contents.mediadecathlon.com/p2150000/k$xxx/kiprun-trail-10.jpg",
    ],
    sourceUrl: "https://www.decathlon.com/",
    source: "Decathlon CDN",
  },
  {
    id: "prod-nathan-peak",
    slug: "nathan-peak-hydration-waist-pack",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NPEAK-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ud-race-belt",
    slug: "ultimate-direction-race-belt",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=UDRB-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://ultimatedirection.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ud-ultra-belt",
    slug: "ultimate-direction-ultra-belt",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=UDUB-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://ultimatedirection.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-naked-running-band",
    slug: "naked-running-band",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NKRB-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://nakedrunningband.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ultraspire-fitted-race-belt",
    slug: "ultraspire-fitted-race-belt-2",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=USFRB-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://ultraspire.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-compressport-free-belt-pro",
    slug: "compressport-free-belt-pro",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CSFBP-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-salomon-pulse-belt",
    slug: "salomon-pulse-belt",
    dir: "packs/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=SPB-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.salomon.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-hydrapak-softflask-speed-500",
    slug: "hydrapak-softflask-speed-500",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/files/softflask-speed-500.jpg",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HPSF500-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-hydrapak-skyflask-speed-500",
    slug: "hydrapak-skyflask-speed-500",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/skyflask-speed-500.jpg",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HPSK500-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hydrapak.com/products/skyflask%e2%84%a2-speed-500ml-1",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-nathan-speeddraw-insulated",
    slug: "nathan-speeddraw-plus-insulated-18oz",
    dir: "hydration/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NSDI-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-camelbak-crux-15",
    slug: "camelbak-crux-15",
    dir: "hydration/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CBCRX15-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.camelbak.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-osprey-hydraulics-15",
    slug: "osprey-hydraulics-lt-15",
    dir: "hydration/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=OSH15-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-hydrapak-shape-shift-15",
    slug: "hydrapak-shape-shift-15",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/shape-shift-1-5L.jpg",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HPSS15-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-hydrapak-softflask-250",
    slug: "hydrapak-softflask-250",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/softflask-250.jpg",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HPSF250-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-hydrapak-tube-kit",
    slug: "hydrapak-tube-kit",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/tube-kit.jpg",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer",
  },
  {
    id: "prod-nathan-exoshot",
    slug: "nathan-exoshot-2",
    dir: "hydration/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=NEXO2-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-hydrapak-softflask-500",
    slug: "hydrapak-softflask-500",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/softflask-500.jpg",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HPSF50-CL-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error(`too small ${buf.length}`);
  // Reject obvious HTML error pages
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const written = await writeWebMaster(buf, dest, { role: "hero" });
  return written.bytes;
}

const results = [];
for (const p of PRODUCTS) {
  let ok = false;
  let used = null;
  let err = null;
  for (const remote of p.remotes) {
    const ext = remote.includes(".png") ? "png" : "jpg";
    const dest = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.${ext}`);
    try {
      const size = await download(remote, dest);
      ok = true;
      used = { remote, dest: `/images/${p.dir}/${p.slug}-hero.${ext}`, size };
      console.log("OK", p.id, size, remote.slice(0, 80));
      break;
    } catch (e) {
      err = String(e.message || e);
      console.log("FAIL", p.id, err, remote.slice(0, 70));
    }
  }
  results.push({
    id: p.id,
    slug: p.slug,
    ok,
    src: used?.dest ?? null,
    sourceUrl: p.sourceUrl,
    source: p.source,
    licence: "retailer-authorized",
    error: ok ? null : err,
  });
}

const outJson = path.join(ROOT, "data/staging/hydration-media-batch.json");
fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
console.log(`\nDone ${results.filter((r) => r.ok).length}/${results.length} → ${outJson}`);
