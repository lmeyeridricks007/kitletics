/**
 * Editorial 42 — pair-specific decision copy for Alternatives pages.
 * Builds why / better / worse / switch / stay from products + relationship type.
 * Frames vary by pair so pages do not collapse to one template after name scrubbing.
 */

import type { Product } from "@/domain/products/types";
import type { ProductRelationship } from "@/domain/relationships/types";
import type { AlternativesReasonConfig } from "@/lib/product/alternatives-config";
import {
  normalizeText,
  scrubEntityNames,
} from "@/domain/content-uniqueness/text";
import { ALTERNATIVES_P57_UNIQUE_INTROS } from "@/content/alternatives-p57-uniqueness";
import { ALTERNATIVES_P64_UNIQUE_INTROS } from "@/content/alternatives-p64-uniqueness";
import { ALTERNATIVES_P65_UNIQUE_INTROS } from "@/content/alternatives-p65-completion";
import { buildAccessoryAlternativeCopy } from "@/lib/product/alternatives-p64-decision-copy";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { formatPublicSpecCue, formatPublicSpecKey } from "@/lib/specs/public-label";

/** Categories where alternatives pages can earn indexation when substantive. */
export const ALTERNATIVES_INDEXABLE_CATEGORIES = new Set([
  "cat-running-shoes",
  "cat-gps-watches",
  "cat-hrm",
  "cat-padel-rackets",
  "cat-tennis-rackets",
  "cat-rowing-machines",
  "cat-air-bikes",
  "cat-training-shoes",
  "cat-padel-shoes",
  "cat-tennis-shoes",
]);

export interface AlternativeDecisionCopy {
  whyAlternative: string;
  summary: string;
  betterAt: string[];
  worseAt: string[];
  whoShouldSwitch: string;
  whoShouldStay: string;
  whyChoose: string[];
}

function firstUseful(lines: string[] | undefined, fallback: string): string {
  const hit = (lines ?? []).map((s) => s.trim()).find((s) => s.length >= 8);
  return hit ?? fallback;
}

function lowerLead(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function clip(s: string, max = 110): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function hashPair(a: string, b: string): number {
  let h = 0;
  const s = `${a}::${b}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function numSpec(product: Product, key: string): number | undefined {
  const v = product.specifications?.[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function specBit(product: Product, key: string): string | undefined {
  const n = numSpec(product, key);
  if (n != null) return formatPublicSpecCue(key, n);
  const v = product.specifications?.[key];
  if (typeof v === "string" && v.trim()) return formatPublicSpecCue(key, v.trim());
  if (typeof v === "boolean") return v ? formatPublicSpecKey(key) : undefined;
  return undefined;
}

function specFingerprint(product: Product): string {
  const bits = [
    specBit(product, "drop"),
    specBit(product, "heelStack"),
    specBit(product, "weight"),
    specBit(product, "midsole"),
    specBit(product, "cushionFeel"),
    specBit(product, "stability"),
    specBit(product, "displayType"),
    specBit(product, "batteryGps"),
    specBit(product, "batteryLifeHours"),
    specBit(product, "type"),
    specBit(product, "shape"),
    specBit(product, "plate"),
  ].filter(Boolean);
  return bits.slice(0, 4).join(", ");
}

function usefulVerdict(product: Product): string | undefined {
  const v = product.verdict?.trim();
  if (!v) return undefined;
  if (containsPublicContentCorruption(v)) return undefined;
  return clip(v, 100);
}

function specNote(source: Product, alt: Product): string | undefined {
  const keys = [
    "weight",
    "drop",
    "stackHeight",
    "batteryGps",
    "batteryLife",
    "capacity",
    "headSize",
    "shape",
  ] as const;
  for (const key of keys) {
    const a = numSpec(source, key);
    const b = numSpec(alt, key);
    if (a != null && b != null && Math.abs(a - b) / Math.max(a, 1) >= 0.08) {
      const dir = b < a ? "lower" : "higher";
      return `${formatPublicSpecKey(key)} sits ${dir} on ${alt.name} (${b} vs ${a})`;
    }
    const as = source.specifications?.[key];
    const bs = alt.specifications?.[key];
    if (
      typeof as === "string" &&
      typeof bs === "string" &&
      as.trim() &&
      bs.trim() &&
      as.toLowerCase() !== bs.toLowerCase()
    ) {
      return `${formatPublicSpecKey(key)}: ${alt.name} is “${bs}” vs ${source.name} “${as}”`;
    }
  }
  return undefined;
}

function getUseCaseHint(product: Product): string {
  const ids = product.useCaseIds.slice(0, 2).map((id) =>
    id.replace(/^uc-/, "").replace(/-/g, " "),
  );
  if (ids.length) return ids.join(" / ");
  return "its primary sessions";
}

function seekLabel(
  type: string,
  reason: AlternativesReasonConfig | undefined,
): string {
  if (reason?.title) return reason.title.toLowerCase();
  const map: Record<string, string> = {
    "more-cushioned": "more cushioning",
    "more-stable": "more stability",
    "more-responsive": "more responsiveness",
    faster: "more speed",
    "race-focused-alternative": "a more race-focused platform",
    "more-durable": "more durability",
    "better-value": "better value",
    "cheaper-alternative": "a lower price",
    cheaper: "a lower price",
    "premium-alternative": "a premium upgrade",
    premium: "a premium upgrade",
    "lighter-alternative": "a lighter option",
    lighter: "a lighter option",
    "previous-generation": "the previous generation",
    "next-generation": "the newer generation",
    "long-run-alternative": "better long-run protection",
    "daily-training-alternative": "a more daily-oriented shoe",
    "trail-alternative": "trail capability",
    "trail-capable": "trail capability",
    "beginner-friendly": "a more beginner-friendly option",
    "more-versatile": "more versatility",
    "direct-competitor": "a same-role peer",
    similar: "a similar peer",
  };
  return map[type] ?? "a different emphasis";
}

function categorySeekHints(categoryId: string): string {
  if (categoryId === "cat-gps-watches") {
    return "battery life, maps, case size, ecosystem, or price";
  }
  if (categoryId === "cat-hrm") {
    return "accuracy, comfort, battery, or connectivity";
  }
  if (categoryId === "cat-padel-rackets" || categoryId.includes("racket")) {
    return "control, power, weight, or forgiveness";
  }
  if (categoryId === "cat-rowing-machines" || categoryId === "cat-air-bikes") {
    return "metrics, noise, footprint, or coaching features";
  }
  if (categoryId.includes("clothing") || categoryId.includes("socks")) {
    return "fit, weight, weather protection, or value";
  }
  if (categoryId.includes("hydration") || categoryId.includes("packs")) {
    return "capacity, weight, bounce, or access";
  }
  if (categoryId === "cat-running-shoes" || categoryId.includes("shoe")) {
    return "cushioning, stability, weight, speed, fit, or value";
  }
  return "price, performance, features, or use-case fit";
}

/** Infer a typed alternative edge when catalog only lists a peer ID. */
export function inferAlternativeRelationshipType(
  source: Product,
  target: Product,
): ProductRelationship["type"] {
  const sW = numSpec(source, "weight");
  const tW = numSpec(target, "weight");
  if (sW != null && tW != null && tW <= sW * 0.9) {
    return "lighter-alternative";
  }

  const sScore = source.recommendationScore ?? 0;
  const tScore = target.recommendationScore ?? 0;
  const sVal = source.valueScore ?? 0;
  const tVal = target.valueScore ?? 0;

  if (tVal >= sVal + 8 && tScore <= sScore + 3) return "better-value";
  if (tScore >= sScore + 10 && tVal + 5 < sVal) return "premium-alternative";

  const cushionRank = (p: Product) => {
    const c = String(p.specifications?.cushionLevel ?? "").toLowerCase();
    if (c.includes("max")) return 3;
    if (c.includes("high")) return 2;
    if (c.includes("moderate") || c.includes("medium")) return 1;
    return 0;
  };
  if (
    (source.categoryId === "cat-running-shoes" ||
      source.categoryId.includes("shoe")) &&
    cushionRank(target) > cushionRank(source)
  ) {
    return "more-cushioned";
  }

  const stab = (p: Product) =>
    String(p.specifications?.stability ?? "").toLowerCase();
  if (
    source.categoryId === "cat-running-shoes" &&
    /support|stability|guide/.test(stab(target)) &&
    !/support|stability|guide/.test(stab(source))
  ) {
    return "more-stable";
  }

  const raceLike = (p: Product) =>
    p.useCaseIds.some((id) =>
      /race|tempo|interval|marathon|speed/.test(id),
    );
  if (raceLike(target) && !raceLike(source)) {
    return "race-focused-alternative";
  }

  const trailLike = (p: Product) =>
    p.useCaseIds.some((id) => /trail/.test(id)) ||
    String(p.specifications?.terrain ?? "")
      .toLowerCase()
      .includes("trail");
  if (trailLike(target) && !trailLike(source)) return "trail-alternative";

  if (
    source.familyId &&
    source.familyId === target.familyId &&
    source.lifecycleStatus === "current" &&
    target.lifecycleStatus === "previous-generation"
  ) {
    return "previous-generation";
  }

  return "direct-competitor";
}

export function buildAlternativeDecisionCopy(input: {
  source: Product;
  alternative: Product;
  relationship: ProductRelationship;
  reason?: AlternativesReasonConfig;
}): AlternativeDecisionCopy {
  const { source, alternative: alt, relationship, reason } = input;
  const accessory = buildAccessoryAlternativeCopy({
    source,
    alternative: alt,
    relationship,
  });
  if (accessory) return accessory;

  const sName = source.name;
  const tName = alt.name;
  const seek = seekLabel(relationship.type, reason);
  const sStrength = firstUseful(
    source.strengths,
    source.shortDescription || `${sName}'s primary role`,
  );
  const tStrength = firstUseful(
    alt.strengths,
    alt.shortDescription || `${tName}'s primary role`,
  );
  const sWeak = firstUseful(source.weaknesses, `limits when you need ${seek}`);
  const tWeak = firstUseful(alt.weaknesses, `limits outside ${seek}`);
  const sDesc = clip(source.shortDescription || sStrength, 90);
  const tDesc = clip(alt.shortDescription || tStrength, 90);
  const sUc = getUseCaseHint(source);
  const tUc = getUseCaseHint(alt);
  const spec = specNote(source, alt);
  const sSpec = specFingerprint(source);
  const tSpec = specFingerprint(alt);

  const sStrength2 = source.strengths?.[1]?.trim();
  const tStrength2 = alt.strengths?.[1]?.trim();
  const sVerdict = usefulVerdict(source);
  const tVerdict = usefulVerdict(alt);

  const graphReasons = relationship.reasons
    .map((r) => r.trim())
    .filter((r) => r.length >= 12)
    .filter(
      (r) =>
        !/same-category alternative when you want a peer/i.test(r) &&
        !/is a same-category alternative/i.test(r) &&
        !/^Switch to /i.test(r) &&
        !/^Stay with /i.test(r) &&
        !/is a .+ alternative to /i.test(r) &&
        !/belongs on a .+ alternatives shortlist/i.test(r),
    );

  const whyFrames = [
    `${tName} is on the ${sName} alternatives list for ${seek}. ${tName} brief: ${tDesc}. ${sName} brief: ${sDesc}.${tStrength2 ? ` Extra peer cue: ${lowerLead(tStrength2)}.` : ""}${tSpec ? ` Peer spec: ${tSpec}.` : ""}`,
    `Leave ${sName} for ${tName} when ${seek} outweighs the source’s ${sUc} bias. ${tName} centres on ${tUc}${spec ? ` (${spec})` : ""}.${sSpec ? ` You give up ${sName} spec (${sSpec}).` : ""}`,
    `${seek} is the fork: ${tName} (${tDesc}) versus ${sName} (${sDesc}).${sVerdict ? ` Source verdict cue: ${sVerdict}` : ""}${tSpec && sSpec ? ` Spec split — peer ${tSpec} vs source ${sSpec}.` : ""}`,
    `Pick ${tName} over ${sName} only if ${lowerLead(tStrength)} is the weekly gap. ${tName} is ${tUc}; ${sName} stays ${sUc}.${tWeak ? ` Cost of the switch: ${lowerLead(tWeak)}.` : ""}`,
    `${sName} vs ${tName} is not a score swap. ${tName} wins when ${seek} and ${lowerLead(tStrength)} beat ${lowerLead(sStrength)}.${spec ? ` ${spec}.` : ""}`,
  ];
  const whyAlternative = whyFrames[hashPair(source.id, alt.id) % whyFrames.length]!;

  const summaryFrames = [
    `Pick ${tName} when ${lowerLead(tStrength)} beats ${lowerLead(sStrength)} for ${tUc}.${tVerdict ? ` Peer verdict: ${tVerdict}` : ""}`,
    `${sName} stays ahead if ${lowerLead(sStrength)} still owns ${sUc}; ${tName} wins the week ${seek} is the gap.${sStrength2 ? ` Source also: ${lowerLead(sStrength2)}.` : ""}`,
    `Call: ${tName} for ${lowerLead(tStrength)}; ${sName} when you will not trade ${lowerLead(sStrength)}.${spec ? ` Spec split — ${spec}.` : ""}`,
  ];
  const summary = summaryFrames[hashPair(alt.slug, source.id) % summaryFrames.length]!;

  const betterAt = [
    ...graphReasons.slice(0, 1),
    `${tName} advantage: ${lowerLead(tStrength)}`,
    tStrength2
      ? `Also stronger on: ${lowerLead(tStrength2)}`
      : `Better match for ${tUc} than ${sName}'s ${sUc} default`,
    spec ?? (tVerdict ? `Peer positioning: ${tVerdict}` : tDesc),
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);

  const worseAt = [
    `You leave behind ${sName}'s ${lowerLead(sStrength)}`,
    `${tName} downside: ${lowerLead(tWeak)}`,
    sWeak
      ? `Only switch if ${lowerLead(sWeak)} is a real problem — otherwise ${seek} is optional`
      : `If ${sUc} is still most of your week, ${seek} may be the wrong upgrade`,
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);

  const switchFrames = [
    `Switch to ${tName} when ${seek} is the shopping trigger and ${lowerLead(tStrength)} shows up more weeks than ${lowerLead(sStrength)}.`,
    `Choose ${tName} if your calendar is mostly ${tUc} and ${sName}'s ${sUc} bias is the wrong default.`,
    `Move to ${tName} when ${seek} matters more than protecting ${lowerLead(sStrength)}.`,
    `Move to ${tName} if ${lowerLead(sWeak)} is the reason you opened this page and ${lowerLead(tStrength)} actually fixes it.`,
    `Choose ${tName} when ${tUc} is the week and ${sName} is only winning on habit — not on ${seek}.`,
  ];
  const stayFrames = [
    `Stay with ${sName} when ${lowerLead(sStrength)} still covers ${sUc} and ${seek} is only occasional — not worth ${lowerLead(tWeak)}.`,
    `Keep ${sName} if ${sDesc} is still the honest match and you would only use ${tName}'s ${seek} edge rarely.`,
    `Stay with ${sName} if ${lowerLead(sWeak)} is not biting; ${tName}'s upside does not cancel ${lowerLead(tWeak)}.`,
    `Keep ${sName} when ${sSpec || sUc} still matches the miles you actually run, even if ${tName} looks better on paper.`,
    `Stay with ${sName} unless ${seek} is a weekly problem — ${tName} is a different job, not a free upgrade.`,
  ];

  const whoShouldSwitch =
    switchFrames[hashPair(alt.id, source.id) % switchFrames.length]!;
  const whoShouldStay =
    stayFrames[hashPair(source.slug, alt.id) % stayFrames.length]!;

  const whyChoose = [
    ...betterAt.slice(0, 2),
    whoShouldSwitch,
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);

  return {
    whyAlternative,
    summary,
    betterAt,
    worseAt,
    whoShouldSwitch,
    whoShouldStay,
    whyChoose,
  };
}

export function buildAlternativesPageIntro(input: {
  source: Product;
  altCount: number;
  reasonTitles: string[];
}): string {
  const { source, altCount, reasonTitles } = input;
  const overlay =
    ALTERNATIVES_P65_UNIQUE_INTROS[source.slug] ??
    ALTERNATIVES_P64_UNIQUE_INTROS[source.slug] ??
    ALTERNATIVES_P57_UNIQUE_INTROS[source.slug];
  if (overlay) return overlay;

  const hints = categorySeekHints(source.categoryId);
  const groups =
    reasonTitles.length > 0
      ? reasonTitles.slice(0, 4).join(", ")
      : hints;
  const role = firstUseful(
    source.strengths,
    source.shortDescription || source.fullName,
  );
  const weak = firstUseful(
    source.weaknesses,
    "a different specialty than the peers below",
  );
  const desc = clip(source.shortDescription || role, 90);
  const uc = getUseCaseHint(source);
  const spec = specFingerprint(source);
  const variant = hashPair(source.id, source.slug) % 4;
  const frames = [
    `${source.fullName} is for ${uc}. Spec cue: ${spec || desc}. Honest limit: ${lowerLead(weak)}. This list is ${altCount} peer${altCount === 1 ? "" : "s"} grouped by ${groups} — switch only when that gap is weekly.`,
    `${source.fullName} (${desc}) owns ${uc}. ${spec ? `Hardware: ${spec}. ` : ""}Leave it when ${hints} is the actual shopping trigger, not when a peer simply scores higher.`,
    `Stay with ${source.name} while ${lowerLead(role)} still covers ${uc}. The ${altCount} alternatives below split on ${groups}. Cost of leaving: ${lowerLead(weak)}.`,
    `${source.fullName} is not a generic category pick. Role: ${desc}. ${spec ? `${spec}. ` : ""}Peers are grouped by ${groups} so you can match the job, not the brand.`,
  ];
  return frames[variant]!;
}

/** True when ranked alternatives still look distinct after scrubbing product names. */
export function alternativesHaveDistinctDecisionCopy(
  items: { whyAlternative: string; whoShouldSwitch: string }[],
  names: string[],
): boolean {
  if (items.length < 2) return false;
  const keys = items.map((it) =>
    normalizeText(
      scrubEntityNames(
        `${it.whyAlternative} ${it.whoShouldSwitch}`,
        names,
      ),
    ).slice(0, 160),
  );
  return new Set(keys).size >= Math.min(3, items.length);
}
