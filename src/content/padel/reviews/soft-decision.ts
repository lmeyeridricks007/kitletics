/**
 * Selective high-decision soft-goods reviews (EXPERT_RESEARCH only).
 * Balls / bags / pressurizers — not a review for every catalog SKU.
 */
import type { ContentSection, Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
} from "@/domain/review-agent/category-config";
import { PADEL_GRIP_BLUEPRINT } from "@/lib/review/padel-review-outline";
import { sanitizePadelReview } from "@/lib/review/padel-review-copy";

const pub = publishedMeta();

function softReview(input: {
  reviewId: string;
  slug: string;
  productId: string;
  fullName: string;
  subtitle: string;
  categoryLabel: string;
  whatItIs: string;
  verdict: string;
  specs: string[];
  feel: string;
  comfort: string;
  durability: string;
  value: string;
  pros: string[];
  cons: string[];
  buy: string[];
  skip: string[];
  alts: string[];
  relatedBuyingGuideIds: string[];
  score: number;
}): Review {
  const evidenceIds = [
    `ev-${input.productId}-mfr`,
    `ev-${input.productId}-editorial`,
    "ev-catalog-editorial",
  ];
  const bodies: Record<string, string> = {
    "sec-overview": [
      input.whatItIs,
      input.verdict,
      `This is an expert-research ${input.categoryLabel} note — not a first-hand lab or match test.`,
      `Bottom line: ${input.verdict}`,
    ].join("\n\n"),
    "sec-verified-specs": [
      `Published markers:`,
      input.specs.map((s) => `• ${s}`).join("\n"),
      `We do not invent bounce hours, capacity magic, or medical claims.`,
    ].join("\n\n"),
    "sec-fit": input.feel,
    "sec-comfort": input.comfort,
    "sec-durability": input.durability,
    "sec-strengths": input.pros.map((p) => `• ${p}`).join("\n"),
    "sec-tradeoffs": [
      input.skip.join("\n\n"),
      input.cons.map((c) => `• ${c}`).join("\n"),
    ].join("\n\n"),
    "sec-usecase": input.buy.join("\n\n"),
    "sec-value": input.value,
    "sec-methodology": EXPERT_RESEARCH_METHODOLOGY,
    "sec-sources":
      "Manufacturer and specialist listing evidence on the product evidence list. No fake user scores or invented first-hand sessions.",
  };
  const sections: ContentSection[] = PADEL_GRIP_BLUEPRINT.map((slot) => ({
    id: slot.id,
    heading: slot.heading,
    body: bodies[slot.id] ?? input.whatItIs,
    evidenceIds,
  }));
  return sanitizePadelReview({
    id: input.reviewId,
    slug: input.slug,
    productId: input.productId,
    title: `${input.fullName} Review`,
    subtitle: input.subtitle,
    reviewType: "expert-research",
    bottomLine: `${input.verdict} ${input.buy[0] ?? ""} ${input.skip[0] ?? ""}`.trim(),
    verdict: input.verdict,
    score: input.score,
    summary: input.whatItIs,
    reviewerId: "author-kitletics-editorial",
    testingContext: EXPERT_RESEARCH_METHODOLOGY,
    editorialDisclosure: EDITORIAL_DISCLOSURE,
    sections,
    pros: input.pros,
    cons: input.cons,
    whoShouldBuy: input.buy,
    whoShouldAvoid: input.skip,
    scoreBreakdown: [
      { key: "value", label: "Value", score: input.score },
      { key: "fit", label: "Job fit", score: Math.min(92, input.score + 2) },
    ],
    evidenceIds,
    alternativeProductIds: input.alts,
    comparisonIds: [],
    relatedBuyingGuideIds: input.relatedBuyingGuideIds,
    faqIds: [],
    seoTitle: `${input.fullName} Review: Who It's For | Kitletics`,
    seoDescription: `Expert-research note on the ${input.fullName}. Methodology disclosed — not a first-hand test.`,
    ...pub,
  });
}

export const padelSoftDecisionReviews: Review[] = [
  softReview({
    reviewId: "review-head-padel-pro-s",
    slug: "head-padel-pro-s",
    productId: "prod-head-padel-pro-s",
    fullName: "HEAD Padel Pro S+",
    subtitle: "Faster HEAD competition can — not the control sibling.",
    categoryLabel: "ball",
    whatItIs:
      "HEAD Padel Pro S+ is the faster personality in HEAD’s current competition pair. I'd open it on slow courts when I want the ball to keep travelling. Pro+ remains the control-first sibling — not a worse can.",
    verdict:
      "I'd buy Pro S+ for match nights on slow glass when pace matters. I'd skip it if Pro+ already feels lively enough or I wanted training-crate economics.",
    specs: [
      "Type: pressurized competition can",
      "Personality: faster / livelier HEAD match can",
      "Sibling: HEAD Pro+ (control)",
    ],
    feel:
      "Manufacturer positioning is pace-first versus Pro+. Expect a livelier bounce story — exact court feel still depends on temperature, altitude, and can freshness.",
    comfort:
      "Comfort here means predictable match bounce while the can is fresh. Once open, demote tired cans to practice rather than forcing dead match balls.",
    durability:
      "Opened pressurized cans lose bounce over sessions. Plan rotation. A pressurizer can slow bounce drop; it cannot rebuild shredded felt.",
    value:
      "Match-can pricing. Compare per can against Wilson Premier Speed and Kuikma PB Speed before calling anything 'best value.'",
    pros: ["Clear faster HEAD match job", "Current competition positioning", "Obvious sibling fork with Pro+"],
    cons: ["Too lively for some control players", "Not a training crate", "Freshness dominates any brand story"],
    buy: [
      "You want HEAD’s faster competition can for slow or cold courts.",
      "You already know Pro+ sits too long for your match pace.",
      "You will rotate cans instead of playing half-dead match balls.",
    ],
    skip: [
      "You want the control-first HEAD can — that is Pro+.",
      "You only need practice volume — look at Tecnifibre Team / HEAD Team.",
      "You expected a universal best ball across every court.",
    ],
    alts: ["prod-head-padel-pro-plus", "prod-kuikma-pb-speed", "prod-wilson-padel-premier-speed"],
    relatedBuyingGuideIds: [
      "guide-choose-padel-balls",
      "guide-fast-vs-standard-padel-balls",
      "guide-how-long-padel-balls-last",
    ],
    score: 86,
  }),
  softReview({
    reviewId: "review-nox-at10-team-bag",
    slug: "nox-at10-team-bag",
    productId: "prod-nox-at10-team-bag",
    fullName: "Nox AT10 Team Bag",
    subtitle: "42 L club thermo paletero — not tournament XXL luggage.",
    categoryLabel: "bag",
    whatItIs:
      "Nox AT10 Team is a published ~42 L thermo club paletero with shoe venting in the club-carry job. I'd pack it for weekly club nights. It is not RH Pro tournament volume and it is not a commute backpack.",
    verdict:
      "I'd take AT10 Team for one–two frames, shoes, and thermo on club nights. I'd skip it if I needed 62 L tournament volume or a hands-free backpack commute.",
    specs: [
      "Form: club paletero",
      "Published volume class: ~42 L",
      "Jobs: thermo + shoe isolation for club carry",
    ],
    feel:
      "Paletero carry with straps — not a daypack. Expect club volume: enough for frames, shoes, and extras without the empty cavern of an XXL tournament duffel.",
    comfort:
      "Comfort is haul comfort for club nights. If you bike or train daily, a backpack form usually wins even when thermo is nicer on paper.",
    durability:
      "Zippers and thermo liners fail before marketing copy does. Treat it as kit luggage — don’t drag it like a suitcase on stairs every day if a backpack fits your transit.",
    value:
      "Worth it when thermo + shoe isolation is the weekly problem. Not value if you only carry one racket and hate paletero bulk.",
    pros: ["Club thermo job", "Shoe vent / isolation story", "Clear size vs RH Pro / XXL"],
    cons: ["Not tournament 62 L", "Not a commute backpack", "Empty volume still weighs"],
    buy: [
      "Weekly club nights with one–two frames and shoes in a hot car.",
      "You want published thermo rather than a fashion duffel.",
      "You do not need four-racket tournament packing every weekend.",
    ],
    skip: [
      "Tournament weekends with four frames — look at RH Pro / AT10 XXL.",
      "Hands-free bike/train commute — look at Tour Endurance / Vertex backpack.",
      "You want the absolute smallest 25 L backpack.",
    ],
    alts: [
      "prod-babolat-rh-pro-padel",
      "prod-tecnifibre-tour-endurance-backpack",
      "prod-nox-at10-xxl-bag",
    ],
    relatedBuyingGuideIds: ["guide-choose-padel-bag", "guide-padel-bag-vs-backpack"],
    score: 85,
  }),
  softReview({
    reviewId: "review-bullpadel-pascal-box",
    slug: "bullpadel-pascal-box-3b",
    productId: "prod-bullpadel-pascal-box",
    fullName: "Bullpadel Pascal Box 3B",
    subtitle: "Manual 3-ball pressurizer with manometer — not a felt regenerator.",
    categoryLabel: "accessory",
    whatItIs:
      "Pascal Box 3B is a manual 3-ball pressurizer with manometer, hermetic cup, and pump. I'd buy it if I open multiple cans a week. It maintains chamber pressure — it does not magically restore shredded felt.",
    verdict:
      "I'd buy Pascal Box when pressurizing opened cans is a weekly habit. I'd skip it if I open one can a month — buying fresher cans is simpler.",
    specs: [
      "Type: manual pressurizer",
      "Capacity: 3 balls",
      "System: pump + manometer + safety valve",
    ],
    feel:
      "Home regulation story versus compact travel canisters like HEAD X3. Same job class — pick by gauge precision vs packability.",
    comfort:
      "Comfort is workflow comfort: less dead bounce mid-week when you actually use it. Drawer clutter if you don’t.",
    durability:
      "Seals and valves matter more than brand stickers. Felt wear still ends a ball’s useful life even when pressure looks fine.",
    value:
      "Economics only for frequent players. Casual players should buy balls more often instead of another pressurizer body.",
    pros: ["Manometer regulation", "3-ball club capacity", "Pump included on listing"],
    cons: ["Upfront cost for casual players", "Does not fix felt wear", "Larger than travel canisters"],
    buy: [
      "You open multiple cans weekly and hate demoting balls after two sessions.",
      "You want regulated manometer control at home more than a tiny travel can.",
      "You understand pressure retention ≠ new felt.",
    ],
    skip: [
      "You open one can a month — fresher cans beat another gadget.",
      "You need maximum packability — look at HEAD X3.",
      "You expected a device that rebuilds worn felt.",
    ],
    alts: ["prod-head-x3-pressurizer", "prod-head-padel-pro-s"],
    relatedBuyingGuideIds: [
      "guide-padel-ball-pressurizers",
      "guide-how-long-padel-balls-last",
      "guide-choose-padel-balls",
    ],
    score: 82,
  }),
];

export const PADEL_SOFT_DECISION_REVIEW_PRODUCT_IDS = padelSoftDecisionReviews.map(
  (r) => r.productId,
);
