export {
  PADEL_RESEARCH_STORIES,
  PADEL_RESEARCH_SLUGS,
  getPadelResearchStory,
} from "@/lib/padel-research/stories";
export type {
  PadelResearchStorySlug,
  PadelResearchStoryDefinition,
  PadelResearchRequiredMetric,
} from "@/lib/padel-research/stories";
export {
  assessPadelResearchStoryReadiness,
  getStoryReadiness,
} from "@/lib/padel-research/assess-story-readiness";
export type {
  StoryReadiness,
  MetricCoverage,
} from "@/lib/padel-research/assess-story-readiness";
export { getPadelResearchPageData } from "@/lib/padel-research/get-research-page-data";
export type { PadelResearchPageData } from "@/lib/padel-research/get-research-page-data";
