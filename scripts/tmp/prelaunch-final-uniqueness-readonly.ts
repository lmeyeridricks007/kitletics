/**
 * Fix 25 — Content uniqueness & programmatic quality audit.
 *
 * READ → classify → write machine data + hold overlay.
 * Does not invent new review copy here; holds DUPLICATIVE from Day-1 index.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-25-content-uniqueness.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getReviews,
  getProducts,
  getBrands,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getCategories,
} from "@/repositories";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import {
  classifyUniqueness,
  normalizeText,
  paragraphHashes,
  scaffoldHitCount,
  scrubEntityNames,
  textSimilarity,
  type UniquenessClass,
} from "@/domain/content-uniqueness/text";

const OUT_DIR = join(process.cwd(), "docs/prelaunch/data");
const HOLD_TS = join(
  process.cwd(),
  "docs/prelaunch/data/rc-final/content-uniqueness-holds.GENERATED.ts",
);
const REPORT_JSON = join(OUT_DIR, "25-content-uniqueness.json");

const ctx = { isDev: false as const };

type PairHit = {
  a: string;
  b: string;
  score: number;
  sharedParagraphs: number;
  field?: string;
};

type PageRow = {
  kind: string;
  id: string;
  slug: string;
  path: string;
  categoryId?: string;
  categorySlug?: string;
  launchQuality?: string;
  class: UniquenessClass;
  maxPeerSimilarity: number;
  peerSlug?: string;
  scaffoldHits: number;
  uniqueSignalRatio: number;
  reasons: string[];
};

function listSim(
  a: string[],
  b: string[],
  names: string[],
): number {
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  const na = a.map((x) => normalizeText(scrubEntityNames(x, names)));
  const nb = b.map((x) => normalizeText(scrubEntityNames(x, names)));
  let best = 0;
  let hits = 0;
  for (const x of na) {
    let local = 0;
    for (const y of nb) {
      const s = textSimilarity(x, y);
      if (s > local) local = s;
      if (s >= 0.92) hits++;
    }
    if (local > best) best = local;
  }
  // Blend exact-ish list reuse with best item match
  const reuse = hits / Math.max(na.length, 1);
  return Math.max(best, reuse);
}

function pairWithinGroup<T extends { key: string; text: string; names: string[]; meta: PageRow }>(
  items: T[],
  minScore = 0.48,
): { pairs: PairHit[]; maxByKey: Map<string, { score: number; peer: string }> } {
  const maxByKey = new Map<string, { score: number; peer: string }>();
  const pairs: PairHit[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!;
      const b = items[j]!;
      const names = [...new Set([...a.names, ...b.names])];
      const sa = normalizeText(scrubEntityNames(a.text, names));
      const sb = normalizeText(scrubEntityNames(b.text, names));
      const score = textSimilarity(sa, sb);
      if (score < minScore) continue;
      const pa = new Set(paragraphHashes(a.text, names));
      const pb = new Set(paragraphHashes(b.text, names));
      let shared = 0;
      for (const p of pa) if (pb.has(p)) shared++;
      pairs.push({
        a: a.key,
        b: b.key,
        score: Number(score.toFixed(3)),
        sharedParagraphs: shared,
      });
      const curA = maxByKey.get(a.key);
      if (!curA || score > curA.score) maxByKey.set(a.key, { score, peer: b.key });
      const curB = maxByKey.get(b.key);
      if (!curB || score > curB.score) maxByKey.set(b.key, { score, peer: a.key });
    }
  }
  pairs.sort((x, y) => y.score - x.score);
  return { pairs, maxByKey };
}

function uniqueSignalRatio(text: string, names: string[]): number {
  const scrubbed = normalizeText(scrubEntityNames(text, names));
  const tokens = scrubbed.split(" ").filter(Boolean);
  if (!tokens.length) return 0;
  // Tokens that look product/spec specific: numbers, foam names, materials
  const signal = tokens.filter(
    (t) =>
      /\d/.test(t) ||
      /foam|plate|carbon|nylon|stack|drop|gram|mm|amoled|mip|gps|vest|flask|lug|rocker|energy|lightstrike|react|fresh|dna|ff|blast|nimbus|ghost|pegasus|vapor|alpha|novablast|clifton|bondi|kayano|structure|adrenaline|metcon|nano|romaleos/i.test(
        t,
      ),
  );
  return signal.length / tokens.length;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const products = getProducts();
  const brands = getBrands();
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const categories = getCategories();
  const catById = new Map(categories.map((c) => [c.id, c]));

  const rows: PageRow[] = [];
  const reviewPairs: PairHit[] = [];
  const productPairs: PairHit[] = [];
  const bestPairs: PairHit[] = [];
  const guidePairs: PairHit[] = [];
  const comparisonPairs: PairHit[] = [];

  // ─── Reviews (within category) ─────────────────────────────────────────
  const reviews = getReviews().filter((r) => r.status === "published");
  type RItem = {
    key: string;
    text: string;
    names: string[];
    meta: PageRow;
    pros: string[];
    cons: string[];
    buy: string[];
    avoid: string[];
  };
  const byCat = new Map<string, RItem[]>();

  for (const review of reviews) {
    const product = productById.get(review.productId);
    const brand = product ? brandById.get(product.brandId) : undefined;
    const catId = product?.categoryId ?? "unknown";
    const cat = catById.get(catId);
    const names = [
      product?.fullName,
      product?.name,
      brand?.name,
      review.title.replace(/\s+review$/i, ""),
    ].filter(Boolean) as string[];

    const body = [
      review.summary,
      review.verdict,
      review.bottomLine,
      ...(review.sections ?? []).map((s) => s.body),
    ]
      .filter(Boolean)
      .join("\n\n");

    const launch = assessReviewLaunchQuality(review, ctx);
    const scaffoldHits = scaffoldHitCount(body);
    const usr = uniqueSignalRatio(body, names);

    const meta: PageRow = {
      kind: "review",
      id: review.id,
      slug: review.slug,
      path: `/reviews/${review.slug}`,
      categoryId: catId,
      categorySlug: cat?.slug,
      launchQuality: launch.quality,
      class: "GENUINELY_UNIQUE",
      maxPeerSimilarity: 0,
      scaffoldHits,
      uniqueSignalRatio: Number(usr.toFixed(3)),
      reasons: [],
    };

    const item: RItem = {
      key: review.slug,
      text: body,
      names,
      meta,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
      buy: review.whoShouldBuy ?? [],
      avoid: review.whoShouldAvoid ?? [],
    };
    const list = byCat.get(catId) ?? [];
    list.push(item);
    byCat.set(catId, list);
  }

  for (const [, items] of byCat) {
    if (items.length < 2) {
      for (const it of items) {
        it.meta.class = classifyUniqueness({
          maxPeerSimilarity: 0,
          scaffoldHits: it.meta.scaffoldHits,
          uniqueSignalRatio: it.meta.uniqueSignalRatio,
        });
        rows.push(it.meta);
      }
      continue;
    }
    const { pairs, maxByKey } = pairWithinGroup(items, 0.45);
    reviewPairs.push(...pairs.slice(0, 200));

    for (const it of items) {
      const peer = maxByKey.get(it.key);
      const prosSim = peer
        ? listSim(
            it.pros,
            items.find((x) => x.key === peer.peer)?.pros ?? [],
            it.names,
          )
        : 0;
      const buySim = peer
        ? listSim(
            it.buy,
            items.find((x) => x.key === peer.peer)?.buy ?? [],
            it.names,
          )
        : 0;
      const avoidSim = peer
        ? listSim(
            it.avoid,
            items.find((x) => x.key === peer.peer)?.avoid ?? [],
            it.names,
          )
        : 0;
      const maxList = Math.max(prosSim, buySim, avoidSim);
      const score = Math.max(peer?.score ?? 0, maxList * 0.95);
      it.meta.maxPeerSimilarity = Number(score.toFixed(3));
      it.meta.peerSlug = peer?.peer;
      if (maxList >= 0.9) it.meta.reasons.push("repeated_audience_lists");
      if ((peer?.score ?? 0) >= 0.82) it.meta.reasons.push("high_body_similarity");
      if (it.meta.scaffoldHits >= 4) it.meta.reasons.push("scaffold_dense");

      it.meta.class = classifyUniqueness({
        maxPeerSimilarity: score,
        scaffoldHits: it.meta.scaffoldHits,
        uniqueSignalRatio: it.meta.uniqueSignalRatio,
        held: it.meta.launchQuality === "BLOCKED",
      });
      rows.push(it.meta);
    }
  }

  // ─── Products ──────────────────────────────────────────────────────────
  type PItem = { key: string; text: string; names: string[]; meta: PageRow };
  const productsByCat = new Map<string, PItem[]>();
  for (const product of products.filter((p) => p.status === "published")) {
    const brand = brandById.get(product.brandId);
    const names = [product.fullName, product.name, brand?.name].filter(
      Boolean,
    ) as string[];
    const text = [
      product.shortDescription,
      product.verdict,
      ...(product.strengths ?? []),
      ...(product.weaknesses ?? []),
    ]
      .filter(Boolean)
      .join("\n\n");
    const launch = assessProductLaunchQuality(product, ctx);
    const meta: PageRow = {
      kind: "product",
      id: product.id,
      slug: product.slug,
      path: `/products/${product.slug}`,
      categoryId: product.categoryId,
      categorySlug: catById.get(product.categoryId)?.slug,
      launchQuality: launch.quality,
      class: "GENUINELY_UNIQUE",
      maxPeerSimilarity: 0,
      scaffoldHits: scaffoldHitCount(text),
      uniqueSignalRatio: Number(uniqueSignalRatio(text, names).toFixed(3)),
      reasons: [],
    };
    const list = productsByCat.get(product.categoryId) ?? [];
    list.push({ key: product.slug, text, names, meta });
    productsByCat.set(product.categoryId, list);
  }
  for (const [, items] of productsByCat) {
    const { pairs, maxByKey } = pairWithinGroup(items, 0.5);
    productPairs.push(...pairs.slice(0, 100));
    for (const it of items) {
      const peer = maxByKey.get(it.key);
      it.meta.maxPeerSimilarity = Number((peer?.score ?? 0).toFixed(3));
      it.meta.peerSlug = peer?.peer;
      it.meta.class = classifyUniqueness({
        maxPeerSimilarity: peer?.score ?? 0,
        scaffoldHits: it.meta.scaffoldHits,
        uniqueSignalRatio: it.meta.uniqueSignalRatio,
        held: it.meta.launchQuality === "BLOCKED" || it.meta.launchQuality === "INCOMPLETE",
      });
      rows.push(it.meta);
    }
  }

  // ─── Best guides ───────────────────────────────────────────────────────
  const bestItems: {
    key: string;
    text: string;
    names: string[];
    meta: PageRow;
  }[] = [];
  for (const guide of getBestGuides().filter((g) => g.status === "published")) {
    const recText = (guide.recommendations ?? [])
      .map((r) =>
        [
          r.summary,
          r.rationale,
          r.whyRecommended,
          r.whyItWon,
          ...(r.whyItFits ?? []),
          ...(r.useCaseStrengths ?? []),
          ...(r.bestForProfiles ?? []),
          ...(r.notIdealFor ?? []),
          ...(r.chooseInsteadWhen ?? []).map(
            (c) => `${c.need} ${c.reason ?? ""}`,
          ),
        ]
          .filter(Boolean)
          .join(" "),
      )
      .join("\n\n");
    const text = [guide.intro, guide.methodologySummary, recText]
      .filter(Boolean)
      .join("\n\n");
    const launch = assessBestGuideLaunchQuality(guide, ctx);
    const names = [guide.title, guide.slug.replace(/-/g, " ")];
    bestItems.push({
      key: guide.slug,
      text,
      names,
      meta: {
        kind: "best-guide",
        id: guide.id,
        slug: guide.slug,
        path: `/best/${guide.slug}`,
        launchQuality: launch.quality,
        class: "GENUINELY_UNIQUE",
        maxPeerSimilarity: 0,
        scaffoldHits: scaffoldHitCount(text),
        uniqueSignalRatio: Number(uniqueSignalRatio(text, names).toFixed(3)),
        reasons: [],
      },
    });
  }
  {
    const { pairs, maxByKey } = pairWithinGroup(bestItems, 0.4);
    bestPairs.push(...pairs.slice(0, 80));
    for (const it of bestItems) {
      const peer = maxByKey.get(it.key);
      it.meta.maxPeerSimilarity = Number((peer?.score ?? 0).toFixed(3));
      it.meta.peerSlug = peer?.peer;
      // Cross-use-case reused reasoning is worse — bump class when peer is different intent
      if (
        peer &&
        peer.score >= 0.55 &&
        it.key.split("-")[0] !== peer.peer.split("-")[0]
      ) {
        it.meta.reasons.push("cross_usecase_reasoning_reuse");
      }
      it.meta.class = classifyUniqueness({
        maxPeerSimilarity: peer?.score ?? 0,
        scaffoldHits: it.meta.scaffoldHits,
        uniqueSignalRatio: it.meta.uniqueSignalRatio,
      });
      rows.push(it.meta);
    }
  }

  // ─── Buying guides ─────────────────────────────────────────────────────
  const guideItems: {
    key: string;
    text: string;
    names: string[];
    meta: PageRow;
  }[] = [];
  for (const guide of getBuyingGuides().filter((g) => g.status === "published")) {
    const text = [
      guide.intro,
      guide.quickAnswer,
      guide.shortDescription,
      ...(guide.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
    ]
      .filter(Boolean)
      .join("\n\n");
    const names = [guide.title, guide.slug.replace(/-/g, " ")];
    guideItems.push({
      key: guide.slug,
      text,
      names,
      meta: {
        kind: "buying-guide",
        id: guide.id,
        slug: guide.slug,
        path: `/guides/${guide.slug}`,
        class: "GENUINELY_UNIQUE",
        maxPeerSimilarity: 0,
        scaffoldHits: scaffoldHitCount(text),
        uniqueSignalRatio: Number(uniqueSignalRatio(text, names).toFixed(3)),
        reasons: [],
      },
    });
  }
  {
    const { pairs, maxByKey } = pairWithinGroup(guideItems, 0.4);
    guidePairs.push(...pairs.slice(0, 80));
    for (const it of guideItems) {
      const peer = maxByKey.get(it.key);
      it.meta.maxPeerSimilarity = Number((peer?.score ?? 0).toFixed(3));
      it.meta.peerSlug = peer?.peer;
      // Intro-only cannibalization
      if (peer) {
        const aIntro = guideItems.find((g) => g.key === it.key)?.text.slice(0, 500) ?? "";
        const bIntro =
          guideItems.find((g) => g.key === peer.peer)?.text.slice(0, 500) ?? "";
        const introSim = textSimilarity(
          normalizeText(aIntro),
          normalizeText(bIntro),
        );
        if (introSim >= 0.7) it.meta.reasons.push("duplicate_intro");
      }
      it.meta.class = classifyUniqueness({
        maxPeerSimilarity: peer?.score ?? 0,
        scaffoldHits: it.meta.scaffoldHits,
        uniqueSignalRatio: it.meta.uniqueSignalRatio,
      });
      rows.push(it.meta);
    }
  }

  // ─── Comparisons ───────────────────────────────────────────────────────
  const cmpItems: {
    key: string;
    text: string;
    names: string[];
    meta: PageRow;
  }[] = [];
  for (const cmp of getComparisons().filter((c) => c.status === "published")) {
    const productNames = (cmp.productIds ?? [])
      .map((id) => productById.get(id))
      .filter(Boolean)
      .flatMap((p) => [p!.fullName, p!.name]);
    const names = [...productNames, cmp.title];
    const text = [
      cmp.summary,
      cmp.verdict,
      cmp.winnerReason,
      ...(cmp.keyDifferences ?? []).map(
        (d) =>
          `${d.label} ${d.explanation} ${(d.productImpacts ?? [])
            .map((p) => p.impact)
            .join(" ")}`,
      ),
      ...(cmp.chooseProductReasons ?? []).map(
        (c) => `${c.context ?? ""} ${c.reason}`,
      ),
      ...(cmp.recommendationsByUseCase ?? []).map(
        (u) => `${u.useCaseId} ${u.rationale}`,
      ),
      ...(cmp.editorialSections ?? []).map((s) => s.body),
    ]
      .filter(Boolean)
      .join("\n\n");

    // Pair-specific signal: short product names appear in verdict/summary/reasons
    const shortNames = (cmp.productIds ?? [])
      .map((id) => productById.get(id)?.name)
      .filter(Boolean) as string[];
    const hay = normalizeText(
      [cmp.summary, cmp.verdict, cmp.winnerReason, text].filter(Boolean).join(" "),
    );
    const namedHits = shortNames.filter((n) =>
      hay.includes(normalizeText(n).slice(0, Math.min(10, n.length))),
    ).length;
    const pairSpecific =
      shortNames.length >= 2 &&
      namedHits >= Math.min(2, shortNames.length) &&
      ((cmp.keyDifferences?.length ?? 0) > 0 ||
        (cmp.chooseProductReasons?.length ?? 0) > 0 ||
        (cmp.recommendationsByUseCase?.length ?? 0) > 0);

    cmpItems.push({
      key: cmp.slug,
      text,
      names,
      meta: {
        kind: "comparison",
        id: cmp.id,
        slug: cmp.slug,
        path: `/compare/${cmp.slug}`,
        class: "GENUINELY_UNIQUE",
        maxPeerSimilarity: 0,
        scaffoldHits: scaffoldHitCount(text),
        uniqueSignalRatio: Number(uniqueSignalRatio(text, names).toFixed(3)),
        reasons: pairSpecific ? [] : ["weak_pair_specific_reasoning"],
      },
    });
  }
  {
    const { pairs, maxByKey } = pairWithinGroup(cmpItems, 0.45);
    comparisonPairs.push(...pairs.slice(0, 80));
    for (const it of cmpItems) {
      const peer = maxByKey.get(it.key);
      it.meta.maxPeerSimilarity = Number((peer?.score ?? 0).toFixed(3));
      it.meta.peerSlug = peer?.peer;
      let cls = classifyUniqueness({
        maxPeerSimilarity: peer?.score ?? 0,
        scaffoldHits: it.meta.scaffoldHits,
        uniqueSignalRatio: it.meta.uniqueSignalRatio,
      });
      // Only escalate weak pair signal when there is also template pressure
      if (
        it.meta.reasons.includes("weak_pair_specific_reasoning") &&
        cls === "GENUINELY_UNIQUE" &&
        (it.meta.scaffoldHits >= 2 || (peer?.score ?? 0) >= 0.45)
      ) {
        cls = "NEEDS_DIFFERENTIATION";
      }
      it.meta.class = cls;
      rows.push(it.meta);
    }
  }

  // ─── Summaries / holds ─────────────────────────────────────────────────
  const byClass = (kind?: string) => {
    const subset = kind ? rows.filter((r) => r.kind === kind) : rows;
    const counts: Record<string, number> = {};
    for (const r of subset) counts[r.class] = (counts[r.class] ?? 0) + 1;
    return counts;
  };

  const duplicativeReviews = rows.filter(
    (r) => r.kind === "review" && r.class === "DUPLICATIVE",
  );
  const needsDiffReviews = rows.filter(
    (r) => r.kind === "review" && r.class === "NEEDS_DIFFERENTIATION",
  );

  /** Day-1 index holds: every DUPLICATIVE review + high-risk NEEDS_DIFFERENTIATION */
  const reviewHoldSlugs = [
    ...new Set(duplicativeReviews.map((r) => r.slug)),
  ].sort();

  const needsDiffHoldSlugs = [
    ...new Set(
      needsDiffReviews
        .filter((r) => r.scaffoldHits >= 5 || r.maxPeerSimilarity >= 0.78)
        .map((r) => r.slug),
    ),
  ].sort();

  const allHoldSlugs = [
    ...new Set([...reviewHoldSlugs, ...needsDiffHoldSlugs]),
  ].sort();

  const holdTs = `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-25-content-uniqueness.ts
 * Day-1 index holds for DUPLICATIVE / high-risk template reviews.
 * Do not hand-edit — re-run the audit script.
 */
export const CONTENT_UNIQUENESS_REVIEW_HOLDS = new Set<string>(${JSON.stringify(
    allHoldSlugs,
    null,
    2,
  )});

export function isContentUniquenessReviewHeld(slug: string): boolean {
  return CONTENT_UNIQUENESS_REVIEW_HOLDS.has(slug);
}
`;

  writeFileSync(HOLD_TS, holdTs);

  const payload = {
    generatedAt: new Date().toISOString(),
    summary: {
      totals: byClass(),
      reviews: byClass("review"),
      products: byClass("product"),
      bestGuides: byClass("best-guide"),
      buyingGuides: byClass("buying-guide"),
      comparisons: byClass("comparison"),
      day1ReviewHolds: allHoldSlugs.length,
      duplicativeReviews: duplicativeReviews.length,
      needsDifferentiationReviews: needsDiffReviews.length,
    },
    topReviewPairs: reviewPairs.slice(0, 40),
    topProductPairs: productPairs.slice(0, 20),
    topBestPairs: bestPairs.slice(0, 20),
    topGuidePairs: guidePairs.slice(0, 20),
    topComparisonPairs: comparisonPairs.slice(0, 20),
    clusters: {
      reviewsDuplicative: duplicativeReviews
        .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
        .slice(0, 80),
      reviewsNeedsDiff: needsDiffReviews
        .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
        .slice(0, 80),
      bestNeedsDiff: rows
        .filter(
          (r) =>
            r.kind === "best-guide" &&
            (r.class === "NEEDS_DIFFERENTIATION" || r.class === "DUPLICATIVE"),
        )
        .slice(0, 40),
      guidesNeedsDiff: rows
        .filter(
          (r) =>
            r.kind === "buying-guide" &&
            (r.class === "NEEDS_DIFFERENTIATION" || r.class === "DUPLICATIVE"),
        )
        .slice(0, 40),
      comparisonsNeedsDiff: rows
        .filter(
          (r) =>
            r.kind === "comparison" &&
            (r.class === "NEEDS_DIFFERENTIATION" || r.class === "DUPLICATIVE"),
        )
        .slice(0, 40),
    },
    holdSlugs: allHoldSlugs,
  };

  writeFileSync(REPORT_JSON, JSON.stringify(payload, null, 2));

  console.log(JSON.stringify(payload.summary, null, 2));
  console.log("Wrote", REPORT_JSON);
  console.log("Wrote", HOLD_TS, `(${allHoldSlugs.length} holds)`);
  console.log(
    "Top review pairs:",
    reviewPairs.slice(0, 8).map((p) => `${p.score} ${p.a} ↔ ${p.b}`),
  );
}

main();
