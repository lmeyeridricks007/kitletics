/**
 * Product-specific editorial anchors for Padel reviews.
 * Derived from published specs + PDP copy — never interchangeable deepen glue.
 *
 * Every reader-facing line must retain product-decision anchors (geometry,
 * face/core, weight band, named peers) so scrubbed cross-product reuse fails
 * the template-glue gate only when prose is truly non-specific.
 */
import type { Product, SpecValue } from "@/domain/products/types";
import { getPadelRacketDraft, getPadelRacketPdpCopy } from "@/content/padel/rackets";
import { hasMeaningfulSpecValue } from "@/content/padel/spec-enrichment/types";

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
  if (!hasMeaningfulSpecValue(raw as SpecValue)) return undefined;
  const text = asText(raw as SpecValue);
  if (!hasMeaningfulSpecValue(text)) return undefined;
  return text;
}

function pretty(value: string): string {
  return value.replace(/[-_]/g, " ");
}

export type RacketEditorialProfile = {
  name: string;
  shape?: string;
  balance?: string;
  face?: string;
  faceWeave?: string;
  core?: string;
  weightBand?: string;
  playerLevel?: string;
  sweetSpot?: string;
  surface?: string;
  geometryLine: string;
  stackLine: string;
  jobLine: string;
  powerLine: string;
  controlLine: string;
  forgivenessLine: string;
  attackLine: string;
  defenseLine: string;
  peerAdvice: string;
};

export function buildRacketEditorialProfile(product: Product): RacketEditorialProfile {
  const name = product.fullName;
  const copy = getPadelRacketPdpCopy(product.id);
  const draft = getPadelRacketDraft(product.id);
  const shape = spec(product, "shape")?.toLowerCase();
  const balance = spec(product, "balance")?.toLowerCase();
  const face = spec(product, "face");
  const faceWeave = spec(product, "faceCarbonWeave");
  const core =
    spec(product, "manufacturerCoreName") ?? spec(product, "core");
  const min = spec(product, "weightMin");
  const max = spec(product, "weightMax");
  const weightBand =
    min && max ? `${min}–${max} g` : min ? `${min} g` : undefined;
  const playerLevel = spec(product, "playerLevel");
  const sweetSpot = spec(product, "sweetSpot");
  const surface = spec(product, "surfaceTexture");
  const positioning = String(
    draft?.specifications?.manufacturerPositioning ?? "",
  );

  const bits = [
    shape ? `${pretty(shape)} mould` : null,
    balance ? `${pretty(balance)} balance` : null,
    weightBand ? `${weightBand} published band` : null,
  ].filter(Boolean);
  const geometryLine = bits.length
    ? bits.join(", ")
    : "published shape, balance and weight";

  const stackBits = [
    faceWeave ?? face,
    core,
    surface ? `${pretty(surface)} face texture` : null,
    positioning || null,
  ].filter(Boolean);
  const stackLine = stackBits.length
    ? stackBits.join(", ")
    : geometryLine;

  const isDiamond = shape === "diamond";
  const isRound = shape === "round";
  const isHybrid = shape === "hybrid" || shape === "teardrop";
  const isSoftCore = /soft|comfort|soft.?eva/i.test(core ?? "");
  const isFiberglass = /fiberglass|glass/i.test(face ?? "");
  const is12k = /12k/i.test(faceWeave ?? face ?? "");
  const is18k = /18k/i.test(faceWeave ?? face ?? "");
  const isBeginner =
    /beginner|entry|progress/i.test(playerLevel ?? "") ||
    /beginner|comfort|progress/i.test(positioning);

  const peerNames = (draft?.relatedProductIds ?? product.relatedProductIds ?? [])
    .slice(0, 2)
    .map((id) => id.replace(/^prod-/, "").replace(/-/g, " "))
    .filter(Boolean);
  const peerPhrase = peerNames.length
    ? peerNames.join(" / ")
    : "the linked alternatives on this page";

  let jobLine: string;
  if (copy?.whoItsFor?.trim() && (copy.whoItsFor.trim().split(/\s+/).length ?? 0) >= 18) {
    jobLine = copy.whoItsFor.trim();
  } else if (isDiamond && (is12k || is18k)) {
    jobLine = `I'd shortlist the ${name} when you already finish points and want this stack: ${stackLine} on ${geometryLine}. Skip it when you still need a forgiving round more than a ${faceWeave ?? face ?? "stiff"} diamond.`;
  } else if (isRound && (isSoftCore || isFiberglass || isBeginner)) {
    jobLine = `I'd shortlist the ${name} when forgiveness and easy output matter more than smash geometry — published as ${geometryLine}${core ? ` with ${core}` : ""}${face ? ` and ${face}` : ""}.`;
  } else if (isHybrid || shape === "teardrop") {
    jobLine = `I'd shortlist the ${name} when you want one mould that can attack without giving up usable face: ${geometryLine}${stackBits[0] ? `, ${stackBits[0]}` : ""}.`;
  } else if (isDiamond) {
    jobLine = `I'd shortlist the ${name} when finishing is already part of your week — published diamond geometry (${geometryLine}${stackBits[0] ? `; ${stackBits[0]}` : ""}).`;
  } else {
    jobLine = `Match the ${name} to its published mould (${geometryLine}) before you trust the model name alone.`;
  }

  const powerLine =
    copy?.powerVsControl?.trim() ||
    (isDiamond
      ? `Power on the ${name} is inferred from ${geometryLine}${faceWeave ? ` plus ${faceWeave}` : face ? ` plus ${face}` : ""}${core ? ` and ${core}` : ""} — not a smash-speed lab. If you do not already finish, ${peerPhrase} will feel more useful than hoping this mould teaches the overhead.`
      : isRound || isSoftCore
        ? `Power on the ${name} stays comfort-biased (${geometryLine}${core ? `, ${core}` : ""}). Easy ball output at club intensity is the job — step toward ${peerPhrase} when you outgrow that.`
        : `Power on the ${name} follows ${stackLine}, not a Kitletics smash test.`);

  const controlLine =
    copy?.howItPlays?.trim() && !isDiamond
      ? copy.howItPlays.trim()
      : isRound || isSoftCore
        ? `Control on the ${name} is the usable face and soft response (${geometryLine}${core ? `, ${core}` : ""}): placement off the glass and time to set the next ball.`
        : isDiamond
          ? `Control on the ${name} means you already place the ball on this ${stackLine} diamond — the mould will not teach timing.`
          : `Control on the ${name} follows ${geometryLine}. Read that mould before you assume ‘control’ means beginner-friendly.`;

  const forgivenessLine =
    copy?.forgiveness?.trim() ||
    (sweetSpot || isRound || isSoftCore
      ? `Forgiveness on the ${name}${sweetSpot ? ` follows the published ${pretty(sweetSpot)} sweet-spot note` : " follows the round / soft stack"}${playerLevel ? ` and ${pretty(playerLevel)} player-level tag` : ""} on ${geometryLine}.`
      : isDiamond
        ? `Forgiveness is not the ${name}’s headline on ${geometryLine}${faceWeave ? ` with ${faceWeave}` : ""}. When contact is still inconsistent, look at ${peerPhrase} instead.`
        : `Forgiveness on the ${name} follows published sweet-spot and player-level notes on ${geometryLine}.`);

  const attackLine = isDiamond
    ? `Attacking play is the ${name}’s published job on ${geometryLine}${faceWeave ? ` / ${faceWeave}` : ""}: smashes, bandejas and finishing windows when you already sit forward.`
    : `If smashes are the whole identity, compare ${peerPhrase}. The ${name} (${geometryLine}) is the more all-court or comfort sibling.`;

  const defenseLine = isRound || isHybrid || isSoftCore
    ? `Defensively the ${name}’s mould (${geometryLine}${core ? `, ${core}` : ""}) is the more usable face in its family — still verify the published weight band before you assume easy preparation.`
    : `The ${name} (${geometryLine}${faceWeave ? `, ${faceWeave}` : ""}) is usually the wrong first pick if you live two metres behind the glass — prefer ${peerPhrase} when defence is most of your points.`;

  const peerAdvice = isDiamond
    ? `When the ${name}’s ${stackLine} diamond is the wrong weekly job, compare ${peerPhrase} for more usable face or a dedicated smash mould.`
    : isRound || isSoftCore
      ? `When you outgrow the ${name}’s ${core ?? "soft"} / ${face ?? "comfort"} stack on ${geometryLine}, step to ${peerPhrase}.`
      : `When the ${name}’s published job (${geometryLine}) is not your week, use ${peerPhrase}.`;

  return {
    name,
    shape,
    balance,
    face,
    faceWeave,
    core,
    weightBand,
    playerLevel,
    sweetSpot,
    surface,
    geometryLine,
    stackLine,
    jobLine,
    powerLine,
    controlLine,
    forgivenessLine,
    attackLine,
    defenseLine,
    peerAdvice,
  };
}
