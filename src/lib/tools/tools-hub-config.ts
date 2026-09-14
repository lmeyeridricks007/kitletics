/**
 * Hub-only presentation enrichment for Tool entities.
 * Keeps optional visual/priority fields out of every seed until migrated.
 */
export interface ToolHubEnrichment {
  estimatedTimeMinutes?: number;
  featured?: boolean;
  priority?: number;
  hubImageSrc?: string;
  shortDescription?: string;
  /** Primary hub section — finders can also include select builders */
  hubSection?: "find" | "plan" | "compare";
}

export const TOOLS_HUB_ENRICHMENT: Record<string, ToolHubEnrichment> = {
  "running-shoe-finder": {
    featured: true,
    priority: 100,
    estimatedTimeMinutes: 2,
    hubImageSrc: "/images/running/products/novablast-6-hero.jpg",
    shortDescription:
      "Find shoes that match your running, goals, fit preferences and budget.",
    hubSection: "find",
  },
  "padel-racket-finder": {
    featured: true,
    priority: 90,
    estimatedTimeMinutes: 2,
    hubImageSrc: "/images/padel/products/racket-1.png",
    shortDescription:
      "Adaptive padel racket matches with clear reasons — best match plus control, power, comfort and value alternatives.",
    hubSection: "find",
  },
  "home-gym-builder": {
    featured: true,
    priority: 85,
    hubImageSrc: "/images/home/guide-home-gym.jpg",
    shortDescription:
      "Build a home gym setup that fits your space, goals and budget.",
    hubSection: "find",
  },
  "training-shoe-finder": {
    featured: true,
    priority: 80,
    hubImageSrc: "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
    shortDescription:
      "Find training shoes for lifting, conditioning and gym sessions.",
    hubSection: "find",
  },
  "hyrox-shoe-finder": {
    featured: true,
    priority: 75,
    hubImageSrc: "/images/training/products/tyr-cxt-2-hero.jpg",
    shortDescription:
      "Find shoes suited to HYROX running and station transitions.",
    hubSection: "find",
  },
  "tennis-racket-finder": {
    featured: true,
    priority: 70,
    hubImageSrc: "/images/home/guide-tennis.jpg",
    shortDescription:
      "Match tennis rackets to level, swing style and control needs.",
    hubSection: "find",
  },
  "adjustable-dumbbell-finder": {
    priority: 60,
    hubImageSrc: "/images/home/guide-home-gym.jpg",
    hubSection: "find",
  },
  "power-rack-finder": {
    priority: 55,
    hubImageSrc: "/images/home/guide-home-gym.jpg",
    hubSection: "find",
  },
  "treadmill-finder": {
    priority: 50,
    hubImageSrc: "/images/home/guide-home-gym.jpg",
    hubSection: "find",
  },
  "fitness-watch-finder": {
    featured: true,
    priority: 78,
    estimatedTimeMinutes: 2,
    hubImageSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
    shortDescription:
      "Match GPS watches to training goals, maps, battery life and budget.",
    hubSection: "find",
  },
  "pull-up-bar-finder": {
    priority: 45,
    hubSection: "find",
  },
  "shoe-rotation-planner": {
    featured: true,
    priority: 95,
    shortDescription:
      "Plan a shoe rotation around your training — coverage, gaps and what to add next.",
    hubSection: "plan",
  },
  "hyrox-race-kit-builder": {
    priority: 70,
    shortDescription:
      "Build a HYROX race-day kit from roles that matter on race day.",
    hubSection: "plan",
  },
  "running-pace-calculator": {
    featured: true,
    priority: 90,
    shortDescription:
      "Calculate pace, finish time and distance with race splits.",
    hubSection: "plan",
  },
  "race-time-predictor": {
    featured: true,
    priority: 85,
    shortDescription:
      "Estimate equivalent race times across distances from a recent result.",
    hubSection: "plan",
  },
  "hyrox-race-time-calculator": {
    priority: 65,
    shortDescription: "Estimate HYROX race time from training inputs.",
    hubSection: "plan",
  },
  "one-rep-max-calculator": {
    priority: 55,
    shortDescription: "Estimate one-rep max from a working set.",
    hubSection: "plan",
  },
  "plate-calculator": {
    priority: 50,
    shortDescription: "Calculate plate loading for your target weight.",
    hubSection: "plan",
  },
};

export const TOOLS_HUB_HERO = {
  eyebrow: "TOOLS HUB",
  titleLine1: "Find, Compare & Build",
  titleLine2: "the Right Gear for You",
  description:
    "Powerful tools to help you find the right gear, compare your options and build the setup that fits your goals.",
  heroImageSrc: "/images/running/category/use-race.jpg",
  trust: [
    {
      title: "Expert Backed",
      detail: "Built with sport specialists",
    },
    {
      title: "Data Driven",
      detail: "Structured specs and evidence",
    },
    {
      title: "Always Updated",
      detail: "Products and tools reviewed",
    },
    {
      title: "Personalized",
      detail: "Tools that adapt to your answers",
    },
  ],
} as const;
