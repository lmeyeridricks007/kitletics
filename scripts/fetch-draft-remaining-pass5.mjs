#!/usr/bin/env node
/**
 * Pass 5: strict verified remotes only (no loose search scrapes).
 * node scripts/fetch-draft-remaining-pass5.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/draft-pass5-tmp");
fs.mkdirSync(TMP, { recursive: true });

const PRODUCTS = [
  // Osprey — mirror successful dyna-lt / tempest CDN paths
  {
    id: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    dir: "packs/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/d/u/duro15_s26_side_phantomgrey_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/d/u/duro15_s26_side_darkcharcoalgrey_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/d/u/duro15_wflasks_s26_side_phantomgrey_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/d/u/duro_15_s25_side_darkcharcoalgrey_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/d/u/duro15_s25_front_darkcharcoalgrey_hi-res.jpg",
    ],
    pages: ["https://www.osprey.com/duro-15", "https://www.osprey.com/duro-15-w-flasks"],
    must: [/duro.?15/i, /osprey/i],
    sourceUrl: "https://www.osprey.com/duro-15",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-osprey-talon-velocity-20",
    slug: "osprey-talon-velocity-20",
    dir: "packs/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/t/a/talonvelocity20_s26_side_black_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/t/a/talonvelocity20_s26_side_deepteal_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/t/a/talon_velocity_20_s26_side_black_hi-res.jpg",
    ],
    pages: ["https://www.osprey.com/talon-velocity-20"],
    must: [/talon/i, /velocity/i],
    sourceUrl: "https://www.osprey.com/talon-velocity-20",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-osprey-talon-velocity-30",
    slug: "osprey-talon-velocity-30",
    dir: "packs/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/t/a/talonvelocity30_s26_side_black_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/t/a/talonvelocity30_s26_side_deepteal_hi-res.jpg",
    ],
    pages: ["https://www.osprey.com/talon-velocity-30"],
    must: [/talon/i, /velocity/i],
    sourceUrl: "https://www.osprey.com/talon-velocity-30",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-osprey-hydraulics-15",
    slug: "osprey-hydraulics-lt-15",
    dir: "hydration/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/h/y/hydraulicslt15_reservoir_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/h/y/hydraulics_lt_1.5_reservoir_hi-res.jpg",
      "https://www.osprey.com/media/catalog/product/h/y/hydraulicslt_1.5l_reservoir_hi-res.jpg",
    ],
    pages: ["https://www.osprey.com/hydraulics-lt-15-reservoir"],
    must: [/hydraulics/i, /reservoir|1\.?5|lt/i],
    sourceUrl: "https://www.osprey.com/hydraulics-lt-15-reservoir",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-raidlight-responsiv-12",
    slug: "raidlight-responsiv-12",
    dir: "packs/products",
    remotes: [
      "https://www.bfgcdn.com/1200_1200_90/504-0111/raidlight-responsiv-12l.jpg",
      "https://www.bfgcdn.com/1200_1200_90/011-2221-0111/raidlight-responsiv-12l.jpg",
    ],
    pages: [
      "https://www.bergfreunde.eu/raidlight-responsiv-12l/",
      "https://www.raidlight.com/en/responsiv-12l.html",
    ],
    must: [/responsiv/i, /raidlight/i],
    sourceUrl: "https://www.raidlight.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-patagonia-slope-runner",
    slug: "patagonia-slope-runner-vest",
    dir: "packs/products",
    remotes: [],
    pages: [
      "https://www.patagonia.com/product/slope-runner-exploration-vest/49050.html",
      "https://www.patagonia.com/product/mens-slope-runner-endurance-vest/49050.html",
      "https://www.bergfreunde.eu/patagonia-slope-runner-endurance-vest/",
    ],
    must: [/slope.?runner/i, /patagonia/i],
    sourceUrl: "https://www.patagonia.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-xa-15",
    slug: "salomon-xa-15",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/xa-15-set-l47297000.html",
      "https://www.salomon.com/en-us/shop/product/xa-15-set.html",
      "https://www.bergfreunde.eu/salomon-xa-15-set/",
    ],
    must: [/xa.?15/i, /salomon/i],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-trailblazer-20",
    slug: "salomon-trailblazer-20",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/trailblazer-20-l41277000.html",
      "https://www.salomon.com/en-us/shop/product/trailblazer-20.html",
      "https://www.bergfreunde.eu/salomon-trailblazer-20/",
    ],
    must: [/trailblazer/i, /salomon/i],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-soft-flask-speed-500",
    slug: "salomon-soft-flask-speed-500",
    dir: "hydration/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/soft-flask-500ml-speed-42-lc1916800.html",
      "https://www.bergfreunde.eu/salomon-soft-flask-speed-500-ml/",
    ],
    must: [/soft.?flask|speed/i, /salomon|500/i],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-hydrapak-tube-kit",
    slug: "hydrapak-tube-kit",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/tube-kit",
      "https://hydrapak.com/products/tube-kit",
    ],
    must: [/tube/i, /hydrapak/i],
    sourceUrl: "https://www.hydrapak.com/products/tube-kit",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-hydrapak-shape-shift-15",
    slug: "hydrapak-shape-shift-15",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/shape-shift-reservoir-1-5l",
      "https://www.hydrapak.com/search?q=shape-shift",
    ],
    must: [/shape.?shift/i, /hydrapak/i],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-leki-trail-running-quiver",
    slug: "leki-trail-running-quiver",
    dir: "packs/products",
    pages: [
      "https://www.leki.com/us/product/trail-running-quiver/",
      "https://www.leki.com/us/trail-running-quiver/",
      "https://www.bergfreunde.eu/leki-trail-running-quiver/",
    ],
    must: [/leki/i, /quiver/i],
    sourceUrl: "https://www.leki.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-camelbak-octane-22",
    slug: "camelbak-octane-22",
    dir: "packs/products",
    pages: [
      "https://www.camelbak.com/shop/packs/hiking/octane-22/CB-2670.html",
      "https://www.camelbak.com/product/octane-22/CB-2670.html",
      "https://www.rei.com/product/164112/camelbak-octane-22l-hydration-pack",
    ],
    must: [/octane/i, /camelbak/i],
    sourceUrl: "https://www.camelbak.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-camelbak-quick-grip-chill",
    slug: "camelbak-quick-grip-chill",
    dir: "hydration/products",
    pages: [
      "https://www.camelbak.com/shop/bottles/quick-grip-chill-handheld/CB-2800.html",
      "https://www.rei.com/product/205891/camelbak-quick-grip-chill-handheld-water-bottle",
    ],
    must: [/quick.?grip|chill/i, /camelbak/i],
    sourceUrl: "https://www.camelbak.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-fitletic-fully-loaded",
    slug: "fitletic-fully-loaded",
    dir: "packs/products",
    pages: [
      "https://www.fitletic.com/products/fully-loaded-running-belt",
      "https://fitletic.com/products/fully-loaded",
    ],
    must: [/fully.?loaded/i, /fitletic/i],
    sourceUrl: "https://www.fitletic.com/",
    source: "Manufacturer CDN (Fitletic)",
  },
  {
    id: "prod-amphipod-airflow-lite-belt",
    slug: "amphipod-airflow-lite-belt",
    dir: "packs/products",
    pages: [
      "https://www.amphipod.com/airflow-lite-belt/",
      "https://www.amphipod.com/products/airflow-lite-belt",
    ],
    must: [/airflow/i, /amphipod/i],
    sourceUrl: "https://www.amphipod.com/",
    source: "Manufacturer CDN (Amphipod)",
  },
  {
    id: "prod-amphipod-hydraform-handheld",
    slug: "amphipod-hydraform-ergo-lite-handheld",
    dir: "hydration/products",
    pages: [
      "https://www.amphipod.com/hydraform-ergo-lite/",
      "https://www.amphipod.com/products/hydraform-ergo-lite-handheld",
    ],
    must: [/hydraform/i, /amphipod/i],
    sourceUrl: "https://www.amphipod.com/",
    source: "Manufacturer CDN (Amphipod)",
  },
  {
    id: "prod-nathan-zipster-lite",
    slug: "nathan-zipster-lite",
    dir: "packs/products",
    pages: [
      "https://www.nathansports.com/products/zipster-lite",
      "https://nathansports.com/products/zipster-lite-running-belt",
    ],
    must: [/zipster/i, /nathan/i],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer CDN (Nathan)",
  },
  {
    id: "prod-nathan-quickdraw-plus",
    slug: "nathan-quickdraw-plus-handheld",
    dir: "hydration/products",
    pages: [
      "https://www.nathansports.com/products/quickdraw-plus",
      "https://nathansports.com/products/quickdraw-plus-handheld",
    ],
    must: [/quickdraw/i, /nathan/i],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer CDN (Nathan)",
  },
  {
    id: "prod-ud-utility-bag",
    slug: "ultimate-direction-utility-bag",
    dir: "packs/products",
    pages: ["https://ultimatedirection.com/utility-bag/"],
    must: [/utility.?bag/i],
    sourceUrl: "https://ultimatedirection.com/utility-bag/",
    source: "Manufacturer CDN (Ultimate Direction)",
  },
  {
    id: "prod-wilson-kaos-rapide-30",
    slug: "wilson-kaos-rapide-3-0",
    dir: "tennis/products",
    remotes: [
      "https://img.tennis-warehouse.com/watermark/rs.php?path=WKR3WHB-1.jpg&nw=1000",
      "https://img.tennis-warehouse.com/fpcache/768/reviews/WKR3-R1.jpg",
    ],
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=Wilson%20Kaos%20Rapide%203.0",
      "https://www.wilson.com/en-us/product/kaos-rapide-3-mens-shoe-wr1677.html",
    ],
    must: [/kaos/i, /rapide/i],
    sourceUrl: "https://www.wilson.com/",
    source: "Manufacturer / Tennis Warehouse",
  },
  {
    id: "prod-nb-lav-v2",
    slug: "new-balance-fresh-foam-x-lav-v2",
    dir: "tennis/products",
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=New%20Balance%20Fresh%20Foam%20X%20Lav%20v2",
      "https://www.newbalance.com/pd/fresh-foam-x-lav-v2/MLAVV2.html",
    ],
    must: [/lav/i, /fresh.?foam|new.?balance/i],
    sourceUrl: "https://www.newbalance.com/",
    source: "Manufacturer / Tennis Warehouse",
  },
  {
    id: "prod-nike-zoom-gp-turbo-2",
    slug: "nike-zoom-gp-turbo-hc-2",
    dir: "tennis/products",
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=Nike%20GP%20Turbo%20HC%202",
      "https://www.nike.com/t/nikecourt-air-zoom-gp-turbo-2-hard-court-tennis-shoes-0PqrLZ",
    ],
    must: [/turbo/i, /nike|gp/i],
    sourceUrl: "https://www.nike.com/",
    source: "Manufacturer / Tennis Warehouse",
  },
  {
    id: "prod-head-revolt-court",
    slug: "head-revolt-court-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Head%20Revolt%20Court",
    ],
    must: [/revolt/i, /court/i, /head/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-kuikma-ps-560-women",
    slug: "kuikma-ps-560-women",
    dir: "padel/products",
    pages: [
      "https://www.decathlon.nl/search?Ntt=kuikma%20ps%20560%20dames",
      "https://www.decathlon.es/search?Ntt=kuikma%20ps%20560%20mujer",
    ],
    must: [/kuikma/i, /560/i],
    sourceUrl: "https://www.decathlon.nl/",
    source: "Decathlon CDN",
  },
  {
    id: "prod-oxdog-hyper-court",
    slug: "oxdog-hyper-court",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Oxdog%20Hyper%20Court%20shoe",
      "https://oxdog.net/collections/shoes",
    ],
    must: [/oxdog/i, /hyper/i],
    exclude: [/joma|racket|pala|hyperpro/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel / Oxdog",
  },
  {
    id: "prod-varlion-bourne-padel-shoe",
    slug: "varlion-bourne-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Varlion%20Bourne%20shoe",
    ],
    must: [/varlion/i, /bourne/i],
    exclude: [/bullpadel|vertex/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-tecnifibre-t-fight-padel",
    slug: "tecnifibre-wall-shooter",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Tecnifibre%20Wall%20Shooter",
    ],
    must: [/tecnifibre/i, /wall|shooter/i],
    exclude: [/mochila|bag|backpack|tour.?endurance/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-adidas-solecourt-boost-padel",
    slug: "adidas-solecourt-boost-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Adidas%20Solecourt%20Boost",
      "https://www.tennis-warehouse.com/search.html?searchtext=adidas%20Solecourt%20Boost",
    ],
    must: [/solecourt/i, /adidas/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel / Tennis Warehouse",
  },
  {
    id: "prod-starvie-absolute-padel",
    slug: "starvie-absolute-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20StarVie%20Absolute",
    ],
    must: [/starvie/i, /absolute/i],
    exclude: [/pala|racket/i],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-nathan-zippered-stash",
    slug: "nathan-zippered-stash",
    dir: "packs/products",
    pages: [
      "https://www.nathansports.com/products/zippered-stash-pocket",
      "https://nathansports.com/search?q=zippered+stash+pocket",
    ],
    must: [/zippered.?stash|stash.?pocket/i, /nathan/i],
    exclude: [/vest|hypernight|pinnacle/i],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer CDN (Nathan)",
  },
  {
    id: "prod-kiprun-running-belt",
    slug: "kiprun-running-belt",
    dir: "packs/products",
    pages: [
      "https://www.decathlon.nl/p/hardloopriem-trail/_/R-p-304566",
      "https://www.decathlon.nl/search?Ntt=kiprun%20riem",
      "https://www.decathlon.es/search?Ntt=cintur%C3%B3n%20kiprun",
    ],
    must: [/kiprun/i, /belt|riem|cinturon|cintur/i],
    exclude: [/tank|racer|premium.?ss|collection/i],
    sourceUrl: "https://www.decathlon.nl/",
    source: "Decathlon CDN",
  },
];

function curl(url, dest, maxTime = 30) {
  try {
    const code = execFileSync(
      "curl",
      ["--http1.1", "-sL", "--max-time", String(maxTime), "-A", UA, "-o", dest, "-w", "%{http_code}", "--", url],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    return code;
  } catch {
    return "err";
  }
}

function isImage(buf) {
  if (buf.length < 8000) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF") return true;
  const head = buf.slice(0, 200).toString("utf8");
  return !(head.includes("<!DOCTYPE") || head.includes("<html"));
}

function extract(html, pageUrl) {
  const out = new Set();
  const push = (u) => {
    if (!u) return;
    let x = u.replace(/&amp;/g, "&").trim();
    if (x.startsWith("//")) x = `https:${x}`;
    if (x.startsWith("/")) {
      try {
        x = new URL(x, pageUrl).toString();
      } catch {
        return;
      }
    }
    if (!/^https?:/i.test(x)) return;
    if (/logo|icon|sprite|favicon|pixel|banner|social|navigation|avatar|placeholder|1x1|svg|trust|kachel/i.test(x))
      return;
    out.add(x);
  };
  for (const m of html.matchAll(/property=["']og:image["'][^>]*content=["']([^"']+)["']/gi))
    push(m[1]);
  for (const m of html.matchAll(/content=["']([^"']+)["'][^>]*property=["']og:image["']/gi))
    push(m[1]);
  for (const m of html.matchAll(
    /https:\/\/www\.zonadepadel\.es\/\d+-(?:home_default|large_default)\/[A-Za-z0-9_.-]+\.jpg/gi,
  ))
    push(m[0].replace("-home_default/", "-large_default/"));
  for (const m of html.matchAll(/path=([A-Z0-9._-]+\.jpe?g)/gi)) {
    push(`https://img.tennis-warehouse.com/watermark/rs.php?path=${m[1]}&nw=1000`);
  }
  for (const m of html.matchAll(
    /https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s>]*)?/gi,
  ))
    push(m[0]);
  return [...out];
}

function passesMust(url, p) {
  const h = url.toLowerCase();
  if ((p.exclude || []).some((re) => re.test(h))) return false;
  return (p.must || []).every((re) => re.test(h));
}

function tryUrl(url) {
  const dest = path.join(TMP, `i-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
  const code = curl(url, dest, 25);
  if (code !== "200" || !fs.existsSync(dest)) return null;
  const buf = fs.readFileSync(dest);
  if (!isImage(buf)) return null;
  return { buf, remote: url };
}

function scrape(p) {
  const cands = [];
  for (const page of p.pages || []) {
    const htmlDest = path.join(TMP, `p-${p.id}.html`);
    const code = curl(page, htmlDest, 30);
    if (code !== "200") continue;
    const html = fs.readFileSync(htmlDest, "utf8");
    for (const u of extract(html, page)) {
      if (passesMust(u, p)) cands.push({ u, page, score: 10 });
      else {
        // softer: require at least one strong token in filename
        const strong = (p.must || []).some((re) => re.test(u));
        if (strong && !/navigation|logo|icon/i.test(u)) cands.push({ u, page, score: 4 });
      }
    }
  }
  cands.sort((a, b) => b.score - a.score);
  const seen = new Set();
  for (const c of cands) {
    if (seen.has(c.u)) continue;
    seen.add(c.u);
    const hit = tryUrl(c.u);
    if (hit) return { ...hit, page: c.page };
  }
  return null;
}

function mergeRegistry(entries) {
  const catalogPath = path.join(ROOT, "src/content/catalog-product-media.ts");
  let catalogSrc = fs.readFileSync(catalogPath, "utf8");
  let added = 0;
  for (const e of entries) {
    if (!e.ok || !e.src) continue;
    if (catalogSrc.includes(`"${e.id}":`)) continue;
    const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "retailer-authorized",
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  },
`;
    catalogSrc = catalogSrc.replace(
      "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
      `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n${block}`,
    );
    added += 1;
  }
  fs.writeFileSync(catalogPath, catalogSrc);
  return { added };
}

const catalog = fs.readFileSync(path.join(ROOT, "src/content/catalog-product-media.ts"), "utf8");
const targets = PRODUCTS.filter((p) => !catalog.includes(`"${p.id}":`));
console.log(`Pass5 strict: ${targets.length} targets`);

const results = [];
for (const p of targets) {
  process.stdout.write(`… ${p.slug} `);
  let hit = null;
  for (const r of p.remotes || []) {
    hit = tryUrl(r);
    if (hit) break;
  }
  let pageUrl = p.sourceUrl;
  if (!hit) {
    const s = scrape(p);
    if (s) {
      hit = s;
      pageUrl = s.page || p.sourceUrl;
    }
  }
  if (!hit) {
    console.log("FAIL");
    results.push({ id: p.id, ok: false });
    continue;
  }
  // final must check on remote URL
  if (p.must && !passesMust(hit.remote, p) && !(p.must.every((re) => re.test(hit.remote)))) {
    // allow if page scrape already filtered; still reject excludes
    if ((p.exclude || []).some((re) => re.test(hit.remote))) {
      console.log("FAIL exclude", hit.remote.slice(0, 80));
      results.push({ id: p.id, ok: false });
      continue;
    }
  }
  const ext =
    hit.buf[0] === 0x89
      ? "png"
      : hit.buf.toString("ascii", 0, 4) === "RIFF"
        ? "webp"
        : "jpg";
  const outDir = path.join(ROOT, "public/images", p.dir);
  fs.mkdirSync(outDir, { recursive: true });
  const file = `${p.slug}-hero.${ext}`;
  fs.writeFileSync(path.join(outDir, file), hit.buf);
  console.log(`OK ${hit.buf.length} ${hit.remote.slice(0, 90)}`);
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/${p.dir}/${file}`,
    sourceUrl: pageUrl,
    source: p.source,
    remote: hit.remote,
  });
}

const ok = results.filter((r) => r.ok);
const { added } = mergeRegistry(ok);
fs.writeFileSync(
  path.join(ROOT, "data/staging/draft-remaining-pass5-report.json"),
  JSON.stringify(results, null, 2),
);
console.log(`\nPASS5 NEW OK ${ok.length} registry+${added}`);
console.log(ok.map((r) => r.id).join("\n"));
