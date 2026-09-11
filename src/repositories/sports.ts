import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  resolvePublished,
  resolvePublishedById,
  resolvePublishedBySlug,
} from "@/lib/publishing/resolver";
import { sports as rawSports } from "@/content/taxonomy/sports";
import { disciplines as rawDisciplines } from "@/content/taxonomy/disciplines";
import { categories as rawCategories } from "@/content/taxonomy/categories";
import { subcategories as rawSubcategories } from "@/content/taxonomy/subcategories";
import { useCases as rawUseCases } from "@/content/taxonomy/use-cases";
import type {
  Activity,
  Discipline,
  ProductCategory,
  ProductSubcategory,
  Sport,
  UseCase,
} from "@/domain/sports/types";

export function getSports(options?: PublishResolverOptions): Sport[] {
  return resolvePublished(rawSports, options).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getSportBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Sport | undefined {
  return resolvePublishedBySlug(rawSports, slug, options);
}

export function getSportById(
  id: string,
  options?: PublishResolverOptions,
): Sport | undefined {
  return resolvePublishedById(rawSports, id, options);
}

export function getFeaturedSports(options?: PublishResolverOptions): Sport[] {
  return getSports(options).filter((s) => s.featured);
}

export function getDisciplines(options?: PublishResolverOptions): Discipline[] {
  return resolvePublished(rawDisciplines, options);
}

export function getDisciplinesBySport(
  sportId: string,
  options?: PublishResolverOptions,
): Discipline[] {
  return getDisciplines(options)
    .filter((d) => d.sportId === sportId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getDisciplineBySlug(
  sportSlug: string,
  disciplineSlug: string,
  options?: PublishResolverOptions,
): Discipline | undefined {
  const sport = getSportBySlug(sportSlug, options);
  if (!sport) return undefined;
  return getDisciplinesBySport(sport.id, options).find(
    (d) => d.slug === disciplineSlug,
  );
}

export function getDisciplineById(
  id: string,
  options?: PublishResolverOptions,
): Discipline | undefined {
  return resolvePublishedById(rawDisciplines, id, options);
}

export function getCategories(
  options?: PublishResolverOptions,
): ProductCategory[] {
  return resolvePublished(rawCategories, options).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getCategoryBySlug(
  slug: string,
  options?: PublishResolverOptions,
): ProductCategory | undefined {
  return resolvePublishedBySlug(rawCategories, slug, options);
}

export function getCategoryById(
  id: string,
  options?: PublishResolverOptions,
): ProductCategory | undefined {
  return resolvePublishedById(rawCategories, id, options);
}

export function getCategoryByPathSegment(
  sportId: string,
  pathSegment: string,
  options?: PublishResolverOptions,
): ProductCategory | undefined {
  return getCategories(options).find(
    (c) => c.pathSegment === pathSegment && c.sportIds.includes(sportId),
  );
}

export function getCategoriesBySport(
  sportId: string,
  options?: PublishResolverOptions,
): ProductCategory[] {
  return getCategories(options).filter((c) => c.sportIds.includes(sportId));
}

export function getSubcategories(): ProductSubcategory[] {
  return [...rawSubcategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSubcategoriesByCategory(
  categoryId: string,
): ProductSubcategory[] {
  return getSubcategories().filter((s) => s.categoryId === categoryId);
}

export function getSubcategoryById(
  id: string,
): ProductSubcategory | undefined {
  return rawSubcategories.find((s) => s.id === id);
}

export function getUseCases(): UseCase[] {
  return [...rawUseCases];
}

export function getUseCaseById(id: string): UseCase | undefined {
  return rawUseCases.find((u) => u.id === id);
}

export function getUseCasesBySport(sportId: string): UseCase[] {
  return rawUseCases.filter((u) => !u.sportId || u.sportId === sportId);
}

/** Activities reserved for future expansion — currently empty seed. */
export function getActivities(): Activity[] {
  return [];
}
