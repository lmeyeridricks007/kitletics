/**
 * Page-time Best Guide recommendation enricher.
 * Upgrades thin / clinical whyRecommended into readable whyItFits prose
 * so every guide explains why a pick fits the use case — not a score label.
 */

import type {
  BestGuide,
  BestGuideRecommendation,
  Review,
} from "@/domain/editorial/types";
import type { Brand, Product } from "@/domain/products/types";
import {
  resolveGuideContextConfig,
  type GuideContextConfig,
} from "@/lib/best/guide-context-config";
import { resolveDecisionCopyForProduct } from "@/lib/decision-copy";
import {
  rewriteUniquenessEraSkipProse,
  sanitizePublicCopyList,
} from "@/lib/review/rewrite-uniqueness-era-skip";

const MIN_WHY_PARA = 90;
const MIN_WHY_PARAS = 2;
const CLINICAL =
  /\bRecommendation\b|Matched recommendation|use-case fit score|stands out in-catalog|earns consideration when|verified specs|structured catalog|Performance assessment/i;

function softLead(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** Avoid "Best when you are players who…" double-person glue. */
function bestForClause(profile: string): string {
  const t = profile.trim();
  if (!t) return t;
  if (/^best (for|when)\b/i.test(t)) return t;
  if (/^(players|runners|anyone|those|people) who\b/i.test(t)) {
    return `Best for ${softLead(t)}`;
  }
  if (/^(players|runners|anyone|those|people)\b/i.test(t)) {
    return `Best for ${softLead(t)}`;
  }
  return `Best for players who ${softLead(t)}`;
}

function widthStory(product: Product): string | undefined {
  const raw = product.specifications?.widthOptions;
  if (!raw) return undefined;
  const values = (Array.isArray(raw) ? raw : [raw]).map(String);
  const hasWide = values.some((v) => /wide|2e|4e|d\+|ee/i.test(v));
  const hasNarrow = values.some((v) => /narrow|b\b|2a/i.test(v));
  if (hasWide && hasNarrow) {
    return "official narrow-to-extra-wide options";
  }
  if (hasWide) return "official wide width options";
  if (values.length >= 2) return "multiple official width options";
  return undefined;
}

function cushionStory(product: Product): string | undefined {
  const feel = String(product.specifications?.cushionFeel ?? "").toLowerCase();
  const level = String(product.specifications?.cushionLevel ?? "").toLowerCase();
  const ride = String(product.specifications?.rideCharacter ?? "").toLowerCase();
  const midsole = String(product.specifications?.midsole ?? "").trim();
  const bits: string[] = [];
  if (level === "max" || level === "maximum") bits.push("max-cushion stack");
  else if (level === "high") bits.push("protective cushioning");
  else if (level === "moderate" || level === "medium") bits.push("moderate cushioning");
  if (feel === "soft" || feel === "plush") bits.push("a soft underfoot feel");
  else if (feel === "firm") bits.push("a firmer ride");
  if (ride === "smooth") bits.push("a smooth easy-mile transition");
  else if (ride === "rocker" || ride === "meta-rocker") bits.push("a rockered roll");
  else if (ride === "bouncy" || ride === "energetic") bits.push("a livelier rebound");
  if (midsole && midsole.length < 40) bits.push(`${midsole} underfoot`);
  if (!bits.length) return undefined;
  return bits.slice(0, 3).join(" with ");
}

function stabilityLabel(product: Product): string | undefined {
  const s = String(product.specifications?.stability ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("stability") || s.includes("guided") || s.includes("support")) {
    return "guided stability";
  }
  if (s === "neutral") return "neutral platform";
  return s;
}

function isThinWhyText(text: string | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  if (t.length < MIN_WHY_PARA) return true;
  if (CLINICAL.test(t)) return true;
  // Label-like one-liner
  if (t.length < 120 && !/[.—–,]| when | if | because | for | without /i.test(t)) {
    return true;
  }
  return false;
}

function isThinWhyItFits(paras: string[] | undefined): boolean {
  const list = (paras ?? []).map((p) => p.trim()).filter(Boolean);
  if (list.length < MIN_WHY_PARAS) return true;
  const strong = list.filter((p) => p.length >= MIN_WHY_PARA && !CLINICAL.test(p));
  return strong.length < MIN_WHY_PARAS;
}

function isThinList(items: string[] | undefined, min = 2, minLen = 28): boolean {
  const list = (items ?? []).map((s) => s.trim()).filter(Boolean);
  if (list.length < min) return true;
  return list.filter((s) => s.length >= minLen && !CLINICAL.test(s)).length < min;
}

function peerName(
  peers: { product: Product }[],
  excludeId: string,
): string | undefined {
  return peers.find((p) => p.product.id !== excludeId)?.product.name;
}

function contextPhrase(cfg: GuideContextConfig, guideTitle: string): string {
  if (cfg.id !== "generic") return cfg.label.toLowerCase();
  // "Best Running Shoes for Beginners" → "beginners"
  const m = guideTitle.match(/for\s+(.+)$/i);
  if (m?.[1]) return m[1].trim().toLowerCase().replace(/\s+/g, " ");
  return "this use case";
}

function buildWhyItFits(input: {
  product: Product;
  brand?: Brand;
  entry: BestGuideRecommendation;
  cfg: GuideContextConfig;
  contextLabel: string;
  peers: { product: Product; entry: BestGuideRecommendation }[];
  review?: Review;
}): string[] {
  const { product, brand, entry, cfg, contextLabel, peers, review } = input;
  const name = product.name;
  const brandName = brand?.name;
  const full = brandName ? `${brandName} ${name}` : name;
  const peer = peerName(peers, product.id);
  const peer2 = peerName(
    peers.filter((p) => p.product.name !== peer),
    product.id,
  );
  const widths = widthStory(product);
  const cushion = cushionStory(product);
  const stability = stabilityLabel(product);
  const s0 = product.strengths?.[0];
  const s1 = product.strengths?.[1];
  const w0 = product.weaknesses?.[0];
  const summary = entry.summary?.trim();
  const seed = entry.whyRecommended?.trim();
  const usableSeed =
    seed && !isThinWhyText(seed) && !CLINICAL.test(seed) ? seed : undefined;
  const verdict = review?.verdict?.trim() || review?.bottomLine?.trim();

  const paras: string[] = [];

  // P1 — what it is for in this guide
  if (usableSeed && usableSeed.length >= MIN_WHY_PARA) {
    paras.push(usableSeed);
  } else {
    const hooks: string[] = [];
    if (s0) hooks.push(softLead(s0));
    if (widths) hooks.push(widths);
    if (cushion) hooks.push(cushion);
    if (stability && cfg.id === "stability") hooks.push(stability);
    const hook =
      hooks.slice(0, 2).join(" plus ") ||
      summary ||
      "a clear, predictable daily job";

    if (cfg.id === "beginners" || /beginner/i.test(contextLabel)) {
      paras.push(
        `${full} is the kind of first serious shoe that makes early miles easier to stick with — ${hook}. You get a forgiving road/treadmill daily without needing race plates, extreme geometry, or a specialist rotation on day one.`,
      );
    } else if (cfg.id === "wide-feet") {
      paras.push(
        `${full} earns a slot here because fit volume is not a maybe — ${widths ?? "published width options"} matter more than stack marketing for wide feet. ${s0 ? `${softLead(s0)} keeps it usable as a real training shoe, not just a wide last.` : "That makes it a practical pick when standard lasts feel pinched."}`,
      );
    } else if (cfg.id === "long-runs" || cfg.id === "marathon") {
      paras.push(
        `${full} fits ${contextLabel} when the priority is staying comfortable as time on feet climbs — ${hook}. It is built for the weekly long session more than for race-day sharpness alone.`,
      );
    } else if (cfg.id === "tempo") {
      paras.push(
        `${full} belongs in a tempo/workout rotation when you want snap at controlled hard paces — ${hook}. Keep a softer daily for easy volume; this one’s job is quality work.`,
      );
    } else if (cfg.id === "stability") {
      paras.push(
        `${full} is here for runners who want a more guided, predictable platform — ${hook}. Support is the reason to shortlist it, not a soft max-cushion float.`,
      );
    } else if (cfg.id === "race-5k") {
      paras.push(
        `${full} is a race-day tool when weight and rebound matter more than everyday plush — ${hook}. Treat it as the fast shoe, not your only pair.`,
      );
    } else {
      paras.push(
        `${full} fits ${contextLabel} when you want ${hook}. ${summary ? `${summary.replace(/\.$/, "")} is the short version.` : "That is the role this pick is covering in this guide."}`,
      );
    }
  }

  // P2 — how it behaves / who it suits
  const whoBits: string[] = [];
  if (entry.bestForProfiles?.[0]) {
    whoBits.push(bestForClause(entry.bestForProfiles[0]));
  } else if (s1) {
    whoBits.push(`It also brings ${softLead(s1)}`);
  }
  if (cushion && !paras[0]?.includes("cushion")) {
    whoBits.push(`underfoot you get ${cushion}`);
  }
  if (widths && !paras[0]?.includes("width")) {
    whoBits.push(`fit is easier to get right with ${widths}`);
  }

  if (cfg.id === "beginners" || /beginner/i.test(contextLabel)) {
    paras.push(
      `For beginners that usually means easy runs, couch-to-5K volume, and learning a weekly rhythm — not intervals in a carbon racer. ${whoBits.length ? `${whoBits.join(", and ")}.` : "The ride stays approachable when you are still building consistency."} ${peer ? `If you already know you want something bouncier or more specialized, look at ${peer} lower on this list.` : ""}`.trim(),
    );
  } else if (cfg.id === "long-runs" || cfg.id === "marathon") {
    paras.push(
      `Late in longer sessions the platform should still feel usable when form gets less precise. ${whoBits.length ? `${whoBits.join("; ")}.` : ""} ${w0 ? `The honest limit: ${softLead(w0)}.` : ""}`.trim(),
    );
  } else if (cfg.id === "tempo") {
    paras.push(
      `Use it for threshold, cruise intervals, and faster long-run finishes where a daily trainer feels flat. ${whoBits.length ? `${whoBits.join("; ")}.` : ""} ${w0 ? `Skip it when ${softLead(w0)} would bother you on easy days.` : "Leave recovery jogs to a softer daily."}`.trim(),
    );
  } else {
    paras.push(
      `${whoBits.length ? `${whoBits.join(", and ")}.` : `In practice it covers the main job this guide is solving for ${contextLabel}.`} ${w0 ? `The trade-off to accept: ${softLead(w0)}.` : peer ? `Keep ${peer} in mind if your priorities tilt a different way.` : ""}`.trim(),
    );
  }

  // P3 — choose this vs peers / when not
  if (peer && peer2) {
    paras.push(
      `I'd shortlist ${name} when its role matches your week better than ${peer} or ${peer2}. ${w0 ? `Skip it if ${softLead(w0)} is a deal-breaker — then jump to the alternative that fixes that first.` : `If another pick on this page matches your constraint more tightly, take that instead — this is a ranked shortlist, not a single universal winner.`}`,
    );
  } else if (peer) {
    paras.push(
      `Choose ${name} over ${peer} when ${s0 ? softLead(s0) : "this guide’s main priority"} matters more to you than the other option’s strengths. ${entry.notIdealFor?.[0] ? `Skip it if you are ${softLead(entry.notIdealFor[0])}.` : w0 ? `Skip it if ${softLead(w0)} would frustrate you.` : ""}`.trim(),
    );
  } else if (verdict && verdict.length >= 60 && !CLINICAL.test(verdict)) {
    paras.push(verdict.length > 280 ? `${verdict.slice(0, 277).trim()}…` : verdict);
  } else {
    paras.push(
      `I'd buy it for this use case when the strengths above match how you actually train. If you need a different specialty — more speed, more support, or a different fit story — use the trade-offs and “choose something else” notes beside this pick.`,
    );
  }

  return paras
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40)
    .slice(0, 3);
}

function buildWhyItWon(input: {
  product: Product;
  brand?: Brand;
  contextLabel: string;
  peers: { product: Product; entry: BestGuideRecommendation }[];
  entry: BestGuideRecommendation;
}): string {
  const { product, brand, contextLabel, peers, entry } = input;
  const full = brand?.name ? `${brand.name} ${product.name}` : product.name;
  const runnerUp = peers[0]?.product;
  const s0 = product.strengths?.[0];
  const widths = widthStory(product);
  const reason =
    entry.summary?.trim() ||
    (s0 && widths
      ? `${softLead(s0)} and ${widths}`
      : s0
        ? softLead(s0)
        : "the clearest overall match for this use case");

  if (runnerUp) {
    return `${full} ranks first for ${contextLabel} because ${reason} — more complete for most people starting from this guide than ${runnerUp.name}, which stays excellent when you specifically want ${peers[0]?.entry.summary ? softLead(peers[0].entry.summary) : "that alternative’s specialty"}.`;
  }
  return `${full} ranks first for ${contextLabel} because ${reason}. It is still not universal — check the trade-offs before you buy.`;
}

function buildUseCaseStrengths(
  product: Product,
  contextLabel: string,
  entry: BestGuideRecommendation,
): string[] {
  const fromEntry = (entry.useCaseStrengths ?? entry.strengths ?? [])
    .map((s) => s.trim())
    .filter((s) => s && !CLINICAL.test(s) && s.length >= 20);
  if (fromEntry.length >= 2) return fromEntry.slice(0, 4);

  const out: string[] = [];
  for (const s of product.strengths ?? []) {
    const t = s.trim();
    if (!t || CLINICAL.test(t)) continue;
    if (t.length >= 40) out.push(t);
    else out.push(`${t} — relevant for ${contextLabel}`);
    if (out.length >= 3) break;
  }
  const widths = widthStory(product);
  if (widths && !out.some((x) => /width/i.test(x))) {
    out.push(`${widths.charAt(0).toUpperCase()}${widths.slice(1)}`);
  }
  return out.slice(0, 4);
}

function buildTradeoffs(
  product: Product,
  entry: BestGuideRecommendation,
): string[] {
  const existing = (entry.tradeoffs ?? entry.compromises ?? [])
    .map((s) => s.trim())
    .filter((s) => s && !CLINICAL.test(s));
  if (existing.length >= 1 && existing.every((s) => s.length >= 24)) {
    return existing.slice(0, 3);
  }
  const out: string[] = [...existing];
  for (const w of product.weaknesses ?? []) {
    const t = w.trim();
    if (!t || CLINICAL.test(t)) continue;
    if (t.length < 24) out.push(`${t} — another shoe may suit that need better`);
    else out.push(t);
    if (out.length >= 3) break;
  }
  if (!out.length) {
    out.push("Not the specialist pick if you need a narrow, race-only tool");
  }
  return out.slice(0, 3);
}

function buildBestFor(
  product: Product,
  contextLabel: string,
  entry: BestGuideRecommendation,
): string[] {
  const existing = (entry.bestForProfiles ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  // Prefer authored labels — expand short telegrams into complete situations
  // without the old "X who want a clear this use case pick…" glue.
  if (existing.length >= 1) {
    return existing
      .map((label) => {
        if (label.length >= 28 || /\b(who|when|players|runners|anyone)\b/i.test(label)) {
          return label;
        }
        const noun = label.replace(/^(a |an |the )/i, "").trim();
        return `Players who prefer ${noun}`;
      })
      .slice(0, 4);
  }
  const out: string[] = [];
  out.push(
    `Players who need a clear ${contextLabel} pick and prefer ${softLead(product.strengths?.[0] ?? "a dependable primary option")}`,
  );
  if (widthStory(product)) {
    out.push("Anyone who needs official width options to get fit right early");
  }
  return out.slice(0, 4);
}

function buildNotIdeal(
  product: Product,
  entry: BestGuideRecommendation,
): string[] {
  const existing = (entry.notIdealFor ?? entry.whoShouldAvoid ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (existing.length >= 1) return existing.slice(0, 4);
  const w0 = product.weaknesses?.[0];
  if (w0) return [`Anyone bothered by ${softLead(w0)}`];
  return ["Runners who already need a race-specific or highly specialized shoe"];
}

/**
 * Prefer strong editorial fields; fill gaps with readable buying-guide prose.
 */
export function enrichGuideRecommendation(input: {
  guide: Pick<BestGuide, "slug" | "title" | "useCaseIds" | "intro">;
  entry: BestGuideRecommendation;
  product: Product;
  brand?: Brand;
  review?: Review;
  /** Other shortlisted products in this guide (usually sorted by rank) */
  peers?: { product: Product; entry: BestGuideRecommendation }[];
  isTopPick?: boolean;
}): BestGuideRecommendation {
  const { guide, product, brand, review, isTopPick } = input;
  let entry = input.entry;
  const peers = input.peers ?? [];
  const cfg = resolveGuideContextConfig({
    useCaseIds: guide.useCaseIds,
    slug: guide.slug,
  });
  const contextLabel = contextPhrase(cfg, guide.title);

  if (isThinWhyItFits(entry.whyItFits)) {
    entry = {
      ...entry,
      whyItFits: buildWhyItFits({
        product,
        brand,
        entry,
        cfg,
        contextLabel,
        peers,
        review,
      }),
    };
  }

  if (isTopPick && !entry.whyItWon?.trim()) {
    entry = {
      ...entry,
      whyItWon: buildWhyItWon({
        product,
        brand,
        contextLabel,
        peers,
        entry,
      }),
    };
  }

  if (isThinList(entry.useCaseStrengths ?? entry.strengths, 2, 20)) {
    entry = {
      ...entry,
      useCaseStrengths: buildUseCaseStrengths(product, contextLabel, entry),
    };
  }

  if (isThinList(entry.tradeoffs ?? entry.compromises, 1, 24)) {
    const tradeoffs = buildTradeoffs(product, entry);
    entry = {
      ...entry,
      tradeoffs,
      // Keep legacy field in sync so comparison tables / older UI never go blank
      compromises: entry.compromises?.length ? entry.compromises : tradeoffs,
    };
  }

  if (isThinList(entry.bestForProfiles, 1, 20)) {
    entry = {
      ...entry,
      bestForProfiles: buildBestFor(product, contextLabel, entry),
    };
  }

  if (
    isThinList(entry.notIdealFor ?? entry.whoShouldAvoid, 1, 16)
  ) {
    entry = {
      ...entry,
      notIdealFor: buildNotIdeal(product, entry),
    };
  }

  const decision = resolveDecisionCopyForProduct({
    product,
    review,
    bestFor: entry.bestForProfiles,
    notIdealFor: entry.notIdealFor,
  });
  entry = {
    ...entry,
    bestForProfiles: decision.bestFor,
    notIdealFor: decision.notIdealFor,
    whoShouldAvoid: decision.skipIf,
  };

  // Replace clinical one-liner whyRecommended with a readable summary line
  if (isThinWhyText(entry.whyRecommended)) {
    const lead = entry.whyItFits?.[0];
    entry = {
      ...entry,
      whyRecommended: lead
        ? lead.length > 180
          ? `${lead.slice(0, 177).trim()}…`
          : lead
        : entry.summary || entry.rationale,
    };
  }

  return {
    ...entry,
    whyItFits: sanitizePublicCopyList(entry.whyItFits),
    whyRecommended: entry.whyRecommended
      ? rewriteUniquenessEraSkipProse(entry.whyRecommended)
      : entry.whyRecommended,
    whyItWon: entry.whyItWon
      ? rewriteUniquenessEraSkipProse(entry.whyItWon)
      : entry.whyItWon,
    tradeoffs: sanitizePublicCopyList(entry.tradeoffs),
    compromises: sanitizePublicCopyList(entry.compromises),
  };
}

/** Test helpers */
export const __enrichGuideTest = {
  isThinWhyText,
  isThinWhyItFits,
  CLINICAL,
};
