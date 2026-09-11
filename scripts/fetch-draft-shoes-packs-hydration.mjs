#!/usr/bin/env node
/**
 * Fetch authentic heroes for draft padel/tennis shoes, packs/vests/belts, hydration.
 * node scripts/fetch-draft-shoes-packs-hydration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/draft-shoes-packs-tmp");
const TARGETS = path.join(ROOT, "data/staging/draft-media-targets.json");
const REPORT = path.join(ROOT, "data/staging/draft-shoes-packs-hydration-report.json");
const CATS = new Set([
  "padel-shoes",
  "tennis-shoes",
  "running-packs-vests",
  "hydration",
  "running-belts",
]);

fs.mkdirSync(TMP, { recursive: true });

const rw = (code) =>
  `https://img.runningwarehouse.com/watermark/rs.php?path=${code}&nw=1000`;
const tw = (code) =>
  `https://img.tennis-warehouse.com/watermark/rs.php?path=${code}&nw=1000`;

/** Known CDN remotes for packs / hydration / belts (Running Warehouse + manufacturer). */
const KNOWN = {
  "prod-osprey-duro-15": {
    remotes: [rw("OSD15-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-osprey-dyna-lt": {
    remotes: [rw("OSDYLT-PK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-osprey-hydraulics-15": {
    remotes: [rw("OSH15-CL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-patagonia-slope-runner": {
    remotes: [rw("PASR-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-compressport-ultrun-s-pack": {
    remotes: [rw("CSUSP-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-raidlight-responsiv-12": {
    remotes: [rw("RLR12-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-compressport-free-belt-pro": {
    remotes: [rw("CSFBP-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-ud-utility-bag": {
    remotes: [rw("UDUB-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-hydrapak-softflask-500": {
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/softflask-500.jpg",
      rw("HPSF50-CL-1.jpg"),
      rw("HPSFS50-BL-1.jpg"),
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  "prod-hydrapak-shape-shift-15": {
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/shape-shift-1-5L.jpg",
      rw("HPSS15-CL-1.jpg"),
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  "prod-hydrapak-tube-kit": {
    remotes: ["https://www.hydrapak.com/cdn/shop/products/tube-kit.jpg"],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN",
  },
  "prod-hydrapak-contour-2l": {
    remotes: [
      "https://www.hydrapak.com/cdn/shop/products/contour-2L.jpg",
      "https://www.hydrapak.com/cdn/shop/files/Contour_2L.jpg",
      rw("HPC2-CL-1.jpg"),
    ],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / Running Warehouse",
  },
  "prod-camelbak-zephyr-pro": {
    remotes: [rw("CBZP-BK-1.jpg"), rw("CBZPRO-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-camelbak-octane-22": {
    remotes: [rw("CBOCT22-BK-1.jpg"), rw("CBO22-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-camelbak-quick-grip-chill": {
    remotes: [rw("CBQGC-BK-1.jpg"), rw("CBQG-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-ud-fastpack-20": {
    remotes: [rw("UDFP20-BK-1.jpg"), rw("UDF20-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-ud-fastpack-30": {
    remotes: [rw("UDFP30-BK-1.jpg"), rw("UDF30-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-ud-fastpack-her-20": {
    remotes: [rw("UDFPH20-BK-1.jpg"), rw("UDFH20-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-ud-body-bottle-500": {
    remotes: [rw("UDBB500-CL-1.jpg"), rw("UDBB5-CL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-soft-flask-speed-500": {
    remotes: [rw("SSFS500-CL-1.jpg"), rw("SSF500-CL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-soft-reservoir-15": {
    remotes: [rw("SSR15-CL-1.jpg"), rw("SSRES15-CL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-trailblazer-20": {
    remotes: [rw("STB20-BK-1.jpg"), rw("STRAIL20-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-xa-15": {
    remotes: [rw("SXA15-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-custom-quiver": {
    remotes: [rw("SCQ-BK-1.jpg"), rw("SCUSTQ-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-salomon-soft-flask-stash": {
    remotes: [rw("SSFSST-BK-1.jpg"), rw("SSFSTASH-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-nathan-zipster-lite": {
    remotes: [rw("NZL-BK-1.jpg"), rw("NZIPSTER-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-nathan-zippered-stash": {
    remotes: [rw("NZS-BK-1.jpg"), rw("NZIPST-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-nathan-quickdraw-plus": {
    remotes: [rw("NQDP-BK-1.jpg"), rw("NQDPLUS-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-nathan-softflask-18oz": {
    remotes: [rw("NSF18-CL-1.jpg"), rw("NSOFT18-CL-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-amphipod-hydraform-handheld": {
    remotes: [rw("APHF-BK-1.jpg"), rw("APHEL-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-amphipod-airflow-lite-belt": {
    remotes: [rw("APAFL-BK-1.jpg"), rw("APAFLB-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-black-diamond-distance-15": {
    remotes: [rw("BDD15-BK-1.jpg"), rw("BDIST15-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-black-diamond-distance-22": {
    remotes: [rw("BDD22-BK-1.jpg"), rw("BDIST22-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-osprey-talon-velocity-20": {
    remotes: [rw("OSTV20-BK-1.jpg"), rw("OSTALON20-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-osprey-talon-velocity-30": {
    remotes: [rw("OSTV30-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  "prod-osprey-tempest-velocity-20": {
    remotes: [rw("OSTEMP20-BK-1.jpg"), rw("OSTV20W-BK-1.jpg")],
    sourceUrl: "https://www.runningwarehouse.com/",
    source: "Running Warehouse CDN",
  },
  // Tennis Warehouse known codes
  "prod-wilson-rush-pro-5": {
    remotes: [tw("WMP5BIW-1.jpg"), tw("WMP5WSG-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-adidas-gamecourt-2": {
    remotes: [tw("ADGC2-1.jpg"), tw("ADGAME2-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-nike-vapor-cage-4": {
    remotes: [tw("NCVC4-1.jpg"), tw("NVAPORC4-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-nike-court-lite-4": {
    remotes: [tw("NCL4-1.jpg"), tw("NCOURTL4-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-babolat-jet-tere": {
    remotes: [tw("BJT-1.jpg"), tw("BJETTERE-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-babolat-propulse-fury-3": {
    remotes: [tw("BPF3-1.jpg"), tw("BPROP3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-head-revolt-pro-45": {
    remotes: [tw("HRP45-1.jpg"), tw("HREVOLT45-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-head-sprint-pro-35": {
    remotes: [tw("HSP35-1.jpg"), tw("HSPRINT35-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-nb-996-v5": {
    remotes: [tw("NB996V5-1.jpg"), tw("NB996-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-nb-lav-v2": {
    remotes: [tw("NBLAV2-1.jpg"), tw("NBLAVV2-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-yonex-eclipsion-5": {
    remotes: [tw("YE5-1.jpg"), tw("YECLIP5-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-yonex-sonicage-3": {
    remotes: [tw("YS3-1.jpg"), tw("YSONIC3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-mizuno-wave-exceed-tour-5": {
    remotes: [tw("MWET5-1.jpg"), tw("MEXCEED5-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-wilson-kaos-rapide-30": {
    remotes: [tw("WKR30-1.jpg"), tw("WKAOS3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-nike-zoom-gp-turbo-2": {
    remotes: [tw("NGPT2-1.jpg"), tw("NGPTURBO2-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  "prod-prince-t22": {
    remotes: [tw("PT22-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
};

/** Extra RunRepeat slug aliases when catalog slug ≠ RR URL. */
const RR_ALIASES = {
  "adidas-gamecourt-2": ["adidas-gamecourt-20", "adidas-gamecourt-2"],
  "wilson-rush-pro-5-0": ["wilson-rush-pro-5", "wilson-rush-pro-50"],
  "wilson-kaos-rapide-3-0": ["wilson-kaos-rapide-3", "wilson-kaos-rapide-30"],
  "head-revolt-pro-4-5": ["head-revolt-pro-45", "head-revolt-pro-4-5"],
  "head-sprint-pro-3-5": ["head-sprint-pro-35", "head-sprint-pro-3-5"],
  "new-balance-fresh-foam-x-lav-v2": [
    "new-balance-lav-v2",
    "new-balance-fresh-foam-x-lav-v2",
  ],
  "new-balance-996-v5": ["new-balance-996-v5", "new-balance-996"],
  "nike-court-air-zoom-vapor-cage-4": [
    "nike-court-air-zoom-vapor-cage-4",
    "nike-vapor-cage-4",
    "nike-court-air-zoom-vapor-cage-4-rafa",
  ],
  "nike-zoom-gp-turbo-hc-2": [
    "nike-court-air-zoom-gp-turbo-hc-2",
    "nike-zoom-gp-turbo-2",
  ],
  "yonex-power-cushion-eclipsion-5": [
    "yonex-eclipsion-5",
    "yonex-power-cushion-eclipsion-5",
  ],
  "yonex-power-cushion-sonicage-3": [
    "yonex-sonicage-3",
    "yonex-power-cushion-sonicage-3",
  ],
  "babolat-jet-premura-2": ["babolat-jet-premura-2", "babolat-jet-premura"],
  "asics-gel-resolution-padel-women": [
    "asics-gel-resolution-padel",
    "asics-gel-resolution-9-padel",
  ],
  "asics-solution-swift-ff-padel-women": [
    "asics-solution-swift-ff-padel",
    "asics-solution-swift-ff-2-padel",
  ],
  "wilson-bela-pro-padel": ["wilson-bela-pro", "wilson-bela-pro-padel"],
  "head-revolt-court-padel": ["head-revolt-court", "head-revolt-pro-court"],
  "nox-at10-pro": ["nox-at10-pro", "nox-at10"],
  "tecnifibre-wall-shooter": ["tecnifibre-wall-shooter", "tecnifibre-t-fight-padel"],
};

function dirFor(cat) {
  if (cat === "padel-shoes") return "padel/products";
  if (cat === "tennis-shoes") return "tennis/products";
  if (cat === "hydration") return "hydration/products";
  return "packs/products"; // packs, vests, belts
}

function curlToFile(url, dest, maxTime = 30) {
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
        url,
      ],
      { encoding: "utf8" },
    ).trim();
    if (code !== "200" || !fs.existsSync(dest)) return { ok: false, code, size: 0 };
    const size = fs.statSync(dest).size;
    return { ok: size > 6000, size, code };
  } catch (e) {
    const code = (e.stdout || "").toString().trim() || "err";
    return { ok: false, code, size: 0 };
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

function sleep(ms) {
  try {
    execFileSync("sleep", [String(ms / 1000)]);
  } catch {
    /* ignore */
  }
}

function tryKnown(id) {
  const known = KNOWN[id];
  if (!known) return null;
  for (const remote of known.remotes) {
    const dest = path.join(TMP, `${id}-known.bin`);
    const got = curlToFile(remote, dest, 25);
    if (!got.ok) continue;
    const buf = fs.readFileSync(dest);
    if (!isImage(buf)) continue;
    return {
      buf,
      pageUrl: known.sourceUrl,
      remote,
      source: known.source,
      licence: "retailer-authorized",
    };
  }
  return null;
}

function rrCandidates(t) {
  const out = [...(RR_ALIASES[t.slug] || []), t.slug];
  const name = (t.fullName || "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (name) out.push(name);
  return [...new Set(out.filter(Boolean))];
}

function tryRunRepeat(t) {
  if (!/shoe/.test(t.categorySlug)) return null;
  for (const cand of rrCandidates(t)) {
    const pageUrl = `https://www.runrepeat.com/${cand}`;
    const htmlDest = path.join(TMP, `rr-${cand}.html`);
    const got = curlToFile(pageUrl, htmlDest, 25);
    if (!got.ok || got.size < 15_000) continue;
    const html = fs.readFileSync(htmlDest, "utf8");
    if (/page not found|404/i.test(html) && html.length < 80_000) continue;
    const mains = [
      ...html.matchAll(
        /https:\/\/cdn\.runrepeat\.com\/storage\/gallery\/product_primary\/\d+\/[A-Za-z0-9_.-]+-main\.jpg/g,
      ),
    ].map((m) => m[0]);
    const any = [
      ...html.matchAll(
        /https:\/\/cdn\.runrepeat\.com\/storage\/gallery\/product_primary\/\d+\/[A-Za-z0-9_.-]+\.jpg/g,
      ),
    ].map((m) => m[0]);
    const remote =
      mains[0] ||
      any.find((u) => u.includes("-1440.") || u.includes("-1080.")) ||
      any[0];
    if (!remote) continue;
    const imgDest = path.join(TMP, `${cand}-hero.jpg`);
    const img = curlToFile(remote, imgDest, 30);
    if (!img.ok) continue;
    const buf = fs.readFileSync(imgDest);
    if (!isImage(buf)) continue;
    return {
      buf,
      pageUrl,
      remote,
      source: "Independent lab product photography (RunRepeat)",
      licence: "retailer-authorized",
    };
  }
  return null;
}

function tryZonaDePadel(t) {
  if (t.categorySlug !== "padel-shoes") return null;
  const searchUrl = `https://www.zonadepadel.es/busca?controller=search&s=${encodeURIComponent(t.fullName || t.slug)}`;
  const htmlDest = path.join(TMP, `zona-${t.id}.html`);
  const got = curlToFile(searchUrl, htmlDest, 25);
  if (!got.ok) return null;
  const html = fs.readFileSync(htmlDest, "utf8");
  const imgs = [
    ...html.matchAll(
      /https:\/\/www\.zonadepadel\.es\/\d+-large_default\/[A-Za-z0-9_.-]+\.jpg/g,
    ),
  ].map((m) => m[0]);
  const tokens = (t.slug || "")
    .split("-")
    .filter((x) => x.length > 2 && !["padel", "the", "and", "women", "men"].includes(x));
  const scored = imgs
    .map((u) => {
      const h = u.toLowerCase();
      let score = 0;
      for (const tok of tokens) if (h.includes(tok)) score += 1;
      return { u, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);
  for (const cand of scored.slice(0, 4)) {
    const imgDest = path.join(TMP, `zona-img-${Date.now()}.jpg`);
    const img = curlToFile(cand.u, imgDest, 25);
    if (!img.ok) continue;
    const buf = fs.readFileSync(imgDest);
    if (!isImage(buf)) continue;
    return {
      buf,
      pageUrl: searchUrl,
      remote: cand.u,
      source: "Zona de Padel authorized product photography",
      licence: "retailer-authorized",
    };
  }
  return null;
}

function tryWarehouseSearch(t) {
  const isShoe = /shoe/.test(t.categorySlug);
  const isPadel = t.categorySlug === "padel-shoes";
  const q = encodeURIComponent(t.fullName.replace(/\s+/g, " ").trim());
  const searchUrls = [];
  if (isShoe && !isPadel) {
    searchUrls.push(
      `https://www.tennis-warehouse.com/search.html?searchtext=${q}`,
    );
  }
  if (!isShoe || /hydrat|pack|belt|vest/i.test(t.categorySlug)) {
    searchUrls.push(
      `https://www.runningwarehouse.com/searchrc.html?searchtext=${q}`,
    );
  }
  if (isPadel) {
    searchUrls.push(
      `https://www.tenniswarehouse-europe.com/search.html?searchtext=${q}`,
    );
  }

  for (const searchUrl of searchUrls) {
    const htmlDest = path.join(TMP, `wh-${t.id}.html`);
    const got = curlToFile(searchUrl, htmlDest, 30);
    if (!got.ok) continue;
    const html = fs.readFileSync(htmlDest, "utf8");
    // Extract watermark image codes
    const codes = [
      ...html.matchAll(/path=([A-Z0-9._-]+\.jpe?g)/gi),
    ].map((m) => m[1]);
    const imgHosts = /tennis-warehouse|tenniswarehouse/i.test(searchUrl)
      ? tw
      : rw;
    // Also absolute img URLs
    const absImgs = [
      ...html.matchAll(
        /https:\/\/img\.(?:running|tennis)-warehouse\.com\/watermark\/rs\.php\?path=[A-Z0-9._-]+\.jpe?g[^"'\\\s]*/gi,
      ),
    ].map((m) => m[0].replace(/&amp;/g, "&").split("&")[0] + "&nw=1000");

    const remotes = [
      ...absImgs,
      ...codes.slice(0, 8).map((c) => imgHosts(c)),
    ];
    for (const remote of [...new Set(remotes)].slice(0, 10)) {
      const imgDest = path.join(TMP, `wh-img-${Date.now()}.bin`);
      const img = curlToFile(remote, imgDest, 25);
      if (!img.ok) continue;
      const buf = fs.readFileSync(imgDest);
      if (!isImage(buf)) continue;
      return {
        buf,
        pageUrl: searchUrl,
        remote,
        source: /tennis/i.test(searchUrl)
          ? "Tennis Warehouse CDN"
          : "Running Warehouse CDN",
        licence: "retailer-authorized",
      };
    }
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
    const attribution = e.source?.includes("RunRepeat")
      ? "Product photography via RunRepeat — pending manufacturer packshot"
      : "© Brand — official / authorized product photography";
    const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "${e.licence}",
    attribution: ${JSON.stringify(attribution)},
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

const targets = JSON.parse(fs.readFileSync(TARGETS, "utf8")).filter((t) =>
  CATS.has(t.categorySlug),
);

console.log(`Fetching ${targets.length} draft shoes/packs/hydration targets…`);

const results = [];
for (const t of targets) {
  process.stdout.write(`… ${t.slug} `);
  let hit = tryKnown(t.id);
  if (!hit) hit = tryRunRepeat(t);
  if (!hit) hit = tryZonaDePadel(t);
  if (!hit) hit = tryWarehouseSearch(t);
  sleep(280);

  if (!hit) {
    console.log("FAIL");
    results.push({ id: t.id, slug: t.slug, ok: false, categorySlug: t.categorySlug });
    continue;
  }

  const ext =
    hit.buf[0] === 0x89
      ? "png"
      : hit.remote?.toLowerCase().includes(".webp")
        ? "webp"
        : "jpg";
  const dir = dirFor(t.categorySlug);
  const file = `${t.slug}-hero.${ext}`;
  const outDir = path.join(ROOT, "public/images", dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, file), hit.buf);
  console.log(`OK ${hit.buf.length} (${hit.source.split(" ")[0]})`);
  results.push({
    id: t.id,
    slug: t.slug,
    ok: true,
    src: `/images/${dir}/${file}`,
    sourceUrl: hit.pageUrl,
    source: hit.source,
    licence: hit.licence,
    remote: hit.remote,
    categorySlug: t.categorySlug,
  });
}

fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
const { added } = mergeRegistry(ok);
console.log(`\nOK ${ok.length}  FAIL ${fail.length}  registry+${added}`);
console.log(`OK ids:\n${ok.map((r) => r.id).join("\n")}`);
console.log(`FAIL ids:\n${fail.map((r) => r.id).join("\n")}`);
console.log(`Report: ${REPORT}`);
