import { describe, expect, it } from "vitest";
import type { BacklinkOpportunity } from "@/domain/growth/backlinks/types";
import { hydrateOpportunity, hydrateWorkspace } from "@/domain/growth/backlinks/hydrate-actionable";
import {
  buildActionQueue,
  contactHref,
  isReadyToContact,
  nextActionLine,
} from "@/domain/growth/backlinks/action-queue";
import { exactOutreach } from "@/domain/growth/backlinks/exact-outreach";
import { decideLinkInclusion } from "@/domain/growth/backlinks/forum-response";
import { DEFAULT_SCORE_WEIGHTS } from "@/domain/growth/backlinks/types";
import { seedForumOpportunities } from "@/domain/growth/backlinks/forum-seed";

process.env.GROWTH_BACKLINKS_WRITES = "0";

function opp(partial: Partial<BacklinkOpportunity>): BacklinkOpportunity {
  return {
    id: "opp-prorun-kies",
    prospectId: "prospect-prorun-nl",
    siteName: "ProRun",
    domain: "prorun.nl",
    url: "https://www.prorun.nl/gadgets_gear/kies-de-juiste-schoen/",
    opportunityType: "RESOURCE_PAGE",
    contactRole: "unknown",
    country: "NL",
    language: "nl",
    market: "NL",
    topic: "Kies de juiste hardloopschoen",
    sport: "running",
    authorityScore: 78,
    relevanceScore: 96,
    likelihoodScore: 68,
    assetFitScore: 90,
    relationshipScore: 22,
    editorialQualityScore: 82,
    overallScore: 86,
    scoreReasons: ["seed"],
    targetAssetId: "asset-shoe-finder",
    targetUrl: "/tools/running-shoe-finder",
    recommendedAnchorContext: "finder",
    pitchAngle: "Finder as vervolgstap",
    whyTheyMightLink: "Education URL",
    whyThisSite: "NL media",
    whyThisAsset: "finder",
    whyThisAngle: "finder",
    evidence: "seed",
    risk: "SAFE",
    riskReasons: [],
    sourceType: "seed",
    discoveredAt: "2026-09-13T08:00:00.000Z",
    status: "CANDIDATE",
    priority: "HIGH",
    outreachStatus: "not_contacted",
    responseStatus: "none",
    metricSource: "editorial_judgment",
    ...partial,
  };
}

describe("actionable outreach queue", () => {
  it("makes ProRun ready with redactie@ and Dutch copy, no placeholders", () => {
    const ready = hydrateOpportunity(opp({}));
    expect(ready.contactEmail).toBe("redactie@prorun.nl");
    expect(ready.contactUrl).toBe("https://www.prorun.nl/contact/");
    expect(ready.contactMethod).toBe("PUBLIC_EMAIL");
    expect(isReadyToContact(ready)).toBe(true);
    expect(ready.actionStatus).toBe("READY_TO_CONTACT");
    expect(ready.outreachMessage).toMatch(/Beste/i);
    expect(ready.outreachMessage).toContain("https://kitletics.com/tools/running-shoe-finder");
    expect(ready.outreachMessage).toContain("https://www.prorun.nl/gadgets_gear/kies-de-juiste-schoen/");
    expect(ready.outreachMessage).not.toMatch(/\[name\]|\[article\]/i);
    expect(nextActionLine(ready)).toBe("Email redactie@prorun.nl");
    expect(contactHref(ready)).toMatch(/^mailto:redactie@prorun\.nl/);
    expect(ready.publicAssetUrl).not.toBe("https://kitletics.com/");
  });

  it("uses Bas Stigter's public inbox for the Bas opportunity only", () => {
    const bas = hydrateOpportunity(opp({ id: "opp-prorun-bas", contactName: "Bas Stigter" }));
    expect(bas.contactEmail).toBe("bas@prorun.nl");
    expect(bas.outreachMessage).toMatch(/Beste Bas/);
  });

  it("keeps Running Warehouse out of READY TO CONTACT", () => {
    const shop = hydrateOpportunity(
      opp({
        id: "opp-rw",
        domain: "runningwarehouse.com",
        siteName: "Running Warehouse",
        language: "en",
        url: "https://www.runningwarehouse.com/catpage-MROAD.html",
      }),
    );
    expect(shop.contactMethod).toBe("CONTACT_NOT_EDITORIAL");
    expect(isReadyToContact(shop)).toBe(false);
    expect(shop.actionStatus).toBe("NOT_ACTIONABLE");
  });

  it("does not treat wisdomrunning about-page as ready (no public inbox)", () => {
    const row = hydrateOpportunity(
      opp({
        id: "opp-wisdom",
        domain: "wisdomrunning.com",
        siteName: "Wisdom Running",
        language: "en",
        url: "https://wisdomrunning.com/heel-to-toe-drop-in-running-shoes/",
        targetUrl: "/running/shoes/database",
      }),
    );
    expect(isReadyToContact(row)).toBe(false);
    expect(row.actionStatus).not.toBe("READY_TO_CONTACT");
  });

  it("writes a Running Channel message that names Mark and the stack-height URL", () => {
    const row = hydrateOpportunity(
      opp({
        id: "opp-running-channel-stack",
        domain: "therunningchannel.com",
        siteName: "The Running Channel",
        language: "en",
        country: "GB",
        contactName: "Mark Dredge",
        url: "https://therunningchannel.com/running-shoe-stack-height/",
        topic: "Running shoe stack height and drop explained",
        targetUrl: "/running/shoes/database",
      }),
    );
    expect(isReadyToContact(row)).toBe(true);
    expect(row.contactEmail).toBe("mark@therunningchannel.com");
    expect(row.outreachMessage).toMatch(/^Hi Mark,/);
    expect(row.outreachMessage).toContain("https://therunningchannel.com/running-shoe-stack-height/");
    expect(row.outreachMessage).toContain("https://kitletics.com/running/shoes/database");
    const words = row.outreachMessage!.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(60);
    expect(words).toBeLessThanOrEqual(160);
  });

  it("keeps do-not-send rows out of the action queue", () => {
    const row = hydrateOpportunity(
      opp({
        id: "opp-bitr",
        domain: "believeintherun.com",
        notes: "DO NOT SEND this month.",
        url: "https://believeintherun.com/running-shoe-reviews/",
      }),
    );
    const ws = hydrateWorkspace({
      version: 1,
      updatedAt: "2026-09-13T08:00:00.000Z",
      settings: {
        scoreWeights: DEFAULT_SCORE_WEIGHTS,
        competitorDomains: [],
        followUpDays: 6,
        maxFollowUps: 2,
      },
      prospects: [],
      opportunities: [row],
      journalists: [],
      sourceRequests: [],
      campaigns: [],
      earnedLinks: [],
      researchIdeas: [],
      discoveryQueries: [],
    });
    const queue = buildActionQueue(ws);
    expect(queue.doTheseToday.some((o) => o.id === "opp-bitr")).toBe(false);
    expect(queue.notActionable.some((o) => o.id === "opp-bitr" || /DO NOT SEND/.test(o.notes ?? ""))).toBe(
      true,
    );
  });

  it("never recommends a Kitletics URL while forum rules are unknown", () => {
    const decision = decideLinkInclusion({
      rulesStatus: "RULES_UNKNOWN",
      selfPromotionPolicy: "UNKNOWN",
      pageDirectlyAnswers: true,
      addsData: true,
      userWouldBenefit: true,
      accountTrustOk: true,
      threadSpamSensitive: false,
    });
    expect(decision.recommendation).toBe("NO_LINK");
    for (const forum of seedForumOpportunities()) {
      expect(forum.linkRecommendation).toBe("NO_LINK");
      expect(forum.suggestedResponse).not.toMatch(/kitletics\.com/i);
    }
  });

  it("generic exact outreach has no homepage promote URL", () => {
    const draft = exactOutreach(
      opp({
        language: "en",
        contactName: "Mario Fraioli",
        domain: "themorningshakeout.com",
        url: "https://themorningshakeout.com/a-running-resource/",
        publicAssetUrl: "https://kitletics.com/running/shoes/database",
      }),
    );
    expect(draft.publicAssetUrl).toBe("https://kitletics.com/running/shoes/database");
    expect(draft.message).not.toMatch(/Hi \[name\]/i);
  });
});
