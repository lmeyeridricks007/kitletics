/**
 * Explainable padel racket decision attributes.
 * Scores are editorial judgments with provenance — never laboratory measurements.
 */

export const PADEL_DECISION_KEYS = [
  "power",
  "control",
  "forgiveness",
  "maneuverability",
  "comfort",
  "stability",
  "spin",
] as const;

export type PadelDecisionKey = (typeof PADEL_DECISION_KEYS)[number];

export type PadelEvidenceKind =
  | "MANUFACTURER_CLAIM"
  | "SPEC_INFERENCE"
  | "EXPERT_RESEARCH"
  | "FIRST_HAND_TEST";

export interface PadelDecisionAttribute {
  key: PadelDecisionKey;
  score: number;
  reasoning: string;
  evidenceKind: PadelEvidenceKind;
  evidenceIds: string[];
}

export interface PadelRacketPdpCopy {
  productId: string;
  whatItIs: string;
  whoItsFor: string;
  howItPlays: string;
  powerVsControl: string;
  handling: string;
  comfort: string;
  forgiveness: string;
  construction: string;
  bestFor: string[];
  notIdealFor: string[];
  buyIf: string[];
  skipIf: string[];
}

export const PADEL_DECISION_LABELS: Record<PadelDecisionKey, string> = {
  power: "Power",
  control: "Control",
  forgiveness: "Forgiveness",
  maneuverability: "Maneuverability",
  comfort: "Comfort",
  stability: "Stability",
  spin: "Spin",
};
