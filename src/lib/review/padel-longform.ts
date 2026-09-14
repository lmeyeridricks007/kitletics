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
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";

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
  return asText(raw as SpecValue);
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

function racketGeometry(product: Product): string {
  const shape = spec(product, "shape");
  const balance = spec(product, "balance");
  const min = spec(product, "weightMin");
  const max = spec(product, "weightMax");
  const bits = [
    shape ? `${pretty(shape)} mould` : null,
    balance ? `${pretty(balance)} balance` : null,
    min && max ? `${min}–${max} g published band` : min ? `${min} g` : null,
  ].filter(Boolean);
  return bits.join(", ");
}

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
  const geometry = racketGeometry(product);
  const lines = padelSpecLines(product);

  if (isPadelShoeCategory(product.categoryId)) {
    return shoeBody(topic, product, review, { strengths, weaknesses, buy, avoid, lines });
  }
  if (isPadelGripCategory(product.categoryId)) {
    return gripBody(topic, product, review, { strengths, weaknesses, buy, avoid, lines });
  }

  const attr = (key: string) => draft?.attributes[key as keyof typeof draft.attributes];

  switch (topic) {
    case "overview":
      return joinParas(
        copy?.whatItIs ?? product.shortDescription,
        product.verdict ?? review.verdict,
        copy?.whoItsFor,
        buy.length ? `I'd shortlist it when: ${buy.slice(0, 3).join(" ")}` : undefined,
        avoid.length ? `I'd pause if: ${avoid.slice(0, 2).join(" ")}` : undefined,
        review.bottomLine ? `Bottom line: ${review.bottomLine}` : undefined,
      );
    case "usecase":
      return joinParas(
        copy?.whoItsFor ?? `I'd buy the ${name} when its published job matches most of your weeks.`,
        copy?.bestFor?.length
          ? `Best for: ${copy.bestFor.join(" ")}`
          : buy.length
            ? buy.join(" ")
            : undefined,
        copy?.howItPlays,
        `This is a buying filter, not a promise that the ${name} covers every pair role. If your partner already finishes and you live on the glass, pick the sibling built for that job.`,
      );
    case "tradeoffs":
      return joinParas(
        copy?.skipIf?.length
          ? copy.skipIf.join(" ")
          : avoid.length
            ? avoid.join(" ")
            : `Skip the ${name} when its published limits show up twice a week.`,
        copy?.notIdealFor?.length
          ? `Not ideal for: ${copy.notIdealFor.join(" ")}`
          : undefined,
        weaknesses.length
          ? skipSentenceFromLimitation(weaknesses.slice(0, 3).join("; "))
          : undefined,
        `I'd rather own a round beginner stick or a dedicated attacker than force this mould into the wrong week.`,
      );
    case "construction":
      return joinParas(
        copy?.construction ??
          `Construction on the ${name} is the published stack: ${[
            spec(product, "face"),
            spec(product, "core") ?? spec(product, "manufacturerCoreName"),
            spec(product, "frameMaterial"),
          ]
            .filter(Boolean)
            .join(", ")}.`,
        spec(product, "thicknessMm")
          ? `Listed thickness is ${spec(product, "thicknessMm")} mm — the adult padel standard, not a kids' frame.`
          : undefined,
        spec(product, "technologies")
          ? `Named systems on the sheet: ${spec(product, "technologies")}. Treat those as manufacturer labels, not a Kitletics lab list.`
          : undefined,
        `I'd use construction to separate families — Vertex vs Hack, Genius vs Attack, Metalbone vs Cross It — not to invent a feel score.`,
      );
    case "shape":
      return joinParas(
        geometry
          ? `Shape and balance on the ${name}: ${geometry}.`
          : `Confirm shape and balance on the ${name} against what you play now before you trust the model name.`,
        copy?.handling ?? copy?.powerVsControl,
        spec(product, "sweetSpot")
          ? `Published sweet-spot note: ${pretty(spec(product, "sweetSpot")!)}.`
          : undefined,
        `Diamond usually means a higher hitting zone and a later swing tax. Round or hybrid usually means more usable face when you are defending. Teardrop sits between those jobs.`,
      );
    case "power":
      return joinParas(
        copy?.powerVsControl ?? copy?.howItPlays,
        attr("power")?.reasoning,
        `Power here is inferred from shape, face, core and weight — not a smash-speed test. If finishing is the whole job, compare the dedicated attack sibling in the same brand rather than hoping this mould suddenly becomes XPLO or Hack.`,
        strengths[0]
          ? `The power-related reason this stays on a shortlist is ${strengths[0].charAt(0).toLowerCase()}${strengths[0].slice(1)}.`
          : undefined,
      );
    case "control":
      return joinParas(
        copy?.powerVsControl ?? copy?.howItPlays,
        attr("control")?.reasoning,
        `Control on padel is placement off the glass, bandeja height and whether you can keep the ball on your terms at the net. A stiff 18K diamond can still 'control' if you already time it; it will not teach timing.`,
        copy?.whoItsFor,
      );
    case "sweetspot":
    case "forgiveness":
      return joinParas(
        copy?.forgiveness ??
          `Forgiveness on the ${name} follows the published sweet-spot and player-level notes — not a beginner round frame unless the sheet says so.`,
        attr("forgiveness")?.reasoning,
        spec(product, "playerLevel")
          ? `Manufacturer player level is ${pretty(spec(product, "playerLevel")!)}. That is the first filter if you still miss the centre.`
          : undefined,
        `If you need a large, low, soft face, look at Indiga, Comfort Soft, Equation Soft or an ML10-class round — not a professional diamond.`,
      );
    case "maneuverability":
      return joinParas(
        copy?.handling ??
          (geometry
            ? `Handling context: ${geometry}.`
            : `Confirm published weight and balance on the ${name} before you assume it is 'light.'`),
        attr("maneuverability")?.reasoning,
        `Maneuverability on padel is reaction volleys and getting the face on a fast glass ball — not tennis swingweight. A 365 g diamond can still feel slow if the balance is high.`,
      );
    case "comfort":
      return joinParas(
        copy?.comfort ??
          `Comfort on the ${name} is a manufacturer touch claim plus vibration systems on the sheet — not an arm-injury diagnosis.`,
        attr("comfort")?.reasoning,
        `If elbow or shoulder already complains after hard weeks, start with a SoftEva / Comfort / round option and a sensible overgrip. Do not buy a 12K diamond to 'get used to it.'`,
      );
    case "spin":
      return joinParas(
        spec(product, "surfaceTexture")
          ? `Published face texture: ${pretty(spec(product, "surfaceTexture")!)}.`
          : `Spin on the ${name} follows the published face grain, not a dwell-time lab.`,
        attr("spin")?.reasoning,
        `Rough sand or 3D grain helps slice and bandeja bite when the swing is already clean. It will not create spin on a flat amateur contact.`,
      );
    case "defense":
      return joinParas(
        copy?.howItPlays,
        spec(product, "shape") === "round" || spec(product, "shape") === "hybrid"
          ? `This mould is the more usable defensive shape in its family. I'd still check the published weight — a heavy hybrid is not an Indiga.`
          : `A ${spec(product, "shape") ?? "diamond"} attacker is usually the wrong first pick if you live two metres behind the glass. Look at the round or hybrid sibling.`,
        copy?.forgiveness,
        `Defence is getting the ball back with height and time. If that is 70% of your points, buy forgiveness and manoeuvrability before smash rating.`,
      );
    case "net":
      return joinParas(
        copy?.handling ?? copy?.howItPlays,
        `Net play on padel is volley preparation, block returns and the first finishing window. High-balance diamonds can feel late unless you already sit on the line.`,
        attr("maneuverability")?.reasoning,
        `I'd demo a few games at the net if you can — catalog weight will not tell you whether the head comes around on a fast body volley.`,
      );
    case "attack":
      return joinParas(
        copy?.powerVsControl ?? copy?.howItPlays,
        spec(product, "shape") === "diamond"
          ? `This is the attacking shape in the family. I'd still match it to a player who already finishes — a diamond does not teach the smash.`
          : `If smashes are the whole identity, compare the diamond attacker in this brand. This mould is the more all-court or control sibling.`,
        attr("power")?.reasoning,
        `Attacking play is also the bandeja and víbora, not only the match-ball smash. Read the manufacturer style line before you buy a 'power' sticker.`,
      );
    case "serve":
      return joinParas(
        `Serve and return on the ${name} follow the same geometry as the rest of the court: ${geometry || "published shape, balance and weight"}.`,
        copy?.handling,
        `A high-balance diamond can help a heavy serve if you already throw the ball up and hit up. It will punish a short toss. Returns want a usable face — another reason beginners should not start here.`,
        `This page does not log Kitletics serve speeds. Use the published mould and a demo return game.`,
      );
    case "strengths":
      return joinParas(
        copy?.bestFor?.length
          ? copy.bestFor.map((item) => `• ${item}`).join("\n")
          : strengths.slice(0, 5).map((item) => `• ${item}`).join("\n"),
        copy?.whatItIs,
        `If none of those jobs show up most weeks, a cheaper or more forgiving peer will feel like a better buy even when this product is the 'flagship.'`,
      );
    case "weaknesses":
      return joinParas(
        weaknesses.length
          ? weaknesses.map((item) => `• ${item}`).join("\n")
          : `The honest limit is the published job: this mould will not cover every pair role.`,
        copy?.skipIf?.length ? copy.skipIf.join(" ") : undefined,
        `I'd rather name those limits than pretend the ${name} is a round beginner stick and a smash diamond at once.`,
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
        `If that is most of your week, pick the sibling or the linked alternative instead of forcing this mould.`,
      );
    case "alternatives":
      return joinParas(
        `If the ${name} is the wrong weekly job, switch families rather than hoping paint or a sale will rewrite the mould.`,
        copy?.skipIf?.[0],
        `Use the alternatives on this page: a more forgiving round/hybrid, a dedicated attacker, or a labelled previous generation when the current flagship is the wrong spend.`,
      );
    case "comparisons":
      return joinParas(
        `A comparison page is useful when two current models share a shopper question — Vertex vs Hack, Genius teardrop vs Vertex diamond, not a previous-gen listed as if it were new.`,
        review.comparisonIds?.length
          ? `This review links ${review.comparisonIds.length} comparison page${review.comparisonIds.length === 1 ? "" : "s"} for that job.`
          : `There is no dedicated comparison page attached yet. Read the alternatives and the peer PDPs rather than inventing a universal winner.`,
      );
    case "specs":
      return joinParas(
        `Published numbers for the ${name}:`,
        lines.length ? lines.join("\n") : `The catalog does not invent missing measurements.`,
        `Weight, balance, shape, core and face are filters. They will not tell you whether you time a diamond after two hours.`,
        `Demo when you can, or buy somewhere returns are easy.`,
      );
    case "value":
      return joinParas(
        `You are paying for the current ${name} job — not last year's paint and not a beginner round unless that is this model.`,
        copy?.skipIf?.[0],
        `Check live street price in the offers module. I'd pay flagship money when the mould matches your week; otherwise compare the linked alternatives or a labelled previous generation.`,
        avoid.length ? `Weaker value when: ${avoid.slice(0, 2).join(" ")}` : undefined,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `This is an expert-research guide. We have not physically tested the ${name} unless a personal-test note says so. Scores come from published specs, manufacturer positioning and adjacent products in the same job.`,
        `Affiliate links do not change the verdict. Manufacturer marketing alone is not treated as comfort, durability or on-court proof.`,
      );
    case "sources":
      return joinParas(
        draft
          ? `Primary manufacturer / specialist listing used for this model: ${draft.sourceName}. ${draft.sourceUrl}`
          : `Sources sit on the product evidence list — manufacturer sheets and editorial synthesis, not a Kitletics on-court diary.`,
        `Independent hitting notes from other sites are not copied as if they were ours. If a claim is only marketing, the copy says so.`,
      );
    default:
      return joinParas(
        copy?.howItPlays ?? product.shortDescription,
        copy?.whoItsFor,
        review.bottomLine,
      );
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

  switch (topic) {
    case "overview":
      return joinParas(
        product.shortDescription,
        product.verdict ?? review.verdict,
        `This is a padel court shoe, not a daily trainer. I'd judge it on herringbone or omni grip, lateral hold and whether the last survives split-step and recovery steps on sand-filled turf.`,
        review.bottomLine ? `Bottom line: ${review.bottomLine}` : undefined,
      );
    case "specs":
      return joinParas(
        `Published court-shoe markers for the ${name}:`,
        ctx.lines.length ? ctx.lines.join("\n") : `Stick to the listed outsole, support and cushioning — we do not invent stack heights.`,
        `These are not running-shoe drop and heel-stack numbers. If a listing only says 'court rubber,' treat that as a category tag, not a traction map.`,
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
        `Padel turf with sand wants a herringbone or omni pattern that can still plant on a lateral cut. Road foam and trail lugs are the wrong test.`,
        `I'd replace the pair when the pods go shiny on the first-step and recovery zones — not when the upper still looks new.`,
        ctx.weaknesses.some((w) => /grip|grip|slip/i.test(w))
          ? `Grip caveat: ${ctx.weaknesses.filter((w) => /grip|slip/i.test(w)).join("; ")}.`
          : undefined,
      );
    case "stability":
      return joinParas(
        `Lateral stability is the reason you buy a padel shoe. Listed support on the ${name}: ${support ?? lateral ?? "stability-oriented court last"}.`,
        `This is not running 'neutral vs Kayano.' You need a wide enough base and a locked midfoot for side-to-side and the split step. A tall soft running stack is usually a worse padel platform.`,
        ctx.strengths[0]
          ? `The stability-related reason to shortlist it: ${ctx.strengths[0].charAt(0).toLowerCase()}${ctx.strengths[0].slice(1)}.`
          : undefined,
      );
    case "courtFeel":
    case "ride":
      return joinParas(
        `Court feel on the ${name} is listed as ${feel ?? "not a running-ride character"}. You want to feel the turf well enough to plant, not bounce like a max-cushion road shoe.`,
        `Connected / moderate court feel usually helps directional changes. Plush Boost-class foam can still work if the outsole and last stay planted — it is a different trade than a daily trainer.`,
        `I'd not evaluate this with marathon stack language. If you wanted a running shoe, this page would be the wrong review.`,
      );
    case "cushioning":
      return joinParas(
        `Cushioning is listed as ${cushion ?? "moderate / court"}. On padel that is landing from jumps and long sessions on turf, not 20 km easy runs.`,
        `Too little and your knees pay after the third match. Too much and you lose first-step certainty. Match the foam to how often you play, not to a road-shoe ranking.`,
        `We have not logged personal court hours on this model. Treat cushioning notes as research from the listed foam family, not a session count we logged.`,
      );
    case "support":
      return joinParas(
        `Support on the ${name}: ${support ?? lateral ?? "court stability last"}. Look for midfoot lockdown and a heel that does not roll when you plant and cut.`,
        upper ? `Upper construction marker: ${pretty(upper)}.` : undefined,
        `Ankle-height marketing is not the same as lateral structure. If you need more hold than a low court shoe, that is a different category — not a running stability post.`,
      );
    case "fit":
      return joinParas(
        `Fit the ${name} for court work: try a split-step and a lateral cut, not an easy jog around the shop.`,
        spec(product, "genderFit")
          ? `Listed last / gender: ${pretty(spec(product, "genderFit")!)}.`
          : `If a women's last exists in this line, use it when you know you need that volume — do not assume the men's pair will shrink.`,
        `Heel slip on a court shoe shows up on the first change of direction. Do not hope break-in will rewrite a loose heel.`,
      );
    case "durability":
      return joinParas(
        `Durability on padel shoes is outsole pods plus overlay wear from sand and lunges. We have not logged a mileage diary on the ${name}.`,
        outsole
          ? `You are watching ${pretty(outsole)} contact zones, especially the medial and first-step patches.`
          : `Watch the medial and first-step patches. Once they polish, grip goes before the mesh looks tired.`,
        `That is a research-informed ownership note, not a claimed session count.`,
      );
    case "comfort":
      return joinParas(
        `Comfort is lockdown without hot spots after a match, plus whether the listed cushioning (${cushion ?? "court foam"}) survives a second set.`,
        `Breathable mesh helps on hot courts; overlays help when you roll over the forefoot. Neither is a medical claim.`,
        ctx.buy.length ? `Players this last is aimed at: ${ctx.buy.slice(0, 2).join(" ")}` : undefined,
      );
    case "strengths":
      return joinParas(
        ctx.strengths.length
          ? ctx.strengths.slice(0, 6).map((item) => `• ${item}`).join("\n")
          : `• Court-specific outsole and lateral brief`,
        `I'd buy it when those jobs match most of your padel week — not when you also wanted a road daily.`,
      );
    case "tradeoffs":
      return joinParas(
        ctx.avoid.length ? ctx.avoid.join(" ") : ctx.weaknesses.map((w) => `• ${w}`).join("\n"),
        `Skip it if you needed a running shoe, a clay-only tennis last without padel evidence, or a lighter match-day racer with less lateral structure.`,
      );
    case "usecase":
      return joinParas(
        ctx.buy.length ? ctx.buy.join(" ") : product.shortDescription,
        `Best on sand-filled padel turf and indoor court sessions. Dual-sport tennis use only when the catalog actually lists that evidence.`,
      );
    case "value":
      return joinParas(
        `Pay flagship court money when you play often enough to wear out outsole pods. Club-value options exist in this category when Boost or Resolution pricing is the only reason you paused.`,
        `Check live offers. Do not treat a homepage URL as a product listing.`,
      );
    case "methodology":
      return joinParas(
        review.testingContext?.trim() ||
          `Expert-research court-shoe guide. We have not physically tested the ${name} unless the page says so.`,
        `We do not score padel shoes with running-shoe criteria alone.`,
      );
    case "sources":
      return joinParas(
        `Manufacturer and specialist court listings on the product evidence list. No invented user ratings or popularity ranks.`,
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
  topic: PadelLongformTopic | string,
  product: Product,
  review: Review,
  pass = 1,
): string {
  const name = product.fullName;
  const buy = review.whoShouldBuy ?? [];
  const avoid = review.whoShouldAvoid ?? [];
  const focus = padelTopicBuyerFocus(topic);
  if (pass === 1) {
    return sanitizePadelPublicText(
      joinParas(
        `I'd only keep the ${name} when ${focus} is what you keep choosing most weeks. A sibling that wins a different court problem is the cleaner buy when it does not.`,
        buy[0] ? `The buy filter I would actually use: ${buy[0]}` : undefined,
      ),
    );
  }
  if (pass === 2) {
    return sanitizePadelPublicText(
      joinParas(
        avoid[0]
          ? `I'd stop the purchase when ${avoid[0].charAt(0).toLowerCase()}${avoid[0].slice(1)}`
          : `I'd stop the purchase if you cannot name the weekly session the ${name} has to win.`,
        `If this section still feels generic, compare the linked peer that is built for that job — not a random flagship.`,
      ),
    );
  }
  return sanitizePadelPublicText(
    `When ${focus} is not why you would pay for the ${name}, stop shopping this model and read the alternatives.`,
  );
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
