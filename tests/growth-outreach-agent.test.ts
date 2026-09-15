import { describe, expect, it } from "vitest";
import {
  DEFAULT_OUTREACH_SCORE_WEIGHTS,
  DEFAULT_SCORE_WEIGHTS,
  type BacklinkWorkspace,
  type CommunityPolicy,
  type LinkableAsset,
  type ResearchIdea,
  type SourceRequest,
} from "@/domain/growth/backlinks/types";
import { resolveOpportunityType } from "@/domain/growth/backlinks/type-aliases";
import {
  scoreOpportunity,
  scoreOutreachOpportunity,
  shouldRecommendEngagement,
} from "@/domain/growth/backlinks/scoring";
import {
  containsBannedForumCopy,
  decideLinkInclusion,
  detectForumIntent,
  generateForumResponse,
  pickForumAsset,
} from "@/domain/growth/backlinks/forum-response";
import { digitalPrPacketFromIdea } from "@/domain/growth/backlinks/digital-pr";
import {
  AUTO_POST_FORBIDDEN,
  evaluateForumThread,
  evaluateJournalistRequest,
  ingestForumThreads,
} from "@/domain/growth/backlinks/outreach-agent";
import { seedCommunities } from "@/domain/growth/backlinks/communities";
import { pickAssetForOpportunity } from "@/domain/growth/backlinks/matching";

process.env.GROWTH_BACKLINKS_WRITES = "0";

function asset(partial: Partial<LinkableAsset> = {}): LinkableAsset {
  return {
    assetId: "asset-shoe-database",
    title: "Running Shoe Database",
    url: "/running/shoes/database",
    assetType: "database",
    topics: ["running shoes", "drop", "stack"],
    sport: "running",
    audience: ["runners"],
    linkabilityScore: 96,
    dataDriven: true,
    journalistFriendly: true,
    consumerFriendly: true,
    researchFriendly: true,
    bestPitchAngles: ["Cite the catalog"],
    markets: ["NL"],
    languages: ["en"],
    status: "live",
    commercialValue: 70,
    organicOpportunity: 90,
    journalistFit: 95,
    communityFit: 75,
    promoteRank: 1,
    ...partial,
  };
}

const ASSETS: LinkableAsset[] = [
  asset(),
  asset({
    assetId: "asset-shoe-finder",
    title: "Running Shoe Finder",
    url: "/tools/running-shoe-finder",
    assetType: "tool",
    dataDriven: false,
    promoteRank: 2,
  }),
  asset({
    assetId: "asset-compare",
    title: "Compare running shoes",
    url: "/compare",
    assetType: "comparison",
    promoteRank: 3,
  }),
  asset({
    assetId: "asset-best-daily-trainers",
    title: "Best Daily Trainers",
    url: "/best/daily-trainers",
    assetType: "best_guide",
    dataDriven: false,
    promoteRank: 4,
  }),
  asset({
    url: "/",
    assetId: "asset-home",
    title: "Homepage",
    assetType: "category_hub",
  }),
];

function ws(partial: Partial<BacklinkWorkspace> = {}): BacklinkWorkspace {
  return {
    version: 1,
    updatedAt: "2026-09-13T08:00:00.000Z",
    settings: {
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      outreachScoreWeights: DEFAULT_OUTREACH_SCORE_WEIGHTS,
      competitorDomains: ["runrepeat.com"],
      followUpDays: 6,
      maxFollowUps: 2,
    },
    prospects: [],
    opportunities: [],
    journalists: [],
    sourceRequests: [],
    campaigns: [],
    earnedLinks: [],
    researchIdeas: [],
    discoveryQueries: [],
    weeklyRuns: [],
    communities: seedCommunities(),
    communityHistory: [],
    ...partial,
  };
}

describe("opportunity type aliases", () => {
  it("maps the brief names onto existing CRM types", () => {
    expect(resolveOpportunityType("JOURNALIST_REQUEST")).toBe("JOURNALIST_SOURCE_REQUEST");
    expect(resolveOpportunityType("ROUNDUP")).toBe("ROUNDUP_INCLUSION");
    expect(resolveOpportunityType("BROKEN_LINK")).toBe("BROKEN_LINK_REPLACEMENT");
    expect(resolveOpportunityType("SPORTS_SCIENCE")).toBe("UNIVERSITY_RESEARCH");
    expect(resolveOpportunityType("REDDIT_THREAD")).toBe("REDDIT_THREAD");
  });
});

describe("outreach scoring", () => {
  it("does not replace editorial seed weights", () => {
    expect(DEFAULT_SCORE_WEIGHTS.relevance).toBe(0.3);
    expect(DEFAULT_OUTREACH_SCORE_WEIGHTS.relevance).toBe(0.25);
    const editorial = scoreOpportunity({
      relevance: 80,
      authority: 80,
      assetFit: 80,
      likelihood: 80,
      editorialQuality: 80,
      relationship: 80,
    });
    expect(editorial.overall).toBe(80);
  });

  it("applies spam risk as a penalty and explains the score", () => {
    const clean = scoreOutreachOpportunity({
      relevance: 80,
      assetFit: 80,
      likelihood: 80,
      authority: 80,
      helpfulness: 80,
      relationship: 80,
      spamRisk: 0,
      communityFit: 80,
      linkNecessity: 50,
      responseUrgency: 50,
    });
    const dirty = scoreOutreachOpportunity({
      relevance: 80,
      assetFit: 80,
      likelihood: 80,
      authority: 80,
      helpfulness: 80,
      relationship: 80,
      spamRisk: 50,
      communityFit: 80,
      linkNecessity: 50,
      responseUrgency: 50,
    });
    expect(clean.overall).toBe(80);
    expect(dirty.overall).toBe(60);
    expect(dirty.reasons.some((r) => /Spam risk 50/.test(r))).toBe(true);
  });

  it("blocks engagement when helpfulness, fit, or spam fail the gate", () => {
    expect(
      shouldRecommendEngagement({ helpfulness: 82, communityFit: 78, spamRisk: 30 }).ok,
    ).toBe(true);
    expect(
      shouldRecommendEngagement({ helpfulness: 40, communityFit: 78, spamRisk: 30 }).ok,
    ).toBe(false);
  });
});

describe("forum link decision", () => {
  it("never emits LINK_RECOMMENDED when rules are unknown", () => {
    const decision = decideLinkInclusion({
      rulesStatus: "RULES_UNKNOWN",
      selfPromotionPolicy: "UNKNOWN",
      pageDirectlyAnswers: true,
      addsData: true,
      userWouldBenefit: true,
      accountTrustOk: true,
      threadSpamSensitive: false,
    });
    expect(decision.recommendation).not.toBe("LINK_RECOMMENDED");
    expect(decision.reason).toMatch(/RULES_UNKNOWN/);
  });

  it("emits LINK_RECOMMENDED only when rules are known and the page helps", () => {
    const yes = decideLinkInclusion({
      rulesStatus: "KNOWN",
      selfPromotionPolicy: "RESOURCE_OK",
      pageDirectlyAnswers: true,
      addsData: true,
      userWouldBenefit: true,
      accountTrustOk: true,
      threadSpamSensitive: false,
    });
    expect(yes.recommendation).toBe("LINK_RECOMMENDED");
    const no = decideLinkInclusion({
      rulesStatus: "KNOWN",
      selfPromotionPolicy: "FORBIDDEN",
      pageDirectlyAnswers: true,
      addsData: true,
      userWouldBenefit: true,
      accountTrustOk: true,
      threadSpamSensitive: false,
    });
    expect(no.recommendation).toBe("NO_LINK");
  });
});

describe("forum responses", () => {
  it("answers the question without marketing copy or a homepage default", () => {
    expect(pickForumAsset(ASSETS, "recommend_shoes")?.url).not.toBe("/");
    expect(pickForumAsset(ASSETS, "database")?.assetId).toBe("asset-shoe-database");
    expect(detectForumIntent("Novablast vs Ghost for daily miles")).toBe("model_vs");
    const a = generateForumResponse({
      question: "What running shoes should I buy for easy miles?",
      intent: "recommend_shoes",
      threadUrl: "https://www.reddit.com/r/running/comments/aaa",
      asset: ASSETS[1],
      linkRecommendation: "NO_LINK",
    });
    const b = generateForumResponse({
      question: "Novablast vs Ghost — which for long runs?",
      intent: "model_vs",
      threadUrl: "https://www.reddit.com/r/RunningShoeGeeks/comments/bbb",
      asset: ASSETS[2],
      linkRecommendation: "NO_LINK",
    });
    expect(containsBannedForumCopy(a)).toBe(false);
    expect(containsBannedForumCopy(b)).toBe(false);
    expect(a).not.toBe(b);
    expect(a.toLowerCase()).not.toMatch(/check out kitletics/);
    expect(a).not.toMatch(/we tested/i);
  });
});

describe("outreach agent", () => {
  it("never auto-posts and stays CANDIDATE with CONTACT_UNKNOWN", () => {
    expect(AUTO_POST_FORBIDDEN).toBe(true);
    const result = evaluateForumThread(
      {
        subreddit: "running",
        threadUrl: "https://www.reddit.com/r/running/comments/abc123/shoes/",
        question: "What running shoes should I buy for marathon training?",
        threadAgeHours: 6,
        commentCount: 4,
      },
      { workspace: ws(), assets: ASSETS, now: "2026-09-13T08:00:00.000Z" },
    );
    expect(result.autoPost).toBe(false);
    expect(result.opportunity.status).toBe("CANDIDATE");
    expect(result.opportunity.contactEmail).toBeUndefined();
    expect(result.opportunity.targetUrl).not.toBe("/");
    expect(result.opportunity.linkRecommendation).not.toBe("LINK_RECOMMENDED");
    expect(result.forum?.suggestedAnswer).toBeTruthy();
    expect(result.nextAction).toMatch(/Never auto-post/i);
  });

  it("does not recommend engagement on a weak/spammy community", () => {
    const result = evaluateForumThread(
      {
        communityId: "comm-facebook-running",
        threadUrl: "https://www.facebook.com/groups/example/posts/1",
        question: "any shoe recs?",
        threadSpamSensitive: true,
      },
      { workspace: ws(), assets: ASSETS },
    );
    expect(result.engage).toBe(false);
    expect(result.opportunity.linkRecommendation).toBe("NO_LINK");
  });

  it("ingests unique threads into the existing CRM without a second database", () => {
    const first = ingestForumThreads(
      ws(),
      [
        {
          subreddit: "running",
          threadUrl: "https://www.reddit.com/r/running/comments/one/",
          question: "Best daily trainer for 50 km weeks?",
        },
      ],
      ASSETS,
      "2026-09-13T08:00:00.000Z",
    );
    expect(first.created).toBe(1);
    expect(first.workspace.opportunities[0]?.campaignId).toBe("campaign-forum-answers");
    const second = ingestForumThreads(
      first.workspace,
      [
        {
          subreddit: "running",
          threadUrl: "https://www.reddit.com/r/running/comments/one/",
          question: "Best daily trainer for 50 km weeks?",
        },
      ],
      ASSETS,
    );
    expect(second.created).toBe(0);
    expect(second.skipped).toBe(1);
  });

  it("keeps journalist names and emails UNKNOWN when the request did not include them", () => {
    const request: SourceRequest = {
      id: "req-1",
      platform: "HARO",
      requestTitle: "Need running shoe data",
      topic: "running shoe stack height",
      requirements: "Looking for current stack-height data, not a sales pitch.",
      opportunityScore: 70,
      suggestedResponseAngle: "Offer the live database coverage line.",
      status: "new",
      deadline: "2026-09-14T12:00:00.000Z",
    };
    const result = evaluateJournalistRequest(request, {
      assets: ASSETS,
      now: "2026-09-13T08:00:00.000Z",
    });
    expect(result.outreach?.contact).toBe("UNKNOWN");
    expect(result.outreach?.publication).toBe("UNKNOWN");
    expect(result.opportunity.contactEmail).toBeUndefined();
    expect(result.opportunity.campaignId).toBe("campaign-journalist-requests");
    expect(result.opportunity.suggestedResponse).not.toMatch(/\d{2,}% of runners/);
  });
});

describe("digital PR packets", () => {
  it("emits nothing unless the finding is proven, and does not invent n=", () => {
    const idea: ResearchIdea = {
      id: "idea-x",
      headline: "Average price",
      datasetRequired: "From-prices",
      newsworthiness: 80,
      targetPublications: ["running media"],
      targetJournalistIds: [],
      targetAssetId: "asset-shoe-database",
      status: "idea",
      findingProven: false,
    };
    expect(digitalPrPacketFromIdea(idea)).toBeNull();
    expect(
      digitalPrPacketFromIdea({
        ...idea,
        findingProven: true,
        findingSummary: "Brand averages from verified NL offers. Not MSRP.",
      })?.sampleSize,
    ).toBe("UNKNOWN");
    expect(
      digitalPrPacketFromIdea({
        ...idea,
        findingProven: true,
        findingSummary: "Computable now. n=40/120.",
      })?.sampleSize,
    ).toBe("40 of 120");
  });
});

describe("matching still skips homepage for new types", () => {
  it("never returns /", () => {
    for (const type of ["FORUM_THREAD", "REDDIT_THREAD", "UNLINKED_MENTION"] as const) {
      expect(
        pickAssetForOpportunity(ASSETS, { topic: "running shoes", opportunityType: type })?.url,
      ).not.toBe("/");
    }
  });
});

describe("community registry", () => {
  it("stores locators without inventing posting permission", () => {
    const rows = seedCommunities();
    expect(rows.length).toBeGreaterThan(5);
    expect(rows.every((c: CommunityPolicy) => c.rulesStatus === "RULES_UNKNOWN")).toBe(true);
    expect(rows.every((c) => c.selfPromotionPolicy === "UNKNOWN")).toBe(true);
    expect(rows.every((c) => c.karmaRequirements === "UNKNOWN")).toBe(true);
  });
});
