import { RUNNING_SHOE_DATABASE_PATH } from "@/lib/running-shoe-database/constants";

/** Public navigation / CTA label — keep consistent across Running surfaces. */
export const SHOE_DATABASE_NAV_LABEL = "Shoe Database";

export const SHOE_DATABASE_HREF = RUNNING_SHOE_DATABASE_PATH;

/** Short contextual blurb — use once per page, never mass-inject. */
export const SHOE_DATABASE_EDITORIAL_BLURB =
  "Explore specifications for the full market in the Kitletics Running Shoe Database.";

export interface ShoeDatabaseDiscoveryLink {
  label: string;
  href: string;
  description: string;
}

export const SHOE_DATABASE_DISCOVERY_LINK: ShoeDatabaseDiscoveryLink = {
  label: SHOE_DATABASE_NAV_LABEL,
  href: SHOE_DATABASE_HREF,
  description: SHOE_DATABASE_EDITORIAL_BLURB,
};

/** Buying / explainer guides where a database mention is genuinely useful. */
export const SHOE_DATABASE_BUYING_GUIDE_SLUGS = [
  "how-to-choose-running-shoes",
  "what-is-a-daily-trainer",
  "running-shoe-cushioning",
  "running-shoe-drop",
  "running-shoe-rotation",
  "carbon-vs-nylon-plates",
  "stability-shoes-explained",
] as const;

const BUYING_GUIDE_SLUG_SET = new Set<string>(SHOE_DATABASE_BUYING_GUIDE_SLUGS);

export function isRunningShoeCategoryId(categoryId?: string | null): boolean {
  return categoryId === "cat-running-shoes";
}

export function shouldLinkShoeDatabaseFromBuyingGuide(input: {
  slug: string;
  categoryId?: string | null;
}): boolean {
  if (BUYING_GUIDE_SLUG_SET.has(input.slug)) return true;
  return isRunningShoeCategoryId(input.categoryId);
}

export function shouldLinkShoeDatabaseFromBestGuide(categoryId?: string | null): boolean {
  return isRunningShoeCategoryId(categoryId);
}

export function shouldLinkShoeDatabaseFromFinder(finderSlug?: string | null): boolean {
  return finderSlug === "running-shoe-finder";
}

export function ensureShoeDatabaseBuyingHelpLink<
  T extends { label: string; href: string },
>(links: T[]): T[] {
  if (links.some((l) => l.href === SHOE_DATABASE_HREF)) return links;
  return [
    ...links,
    {
      label: SHOE_DATABASE_NAV_LABEL,
      href: SHOE_DATABASE_HREF,
    } as T,
  ];
}
