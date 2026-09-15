/**
 * Accessory Best Guides — pressurizers and frame protectors.
 * Distinct jobs only. Do NOT create Best Wristbands.
 * Ergonomic Hesacore systems live in grips-intents (`padelErgonomicGripsGuide`) — skip duplicate here.
 */
import type { BestGuide } from "@/domain/editorial/types";
import {
  PADEL_SPORT,
  baseGuide,
  considered,
  method,
  pick,
} from "@/content/padel/best-guides/build";

// Skipped: best-padel-grip-systems — would duplicate best-padel-ergonomic-grips in grips-intents.ts.

export const padelBallPressurizersGuide: BestGuide = baseGuide({
  id: "best-padel-ball-pressurizers",
  slug: "padel-ball-pressurizers",
  title: "Best Padel Ball Pressurizers",
  subtitle: "Manual pump tubes vs HEAD X3 — two storage jobs, not clones",
  shortDescription:
    "Ball pressurizers with distinct jobs: Bullpadel Pascal Box (manual with pump) and HEAD X3 pressurizer.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-accessories",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intentionallyNarrow: true,
  relatedBuyingGuideIds: [
    "guide-choose-padel-balls",
    "guide-how-long-padel-balls-last",
  ],
  ...method(
    "published padel ball pressurizers / pressure tubes with authentic packshots and distinct storage mechanisms — not duplicate tubes",
  ),
  intro:
    "Ball pressurizers only earn awards when the jobs differ. We award Bullpadel Pascal Box for a manual pump tube you can re-pressurize, and HEAD X3 for HEAD’s three-ball pressurizer lane. Same-mechanism clones do not get a fake third crown. Wristbands are out of scope. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Mechanism first (manual pump vs sealed pressurizer form). Then ball count. Then whether you will actually use it every open can — unused tubes are shelf décor.",
  selectionCriteria: [
    {
      key: "mechanism",
      label: "Pressurizer mechanism",
      description: "Pump tubes and sealed X3-style units are different weekly jobs.",
    },
    {
      key: "capacity",
      label: "Ball capacity",
      description: "A 3-ball tube is not a 4-ball Pascal sibling by default.",
    },
  ],
  whatWeLookFor: [
    {
      key: "job",
      label: "Distinct storage job",
      whyItMatters: "Identical tubes cannot both be #1.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Distinct jobs only",
      explanation: "Pascal Box and HEAD X3 win different mechanisms — not a ranked top-ten of tubes.",
    },
  ],
  quickTake: [
    "Pascal Box when you want a manual pump pressurizer.",
    "HEAD X3 when you want HEAD’s three-ball pressurizer form.",
  ],
  decisionShortcuts: [
    { need: "Manual pump tube", productId: "prod-bullpadel-pascal-box", reason: "Pascal Box." },
    { need: "HEAD 3-ball pressurizer", productId: "prod-head-x3-pressurizer", reason: "HEAD X3." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-pascal-box",
      rank: 1,
      awardType: "best-overall",
      role: "Manual pump pressurizer",
      summary: "Bullpadel Pascal Box — manual tube with pump for re-pressurizing open cans.",
      whyWon:
        "Owns the manual pump job with an authentic packshot. HEAD X3 is a different mechanism — not a duplicate award.",
      whyFits: [
        "I’d use Pascal Box when I open cans mid-week and want to push pressure back into the tube.",
        "I’d skip it if I only wanted a sealed HEAD X3-style hold without pump rituals.",
      ],
      bestFor: ["Manual re-pressurize", "Open-can mid-week storage", "Bullpadel accessory kit"],
      tradeoff: "Pump ritual — unused tubes help nobody.",
      avoid: ["Players who will not actually pump after sessions"],
      instead: [
        { productId: "prod-head-x3-pressurizer", when: "you want HEAD’s X3 pressurizer form instead", label: "HEAD X3" },
      ],
    }),
    pick({
      productId: "prod-head-x3-pressurizer",
      rank: 2,
      awardType: "editors-pick",
      role: "HEAD three-ball pressurizer",
      summary: "HEAD X3 — three-ball pressurizer lane distinct from Pascal pump tubes.",
      whyWon:
        "Distinct HEAD X3 job versus Pascal’s manual pump — only awarded because the mechanism differs.",
      whyFits: [
        "I’d shortlist X3 when HEAD cans and a three-ball pressurizer form match the bag.",
        "I’d skip it if I specifically wanted a pump-equipped Pascal Box.",
      ],
      bestFor: ["HEAD X3 form", "Three-ball pressurizer storage"],
      tradeoff: "Not the same pump workflow as Pascal Box.",
      avoid: ["Players who need manual pump re-pressurize as the whole point"],
      instead: [
        { productId: "prod-bullpadel-pascal-box", when: "you want a manual pump tube", label: "Pascal Box" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-bullpadel-pascal-box-pro",
      "Pascal Box Pro sibling — shortlisted; do not invent a third identical pump award.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-pascal-box" },
    ),
    considered(
      "prod-bullpadel-pascal-box-4b",
      "4-ball Pascal variant — shortlisted capacity fork, not a second overall winner.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-pascal-box" },
    ),
    considered(
      "prod-bullpadel-pascal-box-switch",
      "Pascal Switch variant — shortlisted mechanism sibling.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-pascal-box" },
    ),
    considered(
      "prod-head-padel-pro-plus",
      "Competition can — not a pressurizer.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  buyingAdvice:
    "Only buy a pressurizer if you will use it after open cans. Pick pump vs X3 form first — not brand loyalty alone.",
  relatedGuideIds: ["best-padel-balls", "best-padel-racket-protectors"],
  comparisonProductIds: ["prod-bullpadel-pascal-box", "prod-head-x3-pressurizer"],
  hubImageSrc: "/images/padel/products/bullpadel-pascal-box-3b-hero.jpg",
  hubImageAlt: "Bullpadel Pascal Box ball pressurizer",
});

export const padelRacketProtectorsGuide: BestGuide = baseGuide({
  id: "best-padel-racket-protectors",
  slug: "padel-racket-protectors",
  title: "Best Padel Racket Protectors",
  subtitle: "Frame tape for glass and fence knocks — fit and thickness caveats apply",
  shortDescription:
    "Frame protectors: Bullpadel and Nox transparent protectors — fit and thickness caveats, not universal armour.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-accessories",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intentionallyNarrow: true,
  relatedBuyingGuideIds: ["guide-complete-padel-gear-checklist"],
  ...method(
    "published padel frame protectors / bumper tape with authentic packshots — thickness and frame-fit caveats disclosed",
  ),
  intro:
    "Frame protectors are consumable bumper tape for glass and fence knocks — not a performance upgrade. We award Bullpadel and Nox frame protectors where authentic packshots exist. Fit depends on frame curvature and how cleanly you apply the tape; thicker protectors can change tip feel slightly. Custom-weight protectors are a different job. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Published protector form first. Then thickness / tip mass caveats. Then whether your frame’s bumper geometry accepts the tape without wrinkles.",
  selectionCriteria: [
    {
      key: "fit",
      label: "Frame fit",
      description: "Curved tips and rough application cause peels mid-match.",
    },
    {
      key: "thickness",
      label: "Thickness / tip mass",
      description: "Thicker tape can nudge tip weight and feel — usually small, still real.",
    },
  ],
  whatWeLookFor: [
    {
      key: "protector",
      label: "Frame protector job",
      whyItMatters: "Custom weights and cosmetics are different products.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Fit caveats",
      explanation: "No protector is universal across every diamond tip without application care.",
    },
  ],
  quickTake: [
    "Bullpadel frame protector as the default transparent bumper tape.",
    "Nox frame protector when you want Nox kit cohesion.",
    "Expect re-application — protectors are consumables.",
  ],
  decisionShortcuts: [
    { need: "Default frame protector", productId: "prod-bullpadel-frame-protector", reason: "Bullpadel protector." },
    { need: "Nox protector", productId: "prod-nox-frame-protector", reason: "Nox protector." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-frame-protector",
      rank: 1,
      awardType: "best-overall",
      role: "Default frame protector",
      summary: "Bullpadel frame protector — transparent bumper tape for tip knocks.",
      whyWon:
        "Clearest published protector job with authentic packshot. Nox is the brand-cohesion alternative — not a thicker “better armour” crown.",
      whyFits: [
        "I’d apply this after the first glass kiss marks the clear bumper.",
        "I’d skip it if I wanted a weighted custom protector — that is a different SKU.",
      ],
      bestFor: ["Tip knock insurance", "Transparent bumper tape", "Club volume replacements"],
      tradeoff: "Thickness and application quality change tip feel slightly; peels if applied dirty or cold.",
      extraTradeoffs: ["Not universal on every extreme diamond tip without careful wrap."],
      avoid: ["Players expecting a performance upgrade from tape alone"],
      instead: [
        { productId: "prod-nox-frame-protector", when: "you want Nox kit cohesion", label: "Nox protector" },
      ],
    }),
    pick({
      productId: "prod-nox-frame-protector",
      rank: 2,
      awardType: "editors-pick",
      role: "Nox frame protector",
      summary: "Nox transparent frame protector — same job, Nox lane.",
      whyWon:
        "Keeps Nox players in a published protector without inventing a third identical tape award.",
      whyFits: [
        "I’d pick Nox protector when the rest of the bag is already Nox.",
        "I’d skip it if Bullpadel tape is already on the shelf and fits the frame.",
      ],
      bestFor: ["Nox kit cohesion", "Transparent protector"],
      tradeoff: "Same fit/thickness caveats as any bumper tape.",
      avoid: ["Players who already settled on Bullpadel tape"],
      instead: [
        { productId: "prod-bullpadel-frame-protector", when: "Bullpadel tape is enough", label: "Bullpadel protector" },
      ],
    }),
    pick({
      productId: "prod-bullpadel-frame-protector-uni",
      rank: 3,
      awardType: "editors-pick",
      badge: "Best universal fit option",
      role: "Universal-fit protector sibling",
      summary: "Bullpadel uni frame protector — same bumper job with a wider-fit positioning.",
      whyWon:
        "Third protector lane for frames where the standard tip wrap fights curvature — still consumable tape, not armour.",
      whyFits: [
        "I'd try the uni cut when the standard Bullpadel tape peels at the tip corners.",
        "I'd skip it if the standard Bullpadel or Nox protector already sits clean.",
      ],
      bestFor: ["Awkward tip curves", "Replacement consumable tape"],
      tradeoff: "Still peels if applied dirty or cold; not a performance upgrade.",
      avoid: ["Players expecting weighted custom protectors"],
      instead: [
        { productId: "prod-bullpadel-frame-protector", when: "standard Bullpadel tape already fits", label: "Bullpadel protector" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-bullpadel-custom-weight",
      "Custom weight — different job from clear bumper protection.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  buyingAdvice:
    "Clean the frame, apply warm, and expect to replace protectors. Thickness is a caveat, not a ranking bonus.",
  relatedGuideIds: ["best-padel-ball-pressurizers", "best-padel-bags", "best-padel-overgrips"],
  comparisonProductIds: [
    "prod-bullpadel-frame-protector",
    "prod-nox-frame-protector",
    "prod-bullpadel-frame-protector-uni",
  ],
  hubImageSrc: "/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg",
  hubImageAlt: "Bullpadel padel racket frame protector",
});
