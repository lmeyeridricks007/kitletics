/**
 * One-shot padel baseline inventory for docs/padel/PADEL-BASELINE-AUDIT.md
 */
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { reviews } from "@/content/reviews";
import { recommendations } from "@/content/recommendations";
import { offers } from "@/content/offers";
import { evidence } from "@/content/evidence";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, comparisons, gearSetups } from "@/content/editorial";
import { tools } from "@/content/tools";
import { productFamilies } from "@/content/families";
import { padelAllAlternatives, padelAllRelationships } from "@/content/padel";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { getVariantsForProduct } from "@/repositories/products";
import { rankedReviewCandidates } from "@/content/reviews";

const PADEL = "sport-padel";
const padel = products.filter((p) => p.sportIds.includes(PADEL));
const padelOnly = products.filter(
  (p) => p.sportIds.includes(PADEL) && p.sportIds.length === 1,
);
const dual = products.filter(
  (p) => p.sportIds.includes(PADEL) && p.sportIds.includes("sport-tennis"),
);

const cats = new Map<string, typeof padel>();
for (const p of padel) {
  const list = cats.get(p.categoryId) ?? [];
  list.push(p);
  cats.set(p.categoryId, list);
}

function counts(list: typeof padel) {
  const byStatus: Record<string, number> = {};
  const byLife: Record<string, number> = {};
  for (const p of list) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    byLife[p.lifecycleStatus] = (byLife[p.lifecycleStatus] ?? 0) + 1;
  }
  return { n: list.length, byStatus, byLife };
}

console.log("=== PRODUCTS ===");
console.log("padel sportIds", padel.length);
console.log("padel-only", padelOnly.length);
console.log("dual tennis+padel", dual.length);
console.log("overall", counts(padel));
for (const [cat, list] of [...cats.entries()].sort()) {
  console.log("CAT", cat, counts(list));
}

const brandIds = [...new Set(padel.map((p) => p.brandId))];
console.log("\n=== BRANDS ON PADEL PRODUCTS ===");
for (const id of brandIds.sort()) {
  const b = brands.find((x) => x.id === id);
  const n = padel.filter((p) => p.brandId === id).length;
  const catsFor = [
    ...new Set(padel.filter((p) => p.brandId === id).map((p) => p.categoryId)),
  ];
  console.log(
    `${id}\t${b?.name ?? "?"}\t${b?.slug ?? "?"}\t${n}\t${catsFor.join(",")}`,
  );
}

console.log("\n=== FAMILIES ===", productFamilies.filter((f) =>
  f.productIds.some((id) => padel.some((p) => p.id === id)),
).length);
for (const f of productFamilies.filter((f) =>
  f.productIds.some((id) => padel.some((x) => x.id === id)),
)) {
  console.log(f.id, f.name, f.productIds.join("|"));
}

const padelIds = new Set(padel.map((p) => p.id));
const padelReviews = reviews.filter((r) => padelIds.has(r.productId));
console.log("\n=== REVIEWS ===", padelReviews.length);
const revStatus: Record<string, number> = {};
for (const r of padelReviews) {
  revStatus[r.status] = (revStatus[r.status] ?? 0) + 1;
}
console.log("status", revStatus);
console.log(
  "products with reviewId",
  padel.filter((p) => p.reviewId).length,
);

const candByProduct = new Map<string, string[]>();
for (const c of rankedReviewCandidates) {
  if (!padelIds.has(c.review.productId)) continue;
  const list = candByProduct.get(c.review.productId) ?? [];
  list.push(c.source);
  candByProduct.set(c.review.productId, list);
}
const sourceCounts: Record<string, number> = {};
for (const sources of candByProduct.values()) {
  for (const s of sources) sourceCounts[s] = (sourceCounts[s] ?? 0) + 1;
}
console.log("candidate sources", sourceCounts);
console.log("winning review slugs sample", padelReviews.slice(0, 8).map((r) => r.slug));

const recs = recommendations.filter((r) => r.sportId === PADEL);
console.log("\n=== RECS ===", recs.length);
console.log(
  "products with recs",
  padel.filter((p) => recs.some((r) => r.productId === p.id)).length,
);

const padelOffers = offers.filter((o) => padelIds.has(o.productId));
const byRegion: Record<string, number> = {};
for (const o of padelOffers) {
  byRegion[o.region] = (byRegion[o.region] ?? 0) + 1;
}
const genericHome = padelOffers.filter(
  (o) =>
    o.url === "https://www.amazon.nl/" ||
    o.url === "https://www.amazon.de/" ||
    o.url === "https://www.amazon.co.uk/" ||
    o.url === "https://www.decathlon.nl/",
).length;
console.log("\n=== OFFERS ===", padelOffers.length, byRegion);
console.log("generic homepage URLs", genericHome);
console.log(
  "products with NL offer",
  padel.filter((p) =>
    padelOffers.some((o) => o.productId === p.id && o.region === "NL"),
  ).length,
);

const evIds = new Set(padel.flatMap((p) => p.evidenceIds));
console.log("\n=== EVIDENCE ids on products ===", evIds.size);
console.log(
  "products with evidenceIds",
  padel.filter((p) => p.evidenceIds.length > 0).length,
);
const padelEv = evidence.filter(
  (e) =>
    evIds.has(e.id) ||
    /padel/i.test(e.id) ||
    /padel/i.test(e.source) ||
    /padel/i.test(e.summary),
);
console.log("evidence matching padel", padelEv.length);

console.log("\n=== EDITORIAL ===");
console.log(
  "best",
  bestGuides.filter((g) => g.sportId === PADEL).map((g) => g.slug),
);
console.log(
  "buying",
  buyingGuides.filter((g) => g.sportId === PADEL).map((g) => g.slug),
);
console.log(
  "setups",
  gearSetups.filter((g) => g.sportId === PADEL).map((g) => g.slug),
);
const padelCmps = comparisons.filter(
  (c) =>
    c.categoryId?.startsWith("cat-padel") ||
    c.productIds.some((id) => padelIds.has(id)),
);
console.log("comparisons", padelCmps.length, padelCmps.map((c) => c.slug));
console.log(
  "tools",
  tools
    .filter((t) => t.sportIds.includes(PADEL))
    .map((t) => `${t.slug}:${t.available}`),
);
console.log("alts", padelAllAlternatives.length);
console.log("rels", padelAllRelationships.length);

console.log("\n=== MEDIA ===");
let svg = 0,
  png = 0,
  jpg = 0,
  registered = 0,
  empty = 0;
const srcs = new Map<string, number>();
for (const p of padel) {
  const src = p.images[0]?.src;
  if (!src) empty++;
  else {
    srcs.set(src, (srcs.get(src) ?? 0) + 1);
    if (src.endsWith(".svg")) svg++;
    else if (src.endsWith(".png")) png++;
    else if (/\.jpe?g$/i.test(src)) jpg++;
  }
  if (CATALOG_PRODUCT_MEDIA[p.id]) registered++;
}
console.log({ svg, png, jpg, empty, registered });
const reused = [...srcs.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
console.log("reused srcs", reused.slice(0, 20));

console.log("\n=== VARIANTS ===");
let withVar = 0;
for (const p of padel) {
  if (getVariantsForProduct(p.id).length) withVar++;
}
console.log("products with ProductVariant rows", withVar);

console.log("\n=== SPECS sample rackets ===");
const rackets = padel.filter((p) => p.categoryId === "cat-padel-rackets");
const keys = [
  "shape",
  "balance",
  "weightMin",
  "weightMax",
  "core",
  "face",
  "sweetSpot",
  "powerPositioning",
  "controlPositioning",
  "thicknessMm",
  "surfaceTexture",
  "feel",
];
for (const k of keys) {
  const n = rackets.filter((p) => p.specifications[k] != null).length;
  console.log(k, n, "/", rackets.length);
}

console.log("\n=== SHOE SPECS ===");
const shoes = padel.filter((p) => p.categoryId === "cat-padel-shoes");
const shoeKeys = [
  "outsole",
  "cushioning",
  "support",
  "genderFit",
  "weight",
  "upper",
  "courtType",
];
for (const k of shoeKeys) {
  const n = shoes.filter((p) => p.specifications[k] != null).length;
  console.log(k, n, "/", shoes.length);
}

console.log("\n=== SLUGS BY CAT ===");
for (const [cat, list] of [...cats.entries()].sort()) {
  console.log("\n#", cat);
  for (const p of list) {
    console.log(
      `${p.status}\t${p.lifecycleStatus}\t${p.slug}\t${p.brandId}\t${p.images[0]?.src ?? "-"}`,
    );
  }
}
