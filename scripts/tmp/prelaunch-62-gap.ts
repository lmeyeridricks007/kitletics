import {
  assessProductLaunchQuality,
  getLaunchEligibility,
} from "@/domain/launch";
import { canPublishProduct } from "@/domain/catalog/publishability";
import { getProductBySlug } from "@/repositories/products";
import {
  getAlternativesFromGraph,
  getDirectCompetitors,
} from "@/repositories/relationships";
import { getComparisons, getReviews, getBestGuides } from "@/repositories";
import { getOffersForProduct } from "@/repositories/commerce";
import { getPrimaryProductMedia, isAuthenticProductMedia } from "@/lib/product/media";
import { getVariantsForProduct } from "@/repositories/products";

const PROD = { isDev: false as const };
const slugs = [
  "buff-coolnet-uv",
  "buff-merino-lightweight",
  "buff-original",
  "buff-polar",
  "new-balance-fuelcell-rebel-v4",
];

for (const slug of slugs) {
  const p = getProductBySlug(slug, PROD)!;
  const a = assessProductLaunchQuality(p, PROD);
  const e = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  const pub = canPublishProduct(p);
  const media = getPrimaryProductMedia(p);
  const reviews = getReviews(PROD).filter((r) => r.productId === p.id);
  const comps = getComparisons(PROD).filter((c) =>
    c.productIds.includes(p.id),
  );
  const best = getBestGuides(PROD).filter((g) =>
    g.recommendations?.some((r) => r.productId === p.id),
  );
  let variants: { audience?: string }[] = [];
  try {
    variants = getVariantsForProduct(p.id) ?? [];
  } catch {
    variants = [];
  }
  console.log(
    JSON.stringify(
      {
        slug,
        id: p.id,
        categoryId: p.categoryId,
        status: p.status,
        noindex: p.noindex,
        descLen: (p.shortDescription ?? "").trim().length,
        desc: p.shortDescription,
        specs: p.specifications,
        strengths: p.strengths,
        weaknesses: p.weaknesses,
        verdict: p.verdict,
        quality: a.quality,
        score: a.decisionScore,
        flags: a.decisionFlags,
        reasons: a.reasons,
        elig: { quality: e.quality, disposition: e.disposition },
        publish: pub,
        media: {
          src: media?.src,
          authentic: isAuthenticProductMedia(media),
        },
        offers: getOffersForProduct(p.id).length,
        alts: getAlternativesFromGraph(p.id).map((r) => r.targetProductId),
        competitors: getDirectCompetitors(p.id).map((r) => r.targetProductId),
        comps: comps.map((c) => c.slug),
        reviews: reviews.map((r) => ({ slug: r.slug, status: r.status, noindex: r.noindex })),
        best: best.map((g) => g.slug),
        variants: variants.map((v) => v.audience),
      },
      null,
      2,
    ),
  );
}
