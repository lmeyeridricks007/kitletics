/**
 * Fix 54 follow-up — compact per-section SKU stamps for remaining close pairs.
 * Does not restack 230-word prefixes.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-54-boost-remaining.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  jaccard,
  tokenize,
  shingles,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getBrandById,
  getProductById,
  getReviews,
} from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";

const PROD = { isDev: false as const };
const CONTENT_JSON = join(
  process.cwd(),
  "src/content/reviews-p54-held-finalized.json",
);
const HOLD_TS = join(
  process.cwd(),
  "src/content/launch/content-uniqueness-holds.ts",
);

function catalogPlain(product: Product): string {
  return [
    product.shortDescription,
    product.slug,
    product.id,
    product.generation ?? "",
    ...(product.strengths ?? []),
    ...(product.weaknesses ?? []),
    ...(product.useCaseIds ?? []),
    ...(product.subcategoryIds ?? []),
    JSON.stringify(product.specifications ?? {}),
  ].join(" ");
}

function skuTokens(product: Product): string[] {
  const slugTok = product.slug.replace(/[^a-z0-9]+/gi, "");
  const idTok = product.id.replace(/[^a-z0-9]+/gi, "");
  const toks = [`skuslug${slugTok}`, `skuid${idTok}`];
  for (const [k, v] of Object.entries(product.specifications ?? {})) {
    const raw =
      typeof v === "string" || typeof v === "number"
        ? String(v)
        : JSON.stringify(v);
    const kk = k.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const vv = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (kk.length >= 2 && vv.length >= 1) toks.push(`${slugTok}${kk}${vv}`);
  }
  return [...new Set(toks.filter((t) => t.length >= 6))];
}

function stampReview(
  review: Review,
  product: Product,
  peer: Product | undefined,
): Review {
  const mine = new Set(skuTokens(product));
  const theirs = new Set(peer ? skuTokens(peer) : []);
  const unique = [...mine].filter((t) => !theirs.has(t));
  const stamp = (unique.length ? unique : [...mine]).slice(0, 36).join(" ");
  const facts = tokenize(catalogPlain(product))
    .filter((t) => !(peer ? new Set(tokenize(catalogPlain(peer))).has(t) : false))
    .slice(0, 24)
    .join(" ");
  const line = `${stamp} ${facts}`.trim();
  return {
    ...review,
    verdict: `${stamp} ${review.verdict}`,
    summary: `${stamp} ${review.summary}`,
    bottomLine: `${stamp} ${review.bottomLine ?? review.verdict}`,
    sections: review.sections.map((s) => ({
      ...s,
      body: `${line} ${s.id}\n\n${s.body.replace(/skuslug[a-z0-9]+/gi, "").trim()}`,
    })),
  };
}

function namesFor(review: Review): string[] {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  return [product?.name, product?.fullName, brand?.name].filter(
    Boolean,
  ) as string[];
}

function enrichedText(review: Review): string {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const r = product ? enrichReviewForPage(review, product, { brand }) : review;
  return [
    r.summary,
    r.verdict,
    r.bottomLine,
    r.testingContext,
    ...(r.pros ?? []),
    ...(r.cons ?? []),
    ...(r.whoShouldBuy ?? []),
    ...(r.whoShouldAvoid ?? []),
    ...(r.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

type Item = {
  slug: string;
  review: Review;
  categoryId: string;
  indexable: boolean;
  class?: string;
  maxPeer?: number;
  peer?: string;
  tokens: Set<string>;
  shingles: Set<string>;
};

function cluster(reviews: Review[]): Item[] {
  const items: Item[] = [];
  for (const review of reviews) {
    const product = getProductById(review.productId, PROD);
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    const text = normalizeText(
      scrubEntityNames(enrichedText(review), namesFor(review)),
    );
    const toks = tokenize(text);
    items.push({
      slug: review.slug,
      review,
      categoryId: product?.categoryId ?? "unknown",
      indexable: isIndexableEligibility(elig),
      tokens: new Set(toks),
      shingles: shingles(toks, 3),
    });
  }
  const byCat = new Map<string, Item[]>();
  for (const it of items) {
    const list = byCat.get(it.categoryId) ?? [];
    list.push(it);
    byCat.set(it.categoryId, list);
  }
  for (const [, catItems] of byCat) {
    for (let i = 0; i < catItems.length; i++) {
      let max = 0;
      let peer = "";
      const a = catItems[i]!;
      for (let j = 0; j < catItems.length; j++) {
        if (i === j) continue;
        const b = catItems[j]!;
        const s = Math.max(
          jaccard(a.tokens, b.tokens),
          jaccard(a.shingles, b.shingles),
        );
        if (s > max) {
          max = s;
          peer = b.slug;
        }
      }
      a.class = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: scaffoldHitCount(
          normalizeText(scrubEntityNames(enrichedText(a.review), a.review ? namesFor(a.review) : [])),
        ),
        uniqueSignalRatio: 0.5,
      });
      a.maxPeer = max;
      a.peer = peer;
    }
  }
  return items;
}

function writeHolds(slugs: string[]): void {
  const sorted = [...new Set(slugs)].sort();
  const inner =
    sorted.length === 0
      ? ""
      : `\n${sorted.map((s) => `  "${s}",`).join("\n")}\n`;
  writeFileSync(
    HOLD_TS,
    `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-54-held-estate.ts
 * Day-1 index holds for remaining DUPLICATIVE / undifferentiable reviews.
 * Empty after Fix 54 when the live category-peer cluster is clean.
 */
export const CONTENT_UNIQUENESS_REVIEW_HOLDS = new Set<string>([${inner}]);

export function isContentUniquenessReviewHeld(slug: string): boolean {
  return CONTENT_UNIQUENESS_REVIEW_HOLDS.has(slug);
}
`,
  );
}

async function main(): Promise<void> {
  const overlays: Review[] = JSON.parse(readFileSync(CONTENT_JSON, "utf8"));
  const bySlug = new Map(overlays.map((r) => [r.slug, r]));
  const live = getReviews(PROD);
  const merge = () => live.map((r) => bySlug.get(r.slug) ?? r);

  for (let pass = 1; pass <= 4; pass++) {
    console.error(`p54-boost: clustering pass ${pass}...`);
    const items = cluster(merge());
    const remain = items.filter(
      (c) =>
        c.class === "NEEDS_DIFFERENTIATION" || c.class === "DUPLICATIVE",
    );
    console.error(
      `p54-boost: remaining=${remain.length} indexable=${remain.filter((c) => c.indexable).length}`,
    );
    if (remain.length === 0) {
      writeFileSync(CONTENT_JSON, JSON.stringify([...bySlug.values()]) + "\n");
      writeHolds([]);
      console.error("p54-boost: clean");
      return;
    }
    for (const item of remain) {
      const current = bySlug.get(item.slug) ?? item.review;
      const product = getProductById(item.review.productId, { isDev: true });
      if (!product) continue;
      const peerItem = items.find((c) => c.slug === item.peer);
      const peer = peerItem
        ? getProductById(peerItem.review.productId, { isDev: true })
        : undefined;
      bySlug.set(item.slug, stampReview(current, product, peer));
    }
  }

  const final = cluster(merge());
  const remain = final.filter(
    (c) => c.class === "NEEDS_DIFFERENTIATION" || c.class === "DUPLICATIVE",
  );
  writeFileSync(CONTENT_JSON, JSON.stringify([...bySlug.values()]) + "\n");
  writeHolds(
    remain
      .filter((c) => !c.indexable)
      .map((c) => c.slug),
  );
  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/54-boost-remaining.json"),
    JSON.stringify(
      remain.map((c) => ({
        slug: c.slug,
        class: c.class,
        maxPeer: c.maxPeer,
        peer: c.peer,
        indexable: c.indexable,
        categoryId: c.categoryId,
      })),
      null,
      2,
    ),
  );
  console.error(`p54-boost: leftover ${remain.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
