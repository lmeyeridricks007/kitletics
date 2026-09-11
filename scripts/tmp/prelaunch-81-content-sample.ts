/**
 * Identify CONTENT-002 source junk slugs + article P0 on INDEXABLE sample.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getReviews } from "@/repositories";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { assessReviewArticle } from "@/lib/review/assess-review-article-quality";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";

const PROD = { isDev: false as const };
const reviews = getReviews(PROD);
const junkSource = reviews
  .filter(
    (r) =>
      isReportOrJunkVoice(r.summary) ||
      (r.sections ?? []).some((s) => isReportOrJunkVoice(s.body)),
  )
  .map((r) => r.slug);

const flagship = [
  "nike-vomero-18",
  "asics-novablast-6",
  "brooks-glycerin-22",
  "garmin-forerunner-970",
  "hoka-clifton-10",
];
const article: Array<Record<string, unknown>> = [];
for (const slug of flagship) {
  const data = getReviewPageData(slug, PROD);
  if (!data) {
    article.push({ slug, missing: true });
    continue;
  }
  const a = assessReviewArticle(data);
  article.push({
    slug,
    p0: a.findings.filter((f) => f.severity === "P0").map((f) => f.id),
    p0n: a.findings.filter((f) => f.severity === "P0").length,
    score: a.score,
  });
}

const first15 = reviews.slice(0, 15).map((r) => r.slug);
const first15Indexable = reviews.slice(0, 15).map((r) => {
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  return { slug: r.slug, indexable: isIndexableEligibility(elig) };
});

const out = { junkSource, flagshipArticle: article, first15, first15Indexable };
writeFileSync(
  join(process.cwd(), "docs/prelaunch/data/rc-81/content-sample.json"),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
