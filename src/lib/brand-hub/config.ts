import type { BrandHubConfig } from "@/lib/brand-hub/types";
import { brandHubP56Configs } from "@/content/brand-hub-p56-editorial";

export const asicsBrandHubConfig: BrandHubConfig = {
  brandSlug: "asics",
  relatedBrandIds: ["brand-asics-racket"],
  editorialSummary:
    "ASICS is a performance footwear brand with major strength in road running — daily trainers, stability shoes and race models across clear product families.",
  pillars: [
    {
      id: "founded",
      title: "Founded in 1949",
      description: "Long-running footwear brand based in Japan.",
      icon: "calendar",
    },
    {
      id: "range",
      title: "Strong running range",
      description: "Daily, race and stability families on Kitletics.",
      icon: "route",
    },
    {
      id: "families",
      title: "Clear product families",
      description: "Novablast, Nimbus, Kayano, Metaspeed and more.",
      icon: "layers",
    },
  ],
  featuredProductId: "prod-novablast-6",
  featuredCategoryId: "cat-running-shoes",
  familyIds: [
    "fam-novablast",
    "fam-gel-nimbus",
    "fam-kayano",
    "fam-metaspeed",
    "fam-superblast",
    "fam-gt2000",
  ],
  technologies: [
    {
      id: "ff-blast",
      name: "FF BLAST foam family",
      description:
        "Cushioning compounds ASICS uses across energetic daily trainers such as Novablast.",
      href: "/running/shoes?brand=asics",
      icon: "foam",
    },
    {
      id: "gel",
      name: "GEL cushioning",
      description:
        "Viscoelastic inserts ASICS places in select models for impact management.",
      href: "/running/shoes?brand=asics",
      icon: "gel",
    },
    {
      id: "guidance",
      name: "Guidance systems",
      description:
        "Stability-oriented constructions used in lines such as Kayano and GT-2000.",
      href: "/running/shoes/stability?brand=asics",
      icon: "line",
    },
    {
      id: "ahar",
      name: "AHAR outsole rubber",
      description:
        "High-abrasion rubber compounds ASICS specifies for durability in high-wear zones.",
      href: "/running/shoes?brand=asics",
      icon: "sole",
    },
  ],
  whyTitle: "What ASICS is known for",
  whyItems: [
    { id: "daily", label: "Broad daily-trainer coverage on Kitletics" },
    { id: "stability", label: "Dedicated stability shoe families" },
    { id: "cushion", label: "Multiple cushioning levels across road lines" },
    { id: "families", label: "Clear family roles for training and racing" },
  ],
  guideSlugs: [
    "how-to-choose-running-shoes",
    "what-is-a-daily-trainer",
    "running-shoe-cushioning",
  ],
  guideImageMap: {
    "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
    "what-is-a-daily-trainer": "/images/running/guides/daily-vs-long.jpg",
    "running-shoe-cushioning": "/images/running/category/use-recovery.jpg",
  },
};

export const garminBrandHubConfig: BrandHubConfig = {
  brandSlug: "garmin",
  editorialSummary:
    "Garmin focuses on GPS watches and training sensors — navigation, battery life and multi-sport feature sets across price tiers.",
  pillars: [
    {
      id: "founded",
      title: "Founded in 1989",
      description: "GPS and wearable navigation heritage.",
      icon: "calendar",
    },
    {
      id: "wearables",
      title: "Wearables & GPS",
      description: "Watches and sensors for training and racing.",
      icon: "watch",
    },
    {
      id: "ecosystem",
      title: "Accessory ecosystem",
      description: "Heart-rate and multi-sport add-ons in the catalog.",
      icon: "layers",
    },
  ],
  featuredCategoryId: "cat-gps-watches",
  technologies: [
    {
      id: "gnss",
      name: "Multi-band GNSS",
      description:
        "Selected Garmin watches support multi-band satellite reception for tougher signal environments.",
      icon: "gps",
    },
    {
      id: "maps",
      name: "On-device maps",
      description:
        "Higher-tier models include mapping and navigation features for outdoor routes.",
      icon: "map",
    },
    {
      id: "battery",
      name: "Battery-focused design",
      description:
        "Long GPS battery life is a recurring priority across Garmin running watches.",
      icon: "battery",
    },
  ],
  whyTitle: "What Garmin is known for",
  whyItems: [
    { id: "gps", label: "Deep GPS-watch range across price tiers" },
    { id: "nav", label: "Maps and navigation on selected models" },
    { id: "multi", label: "Multi-sport training feature sets" },
    { id: "eco", label: "Accessory ecosystem for heart rate and more" },
  ],
};

export const nikeBrandHubConfig: BrandHubConfig = {
  brandSlug: "nike",
  editorialSummary:
    "Nike covers road racing and daily training footwear, with plated race shoes and versatile trainers represented on Kitletics.",
  pillars: [
    {
      id: "race",
      title: "Race-day footwear",
      description: "Plated racing models for goal efforts.",
      icon: "flag",
    },
    {
      id: "daily",
      title: "Daily training options",
      description: "Pegasus and other road trainers in catalog.",
      icon: "route",
    },
    {
      id: "cross",
      title: "Cross-category coverage",
      description: "Running, training and court footwear on Kitletics.",
      icon: "layers",
    },
  ],
  featuredProductId: "prod-vaporfly-4",
  featuredCategoryId: "cat-running-shoes",
  whyTitle: "What Nike is known for",
  whyItems: [
    { id: "race", label: "Strong presence in plated race shoes" },
    { id: "daily", label: "High-volume daily trainers like Pegasus" },
    { id: "range", label: "Running and training footwear overlap" },
  ],
  guideSlugs: ["how-to-choose-running-shoes"],
  guideImageMap: {
    "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
  },
};

export const corosBrandHubConfig: BrandHubConfig = {
  brandSlug: "coros",
  editorialSummary:
    "COROS focuses on lightweight GPS watches and endurance training tools — a narrower catalog than mass-market wearable brands.",
  pillars: [
    {
      id: "focus",
      title: "Endurance focus",
      description: "Watches aimed at running and multi-sport training.",
      icon: "watch",
    },
    {
      id: "battery",
      title: "Battery as priority",
      description: "Long GPS sessions are a core product theme.",
      icon: "layers",
    },
    {
      id: "lean",
      title: "Lean lineup",
      description: "Fewer models — easier to compare side by side.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-gps-watches",
  whyTitle: "What COROS is known for",
  whyItems: [
    { id: "weight", label: "Lightweight watch designs" },
    { id: "battery", label: "Long battery life emphasis" },
    { id: "focus", label: "Focused endurance lineup" },
  ],
};

export const rogueBrandHubConfig: BrandHubConfig = {
  brandSlug: "rogue",
  editorialSummary:
    "Rogue builds strength and conditioning equipment — racks, bars, plates and garage-gym gear for home and commercial setups.",
  pillars: [
    {
      id: "strength",
      title: "Strength equipment",
      description: "Racks, benches, bars and plates on Kitletics.",
      icon: "dumbbell",
    },
    {
      id: "ecosystem",
      title: "Attachment ecosystem",
      description: "Racks designed around modular add-ons.",
      icon: "layers",
    },
    {
      id: "home",
      title: "Home & commercial gyms",
      description: "Gear spanning garage setups to full gyms.",
      icon: "flag",
    },
  ],
  featuredCategoryId: "cat-power-racks",
  whyTitle: "What Rogue is known for",
  whyItems: [
    { id: "racks", label: "Power rack and bench coverage" },
    { id: "bars", label: "Barbells and plate options" },
    { id: "cond", label: "Conditioning equipment for hybrid training" },
  ],
};

export const adidasBrandHubConfig: BrandHubConfig = {
  brandSlug: "adidas",
  relatedBrandIds: ["brand-adidas-padel"],
  editorialSummary:
    "Adidas spans road racing footwear and padel equipment on Kitletics — Adizero running lines plus Metalbone and related padel gear under the Adidas Padel vertical entity.",
  pillars: [
    {
      id: "running",
      title: "Road racing footwear",
      description: "Adizero race and tempo models in the running catalog.",
      icon: "route",
    },
    {
      id: "padel",
      title: "Padel equipment",
      description: "Metalbone and related padel rackets via Adidas Padel.",
      icon: "layers",
    },
    {
      id: "performance",
      title: "Performance focus",
      description: "Training and competition gear across sports.",
      icon: "flag",
    },
  ],
  featuredCategoryId: "cat-running-shoes",
  whyTitle: "What Adidas is known for",
  whyItems: [
    { id: "race", label: "Plated road racing shoes" },
    { id: "padel", label: "Padel rackets under Adidas Padel" },
    { id: "range", label: "Cross-sport performance catalog" },
  ],
};

export const tecnifibreBrandHubConfig: BrandHubConfig = {
  brandSlug: "tecnifibre",
  relatedBrandIds: ["brand-tecnifibre-padel"],
  editorialSummary:
    "Tecnifibre covers tennis/squash rackets and strings, with padel attack models under the Tecnifibre Padel vertical entity.",
  pillars: [
    {
      id: "tennis",
      title: "Tennis rackets",
      description: "TF40 and TFight lines for competitive players.",
      icon: "layers",
    },
    {
      id: "padel",
      title: "Padel attack",
      description: "Wall Breaker and related padel models.",
      icon: "flag",
    },
    {
      id: "strings",
      title: "Strings & accessories",
      description: "String options alongside racket frames.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-tennis-rackets",
  whyTitle: "What Tecnifibre is known for",
  whyItems: [
    { id: "tennis", label: "Competitive tennis racket lines" },
    { id: "padel", label: "Padel models via Tecnifibre Padel" },
    { id: "strings", label: "String and accessory coverage" },
  ],
};

const CONFIGS: Record<string, BrandHubConfig> = {
  asics: asicsBrandHubConfig,
  garmin: garminBrandHubConfig,
  nike: nikeBrandHubConfig,
  coros: corosBrandHubConfig,
  rogue: rogueBrandHubConfig,
  adidas: adidasBrandHubConfig,
  tecnifibre: tecnifibreBrandHubConfig,
  ...brandHubP56Configs,
};

export function getBrandHubConfig(brandSlug: string): BrandHubConfig | undefined {
  return CONFIGS[brandSlug];
}

export function getDefaultBrandHubConfig(brandSlug: string): BrandHubConfig {
  return (
    getBrandHubConfig(brandSlug) ?? {
      brandSlug,
      whyTitle: `What ${brandSlug} is known for`,
      whyItems: [],
    }
  );
}

/** Minimum quality gate for an indexable Brand Hub — thin catalogs stay held. */
export function canPublishBrandHub(input: {
  productCount: number;
  categoryCount: number;
  familyCount?: number;
  strengthSignalCount?: number;
}): boolean {
  const {
    productCount,
    categoryCount,
    familyCount = 0,
    strengthSignalCount = 0,
  } = input;
  if (productCount < 3) return false;
  if (productCount >= 5 && categoryCount >= 1) return true;
  if (categoryCount >= 2) return true;
  if (familyCount >= 1 && strengthSignalCount >= 2) return true;
  if (strengthSignalCount >= 3) return true;
  return false;
}
