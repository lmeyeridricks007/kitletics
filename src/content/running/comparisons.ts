import type { Comparison } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

/**
 * High-value Prompt 15 Running comparisons (Tier 1).
 * No universal winners unless context-backed. No fabricated ride-feel claims.
 */
export const runningComparisons: Comparison[] = [
  {
    id: "cmp-nb6-nimbus27",
    slug: "asics-novablast-6-vs-asics-gel-nimbus-27",
    title: "ASICS Novablast 6 vs GEL-Nimbus 27",
    shortDescription:
      "Two premium daily trainers with different strengths — energetic versatility versus maximum cushioning.",
    productIds: ["prod-novablast-6", "prod-nimbus-27"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Two top daily trainers with different strengths. Novablast 6 emphasises lively versatility; Nimbus 27 prioritises maximum cushioning and long-run comfort.",
    verdict:
      "No universal winner. Choose Novablast 6 when you want a livelier, more versatile daily trainer; choose GEL-Nimbus 27 when maximum cushioning and easy/long-run comfort matter most.",
    winnerProductId: undefined,
    winnerReason:
      "Context-dependent — pick by ride preference and weekly mix, not overall Kitletics Score alone.",
    criteria: [
      {
        key: "cushion",
        label: "Cushion",
        specKey: "cushionLevel",
        winnerProductId: "prod-nimbus-27",
        notes: "Maximum cushioning vs high cushion",
      },
      {
        key: "energy",
        label: "Energy / bounce",
        winnerProductId: "prod-novablast-6",
        notes: "Livelier ride for mixed paces",
      },
      { key: "drop", label: "Drop", specKey: "drop" },
      { key: "weight", label: "Weight", specKey: "weight" },
      {
        key: "widths",
        label: "Width options",
        specKey: "widthOptions",
        winnerProductId: "prod-nimbus-27",
        notes: "Official wide options",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-6",
        rationale:
          "Covers more of a mixed week — easy miles plus occasional steady or tempo work — without feeling as specialised as a max-cushion recovery shoe.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-nimbus-27",
        rationale:
          "Higher cushioning and a more protective easy-pace platform when time on feet is the priority, not pace variety.",
      },
      {
        useCaseId: "uc-recovery-runs",
        productId: "prod-nimbus-27",
        rationale:
          "Softer max-cushion ride for easy and recovery days when you want protection over bounce.",
      },
      {
        useCaseId: "uc-tempo-runs",
        productId: "prod-novablast-6",
        rationale:
          "More energetic midsole character for moderate faster sessions; Nimbus stays in the easy/protective lane.",
      },
      {
        useCaseId: "uc-easy-runs",
        productId: "prod-nimbus-27",
        rationale:
          "Both work for easy miles; Nimbus is the clearer pick when soft protection is the main job.",
      },
    ],
    keyDifferences: [
      {
        key: "ride",
        label: "Ride",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "Livelier, more energetic" },
          { productId: "prod-nimbus-27", impact: "Softer, more protective" },
        ],
        explanation:
          "Novablast suits varied paces; Nimbus prioritises plush comfort on easy and long miles.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-nimbus-mfr", "ev-nimbus-editorial"],
      },
      {
        key: "midsole",
        label: "Midsole",
        productImpacts: [
          {
            productId: "prod-novablast-6",
            impact: "FF BLAST MAX + FF TURBO SQUARED forefoot",
          },
          {
            productId: "prod-nimbus-27",
            impact: "FF BLAST PLUS ECO + PureGEL",
          },
        ],
        explanation: "From manufacturer materials — different cushioning recipes within ASICS soft road shoes.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-nimbus-mfr"],
      },
      {
        key: "use",
        label: "Use",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "Daily + mixed easy/moderate" },
          { productId: "prod-nimbus-27", impact: "Easy, long and recovery" },
        ],
        explanation: "Structured Recommendation contexts emphasise different weekly roles.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "weight",
        label: "Weight",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "253 g (M ref)" },
          { productId: "prod-nimbus-27", impact: "305 g (M US 9)" },
        ],
        explanation:
          "Men’s reference weights: Novablast is lighter for the class; Nimbus sits in the heavier max-cushion band.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-nimbus-mfr"],
      },
      {
        key: "drop",
        label: "Drop",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "8 mm" },
          { productId: "prod-nimbus-27", impact: "8 mm" },
        ],
        explanation: "Same published drop — not a deciding factor between these two.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "best-for",
        label: "Best for",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "Versatile daily energy" },
          { productId: "prod-nimbus-27", impact: "Max cushion & long comfort" },
        ],
        explanation: "Core buying fork for this pair.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-6",
        reason: "you want one lively daily trainer for mixed easy and moderate paces",
        evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
      },
      {
        productId: "prod-novablast-6",
        reason: "you prefer a lighter shoe and occasional tempo or steady work in the same pair",
      },
      {
        productId: "prod-novablast-6",
        reason: "max-cushion softness feels too slow or mushy for your easy miles",
      },
      {
        productId: "prod-nimbus-27",
        reason: "you prioritise maximum cushioning and late-run comfort on long efforts",
        evidenceIds: ["ev-nimbus-mfr", "ev-nimbus-editorial"],
      },
      {
        productId: "prod-nimbus-27",
        reason: "most of your week is easy, recovery or high-volume long runs",
      },
      {
        productId: "prod-nimbus-27",
        reason: "you want official width options and a more protective soft platform",
      },
    ],
    editorialSections: [
      {
        id: "sec-how-to-decide",
        heading: "How to decide between them",
        body: "Treat this as a ride and role choice, not a quality ranking. Both are premium ASICS road shoes with soft daily intent. Novablast 6 leans energetic and versatile; GEL-Nimbus 27 leans protective and specialised for easy and long mileage. Start from how you actually train this month — mixed paces versus mostly easy volume — then confirm fit and current pricing.",
        evidenceIds: ["ev-catalog-editorial", "ev-novablast-6-mfr", "ev-nimbus-editorial"],
      },
      {
        id: "sec-when-novablast",
        heading: "When Novablast 6 is the better buy",
        body: "Choose Novablast 6 when one shoe needs to cover most of a mixed week: easy miles, some steady work, and the odd moderate tempo. The livelier midsole character and lower weight make it less specialised than Nimbus. It is the clearer pick if you dislike a very soft, slow recovery feel on ordinary training days, or if you do not want a dedicated max-cushion shoe in the rotation yet.",
        evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-when-nimbus",
        heading: "When GEL-Nimbus 27 is the better buy",
        body: "Choose Nimbus 27 when protection and plush comfort on easy and long runs matter more than pace versatility. It fits runners whose weekly kilometres are mostly recovery, easy aerobic work and long efforts, and who want maximum cushioning plus width options. Skip it as a default tempo tool — that is where Novablast (or a dedicated workout shoe) is usually a better match.",
        evidenceIds: ["ev-nimbus-mfr", "ev-nimbus-editorial"],
      },
      {
        id: "sec-conditions",
        heading: "Conditions and training context",
        body: "Both are road/treadmill shoes — neither replaces a trail shoe. On warm easy days either works; the fork is feel underfoot, not weather. If you already own a firm daily or tempo shoe, Nimbus is a strong soft partner for long and recovery. If you only buy one pair for mixed road training, Novablast is usually the more complete single-shoe answer. Same published drop (8 mm) means geometry difference here is mostly stack, foam recipe and intended pace range — not heel-to-toe offset.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    evidenceIds: [
      "ev-novablast-6-mfr",
      "ev-nimbus-mfr",
      "ev-catalog-editorial",
      "ev-nimbus-editorial",
    ],
    faqIds: [
      "faq-compare-nb6-nimbus-1",
      "faq-compare-nb6-nimbus-2",
      "faq-compare-nb6-nimbus-3",
      "faq-compare-nb6-nimbus-4",
      "faq-compare-nb6-nimbus-5",
      "faq-compare-nb6-nimbus-6",
      "faq-compare-nb6-nimbus-7",
      "faq-compare-nb6-nimbus-8",
      "faq-compare-nb6-nimbus-9",
      "faq-compare-nb6-nimbus-10",
    ],
    seoTitle: "ASICS Novablast 6 vs GEL-Nimbus 27 | Kitletics",
    seoDescription:
      "Compare Novablast 6 and GEL-Nimbus 27 on cushioning, ride, use cases, specs and current prices — decide by context, not a forced winner.",
    ...pub,
  },
  {
    id: "cmp-nb6-nb5",
    slug: "asics-novablast-6-vs-asics-novablast-5",
    title: "ASICS Novablast 6 vs Novablast 5",
    shortDescription:
      "Current vs previous Novablast — grip, midsole pod and upper changes.",
    productIds: ["prod-novablast-6", "prod-novablast-5"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    isGenerationComparison: true,
    summary:
      "Same family daily trainers. Novablast 6 adds a FF TURBO SQUARED forefoot pod, engineered woven upper and ASICSGRIP forefoot; stack and drop stay 41.5/33.5 mm and 8 mm.",
    verdict:
      "Choose Novablast 6 for the current platform and wet-road grip updates; choose Novablast 5 when discounted previous-generation value matters more than those updates.",
    winnerProductId: undefined,
    criteria: [
      { key: "drop", label: "Drop", specKey: "drop" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "plate", label: "Plate", specKey: "plateMaterial" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-6",
        rationale: "Current generation with updated forefoot response and traction.",
      },
      {
        useCaseId: "uc-easy-runs",
        productId: "prod-novablast-6",
        rationale: "Same soft daily role with current outsole compound.",
      },
    ],
    keyDifferences: [
      {
        key: "midsole",
        label: "Midsole",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "FF BLAST MAX" },
          {
            productId: "prod-novablast-6",
            impact: "FF BLAST MAX + FF TURBO SQUARED forefoot pod",
          },
        ],
        explanation: "Manufacturer materials document the dual-compound forefoot change on gen 6.",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "outsole",
        label: "Outsole",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "AHAR LO" },
          { productId: "prod-novablast-6", impact: "ASICSGRIP forefoot + AHAR LO" },
        ],
        explanation: "ASICSGRIP is the primary verified traction change.",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-6",
        reason: "You want the current Novablast platform and updated forefoot grip.",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        productId: "prod-novablast-5",
        reason: "You find strong previous-generation pricing and still want the soft daily role.",
      },
    ],
    upgradeAdvice: {
      upgradeIf: [
        "You want ASICSGRIP forefoot traction",
        "You want the current family generation for long-term parts/colourways",
      ],
      keepOlderIf: [
        "Novablast 5 is meaningfully cheaper in your region",
        "You already own a lightly used Novablast 5",
      ],
    },
    evidenceIds: ["ev-novablast-6-mfr", "ev-nb5-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "ASICS Novablast 6 vs Novablast 5: Key Changes | Kitletics",
    seoDescription:
      "Compare Novablast 6 and 5 on midsole, outsole, stack, drop and use-case fit — structured generation comparison.",
    ...pub,
  },
  {
    id: "cmp-nb6-ghost18",
    slug: "asics-novablast-6-vs-brooks-ghost-18",
    title: "ASICS Novablast 6 vs Brooks Ghost 18",
    shortDescription: "Bouncy ASICS daily vs soft, width-friendly Brooks daily.",
    productIds: ["prod-novablast-6", "prod-ghost-18"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Both are versatile road dailies. Novablast 6 is the more energetic soft daily; Ghost 18 emphasises approachable cushioning and official width options.",
    verdict:
      "No universal winner — pick Novablast 6 for bounce and mixed easy/moderate paces; Ghost 18 when fit widths and a calmer daily ride matter most.",
    criteria: [
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "drop", label: "Drop", specKey: "drop" },
      {
        key: "widths",
        label: "Width options",
        specKey: "widthOptions",
        winnerProductId: "prod-ghost-18",
        notes: "Broader official width range when listed",
      },
      { key: "stability", label: "Stability", specKey: "stability" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-6",
        rationale: "Higher daily Recommendation score for energetic soft miles.",
      },
      {
        useCaseId: "uc-beginners",
        productId: "prod-ghost-18",
        rationale: "Strong beginner-oriented Recommendation coverage and widths.",
      },
      {
        useCaseId: "uc-easy-runs",
        productId: "prod-novablast-6",
        rationale: "Soft energetic easy-day profile.",
      },
    ],
    keyDifferences: [
      {
        key: "drop",
        label: "Drop",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "8 mm" },
          { productId: "prod-ghost-18", impact: "Higher traditional drop (family norm ~12 mm)" },
        ],
        explanation: "Drop differs by family geometry — check specs on each product page.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "widths",
        label: "Width options",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "Standard (wide where offered)" },
          { productId: "prod-ghost-18", impact: "Broad official width range" },
        ],
        explanation: "Ghost line is known for published width SKUs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-novablast-6", reason: "You want a livelier soft daily trainer." },
      { productId: "prod-ghost-18", reason: "You need width options or a calmer daily ride." },
    ],
    evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "ASICS Novablast 6 vs Brooks Ghost 18 | Kitletics",
    seoDescription:
      "Compare two leading 2026 daily trainers on cushion, drop, widths and recommended uses.",
    ...pub,
  },
  {
    id: "cmp-ghost18-peg42",
    slug: "brooks-ghost-18-vs-nike-pegasus-42",
    title: "Brooks Ghost 18 vs Nike Pegasus 42",
    shortDescription: "Soft width-friendly daily vs firmer versatile workhorse.",
    productIds: ["prod-ghost-18", "prod-pegasus-42"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Direct daily-trainer competitors. Ghost 18 leans comfort and widths; Pegasus 42 leans mixed-pace versatility.",
    verdict:
      "Ghost 18 for easy-mile comfort and fit range; Pegasus 42 when one shoe must cover more pace changes.",
    criteria: [
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "drop", label: "Drop", specKey: "drop" },
      { key: "stability", label: "Stability", specKey: "stability" },
      { key: "widths", label: "Widths", specKey: "widthOptions" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-pegasus-42",
        rationale: "Strong versatility Recommendation for mixed weeks.",
      },
      {
        useCaseId: "uc-beginners",
        productId: "prod-ghost-18",
        rationale: "Beginner-friendly Recommendation and widths.",
      },
      {
        useCaseId: "uc-tempo-runs",
        productId: "prod-pegasus-42",
        rationale: "Better structured tempo suitability than pure soft dailies.",
      },
    ],
    keyDifferences: [
      {
        key: "use",
        label: "Primary emphasis",
        productImpacts: [
          { productId: "prod-ghost-18", impact: "Comfort / easy miles / widths" },
          { productId: "prod-pegasus-42", impact: "Mixed training versatility" },
        ],
        explanation: "Derived from Recommendation contexts and subcategory placement.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-ghost-18", reason: "Comfort and width options come first." },
      { productId: "prod-pegasus-42", reason: "You want one shoe for easy and moderate paces." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Brooks Ghost 18 vs Nike Pegasus 42 | Kitletics",
    seoDescription:
      "Compare Ghost 18 and Pegasus 42 for daily training — cushion, widths and pace versatility.",
    ...pub,
  },
  {
    id: "cmp-nb6-clifton10",
    slug: "asics-novablast-6-vs-hoka-clifton-10",
    title: "ASICS Novablast 6 vs HOKA Clifton 10",
    shortDescription: "Bouncy soft daily vs rockered max-cushion HOKA daily.",
    productIds: ["prod-novablast-6", "prod-clifton-10"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Both soft high-stack road dailies. Clifton 10 sits further toward max-cushion rocker; Novablast 6 keeps more energetic daily bounce.",
    verdict:
      "Clifton 10 when you want more protective max-cushion miles; Novablast 6 when you want soft but livelier daily energy.",
    criteria: [
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "drop", label: "Drop", specKey: "drop" },
      { key: "stability", label: "Stability", specKey: "stability" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-long-runs",
        productId: "prod-clifton-10",
        rationale: "Strong long-run Recommendation for protective stack.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-novablast-6",
        rationale: "Higher energetic daily Recommendation.",
      },
      {
        useCaseId: "uc-recovery-runs",
        productId: "prod-clifton-10",
        rationale: "Max-cushion recovery-oriented profile.",
      },
    ],
    keyDifferences: [
      {
        key: "cushionLevel",
        label: "Cushion classification",
        productImpacts: [
          { productId: "prod-novablast-6", impact: "High" },
          { productId: "prod-clifton-10", impact: "Maximum" },
        ],
        explanation: "Controlled cushionLevel enums on both products.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-novablast-6", reason: "You want soft energy for mixed easy days." },
      { productId: "prod-clifton-10", reason: "You want more max-cushion protection." },
    ],
    evidenceIds: ["ev-novablast-6-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "ASICS Novablast 6 vs HOKA Clifton 10 | Kitletics",
    seoDescription:
      "Compare Novablast 6 and Clifton 10 on cushion class, drop and long-run vs daily fit.",
    ...pub,
  },
  {
    id: "cmp-speed5-boston12",
    slug: "saucony-endorphin-speed-5-vs-adidas-adizero-boston-12",
    title: "Saucony Endorphin Speed 5 vs Adidas Adizero Boston 12",
    shortDescription: "Nylon-plated tempo rivals for workouts and faster long runs.",
    productIds: ["prod-endorphin-speed-5", "prod-boston-12"],
    categoryId: "cat-running-shoes",
    comparisonType: "hybrid",
    summary:
      "Both are plated tempo platforms. Speed 5 is the nylon race/workout hybrid; Boston 12 is a durable tempo trainer also used in HYROX contexts.",
    verdict:
      "Speed 5 when you want a dedicated tempo/race hybrid; Boston 12 when hybrid training (including HYROX) and durable tempo miles matter.",
    criteria: [
      { key: "plate", label: "Plate", specKey: "plateMaterial" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "drop", label: "Drop", specKey: "drop" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-tempo-runs",
        productId: "prod-endorphin-speed-5",
        rationale: "Top tempo Recommendation among seeded workout shoes.",
      },
      {
        useCaseId: "uc-hyrox-training",
        productId: "prod-boston-12",
        rationale: "Explicit HYROX training Recommendation coverage.",
      },
      {
        useCaseId: "uc-intervals",
        productId: "prod-endorphin-speed-5",
        rationale: "Strong interval Recommendation.",
      },
    ],
    keyDifferences: [
      {
        key: "plateMaterial",
        label: "Plate",
        productImpacts: [
          { productId: "prod-endorphin-speed-5", impact: "Nylon" },
          { productId: "prod-boston-12", impact: "Composite" },
        ],
        explanation: "Plate materials differ — neither is marked carbon solely from rods.",
        evidenceIds: ["ev-catalog-editorial", "ev-boston-mfr"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-endorphin-speed-5", reason: "Workouts and race-hybrid road sessions come first." },
      { productId: "prod-boston-12", reason: "You also train HYROX or want a durable tempo daily." },
    ],
    evidenceIds: ["ev-catalog-editorial", "ev-boston-editorial"],
    faqIds: [],
    seoTitle: "Endorphin Speed 5 vs Adizero Boston 12 | Kitletics",
    seoDescription:
      "Compare two plated tempo shoes on plate type, workouts, racing and hybrid training.",
    ...pub,
  },
  {
    id: "cmp-vaporfly4-alphafly3",
    slug: "nike-vaporfly-4-vs-nike-alphafly-3",
    title: "Nike Vaporfly 4 vs Nike Alphafly 3",
    shortDescription: "Nike carbon race family — race-day options.",
    productIds: ["prod-vaporfly-4", "prod-alphafly-3"],
    categoryId: "cat-running-shoes",
    comparisonType: "generated",
    summary:
      "Same-brand carbon race shoes. Alphafly is the premium race platform; Vaporfly is the more accessible race option in the same family positioning.",
    verdict:
      "Both are race tools, not dailies. Prefer Alphafly when seeking the premium race stack; Vaporfly when you want a carbon racer with lower positioning complexity.",
    criteria: [
      { key: "plate", label: "Plate", specKey: "plateMaterial" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "terrain", label: "Terrain", specKey: "terrain" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-marathon",
        productId: "prod-vaporfly-4",
        rationale: "Strong marathon race Recommendation among seeded racers.",
      },
      {
        useCaseId: "uc-5k",
        productId: "prod-vaporfly-4",
        rationale: "Capable short-road race Recommendation.",
      },
    ],
    keyDifferences: [
      {
        key: "role",
        label: "Positioning",
        productImpacts: [
          { productId: "prod-vaporfly-4", impact: "Accessible carbon racer" },
          { productId: "prod-alphafly-3", impact: "Premium race platform" },
        ],
        explanation: "Family positioning — not a fabricated ride-feel verdict.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-vaporfly-4", reason: "You want a carbon race shoe for marathon/road PBs." },
      { productId: "prod-alphafly-3", reason: "You want Nike’s premium race platform." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nike Vaporfly 4 vs Alphafly 3 | Kitletics",
    seoDescription:
      "Compare Nike’s carbon race shoes on role, plate and race-distance suitability.",
    ...pub,
  },
  {
    id: "cmp-kayano-adrenaline",
    slug: "asics-gel-kayano-32-vs-brooks-adrenaline-gts-25",
    title: "ASICS GEL-Kayano 32 vs Brooks Adrenaline GTS 25",
    shortDescription: "Stability daily trainers from two major road brands.",
    productIds: ["prod-kayano-32", "prod-adrenaline-gts-25"],
    categoryId: "cat-running-shoes",
    comparisonType: "generated",
    summary:
      "Both are dedicated stability dailies. Compare on stability classification, widths and daily Recommendation coverage — not marketing slogans.",
    verdict:
      "Too close to call without fit preference — both serve stability daily training. Prefer the model that fits your foot and width needs.",
    criteria: [
      { key: "stability", label: "Stability", specKey: "stability" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "widths", label: "Widths", specKey: "widthOptions" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-kayano-32",
        rationale: "Stability daily Recommendation coverage.",
      },
    ],
    keyDifferences: [
      {
        key: "stability",
        label: "Stability type",
        productImpacts: [
          { productId: "prod-kayano-32", impact: "Stability" },
          { productId: "prod-adrenaline-gts-25", impact: "Stability (GuideRails line)" },
        ],
        explanation: "Both classified as stability — fit and geometry differ by brand.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-kayano-32", reason: "You prefer ASICS fit and Kayano stability." },
      { productId: "prod-adrenaline-gts-25", reason: "You prefer Brooks fit and GuideRails stability." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "GEL-Kayano 32 vs Adrenaline GTS 25 | Kitletics",
    seoDescription:
      "Compare two major stability daily trainers on support class, cushion and fit priorities.",
    ...pub,
  },
  {
    id: "cmp-speedgoat-peregrine",
    slug: "hoka-speedgoat-6-vs-saucony-peregrine-15",
    title: "HOKA Speedgoat 6 vs Saucony Peregrine 15",
    shortDescription: "Trail daily competitors with different cushion emphasis.",
    productIds: ["prod-speedgoat-6", "prod-peregrine-15"],
    categoryId: "cat-running-shoes",
    comparisonType: "generated",
    summary:
      "Trail competitors. Speedgoat leans HOKA cushion for long trail days; Peregrine is a versatile trail trainer with aggressive grip emphasis.",
    verdict:
      "Speedgoat 6 for cushioned long trail days; Peregrine 15 for a versatile trail daily with different stack philosophy.",
    criteria: [
      { key: "terrain", label: "Terrain", specKey: "terrain" },
      { key: "cushion", label: "Cushion", specKey: "cushionLevel" },
      { key: "grip", label: "Grip", specKey: "grip" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-trail-training",
        productId: "prod-speedgoat-6",
        rationale: "Top trail Recommendation among seeded trail shoes.",
      },
    ],
    keyDifferences: [
      {
        key: "cushion",
        label: "Cushion emphasis",
        productImpacts: [
          { productId: "prod-speedgoat-6", impact: "Higher cushion trail platform" },
          { productId: "prod-peregrine-15", impact: "More moderate trail stack emphasis" },
        ],
        explanation: "From cushion classification and trail subcategory placement.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-speedgoat-6", reason: "You want max-ish cushion on trails." },
      { productId: "prod-peregrine-15", reason: "You want a versatile trail daily." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "HOKA Speedgoat 6 vs Saucony Peregrine 15 | Kitletics",
    seoDescription:
      "Compare two popular trail shoes on cushion, grip and trail-training fit.",
    ...pub,
  },
  {
    id: "cmp-fr970-pacepro",
    slug: "garmin-forerunner-970-vs-coros-pace-pro",
    title: "Garmin Forerunner 970 vs COROS Pace Pro",
    shortDescription: "AMOLED mapping running watches — ecosystem vs weight/value.",
    productIds: ["prod-forerunner-970", "prod-coros-pace-pro"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Both offer AMOLED displays with maps. Forerunner 970 emphasises Garmin training depth; Pace Pro emphasises light weight and COROS battery positioning.",
    verdict:
      "FR970 for Garmin ecosystem and flagship Forerunner features; Pace Pro when light weight and COROS value matter more.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
      { key: "weight", label: "Weight", specKey: "weight" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-advanced",
        productId: "prod-forerunner-970",
        rationale: "Deeper Garmin training tools and ecosystem for structured athletes.",
      },
      {
        useCaseId: "uc-high-mileage",
        productId: "prod-coros-pace-pro",
        rationale: "Lighter AMOLED maps watch with strong COROS battery positioning.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-forerunner-970",
        rationale: "Flagship Forerunner feature set for race build training.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        productImpacts: [
          { productId: "prod-forerunner-970", impact: "Garmin Connect / sensors" },
          { productId: "prod-coros-pace-pro", impact: "COROS app / lighter chassis" },
        ],
        explanation: "Brand ecosystems differ — compatibility is factual, not preference.",
        evidenceIds: ["ev-fr970-mfr", "ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-forerunner-970", reason: "You want Garmin maps and training tools." },
      { productId: "prod-coros-pace-pro", reason: "You want a lighter AMOLED maps watch." },
    ],
    evidenceIds: ["ev-fr970-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Garmin Forerunner 970 vs COROS Pace Pro | Kitletics",
    seoDescription:
      "Compare AMOLED mapping running watches on maps, GPS, weight and ecosystem.",
    ...pub,
  },
  {
    id: "cmp-fr970-fr965",
    slug: "garmin-forerunner-970-vs-garmin-forerunner-965",
    title: "Garmin Forerunner 970 vs Forerunner 965",
    shortDescription: "Current vs previous flagship Forerunner generation.",
    productIds: ["prod-forerunner-970", "prod-forerunner-965"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    isGenerationComparison: true,
    summary:
      "Same Forerunner flagship line. 970 is current; 965 remains a strong previous-generation maps watch often better value.",
    verdict:
      "Choose 970 for current flagship hardware extras; choose 965 when previous-generation pricing delivers the maps/training features you need.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "ecg", label: "ECG", specKey: "ecg" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-advanced",
        productId: "prod-forerunner-970",
        rationale: "Current flagship extras (e.g. ECG) for athletes who want the newest Forerunner.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-forerunner-965",
        rationale: "Previous-gen maps/training features often at better value for race builds.",
      },
      {
        useCaseId: "uc-high-mileage",
        productId: "prod-forerunner-965",
        rationale: "Same maps training class without paying for every 970-only hardware delta.",
      },
    ],
    keyDifferences: [
      {
        key: "ecg",
        label: "ECG",
        productImpacts: [
          { productId: "prod-forerunner-965", impact: "Not listed" },
          { productId: "prod-forerunner-970", impact: "Supported per Garmin materials" },
        ],
        explanation: "From manufacturer feature differentiation.",
        evidenceIds: ["ev-fr970-mfr", "ev-fr965-mfr"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-forerunner-970", reason: "You want the current Forerunner flagship." },
      { productId: "prod-forerunner-965", reason: "You want maps training features at previous-gen pricing." },
    ],
    upgradeAdvice: {
      upgradeIf: ["You need 970-only hardware features such as ECG/flashlight extras"],
      keepOlderIf: ["965 pricing is substantially better and covers your training needs"],
    },
    evidenceIds: ["ev-fr970-mfr", "ev-fr965-mfr"],
    faqIds: [],
    seoTitle: "Garmin Forerunner 970 vs 965 | Kitletics",
    seoDescription:
      "Generation comparison of Garmin’s flagship Forerunner watches — maps, display and feature deltas.",
    ...pub,
  },
  {
    id: "cmp-hrm-pro-h10",
    slug: "garmin-hrm-pro-plus-vs-polar-h10",
    title: "Garmin HRM-Pro Plus vs Polar H10",
    shortDescription: "Chest-strap HR monitors for training accuracy.",
    productIds: ["prod-hrm-pro-plus", "prod-polar-h10"],
    categoryId: "cat-hrm",
    comparisonType: "generated",
    summary:
      "Both are chest straps with dual connectivity expectations. HRM-Pro Plus adds Garmin running dynamics; H10 is a widely compatible Polar strap.",
    verdict:
      "HRM-Pro Plus when you use Garmin dynamics; H10 when you want a broadly compatible Polar chest strap.",
    criteria: [
      { key: "type", label: "Type", specKey: "type" },
      { key: "dynamics", label: "Running dynamics", specKey: "runningDynamics" },
      { key: "connectivity", label: "Connectivity", specKey: "connectivity" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-advanced",
        productId: "prod-hrm-pro-plus",
        rationale: "Garmin running dynamics when you already train in the Garmin ecosystem.",
      },
      {
        useCaseId: "uc-hyrox-training",
        productId: "prod-polar-h10",
        rationale: "Broad Bluetooth/ANT+ chest-strap compatibility across watches and phones.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-hrm-pro-plus",
        rationale: "Dynamics + Garmin pairing for structured race-build sessions.",
      },
    ],
    keyDifferences: [
      {
        key: "runningDynamics",
        label: "Running dynamics",
        productImpacts: [
          { productId: "prod-hrm-pro-plus", impact: "Yes (Garmin)" },
          { productId: "prod-polar-h10", impact: "Not Garmin dynamics" },
        ],
        explanation: "Feature flag from product specifications.",
        evidenceIds: ["ev-hrm-mfr", "ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-hrm-pro-plus", reason: "You want Garmin running dynamics." },
      { productId: "prod-polar-h10", reason: "You want a Polar chest strap with broad Bluetooth/ANT+ use." },
    ],
    evidenceIds: ["ev-hrm-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Garmin HRM-Pro Plus vs Polar H10 | Kitletics",
    seoDescription:
      "Compare chest-strap heart rate monitors on dynamics, connectivity and ecosystem fit.",
    ...pub,
  },
  {
    id: "cmp-advskin-vaporair",
    slug: "salomon-adv-skin-12-vs-nathan-vaporair-2",
    title: "Salomon ADV Skin 12 vs Nathan VaporAir 2",
    shortDescription: "Trail/ultra race vest alternatives.",
    productIds: ["prod-adv-skin-12", "prod-nathan-vaporair-2"],
    categoryId: "cat-packs-vests",
    comparisonType: "generated",
    summary:
      "Race-vest competitors. ADV Skin 12 is a higher-capacity Salomon trail/ultra vest; VaporAir 2 is a lighter Nathan race vest orientation.",
    verdict:
      "ADV Skin 12 for larger trail/ultra capacity needs; VaporAir 2 for a lighter race-vest setup.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-ultra",
        productId: "prod-adv-skin-12",
        rationale: "Higher capacity for longer trail/ultra days.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-adv-skin-12",
        rationale: "More storage for flasks, layers and poles on training days.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-nathan-vaporair-2",
        rationale: "Lighter race-vest orientation when you carry less.",
      },
    ],
    keyDifferences: [
      {
        key: "capacity",
        label: "Capacity",
        productImpacts: [
          { productId: "prod-adv-skin-12", impact: "12 L listed" },
          { productId: "prod-nathan-vaporair-2", impact: "Lower race-vest volume class" },
        ],
        explanation: "From structured capacity where published.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-adv-skin-12", reason: "You need more storage for ultra/trail days." },
      { productId: "prod-nathan-vaporair-2", reason: "You want a lighter race vest." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Salomon ADV Skin 12 vs Nathan VaporAir 2 | Kitletics",
    seoDescription:
      "Compare trail race vests on capacity, poles and race suitability.",
    ...pub,
  },
  {
    id: "cmp-fenix8-fr970",
    slug: "garmin-fenix-8-vs-garmin-forerunner-970",
    title: "Garmin Fenix 8 vs Forerunner 970",
    shortDescription: "Adventure multisport flagship vs runner-first Forerunner flagship.",
    productIds: ["prod-fenix-8", "prod-forerunner-970"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Both are premium AMOLED Garmin watches with maps and multi-band GPS. Fenix 8 adds outdoor/dive-oriented build and lifestyle extras; Forerunner 970 stays lighter and more running-focused.",
    verdict:
      "Fenix 8 when adventure tools and outdoor durability matter daily; Forerunner 970 when you want flagship training maps without Fenix bulk and price.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "ecg", label: "ECG", specKey: "ecg" },
      { key: "battery", label: "GPS battery (claimed)", specKey: "batteryGps" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-trail-training",
        productId: "prod-fenix-8",
        rationale: "Tougher adventure chassis and outdoor feature depth for trail days.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-forerunner-970",
        rationale: "Runner-first flagship without adventure-watch weight for race builds.",
      },
      {
        useCaseId: "uc-advanced",
        productId: "prod-forerunner-970",
        rationale: "Deep Garmin training tools in a running-oriented package.",
      },
    ],
    keyDifferences: [
      {
        key: "role",
        label: "Design role",
        productImpacts: [
          { productId: "prod-fenix-8", impact: "Adventure multisport / outdoor" },
          { productId: "prod-forerunner-970", impact: "Running-first training flagship" },
        ],
        explanation: "Same ecosystem, different chassis briefs — weight and outdoor extras diverge.",
        evidenceIds: ["ev-fr970-mfr", "ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-fenix-8", reason: "You want AMOLED maps plus adventure build and outdoor tools." },
      { productId: "prod-forerunner-970", reason: "You want flagship Forerunner training without Fenix bulk." },
    ],
    evidenceIds: ["ev-fr970-mfr", "ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Garmin Fenix 8 vs Forerunner 970 | Kitletics",
    seoDescription:
      "Compare Garmin’s adventure Fenix 8 with the runner-first Forerunner 970 on maps, weight and training fit.",
    ...pub,
  },
  {
    id: "cmp-apex4-fenix8",
    slug: "coros-apex-4-vs-garmin-fenix-8",
    title: "COROS Apex 4 vs Garmin Fenix 8",
    shortDescription: "MIP trail maps endurance vs AMOLED Garmin adventure flagship.",
    productIds: ["prod-coros-apex-4", "prod-fenix-8"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Apex 4 emphasises titanium MIP maps, dual-frequency battery, and COROS simplicity. Fenix 8 emphasises bright AMOLED, music/payments, and the deeper Garmin ecosystem.",
    verdict:
      "Apex 4 for trail/ultra battery and value; Fenix 8 when Garmin Connect, music, and AMOLED lifestyle features matter more.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
      { key: "music", label: "Music", specKey: "music" },
      { key: "weight", label: "Weight", specKey: "weight" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-ultra",
        productId: "prod-coros-apex-4",
        rationale: "Stronger dual-frequency battery story at lower weight/price for long efforts.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-coros-apex-4",
        rationale: "Maps and MIP endurance without Fenix price for most trail days.",
      },
      {
        useCaseId: "uc-advanced",
        productId: "prod-fenix-8",
        rationale: "Deeper Garmin training/recovery stack and smartwatch extras.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        productImpacts: [
          { productId: "prod-coros-apex-4", impact: "COROS training app" },
          { productId: "prod-fenix-8", impact: "Garmin Connect / sensors / Pay" },
        ],
        explanation: "Ecosystem lock-in and accessory depth differ as much as display type.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-coros-apex-4", reason: "You want MIP maps and long dual-frequency battery without Garmin pricing." },
      { productId: "prod-fenix-8", reason: "You want AMOLED Garmin adventure tools, music and payments." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "COROS Apex 4 vs Garmin Fenix 8 | Kitletics",
    seoDescription:
      "Compare Apex 4 and Fenix 8 on maps, battery, display and ecosystem for trail runners.",
    ...pub,
  },
  {
    id: "cmp-pace4-fr165",
    slug: "coros-pace-4-vs-garmin-forerunner-165",
    title: "COROS Pace 4 vs Garmin Forerunner 165",
    shortDescription: "Ultralight dual-frequency value runner vs beginner Garmin.",
    productIds: ["prod-coros-pace-4", "prod-forerunner-165"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Pace 4 leads on weight and dual-frequency battery claims. Forerunner 165 leads on Garmin Connect simplicity and coaching for new runners.",
    verdict:
      "Pace 4 when battery and dual-frequency value matter; Forerunner 165 when you want the simplest Garmin path.",
    criteria: [
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "battery", label: "GPS battery (claimed)", specKey: "batteryGps" },
      { key: "music", label: "Music", specKey: "music" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginners",
        productId: "prod-forerunner-165",
        rationale: "Lower complexity Garmin entry for first structured plans.",
      },
      {
        useCaseId: "uc-high-mileage",
        productId: "prod-coros-pace-4",
        rationale: "Lighter chassis and longer GPS claims for weekly volume.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-coros-pace-4",
        rationale: "Dual-frequency battery headroom for long runs and race day.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        productImpacts: [
          { productId: "prod-coros-pace-4", impact: "COROS app / no music" },
          { productId: "prod-forerunner-165", impact: "Garmin Connect coaching" },
        ],
        explanation: "Training software and accessory ecosystems differ more than raw GPS basics.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-coros-pace-4", reason: "You want ultralight dual-frequency GPS and long battery." },
      { productId: "prod-forerunner-165", reason: "You want a simple Garmin beginner watch." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "COROS Pace 4 vs Garmin Forerunner 165 | Kitletics",
    seoDescription:
      "Compare Pace 4 and Forerunner 165 on battery, multi-band GPS and beginner fit.",
    ...pub,
  },
  {
    id: "cmp-ultra3-ultra2",
    slug: "apple-watch-ultra-3-vs-apple-watch-ultra-2",
    title: "Apple Watch Ultra 3 vs Ultra 2",
    shortDescription: "Current vs previous Apple Ultra for runners.",
    productIds: ["prod-apple-watch-ultra-3", "prod-apple-watch-ultra-2"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    isGenerationComparison: true,
    summary:
      "Same rugged Apple Ultra lane. Ultra 3 is current; Ultra 2 remains a strong previous-generation buy when discounted for iPhone runners.",
    verdict:
      "Choose Ultra 3 for the current generation; choose Ultra 2 when previous-gen pricing still covers your running and smartwatch needs.",
    criteria: [
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "battery", label: "GPS battery (claimed)", specKey: "batteryGps" },
      { key: "music", label: "Music", specKey: "music" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-advanced",
        productId: "prod-apple-watch-ultra-3",
        rationale: "Current Ultra hardware for athletes staying in Apple’s sports stack.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-apple-watch-ultra-2",
        rationale: "Previous-gen Ultra often better value for everyday training.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-apple-watch-ultra-3",
        rationale: "Newest dual-frequency / endurance claims when Apple is non-negotiable.",
      },
    ],
    keyDifferences: [
      {
        key: "generation",
        label: "Generation",
        productImpacts: [
          { productId: "prod-apple-watch-ultra-2", impact: "Previous generation" },
          { productId: "prod-apple-watch-ultra-3", impact: "Current Ultra" },
        ],
        explanation: "Same product family — prefer Ultra 3 unless Ultra 2 discount is compelling.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-apple-watch-ultra-3", reason: "You want the current Apple Ultra." },
      { productId: "prod-apple-watch-ultra-2", reason: "You want Ultra capability at previous-gen pricing." },
    ],
    upgradeAdvice: {
      upgradeIf: ["You need Ultra 3-only hardware or software deltas for your races"],
      keepOlderIf: ["Ultra 2 pricing is substantially better and covers your GPS runs"],
    },
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Apple Watch Ultra 3 vs Ultra 2 | Kitletics",
    seoDescription:
      "Generation comparison of Apple Watch Ultra 3 and Ultra 2 for runners.",
    ...pub,
  },
  {
    id: "cmp-gritx2-fenix8",
    slug: "polar-grit-x2-vs-garmin-fenix-8",
    title: "Polar Grit X2 vs Garmin Fenix 8",
    shortDescription: "Compact Polar outdoor maps watch vs Garmin adventure flagship.",
    productIds: ["prod-polar-grit-x2", "prod-fenix-8"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Both offer outdoor maps and dual-frequency GPS. Grit X2 is a more compact Polar training/recovery play; Fenix 8 is the fuller Garmin adventure smartwatch.",
    verdict:
      "Grit X2 when Polar analytics and a smaller outdoor AMOLED matter; Fenix 8 when music, payments, and Garmin ecosystem depth win.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
      { key: "music", label: "Music", specKey: "music" },
      { key: "battery", label: "Smartwatch battery (claimed)", specKey: "batterySmartwatch" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-trail-training",
        productId: "prod-polar-grit-x2",
        rationale: "Compact sapphire AMOLED maps with Polar outdoor training tools.",
      },
      {
        useCaseId: "uc-advanced",
        productId: "prod-fenix-8",
        rationale: "Broader Garmin multisport and smartwatch feature set.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-fenix-8",
        rationale: "Longer typical smartwatch battery and music/Pay for race-week logistics.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        productImpacts: [
          { productId: "prod-polar-grit-x2", impact: "Polar Flow training/recovery" },
          { productId: "prod-fenix-8", impact: "Garmin Connect / Pay / music" },
        ],
        explanation: "Training platforms and lifestyle extras diverge sharply.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-polar-grit-x2", reason: "You want Polar outdoor maps in a compact chassis." },
      { productId: "prod-fenix-8", reason: "You want full Garmin adventure flagship features." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Polar Grit X2 vs Garmin Fenix 8 | Kitletics",
    seoDescription:
      "Compare Grit X2 and Fenix 8 on outdoor maps, battery and ecosystem.",
    ...pub,
  },
  {
    id: "cmp-vertical2-enduro3",
    slug: "suunto-vertical-2-vs-garmin-enduro-3",
    title: "Suunto Vertical 2 vs Garmin Enduro 3",
    shortDescription: "AMOLED outdoor Suunto vs MIP solar ultra Garmin.",
    productIds: ["prod-suunto-vertical-2", "prod-enduro-3"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Vertical 2 offers a bright AMOLED outdoor experience with strong multi-band claims. Enduro 3 prioritises ultralight MIP solar GPS endurance and Garmin maps for multi-day ultras.",
    verdict:
      "Enduro 3 for max GPS hours and ultra events; Vertical 2 when you prefer AMOLED Suunto navigation and don’t need Enduro-class battery.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "battery", label: "GPS battery (claimed)", specKey: "batteryGps" },
      { key: "solar", label: "Solar", specKey: "solar" },
      { key: "weight", label: "Weight", specKey: "weight" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-ultra",
        productId: "prod-enduro-3",
        rationale: "Class-leading GPS/solar endurance for multi-day ultras.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-suunto-vertical-2",
        rationale: "Bright AMOLED maps and flashlight for most trail days.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-enduro-3",
        rationale: "Lighter MIP build with extreme battery headroom.",
      },
    ],
    keyDifferences: [
      {
        key: "display-battery",
        label: "Display vs battery",
        productImpacts: [
          { productId: "prod-suunto-vertical-2", impact: "AMOLED outdoor display" },
          { productId: "prod-enduro-3", impact: "MIP + solar ultra endurance" },
        ],
        explanation: "AMOLED convenience versus MIP/solar GPS hours is the core trade-off.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-suunto-vertical-2", reason: "You want a bright outdoor AMOLED with maps." },
      { productId: "prod-enduro-3", reason: "You need maximum Garmin ultra GPS battery." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Suunto Vertical 2 vs Garmin Enduro 3 | Kitletics",
    seoDescription:
      "Compare Vertical 2 and Enduro 3 on ultra battery, maps and display type.",
    ...pub,
  },
  {
    id: "cmp-pacepro-pace4",
    slug: "coros-pace-pro-vs-coros-pace-4",
    title: "COROS Pace Pro vs Pace 4",
    shortDescription: "AMOLED maps COROS vs ultralight value Pace 4.",
    productIds: ["prod-coros-pace-pro", "prod-coros-pace-4"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Same COROS running family. Pace Pro adds AMOLED maps; Pace 4 prioritises weight, dual-frequency battery claims, and lower price without offline maps.",
    verdict:
      "Pace Pro when maps matter; Pace 4 when you want the lightest value dual-frequency runner.",
    criteria: [
      { key: "maps", label: "Maps", specKey: "maps" },
      { key: "display", label: "Display", specKey: "displayType" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "multiband", label: "Multi-band GPS", specKey: "multiBandGps" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-trail-training",
        productId: "prod-coros-pace-pro",
        rationale: "Offline maps help when routes leave familiar roads.",
      },
      {
        useCaseId: "uc-high-mileage",
        productId: "prod-coros-pace-4",
        rationale: "Lighter value chassis for volume road training.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-coros-pace-4",
        rationale: "Strong dual-frequency battery at a lower price for race builds.",
      },
    ],
    keyDifferences: [
      {
        key: "maps",
        label: "Maps",
        productImpacts: [
          { productId: "prod-coros-pace-pro", impact: "Offline maps on AMOLED" },
          { productId: "prod-coros-pace-4", impact: "No full offline maps" },
        ],
        explanation: "Maps are the main reason to step up from Pace 4 to Pace Pro.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-coros-pace-pro", reason: "You need COROS AMOLED maps." },
      { productId: "prod-coros-pace-4", reason: "You want the lightest value Pace without maps." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "COROS Pace Pro vs Pace 4 | Kitletics",
    seoDescription:
      "Compare Pace Pro and Pace 4 on maps, weight and dual-frequency GPS value.",
    ...pub,
  },
  {
    id: "cmp-vivoactive6-fr165",
    slug: "garmin-vivoactive-6-vs-garmin-forerunner-165",
    title: "Garmin Vivoactive 6 vs Forerunner 165",
    shortDescription: "Lifestyle AMOLED Garmin vs beginner Forerunner.",
    productIds: ["prod-vivoactive-6", "prod-forerunner-165"],
    categoryId: "cat-gps-watches",
    comparisonType: "hybrid",
    summary:
      "Both sit in Garmin’s approachable tier. Vivoactive 6 emphasises light daily wear, music and Pay; Forerunner 165 emphasises running-focused training simplicity.",
    verdict:
      "Vivoactive 6 for lifestyle + light running; Forerunner 165 when running metrics and coaching are the primary job.",
    criteria: [
      { key: "music", label: "Music", specKey: "music" },
      { key: "payments", label: "Payments", specKey: "payments" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "battery", label: "GPS battery (claimed)", specKey: "batteryGps" },
      { key: "display", label: "Display", specKey: "displayType" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-vivoactive-6",
        rationale: "Lighter all-day wear with music and Garmin Pay.",
      },
      {
        useCaseId: "uc-beginners",
        productId: "prod-forerunner-165",
        rationale: "Clearer running-first entry into Garmin training tools.",
      },
      {
        useCaseId: "uc-first-half",
        productId: "prod-forerunner-165",
        rationale: "Stronger run-training focus for a first half build.",
      },
    ],
    keyDifferences: [
      {
        key: "role",
        label: "Design role",
        productImpacts: [
          { productId: "prod-vivoactive-6", impact: "Lifestyle multisport + Coach" },
          { productId: "prod-forerunner-165", impact: "Running-first beginner Forerunner" },
        ],
        explanation: "Same brand — lifestyle chrome versus run-training focus.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-vivoactive-6", reason: "You want a light lifestyle Garmin with music." },
      { productId: "prod-forerunner-165", reason: "You want a simple running-first Garmin." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Garmin Vivoactive 6 vs Forerunner 165 | Kitletics",
    seoDescription:
      "Compare Vivoactive 6 and Forerunner 165 for lifestyle vs beginner running fit.",
    ...pub,
  },

  // ─── HRM comparisons ─────────────────────────────────────────────────────
  {
    id: "cmp-hrm600-h10",
    slug: "garmin-hrm-600-vs-polar-h10",
    title: "Garmin HRM 600 vs Polar H10",
    shortDescription: "Garmin dynamics/rechargeable flagship vs Polar accuracy benchmark.",
    productIds: ["prod-hrm-600", "prod-polar-h10"],
    categoryId: "cat-hrm",
    comparisonType: "hybrid",
    summary:
      "HRM 600 unlocks Garmin running dynamics, Step Speed Loss / economy metrics on compatible Forerunners, and standalone recording. H10 remains the cross-ecosystem ECG accuracy benchmark with dual Bluetooth and broad app support.",
    verdict:
      "Choose HRM 600 if you live in Garmin Connect and will use dynamics weekly. Choose H10 when universal pairing and HR/HRV accuracy across brands matter more than Garmin extras.",
    criteria: [
      { key: "type", label: "Type", specKey: "type" },
      { key: "dynamics", label: "Running dynamics", specKey: "runningDynamics" },
      { key: "memory", label: "Internal memory", specKey: "internalMemory" },
      { key: "swim", label: "Swim support", specKey: "swimmingSupport" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-intervals",
        productId: "prod-polar-h10",
        rationale: "Universal ECG accuracy for hard intervals across watches and apps.",
      },
      {
        useCaseId: "uc-advanced",
        productId: "prod-hrm-600",
        rationale: "Garmin dynamics and advanced running metrics on compatible watches.",
      },
      {
        useCaseId: "uc-hyrox-training",
        productId: "prod-polar-h10",
        rationale: "Broad pairing when you bounce between apps, watches and gym screens.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem extras",
        productImpacts: [
          { productId: "prod-hrm-600", impact: "Garmin dynamics / economy metrics" },
          { productId: "prod-polar-h10", impact: "Cross-brand HR/HRV benchmark" },
        ],
        explanation: "Same ECG chest form — different ecosystem payoffs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-hrm-600", reason: "You want Garmin running dynamics and standalone recording." },
      { productId: "prod-polar-h10", reason: "You want the cross-ecosystem accuracy benchmark." },
    ],
    evidenceIds: ["ev-catalog-editorial", "ev-catalog-mfr"],
    faqIds: ["faq-hrm-1"],
    seoTitle: "Garmin HRM 600 vs Polar H10 | Kitletics",
    seoDescription: "Compare Garmin HRM 600 and Polar H10 for dynamics vs universal accuracy.",
    ...pub,
  },
  {
    id: "cmp-h10-h9",
    slug: "polar-h10-vs-polar-h9",
    title: "Polar H10 vs Polar H9",
    shortDescription: "Flagship Polar chest strap vs budget sibling.",
    productIds: ["prod-polar-h10", "prod-polar-h9"],
    categoryId: "cat-hrm",
    comparisonType: "hybrid",
    summary:
      "H10 adds dual simultaneous Bluetooth and one-session memory. H9 keeps Polar ECG sensing and ANT+/Bluetooth at a lower price for simpler setups.",
    verdict: "Buy H10 when you pair watch + phone/app together often. Buy H9 when you want Polar ECG accuracy on a budget.",
    criteria: [
      { key: "type", label: "Type", specKey: "type" },
      { key: "memory", label: "Internal memory", specKey: "internalMemory" },
      { key: "bt", label: "Simultaneous Bluetooth", specKey: "simultaneousBluetooth" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginners",
        productId: "prod-polar-h9",
        rationale: "Lower cost Polar ECG entry for first structured HR training.",
      },
      {
        useCaseId: "uc-intervals",
        productId: "prod-polar-h10",
        rationale: "Dual Bluetooth and memory help serious interval / multi-device weeks.",
      },
    ],
    keyDifferences: [
      {
        key: "connections",
        label: "Connections & memory",
        productImpacts: [
          { productId: "prod-polar-h10", impact: "Dual BLE + session memory" },
          { productId: "prod-polar-h9", impact: "Simpler single-stream strap" },
        ],
        explanation: "Same brand ECG family — H10 is the fuller tool.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-polar-h10", reason: "You need dual Bluetooth or strap memory." },
      { productId: "prod-polar-h9", reason: "You want Polar ECG accuracy for less money." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Polar H10 vs H9 | Kitletics",
    seoDescription: "Compare Polar H10 and H9 chest straps for features vs value.",
    ...pub,
  },
  {
    id: "cmp-trackr-h10",
    slug: "wahoo-trackr-vs-polar-h10",
    title: "Wahoo TRACKR vs Polar H10",
    shortDescription: "Rechargeable Wahoo chest strap vs Polar benchmark.",
    productIds: ["prod-wahoo-trackr", "prod-polar-h10"],
    categoryId: "cat-hrm",
    comparisonType: "hybrid",
    summary:
      "TRACKR modernises the Wahoo chest line with a rechargeable battery and multi-device pairing. H10 keeps the longer independent accuracy reputation and onboard session memory.",
    verdict:
      "TRACKR for rechargeable convenience and indoor trainer workflows. H10 when validation history and strap memory matter more.",
    criteria: [
      { key: "type", label: "Type", specKey: "type" },
      { key: "battery", label: "Battery type", specKey: "batteryType" },
      { key: "memory", label: "Internal memory", specKey: "internalMemory" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-hyrox-training",
        productId: "prod-wahoo-trackr",
        rationale: "Rechargeable strap that pairs cleanly with apps and indoor screens.",
      },
      {
        useCaseId: "uc-intervals",
        productId: "prod-polar-h10",
        rationale: "Benchmark ECG latency for hard interval work.",
      },
    ],
    keyDifferences: [
      {
        key: "battery",
        label: "Battery & memory",
        productImpacts: [
          { productId: "prod-wahoo-trackr", impact: "Rechargeable, no onboard workout memory" },
          { productId: "prod-polar-h10", impact: "Coin cell + one-session memory" },
        ],
        explanation: "Different maintenance and watch-free trade-offs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-wahoo-trackr", reason: "You want a modern rechargeable Wahoo chest strap." },
      { productId: "prod-polar-h10", reason: "You want Polar’s accuracy + memory benchmark." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Wahoo TRACKR vs Polar H10 | Kitletics",
    seoDescription: "Compare Wahoo TRACKR and Polar H10 chest straps.",
    ...pub,
  },
  {
    id: "cmp-coros-verity",
    slug: "coros-hrm-vs-polar-verity-sense",
    title: "COROS Heart Rate Monitor vs Polar Verity Sense",
    shortDescription: "Two leading optical armband HR options for runners.",
    productIds: ["prod-coros-hrm", "prod-polar-verity-sense"],
    categoryId: "cat-hrm",
    comparisonType: "hybrid",
    summary:
      "Both skip the chest strap. COROS emphasises light everyday armband comfort with COROS watches. Verity Sense adds Polar ecosystem tools, swim-friendly mounting options, and onboard memory.",
    verdict:
      "COROS HRM if you already train in COROS and want simple armband comfort. Verity Sense when Polar Flow, swim use, or memory matter.",
    criteria: [
      { key: "type", label: "Type", specKey: "type" },
      { key: "placement", label: "Placement", specKey: "placement" },
      { key: "memory", label: "Internal memory", specKey: "internalMemory" },
      { key: "swim", label: "Swim support", specKey: "swimmingSupport" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-daily-training",
        productId: "prod-coros-hrm",
        rationale: "Simple optical armband for everyday runs without a chest strap.",
      },
      {
        useCaseId: "uc-hyrox-training",
        productId: "prod-polar-verity-sense",
        rationale: "Comfortable optical HR with memory when watches get in the way.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        productImpacts: [
          { productId: "prod-coros-hrm", impact: "COROS-first pairing simplicity" },
          { productId: "prod-polar-verity-sense", impact: "Polar Flow + swim/memory options" },
        ],
        explanation: "Same optical armband job — different software homes.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-coros-hrm", reason: "You want a light COROS armband HRM." },
      { productId: "prod-polar-verity-sense", reason: "You want Polar optical with swim/memory flexibility." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "COROS HRM vs Polar Verity Sense | Kitletics",
    seoDescription: "Compare COROS and Polar optical armband heart rate monitors.",
    ...pub,
  },
  {
    id: "cmp-hrm600-proplus",
    slug: "garmin-hrm-600-vs-hrm-pro-plus",
    title: "Garmin HRM 600 vs HRM-Pro Plus",
    shortDescription: "Current Garmin dynamics strap vs previous-generation Pro Plus.",
    productIds: ["prod-hrm-600", "prod-hrm-pro-plus"],
    categoryId: "cat-hrm",
    comparisonType: "hybrid",
    summary:
      "HRM 600 adds rechargeable power, detachable module convenience, and standalone activity recording on top of the dynamics story. Pro Plus remains a strong clearance dynamics strap with long coin-cell life.",
    verdict:
      "Buy HRM 600 for the current Garmin feature set. Buy Pro Plus when discounted dynamics matter more than rechargeable/standalone extras.",
    criteria: [
      { key: "dynamics", label: "Running dynamics", specKey: "runningDynamics" },
      { key: "standalone", label: "Standalone recording", specKey: "standaloneRecording" },
      { key: "battery", label: "Battery type", specKey: "batteryType" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-advanced",
        productId: "prod-hrm-600",
        rationale: "Current Garmin strap with the fullest dynamics + recording toolkit.",
      },
      {
        useCaseId: "uc-intervals",
        productId: "prod-hrm-pro-plus",
        rationale: "Still excellent ECG + dynamics when priced as previous-gen.",
      },
    ],
    keyDifferences: [
      {
        key: "generation",
        label: "Generation",
        productImpacts: [
          { productId: "prod-hrm-600", impact: "Current — rechargeable + standalone" },
          { productId: "prod-hrm-pro-plus", impact: "Previous-gen — coin cell dynamics" },
        ],
        explanation: "Same family job with different battery and recording extras.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-hrm-600", reason: "You want the current Garmin HRM flagship." },
      { productId: "prod-hrm-pro-plus", reason: "You want dynamics value on clearance." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Garmin HRM 600 vs HRM-Pro Plus | Kitletics",
    seoDescription: "Compare Garmin HRM 600 and HRM-Pro Plus generation options.",
    ...pub,
  },

  {
    id: "cmp-advskin12-advskin5",
    slug: "salomon-adv-skin-12-vs-salomon-adv-skin-5",
    title: "Salomon ADV Skin 12 vs ADV Skin 5",
    shortDescription: "Same race harness family — ultra volume versus lighter race carry.",
    productIds: ["prod-adv-skin-12", "prod-salomon-adv-skin-5"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "ADV Skin 12 and ADV Skin 5 share Salomon race-vest fit. The 12 prioritises ultra/trail kit volume; the 5 stays lighter for race and long-run days that do not need 12L.",
    verdict:
      "Choose ADV Skin 12 for ultra/mandatory-kit days; choose ADV Skin 5 when you want the same race fit with less bulk.",
    winnerProductId: undefined,
    winnerReason: "Context-dependent — capacity need decides, not a universal winner.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity", winnerProductId: "prod-adv-skin-12" },
      { key: "weight", label: "Weight", specKey: "weight", winnerProductId: "prod-salomon-adv-skin-5" },
      { key: "reservoir", label: "Reservoir option", specKey: "reservoirCompatible", winnerProductId: "prod-adv-skin-12" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-ultra", productId: "prod-adv-skin-12", rationale: "More kit volume for ultra days." },
      { useCaseId: "uc-trail-training", productId: "prod-adv-skin-12", rationale: "Extra storage for layers and poles." },
      { useCaseId: "uc-marathon", productId: "prod-salomon-adv-skin-5", rationale: "Lighter race carry when kit lists stay small." },
      { useCaseId: "uc-long-runs", productId: "prod-salomon-adv-skin-5", rationale: "Enough flasks without 12L bulk." },
    ],
    keyDifferences: [
      {
        key: "capacity",
        label: "Capacity",
        productImpacts: [
          { productId: "prod-adv-skin-12", impact: "12 L listed" },
          { productId: "prod-salomon-adv-skin-5", impact: "5 L listed" },
        ],
        explanation: "From structured capacity specs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-adv-skin-12", reason: "You need ultra/trail kit volume." },
      { productId: "prod-salomon-adv-skin-5", reason: "You want lighter Salomon race-vest carry." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Salomon ADV Skin 12 vs ADV Skin 5 | Kitletics",
    seoDescription: "Compare ADV Skin 12 and ADV Skin 5 on capacity, weight and race use.",
    ...pub,
  },
  {
    id: "cmp-advskin12-udrace6",
    slug: "salomon-adv-skin-12-vs-ultimate-direction-race-vest-6",
    title: "Salomon ADV Skin 12 vs UD Race Vest 6",
    shortDescription: "Ultra-capable Salomon vest versus UD race-vest layout.",
    productIds: ["prod-adv-skin-12", "prod-ud-race-vest-6"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "ADV Skin 12 is the higher-capacity Salomon ultra/trail vest. UD Race Vest 6 is a lighter race-oriented alternative with flask-first front storage.",
    verdict:
      "ADV Skin 12 for bigger trail/ultra kit days; Race Vest 6 when you want a lighter UD race layout.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity", winnerProductId: "prod-adv-skin-12" },
      { key: "weight", label: "Weight", specKey: "weight", winnerProductId: "prod-ud-race-vest-6" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-ultra", productId: "prod-adv-skin-12", rationale: "Higher capacity for ultra kit." },
      { useCaseId: "uc-trail-training", productId: "prod-adv-skin-12", rationale: "More storage on long trail days." },
      { useCaseId: "uc-marathon", productId: "prod-ud-race-vest-6", rationale: "Lighter race-vest orientation." },
    ],
    keyDifferences: [
      {
        key: "capacity",
        label: "Capacity",
        productImpacts: [
          { productId: "prod-adv-skin-12", impact: "12 L class" },
          { productId: "prod-ud-race-vest-6", impact: "6 L race-vest class" },
        ],
        explanation: "From structured capacity where published.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-adv-skin-12", reason: "You need larger ultra/trail capacity." },
      { productId: "prod-ud-race-vest-6", reason: "You prefer a lighter UD race vest." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Salomon ADV Skin 12 vs UD Race Vest 6 | Kitletics",
    seoDescription: "Compare ADV Skin 12 and Ultimate Direction Race Vest 6 for trail and race carry.",
    ...pub,
  },
  {
    id: "cmp-vaporair4-advskin5",
    slug: "nathan-vaporair-4-vs-salomon-adv-skin-5",
    title: "Nathan VaporAir 4 vs Salomon ADV Skin 5",
    shortDescription: "Two light race vests for long runs and trail days.",
    productIds: ["prod-nathan-vaporair-4", "prod-salomon-adv-skin-5"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Both target lighter race-vest carry. ADV Skin 5 emphasises Salomon Sensifit stability; VaporAir 4 is Nathan’s updated light race vest alternative.",
    verdict:
      "Pick ADV Skin 5 for Salomon race fit and twin-flask layout; pick VaporAir 4 when you prefer Nathan’s lighter race-vest approach.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-salomon-adv-skin-5", rationale: "Stable Salomon trail race fit." },
      { useCaseId: "uc-marathon", productId: "prod-nathan-vaporair-4", rationale: "Light race-vest marathon carry." },
      { useCaseId: "uc-long-runs", productId: "prod-nathan-vaporair-4", rationale: "Low-bulk long-run vest." },
    ],
    keyDifferences: [
      {
        key: "fit-system",
        label: "Fit system",
        productImpacts: [
          { productId: "prod-salomon-adv-skin-5", impact: "Salomon Sensifit race harness" },
          { productId: "prod-nathan-vaporair-4", impact: "Nathan light race-vest fit" },
        ],
        explanation: "Fit systems differ by brand — try both if possible.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-salomon-adv-skin-5", reason: "You want Salomon race-vest fit." },
      { productId: "prod-nathan-vaporair-4", reason: "You want Nathan’s lighter race vest." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nathan VaporAir 4 vs Salomon ADV Skin 5 | Kitletics",
    seoDescription: "Compare two light race vests for marathon and trail carry.",
    ...pub,
  },
  {
    id: "cmp-duro6-dyna6",
    slug: "osprey-duro-6-vs-osprey-dyna-6",
    title: "Osprey Duro 6 vs Dyna 6",
    shortDescription: "Men’s and women’s Osprey trail pack counterparts.",
    productIds: ["prod-osprey-duro-6", "prod-osprey-dyna-6"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Duro 6 and Dyna 6 are fit counterparts in Osprey’s trail running pack line — similar capacity and role, different gender fit patterning.",
    verdict:
      "Choose by fit: Duro 6 for men’s sizing, Dyna 6 for women’s. Capacity and trail role are closely matched.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "fit", label: "Fit", specKey: "genderFit", winnerProductId: undefined },
      { key: "reservoir", label: "Reservoir", specKey: "reservoirCompatible" },
      { key: "weight", label: "Weight", specKey: "weight" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-osprey-duro-6", rationale: "Men's trail pack fit — pick Dyna 6 for women's fit." },
      { useCaseId: "uc-long-runs", productId: "prod-osprey-dyna-6", rationale: "Women's long-run pack days — pick Duro 6 for men's fit." },
      { useCaseId: "uc-ultra", productId: "prod-osprey-duro-6", rationale: "Either fit counterpart works; choose by gender fit." },
    ],
    keyDifferences: [
      {
        key: "gender-fit",
        label: "Gender fit",
        productImpacts: [
          { productId: "prod-osprey-duro-6", impact: "Men’s fit" },
          { productId: "prod-osprey-dyna-6", impact: "Women’s fit" },
        ],
        explanation: "Primary difference is gendered fit patterning, not capacity class.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-osprey-duro-6", reason: "You need men’s Osprey trail pack fit." },
      { productId: "prod-osprey-dyna-6", reason: "You need women’s Osprey trail pack fit." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Osprey Duro 6 vs Dyna 6 | Kitletics",
    seoDescription: "Compare Osprey Duro 6 and Dyna 6 — men’s vs women’s trail pack fit.",
    ...pub,
  },
  {
    id: "cmp-durolt-racevest6",
    slug: "osprey-duro-lt-vs-ultimate-direction-race-vest-6",
    title: "Osprey Duro LT vs UD Race Vest 6",
    shortDescription: "Two light race-vest options for road and trail.",
    productIds: ["prod-osprey-duro-lt", "prod-ud-race-vest-6"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Duro LT is Osprey’s minimal men’s race vest. UD Race Vest 6 is a flask-first race vest with a bit more trail/race storage orientation.",
    verdict:
      "Duro LT for minimal road-race carry; Race Vest 6 when you want a more complete light race-vest pocket layout.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity", winnerProductId: "prod-ud-race-vest-6" },
      { key: "weight", label: "Weight", specKey: "weight", winnerProductId: "prod-osprey-duro-lt" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
      { key: "flasks", label: "Flask access", specKey: "flaskCount" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-marathon", productId: "prod-osprey-duro-lt", rationale: "Minimal marathon vest carry." },
      { useCaseId: "uc-half", productId: "prod-osprey-duro-lt", rationale: "Low bulk for shorter races." },
      { useCaseId: "uc-trail-training", productId: "prod-ud-race-vest-6", rationale: "More race-vest storage for trail." },
    ],
    keyDifferences: [
      {
        key: "capacity",
        label: "Capacity",
        productImpacts: [
          { productId: "prod-osprey-duro-lt", impact: "Minimal LT race-vest volume" },
          { productId: "prod-ud-race-vest-6", impact: "6 L race-vest class" },
        ],
        explanation: "From structured capacity classes.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-osprey-duro-lt", reason: "You want the lightest Osprey race vest." },
      { productId: "prod-ud-race-vest-6", reason: "You want more UD race-vest storage." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Osprey Duro LT vs UD Race Vest 6 | Kitletics",
    seoDescription: "Compare light race vests for marathon and trail training.",
    ...pub,
  },
  {
    id: "cmp-flipbelt-naked",
    slug: "flipbelt-classic-vs-naked-running-band",
    title: "FlipBelt Classic vs Naked Running Band",
    shortDescription: "Two minimal bounce-free waist carry options.",
    productIds: ["prod-flipbelt-classic", "prod-naked-running-band"],
    categoryId: "cat-running-belts",
    comparisonType: "hybrid",
    summary:
      "Both target phone-first minimal carry with low bounce. FlipBelt is the stretch-waist staple; Naked Running Band is a competing bounce-free band approach.",
    verdict:
      "No universal winner — pick by fit preference. Both beat structured pouches when bounce control for phone/gels matters most.",
    criteria: [
      { key: "phone", label: "Phone carry", specKey: "phoneStorage" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-flipbelt-classic", rationale: "Everyday phone-first belt." },
      { useCaseId: "uc-half", productId: "prod-naked-running-band", rationale: "Bounce-free race essentials." },
      { useCaseId: "uc-10k", productId: "prod-flipbelt-classic", rationale: "Minimal short-race carry." },
    ],
    keyDifferences: [
      {
        key: "fit-feel",
        label: "Fit feel",
        productImpacts: [
          { productId: "prod-flipbelt-classic", impact: "Classic FlipBelt stretch tube" },
          { productId: "prod-naked-running-band", impact: "Naked stretch-band fit" },
        ],
        explanation: "Fit preference is personal — bounce goals are similar.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-flipbelt-classic", reason: "You want the proven FlipBelt stretch carry." },
      { productId: "prod-naked-running-band", reason: "You prefer Naked band fit." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "FlipBelt Classic vs Naked Running Band | Kitletics",
    seoDescription: "Compare minimal running belts for phone and race essentials.",
    ...pub,
  },
  {
    id: "cmp-softflask-speed-skyflask",
    slug: "hydrapak-softflask-speed-500-vs-hydrapak-skyflask-speed-500",
    title: "HydraPak SoftFlask Speed vs SkyFlask Speed",
    shortDescription: "Vest soft flask versus handheld Speed flask.",
    productIds: ["prod-hydrapak-softflask-speed-500", "prod-hydrapak-skyflask-speed-500"],
    categoryId: "cat-hydration",
    comparisonType: "editorial",
    summary:
      "Same Speed valve family, different carry modes. SoftFlask Speed belongs in vest/belt pockets; SkyFlask Speed is the handheld soft-flask option.",
    verdict:
      "SoftFlask Speed for vest days; SkyFlask Speed when you want handheld hydration without a pack.",
    criteria: [
      { key: "access", label: "Flask access" },
      { key: "carry", label: "Carry mode" },
      { key: "volume", label: "Volume", specKey: "capacity" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-hydrapak-softflask-speed-500", rationale: "Vest pocket flask for trail." },
      { useCaseId: "uc-ultra", productId: "prod-hydrapak-softflask-speed-500", rationale: "Standard soft-flask vest refill." },
      { useCaseId: "uc-half", productId: "prod-hydrapak-skyflask-speed-500", rationale: "Handheld for simpler road races." },
      { useCaseId: "uc-long-runs", productId: "prod-hydrapak-skyflask-speed-500", rationale: "Handheld long-run option." },
    ],
    keyDifferences: [
      {
        key: "carry-mode",
        label: "Carry mode",
        productImpacts: [
          { productId: "prod-hydrapak-softflask-speed-500", impact: "Vest/belt soft flask" },
          { productId: "prod-hydrapak-skyflask-speed-500", impact: "Handheld soft flask" },
        ],
        explanation: "Same valve family; different intended carry.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-hydrapak-softflask-speed-500", reason: "You run with a vest or belt pocket." },
      { productId: "prod-hydrapak-skyflask-speed-500", reason: "You want handheld soft-flask carry." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "HydraPak SoftFlask Speed vs SkyFlask Speed | Kitletics",
    seoDescription: "Compare vest soft flask vs handheld SkyFlask Speed.",
    ...pub,
  },
  {
    id: "cmp-peak-udracebelt",
    slug: "nathan-peak-vs-ultimate-direction-race-belt",
    title: "Nathan Peak vs UD Race Belt",
    shortDescription: "Hydration waist pack versus race-day belt.",
    productIds: ["prod-nathan-peak", "prod-ud-race-belt"],
    categoryId: "cat-running-belts",
    comparisonType: "hybrid",
    summary:
      "Peak is a hydration-oriented waist pack for longer road efforts. UD Race Belt is a lighter race-belt layout for gels and smaller flasks.",
    verdict:
      "Peak when you need real bottle volume on the waist; Race Belt when race-day essentials stay smaller.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity", winnerProductId: "prod-nathan-peak" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl", winnerProductId: "prod-ud-race-belt" },
      { key: "race", label: "Race use" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-long-runs", productId: "prod-nathan-peak", rationale: "More waist hydration volume." },
      { useCaseId: "uc-marathon", productId: "prod-ud-race-belt", rationale: "Lighter race-belt essentials." },
      { useCaseId: "uc-half", productId: "prod-ud-race-belt", rationale: "Minimal race waist carry." },
    ],
    keyDifferences: [
      {
        key: "capacity",
        label: "Capacity",
        productImpacts: [
          { productId: "prod-nathan-peak", impact: "Waist-pack hydration volume" },
          { productId: "prod-ud-race-belt", impact: "Race-belt essentials scale" },
        ],
        explanation: "Peak carries more water; Race Belt stays race-minimal.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-nathan-peak", reason: "You need bottle-scale waist hydration." },
      { productId: "prod-ud-race-belt", reason: "You want a lighter race belt." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nathan Peak vs UD Race Belt | Kitletics",
    seoDescription: "Compare hydration waist pack vs race belt for long runs.",
    ...pub,
  },
  {
    id: "cmp-zephyrpro-apexpro",
    slug: "camelbak-zephyr-pro-vs-camelbak-apex-pro",
    title: "CamelBak Zephyr Pro vs Apex Pro",
    shortDescription: "Two premium CamelBak run vests with different orientations.",
    productIds: ["prod-camelbak-zephyr-pro", "prod-camelbak-apex-pro"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Zephyr Pro leans reservoir-led trail capacity. Apex Pro is CamelBak’s higher-spec run vest alternative with a more mixed flask/reservoir story.",
    verdict:
      "Zephyr Pro for reservoir-first trail/ultra days; Apex Pro when you want CamelBak’s broader premium run-vest feature set.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "reservoir", label: "Reservoir", specKey: "reservoirCompatible" },
      { key: "flasks", label: "Flask access", specKey: "flaskCount" },
      { key: "race", label: "Race suitability", specKey: "raceSuitability" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-ultra", productId: "prod-camelbak-zephyr-pro", rationale: "Reservoir-led ultra volume." },
      { useCaseId: "uc-trail-training", productId: "prod-camelbak-zephyr-pro", rationale: "Trail capacity with bladder option." },
      { useCaseId: "uc-long-runs", productId: "prod-camelbak-apex-pro", rationale: "Premium mixed-carry long runs." },
    ],
    keyDifferences: [
      {
        key: "orientation",
        label: "Carry orientation",
        productImpacts: [
          { productId: "prod-camelbak-zephyr-pro", impact: "Reservoir-first trail vest" },
          { productId: "prod-camelbak-apex-pro", impact: "Premium mixed flask/reservoir vest" },
        ],
        explanation: "Both premium CamelBak; orientation differs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-camelbak-zephyr-pro", reason: "You prefer reservoir-led trail carry." },
      { productId: "prod-camelbak-apex-pro", reason: "You want Apex Pro’s premium run-vest setup." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "CamelBak Zephyr Pro vs Apex Pro | Kitletics",
    seoDescription: "Compare CamelBak Zephyr Pro and Apex Pro run vests.",
    ...pub,
  },


  {
    id: "cmp-session-multi",
    slug: "tracksmith-session-short-vs-janji-multi-short",
    title: "Tracksmith Session Short vs Janji Multi Short",
    shortDescription:
      "Premium men's Session short versus storage-first Multi 2-in-1 for daily training.",
    productIds: ["prod-tracksmith-session-short-men", "prod-janji-multi-short-men"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Session is a cleaner premium training short with Tracksmith cut and materials. Multi is a 2-in-1 with more storage for long runs and commute-to-run days. Both are men's genderFit SKUs.",
    verdict:
      "Session when you want a refined daily short and will carry a belt or nothing; Multi when pockets and a liner matter more than brand polish.",
    criteria: [
      { key: "fit", label: "Fit", specKey: "fit", winnerProductId: "prod-tracksmith-session-short-men" },
      { key: "storage", label: "Storage", specKey: "phonePocket", winnerProductId: "prod-janji-multi-short-men" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "value", label: "Value", winnerProductId: "prod-janji-multi-short-men" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-tracksmith-session-short-men", rationale: "Cleaner daily training short when storage is secondary." },
      { useCaseId: "uc-long-runs", productId: "prod-janji-multi-short-men", rationale: "2-in-1 storage for gels/phone on longer efforts." },
      { useCaseId: "uc-half", productId: "prod-janji-multi-short-men", rationale: "Race-day pocketing without a belt." },
      { useCaseId: "uc-intermediate", productId: "prod-tracksmith-session-short-men", rationale: "Premium rotation short for mixed training weeks." },
    ],
    keyDifferences: [
      {
        key: "storage",
        label: "Storage vs cut",
        productImpacts: [
          { productId: "prod-tracksmith-session-short-men", impact: "Minimalist premium short cut" },
          { productId: "prod-janji-multi-short-men", impact: "2-in-1 liner + pocket volume" },
        ],
        explanation: "Choose on whether pockets or clean aesthetics matter more.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-tracksmith-session-short-men", reason: "You want a men's premium Session short and travel light." },
      { productId: "prod-janji-multi-short-men", reason: "You need men's 2-in-1 storage for longs and halfs." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Tracksmith Session vs Janji Multi Short | Kitletics",
    seoDescription: "Compare Session and Multi men's running shorts on fit, storage and value.",
    ...pub,
  },
  {
    id: "cmp-strider-fuel",
    slug: "patagonia-strider-pro-vs-rabbit-fuel-n-fly",
    title: "Patagonia Strider Pro vs Rabbit Fuel n' Fly",
    shortDescription:
      "Patagonia Strider Pro versus Rabbit Fuel n' Fly — pocketed men's training shorts.",
    productIds: ["prod-patagonia-strider-pro-men", "prod-rabbit-fuel-n-fly-men"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Strider Pro balances trail/road training with Patagonia durability and pocket layout. Fuel n' Fly is built around gel and phone storage for long road and marathon efforts. Both men's genderFit.",
    verdict:
      "Strider Pro for mixed road/trail weeks; Fuel n' Fly when long-run fuel storage is the primary job.",
    criteria: [
      { key: "storage", label: "Storage", specKey: "phonePocket", winnerProductId: "prod-rabbit-fuel-n-fly-men" },
      { key: "versatility", label: "Versatility", winnerProductId: "prod-patagonia-strider-pro-men" },
      { key: "anti-chafe", label: "Anti-chafe", specKey: "antiChafe" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-patagonia-strider-pro-men", rationale: "Better mixed trail/road short." },
      { useCaseId: "uc-long-runs", productId: "prod-rabbit-fuel-n-fly-men", rationale: "Fuel-first pocket layout for longs." },
      { useCaseId: "uc-marathon", productId: "prod-rabbit-fuel-n-fly-men", rationale: "Gel/phone storage without a belt." },
      { useCaseId: "uc-daily-training", productId: "prod-patagonia-strider-pro-men", rationale: "More versatile daily training short." },
    ],
    keyDifferences: [
      {
        key: "job",
        label: "Primary job",
        productImpacts: [
          { productId: "prod-patagonia-strider-pro-men", impact: "Durable mixed-surface training short" },
          { productId: "prod-rabbit-fuel-n-fly-men", impact: "Long-run fuel storage short" },
        ],
        explanation: "Both pocketed; Fuel n' Fly specialises harder in carry.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-patagonia-strider-pro-men", reason: "You want one men's short for road and trail weeks." },
      { productId: "prod-rabbit-fuel-n-fly-men", reason: "You load gels/phone in the short for longs/marathon." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Strider Pro vs Rabbit Fuel n' Fly | Kitletics",
    seoDescription: "Compare Patagonia Strider Pro and Rabbit Fuel n' Fly men's shorts.",
    ...pub,
  },
  {
    id: "cmp-hotty-pace",
    slug: "lululemon-hotty-hot-vs-janji-pace-short",
    title: "lululemon Hotty Hot vs Janji Pace Short",
    shortDescription:
      "Women's Hotty Hot high-rise short versus Janji Pace training short.",
    productIds: ["prod-lululemon-hotty-hot-women", "prod-janji-pace-short-women"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Hotty Hot is a popular women's high-rise short with lifestyle crossover appeal. Pace is a more training-oriented women's short with Janji pocketing and run-first construction.",
    verdict:
      "Hotty Hot when fit/feel and brand ecosystem matter most; Pace when you want a women's training short with clearer run-pocket utility.",
    criteria: [
      { key: "fit", label: "Fit", specKey: "fit", winnerProductId: "prod-lululemon-hotty-hot-women" },
      { key: "storage", label: "Storage", specKey: "pockets", winnerProductId: "prod-janji-pace-short-women" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "value", label: "Value", winnerProductId: "prod-janji-pace-short-women" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-lululemon-hotty-hot-women", rationale: "High-rise daily short many women already live in." },
      { useCaseId: "uc-long-runs", productId: "prod-janji-pace-short-women", rationale: "Better training pocket story for longs." },
      { useCaseId: "uc-10k", productId: "prod-lululemon-hotty-hot-women", rationale: "Light race/training short if storage is minimal." },
      { useCaseId: "uc-half", productId: "prod-janji-pace-short-women", rationale: "Women's Pace short for half-distance carry needs." },
    ],
    keyDifferences: [
      {
        key: "orientation",
        label: "Lifestyle vs training",
        productImpacts: [
          { productId: "prod-lululemon-hotty-hot-women", impact: "High-rise lifestyle/run crossover short" },
          { productId: "prod-janji-pace-short-women", impact: "Training-pocket run short" },
        ],
        explanation: "Same women's short category; different priorities.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-lululemon-hotty-hot-women", reason: "You want the women's Hotty Hot fit and brand ecosystem." },
      { productId: "prod-janji-pace-short-women", reason: "You want a women's training short with pocket utility." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Hotty Hot vs Janji Pace Short | Kitletics",
    seoDescription: "Compare lululemon Hotty Hot and Janji Pace women's running shorts.",
    ...pub,
  },
  {
    id: "cmp-houdini-canopy",
    slug: "patagonia-houdini-vs-brooks-canopy",
    title: "Patagonia Houdini vs Brooks Canopy Jacket",
    shortDescription:
      "Ultra-packable Houdini wind shell versus Brooks Canopy running jacket.",
    productIds: ["prod-patagonia-houdini-men", "prod-brooks-canopy-jacket-unisex"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Houdini is the classic packable wind shell for trail, ultra and race kits. Canopy is a more run-jacket oriented Brooks piece with everyday training weather coverage. Houdini is men's genderFit; Canopy is unisex-listed in catalog.",
    verdict:
      "Houdini when packability and emergency wind coverage win; Canopy when you want a more everyday training jacket feel.",
    criteria: [
      { key: "packability", label: "Packability", specKey: "packability", winnerProductId: "prod-patagonia-houdini-men" },
      { key: "weather", label: "Weather protection", specKey: "waterResistance" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "versatility", label: "Versatility" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-patagonia-houdini-men", rationale: "Packable trail/ultra wind layer." },
      { useCaseId: "uc-long-runs", productId: "prod-brooks-canopy-jacket-unisex", rationale: "More everyday long-run jacket." },
      { useCaseId: "uc-marathon", productId: "prod-patagonia-houdini-men", rationale: "Race-kit stow shell." },
      { useCaseId: "uc-daily-training", productId: "prod-brooks-canopy-jacket-unisex", rationale: "Daily cool-weather training jacket." },
    ],
    keyDifferences: [
      {
        key: "pack",
        label: "Packability",
        productImpacts: [
          { productId: "prod-patagonia-houdini-men", impact: "Ultra-packable emergency wind shell" },
          { productId: "prod-brooks-canopy-jacket-unisex", impact: "Run jacket for regular cool sessions" },
        ],
        explanation: "Houdini wins stow size; Canopy wins daily wearability.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-patagonia-houdini-men", reason: "You need a men's packable shell for trail/race kits." },
      { productId: "prod-brooks-canopy-jacket-unisex", reason: "You want a training jacket you actually start runs in." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Patagonia Houdini vs Brooks Canopy | Kitletics",
    seoDescription: "Compare Houdini and Canopy running jackets on packability and weather use.",
    ...pub,
  },
  {
    id: "cmp-bonatti-rainrunner",
    slug: "salomon-bonatti-vs-janji-rainrunner",
    title: "Salomon Bonatti WP vs Janji Rainrunner",
    shortDescription:
      "Salomon Bonatti waterproof jacket versus Janji Rainrunner for wet running.",
    productIds: ["prod-salomon-bonatti-wp-men", "prod-janji-rainrunner-unisex"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Bonatti is Salomon's trail/ultra waterproof run shell with strong race-kit credentials. Rainrunner is Janji's waterproof alternative with a more road/training rain focus. Comparison uses the men's Bonatti SKU vs Rainrunner.",
    verdict:
      "Bonatti for serious wet trail/ultra and mandatory kit; Rainrunner when you want waterproof coverage with Janji's training-oriented packaging and often stronger value.",
    criteria: [
      { key: "weather", label: "Weather protection", specKey: "waterResistance", winnerProductId: "prod-salomon-bonatti-wp-men" },
      { key: "packability", label: "Packability", specKey: "packability" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "value", label: "Value", winnerProductId: "prod-janji-rainrunner-unisex" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-trail-training", productId: "prod-salomon-bonatti-wp-men", rationale: "Trail/ultra waterproof staple." },
      { useCaseId: "uc-long-runs", productId: "prod-janji-rainrunner-unisex", rationale: "Road long-run rain coverage." },
      { useCaseId: "uc-marathon", productId: "prod-salomon-bonatti-wp-men", rationale: "Race-kit waterproof shell." },
      { useCaseId: "uc-daily-training", productId: "prod-janji-rainrunner-unisex", rationale: "Everyday wet training jacket." },
    ],
    keyDifferences: [
      {
        key: "use",
        label: "Trail kit vs training rain",
        productImpacts: [
          { productId: "prod-salomon-bonatti-wp-men", impact: "Trail/ultra waterproof race shell" },
          { productId: "prod-janji-rainrunner-unisex", impact: "Training-oriented waterproof jacket" },
        ],
        explanation: "Both waterproof; Bonatti leans trail/race kit, Rainrunner leans wet training.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-salomon-bonatti-wp-men", reason: "You need a men's Bonatti for wet trail/ultra kit." },
      { productId: "prod-janji-rainrunner-unisex", reason: "You want a waterproof training jacket with strong value." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Salomon Bonatti vs Janji Rainrunner | Kitletics",
    seoDescription: "Compare Bonatti WP and Rainrunner waterproof running jackets.",
    ...pub,
  },
  {
    id: "cmp-twilight-fast",
    slug: "tracksmith-twilight-half-vs-nike-fast-tight",
    title: "Tracksmith Twilight Half vs Nike Fast Tight",
    shortDescription:
      "Tracksmith Twilight half tights versus Nike Fast full tights for men.",
    productIds: ["prod-tracksmith-twilight-half-men", "prod-nike-fast-tight-men"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Twilight Half is a premium men's half-tight for cool training and racing. Nike Fast is a more accessible full tight for tempo, race and cooler daily miles. Both men's genderFit.",
    verdict:
      "Twilight when you prefer half-tight coverage and Tracksmith finish; Fast when you want full-leg coverage and broader Nike availability/value.",
    criteria: [
      { key: "fit", label: "Fit", specKey: "fit" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "versatility", label: "Versatility", winnerProductId: "prod-nike-fast-tight-men" },
      { key: "value", label: "Value", winnerProductId: "prod-nike-fast-tight-men" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-5k", productId: "prod-tracksmith-twilight-half-men", rationale: "Half-tight race feel for shorter efforts." },
      { useCaseId: "uc-10k", productId: "prod-tracksmith-twilight-half-men", rationale: "Premium half-tight for 10K racing." },
      { useCaseId: "uc-half", productId: "prod-nike-fast-tight-men", rationale: "Full coverage for longer cool races." },
      { useCaseId: "uc-daily-training", productId: "prod-nike-fast-tight-men", rationale: "More versatile cooler daily tight." },
    ],
    keyDifferences: [
      {
        key: "coverage",
        label: "Coverage",
        productImpacts: [
          { productId: "prod-tracksmith-twilight-half-men", impact: "Half-tight coverage" },
          { productId: "prod-nike-fast-tight-men", impact: "Full-leg tight coverage" },
        ],
        explanation: "Coverage length and brand positioning differ more than category.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-tracksmith-twilight-half-men", reason: "You want men's half-tights for cool races/workouts." },
      { productId: "prod-nike-fast-tight-men", reason: "You want men's full tights with better value/availability." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Twilight Half vs Nike Fast Tight | Kitletics",
    seoDescription: "Compare Tracksmith Twilight Half and Nike Fast men's running tights.",
    ...pub,
  },
  {
    id: "cmp-miler-capilene",
    slug: "nike-miler-vs-patagonia-capilene-cool",
    title: "Nike Miler vs Patagonia Capilene Cool Daily",
    shortDescription:
      "Nike Dri-FIT Miler tee versus Patagonia Capilene Cool Daily for hot training.",
    productIds: ["prod-nike-dri-fit-miler-men", "prod-patagonia-capilene-cool-daily-men"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Miler is Nike's high-volume breathable training tee. Capilene Cool Daily is Patagonia's recycled-poly cool shirt with broader outdoor/run crossover. Comparison uses men's SKUs; women's Miler exists separately.",
    verdict:
      "Miler for cheap, easy Nike rotation volume; Capilene Cool when you want Patagonia fabric story and trail/road daily versatility.",
    criteria: [
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "versatility", label: "Versatility", winnerProductId: "prod-patagonia-capilene-cool-daily-men" },
      { key: "value", label: "Value", winnerProductId: "prod-nike-dri-fit-miler-men" },
      { key: "comfort", label: "Comfort" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-nike-dri-fit-miler-men", rationale: "Affordable daily tee rotation." },
      { useCaseId: "uc-trail-training", productId: "prod-patagonia-capilene-cool-daily-men", rationale: "Better trail/outdoor crossover tee." },
      { useCaseId: "uc-5k", productId: "prod-nike-dri-fit-miler-men", rationale: "Light race/training tee." },
      { useCaseId: "uc-long-runs", productId: "prod-patagonia-capilene-cool-daily-men", rationale: "Comfortable long easy-day shirt." },
    ],
    keyDifferences: [
      {
        key: "positioning",
        label: "Volume tee vs Capilene Cool",
        productImpacts: [
          { productId: "prod-nike-dri-fit-miler-men", impact: "High-volume Nike training tee" },
          { productId: "prod-patagonia-capilene-cool-daily-men", impact: "Capilene Cool daily outdoor/run shirt" },
        ],
        explanation: "Both hot-weather tees; Capilene Cool leans durability/versatility, Miler leans value/volume.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-nike-dri-fit-miler-men", reason: "You want inexpensive men's breathable tees to rotate." },
      { productId: "prod-patagonia-capilene-cool-daily-men", reason: "You want Capilene Cool for road and trail days." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nike Miler vs Capilene Cool Daily | Kitletics",
    seoDescription: "Compare Nike Miler and Patagonia Capilene Cool men's running tees.",
    ...pub,
  },
  {
    id: "cmp-dare-energy",
    slug: "brooks-dare-crossback-vs-lululemon-energy-bra",
    title: "Brooks Dare Crossback vs lululemon Energy Bra",
    shortDescription:
      "Brooks Dare Crossback run bra versus lululemon Energy Bra for daily training.",
    productIds: ["prod-brooks-dare-crossback", "prod-lululemon-energy-bra"],
    categoryId: "cat-running-clothing",
    comparisonType: "hybrid",
    summary:
      "Dare Crossback is a run-first Brooks bra with crossback stability for training and racing. Energy Bra is lululemon's versatile medium-support option with strong gym-to-run crossover.",
    verdict:
      "Dare when running impact and sweat sessions are the main job; Energy when you want one bra across run and strength days.",
    criteria: [
      { key: "fit", label: "Fit", specKey: "fit" },
      { key: "anti-chafe", label: "Anti-chafe", specKey: "antiChafe" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "versatility", label: "Versatility", winnerProductId: "prod-lululemon-energy-bra" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-brooks-dare-crossback", rationale: "Run-first daily training bra." },
      { useCaseId: "uc-long-runs", productId: "prod-brooks-dare-crossback", rationale: "Crossback stability for longer efforts." },
      { useCaseId: "uc-10k", productId: "prod-lululemon-energy-bra", rationale: "Versatile medium support for race/training mix." },
      { useCaseId: "uc-beginners", productId: "prod-lululemon-energy-bra", rationale: "Familiar brand ecosystem for new runners." },
    ],
    keyDifferences: [
      {
        key: "focus",
        label: "Run-first vs multi-activity",
        productImpacts: [
          { productId: "prod-brooks-dare-crossback", impact: "Run-oriented crossback support" },
          { productId: "prod-lululemon-energy-bra", impact: "Gym-to-run medium support versatility" },
        ],
        explanation: "Support category overlaps; intended activity mix differs.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-brooks-dare-crossback", reason: "Running is the primary high-impact use." },
      { productId: "prod-lululemon-energy-bra", reason: "You want one bra for run + strength days." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Brooks Dare Crossback vs Energy Bra | Kitletics",
    seoDescription: "Compare Brooks Dare Crossback and lululemon Energy Bra for running.",
    ...pub,
  },
  {
    id: "cmp-feetures-darntough",
    slug: "feetures-elite-vs-darn-tough-run",
    title: "Feetures Elite Light Cushion vs Darn Tough Run",
    shortDescription:
      "Targeted-cushion Feetures versus durable Darn Tough run sock.",
    productIds: ["prod-feetures-elite-light-cushion", "prod-darn-tough-run-1-4"],
    categoryId: "cat-running-socks",
    comparisonType: "hybrid",
    summary:
      "Feetures Elite Light Cushion emphasises targeted cushioning and anatomical fit for road training. Darn Tough Run 1/4 Ultra-Lightweight leans merino durability and warranty confidence.",
    verdict:
      "Feetures when targeted cushion/fit is the priority; Darn Tough when durability and merino next-to-skin feel matter more.",
    criteria: [
      { key: "fit", label: "Fit", winnerProductId: "prod-feetures-elite-light-cushion" },
      { key: "comfort", label: "Comfort" },
      { key: "anti-chafe", label: "Anti-chafe / friction focus" },
      { key: "value", label: "Value", winnerProductId: "prod-darn-tough-run-1-4" },
    ],
    recommendationsByUseCase: [
      { useCaseId: "uc-daily-training", productId: "prod-feetures-elite-light-cushion", rationale: "Targeted cushion daily sock." },
      { useCaseId: "uc-long-runs", productId: "prod-darn-tough-run-1-4", rationale: "Durable merino long-run sock." },
      { useCaseId: "uc-half", productId: "prod-feetures-elite-light-cushion", rationale: "Race/training fit focus for half distance." },
      { useCaseId: "uc-marathon", productId: "prod-darn-tough-run-1-4", rationale: "Durability confidence for marathon volume." },
    ],
    keyDifferences: [
      {
        key: "emphasis",
        label: "Fit targeting vs durability",
        productImpacts: [
          { productId: "prod-feetures-elite-light-cushion", impact: "Targeted cushion anatomical sock" },
          { productId: "prod-darn-tough-run-1-4", impact: "Merino durability-first run sock" },
        ],
        explanation: "Both light run socks; Feetures wins fit targeting, Darn Tough wins durability story.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      { productId: "prod-feetures-elite-light-cushion", reason: "You want targeted cushion and lock-down fit." },
      { productId: "prod-darn-tough-run-1-4", reason: "You want durable merino run socks with warranty confidence." },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Feetures Elite vs Darn Tough Run | Kitletics",
    seoDescription: "Compare Feetures Elite Light Cushion and Darn Tough Run socks.",
    ...pub,
  },

  {
    id: "cmp-fastpack20-advskin12",
    slug: "ultimate-direction-fastpack-20-vs-salomon-adv-skin-12",
    title: "Ultimate Direction Fastpack 20 vs Salomon ADV Skin 12",
    shortDescription:
      "Overnight / big-day fastpack versus race hydration vest.",
    productIds: ["prod-ud-fastpack-20", "prod-adv-skin-12"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Same trail-carry conversation, different jobs. Fastpack 20 is a vest-harness ~23 L pack for overnight kit and big trail days; ADV Skin 12 is a race vest for bounce-free flasks and mandatory race volume.",
    verdict:
      "Choose Fastpack 20 when rear volume for layers, food and overnight kit beats race-vest bounce control. Choose ADV Skin 12 for race days and training where soft-flask front access and low bulk matter more than pack capacity.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "race-kit", label: "Race-kit capacity", specKey: "raceKitCapacity" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-fastpacking",
        productId: "prod-ud-fastpack-20",
        rationale: "Overnight and big-day volume Fastpack wins.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-adv-skin-12",
        rationale: "Race-vest bounce and flask access for ultra race days.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-adv-skin-12",
        rationale: "Most trail training days fit ADV Skin better than a fastpack.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-adv-skin-12",
        rationale: "Long runs rarely need Fastpack rear volume.",
      },
    ],
    keyDifferences: [
      {
        key: "job",
        label: "Overnight pack vs race vest",
        productImpacts: [
          {
            productId: "prod-ud-fastpack-20",
            impact: "~23 L roll-top fastpack with vest harness",
          },
          {
            productId: "prod-adv-skin-12",
            impact: "12 L race vest for flasks and race kit",
          },
        ],
        explanation:
          "Fastpack beats ADV Skin when capacity is the constraint; ADV Skin wins when bounce-free race carry is the constraint.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-ud-fastpack-20",
        reason: "You need overnight or big-day rear volume beyond a race vest.",
      },
      {
        productId: "prod-adv-skin-12",
        reason: "You want a race hydration vest for trail/ultra days.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "UD Fastpack 20 vs Salomon ADV Skin 12 | Kitletics",
    seoDescription:
      "Compare Fastpack 20 and ADV Skin 12 for overnight pack vs race vest jobs.",
    ...pub,
  },
  {
    id: "cmp-fastpack20-talon-velocity-20",
    slug: "ultimate-direction-fastpack-20-vs-osprey-talon-velocity-20",
    title: "Ultimate Direction Fastpack 20 vs Osprey Talon Velocity 20",
    shortDescription: "Two ~20 L class running / fastpacking day packs.",
    productIds: ["prod-ud-fastpack-20", "prod-osprey-talon-velocity-20"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Both target big trail days and light fastpacking. Fastpack 20 leans vest-harness front flask access; Talon Velocity 20 leans Osprey running-pack organization and men’s fit patterning (Tempest Velocity for women).",
    verdict:
      "Pick Fastpack 20 for vest-like front bottles and UD layout; pick Talon Velocity 20 when you prefer Osprey fit and pack organization at similar volume.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "fit", label: "Fit system", specKey: "fitSystem" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-fastpacking",
        productId: "prod-ud-fastpack-20",
        rationale: "Vest-harness Fastpack for overnight-leaning days.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-osprey-talon-velocity-20",
        rationale: "Osprey Velocity organization for big trail training days.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-ud-fastpack-20",
        rationale: "Front flask reach helps long remote ultra training days.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-osprey-talon-velocity-20",
        rationale: "Day-pack Velocity when race-vest volume is not enough.",
      },
    ],
    keyDifferences: [
      {
        key: "layout",
        label: "Vest harness vs Osprey Velocity pack",
        productImpacts: [
          {
            productId: "prod-ud-fastpack-20",
            impact: "UD vest harness with front bottle sleeves",
          },
          {
            productId: "prod-osprey-talon-velocity-20",
            impact: "Osprey Talon Velocity running-pack layout",
          },
        ],
        explanation: "Similar volume class; fit system and pocket philosophy differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-ud-fastpack-20",
        reason: "You want vest-like front flasks with Fastpack rear volume.",
      },
      {
        productId: "prod-osprey-talon-velocity-20",
        reason: "You want Osprey Velocity fit and pack organization.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "UD Fastpack 20 vs Osprey Talon Velocity 20 | Kitletics",
    seoDescription:
      "Compare Fastpack 20 and Talon Velocity 20 for running and fastpacking days.",
    ...pub,
  },
  {
    id: "cmp-distance22-fastpack20",
    slug: "black-diamond-distance-22-vs-ultimate-direction-fastpack-20",
    title: "Black Diamond Distance 22 vs Ultimate Direction Fastpack 20",
    shortDescription: "BD Distance fastpacking volume versus UD Fastpack.",
    productIds: ["prod-black-diamond-distance-22", "prod-ud-fastpack-20"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Both sit above race-vest capacity for big mountain trail days. Distance 22 leans Black Diamond alpine-trail carry; Fastpack 20 leans UD vest-harness front access and roll-top kit changes.",
    verdict:
      "Choose Distance 22 for BD Distance fit and alpine-leaning trail days; choose Fastpack 20 when vest-harness flask reach and UD pocketing matter more.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
      { key: "race-kit", label: "Race-kit capacity", specKey: "raceKitCapacity" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-fastpacking",
        productId: "prod-black-diamond-distance-22",
        rationale: "Higher Distance volume for overnight-leaning mountain days.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-ud-fastpack-20",
        rationale: "Vest-harness Fastpack for most big trail training days.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-ud-fastpack-20",
        rationale: "Front flask access helps remote ultra training.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-ud-fastpack-20",
        rationale: "Fastpack layout suits long trail days without alpine emphasis.",
      },
    ],
    keyDifferences: [
      {
        key: "brand-fit",
        label: "BD Distance vs UD Fastpack layout",
        productImpacts: [
          {
            productId: "prod-black-diamond-distance-22",
            impact: "Black Diamond Distance alpine-trail pack patterning",
          },
          {
            productId: "prod-ud-fastpack-20",
            impact: "UD Fastpack vest harness with roll-top main",
          },
        ],
        explanation: "Both fastpacking-capable; harness and pocket philosophy differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-black-diamond-distance-22",
        reason: "You want BD Distance carry for mountain trail / light fastpacking.",
      },
      {
        productId: "prod-ud-fastpack-20",
        reason: "You want UD vest-harness Fastpack front access and roll-top kit.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "BD Distance 22 vs UD Fastpack 20 | Kitletics",
    seoDescription:
      "Compare Black Diamond Distance 22 and Ultimate Direction Fastpack 20 for fastpacking.",
    ...pub,
  },
  {
    id: "cmp-xa15-duro15",
    slug: "salomon-xa-15-vs-osprey-duro-15",
    title: "Salomon XA 15 vs Osprey Duro 15",
    shortDescription:
      "Mid-capacity trail packs between race vests and full fastpacks.",
    productIds: ["prod-salomon-xa-15", "prod-osprey-duro-15"],
    categoryId: "cat-packs-vests",
    comparisonType: "hybrid",
    summary:
      "Both fill the mid-capacity trail-pack lane above ADV Skin / Duro 6 and below overnight Fastpack volumes. XA 15 is Salomon trail-pack patterning; Duro 15 is Osprey men’s running-pack fit.",
    verdict:
      "Pick XA 15 for Salomon trail-pack layout and peers in the XA / ADV Skin ecosystem; pick Duro 15 when you want Osprey Duro fit with more volume than Duro 6.",
    criteria: [
      { key: "capacity", label: "Capacity", specKey: "capacity" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "fit", label: "Fit system", specKey: "fitSystem" },
      { key: "poles", label: "Pole attachment", specKey: "poleAttachment" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-trail-training",
        productId: "prod-salomon-xa-15",
        rationale: "Salomon XA trail-pack for big training days.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-osprey-duro-15",
        rationale: "Duro 15 volume for longer ultra training days.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-salomon-xa-15",
        rationale: "Mid-capacity XA for long trail efforts.",
      },
      {
        useCaseId: "uc-fastpacking",
        productId: "prod-osprey-duro-15",
        rationale: "Duro 15 edges light fastpacking vs race-vest capacity.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Salomon XA vs Osprey Duro",
        productImpacts: [
          {
            productId: "prod-salomon-xa-15",
            impact: "Salomon XA trail pack; peers with ADV Skin accessories",
          },
          {
            productId: "prod-osprey-duro-15",
            impact: "Osprey Duro men’s running pack at 15 L class",
          },
        ],
        explanation: "Similar mid-capacity job; brand fit and pocket systems differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-salomon-xa-15",
        reason: "You want a Salomon mid-capacity trail pack above ADV Skin.",
      },
      {
        productId: "prod-osprey-duro-15",
        reason: "You want Osprey Duro fit with more volume than Duro 6.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Salomon XA 15 vs Osprey Duro 15 | Kitletics",
    seoDescription:
      "Compare Salomon XA 15 and Osprey Duro 15 mid-capacity trail packs.",
    ...pub,
  },

  // ─── Running accessories wave2 ───────────────────────────────────────────
  {
    id: "cmp-openrun-pro-2-bose-ultra-open",
    slug: "shokz-openrun-pro-2-vs-bose-ultra-open",
    title: "Shokz OpenRun Pro 2 vs Bose Ultra Open",
    shortDescription: "Bone-conduction open vs open-ear clip for outdoor running.",
    productIds: ["prod-shokz-openrun-pro-2", "prod-bose-ultra-open"],
    categoryId: "cat-headphones",
    comparisonType: "hybrid",
    summary:
      "Both keep ears freer than sealed ANC buds. OpenRun Pro 2 is bone-conduction open; Bose Ultra Open is an open-ear clip with a different fit and sound path.",
    verdict:
      "Choose OpenRun Pro 2 when bone-conduction awareness and Shokz sport fit are the priority; choose Bose Ultra Open when you prefer open-clip comfort and Bose tuning over bone conduction.",
    criteria: [
      { key: "design", label: "Design type", specKey: "designType" },
      { key: "awareness", label: "Awareness intent", specKey: "situationalAwareness" },
      { key: "fit", label: "Fit security", specKey: "fit" },
      { key: "water", label: "Water resistance", specKey: "waterResistance" },
      { key: "battery", label: "Battery", specKey: "batteryLife" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-situational-awareness",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "Bone-conduction OpenRun remains the default awareness shortlist.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "OpenRun Pro 2 comfort story for long outdoor miles.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-bose-ultra-open",
        rationale: "Open-clip Bose when you prefer non-bone daily wear.",
      },
      {
        useCaseId: "uc-rain-running",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "Sport bone-conduction lean for wet outdoor sessions.",
      },
    ],
    keyDifferences: [
      {
        key: "design",
        label: "Bone conduction vs open-ear clip",
        productImpacts: [
          {
            productId: "prod-shokz-openrun-pro-2",
            impact: "Bone-conduction open frame",
          },
          {
            productId: "prod-bose-ultra-open",
            impact: "Open-ear clip buds",
          },
        ],
        explanation:
          "Same awareness goal, different transducers and on-ear geometry — pick by fit preference, not a universal winner.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-shokz-openrun-pro-2",
        reason: "You want bone-conduction open running headphones.",
      },
      {
        productId: "prod-bose-ultra-open",
        reason: "You want open-ear clips with Bose fit/sound instead of bone conduction.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Shokz OpenRun Pro 2 vs Bose Ultra Open | Kitletics",
    seoDescription:
      "Compare OpenRun Pro 2 bone conduction and Bose Ultra Open clips for outdoor running.",
    ...pub,
  },
  {
    id: "cmp-openrun-pro-2-airpods-pro-2",
    slug: "shokz-openrun-pro-2-vs-airpods-pro-2",
    title: "Shokz OpenRun Pro 2 vs AirPods Pro 2",
    shortDescription: "Open bone-conduction awareness vs sealed gym/ANC buds.",
    productIds: ["prod-shokz-openrun-pro-2", "prod-airpods-pro-2"],
    categoryId: "cat-headphones",
    comparisonType: "hybrid",
    summary:
      "Different jobs. OpenRun Pro 2 prioritises outdoor awareness; AirPods Pro 2 prioritise sealed ANC for gym, treadmill and carefully managed low-traffic routes.",
    verdict:
      "Choose OpenRun Pro 2 for shared paths and traffic-aware outdoor running; choose AirPods Pro 2 when you already live in Apple sealed ANC and mostly train indoors — not because ANC is safer outdoors.",
    criteria: [
      { key: "design", label: "Design type", specKey: "designType" },
      { key: "anc", label: "ANC / isolation", specKey: "anc" },
      { key: "awareness", label: "Awareness intent", specKey: "situationalAwareness" },
      { key: "ecosystem", label: "Ecosystem", specKey: "ecosystem" },
      { key: "water", label: "Water resistance", specKey: "waterResistance" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-situational-awareness",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "Open bone design wins awareness-first outdoor miles.",
      },
      {
        useCaseId: "uc-gym-training",
        productId: "prod-airpods-pro-2",
        rationale: "Sealed ANC suits gym and treadmill noise.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "Outdoor longs favour open designs on shared routes.",
      },
      {
        useCaseId: "uc-rain-running",
        productId: "prod-shokz-openrun-pro-2",
        rationale: "Sport open design for wet outdoor sessions vs sealed Pro buds.",
      },
    ],
    keyDifferences: [
      {
        key: "job",
        label: "Outdoor awareness vs sealed ANC",
        productImpacts: [
          {
            productId: "prod-shokz-openrun-pro-2",
            impact: "Bone-conduction open for surroundings",
          },
          {
            productId: "prod-airpods-pro-2",
            impact: "Sealed ANC true wireless",
          },
        ],
        explanation:
          "Do not treat ANC as an outdoor safety upgrade — pick by environment and traffic risk.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-shokz-openrun-pro-2",
        reason: "You run outdoors where awareness matters more than isolation.",
      },
      {
        productId: "prod-airpods-pro-2",
        reason: "You want Apple sealed ANC for gym/treadmill or low-traffic routes.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Shokz OpenRun Pro 2 vs AirPods Pro 2 | Kitletics",
    seoDescription:
      "Compare OpenRun Pro 2 and AirPods Pro 2 for outdoor awareness vs gym/ANC use.",
    ...pub,
  },
  {
    id: "cmp-elite-8-active-powerbeats-pro-2",
    slug: "jabra-elite-8-active-vs-beats-powerbeats-pro-2",
    title: "Jabra Elite 8 Active vs Beats Powerbeats Pro 2",
    shortDescription: "Two secure true-wireless sport buds for hard efforts.",
    productIds: ["prod-jabra-elite-8-active", "prod-beats-powerbeats-pro-2"],
    categoryId: "cat-headphones",
    comparisonType: "hybrid",
    summary:
      "Both target stay-put sport TWS. Elite 8 Active leans Jabra waterproof sport buds; Powerbeats Pro 2 leans earhook security in the Apple/Beats lane.",
    verdict:
      "Pick Elite 8 Active for Jabra sport waterproofing and bud fit; pick Powerbeats Pro 2 when hooks and Apple ecosystem pairing matter more.",
    criteria: [
      { key: "fit", label: "Fit security", specKey: "fit" },
      { key: "water", label: "Water resistance", specKey: "waterResistance" },
      { key: "anc", label: "ANC", specKey: "anc" },
      { key: "battery", label: "Battery", specKey: "batteryLife" },
      { key: "ecosystem", label: "Ecosystem", specKey: "ecosystem" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-gym-training",
        productId: "prod-jabra-elite-8-active",
        rationale: "Elite 8 Active sport waterproofing for gym and hard efforts.",
      },
      {
        useCaseId: "uc-rain-running",
        productId: "prod-jabra-elite-8-active",
        rationale: "Jabra Active rating lean for wet sessions.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-beats-powerbeats-pro-2",
        rationale: "Hook fit helps some runners on long sealed-bud days.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-beats-powerbeats-pro-2",
        rationale: "Powerbeats when Apple/Beats daily pairing is the constraint.",
      },
    ],
    keyDifferences: [
      {
        key: "fit",
        label: "Sport bud vs earhook",
        productImpacts: [
          {
            productId: "prod-jabra-elite-8-active",
            impact: "Secure in-ear sport bud",
          },
          {
            productId: "prod-beats-powerbeats-pro-2",
            impact: "Earhook secure TWS",
          },
        ],
        explanation: "Same secure-TWS job; geometry and ecosystem differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-jabra-elite-8-active",
        reason: "You want waterproof-leaning Jabra sport buds without hooks.",
      },
      {
        productId: "prod-beats-powerbeats-pro-2",
        reason: "You want earhooks and Beats/Apple pairing.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Jabra Elite 8 Active vs Powerbeats Pro 2 | Kitletics",
    seoDescription:
      "Compare Elite 8 Active and Powerbeats Pro 2 secure sport true wireless buds.",
    ...pub,
  },
  {
    id: "cmp-encoder-radar-ev-path",
    slug: "oakley-encoder-vs-oakley-radar-ev-path",
    title: "Oakley Encoder vs Oakley Radar EV Path",
    shortDescription: "Shield Encoder versus classic Radar EV Path wraps.",
    productIds: ["prod-oakley-encoder", "prod-oakley-radar-ev-path"],
    categoryId: "cat-sunglasses",
    comparisonType: "hybrid",
    summary:
      "Two Oakley performance frames. Encoder is a bold shield with wide field of view; Radar EV Path is the classic sport wrap with Path lens coverage and a more familiar silhouette.",
    verdict:
      "Choose Encoder for shield coverage and race/road field of view; choose Radar EV Path when you want classic Oakley wrap fit and lens ecosystem familiarity.",
    criteria: [
      { key: "frame", label: "Frame style", specKey: "frameStyle" },
      { key: "coverage", label: "Coverage", specKey: "coverage" },
      { key: "lens", label: "Lens system", specKey: "lensType" },
      { key: "fit", label: "Fit", specKey: "fit" },
      { key: "weight", label: "Weight", specKey: "weight" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-bright-sun",
        productId: "prod-oakley-encoder",
        rationale: "Shield coverage for bright road glare days.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-oakley-encoder",
        rationale: "Wide FOV shield for long bright road races.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-oakley-radar-ev-path",
        rationale: "Classic Radar wrap for everyday road miles.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-oakley-radar-ev-path",
        rationale: "Familiar wrap geometry for mixed trail weeks.",
      },
    ],
    keyDifferences: [
      {
        key: "silhouette",
        label: "Shield vs classic wrap",
        productImpacts: [
          {
            productId: "prod-oakley-encoder",
            impact: "Shield-style performance frame",
          },
          {
            productId: "prod-oakley-radar-ev-path",
            impact: "Classic Radar EV Path wrap",
          },
        ],
        explanation: "Same brand optics lane; frame geometry and look diverge.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-oakley-encoder",
        reason: "You want a shield FOV for bright road and race days.",
      },
      {
        productId: "prod-oakley-radar-ev-path",
        reason: "You want classic Radar EV Path wrap fit and lens options.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Oakley Encoder vs Radar EV Path | Kitletics",
    seoDescription:
      "Compare Oakley Encoder and Radar EV Path for running sunglasses coverage and fit.",
    ...pub,
  },
  {
    id: "cmp-julbo-ultimate-smith-shift-mag",
    slug: "julbo-ultimate-vs-smith-shift-mag",
    title: "Julbo Ultimate vs Smith Shift MAG",
    shortDescription: "Trail/mixed-light Julbo versus Smith MAG lens swaps.",
    productIds: ["prod-julbo-ultimate", "prod-smith-shift-mag"],
    categoryId: "cat-sunglasses",
    comparisonType: "hybrid",
    summary:
      "Both serve mixed-light and trail-leaning runners. Ultimate emphasises Julbo trail coverage and reactive-lens positioning; Shift MAG emphasises quick ChromaPop lens swaps.",
    verdict:
      "Choose Ultimate for trail coverage and Julbo photochromic-friendly setups; choose Shift MAG when interchangeable MAG lenses are the weekly constraint.",
    criteria: [
      { key: "photochromic", label: "Photochromic", specKey: "photochromic" },
      { key: "interchange", label: "Interchangeable lenses", specKey: "interchangeableLenses" },
      { key: "coverage", label: "Coverage", specKey: "coverage" },
      { key: "vent", label: "Ventilation", specKey: "ventilation" },
      { key: "fit", label: "Fit", specKey: "fit" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-mixed-light",
        productId: "prod-smith-shift-mag",
        rationale: "MAG swaps shine when light changes across the week.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-julbo-ultimate",
        rationale: "Julbo Ultimate coverage for trail days.",
      },
      {
        useCaseId: "uc-bright-sun",
        productId: "prod-smith-shift-mag",
        rationale: "Dark MAG lens option for consistently bright blocks.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-julbo-ultimate",
        rationale: "Trail/ultra mixed light favours Julbo Ultimate positioning.",
      },
    ],
    keyDifferences: [
      {
        key: "lens-strategy",
        label: "Reactive Julbo vs MAG swaps",
        productImpacts: [
          {
            productId: "prod-julbo-ultimate",
            impact: "Trail frame with photochromic-friendly Julbo lens story",
          },
          {
            productId: "prod-smith-shift-mag",
            impact: "Magnetic interchangeable ChromaPop lenses",
          },
        ],
        explanation: "Mixed-light problem, different solutions — reactive lens vs physical swaps.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-julbo-ultimate",
        reason: "You want Julbo trail coverage and reactive-lens options.",
      },
      {
        productId: "prod-smith-shift-mag",
        reason: "You want MAG interchangeable lenses for mixed-light weeks.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Julbo Ultimate vs Smith Shift MAG | Kitletics",
    seoDescription:
      "Compare Julbo Ultimate and Smith Shift MAG for trail and mixed-light running.",
    ...pub,
  },
  {
    id: "cmp-swift-rl-nao-rl",
    slug: "petzl-swift-rl-vs-petzl-nao-rl",
    title: "Petzl Swift RL vs Petzl NAO RL",
    shortDescription: "Two Petzl reactive headlamps at different output classes.",
    productIds: ["prod-petzl-swift-rl", "prod-petzl-nao-rl"],
    categoryId: "cat-running-lights",
    comparisonType: "hybrid",
    summary:
      "Same reactive RL philosophy. Swift RL is the balanced running all-rounder; NAO RL steps up output for harder night trail and ultra darkness.",
    verdict:
      "Choose Swift RL for most night road/trail training; choose NAO RL when you need more reactive beam horsepower on technical nights.",
    criteria: [
      { key: "brightness", label: "Brightness", specKey: "brightness" },
      { key: "runtime", label: "Runtime", specKey: "runtime" },
      { key: "reactive", label: "Reactive lighting", specKey: "reactiveLighting" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "beam", label: "Beam pattern", specKey: "beamPattern" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-night-running",
        productId: "prod-petzl-swift-rl",
        rationale: "Swift RL covers most night road and mixed training.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-petzl-nao-rl",
        rationale: "NAO RL for technical night trail brightness.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-petzl-nao-rl",
        rationale: "Higher RL output for ultra darkness blocks.",
      },
      {
        useCaseId: "uc-winter-running",
        productId: "prod-petzl-swift-rl",
        rationale: "Swift RL is enough for most winter road nights.",
      },
    ],
    keyDifferences: [
      {
        key: "output-class",
        label: "All-rounder vs higher-output RL",
        productImpacts: [
          {
            productId: "prod-petzl-swift-rl",
            impact: "Balanced reactive running lamp",
          },
          {
            productId: "prod-petzl-nao-rl",
            impact: "Higher-output reactive trail lamp",
          },
        ],
        explanation: "Same RL family; pick by how technical your darkest nights are.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-petzl-swift-rl",
        reason: "You want the default Petzl reactive running headlamp.",
      },
      {
        productId: "prod-petzl-nao-rl",
        reason: "You need more RL output for technical night trail / ultra.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Petzl Swift RL vs NAO RL | Kitletics",
    seoDescription:
      "Compare Petzl Swift RL and NAO RL reactive headlamps for night running.",
    ...pub,
  },
  {
    id: "cmp-swift-rl-biolite-800",
    slug: "petzl-swift-rl-vs-biolite-headlamp-800",
    title: "Petzl Swift RL vs BioLite HeadLamp 800",
    shortDescription: "Reactive Petzl all-rounder versus bright BioLite runner lamp.",
    productIds: ["prod-petzl-swift-rl", "prod-biolite-headlamp-800"],
    categoryId: "cat-running-lights",
    comparisonType: "hybrid",
    summary:
      "Swift RL leans Petzl reactive automation; BioLite 800 leans high claimed output and BioLite’s run-oriented packaging without the same RL story.",
    verdict:
      "Pick Swift RL when adaptive brightness and Petzl trail trust matter; pick BioLite 800 when raw brightness and BioLite wear features beat reactive modes.",
    criteria: [
      { key: "brightness", label: "Brightness", specKey: "brightness" },
      { key: "runtime", label: "Runtime", specKey: "runtime" },
      { key: "reactive", label: "Reactive lighting", specKey: "reactiveLighting" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "bounce", label: "Bounce control", specKey: "bounceControl" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-night-running",
        productId: "prod-petzl-swift-rl",
        rationale: "Reactive Swift for variable night road/trail.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-biolite-headlamp-800",
        rationale: "BioLite brightness when reactive automation is optional.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-petzl-swift-rl",
        rationale: "RL battery management helps long dark efforts.",
      },
      {
        useCaseId: "uc-winter-running",
        productId: "prod-biolite-headlamp-800",
        rationale: "High output BioLite for dark winter road blocks.",
      },
    ],
    keyDifferences: [
      {
        key: "automation",
        label: "Reactive RL vs high-output BioLite",
        productImpacts: [
          {
            productId: "prod-petzl-swift-rl",
            impact: "Petzl reactive lighting automation",
          },
          {
            productId: "prod-biolite-headlamp-800",
            impact: "High-output BioLite runner lamp",
          },
        ],
        explanation: "Automation versus claimed brightness — match to how you manage modes on the move.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-petzl-swift-rl",
        reason: "You want Petzl reactive lighting for mixed night terrain.",
      },
      {
        productId: "prod-biolite-headlamp-800",
        reason: "You want BioLite high output without RL automation.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Petzl Swift RL vs BioLite HeadLamp 800 | Kitletics",
    seoDescription:
      "Compare Swift RL and BioLite HeadLamp 800 for night running brightness and reactive modes.",
    ...pub,
  },
  {
    id: "cmp-spot-400-r-actik-core",
    slug: "black-diamond-spot-400-r-vs-petzl-actik-core",
    title: "Black Diamond Spot 400-R vs Petzl Actik Core",
    shortDescription: "Two value rechargeable headlamps for night training.",
    productIds: ["prod-bd-spot-400-r", "prod-petzl-actik-core"],
    categoryId: "cat-running-lights",
    comparisonType: "hybrid",
    summary:
      "Neither is a flagship RL lamp. Spot 400-R is a straightforward BD rechargeable spot; Actik Core is Petzl’s versatile hybrid Core rechargeable.",
    verdict:
      "Choose Spot 400-R for simple BD spot brightness; choose Actik Core when you prefer Petzl hybrid Core battery convenience and ecosystem.",
    criteria: [
      { key: "brightness", label: "Brightness", specKey: "brightness" },
      { key: "runtime", label: "Runtime", specKey: "runtime" },
      { key: "battery", label: "Battery system", specKey: "batterySystem" },
      { key: "weight", label: "Weight", specKey: "weight" },
      { key: "weather", label: "Weather sealing", specKey: "weatherResistance" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-night-running",
        productId: "prod-bd-spot-400-r",
        rationale: "Simple Spot brightness for dark road miles.",
      },
      {
        useCaseId: "uc-winter-running",
        productId: "prod-petzl-actik-core",
        rationale: "Actik Core hybrid versatility for winter training nights.",
      },
      {
        useCaseId: "uc-trail-training",
        productId: "prod-petzl-actik-core",
        rationale: "Petzl Actik for mild trail nights without Swift/NAO spend.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-bd-spot-400-r",
        rationale: "Straightforward Spot for long dark road approaches.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "BD Spot vs Petzl Core hybrid",
        productImpacts: [
          {
            productId: "prod-bd-spot-400-r",
            impact: "Black Diamond rechargeable spot lamp",
          },
          {
            productId: "prod-petzl-actik-core",
            impact: "Petzl Actik Core hybrid rechargeable",
          },
        ],
        explanation: "Similar value job; brand battery systems and beam character differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-bd-spot-400-r",
        reason: "You want a simple BD rechargeable spot without Petzl RL pricing.",
      },
      {
        productId: "prod-petzl-actik-core",
        reason: "You want Petzl Core hybrid convenience below Swift/NAO.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "BD Spot 400-R vs Petzl Actik Core | Kitletics",
    seoDescription:
      "Compare Black Diamond Spot 400-R and Petzl Actik Core value running headlamps.",
    ...pub,
  },
  {
    id: "cmp-nathan-streak-proviz-reflect360",
    slug: "nathan-streak-vs-proviz-reflect360",
    title: "Nathan Streak vs Proviz Reflect360",
    shortDescription: "Two reflective running vests for night and commute visibility.",
    productIds: ["prod-nathan-reflective-vest", "prod-proviz-reflect360-vest"],
    categoryId: "cat-safety",
    comparisonType: "hybrid",
    summary:
      "Both are reflective torso layers for night road and commute running — not weapons. Nathan Streak is the simple default vest; Proviz Reflect360 emphasises high-coverage reflective material.",
    verdict:
      "Choose Nathan Streak for a straightforward reflective vest default; choose Proviz Reflect360 when maximum reflective coverage is the priority. Pair either with an active light.",
    criteria: [
      { key: "coverage", label: "Reflective coverage", specKey: "reflectiveCoverage" },
      { key: "fit", label: "Fit / wearability", specKey: "fit" },
      { key: "packability", label: "Packability", specKey: "packability" },
      { key: "breathability", label: "Breathability", specKey: "breathability" },
      { key: "value", label: "Value", specKey: "value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-night-running",
        productId: "prod-nathan-reflective-vest",
        rationale: "Streak is the clear default night reflective layer.",
      },
      {
        useCaseId: "uc-commute-running",
        productId: "prod-proviz-reflect360-vest",
        rationale: "Reflect360 coverage for dense commute traffic.",
      },
      {
        useCaseId: "uc-winter-running",
        productId: "prod-proviz-reflect360-vest",
        rationale: "High reflective area for dark winter road months.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-nathan-reflective-vest",
        rationale: "Simple Streak vest for everyday dark miles.",
      },
    ],
    keyDifferences: [
      {
        key: "coverage",
        label: "Default vest vs high-coverage Reflect360",
        productImpacts: [
          {
            productId: "prod-nathan-reflective-vest",
            impact: "Nathan Streak reflective vest",
          },
          {
            productId: "prod-proviz-reflect360-vest",
            impact: "Proviz Reflect360 high-coverage vest",
          },
        ],
        explanation: "Same visibility job; coverage philosophy and brand patterning differ.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nathan-reflective-vest",
        reason: "You want a simple Nathan Streak reflective vest default.",
      },
      {
        productId: "prod-proviz-reflect360-vest",
        reason: "You want Proviz Reflect360 high-coverage reflection.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nathan Streak vs Proviz Reflect360 | Kitletics",
    seoDescription:
      "Compare Nathan Streak and Proviz Reflect360 reflective vests for night running visibility.",
    ...pub,
  },
  {
    id: "cmp-knog-frog-nite-ize-radiant",
    slug: "knog-frog-v3-vs-nite-ize-radiant-clip",
    title: "Knog Frog V3 vs Nite Ize Radiant Clip",
    shortDescription: "Two clip lights for active night-running visibility.",
    productIds: ["prod-knog-frog-v3", "prod-nite-ize-radiant-clip"],
    categoryId: "cat-safety",
    comparisonType: "hybrid",
    summary:
      "Both add active light to a reflective layer. Frog V3 is a sport-oriented Knog clip; Radiant is a simple rechargeable Nite Ize clip for kit-bag value.",
    verdict:
      "Choose Knog Frog V3 for a sportier clip-light experience; choose Nite Ize Radiant when you want a cheap rechargeable clip to pair with any vest.",
    criteria: [
      { key: "brightness", label: "Light output", specKey: "brightness" },
      { key: "mount", label: "Mount versatility", specKey: "mount" },
      { key: "battery", label: "Battery", specKey: "batteryLife" },
      { key: "size", label: "Size / weight", specKey: "weight" },
      { key: "value", label: "Value", specKey: "value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-night-running",
        productId: "prod-knog-frog-v3",
        rationale: "Frog V3 as the sportier active-light default.",
      },
      {
        useCaseId: "uc-commute-running",
        productId: "prod-knog-frog-v3",
        rationale: "Sport clip for commute visibility stacking.",
      },
      {
        useCaseId: "uc-daily-training",
        productId: "prod-nite-ize-radiant-clip",
        rationale: "Radiant as a cheap always-in-the-bag clip.",
      },
      {
        useCaseId: "uc-winter-running",
        productId: "prod-nite-ize-radiant-clip",
        rationale: "Easy secondary light for dark winter kits.",
      },
    ],
    keyDifferences: [
      {
        key: "job",
        label: "Sport clip vs value clip",
        productImpacts: [
          {
            productId: "prod-knog-frog-v3",
            impact: "Knog Frog V3 sport clip light",
          },
          {
            productId: "prod-nite-ize-radiant-clip",
            impact: "Nite Ize Radiant rechargeable clip",
          },
        ],
        explanation: "Same active-visibility add-on; sport features versus kit-bag value.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-knog-frog-v3",
        reason: "You want a sport-oriented Knog clip light.",
      },
      {
        productId: "prod-nite-ize-radiant-clip",
        reason: "You want a simple value rechargeable clip light.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Knog Frog V3 vs Nite Ize Radiant Clip | Kitletics",
    seoDescription:
      "Compare Knog Frog V3 and Nite Ize Radiant clip lights for night running visibility.",
    ...pub,
  },

  {
    id: "cmp-maurten-gel100-sis-go",
    slug: "maurten-gel-100-vs-sis-go-isotonic-gel",
    title: "Maurten Gel 100 vs SIS GO Isotonic Gel",
    shortDescription:
      "Two popular road-race gels — hydrogel-style Maurten versus isotonic SIS GO.",
    productIds: ["prod-maurten-gel-100", "prod-sis-go-isotonic-gel"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Both are caffeine-free pocket gels for long runs and marathon fueling. Maurten Gel 100 is the hydrogel-style default many runners shortlist; SIS GO Isotonic is the more approachable isotonic texture when you want easier fluid pairing.",
    verdict:
      "No universal winner. Choose Maurten Gel 100 when you already tolerate that texture and want the Maurten race-fuel lane; choose SIS GO when isotonic mouthfeel and simpler starter-gel pricing matter more.",
    winnerProductId: undefined,
    winnerReason:
      "Context-dependent — pick by texture preference and training practice, not a single score.",
    criteria: [
      {
        key: "format",
        label: "Format",
        specKey: "form",
        notes: "Both single-serve gels",
      },
      {
        key: "carbs",
        label: "Carb delivery",
        specKey: "carbsPerServing",
      },
      {
        key: "texture",
        label: "Texture",
        notes: "Hydrogel-style vs isotonic gel mouthfeel",
      },
      {
        key: "caffeine",
        label: "Caffeine",
        specKey: "caffeine",
        notes: "Both typically caffeine-free in these SKUs — check label",
      },
      { key: "carry", label: "Carry ease", notes: "Belt/vest pocket packets" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-marathon",
        productId: "prod-maurten-gel-100",
        rationale: "Common marathon pocket-gel shortlist when Maurten texture works in training.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-sis-go-isotonic-gel",
        rationale: "Approachable isotonic gel for long-run practice.",
      },
      {
        useCaseId: "uc-easy-carry-fuel",
        productId: "prod-maurten-gel-100",
        rationale: "Compact single-serve gel for belt carry.",
      },
      {
        useCaseId: "uc-non-caffeinated-fuel",
        productId: "prod-sis-go-isotonic-gel",
        rationale: "Caffeine-free isotonic gel option — confirm label.",
      },
    ],
    keyDifferences: [
      {
        key: "texture",
        label: "Texture",
        productImpacts: [
          { productId: "prod-maurten-gel-100", impact: "Maurten hydrogel-style gel" },
          {
            productId: "prod-sis-go-isotonic-gel",
            impact: "SIS GO isotonic gel mouthfeel",
          },
        ],
        explanation:
          "Same job (pocket carbs); different texture and brand systems — train with the one you will race.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-maurten-gel-100",
        reason: "You want Maurten’s gel format and already tolerate it in training.",
      },
      {
        productId: "prod-sis-go-isotonic-gel",
        reason: "You prefer an isotonic-style gel that is easy to start with.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Maurten Gel 100 vs SIS GO Isotonic | Kitletics",
    seoDescription:
      "Compare Maurten Gel 100 and SIS GO Isotonic gels for race fueling — texture and carry, not medical advice.",
    ...pub,
  },
  {
    id: "cmp-maurten-gel100-pf30",
    slug: "maurten-gel-100-vs-precision-pf30-gel",
    title: "Maurten Gel 100 vs Precision PF30 Gel",
    shortDescription:
      "Standard Maurten gel packet versus Precision’s ~30 g carb gel format.",
    productIds: ["prod-maurten-gel-100", "prod-precision-pf30-gel"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Maurten Gel 100 is a widely shortlisted caffeine-free race gel. Precision PF30 targets modular ~30 g carbohydrate packets that pair with Precision drink products for structured fueling plans.",
    verdict:
      "Choose Maurten when you want that brand’s gel texture and race ecosystem; choose PF30 when you plan carb intake around clear per-packet increments and may mix Precision gel + drink formats.",
    criteria: [
      { key: "format", label: "Format", specKey: "form" },
      {
        key: "carbs",
        label: "Carb delivery",
        specKey: "carbsPerServing",
        winnerProductId: "prod-precision-pf30-gel",
        notes: "PF30 framed for modular ~30 g planning — compare labels",
      },
      { key: "caffeine", label: "Caffeine", specKey: "caffeine" },
      { key: "carry", label: "Carry ease" },
      { key: "texture", label: "Texture" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-marathon",
        productId: "prod-maurten-gel-100",
        rationale: "Maurten as the familiar marathon gel default when texture works.",
      },
      {
        useCaseId: "uc-high-carb-fueling",
        productId: "prod-precision-pf30-gel",
        rationale: "Modular PF30 packets for structured higher-carb planning.",
      },
      {
        useCaseId: "uc-long-runs",
        productId: "prod-precision-pf30-gel",
        rationale: "Clear per-packet carb math on long-run rehearsals.",
      },
      {
        useCaseId: "uc-easy-carry-fuel",
        productId: "prod-maurten-gel-100",
        rationale: "Simple single-serve Maurten pocket gel.",
      },
    ],
    keyDifferences: [
      {
        key: "planning",
        label: "Carb planning style",
        productImpacts: [
          {
            productId: "prod-maurten-gel-100",
            impact: "Maurten Gel 100 serve as brand default",
          },
          {
            productId: "prod-precision-pf30-gel",
            impact: "PF30 modular ~30 g gel increments",
          },
        ],
        explanation:
          "Endurance sports-nutrition guidance commonly discusses carbohydrate targets in g/hour ranges for longer efforts — individual tolerance varies; practice in training; this is not medical advice.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-maurten-gel-100",
        reason: "You want Maurten’s gel lane and race familiarity.",
      },
      {
        productId: "prod-precision-pf30-gel",
        reason: "You want Precision’s modular PF30 carb packets.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Maurten Gel 100 vs Precision PF30 | Kitletics",
    seoDescription:
      "Compare Maurten Gel 100 and Precision PF30 gels for long-run and race fueling.",
    ...pub,
  },
  {
    id: "cmp-maurten-dm320-tailwind",
    slug: "maurten-drink-mix-320-vs-tailwind-endurance",
    title: "Maurten Drink Mix 320 vs Tailwind Endurance",
    shortDescription:
      "High-carb bottle fuel versus sip-as-you-go endurance drink mix.",
    productIds: ["prod-maurten-drink-mix-320", "prod-tailwind-endurance"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Both put carbohydrate in the bottle. Drink Mix 320 targets denser high-carb flask fueling; Tailwind Endurance is a classic drink-based endurance mix for sipping carbs and electrolytes together.",
    verdict:
      "Choose Drink Mix 320 when you want high carb density in bottles and already tolerate Maurten mixes; choose Tailwind when you prefer a flavoured endurance mix habit without Maurten’s denser 320-class profile.",
    criteria: [
      { key: "format", label: "Format", specKey: "form", notes: "Powder drink mixes" },
      {
        key: "carbs",
        label: "Carb delivery",
        specKey: "carbsPerServing",
        winnerProductId: "prod-maurten-drink-mix-320",
        notes: "320-class denser bottle carbs — compare labels",
      },
      { key: "caffeine", label: "Caffeine", specKey: "caffeine" },
      {
        key: "carry",
        label: "Carry",
        notes: "Both need bottles/flasks — not pocket gels",
      },
      { key: "texture", label: "Mix / flavour" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-high-carb-fueling",
        productId: "prod-maurten-drink-mix-320",
        rationale: "Denser bottle carbs for high-carb fueling experiments.",
      },
      {
        useCaseId: "uc-drink-based-fueling",
        productId: "prod-tailwind-endurance",
        rationale: "Classic sip-as-you-go drink mix habit.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-tailwind-endurance",
        rationale: "Drink-based variety across long ultra hours.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-maurten-drink-mix-320",
        rationale: "High-carb flask plan when Maurten mix sits well in training.",
      },
    ],
    keyDifferences: [
      {
        key: "density",
        label: "Carb density in bottle",
        productImpacts: [
          {
            productId: "prod-maurten-drink-mix-320",
            impact: "Maurten Drink Mix 320 high-carb flask focus",
          },
          {
            productId: "prod-tailwind-endurance",
            impact: "Tailwind Endurance sip-as-you-go mix",
          },
        ],
        explanation:
          "Same drink-based format; different carb density and flavour systems — rehearse mix strength on long runs. Not medical advice.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-maurten-drink-mix-320",
        reason: "You want denser Maurten bottle carbs.",
      },
      {
        productId: "prod-tailwind-endurance",
        reason: "You want Tailwind’s drink-based endurance mix.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Maurten Drink Mix 320 vs Tailwind | Kitletics",
    seoDescription:
      "Compare Maurten Drink Mix 320 and Tailwind Endurance for bottle-based race fueling.",
    ...pub,
  },
  {
    id: "cmp-sis-beta-neversecond-c30",
    slug: "sis-beta-fuel-gel-vs-neversecond-c30-gel",
    title: "SIS Beta Fuel Gel vs Neversecond C30 Gel",
    shortDescription:
      "Two higher-carb modular gels for structured long-effort fueling.",
    productIds: ["prod-sis-beta-fuel-gel", "prod-neversecond-c30-gel"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Both sit above basic starter gels for denser pocket carbohydrate. SIS Beta Fuel Gel lives in the Beta Fuel system; Neversecond C30 targets clear ~30 g packet planning as a peer format.",
    verdict:
      "Pick by which brand system and texture you can rehearse — both aim at modular higher-carb gel fueling rather than beginner isotonic packets.",
    criteria: [
      { key: "format", label: "Format", specKey: "form" },
      {
        key: "carbs",
        label: "Carb delivery",
        specKey: "carbsPerServing",
        notes: "Both higher-carb gel class — compare labels",
      },
      { key: "caffeine", label: "Caffeine", specKey: "caffeine" },
      { key: "carry", label: "Carry ease" },
      { key: "texture", label: "Texture" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-high-carb-fueling",
        productId: "prod-sis-beta-fuel-gel",
        rationale: "Beta Fuel gel for denser SIS pocket carbs.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-neversecond-c30-gel",
        rationale: "C30 packet math for marathon rehearsal.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-sis-beta-fuel-gel",
        rationale: "Higher-carb SIS gel for longer efforts after training trials.",
      },
      {
        useCaseId: "uc-easy-carry-fuel",
        productId: "prod-neversecond-c30-gel",
        rationale: "Compact C30 gel packets for vest/belt.",
      },
    ],
    keyDifferences: [
      {
        key: "system",
        label: "Brand fueling system",
        productImpacts: [
          {
            productId: "prod-sis-beta-fuel-gel",
            impact: "SIS Beta Fuel gel system",
          },
          {
            productId: "prod-neversecond-c30-gel",
            impact: "Neversecond C30 modular gel",
          },
        ],
        explanation:
          "Similar higher-carb gel job; choose the texture and ecosystem you practise with. Endurance sports-nutrition guidance commonly discusses carbohydrate targets in g/hour ranges for longer efforts — individual tolerance varies; practice in training; this is not medical advice.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-sis-beta-fuel-gel",
        reason: "You want SIS Beta Fuel gel carb density.",
      },
      {
        productId: "prod-neversecond-c30-gel",
        reason: "You want Neversecond C30 modular packets.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "SIS Beta Fuel Gel vs Neversecond C30 | Kitletics",
    seoDescription:
      "Compare SIS Beta Fuel Gel and Neversecond C30 gels for higher-carb race fueling.",
    ...pub,
  },
  {
    id: "cmp-clif-bloks-gu-chews",
    slug: "clif-bloks-vs-gu-chews",
    title: "Clif Bloks vs GU Chews",
    shortDescription: "Two chewable carb formats for long runs and races.",
    productIds: ["prod-clif-bloks", "prod-gu-chews"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Both replace gel syrup with something you bite. Clif Bloks are the blok/strip staple many runners portion across miles; GU Chews are the GU-ecosystem chew alternative with familiar race flavours.",
    verdict:
      "Choose Clif Bloks for classic blok portioning; choose GU Chews when you already use GU gels and want matching chew texture variety.",
    criteria: [
      { key: "format", label: "Format", specKey: "form", notes: "Chews / bloks" },
      { key: "carbs", label: "Carb delivery", specKey: "carbsPerServing" },
      { key: "caffeine", label: "Caffeine", specKey: "caffeine", notes: "Check caffeinated SKUs on labels" },
      { key: "carry", label: "Carry ease" },
      { key: "texture", label: "Chew texture" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-long-runs",
        productId: "prod-clif-bloks",
        rationale: "Bloks portion well across long-run miles.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-gu-chews",
        rationale: "GU chew peer when you already race on GU gels.",
      },
      {
        useCaseId: "uc-easy-carry-fuel",
        productId: "prod-clif-bloks",
        rationale: "Pocketable chew strip for belt carry.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-clif-bloks",
        rationale: "Texture variety across ultra hours.",
      },
    ],
    keyDifferences: [
      {
        key: "texture",
        label: "Chew style",
        productImpacts: [
          { productId: "prod-clif-bloks", impact: "Clif Bloks strip portioning" },
          { productId: "prod-gu-chews", impact: "GU Chews soft chew pieces" },
        ],
        explanation:
          "Same chewable format job — practise chewing at race effort so neither surprises you late.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-clif-bloks",
        reason: "You want classic blok portioning and texture.",
      },
      {
        productId: "prod-gu-chews",
        reason: "You want GU’s chew format alongside GU gels.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Clif Bloks vs GU Chews | Kitletics",
    seoDescription:
      "Compare Clif Bloks and GU Chews for chewable running race fuel.",
    ...pub,
  },
  {
    id: "cmp-nuun-precision-ph1500",
    slug: "nuun-sport-vs-precision-ph1500",
    title: "Nuun Sport vs Precision PH 1500",
    shortDescription:
      "Tablet electrolytes versus higher-sodium Precision hydration mix.",
    productIds: ["prod-nuun-sport", "prod-precision-ph1500"],
    categoryId: "cat-nutrition",
    comparisonType: "hybrid",
    summary:
      "Both support bottle electrolytes rather than replacing race gels. Nuun Sport is the simple tablet value pick; Precision PH 1500 targets a higher-sodium Precision hydration mix for runners who want that system beside PF carbs.",
    verdict:
      "Choose Nuun for easy tablet dosing and kit-bag value; choose PH 1500 when you want Precision’s higher-sodium mix and already use Precision carb products. Neither diagnoses deficiency or replaces medical advice.",
    criteria: [
      {
        key: "format",
        label: "Format",
        specKey: "form",
        notes: "Tablet vs powder hydration mix",
      },
      {
        key: "carbs",
        label: "Carb delivery",
        specKey: "carbsPerServing",
        notes: "Electrolyte-focused — not primary race carb gels",
      },
      { key: "caffeine", label: "Caffeine", specKey: "caffeine" },
      { key: "carry", label: "Carry / dosing ease" },
      { key: "texture", label: "Mix / tablet convenience" },
      {
        key: "value",
        label: "Value",
        winnerProductId: "prod-nuun-sport",
        notes: "Tablets often cheaper per bottle dosing",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-long-runs",
        productId: "prod-nuun-sport",
        rationale: "Simple tablet electrolytes for training bottles.",
      },
      {
        useCaseId: "uc-marathon",
        productId: "prod-precision-ph1500",
        rationale: "Precision hydration mix when paired with Precision carbs.",
      },
      {
        useCaseId: "uc-drink-based-fueling",
        productId: "prod-precision-ph1500",
        rationale: "Powder mix fits bottle-first habits.",
      },
      {
        useCaseId: "uc-ultra",
        productId: "prod-precision-ph1500",
        rationale: "Higher-sodium Precision mix option for longer days — not medical dosing.",
      },
    ],
    keyDifferences: [
      {
        key: "dosing",
        label: "Dosing format",
        productImpacts: [
          { productId: "prod-nuun-sport", impact: "Effervescent electrolyte tablets" },
          {
            productId: "prod-precision-ph1500",
            impact: "Precision PH 1500 hydration mix",
          },
        ],
        explanation:
          "Electrolyte product choice for bottles — pair with separate carb gels/mixes as needed. Sports product education only; not medical advice.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nuun-sport",
        reason: "You want simple value electrolyte tablets.",
      },
      {
        productId: "prod-precision-ph1500",
        reason: "You want Precision PH 1500 mix in the Precision system.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Nuun Sport vs Precision PH 1500 | Kitletics",
    seoDescription:
      "Compare Nuun Sport and Precision PH 1500 electrolytes for running bottles — not medical advice.",
    ...pub,
  },

  {
    id: "cmp-theragun-mini-hypervolt-go2",
    slug: "theragun-mini-vs-hypervolt-go-2",
    title: "Theragun mini vs Hypervolt Go 2",
    shortDescription:
      "Two travel-class percussion massagers for portable soft-tissue routines.",
    productIds: ["prod-theragun-mini", "prod-hypervolt-go-2"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "Both are compact massage guns for kit-bag and race-weekend soft-tissue comfort work. Theragun mini is the Therabody travel default; Hypervolt Go 2 is Hyperice’s portable peer. Neither is medical treatment.",
    verdict:
      "Choose Theragun mini when you want Therabody’s mini ecosystem and travel form; choose Hypervolt Go 2 when you prefer Hyperice’s Go-class controls. Pick by brand ecosystem and feel preference — not unverified recovery outcomes.",
    criteria: [
      {
        key: "practical-use",
        label: "Practical use",
        notes: "Travel soft-tissue convenience",
      },
      { key: "portability", label: "Portability", specKey: "portable" },
      { key: "comfort", label: "Comfort preference" },
      { key: "battery", label: "Battery", specKey: "battery" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-travel-recovery",
        productId: "prod-theragun-mini",
        rationale: "Therabody mini default for race-weekend kit bags.",
      },
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-hypervolt-go-2",
        rationale: "Hyperice portable peer for short post-run sessions.",
      },
      {
        useCaseId: "uc-home-recovery",
        productId: "prod-theragun-mini",
        rationale: "Either works at home; mini stays the smaller always-pack option.",
      },
    ],
    keyDifferences: [
      {
        key: "ecosystem",
        label: "Brand ecosystem",
        productImpacts: [
          { productId: "prod-theragun-mini", impact: "Therabody mini class" },
          { productId: "prod-hypervolt-go-2", impact: "Hyperice Go 2 class" },
        ],
        explanation:
          "Same portable percussion job. Manufacturer recovery marketing is not Kitletics evidence that either prevents injury, improves circulation, speeds recovery or removes lactic acid.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-theragun-mini",
        reason: "You want Therabody’s travel mini form and ecosystem.",
      },
      {
        productId: "prod-hypervolt-go-2",
        reason: "You want Hyperice’s compact Go-class massager.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Theragun mini vs Hypervolt Go 2 | Kitletics",
    seoDescription:
      "Compare Theragun mini and Hypervolt Go 2 portable massage guns — practical soft-tissue tools, not medical treatment.",
    ...pub,
  },
  {
    id: "cmp-theragun-prime-renpho-r3",
    slug: "theragun-prime-vs-renpho-r3",
    title: "Theragun Prime vs RENPHO R3",
    shortDescription:
      "Mid-tier Theragun versus value percussion for home soft-tissue work.",
    productIds: ["prod-theragun-prime", "prod-renpho-r3"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "Prime sits in Therabody’s mid-size home lane; RENPHO R3 is the accessible value gun for runners testing whether they will use percussion at all. Same claim limits apply to both.",
    verdict:
      "Choose Theragun Prime for mid-tier Therabody build and ecosystem; choose RENPHO R3 when budget and trial use matter more than brand premium. Neither establishes medical recovery outcomes.",
    criteria: [
      { key: "practical-use", label: "Practical use" },
      { key: "portability", label: "Portability", specKey: "portable" },
      { key: "comfort", label: "Comfort preference" },
      {
        key: "value",
        label: "Value",
        winnerProductId: "prod-renpho-r3",
        notes: "Lower typical street price for trial use",
      },
      { key: "evidence-honesty", label: "Evidence honesty" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-home-recovery",
        productId: "prod-theragun-prime",
        rationale: "Mid-size home sessions when you want Therabody mid-tier.",
      },
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-renpho-r3",
        rationale: "Value gun when testing post-run soft-tissue habits.",
      },
      {
        useCaseId: "uc-travel-recovery",
        productId: "prod-renpho-r3",
        rationale: "Cheaper to pack as a trial travel option — minis still win pure pack size.",
      },
    ],
    keyDifferences: [
      {
        key: "tier",
        label: "Price / tier",
        productImpacts: [
          { productId: "prod-theragun-prime", impact: "Mid-premium Therabody" },
          { productId: "prod-renpho-r3", impact: "Value percussion tier" },
        ],
        explanation:
          "Fork is brand tier and budget, not proven physiological superiority. Kitletics will not claim either heals injury or speeds recovery.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-theragun-prime",
        reason: "You want mid-size Theragun for regular home use.",
      },
      {
        productId: "prod-renpho-r3",
        reason: "You want a value gun to test the habit first.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Theragun Prime vs RENPHO R3 | Kitletics",
    seoDescription:
      "Compare Theragun Prime and RENPHO R3 massage guns — mid-tier vs value for practical soft-tissue use.",
    ...pub,
  },
  {
    id: "cmp-grid-grid-x",
    slug: "triggerpoint-grid-vs-grid-x",
    title: "TriggerPoint GRID vs GRID X",
    shortDescription:
      "Classic multi-density GRID versus firmer GRID X foam roller.",
    productIds: ["prod-triggerpoint-grid", "prod-triggerpoint-grid-x"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "Same GRID hollow-core family; X steps density/firmness for runners who want more intense soft-tissue pressure. Preference fork — not a medical upgrade.",
    verdict:
      "Choose classic GRID for approachable multi-density sessions; choose GRID X when you already like firm rollers and want higher intensity. Technique and comfort preference decide — not injury-treatment claims.",
    criteria: [
      {
        key: "density",
        label: "Density",
        specKey: "density",
        winnerProductId: "prod-triggerpoint-grid-x",
        notes: "X positioned firmer",
      },
      { key: "comfort", label: "Comfort preference" },
      { key: "practical-use", label: "Practical use" },
      { key: "portability", label: "Portability", specKey: "portable" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginners",
        productId: "prod-triggerpoint-grid",
        rationale: "More approachable density for new rollers.",
      },
      {
        useCaseId: "uc-home-recovery",
        productId: "prod-triggerpoint-grid-x",
        rationale: "Firmer home sessions when classic GRID feels too soft.",
      },
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-triggerpoint-grid",
        rationale: "Default GRID for everyday soft-tissue routines.",
      },
    ],
    keyDifferences: [
      {
        key: "firmness",
        label: "Firmness",
        productImpacts: [
          { productId: "prod-triggerpoint-grid", impact: "Classic multi-density GRID" },
          { productId: "prod-triggerpoint-grid-x", impact: "Firmer GRID X" },
        ],
        explanation:
          "Intensity preference within one product family. Foam rollers are comfort adjuncts — Kitletics does not claim they heal injury or clear lactic acid.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-triggerpoint-grid",
        reason: "You want the approachable classic GRID feel.",
      },
      {
        productId: "prod-triggerpoint-grid-x",
        reason: "You want firmer GRID X intensity.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "TriggerPoint GRID vs GRID X | Kitletics",
    seoDescription:
      "Compare TriggerPoint GRID and GRID X foam rollers — density preference for soft-tissue work, not medical treatment.",
    ...pub,
  },
  {
    id: "cmp-grid-rumbleroller",
    slug: "triggerpoint-grid-vs-rumbleroller",
    title: "TriggerPoint GRID vs RumbleRoller",
    shortDescription:
      "Structured GRID surface versus textured RumbleRoller contact.",
    productIds: ["prod-triggerpoint-grid", "prod-rumbleroller-original"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "GRID emphasises a durable multi-density grid pattern many runners already know; RumbleRoller emphasises pronounced textured/ridged contact. Surface preference — not proven clinical superiority.",
    verdict:
      "Choose GRID for familiar multi-density rolling; choose RumbleRoller when you specifically want aggressive textured contact. Comfort preference decides.",
    criteria: [
      {
        key: "surface",
        label: "Surface",
        specKey: "surface",
        notes: "Grid pattern vs textured/ridged",
      },
      { key: "comfort", label: "Comfort preference" },
      { key: "practical-use", label: "Practical use" },
      { key: "density", label: "Density", specKey: "density" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginners",
        productId: "prod-triggerpoint-grid",
        rationale: "More familiar approachable grid surface.",
      },
      {
        useCaseId: "uc-home-recovery",
        productId: "prod-rumbleroller-original",
        rationale: "When textured contact is the home preference.",
      },
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-triggerpoint-grid",
        rationale: "Default structured roller for post-run soft-tissue work.",
      },
    ],
    keyDifferences: [
      {
        key: "texture",
        label: "Texture",
        productImpacts: [
          { productId: "prod-triggerpoint-grid", impact: "GRID multi-density pattern" },
          {
            productId: "prod-rumbleroller-original",
            impact: "Pronounced ridged/textured surface",
          },
        ],
        explanation:
          "Contact feel fork. Manufacturer wellness language is not Kitletics evidence of circulation or recovery-speed benefits.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-triggerpoint-grid",
        reason: "You want classic GRID multi-density rolling.",
      },
      {
        productId: "prod-rumbleroller-original",
        reason: "You want textured RumbleRoller contact.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "TriggerPoint GRID vs RumbleRoller | Kitletics",
    seoDescription:
      "Compare GRID and RumbleRoller foam rollers — surface and texture preference for soft-tissue work.",
    ...pub,
  },
  {
    id: "cmp-normatec-3-normatec-go",
    slug: "normatec-3-vs-normatec-go",
    title: "Normatec 3 vs Normatec Go",
    shortDescription:
      "Full dynamic compression boots versus the portable Go system.",
    productIds: ["prod-normatec-3", "prod-normatec-go"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "Normatec 3 is the fuller home/boot system; Normatec Go prioritises packability for travel. Both are optional comfort adjuncts — Kitletics will not establish medical recovery outcomes from either.",
    verdict:
      "Choose Normatec 3 for a full home boot setup; choose Normatec Go when portability and travel sessions matter more than full-system coverage. Not medical treatment.",
    criteria: [
      {
        key: "portability",
        label: "Portability",
        winnerProductId: "prod-normatec-go",
        notes: "Go designed for travel packability",
      },
      { key: "practical-use", label: "Practical use" },
      { key: "comfort", label: "Comfort preference" },
      {
        key: "zones",
        label: "Coverage / zones",
        specKey: "zones",
        winnerProductId: "prod-normatec-3",
        notes: "Fuller boot system",
      },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-home-recovery",
        productId: "prod-normatec-3",
        rationale: "Fuller boot system for dedicated home sessions.",
      },
      {
        useCaseId: "uc-travel-recovery",
        productId: "prod-normatec-go",
        rationale: "Portable Normatec lane for trips and race weekends.",
      },
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-normatec-go",
        rationale: "Easier to keep in rotation when storage space is limited.",
      },
    ],
    keyDifferences: [
      {
        key: "form",
        label: "Form factor",
        productImpacts: [
          { productId: "prod-normatec-3", impact: "Full Normatec 3 boot system" },
          { productId: "prod-normatec-go", impact: "Portable Go compression" },
        ],
        explanation:
          "Home coverage vs travel packability. Manufacturer recovery claims are marketing; Kitletics does not claim improved circulation, faster recovery or injury healing.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-normatec-3",
        reason: "You want a full home Normatec boot system.",
      },
      {
        productId: "prod-normatec-go",
        reason: "You want portable Normatec sessions for travel.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "Normatec 3 vs Normatec Go | Kitletics",
    seoDescription:
      "Compare Normatec 3 and Normatec Go — full boots vs portable compression. Comfort adjuncts, not medical treatment.",
    ...pub,
  },
  {
    id: "cmp-oofos-hoka-ora",
    slug: "oofos-ooriginal-vs-hoka-ora-recovery-slide",
    title: "OOFOS OOriginal vs HOKA Ora Recovery Slide",
    shortDescription:
      "Two post-run recovery footwear options for easy walking comfort.",
    productIds: ["prod-oofos-ooriginal", "prod-hoka-ora-recovery-slide"],
    categoryId: "cat-recovery-gear",
    comparisonType: "hybrid",
    summary:
      "Both target cushy walking after hard days — not running miles. OOriginal is the OOfoam sandal staple; Ora Recovery Slide is HOKA’s recovery-slide peer. Comfort and fit preference decide.",
    verdict:
      "Choose OOFOS OOriginal for classic OOfoam sandal comfort; choose HOKA Ora Recovery Slide when you want HOKA’s recovery-slide geometry. Neither is a running shoe or medical treatment.",
    criteria: [
      {
        key: "cushion",
        label: "Cushion",
        specKey: "cushionLevel",
        notes: "Post-walk comfort preference",
      },
      { key: "comfort", label: "Comfort / fit" },
      { key: "practical-use", label: "Practical use" },
      { key: "portability", label: "Portability", specKey: "portable" },
      { key: "value", label: "Value" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-post-run-recovery",
        productId: "prod-oofos-ooriginal",
        rationale: "Classic soft post-run walking sandal.",
      },
      {
        useCaseId: "uc-comfort",
        productId: "prod-hoka-ora-recovery-slide",
        rationale: "HOKA recovery-slide peer when you prefer that silhouette.",
      },
      {
        useCaseId: "uc-high-mileage",
        productId: "prod-oofos-ooriginal",
        rationale: "Easy walking cushion around heavy training weeks.",
      },
    ],
    keyDifferences: [
      {
        key: "silhouette",
        label: "Silhouette",
        productImpacts: [
          { productId: "prod-oofos-ooriginal", impact: "OOFOS OOriginal sandal" },
          {
            productId: "prod-hoka-ora-recovery-slide",
            impact: "HOKA Ora recovery slide",
          },
        ],
        explanation:
          "Brand geometry and foam feel for easy walking — not established injury healing or circulation therapy.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-oofos-ooriginal",
        reason: "You want classic OOFOS OOfoam sandal comfort.",
      },
      {
        productId: "prod-hoka-ora-recovery-slide",
        reason: "You want HOKA’s Ora recovery-slide fit and feel.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    faqIds: [],
    seoTitle: "OOFOS OOriginal vs HOKA Ora Recovery Slide | Kitletics",
    seoDescription:
      "Compare OOFOS OOriginal and HOKA Ora Recovery Slide for post-run walking comfort — not running shoes or medical treatment.",
    ...pub,
  },

];
