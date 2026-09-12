/**
 * Internal research map for unique Expert Research synthesis.
 * Not public AI language — drives product-specific review questions.
 */

import type { Product, SpecValue } from "@/domain/products/types";

export type ProductQuestionCompetitor = {
  id: string;
  name: string;
  chooseThisIf: string;
  chooseCompetitorIf: string;
};

export type ProductQuestionMap = {
  intendedJob: string;
  generationContext: string;
  audience: string;
  differentiators: string[];
  strongestTraits: string[];
  compromises: string[];
  competitors: ProductQuestionCompetitor[];
  decisionSpecs: string[];
  categoryQuestions: string[];
  researchReady: boolean;
  researchGaps: string[];
};

type ProductWithPositioning = Product & { positioning?: string };

function fmtSpec(v: SpecValue | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "object" && !Array.isArray(v)) {
    const r = v as { min?: number; max?: number };
    if (r.min != null && r.max != null) return `${r.min}–${r.max}`;
    if (r.min != null) return String(r.min);
    if (r.max != null) return String(r.max);
    return null;
  }
  if (Array.isArray(v)) {
    const joined = v.filter((x) => x != null && x !== "").join(", ");
    return joined || null;
  }
  if (typeof v === "boolean") return v ? "yes" : "no";
  const s = String(v).trim();
  return s.length ? s : null;
}

function meaningfulSpecCount(product: Product): number {
  let n = 0;
  for (const v of Object.values(product.specifications ?? {})) {
    if (fmtSpec(v) != null) n++;
  }
  return n;
}

function positioningOf(product: Product): string {
  const p = product as ProductWithPositioning;
  return (p.positioning ?? "").trim();
}

function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function detectShoeRole(product: Product): string {
  const pos = positioningOf(product).toLowerCase();
  const desc = `${product.shortDescription} ${product.verdict ?? ""}`.toLowerCase();
  const subs = (product.subcategoryIds ?? []).join(" ").toLowerCase();
  const terrain = fmtSpec(product.specifications.terrain)?.toLowerCase() ?? "";
  const plate = fmtSpec(product.specifications.plate)?.toLowerCase() ?? "";
  const plateMat =
    fmtSpec(product.specifications.plateMaterial)?.toLowerCase() ?? "";
  const training =
    fmtSpec(product.specifications.trainingTypes)?.toLowerCase() ?? "";
  const hay = `${pos} ${desc} ${subs} ${terrain} ${plate} ${plateMat} ${training}`;

  if (/trail/.test(hay) && !/road.?to.?trail|road-to-trail/.test(hay)) {
    if (/race|ultra.?race|skyrunning/.test(hay)) return "race-trail shoe";
    return "trail shoe";
  }
  if (/road.?to.?trail|road-to-trail/.test(hay)) return "road-to-trail shoe";
  if (
    /carbon|energy.?rod|race shoe|supershoe|racing|marathon race|half and marathon/.test(
      hay,
    ) ||
    (plate === "yes" && /carbon/.test(plateMat)) ||
    /sub-race|sub-carbon/.test(subs)
  ) {
    return "carbon race shoe";
  }
  if (/stabil|gts|guide.?rail|j-frame|support/.test(hay)) {
    return "stability daily trainer";
  }
  if (/max.?cushion|recovery|soft daily|easy mile/.test(hay)) {
    return "max-cushion daily trainer";
  }
  if (
    /daily trainer|daily road|high-cushion neutral daily/.test(hay) ||
    pos.includes("daily")
  ) {
    return "daily trainer";
  }
  if (/tempo|speed.?day|nylon.?plate|uptempo/.test(hay)) return "tempo trainer";
  if (/daily|trainer/.test(hay)) return "daily trainer";
  if (pos) return pos;
  return "running shoe";
}

function detectWatchRole(product: Product): string {
  const pos = positioningOf(product).toLowerCase();
  const desc = product.shortDescription.toLowerCase();
  if (/triathlon|multisport/.test(`${pos} ${desc}`)) return "multisport GPS watch";
  if (/ultra|expedition|adventure/.test(`${pos} ${desc}`)) {
    return "adventure GPS watch";
  }
  if (/hrm|heart.?rate|chest strap|optical arm/.test(product.categoryId + desc)) {
    return "heart-rate monitor";
  }
  if (pos) return pos;
  return "GPS running watch";
}

function detectGenericRole(product: Product): string {
  const pos = positioningOf(product);
  if (pos) return pos;
  const clip = product.shortDescription.trim().replace(/\.$/, "");
  if (clip.length >= 12 && clip.length <= 80) return clip;
  return product.name;
}

function detectNutritionRole(product: Product): string {
  const carbs = fmtSpec(product.specifications.carbsPerServing);
  const caf = fmtSpec(product.specifications.caffeine);
  const cafAmt = fmtSpec(product.specifications.caffeineAmount);
  const sodium = fmtSpec(product.specifications.sodium);
  const type =
    fmtSpec(product.specifications.type) ??
    fmtSpec(product.specifications.format) ??
    "";
  const hay = `${product.name} ${product.shortDescription} ${type}`.toLowerCase();
  const carbBit = carbs != null ? `${carbs} g carbs/serving` : "carb dose not listed";
  const cafBit =
    cafAmt != null
      ? `${cafAmt} mg caffeine`
      : caf === "true" || caf === "yes"
        ? "caffeinated"
        : "no caffeine";
  const sodiumBit = sodium ? `${sodium} sodium` : null;

  if (
    /tablet|effervescent|zero.?cal|electrolyte tablet/.test(hay) ||
    (carbs != null && Number(carbs) <= 5 && /tablet|capsule/.test(hay))
  ) {
    return `electrolyte tablet/capsule (${carbBit}; ${cafBit}${sodiumBit ? `; ${sodiumBit}` : ""})`;
  }
  if (/chew|blok/.test(hay)) {
    return `energy chew (${carbBit}; ${cafBit})`;
  }
  if (/\bbar\b/.test(hay)) {
    return `chewable energy bar (${carbBit}; ${cafBit})`;
  }
  if (/drink mix|powder|isotonic drink|sports drink|hydration mix/.test(hay)) {
    return `carb/electrolyte drink mix (${carbBit}; ${cafBit}${sodiumBit ? `; ${sodiumBit}` : ""})`;
  }
  if (/hydrogel/.test(hay)) {
    return `hydrogel sachet (${carbBit}; ${cafBit})`;
  }
  if (/gel/.test(hay)) {
    return `energy gel (${carbBit}; ${cafBit})`;
  }
  return positioningOf(product) || `race / training fuel (${carbBit}; ${cafBit})`;
}

function detectCarryRole(product: Product): string {
  const cap =
    fmtSpec(product.specifications.capacity) ??
    fmtSpec(product.specifications.volume) ??
    fmtSpec(product.specifications.totalHydrationCapacity);
  const flasks = fmtSpec(product.specifications.includedFlasks);
  const hay = `${product.name} ${product.shortDescription}`.toLowerCase();
  if (/belt|waist/.test(hay) || /belt/i.test(product.categoryId)) {
    return cap
      ? `running waist belt / flask carry (${cap})`
      : "running waist belt";
  }
  if (/flask|softflask|bottle/.test(hay) || /hydration/i.test(product.categoryId)) {
    return cap
      ? `handheld / soft flask (${cap}${flasks ? `; ${flasks} flasks` : ""})`
      : "handheld hydration flask";
  }
  return cap
    ? `running pack / vest (${cap}${flasks ? `; ${flasks} flasks` : ""})`
    : positioningOf(product) || "running pack / vest";
}

function detectAudioRole(product: Product): string {
  const hay = `${product.name} ${product.shortDescription}`.toLowerCase();
  const battery = fmtSpec(product.specifications.batteryLife);
  const anc =
    fmtSpec(product.specifications.anc) ??
    fmtSpec(product.specifications.noiseCancelling);
  if (/bone.?conduc|open.?ear|openrun|openfit|opendot|wing/.test(hay)) {
    return `open-ear / bone-conduction run headphones${battery ? ` (${battery} battery)` : ""}`;
  }
  if (/airpods pro|anc|noise.?cancel/.test(hay) || anc === "true" || anc === "yes") {
    return `in-ear run headphones with isolation/ANC${battery ? ` (${battery} battery)` : ""}`;
  }
  return positioningOf(product) || `running headphones${battery ? ` (${battery} battery)` : ""}`;
}

function inferIntendedJob(product: Product): string {
  const cat = product.categoryId;
  if (cat === "cat-running-shoes") return detectShoeRole(product);
  if (cat === "cat-gps-watches" || cat === "cat-hrm" || /heart.?rate|hrm|watch/i.test(cat)) {
    return detectWatchRole(product);
  }
  if (/pack|vest|belt|hydration/i.test(cat)) return detectCarryRole(product);
  if (/sock/i.test(cat)) return positioningOf(product) || "running sock";
  if (/headphone|audio/i.test(cat)) return detectAudioRole(product);
  if (/clothing|apparel/i.test(cat)) {
    const type =
      fmtSpec(product.specifications.type) ??
      fmtSpec(product.specifications.garment);
    return type
      ? `running ${type}`
      : positioningOf(product) || "running apparel";
  }
  if (/sunglass|eyewear/i.test(cat)) {
    const lens =
      fmtSpec(product.specifications.lens) ??
      fmtSpec(product.specifications.lensType);
    return lens ? `running sunglasses (${lens} lens)` : "running sunglasses";
  }
  if (/light|headlamp/i.test(cat)) {
    const lumens = fmtSpec(product.specifications.lumens);
    return lumens
      ? `run light / headlamp (${lumens} lumens class)`
      : positioningOf(product) || "run light";
  }
  if (/nutrition|gel|fuel/i.test(cat)) return detectNutritionRole(product);
  if (/recovery/i.test(cat)) return positioningOf(product) || "recovery tool";
  if (/racket|padel|tennis|pickle|badminton|squash/i.test(cat)) {
    return positioningOf(product) || "racket";
  }
  if (/fitness|bench|dumbbell|rack|rower|treadmill|bike/i.test(cat)) {
    return positioningOf(product) || "fitness equipment";
  }
  return detectGenericRole(product);
}

function inferAudience(product: Product, job: string): string {
  const levels = product.experienceLevels ?? [];
  const levelBit =
    levels.includes("elite") || levels.includes("advanced")
      ? "intermediate-to-advanced athletes who already know their session mix"
      : levels.includes("beginner")
        ? "beginners through intermediates building consistent weekly volume"
        : "athletes matching this catalog role rather than buying on brand alone";

  if (/race/.test(job) && !/trail/.test(job)) {
    return `Goal-race road runners chasing half/marathon efficiency — ${levelBit}`;
  }
  if (/trail/.test(job)) {
    return `Trail runners who need mixed-terrain protection more than road softness — ${levelBit}`;
  }
  if (/stability/.test(job)) {
    return `Road runners who want guided support on easy and long days — ${levelBit}`;
  }
  if (/watch|hrm|heart/.test(job)) {
    return `Endurance athletes shopping tracking capability for their training load — ${levelBit}`;
  }
  return `${levelBit} whose week aligns with a ${job}`;
}

function buildDecisionSpecs(product: Product): string[] {
  const keys = [
    "weight",
    "drop",
    "heelStack",
    "forefootStack",
    "midsole",
    "plate",
    "plateMaterial",
    "cushionLevel",
    "cushionFeel",
    "stability",
    "terrain",
    "upper",
    "outsole",
    "widthOptions",
    "battery",
    "batteryLife",
    "gps",
    "display",
    "sensors",
    "waterResistance",
    "capacity",
    "volume",
    "totalHydrationCapacity",
    "includedFlasks",
    "carbsPerServing",
    "caffeine",
    "caffeineAmount",
    "sodium",
    "servingSize",
    "flavour",
    "lumens",
    "beam",
    "runtime",
    "batteryLife",
    "anc",
    "noiseCancelling",
    "driver",
    "fit",
    "lens",
    "lensType",
    "weightG",
    "shape",
    "balance",
    "core",
    "power",
    "control",
    "type",
    "format",
    "garment",
    "compression",
    "height",
    "cushioning",
  ];
  const out: string[] = [];
  for (const key of keys) {
    const raw = fmtSpec(product.specifications[key]);
    if (!raw) continue;
    out.push(`${key}: ${raw}`);
  }
  // Catch any other populated specs not in the priority list
  for (const [key, value] of Object.entries(product.specifications ?? {})) {
    if (keys.includes(key)) continue;
    const raw = fmtSpec(value);
    if (!raw) continue;
    if (out.length >= 14) break;
    out.push(`${key}: ${raw}`);
  }
  return out.slice(0, 14);
}

function categoryQuestionsFor(product: Product, job: string): string[] {
  const cat = product.categoryId;
  const name = product.fullName || product.name;

  if (cat === "cat-running-shoes") {
    const raceAware = /race/.test(job) && !/trail/.test(job);
    const trailAware = /trail/.test(job);
    return [
      `What job does ${name} actually own — ${job} — versus adjacent shoes in the same brand line?`,
      raceAware
        ? `Is the plate / midsole story aimed at race-day efficiency rather than soft easy miles?`
        : trailAware
          ? `How do protection, grip, and terrain rating support mixed dirt and rock versus road dailies?`
          : `How do stack, drop, and cushioning level support the stated ${job} role?`,
      `Which catalog strengths travel into real weekly planning, and which compromises block the wrong buyer?`,
      `When should a peer alternative win on fit, surface, or race-vs-daily intent?`,
      `Does generation ${product.generation ?? "current"} change the buying case versus prior models?`,
    ];
  }

  if (cat === "cat-gps-watches" || /watch/i.test(cat)) {
    return [
      `What training and navigation jobs does ${name} cover at its catalog tier?`,
      `Which battery, GNSS, and sensor specs matter for this athlete's longest sessions?`,
      `Where do ecosystem and recovery features justify the watch versus a simpler GPS?`,
      `Which peers are clearer picks when maps, battery, or simplicity matter more?`,
    ];
  }

  if (cat === "cat-hrm" || /hrm|heart.?rate/i.test(cat)) {
    return [
      `Is ${name} stronger as a chest, arm, or optical companion for hard intervals?`,
      `How do connection stability and battery claims affect multi-device weeks?`,
      `When is a watch-only HR path enough, and when does this monitor still win?`,
    ];
  }

  if (/pack|vest/i.test(cat)) {
    return [
      `What carry capacity and bounce control does ${name} target?`,
      `How do hydration access and fit range compare with peer vests?`,
      `When is a belt or larger pack a better tool than this vest?`,
    ];
  }

  if (/sock/i.test(cat)) {
    return [
      `What cushioning and height profile is ${name} built for?`,
      `How do blister-risk and durability claims sit against catalog peers?`,
    ];
  }

  if (/headphone|audio/i.test(cat)) {
    return [
      `Does ${name} prioritize secure fit, awareness, or battery for run use?`,
      `When do bone-conduction or deeper ANC peers fit better?`,
    ];
  }

  if (/clothing|apparel/i.test(cat)) {
    return [
      `What climate and session length is ${name} cut for?`,
      `Which fabric and fit traits differentiate it from generic athletic apparel?`,
    ];
  }

  if (/nutrition|gel|fuel/i.test(cat)) {
    return [
      `What carb format and intensity window does ${name} serve?`,
      `When do chewables or bottles beat this fuel format?`,
    ];
  }

  if (/recovery/i.test(cat)) {
    return [
      `What recovery job does ${name} claim versus passive rest?`,
      `Which peers cover the same need at a different intensity or price band?`,
    ];
  }

  if (/racket|padel|tennis|pickle|badminton|squash/i.test(cat)) {
    return [
      `Is ${name} biased toward power, control, or forgiveness on paper?`,
      `How do weight, balance, and shape steer the right player level?`,
      `When should a softer or more head-heavy peer win?`,
    ];
  }

  if (/fitness|bench|dumbbell|rack|rower|treadmill|bike/i.test(cat)) {
    return [
      `What home or gym session is ${name} sized for?`,
      `Which load, footprint, and durability specs gate the purchase?`,
      `When is a simpler or heavier-duty peer the clearer buy?`,
    ];
  }

  return [
    `What primary job does ${name} fill in its category?`,
    `Which catalog strengths and compromises should decide the purchase?`,
    `Which alternatives win when priorities shift?`,
  ];
}

function buildCompetitors(
  product: Product,
  alts: Product[],
  job: string,
): ProductQuestionCompetitor[] {
  const strengths = product.strengths.filter((s) => s.trim().length >= 4);
  const weaknesses = product.weaknesses.filter((s) => s.trim().length >= 4);
  const thisTrait = strengths[0] ?? product.shortDescription;
  const thisLimit = weaknesses[0] ?? `you need a different specialty than a ${job}`;

  return alts.slice(0, 5).map((alt) => {
    const altJob = inferIntendedJob(alt);
    return {
      id: alt.id,
      name: alt.fullName || alt.name,
      chooseThisIf: `your week is mostly a ${job} and ${lowerFirst(thisTrait)} is the priority that should win the cart`,
      chooseCompetitorIf: `you need a ${altJob} more than a ${job}, or ${lowerFirst(thisLimit)} would show up on most sessions in ${product.name}`,
    };
  });
}

function buildDifferentiators(product: Product, job: string): string[] {
  const out: string[] = [];
  const midsole = fmtSpec(product.specifications.midsole);
  const plateMat = fmtSpec(product.specifications.plateMaterial);
  const terrain = fmtSpec(product.specifications.terrain);
  const stability = fmtSpec(product.specifications.stability);
  const battery = fmtSpec(product.specifications.battery) ??
    fmtSpec(product.specifications.batteryLife);

  if (midsole) out.push(`Midsole story: ${midsole}`);
  if (plateMat && plateMat !== "none" && plateMat !== "no") {
    out.push(`Plate material: ${plateMat}`);
  }
  if (terrain) out.push(`Terrain focus: ${terrain}`);
  if (stability && stability !== "neutral") out.push(`Stability: ${stability}`);
  if (battery) out.push(`Battery: ${battery}`);
  const carbs = fmtSpec(product.specifications.carbsPerServing);
  const cafAmt = fmtSpec(product.specifications.caffeineAmount);
  const sodium = fmtSpec(product.specifications.sodium);
  const lumens = fmtSpec(product.specifications.lumens);
  const cap = fmtSpec(product.specifications.capacity);
  const lens =
    fmtSpec(product.specifications.lens) ??
    fmtSpec(product.specifications.lensType);
  if (carbs) out.push(`Carbs per serving: ${carbs} g`);
  if (cafAmt) out.push(`Caffeine: ${cafAmt} mg`);
  if (sodium) out.push(`Sodium: ${sodium}`);
  if (lumens) out.push(`Output: ${lumens} lumens`);
  if (cap) out.push(`Carry/volume: ${cap}`);
  if (lens) out.push(`Lens: ${lens}`);
  if (product.generation) out.push(`Generation ${product.generation} in family line`);
  out.push(`Catalog role: ${job}`);
  for (const s of product.strengths.slice(0, 3)) {
    if (!out.some((d) => d.toLowerCase().includes(s.toLowerCase().slice(0, 18)))) {
      out.push(s);
    }
  }
  return [...new Set(out)].slice(0, 8);
}

/**
 * Build an internal question map used to synthesize unique Expert Research reviews.
 */
export function buildProductQuestionMap(
  product: Product,
  alts: Product[],
): ProductQuestionMap {
  const job = inferIntendedJob(product);
  const short = product.shortDescription?.trim() ?? "";
  const strengths = (product.strengths ?? []).map((s) => s.trim()).filter(Boolean);
  const weaknesses = (product.weaknesses ?? []).map((s) => s.trim()).filter(Boolean);
  const specCount = meaningfulSpecCount(product);
  const thinSpecs = specCount < 3;

  const researchGaps: string[] = [];
  if (!short) researchGaps.push("missing_shortDescription");
  if (strengths.length < 2) researchGaps.push("few_strengths");
  if (weaknesses.length < 1 && thinSpecs) {
    researchGaps.push("no_weaknesses_and_thin_specs");
  } else if (weaknesses.length < 1) {
    researchGaps.push("no_weaknesses");
  }
  if (thinSpecs) researchGaps.push("thin_specs");
  if (alts.length < 1 && (product.alternativeProductIds?.length ?? 0) < 1) {
    researchGaps.push("no_alts");
  }

  const researchReady =
    Boolean(short) &&
    strengths.length >= 2 &&
    !(weaknesses.length < 1 && thinSpecs);

  const generationContext = product.generation
    ? `${product.fullName || product.name} sits at generation ${product.generation} — treat prior gens as clearance/alternate geometry, not identical tools.`
    : `${product.fullName || product.name} is assessed as the current catalog reference for its ${job} role.`;

  return {
    intendedJob: job,
    generationContext,
    audience: inferAudience(product, job),
    differentiators: buildDifferentiators(product, job),
    strongestTraits: strengths.slice(0, 6),
    compromises: weaknesses.slice(0, 6),
    competitors: buildCompetitors(product, alts, job),
    decisionSpecs: buildDecisionSpecs(product),
    categoryQuestions: categoryQuestionsFor(product, job),
    researchReady,
    researchGaps: researchReady
      ? researchGaps.filter((g) => g === "no_weaknesses" || g === "no_alts" || g === "thin_specs")
      : researchGaps,
  };
}
