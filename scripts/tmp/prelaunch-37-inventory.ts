#!/usr/bin/env tsx
/**
 * Fix 37 — inventory duplicative reviews + catalog research readiness.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getProducts } from "@/repositories/products";
import { getReviews } from "@/repositories/editorial";
import { getEvidenceForIds } from "@/repositories/recommendations";
import queue from "../../docs/prelaunch/editorial/data/editorial-work-queue.json";

type QItem = (typeof queue.items)[number];

const products = new Map(getProducts({ isDev: true }).map((p) => [p.slug, p]));
const reviews = new Map(getReviews().map((r) => [r.slug, r]));

const need = (queue.items as QItem[]).filter(
  (i) => i.type === "review" && i.workState === "NEEDS_UNIQUE_REWRITE",
);
const needsDiff = (queue.items as QItem[]).filter(
  (i) =>
    i.type === "review" &&
    (i.uniquenessClassification === "NEEDS_DIFFERENTIATION" ||
      i.uniquenessClassification === "NEEDS DIFFERENTIATION"),
);
const ready = (queue.items as QItem[]).filter(
  (i) => i.type === "review" && i.workState === "READY",
);

type Row = {
  slug: string;
  sport: string;
  categoryId: string;
  priority: string;
  uniqueness: string;
  productName: string;
  brandSlug: string;
  strengthCount: number;
  weaknessCount: number;
  whatLen: number;
  specCount: number;
  altCount: number;
  evidenceIds: string[];
  evidenceKinds: string[];
  catalogOnlyEvidence: boolean;
  researchReady: boolean;
  researchGap: string[];
};

function assess(slug: string, sport: string, priority: string, uniqueness: string): Row | null {
  const p = products.get(slug);
  if (!p) return null;
  const strengths = p.strengths ?? [];
  const weaknesses = p.weaknesses ?? [];
  const what = p.whatIsThis ?? "";
  const specs = p.specs ?? {};
  const alts =
    (p as { alternativeProductIds?: string[] }).alternativeProductIds ??
    (p as { alternatives?: string[] }).alternatives ??
    [];
  const evidenceIds = p.evidenceIds ?? [];
  const evidence = getEvidenceForIds(evidenceIds);
  const evidenceKinds = evidence.map((e) => e.kind ?? e.type ?? "unknown");
  const catalogOnlyEvidence =
    evidenceIds.length === 0 ||
    evidenceIds.every((id) => id.startsWith("ev-catalog-") || id.includes("catalog"));

  const gaps: string[] = [];
  if (strengths.length < 2) gaps.push("few_strengths");
  if (weaknesses.length < 1) gaps.push("no_weaknesses");
  if (what.length < 40) gaps.push("thin_whatIsThis");
  if (Object.keys(specs).length < 2) gaps.push("thin_specs");
  if (alts.length < 1) gaps.push("no_alts");
  if (catalogOnlyEvidence) gaps.push("catalog_only_evidence");

  // Research-ready = enough product-specific catalog signal to write unique Expert Research
  // without inventing performance claims. External enrichment still preferred.
  const researchReady =
    strengths.length >= 2 &&
    what.length >= 40 &&
    (weaknesses.length >= 1 || Object.keys(specs).length >= 3) &&
    !gaps.includes("thin_whatIsThis");

  return {
    slug,
    sport,
    categoryId: p.categoryId,
    priority,
    uniqueness,
    productName: p.name,
    brandSlug: p.brandSlug,
    strengthCount: strengths.length,
    weaknessCount: weaknesses.length,
    whatLen: what.length,
    specCount: Object.keys(specs).length,
    altCount: Array.isArray(alts) ? alts.length : 0,
    evidenceIds,
    evidenceKinds: evidenceKinds.map(String),
    catalogOnlyEvidence,
    researchReady,
    researchGap: gaps,
  };
}

const rows: Row[] = [];
for (const i of need) {
  const row = assess(i.slug, i.sport, i.priority, String(i.uniquenessClassification));
  if (row) rows.push(row);
}

const byCat: Record<string, { total: number; researchReady: number; catalogOnly: number }> = {};
const bySport: Record<string, { total: number; researchReady: number }> = {};
for (const r of rows) {
  byCat[r.categoryId] ??= { total: 0, researchReady: 0, catalogOnly: 0 };
  byCat[r.categoryId].total++;
  if (r.researchReady) byCat[r.categoryId].researchReady++;
  if (r.catalogOnlyEvidence) byCat[r.categoryId].catalogOnly++;
  bySport[r.sport] ??= { total: 0, researchReady: 0 };
  bySport[r.sport].total++;
  if (r.researchReady) bySport[r.sport].researchReady++;
}

const outDir = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(outDir, { recursive: true });

const summary = {
  generatedAt: new Date().toISOString(),
  reviewsInQueue: {
    NEEDS_UNIQUE_REWRITE: need.length,
    NEEDS_DIFF_like: needsDiff.length,
    READY: ready.length,
    liveReviewCount: reviews.size,
  },
  researchReadiness: {
    total: rows.length,
    researchReady: rows.filter((r) => r.researchReady).length,
    needsExternalOrBlocked: rows.filter((r) => !r.researchReady).length,
    catalogOnlyEvidence: rows.filter((r) => r.catalogOnlyEvidence).length,
  },
  bySport,
  byCategory: Object.fromEntries(
    Object.entries(byCat).sort((a, b) => b[1].total - a[1].total),
  ),
  categoryOrder: [
    "cat-running-shoes",
    "cat-gps-watches",
    "cat-heart-rate-monitors",
    "cat-packs-vests",
    "cat-socks",
    "cat-headphones",
    "cat-running-clothing",
    "cat-sunglasses",
    "cat-lights",
    "cat-belts",
    "cat-nutrition",
    "cat-recovery",
  ],
};

writeFileSync(join(outDir, "37-review-research-inventory.json"), JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${rows.length} rows`);
