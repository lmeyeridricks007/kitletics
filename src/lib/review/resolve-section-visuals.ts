import { existsSync } from "node:fs";
import path from "node:path";
import type { ContentSection } from "@/domain/editorial/types";
import type { MediaAsset } from "@/domain/shared/types";

export type SectionVisual = {
  src: string;
  alt: string;
  caption?: string;
};

const SECTION_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"] as const;

type TopicKey =
  | "overview"
  | "specs"
  | "strengths"
  | "weaknesses"
  | "bestFor"
  | "notIdeal"
  | "alternatives"
  | "comparisons"
  | "fit"
  | "cushioning"
  | "ride"
  | "stability"
  | "grip"
  | "tradeoffs"
  | "usecase"
  | "value"
  | "upper"
  | "outsole"
  | "durability"
  | "assessment"
  | "tech"
  | "performance"
  | "construction"
  | "shape"
  | "power"
  | "control"
  | "sweetspot"
  | "maneuverability"
  | "comfort"
  | "spin"
  | "defense"
  | "net"
  | "attack"
  | "serve"
  | "methodology"
  | "sources"
  | "traction"
  | "courtFeel"
  | "support"
  | "generic";

type CategoryFamily =
  | "running"
  | "watches"
  | "racket"
  | "fitness"
  | "general";

const V = (
  src: string,
  alt: string,
  caption?: string,
): SectionVisual => ({ src, alt, caption });

/** Shared editorial imagery — reused across reviews, unique within a page */
const MASTER_POOL: SectionVisual[] = [
  V(
    "/images/running/category/hero-trail.jpg",
    "Trail runner on a singletrack path",
    "Context for off-road and technical use.",
  ),
  V(
    "/images/running/category/use-trail.jpg",
    "Trail runner on a rolling dirt path",
    "Match the product to the surfaces you actually use.",
  ),
  V(
    "/images/running/category/use-daily.jpg",
    "Runner on a paved path during easy training",
    "Daily training context.",
  ),
  V(
    "/images/running/category/use-long.jpg",
    "Runner on a long training route",
    "Long-session durability and comfort matter here.",
  ),
  V(
    "/images/running/category/use-race.jpg",
    "Runner in a race-day setting",
    "Race-day tools differ from daily trainers.",
  ),
  V(
    "/images/running/category/use-tempo.jpg",
    "Runner at a faster training pace",
    "Workout and tempo sessions pull different priorities.",
  ),
  V(
    "/images/running/category/use-recovery.jpg",
    "Easy recovery run on a quiet path",
    "Recovery gear prioritises comfort over speed.",
  ),
  V(
    "/images/running/category/hero-race.jpg",
    "Performance running on an open road",
    "Performance geometry for goal efforts.",
  ),
  V(
    "/images/running/category/hero-stability.jpg",
    "Runner on a firm path illustrating guided support",
    "Stability and support change how the product holds you.",
  ),
  V(
    "/images/running/category/hero-heavy.jpg",
    "Runner on a solid training route",
    "Protective platforms for higher load or volume.",
  ),
  V(
    "/images/running/guides/daily-vs-long.jpg",
    "Running shoes for daily and long-run roles",
    "Different sessions often need different tools.",
  ),
  V(
    "/images/running/guides/road-shoe-outsole-compare.jpg",
    "Road running shoe outsole with shallow flex grooves",
    "Road outsoles favour smooth pavement contact.",
  ),
  V(
    "/images/running/guides/trail-shoe-outsole-compare.jpg",
    "Trail running shoe with deep lugged outsole",
    "Trail outsoles prioritise bite on soft and uneven ground.",
  ),
  V(
    "/images/running/reviews/review-verified-specs-flatlay.jpg",
    "Product flat-lay with measurement context",
    "Verified measurements anchor the review.",
  ),
  V(
    "/images/running/reviews/review-shoe-fit-lockdown.jpg",
    "Athlete tightening footwear laces for lockdown",
    "Fit and lockdown matter as much as length.",
  ),
  V(
    "/images/running/reviews/review-midsole-cushion-stack.jpg",
    "Cutaway view of midsole foam and stack",
    "Stack and foam character set protection versus ground feel.",
  ),
  V(
    "/images/running/reviews/review-trail-muddy-grip.jpg",
    "Aggressive lugs biting into muddy trail",
    "Grip shows up when the surface gets soft or technical.",
  ),
  V(
    "/images/running/reviews/review-trail-stability-descent.jpg",
    "Athlete descending uneven rocky ground",
    "Control on uneven ground is a stability problem.",
  ),
  V(
    "/images/running/reviews/review-trail-vs-road-surfaces.jpg",
    "Trail path beside smooth asphalt",
    "Surface trade-offs are often the real buying decision.",
  ),
  V(
    "/images/running/reviews/review-research-assessment.jpg",
    "Editor desk with notes and a product",
    "We compare published specs and similar products to help you decide.",
  ),
  V(
    "/images/watches/guides/gps-open-sky-running.jpg",
    "Runner under open sky with a GPS watch",
    "Open-sky conditions favour clean GNSS tracking.",
  ),
  V(
    "/images/watches/guides/gps-urban-canyon-running.jpg",
    "Runner between tall buildings wearing a GPS watch",
    "Urban canyons stress signal quality and battery choices.",
  ),
  V(
    "/images/watches/guides/gps-forest-trail-running.jpg",
    "Trail runner under dense forest canopy",
    "Tree cover is where multi-band GNSS often earns its keep.",
  ),
  V(
    "/images/running/best-hub/best-gps-watches-running.jpg",
    "GPS running watch training context",
    "Wrist computers change how you pace and navigate sessions.",
  ),
  V(
    "/images/running/best-hub/best-hrm-running.jpg",
    "Heart-rate training context for runners",
    "Cardiac sensors support training load decisions.",
  ),
  V(
    "/images/running/best-hub/best-hydration-vests.jpg",
    "Runner wearing a hydration vest",
    "Carry systems matter on long and unsupported efforts.",
  ),
  V(
    "/images/running/best-hub/best-running-belts.jpg",
    "Minimal running belt carry setup",
    "Light carry for shorter sessions and races.",
  ),
  V(
    "/images/running/best-hub/best-running-headlamps.jpg",
    "Night running with a headlamp",
    "Visibility gear for early and late sessions.",
  ),
  V(
    "/images/running/best-hub/best-running-headphones.jpg",
    "Runner using open-ear headphones",
    "Audio gear for awareness and motivation outdoors.",
  ),
  V(
    "/images/running/best-hub/best-running-socks.jpg",
    "Running sock fit and cushion zones",
    "Interface layers affect blister risk and comfort.",
  ),
  V(
    "/images/running/best-hub/best-beginners-running.jpg",
    "Beginner-friendly running scene",
    "Newer athletes need clear, forgiving gear choices.",
  ),
  V(
    "/images/running/best-hub/best-marathon-running.jpg",
    "Long-distance road running context",
    "Marathon and long-race tools emphasise efficiency over miles.",
  ),
  V(
    "/images/running/best-hub/best-wide-feet-running.jpg",
    "Running shoe fit for wider feet",
    "Width and volume options change who a product fits.",
  ),
  V(
    "/images/home/guide-running-shoes.jpg",
    "Modern running shoes on a studio surface",
    "Footwear geometry is the first buying filter for many athletes.",
  ),
  V(
    "/images/home/guide-how-to-choose.jpg",
    "Athlete comparing padel racket options on court",
    "Choose for the job, not the marketing label.",
  ),
  V(
    "/images/home/guide-tennis.jpg",
    "Tennis court gear context",
    "Court sports demand surface-specific footwear and frames.",
  ),
  V(
    "/images/home/guide-home-gym.jpg",
    "Home gym training equipment",
    "Home fitness gear is judged on setup, durability and session fit.",
  ),
  V(
    "/images/home/hero-gear-composite.png",
    "Composite of Kitletics sport gear categories",
    "Category context for how this product sits in the wider catalog.",
  ),
  V(
    "/images/brands/heroes/running-urban.jpg",
    "Urban running atmosphere",
    "City training surfaces and conditions shape gear needs.",
  ),
  V(
    "/images/brands/heroes/urban-dusk.jpg",
    "Dusk training in an urban setting",
    "Light and conditions change what gear you need.",
  ),
  V(
    "/images/padel/hero.jpg",
    "Padel court play atmosphere",
    "Racket sports gear must match court pace and movement.",
  ),
  V(
    "/images/padel/guides/choose-racket.jpg",
    "Padel racket selection context",
    "Frame shape and balance change power versus control.",
  ),
  V(
    "/images/padel/guides/choose-shoes.jpg",
    "Court shoe selection for racket sports",
    "Court outsoles and lateral support differ from road shoes.",
  ),
  V(
    "/images/padel/guides/grips.jpg",
    "Racket grip overwrap detail",
    "Interface details affect comfort and control over long sessions.",
  ),
];

const TOPIC_PREFERENCES: Partial<Record<TopicKey, string[]>> = {
  overview: [
    "/images/home/hero-gear-composite.png",
    "/images/running/category/use-daily.jpg",
    "/images/running/reviews/review-research-assessment.jpg",
  ],
  specs: [
    "/images/running/reviews/review-verified-specs-flatlay.jpg",
    "/images/running/reviews/review-research-assessment.jpg",
  ],
  strengths: [
    "/images/running/category/hero-race.jpg",
    "/images/running/reviews/review-trail-muddy-grip.jpg",
    "/images/running/category/use-tempo.jpg",
  ],
  fit: [
    "/images/running/reviews/review-shoe-fit-lockdown.jpg",
    "/images/running/best-hub/best-wide-feet-running.jpg",
  ],
  cushioning: [
    "/images/running/reviews/review-midsole-cushion-stack.jpg",
    "/images/running/category/use-long.jpg",
    "/images/running/category/use-recovery.jpg",
  ],
  ride: [
    "/images/running/category/use-daily.jpg",
    "/images/running/category/use-tempo.jpg",
    "/images/running/guides/daily-vs-long.jpg",
    "/images/running/category/use-recovery.jpg",
    "/images/home/guide-running-shoes.jpg",
  ],
  stability: [
    "/images/running/reviews/review-trail-stability-descent.jpg",
    "/images/running/category/hero-stability.jpg",
  ],
  grip: [
    "/images/running/guides/road-shoe-outsole-compare.jpg",
    "/images/running/category/use-daily.jpg",
    "/images/home/guide-running-shoes.jpg",
  ],
  tradeoffs: [
    "/images/running/reviews/review-trail-vs-road-surfaces.jpg",
    "/images/running/guides/daily-vs-long.jpg",
  ],
  usecase: [
    "/images/running/category/use-trail.jpg",
    "/images/running/category/use-daily.jpg",
    "/images/running/best-hub/best-marathon-running.jpg",
  ],
  value: [
    "/images/running/reviews/review-research-assessment.jpg",
    "/images/running/category/hero-stability.jpg",
  ],
  upper: [
    "/images/running/reviews/review-shoe-fit-lockdown.jpg",
    "/images/running/best-hub/best-wide-feet-running.jpg",
  ],
  outsole: [
    "/images/running/guides/trail-shoe-outsole-compare.jpg",
    "/images/running/guides/road-shoe-outsole-compare.jpg",
  ],
  durability: [
    "/images/running/guides/road-shoe-outsole-compare.jpg",
    "/images/running/category/hero-heavy.jpg",
  ],
  assessment: [
    "/images/running/reviews/review-research-assessment.jpg",
    "/images/running/guides/daily-vs-long.jpg",
  ],
  tech: [
    "/images/watches/guides/gps-open-sky-running.jpg",
    "/images/watches/guides/gps-urban-canyon-running.jpg",
    "/images/running/best-hub/best-gps-watches-running.jpg",
  ],
  performance: [
    "/images/running/category/hero-race.jpg",
    "/images/running/category/use-tempo.jpg",
    "/images/home/guide-running-shoes.jpg",
  ],
  generic: [
    "/images/home/hero-gear-composite.png",
    "/images/brands/heroes/running-urban.jpg",
    "/images/running/reviews/review-research-assessment.jpg",
  ],
};

/** Racket-only topic overrides so court gear never leaks into shoe/watch reviews. */
const RACKET_TOPIC_PREFERENCES: Partial<Record<TopicKey, string[]>> = {
  strengths: [
    "/images/padel/guides/choose-racket.jpg",
    "/images/padel/hero.jpg",
  ],
  performance: [
    "/images/padel/hero.jpg",
    "/images/padel/guides/choose-shoes.jpg",
  ],
  grip: [
    "/images/padel/guides/grips.jpg",
    "/images/padel/guides/choose-shoes.jpg",
  ],
  fit: [
    "/images/padel/guides/choose-shoes.jpg",
  ],
  overview: [
    "/images/padel/hero.jpg",
    "/images/padel/guides/choose-racket.jpg",
    "/images/home/guide-how-to-choose.jpg",
  ],
  assessment: [
    "/images/padel/guides/choose-racket.jpg",
    "/images/home/guide-how-to-choose.jpg",
  ],
};

/** Watch/HRM topic overrides — never padel or shoe lifestyle fillers. */
const WATCH_TOPIC_PREFERENCES: Partial<Record<TopicKey, string[]>> = {
  assessment: [
    "/images/watches/guides/gps-open-sky-running.jpg",
    "/images/running/best-hub/best-gps-watches-running.jpg",
    "/images/running/reviews/review-research-assessment.jpg",
  ],
  overview: [
    "/images/running/best-hub/best-gps-watches-running.jpg",
    "/images/watches/guides/gps-open-sky-running.jpg",
  ],
  value: [
    "/images/running/best-hub/best-gps-watches-running.jpg",
    "/images/watches/guides/gps-urban-canyon-running.jpg",
  ],
  performance: [
    "/images/watches/guides/gps-open-sky-running.jpg",
    "/images/watches/guides/gps-forest-trail-running.jpg",
    "/images/running/best-hub/best-gps-watches-running.jpg",
  ],
};

const FAMILY_BONUS: Record<CategoryFamily, string[]> = {
  running: [
    "/images/running/category/use-daily.jpg",
    "/images/home/guide-running-shoes.jpg",
    "/images/brands/heroes/running-urban.jpg",
    "/images/running/category/use-recovery.jpg",
  ],
  watches: [
    "/images/watches/guides/gps-open-sky-running.jpg",
    "/images/running/best-hub/best-gps-watches-running.jpg",
    "/images/watches/guides/gps-urban-canyon-running.jpg",
  ],
  racket: [
    "/images/padel/hero.jpg",
    "/images/padel/guides/choose-racket.jpg",
    "/images/padel/guides/choose-shoes.jpg",
  ],
  fitness: [
    "/images/home/guide-home-gym.jpg",
    "/images/running/category/hero-heavy.jpg",
    "/images/home/hero-gear-composite.png",
  ],
  general: [
    "/images/home/hero-gear-composite.png",
    "/images/running/reviews/review-research-assessment.jpg",
  ],
};

function categoryFamily(categoryId?: string): CategoryFamily {
  if (!categoryId) return "general";
  // Watches / HRMs before the broad "running" sport hub match (e.g. cat-gps-watches).
  if (/watch|gps|hrm|heart.?rate/i.test(categoryId)) return "watches";
  // Padel court categories before the generic /shoe/ match.
  if (/cat-padel-|padel/i.test(categoryId)) return "racket";
  if (
    /running|shoe|sock|belt|light|headphone|pack|hydrat|sunglass|recovery/i.test(
      categoryId,
    )
  ) {
    return "running";
  }
  if (
    /tennis|squash|badminton|pickleball|racket|paddle|grip|ball/i.test(
      categoryId,
    )
  ) {
    return "racket";
  }
  if (
    /air-bike|treadmill|weight|dumbbell|barbell|kettle|row|ski|rack|bench|plate|gym|ring|parallette|pull-up|vest|functional|flooring|storage|lifting/i.test(
      categoryId,
    )
  ) {
    return "fitness";
  }
  return "general";
}

/** Which category families may use a given editorial asset. */
function familiesForSrc(src: string): CategoryFamily[] {
  if (
    src.includes("/padel/") ||
    src.includes("guide-tennis") ||
    // File is a padel racket / ball court shot despite the generic filename.
    src.includes("guide-how-to-choose")
  ) {
    return ["racket"];
  }
  if (src.includes("/watches/") || src.includes("best-gps-watches") || src.includes("best-hrm")) {
    return ["watches"];
  }
  if (src.includes("guide-home-gym")) {
    return ["fitness"];
  }
  if (
    src.includes("/running/") ||
    src.includes("guide-running-shoes")
  ) {
    return ["running"];
  }
  if (src.includes("running-urban") || src.includes("urban-dusk")) {
    return [];
  }
  if (src.includes("hero-gear-composite")) {
    return ["general"];
  }
  return ["general"];
}

function poolForFamily(family: CategoryFamily): SectionVisual[] {
  return MASTER_POOL.filter((v) => familiesForSrc(v.src).includes(family));
}

function topicPreferences(
  topic: TopicKey,
  family: CategoryFamily,
): string[] {
  if (family === "racket" && RACKET_TOPIC_PREFERENCES[topic]) {
    return RACKET_TOPIC_PREFERENCES[topic]!;
  }
  if (family === "watches" && WATCH_TOPIC_PREFERENCES[topic]) {
    return WATCH_TOPIC_PREFERENCES[topic]!;
  }
  return TOPIC_PREFERENCES[topic] ?? [];
}

function topicFromSection(id: string, heading: string): TopicKey {
  const hay = `${id} ${heading}`.toLowerCase();
  if (/sec-weaknesses|\bweaknesses\b/.test(hay)) return "weaknesses";
  if (/sec-best-for|\bbest for\b/.test(hay)) return "bestFor";
  if (/sec-not-ideal|not ideal for/.test(hay)) return "notIdeal";
  if (/sec-alternatives|\balternatives\b/.test(hay)) return "alternatives";
  if (/sec-comparisons|\bcomparisons\b/.test(hay)) return "comparisons";
  if (/method/.test(hay)) return "methodology";
  if (/\bsources?\b/.test(hay)) return "sources";
  if (/construction|materials|setup/.test(hay) && /construct|material|setup/.test(hay)) {
    return "construction";
  }
  if (/sweet.?spot|forgiv/.test(hay)) return "sweetspot";
  if (/maneuver/.test(hay)) return "maneuverability";
  if (/\bpower\b/.test(hay)) return "power";
  if (/\bcontrol\b/.test(hay)) return "control";
  if (/\bspin\b/.test(hay)) return "spin";
  if (/defens/.test(hay)) return "defense";
  if (/\bnet\b|volley/.test(hay)) return "net";
  if (/smash|attack/.test(hay)) return "attack";
  if (/serve|return/.test(hay)) return "serve";
  if (/shape|balance/.test(hay)) return "shape";
  if (/traction/.test(hay)) return "traction";
  if (/court.?feel/.test(hay)) return "courtFeel";
  if (/\bsupport\b/.test(hay) && !/who should/.test(hay)) return "support";
  if (/capacity|racket storage/.test(hay)) return "performance";
  if (/thermal|shoe storage/.test(hay)) return "tech";
  if (/carry system/.test(hay)) return "fit";
  if (/how it works|mechanism/.test(hay)) return "tech";
  if (/speed and court/.test(hay)) return "performance";
  if (/match vs training/.test(hay)) return "fit";
  if (/overview|what it is|intro|verdict/.test(hay)) return "overview";
  if (/verified|spec|design &|measurements|key specs/.test(hay)) return "specs";
  if (/strength|strongest|best at/.test(hay)) return "strengths";
  if (/trade|limit|weak|avoid|not ideal/.test(hay)) return "tradeoffs";
  if (/use case|who it is|performance by|when to/.test(hay)) return "usecase";
  if (/value|price|position/.test(hay)) return "value";
  if (/upper|mesh|knit/.test(hay)) return "upper";
  if (/fit|sizing|lockdown|wrist|on.?wrist/.test(hay)) return "fit";
  if (/sec-comfort|(?:^|\s)comfort(?:\s|$)/.test(hay)) return "comfort";
  if (/cushion|midsole|foam|stack/.test(hay)) return "cushioning";
  if (/ride|feel|transition/.test(hay)) return "ride";
  if (/stabil/.test(hay)) return "stability";
  if (/grip|lug/.test(hay)) return "grip";
  if (/outsole|tread/.test(hay)) return "outsole";
  if (/durab/.test(hay)) return "durability";
  if (
    /battery|gps|maps|display|sensor|tech|tracking|features|navigation|training|recovery|interface|smartwatch/
      .test(hay)
  ) {
    return "tech";
  }
  if (/\bperformance\b|playability|everyday performance/.test(hay))
    return "performance";
  if (/assess|how we/.test(hay)) return "assessment";
  return "generic";
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rotatePool<T>(pool: T[], seed: number): T[] {
  if (pool.length === 0) return pool;
  const n = seed % pool.length;
  return [...pool.slice(n), ...pool.slice(0, n)];
}

function bySrc(src: string): SectionVisual | undefined {
  return MASTER_POOL.find((v) => v.src === src);
}

function pickUnused(
  candidates: SectionVisual[],
  used: Set<string>,
): SectionVisual | undefined {
  for (const candidate of candidates) {
    if (!used.has(candidate.src)) return candidate;
  }
  return undefined;
}

function candidateList(
  topic: TopicKey,
  family: CategoryFamily,
  seed: number,
): SectionVisual[] {
  const familyPool = poolForFamily(family);
  const preferredSrcs = [
    ...topicPreferences(topic, family),
    ...(FAMILY_BONUS[family] ?? []),
  ];
  const preferred = preferredSrcs
    .map(bySrc)
    .filter(
      (v): v is SectionVisual =>
        Boolean(v) && familiesForSrc(v!.src).includes(family),
    );
  const rest = familyPool.filter(
    (v) => !preferred.some((p) => p.src === v.src),
  );
  // Keep preferred topic/family matches first; only rotate within each tier.
  return [...rotatePool(preferred, seed), ...rotatePool(rest, seed)];
}

const TOPIC_CAPTIONS: Partial<Record<TopicKey, string>> = {
  overview: "The product this review assesses.",
  specs: "Case, display, and build details that drive the spec sheet.",
  fit: "On-wrist fit, strap, and sensor housing.",
  cushioning: "Cushioning and stack on this product.",
  ride: "How this product feels in regular use.",
  stability: "Stability profile for this product.",
  grip: "Outsole and grip on this product.",
  upper: "Upper and lockdown on this product.",
  durability: "Build and wear points on this product.",
  strengths: "Where this product earns its keep.",
  tradeoffs: "Trade-offs to weigh before you buy.",
  usecase: "The sessions and athletes this product suits.",
  value: "What you get for the money.",
  outsole: "Outsole on this product.",
  performance: "Everyday training and race-day use.",
  tech: "Maps, GPS, sensors, and training tools in play.",
  construction: "Frame, face, core, and named systems on the sheet.",
  shape: "Shape and balance for this racket.",
  power: "Power from published shape and construction.",
  control: "Control and placement for this racket.",
  sweetspot: "Sweet spot and off-centre forgiveness.",
  maneuverability: "Handling speed at the net and on defence.",
  comfort: "Touch and vibration claims — not a medical diagnosis.",
  spin: "Face texture and slice access.",
  defense: "Defensive play from the back glass.",
  net: "Volley and net exchanges.",
  attack: "Smashes and attacking windows.",
  serve: "Serve and return geometry.",
  methodology: "How this expert-research guide was assembled.",
  sources: "Manufacturer and specialist sources for this model.",
  traction: "Court traction on padel turf.",
  courtFeel: "How connected the shoe feels to the court.",
  support: "Lateral support for split-steps and cuts.",
  assessment: "How we assess this product.",
  generic: "The product under review.",
};

function productVisuals(
  images: MediaAsset[],
  hero?: MediaAsset,
): SectionVisual[] {
  const seen = new Set<string>();
  const out: SectionVisual[] = [];
  for (const img of [...(hero ? [hero] : []), ...images]) {
    if (!img?.src || seen.has(img.src)) continue;
    seen.add(img.src);
    out.push({
      src: img.src,
      alt: img.alt || "Product under review",
    });
  }
  return out;
}

function sportFolderForFamily(family: CategoryFamily): string {
  if (family === "racket") return "padel";
  if (family === "watches") return "watches";
  if (family === "fitness") return "home";
  return "running";
}

/** Prefer hero path sport folder when it differs from category guess. */
function sportFoldersToSearch(
  family: CategoryFamily,
  heroSrc?: string,
): string[] {
  const primary = sportFolderForFamily(family);
  const fromHero = heroSrc?.match(/^\/images\/([^/]+)\//)?.[1];
  const folders = [primary];
  if (fromHero && fromHero !== primary) folders.push(fromHero);
  return folders;
}

/** Topic aliases when a dedicated file is missing (still unique per src). */
const TOPIC_FILE_ALIASES: Partial<Record<TopicKey, TopicKey[]>> = {
  outsole: ["grip"],
  grip: ["outsole"],
  upper: ["fit"],
  ride: ["performance", "fit"],
  performance: ["tech", "overview"],
  // assessment has its own file; do not alias to specs (already used on Key specs)
  generic: ["overview"],
  construction: ["tech", "specs"],
  shape: ["specs", "overview"],
  power: ["performance", "overview"],
  control: ["performance", "overview"],
  sweetspot: ["fit", "overview"],
  maneuverability: ["fit", "performance"],
  comfort: ["fit"],
  spin: ["grip", "performance"],
  defense: ["performance", "usecase"],
  net: ["performance", "fit"],
  attack: ["performance", "strengths"],
  serve: ["performance", "usecase"],
  methodology: ["assessment"],
  sources: ["assessment", "specs"],
  traction: ["grip", "outsole"],
  courtFeel: ["ride", "performance"],
  support: ["stability", "fit"],
};

function productSectionFileVisual(
  productSlug: string,
  sportFolders: string[],
  topic: TopicKey,
  caption?: string,
  used?: Set<string>,
): SectionVisual | undefined {
  const topics = [topic, ...(TOPIC_FILE_ALIASES[topic] ?? [])];
  for (const sportFolder of sportFolders) {
    for (const t of topics) {
      for (const ext of SECTION_IMAGE_EXTS) {
        const abs = path.join(
          process.cwd(),
          "public",
          "images",
          sportFolder,
          "products",
          productSlug,
          "sections",
          `${t}${ext}`,
        );
        if (!existsSync(abs)) continue;
        const src = `/images/${sportFolder}/products/${productSlug}/sections/${t}${ext}`;
        if (used?.has(src)) continue;
        return {
          src,
          alt: `${productSlug.replace(/-/g, " ")} — ${t}`,
          caption,
        };
      }
    }
  }
  return undefined;
}

function shouldSkipSectionImage(id: string, heading: string): boolean {
  const hay = `${id} ${heading}`.toLowerCase();
  return /buying checklist|before you buy|decision guide|who should|best for|not ideal|alternatives|comparisons|\bweaknesses\b/.test(hay);
}

/**
 * Attach images to each editorial section.
 *
 * Product reviews:
 * - Prefer unique generated section assets under
 *   /images/<sport>/products/<slug>/sections/<topic>.*
 * - Then unused product gallery images (never the same src twice)
 * - Never stock of other brands; omit rather than duplicate
 */
export function resolveReviewSectionVisuals(
  sections: ContentSection[],
  options?: {
    productHero?: MediaAsset;
    productImages?: MediaAsset[];
    productSlug?: string;
    categoryId?: string;
    reviewId?: string;
  },
): ContentSection[] {
  const used = new Set<string>();
  const family = categoryFamily(options?.categoryId);
  const seed = hashSeed(options?.reviewId ?? options?.categoryId ?? "kit");
  const familyPool = poolForFamily(family);
  const ownProduct = productVisuals(
    options?.productImages ?? [],
    options?.productHero,
  );
  const productSlug = options?.productSlug;
  const sportFolders = sportFoldersToSearch(family, options?.productHero?.src);
  const isProductReview = ownProduct.length > 0 || Boolean(productSlug);

  return sections.map((section, index) => {
    if (shouldSkipSectionImage(section.id, section.heading)) {
      return section;
    }

    const topic = topicFromSection(section.id, section.heading);
    const caption = TOPIC_CAPTIONS[topic] ?? TOPIC_CAPTIONS.generic;

    if (isProductReview) {
      // Dedicated product section files always win over seed stock / hero stamps.
      if (productSlug) {
        const sectionFile = productSectionFileVisual(
          productSlug,
          sportFolders,
          topic,
          caption,
          used,
        );
        if (sectionFile) {
          used.add(sectionFile.src);
          return { ...section, image: sectionFile };
        }
      }

      // Keep a pre-attached image only when it is this product's own media
      // and not already used (never keep other-brand stock or hero stamps).
      if (section.image?.src && !used.has(section.image.src)) {
        const src = section.image.src;
        const ownSection =
          Boolean(productSlug) &&
          src.includes(`/products/${productSlug}/sections/`);
        const ownGallery = ownProduct.some((v) => v.src === src);
        const isHero = options?.productHero?.src === src;
        if ((ownSection || ownGallery) && !isHero) {
          used.add(src);
          return section;
        }
      }

      // Additional catalog gallery shots only (never recycle the hero).
      const galleryExtras = ownProduct.slice(1);
      const unusedExtra = galleryExtras.find((v) => !used.has(v.src));
      if (unusedExtra) {
        used.add(unusedExtra.src);
        return {
          ...section,
          image: {
            src: unusedExtra.src,
            alt: unusedExtra.alt,
            caption,
          },
        };
      }

      // Prefer empty over duplicate, hero stamp, or wrong-brand stock.
      return { ...section, image: undefined };
    }

    // Non-product / editorial pages may keep or pick from the family pool.
    if (section.image?.src && !used.has(section.image.src)) {
      used.add(section.image.src);
      return section;
    }

    let visual = pickUnused(
      candidateList(topic, family, seed + index * 17),
      used,
    );

    if (!visual) {
      visual = pickUnused(rotatePool(familyPool, seed + index), used);
    }

    if (!visual) return section;

    used.add(visual.src);
    return { ...section, image: visual };
  });
}

/**
 * Visual for the “How we wrote this review” block.
 * Prefer the product’s own assessment section photo; never stamp racket art
 * onto watches/shoes via the mislabeled home “how to choose” filler.
 */
export function assessmentVisual(input?: {
  seedInput?: string;
  productSlug?: string;
  categoryId?: string;
  heroSrc?: string;
}): SectionVisual {
  const seedInput = input?.seedInput ?? "assessment";
  const family = categoryFamily(input?.categoryId);
  const caption = TOPIC_CAPTIONS.assessment;

  if (input?.productSlug) {
    const fromProduct = productSectionFileVisual(
      input.productSlug,
      sportFoldersToSearch(family, input.heroSrc),
      "assessment",
      caption,
    );
    if (fromProduct) return fromProduct;
  }

  const pool = candidateList("assessment", family, hashSeed(seedInput));
  return (
    pool[0] ??
    candidateList("assessment", "general", hashSeed(seedInput))[0] ??
    MASTER_POOL.find((v) => v.src.includes("review-research-assessment")) ??
    MASTER_POOL[0]!
  );
}
