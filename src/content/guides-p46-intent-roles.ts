/**
 * Editorial Completion 46 — Buying Guide ↔ Best role clarification.
 * Guides teach; Best shortlists. Never turn learn pages into ranking twins.
 */
import type { BuyingGuide } from "@/domain/editorial/types";

const GUIDE_ROLE_NOTES: Record<
  string,
  { learnFocus: string; bestSlug: string; bestLabel: string }
> = {
  "handheld-bottles-for-running": {
    learnFocus:
      "This guide teaches when a handheld beats a vest or belt, and what strap/volume traits matter — it is not a product ranking.",
    bestSlug: "handheld-running-bottles",
    bestLabel: "Best Handheld Running Bottles",
  },
  "stability-shoes-explained": {
    learnFocus:
      "This guide explains stability systems and honest limits — it is not a ranked shortlist.",
    bestSlug: "stability-running-shoes",
    bestLabel: "Best Stability Running Shoes",
  },
  "road-vs-trail-running-shoes": {
    learnFocus:
      "This guide compares road vs trail jobs and trade-offs — shortlists live on Best Trail / Best Running Shoes.",
    bestSlug: "trail-running-shoes",
    bestLabel: "Best Trail Running Shoes",
  },
  "running-jackets-explained": {
    learnFocus:
      "This guide explains jacket types (wind vs rain vs packable) — the winter stack lives on Winter Layering for Runners and ranked shells on Best Running Jackets.",
    bestSlug: "running-jackets",
    bestLabel: "Best Running Jackets",
  },
  "winter-layering-for-runners": {
    learnFocus:
      "This guide is the winter stack (base, mid, extremities) — jacket types live on Running Jackets Explained and ranked shells on Best Running Jackets.",
    bestSlug: "running-gear-winter",
    bestLabel: "Best Winter Running Gear",
  },
  "hot-weather-running-apparel": {
    learnFocus:
      "This guide teaches hot-weather apparel decisions — ranked garments live on Best Hot Weather Running Clothing.",
    bestSlug: "running-clothing-hot-weather",
    bestLabel: "Best Hot Weather Running Clothing",
  },
  "open-ear-vs-in-ear-running-headphones": {
    learnFocus:
      "This guide compares open-ear vs in-ear awareness trade-offs — ranked models live on Best Running Headphones.",
    bestSlug: "running-headphones",
    bestLabel: "Best Running Headphones",
  },
  "how-to-choose-running-shoes": {
    learnFocus:
      "This guide is the shoe decision framework — ranked role winners live on Best Running Shoes and type-specific Best pages.",
    bestSlug: "running-shoes",
    bestLabel: "Best Running Shoes",
  },
};

export function applyGuideP46IntentRoles(guides: BuyingGuide[]): BuyingGuide[] {
  return guides.map((guide) => {
    const note = GUIDE_ROLE_NOTES[guide.slug];
    if (!note) return guide;

    const relatedBest = new Set(guide.relatedBestGuideIds ?? []);
    relatedBest.add(`best-${note.bestSlug}`);

    const quick = guide.quickAnswer ?? "";
    const suffix = ` ${note.learnFocus} Next: ${note.bestLabel} (/best/${note.bestSlug}) for the shortlist.`;
    const quickAnswer =
      quick.includes("Next: Best") || quick.includes(note.learnFocus.slice(0, 32))
        ? quick
        : `${quick}${suffix}`.trim();

    return {
      ...guide,
      quickAnswer,
      relatedBestGuideIds: [...relatedBest],
    };
  });
}
