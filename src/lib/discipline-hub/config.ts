/**
 * Declarative Discipline Hub config — IDs/slugs only.
 * Resolved entities arrive via getDisciplineHubData().
 */
export interface DisciplineHubConfig {
  sportSlug: string;
  disciplineSlug: string;
  disciplineId: string;
  primaryCategoryId: string;
  categoryBrowseHref: string;
  bestGuideSlug: string;
  /** Display title — "Best …" only when backed by BestGuide */
  bestSectionTitle: string;
  /** Eyebrow above hero title */
  disciplineEyebrow: string;
  hero: {
    description: string;
    imageSrc: string;
    imageAlt: string;
  };
  pillars: {
    id: string;
    title: string;
    description: string;
    icon: "route" | "gauge" | "layers" | "mountain" | "flag" | "zap";
  }[];
  /** Factual glance card (replaces fake discipline match) */
  glance: {
    bestFor: string;
    typicalTerrain: string;
    keyGear: string;
    ctaLabel: string;
    ctaHref: string;
  };
  why: {
    title: string;
    intro: string;
    benefits: {
      id: string;
      title: string;
      description: string;
      icon: "surface" | "progress" | "gear" | "race" | "terrain" | "grip";
    }[];
  };
  goals: {
    id: string;
    label: string;
    href: string;
  }[];
  toolSlugs: string[];
  guideSlugs: string[];
  buyingGuideImageMap: Record<string, string>;
  /** Race-day essentials when no Event source exists */
  raceDayEssentials: {
    id: string;
    label: string;
    description: string;
    href: string;
  }[];
  relatedDisciplines: {
    id: string;
    label: string;
    href: string;
  }[];
  setupSlugs?: string[];
  finderToolSlug: string;
  footer: {
    shop: { label: string; href: string }[];
    tools: { label: string; href: string }[];
    about: { label: string; href: string }[];
  };
}

export const roadRunningDisciplineHubConfig: DisciplineHubConfig = {
  sportSlug: "running",
  disciplineSlug: "road",
  disciplineId: "disc-running-road",
  primaryCategoryId: "cat-running-shoes",
  categoryBrowseHref: "/running/shoes",
  bestGuideSlug: "running-shoes",
  bestSectionTitle: "Best Shoes for Road Running",
  disciplineEyebrow: "Running discipline",
  hero: {
    description:
      "Smooth tarmac, steady miles, big goals. Everything you need to train, race and enjoy the road.",
    imageSrc: "/images/running/category/use-race.jpg",
    imageAlt: "Runners on a paved path at golden hour",
  },
  pillars: [
    {
      id: "surface",
      title: "Consistent surfaces",
      description: "Predictable pavement for steady rhythm and progression.",
      icon: "route",
    },
    {
      id: "structure",
      title: "Structured progression",
      description: "Clear race distances and training patterns to build on.",
      icon: "gauge",
    },
    {
      id: "gear",
      title: "Wide gear choice",
      description: "Daily trainers, race shoes, watches and more — compared independently.",
      icon: "layers",
    },
  ],
  glance: {
    bestFor: "Consistent training and road races",
    typicalTerrain: "Paved road",
    keyGear: "Shoes, GPS watch, apparel",
    ctaLabel: "Find my running shoes",
    ctaHref: "/tools/running-shoe-finder",
  },
  why: {
    title: "Why run on the road?",
    intro:
      "Road running is the most accessible endurance discipline — familiar surfaces, clear race calendars, and a deep ecosystem of training and race-day gear.",
    benefits: [
      {
        id: "surface",
        title: "Consistent surface",
        description:
          "Paved roads give repeatable conditions for pacing, form work and weekly volume.",
        icon: "surface",
      },
      {
        id: "progress",
        title: "Track your progress",
        description:
          "Standard distances (5K to marathon) make benchmarking and goal-setting straightforward.",
        icon: "progress",
      },
      {
        id: "gear",
        title: "Gear options",
        description:
          "From daily trainers to race-day plates — compare models with structured Product data.",
        icon: "gear",
      },
      {
        id: "race",
        title: "Race opportunities",
        description:
          "Local and major road races year-round. Use tools and kits to prepare with intention.",
        icon: "race",
      },
    ],
  },
  goals: [
    { id: "5k", label: "Run your first 5K", href: "/best/running-shoes-beginners" },
    { id: "10k", label: "Improve 10K time", href: "/best/tempo-running-shoes" },
    { id: "half", label: "Half Marathon", href: "/best/running-shoes-long-runs" },
    { id: "mara", label: "Marathon", href: "/best/race-shoes" },
    { id: "daily", label: "Build a daily trainer rotation", href: "/tools/shoe-rotation-planner" },
  ],
  toolSlugs: [
    "running-shoe-finder",
    "running-pace-calculator",
    "race-time-predictor",
    "shoe-rotation-planner",
  ],
  guideSlugs: [
    "how-to-choose-running-shoes",
    "what-is-a-daily-trainer",
    "running-shoe-cushioning",
    "running-shoe-rotation",
    "running-shoe-drop",
  ],
  buyingGuideImageMap: {
    "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
    "what-is-a-daily-trainer": "/images/running/guides/daily-vs-long.jpg",
    "running-shoe-cushioning": "/images/running/category/use-recovery.jpg",
    "running-shoe-rotation": "/images/running/category/use-tempo.jpg",
    "running-shoe-drop": "/images/running/category/use-long.jpg",
  },
  raceDayEssentials: [
    {
      id: "predictor",
      label: "Race Time Predictor",
      description: "Estimate finish times across distances",
      href: "/tools/race-time-predictor",
    },
    {
      id: "race-shoes",
      label: "Race shoe guide",
      description: "Shoes for 5K to marathon",
      href: "/best/race-shoes",
    },
    {
      id: "setup",
      label: "Marathon race-day kit",
      description: "Gear checklist for race day",
      href: "/setups/marathon-race-day-kit",
    },
  ],
  relatedDisciplines: [
    { id: "trail", label: "Trail Running", href: "/running/trail" },
    { id: "racing", label: "Racing", href: "/running/racing" },
    { id: "treadmill", label: "Treadmill Running", href: "/running/treadmill" },
  ],
  setupSlugs: ["marathon-race-day-kit"],
  finderToolSlug: "running-shoe-finder",
  footer: {
    shop: [
      { label: "Running Shoes", href: "/running/shoes" },
      { label: "Clothing", href: "/running/running-clothing" },
      { label: "GPS Watches", href: "/running/gps-watches" },
      { label: "Accessories", href: "/running/accessories" },
      { label: "All Running Gear", href: "/running" },
    ],
    tools: [
      { label: "Shoe Finder", href: "/tools/running-shoe-finder" },
      { label: "Compare Shoes", href: "/compare?category=running-shoes" },
      { label: "Best Running Shoes", href: "/best/running-shoes" },
      { label: "Running Pace Calculator", href: "/tools/running-pace-calculator" },
    ],
    about: [
      { label: "About Kitletics", href: "/about" },
      { label: "Our Methodology", href: "/methodology" },
      { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
};

export const trailRunningDisciplineHubConfig: DisciplineHubConfig = {
  ...roadRunningDisciplineHubConfig,
  disciplineSlug: "trail",
  disciplineId: "disc-running-trail",
  bestGuideSlug: "trail-running-shoes",
  bestSectionTitle: "Best Shoes for Trail Running",
  disciplineEyebrow: "Running discipline",
  hero: {
    description:
      "Grip, protection and carry for off-road miles. Compare trail shoes and essentials for your terrain.",
    imageSrc: "/images/running/category/hero-trail.jpg",
    imageAlt: "Trail runner on a technical path",
  },
  pillars: [
    {
      id: "terrain",
      title: "Terrain adaptability",
      description: "Mud, rock and root — gear that matches the ground.",
      icon: "mountain",
    },
    {
      id: "grip",
      title: "Grip & protection",
      description: "Lugs, plates and uppers built for uneven surfaces.",
      icon: "layers",
    },
    {
      id: "route",
      title: "Route readiness",
      description: "Shoes and carry for the distance and exposure you face.",
      icon: "route",
    },
  ],
  glance: {
    bestFor: "Off-road trails and mixed terrain",
    typicalTerrain: "Trail / dirt / rock",
    keyGear: "Trail shoes, packs, poles",
    ctaLabel: "Explore trail shoes",
    ctaHref: "/running/shoes?terrain=trail",
  },
  why: {
    title: "Why run on trails?",
    intro:
      "Trail running trades pavement for varied terrain — demanding different grip, protection and navigation priorities.",
    benefits: [
      {
        id: "terrain",
        title: "Varied terrain",
        description: "Soft ground, climbs and technical sections change how shoes and packs matter.",
        icon: "terrain",
      },
      {
        id: "grip",
        title: "Grip first",
        description: "Outsole and stack choices matter more than on smooth road.",
        icon: "grip",
      },
      {
        id: "gear",
        title: "Carry & protection",
        description: "Hydration, layers and durable uppers for longer, exposed efforts.",
        icon: "gear",
      },
      {
        id: "progress",
        title: "Adventure progression",
        description: "From local loops to ultras — build kit that matches ambition.",
        icon: "progress",
      },
    ],
  },
  goals: [
    { id: "start", label: "Start trail running", href: "/guides/how-to-choose-running-shoes" },
    { id: "grip", label: "Find grip for wet trails", href: "/best/trail-running-shoes" },
    { id: "ultra", label: "Ultra / long trail", href: "/running/ultra" },
  ],
  toolSlugs: ["running-shoe-finder", "running-pace-calculator", "shoe-rotation-planner"],
  raceDayEssentials: [
    {
      id: "trail-shoes",
      label: "Trail shoe guide",
      description: "Shoes for dirt, rock and mud",
      href: "/best/trail-running-shoes",
    },
    {
      id: "finder",
      label: "Running Shoe Finder",
      description: "Match shoes to terrain",
      href: "/tools/running-shoe-finder",
    },
  ],
  relatedDisciplines: [
    { id: "road", label: "Road Running", href: "/running/road" },
    { id: "ultra", label: "Ultra", href: "/running/ultra" },
    { id: "racing", label: "Racing", href: "/running/racing" },
  ],
};

export const racingDisciplineHubConfig: DisciplineHubConfig = {
  ...roadRunningDisciplineHubConfig,
  disciplineSlug: "racing",
  disciplineId: "disc-running-racing",
  bestGuideSlug: "race-shoes",
  bestSectionTitle: "Best Race Running Shoes",
  disciplineEyebrow: "Running discipline",
  hero: {
    description:
      "Race-day shoes, pacing and kit for 5K to marathon. Compare plates, legality and fit with structured data.",
    imageSrc: "/images/running/category/use-race.jpg",
    imageAlt: "Runners at a road race",
  },
  pillars: [
    {
      id: "speed",
      title: "Race-day speed",
      description: "Shoes and pacing tools aimed at your target distance.",
      icon: "zap",
    },
    {
      id: "structure",
      title: "Clear targets",
      description: "5K to marathon — predictable race formats to train toward.",
      icon: "flag",
    },
    {
      id: "kit",
      title: "Race kit clarity",
      description: "Shoes, fueling and wearables for the day that counts.",
      icon: "layers",
    },
  ],
  glance: {
    bestFor: "Goal races from 5K to marathon",
    typicalTerrain: "Road race courses",
    keyGear: "Race shoes, watch, kit",
    ctaLabel: "Find race shoes",
    ctaHref: "/best/race-shoes",
  },
  why: {
    title: "Why focus on racing?",
    intro:
      "Racing turns training into a concrete target — with gear and tools that support one key day.",
    benefits: [
      {
        id: "target",
        title: "A clear goal",
        description: "Distance and date sharpen training and shoe choice.",
        icon: "race",
      },
      {
        id: "gear",
        title: "Purpose-built shoes",
        description: "Plated racers and light trainers for race-specific demands.",
        icon: "gear",
      },
      {
        id: "pace",
        title: "Pacing tools",
        description: "Predict finish times and plan splits with transparent math.",
        icon: "progress",
      },
      {
        id: "kit",
        title: "Race-day kits",
        description: "Structured gear setups so nothing critical is left to chance.",
        icon: "surface",
      },
    ],
  },
  goals: [
    { id: "5k", label: "Race a 5K", href: "/best/race-shoes" },
    { id: "half", label: "Half Marathon goal", href: "/best/running-shoes-long-runs" },
    { id: "mara", label: "Marathon goal", href: "/setups/marathon-race-day-kit" },
  ],
  toolSlugs: [
    "race-time-predictor",
    "running-pace-calculator",
    "running-shoe-finder",
    "shoe-rotation-planner",
  ],
  relatedDisciplines: [
    { id: "road", label: "Road Running", href: "/running/road" },
    { id: "trail", label: "Trail Running", href: "/running/trail" },
  ],
};

const CONFIGS: Record<string, DisciplineHubConfig> = {
  "running/road": roadRunningDisciplineHubConfig,
  "running/trail": trailRunningDisciplineHubConfig,
  "running/racing": racingDisciplineHubConfig,
};

const MOCKUP_KEYS = new Set([
  "running/road",
  "running/trail",
  "running/racing",
]);

export function getDisciplineHubConfig(
  sportSlug: string,
  disciplineSlug: string,
): DisciplineHubConfig | undefined {
  return CONFIGS[`${sportSlug}/${disciplineSlug}`];
}

export function hasMockupDisciplineHub(
  sportSlug: string,
  disciplineSlug: string,
): boolean {
  return MOCKUP_KEYS.has(`${sportSlug}/${disciplineSlug}`);
}
