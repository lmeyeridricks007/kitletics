/**
 * Expand thin Buy if / Skip if into Vomero-standard decision lines.
 * Page-time: prefer keeping strong editorial copy; upgrade telegram labels.
 */

import type { Review } from "@/domain/editorial/types";
import type { Brand, Product } from "@/domain/products/types";
import { getBrandById, getProductById } from "@/repositories";
import { classifyDecisionLine, countDecisionWords } from "@/lib/decision-copy";

const MIN_LINES = 2;

function lowerLead(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function peerNames(product: Product, review: Review): string[] {
  const ids = [
    ...(review.alternativeProductIds ?? []),
    ...(product.alternativeProductIds ?? []),
    ...(product.relatedProductIds ?? []),
  ];
  const names: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (id === product.id || seen.has(id)) continue;
    const p = getProductById(id, { isDev: true });
    if (!p) continue;
    seen.add(id);
    names.push(p.name);
    if (names.length >= 3) break;
  }
  return names;
}

function isConsumerDecisionLine(t: string): boolean {
  const words = t.split(/\s+/).filter(Boolean).length;
  if (words < 6) return false;
  return /^(you(?:'re| are)? looking|you want|you prefer|you need|you(?:'re| are)? primarily|i(?:'d| would) (?:shortlist|pause|skip|rotate))/i.test(
    t,
  );
}

function isThinLine(line: string): boolean {
  const t = line.trim();
  const cls = classifyDecisionLine(t);
  if (cls === "MACHINE_LIKE" || cls === "BROKEN" || cls === "CONFUSING") {
    return true;
  }
  if (isConsumerDecisionLine(t)) return false;
  if (cls === "GOOD" || cls === "WORDY") return false;
  const words = countDecisionWords(t);
  return words < 5;
}

function toolNoun(product: Product): string {
  const cat = product.categoryId ?? "";
  if (/shoe|footwear/i.test(cat)) return "shoe";
  if (/watch|hrm|heart-rate/i.test(cat)) return "watch";
  if (/racket|racquet/i.test(cat)) return "racket";
  if (/pack|vest/i.test(cat)) return "pack";
  return "product";
}

function isThinSet(lines: string[] | undefined): boolean {
  const list = (lines ?? []).map((l) => l.trim()).filter(Boolean);
  if (list.length < MIN_LINES) return true;
  const strong = list.filter((l) => !isThinLine(l));
  return strong.length < MIN_LINES;
}

function terrainHint(product: Product): string | undefined {
  const terrain = product.specifications?.terrain;
  if (!terrain) return undefined;
  const values = Array.isArray(terrain) ? terrain : [terrain];
  const joined = values.map(String).join(" ").toLowerCase();
  if (/trail/.test(joined) && !/road/.test(joined)) return "trail";
  if (/court|padel|tennis/.test(joined)) return "court";
  if (/road|asphalt|treadmill/.test(joined)) return "road";
  return undefined;
}

function buildBuyLines(
  product: Product,
  _brand: Brand | undefined,
  review: Review,
): string[] {
  const peers = peerNames(product, review);
  const peer = peers[0];
  const strengths = (product.strengths ?? []).map((s) => s.trim()).filter(Boolean);
  const s0 = strengths[0];
  const s1 = strengths[1];
  const terrain = terrainHint(product);
  const lines: string[] = [];

  if (s0) {
    lines.push(`You're looking for ${lowerLead(s0)}.`);
  } else {
    lines.push(`You're looking for a clear weekly training role.`);
  }

  if (s1) {
    lines.push(`You want ${lowerLead(s1)}.`);
  } else if (peer) {
    lines.push(`You prefer this over ${peer} when that role matches most weeks.`);
  } else {
    lines.push(`You want a defined weekly role instead of a universal default.`);
  }

  if (terrain === "road") {
    lines.push(
      `You prefer a road or treadmill ${toolNoun(product)} and can keep trail jobs elsewhere.`,
    );
  } else if (terrain === "trail") {
    lines.push(`You need trail-specific grip and can keep pavement miles elsewhere.`);
  } else if (terrain === "court") {
    lines.push(`You need court-specific movement rather than a borrowed training shoe.`);
  } else if (peer) {
    lines.push(`You prefer this when that weekly role is the one you repeat.`);
  }

  return uniqueLines(lines).slice(0, 3);
}

function buildAvoidLines(
  product: Product,
  _brand: Brand | undefined,
  review: Review,
): string[] {
  const peers = peerNames(product, review);
  const peer = peers[0];
  const weaknesses = (product.weaknesses ?? []).map((s) => s.trim()).filter(Boolean);
  const w0 = weaknesses[0];
  const w1 = weaknesses[1];
  const terrain = terrainHint(product);
  const tool = toolNoun(product);
  const lines: string[] = [];

  if (w0) {
    if (/^replaced by /i.test(w0)) {
      lines.push(`You need the current model that replaced this one.`);
    } else if (/stabil|guid/i.test(w0)) {
      lines.push(`You need added stability or guidance.`);
    } else if (/race/i.test(w0)) {
      lines.push(`You're primarily looking for the lightest race-day option.`);
    } else {
      lines.push(`You need ${lowerLead(w0)}.`);
    }
  }

  if (w1) {
    lines.push(`You prefer to avoid ${lowerLead(w1)}.`);
  } else if (peer) {
    lines.push(`You're primarily looking for a mixed-week default such as ${peer}.`);
  } else {
    lines.push(`You're primarily looking for a universal default, not a defined ${tool} role.`);
  }

  if (terrain === "road" && tool === "shoe") {
    lines.push(`You're primarily looking for trail grip or a dedicated race plate.`);
  } else if (terrain === "trail" && tool === "shoe") {
    lines.push(`You prefer a road daily for mostly smooth pavement.`);
  } else {
    lines.push(`You prefer a different tool when this role is not your week.`);
  }

  return uniqueLines(lines).slice(0, 3);
}

function uniqueLines(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const t = line.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

function polishExisting(
  lines: string[],
  product: Product,
  peers: string[],
  mode: "buy" | "avoid",
): string[] {
  return lines.map((line) => {
    const t = line.trim();
    if (!isThinLine(t)) return t;
    const peer = peers[0];
    // Expand telegram labels into decision lines
    if (/^trail runners?/i.test(t)) {
      return mode === "avoid"
        ? `You need aggressive trail grip and protection as the primary job.`
        : `You want trail-ready grip and protection most weeks.`;
    }
    if (/single-shoe|one shoe|do-everything|one watch|one racket/i.test(t)) {
      const tool = toolNoun(product);
      return mode === "avoid"
        ? `You want one ${tool} for easy, workout, and race days.`
        : `You want a clear weekly role instead of one ${tool} for every session.`;
    }
    if (/stability|overpronat/i.test(t)) {
      return mode === "avoid"
        ? `You need dedicated stability guidance.`
        : `You want dependable guidance under load.`;
    }
    if (/race|tempo|workout/i.test(t)) {
      return mode === "avoid"
        ? `You're primarily looking for race or workout snap.`
        : `You want race or workout focus in the weekly mix.`;
    }
    if (peer) {
      return mode === "avoid"
        ? `You prefer ${peer} when this role is not your week.`
        : `You prefer this over ${peer} when the weekly role matches.`;
    }
    return t;
  });
}

/**
 * Ensure Buy if / Skip if meet the Vomero review template depth.
 */
export function ensureAudienceSignals(
  review: Review,
  product: Product,
  brand?: Brand,
): { whoShouldBuy: string[]; whoShouldAvoid: string[] } {
  const resolvedBrand = brand ?? getBrandById(product.brandId, { isDev: true });
  const peers = peerNames(product, review);

  let whoShouldBuy = (review.whoShouldBuy ?? []).map((s) => s.trim()).filter(Boolean);
  let whoShouldAvoid = (review.whoShouldAvoid ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  if (isThinSet(whoShouldBuy)) {
    whoShouldBuy = buildBuyLines(product, resolvedBrand, review);
  } else {
    whoShouldBuy = polishExisting(whoShouldBuy, product, peers, "buy");
    if (whoShouldBuy.length < MIN_LINES) {
      whoShouldBuy = uniqueLines([
        ...whoShouldBuy,
        ...buildBuyLines(product, resolvedBrand, review),
      ]).slice(0, 3);
    }
  }

  if (isThinSet(whoShouldAvoid)) {
    whoShouldAvoid = buildAvoidLines(product, resolvedBrand, review);
  } else {
    whoShouldAvoid = polishExisting(whoShouldAvoid, product, peers, "avoid");
    if (whoShouldAvoid.length < MIN_LINES) {
      whoShouldAvoid = uniqueLines([
        ...whoShouldAvoid,
        ...buildAvoidLines(product, resolvedBrand, review),
      ]).slice(0, 3);
    }
  }

  return {
    whoShouldBuy: whoShouldBuy.slice(0, 4),
    whoShouldAvoid: whoShouldAvoid.slice(0, 4),
  };
}

export function audienceSignalsAreThin(review: Review): boolean {
  return isThinSet(review.whoShouldBuy) || isThinSet(review.whoShouldAvoid);
}
