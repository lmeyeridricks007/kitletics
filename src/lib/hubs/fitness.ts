import type { SportHubConfig } from "@/lib/hubs/types";

export const fitnessHubConfig: SportHubConfig = {
  sportSlug: "fitness",
  hero: {
    eyebrow: "Fitness & Training",
    title: "Build the right setup for how you train.",
    description:
      "Compare gym equipment, find the right gear and build a setup around your goals, space and budget.",
    primaryCta: {
      label: "Explore Fitness Gear",
      href: "/gear?sport=fitness",
    },
    secondaryCta: {
      label: "Read fitness guides",
      href: "/guides?sport=fitness",
    },
  },
  primaryActions: [
    {
      label: "Explore fitness gear",
      href: "/gear?sport=fitness",
      description: "Browse training equipment and gym gear.",
      featured: true,
    },
    {
      label: "Best fitness lists",
      href: "/best?sport=fitness",
      description: "Shortlists when we publish them for this vertical.",
    },
    {
      label: "Fitness guides",
      href: "/guides?sport=fitness",
      description: "Buying and setup guidance for how you train.",
    },
    {
      label: "Tools",
      href: "/tools?sport=fitness",
      description: "Finders and calculators when this vertical is live.",
    },
  ],
  primaryCategoryIds: [
    "cat-training-shoes",
    "cat-power-racks",
    "cat-adjustable-dumbbells",
    "cat-weight-benches",
    "cat-barbells",
    "cat-rowing-machines",
    "cat-pull-up-bars",
    "cat-recovery-gear",
  ],
  shoeTypeIds: [
    "sub-cross-training",
    "sub-weightlifting-shoes",
    "sub-hyrox-shoes",
    "sub-gym-shoes",
  ],
  featuredUseCaseIds: [
    "uc-home-gym",
    "uc-garage-gym",
    "uc-apartment-gym",
    "uc-small-space",
    "uc-beginner-strength",
    "uc-hyrox-race",
    "uc-hyrox-training",
    "uc-calisthenics-beginner",
    "uc-general-fitness",
  ],
  useCaseHrefs: {
    "uc-home-gym": "/fitness/home-gym",
    "uc-garage-gym": "/fitness/home-gym",
    "uc-apartment-gym": "/fitness/home-gym",
    "uc-hyrox-race": "/fitness/hyrox",
    "uc-hyrox-training": "/fitness/hyrox",
    "uc-calisthenics-beginner": "/fitness/calisthenics",
  },
  featuredDisciplineIds: [
    "disc-training-gym",
    "disc-training-strength",
    "disc-training-functional",
    "disc-training-hyrox",
    "disc-training-calisthenics",
    "disc-training-home",
    "disc-training-conditioning",
    "disc-training-recovery",
  ],
  disciplineGearCopy: {
    "disc-training-gym": "Commercial gym essentials and accessories.",
    "disc-training-strength": "Racks, bars, plates, benches and free weights.",
    "disc-training-functional": "Kettlebells, sleds, wall balls and conditioning tools.",
    "disc-training-hyrox": "Race shoes, training shoes and station gear.",
    "disc-training-calisthenics": "Pull-up bars, rings, parallettes and weighted progression.",
    "disc-training-home": "Space-aware setups for apartments and garages.",
    "disc-training-conditioning": "Rowers, air bikes, treadmills and SkiErgs.",
    "disc-training-recovery": "Massage, rollers and mobility tools.",
  },
  featuredToolSlugs: [
    "home-gym-builder",
    "hyrox-shoe-finder",
    "training-shoe-finder",
    "power-rack-finder",
    "adjustable-dumbbell-finder",
    "pull-up-bar-finder",
    "one-rep-max-calculator",
    "plate-calculator",
  ],
  featuredSetupSlugs: [
    "beginner-home-gym",
    "garage-strength-gym",
    "apartment-fitness-setup",
    "hyrox-home-conditioning",
    "calisthenics-home-setup",
    "hyrox-race-day-kit",
  ],
  recommendationCategoryIds: [
    "cat-training-shoes",
    "cat-adjustable-dumbbells",
    "cat-power-racks",
    "cat-rowing-machines",
  ],
  recommendationMinProducts: 3,
  finder: {
    toolSlug: "home-gym-builder",
    headline: "Home Gym",
    title: "Build a gym that fits your room and budget.",
    description:
      "Answer questions about space, goals and budget. Get a coherent equipment set — not a shopping list of everything.",
    ctaLabel: "Start Home Gym Builder",
    preview: {
      scoreLabel: "Strong fit",
      productName: "Compact strength core",
      rationale: "Rack + bench + bar when ceiling and budget allow.",
      note: "Set optimization — not single-product ranking.",
    },
  },
  checklist: [
    {
      group: "Strength",
      items: [
        { label: "Power rack / squat stand", categoryId: "cat-power-racks" },
        { label: "Barbell", categoryId: "cat-barbells" },
        { label: "Plates", categoryId: "cat-weight-plates" },
        { label: "Bench", categoryId: "cat-weight-benches" },
      ],
    },
    {
      group: "Versatility",
      items: [
        { label: "Adjustable dumbbells", categoryId: "cat-adjustable-dumbbells" },
        { label: "Kettlebells", categoryId: "cat-kettlebells" },
        { label: "Training shoes", categoryId: "cat-training-shoes" },
      ],
    },
    {
      group: "Conditioning",
      items: [
        { label: "Rower", categoryId: "cat-rowing-machines" },
        { label: "Air bike", categoryId: "cat-air-bikes" },
      ],
    },
  ],
  education: {
    title: "How Kitletics approaches fitness gear",
    description:
      "We optimize for product decisions and setups — not workout programming or medical advice.",
    dimensions: [
      {
        label: "Space first",
        description: "Height and footprint constraints eliminate products that cannot fit.",
        href: "/tools/power-rack-finder",
        linkLabel: "Power Rack Finder",
      },
      {
        label: "Compatibility",
        description: "Attachments and ecosystems matter as much as capacity.",
        href: "/guides/how-to-build-a-home-gym",
        linkLabel: "Home gym planning",
      },
      {
        label: "Evidence",
        description: "Specs come from manufacturer and verified sources — not invented numbers.",
        href: "/methodology",
        linkLabel: "Methodology",
      },
    ],
  },
  searchPlaceholders: [
    "adjustable dumbbells",
    "power rack for 2.3m ceiling",
    "HYROX shoes",
    "Concept2 rower",
    "pull-up bar",
  ],
  compareCategorySlug: "power-racks",
};
