import { getSportBySlug, getProductsByCategory, getCategoriesBySport } from "@/repositories";
import { getLaunchEligibility, isLaunchListable } from "@/domain/launch";
import { canFeatureProduct } from "@/lib/product/media";
import { getVerticalSportPolicy } from "@/content/launch/vertical-strategy";
import { assembleCategoryPage } from "@/lib/catalog/assemble";
import { getSportHubData } from "@/lib/sport-hub/get-sport-hub-data";

for (const slug of ["padel", "tennis", "badminton", "pickleball", "squash", "racket"]) {
  const s = getSportBySlug(slug)!;
  const el = getLaunchEligibility({ kind: "sport", entity: s });
  const pol = getVerticalSportPolicy(s.id);
  const cats = getCategoriesBySport(s.id);
  let raw = 0;
  let list = 0;
  for (const c of cats) {
    for (const p of getProductsByCategory(c.id)) {
      if (!p.sportIds.includes(s.id)) continue;
      raw += 1;
      if (
        canFeatureProduct(p) &&
        isLaunchListable(getLaunchEligibility({ kind: "product", entity: p }))
      ) {
        list += 1;
      }
    }
  }
  console.log({ slug, sportDisp: el.disposition, mode: pol.mode, raw, list });
}

const padel = assembleCategoryPage({ sportSlug: "padel", pathSegment: "rackets" });
const tennis = assembleCategoryPage({ sportSlug: "tennis", pathSegment: "rackets" });
console.log("assemble", {
  padel: [padel?.productCount, padel?.catalog.total],
  tennis: [tennis?.productCount, tennis?.catalog.total],
});
const hub = getSportHubData({ sportSlug: "padel" });
console.log("padel hub", {
  best: hub?.bestSection?.products.length,
  shop: hub?.shopCategories.map((c) => `${c.label}:${c.productCount}`),
});
