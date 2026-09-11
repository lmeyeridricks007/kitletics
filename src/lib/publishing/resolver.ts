import type { PublishFields, PublishStatus } from "@/domain/shared/types";

export interface PublishResolverOptions {
  /** Override clock for tests */
  now?: Date;
  /** Override NODE_ENV detection */
  isDev?: boolean;
}

function resolveIsDev(options?: PublishResolverOptions): boolean {
  if (options?.isDev !== undefined) return options.isDev;
  return process.env.NODE_ENV === "development";
}

/**
 * Central publication gate for ALL public content queries.
 *
 * Development (`npm run dev`):
 *   Shows draft, review, scheduled, published (not archived).
 *
 * Production:
 *   Shows ONLY status=published AND publishedAt <= now.
 *   Scheduled content NEVER leaks — even if scheduledFor is past.
 */
export function isPubliclyVisible(
  meta: Pick<PublishFields, "status" | "publishedAt" | "scheduledFor">,
  options?: PublishResolverOptions,
): boolean {
  const isDev = resolveIsDev(options);
  const now = options?.now ?? new Date();

  if (meta.status === "archived") {
    return false;
  }

  if (isDev) {
    return (
      meta.status === "draft" ||
      meta.status === "review" ||
      meta.status === "scheduled" ||
      meta.status === "published"
    );
  }

  if (meta.status !== "published") {
    return false;
  }

  if (!meta.publishedAt) {
    return false;
  }

  const publishedAt = new Date(meta.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) {
    return false;
  }

  return publishedAt.getTime() <= now.getTime();
}

/** Filter any publishable collection through the central gate. */
export function resolvePublished<T extends PublishFields>(
  items: readonly T[],
  options?: PublishResolverOptions,
): T[] {
  return items.filter((item) => isPubliclyVisible(item, options));
}

/** Look up by slug through the publication gate — returns undefined → 404. */
export function resolvePublishedBySlug<T extends PublishFields & { slug: string }>(
  items: readonly T[],
  slug: string,
  options?: PublishResolverOptions,
): T | undefined {
  const item = items.find((i) => i.slug === slug);
  if (!item) return undefined;
  if (!isPubliclyVisible(item, options)) return undefined;
  return item;
}

/** Look up by id through the publication gate. */
export function resolvePublishedById<T extends PublishFields & { id: string }>(
  items: readonly T[],
  id: string,
  options?: PublishResolverOptions,
): T | undefined {
  const item = items.find((i) => i.id === id);
  if (!item) return undefined;
  if (!isPubliclyVisible(item, options)) return undefined;
  return item;
}

export function isEditableStatus(status: PublishStatus): boolean {
  return status === "draft" || status === "review" || status === "scheduled";
}
