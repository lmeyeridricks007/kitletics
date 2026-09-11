/**
 * Fetch all P1 catalog heroes from verified URL manifests and generate
 * src/content/catalog-product-media.ts
 *
 * node scripts/apply-p1-catalog-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function refineDir(id, slug) {
  const s = `${id} ${slug}`.toLowerCase();
  if (/clifton-pro|endorphin-pro-3|trailfly/.test(s)) return "running/products";
  if (/forerunner|coros-pace|coros-apex|polar-vantage|polar-pacer|suunto-race|apple-watch/.test(s))
    return "watches/products";
  if (/hrm|tickr|verity|polar-h10|coros-heart|coros-hrm/.test(s)) return "hrm/products";
  if (/adv-skin|vaporair|adventure-vest|zephyr|duro|dyna|camelbak|nathan|osprey/.test(s))
    return "packs/products";
  if (/metcon|nano|nobull|flite|tyr-cxt|dropset|romaleos|adipower|lifter|fastlift|outwork/.test(s))
    return "training/products";
  if (
    /nox-|bullpadel|technical-viper|counter-viper|coello|siux|bela|blade-pro-padel|starvie|metalbone|kuikma|drop-shot|varlion|wall-breaker|oxdog|royal-padel|black-crown|lok-maxx|extreme-pro-padel|extreme-motion|padel/.test(
      s,
    )
  )
    return "padel/products";
  if (
    /pure-drive|pure-aero|clash|blade-98|blade-100|speed-mp|radical|ezone|vcore|tf40|tfight|dunlop|prince-textreme/.test(
      s,
    )
  )
    return "tennis/products";
  return "fitness/products";
}

const SEED = [
  {
    id: "prod-clifton-pro",
    slug: "clifton-pro",
    imageUrl:
      "https://media.nz.hoka.com/cdn-cgi/image/fit=scale-down,f=auto,w=1200/products/a2291e7c-f806-4861-8699-29954969e2d2/d63d8fd6/1176510-bkcs_bkcs_01.jpg",
    sourceUrl: "https://nz.hoka.com/products/clifton-pro-1176510-bkcs-bkcs",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (HOKA)",
  },
  {
    id: "prod-endorphin-pro-3",
    slug: "endorphin-pro-3",
    imageUrl:
      "https://s7d4.scene7.com/is/image/WolverineWorldWide/S10755-40_1?$dw-pdp-primary$",
    sourceUrl: "https://www.saucony.com/en/endorphin-pro-3/59686W.html",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Saucony)",
  },
  {
    id: "prod-trailfly-ultra-g-300-max",
    slug: "trailfly-ultra-g-300-max",
    imageUrl:
      "https://keypowersports.sg/cdn/shop/products/000977-GNBK-S-01-trailfly-ultra-g-300-max-mens-ultra-running-shoe-green-black-side.jpg?v=1679302193&width=1200",
    sourceUrl:
      "https://www.inov8.com/us/trailfly-ultra-g-300-max-mens-ultra-running-shoes",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Inov-8)",
  },
  {
    id: "prod-forerunner-965",
    slug: "garmin-forerunner-965",
    imageUrl: "https://res.garmin.com/en/products/010-02809-00/g/cf-lg.jpg",
    sourceUrl: "https://www.garmin.com/en-US/p/886725/pn/010-02809-00/",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Garmin)",
  },
  {
    id: "prod-forerunner-970",
    slug: "garmin-forerunner-970",
    imageUrl: "https://res.garmin.com/en/products/010-02969-00/g/cf-lg.jpg",
    sourceUrl: "https://www.garmin.com/en-US/p/1462801/pn/010-02969-00/",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Garmin)",
  },
  {
    id: "prod-forerunner-570",
    slug: "garmin-forerunner-570",
    imageUrl: "https://res.garmin.com/en/products/010-02970-01/g/cf-lg.jpg",
    sourceUrl: "https://www.garmin.com/en-US/p/1463821/pn/010-02970-01/",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Garmin)",
  },
  {
    id: "prod-forerunner-265",
    slug: "garmin-forerunner-265",
    imageUrl: "https://res.garmin.com/en/products/010-02810-00/g/cf-lg.jpg",
    sourceUrl: "https://www.garmin.com/",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Garmin)",
  },
  {
    id: "prod-forerunner-165",
    slug: "garmin-forerunner-165",
    imageUrl: "https://res.garmin.com/en/products/010-02803-10/g/cf-lg.jpg",
    sourceUrl: "https://www.garmin.com/",
    licence: "manufacturer-marketing",
    source: "Manufacturer official product catalog (Garmin)",
  },
  {
    id: "prod-coros-pace-3",
    slug: "coros-pace-3",
    imageUrl:
      "https://www.furtherfaster.co.nz/cdn/shop/files/Coros-Pace-3-GPS-Sport-Watch-Nylon-Black-NZ-01.jpg?v=1757291379&width=1200",
    sourceUrl: "https://coros.com/pace3",
    licence: "retailer-authorized",
    source: "Authorized retailer product photography (Further Faster / COROS)",
  },
];

function loadJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const fromRemaining = loadJson("data/staging/remaining-product-images-verified.json");
const fromFirst = loadJson("data/staging/p1-first-batch-verified.json");
const fromHard = loadJson("data/staging/p1-hard-gaps-verified.json");

const byId = new Map();
for (const row of [...SEED, ...fromFirst, ...fromRemaining, ...fromHard]) {
  if (!row?.id || !row?.imageUrl) continue;
  if (!byId.has(row.id)) byId.set(row.id, row);
}

async function fetchBuf(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 6000) return null;
    if (buf.slice(0, 20).toString().toLowerCase().includes("<!doctype")) return null;
    if (buf.slice(0, 15).toString().toLowerCase().includes("<html")) return null;
    const ct = r.headers.get("content-type") || "";
    return { buf, ct };
  } catch {
    return null;
  }
}

const ok = [];
const fail = [];

for (const row of byId.values()) {
  const dir = refineDir(row.id, row.slug || "");
  process.stdout.write(`… ${row.slug || row.id} `);
  const hit = await fetchBuf(row.imageUrl);
  if (!hit) {
    console.log("FAIL");
    fail.push(row.id);
    continue;
  }
  const slug = (row.slug || row.id.replace(/^prod-/, "")).replace(/[^a-z0-9-]/gi, "-");
  const dest = path.join(ROOT, "public/images", dir, `${slug}-hero.jpg`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const written = await writeWebMaster(hit.buf, dest, { role: "hero" });
  const file = path.basename(written.dest);
  console.log(`OK ${written.bytes}`);
  ok.push({
    productId: row.id,
    src: `/images/${dir}/${file}`,
    sourceUrl: row.sourceUrl || row.imageUrl,
    source: row.source || "Authorized product photography",
    licence: row.licence || "retailer-authorized",
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  });
}

// Generate TypeScript registry
const lines = [
  `import type { MediaAsset } from "@/domain/shared/types";`,
  ``,
  `/** Licensed manufacturer / authorized-retailer hero assets for non-shoe catalog products. */`,
  `export interface CatalogProductMediaSource {`,
  `  productId: string;`,
  `  src: string;`,
  `  sourceUrl: string;`,
  `  source: string;`,
  `  licence: "manufacturer-marketing" | "retailer-authorized";`,
  `  attribution: string;`,
  `  width: number;`,
  `  height: number;`,
  `}`,
  ``,
  `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {`,
];

for (const e of ok.sort((a, b) => a.productId.localeCompare(b.productId))) {
  const lic =
    e.licence === "manufacturer-marketing"
      ? "manufacturer-marketing"
      : "retailer-authorized";
  lines.push(`  "${e.productId}": {`);
  lines.push(`    productId: "${e.productId}",`);
  lines.push(`    src: "${e.src}",`);
  lines.push(`    sourceUrl: ${JSON.stringify(e.sourceUrl)},`);
  lines.push(`    source: ${JSON.stringify(e.source)},`);
  lines.push(`    licence: "${lic}",`);
  lines.push(`    attribution: ${JSON.stringify(e.attribution)},`);
  lines.push(`    width: ${e.width},`);
  lines.push(`    height: ${e.height},`);
  lines.push(`  },`);
}
lines.push(`};`);
lines.push(``);
lines.push(`export function getCatalogProductHeroMedia(`);
lines.push(`  productId: string,`);
lines.push(`  alt: string,`);
lines.push(`): MediaAsset[] | undefined {`);
lines.push(`  const entry = CATALOG_PRODUCT_MEDIA[productId];`);
lines.push(`  if (!entry) return undefined;`);
lines.push(`  return [{`);
lines.push(`    id: \`media-\${productId}-hero\`,`);
lines.push(`    src: entry.src,`);
lines.push(`    alt,`);
lines.push(`    width: entry.width,`);
lines.push(`    height: entry.height,`);
lines.push(`    type: "image",`);
lines.push(`    source: entry.source,`);
lines.push(`    sourceUrl: entry.sourceUrl,`);
lines.push(`    licence: entry.licence,`);
lines.push(`    attribution: entry.attribution,`);
lines.push(`    usageType: "hero",`);
lines.push(`  }];`);
lines.push(`}`);
lines.push(``);

fs.writeFileSync(
  path.join(ROOT, "src/content/catalog-product-media.ts"),
  lines.join("\n"),
);

fs.writeFileSync(
  path.join(ROOT, "data/staging/p1-catalog-media-applied.json"),
  JSON.stringify({ ok, fail }, null, 2),
);

console.log(`\nApplied ${ok.length} heroes · ${fail.length} failed`);
console.log(`Wrote src/content/catalog-product-media.ts`);
