/**
 * Fix 70 — semantic decision-graph quality (substitutability / buyer plausibility).
 * Scores meaning, not ID resolution.
 */

import type { Product } from "@/domain/products/types";
import type { ProductRelationshipType } from "@/domain/relationships/types";

export type GraphQualityClass = "STRONG" | "VALID" | "WEAK" | "INVALID";

export type ShoeDecisionRole =
  | "road-daily"
  | "road-max-cushion"
  | "road-stability"
  | "road-tempo"
  | "road-race"
  | "trail-daily"
  | "trail-ultra"
  | "trail-race"
  | "road-trail";

export interface QualityScore {
  cls: GraphQualityClass;
  reasons: string[];
}

function strSpec(product: Product, key: string): string {
  const v = product.specifications?.[key];
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(String).join(" ").toLowerCase();
  return String(v).toLowerCase();
}

function terrains(product: Product): string[] {
  const v = product.specifications?.terrain;
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase());
  if (typeof v === "string") return [v.toLowerCase()];
  return [];
}

function hasUc(product: Product, re: RegExp): boolean {
  return product.useCaseIds.some((id) => re.test(id));
}

function hasSub(product: Product, id: string): boolean {
  return product.subcategoryIds.includes(id);
}

export function isTrailTerrain(product: Product): boolean {
  const t = terrains(product);
  if (t.includes("trail")) return true;
  return hasSub(product, "sub-trail") || hasUc(product, /trail/);
}

export function isRoadOnly(product: Product): boolean {
  const t = terrains(product);
  if (t.includes("trail")) return false;
  if (hasSub(product, "sub-trail")) return false;
  return t.includes("road") || t.includes("track") || t.length === 0;
}

export function shoeDecisionRole(product: Product): ShoeDecisionRole | null {
  if (product.categoryId !== "cat-running-shoes") return null;
  const trail = isTrailTerrain(product);
  const mixedRoad = terrains(product).includes("road");
  const plated = product.specifications?.plate === true;
  const plateMat = strSpec(product, "plateMaterial");
  const carbon = plated && /carbon/.test(plateMat);
  const raceSub = hasSub(product, "sub-race");
  const dailySub = hasSub(product, "sub-daily-trainers");
  const tempoOnly =
    hasSub(product, "sub-tempo") && !dailySub && !hasSub(product, "sub-max-cushion");
  const stability =
    /^(stability|maximum-stability)$/.test(strSpec(product, "stability")) ||
    hasSub(product, "sub-stability");
  const maxCushion =
    strSpec(product, "cushionLevel").includes("max") || hasSub(product, "sub-max-cushion");
  const ultra = hasUc(product, /ultra/);

  if (trail && mixedRoad) return "road-trail";
  if (trail && (carbon || raceSub)) return "trail-race";
  if (trail && (ultra || maxCushion)) return "trail-ultra";
  if (trail) return "trail-daily";
  if (carbon || raceSub) return "road-race";
  if (plated && (tempoOnly || (!maxCushion && !dailySub))) return "road-tempo";
  if (stability) return "road-stability";
  if (maxCushion) return "road-max-cushion";
  return "road-daily";
}

const SHOE_ADJACENT: Record<ShoeDecisionRole, ShoeDecisionRole[]> = {
  "road-daily": ["road-max-cushion", "road-tempo", "road-stability", "road-trail"],
  "road-max-cushion": ["road-daily", "road-stability"],
  "road-stability": ["road-daily", "road-max-cushion"],
  "road-tempo": ["road-daily", "road-race"],
  "road-race": ["road-tempo"],
  "trail-daily": ["trail-ultra", "trail-race", "road-trail"],
  "trail-ultra": ["trail-daily", "trail-race"],
  "trail-race": ["trail-daily", "trail-ultra", "road-trail"],
  "road-trail": ["trail-daily", "trail-ultra", "road-daily"],
};

function sportsOverlap(a: Product, b: Product): boolean {
  return a.sportIds.some((id) => b.sportIds.includes(id));
}

function scoreUseCaseOverlap(a: Product, b: Product): number {
  const set = new Set(b.useCaseIds);
  return a.useCaseIds.filter((id) => set.has(id)).length;
}

function slugFranchise(slug: string): string {
  return slug.replace(/-v?\d+$/, "").replace(/-\d+$/, "");
}

function sameFamily(a: Product, b: Product): boolean {
  if (a.familyId && a.familyId === b.familyId) return true;
  if (a.brandId !== b.brandId || !a.generation || !b.generation) return false;
  return slugFranchise(a.slug) === slugFranchise(b.slug);
}

function generationMismatch(a: Product, b: Product): boolean {
  const statuses = new Set([a.lifecycleStatus, b.lifecycleStatus]);
  return (
    statuses.has("previous-generation") &&
    statuses.has("current") &&
    !sameFamily(a, b)
  );
}

function nutritionForm(product: Product): string {
  const s = product.slug;
  if (/gel/.test(s)) return "gel";
  if (/chew|blok/.test(s)) return "chew";
  if (/bar/.test(s)) return "bar";
  if (/drink|mix|tailwind|nuun|saltstick|caps/.test(s)) return "drink";
  return "other";
}

function clothingForm(product: Product): string {
  if (hasSub(product, "sub-running-tees")) return "tee";
  if (hasSub(product, "sub-running-shorts")) return "short";
  if (hasSub(product, "sub-running-jackets")) return "jacket";
  if (hasSub(product, "sub-running-tights")) return "tight";
  const s = product.slug;
  if (/glove/.test(s)) return "glove";
  if (/beanie/.test(s)) return "beanie";
  // `-cap$` / `gocap` only — never `/cap/` (Capilene tees are not hats).
  if (/gocap|(^|-)cap-|-cap$/.test(s)) return "cap";
  if (/tight/.test(s)) return "tight";
  if (/short/.test(s)) return "short";
  if (/jacket|rainrunner|bonatti|canopy|houdini|weather/.test(s)) return "jacket";
  if (/singlet/.test(s)) return "singlet";
  if (/tee|miler|capilene/.test(s)) return "tee";
  return "other";
}

function treadmillDrive(product: Product): "motorised" | "curved" | "other" {
  if (product.categoryId !== "cat-treadmills") return "other";
  if (product.specifications?.motorised === false) return "curved";
  if (product.specifications?.motorised === true) return "motorised";
  return "other";
}

function hrmForm(product: Product): string {
  const t = strSpec(product, "type");
  if (/chest/.test(t) || /hrm|h10|h9|tickr|pro-plus/.test(product.slug)) return "chest";
  if (/arm|optical|verity|scosche|rhythm/.test(product.slug + t)) return "arm";
  return "other";
}

/** Genuine substitute for the same buying job? */
export function scoreAlternativePair(
  source: Product,
  target: Product,
  relType?: ProductRelationshipType,
): QualityScore {
  const reasons: string[] = [];
  if (source.id === target.id) {
    return { cls: "INVALID", reasons: ["self-edge"] };
  }
  if (source.categoryId !== target.categoryId) {
    return { cls: "INVALID", reasons: ["cross-category"] };
  }
  if (!sportsOverlap(source, target)) {
    return { cls: "INVALID", reasons: ["no shared sport"] };
  }

  const typedTrail = relType === "trail-alternative" || relType === "trail-capable";
  const typedGen =
    relType === "previous-generation" || relType === "next-generation";
  const typedJob =
    relType === "race-focused-alternative" ||
    relType === "daily-training-alternative" ||
    relType === "long-run-alternative" ||
    relType === "more-cushioned" ||
    relType === "more-stable";

  if (source.categoryId === "cat-running-shoes") {
    const sr = shoeDecisionRole(source);
    const tr = shoeDecisionRole(target);
    if (sr && tr) {
      if (sr === tr) {
        if (sameFamily(source, target) && typedGen) {
          return { cls: "STRONG", reasons: ["same family generation"] };
        }
        if (generationMismatch(source, target)) {
          return { cls: "WEAK", reasons: ["same role, unrelated previous-gen"] };
        }
        reasons.push(`same shoe role ${sr}`);
        return { cls: scoreUseCaseOverlap(source, target) >= 2 ? "STRONG" : "VALID", reasons };
      }
      if (SHOE_ADJACENT[sr]?.includes(tr)) {
        if (typedJob || typedTrail) {
          return { cls: "VALID", reasons: [`adjacent ${sr}→${tr}`, String(relType)] };
        }
        return { cls: "VALID", reasons: [`adjacent ${sr}→${tr}`] };
      }
      if (typedTrail && (sr.startsWith("road") && tr.startsWith("trail"))) {
        return { cls: "VALID", reasons: ["typed trail-alternative"] };
      }
      if (typedJob) {
        return { cls: "WEAK", reasons: [`distant ${sr}→${tr} with job type`] };
      }
      return { cls: "INVALID", reasons: [`not substitutable ${sr} vs ${tr}`] };
    }
  }

  if (source.categoryId === "cat-nutrition") {
    const a = nutritionForm(source);
    const b = nutritionForm(target);
    if (a !== b && a !== "other" && b !== "other") {
      if ((a === "gel" && b === "chew") || (a === "chew" && b === "gel")) {
        return { cls: "VALID", reasons: ["gel/chew race-fuel fork"] };
      }
      if (source.slug.split("-")[0] === target.slug.split("-")[0]) {
        return { cls: "VALID", reasons: ["same brand fuel system, different format"] };
      }
      if (
        (a === "drink" || b === "drink") &&
        (a === "gel" || b === "gel" || a === "chew" || b === "chew")
      ) {
        return { cls: "WEAK", reasons: [`nutrition form ${a} vs ${b}`] };
      }
      if (a === "bar" || b === "bar") {
        return { cls: "WEAK", reasons: [`nutrition form ${a} vs ${b}`] };
      }
      return { cls: "INVALID", reasons: [`nutrition form ${a} vs ${b}`] };
    }
  }

  if (source.categoryId === "cat-running-clothing") {
    const a = clothingForm(source);
    const b = clothingForm(target);
    if (a !== b && a !== "other" && b !== "other") {
      return { cls: "INVALID", reasons: [`clothing form ${a} vs ${b}`] };
    }
  }

  if (source.categoryId === "cat-treadmills") {
    const a = treadmillDrive(source);
    const b = treadmillDrive(target);
    if (a !== b && a !== "other" && b !== "other") {
      return {
        cls: "INVALID",
        reasons: [`treadmill drive ${a} vs ${b}`],
      };
    }
  }

  if (source.categoryId === "cat-hrm") {
    const a = hrmForm(source);
    const b = hrmForm(target);
    if (a !== b && a !== "other" && b !== "other") {
      return {
        cls: relType ? "VALID" : "WEAK",
        reasons: [`HRM form ${a} vs ${b}`],
      };
    }
  }

  if (source.categoryId === "cat-packs-vests") {
    const quiver = (p: Product) => /quiver/.test(p.slug);
    if (quiver(source) !== quiver(target)) {
      return { cls: "INVALID", reasons: ["vest vs quiver"] };
    }
  }

  if (generationMismatch(source, target) && !typedGen && !sameFamily(source, target)) {
    reasons.push("unrelated previous-generation");
    return { cls: "WEAK", reasons };
  }

  const uc = scoreUseCaseOverlap(source, target);
  if (uc >= 2) return { cls: "STRONG", reasons: ["shared use cases"] };
  if (uc === 1) return { cls: "VALID", reasons: ["one shared use case"] };
  if (source.categoryId === target.categoryId) {
    return { cls: "WEAK", reasons: ["same category, no use-case overlap"] };
  }
  return { cls: "INVALID", reasons: ["no shared decision job"] };
}

/** Would a real buyer compare this pair? */
export function scoreComparisonPair(a: Product, b: Product): QualityScore {
  if (a.categoryId !== b.categoryId) {
    return { cls: "INVALID", reasons: ["cross-category comparison"] };
  }
  if (!sportsOverlap(a, b)) {
    return { cls: "INVALID", reasons: ["no shared sport"] };
  }
  if (sameFamily(a, b)) {
    return { cls: "STRONG", reasons: ["same family / generation"] };
  }
  const alt = scoreAlternativePair(a, b, "direct-competitor");
  if (alt.cls === "STRONG" || alt.cls === "VALID") {
    return { cls: alt.cls === "STRONG" ? "STRONG" : "VALID", reasons: alt.reasons };
  }
  if (alt.cls === "WEAK") {
    return { cls: "WEAK", reasons: ["same category but distant jobs"] };
  }
  // Alternatives must not mix these jobs; a comparison page still may.
  if (a.categoryId === "cat-treadmills") {
    return { cls: "VALID", reasons: ["motorised vs curved buyer fork"] };
  }
  const fa = clothingForm(a);
  const fb = clothingForm(b);
  if (
    (fa === "cap" || fa === "beanie") &&
    (fb === "cap" || fb === "beanie")
  ) {
    return { cls: "WEAK", reasons: ["seasonal headwear fork"] };
  }
  // Adjacent shoe jobs are still plausible comparisons (daily vs max-cushion).
  const sr = shoeDecisionRole(a);
  const tr = shoeDecisionRole(b);
  if (sr && tr && sr !== tr) {
    const adjacent = SHOE_ADJACENT[sr]?.includes(tr);
    if (adjacent) return { cls: "VALID", reasons: [`buyer fork ${sr} vs ${tr}`] };
    return { cls: "WEAK", reasons: [`unlikely fork ${sr} vs ${tr}`] };
  }
  return alt;
}

export function bestGuideContext(slug: string, title: string): {
  kind: string;
  needTrail?: boolean;
  needRace?: boolean;
  needStability?: boolean;
  needDaily?: boolean;
  needWatch?: boolean;
  needHrm?: boolean;
  needVest?: boolean;
  needTempo?: boolean;
} {
  const t = `${slug} ${title}`.toLowerCase();
  return {
    kind: slug,
    needTrail: /trail/.test(t),
    needRace: /marathon|race|super.?shoe|carbon/.test(t) && !/daily/.test(t),
    needStability: /stabil/.test(t),
    needDaily: /daily|beginner|trainer/.test(t) && !/trail/.test(t),
    needWatch: /watch/.test(t),
    needHrm: /heart-rate|hrm/.test(t),
    needVest: /\bvest/.test(t) && !/belt/.test(t),
    needTempo: /tempo|tempo-shoe/.test(t),
  };
}

export function scoreProductInBest(
  product: Product,
  ctx: ReturnType<typeof bestGuideContext>,
  guideCategoryId: string,
): QualityScore {
  if (product.categoryId !== guideCategoryId && guideCategoryId) {
    // Some bests use a parent category; allow overlapping sports + matching need.
    if (ctx.needWatch && product.categoryId !== "cat-gps-watches") {
      return { cls: "INVALID", reasons: ["not a GPS watch"] };
    }
    if (ctx.needHrm && product.categoryId !== "cat-hrm") {
      return { cls: "INVALID", reasons: ["not an HRM"] };
    }
    if (ctx.needVest && product.categoryId !== "cat-packs-vests") {
      return { cls: "INVALID", reasons: ["not a vest"] };
    }
  }
  const role = shoeDecisionRole(product);
  if (ctx.needTrail && role && !role.startsWith("trail") && role !== "road-trail") {
    return { cls: "INVALID", reasons: ["road shoe in trail Best"] };
  }
  if (ctx.needRace && role && role !== "road-race" && role !== "road-tempo" && role !== "trail-race") {
    return { cls: "WEAK", reasons: [`${role} in race Best`] };
  }
  if (ctx.needStability && role && role !== "road-stability") {
    return { cls: "WEAK", reasons: [`${role} in stability Best`] };
  }
  if (ctx.needDaily && role === "road-race") {
    return { cls: "WEAK", reasons: ["carbon racer in daily/beginner Best"] };
  }
  if (ctx.needDaily && role?.startsWith("trail") && role !== "road-trail") {
    return { cls: "INVALID", reasons: ["trail shoe in road daily Best"] };
  }
  return { cls: "STRONG", reasons: ["fits Best context"] };
}

export function scoreProductInGuide(
  product: Product,
  guideSlug: string,
  guideCategoryId?: string,
): QualityScore {
  const t = guideSlug.toLowerCase();
  if (guideCategoryId && product.categoryId !== guideCategoryId) {
    if (/watch/.test(t) && product.categoryId !== "cat-gps-watches") {
      return { cls: "INVALID", reasons: ["guide is watches"] };
    }
    if (/heart-rate|hrm/.test(t) && product.categoryId !== "cat-hrm") {
      return { cls: "INVALID", reasons: ["guide is HRM"] };
    }
    if (/shoe/.test(t) && product.categoryId !== "cat-running-shoes") {
      return { cls: "INVALID", reasons: ["guide is shoes"] };
    }
    if (/vest|hydrat/.test(t) && !/shoe/.test(t) && product.categoryId === "cat-running-shoes") {
      return { cls: "INVALID", reasons: ["shoe on hydration guide"] };
    }
    return { cls: "WEAK", reasons: ["related product off-category"] };
  }
  if (/how-to-choose-running-shoes|cushioning|daily-trainer|stability-shoes|carbon|road-vs-trail/.test(t)) {
    if (product.categoryId !== "cat-running-shoes") {
      return { cls: "INVALID", reasons: ["non-shoe on shoe guide"] };
    }
    return { cls: "STRONG", reasons: ["shoe decision guide"] };
  }
  return { cls: "VALID", reasons: ["same-topic guide"] };
}

export function scoreReviewAlternative(
  product: Product,
  alt: Product,
  reviewText: string,
): QualityScore {
  const base = scoreAlternativePair(product, alt);
  if (base.cls === "INVALID") return base;
  const text = reviewText.toLowerCase();
  const altRole = shoeDecisionRole(alt);
  const srcRole = shoeDecisionRole(product);
  const mentionsTrail = /trail/.test(text);
  const mentionsRace = /race|plate|carbon/.test(text);
  const mentionsStability = /stabil|overpronat/.test(text);
  const mentionsCushion = /cushion|plush|soft|firm/.test(text);
  if (mentionsTrail && altRole?.startsWith("trail")) {
    return { cls: "STRONG", reasons: ["alt matches trail trade-off"] };
  }
  if (mentionsRace && (altRole === "road-race" || altRole === "road-tempo")) {
    return { cls: "STRONG", reasons: ["alt matches race trade-off"] };
  }
  if (mentionsStability && altRole === "road-stability") {
    return { cls: "STRONG", reasons: ["alt matches stability trade-off"] };
  }
  if (mentionsCushion && (altRole === "road-max-cushion" || altRole === "road-daily")) {
    return { cls: "VALID", reasons: ["alt in cushion fork"] };
  }
  if (base.cls === "STRONG" && srcRole && srcRole === altRole) {
    return { cls: "VALID", reasons: ["same-job peer; trade-off not clearly mapped"] };
  }
  return base;
}

export function scoreBestComparisonLink(
  recIds: string[],
  comparisonProductIds: string[],
  recProducts: Product[],
): QualityScore {
  const recSet = new Set(recIds);
  const overlap = comparisonProductIds.filter((id) => recSet.has(id));
  if (overlap.length < 2) {
    if (overlap.length === 1) {
      return { cls: "WEAK", reasons: ["comparison includes only one Best pick"] };
    }
    return { cls: "INVALID", reasons: ["comparison products not in Best recs"] };
  }
  const pair = recProducts.filter((p) => comparisonProductIds.includes(p.id));
  if (pair.length >= 2) {
    const cmp = scoreComparisonPair(pair[0]!, pair[1]!);
    if (cmp.cls === "INVALID") return { cls: "WEAK", reasons: ["recs compared but jobs diverge"] };
    return { cls: cmp.cls === "WEAK" ? "VALID" : cmp.cls, reasons: ["compares close Best picks", ...cmp.reasons] };
  }
  return { cls: "VALID", reasons: ["two recs in comparison"] };
}

/** Cluster key for catalog fill — tighter than Fix 65 shoe bucket. */
export function semanticAltCluster(product: Product): string {
  if (product.categoryId === "cat-running-shoes") {
    return `shoes:${shoeDecisionRole(product) ?? "road-daily"}`;
  }
  return "";
}
