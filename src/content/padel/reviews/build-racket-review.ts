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

function decisionLines(lines: string[], kind: "buy" | "skip"): string[] {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bare = line.replace(/\.$/, "");
      if (/^i(?:'d| would)\b/i.test(bare)) return `${bare}.`;
      const rest = bare.replace(/^you\s+/i, "you ");
      const sentence = `${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
      return kind === "buy"
        ? `I'd shortlist it when ${sentence}.`
        : `I'd skip it if ${sentence}.`;
    });
}

function bullets(lines: string[] | undefined): string {
  return (lines ?? []).map((line) => line.trim()).filter(Boolean).map((line) => `• ${line}`).join("\n");
}

function parts(...chunks: Array<string | undefined | null | false>): string {
  return chunks
    .map((chunk) => (typeof chunk === "string" ? chunk.trim() : ""))
    .filter(Boolean)
    .join("\n\n");
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
  const weight =
    draft.specifications.weightMin != null && draft.specifications.weightMax != null
      ? `${draft.specifications.weightMin}–${draft.specifications.weightMax} g`
      : draft.specifications.weightMin != null
        ? `${draft.specifications.weightMin} g`
        : undefined;
  const shape = draft.specifications.shape ? String(draft.specifications.shape) : undefined;
  const balance = draft.specifications.balance ? String(draft.specifications.balance) : undefined;
  const attr = (key: PadelDecisionKey) => draft.attributes[key];
  const peers = peerNames(draft.alternativeProductIds ?? []);
  const comparisonBlurbs = (input.comparisonIds ?? [])
    .map((id) => COMPARISON_BLURBS[id])
    .filter(Boolean);

  const bodies: Record<string, string> = {
    "sec-overview": parts(copy.whatItIs, draft.verdict),
    "sec-usecase": parts(copy.whoItsFor, copy.howItPlays),
    "sec-tradeoffs": parts(bullets(copy.notIdealFor)),
    "sec-construction": copy.construction,
    "sec-shape": parts(
      geometry ? `${draft.name}: ${geometry}.` : undefined,
      copy.handling,
    ),
    "sec-power": attr("power").reasoning,
    "sec-control": attr("control").reasoning,
    "sec-sweetspot": parts(copy.forgiveness, attr("forgiveness").reasoning),
    "sec-maneuverability": attr("maneuverability").reasoning,
    "sec-comfort": parts(copy.comfort, attr("comfort").reasoning),
    "sec-spin": parts(
      draft.specifications.surfaceTexture
        ? `Published face texture: ${String(draft.specifications.surfaceTexture)}.`
        : undefined,
      attr("spin").reasoning,
    ),
    "sec-defense": shape
      ? `On the ${draft.name} (${[shape, balance, weight].filter(Boolean).join(", ")}), defensive usefulness follows that published outline — late glass contact is harder on tip-heavy diamonds than on centred rounds.`
      : copy.forgiveness,
    "sec-net": attr("stability").reasoning,
    "sec-attack": copy.powerVsControl,
    "sec-serve": (() => {
      const setup = [
        shape && `${shape} shape`,
        balance && `${balance} balance`,
        weight,
      ]
        .filter(Boolean)
        .join(", ");
      return setup
        ? `Serve and return on the ${draft.name} follow the published ${setup}. This review does not log serve speeds.`
        : `This review does not log serve speeds for the ${draft.name}.`;
    })(),
    "sec-strengths": bullets(draft.strengths),
    "sec-weaknesses": bullets(draft.weaknesses),
    "sec-best-for": parts(bullets(copy.bestFor), copy.buyIf.join("\n\n")),
    "sec-not-ideal": copy.skipIf.join("\n\n"),
    "sec-alternatives": peers.length
      ? peers.map((name) => `• ${name}`).join("\n")
      : `No catalog alternative is linked on this model yet.`,
    "sec-comparisons": comparisonBlurbs.length
      ? comparisonBlurbs.join("\n\n")
      : `No comparison page is attached. Use the linked alternatives rather than a made-up winner.`,
    "sec-verified-specs": parts(
      `Published numbers for the ${draft.fullName}:`,
      [
        shape && `• Shape: ${shape}`,
        balance && `• Balance: ${balance}`,
        weight && `• Weight: ${weight}`,
        draft.specifications.thicknessMm != null &&
          `• Thickness: ${draft.specifications.thicknessMm} mm`,
        draft.specifications.face && `• Face: ${draft.specifications.face}`,
        (draft.specifications.manufacturerCoreName || draft.specifications.core) &&
          `• Core: ${draft.specifications.manufacturerCoreName ?? draft.specifications.core}`,
        draft.specifications.frameMaterial &&
          `• Frame: ${draft.specifications.frameMaterial}`,
        draft.specifications.feel && `• Feel: ${draft.specifications.feel}`,
        draft.specifications.sweetSpot &&
          `• Sweet spot: ${draft.specifications.sweetSpot}`,
        draft.specifications.playerLevel &&
          `• Player level: ${draft.specifications.playerLevel}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "sec-value": `Check the live offers for the ${draft.name}. ${copy.skipIf[0] ?? draft.verdict}`,
    "sec-methodology": parts(
      EXPERT_RESEARCH_METHODOLOGY,
      `Scores are decision aids from published specs and manufacturer positioning. They are not a Kitletics hitting test.`,
    ),
    "sec-sources": `Primary listing: ${draft.sourceName}. ${draft.sourceUrl}`,
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
    whoShouldBuy: decisionLines(copy.buyIf, "buy"),
    whoShouldAvoid: decisionLines(copy.skipIf, "skip"),
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
