import { getBrands, getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { PADEL_RACKET_PRODUCT_MEDIA } from "@/content/padel/rackets/product-media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";

const PROD = { isDev: false as const };
const CATS = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
]);
const GENERIC = new Set([
  "padel",
  "hero",
  "pro",
  "plus",
  "team",
  "pack",
  "2024",
  "2025",
  "2026",
]);
const PLACEHOLDERS = new Set([
  "/images/padel/products/head-padel-pro-s-hero.jpg",
  "/images/padel/products/wilson-padel-overgrip-hero.jpg",
  "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  "/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg",
]);

function stem(src: string): string {
  return (src.split("/").pop() || "")
    .replace(/\.[^.]+$/, "")
    .replace(/-hero$/, "")
    .toLowerCase();
}
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

const products = getProducts(PROD).filter((p) => CATS.has(p.categoryId));
const brands = Object.fromEntries(getBrands(PROD).map((b) => [b.id, b]));

const counts: Record<string, number> = {};
const bySrc = new Map<string, string[]>();
const samples: string[] = [];

for (const p of products) {
  const brand = brands[p.brandId];
  const media = getPrimaryProductMedia(p);
  const src = media?.src || "";
  const st = src ? stem(src) : "";
  const brandTok = (brand?.slug || p.brandId.replace(/^brand-/, "")).replace(
    /-padel$/,
    "",
  );
  const brandKey = brandTok.split("-")[0]!;
  let reason = "ok";
  if (!src) reason = "NO_MEDIA";
  else if (src.endsWith(".svg") || src.includes("/fallbacks/"))
    reason = "PLACEHOLDER";
  else if (!src.includes("/padel/")) reason = "WRONG_SPORT_PATH";
  else {
    const brandInFile = st.includes(brandKey);
    const slugBits = tokens(p.slug).filter(
      (t) => !GENERIC.has(t) && t !== brandKey,
    );
    const modelHit = slugBits
      .filter((t) => t.length >= 4)
      .some((t) => st.includes(t));
    if (!brandInFile) reason = "BRAND_MISMATCH";
    else if (slugBits.some((t) => t.length >= 4) && !modelHit)
      reason = "MODEL_WEAK";
    if (PLACEHOLDERS.has(src) && reason !== "ok") reason = "KNOWN_PLACEHOLDER";
  }
  if (src) {
    const list = bySrc.get(src) ?? [];
    list.push(`${p.status}:${p.slug}`);
    bySrc.set(src, list);
  }
  const key = `${p.status}:${p.categoryId.replace("cat-padel-", "")}:${reason}`;
  counts[key] = (counts[key] ?? 0) + 1;
  if (p.status === "published" && reason !== "ok") {
    samples.push(`${reason}\t${p.categoryId}\t${p.slug}\t${src}`);
  }
}

process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
process.stdout.write(`\nshared srcs ${[...bySrc.values()].filter((v) => v.length > 1).length}\n`);
for (const [src, ids] of bySrc) {
  if (ids.length > 1) process.stdout.write(`SHARED ${ids.length} ${src} :: ${ids.join(" | ")}\n`);
}
process.stdout.write(`\nPUBLISHED ISSUES ${samples.length}\n`);
for (const line of samples.slice(0, 80)) process.stdout.write(`${line}\n`);

const allReg = {
  ...CATALOG_PRODUCT_MEDIA,
  ...PADEL_RACKET_PRODUCT_MEDIA,
  ...PADEL_SECONDARY_PRODUCT_MEDIA,
};
const regBySrc = new Map<string, string[]>();
for (const [id, e] of Object.entries(allReg)) {
  const list = regBySrc.get(e.src) ?? [];
  list.push(id);
  regBySrc.set(e.src, list);
}
process.stdout.write(`\nregistry dups\n`);
for (const [src, ids] of regBySrc) {
  if (ids.length > 1) process.stdout.write(`${ids.length} ${src} ${ids.join(",")}\n`);
}
