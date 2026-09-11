import type { ProductFamily } from "@/domain/products/types";

/** Fix 56 — real product-line families for uniqueness-held Brand hubs. */
export const brandHubP56Families: ProductFamily[] = [
  {
    id: "fam-p56-puma-nitro",
    brandId: "brand-puma",
    name: "NITRO road",
    slug: "puma-nitro-road",
    categoryId: "cat-running-shoes",
    description:
      "Nitrogen-foam road shoes: Deviate NITRO 3 for plated tempo/race, Magnify NITRO 2 for cushioned daily miles.",
    productIds: ["prod-deviate-nitro-3", "prod-magnify-nitro-2"],
  },
  {
    id: "fam-p56-puma-fuse",
    brandId: "brand-puma",
    name: "Fuse training",
    slug: "puma-fuse",
    categoryId: "cat-training-shoes",
    description:
      "Gym/metcon Fuse line — Fuse 3.0 for mixed sessions, Fuse Fasted when you want a lighter training last.",
    productIds: ["prod-puma-fuse-3", "prod-puma-fuse-fasted"],
  },
  {
    id: "fam-p56-mizuno-wave-road",
    brandId: "brand-mizuno",
    name: "Wave road",
    slug: "mizuno-wave-road",
    categoryId: "cat-running-shoes",
    description:
      "Wave plate road: Rider 28 as a firmer classic daily, Rebellion Pro 3 as the plated race tool.",
    productIds: ["prod-wave-rider-28", "prod-wave-rebellion-pro-3"],
  },
  {
    id: "fam-p56-mizuno-wave-court",
    brandId: "brand-mizuno",
    name: "Wave Exceed court",
    slug: "mizuno-wave-exceed",
    categoryId: "cat-tennis-shoes",
    description:
      "Wave Exceed Tour 5 is the tennis last — lateral Wave support, not a road Rider substitute.",
    productIds: ["prod-mizuno-wave-exceed-tour-5"],
  },
  {
    id: "fam-p56-inov8-trailfly",
    brandId: "brand-inov8",
    name: "Trailfly ultra",
    slug: "inov8-trailfly",
    categoryId: "cat-running-shoes",
    description:
      "Trailfly Ultra G 300 Max is the graphene-cushioned ultra/trail shoe — not a gym F-Lite.",
    productIds: ["prod-trailfly-ultra-g-300-max"],
  },
  {
    id: "fam-p56-inov8-flite",
    brandId: "brand-inov8",
    name: "F-Lite training",
    slug: "inov8-flite",
    categoryId: "cat-training-shoes",
    description:
      "F-Lite 235 v3 and F-Lite 260 are low-stack training shoes for rope climbs and mixed gym work.",
    productIds: ["prod-inov8-flite-235-v3", "prod-inov8-flite-260"],
  },
  {
    id: "fam-p56-inov8-fastlift",
    brandId: "brand-inov8",
    name: "Fastlift lifting",
    slug: "inov8-fastlift",
    categoryId: "cat-training-shoes",
    description:
      "Fastlift 360 / Power G 380 / 400 are heel-lifted lifting shoes — not trail or metcon defaults.",
    productIds: [
      "prod-inov8-fastlift-360",
      "prod-inov8-fastlift-power-g-380",
      "prod-inov8-fastlift-400",
    ],
  },
  {
    id: "fam-p56-joma-slam",
    brandId: "brand-joma",
    name: "Slam padel",
    slug: "joma-slam",
    categoryId: "cat-padel-shoes",
    description:
      "T.Slam and Slam Lady are the planted, club-value padel last with high lateral support.",
    productIds: ["prod-joma-t-slam", "prod-joma-slam-lady"],
  },
  {
    id: "fam-p56-joma-spin",
    brandId: "brand-joma",
    name: "Spin padel",
    slug: "joma-spin",
    categoryId: "cat-padel-shoes",
    description:
      "Spin Men / Spin Lady are the quicker padel last — more movement bias than Slam.",
    productIds: ["prod-joma-spin-men", "prod-joma-spin-lady"],
  },
  {
    id: "fam-p56-asics-resolution",
    brandId: "brand-asics-racket",
    name: "Gel-Resolution",
    slug: "asics-gel-resolution",
    categoryId: "cat-tennis-shoes",
    description:
      "Gel-Resolution 9 (hard and clay) is the heavy-stability tennis last for baseliners.",
    productIds: [
      "prod-asics-gel-resolution-9",
      "prod-asics-gel-resolution-9-clay",
    ],
  },
  {
    id: "fam-p56-asics-speed-court",
    brandId: "brand-asics-racket",
    name: "Solution Speed",
    slug: "asics-solution-speed",
    categoryId: "cat-tennis-shoes",
    description:
      "Solution Speed FF 3 is the light, speed-biased tennis shoe — less planted than Resolution.",
    productIds: ["prod-asics-solution-speed-ff-3"],
  },
  {
    id: "fam-p56-asics-value-court",
    brandId: "brand-asics-racket",
    name: "Challenger / Dedicate",
    slug: "asics-challenger-dedicate",
    categoryId: "cat-tennis-shoes",
    description:
      "Gel-Challenger 15 and Gel-Dedicate 8 cover club/value tennis — not the Resolution stability stack.",
    productIds: ["prod-asics-gel-challenger-15", "prod-asics-gel-dedicate-8"],
  },
  {
    id: "fam-p56-powerblock-pro",
    brandId: "brand-powerblock",
    name: "Pro Series",
    slug: "powerblock-pro",
    categoryId: "cat-adjustable-dumbbells",
    description:
      "Selector-pin Pro Series 50 vs Pro Series 100 — same handle system, different max load stages.",
    productIds: ["prod-powerblock-pro-50", "prod-powerblock-pro-100"],
  },
  {
    id: "fam-p56-powerblock-elite",
    brandId: "brand-powerblock",
    name: "Elite EXP",
    slug: "powerblock-elite-exp",
    categoryId: "cat-adjustable-dumbbells",
    description:
      "Elite EXP 90 is the expander-kit path — different stage architecture than Pro Series pins.",
    productIds: ["prod-powerblock-elite-90"],
  },
  {
    id: "fam-p56-gornation-bar",
    brandId: "brand-gornation",
    name: "Premium bar",
    slug: "gornation-bar",
    categoryId: "cat-pull-up-bars",
    description:
      "Wall-mounted Premium Pull-Up Bar sized for calisthenics skills, not a free-standing station.",
    productIds: ["prod-gornation-premium-bar"],
  },
  {
    id: "fam-p56-gornation-floor",
    brandId: "brand-gornation",
    name: "Parallettes + rings",
    slug: "gornation-floor-tools",
    categoryId: "cat-parallettes",
    description:
      "Parallettes Pro and gymnastic rings — skill tools that travel; not a weighted-vest or station kit.",
    productIds: ["prod-gornation-parallettes-pro", "prod-gornation-rings"],
  },
  {
    id: "fam-p56-gravity-station",
    brandId: "brand-gravity-fitness",
    name: "Free-standing station",
    slug: "gravity-station",
    categoryId: "cat-pull-up-bars",
    description:
      "Free-standing Pull-Up Station for renters who cannot drill walls — opposite of a doorway bar.",
    productIds: ["prod-gravity-pullup-station"],
  },
  {
    id: "fam-p56-gravity-load",
    brandId: "brand-gravity-fitness",
    name: "Rings + vest load",
    slug: "gravity-load",
    categoryId: "cat-gymnastic-rings",
    description:
      "Gymnastic rings plus a weighted vest — adding load to a home calisthenics setup, not a selector dumbbell.",
    productIds: ["prod-gravity-rings", "prod-gravity-weighted-vest"],
  },
  {
    id: "fam-p56-gravity-parallettes",
    brandId: "brand-gravity-fitness",
    name: "Parallettes",
    slug: "gravity-parallettes",
    categoryId: "cat-parallettes",
    description:
      "Metal parallettes for L-sits and handstand work — floor skills beside the station, not rings.",
    productIds: ["prod-gravity-parallettes"],
  },
  {
    id: "fam-p56-reebok-nano",
    brandId: "brand-reebok",
    name: "Nano",
    slug: "reebok-nano",
    categoryId: "cat-training-shoes",
    description:
      "Nano X4 (current) and Nano X3 (prior) plus Nano Court — metcon/functional trainers, not lifting heels.",
    productIds: [
      "prod-reebok-nano-x4",
      "prod-reebok-nano-x3",
      "prod-reebok-nano-court",
    ],
  },
  {
    id: "fam-p56-reebok-lifter",
    brandId: "brand-reebok",
    name: "Lifter",
    slug: "reebok-lifter",
    categoryId: "cat-training-shoes",
    description:
      "Legacy Lifter III and Lifter PR III are heel-lifted weightlifting shoes — not Nano metcon geometry.",
    productIds: ["prod-reebok-legacy-lifter-iii", "prod-reebok-lifter-pr-iii"],
  },
  {
    id: "fam-p56-nobull-trainer",
    brandId: "brand-nobull",
    name: "Trainer",
    slug: "nobull-trainer",
    categoryId: "cat-training-shoes",
    description:
      "Trainer vs Trainer+ — same garage-gym last family; Plus adds a more protective/upper-duty variant.",
    productIds: ["prod-nobull-trainer", "prod-nobull-trainer-plus"],
  },
  {
    id: "fam-p56-nobull-outwork",
    brandId: "brand-nobull",
    name: "Outwork",
    slug: "nobull-outwork",
    categoryId: "cat-training-shoes",
    description:
      "Outwork is the more aggressive training last — not the standard Trainer daily gym shoe.",
    productIds: ["prod-nobull-outwork"],
  },
  {
    id: "fam-p56-tyr-cxt",
    brandId: "brand-tyr",
    name: "CXT",
    slug: "tyr-cxt",
    categoryId: "cat-training-shoes",
    description:
      "CXT-1 / CXT-2 and CXT-1 Trainer — swim-to-gym crossover trainers, not a Nano or Reign clone.",
    productIds: ["prod-tyr-cxt-1", "prod-tyr-cxt-2", "prod-tyr-cxt1-trainer"],
  },
  {
    id: "fam-p56-pullup-mount",
    brandId: "brand-pullup-dip",
    name: "Mount systems",
    slug: "pullup-dip-mount",
    categoryId: "cat-pull-up-bars",
    description:
      "Doorway bar for no-drill rentals vs wall-mounted bar when you can fix into a stud.",
    productIds: ["prod-pullup-dip-doorway", "prod-pullup-dip-wall"],
  },
  {
    id: "fam-p56-pullup-parallettes",
    brandId: "brand-pullup-dip",
    name: "Parallettes",
    slug: "pullup-dip-parallettes",
    categoryId: "cat-parallettes",
    description:
      "Parallettes for dips and L-sits — floor tool beside the mount choice, not a ring set.",
    productIds: ["prod-pullup-dip-parallettes"],
  },
  {
    id: "fam-p56-ua-reign",
    brandId: "brand-under-armour",
    name: "Reign / Project Rock",
    slug: "ua-reign",
    categoryId: "cat-training-shoes",
    description:
      "TriBase Reign 6 and Project Rock BSR 4 are tri-base metcon trainers — wide stance for ropes and lifts.",
    productIds: ["prod-ua-tribase-reign-6", "prod-ua-project-rock-bsr-4"],
  },
  {
    id: "fam-p56-ua-lifter-commit",
    brandId: "brand-under-armour",
    name: "Reign Lifter / Commit",
    slug: "ua-lifter-commit",
    categoryId: "cat-training-shoes",
    description:
      "Reign Lifter is the weightlifting heel; Charged Commit 4 is the general-gym trainer — neither is Reign 6.",
    productIds: ["prod-ua-reign-lifter", "prod-ua-charged-commit-4"],
  },
];
