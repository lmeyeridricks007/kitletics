import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getReviewBySlug,
} from "@/repositories/editorial";
import { getBrandBySlug, getToolBySlug } from "@/repositories";
import { RUNNING_SHOE_DATABASE_PATH } from "@/lib/running-shoe-database/constants";
import type { LinkableAsset } from "./types";

function live(
  partial: Omit<LinkableAsset, "status" | "markets" | "languages"> &
    Partial<Pick<LinkableAsset, "status" | "markets" | "languages">>,
): LinkableAsset {
  return {
    status: "live",
    markets: ["NL", "EU", "global"],
    languages: ["en"],
    ...partial,
  };
}

function planned(
  partial: Omit<LinkableAsset, "status" | "url" | "markets" | "languages"> & {
    url?: string;
  },
): LinkableAsset {
  return {
    status: "planned",
    url: "",
    markets: ["NL", "EU", "global"],
    languages: ["en"],
    ...partial,
  };
}

/**
 * Canonical linkable assets. Planned research has empty url — never invent routes.
 */
export function getLinkableAssets(): LinkableAsset[] {
  const opts = { isDev: false };
  const best = getBestGuides(opts);
  const guides = getBuyingGuides(opts);
  const comparisons = getComparisons(opts);
  const finder = getToolBySlug("running-shoe-finder", opts);

  const bySlug = <T extends { slug: string; title: string }>(
    list: T[],
    slug: string,
  ): T | undefined => list.find((x) => x.slug === slug);

  const bestShoes = bySlug(best, "running-shoes");
  const daily = bySlug(best, "daily-trainers");
  const watches = bySlug(best, "running-watches");
  const watchBeginner = bySlug(best, "running-watches-beginners");
  const chooseShoes = bySlug(guides, "how-to-choose-running-shoes");
  const dropGuide = bySlug(guides, "running-shoe-drop");
  const cushionGuide = bySlug(guides, "running-shoe-cushioning");
  const compareSample = comparisons.find((c) =>
    /novablast|pegasus|vomero|nimbus/i.test(c.slug),
  );

  const assets: LinkableAsset[] = [
    live({
      assetId: "asset-shoe-database",
      title: "Running Shoe Database",
      url: RUNNING_SHOE_DATABASE_PATH,
      assetType: "database",
      topics: ["running shoes", "drop", "stack", "weight", "price", "data"],
      sport: "running",
      audience: ["journalists", "coaches", "researchers", "clubs"],
      linkabilityScore: 96,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: [
        "Current searchable dataset of stack, drop, weight and regional From-price.",
        "Cite coverage and sample sizes instead of a screenshot of ten shoes.",
      ],
      commercialValue: 70,
      organicOpportunity: 90,
      journalistFit: 95,
      communityFit: 75,
      promoteRank: 1,
    }),
  ];

  if (finder) {
    assets.push(
      live({
        assetId: "asset-shoe-finder",
        title: finder.name,
        url: `/tools/${finder.slug}`,
        assetType: "tool",
        topics: ["running shoes", "finder", "recommendation", "beginner"],
        sport: "running",
        audience: ["clubs", "coaches", "beginners"],
        linkabilityScore: 92,
        dataDriven: false,
        journalistFriendly: false,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: [
          "Help runners narrow shoe choice by job instead of another Top 10 list.",
        ],
        commercialValue: 80,
        organicOpportunity: 85,
        journalistFit: 55,
        communityFit: 95,
        promoteRank: 2,
      }),
    );
  }

  assets.push(
    live({
      assetId: "asset-running-shoes-hub",
      title: "Running Shoes hub",
      url: "/running/shoes",
      assetType: "category_hub",
      topics: ["running shoes"],
      sport: "running",
      audience: ["shoppers"],
      linkabilityScore: 55,
      dataDriven: false,
      journalistFriendly: false,
      consumerFriendly: true,
      researchFriendly: false,
      bestPitchAngles: ["Only when the story is a category overview, not a data cite."],
      commercialValue: 75,
      organicOpportunity: 70,
      journalistFit: 30,
      communityFit: 40,
      promoteRank: 8,
    }),
  );

  if (bestShoes) {
    assets.push(
      live({
        assetId: "asset-best-running-shoes",
        title: bestShoes.title,
        url: `/best/${bestShoes.slug}`,
        assetType: "best_guide",
        topics: ["best running shoes", "roundup"],
        sport: "running",
        audience: ["shoppers", "newsletters"],
        linkabilityScore: 84,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Named shortlist with trade-offs, not a homepage dump."],
        commercialValue: 90,
        organicOpportunity: 88,
        journalistFit: 70,
        communityFit: 60,
        promoteRank: 4,
      }),
    );
  }

  if (daily) {
    assets.push(
      live({
        assetId: "asset-best-daily-trainers",
        title: daily.title,
        url: `/best/${daily.slug}`,
        assetType: "best_guide",
        topics: ["daily trainers", "training shoes"],
        sport: "running",
        audience: ["coaches", "shoppers"],
        linkabilityScore: 82,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Daily-trainer shortlist for coaches explaining easy-day shoes."],
        commercialValue: 85,
        organicOpportunity: 80,
        journalistFit: 65,
        communityFit: 80,
        promoteRank: 4,
      }),
    );
  }

  if (chooseShoes) {
    assets.push(
      live({
        assetId: "asset-guide-choose-shoes",
        title: chooseShoes.title,
        url: `/guides/${chooseShoes.slug}`,
        assetType: "buying_guide",
        topics: ["how to choose", "drop", "fit", "cushion"],
        sport: "running",
        audience: ["beginners", "clubs", "coaches"],
        linkabilityScore: 86,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Teaching page for clubs and coaches — pair with the database for numbers."],
        commercialValue: 60,
        organicOpportunity: 82,
        journalistFit: 72,
        communityFit: 90,
        promoteRank: 5,
      }),
    );
  }

  if (dropGuide) {
    assets.push(
      live({
        assetId: "asset-guide-drop",
        title: dropGuide.title,
        url: `/guides/${dropGuide.slug}`,
        assetType: "buying_guide",
        topics: ["drop", "heel-to-toe"],
        sport: "running",
        audience: ["coaches", "curious runners"],
        linkabilityScore: 80,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: true,
        bestPitchAngles: ["Explainer for drop; send data cites to the database."],
        commercialValue: 40,
        organicOpportunity: 75,
        journalistFit: 80,
        communityFit: 70,
        promoteRank: 5,
      }),
    );
  }

  if (cushionGuide) {
    assets.push(
      live({
        assetId: "asset-guide-cushion",
        title: cushionGuide.title,
        url: `/guides/${cushionGuide.slug}`,
        assetType: "buying_guide",
        topics: ["cushion", "stack"],
        sport: "running",
        audience: ["coaches"],
        linkabilityScore: 78,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: true,
        bestPitchAngles: ["Cushioning explainer; stack numbers live in the database."],
        commercialValue: 40,
        organicOpportunity: 72,
        journalistFit: 75,
        communityFit: 65,
        promoteRank: 5,
      }),
    );
  }

  if (watches) {
    assets.push(
      live({
        assetId: "asset-best-running-watches",
        title: watches.title,
        url: `/best/${watches.slug}`,
        assetType: "best_guide",
        topics: ["running watches", "gps"],
        sport: "running",
        audience: ["shoppers"],
        linkabilityScore: 76,
        dataDriven: false,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Watch roundups — only when the story is GPS watches, not shoes."],
        commercialValue: 80,
        organicOpportunity: 78,
        journalistFit: 60,
        communityFit: 50,
        promoteRank: 4,
      }),
    );
  }

  if (watchBeginner) {
    assets.push(
      live({
        assetId: "asset-best-watches-beginners",
        title: watchBeginner.title,
        url: `/best/${watchBeginner.slug}`,
        assetType: "best_guide",
        topics: ["running watches", "beginner"],
        sport: "running",
        audience: ["beginners"],
        linkabilityScore: 70,
        dataDriven: false,
        journalistFriendly: false,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Beginner watch shortlist."],
        commercialValue: 70,
        organicOpportunity: 70,
        journalistFit: 45,
        communityFit: 55,
        promoteRank: 4,
      }),
    );
  }

  assets.push(
    live({
      assetId: "asset-compare",
      title: "Compare running gear",
      url: "/compare",
      assetType: "comparison",
      topics: ["comparison", "vs"],
      sport: "running",
      audience: ["shoppers"],
      linkabilityScore: 68,
      dataDriven: true,
      journalistFriendly: false,
      consumerFriendly: true,
      researchFriendly: false,
      bestPitchAngles: ["Use a specific /compare/[slug] when the matchup exists."],
      commercialValue: 65,
      organicOpportunity: 60,
      journalistFit: 40,
      communityFit: 35,
      promoteRank: 6,
    }),
  );

  if (compareSample) {
    assets.push(
      live({
        assetId: `asset-compare-${compareSample.slug}`,
        title: compareSample.title,
        url: `/compare/${compareSample.slug}`,
        assetType: "comparison",
        topics: ["comparison", "nike", "asics"],
        sport: "running",
        audience: ["shoppers", "gear writers"],
        linkabilityScore: 74,
        dataDriven: true,
        journalistFriendly: true,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Named model matchup for Nike vs ASICS-style stories."],
        commercialValue: 70,
        organicOpportunity: 65,
        journalistFit: 70,
        communityFit: 40,
        promoteRank: 6,
      }),
    );
  }

  const vomeroReview = getReviewBySlug("nike-vomero-18", opts);
  if (vomeroReview) {
    assets.push(
      live({
        assetId: "asset-review-vomero-18",
        title: vomeroReview.title,
        url: `/reviews/${vomeroReview.slug}`,
        assetType: "review",
        topics: ["nike", "vomero", "daily trainers", "review"],
        sport: "running",
        audience: ["shoppers", "gear writers"],
        linkabilityScore: 64,
        dataDriven: false,
        journalistFriendly: false,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: [
          "Pitch an individual review only when the story is that model — never as the default cite.",
        ],
        commercialValue: 75,
        organicOpportunity: 60,
        journalistFit: 35,
        communityFit: 45,
        promoteRank: 7,
      }),
    );
  }

  const asics = getBrandBySlug("asics", opts);
  if (asics) {
    assets.push(
      live({
        assetId: "asset-brand-asics",
        title: `${asics.name} brand hub`,
        url: `/brands/${asics.slug}`,
        assetType: "brand_hub",
        topics: ["asics", "brand"],
        sport: "running",
        audience: ["shoppers"],
        linkabilityScore: 48,
        dataDriven: false,
        journalistFriendly: false,
        consumerFriendly: true,
        researchFriendly: false,
        bestPitchAngles: ["Only when the story is the brand lineup, not a data cite."],
        commercialValue: 55,
        organicOpportunity: 50,
        journalistFit: 25,
        communityFit: 30,
        promoteRank: 8,
      }),
    );
  }

  assets.push(
    live({
      assetId: "asset-methodology",
      title: "How we review",
      url: "/how-we-review",
      assetType: "methodology",
      topics: ["methodology", "trust"],
      sport: "all",
      audience: ["journalists"],
      linkabilityScore: 72,
      dataDriven: false,
      journalistFriendly: true,
      consumerFriendly: false,
      researchFriendly: true,
      bestPitchAngles: ["Process cite when they ask how scores are made."],
      commercialValue: 20,
      organicOpportunity: 40,
      journalistFit: 85,
      communityFit: 20,
      promoteRank: 7,
    }),
  );

  assets.push(
    planned({
      assetId: "asset-research-market-2026",
      title: "Running Shoe Market 2026",
      assetType: "research",
      topics: ["market", "price", "trends", "research"],
      sport: "running",
      audience: ["journalists", "consumer media"],
      linkabilityScore: 94,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: ["Data-led market snapshot — do not pitch until findings exist."],
      commercialValue: 50,
      organicOpportunity: 90,
      journalistFit: 98,
      communityFit: 40,
      promoteRank: 3,
    }),
    planned({
      assetId: "asset-research-weight",
      title: "Running Shoe Weight Study",
      assetType: "research",
      topics: ["weight", "research"],
      sport: "running",
      audience: ["journalists"],
      linkabilityScore: 88,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: ["Lightest daily trainers with sample-size caveats."],
      commercialValue: 30,
      organicOpportunity: 80,
      journalistFit: 90,
      communityFit: 50,
      promoteRank: 3,
    }),
    planned({
      assetId: "asset-research-stack",
      title: "Running Shoe Stack Height Study",
      assetType: "research",
      topics: ["stack", "research"],
      sport: "running",
      audience: ["journalists"],
      linkabilityScore: 88,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: ["Highest-stack cohort with quality exclusions."],
      commercialValue: 30,
      organicOpportunity: 80,
      journalistFit: 90,
      communityFit: 45,
      promoteRank: 3,
    }),
    planned({
      assetId: "asset-research-price",
      title: "Running Shoe Price Study",
      assetType: "research",
      topics: ["price", "research"],
      sport: "running",
      audience: ["journalists", "consumer media"],
      linkabilityScore: 90,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: ["Regional From-price averages by brand — never invented MSRP."],
      commercialValue: 40,
      organicOpportunity: 85,
      journalistFit: 92,
      communityFit: 40,
      promoteRank: 3,
    }),
    planned({
      assetId: "asset-research-carbon",
      title: "Carbon vs Non-Carbon Study",
      assetType: "research",
      topics: ["carbon", "plate", "research"],
      sport: "running",
      audience: ["journalists"],
      linkabilityScore: 86,
      dataDriven: true,
      journalistFriendly: true,
      consumerFriendly: true,
      researchFriendly: true,
      bestPitchAngles: ["Plated vs non-plated weight/price with stated exclusions."],
      commercialValue: 35,
      organicOpportunity: 78,
      journalistFit: 88,
      communityFit: 40,
      promoteRank: 3,
    }),
  );

  return assets.sort((a, b) => a.promoteRank - b.promoteRank || b.linkabilityScore - a.linkabilityScore);
}

export function getAssetById(
  id: string,
  assets = getLinkableAssets(),
): LinkableAsset | undefined {
  return assets.find((a) => a.assetId === id);
}
