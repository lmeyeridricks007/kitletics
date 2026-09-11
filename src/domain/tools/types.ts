import type { EntityId, PublishFields, SeoFields } from "@/domain/shared/types";

export type ToolType =
  | "finder"
  | "calculator"
  | "planner"
  | "builder"
  | "comparison";

export interface Tool extends PublishFields, SeoFields {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  /** Shorter hub card copy when description is long */
  shortDescription?: string;
  type: ToolType;
  sportIds: EntityId[];
  categoryIds: EntityId[];
  useCaseIds: EntityId[];
  goalTags: string[];
  icon: string;
  /** False = coming soon (not linked as active tool) */
  available: boolean;
  /** Credible estimated completion time in minutes — omit when unknown */
  estimatedTimeMinutes?: number;
  /** Hub feature ranking — higher first */
  featured?: boolean;
  priority?: number;
  /** Optional category/lifestyle image for hub cards */
  hubImageSrc?: string;
  /**
   * Override default `/tools/${slug}` when the experience lives elsewhere
   * (e.g. Interactive Compare Builder at `/compare`).
   */
  href?: string;
}
