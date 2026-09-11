#!/usr/bin/env tsx
import fs from "node:fs";
import { getProducts } from "@/repositories";

const products = getProducts({ isDev: true });
const bySlug = new Map(products.map((p) => [p.slug, p]));

function insertEntries(
  filePath: string,
  exportNeedle: string,
  entries: Array<Record<string, string>>,
): number {
  const src = fs.readFileSync(filePath, "utf8");
  const parts = src.split(exportNeedle);
  if (parts.length !== 2) throw new Error(`bad needle ${filePath}`);
  const blocks: string[] = [];
  for (const e of entries) {
    if (!e.id || src.includes(`"${e.id}":`)) continue;
    const abs = `public${e.src}`;
    if (!fs.existsSync(abs) || fs.statSync(abs).size < 8000) {
      console.log("skip small/missing", e.id, abs, fs.existsSync(abs) ? fs.statSync(abs).size : 0);
      continue;
    }
    blocks.push(`  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "${e.licence}",
    attribution: ${JSON.stringify(e.attribution)},
    width: 1000,
    height: 1000,
  },
`);
  }
  if (!blocks.length) return 0;
  fs.writeFileSync(filePath, parts[0] + exportNeedle + blocks.join("") + parts[1]);
  return blocks.length;
}

type Entry = {
  id: string;
  src: string;
  sourceUrl: string;
  source: string;
  licence: string;
  attribution: string;
  categorySlug: string;
};

const entries: Entry[] = [];
const seen = new Set<string>();

function add(e: Entry) {
  if (seen.has(e.id)) return;
  seen.add(e.id);
  entries.push(e);
}

for (const r of JSON.parse(
  fs.readFileSync("data/staging/media-gaps-batch.json", "utf8"),
) as Array<{ ok: boolean; id: string; src: string; sourceUrl: string; source: string; categorySlug: string }>) {
  if (!r.ok) continue;
  add({
    id: r.id,
    src: r.src,
    sourceUrl: r.sourceUrl,
    source: r.source,
    licence: "retailer-authorized",
    attribution: "Product photography via RunRepeat — pending manufacturer packshot",
    categorySlug: r.categorySlug,
  });
}

const diskDirs: Array<[string, string]> = [
  ["running/products", "running-shoes"],
  ["tennis/products", "tennis-shoes"],
  ["padel/products", "padel-shoes"],
  ["running/accessories", "accessories"],
  ["packs/products", "hydration"],
];

for (const [dir, cat] of diskDirs) {
  const full = `public/images/${dir}`;
  if (!fs.existsSync(full)) continue;
  for (const file of fs.readdirSync(full)) {
    if (!/-hero\.(jpg|png|webp)$/.test(file)) continue;
    const slug = file.replace(/-hero\.(jpg|png|webp)$/, "");
    const p = bySlug.get(slug);
    if (!p) continue;
    const abs = `${full}/${file}`;
    if (fs.statSync(abs).size < 8000) continue;
    const isMfr = slug.includes("terrex");
    add({
      id: p.id,
      src: `/images/${dir}/${file}`,
      sourceUrl: isMfr
        ? "https://www.adidas.com/us/terrex-agravic-3-trail-running-shoes/JI0955.html"
        : slug.includes("infinity")
          ? "https://www.runrepeat.com/nike-infinityrn-4"
          : slug.includes("kuikma")
            ? "https://www.decathlon.com.au/"
            : `https://www.runrepeat.com/${slug}`,
      source: isMfr
        ? "Manufacturer official product catalog (adidas)"
        : "Authorized product photography",
      licence: isMfr ? "manufacturer-marketing" : "retailer-authorized",
      attribution: isMfr
        ? "© Brand — official / authorized product photography"
        : "© Brand — authorized retailer product photography",
      categorySlug: cat,
    });
  }
}

const running = entries.filter(
  (e) => e.categorySlug === "running-shoes" || e.src.includes("/running/products/"),
);
const catalog = entries.filter((e) => !running.includes(e));

const nR = insertEntries(
  "src/content/running/product-media.ts",
  "export const RUNNING_PRODUCT_MEDIA: Record<string, RunningProductMediaSource> = {\n",
  running,
);
const nC = insertEntries(
  "src/content/catalog-product-media.ts",
  "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
  catalog,
);
console.log(`Registry +${nR} running +${nC} catalog; candidates ${entries.length}`);
