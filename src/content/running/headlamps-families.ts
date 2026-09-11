import type { ProductFamily } from "@/domain/products/types";

/**
 * Running headlamp families for wave 2 (+ wave1 anchors where they share a line).
 * Note: pack family `fam-black-diamond-distance` is separate — headlamps use
 * `fam-bd-distance-headlamp`.
 */
export const runningHeadlampsFamilies: ProductFamily[] = [
  {
    id: "fam-petzl-nao",
    brandId: "brand-petzl",
    name: "NAO",
    slug: "petzl-nao",
    categoryId: "cat-running-lights",
    description:
      "Petzl NAO REACTIVE LIGHTING high-output trail and ultra headlamps.",
    productIds: ["prod-petzl-nao-rl"],
  },
  {
    id: "fam-petzl-swift",
    brandId: "brand-petzl",
    name: "Swift RL",
    slug: "petzl-swift-rl",
    categoryId: "cat-running-lights",
    description:
      "Petzl Swift RL compact REACTIVE LIGHTING performance headlamps.",
    productIds: ["prod-petzl-swift-rl"],
  },
  {
    id: "fam-petzl-actik",
    brandId: "brand-petzl",
    name: "Actik",
    slug: "petzl-actik",
    categoryId: "cat-running-lights",
    description: "Petzl Actik versatile hybrid rechargeable headlamps.",
    productIds: ["prod-petzl-actik-core"],
  },
  {
    id: "fam-petzl-iko",
    brandId: "brand-petzl",
    name: "IKO",
    slug: "petzl-iko",
    categoryId: "cat-running-lights",
    description: "Petzl IKO ultralight AIRFIT hybrid headlamps.",
    productIds: ["prod-petzl-iko-core"],
  },
  {
    id: "fam-bd-storm",
    brandId: "brand-black-diamond",
    name: "Storm",
    slug: "bd-storm",
    categoryId: "cat-running-lights",
    description: "Black Diamond Storm sealed weather-ready headlamps.",
    productIds: ["prod-bd-storm-500-r"],
  },
  {
    id: "fam-bd-spot",
    brandId: "brand-black-diamond",
    name: "Spot",
    slug: "bd-spot",
    categoryId: "cat-running-lights",
    description: "Black Diamond Spot compact rechargeable headlamps.",
    productIds: ["prod-bd-spot-400-r"],
  },
  {
    id: "fam-bd-distance-headlamp",
    brandId: "brand-black-diamond",
    name: "Distance Headlamp",
    slug: "bd-distance-headlamp",
    categoryId: "cat-running-lights",
    description:
      "Black Diamond Distance high-output running/trail headlamps (not Distance packs).",
    productIds: ["prod-bd-distance-1500"],
  },
  {
    id: "fam-silva-trail-runner",
    brandId: "brand-silva",
    name: "Trail Runner Free",
    slug: "silva-trail-runner-free",
    categoryId: "cat-running-lights",
    description: "Silva Trail Runner Free hybrid free-move headlamp systems.",
    productIds: ["prod-silva-trail-runner-free"],
  },
  {
    id: "fam-silva-smini",
    brandId: "brand-silva",
    name: "Smini",
    slug: "silva-smini",
    categoryId: "cat-running-lights",
    description: "Silva Smini ultralight compact running headlamps.",
    productIds: ["prod-silva-smini"],
  },
  {
    id: "fam-ledlenser-neo",
    brandId: "brand-ledlenser",
    name: "NEO",
    slug: "ledlenser-neo",
    categoryId: "cat-running-lights",
    description: "Ledlenser NEO running headlamps with rear battery balance.",
    productIds: ["prod-ledlenser-neo9r", "prod-ledlenser-neo5r"],
  },
  {
    id: "fam-fenix-hm65",
    brandId: "brand-fenix",
    name: "HM65R",
    slug: "fenix-hm65r",
    categoryId: "cat-running-lights",
    description: "Fenix HM65R dual-beam trail running headlamps.",
    productIds: ["prod-fenix-hm65r-t"],
  },
  {
    id: "fam-biolite-headlamp",
    brandId: "brand-biolite",
    name: "HeadLamp",
    slug: "biolite-headlamp",
    categoryId: "cat-running-lights",
    description: "BioLite SlimFit comfort-focused running headlamps.",
    productIds: ["prod-biolite-headlamp-800", "prod-biolite-headlamp-425"],
  },
  {
    id: "fam-nitecore-nu",
    brandId: "brand-nitecore",
    name: "NU",
    slug: "nitecore-nu",
    categoryId: "cat-running-lights",
    description: "NITECORE NU compact rechargeable running headlamps.",
    productIds: ["prod-nitecore-nu25", "prod-nitecore-nu43"],
  },
];
