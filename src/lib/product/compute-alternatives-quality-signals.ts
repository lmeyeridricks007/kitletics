/**
 * Fix 82 / 84 — lightweight Alternatives quality signals for sitemap / assessor.
 * Builds ranked decision cards without offers, media, or comparison matrices.
 *
 * Fix 84: defer `buildAlternativeDecisionCopy` until after diversity ranking
 * so we only pay for ≤ MAX_ALTERNATIVES cards (not every graph edge).
 */
import type { Product } from "@/domain/products/types";
import type { ProductRelationship } from "@/domain/relationships/types";
import type { ProductRelationshipType } from "@/domain/relationships/types";
import { ALT_GROUP_LABELS, isAlternativeType } from "@/domain/relationships/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import {
  getAlternativesFromGraph,
  getGenerationRelationships,
  getAllProductRelationships,
} from "@/repositories/relationships";
import { getProductById } from "@/repositories/products";
import {
  getAlternativesPageConfig,
  reasonConfigForType,
  type AlternativesReasonConfig,
} from "@/lib/product/alternatives-config";
import {
  buildAlternativeDecisionCopy,
  alternativesHaveDistinctDecisionCopy,
} from "@/lib/product/alternative-decision-copy";
import {
  countRankedReasonGroups,
  countSubstantiveAlternatives,
  signalsFromPageParts,
  type AlternativesQualitySignals,
} from "@/lib/product/alternatives-quality-signals";

const MAX_ALTERNATIVES = 8;

const TYPE_PRIORITY: Partial<Record<ProductRelationshipType, number>> = {
  "previous-generation": 100,
  "next-generation": 100,
  "more-cushioned": 90,
  "more-stable": 90,
  "more-responsive": 90,
  "more-durable": 90,
  faster: 88,
  "race-focused-alternative": 85,
  "long-run-alternative": 80,
  "trail-alternative": 80,
  "better-value": 70,
  "cheaper-alternative": 68,
  cheaper: 68,
  "beginner-friendly": 65,
  "daily-training-alternative": 60,
  "direct-competitor": 50,
  similar: 40,
};

function typePriority(type: ProductRelationshipType): number {
  return TYPE_PRIORITY[type] ?? 30;
}

function isWeakAlternativeEdge(
  relationship: ProductRelationship,
  source: Product,
  alt: Product,
): boolean {
  if (source.categoryId !== alt.categoryId) return true;
  const hasSignal =
    (alt.strengths?.length ?? 0) > 0 ||
    (source.strengths?.length ?? 0) > 0 ||
    (relationship.reasons ?? []).some((r) => r.trim().length > 40);
  if (!hasSignal) return true;
  const joined = (relationship.reasons ?? []).join(" ");
  if (
    /same-category alternative when you want a peer/i.test(joined) &&
    (alt.strengths?.length ?? 0) === 0 &&
    (source.strengths?.length ?? 0) === 0
  ) {
    return true;
  }
  return false;
}

type RankSeed = {
  reasonId: string;
  relationshipType: ProductRelationshipType;
  relationship: ProductRelationship;
  product: Product;
  relevance: number;
};

type LightAlt = {
  reasonId: string;
  whyAlternative: string;
  whoShouldSwitch: string;
  whoShouldStay: string;
  betterAt: string[];
  worseAt: string[];
  product: Product;
};

function rankWithDiversity(
  items: RankSeed[],
  preferredReasonOrder: string[],
): RankSeed[] {
  const byReason = new Map<string, RankSeed[]>();
  for (const item of items) {
    const list = byReason.get(item.reasonId) ?? [];
    list.push(item);
    byReason.set(item.reasonId, list);
  }
  for (const list of byReason.values()) {
    list.sort((a, b) => b.relevance - a.relevance);
  }

  const result: RankSeed[] = [];
  const usedProducts = new Set<string>();
  const reasonQueue = [
    ...preferredReasonOrder.filter((id) => byReason.has(id)),
    ...[...byReason.keys()].filter((id) => !preferredReasonOrder.includes(id)),
  ];

  let added = true;
  while (added && result.length < MAX_ALTERNATIVES) {
    added = false;
    for (const reasonId of reasonQueue) {
      if (result.length >= MAX_ALTERNATIVES) break;
      const list = byReason.get(reasonId);
      if (!list?.length) continue;
      const next = list.find((i) => !usedProducts.has(i.product.id));
      if (!next) continue;
      result.push(next);
      usedProducts.add(next.product.id);
      added = true;
    }
  }

  return result;
}

const signalsCache = new Map<string, AlternativesQualitySignals>();
let relationshipsCache: ReturnType<typeof getAllProductRelationships> | undefined;

function relationships(): ReturnType<typeof getAllProductRelationships> {
  if (!relationshipsCache) relationshipsCache = getAllProductRelationships();
  return relationshipsCache;
}

/**
 * Fast path for assessAlternativesIndexability / sitemap — no page chrome.
 */
export function computeAlternativesQualitySignals(
  product: Product,
  options?: PublishResolverOptions,
): AlternativesQualitySignals {
  const cacheKey = `${product.id}::${options?.isDev ? "dev" : "prod"}`;
  const hit = signalsCache.get(cacheKey);
  if (hit) return hit;

  const allRels = relationships();
  const gate = canPublishAlternativesPage(product, allRels);
  const config = getAlternativesPageConfig(product.categoryId);

  // Cheap fail: graph gate already failed — no decision-copy work.
  if (!gate.ok) {
    const signals = signalsFromPageParts({
      productSlug: product.slug,
      categoryId: product.categoryId,
      canPublish: false,
      alternativeCount: gate.alternativeCount,
      substantiveCount: 0,
      reasonGroupCount: 0,
      distinctCopy: false,
    });
    signalsCache.set(cacheKey, signals);
    return signals;
  }

  const alts = getAlternativesFromGraph(product.id).filter((r) => {
    const alt = getProductById(r.targetProductId, options);
    if (!alt || alt.status !== "published") return false;
    return !isWeakAlternativeEdge(r, product, alt);
  });
  const gen = getGenerationRelationships(product.id).filter(
    (r) =>
      r.type === "previous-generation" || r.type === "next-generation",
  );
  const seen = new Set(alts.map((r) => r.id));
  const merged = [...alts];
  for (const g of gen) {
    if (!seen.has(g.id)) merged.push(g);
  }

  const rawByTarget = new Map<string, RankSeed>();
  for (const relationship of merged) {
    if (
      !isAlternativeType(relationship.type) &&
      relationship.type !== "previous-generation" &&
      relationship.type !== "next-generation"
    ) {
      continue;
    }
    const alt = getProductById(relationship.targetProductId, options);
    if (!alt || alt.status !== "published") continue;

    const reason: AlternativesReasonConfig =
      reasonConfigForType(config, relationship.type) ??
      ({
        id: relationship.type,
        types: [relationship.type],
        title: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        tabLabel: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        badgeLabel: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        description: "",
        icon: "sparkles",
      });

    const seed: RankSeed = {
      reasonId: reason.id,
      relationshipType: relationship.type,
      relationship,
      product: alt,
      relevance:
        (relationship.strength ?? 60) +
        typePriority(relationship.type) +
        (relationship.reasons.length > 1 ? 5 : 0),
    };

    const existing = rawByTarget.get(alt.id);
    if (
      !existing ||
      typePriority(relationship.type) > typePriority(existing.relationshipType)
    ) {
      rawByTarget.set(alt.id, seed);
    }
  }

  const preferredOrder = config.reasons.map((r) => r.id);
  const ranked = rankWithDiversity([...rawByTarget.values()], preferredOrder);

  // Cheap fail before decision-copy: need ≥2 reason groups and ≥3 ranked peers.
  const reasonIds = new Set(ranked.map((r) => r.reasonId));
  if (ranked.length < 3 || reasonIds.size < 2) {
    const signals = signalsFromPageParts({
      productSlug: product.slug,
      categoryId: product.categoryId,
      canPublish: true,
      alternativeCount: ranked.length,
      substantiveCount: 0,
      reasonGroupCount: reasonIds.size,
      distinctCopy: false,
    });
    signalsCache.set(cacheKey, signals);
    return signals;
  }

  // Decision copy only for the ranked shortlist (≤8).
  const alternatives: LightAlt[] = ranked.map((seed) => {
    const reason: AlternativesReasonConfig =
      reasonConfigForType(config, seed.relationshipType) ??
      ({
        id: seed.reasonId,
        types: [seed.relationshipType],
        title: ALT_GROUP_LABELS[seed.relationshipType] ?? seed.reasonId,
        tabLabel: ALT_GROUP_LABELS[seed.relationshipType] ?? seed.reasonId,
        badgeLabel: ALT_GROUP_LABELS[seed.relationshipType] ?? seed.reasonId,
        description: "",
        icon: "sparkles",
      });
    const decision = buildAlternativeDecisionCopy({
      source: product,
      alternative: seed.product,
      relationship: seed.relationship,
      reason,
    });
    return {
      reasonId: seed.reasonId,
      whyAlternative: decision.whyAlternative,
      whoShouldSwitch: decision.whoShouldSwitch,
      whoShouldStay: decision.whoShouldStay,
      betterAt: decision.betterAt,
      worseAt: decision.worseAt,
      product: seed.product,
    };
  });

  const distinctNames = [
    product.fullName,
    product.name,
    ...alternatives.flatMap((a) => [a.product.fullName, a.product.name]),
  ].filter(Boolean);

  const signals = signalsFromPageParts({
    productSlug: product.slug,
    categoryId: product.categoryId,
    canPublish: gate.ok,
    alternativeCount: alternatives.length,
    substantiveCount: countSubstantiveAlternatives(alternatives),
    reasonGroupCount: countRankedReasonGroups(alternatives),
    distinctCopy: alternativesHaveDistinctDecisionCopy(
      alternatives,
      distinctNames,
    ),
  });
  signalsCache.set(cacheKey, signals);
  return signals;
}

/** Test helper — clear process caches between isolated suites if needed. */
export function clearAlternativesQualitySignalsCacheForTests(): void {
  signalsCache.clear();
  relationshipsCache = undefined;
}
