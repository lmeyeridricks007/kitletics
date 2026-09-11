#!/usr/bin/env node
/**
 * Fetch authentic heroes for hydration Draft(20) media-gated SKUs.
 * Prefer Running Warehouse / manufacturer / authorized retailer CDNs.
 * node scripts/fetch-hydration-draft-media.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const rw = (code) =>
  `https://img.runningwarehouse.com/watermark/rs.php?path=${code}&nw=1000`;

/** Draft(20) targets only */
const PRODUCTS = [
  {
    id: "prod-naked-running-band",
    slug: "naked-running-band",
    dir: "packs/products",
    remotes: [rw("NKBND3-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/Naked_Running_Band_V2/descpage-NKBND3.html",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-ud-ultra-belt",
    slug: "ultimate-direction-ultra-belt",
    dir: "packs/products",
    remotes: [rw("UDULTB6-BK-1.jpg")],
    sourceUrl:
      "https://www.runningwarehouse.com/Ultimate_Direction_Ultra_Belt/descpage-UDULTB6.html",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-nathan-speeddraw-insulated",
    slug: "nathan-speeddraw-plus-insulated-18oz",
    dir: "hydration/products",
    remotes: [rw("NSDI212-BK-1.jpg"), rw("NSD2121-BL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  {
    id: "prod-hydrapak-softflask-500",
    slug: "hydrapak-softflask-500",
    dir: "hydration/products",
    remotes: [rw("HPSFS50-BL-1.jpg"), rw("HPSFS5-BL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  // Remaining: discover via page scrape at runtime
];

const DISCOVER = [
  {
    id: "prod-osprey-duro-lt",
    slug: "osprey-duro-lt",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/osprey-duro-lt/",
      "https://www.sportsshoes.com/product/osprey/duro-lt-hydration-vest/",
      "https://www.basecampgear.co.uk/duro-lt-vest-pack-with-flasks/",
      "https://www.rei.com/product/235148/osprey-duro-lt-hydration-vest-mens",
    ],
    sourceUrl: "https://www.osprey.com/duro-lt-w-flasks",
    source: "Authorized retailer CDN",
    mustInclude: [/duro.?lt/i, /osprey/i],
  },
  {
    id: "prod-osprey-dyna-lt",
    slug: "osprey-dyna-lt",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/osprey-dyna-lt/",
      "https://www.sportsshoes.com/product/osprey/dyna-lt-hydration-vest/",
      "https://www.rei.com/product/235149/osprey-dyna-lt-hydration-vest-womens",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/dyna.?lt/i, /osprey/i],
  },
  {
    id: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/osprey-duro-15/",
      "https://www.sportsshoes.com/product/osprey/duro-15/",
      "https://www.rei.com/search?q=osprey%20duro%2015",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/duro.?15/i, /osprey/i],
  },
  {
    id: "prod-on-ultra-vest-pro",
    slug: "on-ultra-vest-pro",
    dir: "packs/products",
    pages: [
      "https://www.on.com/en-us/products/ultra-vest-pro-u-2uf3013/unisex",
      "https://www.sportsshoes.com/product/on/ultra-vest-pro/",
      "https://www.bergfreunde.eu/on-ultra-vest-pro/",
    ],
    sourceUrl: "https://www.on.com/en-us/products/ultra-vest-pro-u-2uf3013/unisex",
    source: "Manufacturer / authorized retailer",
    mustInclude: [/ultra.?vest/i, /\bon\b/i],
  },
  {
    id: "prod-patagonia-slope-runner",
    slug: "patagonia-slope-runner-vest",
    dir: "packs/products",
    pages: [
      "https://www.patagonia.com/product/slope-runner-exploration-vest/49050.html",
      "https://www.rei.com/search?q=patagonia%20slope%20runner%20vest",
      "https://www.bergfreunde.eu/patagonia-slope-runner-vest/",
    ],
    sourceUrl: "https://www.patagonia.com/",
    source: "Manufacturer / authorized retailer",
    mustInclude: [/slope.?runner/i, /patagonia/i],
  },
  {
    id: "prod-camelbak-zephyr-pro",
    slug: "camelbak-zephyr-pro",
    dir: "packs/products",
    pages: [
      "https://www.camelbak.com/zephyr-pro",
      "https://www.bergfreunde.eu/camelbak-zephyr-pro/",
      "https://www.rei.com/search?q=camelbak%20zephyr%20pro",
    ],
    sourceUrl: "https://www.camelbak.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/zephyr/i, /camelbak/i],
  },
  {
    id: "prod-nathan-peak",
    slug: "nathan-peak-hydration-waist-pack",
    dir: "packs/products",
    pages: [
      "https://www.nathansports.com/products/peak",
      "https://www.bergfreunde.eu/nathan-peak/",
      "https://www.sportsshoes.com/search/?q=nathan+peak",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/peak/i, /nathan/i],
  },
  {
    id: "prod-nathan-exoshot",
    slug: "nathan-exoshot-2",
    dir: "hydration/products",
    pages: [
      "https://www.nathansports.com/products/exoshot-2",
      "https://www.bergfreunde.eu/nathan-exoshot/",
      "https://www.sportsshoes.com/search/?q=nathan+exoshot",
    ],
    sourceUrl: "https://www.nathansports.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/exoshot/i, /nathan/i],
  },
  {
    id: "prod-black-diamond-distance-8",
    slug: "black-diamond-distance-8",
    dir: "packs/products",
    pages: [
      "https://www.blackdiamondequipment.com/en_US/product/distance-8-pack/",
      "https://www.bergfreunde.eu/black-diamond-distance-8/",
      "https://www.rei.com/search?q=black%20diamond%20distance%208",
    ],
    sourceUrl: "https://www.blackdiamondequipment.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/distance.?8/i, /black.?diamond/i],
  },
  {
    id: "prod-compressport-ultrun-s-pack",
    slug: "compressport-ultrun-s-pack",
    dir: "packs/products",
    pages: [
      "https://www.compressport.com/eu/ultrun-s-pack.html",
      "https://www.bergfreunde.eu/compressport-ultrun-s-pack/",
      "https://www.sportsshoes.com/search/?q=compressport+ultrun",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/ultrun/i, /compressport/i],
  },
  {
    id: "prod-raidlight-responsiv-12",
    slug: "raidlight-responsiv-12",
    dir: "packs/products",
    pages: [
      "https://www.raidlight.com/en/responsiv-12l.html",
      "https://www.bergfreunde.eu/raidlight-responsiv-12/",
      "https://www.sportsshoes.com/search/?q=raidlight+responsiv+12",
    ],
    sourceUrl: "https://www.raidlight.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/responsiv/i, /raidlight/i],
  },
  {
    id: "prod-kiprun-trail-10",
    slug: "kiprun-trail-10",
    dir: "packs/products",
    pages: [
      "https://www.decathlon.nl/p/kiprun-trail-10/_/R-p-X",
      "https://www.decathlon.com/search?Ntt=kiprun%20trail%2010",
      "https://www.decathlon.nl/search?Ntt=kiprun%20trail%2010",
    ],
    sourceUrl: "https://www.decathlon.com/",
    source: "Decathlon CDN",
    mustInclude: [/kiprun/i, /trail.?10/i],
  },
  {
    id: "prod-compressport-free-belt-pro",
    slug: "compressport-free-belt-pro",
    dir: "packs/products",
    pages: [
      "https://www.compressport.com/eu/free-belt-pro.html",
      "https://www.bergfreunde.eu/compressport-free-belt-pro/",
      "https://www.sportsshoes.com/search/?q=compressport+free+belt+pro",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/free.?belt/i, /compressport/i],
  },
  {
    id: "prod-osprey-hydraulics-15",
    slug: "osprey-hydraulics-lt-15",
    dir: "hydration/products",
    pages: [
      "https://www.bergfreunde.eu/osprey-hydraulics-lt-15l-reservoir/",
      "https://www.osprey.com/hydraulics-lt-15-reservoir",
      "https://www.rei.com/search?q=osprey%20hydraulics%20lt%201.5",
    ],
    sourceUrl: "https://www.osprey.com/",
    source: "Authorized retailer CDN",
    mustInclude: [/hydraulics/i, /osprey|reservoir|1\.?5/i],
  },
  {
    id: "prod-hydrapak-shape-shift-15",
    slug: "hydrapak-shape-shift-15",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/shape-shift-reservoir-1-5l",
      "https://www.bergfreunde.eu/hydrapak-shape-shift-1-5-l/",
      "https://www.rei.com/search?q=hydrapak%20shape%20shift%201.5",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / authorized retailer",
    mustInclude: [/shape.?shift/i, /hydrapak/i],
  },
  {
    id: "prod-hydrapak-tube-kit",
    slug: "hydrapak-tube-kit",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/tube-kit",
      "https://www.bergfreunde.eu/hydrapak-tube-kit/",
      "https://www.rei.com/search?q=hydrapak%20tube%20kit",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / authorized retailer",
    mustInclude: [/tube/i, /hydrapak/i],
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`too small ${buf.length}`);
  const head = buf.slice(0, 200).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) throw new Error("html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function extractImages(html) {
  const urls = new Set();
  for (const m of html.matchAll(/https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)) {
    urls.add(m[0].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(/\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)) {
    urls.add(`https:${m[0]}`.replace(/&amp;/g, "&"));
  }
  // Running Warehouse watermark paths
  for (const m of html.matchAll(/path=([A-Z0-9._-]+\.jpe?g)/gi)) {
    urls.add(rw(m[1]));
  }
  // Bergfreunde / shop CDN relative
  for (const m of html.matchAll(
    /(?:src|data-src|content)="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
  )) {
    let u = m[1];
    if (u.startsWith("//")) u = `https:${u}`;
    else if (u.startsWith("/")) continue;
    if (u.startsWith("http")) urls.add(u.replace(/&amp;/g, "&"));
  }
  return [...urls].filter(
    (u) =>
      !/logo|icon|sprite|favicon|pixel|banner|social|flag|payment|trust/i.test(u) &&
      /product|cdn|scene7|shopify|images|media|static|watermark|demandware|cloudinary|imgix|osprey|patagonia|on-running|decathlon|hydrapak|nathansports|camelbak|bergfreunde|sportsshoes|rei\.com|blackdiamond/i.test(
        u,
      ),
  );
}

async function discoverRemotes(item) {
  const found = [];
  for (const page of item.pages) {
    try {
      const res = await fetch(page, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        console.log("PAGE FAIL", item.id, res.status, page.slice(0, 70));
        continue;
      }
      const html = await res.text();
      const imgs = extractImages(html);
      console.log("PAGE", item.id, res.status, imgs.length, page.slice(0, 70));
      for (const img of imgs.slice(0, 20)) {
        found.push(img);
      }
      // follow first product link on search pages
      if (/search|Ntt=/i.test(page)) {
        const link = [...html.matchAll(/href="(https?:\/\/[^"]+|\/[^"]+)"/g)]
          .map((m) => m[1])
          .find((h) =>
            item.mustInclude.every((re) => re.test(h)) &&
            /product|p\/|\/product\//i.test(h),
          );
        if (link) {
          const abs = link.startsWith("http")
            ? link
            : new URL(link, page).toString();
          console.log("FOLLOW", item.id, abs.slice(0, 90));
          item.pages.push(abs);
        }
      }
    } catch (e) {
      console.log("PAGE ERR", item.id, String(e.message || e).slice(0, 80), page.slice(0, 60));
    }
  }
  return [...new Set(found)];
}

const results = [];

for (const p of PRODUCTS) {
  let ok = false;
  let used = null;
  let err = null;
  for (const remote of p.remotes) {
    const ext = remote.toLowerCase().includes(".png") ? "png" : "jpg";
    const dest = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.${ext}`);
    try {
      const size = await download(remote, dest);
      ok = true;
      used = { remote, dest: `/images/${p.dir}/${p.slug}-hero.${ext}`, size };
      console.log("OK", p.id, size, remote.slice(0, 90));
      break;
    } catch (e) {
      err = String(e.message || e);
      console.log("FAIL", p.id, err, remote.slice(0, 70));
    }
  }
  results.push({
    id: p.id,
    slug: p.slug,
    dir: p.dir,
    ok,
    src: used?.dest ?? null,
    sourceUrl: p.sourceUrl,
    source: p.source,
    licence: "retailer-authorized",
    remote: used?.remote ?? null,
    error: ok ? null : err,
  });
}

for (const p of DISCOVER) {
  const remotes = await discoverRemotes(p);
  let ok = false;
  let used = null;
  let err = remotes.length ? null : "no remotes discovered";
  for (const remote of remotes.slice(0, 15)) {
    const ext = remote.toLowerCase().includes(".png")
      ? "png"
      : remote.toLowerCase().includes(".webp")
        ? "webp"
        : "jpg";
    const dest = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.${ext}`);
    try {
      const size = await download(remote, dest);
      ok = true;
      used = { remote, dest: `/images/${p.dir}/${p.slug}-hero.${ext}`, size };
      console.log("OK", p.id, size, remote.slice(0, 100));
      break;
    } catch (e) {
      err = String(e.message || e);
      console.log("FAIL", p.id, err, remote.slice(0, 80));
    }
  }
  results.push({
    id: p.id,
    slug: p.slug,
    dir: p.dir,
    ok,
    src: used?.dest ?? null,
    sourceUrl: p.sourceUrl,
    source: p.source,
    licence: "retailer-authorized",
    remote: used?.remote ?? null,
    candidates: remotes.slice(0, 10),
    error: ok ? null : err,
  });
}

const outJson = path.join(ROOT, "data/staging/hydration-draft-media-batch.json");
fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
console.log(
  `\nDone ${results.filter((r) => r.ok).length}/${results.length} → ${outJson}`,
);
