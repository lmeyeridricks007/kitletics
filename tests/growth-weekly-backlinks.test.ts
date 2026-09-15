import { describe, expect, it } from "vitest";
import { DEFAULT_SCORE_WEIGHTS } from "@/domain/growth/backlinks/types";
import type {
  BacklinkOpportunity,
  BacklinkWorkspace,
  EarnedLink,
  LinkableAsset,
} from "@/domain/growth/backlinks/types";
import {
  isDuplicateOpportunity,
  normalizeOpportunityUrl,
  renderWeeklyReport,
  runWeeklyWorkflow,
} from "@/domain/growth/backlinks/weekly";
import { LEARNING_MIN_SAMPLE, buildLearningReport, formatRate } from "@/domain/growth/backlinks/learning";
import { weeklyDiscoveryQueries } from "@/domain/growth/backlinks/weekly-queries";

process.env.GROWTH_BACKLINKS_WRITES = "0";

const NOW = "2026-09-20T08:00:00.000Z";
const LAST_WEEK = "2026-09-13T08:00:00.000Z";

function asset(partial: Partial<LinkableAsset> = {}): LinkableAsset {
  return {
    assetId: "asset-shoe-database",
    title: "Running Shoe Database",
    url: "/running/shoes/database",
    assetType: "database",
    topics: ["running shoes", "drop", "stack"],
    sport: "running",
    audience: ["journalists"],
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

function opp(partial: Partial<BacklinkOpportunity>): BacklinkOpportunity {
  return {
    id: "opp-seed-1",
    prospectId: "prospect-prorun-nl",
    siteName: "ProRun",
    domain: "prorun.nl",
    url: "https://www.prorun.nl/gadgets_gear/kies-de-juiste-schoen/",
    opportunityType: "RESOURCE_PAGE",
    contactRole: "unknown",
    country: "NL",
    language: "nl",
    market: "NL",
    topic: "kies de juiste schoen",
    sport: "running",
    authorityScore: 78,
    relevanceScore: 90,
    likelihoodScore: 62,
    assetFitScore: 96,
    relationshipScore: 20,
    editorialQualityScore: 82,
    overallScore: 82,
    scoreReasons: ["seed"],
    targetAssetId: "asset-shoe-database",
    targetUrl: "/running/shoes/database",
    recommendedAnchorContext: "database",
    pitchAngle: "Offer a live catalog",
    whyTheyMightLink: "Education URL",
    whyThisSite: "NL media",
    whyThisAsset: "database",
    whyThisAngle: "catalog",
    evidence: "seed",
    risk: "SAFE",
    riskReasons: [],
    sourceType: "seed",
    discoveredAt: LAST_WEEK,
    status: "CANDIDATE",
    priority: "HIGH",
    outreachStatus: "not_contacted",
    responseStatus: "none",
    metricSource: "editorial_judgment",
    ...partial,
  };
}

function emptyWs(partial: Partial<BacklinkWorkspace> = {}): BacklinkWorkspace {
  return {
    version: 1,
    updatedAt: LAST_WEEK,
    settings: {
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      competitorDomains: ["runrepeat.com"],
      followUpDays: 6,
      maxFollowUps: 2,
    },
    prospects: [
      {
        id: "prospect-prorun-nl",
        name: "ProRun",
        domain: "prorun.nl",
        homepageUrl: "https://www.prorun.nl/",
        category: "RUNNING_MEDIA",
        country: "NL",
        language: "nl",
        market: "NL",
        whyRelevant: "NL running title",
        contactStatus: "CONTACT_UNKNOWN",
        contactRole: "unknown",
      },
    ],
    opportunities: [opp({})],
    journalists: [],
    sourceRequests: [],
    campaigns: [],
    earnedLinks: [],
    researchIdeas: [],
    discoveryQueries: [],
    weeklyRuns: [],
    ...partial,
  };
}

describe("weekly dedupe", () => {
  it("normalizes www and trailing slash", () => {
    expect(normalizeOpportunityUrl("https://www.Prorun.nl/foo/")).toBe(
      "https://prorun.nl/foo",
    );
  });

  it("treats the same page URL as a duplicate", () => {
    expect(
      isDuplicateOpportunity([opp({})], {
        url: "https://prorun.nl/gadgets_gear/kies-de-juiste-schoen",
        domain: "prorun.nl",
        opportunityType: "DATA_CITATION",
        targetAssetId: "asset-shoe-finder",
      }),
    ).toBe(true);
  });

  it("does not recycle an open outreach domain+asset", () => {
    expect(
      isDuplicateOpportunity(
        [opp({ outreachStatus: "contacted", targetAssetId: "asset-shoe-database" })],
        {
          url: "https://www.prorun.nl/other-education",
          domain: "prorun.nl",
          opportunityType: "DATA_CITATION",
          targetAssetId: "asset-shoe-database",
        },
      ),
    ).toBe(true);
  });
});

describe("weekly workflow", () => {
  const assets = [
    asset(),
    asset({
      assetId: "asset-shoe-finder",
      title: "Running Shoe Finder",
      url: "/tools/running-shoe-finder",
      assetType: "tool",
      topics: ["finder", "running shoes"],
      linkabilityScore: 92,
    }),
  ];

  it("does not list seed rows as NEW when nothing is ingested", () => {
    const { digest } = runWeeklyWorkflow(emptyWs(), { now: NOW, since: NOW }, assets);
    expect(digest.newMustPursue).toEqual([]);
    expect(digest.newHigh).toEqual([]);
    expect(digest.notes.some((n) => /No new scored/i.test(n))).toBe(true);
  });

  it("scores a new competitor referring page and skips a duplicate URL on the second run", () => {
    const csv = [
      "Referring domain,Referring page,Target URL,Anchor,Domain Rating",
      "shoefacts.test,https://shoefacts.test/drop-table,https://runrepeat.com/database,stack height,54",
    ].join("\n");
    const first = runWeeklyWorkflow(
      emptyWs(),
      { now: NOW, since: LAST_WEEK, competitorCsv: csv },
      assets,
    );
    expect(first.digest.ingested.competitor).toBe(1);
    expect(first.digest.skippedDuplicates).toBe(0);
    expect(first.workspace.opportunities.some((o) => o.domain === "shoefacts.test")).toBe(
      true,
    );
    expect(
      [...first.digest.newMustPursue, ...first.digest.newHigh].some((c) =>
        c.url.includes("shoefacts.test"),
      ),
    ).toBe(true);

    const second = runWeeklyWorkflow(
      first.workspace,
      { now: "2026-09-27T08:00:00.000Z", since: NOW, competitorCsv: csv },
      assets,
    );
    expect(second.digest.ingested.competitor).toBe(0);
    expect(second.digest.skippedDuplicates).toBeGreaterThanOrEqual(1);
    expect(second.digest.newHigh).toEqual([]);
  });

  it("lists follow-ups due and earned vs lost links in the window", () => {
    const earned: EarnedLink = {
      id: "el-1",
      sourceDomain: "wisdomrunning.com",
      sourceUrl: "https://wisdomrunning.com/heel-to-toe-drop-in-running-shoes/",
      targetUrl: "/running/shoes/database",
      firstSeen: "2026-09-18T00:00:00.000Z",
      lastChecked: NOW,
      linkType: "editorial",
      nofollow: false,
      sponsored: false,
      ugc: false,
      status: "LIVE",
    };
    const lost: EarnedLink = {
      ...earned,
      id: "el-2",
      sourceUrl: "https://old.test/gone",
      sourceDomain: "old.test",
      status: "REMOVED",
      lastChecked: "2026-09-19T00:00:00.000Z",
    };
    const ws = emptyWs({
      opportunities: [
        opp({
          id: "opp-follow",
          outreachStatus: "contacted",
          firstContactedAt: LAST_WEEK,
          nextFollowUpAt: "2026-09-19T08:00:00.000Z",
          followUpCount: 0,
        }),
      ],
      earnedLinks: [earned, lost],
    });
    const { digest } = runWeeklyWorkflow(ws, { now: NOW, since: LAST_WEEK }, assets);
    expect(digest.followUpDue.map((c) => c.id)).toContain("opp-follow");
    expect(digest.linksEarned.map((l) => l.id)).toContain("el-1");
    expect(digest.linksLost.map((l) => l.id)).toContain("el-2");
  });

  it("renders the required report sections", () => {
    const { digest } = runWeeklyWorkflow(emptyWs(), { now: NOW, since: NOW }, assets);
    const md = renderWeeklyReport(digest);
    for (const h of [
      "NEW MUST PURSUE",
      "NEW HIGH",
      "FORUMS TO RESPOND TO",
      "JOURNALIST DEADLINES",
      "FOLLOW-UP DUE",
      "LINKS EARNED",
      "EARNED MENTIONS",
      "LINKS LOST",
      "Learning loop",
    ]) {
      expect(md).toContain(h);
    }
    expect(md.toLowerCase()).not.toMatch(/please add a backlink/);
    expect(md.toLowerCase()).not.toMatch(/confirm masthead/);
    expect(md).toContain("DO THESE TODAY");
  });
});

describe("learning loop", () => {
  it("withholds rates and weight changes below the sample floor", () => {
    const ws = emptyWs({
      opportunities: [
        opp({ id: "a", outreachStatus: "contacted" }),
        opp({ id: "b", outreachStatus: "link_earned", domain: "other.test" }),
      ],
    });
    const report = buildLearningReport(ws, [asset()]);
    expect(report.overall.contacted).toBeLessThan(LEARNING_MIN_SAMPLE);
    expect(report.overall.responseRate).toBeUndefined();
    expect(formatRate(report.overall)).toMatch(/insufficient evidence/);
    expect(report.suggestions.some((s) => /Insufficient evidence to change score weights/i.test(s))).toBe(
      true,
    );
  });

  it("reports rates only once contacted n meets the floor, without applying weights", () => {
    const opportunities = Array.from({ length: 12 }, (_, i) =>
      opp({
        id: `opp-${i}`,
        domain: `site${i}.test`,
        prospectId: `p-${i}`,
        outreachStatus: i < 3 ? "link_earned" : "contacted",
        pitchAngle: "Offer a live catalog",
      }),
    );
    const ws = emptyWs({
      prospects: opportunities.map((o) => ({
        id: o.prospectId,
        name: o.domain,
        domain: o.domain,
        homepageUrl: `https://${o.domain}`,
        category: "RUNNING_MEDIA" as const,
        country: "US",
        language: "en",
        market: "US",
        whyRelevant: "test",
        contactStatus: "CONTACT_UNKNOWN" as const,
        contactRole: "unknown" as const,
      })),
      opportunities,
    });
    const before = ws.settings.scoreWeights;
    const report = buildLearningReport(ws, [asset()]);
    expect(report.overall.contacted).toBe(12);
    expect(report.overall.earnedRate).toBeCloseTo(3 / 12);
    expect(ws.settings.scoreWeights).toEqual(before);
  });
});

describe("weekly discovery queries", () => {
  it("covers the find buckets without scraping", () => {
    const q = weeklyDiscoveryQueries();
    const intents = new Set(q.map((x) => x.intent));
    expect(intents.has("competitor_gap")).toBe(true);
    expect(intents.has("resource_page")).toBe(true);
    expect(intents.has("journalist")).toBe(true);
    expect(intents.has("data_citation")).toBe(true);
    expect(intents.has("running_club")).toBe(true);
    expect(intents.has("newsletter_podcast")).toBe(true);
    expect(intents.has("forum_thread")).toBe(true);
    expect(q.every((x) => x.query.length > 10)).toBe(true);
  });
});
