/**
 * Stability Running Shoes Explained — reference technical buying guide.
 */
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import type { LongFormGuideConfig } from "@/lib/guides/long-form-config";

const STABILITY_BLOCKS: ExplainerBlock[] = [
  {
    id: "what-is",
    type: "prose" as const,
    title: "What is a stability running shoe?",
    intro:
      "Stability is a design category — not a medical diagnosis.",
    paragraphs: [
      "A stability running shoe is built to create a more guided or secure platform than a typical neutral trainer. Brands achieve that through geometry, midsole shaping, sidewalls, guidance structures, heel design, or denser medial materials — often in combination.",
      "The category exists because some runners prefer a more controlled feel underfoot, especially on easy and daily mileage. Preference, comfort and fit matter. A stability label does not mean the shoe “fixes” gait, prevents injury, or is required for anyone with a particular foot shape.",
      "Definitions have also changed. Older stability shoes often relied on obvious medial posts and firmness differences. Many current models use broader platforms, sidewalls and guidance systems that influence movement more subtly. A modern stability shoe can feel supportive without feeling highly corrective.",
      "Kitletics treats stability as a product characteristic you can compare — alongside cushioning, fit, weight and intended use — not as a prescription.",
    ],
  },
  {
    id: "diagram",
    type: "diagram" as const,
    title: "Neutral vs guided platform",
    caption:
      "Illustrative comparison of platform ideas — not a cutaway of any specific product. Real shoes combine these elements differently.",
    variant: "neutral-vs-stability" as const,
  },
  {
    id: "vs-neutral",
    type: "prose" as const,
    title: "Stability shoes vs neutral shoes",
    paragraphs: [
      "Neutral shoes prioritise a freer platform with minimal dedicated guidance structures. Stability shoes add design elements intended to make the ride feel more controlled or secure. Neither is universally better.",
      "Many runners are comfortable in neutral shoes. Others prefer the locked-in feel of a guided platform. Some alternate: neutral for faster sessions, stability for easy volume — when that combination feels better.",
      "Marketing language can blur the line. “Stable-neutral” or “mild support” shoes sit between extremes. Always read the actual geometry and support approach on the product page rather than relying on the category name alone.",
    ],
  },
  {
    id: "vs-neutral-table",
    type: "comparison-table" as const,
    title: "Neutral and stability at a glance",
    columns: ["Neutral", "Stability"],
    rows: [
      {
        label: "Platform intent",
        values: ["Freer, less guided", "More guided / secure"],
      },
      {
        label: "Base geometry",
        values: ["Varies by model", "Often broader or more shaped"],
      },
      {
        label: "Support features",
        values: ["Minimal dedicated guidance", "Geometry, rails, posts, sidewalls"],
      },
      {
        label: "Ride character",
        values: ["Often freer", "Often more controlled"],
      },
      {
        label: "Weight tendency",
        values: ["Often lower for similar stack", "Sometimes higher"],
      },
      {
        label: "Commonly considered by",
        values: [
          "Runners wanting a freer daily ride",
          "Runners preferring guided platforms",
        ],
      },
    ],
    footnote:
      "Illustrative tendencies — individual models vary widely within each category.",
  },
  {
    id: "need-one",
    type: "callout" as const,
    title: "Does “stability” mean you need one?",
    tone: "caution" as const,
    body: "No. Stability is a design characteristic, not a diagnosis. Some runners simply prefer a more secure platform. If you have pain, injury history or clinical concerns, a qualified clinician can help — Kitletics does not diagnose overpronation or prescribe footwear as medical treatment.",
  },
  {
    id: "how-works",
    type: "prose" as const,
    title: "How stability shoes actually work",
    paragraphs: [
      "Modern stability is usually a system, not a single part. Foam shape, base width, upper lockdown and outsole geometry all affect how secure the shoe feels. Understanding the building blocks helps you compare products without treating brand names as magic.",
    ],
  },
  {
    id: "tech-cards",
    type: "factor-cards" as const,
    title: "Stability design elements",
    intro:
      "Each element changes the shoe differently. Products rarely use only one.",
    cards: [
      {
        id: "wider-base",
        title: "Wider platform",
        whatItIs: "More surface area under the foot, especially through midfoot or heel.",
        howItChanges: "Increases geometric stability and can reduce the feeling of tipping on soft foam.",
        whatYouNotice: "A more planted stance; sometimes a slightly less agile turn-in feel.",
      },
      {
        id: "sidewalls",
        title: "Sidewalls",
        whatItIs: "Foam or structure that rises around the sides of the footbed.",
        howItChanges: "Cradles the foot and limits excessive side-to-side motion on the platform.",
        whatYouNotice: "A more “held” midfoot without necessarily feeling like a hard post.",
      },
      {
        id: "guide-rails",
        title: "Guidance rails / systems",
        whatItIs: "Structures designed to influence motion without a classic dense medial post.",
        howItChanges: "Guides the foot along a preferred path; brand implementations differ (e.g. GuideRails, 4D GUIDANCE).",
        whatYouNotice: "A directed, secure ride that may still feel relatively smooth.",
      },
      {
        id: "medial",
        title: "Medial support",
        whatItIs: "Firmer or denser material on the medial (inner) side of the midsole.",
        howItChanges: "Creates a firmer medial pathway — closer to traditional stability approaches.",
        whatYouNotice: "A more obvious support sensation on the inside of the shoe.",
      },
      {
        id: "heel-geo",
        title: "Heel geometry",
        whatItIs: "Shape of the rear platform, bevels and heel counter stiffness.",
        howItChanges: "Affects how the foot lands and transitions off the rearfoot.",
        whatYouNotice: "More or less secure heel strike; can change early-stance feel.",
      },
      {
        id: "rocker",
        title: "Rocker & foam geometry",
        whatItIs: "Curved rocker profiles and sculpted midsole shaping.",
        howItChanges: "Can smooth transitions and reduce the need for aggressive posting.",
        whatYouNotice: "A rolling, guided forward path — sometimes with less “push” feel.",
      },
    ],
  },
  {
    id: "old-vs-new",
    type: "prose" as const,
    title: "Traditional medial posts vs modern guidance",
    paragraphs: [
      "Traditional stability often meant a visible medial post: denser foam on the inner midsole that you could sometimes see as a different colour. That approach still appears, but it is no longer the only toolkit.",
      "Modern stability frequently emphasises broad bases, sidewalls, rockers and guidance systems that feel less intrusive. Transitional designs mix both eras — a guidance system plus supportive geometry, for example.",
      "Do not assume every new shoe abandoned posts, or that every older approach is obsolete. Compare the specific model’s midsole description and stability classification rather than the decade it launched.",
    ],
  },
  {
    id: "timeline",
    type: "timeline" as const,
    title: "How stability design has shifted",
    intro:
      "Educational stages — not a precise history of every brand.",
    stages: [
      {
        id: "traditional",
        label: "Traditional",
        description: "Clear medial posting and firmness differences were common primary tools.",
        traits: ["Medial posts", "Firmer medial foam", "Obvious guidance feel"],
      },
      {
        id: "transitional",
        label: "Transitional",
        description: "Brands mixed posts with wider bases, rockers and early guidance frames.",
        traits: ["Mixed tools", "Broader platforms", "Softer overall foams"],
      },
      {
        id: "modern",
        label: "Modern geometry-led",
        description: "Many current shoes lean on geometry, sidewalls and guidance systems.",
        traits: ["Sidewalls", "Guidance rails", "Rocker shaping", "Less intrusive posts"],
      },
    ],
  },
  {
    id: "how-much",
    type: "prose" as const,
    title: "How much stability do you need?",
    paragraphs: [
      "Stability is a spectrum. Some shoes offer subtle guidance; others are clearly support-focused. More stability is not automatically better — unnecessary control can feel restrictive if you prefer a freer ride.",
      "Kitletics product specs use controlled stability values (for example neutral, mild-stability, stability). Those labels describe design intent from catalog data — they are not a clinical grading of your gait.",
      "Start from comfort. If a guided shoe feels natural and secure for your easy miles, that is useful signal. If it feels forced or awkward, a milder or neutral option may suit you better — regardless of what a category page suggests.",
    ],
  },
  {
    id: "spectrum",
    type: "spectrum" as const,
    title: "Stability spectrum (catalog examples)",
    lowLabel: "Milder guidance",
    highLabel: "More support-focused",
    markers: [
      {
        productId: "prod-gt-2000-14",
        position: 35,
        label: "GT-2000 14 · mild-stability",
      },
      {
        productId: "prod-adrenaline-gts-25",
        position: 62,
        label: "Adrenaline GTS 25 · stability",
      },
      {
        productId: "prod-structure-plus",
        position: 68,
        label: "Structure Plus · stability",
      },
      {
        productId: "prod-kayano-32",
        position: 78,
        label: "GEL-Kayano 32 · stability",
      },
    ],
    note: "Positions reflect catalog stability classification and relative support positioning among current examples — not a clinical scale.",
  },
  {
    id: "cushion-stability",
    type: "prose" as const,
    title: "Cushioning and stability",
    paragraphs: [
      "Cushioning and stability are separate dimensions. Soft foam is not automatically unstable; firm foam is not automatically stable. Geometry — base width, sidewalls, guidance structures — often determines how secure a soft shoe feels.",
      "You will find max-cushion stability shoes (protective and guided), moderate-cushion daily stability trainers, and firmer guided platforms. Match both axes to how you train: long easy miles may favour plush + guided; mixed daily training may favour moderate cushion with approachable support.",
    ],
  },
  {
    id: "matrix",
    type: "matrix" as const,
    title: "Cushion × guidance (illustrative)",
    xLow: "Lower cushion",
    xHigh: "Higher cushion",
    yLow: "Lower guidance",
    yHigh: "Higher guidance",
    cells: [
      {
        id: "gt",
        x: "mid" as const,
        y: "mid" as const,
        label: "GT-2000 14",
        productId: "prod-gt-2000-14",
        description: "Medium cushion · mild-stability daily",
      },
      {
        id: "adr",
        x: "high" as const,
        y: "mid" as const,
        label: "Adrenaline GTS 25",
        productId: "prod-adrenaline-gts-25",
        description: "High cushion · GuideRails stability",
      },
      {
        id: "kay",
        x: "high" as const,
        y: "high" as const,
        label: "GEL-Kayano 32",
        productId: "prod-kayano-32",
        description: "Maximum cushion · support-focused",
      },
      {
        id: "str",
        x: "high" as const,
        y: "mid" as const,
        label: "Structure Plus",
        productId: "prod-structure-plus",
        description: "High cushion · stability chassis",
      },
    ],
    note: "Cell placement uses catalog cushionLevel and stability fields. Soft ≠ unstable; firm ≠ stable.",
  },
  {
    id: "fit-width",
    type: "prose" as const,
    title: "Fit, width and platform geometry",
    paragraphs: [
      "Fit and stability interact. A guided midsole still fails if the upper pinches, the heel slips, or the toe box is wrong. Start with length, width and lockdown — then evaluate how the platform feels.",
      "Official width options (narrow, wide, extra-wide) are about upper volume and last. They are not the same as a wide midsole platform. A shoe can offer a 2E upper while still having a relatively narrow foam base — or the reverse.",
      "When comparing, check both: available width SKUs on the product page, and descriptions of base geometry or stability approach. Runners with wider feet often benefit from brands with a full width ladder (many ASICS and Brooks stability models do), but always confirm the specific generation.",
    ],
  },
  {
    id: "run-types",
    type: "prose" as const,
    title: "Stability shoes for different types of running",
    paragraphs: [
      "Stability designs are most commonly used for daily training, easy runs and longer easy volume — sessions where comfort and a secure platform matter more than minimal weight. That does not mean every easy run requires stability.",
      "For tempo and race efforts, dedicated support-oriented race tools are less common. Some runners still prefer a mild stability daily for controlled faster work; others switch to a neutral tempo or race shoe. Match the shoe to the session and how the platform feels at that pace.",
    ],
  },
  {
    id: "use-cases",
    type: "use-case-cards" as const,
    title: "Session context",
    cards: [
      {
        id: "daily",
        title: "Daily training",
        description:
          "A natural fit for many support-oriented trainers — regular mileage where guided comfort matters.",
        href: "/running/shoes/daily-trainers",
      },
      {
        id: "easy",
        title: "Easy & recovery",
        description:
          "Secure platforms and protective cushion often pair well with easy-day volume.",
        href: "/running/shoes?usecase=recovery-runs",
      },
      {
        id: "long",
        title: "Long runs",
        description:
          "Comfort, platform stability and fit become especially important as time on feet increases.",
        href: "/best/running-shoes-long-runs",
      },
      {
        id: "tempo",
        title: "Tempo / faster work",
        description:
          "Lighter, less intrusive guidance can matter more; many runners use a separate speed shoe.",
        href: "/running/shoes?type=tempo",
      },
      {
        id: "race",
        title: "Racing",
        description:
          "Dedicated stability race options are uncommon. Selection depends on catalog models and personal preference.",
        href: "/best/race-shoes",
      },
      {
        id: "treadmill",
        title: "Treadmill",
        description:
          "Road stability dailies generally transfer well indoors; prioritise fit and breathability.",
      },
    ],
  },
  {
    id: "tradeoffs",
    type: "prose" as const,
    title: "Trade-offs of stability shoes",
    paragraphs: [
      "Choosing a guided platform can mean giving something up. Extra structure may add weight. The ride can feel less free or less flexible. Some runners find high-support shoes less enjoyable for faster efforts.",
      "These trade-offs are contextual. A max-cushion stability shoe that feels perfect for Sunday long runs may be the wrong tool for Tuesday intervals — and that is fine. Rotation exists for a reason.",
    ],
  },
  {
    id: "pros-cons",
    type: "pros-tradeoffs" as const,
    title: "What you may gain — and give up",
    gains: [
      "A more guided or secure platform feel",
      "Geometry that feels planted on soft foam",
      "Support-oriented options with strong width ladders (model-dependent)",
      "Clear daily/easy-run role in a multi-shoe rotation",
    ],
    giveUps: [
      "Some freedom of motion vs a freer neutral ride",
      "Potentially higher weight for similar stack",
      "Less ideal feel for pure speed preference (often)",
      "Unnecessary control if you prefer neutral platforms",
    ],
    footnote:
      "Not universal — compare specific models. Preference and fit outweigh category stereotypes.",
  },
  {
    id: "how-to-choose",
    type: "prose" as const,
    title: "How to choose a stability shoe",
    paragraphs: [
      "Treat selection as a decision process, not a label hunt. Comfort and fit come first. Stability preference comes second. Training use, cushioning, width and pace character follow. Then compare shortlisted models on specs and ride descriptions — and use the Finder if you want a structured shortlist.",
    ],
  },
  {
    id: "decision-flow",
    type: "decision-flow" as const,
    title: "A practical decision process",
    steps: [
      {
        id: "s1",
        title: "Start with comfort and fit",
        body: "Length, width and heel lockdown beat any support marketing claim.",
      },
      {
        id: "s2",
        title: "Decide guided vs freer preference",
        body: "Do you want a more secure platform, or a freer neutral feel? If unsure, compare one of each.",
      },
      {
        id: "s3",
        title: "Match the shoe to your training",
        body: "Daily/easy/long volume favour comfort-oriented stability; speed work may need a different tool.",
      },
      {
        id: "s4",
        title: "Choose cushioning level",
        body: "Maximum, high or medium cushion — independent of how much guidance you want.",
      },
      {
        id: "s5",
        title: "Check width and platform",
        body: "Confirm official widths and remember: upper width ≠ midsole platform width.",
      },
      {
        id: "s6",
        title: "Consider weight and pace",
        body: "Heavier guided shoes can be excellent for easy miles and less ideal for workouts.",
      },
      {
        id: "s7",
        title: "Compare closest options",
        body: "Use side-by-side specs: stability classification, cushion, drop, widths, midsole approach.",
      },
      {
        id: "s8",
        title: "Use the Finder if unsure",
        body: "The Running Shoe Finder considers use, terrain, fit, cushion and support preference — not a medical gait exam.",
      },
    ],
    branches: {
      question: "Do you already know you prefer extra support?",
      options: [
        {
          label: "Yes",
          result: "Evaluate stability shoes that match your cushion and width needs.",
        },
        {
          label: "Not sure",
          result:
            "Prioritise fit/comfort and compare a neutral option alongside a mild or moderate stability shoe.",
        },
        {
          label: "Mostly easy / long",
          result: "Emphasise cushioning, platform security and fit for time on feet.",
        },
        {
          label: "Includes faster work",
          result:
            "Consider milder guidance or a separate speed shoe rather than forcing max support into every session.",
        },
      ],
    },
  },
  {
    id: "finder-cta",
    type: "cta" as const,
    title: "Not sure which type you need?",
    variant: "finder" as const,
    body: "Use the Running Shoe Finder for a shortlist based on how you run, terrain, fit, cushion preference, support preference and budget. It does not diagnose gait or prescribe medical footwear.",
    ctaLabel: "Find my running shoes →",
    href: "/tools/running-shoe-finder",
  },
  {
    id: "examples",
    type: "product-examples" as const,
    title: "Examples of different stability approaches",
    disclaimer:
      "These are current catalog examples that illustrate different approaches — not an automatic “best of” ranking. For curated awards, see Best Stability Running Shoes.",
    examples: [
      {
        productId: "prod-kayano-32",
        approachLabel: "Higher-support / max-cushion example",
        whyIllustrates:
          "Pairs maximum cushioning with ASICS 4D GUIDANCE SYSTEM for a clearly support-oriented daily and long-run platform, plus a wide width ladder.",
        bestFor: [
          "Easy and long volume",
          "Runners wanting plush + guided",
          "Width-sensitive fit",
        ],
        tradeoff:
          "Heavier and less lively than neutral dailies or milder stability shoes — not built for fast intervals.",
      },
      {
        productId: "prod-adrenaline-gts-25",
        approachLabel: "GuideRails daily stability example",
        whyIllustrates:
          "Brooks GuideRails approach with high cushion and an extensive width range — a classic daily stability trainer role.",
        bestFor: [
          "Daily training",
          "Runners who like GuideRails feel",
          "Wide / extra-wide needs",
        ],
        tradeoff:
          "Higher drop and a controlled ride that may feel less free for speed-focused preferences.",
      },
      {
        productId: "prod-gt-2000-14",
        approachLabel: "Milder / approachable stability example",
        whyIllustrates:
          "Catalog mild-stability classification with medium cushion — useful when you want guidance without a max-support package.",
        bestFor: [
          "Everyday stability at moderate cushion",
          "Value-focused stability shopping",
          "Milder guidance preference",
        ],
        tradeoff:
          "Less plush protection than Kayano-class max-cushion stability.",
      },
      {
        productId: "prod-structure-plus",
        approachLabel: "Higher-spec stability chassis example",
        whyIllustrates:
          "Nike Structure Plus pairs support geometry with more responsive high cushioning for runners who want guided miles with a livelier foam story.",
        bestFor: [
          "Daily and longer guided miles",
          "Runners wanting responsive + support",
        ],
        tradeoff:
          "Narrower official width story than Brooks/ASICS ladders in this set; confirm fit carefully.",
      },
    ],
  },
  {
    id: "compare-table",
    type: "product-comparison" as const,
    title: "How current stability shoes differ",
    productIds: [
      "prod-kayano-32",
      "prod-adrenaline-gts-25",
      "prod-gt-2000-14",
      "prod-structure-plus",
    ],
    bestGuideHref: "/best/stability-running-shoes",
    bestGuideLabel: "Best Stability Running Shoes →",
    compareHref:
      "/compare?category=running-shoes&products=asics-gel-kayano-32,brooks-adrenaline-gts-25,asics-gt-2000-14,nike-structure-plus",
  },
  {
    id: "score-note",
    type: "callout" as const,
    title: "Kitletics Score ≠ more stability",
    tone: "neutral" as const,
    body: "A higher Kitletics Score assesses overall product quality in category context. It does not mean “more stable.” Stability is one product characteristic. Finder Match is personalized to your inputs — different from the Score.",
  },
  {
    id: "mistakes",
    type: "mistakes" as const,
    title: "Common mistakes",
    mistakes: [
      {
        id: "label",
        title: "Choosing only from the word “stability”",
        body: "Category labels hide big differences in cushion, weight and guidance style. Compare the actual model.",
      },
      {
        id: "fit",
        title: "Ignoring fit",
        body: "Support cannot rescue a poor length, width or heel lock. Fit first.",
      },
      {
        id: "more",
        title: "Assuming more support is always better",
        body: "Unnecessary guidance can feel restrictive. Preference and comfort matter.",
      },
      {
        id: "marketing",
        title: "Using product marketing as a diagnosis",
        body: "Brand copy is not a gait analysis. Seek clinical advice for pain or injury concerns.",
      },
      {
        id: "cushion",
        title: "Ignoring cushioning and ride",
        body: "Two stability shoes can feel completely different underfoot. Soft vs firm still matters.",
      },
      {
        id: "score",
        title: "Buying on Score alone",
        body: "Kitletics Score is not a personal match and does not measure “how much stability.”",
      },
      {
        id: "sessions",
        title: "Ignoring what runs you do",
        body: "Easy-volume stability tools are often poor substitutes for speed shoes — and vice versa.",
      },
    ],
  },
  {
    id: "best-cta",
    type: "cta" as const,
    title: "Want recommendations rather than explanation?",
    variant: "best-guide" as const,
    body: "This guide teaches the concept. Best Stability Running Shoes shortlists current awards and decision roles.",
    ctaLabel: "Best Stability Running Shoes →",
    href: "/best/stability-running-shoes",
  },
];

export const stabilityShoesExplainedConfig: LongFormGuideConfig = {
  guideSlug: "stability-shoes-explained",
  layout: "explainer",
  eyebrow: "Explainer",
  displayTitle: "Stability Running Shoes Explained",
  deck: "How modern stability shoes create a more guided, secure ride, how they differ from neutral shoes, and what to consider when deciding whether one belongs in your rotation.",
  heroImageSrc: "/images/running/products/kayano-32-hero.jpg",
  heroImageAlt: "ASICS GEL-Kayano 32 stability running shoe",
  finder: {
    toolSlug: "running-shoe-finder",
    title: "Not sure which type you need?",
    description:
      "Get a shortlist based on use, terrain, fit, cushion and support preference — not a medical gait exam.",
    ctaLabel: "Find my running shoes →",
  },
  decisionLinks: [
    {
      label: "Best stability shoes →",
      href: "/best/stability-running-shoes",
    },
    {
      label: "Compare stability shoes →",
      href: "/compare?category=running-shoes&products=asics-gel-kayano-32,brooks-adrenaline-gts-25,asics-gt-2000-14,nike-structure-plus",
    },
    {
      label: "How to choose running shoes →",
      href: "/guides/how-to-choose-running-shoes",
    },
  ],
  glossaryHref: "/guides/running-shoe-terminology",
  glossaryTerms: [
    {
      id: "neutral",
      term: "Neutral",
      definition: "Platform with minimal dedicated guidance structures.",
      icon: "circle",
    },
    {
      id: "stability",
      term: "Stability",
      definition: "Designs that create a more guided or secure platform.",
      icon: "shield",
    },
    {
      id: "medial-post",
      term: "Medial post",
      definition: "Denser medial midsole material used in traditional support designs.",
      icon: "layers",
    },
    {
      id: "guide-rail",
      term: "Guide rail",
      definition: "Structures that influence motion without a classic dense post.",
      icon: "gauge",
    },
    {
      id: "sidewall",
      term: "Sidewall",
      definition: "Foam or structure rising around the sides of the footbed.",
      icon: "scale",
    },
    {
      id: "platform-width",
      term: "Platform width",
      definition: "Midsole base width — distinct from upper width options.",
      icon: "ruler",
    },
    {
      id: "heel-counter",
      term: "Heel counter",
      definition: "Structure shaping and securing the rearfoot.",
      icon: "circle",
    },
  ],
  needs: [],
  factors: [],
  fit: [],
  toc: tocFromExplainer([...STABILITY_BLOCKS]),
  productExampleRoles: [
    { productId: "prod-kayano-32", roleLabel: "Max-cushion stability" },
    { productId: "prod-adrenaline-gts-25", roleLabel: "GuideRails daily" },
    { productId: "prod-gt-2000-14", roleLabel: "Milder stability" },
    { productId: "prod-structure-plus", roleLabel: "Responsive stability" },
  ],
  productRailTitle: "Examples of different stability approaches",
  productRailBrowseHref: "/running/shoes/stability",
  productRailBrowseLabel: "Browse stability shoes →",
  explainer: {
    layout: "explainer",
    quickAnswerBullets: [
      "Stability shoes are designed to create a more guided or secure platform than typical neutral trainers.",
      "Modern models increasingly use geometry, sidewalls and broader platforms — not only aggressive medial posts.",
      "More stability is not automatically better; preference and comfort matter.",
      "Fit, cushioning and intended use matter as much as the stability label.",
      "Kitletics does not diagnose gait or prescribe stability footwear as medical treatment.",
    ],
    medicalNote:
      "Kitletics explains product design. We do not diagnose overpronation, treat injury, or prescribe medical footwear. Seek qualified clinical advice when you have pain or injury concerns.",
    methodologyNote:
      "This guide combines manufacturer technical descriptions, catalog specifications (stability, cushionLevel, widths, midsole) and independent specialist coverage. Product examples and comparison values are rendered from live catalog data — not hardcoded prices.",
    blocks: [...STABILITY_BLOCKS],
  },
};
