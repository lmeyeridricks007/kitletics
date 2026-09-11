/**
 * Fix 64 — per-source Alternatives card voice for the 30 NEEDS_DIFF pages.
 * Other accessory pages keep the original hash-frame generator.
 */
import type { Product } from "@/domain/products/types";
import type { ProductRelationship } from "@/domain/relationships/types";
import { ALTERNATIVES_P64_CARD_VOICE } from "@/content/alternatives-p64-uniqueness";
import { ALTERNATIVES_P65_CARD_VOICE } from "@/content/alternatives-p65-completion";

export interface AccessoryAltCopy {
  whyAlternative: string;
  summary: string;
  betterAt: string[];
  worseAt: string[];
  whoShouldSwitch: string;
  whoShouldStay: string;
  whyChoose: string[];
}

function first(lines: string[] | undefined, fallback: string): string {
  const hit = (lines ?? []).map((s) => s.trim()).find((s) => s.length >= 8);
  return hit ?? fallback;
}

function fill(template: string, t: string, tJob: string, tCost: string): string {
  return template
    .replaceAll("{t}", t)
    .replaceAll("{tJob}", tJob)
    .replaceAll("{tCost}", tCost);
}

export function buildAccessoryAlternativeCopy(input: {
  source: Product;
  alternative: Product;
  relationship: ProductRelationship;
}): AccessoryAltCopy | null {
  const voice =
    ALTERNATIVES_P65_CARD_VOICE[input.source.slug] ??
    ALTERNATIVES_P64_CARD_VOICE[input.source.slug];
  if (!voice) return null;

  const { alternative: alt } = input;
  const t = alt.name;
  const tJob = first(alt.strengths, alt.shortDescription || t);
  const tCost = first(alt.weaknesses, "that peer’s limits");
  const tJobLow = tJob.charAt(0).toLowerCase() + tJob.slice(1);
  const tCostLow = tCost.charAt(0).toLowerCase() + tCost.slice(1);

  const whyAlternative = fill(voice.why, t, tJobLow, tCostLow);
  const summary = fill(voice.summary, t, tJobLow, tCostLow);
  const whoShouldSwitch = fill(voice.switchTo, t, tJobLow, tCostLow);
  const whoShouldStay = fill(voice.stay, t, tJobLow, tCostLow);
  const betterAt = [
    fill(voice.betterHint, t, tJobLow, tCostLow),
    `Improves vs ${input.source.name}: ${tJob.length > 90 ? `${tJob.slice(0, 87).trim()}…` : tJob}`,
  ];
  const worseAt = [
    fill(voice.worseHint, t, tJobLow, tCostLow),
    `Give up ${input.source.name}: ${first(input.source.strengths, "the source job")}`,
  ];

  return {
    whyAlternative,
    summary,
    betterAt,
    worseAt,
    whoShouldSwitch,
    whoShouldStay,
    whyChoose: [...betterAt.slice(0, 2), whoShouldSwitch],
  };
}
