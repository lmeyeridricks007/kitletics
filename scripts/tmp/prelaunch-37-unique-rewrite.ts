#!/usr/bin/env tsx
/**
 * Editorial Completion 37 — unique Expert Research rewrite for held/duplicative reviews.
 *
 * Category order: running shoes → GPS watches → HRM → packs → socks → headphones →
 * clothing → sunglasses → lights → belts → nutrition → recovery → accessories → rest.
 *
 * Does NOT auto-publish. Preserves existing publish status.
 * Marks NEEDS_RESEARCH when product question map is insufficient.
 *
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-37-unique-rewrite.ts
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-37-unique-rewrite.ts --category=cat-running-shoes
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-37-unique-rewrite.ts --limit=5 --dry-run
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import {
  synthesizeUniqueExpertResearch,
  isUniqueExpertResearchEligible,
} from "@/domain/review-agent/unique-expert-research";
import { REVIEW_SCAFFOLD_PHRASES } from "@/domain/content-uniqueness/text";
import { CONTENT_UNIQUENESS_REVIEW_HOLDS } from "@/content/launch/content-uniqueness-holds";
import { getReviews } from "@/repositories/editorial";
import {
  getProducts,
  getBrandById,
} from "@/repositories/products";
import { publishedMeta } from "@/content/config";

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
];

const OUT_DIR = join(process.cwd(), "docs/prelaunch/editorial/data");
const CONTENT_JSON = join(
  process.cwd(),
  "src/content/reviews-unique-rewrite.json",
);
const CONTENT_TS = join(
  process.cwd(),
  "src/content/reviews-unique-rewrite.ts",
);
const PROGRESS = join(OUT_DIR, "37-unique-rewrite-progress.json");
const REPORT = join(OUT_DIR, "37-unique-rewrite-report.json");

type Outcome =
  | "READY"
  | "NEEDS_RESEARCH"
  | "SKIPPED_CURATED"
  | "SKIPPED_NOT_HELD"
  | "ERROR";

type Row = {
  slug: string;
  categoryId: string;
  sport: string;
  outcome: Outcome;
  gaps?: string[];
  sectionCount?: number;
  words?: number;
  scaffoldHits?: number;
  error?: string;
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scaffoldHits(text: string): number {
  const n = text.toLowerCase();
  let hits = 0;
  for (const p of REVIEW_SCAFFOLD_PHRASES) {
    if (n.includes(p.toLowerCase())) hits++;
  }
  return hits;
}

function reviewText(r: Review): string {
  return [
    r.verdict,
    r.bottomLine,
    r.summary,
    r.testingContext,
    ...r.pros,
    ...r.cons,
    ...r.whoShouldBuy,
    ...r.whoShouldAvoid,
    ...r.sections.map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function categoryRank(categoryId: string): number {
  const i = CATEGORY_ORDER.indexOf(categoryId);
  return i >= 0 ? i : CATEGORY_ORDER.length + 1;
}

function sportFromProduct(p: Product): string {
  const ids = p.sportIds ?? [];
  if (ids.some((id) => id.includes("running"))) return "running";
  if (ids.some((id) => id.includes("fitness") || id.includes("hyrox")))
    return "fitness";
  if (ids.some((id) => id.includes("padel"))) return "padel";
  if (ids.some((id) => id.includes("tennis"))) return "tennis";
  return "other";
}

function resolveAlts(product: Product, byId: Map<string, Product>): Product[] {
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
  // Same-category peers if thin alts
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

function isNeedsResearch(
  result: Review | { status: "NEEDS_RESEARCH"; gaps: string[] },
): result is { status: "NEEDS_RESEARCH"; gaps: string[] } {
  return (
    typeof result === "object" &&
    result !== null &&
    "status" in result &&
    (result as { status: string }).status === "NEEDS_RESEARCH" &&
    "gaps" in result &&
    !("productId" in result)
  );
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const dryRun = flag("dry-run");
  const limit = arg("limit") ? Number(arg("limit")) : undefined;
  const categoryFilter = arg("category");
  const onlySlug = arg("product") ?? arg("slug");

  const products = getProducts({ isDev: true });
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const reviews = getReviews();
  const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));

  // Target: uniqueness holds + any live review still carrying scaffold phrases
  const targetSlugs = new Set<string>([...CONTENT_UNIQUENESS_REVIEW_HOLDS]);
  for (const r of reviews) {
    if (scaffoldHits(reviewText(r)) >= 3) targetSlugs.add(r.slug);
  }

  let candidates = [...targetSlugs]
    .map((slug) => {
      const product = bySlug.get(slug);
      const existing = reviewBySlug.get(slug);
      if (!product || !existing) return null;
      return { slug, product, existing };
    })
    .filter(Boolean) as Array<{
    slug: string;
    product: Product;
    existing: Review;
  }>;

  candidates.sort((a, b) => {
    const cr =
      categoryRank(a.product.categoryId) - categoryRank(b.product.categoryId);
    if (cr !== 0) return cr;
    return a.slug.localeCompare(b.slug);
  });

  if (categoryFilter) {
    candidates = candidates.filter(
      (c) => c.product.categoryId === categoryFilter,
    );
  }
  if (onlySlug) {
    candidates = candidates.filter((c) => c.slug === onlySlug);
  }
  if (limit && Number.isFinite(limit)) {
    candidates = candidates.slice(0, limit);
  }

  const rows: Row[] = [];
  const rewritten: Review[] = [];
  const needsResearch: Array<{ slug: string; gaps: string[] }> = [];

  // Resume: always load prior JSON so a scoped/fresh run cannot wipe other categories.
  const priorBySlug = new Map<string, Review>();
  if (existsSync(CONTENT_JSON)) {
    try {
      const prior = JSON.parse(readFileSync(CONTENT_JSON, "utf8")) as Review[];
      for (const r of prior) priorBySlug.set(r.slug, r);
    } catch {
      /* ignore */
    }
  }

  let i = 0;
  for (const { slug, product, existing } of candidates) {
    i++;
    const sport = sportFromProduct(product);
    process.stdout.write(
      `[${i}/${candidates.length}] ${product.categoryId} ${slug}… `,
    );

    if (!isUniqueExpertResearchEligible(product)) {
      const gaps = ["not_eligible_question_map"];
      rows.push({
        slug,
        categoryId: product.categoryId,
        sport,
        outcome: "NEEDS_RESEARCH",
        gaps,
      });
      needsResearch.push({ slug, gaps });
      console.log("NEEDS_RESEARCH (ineligible)");
      continue;
    }

    // Keep prior successful rewrite unless --fresh
    if (!flag("fresh") && priorBySlug.has(slug)) {
      const prior = priorBySlug.get(slug)!;
      const words = countWords(reviewText(prior));
      const hits = scaffoldHits(reviewText(prior));
      if (hits === 0 && prior.sections.length >= 4 && words >= 1200) {
        rewritten.push(prior);
        rows.push({
          slug,
          categoryId: product.categoryId,
          sport,
          outcome: "READY",
          sectionCount: prior.sections.length,
          words,
          scaffoldHits: hits,
        });
        console.log("READY (cached)");
        continue;
      }
    }

    try {
      const brand = getBrandById(product.brandId);
      const alts = resolveAlts(product, byId)
        .map((a) => a)
        .filter(Boolean);
      const result = synthesizeUniqueExpertResearch(product, {
        brandName: brand?.name,
        alternatives: alts,
        evidenceIds: existing.evidenceIds?.length
          ? existing.evidenceIds
          : product.evidenceIds?.length
            ? product.evidenceIds
            : ["ev-catalog-mfr", "ev-catalog-editorial"],
        existing,
      });

      if (isNeedsResearch(result)) {
        rows.push({
          slug,
          categoryId: product.categoryId,
          sport,
          outcome: "NEEDS_RESEARCH",
          gaps: result.gaps,
        });
        needsResearch.push({ slug, gaps: result.gaps });
        console.log(`NEEDS_RESEARCH (${result.gaps.join(",")})`);
        continue;
      }

      const pub = publishedMeta();
      const review: Review = {
        ...result,
        // Preserve launch status — editorial READY ≠ auto indexation
        status: existing.status,
        publishedAt: existing.publishedAt ?? pub.publishedAt,
        createdAt: existing.createdAt ?? pub.createdAt,
        updatedAt: new Date().toISOString(),
        id: existing.id,
        slug: existing.slug,
        productId: existing.productId,
      };

      const text = reviewText(review);
      const words = countWords(text);
      const hits = scaffoldHits(text);
      const prosOk = review.pros.length >= 2;
      const consOk = review.cons.length >= 2;
      const buyOk = review.whoShouldBuy.length >= 2;
      const skipOk = review.whoShouldAvoid.length >= 2;
      const sectionsOk =
        review.sections.filter((s) => countWords(s.body) >= 180).length >= 4;

      if (!prosOk || !consOk || !buyOk || !skipOk || !sectionsOk || hits > 0) {
        const gaps = [
          !prosOk ? "thin_pros" : "",
          !consOk ? "thin_cons" : "",
          !buyOk ? "thin_buy" : "",
          !skipOk ? "thin_skip" : "",
          !sectionsOk ? "thin_sections" : "",
          hits > 0 ? "scaffold_leak" : "",
        ].filter(Boolean);
        rows.push({
          slug,
          categoryId: product.categoryId,
          sport,
          outcome: "NEEDS_RESEARCH",
          gaps,
          sectionCount: review.sections.length,
          words,
          scaffoldHits: hits,
        });
        needsResearch.push({ slug, gaps });
        console.log(`NEEDS_RESEARCH (gate: ${gaps.join(",")})`);
        continue;
      }

      rewritten.push(review);
      rows.push({
        slug,
        categoryId: product.categoryId,
        sport,
        outcome: "READY",
        sectionCount: review.sections.length,
        words,
        scaffoldHits: hits,
      });
      console.log(`READY (${words}w, ${review.sections.length} secs)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      rows.push({
        slug,
        categoryId: product.categoryId,
        sport,
        outcome: "ERROR",
        error: message,
      });
      console.log(`ERROR ${message}`);
    }

    if (i % 25 === 0) {
      writeFileSync(
        PROGRESS,
        JSON.stringify(
          { at: new Date().toISOString(), done: i, total: candidates.length, rows },
          null,
          2,
        ),
      );
    }
  }

  // Merge with any prior rewrites for categories not in this run
  const mergedBySlug = new Map<string, Review>();
  for (const [slug, r] of priorBySlug) mergedBySlug.set(slug, r);
  for (const r of rewritten) mergedBySlug.set(r.slug, r);
  const merged = [...mergedBySlug.values()].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  const byCategory: Record<
    string,
    { total: number; READY: number; NEEDS_RESEARCH: number; ERROR: number }
  > = {};
  for (const row of rows) {
    byCategory[row.categoryId] ??= {
      total: 0,
      READY: 0,
      NEEDS_RESEARCH: 0,
      ERROR: 0,
    };
    byCategory[row.categoryId].total++;
    if (row.outcome === "READY") byCategory[row.categoryId].READY++;
    else if (row.outcome === "NEEDS_RESEARCH")
      byCategory[row.categoryId].NEEDS_RESEARCH++;
    else if (row.outcome === "ERROR") byCategory[row.categoryId].ERROR++;
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    dryRun,
    candidates: candidates.length,
    rewrittenThisRun: rewritten.length,
    mergedTotal: merged.length,
    needsResearch: needsResearch.length,
    byOutcome: rows.reduce(
      (acc, r) => {
        acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    byCategory,
  };

  writeFileSync(REPORT, JSON.stringify({ summary, rows, needsResearch }, null, 2));
  writeFileSync(PROGRESS, JSON.stringify(summary, null, 2));

  if (!dryRun) {
    writeFileSync(CONTENT_JSON, JSON.stringify(merged, null, 2));
    const ts = `/**
 * AUTO-GENERATED by scripts/tmp/prelaunch-37-unique-rewrite.ts
 * Unique Expert Research rewrites for previously DUPLICATIVE / scaffold reviews.
 * Do not hand-edit — re-run the rewrite script.
 */
import type { Review } from "@/domain/editorial/types";
import data from "@/content/reviews-unique-rewrite.json";

export const reviewsUniqueRewrite: Review[] = data as Review[];
`;
    writeFileSync(CONTENT_TS, ts);
    console.log(`\nWrote ${merged.length} reviews → ${CONTENT_JSON}`);
  } else {
    console.log(`\nDry-run: would write ${merged.length} reviews`);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
