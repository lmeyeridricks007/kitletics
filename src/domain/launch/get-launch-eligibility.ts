import type {
  LaunchDisposition,
  LaunchEligibility,
  LaunchEligibilityContext,
  LaunchEligibilityReason,
  LaunchEntityKind,
  LaunchQualityClass,
} from "@/domain/launch/types";
import type { Product } from "@/domain/products/types";
import type {
  BestGuide,
  BuyingGuide,
  Comparison,
  Review,
} from "@/domain/editorial/types";
import type { GearSetup } from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import type { Sport } from "@/domain/sports/types";
import type { Brand } from "@/domain/products/types";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { assessComparisonLaunchQuality } from "@/domain/launch/assess-comparison-quality";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import {
  resolveEntityVerticalPolicy,
  verticalHidesDeepEntities,
  getVerticalSportPolicy,
} from "@/content/launch/vertical-strategy";
import {
  isMinorWorkProductApproved,
  isMinorWorkReviewApproved,
} from "@/content/launch/minor-work-approvals";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getCategoryById } from "@/repositories/sports";
import { getProductById } from "@/repositories/products";
import { getBestGuideSeedBySlug } from "@/repositories/editorial";
import { computeAlternativesQualitySignals } from "@/lib/product/compute-alternatives-quality-signals";
import { evaluateAlternativesContentIndexable } from "@/lib/product/alternatives-quality-signals";
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getProducts } from "@/repositories/products";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { isBrandHubIndexable, canRenderBrandHub } from "@/lib/seo/brand-indexability";
import { BRAND_HUB_UNIQUENESS_HOLD_SLUGS } from "@/content/brand-hub-uniqueness-holds";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import {
  assessEditorialReadiness,
  type EditorialReadinessInput,
} from "@/domain/editorial-readiness";

function publishOpts(
  ctx?: LaunchEligibilityContext,
): PublishResolverOptions {
  return { now: ctx?.now, isDev: ctx?.isDev };
}

/**
 * Fix 48 — INDEXABLE requires unified editorial READY.
 * Does not override vertical / soft-gate / publication holds applied earlier.
 */
function withEditorialReadyGate(
  eligibility: LaunchEligibility,
  input: EditorialReadinessInput,
  opts: PublishResolverOptions,
): LaunchEligibility {
  if (eligibility.disposition !== "INDEXABLE") return eligibility;
  const editorial = assessEditorialReadiness(input, opts);
  if (editorial.ready) {
    return {
      ...eligibility,
      reasons: [
        ...eligibility.reasons,
        { code: "editorial_ready" },
      ],
    };
  }
  return {
    ...eligibility,
    disposition: "PUBLIC_NOINDEX",
    reasons: [
      ...eligibility.reasons,
      { code: "editorial_not_ready", detail: editorial.workState },
      ...editorial.gaps.slice(0, 6).map((g) => ({
        code: "editorial_gap",
        detail: g,
      })),
    ],
  };
}

export function isLaunchPreviewContext(
  ctx?: LaunchEligibilityContext,
): boolean {
  if (ctx?.preview !== undefined) return ctx.preview;
  if (ctx?.isDev) return true;
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL_ENV === "preview") return true;
  if (process.env.KITLETICS_LAUNCH_PREVIEW === "1") return true;
  return false;
}

function reason(code: string, detail?: string): LaunchEligibilityReason {
  return detail ? { code, detail } : { code };
}

function result(input: {
  disposition: LaunchDisposition;
  kind: LaunchEntityKind;
  id?: string;
  path?: string;
  quality?: LaunchQualityClass;
  reasons: LaunchEligibilityReason[];
  preview: boolean;
}): LaunchEligibility {
  return {
    ...input,
    previewVisible:
      input.disposition !== "HIDDEN_404" || input.preview,
  };
}

function mapGuideStatus(
  status: string,
): LaunchQualityClass {
  switch (status) {
    case "complete":
      return "COMPLETE";
    case "thin":
      return "THIN";
    case "needs-research":
      return "RESEARCH";
    case "stale":
      return "STALE";
    case "blocked":
      return "BLOCKED";
    case "needs-editorial-review":
      return "EDITORIAL_REVIEW";
    default:
      return "THIN";
  }
}

type EligibilityInput =
  | { kind: "product"; entity: Product }
  | { kind: "review"; entity: Review }
  | { kind: "best-guide"; entity: BestGuide }
  | { kind: "buying-guide"; entity: BuyingGuide }
  | { kind: "comparison"; entity: Comparison }
  | { kind: "setup"; entity: GearSetup }
  | { kind: "tool"; entity: Tool }
  | { kind: "sport"; entity: Sport }
  | { kind: "brand"; entity: Brand }
  | { kind: "alternatives"; entity: Product }
  | { kind: "author"; entity: { id: string; slug: string; noindex?: boolean } }
  | { kind: "static"; path: string };

type EligibilityEntity = Exclude<
  EligibilityInput,
  { kind: "static"; path: string }
>["entity"];

/** Per-entity memo for a single process (build, sitemap, search, tests). */
const eligibilityMemo = new WeakMap<
  object,
  Map<string, LaunchEligibility>
>();

function eligibilityMemoKey(
  kind: LaunchEntityKind,
  preview: boolean,
  ctx?: LaunchEligibilityContext,
): string {
  return `${kind}|${preview ? 1 : 0}|${ctx?.isDev ? 1 : 0}|${ctx?.now ?? ""}`;
}

function computeLaunchEligibility(
  input: EligibilityInput,
  _ctx: LaunchEligibilityContext | undefined,
  preview: boolean,
  opts: ReturnType<typeof publishOpts>,
): LaunchEligibility {
  switch (input.kind) {
    case "product":
      return eligibilityForProduct(input.entity, opts, preview);
    case "review":
      return eligibilityForReview(input.entity, opts, preview);
    case "best-guide":
      return eligibilityForBest(input.entity, opts, preview);
    case "buying-guide":
      return eligibilityForGuide(input.entity, opts, preview);
    case "comparison":
      return eligibilityForComparison(input.entity, opts, preview);
    case "setup":
      return eligibilityForSetup(input.entity, opts, preview);
    case "tool":
      return eligibilityForTool(input.entity, opts, preview);
    case "sport":
      return eligibilityForSport(input.entity, opts, preview);
    case "brand":
      return eligibilityForBrand(input.entity, preview);
    case "alternatives":
      return eligibilityForAlternatives(input.entity, opts, preview);
    case "author":
      return eligibilityForAuthor(input.entity, opts, preview);
    case "static":
      return result({
        disposition: "INDEXABLE",
        kind: "static",
        path: input.path,
        quality: "N/A",
        reasons: [reason("static_trust_or_hub")],
        preview,
      });
  }
}

/**
 * Unified launch eligibility.
 * Precedence: vertical hold → publication → technical noindex → quality policy.
 */
export function getLaunchEligibility(
  input: EligibilityInput,
  ctx?: LaunchEligibilityContext,
): LaunchEligibility {
  const preview = isLaunchPreviewContext(ctx);
  const opts = publishOpts(ctx);
  const entity: EligibilityEntity | undefined =
    input.kind === "static" ? undefined : input.entity;

  if (entity && typeof entity === "object") {
    const key = eligibilityMemoKey(input.kind, preview, ctx);
    let inner = eligibilityMemo.get(entity);
    if (!inner) {
      inner = new Map();
      eligibilityMemo.set(entity, inner);
    }
    const hit = inner.get(key);
    if (hit) return hit;
    const computed = computeLaunchEligibility(input, ctx, preview, opts);
    inner.set(key, computed);
    return computed;
  }

  return computeLaunchEligibility(input, ctx, preview, opts);
}

function eligibilityForProduct(
  product: Product,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/products/${product.slug}`;
  const vertical = resolveEntityVerticalPolicy(product.sportIds);
  if (verticalHidesDeepEntities(vertical, "product")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "product",
      id: product.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
      ],
      preview,
    });
  }

  if (!isPubliclyVisible(product, opts) || product.noindex) {
    return result({
      disposition: "HIDDEN_404",
      kind: "product",
      id: product.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason(
          product.noindex ? "noindex" : "not_production_exposed",
          product.status,
        ),
      ],
      preview,
    });
  }

  const category = getCategoryById(product.categoryId, opts);
  const assessed = assessProductLaunchQuality(product, opts);
  const mapped = mapProductQuality(
    product,
    assessed.quality,
    assessed.reasons,
    preview,
  );

  // Soft-gated categories: disposition overlay only — do not redefine quality.
  if (category && isSoftGatedCategory(category)) {
    const softReason = reason("soft_gated_category", category.slug);
    const reasons = mapped.reasons.some((r) => r.code === "soft_gated_category")
      ? mapped.reasons
      : [...mapped.reasons, softReason];
    if (mapped.disposition === "INDEXABLE") {
      return {
        ...mapped,
        disposition: "PUBLIC_NOINDEX",
        reasons,
      };
    }
    return { ...mapped, reasons };
  }

  return mapped;
}

function mapProductQuality(
  product: Product,
  quality: LaunchQualityClass,
  reasonCodes: string[],
  preview: boolean,
): LaunchEligibility {
  const path = `/products/${product.slug}`;
  const reasons = reasonCodes.map((c) => reason(c));

  if (quality === "BLOCKED") {
    return result({
      disposition: "HIDDEN_404",
      kind: "product",
      id: product.id,
      path,
      quality,
      reasons,
      preview,
    });
  }

  if (quality === "LAUNCH_READY") {
    return result({
      disposition: "INDEXABLE",
      kind: "product",
      id: product.id,
      path,
      quality,
      reasons,
      preview,
    });
  }

  if (quality === "NEEDS_MINOR_WORK") {
    if (isMinorWorkProductApproved(product.slug)) {
      return result({
        disposition: "INDEXABLE",
        kind: "product",
        id: product.id,
        path,
        quality,
        reasons: [...reasons, reason("minor_work_approved")],
        preview,
      });
    }
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "product",
      id: product.id,
      path,
      quality,
      reasons: [...reasons, reason("minor_work_held")],
      preview,
    });
  }

  // THIN / INCOMPLETE
  return result({
    disposition: "PUBLIC_NOINDEX",
    kind: "product",
    id: product.id,
    path,
    quality,
    reasons: [...reasons, reason("quality_not_launch_ready")],
    preview,
  });
}

function eligibilityForReview(
  review: Review,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/reviews/${review.slug}`;
  const product = getProductById(review.productId, opts);
  const sportIds = product?.sportIds ?? [];
  const vertical = resolveEntityVerticalPolicy(sportIds);

  if (verticalHidesDeepEntities(vertical, "review")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "review",
      id: review.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
      ],
      preview,
    });
  }

  const assessed = assessReviewLaunchQuality(review, opts);
  const reasons = assessed.reasons.map((c) => reason(c));

  if (assessed.quality === "BLOCKED") {
    return result({
      disposition: "HIDDEN_404",
      kind: "review",
      id: review.id,
      path,
      quality: assessed.quality,
      reasons,
      preview,
    });
  }

  if (assessed.quality === "LAUNCH_READY") {
    return withEditorialReadyGate(
      result({
        disposition: "INDEXABLE",
        kind: "review",
        id: review.id,
        path,
        quality: assessed.quality,
        reasons,
        preview,
      }),
      { kind: "review", entity: review },
      opts,
    );
  }

  if (assessed.quality === "NEEDS_MINOR_WORK") {
    if (isMinorWorkReviewApproved(review.slug)) {
      return withEditorialReadyGate(
        result({
          disposition: "INDEXABLE",
          kind: "review",
          id: review.id,
          path,
          quality: assessed.quality,
          reasons: [...reasons, reason("minor_work_approved")],
          preview,
        }),
        { kind: "review", entity: review },
        opts,
      );
    }
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "review",
      id: review.id,
      path,
      quality: assessed.quality,
      reasons: [...reasons, reason("minor_work_held")],
      preview,
    });
  }

  // THIN / DUPLICATIVE — scaffold / near-duplicate pages offer little public
  // value; hide rather than soft-landing as a noindex "review".
  return result({
    disposition: "HIDDEN_404",
    kind: "review",
    id: review.id,
    path,
    quality: assessed.quality,
    reasons: [...reasons, reason("quality_not_launch_ready")],
    preview,
  });
}

function eligibilityForBest(
  guide: BestGuide,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/best/${guide.slug}`;
  const vertical = resolveEntityVerticalPolicy(
    guide.sportId ? [guide.sportId] : [],
  );

  if (verticalHidesDeepEntities(vertical, "best-guide")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "best-guide",
      id: guide.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
      ],
      preview,
    });
  }

  const assessed = assessBestGuideLaunchQuality(
    getBestGuideSeedBySlug(guide.slug, opts) ?? guide,
    opts,
  );
  const reasons = assessed.reasons.map((c) => reason(c));

  if (assessed.quality === "BLOCKED") {
    return result({
      disposition: "HIDDEN_404",
      kind: "best-guide",
      id: guide.id,
      path,
      quality: assessed.quality,
      reasons,
      preview,
    });
  }

  // Day-1: only LAUNCH_READY Best Guides are indexable
  if (assessed.quality === "LAUNCH_READY") {
    return withEditorialReadyGate(
      result({
        disposition: "INDEXABLE",
        kind: "best-guide",
        id: guide.id,
        path,
        quality: assessed.quality,
        reasons,
        preview,
      }),
      { kind: "best-guide", entity: guide },
      opts,
    );
  }

  if (assessed.quality === "THIN") {
    return result({
      disposition: "HIDDEN_404",
      kind: "best-guide",
      id: guide.id,
      path,
      quality: assessed.quality,
      reasons: [...reasons, reason("thin_best_guide_hidden")],
      preview,
    });
  }

  // NEEDS_MINOR_WORK — hold (noindex), do not promote
  return result({
    disposition: "PUBLIC_NOINDEX",
    kind: "best-guide",
    id: guide.id,
    path,
    quality: assessed.quality,
    reasons: [...reasons, reason("best_guide_not_launch_ready")],
    preview,
  });
}

function eligibilityForGuide(
  guide: BuyingGuide,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/guides/${guide.slug}`;
  const vertical = resolveEntityVerticalPolicy(
    guide.sportId ? [guide.sportId] : [],
  );

  if (verticalHidesDeepEntities(vertical, "buying-guide")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "buying-guide",
      id: guide.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
      ],
      preview,
    });
  }

  if (!isPubliclyVisible(guide, opts) || guide.noindex) {
    return result({
      disposition: "HIDDEN_404",
      kind: "buying-guide",
      id: guide.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("not_production_exposed")],
      preview,
    });
  }

  // Soft-gated categories (remaining: padel shells) — hold related
  // guides from Day-1 indexation with the category catalog.
  if (guide.categoryId) {
    const category = getCategoryById(guide.categoryId, opts);
    if (category && isSoftGatedCategory(category)) {
      return result({
        disposition: "PUBLIC_NOINDEX",
        kind: "buying-guide",
        id: guide.id,
        path,
        quality: "COMPLETE",
        reasons: [reason("soft_gated_category", category.slug)],
        preview,
      });
    }
  }

  const assessed = assessGuideQuality(guide);
  const quality = mapGuideStatus(assessed.status);
  const reasons = assessed.issues.slice(0, 8).map((i) => reason(i));

  if (quality === "BLOCKED") {
    return result({
      disposition: "HIDDEN_404",
      kind: "buying-guide",
      id: guide.id,
      path,
      quality,
      reasons,
      preview,
    });
  }

  if (quality === "COMPLETE") {
    return withEditorialReadyGate(
      result({
        disposition: "INDEXABLE",
        kind: "buying-guide",
        id: guide.id,
        path,
        quality,
        reasons: reasons.length ? reasons : [reason("guide_complete")],
        preview,
      }),
      { kind: "buying-guide", entity: guide },
      opts,
    );
  }

  if (quality === "THIN" || quality === "RESEARCH") {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "buying-guide",
      id: guide.id,
      path,
      quality,
      reasons: [...reasons, reason("guide_not_complete")],
      preview,
    });
  }

  // STALE / EDITORIAL_REVIEW
  return result({
    disposition: "PUBLIC_NOINDEX",
    kind: "buying-guide",
    id: guide.id,
    path,
    quality,
    reasons: [...reasons, reason("guide_hold")],
    preview,
  });
}

function eligibilityForComparison(
  comparison: Comparison,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/compare/${comparison.slug}`;
  const resolved = comparison.productIds.map((id) => ({
    id,
    product: getProductById(id, opts),
  }));
  const products = resolved
    .map((r) => r.product)
    .filter((p): p is Product => Boolean(p));
  const missingIds = resolved.filter((r) => !r.product).map((r) => r.id);

  // Broken peer refs (draft / deleted / unpublished): never sitemap, index, or promote.
  // Matches getComparisonPageData half-comparison guard → HTTP 404.
  if (
    comparison.productIds.length < 2 ||
    missingIds.length > 0 ||
    products.length !== comparison.productIds.length
  ) {
    return result({
      disposition: "HIDDEN_404",
      kind: "comparison",
      id: comparison.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason(
          "missing_comparison_product",
          missingIds.length
            ? missingIds.join(",")
            : `resolved=${products.length}/${comparison.productIds.length}`,
        ),
      ],
      preview,
    });
  }

  const sportIds = [...new Set(products.flatMap((p) => p.sportIds))];
  const vertical = resolveEntityVerticalPolicy(sportIds);

  if (verticalHidesDeepEntities(vertical, "comparison")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "comparison",
      id: comparison.id,
      path,
      quality: "BLOCKED",
      reasons: [
        reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
      ],
      preview,
    });
  }

  // Soft-gated product categories: do not index clothing/nutrition/etc comps
  // when every compared product sits in a soft-gated category.
  if (products.length >= 2) {
    const softFlags = products.map((p) => {
      const cat = getCategoryById(p.categoryId, opts);
      return cat ? isSoftGatedCategory(cat) : false;
    });
    if (softFlags.every(Boolean)) {
      return result({
        disposition: "PUBLIC_NOINDEX",
        kind: "comparison",
        id: comparison.id,
        path,
        quality: "MEANINGFUL",
        reasons: [reason("soft_gated_comparison_products")],
        preview,
      });
    }
  }

  const assessed = assessComparisonLaunchQuality(comparison, opts);
  const reasons = assessed.reasons.map((c) => reason(c));

  if (assessed.quality === "BLOCKED") {
    return result({
      disposition: "HIDDEN_404",
      kind: "comparison",
      id: comparison.id,
      path,
      quality: assessed.quality,
      reasons,
      preview,
    });
  }

  if (assessed.meaningful) {
    return withEditorialReadyGate(
      result({
        disposition: "INDEXABLE",
        kind: "comparison",
        id: comparison.id,
        path,
        quality: "MEANINGFUL",
        reasons,
        preview,
      }),
      { kind: "comparison", entity: comparison },
      opts,
    );
  }

  return result({
    disposition: "PUBLIC_NOINDEX",
    kind: "comparison",
    id: comparison.id,
    path,
    quality: "THIN",
    reasons: [...reasons, reason("thin_comparison_held")],
    preview,
  });
}

function eligibilityForSetup(
  setup: GearSetup,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/setups/${setup.slug}`;
  const vertical = resolveEntityVerticalPolicy(
    setup.sportId ? [setup.sportId] : [],
  );
  if (verticalHidesDeepEntities(vertical, "setup")) {
    return result({
      disposition: "HIDDEN_404",
      kind: "setup",
      id: setup.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("vertical_hold", `${vertical.slug}:${vertical.mode}`)],
      preview,
    });
  }
  if (!isPubliclyVisible(setup, opts) || setup.noindex) {
    return result({
      disposition: "HIDDEN_404",
      kind: "setup",
      id: setup.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("not_production_exposed")],
      preview,
    });
  }
  return result({
    disposition: "INDEXABLE",
    kind: "setup",
    id: setup.id,
    path,
    quality: "N/A",
    reasons: [reason("setup_published")],
    preview,
  });
}

function eligibilityForTool(
  tool: Tool,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = tool.href ?? `/tools/${tool.slug}`;
  if (!tool.available || !isPubliclyVisible(tool, opts) || tool.noindex) {
    return result({
      disposition: "HIDDEN_404",
      kind: "tool",
      id: tool.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("tool_unavailable_or_hidden")],
      preview,
    });
  }

  // Cross-sport / sportless tools (e.g. /compare hub) stay eligible when available.
  if ((tool.sportIds?.length ?? 0) > 0) {
    const vertical = resolveEntityVerticalPolicy(tool.sportIds);
    if (verticalHidesDeepEntities(vertical, "tool")) {
      return result({
        disposition: "HIDDEN_404",
        kind: "tool",
        id: tool.id,
        path,
        quality: "BLOCKED",
        reasons: [
          reason("vertical_hold", `${vertical.slug}:${vertical.mode}`),
        ],
        preview,
      });
    }
  }

  return result({
    disposition: "INDEXABLE",
    kind: "tool",
    id: tool.id,
    path,
    quality: "N/A",
    reasons: [reason("tool_available")],
    preview,
  });
}

function eligibilityForSport(
  sport: Sport,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/${sport.slug}`;
  const policy = getVerticalSportPolicy(sport.id);

  if (sport.contentStatus !== "live" || !isPubliclyVisible(sport, opts)) {
    return result({
      disposition: "HIDDEN_404",
      kind: "sport",
      id: sport.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("sport_not_live", sport.contentStatus)],
      preview,
    });
  }

  if (sport.slug === "hyrox") {
    return result({
      disposition: "HIDDEN_404",
      kind: "sport",
      id: sport.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("hyrox_alias_redirect_only")],
      preview,
    });
  }

  if (policy.mode === "enabled") {
    return result({
      disposition: "INDEXABLE",
      kind: "sport",
      id: sport.id,
      path,
      quality: "N/A",
      reasons: [reason("vertical_enabled", policy.slug)],
      preview,
    });
  }

  // selective / disabled hubs: keep URL but do not index as a deep vertical claim
  return result({
    disposition: "PUBLIC_NOINDEX",
    kind: "sport",
    id: sport.id,
    path,
    quality: "N/A",
    reasons: [reason("vertical_hub_hold", `${policy.slug}:${policy.mode}`)],
    preview,
  });
}

function eligibilityForBrand(
  brand: Brand,
  preview: boolean,
): LaunchEligibility {
  const path = `/brands/${brand.slug}`;
  const holdClass = classifyBrandHubHold(brand);
  if (!canRenderBrandHub(brand)) {
    const reasonCode =
      holdClass === "HOLD_NO_PRODUCTS"
        ? "brand_hub_no_products"
        : holdClass === "HOLD_INSUFFICIENT_DEPTH"
          ? "brand_hub_insufficient_depth"
          : "brand_hub_not_indexable";
    return result({
      disposition: "HIDDEN_404",
      kind: "brand",
      id: brand.id,
      path,
      quality: "BLOCKED",
      reasons: [reason(reasonCode)],
      preview,
    });
  }
  if (
    BRAND_HUB_UNIQUENESS_HOLD_SLUGS.has(brand.slug) ||
    !isBrandHubIndexable(brand)
  ) {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "brand",
      id: brand.id,
      path,
      quality: "N/A",
      reasons: [
        reason(
          BRAND_HUB_UNIQUENESS_HOLD_SLUGS.has(brand.slug)
            ? "brand_hub_uniqueness_hold"
            : "brand_hub_noindex",
        ),
      ],
      preview,
    });
  }
  return result({
    disposition: "INDEXABLE",
    kind: "brand",
    id: brand.id,
    path,
    quality: "N/A",
    reasons: [reason("brand_hub_ok")],
    preview,
  });
}

function eligibilityForAlternatives(
  product: Product,
  opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/products/${product.slug}/alternatives`;

  // Parent eligibility is memoized from the product sitemap loop — keep it fast.
  const productElig = getLaunchEligibility(
    { kind: "product", entity: product },
    { isDev: opts.isDev, now: opts.now, preview },
  );
  if (productElig.disposition === "HIDDEN_404") {
    return result({
      disposition: "HIDDEN_404",
      kind: "alternatives",
      id: product.id,
      path,
      quality: productElig.quality,
      reasons: [
        reason("parent_product_hidden"),
        ...productElig.reasons,
      ],
      preview,
    });
  }

  const relationships = getAllProductRelationships();
  const gate = canPublishAlternativesPage(product, relationships);
  if (!gate.ok) {
    const hold = classifyAlternativesHold(
      product,
      relationships,
      getProducts(opts),
    );
    const holdCode =
      hold === "THIN_UNEXPLAINED" ? "thin_decision_shape" : hold.toLowerCase();
    return result({
      disposition: "HIDDEN_404",
      kind: "alternatives",
      id: product.id,
      path,
      quality: "BLOCKED",
      reasons: [reason(holdCode), ...gate.reasons.map((r) => reason(r))],
      preview,
    });
  }

  if (productElig.disposition !== "INDEXABLE") {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "alternatives",
      id: product.id,
      path,
      quality: productElig.quality,
      reasons: [
        reason("parent_product_not_indexable"),
        ...productElig.reasons,
      ],
      preview,
    });
  }

  if (!ALTERNATIVES_INDEXABLE_CATEGORIES.has(product.categoryId)) {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "alternatives",
      id: product.id,
      path,
      quality: "N/A",
      reasons: [
        reason("alternatives_category_noindex"),
        reason("alternatives_ok_render"),
      ],
      preview,
    });
  }

  if (ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(product.slug)) {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "alternatives",
      id: product.id,
      path,
      quality: "N/A",
      reasons: [
        reason("alternatives_uniqueness_hold"),
        reason("alternatives_ok_render"),
      ],
      preview,
    });
  }

  // Fix 82 — same content bar as assessAlternativesIndexability / page robots.
  const signals = computeAlternativesQualitySignals(product, opts);
  const content = evaluateAlternativesContentIndexable({
    canPublish: true,
    categoryId: product.categoryId,
    productSlug: product.slug,
    substantiveCount: signals.substantiveCount,
    reasonGroupCount: signals.reasonGroupCount,
    distinctCopy: signals.distinctCopy,
  });
  if (!content.indexable) {
    return result({
      disposition: "PUBLIC_NOINDEX",
      kind: "alternatives",
      id: product.id,
      path,
      quality: "N/A",
      reasons: [
        ...content.reasons.map((r) => reason(r)),
        reason("alternatives_ok_render"),
      ],
      preview,
    });
  }

  return withEditorialReadyGate(
    result({
      disposition: "INDEXABLE",
      kind: "alternatives",
      id: product.id,
      path,
      quality: "N/A",
      reasons: [reason("alternatives_ok")],
      preview,
    }),
    { kind: "alternatives", entity: product },
    opts,
  );
}

function eligibilityForAuthor(
  author: {
    id: string;
    slug: string;
    noindex?: boolean;
  },
  _opts: PublishResolverOptions,
  preview: boolean,
): LaunchEligibility {
  const path = `/authors/${author.slug}`;
  if (author.noindex) {
    return result({
      disposition: "HIDDEN_404",
      kind: "author",
      id: author.id,
      path,
      quality: "BLOCKED",
      reasons: [reason("author_hidden")],
      preview,
    });
  }
  return result({
    disposition: "INDEXABLE",
    kind: "author",
    id: author.id,
    path,
    quality: "N/A",
    reasons: [reason("author_ok")],
    preview,
  });
}

/** Helpers for sitemap / search */
export function isIndexableEligibility(
  elig: LaunchEligibility,
): boolean {
  return elig.disposition === "INDEXABLE";
}

export function shouldRenderPublicly(
  elig: LaunchEligibility,
): boolean {
  if (elig.disposition === "HIDDEN_404") return elig.previewVisible;
  return true;
}

export function shouldNoindex(elig: LaunchEligibility): boolean {
  return elig.disposition !== "INDEXABLE";
}

/** Avoid promoting non-indexable entities in search / cards / hubs */
export function shouldPromotePublicly(
  elig: LaunchEligibility,
): boolean {
  return elig.disposition === "INDEXABLE";
}

/**
 * Review slug safe for public "View review" / hub / Best CTAs.
 * Held THIN/DUPLICATIVE/NMW reviews must not be promoted as full editorial.
 */
export function promotableReviewSlug(
  review: Review | undefined | null,
  opts?: PublishResolverOptions & { preview?: boolean },
): string | undefined {
  if (!review) return undefined;
  const elig = getLaunchEligibility({ kind: "review", entity: review }, opts);
  return shouldPromotePublicly(elig) ? review.slug : undefined;
}

/** Category / related lists: omit HIDDEN (404) entities; noindex pages may still appear */
export function isLaunchListable(elig: LaunchEligibility): boolean {
  return elig.disposition !== "HIDDEN_404";
}
