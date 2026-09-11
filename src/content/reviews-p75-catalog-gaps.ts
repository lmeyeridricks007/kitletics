/**
 * Fix 75 — Expert Research reviews for Kiprun 900 Race 5L and Proteam 10.
 * Research from published specs — not first-hand testing.
 */
import type { Review, ContentSection, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const author = "author-kitletics-editorial" as const;
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

function vestResearchReview(d: {
  id: string;
  slug: string;
  productId: string;
  title: string;
  subtitle: string;
  bottomLine: string;
  verdict: string;
  summary: string;
  score: number;
  fit: string;
  capacity: string;
  hydration: string;
  raceKit: string;
  value: string;
  extra?: ContentSection[];
  pros: string[];
  cons: string[];
  buy: string[];
  avoid: string[];
  alts: string[];
  scores: ScoreBreakdownItem[];
}): Review {
  const sections: ContentSection[] = [
    { id: "sec-fit", heading: "Fit & bounce", body: d.fit, evidenceIds: [...ev] },
    { id: "sec-capacity", heading: "Capacity & pockets", body: d.capacity, evidenceIds: [...ev] },
    { id: "sec-hydration", heading: "Hydration", body: d.hydration, evidenceIds: [...ev] },
    { id: "sec-race-kit", heading: "Race kit & poles", body: d.raceKit, evidenceIds: [...ev] },
    { id: "sec-value", heading: "Value", body: d.value, evidenceIds: ["ev-catalog-editorial"] },
  ];
  if (d.extra?.length) sections.push(...d.extra);

  return {
    id: d.id,
    slug: d.slug,
    productId: d.productId,
    title: d.title,
    subtitle: d.subtitle,
    reviewType: "expert-research",
    bottomLine: d.bottomLine,
    verdict: d.verdict,
    score: d.score,
    summary: d.summary,
    reviewerId: author,
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    editorialDisclosure:
      "No brand-supplied product or sponsored testing applied to this review. Affiliate availability does not affect scores or verdict.",
    sections,
    pros: d.pros,
    cons: d.cons,
    whoShouldBuy: d.buy,
    whoShouldAvoid: d.avoid,
    scoreBreakdown: d.scores,
    evidenceIds: [...ev],
    alternativeProductIds: d.alts,
    comparisonIds: [],
    faqIds: [],
    seoTitle: `${d.title}: Fit, Capacity & Verdict | Kitletics`,
    seoDescription: `Honest buying guide to ${d.title.replace(/ Review$/, "")} — capacity, flasks, who it’s for, trade-offs and current prices.`,
    ...pub,
  };
}

export const reviewsP75CatalogGaps: Review[] = [
  vestResearchReview({
    id: "review-kiprun-900-race-5",
    slug: "kiprun-900-race-5",
    productId: "prod-kiprun-900-race-5",
    title: "Kiprun 900 Race 5L Review",
    subtitle: "190 g / 5L Decathlon race vest — flasks not included.",
    bottomLine:
      "Buy 900 Race 5L when you want a 190 g 5L flask vest with 10 pockets and a 2XS–XL ladder at Decathlon money; skip it when you need 10L race kit, a bladder, Sensifit bounce, or flasks in the box.",
    verdict:
      "Current Kiprun 5L race aisle. Twin 500 ml sleeves, three chest clips, no bladder. I'd shortlist it versus ADV Skin 5 on price. I'd pause if you need Proteam 10's 10L / quiver or Salomon's harness polish.",
    summary:
      "900 Race 5L is not the older Trail 10 and not Proteam 10. The job is short-to-mid trail and road race kit: 5L, 190 g, 10 pockets, flasks sold separately. I'd shortlist it for first vest buyers who already own 500 ml flasks. I'd pause versus Spry 5 / ADV Skin 5 when bounce on technical trail is the shopping trigger.",
    score: 78,
    fit: "Three chest clips and a 2XS–XL size run are the published fit story — a wider ladder than many 5L race vests that stop at S. 190 g is light for a 5L. Bounce control is not advertised as Sensifit or Osprey BioStretch; treat it as a value race harness. Try on in store if you can — Decathlon retail is the point of this SKU.",
    capacity: "5L and 10 pockets is enough for flasks, gels, a light layer and a phone on most race days. It is not Proteam 10's 14-pocket / 10L stash and not ADV Skin 12. Rear volume fills once a jacket and poles (this vest does not list pole attachment) stack up. Phone storage is listed; a dedicated phone vest like Duro LT is still simpler if water is not the job.",
    hydration: "Two 500 ml flask sleeves, flasks not in the box. No reservoir sleeve. Total drink is whatever 500 ml flasks you already own — HydraPak Speed 500 / Salomon Speed are the usual pair. If you wanted a bladder-first 10L, this is the wrong aisle; Proteam 10 is also flask-first (no bladder) at 10L.",
    raceKit: "Race suitability is trail, road and ultra on paper, but 5L with no poles and no bladder is a race-vest, not an ultra kit bag. Three chest clips keep the front panel closed. No quiver. Mandatory mountain kit that needs a jacket + poles + 10L is Proteam 10 or ADV Skin 12, not this 5L.",
    value: "Street class ~€40 via Kiprun/Decathlon (~€40 NL seed). That is the reason to consider it versus ADV Skin 5 / Spry 5. You still buy flasks. I'd pay it as a first 5L. I'd not pretend it replaces a €110 Proteam 10 or a Sensifit race vest.",
    extra: [
      {
        id: "sec-vs-proteam",
        heading: "5L vs Proteam 10",
        body: "Stay on 900 Race 5L when 5L and €40 is the job and you refuse 10L empty volume. Move to Proteam 10 when you need 14 pockets, 170 g at M, quiver compatibility and 2–3 flask sleeves on a 10L race vest. Trail 10 stays media-gated in this catalog and is not the current Kiprun vest aisle.",
        evidenceIds: [...ev],
      },
    ],
    pros: [
      "190 g 5L race vest at Decathlon pricing",
      "10 pockets, twin 500 ml sleeves, sizes 2XS–XL",
      "Three chest clips on a flask-first race layout",
    ],
    cons: [
      "Flasks not included; no bladder, no pole quiver",
      "Harness polish lags ADV Skin / Osprey Duro",
      "5L fills once jacket + food stack on ultras",
    ],
    buy: [
      "You want a 5L flask vest for trail or road races and Decathlon's ~€40 price plus 2XS–XL sizing is why you are not paying Salomon ADV Skin 5 money.",
      "You already own 500 ml flasks and only need sleeves, 10 pockets and three chest clips — not a 10L ultra bag.",
      "You compared Spry 5 and Duro LT and would rather buy a Kiprun 5L you can try in a Decathlon store.",
    ],
    avoid: [
      "You need 10L, a quiver, or 14 pockets — that is Proteam 10, not this 5L.",
      "You want Sensifit bounce or a bladder sleeve — ADV Skin 5 / ADV Skin 12 / Circuit.",
      "You only need a phone and gels — the Kiprun Running Belt is the cheaper waist job.",
    ],
    alts: ["prod-salomon-adv-skin-5", "prod-ultraspire-spry-5", "prod-kiprun-proteam-10"],
    scores: [
      { key: "value", label: "Value for Money", score: 94 },
      { key: "weight", label: "Weight", score: 88 },
      { key: "capacity", label: "Capacity", score: 72 },
      { key: "hydration", label: "Flask workflow", score: 78 },
      { key: "fit", label: "Harness polish", score: 68 },
    ],
  }),
  vestResearchReview({
    id: "review-kiprun-proteam-10",
    slug: "kiprun-proteam-10",
    productId: "prod-kiprun-proteam-10",
    title: "Kiprun Proteam 10 Review",
    subtitle: "Current 10L Kiprun race vest — 170 g (M), no bladder.",
    bottomLine:
      "Buy Proteam 10 when you want the current Kiprun 10L flask race vest (170 g in M, 14 pockets, quiver compatible, 2–3×500 ml sleeves) instead of a gated Trail 10; skip it when 5L is enough, when you need a bladder, or when Sensifit / BioStretch is the fit you will pay for.",
    verdict:
      "Kiprun's 2026 10L race vest — Blandine L’Hirondelle's UTMB-class layout at €110. Flasks not included, no reservoir. I'd shortlist it versus Circuit / Spry 5 / Alpha 6 on capacity-per-euro. I'd pause versus ADV Skin 12 when a bladder and Sensifit are non-negotiable.",
    summary:
      "Proteam 10 replaces the old Trail 10 job in the live catalog. 10L, 170 g at M, 14 pockets, six sizes, quiver compatible, flask-first. I'd shortlist it for race-kit trail days at Decathlon. I'd pause if you wanted the cheaper 900 Race 5L or a bladder ultra pack.",
    score: 82,
    fit: "Six sizes and 170 g listed at M — lighter than many 10L vests that sit nearer 250–300 g. Fit is a race harness with cord-lock chest, not Salomon Sensifit dials. Quiver compatibility is the pole story. Try the size chart; value vests punish a wrong torso more than a €180 ADV Skin.",
    capacity: "10L and 14 pockets is the reason this is not 900 Race 5L. Rear stash covers a jacket and race-kit food. It is still a race vest, not a 15L Duro. Phone storage is expected in this pocket count. If 10L will sit empty, 900 Race 5L is the lighter spend.",
    hydration: "2–3×500 ml flask sleeves, flasks not included, bladder explicitly not supported. That is a different drink system from Trail 10's authored bladder-compatible 10L (which remains media-gated and is not this SKU). Plan three 500 ml flasks or two plus a spare. Circuit / ADV Skin 12 if you refuse flask-only.",
    raceKit: "Quiver compatible with 10L race-kit volume is the mountain-day argument. 14 pockets beat 900 Race's 10. Not a fastpack. UTMB-week marketing (Blandine L’Hirondelle 2026) is positioning, not a fit guarantee — size the vest, do not buy the athlete.",
    value: "Decathlon IE €110 seed. Above 900 Race 5L, below ADV Skin 12 / Circuit street. I'd pay it when 10L flask + quiver is the weekly vest. I'd not pay it as a first 5L — that is 900 Race.",
    extra: [
      {
        id: "sec-vs-trail-10",
        heading: "Proteam 10 vs Trail 10",
        body: "Trail 10 remains in the catalog as a draft because Kitletics has no licensed hero for that older naming. Proteam 10 is the current 10L flask vest with authentic Decathlon photography. Do not treat Trail 10 as the live buy; do not assume bladder compatibility carried over — Proteam 10 is flask-only.",
        evidenceIds: [...ev],
      },
    ],
    pros: [
      "170 g (M) 10L flask vest with 14 pockets",
      "Quiver compatible; six sizes; current Kiprun 10L aisle",
      "€110-class Decathlon value versus Circuit / ADV Skin 12",
    ],
    cons: [
      "Flasks not included; no bladder sleeve",
      "Harness is not Sensifit / BioStretch",
      "Overkill if 5L 900 Race already covers the week",
    ],
    buy: [
      "You need a current 10L Kiprun race vest with flask sleeves, 14 pockets and a quiver, and Decathlon's €110 is why you are not buying Circuit or ADV Skin 12.",
      "You outgrew 900 Race 5L because jacket + poles + race kit no longer fit 5L, and you accept flask-only (no bladder).",
      "You compared Spry 5 and Alpha 6 and want 10L at Decathlon retail rather than a 5–6L specialty vest.",
    ],
    avoid: [
      "5L flask racing is enough — 900 Race 5L is lighter and much cheaper.",
      "You require a reservoir sleeve — ADV Skin 12, Circuit or a bladder vest, not Proteam 10.",
      "You will pay for Sensifit bounce and will not try a Kiprun harness — ADV Skin 5 / 12.",
    ],
    alts: ["prod-ultraspire-spry-5", "prod-camelbak-circuit", "prod-kiprun-900-race-5"],
    scores: [
      { key: "value", label: "Value for Money", score: 88 },
      { key: "capacity", label: "Capacity", score: 86 },
      { key: "weight", label: "Weight", score: 90 },
      { key: "hydration", label: "Flask workflow", score: 80 },
      { key: "fit", label: "Harness polish", score: 70 },
    ],
  }),
];
