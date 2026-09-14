/**
 * Padel review outline — post-remediation Review architecture.
 * Court jobs only. Do not inherit running-shoe Ride / foam essays.
 */

export type PadelLongformTopic =
  | "overview"
  | "specs"
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
  | "strengths"
  | "weaknesses"
  | "bestFor"
  | "notIdeal"
  | "alternatives"
  | "comparisons"
  | "tradeoffs"
  | "usecase"
  | "value"
  | "methodology"
  | "sources"
  | "traction"
  | "courtFeel"
  | "support"
  | "fit"
  | "cushioning"
  | "stability"
  | "durability"
  | "generic";

export type PadelSectionBlueprint = {
  id: string;
  heading: string;
  topic: PadelLongformTopic;
};

export const PADEL_RACKET_BLUEPRINT: PadelSectionBlueprint[] = [
  { id: "sec-overview", heading: "Verdict", topic: "overview" },
  { id: "sec-usecase", heading: "Who it is for", topic: "usecase" },
  { id: "sec-tradeoffs", heading: "Who should avoid it", topic: "tradeoffs" },
  { id: "sec-construction", heading: "Construction", topic: "construction" },
  { id: "sec-shape", heading: "Shape and balance", topic: "shape" },
  { id: "sec-power", heading: "Power", topic: "power" },
  { id: "sec-control", heading: "Control", topic: "control" },
  { id: "sec-sweetspot", heading: "Sweet spot / forgiveness", topic: "sweetspot" },
  { id: "sec-maneuverability", heading: "Maneuverability", topic: "maneuverability" },
  { id: "sec-comfort", heading: "Comfort", topic: "comfort" },
  { id: "sec-spin", heading: "Spin", topic: "spin" },
  { id: "sec-defense", heading: "Defensive play", topic: "defense" },
  { id: "sec-net", heading: "Net play", topic: "net" },
  { id: "sec-attack", heading: "Smashes / attacking play", topic: "attack" },
  { id: "sec-serve", heading: "Serve / return", topic: "serve" },
  { id: "sec-strengths", heading: "Strengths", topic: "strengths" },
  { id: "sec-weaknesses", heading: "Weaknesses", topic: "weaknesses" },
  { id: "sec-best-for", heading: "Best For", topic: "bestFor" },
  { id: "sec-not-ideal", heading: "Not Ideal For", topic: "notIdeal" },
  { id: "sec-alternatives", heading: "Alternatives", topic: "alternatives" },
  { id: "sec-comparisons", heading: "Comparisons", topic: "comparisons" },
  { id: "sec-verified-specs", heading: "Specifications", topic: "specs" },
  { id: "sec-value", heading: "Value", topic: "value" },
  { id: "sec-methodology", heading: "Methodology", topic: "methodology" },
  { id: "sec-sources", heading: "Sources", topic: "sources" },
];

export const PADEL_SHOE_BLUEPRINT: PadelSectionBlueprint[] = [
  { id: "sec-overview", heading: "Verdict", topic: "overview" },
  { id: "sec-verified-specs", heading: "Specifications", topic: "specs" },
  { id: "sec-traction", heading: "Traction", topic: "traction" },
  { id: "sec-stability", heading: "Lateral stability", topic: "stability" },
  { id: "sec-court-feel", heading: "Court feel", topic: "courtFeel" },
  { id: "sec-cushioning", heading: "Cushioning", topic: "cushioning" },
  { id: "sec-support", heading: "Support", topic: "support" },
  { id: "sec-fit", heading: "Fit", topic: "fit" },
  { id: "sec-durability", heading: "Durability", topic: "durability" },
  { id: "sec-comfort", heading: "Comfort", topic: "comfort" },
  { id: "sec-strengths", heading: "Strengths", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Who should avoid it", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who it is for", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
  { id: "sec-methodology", heading: "Methodology", topic: "methodology" },
  { id: "sec-sources", heading: "Sources", topic: "sources" },
];

export const PADEL_GRIP_BLUEPRINT: PadelSectionBlueprint[] = [
  { id: "sec-overview", heading: "Verdict", topic: "overview" },
  { id: "sec-verified-specs", heading: "Specifications", topic: "specs" },
  { id: "sec-fit", heading: "Feel and wrap", topic: "fit" },
  { id: "sec-comfort", heading: "Comfort", topic: "comfort" },
  { id: "sec-durability", heading: "Replacement cycle", topic: "durability" },
  { id: "sec-strengths", heading: "Strengths", topic: "strengths" },
  { id: "sec-tradeoffs", heading: "Who should avoid it", topic: "tradeoffs" },
  { id: "sec-usecase", heading: "Who it is for", topic: "usecase" },
  { id: "sec-value", heading: "Value", topic: "value" },
  { id: "sec-methodology", heading: "Methodology", topic: "methodology" },
  { id: "sec-sources", heading: "Sources", topic: "sources" },
];

export const PADEL_RACKET_SECTION_IMAGE_TOPICS = [
  "overview",
  "specs",
  "construction",
  "shape",
  "power",
  "control",
  "sweetspot",
  "maneuverability",
  "comfort",
  "spin",
  "defense",
  "net",
  "attack",
  "serve",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
  "methodology",
  "sources",
] as const;

export const PADEL_SHOE_SECTION_IMAGE_TOPICS = [
  "overview",
  "specs",
  "traction",
  "stability",
  "courtFeel",
  "cushioning",
  "support",
  "fit",
  "durability",
  "comfort",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
  "methodology",
  "sources",
] as const;

export const PADEL_GRIP_SECTION_IMAGE_TOPICS = [
  "overview",
  "specs",
  "fit",
  "comfort",
  "durability",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
  "methodology",
  "sources",
] as const;

export function isPadelRacketCategory(categoryId: string): boolean {
  return categoryId === "cat-padel-rackets";
}

export function isPadelShoeCategory(categoryId: string): boolean {
  return categoryId === "cat-padel-shoes";
}

export function isPadelGripCategory(categoryId: string): boolean {
  return categoryId === "cat-padel-grips";
}

export function isPadelReviewCategory(categoryId: string): boolean {
  return (
    isPadelRacketCategory(categoryId) ||
    isPadelShoeCategory(categoryId) ||
    isPadelGripCategory(categoryId) ||
    categoryId === "cat-padel-balls" ||
    categoryId === "cat-padel-bags" ||
    categoryId === "cat-padel-accessories"
  );
}

export function padelTopicFromSection(
  id: string,
  heading: string,
): PadelLongformTopic | undefined {
  const hay = `${id} ${heading}`.toLowerCase();
  if (/method/.test(hay)) return "methodology";
  if (/\bsources?\b/.test(hay)) return "sources";
  if (/sec-weaknesses|\bweaknesses\b/.test(hay)) return "weaknesses";
  if (/sec-best-for|\bbest for\b/.test(hay)) return "bestFor";
  if (/sec-not-ideal|not ideal for/.test(hay)) return "notIdeal";
  if (/sec-alternatives|\balternatives\b/.test(hay)) return "alternatives";
  if (/sec-comparisons|\bcomparisons\b/.test(hay)) return "comparisons";
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
  if (/sec-comfort|^comfort$|heading: comfort/.test(hay) || /(?:^|\s)comfort(?:\s|$)/.test(hay)) {
    if (!/fit & comfort|on-wrist/.test(hay)) return "comfort";
  }
  return undefined;
}
