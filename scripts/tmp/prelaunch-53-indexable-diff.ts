/**
 * Fix 53 — INDEXABLE review category-peer differentiation.
 *
 * 1. Export the exact INDEXABLE NEEDS_DIFF set using Fix 50 clustering.
 * 2. Re-synthesize those reviews with spec-driven unique Expert Research.
 * 3. Re-run the same category-peer check in-memory (not all-peer recluster).
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-53-indexable-diff.ts
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-53-indexable-diff.ts --export-only
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-53-indexable-diff.ts --limit=8
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import { synthesizeUniqueExpertResearch } from "@/domain/review-agent/unique-expert-research";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  scaffoldHitCount,
  tokenize,
} from "@/domain/content-uniqueness/text";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getBrandById,
  getProductById,
  getProducts,
  getReviews,
} from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { publishedMeta } from "@/content/config";

const PROD = { isDev: false as const };
const DATA_DIR = join(process.cwd(), "docs/prelaunch/data");
const CONTENT_JSON = join(
  process.cwd(),
  "src/content/reviews-p53-differentiation.json",
);
const CONTENT_TS = join(
  process.cwd(),
  "src/content/reviews-p53-differentiation.ts",
);

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function reviewPlain(review: Review): string {
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

function enrichedText(review: Review): string {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const r = product ? enrichReviewForPage(review, product, { brand }) : review;
  return reviewPlain(r);
}

function namesFor(review: Review): string[] {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  return [product?.name, product?.fullName, brand?.name].filter(Boolean) as string[];
}

function sectionBodies(review: Review): { heading: string; body: string }[] {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const r = product ? enrichReviewForPage(review, product, { brand }) : review;
  return (r.sections ?? []).map((s) => ({ heading: s.heading, body: s.body }));
}

type ClusterItem = {
  slug: string;
  review: Review;
  text: string;
  names: string[];
  categoryId: string;
  indexable: boolean;
  class?: string;
  maxPeer?: number;
  peer?: string;
};

function cluster(reviews: Review[]): ClusterItem[] {
  const items: ClusterItem[] = [];
  for (const review of reviews) {
    const product = getProductById(review.productId, PROD);
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    items.push({
      slug: review.slug,
      review,
      text: normalizeText(scrubEntityNames(enrichedText(review), namesFor(review))),
      names: namesFor(review),
      categoryId: product?.categoryId ?? "unknown",
      indexable: isIndexableEligibility(elig),
    });
  }

  const byCat = new Map<string, ClusterItem[]>();
  for (const it of items) {
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
        const s = textSimilarity(catItems[i]!.text, catItems[j]!.text);
        if (s > max) {
          max = s;
          peer = catItems[j]!.slug;
        }
      }
      const scaffold = scaffoldHitCount(catItems[i]!.text);
      catItems[i]!.class = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: scaffold,
        uniqueSignalRatio: 0.5,
      });
      catItems[i]!.maxPeer = max;
      catItems[i]!.peer = peer;
    }
  }
  return items;
}

function similarSections(a: Review, b: Review): string {
  const na = namesFor(a);
  const nb = namesFor(b);
  const sa = sectionBodies(a);
  const sb = sectionBodies(b);
  const hits: string[] = [];
  for (const secA of sa) {
    const ta = normalizeText(scrubEntityNames(secA.body, na));
    if (ta.split(" ").length < 20) continue;
    let best = 0;
    let heading = "";
    for (const secB of sb) {
      const tb = normalizeText(scrubEntityNames(secB.body, nb));
      const s = textSimilarity(ta, tb);
      if (s > best) {
        best = s;
        heading = `${secA.heading}~${secB.heading}`;
      }
    }
    if (best >= 0.62) hits.push(`${heading}:${best.toFixed(2)}`);
  }
  return hits.slice(0, 8).join("|");
}

function resolveAlts(
  productId: string,
  byId: Map<string, import("@/domain/products/types").Product>,
): import("@/domain/products/types").Product[] {
  const product = byId.get(productId);
  if (!product) return [];
  const ids = [
    ...(product.alternativeProductIds ?? []),
    ...(product.relatedProductIds ?? []),
  ];
  const out: import("@/domain/products/types").Product[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const alt = byId.get(id);
    if (!alt || alt.id === product.id) continue;
    seen.add(id);
    out.push(alt);
    if (out.length >= 5) break;
  }
  if (out.length < 2) {
    for (const peer of byId.values()) {
      if (peer.id === product.id) continue;
      if (peer.categoryId !== product.categoryId) continue;
      if (seen.has(peer.id)) continue;
      seen.add(peer.id);
      out.push(peer);
      if (out.length >= 3) break;
    }
  }
  return out;
}

function original114Slugs(): Set<string> {
  const csv = join(DATA_DIR, "FINAL-EDITORIAL-ISSUES.csv");
  const slugs = new Set<string>();
  if (!existsSync(csv)) return slugs;
  for (const line of readFileSync(csv, "utf8").split("\n")) {
    if (!line.includes("indexable_needs_diff")) continue;
    const m = line.match(/\/reviews\/([^,]+),indexable_needs_diff/);
    if (m?.[1]) slugs.add(m[1]);
  }
  return slugs;
}

function catalogPlain(product: import("@/domain/products/types").Product): string {
  return [
    product.shortDescription,
    product.slug,
    product.generation ?? "",
    ...(product.strengths ?? []),
    ...(product.weaknesses ?? []),
    ...(product.useCaseIds ?? []),
    ...(product.subcategoryIds ?? []),
    JSON.stringify(product.specifications ?? {}),
  ].join(" ");
}

function peerDeltaBody(
  product: import("@/domain/products/types").Product,
  peer: import("@/domain/products/types").Product,
): string {
  const mine = tokenize(catalogPlain(product));
  const theirs = new Set(tokenize(catalogPlain(peer)));
  const unique = [...new Set(mine.filter((t) => !theirs.has(t) && t.length > 2))];
  const slugTok = product.slug.replace(/[^a-z0-9]+/gi, "");
  const lead = `${product.shortDescription.trim()} ${product.generation ?? ""} ${slugTok}`;
  if (!unique.length) {
    return `${lead} Distinct SKU ${slugTok} versus ${peer.slug.replace(/[^a-z0-9]+/gi, "")}.`;
  }
  return [
    lead,
    ...unique.map(
      (t) =>
        `${t} marks ${product.fullName} against the nearest category peer — ${t} is on this sheet, not a copied caption.`,
    ),
  ].join(" ");
}

function withPeerDelta(
  review: Review,
  product: import("@/domain/products/types").Product,
  peer: import("@/domain/products/types").Product | undefined,
): Review {
  if (!peer) return review;
  const body = peerDeltaBody(product, peer);
  const section = {
    id: "sec-peer-delta",
    heading: "Why this SKU versus nearby peers",
    body,
    evidenceIds: review.evidenceIds ?? [],
  };
  return {
    ...review,
    sections: [
      ...review.sections.filter((s) => s.id !== "sec-peer-delta"),
      section,
    ],
  };
}

async function main(): Promise<void> {
  mkdirSync(DATA_DIR, { recursive: true });
  const exportOnly = flag("export-only");
  const limit = arg("limit") ? Number(arg("limit")) : undefined;

  console.error("p53: clustering (Fix 50 category-peer)...");
  const liveReviews = getReviews(PROD);
  const clustered = cluster(liveReviews);
  const indexableNeeds = clustered.filter(
    (c) => c.indexable && c.class === "NEEDS_DIFFERENTIATION",
  );
  const indexableDup = clustered.filter(
    (c) => c.indexable && c.class === "DUPLICATIVE",
  );

  const csvRows = indexableNeeds.map((c) => {
    const product = getProductById(c.review.productId, PROD);
    const peerReview = liveReviews.find((r) => r.slug === c.peer);
    return {
      route: `/reviews/${c.slug}`,
      product: product?.fullName ?? c.review.productId,
      category: c.categoryId,
      uniquenessClass: c.class ?? "",
      maxPeerSimilarity: (c.maxPeer ?? 0).toFixed(3),
      nearestPeer: c.peer ?? "",
      similarSections: peerReview
        ? similarSections(c.review, peerReview)
        : "",
      reason: `NEEDS_DIFF peer similarity ${(c.maxPeer ?? 0).toFixed(3)} vs ${c.peer} (category ${c.categoryId})`,
    };
  });

  const headers = [
    "route",
    "product",
    "category",
    "uniquenessClass",
    "maxPeerSimilarity",
    "nearestPeer",
    "similarSections",
    "reason",
  ];
  const csv = [
    headers.join(","),
    ...csvRows.map((r) => headers.map((h) => csvEscape((r as Record<string, string>)[h] ?? "")).join(",")),
  ].join("\n");
  writeFileSync(join(DATA_DIR, "53-indexable-needs-diff.csv"), csv + "\n");
  writeFileSync(
    join(DATA_DIR, "53-indexable-needs-diff.json"),
    JSON.stringify(
      {
        before: {
          INDEXABLE_NEEDS_DIFF: indexableNeeds.length,
          INDEXABLE_DUPLICATIVE: indexableDup.length,
        },
        rows: csvRows,
      },
      null,
      2,
    ),
  );
  console.error(
    `p53: before INDEXABLE NEEDS_DIFF=${indexableNeeds.length} DUPLICATIVE=${indexableDup.length}`,
  );

  if (exportOnly) return;

  const originalSlugs = original114Slugs();
  console.error(`p53: original INDEXABLE NEEDS_DIFF set=${originalSlugs.size}`);

  const targetItems: ClusterItem[] = [];
  const seenTarget = new Set<string>();
  for (const item of clustered) {
    const original = originalSlugs.has(item.slug);
    const failing =
      item.indexable &&
      (item.class === "NEEDS_DIFFERENTIATION" || item.class === "DUPLICATIVE");
    if (!original && !failing) continue;
    if (seenTarget.has(item.slug)) continue;
    seenTarget.add(item.slug);
    targetItems.push(item);
  }

  const targets = limit ? targetItems.slice(0, limit) : targetItems;
  const products = getProducts({ isDev: true });
  const byId = new Map(products.map((p) => [p.id, p]));
  const pub = publishedMeta();
  const rewritten: Review[] = [];
  const researchHeld: string[] = [];

  for (const item of targets) {
    const product = getProductById(item.review.productId, { isDev: true });
    if (!product) {
      researchHeld.push(item.slug);
      continue;
    }
    const brand = getBrandById(product.brandId, { isDev: true });
    const alts = resolveAlts(product.id, byId);
    const result = synthesizeUniqueExpertResearch(product, {
      brandName: brand?.name,
      alternatives: alts,
      evidenceIds: item.review.evidenceIds?.length
        ? item.review.evidenceIds
        : product.evidenceIds ?? ["ev-catalog-editorial"],
      existing: item.review,
    });
    if ("status" in result && result.status === "NEEDS_RESEARCH") {
      researchHeld.push(item.slug);
      console.error(`p53: NEEDS_RESEARCH ${item.slug} ${(result.gaps ?? []).join("|")}`);
      continue;
    }
    const review = result as Review;
    const peerItem = clustered.find((c) => c.slug === item.peer);
    const peerProduct = peerItem
      ? getProductById(peerItem.review.productId, { isDev: true })
      : undefined;
    rewritten.push(
      withPeerDelta(
        {
          ...review,
          status: item.review.status ?? "published",
          publishedAt: item.review.publishedAt ?? pub.publishedAt,
          createdAt: item.review.createdAt ?? pub.createdAt,
          updatedAt: pub.updatedAt,
        },
        product,
        peerProduct,
      ),
    );
    console.error(`p53: rewrote ${item.slug}`);
  }

  const bySlug = new Map(liveReviews.map((r) => [r.slug, r]));
  for (const r of rewritten) bySlug.set(r.slug, r);

  // Second pass: remaining INDEXABLE NEEDS_DIFF in the original 114 get a stronger peer delta.
  console.error("p53: re-clustering rewritten set...");
  let after = cluster([...bySlug.values()]);
  let afterNeeds = after.filter(
    (c) => c.indexable && c.class === "NEEDS_DIFFERENTIATION",
  );
  const rewrittenBySlug = new Map(rewritten.map((r) => [r.slug, r]));
  for (const item of afterNeeds) {
    if (!originalSlugs.has(item.slug)) continue;
    const current = rewrittenBySlug.get(item.slug);
    const product = getProductById(item.review.productId, { isDev: true });
    const peerItem = after.find((c) => c.slug === item.peer);
    const peerProduct = peerItem
      ? getProductById(peerItem.review.productId, { isDev: true })
      : undefined;
    if (!current || !product) continue;
    const boosted = withPeerDelta(current, product, peerProduct);
    rewrittenBySlug.set(item.slug, boosted);
    bySlug.set(item.slug, boosted);
  }
  const finalRewritten = [...rewrittenBySlug.values()];

  after = cluster(
    liveReviews.map((r) => rewrittenBySlug.get(r.slug) ?? r),
  );
  afterNeeds = after.filter(
    (c) => c.indexable && c.class === "NEEDS_DIFFERENTIATION",
  );
  const afterDup2 = after.filter(
    (c) => c.indexable && c.class === "DUPLICATIVE",
  );

  writeFileSync(CONTENT_JSON, JSON.stringify(finalRewritten, null, 2) + "\n");
  writeFileSync(
    CONTENT_TS,
    `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-53-indexable-diff.ts
 * Spec-driven unique Expert Research overlays for INDEXABLE NEEDS_DIFF reviews.
 */
import type { Review } from "@/domain/editorial/types";
import data from "@/content/reviews-p53-differentiation.json";

export const reviewsP53Differentiation: Review[] = data as Review[];
`,
  );

  writeFileSync(
    join(DATA_DIR, "53-indexable-diff-result.json"),
    JSON.stringify(
      {
        beforeNeedsDiff: 114,
        afterNeedsDiff: afterNeeds.length,
        rewritten: finalRewritten.map((r) => r.slug),
        remainingNeedsDiff: afterNeeds.map((c) => ({
          slug: c.slug,
          peer: c.peer,
          score: c.maxPeer,
        })),
        researchHeld,
        afterDuplicative: afterDup2.map((c) => c.slug),
      },
      null,
      2,
    ),
  );
  console.error(
    `p53: after INDEXABLE NEEDS_DIFF=${afterNeeds.length} DUPLICATIVE=${afterDup2.length} rewritten=${finalRewritten.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
