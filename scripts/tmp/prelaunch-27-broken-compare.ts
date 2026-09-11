import {
  getBuyingGuides,
  getComparisons,
  getProductById,
} from "@/repositories";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { getLaunchEligibility } from "@/domain/launch";

const PROD = { isDev: false as const };
const g = getBuyingGuides(PROD).find((x) => x.sportId === "sport-running");
if (g) console.log("guide", g.slug, assessGuideQuality(g).status);

for (const slug of [
  "lululemon-hotty-hot-vs-janji-pace-short",
  "theragun-prime-vs-renpho-r3",
  "triggerpoint-grid-vs-grid-x",
  "oofos-ooriginal-vs-hoka-ora-recovery-slide",
]) {
  const c = getComparisons(PROD).find((x) => x.slug === slug);
  if (!c) {
    console.log(JSON.stringify({ slug, missing: true }));
    continue;
  }
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  const products = (c.productIds || []).map((id) => getProductById(id, PROD));
  console.log(
    JSON.stringify({
      slug,
      status: c.status,
      elig: elig.disposition,
      quality: elig.quality,
      reasons: elig.reasons,
      products: products.map((p) => ({
        slug: p?.slug,
        status: p?.status,
        cat: p?.categoryId,
        sports: p?.sportIds,
      })),
    }),
  );
}
