import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/config";
import {
  getSports,
  getDisciplines,
  getCategories,
  getProducts,
  getBrands,
  getReviews,
  getAuthors,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getGearSetups,
  getTools,
} from "@/repositories";
import { getUseCaseListingConfigs } from "@/lib/use-case-listing";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getToolHref } from "@/lib/tools/href";
import { resolveChildSportRedirect } from "@/lib/seo/category-canonical";
import { withSitemapLastModified } from "@/lib/seo/sitemap-lastmod";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";

/**
 * Sitemap includes ONLY INDEXABLE entities per launch eligibility.
 *
 * lastmod policy (Fix 32):
 * - Prefer genuine editorial `updatedAt` / `publishedAt` only.
 * - Never use build/deploy/today, SEED_DATES.*, or lastVerifiedAt
 *   (verification / offer refresh ≠ content change).
 * - Omit lastmod when no reliable per-entity date exists.
 */
let sitemapCache: MetadataRoute.Sitemap | undefined;

export default function sitemap(): MetadataRoute.Sitemap {
  if (sitemapCache) return sitemapCache;

  const base = siteConfig.url;
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];
  const prodCtx = { isDev: false as const };

  const sports = getSports();
  const disciplines = getDisciplines();
  const categories = getCategories();
  const products = getProducts();
  const productCountByCategory = new Map<string, number>();
  for (const p of products) {
    productCountByCategory.set(
      p.categoryId,
      (productCountByCategory.get(p.categoryId) ?? 0) + 1,
    );
  }

  const push = (
    path: string,
    entry: Omit<MetadataRoute.Sitemap[number], "url">,
  ) => {
    if (seen.has(path)) return;
    seen.add(path);
    entries.push({
      url: path === "/" ? base : `${base}${path}`,
      ...entry,
    });
  };

  // Home + static hubs: no tracked per-page editorial timestamp → omit lastmod
  push("/", {
    changeFrequency: "daily",
    priority: 1,
  });

  const staticPages: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/gear", priority: 0.8, changeFrequency: "weekly" },
    { path: "/brands", priority: 0.7, changeFrequency: "weekly" },
    { path: "/best", priority: 0.8, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.7, changeFrequency: "weekly" },
    { path: "/reviews", priority: 0.7, changeFrequency: "weekly" },
    { path: "/guides", priority: 0.7, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.7, changeFrequency: "weekly" },
    {
      path: "/running/shoes/database",
      priority: 0.85,
      changeFrequency: "weekly",
    },
    { path: "/setups", priority: 0.6, changeFrequency: "weekly" },
    { path: "/about", priority: 0.3, changeFrequency: "yearly" },
    { path: "/methodology", priority: 0.4, changeFrequency: "yearly" },
    { path: "/how-we-review", priority: 0.4, changeFrequency: "yearly" },
    { path: "/editorial-policy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/evidence-policy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/scoring-methodology", priority: 0.4, changeFrequency: "yearly" },
    { path: "/authors", priority: 0.4, changeFrequency: "monthly" },
    { path: "/affiliate-disclosure", priority: 0.3, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  for (const page of staticPages) {
    push(page.path, {
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  for (const sport of sports) {
    const elig = getLaunchEligibility({ kind: "sport", entity: sport }, prodCtx);
    if (!isIndexableEligibility(elig)) continue;

    push(
      `/${sport.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "weekly",
          priority: sport.available ? 0.9 : 0.4,
        },
        sport.updatedAt,
        sport.publishedAt,
      ),
    );

    for (const disc of disciplines.filter((d) => d.sportId === sport.id)) {
      if (resolveChildSportRedirect(sport, disc.slug)) continue;
      push(
        `/${sport.slug}/${disc.slug}`,
        withSitemapLastModified(
          {
            changeFrequency: "weekly",
            priority: 0.7,
          },
          disc.updatedAt,
          disc.publishedAt,
        ),
      );
    }

    for (const cat of categories.filter((c) =>
      c.sportIds.includes(sport.id),
    )) {
      const productCount = productCountByCategory.get(cat.id) ?? 0;
      if (productCount === 0) continue;
      if (isSoftGatedCategory(cat)) continue;
      const canonical = getCategoryHref(cat);
      if (canonical !== `/${sport.slug}/${cat.pathSegment}`) continue;
      push(
        canonical,
        withSitemapLastModified(
          {
            changeFrequency: "weekly",
            priority: 0.8,
          },
          cat.updatedAt,
          cat.publishedAt,
        ),
      );
    }
  }

  for (const listing of getUseCaseListingConfigs()) {
    const sport = sports.find((s) => s.slug === listing.sportSlug);
    if (!sport) continue;
    const sportElig = getLaunchEligibility(
      { kind: "sport", entity: sport },
      prodCtx,
    );
    if (!isIndexableEligibility(sportElig)) continue;
    // Listing configs have no persisted editorial timestamp → omit lastmod
    // (do not fall back to sport seed dates or SEED_DATES).
    push(
      `/${listing.sportSlug}/${listing.categoryPathSegment}/${listing.slug}`,
      {
        changeFrequency: "weekly",
        priority: 0.75,
      },
    );
  }

  for (const product of products) {
    const elig = getLaunchEligibility(
      { kind: "product", entity: product },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/products/${product.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "weekly",
          priority: 0.9,
        },
        product.updatedAt,
        product.publishedAt,
      ),
    );
  }

  for (const product of products) {
    const elig = getLaunchEligibility(
      { kind: "alternatives", entity: product },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/products/${product.slug}/alternatives`,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.55,
        },
        product.updatedAt,
        product.publishedAt,
      ),
    );
  }

  for (const brand of getBrands()) {
    const elig = getLaunchEligibility({ kind: "brand", entity: brand }, prodCtx);
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/brands/${brand.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "weekly",
          priority: 0.6,
        },
        brand.updatedAt,
        brand.publishedAt,
      ),
    );
  }

  for (const review of getReviews()) {
    const elig = getLaunchEligibility(
      { kind: "review", entity: review },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    // No reviewedAt in content model — editorial updatedAt / publishedAt only
    push(
      `/reviews/${review.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.8,
        },
        review.updatedAt,
        review.publishedAt,
      ),
    );
  }

  for (const author of getAuthors()) {
    const elig = getLaunchEligibility(
      { kind: "author", entity: author },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    // Authors have no reliable per-profile editorial stamp → omit
    push(`/authors/${author.slug}`, {
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const guide of getBestGuides()) {
    const elig = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/best/${guide.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "weekly",
          priority: 0.85,
        },
        guide.updatedAt,
        guide.publishedAt,
      ),
    );
  }

  for (const cmp of getComparisons()) {
    const elig = getLaunchEligibility(
      { kind: "comparison", entity: cmp },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/compare/${cmp.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.7,
        },
        cmp.updatedAt,
        cmp.publishedAt,
      ),
    );
  }

  for (const guide of getBuyingGuides()) {
    const elig = getLaunchEligibility(
      { kind: "buying-guide", entity: guide },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/guides/${guide.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.7,
        },
        guide.updatedAt,
        guide.publishedAt,
      ),
    );
  }

  for (const setup of getGearSetups()) {
    const elig = getLaunchEligibility(
      { kind: "setup", entity: setup },
      prodCtx,
    );
    if (!isIndexableEligibility(elig)) continue;
    push(
      `/setups/${setup.slug}`,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.6,
        },
        setup.updatedAt,
        setup.publishedAt,
      ),
    );
  }

  for (const tool of getTools().filter((t) => t.available)) {
    const elig = getLaunchEligibility({ kind: "tool", entity: tool }, prodCtx);
    if (!isIndexableEligibility(elig)) continue;
    const href = getToolHref(tool);
    if (!href.startsWith("/tools/")) continue;
    push(
      href,
      withSitemapLastModified(
        {
          changeFrequency: "monthly",
          priority: 0.6,
        },
        tool.updatedAt,
        tool.publishedAt,
      ),
    );
  }

  sitemapCache = entries;
  return entries;
}
