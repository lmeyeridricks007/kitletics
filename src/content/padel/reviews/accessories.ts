import type { ContentSection, Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
} from "@/domain/review-agent/category-config";
import { PADEL_GRIP_BLUEPRINT } from "@/lib/review/padel-review-outline";
import { sanitizePadelReview } from "@/lib/review/padel-review-copy";

const pub = publishedMeta();

function gripReview(input: {
  reviewId: string;
  slug: string;
  productId: string;
  fullName: string;
  subtitle: string;
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
      `This is a grip — not a racket review and not a medical device.`,
      `Bottom line: ${input.verdict}`,
    ].join("\n\n"),
    "sec-verified-specs": [
      `Published wrap markers:`,
      input.specs.map((s) => `• ${s}`).join("\n"),
      `Thickness and tack change handle size. A cushion replacement is not an overgrip 3-pack.`,
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
      "Manufacturer pack copy and specialist listings on the evidence list. No fake user scores.",
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
      { key: "comfort", label: "Comfort", score: 82 },
      { key: "value", label: "Value", score: 84 },
    ],
    evidenceIds,
    alternativeProductIds: input.alts,
    comparisonIds: [],
    relatedBuyingGuideIds: [
      "guide-padel-grips",
      "guide-padel-grip-vs-overgrip",
      "guide-how-often-replace-padel-overgrip",
    ],
    faqIds: [],
    seoTitle: `${input.fullName} Review: Feel, Wrap & When to Replace | Kitletics`,
    seoDescription: `Expert-research note on the ${input.fullName} — wrap type, feel and who should skip it. Not a first-hand hitting test.`,
    ...pub,
  });
}

export const padelAccessoryReviews: Review[] = [
  gripReview({
    reviewId: "review-wilson-overgrip",
    slug: "wilson-padel-overgrip-pack",
    productId: "prod-wilson-overgrip",
    fullName: "Wilson Pro Padel Overgrip 3-Pack",
    subtitle: "Thin padel-length overgrip — the default wrap, not a cushion replacement.",
    whatItIs:
      "Wilson Pro Padel Overgrip is a thin, lightly tacky padel-length overgrip in a 3-pack. I'd wrap this as the default refresh layer. It is not Hesacore and it is not a replacement base grip.",
    verdict:
      "I'd use this as the default overgrip when you want a thin wrap that does not jump a grip size. I'd skip it if you needed a structured cushion replacement or the driest possible sweat wrap.",
    specs: [
      "Type: overgrip",
      "Thickness: thin / super-thin class",
      "Tack: light",
      "Pack: 3",
    ],
    feel:
      "Wrap overlapping like any overgrip. Thin enough that it should not jump a grip size. If you already sit at the top of a size, a cushion replacement is the bigger change — this is the smaller one.",
    comfort:
      "Comfort is tack and whether the handle still feels like the same size after 40 minutes. Light tack, moderate absorption. Not the driest option for heavy sweat. No injury claims.",
    durability:
      "Overgrips are consumables. Replace when tack dies or the wrap rolls — often every few humid sessions. That is ownership, not a durability trophy.",
    value:
      "3-packs are the usual value unit. I'd rather refresh often than play on a slick wrap. Check live offers.",
    pros: ["Padel-length wrap", "Thin — does not jump a size", "Widely available 3-pack"],
    cons: ["Not the driest option for heavy sweat", "Not a cushion replacement"],
    buy: [
      "You want a thin padel overgrip you can replace every few sessions without changing handle size.",
      "You already have a replacement grip you like and only need tack on top.",
      "You will actually replace it — a dead overgrip is a worse spend than a 3-pack.",
    ],
    skip: [
      "You wanted a structured cushion that changes handle shape — Hesacore is that job, with the usual personal-fit caveat.",
      "You needed the driest possible wrap for heavy sweat — look at a more absorbent overgrip in this category.",
      "You needed a replacement base grip, not an overgrip.",
    ],
    alts: ["prod-bullpadel-gb1200", "prod-nox-pro-overgrip", "prod-hesacore-padel"],
    score: 84,
  }),
  gripReview({
    reviewId: "review-hesacore-padel",
    slug: "hesacore-padel-grip",
    productId: "prod-hesacore-padel",
    fullName: "Hesacore Padel Grip",
    subtitle: "Structured cushion replacement — comfort geometry, not a medical device.",
    whatItIs:
      "Hesacore is a structured cushion replacement grip. It changes handle shape. I'd try it when a standard replacement feels skinny after a long session. It is not an overgrip pack and it is not a treatment for elbow pain.",
    verdict:
      "I'd try Hesacore when you want a different handle geometry after long sessions. I'd skip it if you only needed a thin overgrip 3-pack, or if you expected a medical outcome.",
    specs: [
      "Type: cushion / structured replacement",
      "Feel: structured cushion",
      "Pack: 1",
    ],
    feel:
      "This is a one-time replacement that changes handle shape, then you usually add an overgrip. If you already sit at the top of a grip size, this will feel bigger. That is the point for some players and a reason to skip for others.",
    comfort:
      "Comfort positioning only. No injury or tennis-elbow claims. Fit is personal. If it feels wrong after one session, it is the wrong geometry — not something you 'break in' like a shoe.",
    durability:
      "Replacement grips last longer than overgrips, then get an overgrip on top. Replace the overgrip often; replace Hesacore when the structure collapses or you hate the shape.",
    value:
      "A different spend from a Wilson 3-pack. Buy it for handle shape, not because it is labelled premium.",
    pros: ["Distinct cushion geometry", "Replacement, not a thin overgrip"],
    cons: ["Not a thin overgrip", "Fit is personal", "Not a medical device"],
    buy: [
      "You want a structured cushion replacement because a standard handle feels skinny after long sessions.",
      "You understand this changes grip size and you can undo it if the shape is wrong.",
      "You will still use an overgrip on top rather than treating this as a tack layer.",
    ],
    skip: [
      "You only needed a thin overgrip 3-pack — Wilson Pro Padel Overgrip is that job.",
      "You expected a medical or injury-treatment outcome. This page will not make that claim.",
      "You cannot try it — handle shape is personal.",
    ],
    alts: ["prod-wilson-overgrip", "prod-head-hydrosorb"],
    score: 80,
  }),
  gripReview({
    reviewId: "review-bullpadel-hac-overgrip",
    slug: "bullpadel-hac-overgrip",
    productId: "prod-bullpadel-gb1200",
    fullName: "Bullpadel HaC Overgrip",
    subtitle: "Absorption-first padel wrap — when thin tack turns slippery.",
    whatItIs:
      "Bullpadel HaC (GB1200) is a thin absorbent padel overgrip. I'd wrap it when Wilson Pro feels like soap mid-set. It is not Hesacore and it is not a replacement base grip.",
    verdict:
      "I'd use HaC when moisture kills tack and I still want a thin overgrip. I'd skip it if I wanted maximum tacky feel as the whole point — that is Wilson Pro's job.",
    specs: [
      "Type: overgrip (absorption-first)",
      "Thickness: thin padel wrap",
      "Pack: typically 3-pack retail",
    ],
    feel:
      "Absorption-first feel rather than sticky tack. Expect less 'new wrap grab' than Wilson Pro and more dry contact when hands sweat. Replace often — absorption wraps die too.",
    comfort:
      "Comfort here means staying connected when humidity rises. Not a cushion sleeve. If you need handle geometry change, that is Hesacore — different product class.",
    durability:
      "Overgrips are consumables. HaC lasts a few sweaty sessions before it feels dead. Budget for packs, not one wrap per season.",
    value:
      "Worth it when sweat is the weekly complaint. Not a value multipack story by itself — compare cost per wrap against Nox Pro and Kuikma when buying bulk.",
    pros: ["Absorption-first padel wrap", "Thin enough for most handles", "Clear job vs Wilson tack"],
    cons: ["Less tacky than Wilson Pro", "Still a consumable", "Not an ergonomic sleeve"],
    buy: [
      "Your thin-tack overgrip turns slippery mid-set and absorption is the problem.",
      "You want a padel-native absorbent wrap rather than a tennis multipack guess.",
      "You will replace wraps often instead of expecting season-long durability.",
    ],
    skip: [
      "You want maximum tacky feel as the whole point — start with Wilson Pro.",
      "You needed a structured Hesacore-style cushion — different mechanism.",
      "You only buy one wrap a year and expect it to stay fresh.",
    ],
    alts: ["prod-wilson-overgrip", "prod-nox-pro-overgrip", "prod-kuikma-overgrip"],
    score: 83,
  }),
];

export const PADEL_ACCESSORY_REVIEW_PRODUCT_IDS = padelAccessoryReviews.map(
  (r) => r.productId,
);
