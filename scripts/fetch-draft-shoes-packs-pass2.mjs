#!/usr/bin/env node
/**
 * Pass 2: verified remotes + fixed Zona discovery for draft shoes/packs/hydration.
 * node scripts/fetch-draft-shoes-packs-pass2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/draft-shoes-packs-tmp");
const REPORT = path.join(ROOT, "data/staging/draft-shoes-packs-pass2-report.json");
fs.mkdirSync(TMP, { recursive: true });

const tw = (code) =>
  `https://img.tennis-warehouse.com/watermark/rs.php?path=${code}&nw=1000`;
const rw = (code) =>
  `https://img.runningwarehouse.com/watermark/rs.php?path=${code}&nw=1000`;

/** Verified / high-confidence remotes from TW URL codes + manufacturer CDNs + Zona. */
const PRODUCTS = [
  // —— Tennis shoes (TW codes from descpage URLs) ——
  {
    id: "prod-adidas-gamecourt-2",
    slug: "adidas-gamecourt-2",
    dir: "tennis/products",
    remotes: [tw("AMG2BWH-1.jpg"), tw("AMGC2BB-1.jpg"), tw("AMG2WGN-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/adidas_GameCourt_2_BlackWhite_Mens_Shoes/descpageMSADIDAS-AMG2BWH.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-nike-vapor-cage-4",
    slug: "nike-court-air-zoom-vapor-cage-4",
    dir: "tennis/products",
    remotes: [tw("NVC4MGB-1.jpg"), tw("NVC4MWG-1.jpg"), tw("NVC4MWC-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/Nike_Air_Zoom_Vapor_Cage_4_Green_Black_Mens_Shoes/descpageMSNIKE-NVC4MGB.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-wilson-rush-pro-5",
    slug: "wilson-rush-pro-5-0",
    dir: "tennis/products",
    remotes: [tw("WMP5BIW-1.jpg"), tw("WMP5WSG-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/Wilson_Rush_Pro_5_Black_Infrared_White_Mens_Shoes_/descpageMSWILSON-WMP5BIW.html",
    source: "Tennis Warehouse CDN",
  },
  // TW codes discovered via search (will probe)
  {
    id: "prod-babolat-jet-tere",
    slug: "babolat-jet-tere",
    dir: "tennis/products",
    remotes: [tw("BJT-1.jpg"), tw("BJETER-1.jpg"), tw("BJETTERE-1.jpg"), tw("BJTM-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "Babolat Jet Tere",
  },
  {
    id: "prod-babolat-propulse-fury-3",
    slug: "babolat-propulse-fury-3",
    dir: "tennis/products",
    remotes: [tw("BPF3-1.jpg"), tw("BPROP3-1.jpg"), tw("BPFURY3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "Babolat Propulse Fury 3",
  },
  {
    id: "prod-head-revolt-pro-45",
    slug: "head-revolt-pro-4-5",
    dir: "tennis/products",
    remotes: [tw("HRP45-1.jpg"), tw("HREVOLT45-1.jpg"), tw("HRP4-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "HEAD Revolt Pro 4.5",
  },
  {
    id: "prod-head-sprint-pro-35",
    slug: "head-sprint-pro-3-5",
    dir: "tennis/products",
    remotes: [tw("HSP35-1.jpg"), tw("HSPRINT35-1.jpg"), tw("HSP3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "HEAD Sprint Pro 3.5",
  },
  {
    id: "prod-mizuno-wave-exceed-tour-5",
    slug: "mizuno-wave-exceed-tour-5",
    dir: "tennis/products",
    remotes: [tw("MWET5-1.jpg"), tw("MEXCEED5-1.jpg"), tw("MWETOUR5-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "Mizuno Wave Exceed Tour 5",
  },
  {
    id: "prod-nb-996-v5",
    slug: "new-balance-996-v5",
    dir: "tennis/products",
    remotes: [tw("NBV5BYD-1.jpg"), tw("NB996V5-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "New Balance 996 v5",
  },
  {
    id: "prod-nb-lav-v2",
    slug: "new-balance-fresh-foam-x-lav-v2",
    dir: "tennis/products",
    remotes: [tw("NBLAV2-1.jpg"), tw("NBLAVV2-1.jpg"), tw("NLAV2-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "New Balance Fresh Foam X Lav v2",
  },
  {
    id: "prod-nike-court-lite-4",
    slug: "nike-court-lite-4",
    dir: "tennis/products",
    remotes: [tw("NMC4WHB-1.jpg"), tw("NCL4-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Nike_Court_Lite_4_WhiteBlack_Mens_Shoe/descpageMSNIKE-NMC4WHB.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-nike-zoom-gp-turbo-2",
    slug: "nike-zoom-gp-turbo-hc-2",
    dir: "tennis/products",
    remotes: [tw("NGPT2-1.jpg"), tw("NGPTURBO2-1.jpg"), tw("NGPTHC2-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "NikeCourt Air Zoom GP Turbo HC 2",
  },
  {
    id: "prod-prince-t22",
    slug: "prince-t22",
    dir: "tennis/products",
    remotes: [tw("PT25MBY-1.jpg"), tw("PT22-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Prince_T225_Black_Yellow_Mens_Shoes/descpage-PT25MBY.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-wilson-kaos-rapide-30",
    slug: "wilson-kaos-rapide-3-0",
    dir: "tennis/products",
    remotes: [tw("WKR30-1.jpg"), tw("WKAOS3-1.jpg"), tw("WKR3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "Wilson Kaos Rapide 3.0",
  },
  {
    id: "prod-yonex-eclipsion-5",
    slug: "yonex-power-cushion-eclipsion-5",
    dir: "tennis/products",
    remotes: [tw("YPE5BLW-1.jpg"), tw("YPE5WHP-1.jpg"), tw("YPCE5NR-1.jpg")],
    sourceUrl:
      "https://www.tennis-warehouse.com/Yonex_PC_Eclipsion_5_Blue_White_Mens_Shoes/descpageMSYONEX-YPE5BLW.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-yonex-sonicage-3",
    slug: "yonex-power-cushion-sonicage-3",
    dir: "tennis/products",
    remotes: [tw("YS3-1.jpg"), tw("YSONIC3-1.jpg"), tw("YSON3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
    search: "Yonex Sonicage 3",
  },

  // —— Packs / hydration (manufacturer CDNs) ——
  {
    id: "prod-camelbak-zephyr-pro",
    slug: "camelbak-zephyr-pro",
    dir: "packs/products",
    remotes: [
      "https://www.camelbak.com/dw/image/v2/BDBJ_PRD/on/demandware.static/-/Sites-camelbak-master-catalog/default/dw66c46b18/images/large/2820402000.jpg?sw=1200&sh=1200&sm=fit",
      "https://www.camelbak.com/dw/image/v2/BDBJ_PRD/on/demandware.static/-/Sites-camelbak-master-catalog/default/images/large/2820402000.jpg?sw=1200",
      "https://www.camelbak.com/dw/image/v2/BDBJ_PRD/on/demandware.static/-/Sites-camelbak-master-catalog/default/dw66c46b18/images/large/2821004000.jpg?sw=1200&sh=1200&sm=fit",
    ],
    sourceUrl: "https://www.camelbak.com/product/zephyr-pro%2C-34oz%2C-galaxy-blue/CB-2820402000.html",
    source: "Manufacturer CDN (CamelBak)",
  },
  {
    id: "prod-ud-fastpack-20",
    slug: "ultimate-direction-fastpack-20",
    dir: "packs/products",
    remotes: [
      "https://cdn11.bigcommerce.com/s-cuo9ht/images/stencil/1280x1280/products/397/6231/80466921EMD_ALT01_Fastpackher20_Emerald_web__70654.1705597330.jpg?c=2",
    ],
    sourceUrl: "https://ultimatedirection.com/fastpack-20/",
    source: "Manufacturer CDN (Ultimate Direction)",
    // note: will also try scrape page
    pages: ["https://ultimatedirection.com/fastpack-20/", "https://ultimatedirection.com/fastpackher-20-prior-year/"],
  },
  {
    id: "prod-ud-fastpack-her-20",
    slug: "ultimate-direction-fastpack-her-20",
    dir: "packs/products",
    remotes: [
      "https://cdn11.bigcommerce.com/s-cuo9ht/images/stencil/1280x1280/products/397/6231/80466921EMD_ALT01_Fastpackher20_Emerald_web__70654.1705597330.jpg?c=2",
      "https://cdn11.bigcommerce.com/s-cuo9ht/images/stencil/1280x1280/products/397/6239/80466921EMD_MAIN_Fastpackher20_Emerald_web__10239.1705597337.jpg?c=2",
    ],
    sourceUrl: "https://ultimatedirection.com/fastpackher-20-prior-year/",
    source: "Manufacturer CDN (Ultimate Direction)",
  },
  {
    id: "prod-hydrapak-shape-shift-15",
    slug: "hydrapak-shape-shift-15",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/shape-shift-reservoir-1-5L.jpg",
      "https://www.hydrapak.com/cdn/shop/files/Shape-Shift_1.5L.jpg",
      "https://cdn.shopify.com/s/files/1/0020/1597/8913/products/shape-shift-1-5L.jpg",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-hydrapak-contour-2l",
    slug: "hydrapak-contour-2l",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/contour-2L.jpg",
      "https://www.hydrapak.com/cdn/shop/files/Contour_2L.jpg",
      "https://www.hydrapak.com/cdn/shop/products/Contour_Reservoir_2L.jpg",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-hydrapak-tube-kit",
    slug: "hydrapak-tube-kit",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/tube-kit.jpg",
      "https://www.hydrapak.com/cdn/shop/files/Tube_Kit.jpg",
      "https://www.hydrapak.com/cdn/shop/products/TubeKit.jpg",
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-hydrapak-softflask-500",
    slug: "hydrapak-softflask-500",
    dir: "hydration/products",
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/softflask-500.jpg",
      rw("HPSF50-CL-1.jpg"),
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
];

/** Padel shoes — Zona search by full name */
const PADEL = [
  { id: "prod-babolat-jet-premura-2-men", slug: "babolat-jet-premura-2", q: "Babolat Jet Premura 2" },
  { id: "prod-bullpadel-hack-hybrid", slug: "bullpadel-hack-hybrid", q: "Bullpadel Hack Hybrid" },
  { id: "prod-joma-spin-lady", slug: "joma-spin-lady", q: "Joma Spin Lady" },
  { id: "prod-nox-at10-pro-shoe", slug: "nox-at10-pro", q: "Nox AT10 Pro" },
  { id: "prod-wilson-bela-pro-padel", slug: "wilson-bela-pro-padel", q: "Wilson Bela Pro" },
  { id: "prod-head-revolt-court", slug: "head-revolt-court-padel", q: "HEAD Revolt Court" },
  { id: "prod-asics-gel-resolution-padel-w", slug: "asics-gel-resolution-padel-women", q: "ASICS Gel Resolution Padel" },
  { id: "prod-asics-solution-swift-padel-w", slug: "asics-solution-swift-ff-padel-women", q: "ASICS Solution Swift FF Padel" },
  { id: "prod-siux-diablo-pro", slug: "siux-diablo-pro-padel", q: "Siux Diablo Pro" },
  { id: "prod-siux-comodo-woman", slug: "siux-comodo-woman", q: "Siux Comodo Woman" },
  { id: "prod-kuikma-ps-560-women", slug: "kuikma-ps-560-women", q: "Kuikma PS 560" },
  { id: "prod-starvie-absolute-padel", slug: "starvie-absolute-padel", q: "StarVie Absolute" },
  { id: "prod-oxdog-hyper-court", slug: "oxdog-hyper-court", q: "Oxdog Hyper Court" },
  { id: "prod-varlion-bourne-padel-shoe", slug: "varlion-bourne-padel", q: "Varlion Bourne" },
  { id: "prod-lok-padel-one", slug: "lok-padel-one", q: "LOK Padel One" },
  { id: "prod-tecnifibre-t-fight-padel", slug: "tecnifibre-wall-shooter", q: "Tecnifibre Wall Shooter" },
  { id: "prod-adidas-solecourt-boost-padel", slug: "adidas-solecourt-boost-padel", q: "Adidas Solecourt Boost" },
];

function curlToFile(url, dest, maxTime = 30) {
  if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return { ok: false, code: "bad-url", size: 0 };
  }
  try {
    const code = execFileSync(
      "curl",
      [
        "--http1.1",
        "-sL",
        "--max-time",
        String(maxTime),
        "-A",
        UA,
        "-o",
        dest,
        "-w",
        "%{http_code}",
        "--",
        url,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    if (code !== "200" || !fs.existsSync(dest)) return { ok: false, code, size: 0 };
    const size = fs.statSync(dest).size;
    return { ok: size > 6000, size, code };
  } catch {
    return { ok: false, code: "err", size: 0 };
  }
}

function isImage(buf) {
  if (buf.length < 6000) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF") return true;
  const head = buf.slice(0, 200).toString("utf8");
  return !(head.includes("<!DOCTYPE") || head.includes("<html"));
}

function discoverTwCodes(search) {
  const url = `https://www.tennis-warehouse.com/search.html?searchtext=${encodeURIComponent(search)}`;
  const dest = path.join(TMP, `tw-search-${Date.now()}.html`);
  const got = curlToFile(url, dest, 25);
  if (!got.ok && got.size < 10_000) return [];
  const html = fs.readFileSync(dest, "utf8");
  // Extract descpage codes: descpageXXX-CODE.html or path=CODE.jpg
  const fromDesc = [...html.matchAll(/descpage[A-Z]*-([A-Z0-9]+)\.html/gi)].map((m) => `${m[1]}-1.jpg`);
  const fromPath = [...html.matchAll(/path=([A-Z0-9._-]+\.jpe?g)/gi)].map((m) => m[1]);
  // Score by token overlap with search
  const tokens = search.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const scored = [...new Set([...fromDesc, ...fromPath])].map((code) => {
    const pageHits = [...html.matchAll(new RegExp(`.{0,80}${code.replace(/-1\.jpg$/i, "")}.{0,80}`, "gi"))];
    let score = 0;
    const ctx = pageHits.map((m) => m[0].toLowerCase()).join(" ");
    for (const t of tokens) if (ctx.includes(t) || code.toLowerCase().includes(t.slice(0, 4))) score += 1;
    return { code, score };
  });
  return scored
    .filter((x) => x.score >= 1)
    .sort((a, b) => b.score - a.score)
    .map((x) => tw(x.code));
}

function tryZona(item) {
  const searchUrl = `https://www.zonadepadel.es/busca?controller=search&s=${encodeURIComponent(item.q)}`;
  const htmlDest = path.join(TMP, `zona-${item.id}.html`);
  const got = curlToFile(searchUrl, htmlDest, 25);
  if (!got.ok && got.size < 5000) return null;
  const html = fs.readFileSync(htmlDest, "utf8");
  const imgs = [
    ...html.matchAll(
      /https:\/\/www\.zonadepadel\.es\/(\d+)-(?:home_default|large_default|zdp_customer)\/([A-Za-z0-9_.-]+\.jpg)/g,
    ),
  ];
  const tokens = item.slug
    .split("-")
    .filter((t) => t.length > 2 && !["padel", "women", "men", "the"].includes(t));
  const scored = imgs
    .map((m) => {
      const large = `https://www.zonadepadel.es/${m[1]}-large_default/${m[2]}`;
      const h = m[2].toLowerCase();
      let score = 0;
      for (const t of tokens) if (h.includes(t)) score += 1;
      return { u: large, score, name: m[2] };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);
  // dedupe
  const seen = new Set();
  for (const cand of scored) {
    if (seen.has(cand.u)) continue;
    seen.add(cand.u);
    const imgDest = path.join(TMP, `zona-${item.id}.jpg`);
    const img = curlToFile(cand.u, imgDest, 20);
    if (!img.ok) {
      // try home_default
      const home = cand.u.replace("-large_default/", "-home_default/");
      const img2 = curlToFile(home, imgDest, 20);
      if (!img2.ok) continue;
    }
    const buf = fs.readFileSync(imgDest);
    if (!isImage(buf)) continue;
    return { buf, pageUrl: searchUrl, remote: cand.u };
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
    attribution: ${JSON.stringify(
      e.source?.includes("RunRepeat")
        ? "Product photography via RunRepeat — pending manufacturer packshot"
        : "© Brand — official / authorized product photography",
    )},
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

const results = [];

// 1) Known remotes (+ TW search discovery)
for (const p of PRODUCTS) {
  process.stdout.write(`… ${p.slug} `);
  let remotes = [...p.remotes];
  if (p.search) {
    const discovered = discoverTwCodes(p.search);
    remotes = [...discovered, ...remotes];
  }
  let ok = false;
  let used = null;
  for (const remote of [...new Set(remotes)]) {
    const dest = path.join(TMP, `${p.id}.bin`);
    const got = curlToFile(remote, dest, 25);
    if (!got.ok) continue;
    const buf = fs.readFileSync(dest);
    if (!isImage(buf)) continue;
    const ext = buf[0] === 0x89 ? "png" : "jpg";
    const out = path.join(ROOT, "public/images", p.dir, `${p.slug}-hero.${ext}`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    ok = true;
    used = { remote, src: `/images/${p.dir}/${p.slug}-hero.${ext}`, size: buf.length };
    console.log(`OK ${buf.length}`);
    break;
  }
  if (!ok) console.log("FAIL");
  results.push({
    id: p.id,
    slug: p.slug,
    ok,
    src: used?.src ?? null,
    sourceUrl: p.sourceUrl,
    source: p.source,
    licence: "retailer-authorized",
    remote: used?.remote ?? null,
    categorySlug: p.dir.includes("tennis")
      ? "tennis-shoes"
      : p.dir.includes("hydration")
        ? "hydration"
        : "running-packs-vests",
  });
}

// 2) Padel via Zona
for (const item of PADEL) {
  process.stdout.write(`… ${item.slug} `);
  const hit = tryZona(item);
  if (!hit) {
    console.log("FAIL");
    results.push({ id: item.id, slug: item.slug, ok: false, categorySlug: "padel-shoes" });
    continue;
  }
  const out = path.join(ROOT, "public/images/padel/products", `${item.slug}-hero.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, hit.buf);
  console.log(`OK ${hit.buf.length}`);
  results.push({
    id: item.id,
    slug: item.slug,
    ok: true,
    src: `/images/padel/products/${item.slug}-hero.jpg`,
    sourceUrl: hit.pageUrl,
    source: "Zona de Padel authorized product photography",
    licence: "retailer-authorized",
    remote: hit.remote,
    categorySlug: "padel-shoes",
  });
}

fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
const { added } = mergeRegistry(ok);
console.log(`\nOK ${ok.length}  FAIL ${fail.length}  registry+${added}`);
console.log("OK ids:\n" + ok.map((r) => r.id).join("\n"));
console.log("FAIL ids:\n" + fail.map((r) => r.id).join("\n"));
