/**
 * Unique Expert Research synthesis — product-specific review copy that does NOT
 * use shared longform scaffold templates (buildLongformSectionBody / REVIEW_SCAFFOLD_PHRASES).
 *
 * Uniqueness stamps are forbidden in public copy: no skuslug/skuid concatenations,
 * no "{value}{field}{slug}" tokens, and no "concatenated {field} token" sentences.
 */

import type { ContentSection, Review, ScoreBreakdownItem } from "@/domain/editorial/types";
import type { Product, SpecValue } from "@/domain/products/types";
import { EDITORIAL_DISCLOSURE } from "@/domain/review-agent/category-config";
import {
  buildProductQuestionMap,
  type ProductQuestionMap,
} from "@/domain/review-agent/product-question-map";
import { REVIEW_SCAFFOLD_PHRASES } from "@/domain/content-uniqueness/text";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import {
  assessConsumerCopyQuality,
  containsMachineTemplateCopy,
} from "@/lib/review/consumer-copy-quality";

export type UniqueExpertResearchResult =
  | Review
  | { status: "NEEDS_RESEARCH"; gaps: string[] };

export type SynthesizeUniqueExpertResearchOpts = {
  brandName?: string;
  alternatives: Product[];
  evidenceIds: string[];
  existing?: Review;
  /**
   * Fix 54 — still synthesize from slug/spec/strength signal when the
   * question-map researchReady bar is not met. Insufficient catalog still
   * returns NEEDS_RESEARCH (caller marks BLOCKED_EVIDENCE).
   */
  allowThinCatalog?: boolean;
};

type TopicKey =
  | "overview"
  | "specs"
  | "fit"
  | "cushioning"
  | "ride"
  | "stability"
  | "upper"
  | "grip"
  | "durability"
  | "tech"
  | "performance"
  | "strengths"
  | "tradeoffs"
  | "usecase"
  | "value";

type SectionBlueprint = { id: string; heading: string; topic: TopicKey };

const SHOE_BLUEPRINT: SectionBlueprint[] = [
  { id: "sec-overview", heading: "What it is", topic: "overview" },
  { id: "sec-verified-specs", heading: "Key specs", topic: "specs" },
  { id: "sec-fit", heading: "Fit & Comfort", topic: "fit" },
  { id: "sec-cushioning", heading: "Cushioning", topic: "cushioning" },
  { id: "sec-ride", heading: "Ride", topic: "ride" },
  { id: "sec-stability", heading: "Stability", topic: "stability" },
  { id: "sec-upper", heading: "Upper & lockdown", topic: "upper" },
  { id: "sec-grip", heading: "Grip & outsole", topic: "grip" },
  { id: "sec-durability", heading: "Durability", topic: "durability" },
  { id: "sec-strengths", heading: "Where it is strongest", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Trade-offs & limits", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who should buy", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
];

const WATCH_BLUEPRINT: SectionBlueprint[] = [
  { id: "sec-overview", heading: "What it is", topic: "overview" },
  { id: "sec-verified-specs", heading: "Key specs", topic: "specs" },
  { id: "sec-tech", heading: "Tracking & features", topic: "tech" },
  { id: "sec-performance", heading: "Everyday performance", topic: "performance" },
  { id: "sec-fit", heading: "On-wrist comfort", topic: "fit" },
  { id: "sec-strengths", heading: "Where it is strongest", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Trade-offs & limits", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who should buy", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
];

const GEAR_BLUEPRINT: SectionBlueprint[] = [
  { id: "sec-overview", heading: "What it is", topic: "overview" },
  { id: "sec-verified-specs", heading: "Key specs", topic: "specs" },
  { id: "sec-fit", heading: "Fit & daily use", topic: "fit" },
  { id: "sec-performance", heading: "Performance", topic: "performance" },
  { id: "sec-tech", heading: "Design & features", topic: "tech" },
  { id: "sec-durability", heading: "Durability", topic: "durability" },
  { id: "sec-strengths", heading: "Where it is strongest", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Trade-offs & limits", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who should buy", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
];

const RACKET_BLUEPRINT: SectionBlueprint[] = [
  { id: "sec-overview", heading: "What it is", topic: "overview" },
  { id: "sec-verified-specs", heading: "Key specs", topic: "specs" },
  { id: "sec-fit", heading: "Feel & handling", topic: "fit" },
  { id: "sec-performance", heading: "On-court performance", topic: "performance" },
  { id: "sec-tech", heading: "Construction & setup", topic: "tech" },
  { id: "sec-durability", heading: "Durability & upkeep", topic: "durability" },
  { id: "sec-strengths", heading: "Where it is strongest", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Trade-offs & limits", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who should buy", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
];

const FITNESS_BLUEPRINT: SectionBlueprint[] = [
  { id: "sec-overview", heading: "What it is", topic: "overview" },
  { id: "sec-verified-specs", heading: "Key specs", topic: "specs" },
  { id: "sec-fit", heading: "Setup & ergonomics", topic: "fit" },
  { id: "sec-performance", heading: "In-session performance", topic: "performance" },
  { id: "sec-tech", heading: "Build & materials", topic: "tech" },
  { id: "sec-durability", heading: "Durability & ownership", topic: "durability" },
  { id: "sec-strengths", heading: "Where it is strongest", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Trade-offs & limits", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who should buy", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
];

const FORBIDDEN_FIRST_HAND =
  /\b(we tested|our miles|hands-on|during our runs)\b/i;

const SUBSTANTIVE_TOPICS = new Set<TopicKey>([
  "overview",
  "specs",
  "fit",
  "cushioning",
  "ride",
  "stability",
  "upper",
  "grip",
  "durability",
  "tech",
  "performance",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
]);

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

function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function blueprintFor(categoryId: string): SectionBlueprint[] {
  if (categoryId === "cat-running-shoes") return SHOE_BLUEPRINT;
  if (
    categoryId === "cat-gps-watches" ||
    categoryId === "cat-hrm" ||
    /watch|hrm|heart.?rate/i.test(categoryId)
  ) {
    return WATCH_BLUEPRINT;
  }
  if (/racket|padel|tennis|pickle|badminton|squash/i.test(categoryId)) {
    return RACKET_BLUEPRINT;
  }
  if (
    /bench|dumbbell|power.?rack|weight.?plate|barbell|kettlebell|rower|treadmill|air.?bike|pull.?up|parallettes|ski.?erg|functional|gym|fitness/i.test(
      categoryId,
    )
  ) {
    return FITNESS_BLUEPRINT;
  }
  return GEAR_BLUEPRINT;
}

function isRaceRoadShoe(map: ProductQuestionMap): boolean {
  return /carbon race|race shoe/i.test(map.intendedJob) && !/trail/i.test(map.intendedJob);
}

function isTrailShoe(map: ProductQuestionMap): boolean {
  return /trail/i.test(map.intendedJob);
}

function allSpecPairs(product: Product): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(product.specifications ?? {})) {
    const raw = fmtSpec(value);
    if (raw) out.push({ key, value: raw });
  }
  return out;
}

function readableField(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .trim()
    .toLowerCase();
}

function specOf(product: Product, key: string): string | null {
  return fmtSpec(product.specifications?.[key]);
}

function specDumpSentence(product: Product): string {
  const pairs = allSpecPairs(product);
  const name = product.fullName || product.name;
  if (!pairs.length) {
    return `${name} does not publish a dense numeric sheet. Judge it from the stated role and the comparison set instead of invented numbers.`;
  }
  const preferred = [
    "weight",
    "drop",
    "heelStack",
    "forefootStack",
    "cushionFeel",
    "cushionLevel",
    "stability",
    "midsole",
    "plate",
    "plateMaterial",
    "terrain",
    "widthOptions",
    "batteryGps",
    "batteryLifeHours",
    "displayType",
    "weightGrams",
    "balance",
    "headSize",
  ];
  const picked = preferred
    .map((key) => {
      const value = specOf(product, key);
      return value ? `${readableField(key)}: ${value}` : null;
    })
    .filter((s): s is string => Boolean(s));
  const lines = picked.length ? picked : pairs.slice(0, 8).map((p) => `${readableField(p.key)}: ${p.value}`);
  return `${name} — published figures worth using as filters:\n${lines.map((l) => `• ${l}`).join("\n")}`;
}

function productOnlyFillers(ctx: Ctx): string[] {
  const name = displayName(ctx);
  const peer =
    ctx.map.competitors[0]?.name ?? ctx.alts[0]?.name ?? "a closer specialist";
  const extras = [
    `${name} is strongest when ${traitList(ctx.map.strongestTraits, 2)} is what you actually need most weeks.`,
    `I'd skip ${name} when ${traitList(ctx.map.compromises, 2)} is the usual pattern — ${peer} is the cleaner compare.`,
    ctx.product.shortDescription.trim(),
    ...(ctx.product.strengths ?? []).map((s) => s.trim()).filter((s) => s.length > 20),
    ...(ctx.product.weaknesses ?? []).map((s) => s.trim()).filter((s) => s.length > 20),
  ];
  return extras.filter(
    (s) => s && s.trim().length > 20 && !containsMachineTemplateCopy(s),
  );
}

function expandToMinWords(
  body: string,
  minWords: number,
  extras: string[],
): string {
  let out = body.trim();
  const pool = extras.filter((e) => e && e.trim().length > 20);
  let i = 0;
  while (countWords(out) < minWords && i < pool.length) {
    const next = pool[i]!.trim();
    if (!out.includes(next.slice(0, Math.min(48, next.length)))) {
      out = `${out}\n\n${next}`;
    }
    i++;
  }
  return out.trim();
}

function scrubScaffold(text: string): string {
  let out = text;
  for (const phrase of REVIEW_SCAFFOLD_PHRASES) {
    const re = new RegExp(
      phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    out = out.replace(re, "");
  }
  out = out.replace(FORBIDDEN_FIRST_HAND, "editorial research notes");
  out = out.replace(
    /when its main job matches most of your week(?:\s*[—–-]\s*not as a default for every session)?/gi,
    "when this role is most of your week",
  );
  out = out.replace(/\bSKU\b/g, "model");
  out = out.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

type Ctx = {
  product: Product;
  brandName: string;
  map: ProductQuestionMap;
  alts: Product[];
  evidenceIds: string[];
};

function displayName(ctx: Ctx): string {
  return ctx.product.fullName || `${ctx.brandName} ${ctx.product.name}`;
}

function traitList(items: string[], max = 3): string {
  const clean = items.map((s) => s.trim()).filter(Boolean).slice(0, max);
  if (!clean.length) return "its stated strengths";
  if (clean.length === 1) return lowerFirst(clean[0]!);
  if (clean.length === 2) return `${lowerFirst(clean[0]!)}, plus ${lowerFirst(clean[1]!)}`;
  return `${lowerFirst(clean[0]!)}, ${lowerFirst(clean[1]!)}, and ${lowerFirst(clean[2]!)}`;
}

function needBullet(weakness: string | undefined, fallback: string): string {
  const t = (weakness ?? "").trim().replace(/\.$/, "");
  if (!t) return `You need ${fallback}.`;
  if (/^replaced by /i.test(t)) {
    return `You need the model that replaced this one — ${t.replace(/^replaced by /i, "")}.`;
  }
  if (/stabil|guid|overpronat/i.test(t)) {
    return "You need added stability or guidance.";
  }
  if (/^not ideal (?:on|for) /i.test(t)) {
    return `You need a shoe that works ${t.replace(/^not ideal /i, "")}.`;
  }
  if (/^not a /i.test(t) || /^not an /i.test(t)) {
    return `You need ${t.replace(/^not /i, "")}.`;
  }
  if (/^not /i.test(t)) {
    return `You need to avoid this when ${lowerFirst(t)}.`;
  }
  return `You need to avoid ${lowerFirst(t)}.`;
}

function uniqueTopicBody(topic: TopicKey, ctx: Ctx): string {
  const p = ctx.product;
  const name = displayName(ctx);
  const role = ctx.map.intendedJob;
  const desc = p.shortDescription.trim();
  const strengths = traitList(ctx.map.strongestTraits, 2);
  const compromise = traitList(ctx.map.compromises, 2);
  const peer =
    ctx.map.competitors[0]?.name ?? ctx.alts[0]?.name ?? "a closer specialist";
  const weight = specOf(p, "weight");
  const drop = specOf(p, "drop");
  const heel = specOf(p, "heelStack");
  const fore = specOf(p, "forefootStack");
  const feel = specOf(p, "cushionFeel") ?? specOf(p, "rideCharacter");
  const stability = specOf(p, "stability");
  const midsole = specOf(p, "midsole");
  const terrain = specOf(p, "terrain");
  const widths = specOf(p, "widthOptions");
  const battery = specOf(p, "batteryGps") ?? specOf(p, "batteryLifeHours");
  const display = specOf(p, "displayType");
  const gen = p.generation ? ` Generation ${p.generation} is the current reference.` : "";

  const leads: Record<TopicKey, string> = {
    overview: `${name} is a ${role}. ${desc} I'd shortlist it for ${strengths}. Skip it if ${compromise} is most of your week — ${peer} is the cleaner starting compare.${gen}`,
    specs: specDumpSentence(p),
    fit: `Fit has to work for a ${role}, not as a one-size story. ${widths ? `Width options include ${widths}, which matters if volume is the weekly filter. ` : ""}${desc} If lockdown or volume is the reason you return shoes, try it on or buy somewhere returns are easy rather than hoping the last covers every foot.`,
    cushioning: `Cushioning is why ${name} sits in the ${role} lane — protection for the miles you actually run, not a lab score.${midsole ? ` The midsole story is ${midsole}.` : ""}${feel ? ` Published feel is ${feel}, so easy miles should stay ${feel} rather than dead-flat.` : ""}${heel || fore ? ` Stack is listed at ${[heel && `heel ${heel} mm`, fore && `forefoot ${fore} mm`].filter(Boolean).join(" and ")}; read that as ride height and protection, not a reason to ignore ${compromise}.` : ""}`,
    ride: `The ride is aimed at ${role} sessions, not a universal score.${feel ? ` It is listed as ${feel}, so the transition should feel like that on easy and steady paces.` : ""} ${drop ? `The ${drop} mm drop is a familiar ${isTrailShoe(ctx.map) ? "trail" : "road"} geometry — useful if you already train in that range, not a reason to switch if you wanted a more aggressive race rocker.` : ""} ${weight ? `At ${weight}, it should feel like a ${role} rather than a race spike.` : ""} I'd keep it when that ride matches most of your week; ${peer} is the better compare if you wanted a different snap or transition.`,
    stability: stability && /neutral/i.test(stability)
      ? `${name} is a neutral ${role}. That is a support story, not a medical claim — it will not replace a guidance shoe if you need support most days. ${desc} If you need added stability or guidance, open a dedicated option before stretching this last.`
      : `Stability should be read as the support story for ${role} miles${stability ? ` (published as ${stability})` : ""}, not a medical claim. ${desc} If you need guidance most days, open a dedicated stability option before stretching this last.`,
    upper: `Upper and lockdown should be judged for the ${role} you actually run, not for a race-day wrap you will not use. ${desc} If hot spots or volume are the weekly filter, that matters more than a material name on the hangtag.`,
    grip: `Grip follows the ${terrain ?? role} surface brief. Road rubber is the wrong spend for technical mud; trail lugs are the wrong spend for all-asphalt weeks. ${desc} Compare ${peer} when the surface job does not match.`,
    durability: `Durability belongs in a ${role} rotation, not a forever one-product plan. ${compromise} is the ownership limit to weigh against ${strengths}. We have not logged a wear diary on this page unless a first-hand section says otherwise.`,
    tech: `Features should be read as a ${role} tool, not a spec dump.${battery ? ` Battery life is listed at ${battery} — that matters for the longest session you actually do, not as a trophy number.` : ""}${display ? ` The display is ${display}.` : ""} If you need a different sensor or battery story, ${peer} is the closer specialist.`,
    performance: `Everyday performance is the ${role} brief, not a universal score. ${desc} Keep it when ${strengths} is the week; skip it when ${compromise} is the pattern.`,
    strengths: `${name} is strongest as a ${role} when ${strengths}. That is the case for keeping it over ${peer} — not a claim that it covers every session.`,
    tradeoffs: `The honest limit on ${name} is ${compromise}. If that pattern is most of your week, ${peer} is the cleaner starting compare.`,
    usecase: `Buy ${name} when a ${role} is the actual job and ${strengths} is non-negotiable. Skip it when ${compromise} would hit most sessions, or when ${peer} is simply closer to the week you run.`,
    value: `Value is whether the ${role} brief is worth the spend versus ${peer}. Pay for ${strengths}; do not pay for a role you will not use.`,
  };

  const minWords = topic === "specs" ? 40 : 90;
  return expandToMinWords(leads[topic], minWords, productOnlyFillers(ctx));
}

function bodyForTopic(topic: TopicKey, ctx: Ctx): string {
  return uniqueTopicBody(topic, ctx);
}

function buildVerdict(ctx: Ctx): string {
  const { product, map } = ctx;
  const name = displayName(ctx);
  const strength = map.strongestTraits[0] ?? product.shortDescription;
  const compromise = map.compromises[0] ?? "a different specialist job";
  const peer =
    map.competitors[0]?.name ?? ctx.alts[0]?.name ?? "a closer specialist";
  return scrubScaffold(
    `${name} is a ${map.intendedJob}. ${product.shortDescription.trim()} I'd shortlist it for ${lowerFirst(strength)}. The trade-off is ${lowerFirst(compromise)} — ${peer} is the cleaner compare when that is most of your week. It fits buyers who actually need a ${map.intendedJob}, not a one-product rotation.`,
  );
}

function buildPros(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const pros = map.strongestTraits.map((s) => s.trim()).filter((s) => s.length >= 8);
  if (pros.length < 2) {
    pros.push(
      `Clear ${map.intendedJob} role`,
      product.shortDescription.trim().replace(/\.$/, "") ||
        `Positioned for ${map.intendedJob} sessions`,
    );
  }
  const midsole = fmtSpec(product.specifications.midsole);
  if (midsole && !pros.some((p) => p.toLowerCase().includes(midsole.toLowerCase()))) {
    pros.push(`${midsole} midsole`);
  }
  return [...new Set(pros)].slice(0, 5);
}

function buildCons(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const cons = map.compromises.map((s) => s.trim()).filter((s) => s.length >= 8);
  if (cons.length < 2) {
    if (isRaceRoadShoe(map)) {
      cons.push(
        "Not a soft easy-mile daily trainer",
        "Race intent limits all-week versatility",
      );
    } else {
      cons.push(
        `Specialist ${map.intendedJob} — a poor universal default`,
        `A mismatch when most sessions sit outside ${product.name}'s job`,
      );
    }
  }
  return [...new Set(cons)].slice(0, 4);
}

function buildWhoShouldBuy(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const s0 = map.strongestTraits[0];
  const feel = specOf(product, "cushionFeel") ?? specOf(product, "rideCharacter");
  const stability = specOf(product, "stability");
  const line1 = s0
    ? `You're looking for ${lowerFirst(s0)}.`
    : `You're looking for a ${map.intendedJob}.`;
  const line2 = feel
    ? `You want a ${feel} ride for ${map.intendedJob} sessions.`
    : `You want this job without stretching it into another role.`;
  const line3 =
    stability && /neutral/i.test(stability)
      ? `You prefer a neutral ${map.intendedJob}.`
      : `You prefer this when ${map.intendedJob} is the weekly filter.`;
  return [line1, line2, line3];
}

function buildWhoShouldAvoid(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const peer =
    map.competitors[0]?.name ?? ctx.alts[0]?.name ?? "a closer specialist";
  const cat = product.categoryId ?? "";
  const line1 = needBullet(
    map.compromises[0],
    `a different specialist than a ${map.intendedJob}`,
  );
  const line2 = isRaceRoadShoe(map)
    ? `You're primarily looking for a soft easy-mile daily trainer.`
    : isTrailShoe(map)
      ? `You're primarily looking for a road daily, not trail geometry.`
      : /shoe|footwear/i.test(cat)
        ? `You're primarily looking for the lightest race-day option.`
        : /watch|hrm/i.test(cat)
          ? `You prefer a simpler watch when you do not need this feature set.`
        : `You prefer a different tool when this role is not your week.`;
  const line3 = `You prefer ${peer} when a ${map.intendedJob} is not the weekly job.`;
  return [line1, line2, line3];
}

function buildScoreBreakdown(product: Product, map: ProductQuestionMap): ScoreBreakdownItem[] {
  const base = product.recommendationScore ?? 80;
  const cat = product.categoryId;
  const keys =
    cat === "cat-running-shoes"
      ? [
          ["cushioning", "Cushioning"],
          ["ride", "Ride"],
          ["stability", "Stability"],
          ["fit", "Fit"],
          ["durability", "Durability"],
          ["value", "Value"],
        ]
      : cat === "cat-gps-watches" || /watch|hrm/i.test(cat)
        ? [
            ["gps-accuracy", "GPS Accuracy"],
            ["battery", "Battery"],
            ["training-features", "Training Analytics"],
            ["ease-of-use", "Ease of Use"],
            ["value", "Value"],
          ]
        : [
            ["performance", "Performance"],
            ["fit", "Fit"],
            ["durability", "Durability"],
            ["value", "Value"],
          ];

  return keys.map(([key, label], i) => {
    const adj =
      map.strongestTraits.length > i
        ? 2
        : map.compromises.length > i
          ? -2
          : 0;
    const score = Math.max(55, Math.min(96, Math.round(base + adj - i)));
    return {
      key,
      label,
      score,
      max: 100,
      note: `${label} for this ${map.intendedJob}`,
    };
  });
}

function testingContextCopy(ctx: Ctx): string {
  const name = displayName(ctx);
  const peers = ctx.alts
    .map((a) => a.name)
    .slice(0, 4)
    .join(", ");
  const specBits = [
    specOf(ctx.product, "weight") ? `${specOf(ctx.product, "weight")} weight` : null,
    specOf(ctx.product, "drop") ? `${specOf(ctx.product, "drop")} mm drop` : null,
    specOf(ctx.product, "midsole"),
    specOf(ctx.product, "batteryGps") ?? specOf(ctx.product, "batteryLifeHours"),
    specOf(ctx.product, "displayType"),
  ].filter(Boolean);
  return `How we assessed the ${name}: this is Expert Research. We used manufacturer specifications${specBits.length ? ` (${specBits.slice(0, 3).join(", ")})` : ""}, the published role as a ${ctx.map.intendedJob}, and a comparison set${peers ? ` (${peers})` : ""}. We have not personally tested this product. Feel claims and scores are research-informed, not a wear diary.`;
}

/**
 * True when catalog signal is rich enough for unique Expert Research synthesis.
 */
export function isUniqueExpertResearchEligible(product: Product): boolean {
  return buildProductQuestionMap(product, []).researchReady;
}

/**
 * Synthesize a unique expert-research Review without shared longform scaffolds.
 */
export function synthesizeUniqueExpertResearch(
  product: Product,
  opts: SynthesizeUniqueExpertResearchOpts,
): UniqueExpertResearchResult {
  const alts = (opts.alternatives ?? []).filter(Boolean).slice(0, 5);
  const map = buildProductQuestionMap(product, alts);

  const catalogSignal =
    Boolean(product.shortDescription?.trim()) ||
    allSpecPairs(product).length >= 1 ||
    (product.strengths?.length ?? 0) >= 1;
  if (!map.researchReady && !opts.allowThinCatalog) {
    return {
      status: "NEEDS_RESEARCH",
      gaps: map.researchGaps.length
        ? map.researchGaps
        : ["insufficient_catalog_signal"],
    };
  }
  if (!map.researchReady && opts.allowThinCatalog && !catalogSignal) {
    return {
      status: "NEEDS_RESEARCH",
      gaps: map.researchGaps.length
        ? map.researchGaps
        : ["insufficient_catalog_signal"],
    };
  }

  const brandName = opts.brandName?.trim() || "the brand";
  const evidenceIds =
    opts.evidenceIds?.length > 0
      ? [...opts.evidenceIds]
      : product.evidenceIds?.length
        ? [...product.evidenceIds]
        : ["ev-catalog-mfr", "ev-catalog-editorial"];

  const ctx: Ctx = { product, brandName, map, alts, evidenceIds };
  const blueprint = blueprintFor(product.categoryId);

  const sections: ContentSection[] = blueprint.map((bp) => {
    const minWords = bp.topic === "specs" ? 40 : SUBSTANTIVE_TOPICS.has(bp.topic) ? 90 : 70;
    let body = scrubScaffold(bodyForTopic(bp.topic, ctx));
    if (countWords(body) < minWords) {
      body = scrubScaffold(
        expandToMinWords(body, minWords, productOnlyFillers(ctx)),
      );
    }
    return {
      id: bp.id,
      heading: bp.heading,
      body,
      evidenceIds,
    };
  });

  const deep = sections
    .map((s, idx) => ({ s, idx, words: countWords(s.body) }))
    .sort((a, b) => b.words - a.words);
  let need = Math.max(0, 4 - deep.filter((d) => d.words >= 90).length);
  for (const row of deep) {
    if (need <= 0) break;
    if (row.words >= 90) continue;
    if (/spec/i.test(row.s.id) || /spec/i.test(row.s.heading)) continue;
    const expanded = scrubScaffold(
      expandToMinWords(row.s.body, 90, productOnlyFillers(ctx)),
    );
    sections[row.idx] = { ...row.s, body: expanded };
    need--;
  }

  const verdict = buildVerdict(ctx);
  const pros = buildPros(ctx);
  const cons = buildCons(ctx);
  const whoShouldBuy = buildWhoShouldBuy(ctx);
  const whoShouldAvoid = buildWhoShouldAvoid(ctx);
  const score = product.recommendationScore ?? opts.existing?.score ?? 82;
  const now = new Date().toISOString();
  const existing = opts.existing;

  const review: Review = {
    id: existing?.id ?? `review-${product.slug}`,
    slug: existing?.slug ?? product.slug,
    productId: product.id,
    title: existing?.title ?? `${displayName(ctx)} Review`,
    subtitle:
      existing?.subtitle ??
      `${displayName(ctx)} — ${map.intendedJob}`,
    reviewType: existing?.reviewType ?? "expert-research",
    verdict,
    bottomLine: verdict,
    score,
    summary: verdict,
    reviewerId: existing?.reviewerId ?? "author-kitletics-editorial",
    testingContext: scrubScaffold(
      testingContextCopy(ctx),
    ),
    editorialDisclosure: existing?.editorialDisclosure ?? EDITORIAL_DISCLOSURE,
    sections,
    pros,
    cons,
    whoShouldBuy,
    whoShouldAvoid,
    scoreBreakdown:
      existing?.scoreBreakdown?.length && existing.scoreBreakdown.length >= 3
        ? existing.scoreBreakdown
        : buildScoreBreakdown(product, map),
    evidenceIds,
    alternativeProductIds: [
      ...new Set([
        ...alts.map((a) => a.id),
        ...(product.alternativeProductIds ?? []),
        ...(existing?.alternativeProductIds ?? []),
      ]),
    ].slice(0, 8),
    comparisonIds: existing?.comparisonIds ?? [],
    faqIds: existing?.faqIds ?? [],
    status: existing?.status ?? "draft",
    publishedAt: existing?.publishedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    seoTitle: scrubScaffold(
      existing?.seoTitle ?? `${displayName(ctx)}: Specs, Role & Alternatives`,
    ),
    seoDescription: scrubScaffold(
      existing?.seoDescription ??
        `${displayName(ctx)} is a ${map.intendedJob}. ${traitList(map.strongestTraits, 2)}. Compare ${map.competitors[0]?.name ?? "linked peers"}.`,
    ).slice(0, 160),
  };

  review.title = scrubScaffold(review.title);
  if (review.subtitle) review.subtitle = scrubScaffold(review.subtitle);
  review.verdict = scrubScaffold(review.verdict);
  review.bottomLine = scrubScaffold(review.bottomLine ?? review.verdict);
  review.summary = scrubScaffold(review.summary);
  if (review.testingContext) review.testingContext = scrubScaffold(review.testingContext);
  review.pros = review.pros.map((s) => scrubScaffold(s));
  review.cons = review.cons.map((s) => scrubScaffold(s));
  review.whoShouldBuy = review.whoShouldBuy.map((s) => scrubScaffold(s));
  review.whoShouldAvoid = review.whoShouldAvoid.map((s) => scrubScaffold(s));
  review.sections = review.sections.map((s) => ({
    ...s,
    heading: scrubScaffold(s.heading),
    body: scrubScaffold(s.body),
  }));
  if (review.scoreBreakdown) {
    review.scoreBreakdown = review.scoreBreakdown.map((item) => ({
      ...item,
      note: item.note ? scrubScaffold(item.note) : item.note,
    }));
  }

  if (containsPublicContentCorruption(review)) {
    return {
      status: "NEEDS_RESEARCH",
      gaps: ["public_content_corruption"],
    };
  }
  const qa = assessConsumerCopyQuality(review);
  if (!qa.ok) {
    return {
      status: "NEEDS_RESEARCH",
      gaps: qa.reasons.length ? qa.reasons : ["consumer_copy_quality"],
    };
  }

  return review;
}
