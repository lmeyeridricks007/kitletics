import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { getProductsByBrand, getProductFamilies } from "@/repositories/products";
import { getReviews } from "@/repositories";

const PROD = { isDev: false as const };

function dump(id: string, slug: string) {
  const products = getProductsByBrand(id, PROD);
  const cats = [...new Set(products.map((p) => p.categoryId))];
  const fam = getProductFamilies().filter((f) => f.brandId === id);
  const reviews = getReviews(PROD);
  const reviewSlugs = products.map((p) => {
    const r = reviews.find((x) => x.productId === p.id);
    return `${p.slug}:${r ? "review" : "NO_REVIEW"}`;
  });
  console.log(
    JSON.stringify(
      {
        slug,
        hold: classifyBrandHubHold({ id, slug }, PROD),
        published: products.length,
        products: products.map((p) => `${p.slug}:${p.status}`),
        categories: cats,
        families: fam.map((f) => f.slug),
        reviews: reviewSlugs,
      },
      null,
      2,
    ),
  );
}

dump("brand-amazfit", "amazfit");
dump("brand-samsung", "samsung");
dump("brand-decathlon", "decathlon");

const draft = getProductsByBrand("brand-decathlon", { isDev: true });
console.log(
  "decathlon isDev",
  draft.map((p) => `${p.slug}:${p.status}`),
);
