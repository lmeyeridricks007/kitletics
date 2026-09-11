import type { ProductUseCaseListingConfig } from "@/lib/use-case-listing/types";

export const raceShoesListingConfig: ProductUseCaseListingConfig = {
  id: "listing-race-shoes",
  slug: "race",
  sportSlug: "running",
  categoryPathSegment: "shoes",
  categoryId: "cat-running-shoes",
  subcategoryId: "sub-race",
  subcategorySlug: "race",
  eyebrow: "USE CASE",
  title: "Race Shoes",
  description:
    "Lightweight running shoes built for faster efforts and race-day use from 5K to marathon.",
  seoTitle: "Race Running Shoes",
  seoDescription:
    "Browse race running shoes for 5K to marathon. Filter by distance, cushion, plate, brand and price — then compare side by side.",
  heroImageSrc: "/images/running/category/hero-race.jpg",
  heroImageAlt: "Runner in race shoes on an urban road",
  countLabel: "RACE SHOES",
  metadata: [
    { id: "count", kind: "count", label: "Shoes in this list" },
    { id: "verified", kind: "verified", label: "Data verified" },
    {
      id: "distance",
      kind: "range",
      label: "For race distances",
      value: "5K to Marathon",
    },
  ],
  subnav: [
    { id: "overview", label: "Overview", href: "/running/shoes/race", icon: "overview" },
    {
      id: "5k10k",
      label: "5K & 10K",
      href: "/running/shoes/race?distance=5k,10k",
      icon: "timer",
      refine: { distance: "5k,10k" },
    },
    {
      id: "half",
      label: "Half Marathon",
      href: "/running/shoes/race?distance=half",
      icon: "route",
      refine: { distance: "half" },
    },
    {
      id: "marathon",
      label: "Marathon",
      href: "/running/shoes/race?distance=marathon",
      icon: "runner",
      refine: { distance: "marathon" },
    },
    {
      id: "carbon",
      label: "Carbon Plate",
      href: "/running/shoes/race?plate=true",
      icon: "bolt",
    },
    {
      id: "tips",
      label: "Race Day Tips",
      href: "#race-day-tips",
      icon: "tips",
    },
  ],
  primaryFilterKeys: [
    "type",
    "recommendedDistance",
    "cushionLevel",
    "drop",
    "weight",
    "brand",
    "price",
  ],
  typeFacetSlugs: ["race", "carbon-plate", "tempo"],
  education: {
    title: "What makes a great race shoe?",
    body: "Race shoes are tools for goal efforts and hard sessions — lower weight, lively midsoles, race geometry. They are not daily trainers; foam and uppers usually wear faster under easy mileage.",
    guideSlug: "carbon-vs-nylon-plates",
    guideCtaLabel: "Learn more in our Race Shoes Guide →",
    beginnerStart:
      "Keep a durable daily trainer for most miles. Add a race shoe only when you have a goal race or structured speed block — start with half/marathon-capable stacks if you’re new to plates.",
    tradeOffs: [
      {
        left: "Race economy",
        right: "Daily durability",
        note: "Plated race foams and thin uppers are not built for 50–80 km easy weeks.",
      },
      {
        left: "Aggressive geometry",
        right: "Easy-day comfort",
        note: "Rocker and plate feel great at race pace; many runners dislike them for recovery jogs.",
      },
    ],
    factors: [
      {
        id: "light",
        title: "Weight for race pace",
        body: "Lower mass matters most when you’re holding goal pace — less critical on easy doubles.",
      },
      {
        id: "foam",
        title: "Race-day foam",
        body: "High-energy midsoles that feel lively at faster paces; often less durable than daily foams.",
      },
      {
        id: "plate",
        title: "Plate & stiffness",
        body: "Carbon/nylon plates change toe-off — compare within race shoes, not against daily trainers.",
      },
      {
        id: "distance",
        title: "Distance fit",
        body: "5K racers and marathon stacks pull different cushion and upper priorities — filter by distance.",
      },
    ],
  },
  relatedGuideSlugs: [
    "carbon-vs-nylon-plates",
    "running-shoe-rotation",
    "how-to-choose-running-shoes",
  ],
  relatedGuidesTitle: "RACE DAY TIPS",
  relatedGuidesIndexHref: "/guides",
  bestGuideSlug: "race-shoes",
  comparisonLimit: 4,
};

export const stabilityShoesListingConfig: ProductUseCaseListingConfig = {
  id: "listing-stability-shoes",
  slug: "stability",
  sportSlug: "running",
  categoryPathSegment: "shoes",
  categoryId: "cat-running-shoes",
  subcategoryId: "sub-stability",
  subcategorySlug: "stability",
  eyebrow: "SHOE TYPE",
  title: "Stability Shoes",
  description:
    "Guidance-oriented road shoes for runners who want a more controlled daily ride.",
  seoTitle: "Stability Running Shoes",
  seoDescription:
    "Browse stability running shoes. Filter by cushion, drop, width, brand and price.",
  heroImageSrc: "/images/running/category/hero-stability.jpg",
  heroImageAlt: "Road runner in stability-oriented training shoes",
  countLabel: "STABILITY SHOES",
  metadata: [
    { id: "count", kind: "count", label: "Shoes in this list" },
    { id: "verified", kind: "verified", label: "Data verified" },
    {
      id: "use",
      kind: "custom",
      label: "Best suited for",
      value: "Daily road miles",
    },
  ],
  subnav: [
    {
      id: "overview",
      label: "Overview",
      href: "/running/shoes/stability",
      icon: "overview",
    },
    {
      id: "daily",
      label: "Daily Training",
      href: "/running/shoes/stability?distance=daily",
      icon: "runner",
    },
    {
      id: "wide",
      label: "Wide Fit",
      href: "/running/shoes/stability?width=wide",
      icon: "route",
    },
    {
      id: "guide",
      label: "Stability Guide",
      href: "/guides/stability-shoes-explained",
      icon: "tips",
    },
  ],
  primaryFilterKeys: [
    "type",
    "cushionLevel",
    "drop",
    "weight",
    "widthOptions",
    "brand",
    "price",
  ],
  typeFacetSlugs: ["stability"],
  education: {
    title: "What makes a useful stability shoe?",
    body: "Stability shoes are for runners who want a more controlled road ride — via geometry, guidance rails or medial support. Kitletics does not diagnose gait or claim injury prevention; choose from how the shoe feels on your easy miles.",
    guideSlug: "stability-shoes-explained",
    guideCtaLabel: "Read Stability Shoes Explained →",
    beginnerStart:
      "If you already prefer a guided daily ride, shortlist stability dailies in your width. If you’re neutral and happy, stay neutral — don’t buy stability ‘just in case’.",
    tradeOffs: [
      {
        left: "Guidance / control",
        right: "Natural flex freedom",
        note: "More medial support can feel planted — some runners find it intrusive on easy days.",
      },
      {
        left: "Wide planted base",
        right: "Quicker turnover feel",
        note: "Stable platforms help longevity on easy miles; they’re rarely the snappiest tempo tool.",
      },
    ],
    factors: [
      {
        id: "guidance",
        title: "Guidance system",
        body: "Sidewalls, posts or geometry nudge stance — compare support level, not brand slogans.",
      },
      {
        id: "platform",
        title: "Platform shape",
        body: "A wider base can feel more planted on easy and long road miles.",
      },
      {
        id: "cushion",
        title: "Cushioning",
        body: "Support and soft stack are separate choices — match both to your miles.",
      },
      {
        id: "fit",
        title: "Fit",
        body: "Width and lockdown matter as much as the stability system.",
      },
    ],
  },
  relatedGuideSlugs: [
    "stability-shoes-explained",
    "how-to-choose-running-shoes",
    "running-shoe-cushioning",
  ],
  relatedGuidesTitle: "RELATED GUIDES",
  bestGuideSlug: "stability-running-shoes",
  comparisonLimit: 4,
};

export const trailShoesListingConfig: ProductUseCaseListingConfig = {
  id: "listing-trail-shoes",
  slug: "trail",
  sportSlug: "running",
  categoryPathSegment: "shoes",
  categoryId: "cat-running-shoes",
  subcategoryId: "sub-trail",
  subcategorySlug: "trail",
  eyebrow: "TERRAIN",
  title: "Trail Shoes",
  description:
    "Off-road running shoes with grip and protection for dirt, rock and mixed terrain.",
  seoTitle: "Trail Running Shoes",
  seoDescription:
    "Browse trail running shoes. Filter by terrain, grip, cushion, brand and price.",
  heroImageSrc: "/images/running/category/hero-trail.jpg",
  heroImageAlt: "Trail running on a dirt path",
  countLabel: "TRAIL SHOES",
  metadata: [
    { id: "count", kind: "count", label: "Shoes in this list" },
    { id: "verified", kind: "verified", label: "Data verified" },
    {
      id: "terrain",
      kind: "custom",
      label: "Built for",
      value: "Off-road terrain",
    },
  ],
  subnav: [
    { id: "overview", label: "Overview", href: "/running/shoes/trail", icon: "overview" },
    {
      id: "road-trail",
      label: "Road to Trail",
      href: "/running/shoes?type=road-to-trail",
      icon: "route",
    },
    {
      id: "guide",
      label: "Road vs Trail",
      href: "/guides/road-vs-trail-running-shoes",
      icon: "tips",
    },
  ],
  primaryFilterKeys: [
    "type",
    "terrain",
    "cushionLevel",
    "drop",
    "weight",
    "brand",
    "price",
  ],
  typeFacetSlugs: ["trail"],
  defaultSpecs: { terrain: ["trail"] },
  education: {
    title: "What makes a capable trail shoe?",
    body: "Trail shoes are for dirt, mud and rock — grip and protection first. They are not quieter road dailies with deeper lugs bolted on; expect slower pavement feel and different stack priorities than road race shoes.",
    guideSlug: "road-vs-trail-running-shoes",
    guideCtaLabel: "Read Road vs Trail →",
    beginnerStart:
      "Match lug depth to your usual trails. Soft singletrack often needs less aggressive lugs than muddy winter hills. Keep a road shoe for pavement weeks.",
    tradeOffs: [
      {
        left: "Aggressive grip",
        right: "Road crossover",
        note: "Deep lugs bite trail and feel slow/noisy on pavement.",
      },
      {
        left: "Rock protection",
        right: "Soft ground feel",
        note: "Plates and denser foams protect on scree; they can feel dead on smooth dirt.",
      },
    ],
    factors: [
      {
        id: "grip",
        title: "Lug & rubber",
        body: "Compound and lug pattern decide mud vs rock confidence — filter by terrain you run.",
      },
      {
        id: "protection",
        title: "Underfoot protection",
        body: "Rock plates and denser uppers help on technical ground; overkill on soft packed paths.",
      },
      {
        id: "terrain",
        title: "Terrain match",
        body: "Road-to-trail hybrids exist — don’t buy ultra mud cups for gravel bike paths.",
      },
      {
        id: "distance",
        title: "Distance & stack",
        body: "Short trail races and ultras pull different cushion and weight priorities.",
      },
    ],
  },
  relatedGuideSlugs: [
    "road-vs-trail-running-shoes",
    "how-to-choose-running-shoes",
    "running-shoe-cushioning",
  ],
  relatedGuidesTitle: "RELATED GUIDES",
  bestGuideSlug: "trail-running-shoes",
  comparisonLimit: 4,
};

export const heavyRunnersListingConfig: ProductUseCaseListingConfig = {
  id: "listing-heavy-runners",
  slug: "heavy-runners",
  sportSlug: "running",
  categoryPathSegment: "shoes",
  categoryId: "cat-running-shoes",
  useCaseId: "uc-heavy",
  useCaseSlug: "heavy-runners",
  eyebrow: "RUNNER PROFILE",
  title: "Running Shoes for Heavier Runners",
  description:
    "Protective higher-stack road shoes often preferred when cushion, platform and durability matter more.",
  seoTitle: "Running Shoes for Heavier Runners",
  seoDescription:
    "Browse running shoes suited to the heavier-runners profile. Filter by cushion, width, brand and price.",
  heroImageSrc: "/images/running/category/hero-heavy.jpg",
  heroImageAlt: "Road runner on an easy training run",
  countLabel: "SHOES",
  metadata: [
    { id: "count", kind: "count", label: "Shoes in this list" },
    { id: "verified", kind: "verified", label: "Data verified" },
    {
      id: "focus",
      kind: "custom",
      label: "Focus",
      value: "Cushion & platform",
    },
  ],
  subnav: [
    {
      id: "overview",
      label: "Overview",
      href: "/running/shoes/heavy-runners",
      icon: "overview",
    },
    {
      id: "max",
      label: "Max Cushion",
      href: "/running/shoes/heavy-runners?type=max-cushion",
      icon: "bolt",
    },
    {
      id: "wide",
      label: "Wide Fit",
      href: "/running/shoes/heavy-runners?width=wide",
      icon: "route",
    },
    {
      id: "best",
      label: "Best Picks",
      href: "/best/running-shoes-heavy-runners",
      icon: "tips",
    },
  ],
  primaryFilterKeys: [
    "type",
    "cushionLevel",
    "stability",
    "widthOptions",
    "drop",
    "weight",
    "brand",
    "price",
  ],
  education: {
    title: "What often matters for this profile?",
    body: "Heavier runners often prefer protective stack, planted platforms and durable uppers for easy and long road miles. Kitletics does not define a universal weight cutoff or make medical claims — treat this as preference guidance.",
    guideSlug: "running-shoe-cushioning",
    guideCtaLabel: "Read Cushioning Explained →",
    beginnerStart:
      "Prioritise max-cushion or high-cushion dailies with a width that fits. Add stability only if you already prefer guided rides — not as a weight stereotype.",
    tradeOffs: [
      {
        left: "Protective stack",
        right: "Lightweight race feel",
        note: "Higher cushion helps easy miles; it rarely matches plated race economy.",
      },
      {
        left: "Wide / high-volume fit",
        right: "Performance last snugness",
        note: "Roomier shoes reduce hotspots; race lasts may still need a separate pair.",
      },
    ],
    factors: [
      {
        id: "cushion",
        title: "Cushion",
        body: "Higher stack can feel more protective on easy and long miles.",
      },
      {
        id: "platform",
        title: "Platform",
        body: "A stable base and geometry can feel more planted under load.",
      },
      {
        id: "durability",
        title: "Durability",
        body: "Foam longevity and outsole wear matter when weekly load is high.",
      },
      {
        id: "fit",
        title: "Fit",
        body: "Width options and lockdown help when volume and swelling vary.",
      },
    ],
  },
  relatedGuideSlugs: [
    "running-shoe-cushioning",
    "how-to-choose-running-shoes",
    "stability-shoes-explained",
  ],
  relatedGuidesTitle: "RELATED GUIDES",
  bestGuideSlug: "running-shoes-heavy-runners",
  comparisonLimit: 4,
};

export const dailyTrainersListingConfig: ProductUseCaseListingConfig = {
  id: "listing-daily-trainers",
  slug: "daily-trainers",
  sportSlug: "running",
  categoryPathSegment: "shoes",
  categoryId: "cat-running-shoes",
  subcategoryId: "sub-daily-trainers",
  subcategorySlug: "daily-trainers",
  eyebrow: "SHOE TYPE",
  title: "Daily Trainers",
  description:
    "Versatile road running shoes built for most of your weekly mileage — easy days, steady aerobic work, and high-mileage training.",
  seoTitle: "Daily Trainer Running Shoes",
  seoDescription:
    "Browse daily trainer running shoes for everyday mileage. Filter by cushion, drop, brand and price — then compare side by side.",
  heroImageSrc: "/images/running/category/use-daily.jpg",
  heroImageAlt: "Runner on pavement during a daily training run",
  countLabel: "DAILY TRAINERS",
  metadata: [
    { id: "count", kind: "count", label: "Shoes in this list" },
    { id: "verified", kind: "verified", label: "Data verified" },
    {
      id: "focus",
      kind: "custom",
      label: "Focus",
      value: "Weekly mileage",
    },
  ],
  subnav: [
    {
      id: "overview",
      label: "Overview",
      href: "/running/shoes/daily-trainers",
      icon: "overview",
    },
    {
      id: "cushion",
      label: "Max Cushion",
      href: "/running/shoes/daily-trainers?type=max-cushion",
      icon: "bolt",
      refine: { type: "max-cushion" },
    },
    {
      id: "tempo",
      label: "Tempo-capable",
      href: "/running/shoes/daily-trainers?type=tempo",
      icon: "timer",
      refine: { type: "tempo" },
    },
    {
      id: "tips",
      label: "Daily Trainer Tips",
      href: "#daily-trainer-tips",
      icon: "tips",
    },
  ],
  primaryFilterKeys: [
    "type",
    "cushionLevel",
    "drop",
    "weight",
    "brand",
    "price",
  ],
  typeFacetSlugs: ["daily-trainers", "max-cushion", "tempo", "neutral"],
  education: {
    title: "What makes a great daily trainer?",
    body: "Daily trainers are the workhorse for easy and steady miles — durable foams, reliable fit, enough cushion for consecutive days. They should not feel like a fragile race shoe or a trail lug platform.",
    guideSlug: "what-is-a-daily-trainer",
    guideCtaLabel: "Learn more in What is a Daily Trainer →",
    beginnerStart:
      "Buy one daily trainer in your width first. Add tempo or race shoes only after your easy-mile shoe is dialled.",
    tradeOffs: [
      {
        left: "All-week durability",
        right: "Race-day snap",
        note: "Daily foams last longer and feel calmer; they rarely match plated race pop.",
      },
      {
        left: "Max soft cushion",
        right: "Versatile turnover",
        note: "Ultra-soft stacks protect longs; some runners want a firmer daily for mixed paces.",
      },
    ],
    factors: [
      {
        id: "versatile",
        title: "Easy-mile job",
        body: "Built for most of the week — not specialised for one race distance.",
      },
      {
        id: "durable",
        title: "Foam & upper durability",
        body: "Must survive repeated easy days; race foams usually fail this test.",
      },
      {
        id: "cushion",
        title: "Sustainable cushion",
        body: "Protective enough for consecutive days without requiring a second pair immediately.",
      },
      {
        id: "rotation",
        title: "Rotation partner",
        body: "Pairs with a tempo or race shoe when you need speed-day specialization.",
      },
    ],
  },
  relatedGuideSlugs: [
    "what-is-a-daily-trainer",
    "running-shoe-rotation",
    "how-to-choose-running-shoes",
  ],
  relatedGuidesTitle: "DAILY TRAINER TIPS",
  relatedGuidesIndexHref: "/guides",
  bestGuideSlug: "daily-trainers",
  comparisonLimit: 4,
};

const ALL_LISTINGS: ProductUseCaseListingConfig[] = [
  dailyTrainersListingConfig,
  raceShoesListingConfig,
  stabilityShoesListingConfig,
  trailShoesListingConfig,
  heavyRunnersListingConfig,
];

export function getUseCaseListingConfigs(): ProductUseCaseListingConfig[] {
  return ALL_LISTINGS;
}

export function getUseCaseListingConfig(
  sportSlug: string,
  categoryPathSegment: string,
  listingSlug: string,
): ProductUseCaseListingConfig | undefined {
  return ALL_LISTINGS.find(
    (c) =>
      c.sportSlug === sportSlug &&
      c.categoryPathSegment === categoryPathSegment &&
      c.slug === listingSlug,
  );
}
