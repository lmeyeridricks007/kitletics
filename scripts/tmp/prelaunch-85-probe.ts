import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { assessReviewArticle } from "@/lib/review/assess-review-article-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessReviewEditorialReadiness } from "@/domain/editorial-readiness/assess";
import { getLaunchEligibility } from "@/domain/launch";
import { getReviews } from "@/repositories";
import {
  isReportOrJunkVoice,
  FRIENDLY_TESTING_CONTEXT,
} from "@/lib/review/review-voice";

const PROD = { isDev: false as const };
const FLAGSHIPS = [
  "nike-vomero-18",
  "asics-novablast-6",
  "brooks-glycerin-22",
  "garmin-forerunner-970",
  "hoka-clifton-10",
];

function decisionText(
  data: NonNullable<ReturnType<typeof getReviewPageData>>,
): string {
  const r = data.review;
  return [
    r.summary,
    r.verdict,
    r.bottomLine,
    ...r.pros,
    ...r.cons,
    ...r.whoShouldBuy,
    ...r.whoShouldAvoid,
    ...r.sections.map((s) => s.body),
  ].join("\n");
}

function row(slug: string) {
  const data = getReviewPageData(slug, PROD);
  if (!data) return { slug, missing: true };
  const article = assessReviewArticle(data);
  const launch = assessReviewLaunchQuality(data.review, PROD);
  const ed = assessReviewEditorialReadiness(data.review, PROD);
  const elig = getLaunchEligibility(
    { kind: "review", entity: data.review },
    PROD,
  );
  const src = getReviews({ isDev: true }).find((r) => r.slug === slug);
  return {
    slug,
    launch: launch.quality,
    ready: ed.ready,
    workState: ed.workState,
    disposition: elig.disposition,
    articleScore: article.score,
    p0: article.findings.filter((f) => f.severity === "P0").map((f) => f.code),
    p1: article.findings.filter((f) => f.severity === "P1").map((f) => f.code),
    enrichedJunkDecision: isReportOrJunkVoice(decisionText(data)),
    enrichedJunkFull: isReportOrJunkVoice(
      [decisionText(data), data.review.testingContext ?? ""].join("\n"),
    ),
    sourceJunk: src
      ? isReportOrJunkVoice(src.summary ?? "") ||
        (src.sections ?? []).some((s) => isReportOrJunkVoice(s.body))
      : null,
    testingCtxExpert: /Expert Research/i.test(data.review.testingContext ?? ""),
  };
}

console.log(JSON.stringify({
  friendlyMatchesJunk: isReportOrJunkVoice(
    FRIENDLY_TESTING_CONTEXT("Nike Vomero 18"),
  ),
  flagships: FLAGSHIPS.map(row),
}, null, 2));
