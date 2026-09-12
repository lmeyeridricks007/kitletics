export type DecisionLineClass =
  | "MACHINE_LIKE"
  | "WORDY"
  | "GENERIC"
  | "REPETITIVE"
  | "CONFUSING"
  | "BROKEN"
  | "GOOD";

export type DecisionRole =
  | "bestFor"
  | "notIdealFor"
  | "buyIf"
  | "skipIf"
  | "pro"
  | "con";

export type CanonicalDecisionCopy = {
  /** Glance / Who it's for — buyer/use situations, not You-sentences. */
  bestFor: string[];
  /** Glance / Who should avoid — meaningful limitations. */
  notIdealFor: string[];
  /** Buy If — second-person decision lines. */
  buyIf: string[];
  /** Skip If — second-person decision lines. */
  skipIf: string[];
  /** Product traits. One idea each. */
  pros: string[];
  cons: string[];
};

export type DecisionCopyInput = {
  whoShouldBuy?: string[];
  whoShouldAvoid?: string[];
  pros?: string[];
  cons?: string[];
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  notIdealFor?: string[];
  productName?: string;
};
