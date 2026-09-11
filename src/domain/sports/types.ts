import type { EntityId, PublishFields, SeoFields } from "@/domain/shared/types";

export interface Sport extends PublishFields, SeoFields {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  featured: boolean;
  /** @deprecated prefer contentStatus */
  available: boolean;
  /** Discovery state for navigation and sport hubs */
  contentStatus: "live" | "partial" | "coming-soon";
  parentSportId?: EntityId;
  sortOrder: number;
}

export interface Discipline extends PublishFields, SeoFields {
  id: EntityId;
  sportId: EntityId;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

/** Activity / use-case training mode nested under a sport or discipline */
export interface Activity extends PublishFields, SeoFields {
  id: EntityId;
  sportId: EntityId;
  disciplineId?: EntityId;
  name: string;
  slug: string;
  description: string;
}

export interface ProductCategory extends PublishFields, SeoFields {
  id: EntityId;
  /** Sports this category applies to */
  sportIds: EntityId[];
  name: string;
  slug: string;
  /** Sport-scoped URL segment, e.g. "shoes" under /running/shoes */
  pathSegment: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface ProductSubcategory {
  id: EntityId;
  categoryId: EntityId;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface UseCase {
  id: EntityId;
  /** Optional sport scope — omit for cross-sport use cases */
  sportId?: EntityId;
  group: "runner" | "training" | "racing" | "goals" | "general";
  name: string;
  slug: string;
  description: string;
}
