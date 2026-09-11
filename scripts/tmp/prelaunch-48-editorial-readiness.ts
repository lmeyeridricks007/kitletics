/**
 * Editorial Fix 48 — unified readiness gate inventory snapshot.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessEditorialReadiness,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getProducts,
  getReviews,
} from "@/repositories";

const PROD = { isDev: false as const, now: new Date("2026-09-09T12:00:00.000Z") };
const DATA = join(process.cwd(), "docs/prelaunch/editorial/data");

function main() {
  const rows: {
    kind: string;
    slug: string;
    path: string;
    ready: boolean;
    workState: string;
    indexable: boolean;
    gaps: string[];
  }[] = [];

  for (const r of getReviews(PROD)) {
    const e = assessEditorialReadiness({ kind: "review", entity: r }, PROD);
    const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
    rows.push({
      kind: "review",
      slug: r.slug,
      path: e.path,
      ready: e.ready,
      workState: e.workState,
      indexable: isIndexableEligibility(elig),
      gaps: e.gaps,
    });
  }
  for (const g of getBestGuides(PROD)) {
    const e = assessEditorialReadiness({ kind: "best-guide", entity: g }, PROD);
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    rows.push({
      kind: "best-guide",
      slug: g.slug,
      path: e.path,
      ready: e.ready,
      workState: e.workState,
      indexable: isIndexableEligibility(elig),
      gaps: e.gaps,
    });
  }
  for (const g of getBuyingGuides(PROD)) {
    const e = assessEditorialReadiness({ kind: "buying-guide", entity: g }, PROD);
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
    rows.push({
      kind: "buying-guide",
      slug: g.slug,
      path: e.path,
      ready: e.ready,
      workState: e.workState,
      indexable: isIndexableEligibility(elig),
      gaps: e.gaps,
    });
  }
  for (const c of getComparisons(PROD)) {
    const e = assessEditorialReadiness({ kind: "comparison", entity: c }, PROD);
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
    rows.push({
      kind: "comparison",
      slug: c.slug,
      path: e.path,
      ready: e.ready,
      workState: e.workState,
      indexable: isIndexableEligibility(elig),
      gaps: e.gaps,
    });
  }

  const byKind = (kind: string) => {
    const subset = rows.filter((r) => r.kind === kind);
    const ready = subset.filter((r) => r.ready).length;
    const indexable = subset.filter((r) => r.indexable).length;
    const indexableNotReady = subset.filter((r) => r.indexable && !r.ready);
    return {
      total: subset.length,
      ready,
      indexable,
      indexableNotReady: indexableNotReady.length,
      indexableNotReadySample: indexableNotReady.slice(0, 5).map((r) => r.slug),
    };
  };

  const summary = {
    generatedAt: new Date().toISOString(),
    policy: {
      editorialReadyRequires: [
        "quality",
        "uniqueness",
        "evidenceSafety",
        "intentUniqueness",
        "relationships",
        "references",
      ],
      readyNeIndexable: true,
      noAbsoluteUrlCeilings: true,
    },
    byKind: {
      review: byKind("review"),
      "best-guide": byKind("best-guide"),
      "buying-guide": byKind("buying-guide"),
      comparison: byKind("comparison"),
    },
    invariant: {
      indexableSubsetOfReady: rows
        .filter((r) => r.indexable)
        .every((r) => r.ready),
    },
    products: getProducts(PROD).length,
  };

  mkdirSync(DATA, { recursive: true });
  writeFileSync(
    join(DATA, "48-editorial-readiness.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
}

main();
