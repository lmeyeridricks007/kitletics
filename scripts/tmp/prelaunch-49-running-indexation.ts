/**
 * Editorial Fix 49 — Running indexation recalibration audit.
 *
 * Usage:
 *   PHASE=before npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-49-running-indexation.ts
 *   PHASE=after  npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-49-running-indexation.ts
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  assessEditorialReadiness,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  resolveEntityVerticalPolicy,
} from "@/content/launch/vertical-strategy";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getProductById,
  getProducts,
  getReviews,
  getAllProductRelationships,
} from "@/repositories";

const PROD = { isDev: false as const, now: new Date("2026-09-09T12:00:00.000Z") };
const DATA = join(process.cwd(), "docs/prelaunch/editorial/data");
const PHASE = (process.env.PHASE ?? "after") as "before" | "after";

function isRunningSportIds(sportIds: string[]): boolean {
  return resolveEntityVerticalPolicy(sportIds).slug === "running";
}

function reasonCodes(
  elig: ReturnType<typeof getLaunchEligibility>,
): string[] {
  return elig.reasons.map((r) => r.code);
}

function main() {
  const snapshot = {
    phase: PHASE,
    generatedAt: new Date().toISOString(),
    uniquenessHoldCount: 0 as number,
    alternativesHoldCount: ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.size,
    byType: {} as Record<
      string,
      {
        runningTotal: number;
        runningReady: number;
        runningIndexable: number;
        runningReadyNotIndexable: number;
        readyNotIndexableReasons: Record<string, number>;
        sampleReadyNotIndexable: { slug: string; reasons: string[] }[];
        nonRunningReady: number;
        nonRunningIndexable: number;
      }
    >,
  };

  // Reviews
  {
    const rows = getReviews(PROD).map((r) => {
      const product = getProductById(r.productId, PROD);
      const running = isRunningSportIds(product?.sportIds ?? []);
      const editorial = assessEditorialReadiness(
        { kind: "review", entity: r },
        PROD,
      );
      const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
      return {
        slug: r.slug,
        running,
        ready: editorial.ready,
        indexable: isIndexableEligibility(elig),
        held: isContentUniquenessReviewHeld(r.slug),
        reasons: reasonCodes(elig),
        gaps: editorial.gaps,
      };
    });
    snapshot.uniquenessHoldCount = rows.filter((r) => r.held).length;
    const running = rows.filter((r) => r.running);
    const readyNotIdx = running.filter((r) => r.ready && !r.indexable);
    const reasonBag: Record<string, number> = {};
    for (const r of readyNotIdx) {
      for (const c of r.reasons) reasonBag[c] = (reasonBag[c] ?? 0) + 1;
    }
    snapshot.byType.review = {
      runningTotal: running.length,
      runningReady: running.filter((r) => r.ready).length,
      runningIndexable: running.filter((r) => r.indexable).length,
      runningReadyNotIndexable: readyNotIdx.length,
      readyNotIndexableReasons: reasonBag,
      sampleReadyNotIndexable: readyNotIdx.slice(0, 15).map((r) => ({
        slug: r.slug,
        reasons: r.reasons,
      })),
      nonRunningReady: rows.filter((r) => !r.running && r.ready).length,
      nonRunningIndexable: rows.filter((r) => !r.running && r.indexable)
        .length,
    };
  }

  // Best
  {
    const rows = getBestGuides(PROD).map((g) => {
      const running = isRunningSportIds(g.sportId ? [g.sportId] : []);
      const editorial = assessEditorialReadiness(
        { kind: "best-guide", entity: g },
        PROD,
      );
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: g },
        PROD,
      );
      return {
        slug: g.slug,
        running,
        ready: editorial.ready,
        indexable: isIndexableEligibility(elig),
        reasons: reasonCodes(elig),
      };
    });
    const running = rows.filter((r) => r.running);
    const readyNotIdx = running.filter((r) => r.ready && !r.indexable);
    const reasonBag: Record<string, number> = {};
    for (const r of readyNotIdx) {
      for (const c of r.reasons) reasonBag[c] = (reasonBag[c] ?? 0) + 1;
    }
    snapshot.byType.best = {
      runningTotal: running.length,
      runningReady: running.filter((r) => r.ready).length,
      runningIndexable: running.filter((r) => r.indexable).length,
      runningReadyNotIndexable: readyNotIdx.length,
      readyNotIndexableReasons: reasonBag,
      sampleReadyNotIndexable: readyNotIdx.slice(0, 15).map((r) => ({
        slug: r.slug,
        reasons: r.reasons,
      })),
      nonRunningReady: rows.filter((r) => !r.running && r.ready).length,
      nonRunningIndexable: rows.filter((r) => !r.running && r.indexable)
        .length,
    };
  }

  // Guides
  {
    const rows = getBuyingGuides(PROD).map((g) => {
      const running = isRunningSportIds(g.sportId ? [g.sportId] : []);
      const editorial = assessEditorialReadiness(
        { kind: "buying-guide", entity: g },
        PROD,
      );
      const elig = getLaunchEligibility(
        { kind: "buying-guide", entity: g },
        PROD,
      );
      return {
        slug: g.slug,
        running,
        ready: editorial.ready,
        indexable: isIndexableEligibility(elig),
        reasons: reasonCodes(elig),
      };
    });
    const running = rows.filter((r) => r.running);
    const readyNotIdx = running.filter((r) => r.ready && !r.indexable);
    const reasonBag: Record<string, number> = {};
    for (const r of readyNotIdx) {
      for (const c of r.reasons) reasonBag[c] = (reasonBag[c] ?? 0) + 1;
    }
    snapshot.byType.guide = {
      runningTotal: running.length,
      runningReady: running.filter((r) => r.ready).length,
      runningIndexable: running.filter((r) => r.indexable).length,
      runningReadyNotIndexable: readyNotIdx.length,
      readyNotIndexableReasons: reasonBag,
      sampleReadyNotIndexable: readyNotIdx.slice(0, 15).map((r) => ({
        slug: r.slug,
        reasons: r.reasons,
      })),
      nonRunningReady: rows.filter((r) => !r.running && r.ready).length,
      nonRunningIndexable: rows.filter((r) => !r.running && r.indexable)
        .length,
    };
  }

  // Comparisons
  {
    const rows = getComparisons(PROD).map((c) => {
      const products = c.productIds
        .map((id) => getProductById(id, PROD))
        .filter(Boolean);
      const sportIds = [
        ...new Set(products.flatMap((p) => p!.sportIds ?? [])),
      ];
      const running = isRunningSportIds(sportIds);
      const editorial = assessEditorialReadiness(
        { kind: "comparison", entity: c },
        PROD,
      );
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: c },
        PROD,
      );
      return {
        slug: c.slug,
        running,
        ready: editorial.ready,
        indexable: isIndexableEligibility(elig),
        reasons: reasonCodes(elig),
      };
    });
    const running = rows.filter((r) => r.running);
    const readyNotIdx = running.filter((r) => r.ready && !r.indexable);
    const reasonBag: Record<string, number> = {};
    for (const r of readyNotIdx) {
      for (const c of r.reasons) reasonBag[c] = (reasonBag[c] ?? 0) + 1;
    }
    snapshot.byType.comparison = {
      runningTotal: running.length,
      runningReady: running.filter((r) => r.ready).length,
      runningIndexable: running.filter((r) => r.indexable).length,
      runningReadyNotIndexable: readyNotIdx.length,
      readyNotIndexableReasons: reasonBag,
      sampleReadyNotIndexable: readyNotIdx.slice(0, 15).map((r) => ({
        slug: r.slug,
        reasons: r.reasons,
      })),
      nonRunningReady: rows.filter((r) => !r.running && r.ready).length,
      nonRunningIndexable: rows.filter((r) => !r.running && r.indexable)
        .length,
    };
  }

  // Alternatives (Running products in indexable categories)
  {
    const rels = getAllProductRelationships();
    const rows = getProducts(PROD)
      .filter((p) => isRunningSportIds(p.sportIds ?? []))
      .filter((p) => ALTERNATIVES_INDEXABLE_CATEGORIES.has(p.categoryId))
      .map((p) => {
        const gate = canPublishAlternativesPage(p, rels);
        const editorial = assessEditorialReadiness(
          { kind: "alternatives", entity: p },
          PROD,
        );
        const elig = getLaunchEligibility(
          { kind: "alternatives", entity: p },
          PROD,
        );
        return {
          slug: p.slug,
          running: true,
          ready: editorial.ready,
          indexable: isIndexableEligibility(elig),
          publishOk: gate.ok,
          uniquenessHeld: ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(p.slug),
          reasons: reasonCodes(elig),
        };
      });
    const readyNotIdx = rows.filter((r) => r.ready && !r.indexable);
    const reasonBag: Record<string, number> = {};
    for (const r of readyNotIdx) {
      for (const c of r.reasons) reasonBag[c] = (reasonBag[c] ?? 0) + 1;
    }
    snapshot.byType.alternatives = {
      runningTotal: rows.length,
      runningReady: rows.filter((r) => r.ready).length,
      runningIndexable: rows.filter((r) => r.indexable).length,
      runningReadyNotIndexable: readyNotIdx.length,
      readyNotIndexableReasons: reasonBag,
      sampleReadyNotIndexable: readyNotIdx.slice(0, 15).map((r) => ({
        slug: r.slug,
        reasons: r.reasons,
      })),
      nonRunningReady: 0,
      nonRunningIndexable: 0,
    };
  }

  mkdirSync(DATA, { recursive: true });
  const outPath = join(DATA, `49-running-indexation-${PHASE}.json`);
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify(snapshot, null, 2));

  // Merge before/after if both exist
  const beforePath = join(DATA, "49-running-indexation-before.json");
  const afterPath = join(DATA, "49-running-indexation-after.json");
  if (existsSync(beforePath) && existsSync(afterPath)) {
    const before = JSON.parse(readFileSync(beforePath, "utf8"));
    const after = JSON.parse(readFileSync(afterPath, "utf8"));
    const types = Object.keys(after.byType);
    const delta: Record<string, unknown> = {};
    for (const t of types) {
      const b = before.byType[t];
      const a = after.byType[t];
      delta[t] = {
        runningReady: { before: b.runningReady, after: a.runningReady },
        runningIndexable: {
          before: b.runningIndexable,
          after: a.runningIndexable,
          delta: a.runningIndexable - b.runningIndexable,
        },
        runningReadyNotIndexable: {
          before: b.runningReadyNotIndexable,
          after: a.runningReadyNotIndexable,
        },
      };
    }
    writeFileSync(
      join(DATA, "49-running-indexation-delta.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          uniquenessHoldCount: {
            before: before.uniquenessHoldCount,
            after: after.uniquenessHoldCount,
          },
          alternativesHoldCount: {
            before: before.alternativesHoldCount,
            after: after.alternativesHoldCount,
          },
          byType: delta,
        },
        null,
        2,
      ),
    );
  }
}

main();
