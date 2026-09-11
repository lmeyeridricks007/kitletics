/**
 * Pre-launch 05 — Packs/Vests, Socks, Headphones enrichment.
 * Expert-research summaries only (no invented first-hand testing).
 * Mirrors shoes-launch-ready-enrichment.ts patterns.
 */

import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import { NEW_PRICING_OFFERS } from "@/content/offers-pricing-refresh";

const pub = publishedMeta();

export type GearCorePatch = {
  familyId?: string;
  reviewId?: string;
  offerIds?: string[];
  verdict: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription?: string;
  strengths?: string[];
  weaknesses?: string[];
  alternativeProductIds?: string[];
  positioningLabel: string;
};

type ReviewSeed = {
  productId: string;
  slug: string;
  title: string;
  name: string;
  job: string;
  shortlist: string;
  pause: string;
  pros: string[];
  cons: string[];
  alts: string[];
  score: number;
  specLines: string[];
};

const OFFER_BY_PRODUCT = new Map<string, string[]>();
for (const o of NEW_PRICING_OFFERS) {
  const list = OFFER_BY_PRODUCT.get(o.productId) ?? [];
  if (!list.includes(o.id)) list.push(o.id);
  OFFER_BY_PRODUCT.set(o.productId, list);
}

function offersFor(productId: string): string[] | undefined {
  const ids = OFFER_BY_PRODUCT.get(productId);
  return ids?.length ? ids : undefined;
}

function reviewIdFor(productId: string): string {
  return `review-${productId.replace(/^prod-/, "")}`;
}

function buildReview(seed: ReviewSeed): Review {
  const id = reviewIdFor(seed.productId);
  const whoBuy = [
    `You want ${seed.shortlist} as a weekly priority — that is the ${seed.name}'s main job`,
    `Most of your sessions line up with ${seed.job} more than an adjacent specialty role`,
    seed.pros[0]
      ? `You specifically need ${seed.pros[0].toLowerCase()} more than a generic category pick`
      : `Your week matches the ${seed.name} role more often than not`,
  ];
  const whoAvoid = [
    `You need to avoid ${seed.pause} — forcing the ${seed.name} into that job usually disappoints`,
    `Your must-haves conflict with a ${seed.name} trade-off: ${seed.cons[0] ?? seed.pause}`,
    `Your fit, carry, or awareness needs sit outside what this product was built to do`,
  ];
  const bottomLine = `${seed.job}. I'd shortlist it when you want ${seed.shortlist}. I'd pause if ${seed.pause} shows up often in your week.`;
  const verdict = `Buy the ${seed.name} when ${seed.job.toLowerCase()} matches most of your week — not as a default for every session. It earns a look for ${seed.shortlist}. Look elsewhere if ${seed.pause}.`;

  return {
    id,
    slug: seed.slug,
    productId: seed.productId,
    title: seed.title,
    reviewType: "expert-research",
    bottomLine,
    verdict,
    score: seed.score,
    summary: bottomLine,
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    editorialDisclosure:
      "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict.",
    sections: [
      {
        id: "sec-overview",
        heading: "What it is",
        body: `${seed.job}.\n\n${seed.name} is built for a specific job in the category — use that job as your first filter.\n\nI'd shortlist it when you want ${seed.shortlist}.\n\nI'd pause if ${seed.pause} would show up often in your week.\n\nBottom line: ${bottomLine}`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-verified-specs",
        heading: "Key specs",
        body: `Here are the numbers that matter for the ${seed.name}:\n\n${seed.specLines.map((l) => `• ${l}`).join("\n")}\n\nTreat specs as filters for capacity, fit, battery, waterproofing and construction — not the whole buying story. Try before you commit when you can, or buy somewhere returns are easy.`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-strengths",
        heading: "Where it is strongest",
        body: `I'd buy the ${seed.name} when these outcomes match what you need most weeks:\n\nWhat it does well\n${seed.pros.map((p) => `• ${p}`).join("\n")}\n\nThe standout is ${seed.pros[0]?.toLowerCase() ?? seed.shortlist}. If that is your main weekly need, keep going. If not, check trade-offs and alternatives.`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-tradeoffs",
        heading: "Trade-offs & limits",
        body: `The ${seed.name} is not trying to do every job. These are the compromises to weigh:\n\n${seed.cons.map((c) => `• ${c}`).join("\n")}\n\nSkip it if: You need to avoid ${seed.pause}.\n\nThose limits matter when they hit your primary sessions — not when they only show up once a month.`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-usecase",
        heading: "Who it is for",
        body: `I'd buy the ${seed.name} when most of your weekly sessions match what it does well.\n\nBest when you want\n${whoBuy.map((w) => `• ${w}`).join("\n")}\n\nLook elsewhere when\n${whoAvoid.map((w) => `• ${w}`).join("\n")}`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-value",
        heading: "Value",
        body: `You are mainly paying for ${seed.shortlist}.\n\nYou are also accepting ${seed.pause} — fine when that is not your weekly mix.\n\nCheck live street price in the offers module. I'd pay the premium when the role is clear; otherwise compare the linked alternatives.`,
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    pros: seed.pros,
    cons: seed.cons,
    whoShouldBuy: whoBuy,
    whoShouldAvoid: whoAvoid,
    scoreBreakdown: [
      { key: "role-fit", label: "Role fit", score: seed.score, max: 100, note: "Editorial" },
      { key: "value", label: "Value", score: Math.max(70, seed.score - 6), max: 100, note: "Editorial" },
    ],
    evidenceIds: ["ev-catalog-editorial"],
    alternativeProductIds: seed.alts,
    comparisonIds: [],
    faqIds: [],
    seoTitle: `${seed.name} Review: Verdict, Pros & Alternatives | Kitletics`,
    seoDescription: `Expert research review of ${seed.name} — who it's for, trade-offs, key specs and alternatives.`,
    ...pub,
  };
}

const REVIEW_SEEDS: ReviewSeed[] = [
  // ── Packs / vests ────────────────────────────────────────────────────────
  {
    productId: "prod-camelbak-zephyr-pro",
    slug: "camelbak-zephyr-pro",
    title: "CamelBak Zephyr Pro Review",
    name: "CamelBak Zephyr Pro",
    job: "~11L race/trail vest with Crux bladder compatibility plus front flask options",
    shortlist: "bladder + flask flexibility on longer trail days",
    pause: "you only need a flask-only 5–6L race vest",
    pros: [
      "Bladder + flask flexibility for hot ultras",
      "~11L covers layers without a 15L run-hike pack",
      "More organization than the standard Zephyr",
    ],
    cons: [
      "Heavier than flask-only race vests",
      "Crux reservoir often sold separately",
    ],
    alts: ["prod-camelbak-zephyr", "prod-camelbak-apex-pro", "prod-nathan-pinnacle-12"],
    score: 86,
    specLines: [
      "Capacity: 11 L",
      "Weight: 340 g",
      "Included flasks: 2",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: S–XL",
    ],
  },
  {
    productId: "prod-osprey-dyna-lt",
    slug: "osprey-dyna-lt",
    title: "Osprey Dyna LT Review",
    name: "Osprey Dyna LT",
    job: "Women’s minimal soft-flask race vest with Dyna harness shaping",
    shortlist: "women-specific minimal race carry",
    pause: "you need pole-heavy ultra volume or a men’s Duro LT cut",
    pros: [
      "Women-specific Dyna harness on a true minimal vest",
      "Soft-flask workflow without Dyna 6 bulk",
      "Light bounce control for fast days",
    ],
    cons: [
      "Not enough volume for pole-heavy trail ultras",
      "Gender-specific patterning — men need Duro LT",
    ],
    alts: ["prod-osprey-duro-lt", "prod-osprey-dyna-6", "prod-salomon-adv-skin-5"],
    score: 85,
    specLines: [
      "Capacity: 1.5 L",
      "Weight: 155 g",
      "Included flasks: 2",
      "Bladder compatible: no",
      "Pole attachment: no",
      "Size range: XS–L",
    ],
  },
  {
    productId: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    title: "Osprey Duro 15 Review",
    name: "Osprey Duro 15",
    job: "Men’s 15L run-hike Osprey for long trail days and kit-heavy ultras",
    shortlist: "true run-hike capacity with Hydraulics support",
    pause: "you only need a flask race vest for road or short trail",
    pros: [
      "True run-hike capacity for layers and poles",
      "Hydraulics ecosystem matches Osprey hiking kits",
      "Stable men’s Duro harness at high volume",
    ],
    cons: [
      "Too much pack for road races",
      "Bounce risk if under-packed",
    ],
    alts: ["prod-osprey-duro-6", "prod-nathan-pinnacle-12", "prod-ud-fastpack-20"],
    score: 84,
    specLines: [
      "Capacity: 15 L",
      "Weight: 490 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Bounce control: moderate",
      "Size range: S–L",
    ],
  },
  {
    productId: "prod-compressport-ultrun-s-pack",
    slug: "compressport-ultrun-s-pack",
    title: "Compressport Ultrun S Pack Review",
    name: "Compressport Ultrun S Pack",
    job: "Compression-fit race vest for trail/ultra flask carry",
    shortlist: "second-skin bounce control on race days",
    pause: "you need structured 8–12L adventure volume",
    pros: [
      "Second-skin compression keeps flasks planted",
      "Light race profile for fast mountain days",
      "Pairs cleanly with Compressport belt extras",
    ],
    cons: [
      "Compression sizing is unforgiving",
      "Limited structured volume vs adventure vests",
    ],
    alts: ["prod-nnormal-race-vest", "prod-salomon-adv-skin-5", "prod-ud-race-vest-6"],
    score: 83,
    specLines: [
      "Capacity: 5 L",
      "Weight: 180 g",
      "Included flasks: 2",
      "Pole attachment: yes",
      "Bounce control: high",
      "Size range: XS–XL",
    ],
  },
  {
    productId: "prod-ud-fastpack-20",
    slug: "ultimate-direction-fastpack-20",
    title: "Ultimate Direction Fastpack 20 Review",
    name: "Ultimate Direction Fastpack 20",
    job: "Vest-harness ~23L day/fastpack when race vests run out of kit space",
    shortlist: "front access with real fastpacking volume",
    pause: "you only need a flask-only race vest",
    pros: [
      "Vest-like front access with pack volume",
      "Reservoir sleeve plus front bottles",
      "Roll-top kit access beats sealed race-vest rears",
    ],
    cons: [
      "Heavier/warmer than flask race vests",
      "Men’s patterning — women start with FastpackHer",
    ],
    alts: ["prod-ud-race-vest-6", "prod-adv-skin-12", "prod-osprey-talon-velocity-20"],
    score: 87,
    specLines: [
      "Capacity: 23 L",
      "Weight: 590 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Bounce control: high",
      "Size range: S/M–M/L",
    ],
  },
  {
    productId: "prod-ud-fastpack-her-20",
    slug: "ultimate-direction-fastpack-her-20",
    title: "Ultimate Direction FastpackHer 20 Review",
    name: "Ultimate Direction FastpackHer 20",
    job: "Women’s ~23L Fastpack sibling for overnight kit and layers",
    shortlist: "women’s torso patterning without dropping Fastpack volume",
    pause: "you want the lightest flask-only race day vest",
    pros: [
      "Women’s torso/chest patterning",
      "Same front-bottle + roll-top workflow as Fastpack 20",
      "Clear step up from Race Vest 6",
    ],
    cons: [
      "Still a pack — not lightest for flask-only races",
      "Needs careful chest/torso check vs Tempest Velocity",
    ],
    alts: ["prod-osprey-tempest-velocity-20", "prod-ud-race-vest-6", "prod-adv-skin-12"],
    score: 86,
    specLines: [
      "Capacity: 23 L",
      "Weight: 580 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: XS/S–M/L",
    ],
  },
  {
    productId: "prod-ud-fastpack-30",
    slug: "ultimate-direction-fastpack-30",
    title: "Ultimate Direction Fastpack 30 Review",
    name: "Ultimate Direction Fastpack 30",
    job: "30L Fastpack for multi-day fastpacking and heavy mandatory-kit ultras",
    shortlist: "overnight volume with vest-style front access",
    pause: "supported ultras or road longs where Fastpack 20 is enough",
    pros: [
      "True overnight fastpacking volume",
      "Reservoir + bottles for remote multi-day routes",
      "Compression keeps half-full packs from hiking bounce",
    ],
    cons: [
      "Overkill for supported ultras",
      "Heavier empty than Fastpack 20",
    ],
    alts: ["prod-ud-fastpack-20", "prod-osprey-talon-velocity-30", "prod-black-diamond-distance-22"],
    score: 84,
    specLines: [
      "Capacity: 30 L",
      "Weight: 700 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: S/M–M/L",
    ],
  },
  {
    productId: "prod-osprey-talon-velocity-20",
    slug: "osprey-talon-velocity-20",
    title: "Osprey Talon Velocity 20 Review",
    name: "Osprey Talon Velocity 20",
    job: "Men’s 20L multi-sport running daypack with vest-inspired harness",
    shortlist: "Osprey fit system and alpine trail day features",
    pause: "you want a lighter Fastpack or Distance alpine pack",
    pros: [
      "Osprey torso fit dials better than most race vests",
      "Helmet shove-it and pole/axe points",
      "External hydration sleeve for bladder days",
    ],
    cons: [
      "Heavier empty than Fastpack 20 / Distance 15",
      "Men’s Talon cut — women look at Tempest Velocity",
    ],
    alts: ["prod-ud-fastpack-20", "prod-osprey-duro-15", "prod-black-diamond-distance-15"],
    score: 85,
    specLines: [
      "Capacity: 20 L",
      "Weight: 870 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: S/M–L/XL",
    ],
  },
  {
    productId: "prod-osprey-tempest-velocity-20",
    slug: "osprey-tempest-velocity-20",
    title: "Osprey Tempest Velocity 20 Review",
    name: "Osprey Tempest Velocity 20",
    job: "Women’s 20L Velocity running/fastpacking daypack",
    shortlist: "women’s Osprey patterning with alpine daypack features",
    pause: "you want ADV Skin / Dyna race-vest minimalism",
    pros: [
      "Women’s Osprey patterning with Velocity features",
      "Helmet and pole carry for alpine trail days",
      "Pairs with Osprey Hydraulics reservoirs",
    ],
    cons: [
      "Not as light as race vests",
      "Pack structure can feel warm on hot tempo days",
    ],
    alts: ["prod-ud-fastpack-her-20", "prod-osprey-talon-velocity-20", "prod-adv-skin-12"],
    score: 85,
    specLines: [
      "Capacity: 20 L",
      "Weight: 850 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: XS/S–S/M",
    ],
  },
  {
    productId: "prod-osprey-talon-velocity-30",
    slug: "osprey-talon-velocity-30",
    title: "Osprey Talon Velocity 30 Review",
    name: "Osprey Talon Velocity 30",
    job: "Men’s 30L Talon Velocity for heavier fastpacking and alpine day loads",
    shortlist: "Osprey load carry when sleep kit or cold layers stack up",
    pause: "supported ultras and road training",
    pros: [
      "Osprey load carry scales better than stuffing a 12L vest",
      "Helmet and pole/axe attachments",
      "Clear size step from Talon Velocity 20",
    ],
    cons: [
      "Too much pack for supported ultras",
      "Heavier / less race-agile than UD Fastpack 30",
    ],
    alts: ["prod-ud-fastpack-30", "prod-osprey-talon-velocity-20", "prod-black-diamond-distance-22"],
    score: 83,
    specLines: [
      "Capacity: 30 L",
      "Weight: 980 g",
      "Bladder compatible: yes",
      "Pole attachment: yes",
      "Size range: S/M–L/XL",
    ],
  },
  {
    productId: "prod-black-diamond-distance-15",
    slug: "black-diamond-distance-15",
    title: "Black Diamond Distance 15 Review",
    name: "Black Diamond Distance 15",
    job: "15L alpine running backpack with vest harness (not Distance 8 race vest)",
    shortlist: "light alpine pack volume with Z-pole sleeves",
    pause: "you need a bladder sleeve for reservoir-first ultras",
    pros: [
      "Much lighter empty than most 15–20L running packs",
      "Built-in Z-pole sleeves for alpine terrain",
      "Clear step up from Distance 8 without jumping to 22L",
    ],
    cons: [
      "No bladder sleeve",
      "Alpine focus is narrower than Osprey Velocity multi-sport",
    ],
    alts: ["prod-black-diamond-distance-22", "prod-ud-fastpack-20", "prod-osprey-talon-velocity-20"],
    score: 86,
    specLines: [
      "Capacity: 15 L",
      "Weight: ~light alpine pack class",
      "Bladder compatible: no",
      "Pole attachment: yes (Z-pole sleeves)",
      "Bounce control: high",
    ],
  },
  {
    productId: "prod-black-diamond-distance-22",
    slug: "black-diamond-distance-22",
    title: "Black Diamond Distance 22 Review",
    name: "Black Diamond Distance 22",
    job: "22L alpine running backpack for bigger mountain day loads",
    shortlist: "alpine day volume with Distance vest harness DNA",
    pause: "you only need Distance 8 / 15 for lighter mountain days",
    pros: [
      "More volume than Distance 15 for cold layers",
      "Alpine pole/carry focus stays intact",
      "Lighter ethos than many 20–30L multi-sport packs",
    ],
    cons: [
      "Still no bladder-first story",
      "Overkill for flask-only races",
    ],
    alts: ["prod-black-diamond-distance-15", "prod-ud-fastpack-20", "prod-osprey-talon-velocity-20"],
    score: 85,
    specLines: [
      "Capacity: 22 L",
      "Pole attachment: yes",
      "Bladder compatible: limited / not primary",
      "Alpine running daypack role",
    ],
  },
  {
    productId: "prod-salomon-xa-15",
    slug: "salomon-xa-15",
    title: "Salomon XA 15 Review",
    name: "Salomon XA 15",
    job: "Salomon 15L trail running pack bridging race vest and daypack",
    shortlist: "Salomon fit with mid-volume trail day carry",
    pause: "you want ADV Skin race minimalism or a true 20L+ fastpack",
    pros: [
      "Familiar Salomon harness feel",
      "Mid volume for layers without Fastpack bulk",
      "Trail-day storage layout",
    ],
    cons: [
      "Less race-vest agile than ADV Skin 5/12",
      "Less overnight capacity than Fastpack 20/30",
    ],
    alts: ["prod-adv-skin-12", "prod-osprey-duro-15", "prod-ud-fastpack-20"],
    score: 84,
    specLines: [
      "Capacity: 15 L",
      "Salomon XA trail pack role",
      "Pole carry: model-dependent",
      "Trail / adventure run focus",
    ],
  },
  {
    productId: "prod-salomon-custom-quiver",
    slug: "salomon-custom-quiver",
    title: "Salomon Custom Quiver Review",
    name: "Salomon Custom Quiver",
    job: "Modular pole quiver add-on for Salomon vests and packs",
    shortlist: "secure pole carry without jumping vest size",
    pause: "you already have built-in Z-pole sleeves you prefer",
    pros: [
      "Adds pole security to Salomon vest ecosystems",
      "Modular — add only when mountain days need it",
      "Lighter than upsizing to a full alpine pack",
    ],
    cons: [
      "Salomon-ecosystem focused",
      "Extra attachment can bounce if poorly mounted",
    ],
    alts: ["prod-leki-trail-running-quiver", "prod-black-diamond-distance-15", "prod-adv-skin-12"],
    score: 80,
    specLines: [
      "Accessory: pole quiver",
      "Compatibility: Salomon vest/pack mounts",
      "Role: trail poles on mountain days",
    ],
  },
  {
    productId: "prod-ud-utility-bag",
    slug: "ultimate-direction-utility-bag",
    title: "Ultimate Direction Utility Bag Review",
    name: "Ultimate Direction Utility Bag",
    job: "Front utility/stash pouch for UD race vests and Fastpacks",
    shortlist: "extra front phone/food volume without upsizing the vest",
    pause: "you need a universal pouch across every brand vest",
    pros: [
      "Expands front access without a larger vest",
      "Phone-capable stash for Race Vest / Fastpack users",
      "Lightweight vs carrying a second belt",
    ],
    cons: [
      "UD-ecosystem focused",
      "Can bounce if overstuffed",
    ],
    alts: ["prod-nathan-zippered-stash", "prod-salomon-soft-flask-stash", "prod-ud-race-vest-6"],
    score: 81,
    specLines: [
      "Capacity: ~1 L stash",
      "Weight: 35 g",
      "Role: modular front storage",
    ],
  },
  {
    productId: "prod-nathan-zippered-stash",
    slug: "nathan-zippered-stash",
    title: "Nathan Zippered Stash Review",
    name: "Nathan Zippered Stash",
    job: "Zippered phone/stash pouch for vests and belts",
    shortlist: "secure small-kit carry when stretch pockets feel too open",
    pause: "you need hydration — this is stash only",
    pros: [
      "Zip closure feels safer for phones",
      "Adds secure stash without a larger vest",
      "Useful across Nathan vest ecosystems",
    ],
    cons: [
      "Not a hydration solution",
      "Mount quality varies by vest generation",
    ],
    alts: ["prod-ud-utility-bag", "prod-salomon-soft-flask-stash", "prod-nathan-mirage"],
    score: 80,
    specLines: [
      "Capacity: ~0.4 L",
      "Weight: 28 g",
      "Closure: zip",
    ],
  },

  // ── Socks ────────────────────────────────────────────────────────────────
  {
    productId: "prod-swiftwick-aspire-four",
    slug: "swiftwick-aspire-four",
    title: "Swiftwick Aspire Four Review",
    name: "Swiftwick Aspire Four",
    job: "Thin, secure-fit crew/quarter performance sock for lock-down feel",
    shortlist: "thin race-adjacent cushion with secure fit",
    pause: "you prefer Balega-style plush cushion",
    pros: [
      "Thin race-adjacent cushion",
      "Secure Swiftwick fit many runners prefer",
      "Strong blister-focus reputation for long road blocks",
    ],
    cons: [
      "Too thin if you want plush comfort",
      "Premium vs basic athletic socks",
    ],
    alts: ["prod-feetures-elite-light-cushion", "prod-drymax-run-lite-mesh", "prod-balega-hidden-comfort"],
    score: 84,
    specLines: [
      "Height: crew",
      "Cushion: light",
      "Material: Olefin / nylon performance knit",
    ],
  },
  {
    productId: "prod-drymax-run-lite-mesh",
    slug: "drymax-run-lite-mesh",
    title: "Drymax Run Lite-Mesh Review",
    name: "Drymax Run Lite-Mesh",
    job: "Thin moisture-management run sock for hot days and blister-prone runners",
    shortlist: "moisture-focused Lite-Mesh for hot long runs",
    pause: "you want maximum plush comfort over dual-layer feel",
    pros: [
      "Moisture-focused Lite-Mesh build",
      "Blister-oriented dual-layer approach",
      "Light cushion stays race-adjacent",
    ],
    cons: [
      "Fit preference is personal — trial before race day",
      "Less plush than Balega / Bombas",
    ],
    alts: ["prod-wrightsock-coolmesh-ii", "prod-swiftwick-aspire-four", "prod-injinji-run-midweight"],
    score: 83,
    specLines: [
      "Height: crew",
      "Cushion: light",
      "Material: Drymax dual-layer performance yarn",
    ],
  },
  {
    productId: "prod-wrightsock-coolmesh-ii",
    slug: "wrightsock-coolmesh-ii",
    title: "Wrightsock Coolmesh II Review",
    name: "Wrightsock Coolmesh II",
    job: "Dual-layer anti-blister sock with mesh ventilation for hot miles",
    shortlist: "dual-layer blister-focus with warm-weather mesh",
    pause: "you dislike dual-layer sock feel",
    pros: [
      "Dual-layer blister-focus design",
      "Mesh ventilation for warm weather",
      "Distinct approach vs single-layer Feetures / Balega",
    ],
    cons: [
      "Dual-layer feel needs adaptation",
      "Less plush than Balega Hidden Comfort",
    ],
    alts: ["prod-drymax-run-lite-mesh", "prod-injinji-run-midweight", "prod-balega-blister-resist"],
    score: 82,
    specLines: [
      "Height: crew",
      "Cushion: light",
      "Material: Dual-layer Coolmesh synthetic",
    ],
  },
  {
    productId: "prod-balega-hidden-comfort",
    slug: "balega-hidden-comfort",
    title: "Balega Hidden Comfort Review",
    name: "Balega Hidden Comfort",
    job: "No-show running sock with plush Drynamix cushioning for easy daily miles",
    shortlist: "soft hidden cushion in low trainers",
    pause: "you need a structured crew sock for race lockdown",
    pros: [
      "Soft comfort-focused cushion",
      "Stays hidden in low trainers",
      "Easy daily-mile comfort story",
    ],
    cons: [
      "Can slip in aggressive race shoes",
      "Less structured than compression socks",
    ],
    alts: ["prod-feetures-elite-light-cushion", "prod-balega-blister-resist", "prod-swiftwick-aspire-four"],
    score: 85,
    specLines: [
      "Height: no-show",
      "Cushion: medium",
      "Material: Drynamix polyester blend",
    ],
  },

  // ── Headphones ───────────────────────────────────────────────────────────
  {
    productId: "prod-shokz-opendots-one",
    slug: "shokz-opendots-one",
    title: "Shokz OpenDots One Review",
    name: "Shokz OpenDots One",
    job: "Clip-on open TWS for awareness-first easy runs and all-day wear",
    shortlist: "light clip-on open-ear without Bose pricing",
    pause: "you need hook security for hard trail efforts or bone conduction",
    pros: [
      "Very light clip-on open-ear",
      "Wireless charging case with solid single-charge claim",
      "Closer Bose Ultra Open rival than older OpenFit Air",
    ],
    cons: [
      "IP54 and clip hold trail OpenFit 2 / AeroFit hooks",
      "Open-ear leakage in quiet offices",
      "Not bone conduction",
    ],
    alts: ["prod-bose-ultra-open", "prod-shokz-openfit-2", "prod-soundcore-aerofit-2"],
    score: 84,
    specLines: [
      "Type: open-ear clip",
      "Weight: 6.5 g (per bud class)",
      "Battery: ~10 h single charge (claimed)",
      "Water: IP54",
      "ANC: no",
      "Secure fit: moderate",
    ],
  },
  {
    productId: "prod-beats-fit-pro",
    slug: "beats-fit-pro",
    title: "Beats Fit Pro Review",
    name: "Beats Fit Pro",
    job: "Ear-fin Apple TWS with ANC for pocketable sport days",
    shortlist: "wing-tip secureFit with Apple ANC features",
    pause: "you need Powerbeats Pro 2 hook confidence or longer battery",
    pros: [
      "Wing-tip secureFit in a smaller case",
      "ANC/transparency with Apple spatial audio",
      "Often cheaper street price than Powerbeats Pro 2",
    ],
    cons: [
      "Shorter battery / less hook confidence than Powerbeats Pro 2",
      "IPX4 splash only",
      "Aging vs newest Powerbeats Pro 2 feature set",
    ],
    alts: ["prod-beats-powerbeats-pro-2", "prod-airpods-pro-2", "prod-jabra-elite-8-active"],
    score: 83,
    specLines: [
      "Type: in-ear with fin",
      "Battery: ~6 h",
      "Water: IPX4",
      "ANC: yes",
      "Secure fit: high",
    ],
  },
  {
    productId: "prod-soundcore-aerofit-2",
    slug: "soundcore-aerofit-2",
    title: "soundcore AeroFit 2 Review",
    name: "soundcore AeroFit 2",
    job: "Adjustable open-ear hook value pick for awareness-first training",
    shortlist: "open-ear hooks when OpenFit 2 / Bose feel expensive",
    pause: "you need ANC gym isolation",
    pros: [
      "4-level adjustable hooks",
      "Strong battery/case total at value pricing",
      "LDAC + IP55 for outdoor training weeks",
    ],
    cons: [
      "Open-ear bass trails sealed sport buds",
      "Brand prestige trails Shokz/Bose",
      "Not an ANC gym tool",
    ],
    alts: ["prod-shokz-openfit-2", "prod-shokz-opendots-one", "prod-bose-ultra-open"],
    score: 85,
    specLines: [
      "Type: open-ear hook",
      "Weight: ~10 g",
      "Battery: ~10 h",
      "Water: IP55",
      "ANC: no",
      "Secure fit: high",
    ],
  },
  {
    productId: "prod-soundcore-sport-x20",
    slug: "soundcore-sport-x20",
    title: "soundcore Sport X20 Review",
    name: "soundcore Sport X20",
    job: "Adjustable-hook sealed sport TWS with IP68 and long battery",
    shortlist: "IP68 sealed sport buds at value pricing",
    pause: "you need open-ear road awareness as the default",
    pros: [
      "IP68 + rotatable hooks for abuse and odd ears",
      "Long battery claims for big training blocks",
      "ANC sport package at soundcore pricing",
    ],
    cons: [
      "Sealed design needs transparency on busy roads",
      "App/call polish trails Jabra/Apple flagships",
      "Hooks add bulk vs stem commute buds",
    ],
    alts: ["prod-jabra-elite-8-active", "prod-beats-fit-pro", "prod-soundcore-aerofit-2"],
    score: 84,
    specLines: [
      "Type: ear-hook in-ear",
      "Weight: ~6.6 g",
      "Battery: ~12 h",
      "Water: IP68",
      "ANC: yes",
      "Secure fit: high",
    ],
  },
  {
    productId: "prod-apple-airpods-4",
    slug: "apple-airpods-4",
    title: "Apple AirPods 4 Review",
    name: "Apple AirPods 4",
    job: "Open-ish stem TWS for easy/gym Apple days when you hate tips",
    shortlist: "tip-free Apple pairing for mixed commute + easy runs",
    pause: "hard sweaty intervals where secureFit matters most",
    pros: [
      "Tip-free open-ish fit with Adaptive Audio options",
      "Seamless iPhone pairing",
      "More pocketable than hook sport buds",
    ],
    cons: [
      "SecureFit is weak for hard sweaty intervals",
      "Shorter single-charge than dedicated sport TWS",
      "Not a substitute for true open-ear traffic hardware",
    ],
    alts: ["prod-airpods-pro-2", "prod-beats-fit-pro", "prod-shokz-opendots-one"],
    score: 82,
    specLines: [
      "Type: stem TWS",
      "Weight: ~4.3 g",
      "Battery: ~5 h",
      "Water: IP54",
      "ANC: model-dependent",
      "Secure fit: low–moderate",
    ],
  },
];

/** Reviews created for products that previously had no review. */
export const gearCoreLaunchReviews: Review[] = REVIEW_SEEDS.map(buildReview);

const EXISTING_REVIEW_LINKS: Record<string, string> = {
  "prod-airpods-pro-2": "review-airpods-pro-2",
  "prod-bose-ultra-open": "review-bose-ultra-open",
};

export const GEAR_CORE_LAUNCH_PATCHES: Record<string, GearCorePatch> = {
  "prod-camelbak-zephyr-pro": {
    reviewId: reviewIdFor("prod-camelbak-zephyr-pro"),
    offerIds: offersFor("prod-camelbak-zephyr-pro"),
    positioningLabel: "race/trail hydration vest",
    verdict:
      "An ~11L CamelBak race/trail vest for runners who want Crux bladder options plus front flasks on longer days. Skip it if a flask-only 5–6L race vest already covers your kit.",
    seoTitle: "CamelBak Zephyr Pro: Capacity, Fit & Alternatives",
    seoDescription:
      "CamelBak Zephyr Pro vest specs, who it’s for, trade-offs versus Apex Pro / Zephyr, and when to choose a lighter race vest.",
  },
  "prod-osprey-dyna-lt": {
    reviewId: reviewIdFor("prod-osprey-dyna-lt"),
    offerIds: offersFor("prod-osprey-dyna-lt"),
    positioningLabel: "women’s minimal race vest",
    verdict:
      "A women’s minimal soft-flask Osprey race vest when you want Dyna harness shaping without Dyna 6 volume. Skip it for pole-heavy ultras or if you need the men’s Duro LT cut.",
    seoTitle: "Osprey Dyna LT: Women’s Race Vest Specs & Alternatives",
    seoDescription:
      "Osprey Dyna LT capacity, fit, strengths, trade-offs and alternatives versus Duro LT and ADV Skin race vests.",
  },
  "prod-osprey-duro-15": {
    reviewId: reviewIdFor("prod-osprey-duro-15"),
    offerIds: offersFor("prod-osprey-duro-15"),
    positioningLabel: "run-hike trail pack",
    verdict:
      "A men’s 15L Osprey run-hike pack for long trail days and kit-heavy ultras with Hydraulics support. Skip it for road races or flask-only training weeks.",
    seoTitle: "Osprey Duro 15: Capacity, Hydration & Alternatives",
    seoDescription:
      "Osprey Duro 15 run-hike pack specs, who should buy or skip it, and peers like Duro 6 and Fastpack 20.",
  },
  "prod-compressport-ultrun-s-pack": {
    reviewId: reviewIdFor("prod-compressport-ultrun-s-pack"),
    offerIds: offersFor("prod-compressport-ultrun-s-pack"),
    positioningLabel: "compression race vest",
    verdict:
      "A compression-fit Compressport race vest for trail/ultra flask carry when bounce control matters most. Skip it if you need structured 8–12L adventure volume.",
    seoTitle: "Compressport Ultrun S Pack: Fit, Capacity & Alternatives",
    seoDescription:
      "Compressport Ultrun S Pack race-vest specs, compression fit notes, trade-offs and ADV Skin / UD Race Vest peers.",
  },
  "prod-ud-fastpack-20": {
    reviewId: reviewIdFor("prod-ud-fastpack-20"),
    offerIds: offersFor("prod-ud-fastpack-20"),
    positioningLabel: "fastpacking daypack",
    verdict:
      "A vest-harness ~23L UD Fastpack when ADV Skin / Race Vest 6 run out of kit space. Skip it for flask-only race days — women should start with FastpackHer 20.",
    seoTitle: "Ultimate Direction Fastpack 20: Specs & Alternatives",
    seoDescription:
      "UD Fastpack 20 capacity, hydration, strengths, trade-offs and alternatives versus Talon Velocity and ADV Skin 12.",
  },
  "prod-ud-fastpack-her-20": {
    reviewId: reviewIdFor("prod-ud-fastpack-her-20"),
    offerIds: offersFor("prod-ud-fastpack-her-20"),
    positioningLabel: "women’s fastpacking daypack",
    verdict:
      "The women’s Fastpack 20 sibling for overnight kit and layers with shorter/narrower patterning. Skip it if you only need a flask race vest.",
    seoTitle: "UD FastpackHer 20: Women’s Fastpack Specs & Alternatives",
    seoDescription:
      "Ultimate Direction FastpackHer 20 specs, fit notes, trade-offs and Tempest Velocity / Race Vest peers.",
  },
  "prod-ud-fastpack-30": {
    reviewId: reviewIdFor("prod-ud-fastpack-30"),
    offerIds: offersFor("prod-ud-fastpack-30"),
    positioningLabel: "multi-day fastpacking pack",
    verdict:
      "A 30L UD Fastpack for multi-day fastpacking and heavy mandatory-kit ultras. Skip it when Fastpack 20 already covers your sleep/kit stack.",
    seoTitle: "Ultimate Direction Fastpack 30: Capacity & Alternatives",
    seoDescription:
      "UD Fastpack 30 overnight capacity, strengths, trade-offs and peers like Talon Velocity 30 and Distance 22.",
  },
  "prod-osprey-talon-velocity-20": {
    reviewId: reviewIdFor("prod-osprey-talon-velocity-20"),
    offerIds: offersFor("prod-osprey-talon-velocity-20"),
    positioningLabel: "multi-sport running daypack",
    verdict:
      "A men’s 20L Osprey Velocity daypack when you want torso fit dialing and alpine trail features. Skip it if Fastpack 20 or Distance 15 already covers the role lighter.",
    seoTitle: "Osprey Talon Velocity 20: Specs, Fit & Alternatives",
    seoDescription:
      "Osprey Talon Velocity 20 capacity, hydration, alpine features and alternatives versus UD Fastpack 20.",
  },
  "prod-osprey-tempest-velocity-20": {
    reviewId: reviewIdFor("prod-osprey-tempest-velocity-20"),
    offerIds: offersFor("prod-osprey-tempest-velocity-20"),
    positioningLabel: "women’s multi-sport running daypack",
    verdict:
      "The women’s Velocity 20 counterpart for alpine trail days beyond a race vest. Skip it for ADV Skin / Dyna race-vest minimalism.",
    seoTitle: "Osprey Tempest Velocity 20: Specs & Alternatives",
    seoDescription:
      "Osprey Tempest Velocity 20 women’s daypack specs, who it’s for, and peers like FastpackHer 20.",
  },
  "prod-osprey-talon-velocity-30": {
    reviewId: reviewIdFor("prod-osprey-talon-velocity-30"),
    offerIds: offersFor("prod-osprey-talon-velocity-30"),
    positioningLabel: "heavy fastpacking daypack",
    verdict:
      "A men’s 30L Talon Velocity when sleep kit or cold layers outgrow the 20. Skip it for supported ultras and road training.",
    seoTitle: "Osprey Talon Velocity 30: Capacity & Alternatives",
    seoDescription:
      "Osprey Talon Velocity 30 load-carry specs, trade-offs and Fastpack 30 / Distance 22 alternatives.",
  },
  "prod-black-diamond-distance-15": {
    reviewId: reviewIdFor("prod-black-diamond-distance-15"),
    offerIds: offersFor("prod-black-diamond-distance-15"),
    positioningLabel: "alpine running backpack",
    verdict:
      "A 15L Black Diamond alpine running backpack with Z-pole sleeves when Distance 8 is too small. Skip it if you need a bladder-first ultra vest.",
    seoTitle: "Black Diamond Distance 15: Alpine Pack Specs & Alternatives",
    seoDescription:
      "BD Distance 15 capacity, pole carry, strengths, trade-offs and Fastpack / Talon Velocity peers.",
  },
  "prod-black-diamond-distance-22": {
    reviewId: reviewIdFor("prod-black-diamond-distance-22"),
    offerIds: offersFor("prod-black-diamond-distance-22"),
    positioningLabel: "alpine running backpack",
    verdict:
      "A 22L Distance alpine pack for bigger mountain day loads. Skip it when Distance 15 already covers your kit.",
    seoTitle: "Black Diamond Distance 22: Specs & Alternatives",
    seoDescription:
      "BD Distance 22 alpine pack specs, who should buy, trade-offs and Fastpack 20/30 alternatives.",
  },
  "prod-salomon-xa-15": {
    reviewId: reviewIdFor("prod-salomon-xa-15"),
    offerIds: offersFor("prod-salomon-xa-15"),
    positioningLabel: "trail running pack",
    verdict:
      "A Salomon 15L trail pack bridging race vest and daypack. Skip it for pure ADV Skin race minimalism or true overnight Fastpack volume.",
    seoTitle: "Salomon XA 15: Trail Pack Specs & Alternatives",
    seoDescription:
      "Salomon XA 15 capacity, role, trade-offs and alternatives versus ADV Skin 12 and Duro 15.",
  },
  "prod-salomon-custom-quiver": {
    reviewId: reviewIdFor("prod-salomon-custom-quiver"),
    offerIds: offersFor("prod-salomon-custom-quiver"),
    positioningLabel: "pole quiver accessory",
    verdict:
      "A modular Salomon pole quiver when you want secure pole carry without upsizing the vest. Skip it if built-in Z-pole sleeves already solve the job.",
    seoTitle: "Salomon Custom Quiver: Pole Carry Specs & Alternatives",
    seoDescription:
      "Salomon Custom Quiver compatibility, strengths, trade-offs and Leki / Distance pack alternatives.",
  },
  "prod-ud-utility-bag": {
    reviewId: reviewIdFor("prod-ud-utility-bag"),
    offerIds: offersFor("prod-ud-utility-bag"),
    positioningLabel: "vest stash accessory",
    verdict:
      "A UD front utility pouch to add phone/food volume without jumping vest size. Skip it if you need a brand-agnostic stash pouch.",
    seoTitle: "UD Utility Bag: Stash Specs & Alternatives",
    seoDescription:
      "Ultimate Direction Utility Bag capacity, strengths, trade-offs and Nathan / Salomon stash peers.",
  },
  "prod-nathan-zippered-stash": {
    reviewId: reviewIdFor("prod-nathan-zippered-stash"),
    offerIds: offersFor("prod-nathan-zippered-stash"),
    positioningLabel: "phone stash accessory",
    verdict:
      "A Nathan zippered phone/stash pouch when stretch pockets feel too open. Skip it if you need hydration — this is stash only.",
    seoTitle: "Nathan Zippered Stash: Specs & Alternatives",
    seoDescription:
      "Nathan Zippered Stash capacity, strengths, trade-offs and UD Utility Bag peers.",
  },

  "prod-swiftwick-aspire-four": {
    familyId: "fam-swiftwick-aspire",
    reviewId: reviewIdFor("prod-swiftwick-aspire-four"),
    offerIds: offersFor("prod-swiftwick-aspire-four"),
    positioningLabel: "thin performance running sock",
    verdict:
      "A thin, secure-fit Swiftwick crew sock for runners who want lock-down feel without plush bulk. Skip it if you prefer Balega-style cushion.",
    seoTitle: "Swiftwick Aspire Four: Specs, Fit & Alternatives",
    seoDescription:
      "Swiftwick Aspire Four height, cushion, strengths, trade-offs and Feetures / Drymax alternatives.",
    alternativeProductIds: [
      "prod-feetures-elite-light-cushion",
      "prod-drymax-run-lite-mesh",
    ],
  },
  "prod-drymax-run-lite-mesh": {
    familyId: "fam-drymax-run",
    reviewId: reviewIdFor("prod-drymax-run-lite-mesh"),
    offerIds: offersFor("prod-drymax-run-lite-mesh"),
    positioningLabel: "moisture-management running sock",
    verdict:
      "A Drymax Lite-Mesh sock for hot long runs when moisture management and blister-oriented dual-layer feel matter. Skip it if you want maximum plush comfort.",
    seoTitle: "Drymax Run Lite-Mesh: Specs & Alternatives",
    seoDescription:
      "Drymax Run Lite-Mesh materials, cushion, who it’s for, and Wrightsock / Swiftwick peers.",
    alternativeProductIds: [
      "prod-wrightsock-coolmesh-ii",
      "prod-swiftwick-aspire-four",
    ],
  },
  "prod-wrightsock-coolmesh-ii": {
    familyId: "fam-wrightsock-coolmesh",
    reviewId: reviewIdFor("prod-wrightsock-coolmesh-ii"),
    offerIds: offersFor("prod-wrightsock-coolmesh-ii"),
    positioningLabel: "dual-layer blister-focus sock",
    verdict:
      "A Wrightsock Coolmesh II dual-layer sock for hot road/trail miles when blister-focus mesh matters. Skip it if you dislike dual-layer sock feel.",
    seoTitle: "Wrightsock Coolmesh II: Specs & Alternatives",
    seoDescription:
      "Wrightsock Coolmesh II dual-layer design, strengths, trade-offs and Drymax / Injinji alternatives.",
    alternativeProductIds: [
      "prod-drymax-run-lite-mesh",
      "prod-injinji-run-midweight",
    ],
  },
  "prod-balega-hidden-comfort": {
    familyId: "fam-balega-hidden-comfort",
    reviewId: reviewIdFor("prod-balega-hidden-comfort"),
    offerIds: offersFor("prod-balega-hidden-comfort"),
    positioningLabel: "plush no-show running sock",
    shortDescription:
      "No-show running sock with plush Drynamix cushioning for easy daily miles when you want soft comfort that stays hidden in low trainers.",
    strengths: [
      "Soft comfort-focused cushion",
      "Stays hidden in low trainers",
      "Easy daily-mile comfort",
    ],
    weaknesses: [
      "Can slip in aggressive race shoes",
      "Less structured than compression socks",
    ],
    verdict:
      "A plush Balega no-show for easy daily miles in low trainers. Skip it for aggressive race lockdown or structured compression socks.",
    seoTitle: "Balega Hidden Comfort: Specs, Fit & Alternatives",
    seoDescription:
      "Balega Hidden Comfort cushion, height, strengths, trade-offs and Feetures / Blister Resist peers.",
    alternativeProductIds: [
      "prod-feetures-elite-light-cushion",
      "prod-balega-blister-resist",
    ],
  },

  "prod-shokz-opendots-one": {
    reviewId: reviewIdFor("prod-shokz-opendots-one"),
    offerIds: offersFor("prod-shokz-opendots-one"),
    positioningLabel: "open-ear clip headphones",
    verdict:
      "Clip-on Shokz open TWS for awareness-first easy runs without Bose pricing. Skip it for hard trail efforts that need hook security or bone conduction.",
    seoTitle: "Shokz OpenDots One: Specs, Fit & Alternatives",
    seoDescription:
      "Shokz OpenDots One battery, IP rating, strengths, trade-offs and Bose Ultra Open / OpenFit 2 peers.",
  },
  "prod-beats-fit-pro": {
    reviewId: reviewIdFor("prod-beats-fit-pro"),
    offerIds: offersFor("prod-beats-fit-pro"),
    positioningLabel: "ANC sport earbuds",
    verdict:
      "Ear-fin Beats Fit Pro when you want Apple ANC without full Powerbeats hooks. Skip it if you need Powerbeats Pro 2 hook confidence or longer battery.",
    seoTitle: "Beats Fit Pro: Specs, Fit & Alternatives",
    seoDescription:
      "Beats Fit Pro ANC, secureFit, battery, trade-offs and Powerbeats Pro 2 / AirPods Pro peers.",
  },
  "prod-soundcore-aerofit-2": {
    reviewId: reviewIdFor("prod-soundcore-aerofit-2"),
    offerIds: offersFor("prod-soundcore-aerofit-2"),
    positioningLabel: "open-ear hook headphones",
    verdict:
      "Adjustable open-ear AeroFit 2 hooks when OpenFit 2 / Bose feel expensive. Skip it if you need ANC gym isolation.",
    seoTitle: "soundcore AeroFit 2: Specs, Fit & Alternatives",
    seoDescription:
      "soundcore AeroFit 2 battery, IP55, hook fit, trade-offs and Shokz OpenFit 2 peers.",
  },
  "prod-soundcore-sport-x20": {
    familyId: "fam-soundcore-sport",
    reviewId: reviewIdFor("prod-soundcore-sport-x20"),
    offerIds: offersFor("prod-soundcore-sport-x20"),
    positioningLabel: "sealed sport earbuds",
    verdict:
      "IP68 adjustable-hook Sport X20 when you want sealed ANC sport buds at value pricing. Skip it if open-ear road awareness is your default.",
    seoTitle: "soundcore Sport X20: Specs, Fit & Alternatives",
    seoDescription:
      "soundcore Sport X20 IP68, battery, ANC, strengths, trade-offs and Jabra / Beats peers.",
    alternativeProductIds: [
      "prod-jabra-elite-8-active",
      "prod-beats-fit-pro",
    ],
  },
  "prod-apple-airpods-4": {
    familyId: "fam-apple-airpods",
    reviewId: reviewIdFor("prod-apple-airpods-4"),
    offerIds: offersFor("prod-apple-airpods-4"),
    positioningLabel: "everyday Apple earbuds",
    verdict:
      "AirPods 4 for tip-free Apple easy/gym days. Skip it for hard sweaty intervals where secureFit matters most.",
    seoTitle: "Apple AirPods 4: Specs, Fit & Alternatives",
    seoDescription:
      "Apple AirPods 4 battery, fit, awareness notes, trade-offs and AirPods Pro 2 / Beats Fit Pro peers.",
    alternativeProductIds: ["prod-airpods-pro-2", "prod-beats-fit-pro"],
  },
  "prod-airpods-pro-2": {
    familyId: "fam-apple-airpods",
    reviewId: EXISTING_REVIEW_LINKS["prod-airpods-pro-2"],
    offerIds: offersFor("prod-airpods-pro-2"),
    positioningLabel: "ANC in-ear earbuds",
    shortDescription:
      "Apple AirPods Pro 2 ANC in-ears with Adaptive Audio for treadmill and phone-centric training when sealed isolation beats open-ear awareness.",
    verdict:
      "AirPods Pro 2 for ANC indoor miles and iPhone-centric training. Skip it when outdoor traffic awareness needs open-ear or bone-conduction hardware.",
    seoTitle: "Apple AirPods Pro 2: Specs, ANC & Alternatives",
    seoDescription:
      "AirPods Pro 2 ANC, fit, strengths, trade-offs and Shokz / Bose open-ear alternatives for runners.",
    alternativeProductIds: [
      "prod-shokz-openrun-pro-2",
      "prod-bose-ultra-open",
      "prod-beats-fit-pro",
    ],
  },
  "prod-bose-ultra-open": {
    familyId: "fam-bose-ultra-open",
    reviewId: EXISTING_REVIEW_LINKS["prod-bose-ultra-open"],
    offerIds: offersFor("prod-bose-ultra-open"),
    positioningLabel: "premium open-ear headphones",
    shortDescription:
      "Bose Ultra Open clip earbuds for runners who want spatial audio and open-ear awareness without blocking the ear canal.",
    strengths: [
      "Open-ear awareness with clip comfort",
      "Strong Bose sound signature",
      "Spatial audio without canal seal",
    ],
    weaknesses: [
      "Less secure than wraparound Shokz for some runners",
      "Premium price",
    ],
    verdict:
      "Bose Ultra Open when you want premium open-ear clip comfort and sound. Skip it if wraparound Shokz security or a lower price is the priority.",
    seoTitle: "Bose Ultra Open Earbuds: Specs, Fit & Alternatives",
    seoDescription:
      "Bose Ultra Open open-ear specs, strengths, trade-offs and Shokz OpenDots / OpenFit alternatives.",
    alternativeProductIds: [
      "prod-shokz-opendots-one",
      "prod-shokz-openfit-2",
      "prod-shokz-openrun-pro-2",
    ],
  },
};

export function applyGearCoreLaunchReadyEnrichment(
  products: Product[],
): Product[] {
  return products.map((product) => {
    const patch = GEAR_CORE_LAUNCH_PATCHES[product.id];
    if (!patch) return product;

    const offerIds = [
      ...new Set([
        ...(patch.offerIds ?? []),
        ...(product.offerIds ?? []),
        ...(offersFor(product.id) ?? []),
      ]),
    ];

    const alternativeProductIds = [
      ...new Set([
        ...(patch.alternativeProductIds ?? []),
        ...(product.alternativeProductIds ?? []),
      ]),
    ];

    return {
      ...product,
      familyId: patch.familyId ?? product.familyId,
      reviewId: patch.reviewId ?? product.reviewId,
      offerIds: offerIds.length ? offerIds : product.offerIds,
      positioning: patch.positioningLabel,
      verdict: patch.verdict,
      seoTitle: patch.seoTitle,
      seoDescription: patch.seoDescription,
      shortDescription: patch.shortDescription ?? product.shortDescription,
      strengths: patch.strengths ?? product.strengths,
      weaknesses: patch.weaknesses ?? product.weaknesses,
      alternativeProductIds: alternativeProductIds.length
        ? alternativeProductIds
        : product.alternativeProductIds,
    };
  });
}
