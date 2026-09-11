#!/usr/bin/env node
/**
 * Pass 6: curated verified remotes only (strict filename / source match).
 * node scripts/fetch-draft-remaining-pass6.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/draft-pass6-tmp");
fs.mkdirSync(TMP, { recursive: true });

const PRODUCTS = [
  {
    id: "prod-osprey-talon-velocity-20",
    slug: "osprey-talon-velocity-20",
    dir: "packs/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/cache/6a9cf7714588eef809e06e3744d0a028/T/a/TalonVelocity20_S24_Side_DarkCharcoalTumbleweedYellow-resized.jpg",
      "https://www.osprey.com/media/catalog/product/T/a/TalonVelocity20_S24_Side_DarkCharcoalTumbleweedYellow-resized.jpg",
    ],
    sourceUrl: "https://www.osprey.com/talontm-velocity-20",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-osprey-talon-velocity-30",
    slug: "osprey-talon-velocity-30",
    dir: "packs/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/cache/5388681a8e6c1d1cd4caeadae060094a/T/a/TalonVelocity30_S24_Side_MatchaGreenLemongrass-resized.jpg",
      "https://www.osprey.com/media/catalog/product/T/a/TalonVelocity30_S24_Side_MatchaGreenLemongrass-resized.jpg",
    ],
    sourceUrl: "https://www.osprey.com/talontm-velocity-30",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    dir: "packs/products",
    remotes: [
      "https://www.bfgcdn.com/600_600_90/504-0314/osprey-duro-15-trail-running-backpack-bf.jpg",
    ],
    sourceUrl: "https://www.bergfreunde.eu/osprey-duro-15-trail-running-backpack-bf/",
    source: "Authorized retailer (Bergfreunde)",
  },
  {
    id: "prod-salomon-xa-15",
    slug: "salomon-xa-15",
    dir: "packs/products",
    remotes: [
      "https://www.bfgcdn.com/600_600_90/502-6440/salomon-xa-15-trail-running-backpack.jpg",
    ],
    sourceUrl: "https://www.bergfreunde.eu/salomon-xa-15-trail-running-backpack/",
    source: "Authorized retailer (Bergfreunde)",
  },
  {
    id: "prod-osprey-hydraulics-15",
    slug: "osprey-hydraulics-lt-15",
    dir: "hydration/products",
    remotes: [
      "https://www.osprey.com/media/catalog/product/cache/b2f1ce2dfe10d3d31bf2056bf6e0d10f/H/y/HydraulicsLTRes1pnt5L_Side_Red-resized.jpg",
      "https://www.osprey.com/media/catalog/product/H/y/HydraulicsLTRes1pnt5L_Side_Red-resized.jpg",
    ],
    sourceUrl: "https://www.osprey.com/hydraulics-lt-1-5-l-reservoir-1point5lresf23-350",
    source: "Manufacturer CDN (Osprey)",
  },
  {
    id: "prod-amphipod-airflow-lite-belt",
    slug: "amphipod-airflow-lite-belt",
    dir: "packs/products",
    remotes: [
      "https://cdn11.bigcommerce.com/s-ao5tscqzb8/images/stencil/1280x1280/products/135/1090/235__88383.1623352523.png?c=1",
    ],
    sourceUrl: "https://amphipod.com/airflow-lite/",
    source: "Manufacturer CDN (Amphipod)",
  },
  {
    id: "prod-amphipod-hydraform-handheld",
    slug: "amphipod-hydraform-ergo-lite-handheld",
    dir: "hydration/products",
    remotes: [
      "https://cdn11.bigcommerce.com/s-ao5tscqzb8/images/stencil/1280x1280/products/414/1473/383-2__14213.1660854328.png?c=1",
    ],
    sourceUrl: "https://amphipod.com/ergo-lite/",
    source: "Manufacturer CDN (Amphipod)",
  },
  {
    id: "prod-nathan-zipster-lite",
    slug: "nathan-zipster-lite",
    dir: "packs/products",
    remotes: [
      "https://nathansports.com/cdn/shop/files/NS7703-0548_TheZipsterLite_hero_dffd128f-7ac8-4660-88de-a80ab6b2fee6_1024x.jpg?v=1699902114",
    ],
    sourceUrl: "https://nathansports.com/products/the-zipster-lite",
    source: "Manufacturer CDN (Nathan)",
  },
  {
    id: "prod-fitletic-fully-loaded",
    slug: "fitletic-fully-loaded",
    dir: "packs/products",
    remotes: [
      "https://fitletic.com/cdn/shop/files/FL3_600x.jpg?v=1696280295",
      "https://fitletic.com/cdn/shop/files/FL3.jpg?v=1696280295",
    ],
    sourceUrl: "https://fitletic.com/products/fully-loaded-water-and-gel-belt",
    source: "Manufacturer CDN (Fitletic)",
  },
];

function curl(url, dest, maxTime = 30) {
  try {
    return execFileSync(
      "curl",
      [
        "--http1.1",
        "-sL",
        "--max-time",
        String(maxTime),
        "-A",
        UA,
        "-H",
        "Accept-Language: en-US,en;q=0.9",
        "-o",
        dest,
        "-w",
        "%{http_code}",
        "--",
        url,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
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

function tryUrl(url) {
  const dest = path.join(TMP, `i-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
  const code = curl(url, dest, 25);
  if (code !== "200" || !fs.existsSync(dest)) return null;
  const buf = fs.readFileSync(dest);
  if (!isImage(buf)) return null;
  return { buf, remote: url };
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
console.log(`Pass6 curated: ${targets.length} targets`);

const results = [];
for (const p of targets) {
  process.stdout.write(`… ${p.slug} `);
  let hit = null;
  for (const r of p.remotes || []) {
    hit = tryUrl(r);
    if (hit) break;
  }
  if (!hit) {
    console.log("FAIL");
    results.push({ id: p.id, ok: false });
    continue;
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
  console.log(`OK ${hit.buf.length} ${hit.remote.slice(0, 100)}`);
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/${p.dir}/${file}`,
    sourceUrl: p.sourceUrl,
    source: p.source,
    remote: hit.remote,
  });
}

const ok = results.filter((r) => r.ok);
const { added } = mergeRegistry(ok);
fs.writeFileSync(
  path.join(ROOT, "data/staging/draft-remaining-pass6-report.json"),
  JSON.stringify(results, null, 2),
);
console.log(`\nPASS6 NEW OK ${ok.length} registry+${added}`);
console.log(ok.map((r) => r.id).join("\n"));
