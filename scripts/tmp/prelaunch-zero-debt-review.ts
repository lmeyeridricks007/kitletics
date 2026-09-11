/**
 * ZERO KNOWN DEBT REVIEW — live inventory. READ-ONLY.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-zero-debt-review.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getCategories,
  getProducts,
  getBrands,
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getTools,
  getProductById,
  getBrandById,
  getSportById,
} from "@/repositories";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessEditorialReadiness,
  assessProductLaunchQuality,
  assessReviewLaunchQuality,
  assessBestGuideLaunchQuality,
  assessComparisonLaunchQuality,
} from "@/domain/launch";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { getAllProductRelationships } from "@/repositories/relationships";
import { isAlternativeType } from "@/domain/relationships/types";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { getPrimaryProductMedia, isAuthenticProductMedia } from "@/lib/product/media";
import { PRODUCT_GALLERY_MEDIA } from "@/content/product-gallery-media";
import { getOffers } from "@/repositories/commerce";
import { OFFER_URL_VALIDATION } from "@/content/offers-url-validation";
import { REGIONS } from "@/domain/shared/types";
import { REGION_COMMERCE_COVERAGE } from "@/lib/region/commerce-readiness";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  tokenize,
  jaccard,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";
import { EDITORIAL_INTENT_HOLD_PATHS } from "@/content/best-guides-p46-intent-roles";
import { CONTENT_UNIQUENESS_REVIEW_HOLDS } from "@/content/launch/content-uniqueness-holds";
import { BLOCKED_EVIDENCE_REVIEW_SLUGS } from "@/content/launch/blocked-evidence-reviews";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { BRAND_HUB_UNIQUENESS_HOLD_SLUGS } from "@/content/brand-hub-uniqueness-holds";
import { readFileSync as readFs } from "fs";

const AUDIT_NOW = new Date(
  process.env.ZERO_DEBT_AUDIT_NOW ?? "2026-09-11T09:00:00.000Z",
);
const PROD = { isDev: false as const, now: AUDIT_NOW };
const DEV = { isDev: true as const, now: AUDIT_NOW };
const OUT = join(process.cwd(), "docs/prelaunch/data");
const RC = join(OUT, process.env.ZERO_DEBT_RC ?? "rc-v3");
mkdirSync(RC, { recursive: true });

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function sportSlug(ids: string[] | undefined): string {
  if (!ids?.length) return "";
  return resolveEntityVerticalPolicy(ids).slug;
}

function reviewPlain(review: ReturnType<typeof getReviews>[number]): string {
  return [
    review.summary,
    review.verdict,
    review.bottomLine,
    review.testingContext,
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...(review.whoShouldBuy ?? []),
    ...(review.whoShouldAvoid ?? []),
    ...(review.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function main() {
  const sitemapEntries = sitemapFn();
  const sitemapPaths = new Set(
    sitemapEntries.map((e) => {
      const u = e.url;
      if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
      return u.replace(siteConfig.url, "") || "/";
    }),
  );
  const lastmodPresent = sitemapEntries.filter((e) => e.lastModified).length;
  const lastmodMissing = sitemapEntries.length - lastmodPresent;

  const products = getProducts(PROD);
  const productsDev = getProducts(DEV);
  const reviews = getReviews(PROD);
  const best = getBestGuides(PROD);
  const guides = getBuyingGuides(PROD);
  const comparisons = getComparisons(PROD);
  const brands = getBrands(PROD);
  const categories = getCategories(PROD);
  const tools = getTools(PROD);
  const rels = getAllProductRelationships();

  // --- Products ---
  const productQuality: Record<string, number> = {};
  const productQualityRunning: Record<string, number> = {};
  const productQualityHeldVertical: Record<string, number> = {};
  const nmwRunning: string[] = [];
  const thinRunning: string[] = [];
  const blockedRunning: string[] = [];
  const incompleteRunning: string[] = [];
  let productIndexable = 0;
  let productReady = 0;
  let productHeldVertical = 0;
  let productAuthenticPrimary = 0;
  let productMissingAuthentic = 0;
  const missingAuthentic: string[] = [];
  let galleryOnIndexable = 0;
  let indexableProducts = 0;
  const galleryDepth: Record<string, number> = { 0: 0, 1: 0, "2+": 0 };

  for (const p of products) {
    const q = assessProductLaunchQuality(p, PROD);
    const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
    const vert = sportSlug(p.sportIds);
    bump(productQuality, q.quality);
    const indexable = isIndexableEligibility(elig);
    if (indexable) {
      productIndexable++;
      indexableProducts++;
    }
    if (q.quality === "LAUNCH_READY") productReady++;
    if (vert === "running") {
      bump(productQualityRunning, q.quality);
      if (q.quality === "NEEDS_MINOR_WORK") nmwRunning.push(p.slug);
      if (q.quality === "THIN") thinRunning.push(p.slug);
      if (q.quality === "BLOCKED") blockedRunning.push(p.slug);
      if (q.quality === "INCOMPLETE") incompleteRunning.push(p.slug);
    } else {
      bump(productQualityHeldVertical, q.quality);
      if (!indexable) productHeldVertical++;
    }
    const media = getPrimaryProductMedia(p);
    if (isAuthenticProductMedia(media)) productAuthenticPrimary++;
    else {
      productMissingAuthentic++;
      if (indexable) missingAuthentic.push(p.slug);
    }
    const extras = PRODUCT_GALLERY_MEDIA[p.id]?.length ?? 0;
    if (indexable) {
      if (extras >= 2) galleryDepth["2+"]++;
      else if (extras === 1) galleryDepth["1"]++;
      else galleryDepth["0"]++;
      if (extras > 0) galleryOnIndexable++;
    }
  }

  const draftOnly = productsDev.filter(
    (p) => !products.some((x) => x.id === p.id),
  );
  const draftByStatus: Record<string, number> = {};
  for (const p of productsDev) bump(draftByStatus, p.status);

  // --- Reviews ---
  const reviewQuality: Record<string, number> = {};
  const reviewWork: Record<string, number> = {};
  const reviewQualityIndexable: Record<string, number> = {};
  let reviewIndexable = 0;
  let reviewEditorialReady = 0;
  let reviewJunk = 0;
  const junkSlugs: string[] = [];
  const reviewUniqHolds = CONTENT_UNIQUENESS_REVIEW_HOLDS.size;
  const blockedEvidence = [...BLOCKED_EVIDENCE_REVIEW_SLUGS];
  const uniquenessIndexable: Record<string, number> = {};
  let maxPeerJaccardIndexable = 0;
  let maxPeerPair = "";

  type ClusterItem = {
    slug: string;
    categoryId: string;
    indexable: boolean;
    tokens: Set<string>;
    text: string;
  };
  const clusterItems: ClusterItem[] = [];

  for (const r of reviews) {
    const q = assessReviewLaunchQuality(r, PROD);
    const ed = assessEditorialReadiness({ kind: "review", entity: r }, PROD);
    const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
    const indexable = isIndexableEligibility(elig);
    bump(reviewQuality, q.quality);
    bump(reviewWork, ed.workState);
    if (ed.ready) reviewEditorialReady++;
    if (indexable) {
      reviewIndexable++;
      bump(reviewQualityIndexable, q.quality);
    }
    const product = getProductById(r.productId, PROD);
    const brand = product ? getBrandById(product.brandId, PROD) : undefined;
    const enriched = product ? enrichReviewForPage(r, product, { brand }) : r;
    const lead = `${enriched.summary ?? ""}\n${enriched.verdict ?? ""}`;
    if (isReportOrJunkVoice(lead) || (enriched.sections ?? []).some((s) => isReportOrJunkVoice(s.body))) {
      reviewJunk++;
      junkSlugs.push(r.slug);
    }
    const names = [
      product?.fullName,
      product?.name,
      brand?.name,
    ].filter(Boolean) as string[];
    const scrubbed = normalizeText(
      scrubEntityNames(reviewPlain(enriched), names),
    ).slice(0, 8000);
    clusterItems.push({
      slug: r.slug,
      categoryId: product?.categoryId ?? "unknown",
      indexable,
      tokens: new Set(tokenize(scrubbed)),
      text: scrubbed,
    });
  }

  const byCat = new Map<string, ClusterItem[]>();
  for (const it of clusterItems) {
    if (!it.indexable) continue;
    const list = byCat.get(it.categoryId) ?? [];
    list.push(it);
    byCat.set(it.categoryId, list);
  }
  for (const [, catItems] of byCat) {
    for (let i = 0; i < catItems.length; i++) {
      let max = 0;
      let peer = "";
      for (let j = 0; j < catItems.length; j++) {
        if (i === j) continue;
        const s = jaccard(catItems[i]!.tokens, catItems[j]!.tokens);
        if (s > max) {
          max = s;
          peer = catItems[j]!.slug;
        }
      }
      const klass = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: scaffoldHitCount(catItems[i]!.text),
        uniqueSignalRatio: 0.5,
      });
      bump(uniquenessIndexable, klass);
      if (max > maxPeerJaccardIndexable) {
        maxPeerJaccardIndexable = max;
        maxPeerPair = `${catItems[i]!.slug} ~ ${peer}`;
      }
    }
  }

  // --- Best ---
  const bestQuality: Record<string, number> = {};
  const bestWork: Record<string, number> = {};
  let bestIndexable = 0;
  let bestReady = 0;
  let bestThinIndexable = 0;
  const bestIntentHolds = [...EDITORIAL_INTENT_HOLD_PATHS];
  const bestHeld: { slug: string; quality: string; sport: string }[] = [];

  for (const g of best) {
    const q = assessBestGuideLaunchQuality(g, PROD);
    const ed = assessEditorialReadiness({ kind: "best-guide", entity: g }, PROD);
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    bump(bestQuality, q.quality);
    bump(bestWork, ed.workState);
    const indexable = isIndexableEligibility(elig);
    if (indexable) bestIndexable++;
    if (ed.ready) bestReady++;
    if (indexable && q.quality === "THIN") bestThinIndexable++;
    if (!indexable) {
      bestHeld.push({
        slug: g.slug,
        quality: q.quality,
        sport: sportSlug(g.sportIds),
      });
    }
  }

  // --- Guides ---
  const guideStatus: Record<string, number> = {};
  const guideWork: Record<string, number> = {};
  let guideIndexable = 0;
  let guideReady = 0;
  const guideNotComplete: { slug: string; status: string; issues: string[] }[] = [];

  for (const g of guides) {
    const aq = assessGuideQuality(g);
    const ed = assessEditorialReadiness(
      { kind: "buying-guide", entity: g },
      PROD,
    );
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
    bump(guideStatus, aq.status);
    bump(guideWork, ed.workState);
    if (isIndexableEligibility(elig)) guideIndexable++;
    if (ed.ready) guideReady++;
    if (aq.status !== "complete") {
      guideNotComplete.push({
        slug: g.slug,
        status: aq.status,
        issues: aq.issues.slice(0, 4),
      });
    }
  }

  // --- Comparisons ---
  const cmpQuality: Record<string, number> = {};
  const cmpWork: Record<string, number> = {};
  let cmpIndexable = 0;
  let cmpReady = 0;
  let indexableBrokenCmp = 0;
  const listedBrokenInPublished: string[] = [];
  const listedBroken = [...COMPARISON_BROKEN_PEER_SLUGS];
  const thinCmp: string[] = [];
  const needsDiffCmp: string[] = [];

  for (const c of comparisons) {
    const q = assessComparisonLaunchQuality(c, PROD);
    const ed = assessEditorialReadiness({ kind: "comparison", entity: c }, PROD);
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
    bump(cmpQuality, q.quality);
    bump(cmpWork, ed.workState);
    const indexable = isIndexableEligibility(elig);
    if (indexable) cmpIndexable++;
    if (ed.ready) cmpReady++;
    if (listedBroken.includes(c.slug)) listedBrokenInPublished.push(c.slug);
    if (indexable) {
      const missing = (c.productIds ?? []).filter((id) => !getProductById(id, PROD));
      if (missing.length) indexableBrokenCmp++;
    }
    if (q.quality === "THIN") thinCmp.push(c.slug);
    if (ed.workState === "NEEDS_UNIQUE_REWRITE" || ed.workState === "NEEDS_INTENT_DIFFERENTIATION") {
      needsDiffCmp.push(c.slug);
    }
  }

  // --- Alternatives ---
  const altHold: Record<string, number> = {};
  let altPages = 0;
  let altReady = 0;
  let altIndexable = 0;
  const unexplainedAlts: string[] = [];
  const marketHolds: string[] = [];
  const dupIntentHolds: string[] = [];
  const uniquenessAltHolds = [...ALTERNATIVES_UNIQUENESS_HOLD_SLUGS];

  for (const product of products) {
    const alts = rels.filter(
      (r) =>
        r.sourceProductId === product.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    if (alts.length === 0) continue;
    altPages++;
    const editorial = assessEditorialReadiness(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const hold = classifyAlternativesHold(product, rels, products);
    bump(altHold, hold);
    if (editorial.ready) altReady++;
    if (isIndexableEligibility(elig)) altIndexable++;
    if (hold === "THIN_UNEXPLAINED") {
      unexplainedAlts.push(product.slug);
    }
    if (hold === "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET") marketHolds.push(product.slug);
    if (hold === "HOLD_DUPLICATE_INTENT") dupIntentHolds.push(product.slug);
  }

  // --- Brands ---
  const brandClass: Record<string, number> = {};
  let brandIndexable = 0;
  let brandReady = 0;
  const uniquenessBrandHolds = [...BRAND_HUB_UNIQUENESS_HOLD_SLUGS];

  for (const b of brands) {
    const klass = classifyBrandHubHold(b, PROD);
    const elig = getLaunchEligibility({ kind: "brand", entity: b }, PROD);
    bump(brandClass, klass);
    if (isIndexableEligibility(elig)) brandIndexable++;
    if (klass === "READY") brandReady++;
  }

  // --- Categories ---
  let catIndexable = 0;
  let catEditorialReady = 0;
  let catEditorialTotal = 0;
  const catHolds: Record<string, number> = {};
  const emptyShells: string[] = [];
  const futureCats: string[] = [];

  for (const c of categories) {
    const href = getCategoryHref(c);
    const sport = getSportById(c.sportIds[0] ?? "", PROD);
    const sportElig = sport
      ? getLaunchEligibility({ kind: "sport", entity: sport }, PROD)
      : null;
    const soft = isSoftGatedCategory(c);
    const inSm = Boolean(href && sitemapPaths.has(href));
    const cfg = getCategoryPageConfig(sport?.slug ?? "running", c.slug);
    if (cfg) {
      catEditorialTotal++;
      if (cfg.decision && !soft) catEditorialReady++;
    }
    if (inSm) catIndexable++;
    else {
      if (soft) {
        bump(catHolds, "soft_gated");
        emptyShells.push(href ?? c.slug);
      } else if (sportElig && !isIndexableEligibility(sportElig)) {
        bump(catHolds, "vertical_hold");
        futureCats.push(href ?? c.slug);
      } else bump(catHolds, "other");
    }
  }

  // --- Tools ---
  let toolIndexable = 0;
  let toolReady = 0;
  let toolHeld = 0;
  for (const t of tools) {
    const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
    if (isIndexableEligibility(elig)) toolIndexable++;
    if (t.available) toolReady++;
    else toolHeld++;
    if (!isIndexableEligibility(elig) && t.available) toolHeld++;
  }
  // recount held as not indexable
  toolHeld = tools.length - toolIndexable;

  // --- Commerce ---
  const offers = getOffers();
  const offersByRegion: Record<string, number> = {};
  const offerValidation: Record<string, number> = { none: 0 };
  for (const o of offers) {
    bump(offersByRegion, o.region);
    const v = OFFER_URL_VALIDATION[o.id];
    if (!v) offerValidation.none++;
    else bump(offerValidation, v.state);
  }
  const overlayCount = Object.keys(OFFER_URL_VALIDATION).length;
  const overlayCheckedAt = Object.values(OFFER_URL_VALIDATION)
    .map((v) => v.checkedAt)
    .filter(Boolean)
    .sort();

  // --- Graph remaining WEAK (Fix 70 snapshot) ---
  let graph: Record<string, unknown> = {};
  try {
    graph = JSON.parse(
      readFs(join(process.cwd(), "docs/prelaunch/data/rc-70/graph-audit.json"), "utf8"),
    ) as Record<string, unknown>;
  } catch {
    graph = {};
  }

  const report = {
    auditClock: AUDIT_NOW.toISOString(),
    sitemap: {
      urls: sitemapEntries.length,
      lastmodPresent,
      lastmodMissing,
    },
    products: {
      total: products.length,
      ready: productReady,
      indexable: productIndexable,
      quality: productQuality,
      qualityRunning: productQualityRunning,
      qualityHeldVertical: productQualityHeldVertical,
      heldVerticalApprox: productHeldVertical,
      nmwRunning,
      thinRunning,
      blockedRunning,
      incompleteRunning,
      authenticPrimary: productAuthenticPrimary,
      missingAuthentic,
      missingAuthenticCount: productMissingAuthentic,
      galleryRegistryKeys: Object.keys(PRODUCT_GALLERY_MEDIA).length,
      galleryOnIndexable,
      indexableProducts,
      galleryDepthIndexable: galleryDepth,
      draftOnlyCount: draftOnly.length,
      draftByStatus,
    },
    reviews: {
      total: reviews.length,
      editorialReady: reviewEditorialReady,
      indexable: reviewIndexable,
      quality: reviewQuality,
      qualityIndexable: reviewQualityIndexable,
      workState: reviewWork,
      uniquenessHolds: reviewUniqHolds,
      blockedEvidence,
      junkVoice: reviewJunk,
      junkSlugs,
      uniquenessIndexable,
      maxPeerJaccardIndexable,
      maxPeerPair,
    },
    best: {
      total: best.length,
      ready: bestReady,
      indexable: bestIndexable,
      quality: bestQuality,
      workState: bestWork,
      thinIndexable: bestThinIndexable,
      intentHoldPaths: bestIntentHolds,
      held: bestHeld,
    },
    guides: {
      total: guides.length,
      ready: guideReady,
      indexable: guideIndexable,
      assessorStatus: guideStatus,
      workState: guideWork,
      notComplete: guideNotComplete,
    },
    comparisons: {
      total: comparisons.length,
      ready: cmpReady,
      indexable: cmpIndexable,
      quality: cmpQuality,
      workState: cmpWork,
      indexableBroken: indexableBrokenCmp,
      listedBrokenPeerSlugs: listedBroken,
      listedBrokenInPublished,
      thin: thinCmp,
      needsDiff: needsDiffCmp,
    },
    alternatives: {
      pagesWithGraph: altPages,
      ready: altReady,
      indexable: altIndexable,
      holdClass: altHold,
      unexplained: unexplainedAlts,
      marketHolds,
      dupIntentHolds,
      uniquenessHolds: uniquenessAltHolds,
    },
    brands: {
      total: brands.length,
      ready: brandReady,
      indexable: brandIndexable,
      class: brandClass,
      uniquenessHolds: uniquenessBrandHolds,
    },
    categories: {
      total: categories.length,
      indexable: catIndexable,
      editorialConfigs: catEditorialTotal,
      editorialReady: catEditorialReady,
      holds: catHolds,
      emptyShells,
      future: futureCats,
    },
    tools: {
      total: tools.length,
      ready: toolReady,
      indexable: toolIndexable,
      held: toolHeld,
    },
    commerce: {
      offerRows: offers.length,
      byRegion: offersByRegion,
      coveragePolicy: REGION_COMMERCE_COVERAGE,
      regions: [...REGIONS],
      validationOverlay: overlayCount,
      validationStates: offerValidation,
      overlayCheckedFrom: overlayCheckedAt[0] ?? null,
      overlayCheckedTo: overlayCheckedAt[overlayCheckedAt.length - 1] ?? null,
    },
    graphAfter70: {
      products: graph.products,
      indexable: graph.indexable,
      scores: graph.scores,
      runningIndexableAlts: graph.runningIndexableAlts,
    },
    editorialIntentHoldPaths: bestIntentHolds.length,
  };

  writeFileSync(join(RC, "inventory.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
