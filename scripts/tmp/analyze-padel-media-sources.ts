import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import { getBrands, getProducts } from "@/repositories";

const PROD = { isDev: false as const };
const CATS = new Set([
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
  "cat-padel-shoes",
]);

function pathOf(url: string): string {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        ![
          "padel",
          "hero",
          "www",
          "com",
          "en",
          "nl",
          "products",
          "product",
          "html",
        ].includes(t),
    );
}

const brands = Object.fromEntries(getBrands(PROD).map((b) => [b.id, b]));
const hits: Array<{
  id: string;
  slug: string;
  cat: string;
  brand: string;
  src: string;
  sourceUrl: string;
  issue: string;
}> = [];
const soft = getProducts(PROD).filter(
  (p) => CATS.has(p.categoryId) && p.status === "published",
);

for (const p of soft) {
  const entry = PADEL_SECONDARY_PRODUCT_MEDIA[p.id] ?? CATALOG_PRODUCT_MEDIA[p.id];
  if (!entry) continue;
  const brand = brands[p.brandId];
  const brandKey = (brand?.slug || "").replace(/-padel$/, "").split("-")[0]!;
  const path = pathOf(entry.sourceUrl);
  const pathToks = tokens(path);
  const slugToks = tokens(p.slug).filter((t) => t.length >= 4);
  const brandInPath =
    path.includes(brandKey) || pathToks.some((t) => t.includes(brandKey));
  const brandInFile = entry.src.toLowerCase().includes(brandKey);
  const modelInPath = slugToks.some((t) => path.includes(t));
  const modelInFile = slugToks.some((t) => entry.src.toLowerCase().includes(t));
  let issue = "";
  if (!brandInFile) issue = "FILE_BRAND";
  else if (!modelInFile && slugToks.length) issue = "FILE_MODEL";
  if (entry.sourceUrl.includes("totalgrip") && !p.slug.includes("totalgrip")) {
    issue = "SOURCE_WRONG_PRODUCT";
  }
  if (
    !issue &&
    !brandInPath &&
    !modelInPath &&
    path.includes("/products/")
  ) {
    issue = "SOURCE_PATH_WEAK";
  }
  if (entry.sourceUrl.includes("_psq=") || entry.sourceUrl.includes("search?")) {
    issue = issue || "SEARCH_QUERY_SOURCE";
  }
  if (issue) {
    hits.push({
      id: p.id,
      slug: p.slug,
      cat: p.categoryId.replace("cat-padel-", ""),
      brand: brandKey,
      src: entry.src,
      sourceUrl: entry.sourceUrl,
      issue,
    });
  }
}

process.stdout.write(
  `published soft ${soft.length} issues ${hits.length}\n`,
);
const byI: Record<string, number> = {};
const byC: Record<string, number> = {};
for (const h of hits) {
  byI[h.issue] = (byI[h.issue] || 0) + 1;
  byC[h.cat] = (byC[h.cat] || 0) + 1;
}
process.stdout.write(`${JSON.stringify({ byI, byC }, null, 2)}\n`);
for (const h of hits) {
  process.stdout.write(
    `${h.issue}\t${h.cat}\t${h.slug}\n  ${h.sourceUrl}\n  ${h.src}\n`,
  );
}

const publicRoot = join(process.cwd(), "public");
const hashes = new Map<string, string[]>();
for (const p of getProducts(PROD).filter(
  (x) => x.sportIds?.includes("sport-padel") && x.status === "published",
)) {
  const e = PADEL_SECONDARY_PRODUCT_MEDIA[p.id] ?? CATALOG_PRODUCT_MEDIA[p.id];
  if (!e?.src?.startsWith("/images/")) continue;
  const fp = join(publicRoot, e.src.replace(/^\//, ""));
  if (!existsSync(fp)) continue;
  const h = createHash("sha256").update(readFileSync(fp)).digest("hex").slice(0, 16);
  const list = hashes.get(h) ?? [];
  list.push(`${p.slug}|${e.src}`);
  hashes.set(h, list);
}
process.stdout.write("\nBYTE DUPS\n");
for (const [h, list] of hashes) {
  if (list.length > 1) process.stdout.write(`${h} ${list.join(" || ")}\n`);
}
