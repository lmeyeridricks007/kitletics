/**
 * Fix 85 — evaluate the same review set across assessors.
 * Writes docs/prelaunch/data/rc-85/assessor-matrix.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { assessReviewArticle } from "@/lib/review/assess-review-article-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessReviewEditorialReadiness } from "@/domain/editorial-readiness/assess";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { getReviews } from "@/repositories";
import {
  articleSeverityToRelease,
  reviewDecisionCopyText,
} from "@/lib/review/quality-contract";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";

const PROD = { isDev: false as const };
const OUT = join(
  process.cwd(),
  process.env.ASSESSOR_MATRIX_OUT ?? "docs/prelaunch/data/rc-v3",
);

const FLAGSHIPS = [
  "nike-vomero-18",
  "asics-novablast-6",
  "brooks-glycerin-22",
  "garmin-forerunner-970",
  "hoka-clifton-10",
];

function evaluate(slug: string) {
  const data = getReviewPageData(slug, PROD);
  const src = getReviews({ isDev: true }).find((r) => r.slug === slug);
  if (!data) {
    return { slug, missing: true as const };
  }
  const article = assessReviewArticle(data);
  const launch = assessReviewLaunchQuality(data.review, PROD);
  const ed = assessReviewEditorialReadiness(data.review, PROD);
  const elig = getLaunchEligibility(
    { kind: "review", entity: data.review },
    PROD,
  );
  const decision = reviewDecisionCopyText(data.review);
  const sourceJunk = src
    ? isReportOrJunkVoice(src.summary ?? "") ||
      (src.sections ?? []).some((s) => isReportOrJunkVoice(s.body))
    : null;

  return {
    slug,
    launchQuality: launch.quality,
    editorialReady: ed.ready,
    workState: ed.workState,
    disposition: elig.disposition,
    indexable: isIndexableEligibility(elig),
    articleScore: article.score,
    articleGrade: article.grade,
    findings: article.findings.map((f) => ({
      code: f.code,
      severity: f.severity,
      releaseSeverity: articleSeverityToRelease(f.severity),
      message: f.message,
    })),
    p0: article.findings.filter((f) => f.severity === "P0").map((f) => f.code),
    enrichedDecisionJunk: isReportOrJunkVoice(decision),
    sourceSeedJunk: sourceJunk,
    surface: "enriched_page" as const,
  };
}

function pickRandom<T>(items: T[], n: number, seed: number): T[] {
  const arr = [...items];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, n);
}

const all = getReviews(PROD);
const indexable = all.filter((r) =>
  isIndexableEligibility(
    getLaunchEligibility({ kind: "review", entity: r }, PROD),
  ),
);
const held = all.filter(
  (r) =>
    !isIndexableEligibility(
      getLaunchEligibility({ kind: "review", entity: r }, PROD),
    ),
);

const randomIndexable = pickRandom(
  indexable.filter((r) => !FLAGSHIPS.includes(r.slug)),
  10,
  85,
).map((r) => r.slug);
const randomHeld = pickRandom(held, 10, 8501).map((r) => r.slug);

const weakFixtures = [
  "buff-merino-lightweight",
  "buff-polar",
  "new-balance-fuelcell-rebel-v4",
].filter((slug) => all.some((r) => r.slug === slug));

const matrix = {
  asOf: new Date().toISOString(),
  contract: {
    p0Means: REVIEW_NOTE(),
    publicationSurface: "enriched decision copy (excludes testingContext / editorialDisclosure)",
    sourceSeed: "LOW diagnostic only",
  },
  flagships: FLAGSHIPS.map(evaluate),
  randomIndexable: randomIndexable.map(evaluate),
  randomHeld: randomHeld.map(evaluate),
  historicalWeakSourceSeeds: weakFixtures.map(evaluate),
  summary: null as null | Record<string, unknown>,
};

function REVIEW_NOTE() {
  return "Article P0 ≡ release BLOCKER on enriched decision copy — not disclosure template wording";
}

const flagshipP0 = matrix.flagships.filter(
  (r) => !("missing" in r && r.missing) && (r as { p0: string[] }).p0?.length,
);
matrix.summary = {
  flagshipCount: matrix.flagships.length,
  flagshipsWithArticleP0: flagshipP0.map((r) => (r as { slug: string }).slug),
  randomIndexableWithP0: matrix.randomIndexable.filter(
    (r) => !("missing" in r && r.missing) && (r as { p0: string[] }).p0.length,
  ).length,
  randomHeldSampled: matrix.randomHeld.length,
  sourceSeedJunkAmongFlagships: matrix.flagships.filter(
    (r) => (r as { sourceSeedJunk?: boolean }).sourceSeedJunk,
  ).length,
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "assessor-matrix.json"), JSON.stringify(matrix, null, 2));
console.log(JSON.stringify(matrix.summary, null, 2));
console.log(`wrote ${join(OUT, "assessor-matrix.json")}`);
