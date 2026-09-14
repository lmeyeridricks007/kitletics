import type { BrandHubConfig } from "@/lib/brand-hub/types";

/** Padel-native brand hubs — never feature cat-running-shoes. */

export const noxBrandHubConfig: BrandHubConfig = {
  brandSlug: "nox",
  editorialSummary:
    "Nox is a padel-first brand on Kitletics — AT10 Genius and Attack frames, Equation and ML10 control lines, plus court kit across rackets and accessories where stocked.",
  pillars: [
    {
      id: "padel",
      title: "Padel-native lineup",
      description: "Racket families built for padel, not tennis conversions.",
      icon: "layers",
    },
    {
      id: "at10",
      title: "AT10 Genius / Attack",
      description: "Drop/tear Genius vs diamond Attack roles in one family.",
      icon: "flag",
    },
    {
      id: "control",
      title: "Control & comfort paths",
      description: "Equation Soft and ML10 for forgiveness-first buyers.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: ["fam-nox-at10", "fam-nox-equation", "fam-nox-ml10"],
  whyTitle: "What Nox is known for on Kitletics",
  whyItems: [
    { id: "at10", label: "Clear Genius vs Attack roles in the AT10 family" },
    { id: "control", label: "Forgiving Equation / ML10 control options" },
    { id: "padel", label: "Padel-first catalog — not a running shoe brand" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "padel-racket-shapes-explained",
    "round-vs-teardrop-vs-diamond-padel-rackets",
  ],
};

export const bullpadelBrandHubConfig: BrandHubConfig = {
  brandSlug: "bullpadel",
  editorialSummary:
    "Bullpadel covers a full padel assortment on Kitletics — Vertex and Hack flagship frames, Neuron/XPLO/Ionic/Indiga paths, plus shoes, bags, grips and accessories where stocked.",
  pillars: [
    {
      id: "vertex",
      title: "Vertex all-court",
      description: "Hybrid and standard Vertex roles for club attackers.",
      icon: "layers",
    },
    {
      id: "hack",
      title: "Hack attack",
      description: "Diamond Hack line when finishing already lands.",
      icon: "flag",
    },
    {
      id: "range",
      title: "Cross-category kit",
      description: "Rackets plus soft goods across the padel catalog.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: [
    "fam-bullpadel-vertex",
    "fam-bullpadel-hack",
    "fam-bullpadel-neuron",
    "fam-bullpadel-xplo",
    "fam-bullpadel-ionic",
    "fam-bullpadel-indiga",
  ],
  whyTitle: "What Bullpadel is known for on Kitletics",
  whyItems: [
    { id: "vertex", label: "Vertex all-court coverage across generations" },
    { id: "hack", label: "Hack attack molds for finishers" },
    { id: "entry", label: "Indiga / Ionic paths for developing players" },
    { id: "kit", label: "Rackets plus bags, grips and accessories" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "soft-vs-hard-padel-rackets",
    "padel-racket-balance-explained",
  ],
};

export const adidasPadelBrandHubConfig: BrandHubConfig = {
  brandSlug: "adidas-padel",
  editorialSummary:
    "Adidas Padel is the padel vertical on Kitletics — Metalbone, Cross-It, Arrow Hit and RX racket families, plus padel shoes and court accessories where stocked. Separate from Adidas running footwear.",
  pillars: [
    {
      id: "metalbone",
      title: "Metalbone attack",
      description: "Flagship diamond / power-oriented Metalbone line.",
      icon: "flag",
    },
    {
      id: "range",
      title: "Cross-It to RX",
      description: "Attack, hybrid and more accessible RX roles.",
      icon: "layers",
    },
    {
      id: "shoes",
      title: "Court shoes",
      description: "Padel footwear alongside frames when in catalog.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: [
    "fam-adidas-metalbone",
    "fam-adidas-cross-it",
    "fam-adidas-arrow-hit",
    "fam-adidas-rx",
  ],
  whyTitle: "What Adidas Padel is known for",
  whyItems: [
    { id: "metalbone", label: "Metalbone attack presence on Kitletics" },
    { id: "families", label: "Distinct Cross-It / Arrow Hit / RX roles" },
    { id: "shoes", label: "Padel shoes in the same brand hub" },
    { id: "separate", label: "Separate entity from Adidas running" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "how-to-choose-padel-shoes",
    "round-vs-teardrop-vs-diamond-padel-rackets",
  ],
};

export const headPadelBrandHubConfig: BrandHubConfig = {
  brandSlug: "head",
  editorialSummary:
    "Head on Kitletics maps to the padel entity — Coello, Extreme, Gravity, Speed and One racket families, with shoes and accessories where the padel catalog stocks them.",
  pillars: [
    {
      id: "coello",
      title: "Coello Pro line",
      description: "Attack-oriented Coello molds for finishers.",
      icon: "flag",
    },
    {
      id: "gravity",
      title: "Gravity & Speed",
      description: "Control and speed-oriented family roles.",
      icon: "layers",
    },
    {
      id: "court",
      title: "Court kit",
      description: "Rackets plus shoes/accessories when listed.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: [
    "fam-head-coello",
    "fam-head-extreme",
    "fam-head-gravity",
    "fam-head-speed-padel",
    "fam-head-one",
  ],
  whyTitle: "What Head padel is known for on Kitletics",
  whyItems: [
    { id: "coello", label: "Coello Pro attack coverage" },
    { id: "gravity", label: "Gravity control options" },
    { id: "range", label: "Multiple padel family roles in one brand" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "padel-racket-shapes-explained",
    "carbon-vs-fiberglass-padel-rackets",
  ],
};

export const wilsonPadelBrandHubConfig: BrandHubConfig = {
  brandSlug: "wilson",
  editorialSummary:
    "Wilson on Kitletics maps to the padel entity — Bela and Blade padel racket families, with balls, bags and accessories where the padel assortment includes them.",
  pillars: [
    {
      id: "bela",
      title: "Bela line",
      description: "Bela padel frames for competitive play styles.",
      icon: "flag",
    },
    {
      id: "blade",
      title: "Blade padel",
      description: "Blade padel family alongside Bela roles.",
      icon: "layers",
    },
    {
      id: "kit",
      title: "Court kit",
      description: "Rackets plus soft goods when stocked.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: ["fam-wilson-bela", "fam-wilson-blade-padel"],
  whyTitle: "What Wilson padel is known for on Kitletics",
  whyItems: [
    { id: "bela", label: "Bela padel family coverage" },
    { id: "blade", label: "Blade padel options in catalog" },
    { id: "kit", label: "Rackets with padel soft goods when available" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "padel-racket-weight-explained",
    "soft-vs-hard-padel-rackets",
  ],
};

export const babolatPadelBrandHubConfig: BrandHubConfig = {
  brandSlug: "babolat",
  editorialSummary:
    "Babolat on Kitletics maps to the padel entity — Viper and Veron racket families, plus padel shoes, balls and accessories across the padel catalog.",
  pillars: [
    {
      id: "viper",
      title: "Viper attack",
      description: "Technical Viper molds for aggressive play.",
      icon: "flag",
    },
    {
      id: "veron",
      title: "Veron path",
      description: "Veron family as a complementary role.",
      icon: "layers",
    },
    {
      id: "shoes",
      title: "Shoes & balls",
      description: "Jet Premura-class shoes and court balls when listed.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: ["fam-babolat-viper", "fam-babolat-veron"],
  whyTitle: "What Babolat padel is known for on Kitletics",
  whyItems: [
    { id: "viper", label: "Viper attack presence" },
    { id: "veron", label: "Veron complementary frames" },
    { id: "cross", label: "Rackets plus shoes, balls and accessories" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "how-to-choose-padel-shoes",
    "how-to-choose-padel-balls",
  ],
};

export const siuxBrandHubConfig: BrandHubConfig = {
  brandSlug: "siux",
  editorialSummary:
    "Siux is a padel-native brand on Kitletics — Diablo, Electra and Fenix racket families for players shortlisting Spanish attack and hybrid frames.",
  pillars: [
    {
      id: "diablo",
      title: "Diablo",
      description: "Diablo family as a core Siux attack/hybrid path.",
      icon: "flag",
    },
    {
      id: "electra",
      title: "Electra & Fenix",
      description: "Additional family roles across the Siux lineup.",
      icon: "layers",
    },
    {
      id: "padel",
      title: "Padel-first",
      description: "Catalog focused on padel rackets.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: ["fam-siux-diablo", "fam-siux-electra", "fam-siux-fenix"],
  whyTitle: "What Siux is known for on Kitletics",
  whyItems: [
    { id: "diablo", label: "Diablo family coverage" },
    { id: "range", label: "Electra and Fenix roles alongside Diablo" },
    { id: "padel", label: "Padel-native brand hub" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "round-vs-teardrop-vs-diamond-padel-rackets",
  ],
};

export const starvieBrandHubConfig: BrandHubConfig = {
  brandSlug: "starvie",
  editorialSummary:
    "StarVie is a padel-native brand on Kitletics — Titania, Basalto and Astrum racket families for Spanish-made control and all-court shortlists.",
  pillars: [
    {
      id: "titania",
      title: "Titania",
      description: "Titania family as a core StarVie path.",
      icon: "layers",
    },
    {
      id: "basalto",
      title: "Basalto & Astrum",
      description: "Material and mold roles across the lineup.",
      icon: "flag",
    },
    {
      id: "padel",
      title: "Padel-first",
      description: "Racket-focused padel assortment.",
      icon: "route",
    },
  ],
  featuredCategoryId: "cat-padel-rackets",
  familyIds: [
    "fam-starvie-titania",
    "fam-starvie-basalto",
    "fam-starvie-astrum",
  ],
  whyTitle: "What StarVie is known for on Kitletics",
  whyItems: [
    { id: "titania", label: "Titania family coverage" },
    { id: "basalto", label: "Basalto and Astrum roles" },
    { id: "padel", label: "Padel-native brand hub" },
  ],
  guideSlugs: [
    "how-to-choose-a-padel-racket",
    "padel-racket-materials-explained",
    "soft-vs-hard-padel-rackets",
  ],
};

export const padelBrandHubConfigs: Record<string, BrandHubConfig> = {
  nox: noxBrandHubConfig,
  bullpadel: bullpadelBrandHubConfig,
  "adidas-padel": adidasPadelBrandHubConfig,
  head: headPadelBrandHubConfig,
  wilson: wilsonPadelBrandHubConfig,
  babolat: babolatPadelBrandHubConfig,
  siux: siuxBrandHubConfig,
  starvie: starvieBrandHubConfig,
};
