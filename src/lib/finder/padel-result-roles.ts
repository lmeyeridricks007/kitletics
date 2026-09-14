import type { Product } from "@/domain/products/types";
import { getPadelRacketDecisionAttributes } from "@/content/padel/rackets";

/** Presentation roles for the flagship Padel Racket Finder results. */
export type PadelFinderResultRole =
  | "best-match"
  | "more-control"
  | "more-power"
  | "more-comfort"
  | "better-value";

export const PADEL_FINDER_ROLE_LABELS: Record<PadelFinderResultRole, string> = {
  "best-match": "Best match",
  "more-control": "More control",
  "more-power": "More power",
  "more-comfort": "More comfort",
  "better-value": "Better value",
};

function attrScore(productId: string, key: string): number | undefined {
  const attrs = getPadelRacketDecisionAttributes(productId);
  const hit = attrs?.find((a) => a.key === key);
  return typeof hit?.score === "number" ? hit.score : undefined;
}

function positioningScore(
  product: Product,
  key: "control" | "power",
): number | undefined {
  const raw =
    key === "control"
      ? product.specifications.controlPositioning
      : product.specifications.powerPositioning;
  if (raw == null) return undefined;
  const s = String(raw).toLowerCase();
  if (["high", "attacking", "power"].includes(s)) return 90;
  if (["medium-high", "medium", "balanced"].includes(s)) return 70;
  if (["low", "control"].includes(s)) return key === "control" ? 88 : 40;
  return 55;
}

function roleMetric(
  product: Product,
  role: Exclude<PadelFinderResultRole, "best-match">,
  lowestPrice?: { price: number; currency: string },
): number {
  if (role === "more-control") {
    return (
      attrScore(product.id, "control") ??
      positioningScore(product, "control") ??
      0
    );
  }
  if (role === "more-power") {
    return (
      attrScore(product.id, "power") ??
      positioningScore(product, "power") ??
      0
    );
  }
  if (role === "more-comfort") {
    return (
      attrScore(product.id, "comfort") ??
      attrScore(product.id, "forgiveness") ??
      0
    );
  }
  // better-value: prefer high value attr, then lower price among solid matches
  const valueAttr = attrScore(product.id, "value") ?? 50;
  const pricePenalty =
    lowestPrice && lowestPrice.price > 0
      ? Math.min(40, lowestPrice.price / 10)
      : 25;
  return valueAttr * 1.2 - pricePenalty;
}

/**
 * Build a flagship presentation list: best match + distinct role alternatives.
 * Pure rank order remains available separately; this only reshapes display rows.
 * Affiliate commission is never consulted.
 */
export function selectPadelFinderRoleRows<
  T extends {
    product: Product;
    evaluation: { productId: string; matchScore: number };
    lowestPrice?: { price: number; currency: string };
  },
>(rows: T[]): Array<T & { resultRole: PadelFinderResultRole }> {
  if (rows.length === 0) return [];

  const used = new Set<string>();
  const out: Array<T & { resultRole: PadelFinderResultRole }> = [];

  const best = rows[0]!;
  out.push({ ...best, resultRole: "best-match" });
  used.add(best.product.id);

  const roles: Exclude<PadelFinderResultRole, "best-match">[] = [
    "more-control",
    "more-power",
    "more-comfort",
    "better-value",
  ];

  // Prefer candidates that still scored reasonably (top half of ranked list)
  const pool = rows.slice(1, Math.max(8, Math.min(rows.length, 12)));

  for (const role of roles) {
    let bestRow: T | undefined;
    let bestMetric = -Infinity;
    for (const row of pool) {
      if (used.has(row.product.id)) continue;
      // Skip near-duplicates of best match on the same role axis when metric is weak
      const metric = roleMetric(row.product, role, row.lowestPrice);
      if (metric <= 0 && role !== "better-value") continue;
      // Soft floor: keep alternatives within a usable match band
      if (row.evaluation.matchScore < 40) continue;
      if (metric > bestMetric) {
        bestMetric = metric;
        bestRow = row;
      }
    }
    if (!bestRow) {
      // Fallback: next unused ranked row
      bestRow = pool.find((r) => !used.has(r.product.id));
    }
    if (!bestRow) continue;
    out.push({ ...bestRow, resultRole: role });
    used.add(bestRow.product.id);
  }

  return out;
}
