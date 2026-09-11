import type { ProductCategoryPageConfig } from "@/lib/catalog/types";

/** Deep category configs so secondary Running categories share shoes-level decision scaffolding. */
export const runningWatchesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "gps-watches",
  hero: {
    title: "GPS Running Watches",
    description:
      "Compare Garmin, COROS, Polar, Suunto, Apple and more — battery, maps, music and training features for how you run.",
    primaryCta: {
      label: "Find a Watch",
      href: "/tools/fitness-watch-finder",
    },
    secondaryCta: {
      label: "Best Running Watches",
      href: "/best/running-watches",
    },
  },
  featuredSubcategoryIds: [
    "sub-gps-entry",
    "sub-gps-performance",
    "sub-gps-premium",
    "sub-gps-ultra-adventure",
    "sub-gps-compact",
  ],
  goalUseCaseIds: ["uc-daily-training", "uc-marathon", "uc-trail-training", "uc-ultra", "uc-long-runs"],
  runnerUseCaseIds: ["uc-beginners", "uc-advanced", "uc-high-mileage"],
  featuredToolSlugs: ["fitness-watch-finder", "running-pace-calculator"],
  finder: {
    toolSlug: "fitness-watch-finder",
    headline: "Not sure which watch?",
    title: "Use the Fitness Watch Finder",
    description:
      "Match battery life, maps, music and budget to your training — then compare shortlisted models.",
    ctaLabel: "Find My Watch",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Battery vs features",
      body: "More maps and music usually cost battery. Match the watch to your longest typical outing.",
      href: "/best/running-watches",
    },
    {
      title: "Wrist optical vs chest strap",
      body: "Wrist HR is convenient; chest straps remain the accuracy default for intervals.",
      href: "/best/heart-rate-monitors",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningHydrationCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "hydration",
  hero: {
    title: "Running Hydration",
    description:
      "Handhelds, soft flasks and reservoirs — pair with vests and belts when your long-run volume grows.",
    primaryCta: {
      label: "Hydration Finder",
      href: "/tools/running-hydration-finder",
    },
    secondaryCta: {
      label: "Hydration Vests",
      href: "/running/packs",
    },
  },
  featuredSubcategoryIds: ["sub-handheld", "sub-soft-flasks", "sub-reservoirs"],
  goalUseCaseIds: ["uc-long-runs", "uc-marathon", "uc-trail-training", "uc-ultra"],
  runnerUseCaseIds: ["uc-beginners", "uc-high-mileage"],
  featuredToolSlugs: ["running-hydration-finder"],
  finder: {
    toolSlug: "running-hydration-finder",
    headline: "Vest, belt or handheld?",
    title: "Use the Running Hydration Finder",
    description:
      "Answer a few questions about distance, carry preference and terrain — get a shortlist that explains trade-offs.",
    ctaLabel: "Find My Hydration Setup",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Vest vs belt vs handheld",
      body: "Start with volume and bounce control, then choose the carry format that matches your longest sessions.",
      href: "/guides/hydration-vest-vs-running-belt",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningPacksCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-packs-vests",
  hero: {
    title: "Running Packs & Vests",
    description:
      "Race hydration vests, running backpacks and fastpacking packs — capacity, bounce control and race-kit room.",
    primaryCta: {
      label: "Best Hydration Vests",
      href: "/best/running-hydration-vests",
    },
    secondaryCta: {
      label: "Best Running Packs",
      href: "/best/running-packs",
    },
  },
  featuredSubcategoryIds: [
    "sub-pack-hydration-vests",
    "sub-pack-race-vests",
    "sub-pack-running-backpacks",
    "sub-pack-fastpacking",
  ],
  goalUseCaseIds: ["uc-trail-training", "uc-ultra", "uc-long-runs", "uc-fastpacking", "uc-marathon"],
  runnerUseCaseIds: ["uc-advanced", "uc-high-mileage"],
  featuredToolSlugs: ["running-hydration-finder"],
  primaryFilterKeys: ["genderFit", "brand", "price"],
  educationFactors: [
    {
      title: "Race vest vs fastpack",
      body: "Race vests win on bounce and flask access; fastpacks win when overnight or daypack volume is the job.",
      href: "/best/running-packs",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningClothingCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-clothing",
  hero: {
    title: "Running Clothing",
    description:
      "Shorts, tights, tops, jackets and bras — filter by gender fit and shortlist Best guides for weather and race day.",
    primaryCta: {
      label: "Apparel Finder",
      href: "/tools/running-clothing-finder",
    },
    secondaryCta: {
      label: "Best Running Shorts",
      href: "/best/running-shorts",
    },
  },
  featuredSubcategoryIds: [
    "sub-running-shorts",
    "sub-running-tights",
    "sub-running-tees",
    "sub-running-jackets",
    "sub-running-rain-jackets",
    "sub-running-sports-bras",
  ],
  goalUseCaseIds: ["uc-daily-training", "uc-long-runs", "uc-winter-running", "uc-rain-running"],
  runnerUseCaseIds: ["uc-beginners", "uc-comfort"],
  featuredToolSlugs: ["running-clothing-finder"],
  finder: {
    toolSlug: "running-clothing-finder",
    headline: "Not sure which kit?",
    title: "Use the Running Apparel Finder",
    description:
      "Match weather, distance and pocket needs — then open Best guides for the garment type you shortlist.",
    ctaLabel: "Find My Apparel",
  },
  primaryFilterKeys: ["genderFit", "brand", "price"],
  educationFactors: [
    {
      title: "Weather first",
      body: "Match fabric and coverage to heat, rain and winter darkness — then refine fit and storage.",
      href: "/best/running-gear-winter",
    },
  ],
  terminology: [
    {
      term: "Inseam",
      definition: "Short leg length. Longer inseams reduce chafe for some; shorter ones dump heat faster.",
    },
    {
      term: "Liner",
      definition: "Built-in brief in shorts. Useful when you don’t want separate underwear — fit still personal.",
    },
    {
      term: "Softshell vs hardshell",
      definition:
        "Softshells block wind and breathe; hardshells stay drier in rain but cook on hard efforts.",
    },
  ],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningNutritionCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "nutrition-fuel",
  hero: {
    title: "Running Fuel & Nutrition",
    description:
      "Gels, drink mixes, chews and electrolytes — sports-product decision content based on label data, not medical advice.",
    primaryCta: {
      label: "Fuel Finder",
      href: "/tools/running-fuel-finder",
    },
    secondaryCta: {
      label: "Best Race Fuel",
      href: "/best/running-race-fuel",
    },
  },
  featuredSubcategoryIds: [
    "sub-energy-gels",
    "sub-carb-drink-mixes",
    "sub-energy-chews",
    "sub-electrolyte-tablets",
  ],
  goalUseCaseIds: [
    "uc-long-runs",
    "uc-marathon",
    "uc-ultra",
    "uc-high-carb-fueling",
    "uc-caffeinated-fuel",
    "uc-non-caffeinated-fuel",
  ],
  runnerUseCaseIds: [],
  featuredToolSlugs: ["running-fuel-finder"],
  finder: {
    toolSlug: "running-fuel-finder",
    headline: "Gels, chews or drink mix?",
    title: "Use the Running Fuel Finder",
    description:
      "Match distance, format preference and caffeine — then verify carbs per serving on the product page.",
    ctaLabel: "Find My Fuel",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Practice in training",
      body: "Format, carbs per serving and caffeine preference matter more than brand hype — trial fuel before race day.",
      href: "/guides/gel-vs-drink-mix-vs-chews",
    },
  ],
  terminology: [
    {
      term: "Carbs per serving",
      definition: "Label carbohydrate grams in one gel/scoop — the number your fuel plan should use.",
    },
    {
      term: "Isotonic gel",
      definition: "Formulated to need less water than traditional gels — still practise gut tolerance.",
    },
    {
      term: "Electrolyte",
      definition: "Sodium and related minerals for fluid balance — not a replacement for carbohydrate fuel.",
    },
  ],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningRecoveryCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "recovery",
  hero: {
    title: "Running Recovery Gear",
    description:
      "Foam rollers, massage guns, compression boots and recovery sandals — practical comfort tools with honest evidence limits.",
    primaryCta: {
      label: "Best Recovery Gear",
      href: "/best/running-recovery-gear",
    },
    secondaryCta: {
      label: "What Evidence Shows",
      href: "/guides/recovery-tools-what-evidence-shows",
    },
  },
  featuredSubcategoryIds: [
    "sub-rec-massage-guns",
    "sub-rec-foam-rollers",
    "sub-rec-compression-boots",
    "sub-rec-recovery-sandals",
  ],
  goalUseCaseIds: ["uc-post-run-recovery", "uc-travel-recovery", "uc-home-recovery", "uc-high-mileage"],
  runnerUseCaseIds: ["uc-comfort"],
  featuredToolSlugs: [],
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Adjuncts, not treatment",
      body: "Kitletics does not claim these tools heal injuries or speed recovery medically — use them for comfort routines alongside rest and load management.",
      href: "/guides/recovery-tools-what-evidence-shows",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningHeadphonesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "headphones",
  hero: {
    title: "Running Headphones",
    description:
      "Open-ear, bone conduction, true wireless and ear-hook designs — with careful outdoor awareness wording.",
    primaryCta: {
      label: "Best Running Headphones",
      href: "/best/running-headphones",
    },
    secondaryCta: {
      label: "Open-ear vs In-ear",
      href: "/guides/open-ear-vs-in-ear-running-headphones",
    },
  },
  featuredSubcategoryIds: [
    "sub-hp-open-ear",
    "sub-hp-bone-conduction",
    "sub-hp-true-wireless",
    "sub-hp-ear-hook",
  ],
  goalUseCaseIds: ["uc-situational-awareness", "uc-daily-training", "uc-gym-training", "uc-long-runs"],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Awareness first outdoors",
      body: "Open designs aim to keep more environmental awareness — no headphone makes traffic running inherently safe.",
      href: "/guides/open-ear-vs-in-ear-running-headphones",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningHrmCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "heart-rate-monitors",
  hero: {
    title: "Heart Rate Monitors",
    description:
      "Chest straps, armbands and optical sensors — pick accuracy for intervals or convenience for easy days.",
    primaryCta: {
      label: "Best HRMs",
      href: "/best/heart-rate-monitors-running",
    },
    secondaryCta: {
      label: "Chest vs Optical",
      href: "/best/heart-rate-monitors-chest-straps",
    },
  },
  featuredSubcategoryIds: [
    "sub-hrm-chest",
    "sub-hrm-armband",
    "sub-hrm-optical",
    "sub-hrm-dynamics",
  ],
  goalUseCaseIds: ["uc-daily-training", "uc-intervals", "uc-marathon"],
  runnerUseCaseIds: ["uc-beginners", "uc-advanced"],
  featuredToolSlugs: ["running-hrm-finder", "fitness-watch-finder"],
  finder: {
    toolSlug: "running-hrm-finder",
    headline: "Chest, armband or optical?",
    title: "Use the HRM Finder",
    description:
      "Match session type and device pairing — straps for intervals, optical for easy convenience.",
    ctaLabel: "Find My HRM",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Intervals favor straps",
      body: "Wrist optical is fine for easy runs; chest straps stay the accuracy default when HR targets matter.",
      href: "/best/heart-rate-monitors-intervals",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningBeltsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-belts",
  hero: {
    title: "Running Belts",
    description:
      "Phone belts, race belts and flask-capable waist packs — bounce control without a full vest.",
    primaryCta: {
      label: "Best Running Belts",
      href: "/best/running-belts",
    },
    secondaryCta: {
      label: "Hydration Finder",
      href: "/tools/running-hydration-finder",
    },
  },
  featuredSubcategoryIds: ["sub-belt-phone", "sub-belt-hydration", "sub-belt-race"],
  goalUseCaseIds: ["uc-long-runs", "uc-marathon", "uc-daily-training"],
  runnerUseCaseIds: ["uc-beginners", "uc-comfort"],
  featuredToolSlugs: ["running-hydration-finder"],
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Belt vs vest",
      body: "Belts win for phone + gels on road longs; vests win when flask volume and jacket storage grow.",
      href: "/guides/hydration-vest-vs-running-belt",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningSocksCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-socks",
  hero: {
    title: "Running Socks",
    description:
      "Blister-focused quarters, cushion crews, toe socks and light compression — fit and moisture management first.",
    primaryCta: {
      label: "Best Running Socks",
      href: "/best/running-socks",
    },
    secondaryCta: {
      label: "Apparel Finder",
      href: "/tools/running-clothing-finder",
    },
  },
  featuredSubcategoryIds: [],
  goalUseCaseIds: ["uc-daily-training", "uc-long-runs", "uc-marathon", "uc-trail-training"],
  runnerUseCaseIds: ["uc-beginners", "uc-comfort"],
  featuredToolSlugs: ["running-clothing-finder"],
  finder: {
    toolSlug: "running-clothing-finder",
    headline: "Match socks to your kit",
    title: "Use the Running Apparel Finder",
    description:
      "Apparel finder covers clothing and socks — use it when height, blister risk and climate are unclear.",
    ctaLabel: "Find Apparel & Socks",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Match height to shoe",
      body: "Quarter and crew heights change heel lock and debris entry — trial with your daily trainer before race day.",
      href: "/best/running-socks",
    },
  ],
  terminology: [
    {
      term: "Quarter height",
      definition: "Sits at or just above the shoe collar — common daily road height.",
    },
    {
      term: "Toe sock",
      definition: "Individual toe sleeves aimed at reducing toe-on-toe blistering.",
    },
  ],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningSunglassesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "sunglasses",
  hero: {
    title: "Running Sunglasses",
    description:
      "Wrap, shield, photochromic and value everyday lenses for road and trail brightness.",
    primaryCta: {
      label: "Best Running Sunglasses",
      href: "/best/running-sunglasses",
    },
    secondaryCta: {
      label: "Accessories Finder",
      href: "/tools/running-accessories-finder",
    },
  },
  featuredSubcategoryIds: [
    "sub-sg-performance-wrap",
    "sub-sg-shield",
    "sub-sg-photochromic",
    "sub-sg-everyday-value",
  ],
  goalUseCaseIds: ["uc-bright-sun", "uc-trail-training", "uc-daily-training"],
  runnerUseCaseIds: [],
  featuredToolSlugs: ["running-accessories-finder"],
  finder: {
    toolSlug: "running-accessories-finder",
    headline: "Wrap, shield or photochromic?",
    title: "Use the Running Accessories Finder",
    description:
      "Answer light, terrain and budget questions — then compare shortlisted frames in this catalog.",
    ctaLabel: "Find Eyewear Options",
  },
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Coverage vs weight",
      body: "Shields block more glare and wind; lighter wraps feel freer on hot road miles.",
      href: "/best/running-sunglasses",
    },
  ],
  terminology: [
    {
      term: "Photochromic",
      definition: "Lenses that darken/lighten with UV — useful when light changes mid-run.",
    },
    {
      term: "Shield lens",
      definition: "Single large lens with high coverage — more wind/glare block, often warmer.",
    },
    {
      term: "Wrap",
      definition: "Curved frame that follows the face — typical performance road shape.",
    },
  ],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningLightsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-lights",
  hero: {
    title: "Running Lights & Headlamps",
    description:
      "Headlamps, waist lights and high-output options for dark roads and technical trail.",
    primaryCta: {
      label: "Best Headlamps",
      href: "/best/running-headlamps",
    },
    secondaryCta: {
      label: "Safety Gear",
      href: "/running/safety",
    },
  },
  featuredSubcategoryIds: [
    "sub-light-headlamps",
    "sub-light-waist",
    "sub-light-high-output",
  ],
  goalUseCaseIds: ["uc-winter-running", "uc-trail-training", "uc-ultra"],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Lumens vs beam pattern",
      body: "Max lumens matter less than a usable throw/flood mix and stable on-head comfort for your longest dark session.",
      href: "/best/running-headlamps",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningSafetyCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "safety-gear",
  hero: {
    title: "Running Safety & Visibility",
    description:
      "Clip lights, wearable lights, reflective layers and personal alarms — visibility tools, not a substitute for route judgment.",
    primaryCta: {
      label: "Best Visibility Gear",
      href: "/best/running-safety-visibility",
    },
    secondaryCta: {
      label: "Headlamps",
      href: "/running/lights",
    },
  },
  featuredSubcategoryIds: [
    "sub-safety-clip-lights",
    "sub-safety-wearable-lights",
    "sub-safety-reflective",
    "sub-safety-visibility-vests",
    "sub-safety-personal-alarms",
  ],
  goalUseCaseIds: ["uc-winter-running", "uc-daily-training"],
  runnerUseCaseIds: ["uc-beginners"],
  featuredToolSlugs: [],
  primaryFilterKeys: ["brand", "price"],
  educationFactors: [
    {
      title: "Be seen, stay aware",
      body: "Reflective and active lights help drivers see you — they do not make traffic corridors safe.",
      href: "/best/running-safety-visibility",
    },
  ],
  terminology: [],
  faqIds: [],
  defaultSort: "recommended",
};

export const runningAccessoriesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "accessories",
  hero: {
    title: "Running Anti-Chafe & Small Accessories",
    description:
      "Stick balms and roll-on barriers for known hotspots on longs and race day. Audio, lights, sunglasses and belts are catalogued on their own pages.",
    primaryCta: {
      label: "Best Anti-Chafe",
      href: "/best/running-anti-chafe",
    },
    secondaryCta: {
      label: "How to choose",
      href: "/guides/anti-chafe-for-runners",
    },
  },
  featuredSubcategoryIds: ["sub-acc-stick-balm", "sub-acc-roll-on"],
  goalUseCaseIds: ["uc-long-runs", "uc-marathon", "uc-ultra", "uc-half"],
  runnerUseCaseIds: ["uc-beginners", "uc-comfort"],
  featuredToolSlugs: ["running-accessories-finder"],
  finder: {
    toolSlug: "running-accessories-finder",
    headline: "Chafe, audio, lights or eyewear?",
    title: "Use the Running Accessories Finder",
    description:
      "This category shortlists anti-chafe formats. The Finder also routes audio, lights and sunglasses to those shelves instead of mixing jobs here.",
    ctaLabel: "Find Accessories",
  },
  primaryFilterKeys: ["type", "brand", "price"],
  educationFactors: [
    {
      title: "Name the rub first",
      body: "Thighs, sports-bra line, underarms and seam rub are different jobs. Apply only where you already fail — not as a full-body coating.",
      href: "/guides/anti-chafe-for-runners",
    },
    {
      title: "Stick vs roll-on",
      body: "Sticks (Body Glide, Squirrel’s) win pocket speed. Roll-ons (SportShield) win thin coverage under race kits — they need dry-time.",
      href: "/best/running-anti-chafe",
    },
    {
      title: "Not audio or lights",
      body: "Headphones, headlamps, sunglasses and belts are separate shelves. Use the Finder to leave this chafe catalog when the job is not skin rub.",
      href: "/tools/running-accessories-finder",
    },
  ],
  terminology: [
    {
      term: "Anti-chafe barrier",
      definition:
        "A stick balm or roll-on film that reduces skin-on-skin or kit-on-skin rub. It is not a treatment for existing wounds.",
    },
    {
      term: "Stick format",
      definition:
        "Solid balm in a twist-up tube — fastest to hit on thighs and underarms without looking.",
    },
    {
      term: "Roll-on barrier",
      definition:
        "Liquid film from a bottle. Thinner under lycra; needs a moment to dry before you pull the kit on.",
    },
  ],
  picks: [
    {
      label: "Default stick",
      productId: "prod-body-glide-original",
      rationale: "Starting format for most road longs and race-week kits.",
    },
    {
      label: "Ultra stick / tin",
      productId: "prod-squirrels-nut-butter",
      rationale: "When you want a different balm feel and a tin for very long days.",
    },
    {
      label: "Race-kit roll-on",
      productId: "prod-2toms-sportshield",
      rationale: "Thin film under tight kits when a stick feels messy.",
    },
  ],
  faqIds: [],
  defaultSort: "recommended",
};
