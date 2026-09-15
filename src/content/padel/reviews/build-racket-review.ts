import type { ContentSection, Review, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import type { RacketDraft } from "@/content/padel/rackets/build";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
} from "@/domain/review-agent/category-config";
import { PADEL_RACKET_BLUEPRINT } from "@/lib/review/padel-review-outline";
import { sanitizePadelReview } from "@/lib/review/padel-review-copy";
import { getPadelRacketDraft } from "@/content/padel/rackets";
import type { PadelDecisionKey } from "@/domain/padel/racket-decision";

const pub = publishedMeta();

const SCORE_LABEL: Record<PadelDecisionKey, string> = {
  power: "Power",
  control: "Control",
  forgiveness: "Forgiveness",
  maneuverability: "Maneuverability",
  comfort: "Comfort",
  stability: "Stability",
  spin: "Spin",
};

/** Short buyer-facing gauge note — never methodology labels. */
function gaugeNoteFromReasoning(reasoning: string, key: PadelDecisionKey): string {
  const cleaned = reasoning
    .replace(/\b(inferred from[^.]*|manufacturer claim[^.]*|not a lab[^.]*|we do not treat[^.]*\.?)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const first =
    cleaned.split(/(?<=\.)\s+/).find((s) => s.trim().length > 12) ?? cleaned;
  let note = first.replace(/\.$/, "").trim();
  if (note.length > 90) {
    note = `${note.slice(0, 87).replace(/\s+\S*$/, "")}…`;
  }
  if (note.length < 12) {
    const fallback: Record<PadelDecisionKey, string> = {
      power: "Pace comes from mould and face, not marketing watts",
      control: "Placement and repeatable contact for its mould class",
      forgiveness: "How playable off-centre hits stay for this shape",
      maneuverability: "How quickly the tip recovers between balls",
      comfort: "Arm-friendly contact for this core and weight band",
      stability: "How planted the platform feels through the hit",
      spin: "Texture and face help when your brush is already clean",
    };
    return fallback[key];
  }
  return note;
}

function specLine(draft: RacketDraft): string {
  const s = draft.specifications;
  const bits = [
    s.shape ? `${String(s.shape)} mould` : null,
    s.balance ? `${String(s.balance)} balance` : null,
    s.weightMin != null && s.weightMax != null
      ? `${s.weightMin}–${s.weightMax} g`
      : s.weightMin != null
        ? `${s.weightMin} g`
        : null,
    s.thicknessMm != null ? `${s.thicknessMm} mm` : null,
    s.face ? String(s.face) : null,
    s.manufacturerCoreName ?? s.core ? String(s.manufacturerCoreName ?? s.core) : null,
  ].filter(Boolean);
  return bits.join(", ");
}

function expandBuy(lines: string[], fallback: string, kind: "buy" | "skip"): string[] {
  const raw = [...lines.map((l) => l.trim()).filter(Boolean)];
  if (raw.length === 0) raw.push(fallback);
  const out = raw.map((line) => {
    if (kind === "buy") {
      if (/^(you want|you need|you(?:'re| are) looking|i(?:'d| would) (?:shortlist|pause|rotate))/i.test(line)) {
        return line;
      }
      return `I'd shortlist it when ${line.charAt(0).toLowerCase()}${line.slice(1)}`.replace(
        /\.\.$/,
        ".",
      );
    }
    if (/^(you need|you want|i(?:'d| would) (?:skip|pause|rotate))/i.test(line)) {
      return line;
    }
    return `I'd skip it if ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  });
  while (out.length < 3) {
    out.push(
      kind === "buy"
        ? `I'd shortlist it when that job shows up most weeks — not as a one-racket closet filler.`
        : `I'd skip it if you cannot name the weekly session this mould has to win.`,
    );
  }
  return out.slice(0, 4);
}

const COMPARISON_BLURBS: Record<string, string> = {
  "cmp-vertex05-vs-hack04":
    "Vertex 05 vs Hack 04 is the current Bullpadel pair: Tello's Vertex diamond versus Di Nenno's Hack attack diamond — not Vertex 04 or Hack 03 listed as if they were new.",
  "cmp-vertex05-vs-at10-12k":
    "Vertex 05 vs AT10 Genius 12K is diamond all-court versus Tapia's teardrop Genius. The Genius 12K is not the Attack diamond.",
};

function peerNames(ids: string[]): string[] {
  return ids.map((id) => {
    const peer = getPadelRacketDraft(id);
    if (peer) return peer.fullName;
    return id.replace(/^prod-/, "").replace(/-/g, " ");
  });
}

function section(
  id: string,
  heading: string,
  body: string,
  evidenceIds: string[],
): ContentSection {
  return { id, heading, body: body.trim(), evidenceIds };
}

export function racketReviewFromDraft(input: {
  draft: RacketDraft;
  reviewId: string;
  comparisonIds?: string[];
}): Review {
  const { draft } = input;
  const copy = draft.copy;
  const evidenceIds = [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`];
  const geometry = specLine(draft);
  const attr = (key: PadelDecisionKey) => draft.attributes[key];

  const bodies: Record<string, string> = {
    "sec-overview": [
      copy.whatItIs,
      draft.verdict,
      copy.whoItsFor,
      `Bottom line: ${draft.verdict}`,
    ].join("\n\n"),
    "sec-usecase": [
      copy.whoItsFor,
      copy.bestFor.map((b) => `• ${b}`).join("\n"),
      copy.howItPlays,
      `I'd buy this mould when that week is already true — not because the name is on a poster.`,
    ].join("\n\n"),
    "sec-tradeoffs": [
      copy.skipIf.join("\n\n"),
      copy.notIdealFor.map((b) => `• ${b}`).join("\n"),
      draft.weaknesses.map((w) => `• ${w}`).join("\n"),
      `I'd rather switch families than force the ${draft.name} into a beginner round job or a pure smash job it is not.`,
    ].join("\n\n"),
    "sec-construction": [
      copy.construction,
      geometry ? `Published stack: ${geometry}.` : "",
      `Those names are manufacturer systems. They help you tell Vertex from Hack, Genius from Attack, Metalbone from Cross It. They are not a Kitletics lab list.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    "sec-shape": [
      geometry
        ? `Shape and balance: ${geometry}.`
        : `Confirm shape and balance against what you play now.`,
      copy.handling,
      copy.powerVsControl,
      `Diamond usually means a higher hitting zone and a later swing tax. Round or hybrid usually means more usable face when you are defending. Teardrop sits between those jobs.`,
    ].join("\n\n"),
    "sec-power": [
      copy.powerVsControl,
      attr("power").reasoning,
      `Power here is inferred from shape, face, core and weight — not a smash-speed test. If finishing is the whole identity, compare the dedicated attack sibling in the same brand.`,
    ].join("\n\n"),
    "sec-control": [
      copy.powerVsControl,
      attr("control").reasoning,
      `Control on padel is placement off the glass, bandeja height and whether you can keep the ball on your terms at the net. A stiff flagship can still 'control' if you already time it; it will not teach timing.`,
    ].join("\n\n"),
    "sec-sweetspot": [
      copy.forgiveness,
      attr("forgiveness").reasoning,
      `If you need a large, low, soft face, look at Indiga, Comfort Soft, Equation Soft or an ML10-class round — not a professional diamond unless this model is that job.`,
    ].join("\n\n"),
    "sec-maneuverability": [
      copy.handling,
      attr("maneuverability").reasoning,
      `Maneuverability on padel is reaction volleys and getting the face on a fast glass ball. A 365 g diamond can still feel late if the balance is high.`,
    ].join("\n\n"),
    "sec-comfort": [
      copy.comfort,
      attr("comfort").reasoning,
      `If elbow or shoulder already complains after hard weeks, start with a comfort / round option and a sensible overgrip. Do not buy a stiff 12K diamond to 'get used to it.'`,
    ].join("\n\n"),
    "sec-spin": [
      draft.specifications.surfaceTexture
        ? `Published face texture: ${String(draft.specifications.surfaceTexture)}.`
        : copy.construction,
      attr("spin").reasoning,
      `Rough grain helps slice and bandeja bite when the swing is already clean. It will not create spin on a flat amateur contact.`,
    ].join("\n\n"),
    "sec-defense": [
      copy.howItPlays,
      copy.forgiveness,
      String(draft.specifications.shape) === "diamond"
        ? `A diamond attacker is usually the wrong first pick if you live two metres behind the glass. Look at the round or hybrid sibling in this family.`
        : `This mould is the more usable defensive shape in its family. I'd still check the published weight — a heavy hybrid is not an Indiga.`,
      `Defence is getting the ball back with height and time. If that is most of your points, buy forgiveness before smash rating.`,
    ].join("\n\n"),
    "sec-net": [
      copy.handling,
      copy.howItPlays,
      `Net play is volley preparation, block returns and the first finishing window. High-balance diamonds can feel late unless you already sit on the line.`,
      `I'd demo a few games at the net if you can — catalog weight will not tell you whether the head comes around on a fast body volley.`,
    ].join("\n\n"),
    "sec-attack": [
      copy.powerVsControl,
      attr("power").reasoning,
      String(draft.specifications.shape) === "diamond"
        ? `This is the attacking shape in the family. I'd still match it to a player who already finishes — a diamond does not teach the smash.`
        : `If smashes are the whole identity, compare the diamond attacker in this brand. This mould is the more all-court or control sibling.`,
      `Attacking play is also the bandeja and víbora, not only the match-ball smash. Read the manufacturer style line before you buy a power sticker.`,
    ].join("\n\n"),
    "sec-serve": [
      `Serve and return follow the same geometry as the rest of the court: ${geometry || "published shape, balance and weight"}.`,
      copy.handling,
      `A high-balance diamond can help a heavy serve if you already throw the ball up and hit up. It will punish a short toss. Returns want a usable face — another reason beginners should not start on a professional diamond unless this model is the comfort/round exception.`,
      `This page does not log Kitletics serve speeds.`,
    ].join("\n\n"),
    "sec-strengths": [
      draft.strengths.map((s) => `• ${s}`).join("\n"),
      copy.bestFor.map((b) => `• ${b}`).join("\n"),
      `If none of those jobs show up most weeks, a cheaper or more forgiving peer will feel like a better buy even when this is the flagship name.`,
    ].join("\n\n"),
    "sec-weaknesses": [
      draft.weaknesses.map((w) => `• ${w}`).join("\n"),
      copy.notIdealFor.map((b) => `• ${b}`).join("\n"),
      `I'd rather switch families than pretend the ${draft.name} covers a beginner round job and a pure smash job at once.`,
    ].join("\n\n"),
    "sec-best-for": [
      copy.bestFor.map((b) => `• ${b}`).join("\n"),
      copy.whoItsFor,
    ].join("\n\n"),
    "sec-not-ideal": [
      copy.notIdealFor.map((b) => `• ${b}`).join("\n"),
      copy.skipIf.join("\n\n"),
    ].join("\n\n"),
    "sec-alternatives": [
      peerNames(draft.alternativeProductIds ?? []).length
        ? peerNames(draft.alternativeProductIds ?? [])
            .map((n) => `• ${n}`)
            .join("\n")
        : `• A more forgiving round or hybrid in this brand\n• A dedicated attacker if finishing is the whole identity`,
      `I'd buy a linked peer when the weekly session is already a different job — not because a sale made this flagship look cheap.`,
    ].join("\n\n"),
    "sec-comparisons": [
      (input.comparisonIds ?? [])
        .map((id) => COMPARISON_BLURBS[id])
        .filter(Boolean)
        .join("\n\n") ||
        `There is no dedicated comparison page attached to this review yet. Read the alternatives and the peer product pages rather than inventing a universal winner.`,
      `Previous-gen Vertex 04, Hack 03 and Metalbone 3.3 stay labelled as previous generation when they appear as shopper context — they are not current peers.`,
    ].join("\n\n"),
    "sec-verified-specs": [
      `Published numbers for the ${draft.fullName}:`,
      [
        draft.specifications.shape && `• Shape: ${draft.specifications.shape}`,
        draft.specifications.balance && `• Balance: ${draft.specifications.balance}`,
        draft.specifications.weightMin != null &&
          `• Weight: ${draft.specifications.weightMin}${
            draft.specifications.weightMax != null
              ? `–${draft.specifications.weightMax}`
              : ""
          } g`,
        draft.specifications.thicknessMm != null &&
          `• Thickness: ${draft.specifications.thicknessMm} mm`,
        draft.specifications.face && `• Face: ${draft.specifications.face}`,
        (draft.specifications.manufacturerCoreName || draft.specifications.core) &&
          `• Core: ${draft.specifications.manufacturerCoreName ?? draft.specifications.core}`,
        draft.specifications.feel && `• Feel: ${draft.specifications.feel}`,
        draft.specifications.sweetSpot &&
          `• Sweet spot: ${draft.specifications.sweetSpot}`,
        draft.specifications.playerLevel &&
          `• Player level: ${draft.specifications.playerLevel}`,
      ]
        .filter(Boolean)
        .join("\n"),
      `Weight, balance, shape, core and face are filters. They will not tell you whether you time a diamond after two hours. Demo when you can, or buy somewhere returns are easy.`,
    ].join("\n\n"),
    "sec-value": [
      `You are paying for the current ${draft.name} job — not last year's paint and not a beginner round unless that is this model.`,
      copy.skipIf[0],
      `Check live street price in the offers module. I'd pay flagship money when the mould matches your week; otherwise compare the linked alternatives.`,
    ].join("\n\n"),
    "sec-methodology": [
      EXPERT_RESEARCH_METHODOLOGY,
      `Manufacturer marketing alone is not treated as comfort, durability or on-court proof. Scores are decision aids, not a lab measurement.`,
    ].join("\n\n"),
    "sec-sources": [
      `Primary listing for this model: ${draft.sourceName}. ${draft.sourceUrl}`,
      `Independent hitting notes from other sites are not copied as if they were ours. If a claim is only marketing, the copy says so.`,
    ].join("\n\n"),
  };

  const sections = PADEL_RACKET_BLUEPRINT.map((slot) =>
    section(slot.id, slot.heading, bodies[slot.id] ?? copy.whatItIs, evidenceIds),
  );

  const scores = Object.entries(draft.attributes).map(
    ([key, row]): ScoreBreakdownItem => ({
      key,
      label: SCORE_LABEL[key as PadelDecisionKey] ?? key,
      score: row.score,
      max: 100,
      note: gaugeNoteFromReasoning(row.reasoning, key as PadelDecisionKey),
    }),
  );
  scores.push({
    key: "value",
    label: "Value",
    score: Math.max(
      55,
      Math.min(
        88,
        Math.round(
          Object.values(draft.attributes).reduce((n, a) => n + a.score, 0) /
            Object.values(draft.attributes).length,
        ) - 4,
      ),
    ),
    note: `Worth it when the ${draft.name} mould matches your week — check live street price`,
  });

  const overall = Math.round(
    Object.values(draft.attributes).reduce((n, a) => n + a.score, 0) /
      Object.values(draft.attributes).length,
  );

  return sanitizePadelReview({
    id: input.reviewId,
    slug: draft.slug,
    productId: draft.id,
    title: `${draft.fullName} Review`,
    subtitle: copy.whatItIs.split(/(?<=\.)\s/)[0] ?? draft.shortDescription,
    reviewType: "expert-research",
    bottomLine: `${draft.verdict} ${copy.buyIf[0] ?? ""} ${copy.skipIf[0] ?? ""}`.trim(),
    verdict: draft.verdict,
    score: overall,
    summary: copy.whatItIs,
    reviewerId: "author-kitletics-editorial",
    testingContext: EXPERT_RESEARCH_METHODOLOGY,
    editorialDisclosure: EDITORIAL_DISCLOSURE,
    sections,
    pros: draft.strengths.slice(0, 5),
    cons: draft.weaknesses.slice(0, 4),
    whoShouldBuy: expandBuy(copy.buyIf, copy.whoItsFor, "buy"),
    whoShouldAvoid: expandBuy(
      copy.skipIf,
      copy.notIdealFor[0] ?? draft.weaknesses[0] ?? "",
      "skip",
    ),
    scoreBreakdown: scores,
    evidenceIds,
    alternativeProductIds: draft.alternativeProductIds ?? [],
    comparisonIds: input.comparisonIds ?? [],
    relatedBuyingGuideIds: [
      "guide-choose-padel-racket",
      "guide-padel-racket-shapes",
      "guide-soft-vs-hard-padel-rackets",
      "guide-beginner-padel-gear",
    ],
    faqIds: [],
    seoTitle: `${draft.fullName} Review: Verdict, Who It's For & Specs | Kitletics`,
    seoDescription: `Expert-research review of the ${draft.fullName} — who it is for, construction, power vs control, and honest skip signals. Not a first-hand hitting test.`,
    ...pub,
  });
}
