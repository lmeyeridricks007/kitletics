import type { FAQ } from "@/domain/editorial/types";
import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import { resolveHeroFromProductIds } from "@/lib/guides/guide-product-hero";
import { RACKET_UNIQUE } from "@/lib/guides/explainers/racket-unique-copy";

type RacketSpec = {
  slug: string;
  title: string;
  sportId: "sport-padel" | "sport-tennis";
  subject: string;
  outcome: string;
  factors: [string, string, string, string, ...string[]];
  comparison: [string, string];
  products: [string, string, string, ...string[]];
  tool?: "padel-racket-finder" | "tennis-racket-finder";
  bestHref: string;
  browseHref: string;
};

const RACKET_SPECS: RacketSpec[] = [
  {
    slug: "how-to-choose-a-padel-racket",
    title: "How to Choose a Padel Racket",
    sportId: "sport-padel",
    subject: "a padel racket",
    outcome:
      "match forgiveness, handling and power to your current level and playing style",
    factors: [
      "Player level",
      "Shape and sweet spot",
      "Weight and balance",
      "Core and face feel",
      "Playing style",
      "Budget",
    ],
    comparison: ["Forgiving control frame", "Power-focused frame"],
    products: [
      "prod-bullpadel-vertex-05",
      "prod-nox-at10-12k-2026",
      "prod-nox-ml10-pro-cup",
      "prod-head-coello-pro",
    ],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets",
    browseHref: "/padel/gear?category=padel-rackets",
  },
  {
    slug: "how-to-choose-padel-shoes",
    title: "How to Choose Padel Shoes",
    sportId: "sport-padel",
    subject: "padel shoes",
    outcome:
      "get predictable court grip and lateral support without sacrificing fit",
    factors: [
      "Outsole and court surface",
      "Lateral stability",
      "Fit and lockdown",
      "Cushion and durability",
    ],
    comparison: ["Stable court shoe", "Lighter speed shoe"],
    products: [
      "prod-asics-gel-resolution-padel",
      "prod-babolat-jet-premura",
      "prod-joma-t-slam",
    ],
    bestHref: "/padel/gear?category=padel-shoes",
    browseHref: "/padel/gear?category=padel-shoes",
  },
  {
    slug: "padel-grips-overgrips-explained",
    title: "Padel Grips & Overgrips Explained",
    sportId: "sport-padel",
    subject: "padel grips and overgrips",
    outcome:
      "set a comfortable handle diameter while maintaining tack and moisture control",
    factors: [
      "Base-grip condition",
      "Handle thickness",
      "Tack and absorption",
      "Replacement frequency",
    ],
    comparison: ["Replacement grip", "Overgrip"],
    products: [
      "prod-wilson-overgrip",
      "prod-wilson-overgrip",
      "prod-wilson-overgrip",
    ],
    bestHref: "/padel/gear?category=padel-grips",
    browseHref: "/padel/gear?category=padel-grips",
  },
  {
    slug: "how-to-choose-a-tennis-racket",
    title: "How to Choose a Tennis Racket",
    sportId: "sport-tennis",
    subject: "a tennis racket",
    outcome:
      "match head size, manageable weight and response to your level and swing",
    factors: [
      "Head size",
      "Strung weight",
      "Balance and swingweight",
      "String pattern and setup",
      "Grip size",
    ],
    comparison: [
      "Forgiving 100-square-inch frame",
      "Precise 98-square-inch frame",
    ],
    products: [
      "prod-wilson-clash-100-v3",
      "prod-babolat-pure-drive-gen11",
      "prod-wilson-blade-98-v9",
    ],
    tool: "tennis-racket-finder",
    bestHref: "/best/tennis-rackets",
    browseHref: "/tennis/gear?category=tennis-rackets",
  },
];

function makePlan(spec: RacketSpec): CompactExplainerPlan {
  const u = RACKET_UNIQUE[spec.slug];
  if (!u) throw new Error(`Missing RACKET_UNIQUE for ${spec.slug}`);

  const toolHref = spec.tool ? `/tools/${spec.tool}` : spec.browseHref;
  const isPadelRacket = spec.slug === "how-to-choose-a-padel-racket";
  const count = isPadelRacket ? 4 : 3;
  const examples = spec.products.slice(0, count).map((productId, index) => ({
    productId,
    approachLabel: u.exampleLabels[index] ?? `Approach ${index + 1}`,
    whyIllustrates:
      u.exampleWhys[index] ?? "Catalog role example for this guide.",
    bestFor: [
      spec.factors[Math.min(index, spec.factors.length - 1)]!,
      spec.comparison[index % 2]!,
    ],
    tradeoff:
      u.exampleTradeoffs[index] ?? "Verify fit and the complete setup.",
  }));
  const fallbackHero =
    spec.sportId === "sport-tennis"
      ? "/images/home/guide-tennis.jpg"
      : "/images/padel/hero.jpg";

  return {
    slug: spec.slug,
    displayTitle: spec.title,
    deck: u.deck,
    eyebrow: "Buying Guide",
    ...resolveHeroFromProductIds(
      spec.products,
      fallbackHero,
      `Player choosing ${spec.subject}`,
    ),
    quickAnswerBullets: u.quickAnswerBullets,
    methodologyNote: isPadelRacket
      ? "Needs-research guide: manufacturer specifications and normalized catalog fields establish the comparison, while unverified marketing claims are treated as claims rather than measured performance."
      : "This guide uses normalized catalog fields and manufacturer specifications to compare roles. Examples illustrate approaches rather than a universal ranking.",
    finder: spec.tool
      ? {
          toolSlug: spec.tool,
          title: `Find ${spec.subject}`,
          description:
            "Turn your hard constraints into an explainable shortlist.",
          ctaLabel: "Open the finder →",
        }
      : undefined,
    decisionLinks: [
      {
        label: spec.tool ? "Use the finder →" : "Browse current options →",
        href: toolHref,
      },
      { label: "See current recommendations →", href: spec.bestHref },
    ],
    definition: {
      title: u.definitionTitle,
      intro: u.definitionIntro,
      paragraphs: [...u.definitionParas],
    },
    whyItMatters: {
      title: u.whyTitle,
      paragraphs: [...u.whyParas],
    },
    factors: {
      title: `${spec.factors.length} factors that should drive the choice`,
      intro:
        "Use these as connected filters for this guide’s job — not a generic equipment checklist.",
      cards: spec.factors.map((title, index) => ({
        id: `factor-${index + 1}`,
        title,
        whatItIs:
          u.factorWhat[index] ?? `The ${title.toLowerCase()} requirement.`,
        howItChanges:
          u.factorChanges[index] ??
          "Your level and conditions change the useful range.",
        whatYouNotice:
          u.factorNotices[index] ??
          "Whether the choice still works late in a match.",
      })),
    },
    comparison: {
      title: `${spec.comparison[0]} vs ${spec.comparison[1]}`,
      columns: [spec.comparison[0], spec.comparison[1], "Choose based on"],
      rows: u.comparisonRows,
      footnote:
        "Category tendencies are starting points, not guarantees of individual feel.",
    },
    tradeoffs: {
      title: "What you gain — and give up",
      gains: u.tradeoffs.gains,
      giveUps: u.tradeoffs.giveUps,
      footnote: u.tradeoffs.footnote,
    },
    callouts: [
      {
        id: "marketing-limit",
        title: u.callout.title,
        body: u.callout.body,
        tone: "caution",
      },
    ],
    extraProse: isPadelRacket
      ? [
          {
            id: "research-status",
            title: "How to use a needs-research guide",
            paragraphs: [
              "Use verified dimensions and normalized catalog fields as the foundation. Treat unmeasured sweet-spot and power claims as hypotheses to test.",
              "Prefer retailers with demo or return options when independent evidence is thin.",
            ],
          },
        ]
      : undefined,
    decision: {
      title: "Decision steps for this guide",
      steps: u.decisionSteps,
      branches: {
        question: u.branchQuestion,
        options: u.branchOptions,
      },
    },
    examples: {
      title: `${examples.length} approaches for this decision`,
      disclaimer:
        "These products demonstrate distinct roles rather than a ranking. Verify current specifications and availability.",
      items: examples,
    },
    compareProductIds: spec.products,
    bestGuideHref: spec.bestHref,
    bestGuideLabel: "See current recommendations →",
    mistakes: u.mistakes,
    ctaFinder: {
      title: spec.tool
        ? "Turn the framework into a shortlist"
        : "Compare current catalog options",
      body: spec.tool
        ? "Use hard constraints before optional features."
        : "Browse after the role is clear.",
      ctaLabel: spec.tool ? "Open the finder →" : "Browse options →",
      href: toolHref,
    },
    ctaBest: {
      title: "Want current recommendations?",
      body: "Open the related Best guide after non-negotiables are set.",
      ctaLabel: "See current recommendations →",
      href: spec.bestHref,
    },
    productExampleRoles: examples.map((example) => ({
      productId: example.productId,
      roleLabel: example.approachLabel,
    })),
    productRailTitle: `Examples for this ${spec.subject} decision`,
    productRailBrowseHref: spec.browseHref,
    productRailBrowseLabel: "Browse current options →",
  };
}

export const RACKET_PLANS: CompactExplainerPlan[] = RACKET_SPECS.map(makePlan);

export const racketConfigs = RACKET_PLANS.map(buildExplainerFromPlan);

export const racketFaqs: FAQ[] = RACKET_SPECS.flatMap((spec) => {
  const u = RACKET_UNIQUE[spec.slug]!;
  return u.faqs.map((faq, index) => ({
    id: `faq-${spec.slug}-${index + 1}`,
    question: faq.question,
    answer: faq.answer,
    sportId: spec.sportId,
  }));
});
