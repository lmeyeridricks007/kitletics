import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { getPrimaryProductMedia, isAuthenticProductMedia } from "@/lib/product/media";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
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

function brandName(id: string) {
  return brands.find((b) => b.id === id)?.name ?? id;
}

const ROOT = process.cwd();
function exists(src?: string) {
  if (!src) return false;
  return fs.existsSync(path.join(ROOT, "public", src.replace(/^\//, "")));
}

const rows = products
  .filter((p) => CATS.includes(p.categoryId) || p.sportIds.includes("sport-padel"))
  .map((p) => {
    const primary = getPrimaryProductMedia(p);
    const img0 = p.images[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.fullName,
      brand: brandName(p.brandId),
      categoryId: p.categoryId,
      status: p.status,
      lifecycle: p.lifecycleStatus,
      sportIds: p.sportIds,
      specs: Object.keys(p.specifications),
      specifications: p.specifications,
      img0: img0?.src,
      authenticPrimary: Boolean(primary && exists(primary.src)),
      primarySrc: primary?.src,
      placeholder: img0?.src?.endsWith(".svg") || img0?.licence === "kitletics-owned",
      catalogMedia: Boolean(CATALOG_PRODUCT_MEDIA[p.id]),
    };
  });

const tennisPadel = products.filter(
  (p) =>
    p.sportIds.includes("sport-padel") &&
    (p.categoryId.startsWith("cat-tennis") ||
      p.categoryId === "cat-running-shoes" ||
      p.categoryId === "cat-training-shoes"),
);

const payload = {
  generatedAt: new Date().toISOString(),
  byCategory: Object.fromEntries(
    CATS.map((c) => {
      const list = rows.filter((r) => r.categoryId === c);
      return [
        c,
        {
          n: list.length,
          published: list.filter((r) => r.status === "published").length,
          draft: list.filter((r) => r.status === "draft").length,
          authentic: list.filter((r) => r.authenticPrimary).length,
          ids: list.map((r) => `${r.status[0]} ${r.id} | ${r.brand} | ${r.name} | specs=${r.specs.join(",") || "∅"} | img=${r.primarySrc ?? r.img0}`),
        },
      ];
    }),
  ),
  tennisOrRunningWithPadelSport: tennisPadel.map((p) => ({
    id: p.id,
    slug: p.slug,
    categoryId: p.categoryId,
    sportIds: p.sportIds,
    name: p.fullName,
  })),
};

fs.writeFileSync(
  path.join(ROOT, "data/staging/padel-secondary-inventory.json"),
  JSON.stringify(payload, null, 2),
);
console.log(JSON.stringify({
  byCategory: Object.fromEntries(
    Object.entries(payload.byCategory).map(([k, v]) => [
      k,
      { n: v.n, published: v.published, draft: v.draft, authentic: v.authentic },
    ]),
  ),
  leak: payload.tennisOrRunningWithPadelSport.length,
}, null, 2));
