import type { ContentSection, Review, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
} from "@/domain/review-agent/category-config";
import { PADEL_SHOE_BLUEPRINT } from "@/lib/review/padel-review-outline";
import { sanitizePadelReview } from "@/lib/review/padel-review-copy";

const pub = publishedMeta();

type ShoeDraft = {
  reviewId: string;
  slug: string;
  productId: string;
  title: string;
  name: string;
  fullName: string;
  subtitle: string;
  whatItIs: string;
  verdict: string;
  score: number;
  traction: string;
  stability: string;
  courtFeel: string;
  cushioning: string;
  support: string;
  fit: string;
  durability: string;
  comfort: string;
  value: string;
  specs: string[];
  pros: string[];
  cons: string[];
  buy: string[];
  skip: string[];
  alts: string[];
  scores: ScoreBreakdownItem[];
  evidenceIds: string[];
};

function shoeReview(d: ShoeDraft): Review {
  const evidenceIds = d.evidenceIds;
  const bodies: Record<string, string> = {
    "sec-overview": [
      d.whatItIs,
      d.verdict,
      `This is a padel court shoe, not a daily trainer. I'd judge it on traction, lateral hold and whether the last survives split-step and recovery steps on sand-filled turf.`,
      `Bottom line: ${d.verdict}`,
    ].join("\n\n"),
    "sec-verified-specs": [
      `Published court-shoe markers for the ${d.fullName}:`,
      d.specs.map((s) => `• ${s}`).join("\n"),
      `These are not running-shoe drop and heel-stack numbers. If a listing only says court rubber, treat that as a category tag, not a traction map.`,
    ].join("\n\n"),
    "sec-traction": d.traction,
    "sec-stability": d.stability,
    "sec-court-feel": d.courtFeel,
    "sec-cushioning": d.cushioning,
    "sec-support": d.support,
    "sec-fit": d.fit,
    "sec-durability": d.durability,
    "sec-comfort": d.comfort,
    "sec-strengths": [
      d.pros.map((p) => `• ${p}`).join("\n"),
      `I'd buy it when those jobs match most of your padel week — not when you also wanted a road daily.`,
    ].join("\n\n"),
    "sec-tradeoffs": [
      d.skip.join("\n\n"),
      d.cons.map((c) => `• ${c}`).join("\n"),
      `Skip it if you needed a running shoe, or a clay-only tennis last without padel evidence.`,
    ].join("\n\n"),
    "sec-usecase": [
      d.buy.join("\n\n"),
      `Best on sand-filled padel turf and indoor court sessions.`,
    ].join("\n\n"),
    "sec-value": d.value,
    "sec-methodology": [
      EXPERT_RESEARCH_METHODOLOGY,
      `We do not score padel shoes with running-shoe criteria alone.`,
    ].join("\n\n"),
    "sec-sources":
      `Manufacturer and specialist court listings on the product evidence list. No invented user ratings or popularity ranks.`,
  };

  const sections: ContentSection[] = PADEL_SHOE_BLUEPRINT.map((slot) => ({
    id: slot.id,
    heading: slot.heading,
    body: bodies[slot.id] ?? d.whatItIs,
    evidenceIds,
  }));

  return sanitizePadelReview({
    id: d.reviewId,
    slug: d.slug,
    productId: d.productId,
    title: d.title,
    subtitle: d.subtitle,
    reviewType: "expert-research",
    bottomLine: `${d.verdict} ${d.buy[0] ?? ""} ${d.skip[0] ?? ""}`.trim(),
    verdict: d.verdict,
    score: d.score,
    summary: d.whatItIs,
    reviewerId: "author-kitletics-editorial",
    testingContext: EXPERT_RESEARCH_METHODOLOGY,
    editorialDisclosure: EDITORIAL_DISCLOSURE,
    sections,
    pros: d.pros,
    cons: d.cons,
    whoShouldBuy: d.buy.map((line) => {
      if (/^(you want|you need|i(?:'d| would) (?:shortlist|pause|rotate))/i.test(line)) {
        return line;
      }
      return `I'd shortlist it when ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
    }),
    whoShouldAvoid: d.skip.map((line) => {
      if (/^(you need|you want|i(?:'d| would) (?:skip|pause|rotate))/i.test(line)) {
        return line;
      }
      return `I'd skip it if ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
    }),
    scoreBreakdown: d.scores,
    evidenceIds,
    alternativeProductIds: d.alts,
    comparisonIds: [],
    relatedBuyingGuideIds: [
      "guide-choose-padel-shoes",
      "guide-padel-vs-tennis-shoes",
      "guide-padel-shoe-outsoles",
    ],
    faqIds: [],
    seoTitle: `${d.fullName} Review: Court Traction, Fit & Verdict | Kitletics`,
    seoDescription: `Expert-research padel shoe review of the ${d.fullName} — traction, lateral stability, court feel and who should skip it. Not a running-shoe essay.`,
    ...pub,
  });
}

const ev = (id: string) => [
  `ev-${id}-editorial`,
  "ev-catalog-mfr",
  "ev-catalog-editorial",
];

export const padelFlagshipShoeReviews: Review[] = [
  shoeReview({
    reviewId: "review-asics-gel-resolution-padel",
    slug: "asics-gel-resolution-padel",
    productId: "prod-asics-gel-resolution-padel",
    title: "ASICS Gel-Resolution Padel Review",
    name: "Gel-Resolution Padel",
    fullName: "ASICS Gel-Resolution Padel",
    subtitle: "The Resolution last sold as a padel model for lateral load on sand-filled courts.",
    whatItIs:
      "Gel-Resolution Padel is ASICS’ court Stability last sold as a padel model: AHARPLUS-class outsole, GEL cushioning and a high lateral brief. I'd shortlist it when you already like Resolution lockdown and you play often enough to care about overlay durability.",
    verdict:
      "I'd buy Gel-Resolution Padel if you want a planted, overlay-heavy court shoe for padel turf and you already know the Resolution last. I'd skip it if you wanted a light match-day racer or a cheaper club shoe like Kuikma PS 990 or Joma T.Slam.",
    score: 88,
    specs: [
      "Outsole: AHAR court / herringbone family",
      "Cushioning: GEL midfoot/heel",
      "Support: high lateral",
      "Surface: padel-specific listing",
    ],
    traction:
      "Traction is the AHAR / herringbone court story, not a road foam outsole. On sand-filled padel turf you want a pattern that still plants on a lateral cut and a recovery step. I'd replace the pair when the first-step and medial pods polish — not when the overlay still looks new. Kitletics has not logged personal court hours; this is the listed outsole family, not a session count.",
    stability:
      "Lateral stability is why Resolution exists. The padel model keeps a high-support last: a wide enough base and a locked midfoot for side-to-side, not a running 'neutral vs Kayano' debate. If you needed a lighter, more connected shoe, Jet Premura or Sprint Pro 4.0 Padel is the clearer compare — not a daily trainer.",
    courtFeel:
      "Listed court feel is plush versus a connected racer. You still want to feel the turf well enough to plant. This is not marathon stack language. If the shoe feels like a max-cushion road trainer, you bought the wrong category.",
    cushioning:
      "GEL is the listed cushioning for landings and long sessions on turf, not 20 km easy runs. Too little and your knees pay after a third match; Resolution sits on the protective side of the padel range. This page is not a first-hand wear test.",
    support:
      "Support is high lateral with synthetic overlays. That helps when you roll over the forefoot on a lunge. Ankle-height marketing is not the same as this last — look at midfoot lockdown and a heel that does not roll when you plant and cut.",
    fit:
      "Fit the Resolution last for court work: try a split-step and a lateral cut, not an easy jog around the shop. Heel slip shows up on the first change of direction. A women's Resolution Padel exists if you need that volume — do not assume the men's pair will shrink.",
    durability:
      "Durability is overlay plus AHAR pods. Club players who live on abrasive indoor turf chew the medial patch first. Treat that as a research-informed ownership note, not a claimed hour count. Rotate when grip polishes.",
    comfort:
      "Comfort is lockdown without hot spots after a match. Overlays help durability and can feel less 'sock-like' than a light mesh racer. If you wanted plush Boost, Crazyquick is the Adidas compare — different foam family, same court job.",
    value:
      "You pay flagship court money for a last that has a real padel model and overlay durability. Joma T.Slam and Kuikma PS 990 undercut it when Resolution pricing is the only reason you paused. Check live offers — do not treat a homepage URL as a product listing.",
    pros: [
      "High lateral last for padel cuts",
      "AHAR-class court outsole",
      "Familiar Resolution lockdown",
    ],
    cons: [
      "Heavier than race-light court shoes",
      "Premium vs club-value padel shoes",
    ],
    buy: [
      "You want Resolution lockdown on padel turf, not a running Stability shoe with a court sticker.",
      "You need overlay durability and a planted first step more than a featherweight match-day racer.",
      "I'd shortlist it when you will keep a lighter option for the weeks you want more court feel, rather than forcing Resolution to be Jet Premura.",
    ],
    skip: [
      "You wanted a cheap club shoe first — Kuikma PS 990 or Joma T.Slam is the clearer value lane.",
      "You wanted a light, connected padel racer — Babolat Jet Premura or HEAD Sprint Pro 4.0 Padel is the closer job.",
      "You needed a running daily. This last is for court work.",
    ],
    alts: ["prod-joma-t-slam", "prod-babolat-jet-premura", "prod-adidas-crazyquick-boost-m"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 92, note: "Resolution last" },
      { key: "grip", label: "Traction", score: 88, note: "AHAR court" },
      { key: "comfort", label: "Comfort", score: 84 },
      { key: "durability", label: "Durability", score: 86, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 86 },
      { key: "cushioning", label: "Cushioning", score: 82, note: "GEL — not session-logged" },
      { key: "value", label: "Value", score: 78 },
    ],
    evidenceIds: ev("prod-asics-gel-resolution-padel"),
  }),
  shoeReview({
    reviewId: "review-adidas-crazyquick-boost-m",
    slug: "adidas-crazyquick-boost-padel",
    productId: "prod-adidas-crazyquick-boost-m",
    title: "Adidas Crazyquick Boost Padel Review",
    name: "Crazyquick Boost Padel",
    fullName: "Adidas Crazyquick Boost Padel",
    subtitle: "Boost-cushioned Adidas padel shoe for first-step speed on court.",
    whatItIs:
      "Crazyquick Boost Padel is Adidas’ current Boost-cushioned padel court shoe: omni/court rubber, a stability last and a plush court-feel listing. I'd shortlist it when you want that foam on padel turf and you already move well laterally.",
    verdict:
      "I'd buy Crazyquick Boost when you want plush cushioning without leaving the Adidas padel line. I'd skip it if you wanted club-value Courtquick money, or a firmer planted last like Resolution.",
    score: 87,
    specs: [
      "Outsole: Adidas padel court / omni",
      "Cushioning: high (Boost)",
      "Support: stability",
      "Gender: men",
      "Court feel: plush",
    ],
    traction:
      "Traction is listed as Adidas padel court rubber with an omni pattern. That is a court job on sand-filled turf, not Continental road rubber. I'd watch the first-step pods; once they shine, the Boost still feels soft and the shoe starts to skate. Not a trail lug, not a running outsole.",
    stability:
      "The last is a stability court shoe, not a running guidance post. Boost can feel taller than Courtquick; the question is whether the base still plants on a cut. If you wanted the firmer planted Adidas option, Courtquick is the cheaper sibling in this line.",
    courtFeel:
      "Listed court feel is plush. That is the Boost trade: more landing protection, less connected than Jet Premura. I'd not evaluate it with marathon stack language. If you cannot feel the turf, this is the wrong foam for how you play.",
    cushioning:
      "Boost is the listed high-cushion story for padel sessions, not easy-run miles. Kitletics has not logged court hours. Treat the plushness as the reason you pay more than Courtquick — and as the reason some players will want a firmer last.",
    support:
      "Support is a stability court last with mesh overlays. Midfoot lockdown matters more than the Boost name. If the heel rolls on a plant, size or last is wrong — do not wait for break-in.",
    fit:
      "Fit Crazyquick for a split-step, not an easy jog. A women's Crazyquick exists if you need that last. Heel slip on court shows up on the first cut.",
    durability:
      "Outsole pods plus Boost compression are the watch items. Kitletics has not session-logged this model. Club volume on abrasive indoor turf will tell you first. That is an ownership note, not a claimed session count.",
    comfort:
      "Comfort is the Boost argument. If Courtquick already feels like enough foam, save the money. If your knees complain after a second match on hard indoor turf, this is the Adidas padel shoe that targets that job.",
    value:
      "You pay a premium versus Courtquick and versus Joma / Kuikma. I'd pay it when Boost is the weekly reason. If not, Courtquick or T.Slam is the cleaner spend.",
    pros: ["Boost cushioning on a padel last", "Current Adidas padel line", "Quick lateral brief"],
    cons: ["Premium vs Courtquick and club-value shoes", "Plush feel is not for everyone"],
    buy: [
      "You want Boost cushioning on a padel-specific last, not a running Ultraboost with a court photo.",
      "You already change direction well and want landing protection for frequent club matches.",
      "You will keep Courtquick or a firmer last in the bag if you discover you want more court connection.",
    ],
    skip: [
      "You wanted club-value money — Courtquick, T.Slam or Kuikma PS 990 is the clearer lane.",
      "You wanted a firmer, more planted last — Gel-Resolution Padel is the closer job.",
      "You needed a running daily. Boost here is still a court shoe.",
    ],
    alts: ["prod-adidas-courtstabil", "prod-asics-gel-resolution-padel", "prod-babolat-jet-premura"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 86 },
      { key: "grip", label: "Traction", score: 84, note: "Omni padel rubber" },
      { key: "comfort", label: "Comfort", score: 90, note: "Boost — not session-logged" },
      { key: "durability", label: "Durability", score: 80, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 84 },
      { key: "cushioning", label: "Cushioning", score: 90, note: "Boost" },
      { key: "value", label: "Value", score: 74 },
    ],
    evidenceIds: ev("prod-adidas-crazyquick-boost-m"),
  }),
  shoeReview({
    reviewId: "review-adidas-courtquick",
    slug: "adidas-courtquick-padel",
    productId: "prod-adidas-courtstabil",
    title: "Adidas Courtquick Padel Review",
    name: "Courtquick Padel",
    fullName: "Adidas Courtquick Padel",
    subtitle: "Adidas club court shoe for padel turf — herringbone grip without Boost money.",
    whatItIs:
      "Courtquick is Adidas’s current club padel court shoe: herringbone court rubber, moderate cushioning and a stability last. I'd shortlist it when you want Adidas court grip without Boost money.",
    verdict:
      "I'd buy Courtquick as the Adidas club default for padel turf. I'd skip it if you already know you want Boost (Crazyquick) or a heavier planted last (Resolution).",
    score: 84,
    specs: [
      "Outsole: Adidas court rubber / herringbone",
      "Cushioning: moderate",
      "Support: stability",
      "Gender: men",
    ],
    traction:
      "Herringbone court rubber is the listed traction. That is the right category for sand-filled turf. I'd replace when the pods polish. This is not a road outsole and not a trail shoe — the old backfill copy that talked about pavement was the wrong sport.",
    stability:
      "A stability court last for lateral load. Not a running guidance shoe. If you need more structure than this, Resolution is the firmer planted compare, not Kayano.",
    courtFeel:
      "Listed court feel is moderate — more connected than Crazyquick Boost, less racer than Jet Premura. That is the club-shoe job.",
    cushioning:
      "Moderate cushioning. Enough for club matches if you are not asking it to be Boost. Kitletics has not logged court hours.",
    support:
      "Stability last with mesh overlays. Midfoot lockdown for cuts. If the heel slips, size is wrong.",
    fit:
      "Fit for a split-step. Women's Courtquick exists as a separate model. Do not assume this last is a running width ladder.",
    durability:
      "Club workhorse rubber. Watch medial and first-step patches. Research-informed ownership note, not a mileage diary.",
    comfort:
      "Club comfort, not plush Boost. If your weeks are long and hard on indoor turf, Crazyquick is the Adidas upgrade — not a running daily.",
    value:
      "This is the Adidas value padel shoe in the current line. I'd pay Crazyquick money only when Boost is the weekly reason.",
    pros: ["Court herringbone at club price", "Lateral last", "Current Adidas padel line"],
    cons: ["Less foam than Crazyquick Boost", "Not a Resolution-level planted last"],
    buy: [
      "You want Adidas padel court grip and a stable base without Boost pricing.",
      "Most of your weeks are club matches on sand-filled turf, not road miles.",
      "You will keep Resolution or Crazyquick as the specialist if this last is not planted enough or not plush enough.",
    ],
    skip: [
      "You already know you want Boost — Crazyquick is the sibling.",
      "You wanted the most planted overlay last — Gel-Resolution Padel.",
      "You needed a running shoe.",
    ],
    alts: ["prod-adidas-crazyquick-boost-m", "prod-joma-t-slam", "prod-asics-gel-resolution-padel"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 86 },
      { key: "grip", label: "Traction", score: 85, note: "Herringbone court" },
      { key: "comfort", label: "Comfort", score: 80 },
      { key: "durability", label: "Durability", score: 84, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 82 },
      { key: "cushioning", label: "Cushioning", score: 76 },
      { key: "value", label: "Value", score: 86 },
    ],
    evidenceIds: ev("prod-adidas-courtstabil"),
  }),
  shoeReview({
    reviewId: "review-joma-t-slam",
    slug: "joma-t-slam",
    productId: "prod-joma-t-slam",
    title: "Joma T.Slam Review",
    name: "T.Slam",
    fullName: "Joma T.Slam",
    subtitle: "EU club workhorse with a padel-specific lateral brief.",
    whatItIs:
      "T.Slam is Joma’s widely listed padel court shoe: DURABILITY rubber, high lateral support and a competitive street price. I'd shortlist it when you want a club workhorse and you can live with a last that some feet find narrow.",
    verdict:
      "I'd buy T.Slam as a value padel court shoe for frequent club play. I'd skip it if you needed a guaranteed wide last or a Boost/GEL flagship.",
    score: 86,
    specs: [
      "Outsole: DURABILITY rubber",
      "Cushioning: Reactive / phylon",
      "Support: high lateral",
      "Surface: padel-specific",
    ],
    traction:
      "DURABILITY rubber is the listed court outsole. Club players buy Joma for that grip-to-price ratio on sand-filled turf. Replace when pods polish. Not a road shoe.",
    stability:
      "High lateral support is the listed job. This is a court last, not a running Stability shoe. If the last feels narrow, that is a fit issue — try in store rather than hoping mesh stretches into a 2E.",
    courtFeel:
      "Moderate court feel. More connected than Boost, less racer than some Michelin padel racers. Club default.",
    cushioning:
      "Phylon / Reactive is moderate court foam, not GEL or Boost. Fine for club volume. Kitletics has not session-logged it.",
    support:
      "High lateral last. Midfoot lockdown for cuts. If you need more overlay armour, Resolution is the upgrade.",
    fit:
      "Fit can run narrow for some feet — that is the honest catalog weakness. Try a lateral cut. Slam Lady exists if you need the women’s last.",
    durability:
      "Club workhorse positioning. Watch the outsole pods. Not a claimed hour count.",
    comfort:
      "Club comfort. If you wanted plush foam, Crazyquick or Resolution is the other spend.",
    value:
      "This is one of the stronger value padel court shoes in the EU catalog. I'd pay flagship money only when a specific last or foam is the weekly reason.",
    pros: ["Club-proven court grip", "Competitive price", "Stable base"],
    cons: ["Fit can run narrow", "Less premium foam than Boost / GEL flagships"],
    buy: [
      "You want a padel-specific court shoe you can actually replace at club prices.",
      "You play often enough to wear out outsole pods and you do not need Boost.",
      "You can try the last, because some feet find T.Slam narrow.",
    ],
    skip: [
      "You know you need a wide last — try in store or look at a brand with a clearer width story.",
      "You wanted GEL or Boost as the cushioning identity.",
      "You needed a running shoe.",
    ],
    alts: ["prod-kuikma-ps-990", "prod-adidas-courtstabil", "prod-asics-gel-resolution-padel"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 88 },
      { key: "grip", label: "Traction", score: 86 },
      { key: "comfort", label: "Comfort", score: 80 },
      { key: "durability", label: "Durability", score: 84, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 76, note: "Can run narrow" },
      { key: "cushioning", label: "Cushioning", score: 76 },
      { key: "value", label: "Value", score: 90 },
    ],
    evidenceIds: ev("prod-joma-t-slam"),
  }),
  shoeReview({
    reviewId: "review-babolat-jet-premura",
    slug: "babolat-jet-premura",
    productId: "prod-babolat-jet-premura",
    title: "Babolat Jet Premura Review",
    name: "Jet Premura",
    fullName: "Babolat Jet Premura",
    subtitle: "Padel-focused Jet with Michelin outsole heritage.",
    whatItIs:
      "Jet Premura is Babolat’s padel-focused court shoe: Michelin padel outsole, responsive foam and a medium-high support last. I'd shortlist it when you want a quicker, more connected padel shoe than Resolution.",
    verdict:
      "I'd buy Jet Premura when first-step speed and a padel-specific Michelin outsole are the job. I'd skip it if you wanted maximum overlay armour or club-value Joma / Kuikma money.",
    score: 86,
    specs: [
      "Outsole: Michelin padel",
      "Cushioning: KPRS-X / responsive foam",
      "Support: medium-high",
    ],
    traction:
      "Michelin padel rubber is the listed traction story. That is a court pattern for padel turf, not a road outsole. I'd still replace when the pods polish. Kitletics has not logged personal hours.",
    stability:
      "Medium-high support — less tank than Resolution, quicker than a max-overlay last. If you roll through cuts and want more armour, Resolution is the safer planted compare.",
    courtFeel:
      "More connected than Boost or max GEL. That is the racer-adjacent padel job. If you wanted plush landings, Crazyquick is the other feel.",
    cushioning:
      "Responsive foam, not a max stack. Enough for matches if you are not asking it to be a recovery trainer. Not session-logged.",
    support:
      "Medium-high. Good for players who already have strong ankles and want speed. Not the max-stability last in this catalog.",
    fit:
      "Fit for a split-step. Sensa is the women's Babolat padel compare. Race-snug is the wrong target for a three-match club day.",
    durability:
      "Lighter racers often give up overlay life. Watch the outsole and upper together. Research note, not a diary.",
    comfort:
      "Connected comfort. If your weeks are long and heavy, Resolution or Crazyquick may feel kinder on the second match.",
    value:
      "Premium vs T.Slam. I'd pay it when Michelin padel traction and a quicker last are the weekly reason.",
    pros: ["Padel-specific Michelin outsole", "Quick directional changes", "Connected court feel"],
    cons: ["Premium vs club-value shoes", "Less overlay armour than Resolution"],
    buy: [
      "You want a padel-specific Babolat last with Michelin traction, not a tennis Jet Mach leftover.",
      "You already move well and prefer a connected shoe over a tank last.",
      "You will keep a planted option if this feels too light on long indoor days.",
    ],
    skip: [
      "You wanted maximum lateral armour — Gel-Resolution Padel.",
      "You wanted club-value money — T.Slam or PS 990.",
      "You needed a running shoe.",
    ],
    alts: ["prod-head-sprint-pro-4-padel", "prod-asics-gel-resolution-padel", "prod-joma-t-slam"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 82 },
      { key: "grip", label: "Traction", score: 90, note: "Michelin padel" },
      { key: "comfort", label: "Comfort", score: 82 },
      { key: "durability", label: "Durability", score: 78, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 84 },
      { key: "cushioning", label: "Cushioning", score: 80 },
      { key: "value", label: "Value", score: 78 },
    ],
    evidenceIds: ev("prod-babolat-jet-premura"),
  }),
  shoeReview({
    reviewId: "review-nox-at10-lux",
    slug: "nox-at10-lux",
    productId: "prod-nox-at10-lux",
    title: "Nox AT10 Lux Review",
    name: "AT10 Lux",
    fullName: "Nox AT10 Lux",
    subtitle: "Nox padel court shoe in the AT10 line — herringbone, high lateral listing.",
    whatItIs:
      "AT10 Lux is Nox’s padel court shoe in the AT10 family: herringbone court rubber, high lateral listing and a moderate court feel. I'd shortlist it when you want the Nox ecosystem on your feet as well as in the racket bag.",
    verdict:
      "I'd buy AT10 Lux when you want a Nox padel shoe with a high lateral brief. I'd skip it if you wanted a proven overlay tank (Resolution) or a cheaper club default (T.Slam / PS 990).",
    score: 83,
    specs: [
      "Outsole: Nox court rubber / herringbone",
      "Support: high lateral",
      "Court feel: moderate",
      "Upper: mesh",
    ],
    traction:
      "Herringbone Nox court rubber is the listed traction. Court job on padel turf. Replace when pods polish. Not a road outsole.",
    stability:
      "High lateral listing. That is the padel reason to buy it. It is not a running Stability shoe. If you need more overlay proof in the market, Resolution still reads as the tank.",
    courtFeel:
      "Moderate. Club/match default, not a plush Boost.",
    cushioning:
      "Moderate court foam as listed. Not session-logged.",
    support:
      "High lateral last with mesh. Check lockdown on a cut.",
    fit:
      "Fit for a split-step. Do not assume it matches your AT10 racket grip size — different product.",
    durability:
      "Mesh plus court rubber. Watch pods. Research note.",
    comfort:
      "Moderate court comfort. If you wanted Boost, Crazyquick is the Adidas compare.",
    value:
      "You are also paying for the Nox line. If the last is not magic in your size, T.Slam is the more boring value pick.",
    pros: ["Nox padel line", "High lateral listing", "Herringbone court rubber"],
    cons: ["Less independent overlay proof than Resolution", "Not the cheapest club shoe"],
    buy: [
      "You want a Nox padel court shoe with a high lateral brief, not a tennis crossover with a Nox sticker.",
      "You already buy Nox rackets and want the same brand on court.",
      "You will try the last — catalog scores are not a fit guarantee.",
    ],
    skip: [
      "You wanted the most proven overlay tank — Gel-Resolution Padel.",
      "You wanted the cheapest club default — Kuikma PS 990 or T.Slam.",
      "You needed a running shoe.",
    ],
    alts: ["prod-joma-t-slam", "prod-asics-gel-resolution-padel", "prod-adidas-crazyquick-boost-m"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 86 },
      { key: "grip", label: "Traction", score: 84 },
      { key: "comfort", label: "Comfort", score: 80 },
      { key: "durability", label: "Durability", score: 80, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 82 },
      { key: "cushioning", label: "Cushioning", score: 78 },
      { key: "value", label: "Value", score: 80 },
    ],
    evidenceIds: ev("prod-nox-at10-lux"),
  }),
  shoeReview({
    reviewId: "review-head-sprint-pro-4-padel",
    slug: "head-sprint-pro-4-padel",
    productId: "prod-head-sprint-pro-4-padel",
    title: "HEAD Sprint Pro 4.0 Padel Review",
    name: "Sprint Pro 4.0 Padel",
    fullName: "HEAD Sprint Pro 4.0 Padel",
    subtitle: "Lighter HEAD padel court shoe with Hybrasion+ traction listing.",
    whatItIs:
      "Sprint Pro 4.0 Padel is HEAD’s lighter padel court shoe: omni / Hybrasion+ traction, moderate lateral listing and a connected court feel. I'd shortlist it when you want a quicker HEAD shoe than a tank last.",
    verdict:
      "I'd buy Sprint Pro 4.0 Padel when you want a lighter, more connected HEAD padel shoe. I'd skip it if you needed maximum lateral armour or club-value Joma money.",
    score: 82,
    specs: [
      "Outsole: omni / Hybrasion+",
      "Lateral stability: moderate",
      "Court feel: connected",
      "Durability: moderate listing",
    ],
    traction:
      "Hybrasion+ / omni is the listed traction. Court job. Connected shoes often wear pods faster on abrasive indoor turf — watch them. Not a road outsole.",
    stability:
      "Moderate lateral listing. Quicker than Resolution, less tank. If you roll through cuts, this may feel less planted. That is the trade for speed.",
    courtFeel:
      "Connected. You should feel the turf. If you wanted plush, Crazyquick is the other feel family.",
    cushioning:
      "Moderate. Match-day court foam, not a recovery trainer. Not session-logged.",
    support:
      "Moderate. Good for players who already move well. Not the max-support last.",
    fit:
      "Fit for a split-step. Lighter uppers can feel less locked — lace for court work.",
    durability:
      "Moderate durability listing. Connected racers often give up overlay life. Research note.",
    comfort:
      "Connected comfort. Long double-headers may prefer Resolution.",
    value:
      "Premium vs Kuikma. I'd pay it when a lighter HEAD last is the weekly reason.",
    pros: ["Connected court feel", "Hybrasion+ traction listing", "Lighter than tank lasts"],
    cons: ["Moderate lateral vs Resolution", "Not the cheapest club shoe"],
    buy: [
      "You want a lighter HEAD padel shoe with a connected court feel, not a tennis Revolt leftover without padel evidence.",
      "You already move well and do not need a max-overlay tank.",
      "You will keep a planted shoe if this feels too light on long indoor days.",
    ],
    skip: [
      "You needed maximum lateral armour — Gel-Resolution Padel.",
      "You wanted club-value money — T.Slam or PS 990.",
      "You needed a running shoe.",
    ],
    alts: ["prod-babolat-jet-premura", "prod-asics-gel-resolution-padel", "prod-joma-t-slam"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 78 },
      { key: "grip", label: "Traction", score: 84, note: "Hybrasion+" },
      { key: "comfort", label: "Comfort", score: 80 },
      { key: "durability", label: "Durability", score: 74, note: "Moderate listing" },
      { key: "fit", label: "Fit", score: 82 },
      { key: "cushioning", label: "Cushioning", score: 76 },
      { key: "value", label: "Value", score: 78 },
    ],
    evidenceIds: ev("prod-head-sprint-pro-4-padel"),
  }),
  shoeReview({
    reviewId: "review-kuikma-ps-990",
    slug: "kuikma-ps-990",
    productId: "prod-kuikma-ps-990",
    title: "Kuikma PS 990 Review",
    name: "PS 990",
    fullName: "Kuikma PS 990",
    subtitle: "Decathlon performance padel shoe for frequent club play.",
    whatItIs:
      "PS 990 is Kuikma’s performance padel court shoe: herringbone court rubber, moderate cushioning and a stability last at a club price. I'd shortlist it when you want a workhorse you can actually replace.",
    verdict:
      "I'd buy PS 990 as the value performance padel shoe in this catalog. I'd skip it if you wanted Boost or Resolution overlay proof and you will actually pay for those names.",
    score: 86,
    specs: [
      "Outsole: Kuikma court rubber / herringbone",
      "Cushioning: moderate",
      "Support: stability",
      "Gender: unisex listing",
    ],
    traction:
      "Herringbone Kuikma court rubber. Club turf job. Replace when pods polish. Wide EU availability is the practical reason this last gets worn — not a fake popularity rank.",
    stability:
      "Stability last for padel cuts. Not a running guidance shoe. Enough for frequent club play if the last fits.",
    courtFeel:
      "Moderate. Club default.",
    cushioning:
      "Moderate. Less premium than Boost. Fine for club volume. Not session-logged.",
    support:
      "Stability listing. Check lockdown on a cut.",
    fit:
      "Unisex listing. Try it. Decathlon returns are the practical fit safety net.",
    durability:
      "Club workhorse. Watch pods. Research note, not a diary.",
    comfort:
      "Club comfort. If you wanted Boost, you are in the wrong price band on purpose.",
    value:
      "This is the value performance pick. I'd pay Adidas or ASICS money only when a specific last or foam is the weekly reason.",
    pros: ["Strong value", "Wide EU availability", "Club workhorse herringbone"],
    cons: ["Less premium foam than Boost / GEL flagships"],
    buy: [
      "You want a padel-specific court shoe you can replace at Decathlon prices.",
      "You play often enough to wear out outsole pods and you do not need Boost.",
      "You will use the return policy if the last is wrong — catalog scores are not a fit guarantee.",
    ],
    skip: [
      "You wanted Boost or Resolution overlay proof and you will pay for those names.",
      "You needed a running shoe.",
      "You wanted a women's-specific last — check PS 560 Women only if that model is published with an authentic photo; do not assume this pair shrinks.",
    ],
    alts: ["prod-joma-t-slam", "prod-adidas-courtstabil", "prod-asics-gel-dedicate-8-padel"],
    scores: [
      { key: "stability", label: "Lateral stability", score: 84 },
      { key: "grip", label: "Traction", score: 84 },
      { key: "comfort", label: "Comfort", score: 80 },
      { key: "durability", label: "Durability", score: 82, note: "Research estimate" },
      { key: "fit", label: "Fit", score: 80 },
      { key: "cushioning", label: "Cushioning", score: 76 },
      { key: "value", label: "Value", score: 94 },
    ],
    evidenceIds: ev("prod-kuikma-ps-990"),
  }),
];

export const PADEL_SHOE_REVIEW_PRODUCT_IDS = padelFlagshipShoeReviews.map(
  (r) => r.productId,
);
