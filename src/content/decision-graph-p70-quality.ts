/**
 * Fix 70 — drop semantically INVALID alternatives; replace WEAK only
 * when a genuine STRONG same-job peer is unused. Does not pad to a quota.
 */
import type { Product } from "@/domain/products/types";
import {
  scoreAlternativePair,
  semanticAltCluster,
} from "@/lib/decision-graph/semantic-quality";
import { alternativeMarketCluster } from "@/content/alternatives-p65-completion";

function clusterKey(product: Product): string {
  return semanticAltCluster(product) || alternativeMarketCluster(product);
}

function isCatalogLive(product: Product | undefined): product is Product {
  return Boolean(product && product.status === "published" && !product.noindex);
}

export function applyDecisionGraphP70Quality(products: Product[]): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const live = products.filter(isCatalogLive);

  const byCluster = new Map<string, Product[]>();
  for (const p of live) {
    const key = clusterKey(p);
    const list = byCluster.get(key) ?? [];
    list.push(p);
    byCluster.set(key, list);
  }

  return products.map((product) => {
    if (!isCatalogLive(product)) return product;
    const ids = product.alternativeProductIds ?? [];
    if (!ids.length) return product;

    const strongValid: string[] = [];
    const weak: string[] = [];
    const seen = new Set<string>();
    for (const id of ids) {
      if (!id || id === product.id || seen.has(id)) continue;
      seen.add(id);
      const target = byId.get(id);
      if (!isCatalogLive(target)) continue;
      const scored = scoreAlternativePair(product, target);
      if (scored.cls === "INVALID") continue;
      if (scored.cls === "WEAK") weak.push(id);
      else strongValid.push(id);
    }

    const used = new Set(strongValid);
    const keptWeak: string[] = [];
    for (const weakId of weak) {
      const better = (byCluster.get(clusterKey(product)) ?? []).find((peer) => {
        if (peer.id === product.id || used.has(peer.id) || weakId === peer.id) {
          return false;
        }
        return scoreAlternativePair(product, peer).cls === "STRONG";
      });
      if (better) {
        strongValid.push(better.id);
        used.add(better.id);
      } else {
        keptWeak.push(weakId);
        used.add(weakId);
      }
    }

    const next = [...strongValid, ...keptWeak];
    const prev = product.alternativeProductIds ?? [];
    if (next.length === prev.length && next.every((id, i) => id === prev[i])) {
      return product;
    }
    return { ...product, alternativeProductIds: next };
  });
}
