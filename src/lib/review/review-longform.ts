import type { ContentSection, Review } from "@/domain/editorial/types";
import type { Brand, Product, SpecValue } from "@/domain/products/types";
import { getSpecificationDefinitions } from "@/repositories";
import { skipSentenceFromLimitation } from "@/lib/review/rewrite-uniqueness-era-skip";
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";
import {
  isPadelGripCategory,
  isPadelRacketCategory,
  isPadelShoeCategory,
  padelTopicFromSection,
  PADEL_ACCESSORY_BLUEPRINT,
  PADEL_BAG_BLUEPRINT,
  PADEL_BALL_BLUEPRINT,
  PADEL_GRIP_BLUEPRINT,
  PADEL_RACKET_BLUEPRINT,
  PADEL_SHOE_BLUEPRINT,
  type PadelLongformTopic,
} from "@/lib/review/padel-review-outline";
import {
  buildPadelLongformSectionBody,
  extendPadelLongformSectionBody,
} from "@/lib/review/padel-longform";

/** Reader-facing length target for a full review page (quality over padding). */
export const REVIEW_MIN_WORDS = 2500;
export const REVIEW_TARGET_WORDS = 3800;
/** Soft ceiling so long-form stays readable (audit ideal band). */
export const REVIEW_MAX_WORDS = 5500;

/** Sections shorter than this get expanded with real topic copy (no meta filler). */
export const MIN_SECTION_WORDS = 220;
/** Prefer at least this many words per major section after enrichment. */
export const TARGET_SECTION_WORDS = 320;

export type LongformTopic =
  | "overview"
  | "specs"
  | "strengths"
  | "weaknesses"
  | "bestFor"
  | "notIdeal"
  | "alternatives"
  | "comparisons"
  | "tradeoffs"
  | "usecase"
  | "value"
  | "fit"
  | "cushioning"
  | "ride"
  | "stability"
  | "grip"
  | "upper"
  | "durability"
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

type SectionBlueprint = {
  id: string;
  heading: string;
  topic: LongformTopic;
};

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

/** Shoe-only topics — never surface on watches / HRMs / racket / gym gear. */
const SHOE_ONLY_TOPICS = new Set<LongformTopic>([
  "ride",
  "cushioning",
  "stability",
  "grip",
  "upper",
]);

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

const GENERIC_BLUEPRINT: SectionBlueprint[] = [
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

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function topicFromSection(id: string, heading: string): LongformTopic {
  const padel = padelTopicFromSection(id, heading);
  if (padel) return padel as LongformTopic;
  const hay = `${id} ${heading}`.toLowerCase();
  if (/overview|what it is|intro|verdict/.test(hay)) return "overview";
  if (/verified|spec|key specs|design &|measurements/.test(hay)) return "specs";
  if (/strength|strongest|best at/.test(hay)) return "strengths";
  if (/trade|limit|weak|avoid|not ideal/.test(hay)) return "tradeoffs";
  if (/use case|who it is|who should|performance by|when to/.test(hay)) return "usecase";
  if (/value|price|position/.test(hay)) return "value";
  if (/upper|mesh|knit/.test(hay)) return "upper";
  if (/fit|sizing|lockdown/.test(hay)) return "fit";
  if (/cushion|midsole|foam|stack/.test(hay)) return "cushioning";
  if (/ride|transition/.test(hay)) return "ride";
  if (/stabil/.test(hay)) return "stability";
  if (/grip|lug|outsole|tread/.test(hay)) return "grip";
  if (/durab/.test(hay)) return "durability";
  if (/battery|gps|maps|display|sensor|track/.test(hay)) return "tech";
  if (/\bperformance\b|playability|everyday performance/.test(hay))
    return "performance";
  return "generic";
}

function isWatchFamily(categoryId: string): boolean {
  return /watch|gps|hrm|heart.?rate/i.test(categoryId);
}

function isShoeFamily(categoryId: string): boolean {
  return /shoe/i.test(categoryId);
}

function isRacketFamily(categoryId: string): boolean {
  return /racket|padel.?ball|tennis.?ball|overgrip|grip/i.test(categoryId);
}

function isFitnessFamily(categoryId: string): boolean {
  return /bench|dumbbell|power.?rack|weight.?plate|barbell|kettlebell|rower|treadmill|air.?bike|pull.?up|parallettes|ski.?erg|functional|gym.?floor|gym.?storage|lifting.?accessor|weighted.?vest|recovery|massage/i.test(
    categoryId,
  );
}

function blueprintForCategory(categoryId: string): SectionBlueprint[] {
  // Watches/HRMs before any shoe match — never inherit Ride / Cushioning.
  if (isWatchFamily(categoryId)) return WATCH_BLUEPRINT;
  if (isPadelRacketCategory(categoryId)) {
    return PADEL_RACKET_BLUEPRINT as SectionBlueprint[];
  }
  if (isPadelShoeCategory(categoryId)) {
    return PADEL_SHOE_BLUEPRINT as SectionBlueprint[];
  }
  if (isPadelGripCategory(categoryId)) {
    return PADEL_GRIP_BLUEPRINT as SectionBlueprint[];
  }
  if (categoryId === "cat-padel-bags") {
    return PADEL_BAG_BLUEPRINT as SectionBlueprint[];
  }
  if (categoryId === "cat-padel-balls") {
    return PADEL_BALL_BLUEPRINT as SectionBlueprint[];
  }
  if (categoryId === "cat-padel-accessories") {
    return PADEL_ACCESSORY_BLUEPRINT as SectionBlueprint[];
  }
  if (isShoeFamily(categoryId)) return SHOE_BLUEPRINT;
  if (isRacketFamily(categoryId)) return RACKET_BLUEPRINT;
  if (isFitnessFamily(categoryId)) return FITNESS_BLUEPRINT;
  return GENERIC_BLUEPRINT;
}

function sectionKey(section: ContentSection): LongformTopic {
  return topicFromSection(section.id, section.heading);
}

/**
 * Merge author sections with the canonical long-form outline so thin reviews
 * still get a full reading experience.
 */
export function ensureCanonicalSections(
  review: Review,
  product: Product,
): ContentSection[] {
  const blueprint = blueprintForCategory(product.categoryId);
  const evidenceIds =
    review.evidenceIds?.length > 0
      ? review.evidenceIds
      : (review.sections[0]?.evidenceIds ?? []);

  const byTopic = new Map<string, ContentSection>();
  const extras: ContentSection[] = [];

  for (const section of review.sections) {
    const topic = sectionKey(section);
    const matchesBlueprint = blueprint.some((b) => b.topic === topic);
    if (matchesBlueprint && !byTopic.has(topic)) {
      byTopic.set(topic, section);
    } else {
      extras.push(section);
    }
  }

  const ordered: ContentSection[] = [];
  for (const slot of blueprint) {
    const existing = byTopic.get(slot.topic);
    if (existing) {
      const keepCustomHeading =
        existing.heading &&
        existing.heading !== slot.heading &&
        !/verified design|design & specs/i.test(existing.heading) &&
        // Force watch blueprint labels (Fit & Comfort → On-wrist comfort).
        !(isWatchFamily(product.categoryId) && slot.topic === "fit");
      ordered.push({
        ...existing,
        id: existing.id || slot.id,
        heading: keepCustomHeading ? existing.heading : slot.heading,
      });
    } else {
      ordered.push({
        id: slot.id,
        heading: slot.heading,
        body: "",
        evidenceIds,
      });
    }
  }

  // Keep unexpected author sections (comparisons, deep dives) after the core set.
  // Drop shoe-only leftovers (e.g. draft "Ride" from researchReview) on watches.
  for (const extra of extras) {
    const topic = sectionKey(extra);
    if (!isShoeFamily(product.categoryId) && SHOE_ONLY_TOPICS.has(topic)) {
      if (topic === "ride" && extra.body.trim()) {
        const perfIdx = ordered.findIndex(
          (s) => sectionKey(s) === "performance",
        );
        if (perfIdx >= 0) {
          const existing = ordered[perfIdx]!;
          if (countWords(existing.body) < 60) {
            ordered[perfIdx] = {
              ...existing,
              body: [extra.body.trim(), existing.body.trim()]
                .filter(Boolean)
                .join("\n\n"),
            };
          }
        }
      }
      continue;
    }
    if (!ordered.some((s) => s.id === extra.id)) ordered.push(extra);
  }

  return ordered;
}

function readSpec(product: Product, key: string): SpecValue | undefined {
  const raw = product.specifications[key];
  if (raw === null || raw === undefined) return undefined;
  if (Array.isArray(raw) && raw.length === 0) return undefined;
  return raw as SpecValue;
}

function asText(raw: SpecValue): string {
  if (typeof raw === "boolean") return raw ? "yes" : "no";
  if (typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "object" && raw !== null && "min" in raw) {
    const r = raw as { min: number; max: number };
    return `${r.min}–${r.max}`;
  }
  return String(raw);
}

function prettyWord(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMm\b/g, "mm");
}

function bulletBlock(title: string, items: string[]): string {
  if (!items.length) return "";
  return `${title}\n${items.map((i) => `• ${i}`).join("\n")}`;
}

function formatSpecLines(product: Product): string[] {
  const defs = getSpecificationDefinitions(product.categoryId);
  const preferred = [
    "weight",
    "drop",
    "heelStack",
    "forefootStack",
    "cushionLevel",
    "stability",
    "terrain",
    "widthOptions",
    "grip",
    "plate",
    "plateMaterial",
    "upper",
    "midsole",
    "outsole",
    "batteryLife",
    "display",
    "gps",
    "weightClass",
    "balance",
    "shape",
    "core",
    "weightMin",
    "thicknessMm",
    "face",
    "manufacturerCoreName",
    "outsole",
    "courtOutsole",
    "lateralStability",
    "courtFeel",
    "headSize",
    "stringPattern",
    "stiffness",
    "swingWeight",
    "beamWidth",
    "length",
    "capacityMl",
    "vestCapacity",
    "loadCapacity",
    "weightRange",
    "footprint",
  ];
  const keys = [
    ...preferred.filter((k) => product.specifications[k] != null),
    ...Object.keys(product.specifications).filter(
      (k) => !preferred.includes(k) && product.specifications[k] != null,
    ),
  ].slice(0, 14);

  const lines: string[] = [];
  for (const key of keys) {
    const raw = product.specifications[key];
    if (raw === null || raw === undefined) continue;
    if (Array.isArray(raw) && raw.length === 0) continue;
    const def = defs.find((d) => d.key === key);
    const label = formatPublicSpecDisplayLabel(key);
    let value: string;
    if (typeof raw === "boolean") value = raw ? "Yes" : "No";
    else if (typeof raw === "number")
      value = def?.unit ? `${raw} ${def.unit}` : String(raw);
    else if (Array.isArray(raw)) value = raw.join(", ");
    else if (typeof raw === "object" && raw !== null && "min" in raw) {
      const r = raw as { min: number; max: number };
      value = `${r.min}–${r.max}`;
    } else value = String(raw);
    lines.push(`• ${label}: ${value}`);
  }
  return lines;
}

function strengthsOf(product: Product, review: Review): string[] {
  return product.strengths?.length ? product.strengths : review.pros.slice(0, 6);
}

function weaknessesOf(product: Product, review: Review): string[] {
  return product.weaknesses?.length
    ? product.weaknesses
    : review.cons.slice(0, 6);
}

function friendlyNote(note: string): string {
  const lower = note.toLowerCase();
  if (lower.includes("neutral platform")) {
    return "neutral platform, not a dedicated stability shoe";
  }
  if (lower.includes("research estimate") || /estimate|research/i.test(note)) {
    return "best estimate from materials and similar shoes";
  }
  return note.replace(/\.$/, "");
}

function scoreNote(review: Review, key: string): string | undefined {
  const item = review.scoreBreakdown.find((s) => s.key === key);
  if (!item) return undefined;
  const display = (item.score / 10).toFixed(1);
  return item.note
        ? `${item.label} lands around ${display}/10 (${friendlyNote(item.note)}).`
    : `${item.label} lands around ${display}/10 in this guide.`;
}

function softList(items: string[], n = 3): string {
  return items
    .slice(0, n)
    .map((s) => s.charAt(0).toLowerCase() + s.slice(1))
    .join(", ")
    .replace(/, ([^,]*)$/, " or $1");
}

function joinParas(...parts: Array<string | false | undefined | null>): string {
  return parts
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim())
    .join("\n\n");
}

function mentions(hay: string, ...needles: string[]): boolean {
  const lower = hay.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

/**
 * Keep a real editorial note as the lead. Only add missing product facts —
 * never a second essay underneath.
 */
export function expandHumanEditorialSeed(
  seed: string,
  topic: LongformTopic,
  product: Product,
  review: Review,
): string {
  if (
    isPadelRacketCategory(product.categoryId) ||
    isPadelShoeCategory(product.categoryId) ||
    isPadelGripCategory(product.categoryId)
  ) {
    const generated = buildPadelLongformSectionBody(topic, product, review);
    const cleanPadel = seed.trim();
    if (!cleanPadel) return generated;
    if (countWords(cleanPadel) >= 180) return cleanPadel;
    return [cleanPadel, generated].join("\n\n");
  }
  const clean = seed.trim();
  if (!clean) {
    return buildLongformSectionBody(topic, product, review);
  }

  const extras: string[] = [];

  if (topic === "fit") {
    const widths = readSpec(product, "widthOptions");
    const upper = readSpec(product, "upper");
    const widthText = widths
      ? Array.isArray(widths)
        ? widths.join(", ")
        : asText(widths)
      : undefined;
    if (widthText && !mentions(clean, "width", "wide", "narrow", "2e", "4e")) {
      extras.push(
        `Only ${widthText} width. If you need more than that, try in store or pick a brand with a clearer width ladder.`,
      );
    }
    if (upper && !mentions(clean, "upper", "mesh", "knit", "lockdown")) {
      extras.push(
        `The upper is ${prettyWord(String(upper)).toLowerCase()} — breathability and lockdown matter once you lace for easy miles.`,
      );
    }
  }

  if (topic === "ride") {
    const ride = readSpec(product, "rideCharacter");
    const drop = readSpec(product, "drop");
    if (ride && !mentions(clean, String(ride), "ride", "rocker", "bounce")) {
      extras.push(
        `Catalog ride character: ${String(ride).replace(/-/g, " ")}.`,
      );
    }
    if (typeof drop === "number" && !mentions(clean, "drop", `${drop} mm`)) {
      extras.push(`${drop} mm drop shapes the heel-to-toe transition.`);
    }
  }

  if (topic === "cushioning") {
    const level = readSpec(product, "cushionLevel");
    const heel = readSpec(product, "heelStack");
    const midsole = readSpec(product, "midsole");
    const bits: string[] = [];
    if (level && !mentions(clean, String(level), "cushion", "stack", "plush")) {
      bits.push(`${String(level).replace(/-/g, " ")} cushioning`);
    }
    if (typeof heel === "number" && !mentions(clean, `${heel}`, "stack", "mm")) {
      bits.push(`${heel} mm heel stack`);
    }
    if (midsole && !mentions(clean, String(midsole), "foam", "zoomx", "react")) {
      bits.push(`${prettyWord(String(midsole))} foam`);
    }
    if (bits.length) {
      extras.push(`On the numbers: ${bits.join(", ")}.`);
    }
  }

  if (topic === "value") {
    // Keep the editorial value note; street price lives in the offers module.
  }

  if (topic === "stability") {
    const stability = readSpec(product, "stability");
    if (stability && !mentions(clean, String(stability), "stabil", "guidance", "neutral")) {
      extras.push(
        `Listed as ${String(stability).replace(/-/g, " ")} — buy for that need, not for cushioning alone.`,
      );
    }
  }

  return joinParas(clean, ...extras);
}

export function buildLongformSectionBody(
  topic: LongformTopic,
  product: Product,
  review: Review,
  brandName?: string,
): string {
  if (
    isPadelRacketCategory(product.categoryId) ||
    isPadelShoeCategory(product.categoryId) ||
    isPadelGripCategory(product.categoryId)
  ) {
    return buildPadelLongformSectionBody(topic as PadelLongformTopic, product, review);
  }
  const name = product.fullName;
  const brand = brandName?.trim();
  const strengths = strengthsOf(product, review);
  const weaknesses = weaknessesOf(product, review);
  const desc =
    product.shortDescription?.trim() ||
    review.summary.split(/[.!?]/)[0]?.trim() ||
    name;
  const buy = review.whoShouldBuy;
  const avoid = review.whoShouldAvoid;
  const brandLead =
    brand && !name.toLowerCase().startsWith(brand.toLowerCase())
      ? `${brand} `
      : "";
  const watch = isWatchFamily(product.categoryId);

  switch (topic) {
    case "overview":
      return joinParas(
        desc,
        product.verdict
          ? product.verdict
          : `${brandLead}${name} is built for a specific job in the category — use that job as your first filter.`,
        strengths.length
          ? `I'd shortlist it when you want ${softList(strengths)}.`
          : `Match it to the sessions you'll use it for most weeks.`,
        weaknesses.length
          ? skipSentenceFromLimitation(softList(weaknesses))
          : undefined,
        buy.length
          ? `The clearest buyer profile: ${buy.slice(0, 3).join("; ")}.`
          : undefined,
        avoid.length
          ? `The clearest skip signals: ${avoid.slice(0, 3).join("; ")}.`
          : undefined,
        review.bottomLine
          ? `Bottom line: ${review.bottomLine}`
          : review.verdict
            ? `Bottom line: ${review.verdict}`
            : `Bottom line: buy it for the primary job above, not as a one-tool-does-everything compromise.`,
        `Read the sections below for how it behaves in real sessions, where peers beat it, and whether the money matches the role.`,
      );

    case "specs": {
      const lines = formatSpecLines(product);
      const racket = isRacketFamily(product.categoryId);
      const fitness = isFitnessFamily(product.categoryId);
      return joinParas(
        `Here are the numbers that matter for the ${name}:`,
        lines.length
          ? lines.join("\n")
          : `A full published spec sheet is not in this guide — we stick to the design role and category placement rather than inventing numbers.`,
        watch
          ? `Battery, GNSS, maps, display type and sensors are filters — not the whole story. Real-world battery swings with multi-band GPS, music, maps and always-on display.`
          : racket
            ? `Weight, balance, head size / shape, stiffness and string pattern shape power vs control. Specs will not tell you whether the sweet spot forgives your miss-hits after a long set.`
            : fitness
              ? `Load range, footprint, adjustability and build materials decide whether this fits your space and progression — not marketing adjectives.`
              : isShoeFamily(product.categoryId)
                ? `Weight and stack shape how protective or lively a shoe feels; drop and geometry change the transition; stability and terrain labels tell you the intended job; width options change who can wear it.`
                : `Treat published specs as filters for capacity, weight, materials and intended use — then judge comfort and reliability in the role you actually need.`,
        watch
          ? `Specs will not tell you strap comfort after eight hours or whether the menus fit how you train. Try the case size on your wrist when you can, or buy somewhere returns are easy.`
          : racket
            ? `Demo when you can, or buy somewhere returns are easy. Two rackets with the same weight class can feel completely different once strung and in your hand.`
            : fitness
              ? `Measure your room, ceiling height and storage before you buy. A rack or bench that “fits” on paper still fails if plates, bars or walkways do not.`
              : isShoeFamily(product.categoryId)
                ? `Specs will not tell you blister risk, late-run foam feel or whether a guidance system suits your gait. Try before you commit when you can, or buy somewhere returns are easy.`
                : `Try before you commit when you can, or buy somewhere returns and sizing support are easy.`,
        `Use the rest of this review to translate those numbers into session advice — not as a hangtag to memorise.`,
      );
    }

    case "strengths":
      return joinParas(
        `I'd buy the ${name} when these outcomes match what you need most weeks:`,
        bulletBlock("What it does well", strengths),
        strengths[0]
          ? `The standout is ${strengths[0].charAt(0).toLowerCase()}${strengths[0].slice(1)}. If that is your main weekly need, keep going. If not, check trade-offs and alternatives.`
          : `Match the product to a clear job first, then compare peers.`,
        strengths.length > 1
          ? `Secondary reasons it stays on a shortlist: ${softList(strengths.slice(1), 3)}.`
          : undefined,
        scoreNote(review, "cushioning") ||
          scoreNote(review, "responsiveness") ||
          scoreNote(review, "comfort") ||
          scoreNote(review, "training-features") ||
          scoreNote(review, "maps") ||
          scoreNote(review, "power") ||
          scoreNote(review, "control") ||
          scoreNote(review, "stability"),
        buy.length ? `Best for: ${buy.join("; ")}.` : undefined,
        `If none of those strengths show up in your typical week, a cheaper or more specialized peer will usually feel like a better buy — even when this product scores well overall.`,
      );

    case "tradeoffs":
      return joinParas(
        `The ${name} is not trying to do every job. These are the compromises to weigh:`,
        weaknesses.length
          ? weaknesses.map((i) => `• ${i}`).join("\n")
          : "• A different category role fits your main use better",
        avoid.length ? `Skip it if: ${avoid.join("; ")}.` : undefined,
        `Those limits matter when they hit your primary sessions — not when they only show up once a month. If your week sits outside this product's job, pick a peer built for that job instead.`,
        weaknesses.length > 1
          ? `The compromise people regret most is usually ${weaknesses[0].charAt(0).toLowerCase()}${weaknesses[0].slice(1)} — especially if that friction appears twice a week or more.`
          : undefined,
        `I'd rather own a clear specialist and rotate than force one product to cover every edge case.`,
      );

    case "fit": {
      if (watch) {
        const caseSize = readSpec(product, "caseSizeMm");
        const weight = readSpec(product, "weight");
        const compact = readSpec(product, "compactFit");
        return joinParas(
          `On-wrist comfort matters as much as the feature list on the ${name} — you wear it all day, not just for the run.`,
          typeof caseSize === "number"
            ? `Listed case size is about ${caseSize} mm. That is the number to compare if you are coming from a smaller Forerunner, COROS Pace, or a slim smartwatch.`
            : `Confirm case size against what you wear now. Jumping up a size class is the usual reason a “feature flagship” feels bulky mid-week.`,
          typeof weight === "number"
            ? `Published weight is about ${weight} g — light enough for all-day wear for most runners, but strap choice still changes how it sits.`
            : undefined,
          compact
            ? `This line includes a compact / small-wrist option — use it if larger cases print on the top of your wrist.`
            : undefined,
          `Expect quick-release bands and typical optical HR placement on the case back. If the strap digs or the case overhangs your wrist bone on day one, change strap length or case size — do not wait for “break-in.”`,
          weaknesses.some((w) => /fit|wrist|bulk|heavy|size/i.test(w))
            ? `Comfort caveats to take seriously: ${softList(weaknesses.filter((w) => /fit|wrist|bulk|heavy|size/i.test(w)))}.`
            : undefined,
          `I'd try it on before a long training block if you can — case height and strap feel show up on desk days as much as on long runs.`,
          `If you train with a chest strap sometimes, make sure the watch still feels calm when you are not relying on optical HR alone — comfort is a daily tax.`,
        );
      }

      if (isRacketFamily(product.categoryId)) {
        const balance = readSpec(product, "balance");
        const weight = readSpec(product, "weight");
        const weightClass = readSpec(product, "weightClass");
        const shape = readSpec(product, "shape");
        const stiffness = readSpec(product, "stiffness");
        return joinParas(
          `Feel and handling on the ${name} decide whether you trust it late in a match — not the marketing shape name alone.`,
          weight != null || weightClass
            ? `Weight context: ${[
                weight != null ? `${asText(weight)}${typeof weight === "number" ? " g" : ""}` : null,
                weightClass ? `${asText(weightClass)} class` : null,
              ]
                .filter(Boolean)
                .join(" / ")}. Heavier frames can plough through contact; lighter ones swing faster but punish poor timing.`
            : `Confirm the strung weight and balance against what you play now before you assume “power” or “control” from the model name.`,
          balance
            ? `Balance is listed as ${prettyWord(String(balance)).toLowerCase()} — that shifts how head-light or head-heavy the racket feels through the swing.`
            : undefined,
          shape
            ? `Shape / head geometry: ${prettyWord(String(shape)).toLowerCase()}. That changes sweet-spot height and how forgiving miss-hits feel.`
            : undefined,
          stiffness
            ? `Stiffness / beam feel: ${prettyWord(String(stiffness)).toLowerCase()}. Stiffer frames can feel crisper and more powerful; softer ones often feel arm-friendlier on long blocks.`
            : undefined,
          `I'd demo for at least a set if you can. Grip size, string bed and balance together matter more than any single catalog number.`,
          weaknesses.some((w) => /arm|harsh|heavy|demand|control|power|stiff/i.test(w))
            ? `Handling caveats: ${softList(weaknesses.filter((w) => /arm|harsh|heavy|demand|control|power|stiff/i.test(w)))}.`
            : undefined,
          buy.length
            ? `Players who usually like this feel profile: ${buy.slice(0, 2).join("; ")}.`
            : `If you already like this brand’s current generation, start there and judge whether this model is a true step or just a paint job.`,
          `If your elbow or shoulder complains after hard weeks, prioritize comfort and string choice over chasing the stiffest “pro” frame.`,
        );
      }

      if (isFitnessFamily(product.categoryId) || !isShoeFamily(product.categoryId)) {
        const footprint = readSpec(product, "footprint");
        const weightRange = readSpec(product, "weightRange");
        const capacity = readSpec(product, "capacityMl") ?? readSpec(product, "vestCapacity");
        return joinParas(
          isFitnessFamily(product.categoryId)
            ? `Setup and ergonomics make or break the ${name} in a real garage or spare room — not the brochure photo.`
            : `Daily use and on-body fit decide whether the ${name} stays in rotation or becomes closet clutter.`,
          footprint
            ? `Footprint / space claim: ${asText(footprint)}. Measure the actual clear floor, door swings and plate storage before you commit.`
            : isFitnessFamily(product.categoryId)
              ? `Measure depth, width and ceiling clearance including bar path and safety pins — catalog footprints often ignore working space.`
              : undefined,
          weightRange
            ? `Load / adjustment range: ${asText(weightRange)}. Buy for the top end you will actually progress into over 12–24 months, not only what you lift this month.`
            : undefined,
          capacity
            ? `Capacity: ${asText(capacity)}. Match that to the longest session you do most weeks, not a once-a-year adventure.`
            : undefined,
          `I'd check adjustment speed, contact points and whether you can get in and out of the movement without fighting the hardware.`,
          weaknesses.length
            ? `Ownership friction to expect: ${softList(weaknesses, 3)}.`
            : undefined,
          buy.length ? `Best day-to-day fit for: ${buy.slice(0, 3).join("; ")}.` : undefined,
          avoid.length
            ? `Awkward fit for: ${avoid.slice(0, 3).join("; ")}.`
            : undefined,
          `If setup takes longer than the session or the contact points dig, you will stop using it — that is a worse “deal” than paying more for something you actually finish workouts on.`,
        );
      }

      const widths = readSpec(product, "widthOptions");
      const upper = readSpec(product, "upper");
      const level = readSpec(product, "cushionLevel");
      const feel = readSpec(product, "cushionFeel");
      const stability = readSpec(product, "stability");
      const widthText = widths
        ? Array.isArray(widths)
          ? widths.join(", ")
          : asText(widths)
        : undefined;
      const limitedWidths =
        widthText &&
        /^(standard|regular|d|medium)$/i.test(
          widthText.replace(/\s+/g, " ").trim(),
        );
      const hasWide =
        widthText && /wide|2e|4e|extra/i.test(widthText);
      const tallSoft =
        /high|maximum|max/i.test(String(level ?? "")) ||
        /plush|soft/i.test(String(feel ?? ""));
      const isGuidance =
        !!stability &&
        /stabil|guidance|support|motion/i.test(String(stability)) &&
        !/^neutral$/i.test(String(stability).replace(/-/g, " "));
      const fitWeak = weaknesses.filter((w) =>
        /fit|narrow|wide|volume|aggressive|sizing|last|short|snug/i.test(w),
      );

      return joinParas(
        brand
          ? `If you already run in ${brand} dailies, start with your usual length in the ${name} and judge width and volume on an easy jog — not standing still in the shop.`
          : `Start with your usual length in the ${name}, then check width and volume on an easy jog before you commit.`,
        limitedWidths
          ? `Width is ${widthText} only. That suits average-to-narrow feet who already like this brand’s last. If you need wide or extra-wide, Brooks (Ghost/Glycerin/GTS) or other brands with a real width ladder are clearer picks than hoping this mesh stretches.`
          : hasWide
            ? `Widths include ${widthText}. Use that ladder — length alone will not fix a last that is too narrow or too roomy in the midfoot.`
            : `If you sit between sizes or need a wide last, try in store or buy somewhere returns are easy.`,
        tallSoft
          ? `This is a tall soft daily. Runners new to max cushion often feel more volume and less “ground” than in a firmer shoe like Pegasus or Ghost — give yourself a few easy sessions before declaring the fit wrong.`
          : undefined,
        isGuidance
          ? `Guidance geometry can change how the midfoot and heel hold feel versus a soft neutral. If you are new to stability shoes, try before a big block of miles.`
          : `Neutral last — no medial post. It suits runners who already like neutrals and want comfort for easy/long road miles, not race lockdown.`,
        upper
          ? `The upper is ${prettyWord(String(upper)).toLowerCase()}. Expect familiar lockdown if you know this brand’s trainers; lace for easy miles first, then check heel slip and toe-box pressure.`
          : undefined,
        `Best fit match: average-volume feet on easy and recovery days. Less ideal: wide forefeet needing 2E/4E, very high insteps that fight a snug midfoot, or anyone shopping one shoe for both easy miles and race-day snugness.`,
        fitWeak.length ? `Fit caveats to take seriously: ${softList(fitWeak)}.` : undefined,
        `Wear the socks you train in. If heel slip or hot spots show up in the first easy session, change size/width or last — do not hope break-in will rewrite the shoe.`,
      );
    }

    case "cushioning": {
      const level = readSpec(product, "cushionLevel");
      const feel = readSpec(product, "cushionFeel");
      const heel = readSpec(product, "heelStack");
      const fore = readSpec(product, "forefootStack");
      const midsole = readSpec(product, "midsole");
      const drop = readSpec(product, "drop");
      const softStrengths = strengths.filter((s) =>
        /cushion|soft|plush|stack|protective|foam/i.test(s),
      );
      const cushionWeak = weaknesses.filter((w) =>
        /firm|plush|cushion|soft|hardpack|dead|harsh|snappy/i.test(w),
      );
      const softLane =
        /plush|soft/i.test(String(feel ?? "")) ||
        /high|maximum|max/i.test(String(level ?? ""));
      const stackLine =
        typeof heel === "number" && typeof fore === "number"
          ? `${heel} mm heel / ${fore} mm forefoot`
          : typeof heel === "number"
            ? `${heel} mm heel stack`
            : null;

      return joinParas(
        softLane
          ? `Cushioning is the point of the ${name}: ${
              String(level ?? "high").replace(/-/g, " ")
            } and ${String(feel ?? "plush").replace(/-/g, " ")} underfoot for easy, recovery and long road miles — not for tempo or race day.`
          : `Cushioning on the ${name} is tuned for its daily role first. Match that lane to your week before you buy on foam names alone.`,
        midsole || stackLine || typeof drop === "number"
          ? [
              midsole ? `${prettyWord(String(midsole))} foam` : null,
              stackLine,
              typeof drop === "number" ? `${drop} mm drop` : null,
            ]
              .filter(Boolean)
              .join(", ")
              .replace(/^/, "On the numbers: ")
              .concat(".")
          : undefined,
        softStrengths.length
          ? `What you are buying: ${softList(softStrengths)}.`
          : undefined,
        softLane
          ? `Compared with a firmer daily (Pegasus, Ghost), this should feel more protective and less connected. Compared with a workout/race shoe (Endorphin Speed, Vaporfly), it will feel soft and slow — that is correct for the job.`
          : `If your week is mostly easy miles, prioritise protection. If your week is workouts and races, a firmer or plated shoe usually fits better.`,
        cushionWeak.length
          ? `The flip side: ${softList(cushionWeak)}. If you want pop for intervals, pick a different cushioning lane instead of forcing this foam to go fast.`
          : undefined,
        `Heel strikers and runners who want soft landings on tired legs usually like this brief. Forefoot strikers who want ground feel, and anyone doing weekly speed work in one shoe, often will not.`,
        `New to tall soft stacks? Use easy days first. The platform can feel tippier or less precise until your legs adapt — then decide if the plushness is worth it for your long runs.`,
      );
    }

    case "ride": {
      const ride = readSpec(product, "rideCharacter");
      const energy = readSpec(product, "energyReturn");
      const flex = readSpec(product, "flexibility");
      const plate = readSpec(product, "plate");
      const plateMaterial = readSpec(product, "plateMaterial");
      const drop = readSpec(product, "drop");
      const level = readSpec(product, "cushionLevel");
      const feel = readSpec(product, "cushionFeel");
      const softLane =
        /plush|soft/i.test(String(feel ?? "")) ||
        /high|maximum|max/i.test(String(level ?? ""));
      const hasPlate =
        plate === true || plate === "yes" || plate === "true";

      return joinParas(
        softLane
          ? `Ride the ${name} for easy and recovery road miles: soft, protective, and calmer than a mixed-week daily. It is not trying to feel like a tempo shoe.`
          : hasPlate
            ? `Ride the ${name} when you want a more propulsive, workout- or race-oriented stride — not as a pure recovery slipper.`
            : `How the ${name} rides should match the sessions you will wear it for most weeks.`,
        ride || energy || flex || typeof drop === "number"
          ? [
              ride
                ? `character is ${String(ride).replace(/-/g, " ")}`
                : null,
              energy
                ? String(energy).toLowerCase() === "high"
                  ? "noticeable bounce when you open the pace"
                  : String(energy).toLowerCase() === "low"
                    ? "quieter response"
                    : `${String(energy).replace(/-/g, " ")} energy return`
                : null,
              flex
                ? `${String(flex).replace(/-/g, " ")} flexibility`
                : null,
              typeof drop === "number"
                ? `${drop} mm drop shaping the heel-to-toe transition`
                : null,
              hasPlate
                ? plateMaterial &&
                  String(plateMaterial).toLowerCase() !== "none"
                  ? `a ${String(plateMaterial).replace(/-/g, " ")} plate`
                  : "a plate in the midsole"
                : "no plate",
            ]
              .filter(Boolean)
              .join("; ")
              .replace(/^/, "Underfoot: ")
              .concat(".")
          : undefined,
        strengths[0]
          ? `That lines up with its main job: ${strengths[0].charAt(0).toLowerCase()}${strengths[0].slice(1)}.`
          : undefined,
        softLane
          ? `I'd use it for easy days, recovery, and soft long runs. I'd keep workouts in something snappier (Endorphin Speed, Superblast, Boston) and race day in a racer (Vaporfly / Alphafly class) — not in this shoe.`
          : hasPlate
            ? `I'd use it for quality sessions and faster long runs. I'd keep pure recovery in a softer daily so you do not beat up your legs in a stiff platform every day.`
            : `Match the ride to your week. Crossing lanes without a reason is how people end up with a closet of almost-right shoes.`,
        weaknesses.length
          ? `Where the ride frustrates people: ${softList(weaknesses, 3)}.`
          : undefined,
        typeof drop === "number"
          ? `${drop} mm drop is familiar for many road runners — it will not feel like a zero-drop shoe, and it will not feel like an aggressive race geometry either.`
          : undefined,
      );
    }

    case "stability": {
      const stability = readSpec(product, "stability");
      const level = readSpec(product, "cushionLevel");
      const feel = readSpec(product, "cushionFeel");
      const widths = readSpec(product, "widthOptions");
      const stabLabel = stability
        ? String(stability).replace(/-/g, " ")
        : "neutral";
      const isNeutral = /^neutral$/i.test(stabLabel);
      const isGuidance =
        /stabil|guidance|support|motion/i.test(stabLabel) && !isNeutral;
      const tallSoft =
        /high|maximum|max/i.test(String(level ?? "")) ||
        /plush|soft/i.test(String(feel ?? ""));
      const widthText = widths
        ? Array.isArray(widths)
          ? widths.join(", ")
          : asText(widths)
        : undefined;
      const limitedWidths =
        widthText &&
        /^(standard|regular|d|medium)$/i.test(
          widthText.replace(/\s+/g, " ").trim(),
        );
      const stabWeak = weaknesses.filter((w) =>
        /stabil|guidance|support|tippy|unstable|soft underfoot/i.test(w),
      );

      if (isGuidance) {
        return joinParas(
          `The ${name} is a ${stabLabel} shoe. Buy it when you need guidance on easy and long road days — not when you only want softer foam.`,
          `Happy neutral runners usually feel this as heavier or less lively than a soft neutral in the same brand. That trade-off is the point of the category.`,
          `Suited to runners who already use guidance (or have been steered there by a clinician/coach) and want a daily/long-run platform. Less suited to neutrals chasing bounce, race-day stiffness, or trail support.`,
          widthText
            ? limitedWidths
              ? `Only ${widthText} width — get length and midfoot hold right before you judge the guidance.`
              : `Available in ${widthText}. Width and volume change how planted the guidance feels; a too-narrow last can feel tippy even when the medial support is correct.`
            : undefined,
          stabWeak.length ? `Caveat: ${softList(stabWeak)}.` : undefined,
          `If you do not need guidance, pick the brand’s neutral daily instead of overbuying structure.`,
        );
      }

      return joinParas(
        `The ${name} is neutral — no guidance post or medial rail. It suits runners who already run happily in neutrals and want ${
          tallSoft ? "plush easy/recovery protection" : "this shoe’s daily role"
        }.`,
        tallSoft
          ? `Tall soft foam can feel less planted than a firmer daily (Pegasus, Ghost). That is stack height and plushness, not a hidden stability feature. If you want more control at this cushion level, compare a mild-stability peer (Structure, Adrenaline GTS, Kayano) instead of forcing this shoe to do guidance work.`
          : `If a coach or clinician has you in guidance shoes, this is the wrong lane — look at Kayano, Adrenaline or Structure-class peers.`,
        `Foot and style fit: average-volume neutral strikers on road easy days. Less ideal: runners who need medial support, wide feet in a standard-only width, or anyone who feels insecure on tall soft stacks at tired-end long-run pace.`,
        limitedWidths
          ? `Only ${widthText} width. A wide foot on a tall soft stack often feels less secure than the “neutral” label suggests — try before you commit, or pick a brand with a real width ladder.`
          : widthText
            ? `Available in ${widthText}. Fit volume changes how stable the platform feels under you.`
            : undefined,
        stabWeak.length
          ? `Stability-related caveat: ${softList(stabWeak)}.`
          : undefined,
      );
    }

    case "grip": {
      const grip = readSpec(product, "grip");
      const outsole = readSpec(product, "outsole");
      const terrain = readSpec(product, "terrain");
      const surface = readSpec(product, "surface");
      const terrainText = terrain ?? surface;
      const terrainJoined = [terrainText]
        .flatMap((v) =>
          Array.isArray(v) ? v : v != null ? [String(v)] : [],
        )
        .join(", ");
      const roadFocused =
        !terrainJoined || /road|treadmill|asphalt/i.test(terrainJoined);
      const trailFocused = /trail|mud|mixed/i.test(terrainJoined);
      const gripStrengths = strengths.filter((s) =>
        /grip|traction|mud|court|wet|lug/i.test(s),
      );

      return joinParas(
        roadFocused && !trailFocused
          ? `The ${name} wears a road outsole — pavement, bike paths, sidewalks and treadmill. It is not a trail shoe, and deep mud or wet roots will show that quickly.`
          : trailFocused
            ? `The ${name} is set up for ${terrainJoined.replace(/-/g, " ")}. Buy it for those surfaces, not as a pure road daily.`
            : `Match the ${name} outsole to the surfaces you actually run most weeks.`,
        outsole
          ? `Outsole build: ${prettyWord(String(outsole)).toLowerCase()}${
              grip ? ` with a ${String(grip).replace(/-/g, " ")} grip brief` : ""
            }.`
          : grip
            ? `Grip brief: ${String(grip).replace(/-/g, " ")}.`
            : undefined,
        roadFocused
          ? `On wet painted lines, metal covers and early-morning damp asphalt, road rubber is about reliable contact — not aggressive lugs. If most of your miles are soft singletrack, buy a trail shoe instead of wishing this one had bite.`
          : `On soft singletrack, lug bite and mud shedding matter more than smooth road pods. If most of your miles are asphalt, do not buy aggressive trail rubber you will never use.`,
        gripStrengths.length
          ? `Where this outsole helps: ${softList(gripStrengths)}.`
          : undefined,
        `For durability of grip, watch the heel and forefoot pods on abrasive city routes. Once the rubber is shiny and the shoe feels skittish on wet paint, it is time to retire or rotate — not when the upper still looks new.`,
      );
    }

    case "upper": {
      const upper = readSpec(product, "upper");
      const breath = readSpec(product, "breathability");
      const widths = readSpec(product, "widthOptions");
      const widthText = widths
        ? Array.isArray(widths)
          ? widths.join(", ")
          : asText(widths)
        : undefined;
      const limitedWidths =
        widthText &&
        /^(standard|regular|d|medium)$/i.test(
          widthText.replace(/\s+/g, " ").trim(),
        );
      const upperWeak = weaknesses.filter((w) =>
        /upper|mesh|hot|breath|lace|heel slip|lockdown/i.test(w),
      );

      return joinParas(
        upper
          ? `The ${name} uses ${prettyWord(String(upper)).toLowerCase()}. If you already like this brand’s dailies, lockdown should feel familiar once you lace for an easy run.`
          : `Treat the upper as lockdown and breathability — try it laced for an easy run, not just standing in the shop.`,
        breath
          ? `Breathability is ${String(breath).replace(/-/g, " ")} — fine for most road weather; less of a winter boot, more of a training upper.`
          : undefined,
        limitedWidths
          ? `Only ${widthText} width, so midfoot hold and toe-box volume matter more than the mesh marketing name. Wide forefeet should try on or look at a brand with 2E/4E options.`
          : widthText
            ? `Available in ${widthText}. Use width to fix volume issues before you blame the knit.`
            : undefined,
        `Lockdown check: heel should stay put on strides, tongue should not dig, and the midfoot should feel secure without hot spots after 20–30 easy minutes. Race-snug is the wrong target for a soft daily.`,
        upperWeak.length ? `Watch: ${softList(upperWeak)}.` : undefined,
        `If heel slip or hot spots show up in the first easy session, size/width is wrong or this last is not for you — do not hope break-in will rewrite the upper.`,
      );
    }

    case "durability": {
      if (!isShoeFamily(product.categoryId)) {
        return joinParas(
          `Ownership life on the ${name} depends on how hard you use the contact points that actually wear — not how new it looks on day one.`,
          isRacketFamily(product.categoryId)
            ? `On rackets, watch bumper guard, grommets, grip wrap and whether the hoop still feels solid after frame scrapes. Restring before the bed goes false — dead strings feel like a “dead racket.”`
            : isFitnessFamily(product.categoryId)
              ? `On home-gym gear, watch welds, upholstery, bushings, knurling bite and whether adjusters still lock cleanly after dusty garage months.`
              : `Watch straps, zippers, bladder ports, foam collapse, charging ports and any moving parts you load every week.`,
          strengths.some((s) => /durab|warranty|build|steel|solid/i.test(s))
            ? `Build strengths that help longevity: ${softList(strengths.filter((s) => /durab|warranty|build|steel|solid/i.test(s)), 3)}.`
            : undefined,
          weaknesses.some((w) => /durab|wear|cheap|plast|flex|wobble|tear/i.test(w))
            ? `Wear points to watch: ${softList(weaknesses.filter((w) => /durab|wear|cheap|plast|flex|wobble|tear/i.test(w)), 3)}.`
            : undefined,
          `I'd budget for consumables (strings, grips, tips, straps, filters) separately from the sticker price — that is part of real cost of ownership.`,
          `Retire or service the product when safety or the primary feel goes off, not when the cosmetic finish still looks fine.`,
          buy.length
            ? `Longevity is most worthwhile when you match the buyer profile: ${buy.slice(0, 2).join("; ")}.`
            : undefined,
        );
      }

      const midsole = readSpec(product, "midsole");
      const outsole = readSpec(product, "outsole");
      const level = readSpec(product, "cushionLevel");
      const feel = readSpec(product, "cushionFeel");
      const terrain = readSpec(product, "terrain");
      const surface = readSpec(product, "surface");
      const foamLabel = midsole ? prettyWord(String(midsole)) : null;
      const softFoam =
        /plush|soft/i.test(String(feel ?? "")) ||
        /high|maximum|max/i.test(String(level ?? "")) ||
        /zoomx|reactx|blast|fresh foam|fuelcell|nitrogen|cmvea|cmeva/i.test(
          String(midsole ?? ""),
        );
      const terrainJoined = [terrain, surface]
        .flatMap((v) =>
          Array.isArray(v) ? v : v != null ? [String(v)] : [],
        )
        .join(" ");
      const roadFocused =
        !terrainJoined || /road|treadmill|asphalt/i.test(terrainJoined);
      const trailFocused = /trail|mud|mixed/i.test(terrainJoined);
      const durWeak = weaknesses.filter((w) =>
        /durab|wear|upper|outsole|foam|pack|flat/i.test(w),
      );

      return joinParas(
        softFoam
          ? `I'd treat the ${name} as a soft daily you rotate. ${
              foamLabel
                ? `${foamLabel} feels great early`
                : "This plush stack feels great early"
            }, then goes flatter sooner than a firmer workhorse if every easy mile lives in the same pair.`
          : `I'd expect the ${name} to hold up like a solid daily in its class if you stick to the surfaces it was built for.`,
        roadFocused && !trailFocused
          ? `Road rubber is for pavement and treadmill. Rough concrete and grit chew heel and forefoot pods faster than soft paths — watch those contact patches, and retire the shoe when the ride goes dead, not when the upper still looks new.`
          : trailFocused
            ? `Trail rubber and lugs take the hit on rock and mud. Once the bite is gone or the foam feels dead underfoot, it is time.`
            : `Harsh routes age foam and rubber faster than soft paths — match expectations to your week.`,
        outsole
          ? `You are mostly watching ${prettyWord(String(outsole)).toLowerCase()} contact zones and how protective the midsole still feels late in a long easy run.`
          : undefined,
        softFoam
          ? `Compared with a firmer daily (Pegasus / Ghost class), expect earlier midsole fade if you refuse to rotate. Compared with a race shoe, this should still outlast race-day foam used as a daily — as long as you keep speed work elsewhere.`
          : undefined,
        durWeak.length ? `Extra caution: ${softList(durWeak)}.` : undefined,
        `Practical plan: pair soft easy miles here with a firmer daily for mixed weeks. That is usually how you get good value and consistent feel from a plush shoe.`,
        `Log miles if you can. Most runners wait too long after the shoe has already gone flat on long runs.`,
      );
    }

    case "usecase":
      return joinParas(
        `I'd buy the ${name} when most of your weekly sessions match what it does well.`,
        bulletBlock("Best for", [
          ...buy.slice(0, 4),
          ...strengths.slice(0, 3),
        ].filter((v, i, a) => a.indexOf(v) === i)),
        bulletBlock("Who should skip", [
          ...avoid.slice(0, 4),
          ...weaknesses.slice(0, 3),
        ].filter((v, i, a) => a.indexOf(v) === i)),
        `If more than half your week sits in the “who should skip” list, open the alternatives instead of forcing a compromise.`,
        `A practical test: write down your next four weeks of sessions. If three of them match this product's strengths, shortlist it. If two or fewer do, you are shopping the wrong lane.`,
        review.alternativeProductIds?.length
          ? `When the fit is close but not clean, compare the linked alternatives on this page before you stretch the role.`
          : `When the fit is close but not clean, compare one cheaper peer and one premium peer in the same role before you stretch this product.`,
      );

    case "value":
      return joinParas(
        strengths.length
          ? `You are mainly paying for ${softList(strengths, 4)}.`
          : `Value on the ${name} depends on whether you will use its main job most weeks.`,
        weaknesses.length
          ? `You are also accepting ${softList(weaknesses, 3)} — fine when that is not your weekly mix.`
          : undefined,
        buy.length ? `Strongest value for: ${buy.join("; ")}.` : undefined,
        avoid.length
          ? `Weaker value for: ${avoid.join("; ")}.`
          : undefined,
        `Check live street price in the offers module. I'd pay the premium when the role is clear; otherwise compare the linked alternatives or a prior generation on sale.`,
        `Cost per hard-use session matters more than sticker shock. A cheaper product you avoid after two weeks is the expensive one.`,
        `If two peers cover the same job, pick the one you will actually use with your current schedule — not the one with the denser feature list.`,
      );

    case "tech": {
      const battery = readSpec(product, "batteryLife");
      const gps = readSpec(product, "gps");
      const display = readSpec(product, "display");
      const maps = readSpec(product, "maps");
      const weight = readSpec(product, "weight");
      const defs = getSpecificationDefinitions(product.categoryId);
      const parts: string[] = [];
      if (battery != null) {
        const unit = defs.find((d) => d.key === "batteryLife")?.unit;
        parts.push(
          `about ${asText(battery)}${unit ? ` ${unit}` : ""} of battery life`,
        );
      }
      if (gps) parts.push(`${prettyWord(String(gps))} GPS / positioning`);
      if (display)
        parts.push(`a ${prettyWord(String(display)).toLowerCase()} display`);
      if (maps) parts.push(`maps: ${asText(maps)}`);
      if (typeof weight === "number") {
        const unit = defs.find((d) => d.key === "weight")?.unit ?? "g";
        parts.push(`${weight} ${unit}`);
      }
      if (watch) {
        return joinParas(
          parts.length
            ? `On paper, the ${name} brings ${parts.join(", ")}.`
            : `Here's what the ${name} offers on the feature sheet, based on published specs and what is normal in this category.`,
          desc,
          `Prioritise the capabilities you will use every week. Spec sheets are easy to overbuy — battery, GNSS, maps, sensors and smart notifications only matter if they change how you train or recover.`,
          strengths.length
            ? `Feature strengths that matter in practice: ${strengths.slice(0, 4).join("; ")}.`
            : undefined,
          weaknesses.length
            ? `Feature trade-offs to weigh: ${weaknesses.slice(0, 3).join("; ")}.`
            : undefined,
          `Battery claims assume a usage profile. Always-on displays, music storage, multi-band GNSS and cold weather all move real-world numbers. If you care about multi-day adventures, size the watch by your worst-case activity mix, not the marketing headline.`,
          `Ecosystem lock-in is part of value: phone OS compatibility, coach platforms, and whether you already own heart-rate straps or sensors. Switching brands has a switching cost beyond the sticker price.`,
        );
      }
      return joinParas(
        `Construction and design details on the ${name} should explain how it behaves — not just decorate the hangtag.`,
        desc,
        parts.length
          ? `Published design markers include ${parts.join(", ")}.`
          : formatSpecLines(product).length
            ? `Key construction markers sit in the specs list above — read them as filters for the role, not as proof of quality alone.`
            : undefined,
        strengths.length
          ? `Design choices that help in practice: ${softList(strengths, 4)}.`
          : undefined,
        weaknesses.length
          ? `Design compromises to accept: ${softList(weaknesses, 3)}.`
          : undefined,
        isRacketFamily(product.categoryId)
          ? `String choice, tension and grip build change the finished feel as much as the molded frame. Budget a setup you will actually maintain.`
          : isFitnessFamily(product.categoryId)
            ? `Hardware quality shows up in adjusters, bushings, knurling and how the unit sits on imperfect floors. Fancy coatings matter less than secure locks.`
            : `Materials, closure systems and serviceable parts decide whether this stays reliable after sweaty months.`,
        `If a feature does not change your weekly sessions, do not pay a premium for it.`,
      );
    }

    case "performance":
      if (watch) {
        return joinParas(
          `Everyday performance on the ${name} is about training workflows you will actually open — not a feature checklist.`,
          bulletBlock("Where it is set up to perform", strengths.slice(0, 5)),
          weaknesses.length
            ? bulletBlock("Where it is less convincing", weaknesses.slice(0, 4))
            : `Outside dense training weeks, a simpler GPS watch may feel like less friction for the same miles.`,
          `Expect structured workouts, recovery scores, maps/navigation (when equipped), and multi-sport profiles to shape the week. Battery claims assume a usage profile — multi-band GNSS, music, maps and always-on display move the real number.`,
          buy.length ? `Best performance fit: ${buy.join("; ")}.` : undefined,
          avoid.length
            ? `Weaker performance fit: ${avoid.join("; ")}.`
            : undefined,
          `Judge it for the sessions you run most weeks. A maps-and-metrics flagship will feel overbuilt if you only want pace and distance.`,
          `I'd rather master three features you use daily than chase a denser menu you ignore after week two.`,
        );
      }
      return joinParas(
        desc,
        `Performance for the ${name} should be read through intended use. Category-leading numbers in the wrong session still feel like a miss.`,
        bulletBlock("Where it is set up to perform", strengths.slice(0, 5)),
        weaknesses.length
          ? bulletBlock("Where it is less convincing", weaknesses.slice(0, 4))
          : `Outside its main role, expect compromises versus purpose-built alternatives.`,
        buy.length ? `Best performance fit: ${buy.join("; ")}.` : undefined,
        avoid.length
          ? `Weaker performance fit: ${avoid.join("; ")}.`
          : undefined,
        isRacketFamily(product.categoryId)
          ? `On court, judge plow-through, sweet-spot forgiveness, spin access and whether you still trust the frame when you are tired — not a single practice swing in the shop.`
          : isFitnessFamily(product.categoryId)
            ? `In session, judge stability under load, adjustment speed between sets and whether the movement pattern stays honest when you are fatigued.`
            : `In hard use, judge whether the product still does the primary job when you are tired, rushed or on your third session of the week.`,
        `Judge it for the sessions it was built for. A race-oriented product will “win” a sprint feel test that a daily tool was never meant to take — that does not make the daily tool bad.`,
        `If your week is mixed, be honest about which session type owns the purchase. Split duties across two products when one role keeps compromising the other.`,
      );

    default:
      return joinParas(
        desc,
        strengths.length
          ? `It stands out for: ${softList(strengths, 4)}.`
          : `Judge the ${name} against the job you need done most often.`,
        weaknesses.length
          ? `Trade-offs: ${softList(weaknesses, 3)}.`
          : undefined,
        buy.length ? `Best for: ${buy.join("; ")}.` : undefined,
        avoid.length ? `Not ideal for: ${avoid.join("; ")}.` : undefined,
        `If the job is unclear, stop and name the weekly session this has to win before you compare prices.`,
      );
  }
}

/**
 * Extra product-focused paragraphs when a section is still short after the
 * primary longform pass — used to reach REVIEW_MIN_WORDS without meta filler.
 */
export function extendLongformSectionBody(
  topic: LongformTopic,
  product: Product,
  review: Review,
  brandName?: string,
  pass = 1,
): string {
  if (
    isPadelRacketCategory(product.categoryId) ||
    isPadelShoeCategory(product.categoryId) ||
    isPadelGripCategory(product.categoryId)
  ) {
    return extendPadelLongformSectionBody(
      topic as PadelLongformTopic,
      product,
      review,
      pass,
    );
  }
  const name = product.fullName;
  const strengths = strengthsOf(product, review);
  const weaknesses = weaknessesOf(product, review);
  const buy = review.whoShouldBuy;
  const avoid = review.whoShouldAvoid;
  const brand = brandName?.trim();

  if (pass === 1) {
    return joinParas(
      topic === "overview"
        ? `I'd explain the ${name} to a friend as a specialist for ${softList(strengths.length ? strengths : buy, 2) || "its listed role"} — not a default for every session.`
        : topic === "value"
          ? `If street price is volatile, decide on role first, then wait for a clean offer — do not let a discount talk you into the wrong job.`
          : topic === "tradeoffs"
            ? `Be blunt with yourself: which compromise would annoy you twice a week? That is the one that should veto the purchase.`
            : topic === "fit"
              ? `Fit only counts if it still feels right after a normal session — not after two minutes in a quiet shop.`
              : topic === "performance"
                ? `Performance claims only matter on the sessions you repeat. Ignore party tricks you will not use next month.`
                : `In practice, the ${name} earns its keep when ${softList(buy.length ? buy : strengths, 2) || "its primary job"} shows up often enough to justify owning it.`,
      weaknesses.length
        ? `If ${softList(weaknesses, 2)} is already a weekly problem in your gear drawer, this will not magically fix it.`
        : undefined,
      brand
        ? `Inside the ${brand} ladder, make sure this model is a real step for your need — not just the newest paint.`
        : undefined,
    );
  }

  if (pass === 2) {
    return joinParas(
      avoid.length
        ? `I'd stop the purchase if you mainly identify with: ${avoid.slice(0, 2).join("; ")}.`
        : `I'd stop the purchase if you cannot name the weekly session this has to win.`,
      review.bottomLine
        ? `Keep returning to the bottom line: ${review.bottomLine}`
        : `Keep returning to the primary job — feature lists are a distraction once the role is wrong.`,
      strengths.length
        ? `Re-check that you are actually buying ${softList(strengths, 2)} — not a vague “upgrade.”`
        : undefined,
    );
  }

  return joinParas(
    `If this section still feels undecided, compare one peer that wins the same job more cleanly before you stretch the ${name}.`,
    buy.length
      ? `Only continue if your week looks like: ${buy.slice(0, 2).join("; ")}.`
      : `Only continue if you can point to a recurring session this product must win.`,
  );
}

/** @deprecated No-op — meta floor padding removed (filler, not a review). */
export function padSectionBodyToFloor(
  body: string,
  _topic: LongformTopic,
  _product: Product,
  _review: Review,
): string {
  return body;
}

/**
 * Short product-focused close when a review is still thin.
 * Prefer real sections over this when possible.
 */
export function buildLengthPadding(
  product: Product,
  review: Review,
  brand?: Brand,
  variant: "checklist" | "decision" = "checklist",
): ContentSection {
  const name = product.fullName;
  const strengths = strengthsOf(product, review);
  const weaknesses = weaknessesOf(product, review);
  const buy = review.whoShouldBuy;
  const avoid = review.whoShouldAvoid;

  if (variant === "decision") {
    return {
      id: "sec-decision-guide",
      heading: "The call",
      body: joinParas(
        review.bottomLine ||
          review.verdict ||
          `Buy the ${name} when its main job matches your week; otherwise pick a peer.`,
        strengths.length
          ? `You are mainly paying for ${softList(strengths, 4)}.`
          : undefined,
        weaknesses.length
          ? `You are also accepting ${softList(weaknesses, 3)}.`
          : undefined,
        buy.length ? `Clearest yes: ${buy.slice(0, 3).join("; ")}.` : undefined,
        avoid.length ? `Clearest no: ${avoid.slice(0, 3).join("; ")}.` : undefined,
        brand?.name
          ? `Compare it inside the ${brand.name} ladder and against one rival that solves the same job.`
          : `Compare it against one cheaper peer and one premium peer in the same role.`,
        `If you still cannot say which weekly session this wins, do not buy yet.`,
      ),
      evidenceIds: review.evidenceIds,
    };
  }

  return {
    id: "sec-buying-checklist",
    heading: "Before you buy",
    body: joinParas(
      `Confirm the ${name} matches the sessions you will actually do most weeks.`,
      strengths.length ? `You want: ${softList(strengths, 4)}.` : undefined,
      weaknesses.length
        ? `You can live with: ${softList(weaknesses, 3)}.`
        : undefined,
      buy.length ? `Buyer profile check: ${buy.slice(0, 3).join("; ")}.` : undefined,
      avoid.length
        ? `Skip signals: ${avoid.slice(0, 3).join("; ")}.`
        : undefined,
      `Check fit/setup, live price and returns for your region — then decide.`,
      `If the role is only a maybe, open the alternatives on this page before you pay.`,
    ),
    evidenceIds: review.evidenceIds,
  };
}
