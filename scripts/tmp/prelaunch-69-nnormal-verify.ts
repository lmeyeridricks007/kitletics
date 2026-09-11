import { getBrandBySlug, getProductsByBrand, getProductBySlug, getProducts } from "@/repositories/products";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { canPublishProduct } from "@/domain/catalog/publishability";
import { getPrimaryProductMedia, isAuthenticProductMedia } from "@/lib/product/media";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch/get-launch-eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";

const PROD = { isDev: false as const };
const brand = getBrandBySlug("nnormal", PROD)!;
const products = getProductsByBrand(brand.id, PROD);
console.log("hold", classifyBrandHubHold(brand, PROD));
console.log("products", products.map((p) => p.slug));
for (const p of products) {
  const media = getPrimaryProductMedia(p);
  const pub = canPublishProduct(p);
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  console.log(p.slug, {
    authentic: Boolean(media && isAuthenticProductMedia(media)),
    mediaSrc: media?.src,
    publishOk: pub.ok,
    reasons: pub.reasons,
    elig: elig.disposition,
    quality: elig.quality,
  });
}
const hub = getBrandHubPageData({ brandSlug: "nnormal", region: "NL" });
const belig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
console.log("hubCount", hub?.publishedProductCount);
console.log("hubSummary", hub?.brand.summary);
console.log("howDiffer", hub && "howLinesDiffer" in hub ? (hub as { howLinesDiffer?: string }).howLinesDiffer : undefined);
console.log("keys", hub ? Object.keys(hub) : null);
console.log("brandElig", belig.disposition, belig.quality, isIndexableEligibility(belig));

const rels = getAllProductRelationships();
const all = getProducts(PROD);
for (const slug of ["nnormal-kjerag-02", "nnormal-tomir-02"]) {
  const p = getProductBySlug(slug, PROD)!;
  const gate = canPublishAlternativesPage(p, rels);
  const hold = classifyAlternativesHold(p, rels, all);
  const elig = getLaunchEligibility({ kind: "alternatives", entity: p }, PROD);
  console.log("alts", slug, {
    gate: gate.ok,
    reasons: gate.reasons,
    hold,
    elig: elig.disposition,
    codes: elig.reasons.map((r) => r.code),
  });
}
