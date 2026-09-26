/**
 * Padel-specific longform. Court language only — never running foam essays.
 * Synthesises manufacturer specs and PDP copy. Does not invent on-court tests.
 */
import type { Review } from "@/domain/editorial/types";
import type { Product, SpecValue } from "@/domain/products/types";
import { getPadelRacketDraft, getPadelRacketPdpCopy } from "@/content/padel/rackets";
import { skipSentenceFromLimitation } from "@/lib/review/rewrite-uniqueness-era-skip";
import {
  isPadelGripCategory,
  isPadelRacketCategory,
  isPadelShoeCategory,
  type PadelLongformTopic,
} from "@/lib/review/padel-review-outline";
import { sanitizePadelPublicText } from "@/lib/review/padel-review-copy";
import { buildRacketEditorialProfile } from "@/lib/review/padel-editorial-profile";
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";
import { hasMeaningfulSpecValue } from "@/content/padel/spec-enrichment/types";

function joinParas(...parts: Array<string | false | undefined | null>): string {
  return parts
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim())
    .join("\n\n");
}

function asText(raw: SpecValue): string {
  if (typeof raw === "boolean") return raw ? "yes" : "no";
  if (typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "object" && raw !== null && "min" in raw) {
    const r = raw as { min: number; max: number };
    return `${r.min}–${r.max}`;
  }
  return String(raw);
}

function spec(product: Product, key: string): string | undefined {
  const raw = product.specifications[key];
  if (raw === null || raw === undefined) return undefined;
  if (Array.isArray(raw) && raw.length === 0) return undefined;
  // Internal sentinel terminals must never enter reader-facing prose.
  if (!hasMeaningfulSpecValue(raw as SpecValue)) return undefined;
  const text = asText(raw as SpecValue);
  if (!hasMeaningfulSpecValue(text)) return undefined;
  return text;
}

function pretty(value: string): string {
  return value.replace(/[-_]/g, " ");
}

export function padelSpecLines(product: Product): string[] {
  const keys = isPadelRacketCategory(product.categoryId)
    ? [
        "shape",
        "balance",
        "weightMin",
        "weightMax",
        "thicknessMm",
        "core",
        "manufacturerCoreName",
        "face",
        "faceCarbonWeave",
        "surfaceTexture",
        "feel",
        "sweetSpot",
        "playerLevel",
      ]
    : isPadelShoeCategory(product.categoryId)
      ? [
          "outsole",
          "courtOutsole",
          "tractionPattern",
          "lateralStability",
          "courtFeel",
          "cushioning",
          "support",
          "upper",
          "genderFit",
          "surface",
        ]
      : [
          "gripType",
          "thickness",
          "tack",
          "absorption",
          "feel",
          "packQuantity",
        ];
  const lines: string[] = [];
  for (const key of keys) {
    const value = spec(product, key);
    if (!value) continue;
    lines.push(`• ${formatPublicSpecDisplayLabel(key)}: ${value}`);
  }
  return lines;
}

// Geometry narrative lives in buildRacketEditorialProfile.

export function buildPadelLongformSectionBody(
  topic: PadelLongformTopic | string,
  product: Product,
  review: Review,
): string {
  return sanitizePadelPublicText(buildPadelLongformSectionBodyRaw(topic, product, review));
}

function buildPadelLongformSectionBodyRaw(
  topic: PadelLongformTopic | string,
  product: Product,
  review: Review,
): string {
  const name = product.fullName;
  const copy = getPadelRacketPdpCopy(product.id);
  const draft = getPadelRacketDraft(product.id);
  const strengths = [
    ...(review.pros ?? []),
    ...(product.strengths ?? []),
  ].filter(Boolean);
  const weaknesses = [
    ...(review.cons ?? []),
    ...(product.weaknesses ?? []),
  ].filter(Boolean);
  const buy = review.whoShouldBuy ?? [];
  const avoid = review.whoShouldAvoid ?? [];
  const lines = padelSpecLines(product);

  if (isPadelShoeCategory(product.categoryId)) {
    return shoeBody(topic, product, review, { strengths, weaknesses, buy, avoid, lines });
  }
  if (isPadelGripCategory(product.categoryId)) {
    return gripBody(topic, product, review, { strengths, weaknesses, buy, avoid, lines });
  }
  if (!isPadelRacketCategory(product.categoryId)) {
    // Bags / balls / accessories — prefer seed + short product-specific notes.
    return softGoodsBody(topic, product, review, { strengths, weaknesses, buy, avoid, lines });
  }

  const attr = (key: string) => draft?.attributes[key as keyof typeof draft.attributes];
  const profile = buildRacketEditorialProfile(product);

  switch (topic) {
    case "overview":
      return joinParas(
        copy?.whatItIs ?? product.shortDescription,
        product.verdict ?? review.verdict,
        profile.jobLine,
        buy.length ? buy.slice(0, 3).join(" ") : undefined,
        avoid.length ? avoid.slice(0, 2).join(" ") : undefined,
        review.bottomLine ? `Bottom line: ${review.bottomLine}` : undefined,
      );
    case "usecase":
      return joinParas(
        copy?.bestFor?.length
          ? copy.bestFor.map((item) => `• ${item}`).join("\n")
          : buy.length
            ? buy.map((item) => `• ${item}`).join("\n")
            : profile.jobLine,
        copy?.howItPlays,
      );
    case "tradeoffs":
      return joinParas(
        copy?.skipIf?.length
          ? copy.skipIf.join(" ")
          : avoid.length
            ? avoid.join(" ")
            : `Skip the ${name} when its published limits on ${profile.geometryLine} show up twice a week.`,
        copy?.notIdealFor?.length
          ? `Not ideal for: ${copy.notIdealFor.join("; ")}`
          : undefined,
        weaknesses.length
          ? skipSentenceFromLimitation(weaknesses.slice(0, 3).join("; "))
          : undefined,
        profile.peerAdvice,
      );
    case "construction":
      return joinParas(
        copy?.construction ??
          `Construction on the ${name} is the published stack: ${profile.stackLine}.`,
        spec(product, "thicknessMm")
          ? `Listed thickness is ${spec(product, "thicknessMm")} mm — the adult padel standard.`
          : undefined,
        spec(product, "technologies")
          ? `Named systems on the sheet: ${spec(product, "technologies")}. Treat those as manufacturer labels, not a Kitletics lab list.`
          : undefined,
      );
    case "shape":
      return joinParas(
        `Shape and balance on the ${name}: ${profile.geometryLine}.`,
        copy?.handling ?? copy?.powerVsControl,
        profile.sweetSpot
          ? `Published sweet-spot note: ${pretty(profile.sweetSpot)}.`
          : undefined,
        profile.shape === "diamond"
          ? `On this ${profile.stackLine} diamond, expect a higher hitting zone and a later swing tax than a round sibling.`
          : profile.shape === "round"
            ? `On this ${profile.stackLine} round, expect a more usable centred face when defending or still building clean contact.`
            : profile.shape === "hybrid" || profile.shape === "teardrop"
              ? `On this ${profile.geometryLine} hybrid/teardrop, check published balance before you assume ‘all-court’ means light.`
              : undefined,
      );
    case "power":
      return joinParas(
        profile.powerLine,
        attr("power")?.reasoning,
      );
    case "control":
      return joinParas(
        profile.controlLine,
        attr("control")?.reasoning,
      );
    case "sweetspot":
    case "forgiveness":
      return joinParas(
        profile.forgivenessLine,
        attr("forgiveness")?.reasoning,
      );
    case "maneuverability":
      return joinParas(
        copy?.handling ??
          `Handling on the ${name}: ${profile.geometryLine}${profile.faceWeave ? ` with ${profile.faceWeave}` : ""}.`,
        attr("maneuverability")?.reasoning,
        profile.balance === "high"
          ? `With ${profile.geometryLine}, preparation comes later on fast glass balls than on a low-balance round — reaction volleys need earlier setup.`
          : profile.balance === "low"
            ? `With ${profile.geometryLine}, preparation and defensive resets come easier — the trade-off is less plow-through on hard overheads than a tip-heavy diamond.`
            : undefined,
      );
    case "comfort":
      return joinParas(
        copy?.comfort ??
          (profile.core
            ? `Comfort on the ${name} tracks the published ${profile.core} core story on ${profile.geometryLine} — preference, not an arm diagnosis.`
            : `Comfort on the ${name} (${profile.geometryLine}) is a manufacturer touch claim — not an arm-injury diagnosis.`),
        attr("comfort")?.reasoning,
      );
    case "spin":
      return joinParas(
        profile.surface
          ? `Published face texture on the ${name}: ${pretty(profile.surface)}${profile.faceWeave ? ` over ${profile.faceWeave}` : profile.face ? ` over ${profile.face}` : ""}.`
          : `Spin on the ${name} follows the published face grain on ${profile.geometryLine}, not a dwell-time lab.`,
        attr("spin")?.reasoning,
      );
    case "defense":
      return joinParas(
        profile.defenseLine,
        copy?.forgiveness,
      );
    case "net":
      return joinParas(
        copy?.handling ?? copy?.howItPlays,
        profile.balance === "high"
          ? `At the net, the ${name}’s ${profile.geometryLine} can feel late unless you already sit on the line.`
          : `Net play on the ${name} wants preparation speed — published context is ${profile.geometryLine}.`,
        attr("maneuverability")?.reasoning,
      );
    case "attack":
      return joinParas(
        profile.attackLine,
        attr("power")?.reasoning,
      );
    case "serve":
      return joinParas(
        `Serve and return on the ${name} follow ${profile.geometryLine}${profile.faceWeave ? ` / ${profile.faceWeave}` : ""}.`,
        copy?.handling,
      );
    case "strengths":
      return joinParas(
        copy?.bestFor?.length
          ? copy.bestFor.map((item) => `• ${item}`).join("\n")
          : strengths.slice(0, 5).map((item) => `• ${item}`).join("\n"),
      );
    case "weaknesses":
      return joinParas(
        weaknesses.length
          ? weaknesses.map((item) => `• ${item}`).join("\n")
          : `The honest limit on the ${name} is the published job (${profile.geometryLine}): this mould will not cover every pair role.`,
        copy?.skipIf?.length ? copy.skipIf.join(" ") : undefined,
      );
    case "bestFor":
      return joinParas(
        copy?.bestFor?.length
          ? copy.bestFor.map((item) => `• ${item}`).join("\n")
          : buy.slice(0, 4).map((item) => `• ${item}`).join("\n"),
        copy?.whoItsFor,
      );
    case "notIdeal":
      return joinParas(
        copy?.notIdealFor?.length
          ? copy.notIdealFor.map((item) => `• ${item}`).join("\n")
          : avoid.slice(0, 4).map((item) => `• ${item}`).join("\n"),
        profile.peerAdvice,
      );
    case "alternatives":
      return joinParas(
        profile.peerAdvice,
        copy?.skipIf?.[0],
      );
    case "comparisons":
      return joinParas(
        `Useful comparisons for the ${name} start from ${profile.geometryLine}${profile.faceWeave ? ` / ${profile.faceWeave}` : ""} — usually the sibling mould in this family, not a previous generation listed as if it were new.`,
        review.comparisonIds?.length
          ? `This review links ${review.comparisonIds.length} comparison page${review.comparisonIds.length === 1 ? "" : "s"} for that job.`
          : `There is no dedicated comparison page attached yet. Read the alternatives and the peer PDPs for the ${name}.`,
      );
    case "specs":
      return joinParas(
        `Published numbers for the ${name}:`,
        lines.length ? lines.join("\n") : `The catalog does not invent missing measurements.`,
        `Weight, balance, shape, core and face are filters. Demo when you can, or buy somewhere returns are easy.`,
      );
    case "value":
      return joinParas(
        `Value on the ${name} is whether ${profile.geometryLine}${profile.core ? ` / ${profile.core}` : ""} matches your week — not whether the paint looks like a flagship.`,
        `Street price moves; the mould does not. If a sibling wins your weekly problem for less, take that.`,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `This is a Kitletics Expert Research review: manufacturer specs, positioning and specialist listings — not a first-hand court test of the ${name}.`,
        `Affiliate relationships never change the mould advice above.`,
      );
    case "sources":
      return joinParas(
        draft?.sourceName
          ? `Primary manufacturer source: ${draft.sourceName}.`
          : `Manufacturer pages and specialist listings on the evidence list.`,
        `No invented smash speeds or fake user scores.`,
      );
    default:
      return joinParas(
        copy?.howItPlays ?? copy?.whoItsFor ?? product.shortDescription,
        profile.jobLine,
      );
  }
}

/** Bags / balls / accessories — short product-specific notes, never running longform glue. */
function softGoodsBody(
  topic: string,
  product: Product,
  review: Review,
  ctx: {
    strengths: string[];
    weaknesses: string[];
    buy: string[];
    avoid: string[];
    lines: string[];
  },
): string {
  const name = product.fullName;
  switch (topic) {
    case "overview":
      return joinParas(
        product.shortDescription,
        product.verdict ?? review.verdict,
        review.bottomLine ? `Bottom line: ${review.bottomLine}` : undefined,
      );
    case "specs":
      return joinParas(
        `Published markers for the ${name}:`,
        ctx.lines.length ? ctx.lines.join("\n") : product.shortDescription,
      );
    case "performance":
    case "tech":
    case "fit":
    case "durability":
      return joinParas(
        product.shortDescription,
        ctx.strengths[0]
          ? `What matters on the ${name}: ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}.`
          : undefined,
        ctx.weaknesses[0]
          ? skipSentenceFromLimitation(ctx.weaknesses[0])
          : undefined,
      );
    case "strengths":
      return joinParas(
        ctx.strengths.length
          ? ctx.strengths.map((item) => `• ${item}`).join("\n")
          : `• ${product.shortDescription}`,
      );
    case "tradeoffs":
    case "weaknesses":
      return joinParas(
        ctx.avoid.length
          ? ctx.avoid.join(" ")
          : ctx.weaknesses.map((w) => `• ${w}`).join("\n"),
      );
    case "usecase":
    case "bestFor":
      return joinParas(
        ctx.buy.length
          ? ctx.buy.map((item) => `• ${item}`).join("\n")
          : product.shortDescription,
      );
    case "notIdeal":
      return joinParas(
        ctx.avoid.length
          ? ctx.avoid.map((item) => `• ${item}`).join("\n")
          : undefined,
      );
    case "value":
      return joinParas(
        `Value on the ${name} is whether ${product.shortDescription?.split(/[.!?]/)[0] ?? "its published job"} matches your week. Check live offers.`,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `Expert-research accessory note on the ${name}. Not a Kitletics hitting test.`,
      );
    case "sources":
      return joinParas(
        `Manufacturer pack copy and specialist listings for the ${name}. No fake user scores.`,
      );
    default:
      return joinParas(product.shortDescription, review.verdict);
  }
}

function shoeBody(
  topic: string,
  product: Product,
  review: Review,
  ctx: {
    strengths: string[];
    weaknesses: string[];
    buy: string[];
    avoid: string[];
    lines: string[];
  },
): string {
  const name = product.fullName;
  const outsole = spec(product, "outsole") ?? spec(product, "courtOutsole");
  const traction = spec(product, "tractionPattern");
  const lateral = spec(product, "lateralStability");
  const feel = spec(product, "courtFeel");
  const cushion = spec(product, "cushioning");
  const support = spec(product, "support");
  const upper = spec(product, "upper");
  const surface = spec(product, "surface");
  const outsoleLabel = outsole ? pretty(outsole) : "listed court rubber";
  const supportLabel = support ?? lateral ?? "court stability last";

  switch (topic) {
    case "overview":
      return joinParas(
        product.shortDescription,
        product.verdict ?? review.verdict,
        `I'd judge the ${name} on ${outsoleLabel}, ${supportLabel}, and whether the last survives split-step work on sand-filled turf — not as a daily trainer.`,
        review.bottomLine ? `Bottom line: ${review.bottomLine}` : undefined,
      );
    case "specs":
      return joinParas(
        `Published court-shoe markers for the ${name}:`,
        ctx.lines.length
          ? ctx.lines.join("\n")
          : `Stick to the listed outsole, support and cushioning on the ${name} — we do not invent stack heights.`,
      );
    case "traction":
    case "grip":
      return joinParas(
        `Traction on the ${name} is a court job: ${[
          outsole ? pretty(outsole) : null,
          traction ? pretty(traction) : null,
          surface ? pretty(surface) : null,
        ]
          .filter(Boolean)
          .join(", ") || "padel / court rubber as listed"}.`,
        ctx.weaknesses.some((w) => /grip|slip/i.test(w))
          ? `Grip caveat on the ${name}: ${ctx.weaknesses.filter((w) => /grip|slip/i.test(w)).join("; ")}.`
          : `I'd replace the ${name} when the ${outsoleLabel} pods go shiny on the first-step and recovery zones.`,
      );
    case "stability":
      return joinParas(
        `Lateral stability is why you buy the ${name}. Listed support: ${supportLabel}.`,
        ctx.strengths[0]
          ? `The stability-related reason to shortlist the ${name}: ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}.`
          : `You need a wide enough base and a locked midfoot on the ${name} for side-to-side and the split step.`,
      );
    case "courtFeel":
    case "ride":
      return joinParas(
        `Court feel on the ${name} is listed as ${feel ?? "not a running-ride character"} with ${outsoleLabel} underfoot — enough turf feedback to plant, not a max-cushion road bounce.`,
      );
    case "cushioning":
      return joinParas(
        `Cushioning on the ${name} is listed as ${cushion ?? "moderate / court"}${ctx.strengths[0] ? ` — relevant because ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}` : ""} for landing from jumps and long turf sessions, not 20 km easy runs.`,
      );
    case "support":
      return joinParas(
        `Support on the ${name}: ${supportLabel}${upper ? `; upper ${pretty(upper)}` : ""}${ctx.strengths[0] ? ` — shortlist reason: ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}` : ""}.`,
      );
    case "fit":
      return joinParas(
        `Fit the ${name} for court work: try a split-step and a lateral cut${spec(product, "genderFit") ? ` (${pretty(spec(product, "genderFit")!)} last)` : ""}${outsole ? ` over ${pretty(outsole)}` : ""}, not an easy jog around the shop.`,
      );
    case "durability":
      return joinParas(
        `Durability on the ${name} is ${outsoleLabel} pods plus overlay wear from sand and lunges — we have not logged a mileage diary.`,
      );
    case "comfort":
      return joinParas(
        `Comfort on the ${name} (${outsoleLabel}, ${cushion ?? "court foam"}${support ? `, ${support}` : ""}) is lockdown without hot spots after a match${ctx.strengths[0] ? ` — shortlist reason: ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}` : ""}.`,
        ctx.buy.length ? `Players this last is aimed at: ${ctx.buy.slice(0, 2).join(" ")}` : undefined,
      );
    case "strengths":
      return joinParas(
        ctx.strengths.length
          ? ctx.strengths.slice(0, 6).map((item) => `• ${item}`).join("\n")
          : `• Court-specific outsole and lateral brief on the ${name}`,
      );
    case "tradeoffs":
      return joinParas(
        ctx.avoid.length ? ctx.avoid.join(" ") : ctx.weaknesses.map((w) => `• ${w}`).join("\n"),
        `Skip the ${name} if you needed a running shoe or a lighter match-day racer with less lateral structure than ${supportLabel}.`,
      );
    case "usecase":
      return joinParas(
        ctx.buy.length ? ctx.buy.join(" ") : product.shortDescription,
        `Best use for the ${name}: sand-filled padel turf and indoor court sessions${surface ? ` (${pretty(surface)})` : ""}.`,
      );
    case "value":
      return joinParas(
        `Pay for the ${name} when you play often enough to wear out ${outsoleLabel} pods${ctx.strengths[0] ? ` and still want ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}` : ""}.`,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `Expert-research court-shoe guide. We have not physically tested the ${name} unless the page says so.`,
        `We do not score the ${name} with running-shoe criteria alone.`,
      );
    case "sources":
      return joinParas(
        `Manufacturer and specialist court listings for the ${name} on the product evidence list. No invented user ratings.`,
      );
    default:
      return joinParas(product.shortDescription, review.verdict);
  }
}

function gripBody(
  topic: string,
  product: Product,
  review: Review,
  ctx: {
    strengths: string[];
    weaknesses: string[];
    buy: string[];
    avoid: string[];
    lines: string[];
  },
): string {
  const name = product.fullName;
  const type = spec(product, "gripType");
  switch (topic) {
    case "overview":
      return joinParas(
        product.shortDescription,
        product.verdict ?? review.verdict,
        type
          ? `This is a ${pretty(type)} — not a racket review and not a medical device.`
          : undefined,
        review.bottomLine,
      );
    case "specs":
      return joinParas(
        `Published wrap markers:`,
        ctx.lines.join("\n"),
        `Thickness and tack change handle size. A cushion replacement is not an overgrip 3-pack.`,
      );
    case "fit":
      return joinParas(
        `Wrap the ${name} the way you play: overlapping overgrip vs a one-time replacement that changes handle shape.`,
        spec(product, "thickness")
          ? `Listed thickness / feel: ${spec(product, "thickness")}.`
          : undefined,
        `If you already sit at the top of a grip size, a thick cushion will jump you a size. Overgrips are the smaller change.`,
      );
    case "comfort":
      return joinParas(
        `Comfort here is tack, sweat and whether the handle still feels like the same size after 40 minutes.`,
        `No injury or 'tennis elbow cure' claims. A structured cushion changes geometry; it does not treat a medical condition.`,
      );
    case "durability":
      return joinParas(
        `Overgrips are consumables. Replace when tack dies or the wrap rolls — often every few humid sessions.`,
        `Replacement grips last longer and then get an overgrip on top. That is ownership, not a durability trophy.`,
      );
    case "strengths":
      return joinParas(
        ctx.strengths.map((item) => `• ${item}`).join("\n"),
        ctx.buy.length ? ctx.buy.join(" ") : undefined,
      );
    case "tradeoffs":
      return joinParas(
        ctx.avoid.length ? ctx.avoid.join(" ") : ctx.weaknesses.join(" "),
        `Skip it if you needed the other job: thin overgrip vs structured replacement.`,
      );
    case "usecase":
      return joinParas(
        product.shortDescription,
        ctx.buy.length ? ctx.buy.join(" ") : undefined,
      );
    case "value":
      return joinParas(
        `3-packs are the usual value unit for overgrips. A Hesacore-type replacement is a different spend — buy it for handle shape, not because it is 'premium.'`,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `Expert-research accessory note. Not a Kitletics hitting test.`,
      );
    case "sources":
      return joinParas(
        `Manufacturer pack copy and specialist listings on the evidence list. No fake user scores.`,
      );
    default:
      return joinParas(product.shortDescription);
  }
}

export function extendPadelLongformSectionBody(
  _topic: PadelLongformTopic | string,
  _product: Product,
  _review: Review,
  _pass = 1,
): string {
  // Intentionally empty: word-count deepen glue ("I'd only keep…",
  // "If this section still feels generic…") was the editorial FAIL mode.
  // Product-specific analysis belongs in buildPadelLongformSectionBody.
  return "";
}

/** Shopper-facing focus phrase for a review section topic — never the schema key. */
export function padelTopicBuyerFocus(topic: string): string {
  const map: Record<string, string> = {
    courtFeel: "a firmer, more connected feel underfoot",
    traction: "reliable grip on your usual court surface",
    stability: "lateral stability on sharp glass-court cuts",
    cushioning: "cushioning that lasts through long sessions",
    support: "supportive lockdown through the midfoot",
    fit: "a fit that matches how you like the last to hold",
    durability: "durability that survives weekly club nights",
    comfort: "all-session comfort without hotspots",
    overview: "the overall job this model is meant to win",
    usecase: "the weekly use case you actually have",
    tradeoffs: "the trade-offs you can live with",
    strengths: "the strengths you would pay for",
    value: "the value story versus peers",
    specs: "the listed specs that matter to your sessions",
    methodology: "how we assessed this model",
    sources: "the evidence behind the assessment",
    construction: "the construction story",
    shape: "shape and balance on court",
    power: "the power profile you want",
    control: "the control profile you want",
    sweetspot: "forgiveness in the sweet spot",
    maneuverability: "how quickly the frame turns",
    spin: "spin potential on the face",
    defense: "defensive play behind the glass",
    net: "net-play response",
    attack: "attacking smash / bandeja work",
    serve: "serve and return roles",
    bestFor: "who this is actually for",
    notIdeal: "who should skip it",
    alternatives: "the alternatives worth comparing",
    comparisons: "the peer comparisons",
  };
  if (map[topic]) return map[topic];
  const spoken = formatPublicSpecDisplayLabel(topic).toLowerCase();
  return spoken.includes(" ") ? spoken : `the ${spoken} role`;
}

export function mergePadelSeed(
  seed: string,
  topic: string,
  product: Product,
  review: Review,
): string {
  const generated = buildPadelLongformSectionBody(topic, product, review);
  const clean = seed.trim();
  if (!clean) return generated;
  if (clean.split(/\s+/).length >= 180) return clean;
  const seedLead = clean.split(/\n\n+/)[0] ?? clean;
  if (generated.startsWith(seedLead)) return generated;
  return joinParas(clean, generated);
}

/** Map a padel blueprint topic onto the longform union used by the enricher. */
export function asLongformTopic(topic: PadelLongformTopic | string): string {
  return topic;
}

export function padelSectionsNeedCourtBlueprint(
  product: Product,
  _review: Review,
): boolean {
  return (
    isPadelRacketCategory(product.categoryId) ||
    isPadelShoeCategory(product.categoryId) ||
    isPadelGripCategory(product.categoryId)
  );
}
