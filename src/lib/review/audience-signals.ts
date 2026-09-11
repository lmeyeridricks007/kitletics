/**
 * Expand thin Buy if / Skip if into Vomero-standard decision lines.
 * Page-time: prefer keeping strong editorial copy; upgrade telegram labels.
 */

import type { Review } from "@/domain/editorial/types";
import type { Brand, Product } from "@/domain/products/types";
import { getBrandById, getProductById } from "@/repositories";

const MIN_DECISION_LEN = 64;
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

function isThinLine(line: string): boolean {
  const t = line.trim();
  const words = t.split(/\s+/).filter(Boolean).length;
  const hasClause = /[—–,]| when | if | beside | instead | rather | — /i.test(t);
  // Short but complete decision sentences (who + why / peer) with a clause marker
  if (t.length >= 48 && words >= 8 && hasClause) return false;
  if (t.length < MIN_DECISION_LEN) return true;
  // Label-like: few words, no clause markers
  if (t.length < 90 && !hasClause) {
    if (words <= 8) return true;
  }
  return false;
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
  brand: Brand | undefined,
  review: Review,
): string[] {
  const brandName = brand?.name ?? "this brand";
  const peers = peerNames(product, review);
  const peer = peers[0];
  const peer2 = peers[1];
  const strengths = (product.strengths ?? []).map((s) => s.trim()).filter(Boolean);
  const s0 = strengths[0];
  const s1 = strengths[1];
  const terrain = terrainHint(product);
  const lines: string[] = [];

  if (s0) {
    lines.push(
      peer
        ? `You want ${lowerLead(s0)} and will rotate or compare against ${peer} — that is the ${product.name}'s main job`
        : `You want ${lowerLead(s0)} as the weekly priority — that is what the ${product.name} is built for`,
    );
  }

  if (s1) {
    lines.push(
      `Most of your sessions match ${lowerLead(s1)} more than a do-everything compromise`,
    );
  } else if (peer && peer2) {
    lines.push(
      `You're choosing among ${peer}, ${peer2}, and similar tools and the ${product.name} fits your week best`,
    );
  } else {
    lines.push(
      `Your week matches what ${brandName} positions the ${product.name} to do — not a adjacent specialty role`,
    );
  }

  if (terrain === "road") {
    lines.push(
      `You're shopping a road (or treadmill) tool and can keep trail or race-day jobs in other shoes when needed`,
    );
  } else if (terrain === "trail") {
    lines.push(
      `You need trail-specific grip and protection and are happy keeping pavement miles in a separate road shoe`,
    );
  } else if (terrain === "court") {
    lines.push(
      `You need court-specific movement and outsole behaviour rather than a borrowed running or training shoe`,
    );
  } else {
    lines.push(
      `You're building a clear role for the ${product.name} instead of forcing one product to cover every session`,
    );
  }

  return uniqueLines(lines).slice(0, 3);
}

function buildAvoidLines(
  product: Product,
  brand: Brand | undefined,
  review: Review,
): string[] {
  const peers = peerNames(product, review);
  const peer = peers[0];
  const weaknesses = (product.weaknesses ?? []).map((s) => s.trim()).filter(Boolean);
  const w0 = weaknesses[0];
  const w1 = weaknesses[1];
  const terrain = terrainHint(product);
  const lines: string[] = [];

  if (w0) {
    const replaced = w0.match(/^replaced by (.+)$/i);
    if (replaced) {
      lines.push(
        `You want the current flagship that replaced this model — look at ${replaced[1]} instead of forcing the ${product.name}`,
      );
    } else {
      const need = /^(not |no |isn't |is not )/i.test(w0)
        ? lowerLead(w0)
        : `to avoid ${lowerLead(w0)}`;
      lines.push(
        peer
          ? `You need ${need} — look at ${peer} or a clearer specialist instead of forcing the ${product.name}`
          : `You need ${need} on this purchase — the ${product.name} will fight that priority most weeks`,
      );
    }
  }

  const tool = toolNoun(product);

  if (w1) {
    lines.push(
      `Your must-haves conflict with a ${product.name} trade-off: ${lowerLead(w1)}`,
    );
  } else if (peer) {
    lines.push(
      `You want one ${tool} for every session and pace — the ${product.name} is a defined role; ${peer} or a second ${tool} may cover the gaps better`,
    );
  } else {
    lines.push(
      `You want one ${tool} for every session and pace — the ${product.name} is a defined role, not a universal tool`,
    );
  }

  if (terrain === "road" && tool === "shoe") {
    lines.push(
      `You need technical trail grip or a dedicated race plate as the primary job — this platform is aimed elsewhere`,
    );
  } else if (terrain === "trail" && tool === "shoe") {
    lines.push(
      `Your week is mostly smooth pavement connectors — a road daily will usually feel more appropriate`,
    );
  } else {
    const brandName = brand?.name ?? "another";
    lines.push(
      `Your fit, surface, or support needs sit outside what ${brandName} built the ${product.name} to do`,
    );
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
        ? `You need aggressive trail grip and protection as the primary job — the ${product.name} is not that tool`
        : `You want trail-ready grip and protection most weeks — that is what the ${product.name} is built to cover`;
    }
    if (/single-shoe|one shoe|do-everything|one watch|one racket/i.test(t)) {
      const tool = toolNoun(product);
      return mode === "avoid"
        ? `You want one ${tool} for easy, workout, and race days — the ${product.name} is a defined role${peer ? `; keep ${peer} or a second ${tool} for the other jobs` : ""}`
        : `You're happy giving the ${product.name} a clear weekly role instead of forcing one ${tool} to cover every session`;
    }
    if (/stability|overpronat/i.test(t) && t.length < MIN_DECISION_LEN) {
      return mode === "avoid"
        ? `You need dedicated stability guidance — the ${product.name} will not replace a true support shoe`
        : `You want dependable guidance under load — confirm the ${product.name} matches that support brief`;
    }
    if (/race|tempo|workout/i.test(t) && t.length < MIN_DECISION_LEN) {
      return mode === "avoid"
        ? `You're shopping primarily for race or workout snap — the ${product.name} is aimed at a different session mix${peer ? ` than ${peer}` : ""}`
        : `${t.replace(/\.*$/, "")} — that race/workout focus is a good fit for the ${product.name}${peer ? ` beside ${peer}` : ""}`;
    }
    if (peer && t.length < MIN_DECISION_LEN) {
      return `${t.replace(/\.*$/, "")} — compare against ${peer} before you commit to the ${product.name}`;
    }
    return `${t.replace(/\.*$/, "")} — make sure that matches what the ${product.name} is actually for`;
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
