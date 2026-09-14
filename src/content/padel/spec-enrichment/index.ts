export type {
  SpecSourceType,
  SpecFieldState,
  SpecCompleteness,
  SpecFieldProvenance,
  ProductSpecEnrichment,
} from "@/content/padel/spec-enrichment/types";
export {
  SPEC_TERMINAL_VALUES,
  isTerminalSpecValue,
  hasMeaningfulSpecValue,
} from "@/content/padel/spec-enrichment/types";
export {
  PADEL_SPEC_PLANS,
  resolveSpecPlan,
} from "@/content/padel/spec-enrichment/required-fields";
export {
  applySpecEnrichmentToProduct,
  applySpecEnrichmentToProducts,
  getSpecEnrichment,
} from "@/content/padel/spec-enrichment/apply";
export { padelSpecEnrichmentStore } from "@/content/padel/spec-enrichment/store";
