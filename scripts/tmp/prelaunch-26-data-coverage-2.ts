import { getProducts, getProductVariants } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";

const opts = { isDev: false as const };
const shoes = getProducts().filter(
  (p) => isPubliclyVisible(p, opts) && p.categoryId === "cat-running-shoes",
);
const gf = new Map<string, number>();
for (const p of shoes) {
  const v = String(p.specifications?.genderFit ?? "missing");
  gf.set(v, (gf.get(v) || 0) + 1);
}

const watches = getProducts().filter(
  (p) => isPubliclyVisible(p, opts) && p.categoryId === "cat-gps-watches",
);
const wk = [
  "displayType",
  "touchscreen",
  "multiBandGps",
  "maps",
  "music",
  "battery",
  "weight",
] as const;
const cov: Record<string, number> = {};
for (const k of wk) {
  cov[k] = watches.filter(
    (p) => p.specifications?.[k] != null && p.specifications[k] !== "",
  ).length;
}

const weights = shoes
  .map((p) => Number(p.specifications.weight))
  .filter((n) => !Number.isNaN(n))
  .sort((a, b) => a - b);
const plated = shoes.filter(
  (p) =>
    p.specifications.plate === true ||
    p.specifications.plate === "true" ||
    p.specifications.plate === 1,
);

const shoeIds = new Set(shoes.map((p) => p.id));
const by = { men: 0, women: 0, unisex: 0 };
for (const v of getProductVariants().filter((v) => shoeIds.has(v.productId))) {
  by[v.audience]++;
}

console.log(
  JSON.stringify(
    {
      genderFit: [...gf.entries()],
      watches: { n: watches.length, cov },
      weight: {
        n: weights.length,
        min: weights[0],
        med: weights[Math.floor(weights.length / 2)],
        max: weights.at(-1),
        plated: plated.length,
      },
      variants: by,
    },
    null,
    2,
  ),
);
