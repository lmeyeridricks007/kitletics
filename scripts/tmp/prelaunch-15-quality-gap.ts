import { getReviews, getBestGuides } from "@/repositories";
import { getProductById } from "@/repositories/products";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { readFileSync } from "fs";

const PROD = { isDev: false as const };
const a03 = JSON.parse(
  readFileSync("docs/prelaunch/data/03-editorial-quality.json", "utf8"),
);
const lrRoutes: string[] = a03.day1Evidence.launchReadyReviewRoutes;
const RUNNING = "sport-running";
let runLr = 0;
let runLrDomainOk = 0;
let runLrDomainBad = 0;
const bad: { slug: string; q: string; reasons: string[] }[] = [];
for (const route of lrRoutes) {
  const slug = route.replace("/reviews/", "");
  const r = getReviews(PROD).find((x) => x.slug === slug);
  if (!r) continue;
  const p = getProductById(r.productId, PROD);
  if (!p?.sportIds.includes(RUNNING)) continue;
  runLr++;
  const q = assessReviewLaunchQuality(r, PROD);
  if (q.quality === "LAUNCH_READY") runLrDomainOk++;
  else {
    runLrDomainBad++;
    bad.push({ slug, q: q.quality, reasons: q.reasons });
  }
}
console.log({ runLr, runLrDomainOk, runLrDomainBad });
console.log("sample bad", bad.slice(0, 12));
const reasonCounts = new Map<string, number>();
for (const b of bad) {
  for (const r of b.reasons.slice(0, 4))
    reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1);
}
console.log(
  [...reasonCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
);

const bestLr: string[] = a03.day1Evidence.launchReadyBestRoutes;
console.log("audit best LR", bestLr);
const domainBest = getBestGuides(PROD).map((g) => {
  const q = assessBestGuideLaunchQuality(g, PROD);
  return { slug: g.slug, q: q.quality, reasons: q.reasons };
});
const domainLr = domainBest.filter((b) => b.q === "LAUNCH_READY");
console.log(
  "domain best LR",
  domainLr.length,
  domainLr.map((b) => b.slug),
);
const extra = domainLr.filter((b) => !bestLr.includes(`/best/${b.slug}`));
console.log("extra domain LR", extra);
const missing = bestLr.filter(
  (r) => !domainLr.some((b) => `/best/${b.slug}` === r),
);
console.log("missing from domain", missing);
