import type { LinkableAsset, OpportunityType } from "./types";

export interface AssetMatchInput {
  topic: string;
  subtopic?: string;
  opportunityType: OpportunityType;
  competitorTargetUrl?: string;
  text?: string;
}

const TYPE_PREFERENCE: Partial<Record<OpportunityType, string[]>> = {
  DATABASE_CITATION: ["asset-shoe-database", "asset-research-market-2026"],
  DATA_CITATION: ["asset-shoe-database", "asset-research-weight", "asset-research-stack"],
  RESEARCH_CITATION: [
    "asset-shoe-database",
    "asset-research-market-2026",
    "asset-methodology",
  ],
  TOOL_CITATION: ["asset-shoe-finder", "asset-compare"],
  RUNNING_CLUB: ["asset-shoe-finder", "asset-guide-choose-shoes", "asset-best-beginners"],
  COACH_RESOURCE: [
    "asset-guide-choose-shoes",
    "asset-best-daily-trainers",
    "asset-shoe-finder",
  ],
  ROUNDUP_INCLUSION: ["asset-best-running-shoes", "asset-best-daily-trainers"],
  REVIEW_CITATION: ["asset-review-vomero-18", "asset-best-running-shoes"],
  JOURNALIST_SOURCE_REQUEST: ["asset-shoe-database", "asset-research-market-2026"],
  DIGITAL_PR: ["asset-research-market-2026", "asset-shoe-database"],
  RESOURCE_PAGE: ["asset-shoe-database", "asset-guide-choose-shoes", "asset-shoe-finder"],
  COMPETITOR_LINK_GAP: ["asset-shoe-database", "asset-shoe-finder"],
  NEWSLETTER: ["asset-best-running-shoes", "asset-shoe-database"],
  PODCAST: ["asset-shoe-database", "asset-best-running-shoes"],
  COMMUNITY_RESOURCE: ["asset-shoe-finder", "asset-guide-choose-shoes"],
  UNIVERSITY_RESEARCH: ["asset-shoe-database", "asset-methodology"],
  BRAND_PR: ["asset-compare", "asset-shoe-database"],
  RETAILER_RESOURCE: ["asset-shoe-finder", "asset-guide-choose-shoes"],
  EXPERT_QUOTE: ["asset-methodology", "asset-shoe-database"],
  BROKEN_LINK_REPLACEMENT: ["asset-shoe-database", "asset-guide-choose-shoes"],
  GUEST_CONTRIBUTION: ["asset-methodology"],
  FORUM_THREAD: [
    "asset-shoe-finder",
    "asset-guide-choose-shoes",
    "asset-best-daily-trainers",
    "asset-compare",
  ],
  REDDIT_THREAD: [
    "asset-shoe-finder",
    "asset-guide-choose-shoes",
    "asset-best-daily-trainers",
    "asset-compare",
  ],
  Q_AND_A_THREAD: [
    "asset-guide-choose-shoes",
    "asset-shoe-finder",
    "asset-shoe-database",
  ],
  COMMUNITY_DISCUSSION: [
    "asset-shoe-finder",
    "asset-guide-choose-shoes",
    "asset-best-running-shoes",
  ],
  UNLINKED_MENTION: ["asset-shoe-database", "asset-best-running-shoes"],
};

function hay(input: AssetMatchInput): string {
  return [input.topic, input.subtopic, input.text, input.competitorTargetUrl]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function topicBoost(asset: LinkableAsset, blob: string): number {
  let n = 0;
  for (const t of asset.topics) {
    if (t && blob.includes(t.toLowerCase())) n += 12;
  }
  if (/price|cost|€|euro|deal/.test(blob) && asset.dataDriven) n += 18;
  if (/drop|heel-to-toe|offset/.test(blob) && /drop|database/.test(asset.topics.join(" "))) {
    n += 20;
  }
  if (/stack|cushion|maximalist/.test(blob) && asset.dataDriven) n += 16;
  if (/weight|lightest|grams/.test(blob) && asset.dataDriven) n += 16;
  if (/finder|recommend|which shoe|narrow/.test(blob) && asset.assetType === "tool") {
    n += 22;
  }
  if (/best running shoes|roundup|shortlist/.test(blob) && asset.assetType === "best_guide") {
    n += 18;
  }
  if (/daily trainer/.test(blob) && /daily/.test(asset.assetId)) n += 20;
  if (/watch|gps/.test(blob) && /watch/.test(asset.assetId)) n += 24;
  if (/nike|asics|compare|vs/.test(blob) && asset.assetType === "comparison") n += 16;
  if (/club|beginner|coach/.test(blob) && asset.communityFit >= 70) n += 10;
  if (asset.status === "planned") n -= 8;
  return n;
}

/**
 * Rank Kitletics assets for an opportunity. Never defaults to homepage.
 */
export function rankAssetsForOpportunity(
  assets: LinkableAsset[],
  input: AssetMatchInput,
): LinkableAsset[] {
  const blob = hay(input);
  const preferred = TYPE_PREFERENCE[input.opportunityType] ?? [];
  const liveFirst = [...assets].sort((a, b) => {
    const pa = preferred.indexOf(a.assetId);
    const pb = preferred.indexOf(b.assetId);
    const prefA = pa === -1 ? 99 : pa;
    const prefB = pb === -1 ? 99 : pb;
    const scoreA =
      a.linkabilityScore +
      topicBoost(a, blob) +
      (a.status === "live" ? 8 : 0) -
      prefA * 3;
    const scoreB =
      b.linkabilityScore +
      topicBoost(b, blob) +
      (b.status === "live" ? 8 : 0) -
      prefB * 3;
    return scoreB - scoreA;
  });
  return liveFirst.filter((a) => a.url !== "/");
}

export function pickAssetForOpportunity(
  assets: LinkableAsset[],
  input: AssetMatchInput,
): LinkableAsset | undefined {
  return rankAssetsForOpportunity(assets, input)[0];
}

export function pitchForAsset(
  asset: LinkableAsset,
  input: AssetMatchInput,
): { angle: string; why: string; anchorContext: string } {
  const blob = hay(input);
  if (asset.assetId === "asset-shoe-database") {
    if (/drop/.test(blob)) {
      return {
        angle: "Cite a current drop/stack/weight lookup instead of a static table.",
        why: "The database is the live dataset; drop articles go stale when models change.",
        anchorContext: "running shoe drop, stack and weight dataset",
      };
    }
    if (/price/.test(blob)) {
      return {
        angle: "Point readers at verified regional offer prices in the dataset, not a screenshot.",
        why: "Kitletics prices are regional From-prices, not invented MSRPs.",
        anchorContext: "running shoe price dataset",
      };
    }
    if (/stack|cushion/.test(blob)) {
      return {
        angle: "Use the searchable stack-height cohort rather than listing a handful of models.",
        why: "Stack claims need coverage and exclusions — the database publishes sample sizes.",
        anchorContext: "running shoe stack height data",
      };
    }
    return {
      angle: "Offer a current searchable running-shoe dataset as a research source.",
      why: "Publications citing one review site can cite a structured market table instead.",
      anchorContext: "running shoe database",
    };
  }
  if (asset.assetId === "asset-shoe-finder") {
    return {
      angle: "Help readers narrow a shoe choice by job (daily / race / trail) instead of a generic list.",
      why: "Clubs and beginner pages need a decision tool, not another Top 10.",
      anchorContext: "running shoe finder",
    };
  }
  if (asset.assetType === "best_guide") {
    return {
      angle: `Cite the ${asset.title} shortlist when they need named picks with trade-offs.`,
      why: "Best-of pages should cite a methodology-backed shortlist, not a homepage.",
      anchorContext: asset.title.toLowerCase(),
    };
  }
  if (asset.assetType === "buying_guide") {
    return {
      angle: `Use ${asset.title} as the explainer, with the database for the numbers.`,
      why: "Coaches and clubs need teaching copy, not a product grid.",
      anchorContext: asset.title.toLowerCase(),
    };
  }
  if (asset.assetType === "comparison") {
    return {
      angle: "Send brand/model vs. questions to a structured comparison, not a homepage CTA.",
      why: "Nike vs ASICS stories need a specific matchup page.",
      anchorContext: asset.title.toLowerCase(),
    };
  }
  if (asset.status === "planned") {
    return {
      angle: "Park as a future data story — do not pitch unpublished findings.",
      why: "No public report exists yet; only live assets should be offered as URLs.",
      anchorContext: asset.title.toLowerCase(),
    };
  }
  return {
    angle: asset.bestPitchAngles[0] ?? "Offer the page as a useful resource.",
    why: "Best available live Kitletics asset for this topic.",
    anchorContext: asset.title.toLowerCase(),
  };
}
