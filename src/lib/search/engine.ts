import type { ProductCategory } from "@/domain/sports/types";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";
import { getCategoryHref, sportIsSearchable, SOFT_GATED_CATEGORY_SLUGS } from "@/lib/navigation/category-href";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { expandQueryWithSynonyms } from "@/lib/search/synonyms";
import { detectSearchIntent } from "@/lib/search/intent";
import { getToolHref } from "@/lib/tools/href";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import {
  getProducts,
  getBrands,
  getSports,
  getDisciplines,
  getCategories,
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getTools,
  getGearSetups,
  getBrandById,
  getCategoryById,
  getSportById,
  getProductById,
} from "@/repositories";
import type {
  SearchEntityType,
  SearchFilter,
  SearchHit,
} from "@/lib/search/types";

export type {
  SearchEntityType,
  SearchFilter,
  SearchHit,
} from "@/lib/search/types";
export { groupSearchHits } from "@/lib/search/group-hits";
export { POPULAR_SEARCHES } from "@/lib/search/popular";

const FILTER_TYPES: Record<SearchFilter, SearchEntityType[] | null> = {
  all: null,
  products: ["product"],
  categories: ["category", "sport", "discipline"],
  reviews: ["review"],
  guides: ["best-guide", "buying-guide", "setup"],
  comparisons: ["comparison"],
  tools: ["tool"],
  brands: ["brand"],
};

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Ranking:
 * 1 exact title/name match
 * 2 prefix match
 * 3 category match
 * 4 title keyword match
 * 5 synonym match
 * 6 description match
 */
function scoreText(
  query: string,
  expansions: string[],
  fields: {
    title: string;
    slug?: string;
    category?: string;
    description?: string;
  },
): number {
  const title = normalize(fields.title);
  const slug = normalize(fields.slug ?? "");
  const category = normalize(fields.category ?? "");
  const description = normalize(fields.description ?? "");
  const q = normalize(query);

  if (!q) return 0;

  if (title === q || slug === q) return 1000;
  if (title.startsWith(q) || slug.startsWith(q)) return 800;
  if (category === q || category.startsWith(q)) return 600;
  if (title.includes(q) || slug.includes(q)) return 400;

  for (const exp of expansions) {
    if (exp === q) continue;
    if (title === exp || title.includes(exp) || slug.includes(exp)) return 300;
    if (category.includes(exp)) return 280;
    if (description.includes(exp)) return 200;
  }

  if (description.includes(q)) return 150;

  // token overlap
  const tokens = q.split(" ").filter(Boolean);
  let overlap = 0;
  for (const token of tokens) {
    if (title.includes(token) || slug.includes(token)) overlap += 40;
    else if (category.includes(token)) overlap += 25;
    else if (description.includes(token)) overlap += 10;
  }
  return overlap;
}

/** Day-1 search must not treat held verticals as live browse destinations. */
function isDay1SearchableCategory(
  cat: ProductCategory,
): boolean {
  if (SOFT_GATED_CATEGORY_SLUGS.has(cat.slug)) return false;
  return resolveEntityVerticalPolicy(cat.sportIds).mode === "enabled";
}

export function searchKitletics(
  query: string,
  options?: PublishResolverOptions & {
    filter?: SearchFilter;
    limit?: number;
  },
): SearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const expansions = expandQueryWithSynonyms(q);
  const intent = detectSearchIntent(q);
  const hits: SearchHit[] = [];
  const publish = options;
  const nq = normalize(q);

  const catalogProducts = getProducts(publish);
  const populatedCategoryIds = new Set<string>();
  for (const p of catalogProducts) {
    populatedCategoryIds.add(p.categoryId);
  }

  /** Categories whose name strongly matches the query → boost products in them. */
  const categoryBoostById = new Map<string, number>();
  for (const cat of getCategories(publish)) {
    if (!populatedCategoryIds.has(cat.id)) continue;
    if (!isDay1SearchableCategory(cat)) continue;
    const name = normalize(cat.name);
    const slug = normalize(cat.slug.replace(/-/g, " "));
    let boost = 0;
    if (name === nq || slug === nq) boost = 280;
    else if (nq.includes(name) && name.length >= 5) boost = 240;
    else if (name.includes(nq) && nq.length >= 5) boost = 200;
    else {
      for (const exp of expansions) {
        const e = normalize(exp);
        if (e === nq) continue;
        if (name === e || slug === e) {
          boost = Math.max(boost, 220);
          break;
        }
        if (e.length >= 8 && (name.includes(e) || e.includes(name))) {
          boost = Math.max(boost, 160);
        }
      }
    }
    if (boost > 0) categoryBoostById.set(cat.id, boost);
  }
  const dominantBoost =
    categoryBoostById.size > 0
      ? Math.max(...categoryBoostById.values())
      : 0;
  const hasClearCategoryIntent = dominantBoost >= 200;

  for (const product of catalogProducts) {
    // Exclude products that only belong to coming-soon sports (hubs are stubs)
    if (
      product.sportIds.length > 0 &&
      !product.sportIds.some((id) => sportIsSearchable(id, publish))
    ) {
      continue;
    }
    const brand = getBrandById(product.brandId, publish);
    const category = getCategoryById(product.categoryId, publish);
    let score = scoreText(q, expansions, {
      title: product.fullName,
      slug: product.slug,
      category: category?.name,
      description: product.shortDescription,
    });
    if (score <= 0) continue;

    const catBoost = categoryBoostById.get(product.categoryId) ?? 0;
    if (catBoost > 0) {
      score += catBoost;
    } else if (hasClearCategoryIntent) {
      // Broad category queries (e.g. "running shoes") should not surface
      // watches / court shoes / adjacent gear via weak token overlap.
      continue;
    }

    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "product", entity: product }, publish),
      )
    ) {
      continue;
    }

    // Broad category queries: prefer current lifecycle over discontinued
    if (
      intent === "general" &&
      product.lifecycleStatus &&
      product.lifecycleStatus !== "current" &&
      score < 900
    ) {
      score = Math.max(1, score - 120);
    }
    // Never use recommendationScore or affiliate commission as rank signal
    hits.push({
      id: product.id,
      type: "product",
      title: product.fullName,
      subtitle: product.shortDescription,
      href: `/products/${product.slug}`,
      score,
      brandName: brand?.name,
      categoryName: category?.name,
      recommendationScore: product.recommendationScore,
    });
  }

  for (const brand of getBrands(publish)) {
    let score = scoreText(q, expansions, {
      title: brand.name,
      slug: brand.slug,
      description: brand.description,
    });
    if (score <= 0) continue;
    if (intent === "brand" && (normalize(brand.name) === nq || normalize(brand.slug) === nq)) {
      score = Math.max(score, 1100);
    }
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "brand", entity: brand }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: brand.id,
      type: "brand",
      title: brand.name,
      subtitle: brand.description,
      href: `/brands/${brand.slug}`,
      score,
    });
  }

  for (const sport of getSports(publish)) {
    // Coming-soon sports stay out of default search so hubs don't look live
    if (sport.contentStatus === "coming-soon") continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "sport", entity: sport }, publish),
      )
    ) {
      continue;
    }
    const score = scoreText(q, expansions, {
      title: sport.name,
      slug: sport.slug,
      description: sport.description,
    });
    if (score <= 0) continue;
    const href =
      sport.slug === "hyrox" ? "/fitness/hyrox" : `/${sport.slug}`;
    hits.push({
      id: sport.id,
      type: "sport",
      title: sport.name,
      subtitle: sport.description,
      href,
      score: sport.slug === "hyrox" && /hyrox/i.test(q) ? score + 50 : score,
      icon: sport.icon,
    });
  }

  for (const disc of getDisciplines(publish)) {
    const parentSport = getSportById(disc.sportId, publish);
    if (parentSport?.contentStatus === "coming-soon") continue;
    if (
      parentSport &&
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "sport", entity: parentSport }, publish),
      )
    ) {
      continue;
    }
    const score = scoreText(q, expansions, {
      title: disc.name,
      slug: disc.slug,
      description: disc.description,
    });
    if (score <= 0) continue;
    const sport = parentSport;
    const href =
      disc.slug === "hyrox"
        ? "/fitness/hyrox"
        : sport
          ? `/${sport.slug}/${disc.slug}`
          : "/";
    hits.push({
      id: disc.id,
      type: "discipline",
      title: disc.name,
      subtitle: disc.description,
      href,
      score,
    });
  }

  for (const cat of getCategories(publish)) {
    if (!populatedCategoryIds.has(cat.id)) continue;
    if (!isDay1SearchableCategory(cat)) continue;
    const score = scoreText(q, expansions, {
      title: cat.name,
      slug: cat.slug,
      category: cat.name,
      description: cat.description,
    });
    if (score <= 0) continue;
    hits.push({
      id: cat.id,
      type: "category",
      title: cat.name,
      subtitle: cat.description,
      href: getCategoryHref(cat, publish),
      score,
      icon: cat.icon,
      categoryName: cat.name,
    });
  }

  for (const review of getReviews(publish)) {
    const product = getProductById(review.productId, publish);
    const score = scoreText(q, expansions, {
      title: review.slug.replace(/-/g, " "),
      slug: review.slug,
      description: review.summary,
    });
    const productBoost = product
      ? scoreText(q, expansions, {
          title: product.fullName,
          slug: product.slug,
          description: review.summary,
        })
      : 0;
    const finalScore = Math.max(score, productBoost > 0 ? productBoost - 50 : 0);
    if (finalScore <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "review", entity: review }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: review.id,
      type: "review",
      title: `${product?.fullName ?? review.slug} Review`,
      subtitle: review.summary,
      href: `/reviews/${review.slug}`,
      score: finalScore,
    });
  }

  for (const guide of getBestGuides(publish)) {
    let score = scoreText(q, expansions, {
      title: guide.title,
      slug: guide.slug,
      description: guide.intro,
    });
    if (intent === "recommendation" || intent === "guide") {
      if (score > 0) score += 180;
    }
    if (score <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "best-guide", entity: guide }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: guide.id,
      type: "best-guide",
      title: guide.title,
      subtitle: guide.intro,
      href: `/best/${guide.slug}`,
      score,
    });
  }

  for (const cmp of getComparisons(publish)) {
    let score = scoreText(q, expansions, {
      title: cmp.title,
      slug: cmp.slug,
      description: cmp.summary,
    });
    if (intent === "comparison") score = Math.max(score, score > 0 ? score + 200 : 0);
    if (score <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "comparison", entity: cmp }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: cmp.id,
      type: "comparison",
      title: cmp.title,
      subtitle: cmp.summary,
      href: `/compare/${cmp.slug}`,
      score,
    });
  }

  for (const guide of getBuyingGuides(publish)) {
    let score = scoreText(q, expansions, {
      title: guide.title,
      slug: guide.slug,
      description: guide.sections[0]?.body,
    });
    if (intent === "guide" || intent === "recommendation") {
      if (score > 0) score += 150;
    }
    if (score <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility(
          { kind: "buying-guide", entity: guide },
          publish,
        ),
      )
    ) {
      continue;
    }
    hits.push({
      id: guide.id,
      type: "buying-guide",
      title: guide.title,
      subtitle: guide.sections[0]?.heading,
      href: `/guides/${guide.slug}`,
      score,
    });
  }

  for (const tool of getTools(publish)) {
    let score = scoreText(q, expansions, {
      title: tool.name,
      slug: tool.slug,
      description: tool.description,
    });
    // Intent boosts: HYROX shoe queries → Shoe Finder / Best guide priority
    if (
      tool.slug === "hyrox-shoe-finder" &&
      (nq.includes("hyrox shoe") || nq === "hyrox shoes" || nq === "hyrox")
    ) {
      score = Math.max(score, 920);
    }
    if (
      tool.slug === "hyrox-race-kit-builder" &&
      nq.includes("hyrox") &&
      (nq.includes("kit") || nq.includes("race kit"))
    ) {
      score = Math.max(score, 880);
    }
    if (
      tool.slug === "hyrox-race-time-calculator" &&
      nq.includes("hyrox") &&
      (nq.includes("time") || nq.includes("pace") || nq.includes("finish"))
    ) {
      score = Math.max(score, 880);
    }
    if (
      (tool.slug.includes("finder") || tool.slug.includes("planner")) &&
      (intent === "tool" || nq.includes("finder") || nq.includes("which"))
    ) {
      if (score > 0) score += 250;
      else if (nq.includes("shoe") && tool.slug.includes("shoe")) score = 850;
    }
    if (
      tool.slug === "running-shoe-finder" &&
      (nq.includes("running shoe") || nq === "running shoes" || nq === "trainers")
    ) {
      score = Math.max(score, 950);
    }
    if (
      tool.slug === "shoe-rotation-planner" &&
      (nq.includes("rotation") || nq.includes("running shoe"))
    ) {
      score = Math.max(score, score > 0 ? score + 100 : 400);
    }
    if (score <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "tool", entity: tool }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: tool.id,
      type: "tool",
      title: tool.name,
      subtitle: tool.description,
      href: getToolHref(tool),
      score,
      icon: tool.icon,
    });
  }

  for (const setup of getGearSetups(publish)) {
    const score = scoreText(q, expansions, {
      title: setup.title,
      slug: setup.slug,
      description: setup.description,
    });
    if (score <= 0) continue;
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "setup", entity: setup }, publish),
      )
    ) {
      continue;
    }
    hits.push({
      id: setup.id,
      type: "setup",
      title: setup.title,
      subtitle: setup.description,
      href: `/setups/${setup.slug}`,
      score,
    });
  }

  const allowed = options?.filter
    ? FILTER_TYPES[options.filter]
    : null;

  const filtered = allowed
    ? hits.filter((h) => allowed.includes(h.type))
    : hits;

  filtered.sort(
    (a, b) =>
      b.score - a.score ||
      // Soft tie-break within equal text relevance only — never primary rank key
      (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0) ||
      a.title.localeCompare(b.title),
  );

  const limit = options?.limit ?? 50;
  return filtered.slice(0, limit);
}
