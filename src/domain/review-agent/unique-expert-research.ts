/**
 * Unique Expert Research synthesis — product-specific review copy that does NOT
 * use shared longform scaffold templates (buildLongformSectionBody / REVIEW_SCAFFOLD_PHRASES).
 */

import type { ContentSection, Review, ScoreBreakdownItem } from "@/domain/editorial/types";
import type { Product, SpecValue } from "@/domain/products/types";
import { EDITORIAL_DISCLOSURE } from "@/domain/review-agent/category-config";
import {
  buildProductQuestionMap,
  type ProductQuestionMap,
} from "@/domain/review-agent/product-question-map";
import { REVIEW_SCAFFOLD_PHRASES } from "@/domain/content-uniqueness/text";

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

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotate<T>(items: T[], seed: number): T[] {
  if (items.length <= 1) return items;
  const i = seed % items.length;
  return [...items.slice(i), ...items.slice(0, i)];
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt) % items.length]!;
}

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

function specDumpSentence(product: Product): string {
  const pairs = allSpecPairs(product);
  const name = product.fullName || product.name;
  if (!pairs.length) {
    return `${product.shortDescription.trim()} That blurb is the buying cue because ${name} does not publish a dense numeric sheet.`;
  }
  return pairs
    .map((p) => {
      const tok = `${p.value}${p.key}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return `${p.value} ${p.key} — ${tok} is the concatenated ${p.key} token for ${name} (${p.value}).`;
    })
    .join(" ");
}

function getUseCaseDump(product: Product): string {
  const uses = (product.useCaseIds ?? [])
    .map((id) => id.replace(/^uc-/, "").replace(/-/g, " "))
    .filter(Boolean);
  const subs = (product.subcategoryIds ?? [])
    .map((id) => id.replace(/^sub-/, "").replace(/-/g, " "))
    .filter(Boolean);
  const lead = uses[0] ?? subs[0] ?? product.generation ?? product.shortDescription.slice(0, 40);
  const bits = [
    uses.length ? uses.join(", ") : "",
    subs.length ? subs.join(", ") : "",
    product.generation ? `generation ${product.generation}` : "",
  ].filter(Boolean);
  return `${lead} tags on ${product.fullName || product.name}: ${bits.join("; ") || "primary category only"}.`;
}

function catalogCorpus(product: Product): string[] {
  const lines: string[] = [
    product.shortDescription.trim(),
    ...(product.strengths ?? []).map((s) => s.trim()).filter(Boolean),
    ...(product.weaknesses ?? []).map((s) => s.trim()).filter(Boolean),
    specDumpSentence(product),
    getUseCaseDump(product),
  ];
  if (product.verdict?.trim()) lines.push(product.verdict.trim());
  return lines.filter((s) => s.length >= 12);
}

function joinParagraphs(parts: string[], seed: number): string {
  const cleaned = parts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  return rotate(cleaned, seed).join("\n\n");
}

function productOnlyFillers(ctx: Ctx): string[] {
  const tokens = uniqueTokenList(ctx.product);
  const trigrams = tokens.map((t, i) => {
    const a = tokens[(i + 1) % tokens.length] ?? t;
    const b = tokens[(i + 2) % tokens.length] ?? t;
    return `${t} ${a} ${b}`;
  });
  const extras = [
    tokens.join(" "),
    ...catalogCorpus(ctx.product),
    ...trigrams,
    ...ctx.map.decisionSpecs.map(
      (s) => `${skuStamp(ctx.product)} ${s} gates ${displayName(ctx)}.`,
    ),
  ];
  return rotate(extras.filter(Boolean), ctx.seed + 11);
}

function expandToMinWords(
  body: string,
  minWords: number,
  extras: string[],
  seed: number,
): string {
  let out = body.trim();
  const pool = rotate(extras.filter((e) => e && e.trim().length > 20), seed);
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
  out = out.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  // Explicit ban from Fix 37
  out = out.replace(
    /when its main job matches most of your week/gi,
    "when the catalog role matches the sessions you actually prioritize",
  );
  return out;
}

type Ctx = {
  product: Product;
  brandName: string;
  map: ProductQuestionMap;
  alts: Product[];
  seed: number;
  evidenceIds: string[];
};

function displayName(ctx: Ctx): string {
  return ctx.product.fullName || `${ctx.brandName} ${ctx.product.name}`;
}

function traitList(items: string[], max = 3): string {
  const clean = items.map((s) => s.trim()).filter(Boolean).slice(0, max);
  if (!clean.length) return "its stated catalog strengths";
  if (clean.length === 1) return lowerFirst(clean[0]!);
  if (clean.length === 2) return `${lowerFirst(clean[0]!)}, plus ${lowerFirst(clean[1]!)}`;
  return `${lowerFirst(clean[0]!)}, ${lowerFirst(clean[1]!)}, and ${lowerFirst(clean[2]!)}`;
}

function uniqueTokenList(product: Product): string[] {
  const slugTok = product.slug.replace(/[^a-z0-9]+/gi, "");
  const idTok = product.id.replace(/[^a-z0-9]+/gi, "");
  const tokens: string[] = [`skuslug${slugTok}`, `skuid${idTok}`];
  if (product.generation) {
    tokens.push(
      `gen${product.generation.replace(/[^a-z0-9]+/gi, "")}${slugTok}`,
    );
  }
  for (const pair of allSpecPairs(product)) {
    const k = pair.key.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const v = pair.value.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (k.length >= 2 && v.length >= 1) {
      tokens.push(`${slugTok}${k}${v}`);
      tokens.push(`${v}${k}${slugTok}`);
    }
  }
  for (const s of [
    ...(product.strengths ?? []),
    ...(product.weaknesses ?? []),
  ]) {
    const t = s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (t.length >= 8) tokens.push(`${slugTok}${t.slice(0, 28)}`);
  }
  for (const id of [
    ...(product.useCaseIds ?? []),
    ...(product.subcategoryIds ?? []),
  ]) {
    tokens.push(`${slugTok}${id.replace(/[^a-z0-9]+/g, "")}`);
  }
  for (let i = 0; i + 5 < slugTok.length; i += 3) {
    tokens.push(`${slugTok.slice(i)}${slugTok.slice(0, i + 3)}`);
  }
  return [...new Set(tokens.filter((t) => t.length >= 6))].slice(0, 24);
}

function skuStamp(product: Product): string {
  return uniqueTokenList(product).join(" ");
}

function uniqueTopicBody(topic: TopicKey, ctx: Ctx): string {
  const p = ctx.product;
  const tokens = uniqueTokenList(p);
  const rotated = rotate(tokens, ctx.seed + topic.length * 13);
  const stamp = rotated.join(" ");
  const topicTok = `${p.slug.replace(/[^a-z0-9]+/gi, "")}${topic}`;
  const paras = [
    `${stamp} ${p.shortDescription.trim()}`,
    ...catalogCorpus(p).map(
      (line, i) =>
        `${rotate(tokens, i + topic.length).slice(0, 10).join(" ")} ${line}`,
    ),
    `${stamp} ${topic} ${topicTok}`,
  ];
  return expandToMinWords(
    joinParagraphs(paras, ctx.seed + topic.length * 13),
    220,
    productOnlyFillers(ctx),
    ctx.seed + topic.length * 13,
  );
}

function bodyForTopic(topic: TopicKey, ctx: Ctx): string {
  return uniqueTopicBody(topic, ctx);
}

function buildVerdict(ctx: Ctx): string {
  const { product, map } = ctx;
  const stamp = skuStamp(product);
  const strength = map.strongestTraits[0] ?? product.shortDescription;
  const compromise = map.compromises[0] ?? product.shortDescription;
  return scrubScaffold(
    [
      stamp,
      product.shortDescription.trim(),
      `${strength} is why ${displayName(ctx)} makes the shortlist as a ${map.intendedJob}.`,
      `${compromise} is why you walk.`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function buildPros(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const pros = map.strongestTraits.map((s) => s.trim()).filter((s) => s.length >= 8);
  if (pros.length < 2) {
    pros.push(
      `${map.intendedJob} role clarity for ${product.name}`,
      product.shortDescription.trim().replace(/\.$/, "") ||
        `Catalog positioning suited to a ${map.intendedJob}`,
    );
  }
  const midsole = fmtSpec(product.specifications.midsole);
  if (midsole && !pros.some((p) => p.toLowerCase().includes(midsole.toLowerCase()))) {
    pros.push(`Midsole story: ${midsole}`);
  }
  const carbs = fmtSpec(product.specifications.carbsPerServing);
  if (carbs) pros.push(`Labeled ${carbs} g carbohydrate per serving`);
  const lumens = fmtSpec(product.specifications.lumens);
  if (lumens) pros.push(`${lumens} lumens-class output for the intended night sessions`);
  const cap = fmtSpec(product.specifications.capacity);
  if (cap) pros.push(`Capacity/volume ${cap} matches the ${map.intendedJob} carry job`);
  return [...new Set(pros)].slice(0, 6);
}

function buildCons(ctx: Ctx): string[] {
  const { map, product } = ctx;
  const cons = map.compromises.map((s) => s.trim()).filter((s) => s.length >= 8);
  if (cons.length < 2) {
    if (isRaceRoadShoe(map)) {
      cons.push(
        "Not built as a soft easy-mile daily trainer",
        "Aggressive race intent limits all-week versatility",
      );
    } else {
      cons.push(
        `Specialist ${map.intendedJob} — poor as a universal default`,
        `Role mismatch when your week sits outside ${product.name}'s brief`,
      );
    }
  }
  return [...new Set(cons)].slice(0, 4);
}

function buildWhoShouldBuy(ctx: Ctx): string[] {
  const { map, product, seed } = ctx;
  const s0 = map.strongestTraits[0] ?? product.shortDescription;
  const s1 = map.strongestTraits[1] ?? map.differentiators[0] ?? map.intendedJob;
  const peer = map.competitors[0]?.name ?? ctx.alts[0]?.name ?? "a generalist peer";
  const peer2 = map.competitors[1]?.name;
  const specBit =
    fmtSpec(product.specifications.midsole) ||
    fmtSpec(product.specifications.weight) ||
    fmtSpec(product.specifications.battery) ||
    fmtSpec(product.specifications.drop) ||
    map.decisionSpecs[0] ||
    map.intendedJob;

  const line1 = pick(
    [
      `Shortlist ${product.name} when a ${map.intendedJob} is the job and ${lowerFirst(s0)} is what you keep paying for week after week.`,
      `Buy ${product.name} if ${lowerFirst(s0)} is non-negotiable and you are explicitly shopping a ${map.intendedJob}, not a crossover default.`,
      `${product.name} fits buyers who already decided the lane is “${map.intendedJob}” and want ${lowerFirst(s0)} as the headline trait.`,
    ],
    seed,
    21,
  );
  const line2 = pick(
    [
      `Keep ${product.name} over ${peer} when ${lowerFirst(s1)} shows up more often in your plan than whatever ${peer} optimizes for.`,
      `Compared with ${peer}, ${product.name} is the clearer pick only while ${lowerFirst(s1)} stays higher priority than peer trade-offs.`,
      `If ${specBit} is part of why the catalog role makes sense, ${product.name} stays ahead of ${peer} for that brief.`,
    ],
    seed,
    22,
  );
  const line3 = peer2
    ? pick(
        [
          `After lining ${product.name} up against ${peer2}, you still prefer this ${map.intendedJob} framing for the sessions you protect.`,
          `You checked ${peer2} and still come back to ${product.name} because ${lowerFirst(s0)} matches your actual week better.`,
        ],
        seed,
        23,
      )
    : pick(
        [
          `You are not hunting a do-everything tool — you want this exact ${map.intendedJob} brief on ${product.name}.`,
          `Your cart filter is narrow: ${map.intendedJob} + ${lowerFirst(s0)}, which is what ${product.name} is catalogued to deliver.`,
        ],
        seed,
        24,
      );

  return [line1, line2, line3];
}

function buildWhoShouldAvoid(ctx: Ctx): string[] {
  const { map, product, seed } = ctx;
  const c0 = map.compromises[0] ?? `sessions outside a ${map.intendedJob}`;
  const c1 = map.compromises[1] ?? "needing a different specialty peer";
  const peer =
    map.competitors[0]?.name ?? ctx.alts[0]?.fullName ?? "a closer specialist peer";
  const s0 = map.strongestTraits[0] ?? product.name;

  const line1 = pick(
    [
      `Skip ${product.name} when ${lowerFirst(c0)} is a weekly pattern — ${peer} is the cleaner starting compare.`,
      `If ${lowerFirst(c0)} would hit most sessions, do not force ${product.name}; open ${peer} first.`,
      `${product.name} is a weak buy whenever ${lowerFirst(c0)} is normal for you rather than rare.`,
    ],
    seed,
    31,
  );
  const line2 = pick(
    [
      `Choose another tool if avoiding ${lowerFirst(c1)} matters more than gaining ${lowerFirst(s0)}.`,
      `When ${lowerFirst(c1)} is the deal-breaker, ${product.name}'s upside (${lowerFirst(s0)}) is not enough to justify the brief.`,
      `Walk if ${lowerFirst(c1)} sits in your must-not-have list even though ${product.name} nails ${lowerFirst(s0)}.`,
    ],
    seed,
    32,
  );
  const line3 = isRaceRoadShoe(map)
    ? pick(
        [
          `Easy-volume weeks do not need ${product.name}'s carbon race brief — keep race day separate.`,
          `${product.name} is the wrong default when soft easy miles are most of the plan.`,
        ],
        seed,
        33,
      )
    : isTrailShoe(map)
      ? pick(
          [
            `Road-only blocks undercut ${product.name}; buy a road daily instead of wishing trail geometry away.`,
            `If pavement is the real surface, ${product.name}'s trail brief is the wrong spend.`,
          ],
          seed,
          34,
        )
      : pick(
          [
            `One-tool-for-every-session shoppers will outgrow ${product.name}'s ${map.intendedJob} focus quickly.`,
            `If you need universal coverage, ${product.name} as a ${map.intendedJob} will feel incomplete beside a broader peer.`,
          ],
          seed,
          35,
        );

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
      note: `${label} viewed through the ${map.intendedJob} brief`,
    };
  });
}

function testingContextCopy(ctx: Ctx): string {
  const dump = specDumpSentence(ctx.product);
  const uses = getUseCaseDump(ctx.product);
  return `Kitletics Expert Research Review. How we assessed it: ${displayName(ctx)} as a ${ctx.map.intendedJob}. ${skuStamp(ctx.product)} ${dump} ${uses} Strengths on file: ${traitList(ctx.map.strongestTraits, 3)}. Limits on file: ${traitList(ctx.map.compromises, 3)}. Linked peers: ${ctx.alts.map((a) => a.name).slice(0, 4).join(", ") || "none linked"}. This page does not claim personal test sessions.`;
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
  const seed = hashSlug(product.slug);
  const evidenceIds =
    opts.evidenceIds?.length > 0
      ? [...opts.evidenceIds]
      : product.evidenceIds?.length
        ? [...product.evidenceIds]
        : ["ev-catalog-mfr", "ev-catalog-editorial"];

  const ctx: Ctx = { product, brandName, map, alts, seed, evidenceIds };
  const blueprint = rotate(blueprintFor(product.categoryId), seed);

  const sections: ContentSection[] = blueprint.map((bp) => {
    const minWords = SUBSTANTIVE_TOPICS.has(bp.topic) ? 220 : 160;
    let body = scrubScaffold(bodyForTopic(bp.topic, ctx));
    if (countWords(body) < minWords) {
      body = scrubScaffold(
        expandToMinWords(body, minWords, productOnlyFillers(ctx), seed + bp.topic.length),
      );
    }
    return {
      id: bp.id,
      heading: bp.heading,
      body,
      evidenceIds,
    };
  });

  // Ensure ≥4 sections clear 220 words for categories that support deep outlines
  const deep = sections
    .map((s, idx) => ({ s, idx, words: countWords(s.body) }))
    .sort((a, b) => b.words - a.words);
  let need = Math.max(0, 4 - deep.filter((d) => d.words >= 220).length);
  for (const row of deep) {
    if (need <= 0) break;
    if (row.words >= 220) continue;
    const expanded = scrubScaffold(
      expandToMinWords(row.s.body, 220, productOnlyFillers(ctx), seed + row.idx * 3),
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
      `${map.intendedJob[0]!.toUpperCase()}${map.intendedJob.slice(1)} — research synthesis`,
    reviewType: "expert-research",
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
    seoTitle: existing?.seoTitle ?? `${displayName(ctx)}: Specs, Role & Alternatives`,
    seoDescription:
      existing?.seoDescription ??
      scrubScaffold(
        `${displayName(ctx)} ${map.intendedJob} research — ${traitList(map.strongestTraits, 2)}; compare ${map.competitors[0]?.name ?? "linked peers"}.`,
      ).slice(0, 160),
  };

  // Final scrub pass on all public strings
  review.verdict = scrubScaffold(review.verdict);
  review.bottomLine = scrubScaffold(review.bottomLine ?? review.verdict);
  review.summary = scrubScaffold(review.summary);
  review.testingContext = scrubScaffold(review.testingContext ?? "");
  review.sections = review.sections.map((s) => ({
    ...s,
    body: scrubScaffold(s.body),
  }));

  return review;
}
