import type { Review } from "@/domain/editorial/types";
import { publishedMeta, scheduledMeta } from "@/content/config";
import { reviewsWave1 } from "@/content/reviews-wave1";
import { reviewsBackfill } from "@/content/reviews-backfill";
import { reviewsWatchesWave2 } from "@/content/reviews-watches-wave2";
import { reviewsP75CatalogGaps } from "@/content/reviews-p75-catalog-gaps";
import { reviewsUniqueRewrite } from "@/content/reviews-unique-rewrite";
import { reviewsP53Differentiation } from "@/content/reviews-p53-differentiation";
import { reviewsP54HeldFinalized } from "@/content/reviews-p54-held-finalized";
import { reviewsP62FinalRunning } from "@/content/reviews-p62-final-running";
import { peregrine15Review } from "@/content/running/reviews/peregrine-15";
import { hrmFlagshipReviews } from "@/content/running/reviews/hrm-flagship";
import { gpsWatchFlagshipReviews } from "@/content/running/reviews/gps-watch-flagship";
import { gearCoreLaunchReviews } from "@/content/running/gear-core-launch-ready";
import { weakCatLaunchReviews } from "@/content/running/weak-cats-launch-ready";
import { nmwCompletionReviews } from "@/content/running/nmw-completion-launch-ready";

const pub = publishedMeta();

/** Fix 62 genuine Running overlays win over P53 uniqueness tokens and unique rewrites. */
const P62_SLUGS = new Set(reviewsP62FinalRunning.map((r) => r.slug));
const P62_PRODUCT_IDS = new Set(reviewsP62FinalRunning.map((r) => r.productId));

/** Fix 54 held-estate overlays win over unique rewrites and P53 (no slug overlap). */
const P54_SLUGS = new Set(
  reviewsP54HeldFinalized
    .filter((r) => !P62_SLUGS.has(r.slug))
    .map((r) => r.slug),
);
const P54_PRODUCT_IDS = new Set(
  reviewsP54HeldFinalized
    .filter(
      (r) => !P62_SLUGS.has(r.slug) && !P62_PRODUCT_IDS.has(r.productId),
    )
    .map((r) => r.productId),
);

/** Fix 53 INDEXABLE differentiation overlays win over unique rewrites. */
const P53_SLUGS = new Set(
  reviewsP53Differentiation
    .filter(
      (r) =>
        !P54_SLUGS.has(r.slug) &&
        !P62_SLUGS.has(r.slug) &&
        !P62_PRODUCT_IDS.has(r.productId),
    )
    .map((r) => r.slug),
);
const P53_PRODUCT_IDS = new Set(
  reviewsP53Differentiation
    .filter(
      (r) =>
        !P54_SLUGS.has(r.slug) &&
        !P54_PRODUCT_IDS.has(r.productId) &&
        !P62_SLUGS.has(r.slug) &&
        !P62_PRODUCT_IDS.has(r.productId),
    )
    .map((r) => r.productId),
);

/** Fix 37 unique rewrites win over backfill / wave2 by slug + productId. */
const UNIQUE_REWRITE_SLUGS = new Set(
  reviewsUniqueRewrite
    .filter(
      (r) =>
        !P53_SLUGS.has(r.slug) &&
        !P54_SLUGS.has(r.slug) &&
        !P62_SLUGS.has(r.slug),
    )
    .map((r) => r.slug),
);
const UNIQUE_REWRITE_PRODUCT_IDS = new Set(
  reviewsUniqueRewrite
    .filter(
      (r) =>
        !P53_SLUGS.has(r.slug) &&
        !P54_SLUGS.has(r.slug) &&
        !P62_SLUGS.has(r.slug) &&
        !P53_PRODUCT_IDS.has(r.productId) &&
        !P54_PRODUCT_IDS.has(r.productId) &&
        !P62_PRODUCT_IDS.has(r.productId),
    )
    .map((r) => r.productId),
);

const BACKFILL_OVERRIDES = new Set([
  peregrine15Review.slug,
  ...hrmFlagshipReviews.map((r) => r.slug),
  ...gpsWatchFlagshipReviews.map((r) => r.slug),
  ...gearCoreLaunchReviews.map((r) => r.slug),
  ...weakCatLaunchReviews.map((r) => r.slug),
  ...nmwCompletionReviews.map((r) => r.slug),
  ...UNIQUE_REWRITE_SLUGS,
  ...P53_SLUGS,
  ...P54_SLUGS,
  ...P62_SLUGS,
]);
const WATCH_WAVE2_PRODUCT_IDS = new Set(
  reviewsWatchesWave2
    .filter((r) => !BACKFILL_OVERRIDES.has(r.slug))
    .map((r) => r.productId),
);
const GEAR_CORE_PRODUCT_IDS = new Set(
  gearCoreLaunchReviews.map((r) => r.productId),
);
const WEAK_CAT_PRODUCT_IDS = new Set(
  weakCatLaunchReviews.map((r) => r.productId),
);
const NMW_COMPLETION_PRODUCT_IDS = new Set(
  nmwCompletionReviews.map((r) => r.productId),
);

const reviewsRaw: Review[] = [
  ...reviewsP75CatalogGaps,
  ...reviewsP54HeldFinalized.filter((r) => !P62_SLUGS.has(r.slug)),
  ...reviewsP62FinalRunning,
  ...reviewsP53Differentiation.filter(
    (r) => !P54_SLUGS.has(r.slug) && !P62_SLUGS.has(r.slug),
  ),
  ...reviewsUniqueRewrite.filter(
    (r) =>
      !P53_SLUGS.has(r.slug) &&
      !P54_SLUGS.has(r.slug) &&
      !P62_SLUGS.has(r.slug),
  ),
  ...(UNIQUE_REWRITE_SLUGS.has(peregrine15Review.slug)
    ? []
    : [peregrine15Review]),
  ...hrmFlagshipReviews.filter(
    (r) =>
      !UNIQUE_REWRITE_SLUGS.has(r.slug) &&
      !P53_SLUGS.has(r.slug) &&
      !P54_SLUGS.has(r.slug),
  ),
  ...gpsWatchFlagshipReviews.filter(
    (r) =>
      !UNIQUE_REWRITE_SLUGS.has(r.slug) &&
      !P53_SLUGS.has(r.slug) &&
      !P54_SLUGS.has(r.slug),
  ),
  {
    id: "review-novablast-6",
    slug: "asics-novablast-6",
    productId: "prod-novablast-6",
    title: "ASICS Novablast 6 Review",
    subtitle:
      "A bouncier, more energetic daily trainer that feels fast without trying too hard.",
    reviewType: "expert-research",
    bottomLine:
      "High-cushion neutral daily trainer with FF BLAST MAX and a FF TURBO SQUARED forefoot trampoline pod. I'd shortlist it when you want soft energetic daily ride. I'd pause if not a stability shoe shows up often in your week.",
    verdict:
      "Buy the ASICS Novablast 6 when its main job matches most of your week — not as a default for every session. It earns a look for soft energetic daily ride or improved wet grip vs prior Novablast. Look elsewhere if not a stability shoe.",
    score: 90,
    summary:
      "High-cushion neutral daily trainer with FF BLAST MAX and a FF TURBO SQUARED forefoot trampoline pod. I'd shortlist it when you want soft energetic daily ride. I'd pause if not a stability shoe shows up often in your week.",
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    editorialDisclosure:
      "No brand-supplied product or sponsored testing applied to this review. Affiliate availability does not affect scores or verdict.",
    sections: [
      {
        id: "sec-ride",
        heading: "Ride & Feel",
        body: "Independent coverage and manufacturer materials describe a soft, rockered ride aimed at easy and long road miles. FF BLAST MAX remains the primary midsole story; the FF TURBO SQUARED forefoot pod is positioned to add trampoline-like response without a full carbon race plate. Expect energetic daily miles rather than supershoe snap — runners who prefer firm ground feel may find the stack tall.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-upper",
        heading: "Upper & Fit",
        body: "The engineered woven upper is documented as a breathability and lockdown update versus prior generations. Width options include standard and wide in the catalog — a practical edge versus some soft max-cushion competitors. True-to-size feedback is the category norm for this line; always confirm fit in person when possible.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-outsole",
        heading: "Outsole",
        body: "ASICSGRIP in the forefoot with AHAR LO in the heel is the primary verified traction change from Novablast 5. That targets wet-road confidence for daily asphalt and treadmill use — not aggressive trail lugs. Technical mud and rocky paths sit outside the design brief.",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        id: "sec-durability",
        heading: "Durability",
        body: "Kitletics has not logged personal wear mileage on this model. Category norms for high-cushion daily trainers suggest monitoring foam compression and outsole wear after high weekly volume. Treat durability scores here as research-informed estimates, not measured wear results.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-value",
        heading: "Value",
        body: "At typical European street pricing for a premium daily trainer, value is strongest for runners who will use the soft energetic ride across easy and long days. Previous-generation Novablast 5 or a firmer daily like Ghost 18 may undercut it when discounted — choose 6 when you want the current platform and grip updates.",
        evidenceIds: ["ev-catalog-editorial", "ev-novablast-6-mfr"],
      },
    ],
    pros: [
      "Soft energetic daily ride with rocker geometry",
      "Light for the stack (~253 g men’s reference)",
      "Improved wet-road grip story versus Novablast 5",
      "Wide width option in catalog",
      "Strong daily / long-run recommendation fit",
    ],
    cons: [
      "Not a stability shoe",
      "Less ideal as a pure race-day racer",
      "Tall stack may not suit ground-feel seekers",
      "No Kitletics personal wear-test yet",
    ],
    whoShouldBuy: [
      "You want soft energetic daily ride and will rotate or compare against Ghost 18 — that is the Novablast 6's main job",
      "Most of your sessions match improved wet grip vs prior Novablast more than a do-everything compromise",
      "You're shopping a road (or treadmill) tool and can keep trail or race-day jobs in other shoes when needed",
    ],
    whoShouldAvoid: [
      "You need not a stability shoe — look at Ghost 18 or a clearer specialist instead of forcing the Novablast 6",
      "Your must-haves conflict with a Novablast 6 trade-off: less ideal as a pure race-day racer",
      "You need technical trail grip or a dedicated race plate as the primary job — this platform is aimed elsewhere",
    ],
    scoreBreakdown: [
      { key: "cushioning", label: "Cushioning", score: 93, note: "High stack FF BLAST MAX" },
      { key: "ride", label: "Ride & Energy", score: 91 },
      { key: "comfort", label: "Fit & Comfort", score: 90 },
      { key: "stability", label: "Stability", score: 78, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 82, note: "Research estimate — not wear-logged" },
      { key: "value", label: "Value for Money", score: 84 },
      { key: "fit", label: "Fit", score: 88 },
      { key: "responsiveness", label: "Responsiveness", score: 88 },
      { key: "grip", label: "Grip", score: 86, note: "ASICSGRIP forefoot" },
      { key: "versatility", label: "Versatility", score: 90 },
    ],
    evidenceIds: [
      "ev-novablast-6-mfr",
      "ev-catalog-editorial",
      "ev-catalog-mfr",
    ],
    alternativeProductIds: [
      "prod-ghost-18",
      "prod-clifton-10",
      "prod-ride-18",
    ],
    comparisonIds: ["cmp-nb6-nb5", "cmp-nb6-ghost18", "cmp-nb6-clifton10"],
    faqIds: [],
    seoTitle: "ASICS Novablast 6 Review: Performance, Fit & Verdict | Kitletics",
    seoDescription:
      "Expert research review of the ASICS Novablast 6 — ride, fit, outsole, use-case fit, pros/cons, comparisons and current prices.",
    ...pub,
  },
  {
    id: "review-novablast-5",
    slug: "asics-novablast-5",
    productId: "prod-novablast-5",
    title: "ASICS Novablast 5 Review",
    subtitle: "A soft, energetic daily trainer for high-mileage road running",
    reviewType: "expert-research",
    verdict:
      "A versatile, cushioned daily trainer suited to high-volume road training and long runs, but not the best choice for runners wanting an aggressive race-day shoe or technical trail grip. It earns a look for soft energetic ride or good for high easy mileage. Look elsewhere if not a stability shoe.",
    score: 88,
    summary:
      "Bouncy neutral daily trainer suited to easy miles and long runs. I'd shortlist it when you want soft energetic ride. I'd pause if not a stability shoe shows up often in your week.",
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    editorialDisclosure:
      "No brand supplied product or sponsored testing applied to this review.",
    sections: [
      {
        id: "sec-fit",
        heading: "Fit",
        body: "Sizing feedback across reviewed sources is generally true-to-size in standard width, with a medium toe box and secure midfoot for most neutral runners. Wide-foot runners should trial fit or look to brands with broader lasts — ASICS width options for this model remain limited compared with Ghost.",
        evidenceIds: ["ev-nb5-user", "ev-nb5-editorial"],
      },
      {
        id: "sec-ride",
        heading: "Ride",
        body: "Independent reviews consistently describe a soft, rockered and energetic ride on easy paces. The high-stack FF Blast+ foam and rocker geometry favour smooth transitions on daily and long runs. The platform is less precise for sharp track intervals than dedicated tempo shoes.",
        evidenceIds: ["ev-nb5-independent", "ev-nb5-mfr"],
      },
      {
        id: "sec-midsole",
        heading: "Midsole",
        body: "FF Blast+ Max (manufacturer naming) is positioned as a light, energetic foam under a tall stack. In practice that means more bounce and protection on easy miles than a firm trainer, without the aggressive plate snap of race-day supershoes. Runners who prefer ground feel may find the stack tall.",
        evidenceIds: ["ev-nb5-mfr", "ev-nb5-independent"],
      },
      {
        id: "sec-upper",
        heading: "Upper",
        body: "The engineered knit upper is designed for breathable lockdown on road use. Reviewed sources generally find it comfortable for daily mileage; it is not a heavy trail or winter shell. Fit notes centre on standard volume rather than an oversized toe box.",
        evidenceIds: ["ev-nb5-mfr", "ev-nb5-editorial"],
      },
      {
        id: "sec-outsole",
        heading: "Outsole",
        body: "ASICS’ AHAR-style rubber coverage targets road durability rather than aggressive trail lug. Grip is appropriate for asphalt and light wet roads; technical trail or muddy paths are outside the design brief.",
        evidenceIds: ["ev-nb5-mfr"],
      },
      {
        id: "sec-durability",
        heading: "Durability",
        body: "Long-term durability evidence remains limited in this assessment. Category norms for high-cushion daily trainers suggest foam and outsole wear should be monitored after high weekly volume, but Kitletics has not logged personal wear observations for this model.",
        evidenceIds: ["ev-nb5-editorial"],
      },
      {
        id: "sec-value",
        heading: "Value",
        body: "At typical European street pricing for a premium daily trainer, value depends on whether you need the energetic soft ride. It is not automatically the cheapest option — Ghost and prior Novablast generations may undercut it — but the performance-to-price balance is strong for high-mileage road runners who match the use case.",
        evidenceIds: ["ev-nb5-editorial", "ev-nb5-independent"],
      },
    ],
    pros: [
      "Comfortable over longer distances",
      "Versatile enough for multiple easy/long run types",
      "Lively cushioning without a race plate",
      "Strong daily-mileage companion",
    ],
    cons: [
      "Not as fast as dedicated performance or race shoes",
      "May feel tall for runners preferring ground feel",
      "Limited width options versus some competitors",
      "Not a stability shoe",
    ],
    whoShouldBuy: [
      "You want soft energetic ride and will rotate or compare against Ghost 16 — that is the Novablast 5's main job",
      "Most of your sessions match good for high easy mileage more than a do-everything compromise",
      "You're shopping a road (or treadmill) tool and can keep trail or race-day jobs in other shoes when needed",
    ],
    whoShouldAvoid: [
      "You need not a stability shoe — look at Ghost 16 or a clearer specialist instead of forcing the Novablast 5",
      "Your must-haves conflict with a Novablast 5 trade-off: less ideal for fast intervals",
      "You need technical trail grip or a dedicated race plate as the primary job — this platform is aimed elsewhere",
    ],
    scoreBreakdown: [
      { key: "comfort", label: "Comfort", score: 92 },
      { key: "ride", label: "Ride", score: 90 },
      { key: "cushioning", label: "Cushioning", score: 92 },
      { key: "stability", label: "Stability", score: 78, note: "Neutral platform" },
      { key: "responsiveness", label: "Responsiveness", score: 86 },
      { key: "fit", label: "Fit", score: 82 },
      { key: "grip", label: "Grip", score: 80 },
      { key: "durability", label: "Durability", score: 80 },
      { key: "versatility", label: "Versatility", score: 84 },
      { key: "value", label: "Value", score: 82 },
    ],
    evidenceIds: [
      "ev-nb5-mfr",
      "ev-nb5-editorial",
      "ev-nb5-independent",
      "ev-nb5-user",
    ],
    alternativeProductIds: ["prod-ghost-16", "prod-clifton-9", "prod-nimbus-27"],
    comparisonIds: ["cmp-nb5-nimbus", "cmp-nb5-ghost"],
    faqIds: ["faq-nb5-1", "faq-nb5-2", "faq-nb5-3", "faq-nb5-4"],
    seoTitle: "ASICS Novablast 5 Review: Performance, Fit & Verdict | Kitletics",
    seoDescription:
      "Expert research review of the ASICS Novablast 5 — fit, ride, use-case performance, pros/cons, alternatives and current prices.",
    ...pub,
  },
  {
    id: "review-boston-12",
    slug: "adidas-adizero-boston-12",
    productId: "prod-boston-12",
    title: "adidas Adizero Boston 12 Review",
    subtitle: "A tempo-capable trainer with Running and HYROX overlap",
    reviewType: "expert-research",
    verdict:
      "Buy the Adidas Adizero Boston 12 when its main job matches most of your week — not as a default for every session. It earns a look for dual Running + HYROX relevance or responsive tempo ride. Look elsewhere if not a max-cushion easy shoe.",
    score: 89,
    summary:
      "Tempo trainer used for road workouts and often for HYROX training. I'd shortlist it when you want dual Running + HYROX relevance. I'd pause if not a max-cushion easy shoe shows up often in your week.",
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    sections: [
      {
        id: "sec-use",
        heading: "Performance",
        body: "Excels as a tempo/workout shoe and hybrid HYROX trainer. Soft max-cushion shoes remain better for recovery jogs. Trail suitability is poor by design.",
        evidenceIds: ["ev-boston-editorial", "ev-boston-mfr"],
      },
      {
        id: "sec-value",
        heading: "Value",
        body: "Value is strongest for athletes who will use the responsive platform for workouts and mixed training rather than as a pure easy-day shoe.",
        evidenceIds: ["ev-boston-editorial"],
      },
    ],
    pros: ["Dual Running + HYROX relevance", "Responsive tempo platform"],
    cons: ["Poor trail suitability", "Not the softest easy-day shoe"],
    whoShouldBuy: [
      "You want dual Running + HYROX relevance and will rotate or compare against Endorphin Speed 4 — that is the Adizero Boston 12's main job",
      "Most of your sessions match responsive tempo ride more than a do-everything compromise",
      "You're shopping a road (or treadmill) tool and can keep trail or race-day jobs in other shoes when needed",
    ],
    whoShouldAvoid: [
      "You need not a max-cushion easy shoe — look at Endorphin Speed 4 or a clearer specialist instead of forcing the Adizero Boston 12",
      "You want one shoe for every session and pace — the Adizero Boston 12 is a defined role; Endorphin Speed 4 or a second shoe may cover the gaps better",
      "You need technical trail grip or a dedicated race plate as the primary job — this platform is aimed elsewhere",
    ],
    scoreBreakdown: [
      { key: "responsiveness", label: "Responsiveness", score: 92 },
      { key: "versatility", label: "Versatility", score: 88 },
      { key: "comfort", label: "Comfort", score: 84 },
      { key: "value", label: "Value", score: 86 },
      { key: "durability", label: "Durability", score: 85 },
      { key: "grip", label: "Grip", score: 72, note: "Road-focused" },
    ],
    evidenceIds: ["ev-boston-editorial", "ev-boston-mfr"],
    alternativeProductIds: ["prod-endorphin-speed-4", "prod-pegasus-41"],
    comparisonIds: [],
    faqIds: [],
    ...pub,
  },
  {
    id: "review-novablast-5-scheduled",
    slug: "asics-novablast-5-deep-dive",
    productId: "prod-novablast-5",
    title: "ASICS Novablast 5 Deep Dive",
    reviewType: "expert-research",
    verdict: "Scheduled deep-dive — visible in development only.",
    score: 90,
    summary:
      "Future scheduled review used to validate publishing resolver (Scenario E).",
    reviewerId: "author-kitletics-editorial",
    sections: [],
    pros: [],
    cons: [],
    whoShouldBuy: ["You want soft energetic ride and will rotate or compare against Ghost 16 — that is the Novablast 5's main job","Most of your sessions match good for high easy mileage more than a do-everything compromise","You're shopping a road (or treadmill) tool and can keep trail or race-day jobs in other shoes when needed"],
    whoShouldAvoid: ["You need not a stability shoe — look at Ghost 16 or a clearer specialist instead of forcing the Novablast 5","Your must-haves conflict with a Novablast 5 trade-off: less ideal for fast intervals","You need technical trail grip or a dedicated race plate as the primary job — this platform is aimed elsewhere"],
    scoreBreakdown: [],
    evidenceIds: ["ev-nb5-editorial"],
    alternativeProductIds: [],
    comparisonIds: [],
    faqIds: [],
    ...scheduledMeta(),
  },
  ...reviewsWave1.filter((r) => !UNIQUE_REWRITE_SLUGS.has(r.slug)),
  ...gearCoreLaunchReviews.filter((r) => !UNIQUE_REWRITE_SLUGS.has(r.slug)),
  ...weakCatLaunchReviews.filter((r) => !UNIQUE_REWRITE_SLUGS.has(r.slug)),
  ...nmwCompletionReviews.filter((r) => !UNIQUE_REWRITE_SLUGS.has(r.slug)),
  ...reviewsWatchesWave2.filter((r) => !BACKFILL_OVERRIDES.has(r.slug)),
  ...reviewsBackfill.filter(
    (r) =>
      !BACKFILL_OVERRIDES.has(r.slug) &&
      !UNIQUE_REWRITE_PRODUCT_IDS.has(r.productId) &&
      !WATCH_WAVE2_PRODUCT_IDS.has(r.productId) &&
      !GEAR_CORE_PRODUCT_IDS.has(r.productId) &&
      !WEAK_CAT_PRODUCT_IDS.has(r.productId) &&
      !NMW_COMPLETION_PRODUCT_IDS.has(r.productId),
  ),
];

/** Prefer first occurrence (unique rewrites are listed first). */
function dedupeReviewsBySlug(items: Review[]): Review[] {
  const seen = new Set<string>();
  const out: Review[] = [];
  for (const review of items) {
    if (seen.has(review.slug)) continue;
    seen.add(review.slug);
    out.push(review);
  }
  return out;
}

export const reviews: Review[] = dedupeReviewsBySlug(reviewsRaw);
