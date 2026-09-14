/**
 * Shared helpers for Prompt 26 racket catalog QA scripts.
 */

import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { recommendations } from "@/content/recommendations";
import { offers } from "@/content/offers";
import { evidence } from "@/content/evidence";
import type { Product } from "@/domain/products/types";

export const PADEL_RACKET = "cat-padel-rackets";
export const TENNIS_RACKET = "cat-tennis-rackets";

export function byCategory(catId: string): Product[] {
  return products.filter((p) => p.categoryId === catId);
}

export function brandName(id: string): string {
  return brands.find((b) => b.id === id)?.name ?? id;
}

export function reportByBrand(catId: string) {
  const list = byCategory(catId);
  const map = new Map<
    string,
    {
      products: number;
      current: number;
      previous: number;
      finderEligible: number;
      recReady: number;
      imageReady: number;
      offerReady: number;
    }
  >();
  for (const p of list) {
    const b = brandName(p.brandId);
    const row = map.get(b) ?? {
      products: 0,
      current: 0,
      previous: 0,
      finderEligible: 0,
      recReady: 0,
      imageReady: 0,
      offerReady: 0,
    };
    row.products += 1;
    if (p.lifecycleStatus === "current") row.current += 1;
    if (p.lifecycleStatus === "previous-generation") row.previous += 1;
    if (isFinderEligible(p)) row.finderEligible += 1;
    if (recommendations.some((r) => r.productId === p.id)) row.recReady += 1;
    if (p.images[0]?.src) row.imageReady += 1;
    if (offers.some((o) => o.productId === p.id)) row.offerReady += 1;
    map.set(b, row);
  }
  return [...map.entries()].sort((a, b) => b[1].products - a[1].products);
}

export function isFinderEligible(p: Product): boolean {
  const s = p.specifications;
  if (p.lifecycleStatus !== "current") return false;
  if (!p.images[0]?.src) return false;
  if (p.categoryId === PADEL_RACKET) {
    return (
      s.shape != null &&
      (s.weightMin != null || s.weight != null) &&
      s.balance != null
    );
  }
  if (p.categoryId === TENNIS_RACKET) {
    return (
      s.headSizeSqIn != null &&
      (s.strungWeightG != null || s.unstrungWeightG != null) &&
      s.balance != null &&
      s.stringPattern != null
    );
  }
  return Object.keys(s).length >= 2;
}

export function isHighConfidence(p: Product): boolean {
  if (!isFinderEligible(p)) return false;
  const hasRec = recommendations.some((r) => r.productId === p.id);
  const hasEv = (p.evidenceIds?.length ?? 0) > 0 || hasRec;
  if (p.categoryId === PADEL_RACKET) {
    return (
      hasEv &&
      p.specifications.core != null &&
      p.specifications.face != null
    );
  }
  return hasEv && p.specifications.powerPositioning != null;
}

export function specCoverage(catId: string, keys: string[]) {
  const list = byCategory(catId);
  const out: Record<string, { n: number; pct: number }> = {};
  for (const k of keys) {
    const n = list.filter(
      (p) => p.specifications[k] != null && p.specifications[k] !== "",
    ).length;
    out[k] = {
      n,
      pct: list.length ? Math.round((n / list.length) * 100) : 0,
    };
  }
  return out;
}

export function offerCoverage(catId: string, regions: string[]) {
  const list = byCategory(catId);
  const out: Record<string, number> = {};
  for (const r of regions) {
    out[r] = list.filter((p) =>
      offers.some((o) => o.productId === p.id && o.region === r),
    ).length;
  }
  return out;
}

export function mediaFlags(catId: string) {
  const list = byCategory(catId);
  const placeholder = list.filter(
    (p) =>
      p.images[0]?.alt?.toLowerCase().includes("placeholder") ||
      p.images[0]?.src?.endsWith(".svg"),
  );
  const missing = list.filter((p) => !p.images[0]?.src);
  const noProvenance = list.filter(
    (p) => p.images[0] && !p.images[0].source && !p.images[0].licence,
  );
  return {
    total: list.length,
    withHero: list.length - missing.length,
    placeholderLabeled: placeholder.length,
    missing: missing.length,
    noProvenance: noProvenance.length,
  };
}

export function evidenceForCategory(catId: string) {
  const ids = new Set(
    byCategory(catId).flatMap((p) => p.evidenceIds ?? []),
  );
  return evidence.filter((e) => ids.has(e.id));
}
