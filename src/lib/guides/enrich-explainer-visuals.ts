/**
 * Auto-attach educational visuals and “look for” checklists to explainer blocks.
 * Each section gets a unique visual within a guide — never reuse the same image,
 * and never stamp shoe concept art onto non-shoe guides.
 */

import type {
  ExplainerBlock,
  ExplainerComparisonTableBlock,
  ExplainerDiagramVariant,
  ExplainerFactorCardsBlock,
  ExplainerSectionDiagram,
} from "@/lib/guides/explainer-blocks";

const SKIP_VISUAL_TYPES = new Set([
  "callout",
  "cta",
  "look-for",
  "diagram",
  "product-examples",
  "product-comparison",
]);

type VisualFamily =
  | "shoes"
  | "watches"
  | "hrm"
  | "hydration"
  | "apparel"
  | "fuel"
  | "recovery"
  | "fitness"
  | "padel"
  | "general";

const PADEL_VARIANTS = new Set<ExplainerDiagramVariant>([
  "padel-racket-shapes",
  "padel-racket-balance",
  "padel-racket-weight",
  "padel-bag-forms",
  "padel-grip-vs-overgrip",
  "padel-ball-types",
  "padel-pressurizer",
  "padel-decision-steps",
  "padel-shoe-outsole",
]);

const SHOE_VARIANTS = new Set<ExplainerDiagramVariant>([
  "comparing-shoes",
  "decision-steps",
  "mistakes-notes",
  "product-shortlist",
  "easy-miles",
  "tempo-session",
  "stack-measurement",
  "foam-compression",
  "foam-soft-vs-firm",
  "base-width",
  "stability-guidance",
  "trail-lugs",
  "road-outsole",
  "rotation-week",
  "plate-stiffness",
  "plate-flex",
  "drop-buckets",
  "drop-feel",
  "drop-factors",
  "drop-geometry-matrix",
  "drop-tradeoffs",
  "drop-transition",
  "drop-decision",
  "drop-mistakes",
  "heel-to-toe-drop",
  "cushion-stack",
  "carbon-vs-nylon",
  "rocker-geometry",
  "shoe-rotation",
  "daily-trainer",
  "road-trail-surfaces",
  "road-vs-trail",
  "neutral-vs-stability",
  "cross-training-shoe",
  "platform-width",
]);

const FAMILY_FALLBACK_POOL: Record<VisualFamily, ExplainerDiagramVariant[]> = {
  shoes: [
    "comparing-shoes",
    "decision-steps",
    "mistakes-notes",
    "product-shortlist",
    "easy-miles",
    "tempo-session",
    "daily-trainer",
    "cushion-stack",
    "shoe-rotation",
    "road-trail-surfaces",
  ],
  watches: [
    "gps-watch-run",
    "gps-signal",
    "amoled-vs-mip",
    "breadcrumb-vs-maps",
    "phone-vs-watch",
  ],
  hrm: ["hrm-chest-vs-wrist", "gps-watch-run"],
  hydration: [
    "vest-vs-belt",
    "hydration-vest",
    "running-belt",
    "soft-flask",
    "handheld-bottle",
  ],
  apparel: [
    "running-jacket",
    "running-socks",
    "running-headlamp",
    "open-ear-vs-inear",
  ],
  fuel: ["fuel-gels", "running-belt", "soft-flask"],
  recovery: ["massage-gun", "recovery-sandal"],
  fitness: ["cross-training-shoe", "gps-watch-run"],
  /** Padel-only teaching diagrams — never inherit running shoe concept art. */
  padel: [
    "padel-racket-shapes",
    "padel-racket-balance",
    "padel-racket-weight",
    "padel-bag-forms",
    "padel-grip-vs-overgrip",
    "padel-ball-types",
    "padel-pressurizer",
    "padel-decision-steps",
    "padel-shoe-outsole",
  ],
  general: [
    "gps-watch-run",
    "hydration-vest",
    "running-belt",
    "hrm-chest-vs-wrist",
    "open-ear-vs-inear",
  ],
};

export function guideVisualFamily(slug: string): VisualFamily {
  const s = slug.toLowerCase();
  // Padel first — "shoe" / "drop" tokens in padel slugs must not inherit running art
  if (
    /padel|round-vs-teardrop|teardrop-vs-diamond|carbon-vs-fiberglass-padel|soft-vs-hard-padel/.test(
      s,
    )
  ) {
    return "padel";
  }
  if (
    /heart-rate|hrm|optical-wrist|chest-strap|verity|tickr/.test(s)
  ) {
    return "hrm";
  }
  if (
    /watch|gps|gnss|multi-band|amoled|mip|maps-navigation|battery-life|beginner-vs-advanced-running-watch/.test(
      s,
    )
  ) {
    return "watches";
  }
  // Fuel before hydration — "carry-fuel" / "gels" must not inherit vest art
  if (/gel|chew|drink-mix|caffeine|nutrition|fuel/.test(s)) {
    return "fuel";
  }
  if (
    /hydrat|vest|belt|flask|bladder|handheld|exoshot|soft-flask/.test(s)
  ) {
    return "hydration";
  }
  if (
    /sock|jacket|headlamp|headphone|earbuds|apparel|layering|hot-weather|winter-layer/.test(
      s,
    )
  ) {
    return "apparel";
  }
  if (/massage|foam-roll|recovery|sandal/.test(s)) {
    return "recovery";
  }
  if (/trail-race|race-kit|mandatory.?kit/.test(s)) {
    return "hydration";
  }
  if (/hyrox|gym|cross-train|training-shoe|fitness|metcon/.test(s)) {
    return "fitness";
  }
  // Shoe guides — require shoe-ish tokens (NOT bare "running")
  if (
    /shoe|trainer|cushion|drop|stability|plate|rotation|road-vs-trail|daily-trainer|terminology|carbon|nylon|peregrine|ghost|pegasus/.test(
      s,
    )
  ) {
    return "shoes";
  }
  return "general";
}

function visual(
  variant: ExplainerDiagramVariant,
  caption: string,
): ExplainerSectionDiagram {
  return { variant, caption };
}

/**
 * Ranked candidate visuals for a section. First unused candidate wins.
 * Section-role matches come before guide-topic defaults.
 */
export function resolveSectionVisualCandidates(
  slug: string,
  title: string,
  blockId = "",
  blockType = "",
): ExplainerSectionDiagram[] {
  const family = guideVisualFamily(slug);
  const hay = `${slug} ${title} ${blockId} ${blockType}`.toLowerCase();
  const out: ExplainerSectionDiagram[] = [];
  const push = (variant: ExplainerDiagramVariant, caption: string) => {
    if (family === "padel") {
      if (!PADEL_VARIANTS.has(variant)) return;
    } else if (PADEL_VARIANTS.has(variant)) {
      return;
    } else if (family !== "shoes" && SHOE_VARIANTS.has(variant)) {
      return;
    }
    if (!out.some((v) => v.variant === variant)) {
      out.push(visual(variant, caption));
    }
  };

  // ── Section-role matches ───────────────────────────────────────────────
  if (
    blockType === "mistakes" ||
    /\bmistake|\bmyth\b|common error|don.?t\b/.test(hay)
  ) {
    if (family === "shoes") {
      push(
        "drop-mistakes",
        "Common mistakes usually come from treating one number as a prescription.",
      );
      push(
        "mistakes-notes",
        "Avoid overnight geometry leaps and single-metric shopping.",
      );
    } else if (family === "hydration") {
      push(
        "vest-vs-belt",
        "The usual mistake is sizing carry from distance alone instead of load and support.",
      );
    } else if (family === "watches") {
      push(
        "gps-watch-run",
        "Overbuying unused menus is a common watch mistake — start from weekly sessions.",
      );
    } else if (family === "hrm") {
      push(
        "hrm-chest-vs-wrist",
        "Fit and connection mistakes create bad data faster than sensor class debates.",
      );
    } else if (family === "apparel") {
      push(
        "running-socks",
        "Debuting untested apparel on race day is a classic avoidable mistake.",
      );
    } else if (family === "recovery") {
      push(
        "massage-gun",
        "Treating recovery tools as medical treatment is the common overclaim.",
      );
    } else if (family === "fuel") {
      push(
        "fuel-gels",
        "Unrehearsed fuel plans on race day are a frequent GI and energy mistake.",
      );
    } else if (family === "padel") {
      push(
        "padel-decision-steps",
        "Common padel buying mistakes: copying pro diamonds, ignoring balance, or shopping one spec in isolation.",
      );
    }
  }

  if (
    blockType === "decision-flow" ||
    /\bdecision\b|how to choose|choose next|decision flow/.test(hay)
  ) {
    if (family === "shoes") {
      push(
        "drop-decision",
        "Decide from your current shoe, the full geometry, and easy test miles.",
      );
      push(
        "decision-steps",
        "Measure what you have, shortlist by job, then verify on easy runs.",
      );
      push(
        "comparing-shoes",
        "Compare complete ride systems, not a single spec in isolation.",
      );
    } else if (family === "hydration") {
      push(
        "vest-vs-belt",
        "Choose carry from load, refill access and stability — not a fixed race distance.",
      );
      push(
        "hydration-vest",
        "Size capacity for unsupported time and mandatory kit, then confirm fit loaded.",
      );
    } else if (family === "watches") {
      push(
        "gps-watch-run",
        "Choose watch depth from the sessions and features you will open weekly.",
      );
      push(
        "phone-vs-watch",
        "A phone records; a watch keeps pace and controls glanceable on the wrist.",
      );
    } else if (family === "hrm") {
      push(
        "hrm-chest-vs-wrist",
        "Match sensor method to interval response needs and comfort.",
      );
    } else if (family === "apparel") {
      push(
        "running-jacket",
        "Match apparel to weather and intensity — not a single marketing fabric claim.",
      );
    } else if (family === "padel") {
      push(
        "padel-decision-steps",
        "Lock the job, filter geometry, then verify two distinct roles — not a pro copy.",
      );
    }
  }

  if (
    blockType === "pros-tradeoffs" ||
    /trade-?off|give up|what you may gain/.test(hay)
  ) {
    if (family === "shoes") {
      push(
        "drop-tradeoffs",
        "Every geometry choice trades familiarity, feel and adaptation cost.",
      );
      push(
        "comparing-shoes",
        "Trade-offs show up when you hold two real options side by side.",
      );
    } else if (family === "hydration") {
      push(
        "vest-vs-belt",
        "Vests carry more with more coverage; belts stay lighter with less capacity.",
      );
    } else if (family === "watches") {
      push(
        "amoled-vs-mip",
        "Display and feature density trade against GPS battery in the real world.",
      );
    } else if (family === "padel") {
      push(
        "padel-racket-shapes",
        "Shape trades forgiveness against finishing reward — confirm with balance and weight.",
      );
    }
  }

  // Shoe-only geometry / foam topics
  if (family === "shoes") {
    if (/bucket|zero.?low.?medium.?high|kitletics drop/.test(hay)) {
      push(
        "drop-buckets",
        "Zero, low, medium and high are practical ranges — always check the actual millimetre value.",
      );
    }
    if (/rocker|roll.?forward|bevel/.test(hay)) {
      push(
        "rocker-geometry",
        "Rocker curvature can dominate how transition feels — often more than a few millimetres of listed drop.",
      );
    }
    if (
      blockType === "factor-cards" ||
      /what changes the meaning|key factors|factor card/.test(hay)
    ) {
      push(
        "drop-factors",
        "Read drop with stack, rocker, foam and flex — they change what the number means.",
      );
      push(
        "stack-measurement",
        "Verify published stack where you can; foam still compresses in use.",
      );
    }
    if (blockType === "matrix" || /geometry.?matrix|examples across/.test(hay)) {
      push(
        "drop-geometry-matrix",
        "Same drop can sit on very different rides — compare geometry packages, not labels alone.",
      );
      push(
        "product-shortlist",
        "Use catalog examples as illustrations of an approach, not a fixed ranking.",
      );
    }
    if (/how drop can|how.*can change the feel|load shifts/.test(hay)) {
      push(
        "drop-feel",
        "Geometry can shift where you notice load — runners still respond differently.",
      );
      push(
        "easy-miles",
        "Easy miles are where unfamiliar geometry usually shows up first.",
      );
    }
    if (/transition|adapt|gradual|change drop|introduce/.test(hay)) {
      push(
        "drop-transition",
        "Large drop changes are better introduced gradually with easy mileage first.",
      );
      push(
        "easy-miles",
        "Build familiarity on easy runs before race or long efforts.",
      );
    }
    if (
      (/heel.?to.?toe|what is.*drop|drop measure|zero.?drop|high.?drop|low.?drop/.test(
        hay,
      ) ||
        (/\bdrop\b/.test(hay) &&
          /shoe|running|measure|geometry|millimetre|mm\b|what is/.test(hay))) &&
      blockType !== "factor-cards" &&
      blockType !== "matrix" &&
      blockType !== "pros-tradeoffs" &&
      blockType !== "decision-flow" &&
      blockType !== "mistakes"
    ) {
      push(
        "heel-to-toe-drop",
        "Drop is heel stack minus forefoot stack. Equal heights = 0 mm; a raised heel relative to the forefoot raises drop.",
      );
      push(
        "stack-measurement",
        "Published figures help compare — foam still compresses while you run.",
      );
    }
    if (
      blockType === "use-case-cards" ||
      /catalog example|product example|illustrat/.test(hay)
    ) {
      push(
        "product-shortlist",
        "Examples show approaches in the catalog — verify fit and ride yourself.",
      );
      push(
        "comparing-shoes",
        "Hold candidates against the job you actually need.",
      );
    }
    if (/carbon|nylon.?plate|plate.?type|plated|super.?shoe/.test(hay)) {
      push(
        "carbon-vs-nylon",
        "Carbon plates favour stiffness and race propulsion; nylon plates usually flex more for training tolerance.",
      );
      push(
        "plate-stiffness",
        "Stiffer plates resist bend and redirect motion through the rocker.",
      );
      push(
        "plate-flex",
        "More flexible plates usually feel closer to a traditional trainer.",
      );
    }
    if (
      /neutral.?vs.?stability|stability.?vs.?neutral|what stability|stability shoe|medial|guidance/.test(
        hay,
      )
    ) {
      push(
        "neutral-vs-stability",
        "Neutral platforms emphasise freer geometry; stability designs add guidance structures and often a broader base.",
      );
      push(
        "stability-guidance",
        "Look for the actual guidance mechanism — rails, sidewalls or denser medial foam.",
      );
      push(
        "base-width",
        "Wider bases can feel more planted; narrower platforms often feel quicker.",
      );
    }
    if (/platform width|base width|flare/.test(hay)) {
      push(
        "base-width",
        "Wider bases can feel more planted; narrower platforms often feel quicker and freer.",
      );
      push(
        "platform-width",
        "Base width changes planted feel independent of cushion branding.",
      );
    }
    if (/road.?vs.?trail|trail.?vs.?road|terrain|outsole|lug/.test(hay)) {
      push(
        "road-vs-trail",
        "Road and trail shoes differ in outsole, protection and geometry — compare the job, not just cushion branding.",
      );
      push(
        "trail-lugs",
        "Trail lugs bite into dirt and rock — depth and spacing matter.",
      );
      push(
        "road-outsole",
        "Road rubber favours smooth pavement grip and lower weight.",
      );
      push(
        "road-trail-surfaces",
        "Match the shoe to the surface you actually run.",
      );
    }
    if (/cushion|foam|stack height|max cushion|firm foam|plush/.test(hay)) {
      push(
        "cushion-stack",
        "Cushion level changes impact and ground feel — verify stack, foam character and late-run behaviour.",
      );
      push(
        "foam-soft-vs-firm",
        "Soft and firm foams can share similar stack but feel unrelated.",
      );
      push(
        "foam-compression",
        "Listed stack is static — foam compresses under your weight and stride.",
      );
      push(
        "stack-measurement",
        "Compare heel and forefoot stack together with drop.",
      );
    }
    if (
      /rotation|second pair|multiple shoe|shoe closet|easy.?tempo.?race/.test(
        hay,
      )
    ) {
      push(
        "shoe-rotation",
        "A rotation splits jobs across shoes — daily miles, faster work, race day and trail when needed.",
      );
      push(
        "rotation-week",
        "Assign shoes to session types across the week instead of one pair for everything.",
      );
    }
    if (/daily.?trainer|easy.?miles|everyday.?shoe|recovery.?run/.test(hay)) {
      push(
        "daily-trainer",
        "Daily trainers are built for repeated easy and steady miles — durable foam, reliable fit, all-week use.",
      );
      push(
        "easy-miles",
        "Most training volume should feel sustainable, not race-sharp.",
      );
    }
    if (/tempo|speed.?work|interval/.test(hay)) {
      push(
        "tempo-session",
        "Faster sessions often want snappier geometry than pure easy-mile shoes.",
      );
    }
  }

  // Non-shoe topic matches
  if (
    /amoled|mip|display type|display choice|screen type/.test(hay) &&
    family === "watches"
  ) {
    push(
      "amoled-vs-mip",
      "AMOLED prioritises contrast and graphics; MIP prioritises outdoor readability and daily battery.",
    );
  }
  if (
    /breadcrumb|offline map|full map|navigation depth|maps and navigation/.test(
      hay,
    )
  ) {
    push(
      "breadcrumb-vs-maps",
      "A breadcrumb is a line to follow. Full offline maps add surrounding context at junctions.",
    );
  }
  if (/multi-band|gnss|gps accuracy|gps signal|urban canyon/.test(hay)) {
    push(
      "gps-signal",
      "Open sky often looks fine on standard GNSS. Cities, forests and cliffs expose harder reception.",
    );
  }
  if (/phone vs|phone tracking|phone app.*watch|dedicated gps watch/.test(hay)) {
    push(
      "phone-vs-watch",
      "A phone records the run; a GPS watch keeps pace, laps and sensors glanceable on the wrist.",
    );
  }
  if (/open.?ear|in.?ear|bone.?conduc|headphone|earbuds/.test(hay)) {
    push(
      "open-ear-vs-inear",
      "Open-ear keeps ambient awareness; in-ear seals sound — pick for route safety and preference.",
    );
  }
  if (/chest strap|optical (arm|wrist)|heart.?rate|hrm/.test(hay)) {
    push(
      "hrm-chest-vs-wrist",
      "Chest straps favour consistent cardiac signal; wrist optical sensors trade convenience for more motion sensitivity.",
    );
  }
  if (/vest.?vs.?.*?belt|belt.?vs.?.*?vest|carry system/.test(hay)) {
    push(
      "vest-vs-belt",
      "Belts favour compact loads; vests distribute water, layers and mandatory kit across the torso.",
    );
  }
  if (/soft.?flask|bladder|reservoir/.test(hay) && !/hydration.?vest/.test(hay)) {
    push(
      "soft-flask",
      "Soft flasks make volume and refills easy to manage on the move.",
    );
    push(
      "hydration-vest",
      "Confirm how your vest mounts flasks or a bladder before committing.",
    );
  } else if (/hydration.?vest|front flask/.test(hay)) {
    push(
      "hydration-vest",
      "A vest spreads fluid and kit across the torso — confirm flask fit and bounce when loaded.",
    );
    push(
      "soft-flask",
      "Soft flasks make volume and refills easy to manage on the move.",
    );
  }
  if (/running.?belt|waist pack|flipbelt|spibelt/.test(hay)) {
    push(
      "running-belt",
      "A running belt keeps phone, keys and light fuel close with low coverage.",
    );
  }
  if (/handheld|hand.?bottle|exoshot|speeddraw/.test(hay)) {
    push(
      "handheld-bottle",
      "Handhelds suit simple fluid needs when one hand can stay occupied.",
    );
  }
  if (/headlamp|lumen|beam/.test(hay)) {
    push(
      "running-headlamp",
      "Beam shape, sustained output and bounce control matter more than peak lumen claims alone.",
    );
  }
  if (/sock/.test(hay)) {
    push(
      "running-socks",
      "Sock volume, seams and cushion zones change blister risk as much as shoe fit.",
    );
  }
  if (/jacket|shell|layering|wind|waterproof/.test(hay)) {
    push(
      "running-jacket",
      "Wind shells and waterproof layers solve different weather jobs — match intensity and rain.",
    );
  }
  if (/gel|chew|drink mix|caffeine|fuel/.test(hay) && family === "fuel") {
    push(
      "fuel-gels",
      "Rehearse fuel formats and access on long runs before race day.",
    );
  }
  if (/massage|percussion/.test(hay)) {
    push(
      "massage-gun",
      "Percussion tools are optional comfort adjuncts — not medical treatment.",
    );
  }
  if (/recovery.?sandal|oofos|post.?run footwear/.test(hay)) {
    push(
      "recovery-sandal",
      "Soft post-run footwear is about easy walking comfort after hard efforts.",
    );
  }
  if (/gps.?watch|running.?watch|wrist.?gps|watch battery|training metrics/.test(hay)) {
    push(
      "gps-watch-run",
      "A dedicated GPS watch keeps pace, distance and workout controls glanceable without digging for a phone.",
    );
  }
  if (/cross.?train|training shoe|metcon|gym shoe|hyrox shoe/.test(hay)) {
    push(
      "cross-training-shoe",
      "Training shoes prioritise a stable base for lifts and mixed sessions — different job than a road racing flat.",
    );
  }

  // ── Padel topic matches ────────────────────────────────────────────────
  if (family === "padel") {
    if (/shape|round|teardrop|diamond|silhouette|sweet.?spot/.test(hay)) {
      push(
        "padel-racket-shapes",
        "Round, teardrop and diamond shift sweet-spot height and forgiveness — not the whole racket decision.",
      );
    }
    if (/balance|head.?heavy|handle.?bias|maneuver/.test(hay)) {
      push(
        "padel-racket-balance",
        "Low vs high balance changes preparation speed and tip mass through the ball.",
      );
    }
    if (/weight|grams|lightweight|heavy frame/.test(hay)) {
      push(
        "padel-racket-weight",
        "Published weight bands matter before carbon marketing — feel them with balance.",
      );
    }
    if (/bag|paletero|backpack|thermo|compartment/.test(hay)) {
      push(
        "padel-bag-forms",
        "Paletero volume vs commute backpack — racket wells, thermo and shoe pocket first.",
      );
    }
    if (/grip|overgrip|tack|absorption|handle/.test(hay)) {
      push(
        "padel-grip-vs-overgrip",
        "Base grip is the foundation; overgrips are thin consumable refreshes.",
      );
    }
    if (/ball|pressur|can\b|bounce/.test(hay)) {
      push(
        "padel-ball-types",
        "Fresh pressurized cans vs tired training balls change bounce and timing.",
      );
      if (/pressur/.test(hay)) {
        push(
          "padel-pressurizer",
          "A pressurizer only earns its keep if you reseal balls between sessions.",
        );
      }
    }
    if (/shoe|outsole|herringbone|clay|court surface/.test(hay)) {
      push(
        "padel-shoe-outsole",
        "Match outsole pattern to dusty outdoor courts vs connected indoor hard courts.",
      );
    }
  }

  // ── Guide-topic soft defaults (only if nothing stronger matched) ────────
  if (out.length === 0) {
    const defaults = FAMILY_FALLBACK_POOL[family] ?? FAMILY_FALLBACK_POOL.general;
    const captions: Partial<Record<ExplainerDiagramVariant, string>> = {
      "daily-trainer":
        "Start from the job the shoe must do, then compare geometry and foam.",
      "heel-to-toe-drop":
        "Drop is a geometry measurement — read it with stack, rocker and foam.",
      "cushion-stack":
        "Stack and foam character change protection and ground feel.",
      "neutral-vs-stability":
        "Stability features guide the platform — confirm the mechanism.",
      "carbon-vs-nylon": "Plate material changes stiffness and ride.",
      "shoe-rotation":
        "Split roles across shoes when one pair cannot cover every session.",
      "road-trail-surfaces":
        "Road and trail demand different outsole, protection and geometry.",
      "gps-watch-run":
        "Choose watch features from the runs you actually do.",
      "hrm-chest-vs-wrist": "Pick heart-rate hardware from signal needs.",
      "open-ear-vs-inear":
        "Open-ear vs in-ear is about awareness and isolation.",
      "cross-training-shoe": "Match footwear to the session mix.",
      "vest-vs-belt":
        "Choose vest or belt from load, stability and what you need reachable.",
      "hydration-vest":
        "Size a vest for water plus kit, then confirm bounce when full.",
      "running-belt":
        "Belts suit compact loads — move up when bounce or capacity fails.",
      "soft-flask":
        "Soft flasks favour access and visible remaining volume.",
      "handheld-bottle":
        "Handhelds keep fluid simple when kit needs stay light.",
      "running-headlamp":
        "Match beam and runtime to the darkness you actually run in.",
      "running-socks":
        "Match sock volume and seams to the shoes you train and race in.",
      "running-jacket":
        "Pick shell protection for weather and session intensity.",
      "fuel-gels":
        "Rehearse fuel formats before you rely on them in a race.",
      "massage-gun":
        "Use recovery tools for comfort preference — not miracle claims.",
      "recovery-sandal":
        "Soft post-run footwear helps walking comfort after hard days.",
      "padel-racket-shapes":
        "Shape families shift sweet-spot height and forgiveness.",
      "padel-racket-balance":
        "Balance point changes how heavy the tip feels in preparation.",
      "padel-racket-weight":
        "Wearable weight bands before carbon marketing claims.",
      "padel-bag-forms":
        "Paletero vs backpack is a commute and capacity decision.",
      "padel-grip-vs-overgrip":
        "Replacement grips rebuild; overgrips refresh tack and moisture control.",
      "padel-ball-types":
        "Fresh cans vs tired balls change bounce expectations.",
      "padel-pressurizer":
        "Pressurizers extend usable pressure only with consistent use.",
      "padel-decision-steps":
        "Job → geometry → verify two roles.",
      "padel-shoe-outsole":
        "Outsole pattern should match your club’s court surface.",
    };
    for (const variant of defaults.slice(0, 3)) {
      push(
        variant,
        captions[variant] ??
          "Use this visual as context for the section — verify details against the product.",
      );
    }
  }

  return out;
}

/** @deprecated Prefer resolveSectionVisualCandidates + uniqueness in enrich. */
export function resolveSectionVisual(
  slug: string,
  title: string,
  blockId = "",
): ExplainerSectionDiagram | undefined {
  return resolveSectionVisualCandidates(slug, title, blockId)[0];
}

function pickUniqueVisual(
  candidates: ExplainerSectionDiagram[],
  used: Set<ExplainerDiagramVariant>,
  family: VisualFamily,
  captionFallback?: string,
): ExplainerSectionDiagram | undefined {
  for (const c of candidates) {
    if (!used.has(c.variant)) {
      used.add(c.variant);
      return c;
    }
  }
  const pool = FAMILY_FALLBACK_POOL[family] ?? FAMILY_FALLBACK_POOL.general;
  for (const variant of pool) {
    if (!used.has(variant)) {
      used.add(variant);
      return visual(
        variant,
        captionFallback ??
          "Use this visual as context for the section — verify the details against the product and your own runs.",
      );
    }
  }
  return undefined;
}

function attachDiagram<T extends ExplainerBlock>(
  block: T,
  slug: string,
  used: Set<ExplainerDiagramVariant>,
  family: VisualFamily,
): T {
  // Padel explainers: only padel teaching diagrams — never Running shoe/lifestyle art.
  if (family === "padel") {
    if (SKIP_VISUAL_TYPES.has(block.type)) return block;
    if (block.diagram) {
      if (!PADEL_VARIANTS.has(block.diagram.variant)) {
        const { diagram: _drop, ...rest } = block as T & {
          diagram?: ExplainerSectionDiagram;
        };
        return rest as T;
      }
      used.add(block.diagram.variant);
      return block;
    }
    const candidates = resolveSectionVisualCandidates(
      slug,
      block.title,
      block.id,
      block.type,
    );
    const resolved = pickUniqueVisual(
      candidates,
      used,
      family,
      "Use this visual as context for the decision — verify against published specs and feel.",
    );
    if (!resolved) return block;
    return { ...block, diagram: resolved };
  }
  if (SKIP_VISUAL_TYPES.has(block.type)) return block;
  if (block.diagram) {
    // Reject pre-set shoe diagrams on non-shoe guides
    if (family !== "shoes" && SHOE_VARIANTS.has(block.diagram.variant)) {
      const replacement = pickUniqueVisual([], used, family, block.diagram.caption);
      if (replacement) return { ...block, diagram: replacement };
      const { diagram: _drop, ...rest } = block as T & {
        diagram?: ExplainerSectionDiagram;
      };
      return rest as T;
    }
    used.add(block.diagram.variant);
    return block;
  }
  const candidates = resolveSectionVisualCandidates(
    slug,
    block.title,
    block.id,
    block.type,
  );
  const resolved = pickUniqueVisual(candidates, used, family);
  if (!resolved) return block;
  return { ...block, diagram: resolved };
}

/**
 * Ensures every explainer section has a useful, unique visual within the guide.
 */
export function enrichExplainerBlocksWithVisuals(
  blocks: ExplainerBlock[],
  slug: string,
): ExplainerBlock[] {
  const out: ExplainerBlock[] = [];
  const used = new Set<ExplainerDiagramVariant>();
  const family = guideVisualFamily(slug);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const nextBlock = blocks[i + 1];

    if (block.type === "comparison-table") {
      const next = attachDiagram({ ...block }, slug, used, family);
      if (!next.lookFor || next.lookFor.length === 0) {
        next.lookFor = lookForFromComparison(block);
      }
      out.push(next);
      continue;
    }

    if (block.type === "factor-cards") {
      out.push(attachDiagram(block, slug, used, family));
      const alreadyHasLookFor =
        nextBlock?.type === "look-for" ||
        out.some(
          (b) => b.type === "look-for" && b.id === `${block.id}-checklist`,
        );
      if (!alreadyHasLookFor && block.cards.length > 0) {
        out.push({
          id: `${block.id}-checklist`,
          type: "look-for",
          title: "What to look for in each factor",
          intro: lookForIntroForSlug(slug, family),
          panels: lookForFromFactors(block),
        });
      }
      continue;
    }

    out.push(attachDiagram(block, slug, used, family));
  }

  return out;
}

function lookForIntroForSlug(
  slug: string,
  family: ReturnType<typeof guideVisualFamily>,
): string {
  if (family === "padel") {
    return `Check each factor against your level, court surface and what fails in your current kit — not against pro silhouettes or weave marketing alone.`;
  }
  if (/foam|massage|recovery|sandal/.test(slug)) {
    return `Check each recovery factor against comfort, session length and what you will actually use after hard runs — not against clinic marketing claims.`;
  }
  if (/gel|fuel|caffeine|chew|drink-mix|sodium|carb|hydration-for|carry-fuel/.test(slug)) {
    return `Verify carbohydrate, fluid and caffeine numbers on the label against your tested race plan — gut tolerance beats theory.`;
  }
  if (/watch|battery|maps|navigation|gps|optical-wrist|hrm|heart-rate/.test(slug)) {
    return `Confirm battery, sensing method and controls against the sessions you log most — a feature you never open is dead weight on the wrist.`;
  }
  if (/vest|belt|flask|bladder|handheld|pack|hydration/.test(slug)) {
    return `Check capacity, bounce and access on a representative long run — pocket layout on a hangtag is not the same as access at race pace.`;
  }
  if (/jacket|apparel|layer|hot-weather|winter|sock/.test(slug)) {
    return `Test breathability and coverage in the weather you actually train in — lab waterproof ratings do not equal comfort on a hard tempo.`;
  }
  if (/padel|tennis|racket|grip|overgrip/.test(slug)) {
    return `Match shape, weight and handle feel to your current level — demo if you can, and ignore pro-player specs that fight your swing.`;
  }
  if (/hyrox|sled|rowerg|skierg/.test(slug)) {
    return `Score each factor against your stations, runway and run legs together — an isolated gym win can still lose the race system.`;
  }
  if (/rack|bench|dumbbell|treadmill|rowing|plate|pull-up|home-gym|space/.test(slug)) {
    return `Measure room, ceiling and neighbour constraints before extras — footprint and install reality beat brochure features.`;
  }
  if (/shoe|drop|cushion|plate|trainer|stability|trail|road/.test(slug)) {
    return `Use these checks on fit, ride and job match — verify on a short shakeout, not only on a shelf comparison.`;
  }
  if (family === "watches" || family === "hrm") {
    return `Turn each factor into something you can verify in settings, on a known route, or across one hard interval block.`;
  }
  return `Turn each factor into something you can verify for this guide’s job — on a spec sheet, in a shop, or in a short real-world test.`;
}

function lookForFromComparison(
  block: ExplainerComparisonTableBlock,
): NonNullable<ExplainerComparisonTableBlock["lookFor"]> {
  const optionCols = block.columns.slice(0, Math.min(2, block.columns.length));
  return optionCols.map((col, colIndex) => ({
    id: `${block.id}-look-${colIndex}`,
    title: col,
    checks: block.rows.slice(0, 4).map((row) => {
      const value = row.values[colIndex] ?? "—";
      return `${row.label}: ${value}`;
    }),
  }));
}

function lookForFromFactors(
  block: ExplainerFactorCardsBlock,
): {
  id: string;
  title: string;
  checks: string[];
}[] {
  return block.cards.slice(0, 4).map((card) => ({
    id: `${block.id}-look-${card.id}`,
    title: card.title,
    checks: [
      card.whatItIs,
      `Watch for: ${card.whatYouNotice}`,
      `Decision tip: ${card.howItChanges}`,
    ].map((c) => (c.length > 140 ? `${c.slice(0, 137)}…` : c)),
  }));
}
