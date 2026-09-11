import type { BuyingGuide } from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type { UseCase } from "@/domain/sports/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export const hyroxExtraUseCases: UseCase[] = [
  {
    id: "uc-hyrox-beginner",
    sportId: "sport-hyrox",
    group: "training",
    name: "HYROX Beginner",
    slug: "hyrox-beginner",
    description: "First-race gear decisions with minimal kit.",
  },
  {
    id: "uc-hyrox-home-training",
    sportId: "sport-hyrox",
    group: "training",
    name: "HYROX Home Training",
    slug: "hyrox-home-training",
    description: "Equipment for training HYROX stations at home.",
  },
  {
    id: "uc-hyrox-conditioning",
    sportId: "sport-hyrox",
    group: "training",
    name: "HYROX Conditioning",
    slug: "hyrox-conditioning",
    description: "Row, ski and mixed conditioning for HYROX.",
  },
];

export const hyroxExtraRecommendations: Recommendation[] = [
  {
    id: "rec-flite-hyrox-race",
    productId: "prod-inov8-flite-235-v3",
    sportId: "sport-hyrox",
    useCaseId: "uc-hyrox-race",
    score: 84,
    factors: [
      { key: "running", label: "Running", score: 90, weight: 1 },
      { key: "stability", label: "Stability", score: 72, weight: 1 },
      { key: "versatility", label: "Stations", score: 78, weight: 1 },
    ],
    strengths: ["Light running-oriented option for strong runners"],
    compromises: ["Less stable platform than dedicated trainers"],
    explanation:
      "Running-first HYROX race option when pace on the 8 km matters most.",
    evidenceIds: ["ev-fitness-editorial"],
  },
  {
    id: "rec-metcon-hyrox-race",
    productId: "prod-nike-metcon-9",
    sportId: "sport-hyrox",
    useCaseId: "uc-hyrox-race",
    score: 82,
    factors: [
      { key: "running", label: "Running", score: 70, weight: 1 },
      { key: "stability", label: "Stability", score: 88, weight: 1 },
      { key: "versatility", label: "Stations", score: 90, weight: 1 },
    ],
    strengths: ["Stable for sled and lunges"],
    compromises: ["Heavier running feel than race flats"],
    explanation:
      "Stability-first race/training crossover when stations limit you more than running.",
    evidenceIds: ["ev-fitness-editorial"],
  },
  {
    id: "rec-fr965-hyrox",
    productId: "prod-forerunner-965",
    sportId: "sport-hyrox",
    useCaseId: "uc-hyrox-race",
    score: 80,
    factors: [
      { key: "multisport", label: "Multisport", score: 88, weight: 1 },
      { key: "hr", label: "HR support", score: 85, weight: 1 },
    ],
    strengths: ["Strong multisport and interval workflows"],
    compromises: ["No verified native HYROX race mode claimed"],
    explanation:
      "Suitable HYROX timing companion via custom workouts — not marketed as a native HYROX profile unless verified.",
    evidenceIds: ["ev-fitness-editorial"],
  },
];

export const hyroxBuyingGuides: BuyingGuide[] = [
  {
    id: "guide-choose-hyrox-shoes",
    slug: "how-to-choose-hyrox-shoes",
    title: "How to Choose HYROX Shoes",
    sportId: "sport-hyrox",
    categoryId: "cat-training-shoes",
    relatedProductIds: [
      "prod-tyr-cxt-2",
      "prod-reebok-nano-x4",
      "prod-nike-metcon-9",
      "prod-inov8-flite-235-v3",
    ],
    relatedUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training"],
    hubImageSrc: "/images/training/products/tyr-cxt-2-hero.jpg",
    hubImageAlt: "TYR CXT-2 HYROX training shoe",
    sections: [
      {
        id: "s1",
        heading: "Running vs stations",
        body: "A pure road racer may feel fast on the runs but unstable on sleds. A lifting shoe may feel planted but costly over 8 km. Decide which side limits you first.",
      },
      {
        id: "s2",
        heading: "Evidence over marketing",
        body: "“Made for HYROX” marketing does not increase Kitletics scores. Partnership claims are factual metadata only.",
      },
      {
        id: "s3",
        heading: "One shoe vs two",
        body: "Many athletes use one versatile trainer. A two-shoe setup only helps if you will actually rotate them.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["hyrox-shoe-finder"],
    ...pub,
  },
  {
    id: "guide-hyrox-race-vs-training-shoes",
    slug: "hyrox-race-shoes-vs-training-shoes",
    title: "HYROX Race Shoes vs Training Shoes",
    sportId: "sport-hyrox",
    categoryId: "cat-training-shoes",
    relatedProductIds: ["prod-tyr-cxt-2", "prod-nike-metcon-9", "prod-boston-12"],
    relatedUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training"],
    hubImageSrc: "/images/training/products/nike-metcon-9-hero.jpg",
    hubImageAlt: "Nike Metcon 9 training shoe for gym and hybrid sessions",
    sections: [
      {
        id: "s1",
        heading: "Race demands",
        body: "Eight run legs reward lighter, more efficient shoes if you can still stay stable on stations.",
      },
      {
        id: "s2",
        heading: "Training demands",
        body: "Higher weekly volume, mixed gym work and durability matter more than peak race efficiency.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["hyrox-shoe-finder"],
    ...pub,
  },
  {
    id: "guide-rowerg-vs-skierg-hyrox",
    slug: "rowerg-vs-skierg-for-hyrox-training",
    title: "RowErg vs SkiErg for HYROX Training",
    sportId: "sport-hyrox",
    categoryId: "cat-rowing-machines",
    relatedProductIds: ["prod-concept2-rowerg", "prod-concept2-skierg"],
    relatedUseCaseIds: ["uc-hyrox-home-training", "uc-hyrox-conditioning"],
    sections: [
      {
        id: "s1",
        heading: "Race familiarity",
        body: "Both appear as stations. Prefer the machine you cannot access elsewhere.",
      },
      {
        id: "s2",
        heading: "Space",
        body: "Rowers need length; SkiErgs need height and wall/floor mounting decisions.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["home-gym-builder"],
    ...pub,
  },
  {
    id: "guide-hyrox-sled",
    slug: "how-to-choose-a-hyrox-training-sled",
    title: "How to Choose a HYROX Training Sled",
    sportId: "sport-hyrox",
    categoryId: "cat-functional-fitness",
    relatedProductIds: ["prod-rogue-dog-sled"],
    relatedUseCaseIds: ["uc-hyrox-home-training"],
    sections: [
      {
        id: "s1",
        heading: "Surface problem",
        body: "Rubber, turf and concrete change effort dramatically. Kitletics will not claim race-load equivalence without validated methodology.",
      },
      {
        id: "s2",
        heading: "Home practicality",
        body: "Most apartments cannot support a meaningful sled runway. Prefer gym access or accept limited indoor alternatives.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["home-gym-builder"],
    ...pub,
  },
  {
    id: "guide-hyrox-equipment-standards",
    slug: "hyrox-equipment-standards",
    title: "HYROX Equipment Standards (Season 26/27)",
    sportId: "sport-hyrox",
    relatedProductIds: [],
    relatedUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training"],
    sections: [
      {
        id: "s1",
        heading: "Format",
        body: "1 km run + station, repeated 8 times. Total running 8 km. Station order: SkiErg, Sled Push, Sled Pull, Burpee Broad Jump, Row, Farmers Carry, Sandbag Lunges, Wall Balls.",
      },
      {
        id: "s2",
        heading: "Loaded stations",
        body: "Women Open / Men Open·Women Pro / Men Pro columns differ on sled push/pull, farmers, lunges and wall balls. SkiErg, row and BBJ have no external load. Source: Season 26/27 Singles Rulebook.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["hyrox-race-time-calculator"],
    ...pub,
  },
  {
    id: "guide-hyrox-race-checklist",
    slug: "hyrox-race-day-gear-checklist",
    title: "HYROX Race Day Gear Checklist",
    sportId: "sport-hyrox",
    relatedProductIds: ["prod-tyr-cxt-2", "prod-forerunner-965"],
    relatedUseCaseIds: ["uc-hyrox-race"],
    sections: [
      {
        id: "s1",
        heading: "Wear",
        body: "Race shoes, shorts/top that won’t chafe, socks.",
      },
      {
        id: "s2",
        heading: "Bring",
        body: "Optional watch and chest strap, warm-up layer, post-race layer, nutrition per event rules, registration materials as required by the organizer.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["hyrox-race-kit-builder"],
    ...pub,
  },
  {
    id: "guide-hyrox-hr",
    slug: "hyrox-heart-rate-monitor",
    title: "Chest Strap vs Wrist Heart Rate for HYROX",
    sportId: "sport-hyrox",
    categoryId: "cat-heart-rate-monitors",
    relatedProductIds: ["prod-hrm-pro-plus", "prod-polar-h10"],
    relatedUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training"],
    sections: [
      {
        id: "s1",
        heading: "Wrist optical",
        body: "Convenient; may be noisier during carries, sled and burpees.",
      },
      {
        id: "s2",
        heading: "Chest strap",
        body: "Often more consistent under movement when paired correctly with your watch. Not medical advice.",
      },
    ],
    faqIds: [],
    ...pub,
  },
  {
    id: "guide-what-gear-hyrox",
    slug: "what-gear-do-you-need-for-hyrox",
    title: "What Gear Do You Need for HYROX?",
    sportId: "sport-hyrox",
    relatedProductIds: [
      "prod-tyr-cxt-2",
      "prod-forerunner-965",
      "prod-concept2-rowerg",
    ],
    relatedUseCaseIds: ["uc-hyrox-beginner", "uc-hyrox-race"],
    sections: [
      {
        id: "s1",
        heading: "Race day essentials",
        body: "Shoes that balance run legs and stations, clothing that won’t chafe, and optional timing/HR gear you already trust.",
      },
      {
        id: "s2",
        heading: "Training access first",
        body: "If you train at a commercial gym with RowErg, SkiErg, sled and wall balls, buy shoes and skip redundant machines.",
      },
      {
        id: "s3",
        heading: "Home only",
        body: "Prioritise versatile loads (wall ball, sandbag, kettlebells) and running access before large cardio machines.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["hyrox-race-kit-builder", "hyrox-shoe-finder"],
    ...pub,
  },
  {
    id: "guide-build-hyrox-home-gym",
    slug: "how-to-build-a-hyrox-home-gym",
    title: "How to Build a HYROX Home Gym",
    sportId: "sport-hyrox",
    relatedProductIds: [
      "prod-concept2-rowerg",
      "prod-concept2-skierg",
      "prod-rogue-dog-sled",
    ],
    relatedUseCaseIds: ["uc-hyrox-home-training"],
    sections: [
      {
        id: "s1",
        heading: "Space reality",
        body: "Sled runway is the usual blocker. Kitletics marks sled work unsupported when the room cannot provide meaningful length.",
      },
      {
        id: "s2",
        heading: "Capability over price tiers",
        body: "Minimal / balanced / full should follow which stations you can cover — not arbitrary spend bands.",
      },
    ],
    faqIds: [],
    relatedToolSlugs: ["home-gym-builder"],
    ...pub,
  },
  {
    id: "guide-choose-hyrox-watch",
    slug: "how-to-choose-a-hyrox-watch",
    title: "How to Choose a HYROX Watch",
    sportId: "sport-hyrox",
    categoryId: "cat-gps-watches",
    relatedProductIds: ["prod-forerunner-965"],
    relatedUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training"],
    sections: [
      {
        id: "s1",
        heading: "No fake HYROX mode",
        body: "Kitletics only claims a native HYROX profile when verified. Most athletes use custom workouts or multisport tracking.",
      },
      {
        id: "s2",
        heading: "What actually matters",
        body: "Lap/interval handling, HR pairing, battery for long race days, and readable controls under fatigue.",
      },
    ],
    faqIds: [],
    ...pub,
  },
];

export const hyroxTools: Tool[] = [
  {
    id: "tool-hyrox-race-kit-builder",
    name: "HYROX Race Kit Builder",
    slug: "hyrox-race-kit-builder",
    description:
      "Build a lean HYROX race kit around shoes and what you already own.",
    type: "builder",
    sportIds: ["sport-hyrox", "sport-training"],
    categoryIds: ["cat-training-shoes", "cat-running-shoes"],
    useCaseIds: ["uc-hyrox-race"],
    goalTags: ["hyrox", "race-kit"],
    icon: "Package",
    available: true,
    ...pub,
  },
  {
    id: "tool-hyrox-race-time-calculator",
    name: "HYROX Race Time Calculator",
    slug: "hyrox-race-time-calculator",
    description:
      "Estimate finish time from assumed run and station splits using current CompetitionFormat.",
    type: "calculator",
    sportIds: ["sport-hyrox", "sport-training"],
    categoryIds: [],
    useCaseIds: ["uc-hyrox-race"],
    goalTags: ["hyrox", "pace", "race-plan"],
    icon: "Timer",
    available: true,
    ...pub,
  },
];
