/**
 * Declarative Sport Hub config — IDs/slugs only.
 * Presentation receives resolved entities via getSportHubData().
 */
export interface SportHubConfig {
  sportSlug: string;
  parentNavLabel?: string;
  parentNavHref?: string;
  hero: {
    /** Optional override; defaults to "{SPORT} GEAR" */
    title?: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
  };
  primaryCategoryId: string;
  bestGuideSlug: string;
  finderToolSlug: string;
  starterKitSlug?: string;
  /**
   * Extra best-guide product strips below the primary featured+finder block
   * (e.g. Running GPS watches / HRMs — not only shoes).
   * Optional finderToolSlug inlines that category’s finder beside the cards.
   */
  moreBestSections?: {
    bestGuideSlug: string;
    /** Override title; defaults to guide title */
    title?: string;
    productLimit?: number;
    /** When set, resolve this tool and show it inline like the shoe finder */
    finderToolSlug?: string;
  }[];
  /**
   * @deprecated Prefer pairing finders via moreBestSections[].finderToolSlug.
   * Still resolved for hubs that show a separate finder grid.
   */
  categoryFinders?: {
    toolSlug: string;
    title: string;
    description: string;
    ctaLabel: string;
    fields: { label: string; value: string; name: string }[];
  }[];
  buyingGuideImageMap: Record<string, string>;
  quickActions: {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: "search" | "trophy" | "compare" | "guide";
  }[];
  shopCategories: {
    categoryId?: string;
    label: string;
    href: string;
    icon: string;
  }[];
  /** Optional grouped Shop-by discovery (Running). When set, UI prefers groups over a single crammed row. */
  shopGroups?: {
    id: string;
    label: string;
    items: {
      categoryId?: string;
      label: string;
      href: string;
      icon: string;
    }[];
  }[];
  finder: {
    title: string;
    description: string;
    ctaLabel: string;
    footnoteLabel: string;
  };
  finderFields: { label: string; value: string; name: string }[];
  benefits: { title: string; description: string; icon: string }[];
  guidesTitle: string;
  comparisonsTitle: string;
  brandsTitle: string;
  brandIds: string[];
  footer: {
    shop: { label: string; href: string }[];
    tools: { label: string; href: string }[];
    about: { label: string; href: string }[];
  };
}

const SHARED_BENEFITS = [
  {
    title: "Expert & Independent",
    description:
      "Our advice is independent and backed by structured data and evidence.",
    icon: "BadgeCheck",
  },
  {
    title: "Always Up to Date",
    description:
      "We track new releases, product changes and current availability.",
    icon: "RefreshCw",
  },
  {
    title: "Real Prices",
    description:
      "Recently verified prices from supported retailers in your region.",
    icon: "Tag",
  },
  {
    title: "Find What Fits You",
    description: "Smart tools match gear to your level, style and budget.",
    icon: "Sparkles",
  },
] as const;

const SHARED_ABOUT = [
  { label: "About Kitletics", href: "/about" },
  { label: "Our Methodology", href: "/methodology" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Contact Us", href: "/contact" },
  { label: "Help Center", href: "/contact" },
];

export const padelSportHubConfig: SportHubConfig = {
  sportSlug: "padel",
  parentNavLabel: "Racket Sports",
  parentNavHref: "/racket",
  hero: {
    title: "PADEL GEAR",
    description:
      "Find the right racket for how you play. Compare padel rackets, shoes and equipment — or use Kitletics Match to find the right setup for your level and playing style.",
    imageSrc: "/images/padel/hero.jpg",
    imageAlt:
      "Padel racket and yellow balls on a blue court against a net",
  },
  primaryCategoryId: "cat-padel-rackets",
  bestGuideSlug: "padel-rackets",
  finderToolSlug: "padel-racket-finder",
  starterKitSlug: "padel-starter-kit",
  buyingGuideImageMap: {
    "how-to-choose-a-padel-racket": "/images/padel/guides/choose-racket.jpg",
    "how-to-choose-padel-shoes": "/images/padel/guides/choose-shoes.jpg",
    "padel-grips-overgrips-explained": "/images/padel/guides/grips.jpg",
  },
  quickActions: [
    {
      id: "finder",
      title: "FIND YOUR RACKET",
      description: "Answer a few questions",
      href: "/tools/padel-racket-finder",
      icon: "search",
    },
    {
      id: "best",
      title: "BEST PADEL RACKETS",
      description: "Top picks for 2026",
      href: "/best/padel-rackets",
      icon: "trophy",
    },
    {
      id: "compare",
      title: "COMPARE RACKETS",
      description: "Compare up to 4",
      href: "/compare?category=padel-rackets",
      icon: "compare",
    },
    {
      id: "guide",
      title: "BUYING GUIDE",
      description: "Learn before you buy",
      href: "/guides/how-to-choose-a-padel-racket",
      icon: "guide",
    },
  ],
  shopCategories: [
    {
      categoryId: "cat-padel-rackets",
      label: "Rackets",
      href: "/padel/rackets",
      icon: "CircleDot",
    },
    {
      categoryId: "cat-padel-shoes",
      label: "Shoes",
      href: "/padel/shoes",
      icon: "Footprints",
    },
    {
      categoryId: "cat-padel-bags",
      label: "Bags",
      href: "/padel/bags",
      icon: "Briefcase",
    },
    {
      categoryId: "cat-padel-balls",
      label: "Balls",
      href: "/padel/balls",
      icon: "Circle",
    },
    {
      categoryId: "cat-padel-grips",
      label: "Grips & Overgrips",
      href: "/padel/grips",
      icon: "Layers",
    },
    // padel-accessories / padel-clothing soft-gated until products exist
    {
      label: "Deals",
      href: "/padel/rackets",
      icon: "Tag",
    },
  ],
  finder: {
    title: "FIND YOUR PERFECT PADEL RACKET",
    description:
      "Our smart tool matches you with rackets that fit your level, style and goals.",
    ctaLabel: "FIND MY RACKET",
    footnoteLabel: "Padel Racket Finder",
  },
  finderFields: [
    { label: "My Level", value: "Intermediate", name: "level" },
    {
      label: "My Play Style",
      value: "Control & Maneuverability",
      name: "style",
    },
    {
      label: "Shape Preference",
      value: "Round / Teardrop",
      name: "shape",
    },
    { label: "Budget", value: "€150 – €250", name: "budget" },
  ],
  benefits: [...SHARED_BENEFITS],
  guidesTitle: "PADEL BUYING GUIDES",
  comparisonsTitle: "FEATURED COMPARISONS",
  brandsTitle: "TOP PADEL BRANDS",
  brandIds: [
    "brand-nox",
    "brand-bullpadel",
    "brand-adidas-padel",
    "brand-head-padel",
    "brand-wilson-padel",
    "brand-siux",
    "brand-babolat-padel",
    "brand-starvie",
  ],
  footer: {
    shop: [
      { label: "Rackets", href: "/padel/rackets" },
      { label: "Shoes", href: "/padel/shoes" },
      { label: "Bags", href: "/padel/bags" },
      { label: "Balls", href: "/padel/balls" },
      { label: "Grips", href: "/padel/grips" },
      { label: "All Padel Gear", href: "/padel" },
    ],
    tools: [
      { label: "Padel Racket Finder", href: "/tools/padel-racket-finder" },
      { label: "Compare Rackets", href: "/compare?category=padel-rackets" },
      { label: "Best Padel Rackets", href: "/best/padel-rackets" },
      { label: "Starter Kit Guide", href: "/setups/padel-starter-kit" },
    ],
    about: SHARED_ABOUT,
  },
};

export const runningSportHubConfig: SportHubConfig = {
  sportSlug: "running",
  hero: {
    title: "RUNNING GEAR",
    description:
      "Shoes, watches, hydration, apparel, fuel and recovery — browse a full running equipment catalog, or start with Kitletics Match for shoes.",
    imageSrc: "/images/brands/heroes/running-urban.jpg",
    imageAlt: "Runner on an urban road at dusk",
  },
  primaryCategoryId: "cat-running-shoes",
  bestGuideSlug: "running-shoes",
  finderToolSlug: "running-shoe-finder",
  starterKitSlug: "beginner-running-setup",
  buyingGuideImageMap: {
    "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
    "running-shoe-cushioning": "/images/running/category/hero-heavy.jpg",
    "road-vs-trail-running-shoes": "/images/running/guides/daily-vs-long.jpg",
    "running-shoe-drop": "/images/running/category/hero-race.jpg",
    "running-shoe-rotation": "/images/running/category/use-daily.jpg",
    "stability-shoes-explained": "/images/running/category/hero-stability.jpg",
  },
  moreBestSections: [
    {
      bestGuideSlug: "running-watches",
      productLimit: 5,
      finderToolSlug: "fitness-watch-finder",
    },
    {
      bestGuideSlug: "heart-rate-monitors-running",
      productLimit: 5,
      finderToolSlug: "running-hrm-finder",
    },
    {
      bestGuideSlug: "running-hydration-vests",
      productLimit: 4,
      finderToolSlug: "running-hydration-finder",
    },
    {
      bestGuideSlug: "running-clothing-hot-weather",
      title: "Best Running Apparel 2026",
      productLimit: 5,
      finderToolSlug: "running-clothing-finder",
    },
    {
      bestGuideSlug: "running-socks",
      productLimit: 5,
    },
    {
      bestGuideSlug: "running-headphones",
      productLimit: 4,
      finderToolSlug: "running-accessories-finder",
    },
    {
      bestGuideSlug: "running-recovery-gear",
      productLimit: 4,
      finderToolSlug: "running-recovery-finder",
    },
  ],
  // Finders are inlined on each best strip above — keep definitions for
  // resolver lookup / footer tools only (not rendered as a separate grid).
  categoryFinders: [
    {
      toolSlug: "fitness-watch-finder",
      title: "FIND YOUR PERFECT GPS WATCH",
      description:
        "Match GPS watches to training goals, maps, battery, size and ecosystem.",
      ctaLabel: "FIND MY WATCH",
      fields: [
        { label: "Main Use", value: "Daily training", name: "primaryUse" },
        { label: "Maps", value: "Yes — maps matter", name: "needsMaps" },
        { label: "Size", value: "Standard", name: "watchSize" },
        { label: "Budget", value: "€200 – €400", name: "budget" },
      ],
    },
    {
      toolSlug: "running-hrm-finder",
      title: "FIND YOUR PERFECT HEART RATE MONITOR",
      description:
        "Match chest straps and armband optical HRMs to training style and comfort.",
      ctaLabel: "FIND MY HRM",
      fields: [
        { label: "Main Use", value: "Intervals / track", name: "primaryUse" },
        { label: "Form", value: "Chest strap", name: "formFactor" },
        { label: "Dynamics", value: "No — HR is enough", name: "needsDynamics" },
        { label: "Budget", value: "€50 – €100", name: "budget" },
      ],
    },
    {
      toolSlug: "running-hydration-finder",
      title: "FIND YOUR PERFECT HYDRATION SETUP",
      description:
        "Match vests, belts and flasks to distance, terrain and how much you carry.",
      ctaLabel: "FIND MY HYDRATION",
      fields: [
        { label: "Distance", value: "Half marathon", name: "primaryUse" },
        { label: "Terrain", value: "Road", name: "terrain" },
        { label: "Carry", value: "Storage — vest", name: "carryStyle" },
        { label: "Budget", value: "€100 – €180", name: "budget" },
      ],
    },
    {
      toolSlug: "running-clothing-finder",
      title: "FIND YOUR PERFECT RUNNING APPAREL",
      description:
        "Match tops, shorts and socks to training context, fit and comfort.",
      ctaLabel: "FIND MY APPAREL",
      fields: [
        { label: "Need", value: "Daily training", name: "primaryUse" },
        { label: "Fit", value: "Unisex / any", name: "sizingRange" },
        { label: "Priority", value: "Comfort", name: "priorities" },
        { label: "Budget", value: "€40 – €80", name: "budget" },
      ],
    },
    {
      toolSlug: "running-accessories-finder",
      title: "FIND YOUR PERFECT ACCESSORIES",
      description:
        "Match headphones, sunglasses, lights and safety gear to when you run.",
      ctaLabel: "FIND MY ACCESSORIES",
      fields: [
        { label: "Accessory", value: "Headphones / audio", name: "primaryUse" },
        { label: "When", value: "Road / daylight", name: "terrain" },
        { label: "Priority", value: "Comfort / fit", name: "priorities" },
        { label: "Budget", value: "€50 – €120", name: "budget" },
      ],
    },
    {
      toolSlug: "running-fuel-finder",
      title: "FIND YOUR PERFECT RACE FUEL",
      description:
        "Match gels, chews and drink mixes to distance and stomach priorities.",
      ctaLabel: "FIND MY FUEL",
      fields: [
        { label: "Distance", value: "Marathon", name: "primaryUse" },
        { label: "Format", value: "Gels", name: "formFactor" },
        { label: "Priority", value: "Stomach comfort", name: "priorities" },
        { label: "Budget", value: "€25 – €50", name: "budget" },
      ],
    },
    {
      toolSlug: "running-recovery-finder",
      title: "FIND YOUR PERFECT RECOVERY TOOLS",
      description:
        "Match massage, compression and mobility tools to how you bounce back.",
      ctaLabel: "FIND MY RECOVERY",
      fields: [
        { label: "Need", value: "After long runs", name: "primaryUse" },
        { label: "Priority", value: "Massage / percussion", name: "priorities" },
        { label: "Budget", value: "€50 – €120", name: "budget" },
        { label: "Use", value: "Home recovery", name: "context" },
      ],
    },
  ],
  quickActions: [
    {
      id: "finder",
      title: "FIND YOUR SHOES",
      description: "Answer a few questions",
      href: "/tools/running-shoe-finder",
      icon: "search",
    },
    {
      id: "watches",
      title: "GPS WATCHES",
      description: "Best running watches",
      href: "/best/running-watches",
      icon: "trophy",
    },
    {
      id: "hrm",
      title: "HEART RATE",
      description: "Chest & armband HRMs",
      href: "/running/heart-rate-monitors",
      icon: "compare",
    },
    {
      id: "gear",
      title: "ALL RUNNING GEAR",
      description: "Shoes, watches & more",
      href: "/running/gear",
      icon: "guide",
    },
  ],
  shopCategories: [
    {
      categoryId: "cat-running-shoes",
      label: "Shoes",
      href: "/running/shoes",
      icon: "Footprints",
    },
    {
      categoryId: "cat-gps-watches",
      label: "GPS Watches",
      href: "/running/watches",
      icon: "Watch",
    },
    {
      categoryId: "cat-hrm",
      label: "Heart Rate",
      href: "/running/heart-rate-monitors",
      icon: "HeartPulse",
    },
    {
      categoryId: "cat-packs-vests",
      label: "Packs & Vests",
      href: "/running/packs",
      icon: "Backpack",
    },
    {
      categoryId: "cat-hydration",
      label: "Hydration",
      href: "/running/hydration",
      icon: "Droplets",
    },
    {
      label: "All Gear",
      href: "/running/gear",
      icon: "Layers",
    },
  ],
  shopGroups: [
    {
      id: "shoes",
      label: "Running Shoes",
      items: [
        {
          categoryId: "cat-running-shoes",
          label: "All Shoes",
          href: "/running/shoes",
          icon: "Footprints",
        },
      ],
    },
    {
      id: "surfaces",
      label: "Where you run",
      items: [
        { label: "Road", href: "/running/road", icon: "Footprints" },
        { label: "Trail", href: "/running/trail", icon: "Footprints" },
        { label: "Track", href: "/running/track", icon: "Footprints" },
        { label: "Treadmill", href: "/running/treadmill", icon: "Footprints" },
      ],
    },
    {
      id: "training-tech",
      label: "Training Tech",
      items: [
        {
          categoryId: "cat-gps-watches",
          label: "GPS Watches",
          href: "/running/watches",
          icon: "Watch",
        },
        {
          categoryId: "cat-hrm",
          label: "Heart Rate",
          href: "/running/heart-rate-monitors",
          icon: "HeartPulse",
        },
      ],
    },
    {
      id: "hydration-carry",
      label: "Hydration & Carry",
      items: [
        {
          categoryId: "cat-hydration",
          label: "Hydration",
          href: "/running/hydration",
          icon: "Droplets",
        },
        {
          categoryId: "cat-packs-vests",
          label: "Packs & Vests",
          href: "/running/packs",
          icon: "Backpack",
        },
        {
          categoryId: "cat-running-belts",
          label: "Belts",
          href: "/running/belts",
          icon: "Briefcase",
        },
      ],
    },
    {
      id: "apparel",
      label: "Apparel",
      items: [
        {
          categoryId: "cat-running-clothing",
          label: "Clothing",
          href: "/running/clothing",
          icon: "Shirt",
        },
        {
          categoryId: "cat-running-socks",
          label: "Socks",
          href: "/running/socks",
          icon: "Layers",
        },
      ],
    },
    {
      id: "accessories",
      label: "Accessories",
      items: [
        {
          categoryId: "cat-headphones",
          label: "Headphones",
          href: "/running/headphones",
          icon: "Headphones",
        },
        {
          categoryId: "cat-sunglasses",
          label: "Sunglasses",
          href: "/running/sunglasses",
          icon: "Glasses",
        },
        {
          categoryId: "cat-running-lights",
          label: "Headlamps",
          href: "/running/lights",
          icon: "Flashlight",
        },
        {
          categoryId: "cat-safety",
          label: "Safety",
          href: "/running/safety",
          icon: "Shield",
        },
        {
          categoryId: "cat-accessories",
          label: "Accessories",
          href: "/running/accessories",
          icon: "Layers",
        },
      ],
    },
    {
      id: "fuel-recovery",
      label: "Fuel & Recovery",
      items: [
        {
          categoryId: "cat-nutrition",
          label: "Fuel",
          href: "/running/nutrition",
          icon: "Droplets",
        },
        {
          categoryId: "cat-recovery-gear",
          label: "Recovery",
          href: "/running/recovery",
          icon: "HeartPulse",
        },
      ],
    },
  ],
  finder: {
    title: "FIND YOUR PERFECT RUNNING SHOES",
    description:
      "Our smart tool matches you with shoes that fit your terrain, training and goals.",
    ctaLabel: "FIND MY SHOES",
    footnoteLabel: "Running Shoe Finder",
  },
  finderFields: [
    { label: "Terrain", value: "Road", name: "terrain" },
    { label: "Primary Use", value: "Daily training", name: "use" },
    { label: "Cushioning", value: "Soft / Max", name: "cushion" },
    { label: "Budget", value: "€120 – €180", name: "budget" },
  ],
  benefits: [...SHARED_BENEFITS],
  guidesTitle: "RUNNING BUYING GUIDES",
  comparisonsTitle: "FEATURED COMPARISONS",
  brandsTitle: "TOP RUNNING BRANDS",
  brandIds: [
    "brand-asics",
    "brand-nike",
    "brand-hoka",
    "brand-brooks",
    "brand-saucony",
    "brand-new-balance",
    "brand-adidas",
    "brand-garmin",
  ],
  footer: {
    shop: [
      { label: "Running Shoes", href: "/running/shoes" },
      { label: "GPS Watches", href: "/running/watches" },
      { label: "Packs & Vests", href: "/running/packs" },
      { label: "Road running", href: "/running/road" },
      { label: "Trail running", href: "/running/trail" },
      { label: "Track running", href: "/running/track" },
      { label: "Clothing", href: "/running/clothing" },
      { label: "Fuel", href: "/running/nutrition" },
      { label: "Recovery", href: "/running/recovery" },
      { label: "All Running Gear", href: "/running/gear" },
    ],
    tools: [
      { label: "Running Shoe Finder", href: "/tools/running-shoe-finder" },
      { label: "GPS Watch Finder", href: "/tools/fitness-watch-finder" },
      { label: "Heart Rate Monitor Finder", href: "/tools/running-hrm-finder" },
      { label: "Running Hydration Finder", href: "/tools/running-hydration-finder" },
      { label: "Apparel Finder", href: "/tools/running-clothing-finder" },
      { label: "Accessories Finder", href: "/tools/running-accessories-finder" },
      { label: "Fuel Finder", href: "/tools/running-fuel-finder" },
      { label: "Recovery Finder", href: "/tools/running-recovery-finder" },
      { label: "Pace Calculator", href: "/tools/running-pace-calculator" },
      { label: "Race Time Predictor", href: "/tools/race-time-predictor" },
      { label: "Shoe Rotation Planner", href: "/tools/shoe-rotation-planner" },
      { label: "Compare Shoes", href: "/compare?category=running-shoes" },
    ],
    about: SHARED_ABOUT,
  },
};

const CONFIGS: Record<string, SportHubConfig> = {
  padel: padelSportHubConfig,
  running: runningSportHubConfig,
};

export function getMockupSportHubConfig(
  sportSlug: string,
): SportHubConfig | undefined {
  return CONFIGS[sportSlug];
}

export function hasMockupSportHub(sportSlug: string): boolean {
  return Boolean(CONFIGS[sportSlug]);
}
