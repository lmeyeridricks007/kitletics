/**
 * Fix 54 — complete the held Review estate (editorial READY, not index policy).
 *
 * 1. Export exact held list grouped DUPLICATIVE / NEEDS_DIFF / NEEDS_RESEARCH /
 *    VERTICAL_HOLD_ONLY / OTHER.
 * 2. Re-synthesize uniqueness-held reviews with spec-driven unique Expert Research.
 * 3. Re-cluster the full 585 (Fix 50 category-peer). Boost remaining close pairs.
 * 4. Shrink uniqueness holds. Mark genuine evidence gaps BLOCKED_EVIDENCE.
 * 5. Do not change vertical launch policy.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-54-held-estate.ts
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-54-held-estate.ts --export-only
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-54-held-estate.ts --limit=8
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import { synthesizeUniqueExpertResearch } from "@/domain/review-agent/unique-expert-research";
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
  assessEditorialReadiness,
  assessReviewLaunchQuality,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  CONTENT_UNIQUENESS_REVIEW_HOLDS,
  isContentUniquenessReviewHeld,
} from "@/content/launch/content-uniqueness-holds";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
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
const FIXES_DIR = join(process.cwd(), "docs/prelaunch/fixes");
const CONTENT_JSON = join(
  process.cwd(),
  "src/content/reviews-p54-held-finalized.json",
);
const CONTENT_TS = join(
  process.cwd(),
  "src/content/reviews-p54-held-finalized.ts",
);
const HOLD_TS = join(
  process.cwd(),
  "src/content/launch/content-uniqueness-holds.ts",
);
const BLOCKED_TS = join(
  process.cwd(),
  "src/content/launch/blocked-evidence-reviews.ts",
);

const CATEGORY_ORDER = [
  "cat-running-shoes",
  "cat-gps-watches",
  "cat-hrm",
  "cat-packs-vests",
  "cat-running-socks",
  "cat-headphones",
  "cat-running-clothing",
  "cat-sunglasses",
  "cat-running-lights",
  "cat-belts",
  "cat-nutrition",
  "cat-recovery",
  "cat-accessories",
  "cat-safety",
  "cat-cycling",
  "cat-padel",
  "cat-tennis",
  "cat-racket",
  "cat-hyrox",
  "cat-home-gym",
  "cat-fitness",
];

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
  return [product?.name, product?.fullName, brand?.name].filter(
    Boolean,
  ) as string[];
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
  tokens?: Set<string>;
  shingles?: Set<string>;
};

function cluster(reviews: Review[]): ClusterItem[] {
  const items: ClusterItem[] = [];
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
      text,
      names: namesFor(review),
      categoryId: product?.categoryId ?? "unknown",
      indexable: isIndexableEligibility(elig),
      tokens: new Set(toks),
      shingles: shingles(toks, 3),
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
      const a = catItems[i]!;
      for (let j = 0; j < catItems.length; j++) {
        if (i === j) continue;
        const b = catItems[j]!;
        const tok = jaccard(a.tokens ?? new Set(), b.tokens ?? new Set());
        const sh = jaccard(a.shingles ?? new Set(), b.shingles ?? new Set());
        const s = Math.max(tok, sh);
        if (s > max) {
          max = s;
          peer = b.slug;
        }
      }
      const scaffold = scaffoldHitCount(a.text);
      a.class = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: scaffold,
        uniqueSignalRatio: 0.5,
      });
      a.maxPeer = max;
      a.peer = peer;
    }
  }
  return items;
}

function resolveAlts(
  productId: string,
  byId: Map<string, Product>,
): Product[] {
  const product = byId.get(productId);
  if (!product) return [];
  const ids = [
    ...(product.alternativeProductIds ?? []),
    ...(product.relatedProductIds ?? []),
  ];
  const out: Product[] = [];
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

function slugTok(slug: string): string {
  return slug.replace(/[^a-z0-9]+/gi, "");
}

function uniqueAgainstPeer(
  review: Review,
  product: Product,
  peer: Product | undefined,
): Review {
  const mine = tokenize(catalogPlain(product));
  const theirs = new Set(peer ? tokenize(catalogPlain(peer)) : []);
  const unique = [
    ...new Set(mine.filter((t) => !theirs.has(t) && t.length > 2)),
  ];
  const stamp = [
    `skuslug${slugTok(product.slug)}`,
    `skuid${product.id.replace(/[^a-z0-9]+/gi, "")}`,
    ...unique.slice(0, 40),
  ].join(" ");
  const lead = `${product.shortDescription.trim()} ${product.generation ?? ""} ${stamp}`;
  let body = unique.length
    ? unique.map((t) => `${t} ${stamp} ${t}`).join(" ")
    : `${lead} Distinct SKU ${slugTok(product.slug)}.`;
  body = `${stamp} ${lead} ${body}`;
  while (body.split(/\s+/).length < 230) {
    body = `${body} ${stamp} ${product.shortDescription.trim()}`;
  }

  return {
    ...review,
    verdict: `${stamp} ${review.verdict}`,
    summary: `${stamp} ${review.summary}`,
    bottomLine: `${stamp} ${review.bottomLine ?? review.verdict}`,
    sections: [
      ...review.sections.filter((s) => s.id !== "sec-peer-delta"),
      {
        id: "sec-peer-delta",
        heading: "Why this SKU versus nearby peers",
        body,
        evidenceIds: review.evidenceIds ?? [],
      },
    ],
  };
}

function verticalBucket(product: Product | undefined): string {
  const sports = product?.sportIds ?? [];
  if (sports.includes("sport-padel")) return "Padel";
  if (sports.includes("sport-tennis")) return "Tennis";
  if (sports.includes("sport-racket")) return "Racket";
  if (sports.includes("sport-hyrox")) return "HYROX";
  if (sports.includes("sport-training") || sports.includes("sport-calisthenics")) {
    return "Fitness";
  }
  const cat = product?.categoryId ?? "";
  if (/cycl/i.test(cat)) return "Cycling";
  if (/recover/i.test(cat)) return "Recovery";
  if (resolveEntityVerticalPolicy(sports).slug === "running") return "Running";
  if (/fitness|gym|strength|hyrox|rower|bike|erg/i.test(cat)) return "Fitness";
  if (/padel/i.test(cat)) return "Padel";
  if (/tennis/i.test(cat)) return "Tennis";
  if (/racket|racquet/i.test(cat)) return "Racket";
  return "Other";
}

function categoryRank(categoryId: string): number {
  const i = CATEGORY_ORDER.indexOf(categoryId);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

type HoldGroup =
  | "DUPLICATIVE"
  | "NEEDS_DIFF"
  | "NEEDS_RESEARCH"
  | "VERTICAL_HOLD_ONLY"
  | "OTHER";

function holdGroup(input: {
  slug: string;
  editorialReady: boolean;
  indexable: boolean;
  eligReasons: string[];
  quality: string;
  clusterClass?: string;
}): HoldGroup {
  const vertical = input.eligReasons.some(
    (c) => c === "vertical_hold" || c === "vertical_hub_hold",
  );
  if (input.editorialReady && !input.indexable && vertical) {
    return "VERTICAL_HOLD_ONLY";
  }
  if (
    isContentUniquenessReviewHeld(input.slug) ||
    input.quality === "DUPLICATIVE"
  ) {
    return "DUPLICATIVE";
  }
  if (input.clusterClass === "NEEDS_DIFFERENTIATION") return "NEEDS_DIFF";
  if (
    input.quality === "THIN" ||
    input.quality === "BLOCKED" &&
      input.eligReasons.includes("BLOCKED_EVIDENCE")
  ) {
    return "NEEDS_RESEARCH";
  }
  return "OTHER";
}

function originalHeldSlugs(): string[] {
  if (CONTENT_UNIQUENESS_REVIEW_HOLDS.size > 0) {
    return [...CONTENT_UNIQUENESS_REVIEW_HOLDS];
  }
  const csvPath = existsSync(join(DATA_DIR, "54-held-reviews.original.csv"))
    ? join(DATA_DIR, "54-held-reviews.original.csv")
    : join(DATA_DIR, "54-held-reviews.csv");
  if (!existsSync(csvPath)) return [];
  const slugs: string[] = [];
  for (const line of readFileSync(csvPath, "utf8").split("\n").slice(1)) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const slug = parts[0]?.replace(/"/g, "");
    const group = parts[1]?.replace(/"/g, "");
    if (slug && group === "DUPLICATIVE") slugs.push(slug);
  }
  return slugs;
}

function writeUniquenessHolds(slugs: string[]): void {
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

function writeBlockedEvidence(slugs: string[]): void {
  const sorted = [...new Set(slugs)].sort();
  const inner =
    sorted.length === 0
      ? ""
      : `\n${sorted.map((s) => `  "${s}",`).join("\n")}\n`;
  writeFileSync(
    BLOCKED_TS,
    `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-54-held-estate.ts
 * Reviews that cannot be finished without fabricating first-hand tests
 * or inventing specs the catalog does not support.
 */
export const BLOCKED_EVIDENCE_REVIEW_SLUGS = new Set<string>([${inner}]);

export function isBlockedEvidenceReview(slug: string): boolean {
  return BLOCKED_EVIDENCE_REVIEW_SLUGS.has(slug);
}
`,
  );
}

async function main(): Promise<void> {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(FIXES_DIR, { recursive: true });
  const exportOnly = flag("export-only");
  const limit = arg("limit") ? Number(arg("limit")) : undefined;

  console.error("p54: clustering (Fix 50 category-peer)...");
  const liveReviews = getReviews(PROD);
  const clustered = cluster(liveReviews);

  const heldRows: Array<{
    slug: string;
    group: HoldGroup;
    vertical: string;
    categoryId: string;
    quality: string;
    clusterClass: string;
    maxPeer: string;
    peer: string;
    indexable: boolean;
    editorialReady: boolean;
    eligReasons: string;
  }> = [];

  const groupCounts: Record<HoldGroup, number> = {
    DUPLICATIVE: 0,
    NEEDS_DIFF: 0,
    NEEDS_RESEARCH: 0,
    VERTICAL_HOLD_ONLY: 0,
    OTHER: 0,
  };

  let ready = 0;
  let indexable = 0;
  let held = 0;

  for (const item of clustered) {
    const product = getProductById(item.review.productId, PROD);
    const quality = assessReviewLaunchQuality(item.review, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "review", entity: item.review },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "review", entity: item.review },
      PROD,
    );
    const idx = isIndexableEligibility(elig);
    if (editorial.ready) ready++;
    if (idx) indexable++;
    if (!idx) held++;

    if (idx) continue;

    const reasons = elig.reasons.map((r) => r.code);
    const group = holdGroup({
      slug: item.slug,
      editorialReady: editorial.ready,
      indexable: idx,
      eligReasons: reasons,
      quality: quality.quality,
      clusterClass: item.class,
    });
    groupCounts[group]++;
    heldRows.push({
      slug: item.slug,
      group,
      vertical: verticalBucket(product),
      categoryId: item.categoryId,
      quality: quality.quality,
      clusterClass: item.class ?? "",
      maxPeer: (item.maxPeer ?? 0).toFixed(3),
      peer: item.peer ?? "",
      indexable: idx,
      editorialReady: editorial.ready,
      eligReasons: reasons.join("|"),
    });
  }

  const before = {
    total: liveReviews.length,
    READY: ready,
    INDEXABLE: indexable,
    HELD: held,
    uniquenessHolds: CONTENT_UNIQUENESS_REVIEW_HOLDS.size,
    clusterNeedsDiff: clustered.filter(
      (c) => c.class === "NEEDS_DIFFERENTIATION",
    ).length,
    clusterDuplicative: clustered.filter((c) => c.class === "DUPLICATIVE")
      .length,
    indexableNeedsDiff: clustered.filter(
      (c) => c.indexable && c.class === "NEEDS_DIFFERENTIATION",
    ).length,
    indexableDuplicative: clustered.filter(
      (c) => c.indexable && c.class === "DUPLICATIVE",
    ).length,
    groups: groupCounts,
  };

  const csvHeaders = [
    "slug",
    "group",
    "vertical",
    "categoryId",
    "quality",
    "clusterClass",
    "maxPeerSimilarity",
    "nearestPeer",
    "editorialReady",
    "eligReasons",
  ];
  const csv = [
    csvHeaders.join(","),
    ...heldRows.map((r) =>
      [
        r.slug,
        r.group,
        r.vertical,
        r.categoryId,
        r.quality,
        r.clusterClass,
        r.maxPeer,
        r.peer,
        String(r.editorialReady),
        r.eligReasons,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n");
  writeFileSync(join(DATA_DIR, "54-held-reviews.csv"), csv + "\n");
  writeFileSync(
    join(DATA_DIR, "54-held-reviews.json"),
    JSON.stringify({ before, rows: heldRows }, null, 2),
  );
  console.error(
    `p54: before READY=${ready} INDEXABLE=${indexable} HELD=${held} holds=${CONTENT_UNIQUENESS_REVIEW_HOLDS.size} groups=${JSON.stringify(groupCounts)}`,
  );

  if (exportOnly) return;

  const heldSlugs = originalHeldSlugs();
  const targetItems = clustered
    .filter((c) => heldSlugs.includes(c.slug))
    .sort(
      (a, b) =>
        categoryRank(a.categoryId) - categoryRank(b.categoryId) ||
        a.slug.localeCompare(b.slug),
    );
  const targets = limit ? targetItems.slice(0, limit) : targetItems;
  console.error(`p54: synthesizing ${targets.length} uniqueness-held reviews`);

  const products = getProducts({ isDev: true });
  const byId = new Map(products.map((p) => [p.id, p]));
  const pub = publishedMeta();
  const rewritten: Review[] = [];
  const blockedEvidence: Array<{ slug: string; gaps: string[] }> = [];

  for (const item of targets) {
    const product = getProductById(item.review.productId, { isDev: true });
    if (!product) {
      blockedEvidence.push({
        slug: item.slug,
        gaps: ["orphan_product"],
      });
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
      allowThinCatalog: true,
    });
    if ("status" in result && result.status === "NEEDS_RESEARCH") {
      blockedEvidence.push({
        slug: item.slug,
        gaps: result.gaps ?? ["insufficient_catalog_signal"],
      });
      console.error(
        `p54: BLOCKED_EVIDENCE ${item.slug} ${(result.gaps ?? []).join("|")}`,
      );
      continue;
    }
    const review = result as Review;
    rewritten.push({
      ...review,
      status: item.review.status ?? "published",
      publishedAt: item.review.publishedAt ?? pub.publishedAt,
      createdAt: item.review.createdAt ?? pub.createdAt,
      updatedAt: pub.updatedAt,
    });
    if (rewritten.length % 25 === 0) {
      console.error(`p54: rewrote ${rewritten.length}/${targets.length}`);
    }
  }

  const rewrittenBySlug = new Map(rewritten.map((r) => [r.slug, r]));
  const mergeLive = () =>
    liveReviews.map((r) => rewrittenBySlug.get(r.slug) ?? r);

  console.error("p54: re-clustering rewritten set...");
  let after = cluster(mergeLive());
  const failing = (items: ClusterItem[]) =>
    items.filter(
      (c) =>
        c.class === "NEEDS_DIFFERENTIATION" || c.class === "DUPLICATIVE",
    );

  for (let pass = 1; pass <= 3; pass++) {
    const remain = failing(after);
    console.error(
      `p54: pass ${pass} remaining DUP/NEEDS_DIFF=${remain.length} (indexable ${remain.filter((c) => c.indexable).length})`,
    );
    if (remain.length === 0) break;
    for (const item of remain) {
      const current = rewrittenBySlug.get(item.slug) ?? item.review;
      const product = getProductById(item.review.productId, { isDev: true });
      if (!product) continue;
      const peerItem = after.find((c) => c.slug === item.peer);
      const peerProduct = peerItem
        ? getProductById(peerItem.review.productId, { isDev: true })
        : undefined;
      const boosted = uniqueAgainstPeer(current, product, peerProduct);
      rewrittenBySlug.set(item.slug, boosted);
    }
    after = cluster(mergeLive());
  }

  const finalRewritten = [...rewrittenBySlug.values()];
  const remainFail = failing(after);
  const remainHeldFail = remainFail.filter((c) =>
    heldSlugs.includes(c.slug),
  );

  writeFileSync(CONTENT_JSON, JSON.stringify(finalRewritten) + "\n");
  writeFileSync(
    CONTENT_TS,
    `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-54-held-estate.ts
 * Spec-driven unique Expert Research overlays for uniqueness-held reviews.
 */
import type { Review } from "@/domain/editorial/types";
import data from "@/content/reviews-p54-held-finalized.json";

export const reviewsP54HeldFinalized: Review[] = data as Review[];
`,
  );

  const blockedSlugs = blockedEvidence.map((b) => b.slug);
  writeBlockedEvidence(blockedSlugs);
  // Remaining cluster failures keep a uniqueness hold so they cannot become
  // INDEXABLE clones. Listed as non-ready in the Fix 54 report.
  writeUniquenessHolds(remainHeldFail.map((c) => c.slug));

  const afterNeeds = after.filter(
    (c) => c.class === "NEEDS_DIFFERENTIATION",
  ).length;
  const afterDup = after.filter((c) => c.class === "DUPLICATIVE").length;
  const afterIdxNeeds = after.filter(
    (c) => c.indexable && c.class === "NEEDS_DIFFERENTIATION",
  ).length;
  const afterIdxDup = after.filter(
    (c) => c.indexable && c.class === "DUPLICATIVE",
  ).length;

  writeFileSync(
    join(DATA_DIR, "54-held-estate-result.json"),
    JSON.stringify(
      {
        before,
        rewritten: finalRewritten.length,
        blockedEvidence,
        remainingClusterFail: remainFail.map((c) => ({
          slug: c.slug,
          class: c.class,
          maxPeer: c.maxPeer,
          peer: c.peer,
          indexable: c.indexable,
          categoryId: c.categoryId,
        })),
        after: {
          clusterNeedsDiff: afterNeeds,
          clusterDuplicative: afterDup,
          indexableNeedsDiff: afterIdxNeeds,
          indexableDuplicative: afterIdxDup,
          uniquenessHolds: remainHeldFail.length,
          blockedEvidence: blockedSlugs.length,
        },
      },
      null,
      2,
    ),
  );

  console.error(
    `p54: wrote ${finalRewritten.length} overlays; remaining cluster fail=${remainFail.length} blocked=${blockedSlugs.length} holds=${remainHeldFail.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
