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
    fields: {
      label: string;
      value: string;
      name: string;
      options: Array<{ value: string; label: string }>;
    }[];
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
  finderFields: {
    label: string;
    value: string;
    name: string;
    options: Array<{ value: string; label: string }>;
  }[];
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
      "Rackets, shoes, balls, bags, grips and accessories matched to how you play — find your racket, shortlist Best picks, or explore court equipment with clear reasons for every recommendation.",
    imageSrc: "/images/padel/hero.jpg",
    imageAlt:
      "Padel racket and yellow balls on a blue outdoor padel court against the net",
  },
  primaryCategoryId: "cat-padel-rackets",
  bestGuideSlug: "padel-rackets",
  finderToolSlug: "padel-racket-finder",
  starterKitSlug: "padel-starter-kit",
  buyingGuideImageMap: {
    "how-to-choose-a-padel-racket": "/images/padel/guides/choose-racket.jpg",
    "how-to-choose-padel-shoes": "/images/padel/guides/choose-shoes.jpg",
    "padel-grips-overgrips-explained": "/images/padel/guides/grips.jpg",
    "padel-racket-shapes-explained": "/images/padel/guides/choose-racket.jpg",
    "round-vs-teardrop-vs-diamond-padel-rackets":
      "/images/padel/guides/choose-racket.jpg",
  },
  moreBestSections: [
    {
      bestGuideSlug: "padel-rackets-beginners",
      title: "Best Beginner Padel Rackets",
      productLimit: 4,
    },
    {
      bestGuideSlug: "padel-rackets-control",
      title: "Best Control Padel Rackets",
      productLimit: 4,
    },
    {
      bestGuideSlug: "padel-rackets-power",
      title: "Best Power Padel Rackets",
      productLimit: 4,
    },
    {
      bestGuideSlug: "padel-shoes",
      title: "Best Padel Shoes",
      productLimit: 5,
    },
    {
      bestGuideSlug: "padel-balls",
      title: "Best Padel Balls",
      productLimit: 5,
    },
    {
      bestGuideSlug: "padel-bags",
      title: "Best Padel Bags",
      productLimit: 4,
    },
    {
      bestGuideSlug: "padel-overgrips",
      title: "Best Padel Overgrips",
      productLimit: 3,
    },
  ],
  quickActions: [
    {
      id: "finder",
      title: "FIND YOUR RACKET",
      description: "Adaptive questions · clear matches",
      href: "/tools/padel-racket-finder",
      icon: "search",
    },
    {
      id: "best",
      title: "BEST PADEL RACKETS",
      description: "Editor shortlists for 2026",
      href: "/best/padel-rackets",
      icon: "trophy",
    },
    {
      id: "database",
      title: "RACKET DATABASE",
      description: "Filter · compare · explore",
      href: "/padel/rackets/database",
      icon: "compare",
    },
    {
      id: "guide",
      title: "HOW TO CHOOSE",
      description: "Shape, balance, weight",
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
      label: "Grips",
      href: "/padel/grips",
      icon: "Layers",
    },
    {
      categoryId: "cat-padel-accessories",
      label: "Accessories",
      href: "/padel/accessories",
      icon: "Shield",
    },
  ],
  shopGroups: [
    {
      id: "rackets",
      label: "Rackets",
      items: [
        {
          categoryId: "cat-padel-rackets",
          label: "All rackets",
          href: "/padel/rackets",
          icon: "CircleDot",
        },
        {
          label: "Beginner",
          href: "/best/padel-rackets-beginners",
          icon: "Sparkles",
        },
        {
          label: "Control",
          href: "/best/padel-rackets-control",
          icon: "Target",
        },
        {
          label: "Power",
          href: "/best/padel-rackets-power",
          icon: "Zap",
        },
        {
          label: "Database",
          href: "/padel/rackets/database",
          icon: "Table",
        },
      ],
    },
    {
      id: "court",
      label: "Court kit",
      items: [
        {
          categoryId: "cat-padel-shoes",
          label: "Shoes",
          href: "/padel/shoes",
          icon: "Footprints",
        },
        {
          categoryId: "cat-padel-balls",
          label: "Balls",
          href: "/padel/balls",
          icon: "Circle",
        },
        {
          categoryId: "cat-padel-bags",
          label: "Bags",
          href: "/padel/bags",
          icon: "Briefcase",
        },
        {
          categoryId: "cat-padel-grips",
          label: "Grips & overgrips",
          href: "/padel/grips",
          icon: "Layers",
        },
        {
          categoryId: "cat-padel-accessories",
          label: "Accessories",
          href: "/padel/accessories",
          icon: "Shield",
        },
      ],
    },
    {
      id: "decide",
      label: "Decide",
      items: [
        {
          label: "Racket Finder",
          href: "/tools/padel-racket-finder",
          icon: "Search",
        },
        {
          label: "Compare",
          href: "/compare?category=padel-rackets",
          icon: "GitCompare",
        },
        {
          label: "Best rackets",
          href: "/best/padel-rackets",
          icon: "Trophy",
        },
        {
          label: "Guides",
          href: "/guides?sport=padel",
          icon: "BookOpen",
        },
        {
          label: "Collections",
          href: "/padel/collections",
          icon: "Layers",
        },
        {
          label: "Research",
          href: "/research/padel-racket-shapes",
          icon: "BookOpen",
        },
        {
          label: "Brands",
          href: "/brands?sport=padel",
          icon: "Sparkles",
        },
      ],
    },
  ],
  finder: {
    title: "FIND YOUR PERFECT PADEL RACKET",
    description:
      "Adaptive questions about level, priorities and feel — every match explains why. Affiliate commission never ranks results.",
    ctaLabel: "FIND MY RACKET",
    footnoteLabel: "Padel Racket Finder",
  },
  finderFields: [
    {
      label: "Experience",
      name: "primaryUse",
      value: "intermediate",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ],
    },
    {
      label: "Priority",
      name: "primaryPriority",
      value: "balanced",
      options: [
        { value: "control", label: "Control" },
        { value: "balanced", label: "Balanced" },
        { value: "power", label: "Power" },
        { value: "comfort", label: "Comfort" },
        { value: "maneuverability", label: "Maneuverability" },
      ],
    },
    {
      label: "Weight",
      name: "weightPreference",
      value: "dont-know",
      options: [
        { value: "light", label: "Light" },
        { value: "medium", label: "Medium" },
        { value: "heavy", label: "Heavy" },
        { value: "dont-know", label: "Don't know" },
      ],
    },
    {
      label: "Budget",
      name: "budget",
      value: "180-280",
      options: [
        { value: "under-100", label: "Under €100" },
        { value: "100-180", label: "€100 – €180" },
        { value: "180-280", label: "€180 – €280" },
        { value: "280-plus", label: "€280+" },
      ],
    },
  ],
  benefits: [...SHARED_BENEFITS],
  guidesTitle: "LEARN PADEL GEAR",
  comparisonsTitle: "FEATURED COMPARISONS",
  brandsTitle: "PADEL BRANDS",
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
      { label: "Accessories", href: "/padel/accessories" },
      { label: "All Padel Gear", href: "/padel" },
    ],
    tools: [
      { label: "Racket Database", href: "/padel/rackets/database" },
      { label: "Collections", href: "/padel/collections" },
      { label: "Padel Racket Finder", href: "/tools/padel-racket-finder" },
      { label: "Compare Rackets", href: "/compare?category=padel-rackets" },
      { label: "Best Padel Rackets", href: "/best/padel-rackets" },
      { label: "Research: shapes", href: "/research/padel-racket-shapes" },
      { label: "Research: weight", href: "/research/padel-racket-weight" },
      { label: "Brands", href: "/brands?sport=padel" },
      { label: "Starter Kit", href: "/setups/padel-starter-kit" },
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
        {
          label: "Main Use",
          name: "primaryUse",
          value: "daily-training",
          options: [
            { value: "daily-training", label: "Daily training" },
            { value: "racing", label: "Racing" },
            { value: "trail", label: "Trail" },
            { value: "multisport", label: "Multisport" },
          ],
        },
        {
          label: "Maps",
          name: "needsMaps",
          value: "yes",
          options: [
            { value: "yes", label: "Yes — maps matter" },
            { value: "nice", label: "Nice to have" },
            { value: "no", label: "No maps needed" },
          ],
        },
        {
          label: "Size",
          name: "watchSize",
          value: "standard",
          options: [
            { value: "compact", label: "Compact" },
            { value: "standard", label: "Standard" },
            { value: "large", label: "Large" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "200-400",
          options: [
            { value: "under-200", label: "Under €200" },
            { value: "200-400", label: "€200 – €400" },
            { value: "400-plus", label: "€400+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-hrm-finder",
      title: "FIND YOUR PERFECT HEART RATE MONITOR",
      description:
        "Match chest straps and armband optical HRMs to training style and comfort.",
      ctaLabel: "FIND MY HRM",
      fields: [
        {
          label: "Main Use",
          name: "primaryUse",
          value: "intervals",
          options: [
            { value: "easy", label: "Easy / daily" },
            { value: "intervals", label: "Intervals / track" },
            { value: "racing", label: "Racing" },
          ],
        },
        {
          label: "Form",
          name: "formFactor",
          value: "chest",
          options: [
            { value: "chest", label: "Chest strap" },
            { value: "armband", label: "Armband" },
            { value: "either", label: "Either is fine" },
          ],
        },
        {
          label: "Dynamics",
          name: "needsDynamics",
          value: "no",
          options: [
            { value: "no", label: "No — HR is enough" },
            { value: "yes", label: "Yes — running dynamics" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "50-100",
          options: [
            { value: "under-50", label: "Under €50" },
            { value: "50-100", label: "€50 – €100" },
            { value: "100-plus", label: "€100+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-hydration-finder",
      title: "FIND YOUR PERFECT HYDRATION SETUP",
      description:
        "Match vests, belts and flasks to distance, terrain and how much you carry.",
      ctaLabel: "FIND MY HYDRATION",
      fields: [
        {
          label: "Distance",
          name: "primaryUse",
          value: "half",
          options: [
            { value: "10k", label: "Up to 10K" },
            { value: "half", label: "Half marathon" },
            { value: "marathon", label: "Marathon" },
            { value: "ultra", label: "Ultra" },
          ],
        },
        {
          label: "Terrain",
          name: "terrain",
          value: "road",
          options: [
            { value: "road", label: "Road" },
            { value: "trail", label: "Trail" },
            { value: "mixed", label: "Mixed" },
          ],
        },
        {
          label: "Carry",
          name: "carryStyle",
          value: "vest",
          options: [
            { value: "handheld", label: "Handheld / flask" },
            { value: "belt", label: "Belt" },
            { value: "vest", label: "Storage — vest" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "100-180",
          options: [
            { value: "under-100", label: "Under €100" },
            { value: "100-180", label: "€100 – €180" },
            { value: "180-plus", label: "€180+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-clothing-finder",
      title: "FIND YOUR PERFECT RUNNING APPAREL",
      description:
        "Match tops, shorts and socks to training context, fit and comfort.",
      ctaLabel: "FIND MY APPAREL",
      fields: [
        {
          label: "Need",
          name: "primaryUse",
          value: "daily-training",
          options: [
            { value: "daily-training", label: "Daily training" },
            { value: "racing", label: "Racing" },
            { value: "cold", label: "Cold weather" },
            { value: "hot", label: "Hot weather" },
          ],
        },
        {
          label: "Fit",
          name: "sizingRange",
          value: "unisex",
          options: [
            { value: "women", label: "Women's" },
            { value: "men", label: "Men's" },
            { value: "unisex", label: "Unisex / any" },
          ],
        },
        {
          label: "Priority",
          name: "priorities",
          value: "comfort",
          options: [
            { value: "comfort", label: "Comfort" },
            { value: "speed", label: "Speed / race" },
            { value: "durability", label: "Durability" },
            { value: "value", label: "Value" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "40-80",
          options: [
            { value: "under-40", label: "Under €40" },
            { value: "40-80", label: "€40 – €80" },
            { value: "80-plus", label: "€80+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-accessories-finder",
      title: "FIND YOUR PERFECT ACCESSORIES",
      description:
        "Match headphones, sunglasses, lights and safety gear to when you run.",
      ctaLabel: "FIND MY ACCESSORIES",
      fields: [
        {
          label: "Accessory",
          name: "primaryUse",
          value: "headphones",
          options: [
            { value: "headphones", label: "Headphones / audio" },
            { value: "glasses", label: "Sunglasses" },
            { value: "lights", label: "Lights / safety" },
            { value: "other", label: "Other accessories" },
          ],
        },
        {
          label: "When",
          name: "terrain",
          value: "road-day",
          options: [
            { value: "road-day", label: "Road / daylight" },
            { value: "road-night", label: "Road / night" },
            { value: "trail", label: "Trail" },
          ],
        },
        {
          label: "Priority",
          name: "priorities",
          value: "comfort",
          options: [
            { value: "comfort", label: "Comfort / fit" },
            { value: "performance", label: "Performance" },
            { value: "value", label: "Value" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "50-120",
          options: [
            { value: "under-50", label: "Under €50" },
            { value: "50-120", label: "€50 – €120" },
            { value: "120-plus", label: "€120+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-fuel-finder",
      title: "FIND YOUR PERFECT RACE FUEL",
      description:
        "Match gels, chews and drink mixes to distance and stomach priorities.",
      ctaLabel: "FIND MY FUEL",
      fields: [
        {
          label: "Distance",
          name: "primaryUse",
          value: "marathon",
          options: [
            { value: "10k", label: "Up to 10K" },
            { value: "half", label: "Half marathon" },
            { value: "marathon", label: "Marathon" },
            { value: "ultra", label: "Ultra" },
          ],
        },
        {
          label: "Format",
          name: "formFactor",
          value: "gels",
          options: [
            { value: "gels", label: "Gels" },
            { value: "chews", label: "Chews" },
            { value: "drink", label: "Drink mix" },
            { value: "mixed", label: "Mixed formats" },
          ],
        },
        {
          label: "Priority",
          name: "priorities",
          value: "stomach",
          options: [
            { value: "stomach", label: "Stomach comfort" },
            { value: "caffeine", label: "Caffeine options" },
            { value: "value", label: "Value / pack size" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "25-50",
          options: [
            { value: "under-25", label: "Under €25" },
            { value: "25-50", label: "€25 – €50" },
            { value: "50-plus", label: "€50+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
      ],
    },
    {
      toolSlug: "running-recovery-finder",
      title: "FIND YOUR PERFECT RECOVERY TOOLS",
      description:
        "Match massage, compression and mobility tools to how you bounce back.",
      ctaLabel: "FIND MY RECOVERY",
      fields: [
        {
          label: "Need",
          name: "primaryUse",
          value: "long-runs",
          options: [
            { value: "easy", label: "After easy runs" },
            { value: "long-runs", label: "After long runs" },
            { value: "speed", label: "After speed work" },
            { value: "daily", label: "Daily recovery" },
          ],
        },
        {
          label: "Priority",
          name: "priorities",
          value: "massage",
          options: [
            { value: "massage", label: "Massage / percussion" },
            { value: "compression", label: "Compression" },
            { value: "mobility", label: "Mobility / stretch" },
          ],
        },
        {
          label: "Budget",
          name: "budget",
          value: "50-120",
          options: [
            { value: "under-50", label: "Under €50" },
            { value: "50-120", label: "€50 – €120" },
            { value: "120-plus", label: "€120+" },
            { value: "no-limit", label: "No budget limit" },
          ],
        },
        {
          label: "Use",
          name: "context",
          value: "home",
          options: [
            { value: "home", label: "Home recovery" },
            { value: "travel", label: "Travel / race" },
            { value: "gym", label: "Gym" },
          ],
        },
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
      id: "shoe-database",
      title: "SHOE DATABASE",
      description: "Specs across the market",
      href: "/running/shoes/database",
      icon: "compare",
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
    {
      label: "Terrain",
      name: "terrain",
      value: "road",
      options: [
        { value: "road", label: "Road" },
        { value: "trail", label: "Trail" },
        { value: "treadmill", label: "Treadmill" },
        { value: "mixed", label: "Mixed road & trail" },
        { value: "track", label: "Track" },
      ],
    },
    {
      label: "Primary Use",
      name: "primaryUse",
      value: "daily-training",
      options: [
        { value: "daily-training", label: "Daily training" },
        { value: "easy-runs", label: "Easy runs" },
        { value: "long-runs", label: "Long runs" },
        { value: "tempo", label: "Tempo / faster training" },
        { value: "racing", label: "Racing" },
        { value: "everything", label: "A bit of everything" },
      ],
    },
    {
      label: "Cushioning",
      name: "cushioning",
      value: "balanced",
      options: [
        { value: "minimal", label: "Minimal / ground feel" },
        { value: "balanced", label: "Balanced" },
        { value: "cushioned", label: "Cushioned" },
        { value: "maximum", label: "Maximum cushioning" },
        { value: "no-preference", label: "No preference" },
      ],
    },
    {
      label: "Budget",
      name: "budget",
      value: "100-150",
      options: [
        { value: "under-100", label: "Under €100" },
        { value: "100-150", label: "€100–€150" },
        { value: "150-200", label: "€150–€200" },
        { value: "200-plus", label: "€200+" },
        { value: "no-limit", label: "No budget limit" },
      ],
    },
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
      { label: "Shoe Database", href: "/running/shoes/database" },
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
      { label: "Shoe Database", href: "/running/shoes/database" },
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
