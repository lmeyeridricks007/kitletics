/**
 * Soft-goods / shoe PDP editorial model (rackets use PadelRacketPdpCopy).
 * Consumer prose only — never invent first-hand testing.
 */

export type PadelEditorialState =
  | "EDITORIAL_READY"
  | "EDITORIAL_LIGHT"
  | "NEEDS_RESEARCH"
  | "NOT_PUBLICATION_WORTHY";

export type PadelEditorialTier = "A" | "B" | "C";

export type PadelEditorialDepth =
  | "deep"
  | "substantive"
  | "light"
  | "blocked";

export type PadelEditorialCategory =
  | "rackets"
  | "shoes"
  | "balls"
  | "bags"
  | "grips"
  | "accessories";

export type PadelEditorialEvidenceBasis =
  | "manufacturer_specs"
  | "specialist_retail"
  | "curated_seed"
  | "catalog_inference"
  | "insufficient";

/**
 * Category-agnostic shopping decision copy for soft goods and shoes.
 * Category-specific nuance lives in `topicBlocks` (human-readable titles).
 */
export interface PadelSoftPdpCopy {
  productId: string;
  category: Exclude<PadelEditorialCategory, "rackets">;
  tier: PadelEditorialTier;
  depth: PadelEditorialDepth;
  editorialState: PadelEditorialState;
  evidenceBasis: PadelEditorialEvidenceBasis;
  /** Short overview for hero / overview — replaces thin market-wave blurbs when applied. */
  shortDescription: string;
  verdict: string;
  whatItIs: string;
  whoItsFor: string;
  whyChooseIt: string;
  strengthsNarrative: string[];
  tradeoffsNarrative: string[];
  /** Natural “choose instead” guidance when trade-offs bite. */
  chooseInstead: string;
  bestFor: string[];
  notIdealFor: string[];
  buyIf: string[];
  skipIf: string[];
  /** Category-specific titled blocks shown on PDP (capacity, pack economics, etc.). */
  topicBlocks: { title: string; body: string }[];
  /** True when page has enough identity+content to consider INDEXABLE (media/commerce still separate). */
  indexableCandidate: boolean;
}

/** Racket editorial status sidecar (copy already lives on RacketDraft). */
export interface PadelRacketEditorialMeta {
  productId: string;
  category: "rackets";
  tier: "A";
  depth: PadelEditorialDepth;
  editorialState: PadelEditorialState;
  evidenceBasis: PadelEditorialEvidenceBasis;
  indexableCandidate: boolean;
  notes?: string;
}
