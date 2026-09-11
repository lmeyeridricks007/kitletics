import type { ProductCluster } from "@/domain/relationships/types";

/**
 * Internal discovery clusters — derived from taxonomy/use where possible.
 * Not a parallel public taxonomy.
 */
export const runningProductClusters: ProductCluster[] = [
  {
    id: "cluster-versatile-daily",
    categoryId: "cat-running-shoes",
    label: "Versatile Daily Trainers",
    description: "Neutral road dailies for mixed easy/moderate weeks.",
    productIds: [
      "prod-novablast-6",
      "prod-ghost-18",
      "prod-pegasus-42",
      "prod-cumulus-27",
      "prod-ride-18",
      "prod-1080-v14",
    ],
    criteria: "sub-daily-trainers + neutral + road",
  },
  {
    id: "cluster-max-cushion",
    categoryId: "cat-running-shoes",
    label: "Max Cushion",
    description: "Maximum stack soft road shoes for easy/long/recovery.",
    productIds: [
      "prod-nimbus-27",
      "prod-bondi-9",
      "prod-clifton-10",
      "prod-superblast-2",
      "prod-triumph-22",
      "prod-vomero-18",
    ],
    criteria: "cushionLevel maximum/high + max-cushion subcategory",
  },
  {
    id: "cluster-stability",
    categoryId: "cat-running-shoes",
    label: "Stability",
    description: "Guided daily trainers for overpronation support needs.",
    productIds: [
      "prod-kayano-32",
      "prod-adrenaline-gts-25",
      "prod-gt-2000-14",
      "prod-structure-plus",
    ],
    criteria: "stability enum + stability subcategory",
  },
  {
    id: "cluster-tempo",
    categoryId: "cat-running-shoes",
    label: "Tempo / Super Trainers",
    description: "Workout and faster long-run platforms.",
    productIds: [
      "prod-endorphin-speed-5",
      "prod-boston-12",
      "prod-rebel-v5",
      "prod-mach-6",
      "prod-hyperion-max-2",
      "prod-clifton-pro",
    ],
    criteria: "tempo subcategory / plated nylon or composite trainers",
  },
  {
    id: "cluster-carbon-racers",
    categoryId: "cat-running-shoes",
    label: "Carbon Racers",
    description: "Road race-day carbon plate shoes.",
    productIds: [
      "prod-vaporfly-4",
      "prod-alphafly-3",
      "prod-endorphin-pro-4",
      "prod-metaspeed-sky-paris",
    ],
    criteria: "plateMaterial carbon + race subcategory",
  },
  {
    id: "cluster-trail",
    categoryId: "cat-running-shoes",
    label: "Trail",
    description: "Trail training and long trail days.",
    productIds: ["prod-speedgoat-6", "prod-peregrine-15"],
    criteria: "terrain trail + trail subcategory",
  },
];
