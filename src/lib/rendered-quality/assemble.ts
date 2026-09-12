/**
 * Assemble production-like page output for an indexable path.
 * Uses the same getters the App Router pages call (SSR contract).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import {
  getBestGuidePageData,
  getBestIndexData,
} from "@/lib/best/get-best-guide-page-data";
import { getGuidesHubData } from "@/lib/guides/get-guides-hub-data";
import { getComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { getBrandHubPageData } from "@/lib/brand-hub/get-brand-hub-data";
import { getSportHubData } from "@/lib/sport-hub/get-sport-hub-data";
import { getDisciplineHubData } from "@/lib/discipline-hub/get-discipline-hub-data";
import { getGearHubData } from "@/lib/gear-hub/get-gear-hub-data";
import { getToolsHubData } from "@/lib/tools/get-tools-hub-data";
import { getGearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database/get-page-data";
import { getUseCaseListingPageData } from "@/lib/use-case-listing";
import { assembleCategoryPage } from "@/lib/catalog";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { resolveDecisionCopyForProduct } from "@/lib/decision-copy";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  getAuthorBySlug,
  getBrandById,
  getBuyingGuideBySlug,
  getProductById,
  getProductBySlug,
  getReviewByProduct,
  getReviewBySlug,
  getReviewsByAuthor,
  getToolBySlug,
  getBrandBySlug,
} from "@/repositories";
import { getFinderDefinition } from "@/domain/finders/repository";
import { getFinderUiConfig } from "@/lib/finder/finder-ui-config";
import { addImage, decisionFromUnknown, flattenVisible } from "./flatten";
import {
  PROD_CTX,
  type SourceEntity,
  type VisiblePage,
} from "./types";
import type { IndexableUrl } from "./enumerate";

function page(
  url: IndexableUrl,
  entity: SourceEntity,
  data: unknown,
  extra?: Partial<VisiblePage>,
): VisiblePage {
  const flat = flattenVisible(data, url.template);
  const images = [...flat.images, ...(extra?.images ?? [])];
  const components = [...flat.components, ...(extra?.components ?? [])];
  return {
    path: url.path,
    url: url.url,
    template: url.template,
    entity,
    source: extra?.source ?? entity,
    components,
    images,
    decision: extra?.decision ?? decisionFromUnknown(data),
    assembled: true,
  };
}

function entityOf(
  kind: SourceEntity["kind"],
  slug: string,
  id?: string,
): SourceEntity {
  return { kind, id: id ?? slug, slug };
}

function unassembled(url: IndexableUrl, slug = url.path): VisiblePage {
  return {
    path: url.path,
    url: url.url,
    template: url.template,
    entity: entityOf("page", slug),
    components: [],
    images: [],
    assembled: false,
  };
}

function staticFromAppFile(url: IndexableUrl, rel: string): VisiblePage | undefined {
  const abs = join(process.cwd(), rel);
  if (!existsSync(abs)) return undefined;
  const src = readFileSync(abs, "utf8");
  const texts: string[] = [];
  for (const m of src.matchAll(/>([^<>{}]{16,400})</g)) {
    const t = m[1]!.replace(/\s+/g, " ").trim();
    if (t && !/className|href=/.test(t)) texts.push(t);
  }
  for (const m of src.matchAll(/["'`]([A-Z][^"'`]{20,280})["'`]/g)) {
    texts.push(m[1]!);
  }
  if (!texts.length) return undefined;
  return {
    path: url.path,
    url: url.url,
    template: "static",
    entity: entityOf("page", url.path),
    components: texts.map((text, i) => ({ id: `static[${i}]`, text })),
    images: [],
    assembled: true,
  };
}

function assembleReview(url: IndexableUrl, slug: string): VisiblePage | undefined {
  const review = getReviewBySlug(slug, PROD_CTX);
  if (!review) return undefined;
  const product = getProductById(review.productId, PROD_CTX);
  if (!product) return undefined;
  const brand = getBrandById(product.brandId, PROD_CTX);
  const hero = getPrimaryProductMedia(product);
  const enriched = enrichReviewForPage(review, product, {
    brand,
    productHero: hero,
  });
  const decision = resolveDecisionCopyForProduct({ product, review: enriched });
  const visible = page(
    url,
    entityOf("review", slug, enriched.id),
    {
      title: enriched.title,
      summary: enriched.summary,
      verdict: enriched.verdict,
      bottomLine: enriched.bottomLine,
      testingContext: enriched.testingContext,
      sections: enriched.sections,
      decisionCopy: decision,
    },
    {
      decision,
      source: entityOf("review", slug, enriched.id),
    },
  );
  addImage(visible.images, hero?.src, "review.hero", "hero", hero?.alt);
  for (const section of enriched.sections) {
    if (section.image?.src) {
      addImage(
        visible.images,
        section.image.src,
        `review.section.${section.id}`,
        "section",
        section.image.alt,
      );
    }
  }
  return visible;
}

function assembleProduct(url: IndexableUrl, slug: string): VisiblePage | undefined {
  const product = getProductBySlug(slug, PROD_CTX);
  if (!product) return undefined;
  const brand = getBrandById(product.brandId, PROD_CTX);
  const review = getReviewByProduct(product.id, PROD_CTX);
  const enriched = review
    ? enrichReviewForPage(review, product, { brand })
    : undefined;
  const decision = resolveDecisionCopyForProduct({
    product,
    review: enriched,
  });
  const hero = getPrimaryProductMedia(product);
  const visible = page(
    url,
    entityOf("product", slug, product.id),
    {
      title: product.fullName,
      strengths: product.strengths,
      weaknesses: product.weaknesses,
      review: enriched
        ? {
            summary: enriched.summary,
            verdict: enriched.verdict,
            bottomLine: enriched.bottomLine,
            testingContext: enriched.testingContext,
            sections: enriched.sections,
          }
        : undefined,
      decisionCopy: decision,
    },
    {
      decision,
      source: enriched
        ? entityOf("review", enriched.slug, enriched.id)
        : entityOf("product", slug, product.id),
    },
  );
  addImage(visible.images, hero?.src, "pdp.hero", "primary", hero?.alt);
  return visible;
}

export function assembleIndexableUrl(url: IndexableUrl): VisiblePage {
  const path = url.path;
  const parts = path.split("/").filter(Boolean);

  try {
    if (path === "/") {
      return page(url, entityOf("page", "/"), getHomepageData({ region: "NL" }));
    }

    if (path === "/reviews") {
      return page(url, entityOf("page", "reviews"), {
        title: "Reviews",
        description: "Kitletics product reviews",
      });
    }
    if (path.startsWith("/reviews/") && parts[1]) {
      return assembleReview(url, parts[1]) ?? unassembled(url, parts[1]);
    }

    if (path.endsWith("/alternatives") && parts[0] === "products" && parts[1]) {
      const data = getAlternativesPageData(parts[1], PROD_CTX);
      if (!data) return unassembled(url, parts[1]);
      const review = data.source.review;
      return page(url, entityOf("product", parts[1], data.product.id), data, {
        source: review
          ? entityOf("review", review.slug, review.id)
          : entityOf("product", parts[1], data.product.id),
      });
    }

    if (path.startsWith("/products/") && parts[1]) {
      return assembleProduct(url, parts[1]) ?? unassembled(url, parts[1]);
    }

    if (path === "/best") {
      return page(url, entityOf("page", "best"), getBestIndexData(PROD_CTX));
    }
    if (path.startsWith("/best/") && parts[1]) {
      const data = getBestGuidePageData(parts[1], PROD_CTX);
      if (!data) return unassembled(url, parts[1]);
      const visible = page(
        url,
        entityOf("best-guide", parts[1], data.guide.id),
        data,
      );
      addImage(
        visible.images,
        data.heroImageSrc,
        "best.hero",
        "hero",
        data.guide.title,
      );
      addImage(
        visible.images,
        data.methodologyImageSrc,
        "best.methodology",
        "methodology",
      );
      return visible;
    }

    if (path === "/guides") {
      return page(url, entityOf("page", "guides"), getGuidesHubData(PROD_CTX));
    }
    if (path.startsWith("/guides/") && parts[1]) {
      const guide = getBuyingGuideBySlug(parts[1], PROD_CTX);
      if (!guide) return unassembled(url, parts[1]);
      const hero = resolveGuideImage(guide);
      const visible = page(
        url,
        entityOf("guide", parts[1], guide.id),
        {
          title: guide.title,
          subtitle: guide.subtitle,
          shortDescription: guide.shortDescription,
          quickAnswer: guide.quickAnswer,
          sections: guide.sections,
        },
      );
      addImage(visible.images, hero.src, "guide.hero", "hero", hero.alt);
      return visible;
    }

    if (path.startsWith("/compare/") && parts[1]) {
      const data = getComparisonPageData(parts[1], PROD_CTX);
      if (!data) return unassembled(url, parts[1]);
      const visible = page(
        url,
        entityOf("page", parts[1]),
        data,
      );
      addImage(visible.images, data.heroImageSrc, "compare.hero", "hero");
      return visible;
    }

    if (path === "/brands") {
      return page(url, entityOf("page", "brands"), { title: "Brands" });
    }
    if (path.startsWith("/brands/") && parts[1]) {
      const data = getBrandHubPageData({
        brandSlug: parts[1],
        region: "NL",
      });
      if (!data) return unassembled(url, parts[1]);
      const brand = getBrandBySlug(parts[1], PROD_CTX);
      return page(
        url,
        entityOf("brand", parts[1], brand?.id ?? parts[1]),
        data,
      );
    }

    if (path === "/gear") {
      return page(url, entityOf("page", "gear"), getGearHubData({ region: "NL" }));
    }
    if (path === "/tools") {
      return page(url, entityOf("page", "tools"), getToolsHubData());
    }
    if (path.startsWith("/tools/") && parts[1]) {
      const tool = getToolBySlug(parts[1]);
      const finder = getFinderDefinition(parts[1]);
      const ui = finder ? getFinderUiConfig(parts[1]) : undefined;
      if (!tool && !finder) return unassembled(url, parts[1]);
      return page(url, entityOf("page", parts[1]), { tool, finder, ui });
    }

    if (path === "/setups") {
      return page(url, entityOf("page", "setups"), { title: "Gear setups" });
    }
    if (path.startsWith("/setups/") && parts[1]) {
      const data = getGearSetupPageData(parts[1], PROD_CTX);
      if (!data) return unassembled(url, parts[1]);
      return page(url, entityOf("page", parts[1], data.setup.id), data);
    }

    if (path === "/running/shoes/database") {
      return page(
        url,
        entityOf("page", "running-shoe-database"),
        getRunningShoeDatabasePageData({ options: PROD_CTX }),
      );
    }

    if (path.startsWith("/authors/") && parts[1]) {
      const author = getAuthorBySlug(parts[1]);
      if (!author) return unassembled(url, parts[1]);
      const reviews = getReviewsByAuthor(author.id);
      return page(url, entityOf("page", parts[1], author.id), {
        name: author.name,
        bio: author.bio,
        expertise: author.expertise,
        reviews: reviews.map((r) => r.title),
      });
    }

    if (path === "/authors") {
      return page(url, entityOf("page", "authors"), { title: "Authors" });
    }

    if (parts.length === 1 && ["running", "padel", "tennis", "fitness"].includes(parts[0]!)) {
      const data = getSportHubData({ sportSlug: parts[0]!, region: "NL" });
      if (data) return page(url, entityOf("page", parts[0]!), data);
    }

    if (parts.length === 2) {
      const discipline = getDisciplineHubData({
        sportSlug: parts[0]!,
        disciplineSlug: parts[1]!,
        region: "NL",
      });
      if (discipline) {
        return page(url, entityOf("page", path), discipline);
      }

      const category = assembleCategoryPage({
        sportSlug: parts[0]!,
        pathSegment: parts[1]!,
        options: PROD_CTX,
      });
      if (category) {
        return page(url, entityOf("page", path), category);
      }
    }

    if (parts.length === 3) {
      const listing = getUseCaseListingPageData({
        sportSlug: parts[0]!,
        categoryPathSegment: parts[1]!,
        listingSlug: parts[2]!,
      });
      if (listing) {
        return page(url, entityOf("page", path), listing);
      }
      const category = assembleCategoryPage({
        sportSlug: parts[0]!,
        pathSegment: parts[1]!,
        options: PROD_CTX,
      });
      if (category) {
        return page(url, entityOf("page", path), category);
      }
    }

    const TRUST: Record<string, string> = {
      "/about": "src/app/about/page.tsx",
      "/methodology": "src/app/methodology/page.tsx",
      "/how-we-review": "src/app/how-we-review/page.tsx",
      "/affiliate-disclosure": "src/app/affiliate-disclosure/page.tsx",
      "/contact": "src/app/contact/page.tsx",
      "/privacy": "src/app/privacy/page.tsx",
      "/terms": "src/app/terms/page.tsx",
      "/editorial-policy": "src/app/editorial-policy/page.tsx",
      "/evidence-policy": "src/app/evidence-policy/page.tsx",
      "/scoring-methodology": "src/app/scoring-methodology/page.tsx",
      "/compare": "src/app/compare/page.tsx",
      "/finders": "src/app/finders/page.tsx",
    };
    if (TRUST[path]) {
      return staticFromAppFile(url, TRUST[path]!) ?? unassembled(url);
    }
  } catch (err) {
    if (process.env.RENDERED_QUALITY_DEBUG) {
      console.error(`assemble failed ${url.path}:`, err);
    }
    return unassembled(url);
  }

  return unassembled(url);
}
