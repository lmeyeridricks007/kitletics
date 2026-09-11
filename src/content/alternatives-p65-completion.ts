/**
 * Fix 65 — complete thin Alternatives graphs from catalog peers, or hold explicitly.
 */
import type { Product } from "@/domain/products/types";
import type { ProductRelationshipType } from "@/domain/relationships/types";
import {
  scoreAlternativePair,
  semanticAltCluster,
} from "@/lib/decision-graph/semantic-quality";

/** Explicit holds after catalog fill — never padded. */
export const ALTERNATIVES_HOLD_INSUFFICIENT_MARKET = new Set<string>([
  // Prefer derived holds: classify uses same-job cluster size, not this set.
  // Fix 74 (caps / beanie / motorised vs curved) is cluster + scorer, not a slug list.
]);

export const ALTERNATIVES_HOLD_DUPLICATE_INTENT = new Set<string>([
  "nike-dri-fit-miler-women",
]);

export const ALTERNATIVES_HOLD_OBSOLETE_SOURCE = new Set<string>([
  // previous-gen pages that add nothing beyond the current-gen Alternatives page
]);

export type AlternativesHoldClass =
  | "READY"
  | "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET"
  | "HOLD_DUPLICATE_INTENT"
  | "HOLD_OBSOLETE_SOURCE"
  | "THIN_UNEXPLAINED";

export function alternativeMarketCluster(product: Product): string {
  const s = product.slug;
  const cat = product.categoryId;

  if (cat === "cat-recovery") {
    if (/theragun|hypervolt/.test(s)) return "recovery:gun";
    if (/grid|blackroll|brazyn|vyper/.test(s)) return "recovery:roller";
    if (/normatec/.test(s)) return "recovery:boot";
    if (/oofos/.test(s)) return "recovery:sandal";
    if (/sleeve/.test(s)) return "recovery:sleeve";
    return `recovery:${s}`;
  }
  if (cat === "cat-accessories") {
    if (/glide|sportshield|nut-butter|chafe/.test(s)) return "accessories:chafe";
    return `accessories:${s}`;
  }
  if (cat === "cat-hydration") {
    if (/reservoir|hydraulics|contour|crux/.test(s)) return "hydration:reservoir";
    if (/handheld|hydraform|exoshot|speeddraw|skyflask/.test(s))
      return "hydration:handheld";
    if (/tube/.test(s)) return "hydration:tube";
    if (/flask|softflask|body-bottle/.test(s)) return "hydration:flask";
    return `hydration:${s}`;
  }
  if (cat === "cat-running-clothing") {
    // Sherpa 7" shorts are not headwear — never lump them with caps/beanies.
    if (
      product.subcategoryIds.includes("sub-running-shorts") ||
      /short/.test(s)
    ) {
      return "clothing:short";
    }
    if (/glove/.test(s)) return "clothing:glove";
    // Summer/mild run caps and winter beanies are different buying jobs.
    if (/beanie/.test(s)) return "clothing:beanie";
    if (/gocap|(^|-)cap-|-cap$/.test(s)) return "clothing:cap";
    if (/tight/.test(s)) return "clothing:tight";
    if (/jacket|rainrunner|bonatti|canopy|houdini|weather/.test(s))
      return "clothing:jacket";
    if (/vest|nano-puff/.test(s)) return "clothing:vest";
    if (/singlet|aeroswift/.test(s)) return "clothing:singlet";
    if (/tee|miler|tee-men|tee-women/.test(s)) return "clothing:tee";
    if (/bottom|warm-eco/.test(s)) return "clothing:base-bottom";
    if (/-ls-|brighton-ls|element-ls|crew/.test(s)) return "clothing:ls";
    return `clothing:${s}`;
  }
  if (cat === "cat-running-socks") {
    if (/compression/.test(s)) return "socks:compression";
    if (/injinji/.test(s)) return "socks:toe";
    return "socks:run";
  }
  if (cat === "cat-running-lights") return "lights";
  if (cat === "cat-running-belts") return "belts";
  if (cat === "cat-safety-gear" || cat === "cat-running-safety") return "safety";
  if (cat === "cat-headphones") return "headphones";
  if (cat === "cat-packs-vests") {
    if (/quiver/.test(s)) return "packs:quiver";
    if (/stash|utility/.test(s)) return "packs:stash";
    return "packs:vest";
  }
  if (cat === "cat-nutrition") {
    if (/gel/.test(s)) return "nutrition:gel";
    if (/chew|blok/.test(s)) return "nutrition:chew";
    if (/bar/.test(s)) return "nutrition:bar";
    if (/drink|mix|tailwind/.test(s)) return "nutrition:drink";
    return `nutrition:${s}`;
  }
  if (cat === "cat-gps-watches") return "watches";
  if (cat === "cat-hrm") return "hrm";
  if (cat === "cat-running-shoes") {
    return semanticAltCluster(product) || "shoes:road-daily";
  }
  if (cat === "cat-padel-rackets") return "padel-rackets";
  if (cat === "cat-padel-shoes") return "padel-shoes";
  if (cat === "cat-tennis-rackets") return "tennis-rackets";
  if (cat === "cat-tennis-shoes") return "tennis-shoes";
  // Motorised folding decks vs self-powered curved sprint trainers are
  // different machines — a 6-SKU category is not one alternatives market.
  if (cat === "cat-treadmills") {
    if (product.specifications?.motorised === false) {
      return "treadmill:curved-manual";
    }
    return "treadmill:motorised";
  }
  return `${cat}`;
}

function genderBucket(slug: string): "men" | "women" | "uni" {
  if (slug.endsWith("-women")) return "women";
  if (slug.endsWith("-men")) return "men";
  return "uni";
}

/**
 * Fill alternativeProductIds to ≥3 using same-cluster catalog peers only.
 * Does not invent SKUs. Clusters with <3 other published products are left short.
 */
export function applyAlternativesP65Graph(products: Product[]): Product[] {
  const published = products.filter((p) => p.status === "published" && !p.noindex);
  const byCluster = new Map<string, Product[]>();
  for (const p of published) {
    const key = alternativeMarketCluster(p);
    const list = byCluster.get(key) ?? [];
    list.push(p);
    byCluster.set(key, list);
  }

  return products.map((product) => {
    if (product.status !== "published" || product.noindex) return product;
    if (ALTERNATIVES_HOLD_DUPLICATE_INTENT.has(product.slug)) return product;
    if (ALTERNATIVES_HOLD_OBSOLETE_SOURCE.has(product.slug)) return product;
    if (ALTERNATIVES_HOLD_INSUFFICIENT_MARKET.has(product.slug)) return product;

    const cluster = alternativeMarketCluster(product);
    const g = genderBucket(product.slug);
    const peers = (byCluster.get(cluster) ?? []).filter((p) => {
      if (p.id === product.id) return false;
      if (p.categoryId !== product.categoryId) return false;
      const pg = genderBucket(p.slug);
      if (g !== "uni" && pg !== "uni" && pg !== g) return false;
      return true;
    });

    const have = new Set(
      (product.alternativeProductIds ?? []).filter((id) =>
        peers.some((p) => p.id === id),
      ),
    );
    if (have.size >= 3) return product;
    if (peers.length < 3) return product;

    const rankCls = { STRONG: 0, VALID: 1, WEAK: 2, INVALID: 3 } as const;
    const ranked = [...peers]
      .map((peer) => ({ peer, scored: scoreAlternativePair(product, peer) }))
      .filter((row) => row.scored.cls !== "INVALID")
      .sort((a, b) => {
        const cr = rankCls[a.scored.cls] - rankCls[b.scored.cls];
        if (cr !== 0) return cr;
        const ua = a.peer.useCaseIds.filter((id) =>
          product.useCaseIds.includes(id),
        ).length;
        const ub = b.peer.useCaseIds.filter((id) =>
          product.useCaseIds.includes(id),
        ).length;
        if (ub !== ua) return ub - ua;
        return (b.peer.recommendationScore ?? 0) - (a.peer.recommendationScore ?? 0);
      });

    const next = [...(product.alternativeProductIds ?? [])];
    for (const { peer } of ranked) {
      if (have.size >= 3) break;
      if (have.has(peer.id)) continue;
      next.push(peer.id);
      have.add(peer.id);
    }
    if (next.length === (product.alternativeProductIds ?? []).length) return product;
    return { ...product, alternativeProductIds: [...new Set(next)] };
  });
}

/** Catalog-backed type split when a source's edges collapsed to one type. */
export function ensureDiverseAlternativeTypes(
  source: Product,
  peers: Product[],
  inferred: ProductRelationshipType[],
): ProductRelationshipType[] {
  if (peers.length === 0) return inferred;
  if (new Set(inferred).size >= 2) return inferred;

  const out = [...inferred];
  const valueIdx = peers.reduce(
    (best, p, i) =>
      (p.valueScore ?? 0) > (peers[best]!.valueScore ?? 0) ? i : best,
    0,
  );
  out[valueIdx] = "better-value";

  const weightOf = (p: Product) => {
    const v = p.specifications?.weight;
    return typeof v === "number" ? v : Number.NaN;
  };
  let lightIdx = -1;
  let lightVal = Number.POSITIVE_INFINITY;
  peers.forEach((p, i) => {
    const w = weightOf(p);
    if (Number.isFinite(w) && w < lightVal) {
      lightVal = w;
      lightIdx = i;
    }
  });
  if (lightIdx >= 0 && lightIdx !== valueIdx) {
    out[lightIdx] = "lighter-alternative";
    return out;
  }

  const other = out.findIndex((_, i) => i !== valueIdx);
  if (other >= 0) {
    const t = peers[other]!;
    const race = (p: Product) =>
      p.useCaseIds.some((id) => /race|tempo|interval|speed/.test(id));
    const trail = (p: Product) =>
      p.useCaseIds.some((id) => /trail/.test(id)) ||
      String(p.specifications?.terrain ?? "").toLowerCase().includes("trail");
    if (race(t) && !race(source)) out[other] = "race-focused-alternative";
    else if (trail(t) && !trail(source)) out[other] = "trail-alternative";
    else if ((t.recommendationScore ?? 0) >= (source.recommendationScore ?? 0) + 8)
      out[other] = "premium-alternative";
    else out[other] = "similar";
  }
  return out;
}

export function alternativeReasonsNeedEnrichment(reasons: string[]): boolean {
  const blob = reasons.join(" ").toLowerCase();
  const hasSwitch =
    /switch|choose|better when|when you want|prefer|move to/.test(blob);
  const hasTrade =
    /trade-?off|give up|stay with|keep |limit|worse|accept/.test(blob);
  const long = reasons.filter((x) => x.trim().length > 24).length;
  return !(hasSwitch && hasTrade && reasons.length >= 2 && long >= 1);
}

/** Unique intros for indexable pages that crossed 0.72 after graph completion. */
export const ALTERNATIVES_P65_UNIQUE_INTROS: Record<string, string> = {
  "garmin-forerunner-255":
    "Forerunner 255 is Garmin’s MIP mid runner: multi-band GPS, running dynamics, no maps, no music, button-only. Keep it when you want Garmin Connect training on a sunlight MIP and battery, not an entry AMOLED 165 and not a 570/965 maps-and-music stack. Leave when you want a cheap first AMOLED, COROS battery, or onboard maps.",
  "garmin-forerunner-165":
    "Forerunner 165 is Garmin’s current entry AMOLED — first-5k/10k coaching, no maps, no music, no running dynamics. Keep it when a bright beginner Garmin is the whole buy. Leave for 255 when MIP battery and dynamics matter, for 55 when you want MIP cheaper still, or up to 570 when you outgrow beginner metrics.",
  "garmin-forerunner-570":
    "Forerunner 570 is Garmin’s mid AMOLED with training readiness and Connect IQ — not Pace Pro’s COROS maps-and-battery bet, not 970’s current flagship. Keep it when Garmin sports science without 970 money is the job. Leave for Pace Pro when COROS battery/maps win, or to 165 when you only needed a first AMOLED.",
  "coros-pace-pro":
    "Pace Pro is COROS AMOLED with the COROS training model and long GPS weeks — not Garmin Connect, not Forerunner 570’s accessory ecosystem. Keep it when COROS battery plus a bright screen is why you skipped Pace 3 MIP. Leave for 570/970 when Garmin is non-negotiable, or to Pace 3 when MIP runtime is the only spec that matters.",
  "saucony-peregrine-15":
    "Peregrine 15 is a 4mm-drop PWRTRAC daily trail shoe: muddy grip and a protective ride, not max-stack ultra foam. Keep it for technical singletrack and wet roots. Leave for Trailfly G 300 Max / Speedgoat when ultra cushion is the week, or a road trainer when connectors are pavement.",
  "inov8-trailfly-ultra-g-300-max":
    "Trailfly Ultra G 300 Max is Inov8’s maximum G-FLY / G-GRIP ultra mountain shoe — graphene foam and outsole, niche shops, 6mm drop. Keep it for long technical ultras when stack is the shopping trigger. Leave for Peregrine when you want a lighter daily trail, Speedgoat when Hoka geometry wins, or a road max-cushion when the week is not mountain.",
};

export type P65CardVoice = {
  why: string;
  summary: string;
  betterHint: string;
  worseHint: string;
  switchTo: string;
  stay: string;
};

export const ALTERNATIVES_P65_CARD_VOICE: Record<string, P65CardVoice> = {
  "garmin-forerunner-255": {
    why: "255 is MIP + multi-band + running dynamics, no maps/music. {t} is AMOLED-entry, maps, or COROS battery: {tJob}.",
    summary: "MIP Garmin mid vs {t}.",
    betterHint: "{t} if MIP, no music, or missing maps is the fail",
    worseHint: "You give up sunlight MIP battery and Garmin dynamics at this price",
    switchTo: "Switch to {t} for a first AMOLED, maps/music, or COROS runtime — {tJob}.",
    stay: "Keep 255 when Garmin MIP training without 570 spend is the job and {tCost}.",
  },
  "garmin-forerunner-165": {
    why: "165 is entry AMOLED for first 5k–half — no dynamics, no maps, no music. {t} is MIP value or a real mid Garmin: {tJob}.",
    summary: "Beginner Garmin AMOLED vs {t}.",
    betterHint: "{t} if you already outgrew beginner metrics or want MIP battery",
    worseHint: "You give up the cheapest bright Garmin first-watch path",
    switchTo: "Choose {t} when running dynamics, maps, or MIP battery is the gap — {tJob}.",
    stay: "Keep 165 when a first AMOLED Garmin is enough and {tCost} is extra watch you will not use.",
  },
  "garmin-forerunner-570": {
    why: "570 is Garmin mid AMOLED + training readiness in Connect — not COROS. {t} is COROS battery/maps or a cheaper first AMOLED: {tJob}.",
    summary: "Garmin mid AMOLED vs {t} ecosystem.",
    betterHint: "{t} if Garmin tax or missing COROS runtime is the fail",
    worseHint: "You give up Garmin training readiness and Connect IQ",
    switchTo: "Move to {t} for COROS GPS weeks, 165 beginner price, or 970 flagship — {tJob}.",
    stay: "Keep 570 when Garmin sports science without 970 money is the buy and {tCost}.",
  },
  "coros-pace-pro": {
    why: "Pace Pro is COROS AMOLED battery/maps — not Connect. {t} is Garmin science or MIP-only Pace 3: {tJob}.",
    summary: "COROS AMOLED vs {t} ecosystem.",
    betterHint: "{t} if COROS app or missing Garmin accessories is the fail",
    worseHint: "You give up COROS GPS runtime on an AMOLED",
    switchTo: "Switch to {t} for Garmin Connect, Pace 3 MIP runtime, or Polar physiology — {tJob}.",
    stay: "Keep Pace Pro when COROS plus a bright screen is why you are not buying a Forerunner, even with {tCost}.",
  },
  "saucony-peregrine-15": {
    why: "Peregrine 15 is 4mm PWRTRAC muddy daily trail, not max ultra stack. {t} is max-cushion mountain or a road connector shoe: {tJob}.",
    summary: "Aggressive daily trail vs {t}.",
    betterHint: "{t} if Peregrine firmness on hardpack or missing ultra stack is the fail",
    worseHint: "You give up confident muddy grip in a daily trail weight",
    switchTo: "Switch to {t} for G-FLY ultra stack, Hoka trail geometry, or road cushion — {tJob}.",
    stay: "Keep Peregrine when technical wet trail is the week and {tCost} is ultra bulk you do not want.",
  },
  "inov8-trailfly-ultra-g-300-max": {
    why: "Trailfly G 300 Max is maximum G-FLY mountain ultra foam (6mm), not a 4mm daily Peregrine. {t} is a lighter trail or a road max: {tJob}.",
    summary: "Max-stack trail ultra vs {t}.",
    betterHint: "{t} if niche shops or overbuilt short-trail days are the fail",
    worseHint: "You give up graphene ultra stack and G-GRIP durability",
    switchTo: "Choose {t} for a daily trail, Hoka stack, or road recovery — {tJob}.",
    stay: "Keep Trailfly Max when long technical ultras are why you are shopping and {tCost} is a shoe that is not an ultra tool.",
  },
};
