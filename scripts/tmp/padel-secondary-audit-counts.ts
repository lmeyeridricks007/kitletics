import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { offers } from "@/content/offers";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import fs from "node:fs";
import path from "node:path";

const CATS = [
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-clothing",
  "cat-padel-accessories",
];
const ROOT = process.cwd();
const exists = (src?: string) =>
  src ? fs.existsSync(path.join(ROOT, "public", src.replace(/^\//, ""))) : false;
const brand = (id: string) => brands.find((b) => b.id === id)?.name ?? id;

const rows = products.filter((p) => CATS.includes(p.categoryId));
const leak = products.filter(
  (p) =>
    p.sportIds.includes("sport-padel") &&
    (p.categoryId.startsWith("cat-tennis") ||
      p.categoryId === "cat-running-shoes" ||
      p.categoryId === "cat-training-shoes"),
);
const crossover = rows.filter(
  (p) => p.categoryId === "cat-padel-shoes" && p.sportIds.includes("sport-tennis"),
);

function catStats(c: string) {
  const list = rows.filter((p) => p.categoryId === c);
  const published = list.filter((p) => p.status === "published");
  const authentic = published.filter((p) => {
    const m = getPrimaryProductMedia(p);
    return Boolean(m && exists(m.src) && !m.src.endsWith(".svg"));
  });
  const brandIds = [...new Set(list.map((p) => p.brandId))];
  return {
    n: list.length,
    published: published.length,
    draft: list.length - published.length,
    authentic: authentic.length,
    brands: brandIds.length,
    brandNames: brandIds.map(brand),
    evidence: list.filter((p) => p.evidenceIds.length > 0).length,
  };
}

const homepageOffers = offers.filter((o) => {
  try {
    const u = new URL(o.url);
    const pth = u.pathname.replace(/\/+$/, "");
    return (
      (pth === "" || pth === "/") && rows.some((p) => p.id === o.productId)
    );
  } catch {
    return false;
  }
});

const payload = {
  leak: leak.length,
  crossoverShoes: crossover.map((p) => `${p.id} ${p.fullName}`),
  padelOnlyShoes: rows.filter(
    (p) =>
      p.categoryId === "cat-padel-shoes" &&
      p.sportIds.length === 1 &&
      p.sportIds[0] === "sport-padel",
  ).length,
  homepageOffers: homepageOffers.length,
  invalidHomepage: homepageOffers.filter((o) => o.urlValidationState === "INVALID")
    .length,
  cats: Object.fromEntries(CATS.map((c) => [c, catStats(c)])),
  secondaryMedia: Object.keys(PADEL_SECONDARY_PRODUCT_MEDIA).length,
};

fs.writeFileSync(
  path.join(ROOT, "data/staging/padel-secondary-audit-counts.json"),
  JSON.stringify(payload, null, 2),
);
console.log(JSON.stringify(payload, null, 2));
