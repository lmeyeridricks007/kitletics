/**
 * Fix 55 — list buying guides that are not editorial READY.
 */
import { assessBuyingGuideEditorialReadiness } from "@/domain/editorial-readiness/assess";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { getBuyingGuides, getProductById } from "@/repositories";

const PROD = { isDev: false as const };

const FORMER_SIX = [
  "massage-guns-explained",
  "foam-rolling-for-runners",
  "recovery-tools-what-evidence-shows",
  "soft-flasks-vs-bladders-explained",
  "running-jackets-explained",
  "winter-layering-for-runners",
];

function main() {
  const guides = getBuyingGuides(PROD);
  console.log("total", guides.length);
  const notReady = [];
  const former = [];
  for (const g of guides) {
    const editorial = assessBuyingGuideEditorialReadiness(g, PROD);
    const q = assessGuideQuality(g);
    const missing = (g.relatedProductIds ?? []).filter(
      (id) => !getProductById(id, PROD),
    );
    if (!editorial.ready) {
      notReady.push({
        slug: g.slug,
        workState: editorial.workState,
        gaps: editorial.gaps,
        quality: q.status,
        issues: q.issues,
        decision: q.decisionCompleteness,
        missing,
        related: g.relatedProductIds,
      });
    }
    if (FORMER_SIX.includes(g.slug)) {
      former.push({
        slug: g.slug,
        ready: editorial.ready,
        workState: editorial.workState,
        quality: q.status,
        decision: q.decisionCompleteness,
        issues: q.issues,
        missing,
        relatedProductIds: g.relatedProductIds,
        relatedGuideIds: g.relatedGuideIds,
        relatedBestGuideIds: g.relatedBestGuideIds,
        relatedToolSlugs: g.relatedToolSlugs,
      });
    }
  }
  console.log(
    JSON.stringify(
      { ready: guides.length - notReady.length, notReady, former },
      null,
      2,
    ),
  );
}

main();
