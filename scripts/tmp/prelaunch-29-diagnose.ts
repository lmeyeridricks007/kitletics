import { getComparisonBySlug } from "../../src/repositories/editorial";
import { getProductById } from "../../src/repositories/products";
import { getComparisonPageData, resolveCanonicalComparisonSlug } from "../../src/lib/comparison/get-comparison-page-data";
import { getLaunchEligibility } from "../../src/domain/launch";

const getP = getProductById;

const slugs = [
  "lululemon-hotty-hot-vs-janji-pace-short",
  "theragun-prime-vs-renpho-r3",
  "triggerpoint-grid-vs-grid-x",
  "oofos-ooriginal-vs-hoka-ora-recovery-slide",
];

for (const slug of slugs) {
  const cmp = getComparisonBySlug(slug, { isDev: false });
  const products = (cmp?.productIds ?? []).map((id) => {
    const p = getP(id, { isDev: false });
    const pDev = getP(id, { isDev: true });
    return {
      id,
      foundProd: !!p,
      foundDev: !!pDev,
      slug: p?.slug ?? pDev?.slug,
      status: p?.status ?? pDev?.status,
      categoryId: p?.categoryId ?? pDev?.categoryId,
      sportIds: p?.sportIds ?? pDev?.sportIds,
    };
  });
  const data = getComparisonPageData(slug, { isDev: false });
  const elig = cmp
    ? getLaunchEligibility({ kind: "comparison", entity: cmp }, { isDev: false })
    : null;
  const canon = resolveCanonicalComparisonSlug(slug, { isDev: false });
  console.log(
    JSON.stringify(
      {
        slug,
        cmpFound: !!cmp,
        cmpStatus: cmp?.status,
        productIds: cmp?.productIds,
        products,
        pageData: !!data,
        pageProducts: data?.products?.length,
        elig: elig
          ? {
              disposition: elig.disposition,
              quality: elig.quality,
              reasons: elig.reasons.map((r) => r.code),
            }
          : null,
        canon,
      },
      null,
      2,
    ),
  );
}
