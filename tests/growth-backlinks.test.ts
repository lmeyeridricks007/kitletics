import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import robots from "@/app/robots";
import {
  basicAuthOk,
  isAdminGrowthPath,
  should404Admin,
} from "@/lib/admin/growth-gate";
import { scoreOpportunity, priorityBand } from "@/domain/growth/backlinks/scoring";
import {
  pickAssetForOpportunity,
  rankAssetsForOpportunity,
  pitchForAsset,
} from "@/domain/growth/backlinks/matching";
import { getLinkableAssets } from "@/domain/growth/backlinks/assets";
import {
  assessLinkRisk,
  isFabricatedEmail,
  validateContactEmail,
} from "@/domain/growth/backlinks/risk";
import {
  classifyCompetitorIntent,
  detectMetricSource,
  isDuplicateProspect,
  mapImportedBacklinks,
  mapManualProspects,
  parseCsv,
} from "@/domain/growth/backlinks/csv";
import {
  campaignStateAllowed,
  draftOutreach,
  shouldBlockFollowUp,
  suggestedFollowUpIso,
} from "@/domain/growth/backlinks/outreach";
import { buildSeedWorkspace } from "@/domain/growth/backlinks/seed";
import { INITIAL_QUEUE } from "@/domain/growth/backlinks/initial-queue";
import {
  isFirstContact,
  mixCounts,
  top20FirstContact,
} from "@/domain/growth/backlinks/initial-queue-docs";
import { generateDiscoveryQueries } from "@/domain/growth/backlinks/queries";
import { OPPORTUNITY_TYPES } from "@/domain/growth/backlinks/types";

process.env.GROWTH_BACKLINKS_WRITES = "0";

describe("opportunity scoring", () => {
  it("uses the documented weights and bands", () => {
    const high = scoreOpportunity({
      relevance: 96,
      authority: 80,
      assetFit: 96,
      likelihood: 90,
      editorialQuality: 90,
      relationship: 80,
    });
    expect(high.band).toBe("MUST_PURSUE");
    expect(high.overall).toBeGreaterThanOrEqual(90);

    expect(priorityBand(89)).toBe("HIGH");
    expect(priorityBand(74)).toBe("MEDIUM");
    expect(priorityBand(59)).toBe("LOW");
  });

  it("lets a relevant running site outrank an irrelevant high-authority site", () => {
    const relevant = scoreOpportunity({
      relevance: 92,
      authority: 48,
      assetFit: 90,
      likelihood: 55,
      editorialQuality: 78,
      relationship: 20,
    });
    const famous = scoreOpportunity({
      relevance: 38,
      authority: 96,
      assetFit: 40,
      likelihood: 18,
      editorialQuality: 88,
      relationship: 5,
    });
    expect(relevant.overall).toBeGreaterThan(famous.overall);
  });
});

describe("asset matching", () => {
  const assets = getLinkableAssets();

  it("never recommends the homepage", () => {
    for (const type of OPPORTUNITY_TYPES) {
      const ranked = rankAssetsForOpportunity(assets, {
        topic: "running shoes",
        opportunityType: type,
      });
      expect(ranked.some((a) => a.url === "/")).toBe(false);
      expect(pickAssetForOpportunity(assets, { topic: "x", opportunityType: type })?.url).not.toBe(
        "/",
      );
    }
  });

  it("routes price, drop, roundup, club, coach, and brand-compare queries", () => {
    expect(
      pickAssetForOpportunity(assets, {
        topic: "running shoe prices",
        opportunityType: "DATA_CITATION",
      })?.assetId,
    ).toBe("asset-shoe-database");

    const drop = pickAssetForOpportunity(assets, {
      topic: "heel-to-toe drop",
      opportunityType: "DATA_CITATION",
    });
    expect(drop?.assetId === "asset-shoe-database" || drop?.assetId === "asset-guide-drop").toBe(
      true,
    );

    expect(
      pickAssetForOpportunity(assets, {
        topic: "best running shoes roundup",
        opportunityType: "ROUNDUP_INCLUSION",
      })?.assetType,
    ).toBe("best_guide");

    expect(
      pickAssetForOpportunity(assets, {
        topic: "running club beginner resources",
        opportunityType: "RUNNING_CLUB",
      })?.assetId,
    ).toBe("asset-shoe-finder");

    const coach = pickAssetForOpportunity(assets, {
      topic: "daily trainers for easy days",
      opportunityType: "COACH_RESOURCE",
    });
    expect(
      ["asset-guide-choose-shoes", "asset-best-daily-trainers", "asset-shoe-finder"].includes(
        coach?.assetId ?? "",
      ),
    ).toBe(true);

    const vs = pickAssetForOpportunity(assets, {
      topic: "Nike vs ASICS",
      opportunityType: "BRAND_PR",
      text: "comparing Nike and ASICS",
    });
    expect(vs?.assetType === "comparison" || vs?.assetId === "asset-shoe-database").toBe(true);
  });

  it("does not pitch unpublished research as a live URL", () => {
    const pitch = pitchForAsset(
      assets.find((a) => a.assetId === "asset-research-market-2026")!,
      { topic: "market", opportunityType: "DIGITAL_PR" },
    );
    expect(pitch.angle.toLowerCase()).toMatch(/park|future|do not pitch/);
  });

  it("resolves live catalog routes and leaves planned research url empty", () => {
    const db = assets.find((a) => a.assetId === "asset-shoe-database");
    const finder = assets.find((a) => a.assetId === "asset-shoe-finder");
    const planned = assets.filter((a) => a.status === "planned");
    expect(db?.url).toBe("/running/shoes/database");
    expect(finder?.url).toBe("/tools/running-shoe-finder");
    expect(planned.length).toBeGreaterThan(0);
    expect(planned.every((a) => a.url === "")).toBe(true);
  });
});

describe("CSV imports", () => {
  it("maps Ahrefs-style backlink rows and labels the metric source", () => {
    const csv = [
      "Referring domain,Referring page,Target URL,Anchor,Domain Rating,Organic traffic",
      "example-running-lab.com,https://example-running-lab.com/stack,https://runrepeat.com/database,stack height,54,1200",
    ].join("\n");
    expect(detectMetricSource(parseCsv(csv).headers)).toBe("ahrefs");
    const rows = mapImportedBacklinks(csv);
    expect(rows[0]?.referringDomain).toBe("example-running-lab.com");
    expect(rows[0]?.metricSource).toBe("ahrefs");
    expect(rows[0]?.authority).toBe(54);
  });

  it("classifies competitor referring-page intent", () => {
    expect(
      classifyCompetitorIntent(
        "https://site.com/running-shoe-stack-height-explained",
        "database",
        "https://runrepeat.com/running-shoe-database",
      ),
    ).toBe("data_citation");
  });

  it("detects duplicate prospects by host", () => {
    expect(isDuplicateProspect(["www.prorun.nl"], "prorun.nl")).toBe(true);
    expect(isDuplicateProspect(["prorun.nl"], "hardloop.nl")).toBe(false);
  });
});

describe("link quality flags", () => {
  it("flags casino/crypto/guest-post farms as AVOID", () => {
    expect(assessLinkRisk({ domain: "best-casino-loans.com" }).band).toBe("AVOID");
    expect(assessLinkRisk({ domain: "cheap-guestpost-marketplace.com" }).band).toBe("AVOID");
    expect(assessLinkRisk({ domain: "write-for-us-seo.net" }).band).toBe("AVOID");
  });

  it("flags paid/sitewide language as REVIEW", () => {
    expect(
      assessLinkRisk({
        domain: "running-deals.nl",
        notes: "paid placement in footer",
      }).band,
    ).toBe("REVIEW");
  });

  it("keeps a normal running publication SAFE", () => {
    expect(assessLinkRisk({ domain: "prorun.nl", url: "https://www.prorun.nl/" }).band).toBe(
      "SAFE",
    );
  });
});

describe("campaign and outreach states", () => {
  it("allows planned → active and blocks spam follow-ups", () => {
    expect(campaignStateAllowed("planned", "active")).toBe(true);
    expect(campaignStateAllowed("complete", "draft")).toBe(false);
    expect(
      shouldBlockFollowUp({
        outreachStatus: "contacted",
        followUpCount: 2,
        maxFollowUps: 2,
      }),
    ).toBe(true);
    expect(shouldBlockFollowUp({ outreachStatus: "declined", maxFollowUps: 2 })).toBe(true);
  });

  it("suggests a 5–7 day follow-up window", () => {
    const from = new Date("2026-09-13T08:00:00.000Z");
    const next = new Date(suggestedFollowUpIso(from, 6));
    const days = (next.getTime() - from.getTime()) / 86400000;
    expect(days).toBeGreaterThanOrEqual(5);
    expect(days).toBeLessThanOrEqual(7);
  });

  it("drafts outreach that never asks for a backlink", () => {
    const ws = buildSeedWorkspace();
    const opp = ws.opportunities[0]!;
    const asset = getLinkableAssets().find((a) => a.assetId === opp.targetAssetId)!;
    const draft = draftOutreach({ opportunity: opp, asset });
    expect(draft.body.toLowerCase()).not.toMatch(/backlink|link building|guest post farm/);
    expect(draft.subject).toBeTruthy();
    expect(draft.cta.toLowerCase()).not.toContain("please add a backlink");
  });
});

describe("contact validation", () => {
  it("rejects fabricated placeholders and does not invent emails", () => {
    expect(validateContactEmail(undefined).ok).toBe(false);
    expect(isFabricatedEmail("editor@example.com")).toBe(true);
    expect(validateContactEmail("editor@example.com").ok).toBe(false);
    expect(validateContactEmail("not-an-email").ok).toBe(false);
    expect(validateContactEmail("gear@prorun.nl").ok).toBe(true);
  });

  it("drops example.com addresses on prospect CSV import", () => {
    const rows = mapManualProspects(
      "name,domain,email\nFake,fakenews.test,hello@example.com\nOk,prorun.nl,desk@prorun.nl",
    );
    expect(rows.find((r) => r.domain === "fakenews.test")?.contactStatus).toBe(
      "CONTACT_UNKNOWN",
    );
    expect(rows.find((r) => r.domain === "fakenews.test")?.contactEmail).toBeUndefined();
    expect(rows.find((r) => r.domain === "prorun.nl")?.contactEmail).toBe("desk@prorun.nl");
  });

  it("seeds CANDIDATE opportunities and only stores verified public inboxes", () => {
    const ws = buildSeedWorkspace();
    expect(ws.opportunities.every((o) => o.status === "CANDIDATE")).toBe(true);
    expect(ws.prospects.every((p) => !p.contactEmail?.endsWith("@example.com"))).toBe(true);
    const confirmed = ws.prospects.filter((p) => p.contactStatus === "CONFIRMED");
    expect(confirmed.length).toBeGreaterThanOrEqual(1);
    expect(confirmed.every((p) => Boolean(p.contactEmail && p.contactSource))).toBe(true);
    expect(
      ws.prospects
        .filter((p) => p.contactStatus !== "CONFIRMED")
        .every((p) => !p.contactEmail),
    ).toBe(true);
    expect(ws.campaigns.map((c) => c.id).sort()).toEqual([
      "campaign-database",
      "campaign-finder",
      "campaign-forum-answers",
      "campaign-journalist-requests",
      "campaign-market-2026",
    ]);
    expect(ws.campaigns.find((c) => c.id === "campaign-market-2026")?.status).toBe("planned");
  });
});

describe("public vs admin routes", () => {
  it("disallows /admin in robots and gates the path", () => {
    const rules = robots().rules;
    const disallow = (Array.isArray(rules) ? rules[0]?.disallow : rules.disallow) ?? [];
    expect(disallow).toContain("/admin/");
    expect(isAdminGrowthPath("/admin/growth/backlinks")).toBe(true);
    expect(isAdminGrowthPath("/running/shoes/database")).toBe(false);
  });

  it("does not 404 admin in test/dev when no secret is set", () => {
    const prev = process.env.ADMIN_GROWTH_SECRET;
    delete process.env.ADMIN_GROWTH_SECRET;
    expect(should404Admin()).toBe(false);
    expect(basicAuthOk(null)).toBe(true);
    process.env.ADMIN_GROWTH_SECRET = "unit-secret";
    expect(basicAuthOk(null)).toBe(false);
    const token = Buffer.from("kitletics:unit-secret").toString("base64");
    expect(basicAuthOk(`Basic ${token}`)).toBe(true);
    process.env.ADMIN_GROWTH_SECRET = prev;
  });

  it("keeps admin out of the sitemap module", () => {
    const src = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(src).not.toMatch(/["'`]\/admin/);
  });
});

describe("discovery queries", () => {
  it("generates research queries without scraping", () => {
    const q = generateDiscoveryQueries(["runrepeat.com"]);
    expect(q.some((x) => x.query.includes("running shoe database"))).toBe(true);
    expect(q.some((x) => x.query.includes("site:runrepeat.com"))).toBe(true);
  });
});

describe("initial prospecting queue", () => {
  it("keeps page-level rows and does not invent a 100-row pad", () => {
    expect(INITIAL_QUEUE.length).toBeGreaterThanOrEqual(60);
    expect(INITIAL_QUEUE.length).toBeLessThan(100);
    expect(INITIAL_QUEUE.every((s) => /^https?:\/\//.test(s.url))).toBe(true);
    expect(INITIAL_QUEUE.every((s) => s.recommendedAssetId.startsWith("asset-"))).toBe(true);
    expect(INITIAL_QUEUE.some((s) => s.doNotSend)).toBe(true);
    expect(INITIAL_QUEUE.filter(isFirstContact).length).toBeGreaterThan(30);
    const mix = mixCounts();
    expect(mix.publication).toBeGreaterThan(10);
    expect(mix.coach).toBeGreaterThan(5);
  });

  it("returns a 20-domain first-contact list without watchlist rows", () => {
    const ws = buildSeedWorkspace();
    const top = top20FirstContact(ws.opportunities);
    expect(top.length).toBe(20);
    const hosts = new Set(top.map((o) => o.domain.replace(/^www\./, "").toLowerCase()));
    expect(hosts.size).toBe(20);
    expect(top.every((o) => o.status === "CANDIDATE")).toBe(true);
    expect(top.some((o) => /nike\.com|asics\.com|believeintherun|nytimes\.com/i.test(o.domain))).toBe(
      false,
    );
  });
});
