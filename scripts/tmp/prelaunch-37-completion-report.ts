#!/usr/bin/env tsx
/**
 * Fix 37 — completion report generator.
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-37-completion-report.ts
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getReviews } from "@/repositories/editorial";
import { getProducts } from "@/repositories/products";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { scaffoldHitCount } from "@/domain/content-uniqueness/text";

const OUT_MD = join(
  process.cwd(),
  "docs/prelaunch/editorial/01-ALL-REVIEWS-COMPLETION.md",
);
const OUT_JSON = join(
  process.cwd(),
  "docs/prelaunch/editorial/data/37-all-reviews-completion.json",
);
const UNIQUENESS = join(
  process.cwd(),
  "docs/prelaunch/data/25-content-uniqueness.json",
);
const REWRITE = join(
  process.cwd(),
  "docs/prelaunch/editorial/data/37-unique-rewrite-report.json",
);

type Class =
  | "READY"
  | "NEEDS_RESEARCH"
  | "DUPLICATIVE"
  | "NEEDS_DIFF"
  | "BLOCKED";

function main(): void {
  mkdirSync(join(process.cwd(), "docs/prelaunch/editorial/data"), {
    recursive: true,
  });

  const uniqueness = existsSync(UNIQUENESS)
    ? JSON.parse(readFileSync(UNIQUENESS, "utf8"))
    : null;
  const rewrite = existsSync(REWRITE)
    ? JSON.parse(readFileSync(REWRITE, "utf8"))
    : null;

  const classBySlug = new Map<string, string>();
  const clusters = uniqueness?.clusters ?? {};
  for (const row of [
    ...(clusters.reviewsDuplicative ?? []),
    ...(clusters.reviewsNeedsDiff ?? []),
  ]) {
    classBySlug.set(row.slug, row.class);
  }
  // Prefer auditor summary counts when cluster exports are truncated.
  const auditorDup = Number(uniqueness?.summary?.reviews?.DUPLICATIVE ?? 0);
  const auditorNeedsDiff = Number(
    uniqueness?.summary?.reviews?.NEEDS_DIFFERENTIATION ?? 0,
  );
  const needsResearchSlugs = new Set<string>(
    (rewrite?.needsResearch ?? []).map((r: { slug: string }) => r.slug),
  );

  const products = getProducts({ isDev: true });
  const productById = new Map(products.map((p) => [p.id, p]));
  const reviews = getReviews({ isDev: true });
  const opts = { isDev: true };

  type Row = {
    slug: string;
    title: string;
    categoryId: string;
    sport: string;
    class: Class;
    uniquenessClass: string;
    launchQuality: string;
    held: boolean;
    scaffoldHits: number;
    reason: string;
  };

  const rows: Row[] = [];

  for (const review of reviews) {
    const product = productById.get(review.productId);
    const categoryId = product?.categoryId ?? "unknown";
    const sportIds = product?.sportIds ?? [];
    const sport = sportIds.some((s) => s.includes("running"))
      ? "running"
      : sportIds.some((s) => s.includes("padel"))
        ? "padel"
        : sportIds.some((s) => s.includes("tennis"))
          ? "tennis"
          : sportIds.some((s) => s.includes("fitness") || s.includes("hyrox"))
            ? "fitness"
            : "other";

    const body = [
      review.summary,
      review.verdict,
      review.bottomLine,
      ...(review.sections ?? []).map((s) => s.body),
    ]
      .filter(Boolean)
      .join("\n\n");
    const scaffoldHits = scaffoldHitCount(body);
    const launch = assessReviewLaunchQuality(review, opts);
    const uClass = classBySlug.get(review.slug);
    const held = isContentUniquenessReviewHeld(review.slug);

    let cls: Class = "READY";
    let reason = "cleared_uniqueness_or_curated_unique";

    if (needsResearchSlugs.has(review.slug)) {
      cls = "NEEDS_RESEARCH";
      reason = "insufficient_catalog_signal_for_safe_unique_rewrite";
    } else if (review.status === "archived") {
      cls = "BLOCKED";
      reason = "archived";
    } else if (uClass === "DUPLICATIVE") {
      cls = "DUPLICATIVE";
      reason = "uniqueness_auditor_duplicative";
    } else if (uClass === "NEEDS_DIFFERENTIATION") {
      cls = "NEEDS_DIFF";
      reason = "uniqueness_auditor_needs_differentiation";
    } else if (held) {
      // Held but not in truncated cluster export — treat as NEEDS_DIFF work
      cls = "NEEDS_DIFF";
      reason = "content_uniqueness_hold";
    } else if (
      uClass === "GENUINELY_UNIQUE" ||
      uClass === "TEMPLATE_SIMILAR_ACCEPTABLE"
    ) {
      cls = "READY";
      reason = uClass.toLowerCase();
    } else if (
      /Kitletics Expert Research Review/i.test(review.testingContext ?? "") &&
      scaffoldHits === 0
    ) {
      cls = "READY";
      reason = "unique_expert_research_rewrite";
    }

    rows.push({
      slug: review.slug,
      title: review.title,
      categoryId,
      sport,
      class: cls,
      uniquenessClass: uClass ?? (held ? "HELD" : "UNCLASSIFIED_OK"),
      launchQuality: launch.quality,
      held,
      scaffoldHits,
      reason,
    });
  }

  const byClass = rows.reduce(
    (acc, r) => {
      acc[r.class] = (acc[r.class] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byCategory: Record<
    string,
    Record<Class | "total", number>
  > = {};
  for (const r of rows) {
    byCategory[r.categoryId] ??= {
      total: 0,
      READY: 0,
      NEEDS_RESEARCH: 0,
      DUPLICATIVE: 0,
      NEEDS_DIFF: 0,
      BLOCKED: 0,
    };
    byCategory[r.categoryId].total++;
    byCategory[r.categoryId][r.class]++;
  }

  // Align class totals to auditor summary (cluster samples are truncated).
  const heldNotResearch = rows.filter(
    (r) => r.held && r.class !== "NEEDS_RESEARCH",
  );
  const byClassAligned: Record<string, number> = {
    READY: rows.filter(
      (r) => !r.held && r.class !== "NEEDS_RESEARCH" && r.class !== "BLOCKED",
    ).length,
    NEEDS_RESEARCH: rows.filter((r) => r.class === "NEEDS_RESEARCH").length,
    DUPLICATIVE: auditorDup,
    NEEDS_DIFF: Math.max(auditorNeedsDiff, heldNotResearch.length - auditorDup),
    BLOCKED: rows.filter((r) => r.class === "BLOCKED").length,
  };

  const nonReady = rows
    .filter(
      (r) =>
        r.class === "NEEDS_RESEARCH" ||
        r.class === "BLOCKED" ||
        r.held ||
        r.class === "DUPLICATIVE" ||
        r.class === "NEEDS_DIFF",
    )
    .sort((a, b) =>
      a.categoryId === b.categoryId
        ? a.slug.localeCompare(b.slug)
        : a.categoryId.localeCompare(b.categoryId),
    );

  const uniqueRewriteCount = existsSync(
    join(process.cwd(), "src/content/reviews-unique-rewrite.json"),
  )
    ? (JSON.parse(
        readFileSync(
          join(process.cwd(), "src/content/reviews-unique-rewrite.json"),
          "utf8",
        ),
      ) as unknown[]).length
    : 0;

  const md = `# All Reviews Completion — Editorial 37

**Document ID:** \`01-ALL-REVIEWS-COMPLETION\`  
**Generated:** ${new Date().toISOString()}  
**Policy:** Every Review must be product-specific Expert Research (unless real personal-test Evidence exists). No template paraphrase. Insufficient evidence → \`NEEDS_RESEARCH\`, remain held.

## Executive status

| Metric | Count |
|---|---:|
| Live reviews assessed | **${rows.length}** |
| Unique Expert Research rewrites generated | **${uniqueRewriteCount}** |
| \`READY\` | **${byClassAligned.READY ?? 0}** |
| \`NEEDS_DIFF\` | **${byClassAligned.NEEDS_DIFF ?? 0}** |
| \`DUPLICATIVE\` | **${byClassAligned.DUPLICATIVE ?? 0}** |
| \`NEEDS_RESEARCH\` | **${byClassAligned.NEEDS_RESEARCH ?? 0}** |
| \`BLOCKED\` | **${byClassAligned.BLOCKED ?? 0}** |
| Day-1 uniqueness holds (index gate) | **${uniqueness?.summary?.day1ReviewHolds ?? "n/a"}** |

### Uniqueness auditor (enriched Fix 25 re-run)

| Class | Reviews |
|---|---:|
| GENUINELY_UNIQUE | ${uniqueness?.summary?.reviews?.GENUINELY_UNIQUE ?? "n/a"} |
| TEMPLATE_SIMILAR_ACCEPTABLE | ${uniqueness?.summary?.reviews?.TEMPLATE_SIMILAR_ACCEPTABLE ?? "n/a"} |
| NEEDS_DIFFERENTIATION | ${uniqueness?.summary?.reviews?.NEEDS_DIFFERENTIATION ?? "n/a"} |
| DUPLICATIVE | ${uniqueness?.summary?.reviews?.DUPLICATIVE ?? "n/a"} |

**Baseline (pre-37):** 521 DUPLICATIVE · 18 NEEDS_DIFF · ~43 unique/indexable.

**What changed:** Scaffold \`reviews-backfill\` clones were replaced with product-question-map Expert Research rewrites (\`src/content/reviews-unique-rewrite.json\`), enrichment no longer re-injects shared longform scaffolds into those rewrites, and duplicate slug merges were fixed.

**What remains:** Peer similarity after entity-scrub is still high inside thin catalog clusters (especially sunglasses + training shoes), driven by shared category structure and similar strengths/weaknesses — **not** the old “built for a specific job” scaffold. Those stay held until product-specific evidence deepens or further editorial differentiation.

## Target vs actual

| Target | Actual |
|---|---|
| 0 DUPLICATIVE | **${byClassAligned.DUPLICATIVE ?? 0} remaining** |
| 0 NEEDS_DIFF | **${byClassAligned.NEEDS_DIFF ?? 0} remaining** |
| Insufficient-evidence cases held as NEEDS_RESEARCH | **${byClassAligned.NEEDS_RESEARCH ?? 0}** |

## By category

| Category | Total | READY | NEEDS_RESEARCH | DUPLICATIVE | NEEDS_DIFF | BLOCKED |
|---|---:|---:|---:|---:|---:|---:|
${Object.entries(byCategory)
  .sort((a, b) => b[1].total - a[1].total)
  .map(
    ([cat, c]) =>
      `| \`${cat}\` | ${c.total} | ${c.READY} | ${c.NEEDS_RESEARCH} | ${c.DUPLICATIVE} | ${c.NEEDS_DIFF} | ${c.BLOCKED} |`,
  )
  .join("\n")}

## Rewrite pipeline artifacts

| Artifact | Path |
|---|---|
| Unique synthesizer | \`src/domain/review-agent/unique-expert-research.ts\` |
| Question map | \`src/domain/review-agent/product-question-map.ts\` |
| Batch rewrite | \`scripts/tmp/prelaunch-37-unique-rewrite.ts\` |
| Rewritten corpus | \`src/content/reviews-unique-rewrite.json\` |
| Rewrite report | \`docs/prelaunch/editorial/data/37-unique-rewrite-report.json\` |
| Enrichment guard | \`src/lib/review/enrich-review-content.ts\` (skip scaffolds for Kitletics Expert Research bodies) |

## Explicit NEEDS_RESEARCH (insufficient evidence — do not fake READY)

${(rewrite?.needsResearch ?? [])
  .map(
    (r: { slug: string; gaps: string[] }) =>
      `- \`${r.slug}\` — ${ (r.gaps || []).join(", ") || "insufficient signal"}`,
  )
  .join("\n") || "_None recorded in latest rewrite run._"}

## Every remaining non-READY review

${nonReady
  .map(
    (r) =>
      `- **${r.class}** · \`${r.slug}\` · ${r.categoryId} · ${r.sport} · ${r.reason} · uniqueness=${r.uniquenessClass} · held=${r.held}`,
  )
  .join("\n")}

## Next actions (still no auto-publish)

1. Deepen evidence for sunglasses + training-shoe clusters (independent sources beyond \`ev-catalog-*\`).
2. Re-run \`prelaunch-37-unique-rewrite.ts --fresh\` after evidence upgrades.
3. Re-run \`prelaunch-25-content-uniqueness.ts\` and only then drop holds.
4. Keep editorial READY separate from Day-1 indexation.

---

*Expert Research language only. No false first-hand claims.*
`;

  writeFileSync(OUT_MD, md);
  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        byClass: byClassAligned, byClassRaw: byClass,
        byCategory,
        uniqueRewriteCount,
        uniquenessSummary: uniqueness?.summary ?? null,
        rewriteSummary: rewrite?.summary ?? null,
        nonReady,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ byClass: byClassAligned, byClassRaw: byClassAligned, nonReady: nonReady.length, out: OUT_MD }, null, 2));
}

main();
