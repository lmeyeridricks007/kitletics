import { getReviewPageData } from "@/lib/review/get-review-page-data";
import {
  getBuyingGuidePageData,
  getBestGuidePageData,
} from "@/lib/best/get-best-guide-page-data";

const r = getReviewPageData("nike-vomero-18", { isDev: true });
console.log("review", {
  best: r?.bestGuides.map((g) => g.slug),
  guides: r?.buyingGuides.map((g) => g.slug),
  comps: r?.comparisons.map((c) => c.comparison.slug),
  alts: r?.alternatives.length,
});
const g = getBuyingGuidePageData("how-to-choose-running-shoes", { isDev: true });
console.log("guide", {
  peers: g?.relatedPeerGuides.map((x) => x.slug),
  best: g?.bestGuides.map((x) => x.slug),
  tools: g?.tools.map((t) => t.slug),
  comps: g?.relatedComparisons.length,
});
const b = getBestGuidePageData("running-shoes", { isDev: true });
console.log("best", {
  buying: b?.buyingGuides.map((x) => x.slug),
  finder: b?.finderHref,
  comps: b?.relatedComparisons.length,
});
