/**
 * Running Shoe Drop Explained — heel-to-toe geometry without the dogma.
 */
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import type { LongFormGuideConfig } from "@/lib/guides/long-form-config";

const DROP_BLOCKS: ExplainerBlock[] = [
  {
    id: "what-is-drop",
    type: "prose",
    title: "What is running shoe drop?",
    intro: "Drop is a measurement, not a quality rating.",
    paragraphs: [
      "Heel-to-toe drop is the difference between a shoe’s heel stack and forefoot stack, measured in millimetres. A shoe with 36 mm under the heel and 28 mm under the forefoot has an 8 mm drop. A zero-drop shoe has equal listed heights at both points; it can still have a thick midsole.",
      "Drop describes the platform’s static geometry. It does not tell you how soft the foam is, how high the total stack is, how strongly the rocker rolls, or where your foot will strike. Two 8 mm shoes can feel unrelated once those other variables enter the picture.",
      "Published figures are useful for comparison, but they are not laboratory-perfect promises. Brands may use different sample sizes and measurement conventions, and soft foam compresses while running. Treat a one-millimetre difference as minor; treat a move from 12 mm to 0 mm as meaningful.",
    ],
  },
  {
    id: "drop-buckets",
    type: "comparison-table",
    title: "Kitletics drop buckets",
    intro: "These ranges organise the catalog; they do not prescribe what you should wear.",
    columns: ["Approximate range", "Typical geometry signal", "What to remember"],
    rows: [
      {
        label: "Zero",
        values: ["0 mm", "Heel and forefoot at equal listed height", "Zero drop does not mean minimal cushioning"],
      },
      {
        label: "Low",
        values: ["1–5 mm", "Smaller heel-to-forefoot offset", "Stack and rocker can still make the ride feel protective"],
      },
      {
        label: "Medium",
        values: ["6–9 mm", "Moderate offset common across daily and faster shoes", "A broad middle, not a universal default"],
      },
      {
        label: "High",
        values: ["10 mm+", "More listed foam height at the heel than forefoot", "High drop does not automatically mean bulky or slow"],
      },
    ],
    footnote:
      "Kitletics buckets simplify filtering. Always compare the actual millimetre value and the complete shoe geometry.",
  },
  {
    id: "measurement-caution",
    type: "callout",
    title: "Do not over-read a single millimetre",
    tone: "caution",
    body: "Brand measurements, shoe size and foam compression can blur small differences. A 7 mm and 8 mm shoe may feel more alike than two 8 mm shoes with different stack, rocker and foam.",
  },
  {
    id: "how-drop-feels",
    type: "prose",
    title: "How drop can change the feel",
    paragraphs: [
      "All else equal, a higher offset places the heel higher relative to the forefoot. A lower offset creates a flatter relationship underfoot. That geometry can change where you notice load and how the shoe feels through stance, but runners do not respond identically.",
      "Higher-drop shoes may feel familiar to runners with a history in traditional daily trainers. Lower-drop shoes may feel flatter, more connected, or more forefoot-present. Those are tendencies, not guarantees: rocker, stiffness and foam can dominate the sensation.",
      "Drop also does not dictate foot strike. Heel strikers can run in low-drop shoes, and forefoot strikers can run in high-drop shoes. Choose from the complete ride and your proven comfort, not a rule about how a runner is supposed to land.",
    ],
  },
  {
    id: "drop-factors",
    type: "factor-cards",
    title: "What changes the meaning of drop",
    intro: "Read drop beside these specifications and design choices.",
    cards: [
      {
        id: "stack",
        title: "Total stack",
        whatItIs: "The amount of material under heel and forefoot.",
        howItChanges: "The same offset can sit on a low, flexible platform or a tall, protective one.",
        whatYouNotice: "Ground feel and protection may differ even when drop matches.",
      },
      {
        id: "rocker",
        title: "Rocker geometry",
        whatItIs: "Curvature that helps the shoe roll through transition.",
        howItChanges: "A strong rocker can make the static heel-to-toe offset less obvious in motion.",
        whatYouNotice: "A rolling sensation instead of a distinctly raised heel.",
      },
      {
        id: "foam",
        title: "Foam compression",
        whatItIs: "How the midsole deforms under your weight and stride.",
        howItChanges: "Heel and forefoot can compress differently, changing the dynamic feel.",
        whatYouNotice: "Softness may matter more than the listed millimetres.",
      },
      {
        id: "stiffness",
        title: "Flex and plates",
        whatItIs: "How freely the platform bends, including plate effects.",
        howItChanges: "A stiff shoe redirects motion through its rocker rather than flexing naturally.",
        whatYouNotice: "Two equal-drop shoes can transition at very different speeds.",
      },
      {
        id: "pace",
        title: "Pace and session",
        whatItIs: "The speed and duration at which you use the shoe.",
        howItChanges: "Geometry can feel different at easy pace than at race pace.",
        whatYouNotice: "A drop you enjoy for daily miles may not be your preferred race setup.",
      },
    ],
  },
  {
    id: "stack-rocker-interaction",
    type: "prose",
    title: "Drop, stack and rocker work as a system",
    paragraphs: [
      "Imagine a 5 mm flexible shoe with modest stack and a 5 mm max-cushion shoe with a pronounced rocker. Their arithmetic matches, but the first may feel flatter and more connected while the second feels tall and rolling.",
      "The reverse is also true. A high-drop shoe with a smooth heel bevel can transition less abruptly than its number suggests. Static measurements help shortlist shoes; ride geometry explains why the shortlist still needs context.",
      "When comparing products, read four fields together: heel-to-toe drop, heel and forefoot stack where available, ride character, and flexibility or plate construction.",
    ],
  },
  {
    id: "geometry-matrix",
    type: "matrix",
    title: "Drop × ride geometry (catalog examples)",
    xLow: "Lower drop",
    xHigh: "Higher drop",
    yLow: "More flexible / direct",
    yHigh: "More rockered / shaped",
    cells: [
      {
        id: "escalante",
        x: "low",
        y: "low",
        label: "Escalante 4",
        productId: "prod-escalante-4",
        description: "0 mm · flexible, lower-cushion daily platform",
      },
      {
        id: "clifton",
        x: "low",
        y: "high",
        label: "Clifton 10",
        productId: "prod-clifton-10",
        description: "5 mm · max-cushion rockered platform",
      },
      {
        id: "novablast",
        x: "mid",
        y: "high",
        label: "Novablast 6",
        productId: "prod-novablast-6",
        description: "8 mm · high-cushion rockered daily trainer",
      },
      {
        id: "ghost",
        x: "high",
        y: "mid",
        label: "Ghost 18",
        productId: "prod-ghost-18",
        description: "12 mm · smooth traditional daily geometry",
      },
    ],
    note: "Placement is illustrative and uses catalog drop, ride character, flexibility and cushioning fields.",
  },
  {
    id: "drop-tradeoffs",
    type: "pros-tradeoffs",
    title: "What lower and higher drop may change",
    gains: [
      "Lower drop can provide a flatter, more connected platform feel",
      "Higher drop can feel familiar to runners accustomed to traditional trainers",
      "A range of drops can give a rotation distinct ride options",
      "The right offset can make a shoe’s transition feel natural to you",
    ],
    giveUps: [
      "Lower is not automatically more natural, efficient or safer",
      "Higher is not automatically more protective or comfortable",
      "A large change may require adaptation even when the new shoe fits",
      "Focusing on drop alone can hide poor fit, foam or geometry choices",
    ],
    footnote: "These are possible ride effects, not medical or biomechanical predictions.",
  },
  {
    id: "transitioning",
    type: "prose",
    title: "How to transition between different drops",
    paragraphs: [
      "A small change inside the same general bucket often needs little attention. A major jump — especially from a long history of high-drop shoes to zero or very low drop — deserves a gradual introduction.",
      "Start with short, easy runs and keep your established shoe available. Increase use only when the new geometry feels normal during the run and afterward. Avoid combining a large drop change with a sudden mileage increase or a demanding workout block.",
      "Adaptation is individual. Calf or Achilles awareness is a reason to reduce exposure, not proof that a lower-drop shoe is correcting anything. Persistent pain belongs with a qualified clinician; this guide explains footwear geometry and does not diagnose injury.",
    ],
  },
  {
    id: "lower-is-not-better",
    type: "callout",
    title: "Lower drop is not inherently better",
    tone: "accent",
    body: "Zero and low drop are design options, not an upgrade path. Choose them when the complete shoe feels good and suits your use—not because a millimetre target promises better form, speed or injury prevention.",
  },
  {
    id: "decision-flow",
    type: "decision-flow",
    title: "How to choose a drop",
    steps: [
      {
        id: "history",
        title: "Start with your proven history",
        body: "Note the drop and complete geometry of shoes that have worked comfortably for regular mileage.",
      },
      {
        id: "purpose",
        title: "Define the shoe’s job",
        body: "Daily, long-run and race shoes can use different offsets; choose for the session rather than one permanent rule.",
      },
      {
        id: "system",
        title: "Read the whole platform",
        body: "Compare stack, rocker, cushion feel, stiffness and fit alongside drop.",
      },
      {
        id: "magnitude",
        title: "Check the size of the change",
        body: "A move of one or two millimetres is different from moving between high and zero drop.",
      },
      {
        id: "trial",
        title: "Test at an easy effort",
        body: "Use short easy runs to evaluate whether the transition feels natural before adding volume or speed.",
      },
      {
        id: "compare",
        title: "Compare actual models",
        body: "Shortlist shoes by role and fit, then use drop to explain differences—not to crown a winner.",
      },
    ],
    branches: {
      question: "How different is the new shoe from your usual geometry?",
      options: [
        { label: "Similar", result: "Prioritise fit and ride; the small drop difference may be secondary." },
        { label: "Moderately different", result: "Introduce it on short easy runs before making it your main trainer." },
        { label: "Very different", result: "Rotate gradually and avoid increasing mileage at the same time." },
        { label: "Pain or clinical concern", result: "Pause footwear experiments and seek qualified clinical guidance." },
      ],
    },
  },
  {
    id: "finder-cta",
    type: "cta",
    title: "Want a shortlist that considers more than drop?",
    variant: "finder",
    body: "The Running Shoe Finder combines use, terrain, fit, cushioning and support preferences. Drop is one input—not a diagnosis or a universal ranking.",
    ctaLabel: "Find my running shoes →",
    href: "/tools/running-shoe-finder",
  },
  {
    id: "product-examples",
    type: "product-examples",
    title: "Running shoes across the drop range",
    disclaimer:
      "These catalog examples illustrate geometry choices, not a best-to-worst ranking. Specifications describe the listed models and may change with future generations.",
    examples: [
      {
        productId: "prod-escalante-4",
        approachLabel: "Zero-drop, connected example",
        whyIllustrates: "Its 0 mm offset, flexible platform and low cushion show that zero drop is a geometry choice paired here with more ground feel.",
        bestFor: ["Runners already comfortable with zero drop", "Flexible daily running", "A connected ride preference"],
        tradeoff: "Less protective than high- or max-cushion trainers, and a large transition for long-time high-drop users.",
      },
      {
        productId: "prod-clifton-10",
        approachLabel: "Low-drop, max-cushion example",
        whyIllustrates: "Its 5 mm drop sits under a plush, rockered max-cushion platform—proof that low drop does not mean minimal shoe.",
        bestFor: ["Easy and long runs", "Rocker preference", "Low-drop cushioning"],
        tradeoff: "The tall rolling ride offers less direct ground feel than the millimetre figure alone might imply.",
      },
      {
        productId: "prod-novablast-6",
        approachLabel: "Medium-drop versatile example",
        whyIllustrates: "An 8 mm offset combines with soft, high cushioning and a rockered ride for an energetic daily role.",
        bestFor: ["Mixed daily mileage", "Long runs", "Soft, lively ride preference"],
        tradeoff: "Tall soft geometry matters as much as its middle-of-range drop; it is not a neutral baseline for every runner.",
      },
      {
        productId: "prod-ghost-18",
        approachLabel: "High-drop daily example",
        whyIllustrates: "Its 12 mm offset pairs with a smooth, soft daily platform and broad width options—a traditional high-drop trainer profile.",
        bestFor: ["Routine daily miles", "Runners accustomed to higher drop", "Width-sensitive shopping"],
        tradeoff: "May feel more heel-elevated and less lively than lower-drop or speed-focused options.",
      },
    ],
  },
  {
    id: "product-comparison",
    type: "product-comparison",
    title: "Compare shoes from 0 mm to 12 mm",
    productIds: [
      "prod-escalante-4",
      "prod-clifton-10",
      "prod-novablast-6",
      "prod-ghost-18",
    ],
    bestGuideHref: "/best/running-shoes",
    bestGuideLabel: "Best Running Shoes →",
    compareHref:
      "/compare?category=running-shoes&products=altra-escalante-4,hoka-clifton-10,asics-novablast-6,brooks-ghost-18",
  },
  {
    id: "mistakes",
    type: "mistakes",
    title: "Common drop mistakes",
    mistakes: [
      {
        id: "lower-better",
        title: "Assuming lower is better",
        body: "Drop is not a progression scale. Comfort, training history and the complete platform matter more.",
      },
      {
        id: "zero-minimal",
        title: "Equating zero drop with minimal cushioning",
        body: "Zero describes equal heel and forefoot heights. A zero-drop shoe can still have substantial stack.",
      },
      {
        id: "strike",
        title: "Using drop to force a foot strike",
        body: "The number does not dictate landing pattern, and footwear is not a shortcut to a supposedly correct form.",
      },
      {
        id: "single-number",
        title: "Ignoring stack and rocker",
        body: "Static offset cannot explain how a tall, rockered or stiff shoe moves underfoot.",
      },
      {
        id: "fast-transition",
        title: "Changing too much at once",
        body: "A large drop change plus more mileage or harder sessions makes adaptation harder to assess.",
      },
      {
        id: "diagnosis",
        title: "Treating drop as injury treatment",
        body: "Shoe geometry is not a diagnosis or medical prescription. Seek qualified help for pain or injury concerns.",
      },
    ],
  },
  {
    id: "best-guide-cta",
    type: "cta",
    title: "Ready to compare complete shoes?",
    variant: "best-guide",
    body: "Drop explains one part of the ride. Best Running Shoes compares current options by training role, fit, cushioning and overall trade-offs.",
    ctaLabel: "See Best Running Shoes →",
    href: "/best/running-shoes",
  },
];

export const runningShoeDropConfig: LongFormGuideConfig = {
  guideSlug: "running-shoe-drop",
  layout: "explainer",
  eyebrow: "Explainer",
  displayTitle: "Running Shoe Drop Explained",
  deck: "What heel-to-toe drop measures, how zero, low, medium and high drop can feel, and how to change geometry without treating one number as a prescription.",
  heroImageSrc: "/images/running/products/clifton-10-hero.jpg",
  heroImageAlt: "HOKA Clifton 10 running shoe illustrating heel-to-toe geometry",
  finder: {
    toolSlug: "running-shoe-finder",
    title: "Find shoes for how you run",
    description: "Build a shortlist from use, fit, cushioning and ride preferences—not drop alone.",
    ctaLabel: "Find my running shoes →",
  },
  decisionLinks: [
    { label: "Best running shoes →", href: "/best/running-shoes" },
    {
      label: "Compare drop examples →",
      href: "/compare?category=running-shoes&products=altra-escalante-4,hoka-clifton-10,asics-novablast-6,brooks-ghost-18",
    },
    { label: "Running shoe terminology →", href: "/guides/running-shoe-terminology" },
  ],
  glossaryHref: "/guides/running-shoe-terminology",
  glossaryTerms: [
    { id: "drop", term: "Heel-to-toe drop", definition: "Difference between listed heel and forefoot stack heights.", icon: "ruler" },
    { id: "heel-stack", term: "Heel stack", definition: "Amount of material between the heel and ground.", icon: "layers" },
    { id: "forefoot-stack", term: "Forefoot stack", definition: "Amount of material between the forefoot and ground.", icon: "layers" },
    { id: "zero-drop", term: "Zero drop", definition: "Equal listed heel and forefoot stack heights.", icon: "scale" },
    { id: "rocker", term: "Rocker", definition: "Curved geometry designed to roll the shoe through transition.", icon: "gauge" },
    { id: "ride-character", term: "Ride character", definition: "The overall way a shoe transitions and responds underfoot.", icon: "circle" },
  ],
  needs: [],
  factors: [],
  fit: [],
  toc: tocFromExplainer([...DROP_BLOCKS]),
  productExampleRoles: [
    { productId: "prod-escalante-4", roleLabel: "Zero-drop connected" },
    { productId: "prod-clifton-10", roleLabel: "Low-drop max cushion" },
    { productId: "prod-novablast-6", roleLabel: "Medium-drop versatile" },
    { productId: "prod-ghost-18", roleLabel: "High-drop daily" },
  ],
  productRailTitle: "Examples across the drop range",
  productRailBrowseHref: "/running/shoes",
  productRailBrowseLabel: "Browse running shoes →",
  explainer: {
    layout: "explainer",
    quickAnswerBullets: [
      "Drop is heel stack minus forefoot stack, measured in millimetres.",
      "Kitletics groups drop as zero (0 mm), low (1–5 mm), medium (6–9 mm) and high (10 mm+).",
      "Zero drop does not mean minimal cushioning; stack and drop are separate.",
      "Rocker, foam compression and stiffness can matter as much as the listed offset.",
      "Lower is not inherently better, faster, safer or more natural.",
      "Introduce large drop changes gradually and keep pain questions with a qualified clinician.",
    ],
    medicalNote:
      "Kitletics explains shoe geometry and ride. We do not diagnose injury, prescribe a heel-to-toe drop, or claim that a drop prevents or treats pain. Seek qualified clinical guidance for persistent symptoms.",
    methodologyNote:
      "This guide combines catalog heel/forefoot stack, drop, cushion, flexibility and ride-character fields with manufacturer technical descriptions and independent specialist coverage. Product cards render from live catalog data; bucket labels are practical comparison ranges, not clinical thresholds.",
    blocks: [...DROP_BLOCKS],
  },
};
