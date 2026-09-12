export type {
  CanonicalDecisionCopy,
  DecisionCopyInput,
  DecisionLineClass,
  DecisionRole,
} from "@/lib/decision-copy/types";
export {
  classifyDecisionLine,
  classifyDecisionList,
  listHasBlockedClass,
  normalizeDecisionLine,
  countDecisionWords,
} from "@/lib/decision-copy/classify";
export {
  toSituationLabel,
  toDecisionLine,
  toTraitBullet,
  salvageDecisionLine,
} from "@/lib/decision-copy/transform";
export {
  resolveCanonicalDecisionCopy,
  resolveDecisionCopyForProduct,
  decisionCopyIsIndexable,
  punchyBestForLabel,
} from "@/lib/decision-copy/resolve";
