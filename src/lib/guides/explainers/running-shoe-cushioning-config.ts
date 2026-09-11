/**
 * Running Shoe Cushioning Explained — separating stack, softness and response.
 */
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import type { LongFormGuideConfig } from "@/lib/guides/long-form-config";

const CUSHIONING_BLOCKS: ExplainerBlock[] = [
  {
    id: "what-is-cushioning",
    type: "prose",
    title: "What does running shoe cushioning mean?",
    intro: "Cushioning is a system, not one foam adjective.",
    paragraphs: [
      "Running shoe cushioning describes how the midsole and surrounding geometry manage impact and shape the underfoot ride. The amount of material, how easily it compresses, how quickly it rebounds, the platform shape and the shoe’s stiffness all contribute.",
      "That is why “cushioned” is incomplete on its own. A shoe can be tall but firm, soft but not especially energetic, or highly responsive without feeling plush. Cushioning level, cushion feel and energy return answer different questions.",
      "Kitletics separates those fields so you can compare what a shoe is designed to do. None of them predicts comfort for every runner, and none is a medical claim about injury prevention.",
    ],
  },
  {
    id: "three-concepts",
    type: "comparison-table",
    title: "Stack, softness and energy return are different",
    columns: ["What it describes", "What it can tell you", "What it cannot tell you alone"],
    rows: [
      {
        label: "Stack height",
        values: ["Material height under heel or forefoot", "How tall or protective the platform may be", "Whether the foam feels soft or lively"],
      },
      {
        label: "Cushion feel",
        values: ["How the platform compresses underfoot", "Whether the ride trends plush, soft, balanced or firm", "How much rebound or speed assistance it provides"],
      },
      {
        label: "Energy return",
        values: ["How readily the system rebounds after compression", "Whether the ride may feel lively or responsive", "Whether it feels soft, stable or comfortable to you"],
      },
      {
        label: "Ride character",
        values: ["The overall transition and motion of the shoe", "Whether it feels smooth, rockered or responsive", "A universal ranking of ride quality"],
      },
    ],
    footnote: "Use the fields together. Marketing terms often collapse all four into the word “cushioning.”",
  },
  {
    id: "stack-not-softness",
    type: "callout",
    title: "More stack does not guarantee more softness",
    tone: "accent",
    body: "A tall platform can use firm foam, a plate or stabilising geometry. A lower platform can use a soft compound. Stack measures height; softness describes compression.",
  },
  {
    id: "cushion-levels",
    type: "comparison-table",
    title: "How Kitletics uses cushionLevel",
    intro: "The controlled enum describes the intended amount of cushioning, not a lab score.",
    columns: ["General signal", "Common role", "Important caveat"],
    rows: [
      {
        label: "Minimal",
        values: ["Very little underfoot material/protection", "Specialist ground-feel use", "Not automatically lighter, faster or more natural"],
      },
      {
        label: "Low",
        values: ["Lower cushioning emphasis", "Connected daily or specialist use", "Can still use resilient foam"],
      },
      {
        label: "Medium",
        values: ["Moderate cushioning", "Traditional daily versatility", "May feel softer than some high-stack shoes"],
      },
      {
        label: "High",
        values: ["Strong cushioning emphasis", "Daily, long, tempo or race use", "The ride can be soft, balanced or firm"],
      },
      {
        label: "Maximum",
        values: ["Highest protection/stack emphasis in the catalog", "Easy, recovery and long-run roles", "Max cushion is not automatically plush or stable"],
      },
    ],
    footnote:
      "Catalog classifications support filtering across brands. They do not replace model-specific stack, feel, geometry and use-case data.",
  },
  {
    id: "cushion-factors",
    type: "factor-cards",
    title: "What creates ride character",
    cards: [
      {
        id: "foam",
        title: "Foam compound",
        whatItIs: "The midsole material and its formulation.",
        howItChanges: "Controls compression, resilience, weight and temperature sensitivity.",
        whatYouNotice: "Plush sink, balanced support, firmness or spring.",
      },
      {
        id: "stack",
        title: "Stack height",
        whatItIs: "The vertical amount of material underfoot.",
        howItChanges: "Adds separation from the ground and room for foam deformation.",
        whatYouNotice: "Protection and platform height—not a guaranteed softness level.",
      },
      {
        id: "geometry",
        title: "Geometry and base width",
        whatItIs: "The rocker, sidewalls, heel bevel and footprint of the midsole.",
        howItChanges: "Shapes transitions and can stabilise a tall or soft platform.",
        whatYouNotice: "Rolling, planted, agile or bulky behaviour.",
      },
      {
        id: "plate",
        title: "Plate and stiffness",
        whatItIs: "Carbon, nylon or other structures that resist bending.",
        howItChanges: "Redirects foam deformation and works with rocker geometry.",
        whatYouNotice: "A snappier transition or a less flexible, less relaxed ride.",
      },
      {
        id: "outsole",
        title: "Outsole and construction",
        whatItIs: "Rubber coverage, upper structure and the complete shoe build.",
        howItChanges: "Adds stiffness, weight, grip and durability around the foam.",
        whatYouNotice: "The same midsole can feel different in a different construction.",
      },
      {
        id: "runner",
        title: "Runner and pace",
        whatItIs: "Body mass, stride, speed and time on feet.",
        howItChanges: "Changes how deeply and quickly the system is loaded.",
        whatYouNotice: "A foam one runner calls soft may feel balanced or firm to another.",
      },
    ],
  },
  {
    id: "ride-character",
    type: "prose",
    title: "From plush to responsive: reading the ride",
    paragraphs: [
      "Plush cushioning prioritises a soft, protective sensation. Balanced cushioning limits excess sink and often works across more paces. Firm cushioning can still be highly protective when there is ample material underfoot.",
      "Smooth describes an unobtrusive transition; rockered describes a more obvious rolling geometry; responsive describes a quicker, livelier return. These ride labels are not synonyms for softness.",
      "The useful question is not “How much cushion is best?” It is “What ride character supports this session?” Easy mileage may reward relaxed protection, while faster running may reward lower weight, rebound and a quicker transition.",
    ],
  },
  {
    id: "cushion-matrix",
    type: "matrix",
    title: "Cushion amount × energy return",
    xLow: "Lower cushion level",
    xHigh: "Higher cushion level",
    yLow: "More relaxed rebound",
    yHigh: "Higher energy return",
    cells: [
      {
        id: "bondi",
        x: "high",
        y: "mid",
        label: "Bondi 9",
        productId: "prod-bondi-9",
        description: "Maximum · plush · moderate return",
      },
      {
        id: "clifton",
        x: "high",
        y: "mid",
        label: "Clifton 10",
        productId: "prod-clifton-10",
        description: "Maximum · plush · rockered",
      },
      {
        id: "novablast",
        x: "high",
        y: "high",
        label: "Novablast 6",
        productId: "prod-novablast-6",
        description: "High · soft · high return",
      },
      {
        id: "vaporfly",
        x: "high",
        y: "high",
        label: "Vaporfly 4",
        productId: "prod-vaporfly-4",
        description: "High · firm · very-high return",
      },
    ],
    note: "All four are highly cushioned in catalog terms, yet their feel and intended use differ sharply.",
  },
  {
    id: "max-cushion-tradeoffs",
    type: "pros-tradeoffs",
    title: "Max-cushion benefits and trade-offs",
    gains: [
      "More underfoot material for a protective easy- or long-run feel",
      "Room for rockered geometry that can smooth transitions",
      "Comfort-focused options for long periods on feet",
      "Broad choice across neutral and guided platforms",
    ],
    giveUps: [
      "More foam can add weight and bulk",
      "Tall soft platforms can feel less precise or agile",
      "Plush compression may feel slow when pace rises",
      "Maximum cushion does not guarantee stability, fit or durability",
    ],
    footnote: "Compare specific models; these are category tendencies, not universal outcomes.",
  },
  {
    id: "daily-vs-race-foams",
    type: "prose",
    title: "Daily foams and race foams solve different problems",
    paragraphs: [
      "Daily trainers balance comfort, durability, stability, price and pace range. Their foams may feel plush or bouncy, but the complete package must tolerate repeated mileage and ordinary use.",
      "Race shoes prioritise low weight and energy return. Premium foams often pair with stiff plates and aggressive geometry. A race shoe can carry high cushioning while feeling firmer and less relaxed than a max-cushion recovery shoe.",
      "Do not use high stack or premium foam as shorthand for versatility. The Vaporfly 4 and Bondi 9 both offer substantial cushioning, but one is a carbon-plated racer and the other a plush easy-day tool.",
    ],
  },
  {
    id: "session-context",
    type: "use-case-cards",
    title: "Match cushioning to the session",
    cards: [
      {
        id: "daily",
        title: "Daily training",
        description: "Look for a balanced mix of comfort, durability and pace range rather than the highest possible stack.",
        href: "/running/shoes/daily-trainers",
      },
      {
        id: "easy",
        title: "Easy and recovery",
        description: "Plush or maximum cushioning can work well when relaxed protection matters more than low weight.",
        href: "/running/shoes?usecase=recovery-runs",
      },
      {
        id: "long",
        title: "Long runs",
        description: "Sustained comfort matters, but stable geometry, fit and late-run transition matter too.",
        href: "/best/running-shoes-long-runs",
      },
      {
        id: "workout",
        title: "Tempo and workouts",
        description: "High energy return, lower weight and a quicker transition often matter more than plushness.",
        href: "/running/shoes?type=tempo",
      },
      {
        id: "race",
        title: "Race day",
        description: "Race cushioning aims to rebound efficiently at speed, often through premium foam plus a stiff plate.",
        href: "/best/race-shoes",
      },
    ],
  },
  {
    id: "decision-flow",
    type: "decision-flow",
    title: "How to choose cushioning",
    steps: [
      {
        id: "role",
        title: "Name the primary run",
        body: "Decide whether this is mainly for easy, daily, long, workout or race use.",
      },
      {
        id: "feel",
        title: "Choose a feel direction",
        body: "Plush, soft, balanced or firm is more actionable than simply asking for more foam.",
      },
      {
        id: "return",
        title: "Decide how lively it should be",
        body: "Relaxed mileage and fast running place different value on energy return and stiffness.",
      },
      {
        id: "geometry",
        title: "Check the complete platform",
        body: "Read stack, rocker, base width, stability and drop together.",
      },
      {
        id: "fit",
        title: "Confirm fit and lockdown",
        body: "More cushioning cannot rescue toe pressure, heel slip or the wrong width.",
      },
      {
        id: "tradeoff",
        title: "Accept the role trade-off",
        body: "A plush recovery shoe may be heavy; a race foam may be expensive, stiff and less durable.",
      },
    ],
    branches: {
      question: "What do you want the cushioning to do most?",
      options: [
        { label: "Feel relaxed", result: "Start with plush or soft daily/max-cushion models and check platform stability." },
        { label: "Handle most runs", result: "Prioritise balanced or soft high cushioning with moderate weight and no extreme geometry." },
        { label: "Feel lively", result: "Compare energy return, weight and rocker—not softness alone." },
        { label: "Race fast", result: "Evaluate race-specific foam, plate and fit; do not shop from cushion level alone." },
      ],
    },
  },
  {
    id: "finder-cta",
    type: "cta",
    title: "Turn ride preferences into a shortlist",
    variant: "finder",
    body: "Use the Running Shoe Finder to combine cushioning with training use, terrain, fit and support preference. It recommends product matches, not medical treatment.",
    ctaLabel: "Find my running shoes →",
    href: "/tools/running-shoe-finder",
  },
  {
    id: "product-examples",
    type: "product-examples",
    title: "Four different meanings of cushioned",
    disclaimer:
      "These products illustrate distinct cushioning systems and roles. They are not ranked here; current recommendations belong in the linked Best guides.",
    examples: [
      {
        productId: "prod-bondi-9",
        approachLabel: "Plush maximum-cushion example",
        whyIllustrates: "Maximum cushion, plush feel and moderate energy return create a relaxed, rockered easy-day profile.",
        bestFor: ["Easy and recovery miles", "Long protective days", "Runners prioritising plushness"],
        tradeoff: "More bulk and less pace versatility than lively daily trainers or race shoes.",
      },
      {
        productId: "prod-novablast-6",
        approachLabel: "Versatile high-cushion example",
        whyIllustrates: "Soft high cushioning combines with high energy return for a daily trainer that can feel protective without being purely recovery-focused.",
        bestFor: ["Mixed daily mileage", "Long runs", "Runners wanting soft plus lively"],
        tradeoff: "Tall, soft geometry may feel less planted or direct than a lower, firmer daily shoe.",
      },
      {
        productId: "prod-vaporfly-4",
        approachLabel: "Race-cushion example",
        whyIllustrates: "High cushioning, firm feel, very-high energy return and a carbon plate show how race cushioning prioritises rebound over plushness.",
        bestFor: ["Road racing", "Goal-pace sessions", "Runners comfortable with stiff plated geometry"],
        tradeoff: "Specialised, less relaxed and typically less economical for routine easy mileage.",
      },
      {
        productId: "prod-clifton-10",
        approachLabel: "Plush rockered daily example",
        whyIllustrates: "Maximum cushion and plush CMEVA pair with a 5 mm drop and signature rocker for smooth daily and long-run transitions.",
        bestFor: ["Easy daily running", "Long runs", "Runners who prefer a rolling ride"],
        tradeoff: "Moderate energy return and max-cushion geometry make it less speed-focused than Novablast or Vaporfly.",
      },
    ],
  },
  {
    id: "product-comparison",
    type: "product-comparison",
    title: "Compare four cushioning approaches",
    productIds: [
      "prod-bondi-9",
      "prod-novablast-6",
      "prod-vaporfly-4",
      "prod-clifton-10",
    ],
    bestGuideHref: "/best/max-cushion-running-shoes",
    bestGuideLabel: "Best Max-Cushion Running Shoes →",
    compareHref:
      "/compare?category=running-shoes&products=hoka-bondi-9,asics-novablast-6,nike-vaporfly-4,hoka-clifton-10",
  },
  {
    id: "mistakes",
    type: "mistakes",
    title: "Common cushioning mistakes",
    mistakes: [
      {
        id: "stack-soft",
        title: "Treating stack as softness",
        body: "Height and compression are separate. Check cushion feel and foam construction.",
      },
      {
        id: "soft-return",
        title: "Treating softness as energy return",
        body: "A plush foam can absorb and relax; a firmer race setup can rebound more aggressively.",
      },
      {
        id: "more-better",
        title: "Assuming more cushion is better",
        body: "Extra stack can add weight, bulk and less precise handling. Match the amount to the session.",
      },
      {
        id: "marketing",
        title: "Comparing marketing adjectives across brands",
        body: "“Cloud-like” and “super foam” are not controlled measurements. Use structured specs and role.",
      },
      {
        id: "geometry",
        title: "Ignoring width and stability",
        body: "Tall soft foam needs suitable geometry, and the upper still has to hold your foot securely.",
      },
      {
        id: "race-daily",
        title: "Using race foam as a daily default",
        body: "Race shoes optimise weight and rebound; comfort, durability and cost may be weaker for routine miles.",
      },
      {
        id: "medical",
        title: "Buying cushioning as injury treatment",
        body: "A cushioned ride may be comfortable, but footwear categories do not diagnose, prevent or treat injury.",
      },
    ],
  },
  {
    id: "best-guide-cta",
    type: "cta",
    title: "Want current cushioned-shoe recommendations?",
    variant: "best-guide",
    body: "Use Best Max-Cushion Running Shoes for protective daily options, or Best Running Shoes for Long Runs when sustained comfort is the main job.",
    ctaLabel: "Best Max-Cushion Running Shoes →",
    href: "/best/max-cushion-running-shoes",
  },
];

export const runningShoeCushioningConfig: LongFormGuideConfig = {
  guideSlug: "running-shoe-cushioning",
  layout: "explainer",
  eyebrow: "Explainer",
  displayTitle: "Running Shoe Cushioning Explained",
  deck: "How stack height, softness, energy return and ride geometry combine—and how to choose cushioning for easy miles, daily training, long runs or racing.",
  heroImageSrc: "/images/running/products/bondi-9-hero.jpg",
  heroImageAlt: "HOKA Bondi 9 max-cushion running shoe",
  finder: {
    toolSlug: "running-shoe-finder",
    title: "Find your cushioning match",
    description: "Build a shortlist from training role, ride preference, fit and support—not stack height alone.",
    ctaLabel: "Find my running shoes →",
  },
  decisionLinks: [
    { label: "Best max-cushion shoes →", href: "/best/max-cushion-running-shoes" },
    { label: "Best shoes for long runs →", href: "/best/running-shoes-long-runs" },
    {
      label: "Compare cushioning examples →",
      href: "/compare?category=running-shoes&products=hoka-bondi-9,asics-novablast-6,nike-vaporfly-4,hoka-clifton-10",
    },
  ],
  glossaryHref: "/guides/running-shoe-terminology",
  glossaryTerms: [
    { id: "stack-height", term: "Stack height", definition: "Amount of material between the foot and ground.", icon: "layers" },
    { id: "cushion-level", term: "Cushion level", definition: "Catalog classification for the intended amount of cushioning.", icon: "scale" },
    { id: "cushion-feel", term: "Cushion feel", definition: "How soft, plush, balanced or firm the platform feels.", icon: "circle" },
    { id: "energy-return", term: "Energy return", definition: "How readily the midsole system rebounds after compression.", icon: "gauge" },
    { id: "rocker", term: "Rocker", definition: "Curved geometry that helps roll the shoe through transition.", icon: "ruler" },
    { id: "plate", term: "Plate", definition: "Stiffening structure that works with foam and rocker geometry.", icon: "layers" },
    { id: "platform-width", term: "Platform width", definition: "Width of the midsole base, separate from upper sizing.", icon: "ruler" },
  ],
  needs: [],
  factors: [],
  fit: [],
  toc: tocFromExplainer([...CUSHIONING_BLOCKS]),
  productExampleRoles: [
    { productId: "prod-bondi-9", roleLabel: "Plush maximum cushion" },
    { productId: "prod-novablast-6", roleLabel: "Versatile high cushion" },
    { productId: "prod-vaporfly-4", roleLabel: "Responsive race cushion" },
    { productId: "prod-clifton-10", roleLabel: "Plush rockered daily" },
  ],
  productRailTitle: "Examples of different cushioning approaches",
  productRailBrowseHref: "/running/shoes?cushion=high,maximum",
  productRailBrowseLabel: "Browse cushioned running shoes →",
  explainer: {
    layout: "explainer",
    quickAnswerBullets: [
      "Stack height measures material underfoot; it does not measure softness.",
      "Cushion level, cushion feel, energy return and ride character answer different questions.",
      "Maximum cushion can improve protection and comfort while adding weight, bulk or less precise handling.",
      "Daily foams balance repeated mileage; race foams prioritise low weight and rebound.",
      "Choose cushioning for the session and your ride preference, then confirm fit and platform stability.",
      "Cushioning is product geometry and feel—not a diagnosis, treatment or injury-prevention guarantee.",
    ],
    medicalNote:
      "Kitletics describes footwear construction and ride. Cushioning classifications do not diagnose injury or guarantee prevention, recovery or pain relief. Consult a qualified clinician for persistent pain or medical footwear questions.",
    methodologyNote:
      "This guide uses controlled catalog fields (cushionLevel, cushionFeel, energyReturn, rideCharacter, stack, stability and plate) alongside manufacturer technical descriptions and independent specialist coverage. Product examples render from live catalog data rather than hardcoded prices.",
    blocks: [...CUSHIONING_BLOCKS],
  },
};
