import { getBuyingGuides, getComparisons } from "@/repositories/editorial";
import { getProductById } from "@/repositories/products";
import { getCategoryById } from "@/repositories/sports";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";

const PROD = { isDev: false as const };
for (const slug of [
  "gel-vs-drink-mix-vs-chews",
  "caffeine-in-running-fuel-explained",
]) {
  const g = getBuyingGuides(PROD).find((x) => x.slug === slug);
  console.log(slug, {
    sportId: g?.sportId,
    categoryId: g?.categoryId,
    status: g?.status,
  });
}
const clothingComps = [
  "tracksmith-session-short-vs-janji-multi-short",
  "patagonia-strider-pro-vs-rabbit-fuel-n-fly",
  "patagonia-houdini-vs-brooks-canopy",
  "salomon-bonatti-vs-janji-rainrunner",
  "tracksmith-twilight-half-vs-nike-fast-tight",
  "nike-miler-vs-patagonia-capilene-cool",
];
for (const slug of clothingComps) {
  const c = getComparisons(PROD).find((x) => x.slug === slug);
  if (!c) {
    console.log(slug, "MISSING");
    continue;
  }
  const cats = c.productIds.map((id) => {
    const p = getProductById(id, PROD);
    const cat = p ? getCategoryById(p.categoryId, PROD) : undefined;
    return {
      p: p?.slug,
      cat: cat?.slug,
      soft: cat ? isSoftGatedCategory(cat) : null,
    };
  });
  console.log(slug, cats);
}
