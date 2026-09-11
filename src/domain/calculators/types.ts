export type CalculatorKind = "pace" | "race-predictor" | "generic";

export interface CalculatorFaqItem {
  question: string;
  answer: string;
  /** Optional deep-link query for this calculator */
  exampleQuery?: string;
}

export interface CalculatorPreset {
  id: string;
  label: string;
  description?: string;
  /** Query params to apply */
  params: Record<string, string>;
}

export interface CalculatorDefinition {
  id: string;
  slug: string;
  toolId: string;
  title: string;
  description: string;
  kind: CalculatorKind;
  version: string;
  sportIds: string[];
  relatedToolSlugs: string[];
  relatedGuideSlugs?: string[];
  methodologyTitle: string;
  methodologyBody: string[];
  formulaDisplay?: string;
  formulaDefinitions?: { symbol: string; meaning: string }[];
  limitations?: string[];
  faqs: CalculatorFaqItem[];
  presets: CalculatorPreset[];
  seoTitle: string;
  seoDescription: string;
}

export interface CalculatorShareState {
  v: string;
  /** Calculator slug */
  c: string;
  /** Flat query-friendly params */
  p: Record<string, string>;
}
