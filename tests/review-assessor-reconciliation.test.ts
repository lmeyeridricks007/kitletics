/**
 * Fix 85 — review assessor reconciliation.
 * Publication quality = enriched decision copy; disclosure ≠ junk P0.
 */

import { describe, expect, it } from "vitest";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { assessReviewArticle } from "@/lib/review/assess-review-article-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessReviewEditorialReadiness } from "@/domain/editorial-readiness/assess";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { getReviews } from "@/repositories";
import { classifyUniqueness } from "@/domain/content-uniqueness";
import {
  articleSeverityToRelease,
  reviewDecisionCopyText,
  REVIEW_QUALITY_SEVERITY_MEANING,
} from "@/lib/review/quality-contract";
import {
  FRIENDLY_TESTING_CONTEXT,
  isReportOrJunkVoice,
} from "@/lib/review/review-voice";
import { auditContentQuality } from "@/domain/site-quality/audits/content";
import { resetIssueCounters } from "@/domain/site-quality/issues";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";
import type { Review } from "@/domain/editorial/types";

const PROD = { isDev: false as const };

function clonePage(slug: string): ReviewPageData {
  const data = getReviewPageData(slug, PROD);
  if (!data) throw new Error(`missing ${slug}`);
  return structuredClone(data);
}

function mutateReview(
  data: ReviewPageData,
  patch: Partial<Review>,
): ReviewPageData {
  return {
    ...data,
    review: { ...data.review, ...patch },
  };
}

describe("Fix 85 review quality contract", () => {
  it("maps article P0 → BLOCKER and documents severities", () => {
    expect(articleSeverityToRelease("P0")).toBe("BLOCKER");
    expect(articleSeverityToRelease("P1")).toBe("HIGH");
    expect(articleSeverityToRelease("P2")).toBe("MEDIUM");
    expect(REVIEW_QUALITY_SEVERITY_MEANING.LOW).toMatch(/source-seed/i);
  });

  it("friendly disclosure matches junk regex but is excluded from decision copy", () => {
    const disclosure = FRIENDLY_TESTING_CONTEXT("Nike Vomero 18");
    expect(isReportOrJunkVoice(disclosure)).toBe(true);
    const data = clonePage("nike-vomero-18");
    const decision = reviewDecisionCopyText(data.review);
    expect(isReportOrJunkVoice(decision)).toBe(false);
    expect(decision).not.toMatch(/Expert Research/i);
  });
});

describe("Fix 85 excellent / flagship Review", () => {
  it("Nike Vomero 18 is LAUNCH_READY + READY with no article P0", () => {
    const data = getReviewPageData("nike-vomero-18", PROD)!;
    expect(data).toBeTruthy();
    const launch = assessReviewLaunchQuality(data.review, PROD);
    const ed = assessReviewEditorialReadiness(data.review, PROD);
    const article = assessReviewArticle(data);
    expect(launch.quality).toBe("LAUNCH_READY");
    expect(ed.ready).toBe(true);
    expect(article.findings.filter((f) => f.severity === "P0")).toEqual([]);
    expect(article.score).toBeGreaterThanOrEqual(90);
  });
});

describe("Fix 85 known failure fixtures", () => {
  it("generic Review: missing audience is P0", () => {
    const data = mutateReview(clonePage("nike-vomero-18"), {
      whoShouldBuy: [],
      whoShouldAvoid: [],
      status: "draft",
    });
    const article = assessReviewArticle(data);
    expect(article.findings.some((f) => f.code === "audience" && f.severity === "P0")).toBe(
      true,
    );
  });

  it("unsupported first-hand on decision copy is P0", () => {
    const data = mutateReview(clonePage("nike-vomero-18"), {
      summary: "We tested this shoe for 200 km and loved the foam.",
      status: "draft",
      evidenceIds: [],
    });
    const article = assessReviewArticle({
      ...data,
      evidence: [],
      hasPersonalTest: false,
    });
    expect(
      article.findings.some(
        (f) => f.code === "first-hand-claim" && f.severity === "P0",
      ),
    ).toBe(true);
  });

  it("junk voice on decision copy is P0; junk only in disclosure is not", () => {
    const cleanDisclosure = mutateReview(clonePage("nike-vomero-18"), {
      testingContext: FRIENDLY_TESTING_CONTEXT("Nike Vomero 18"),
      status: "draft",
    });
    expect(
      assessReviewArticle(cleanDisclosure).findings.some((f) => f.code === "voice"),
    ).toBe(false);

    const junkBody = mutateReview(clonePage("nike-vomero-18"), {
      summary:
        "Expert Research findings: Published measurements are the least ambiguous anchors.",
      status: "draft",
    });
    expect(
      assessReviewArticle(junkBody).findings.some(
        (f) => f.code === "voice" && f.severity === "P0",
      ),
    ).toBe(true);
  });

  it("insufficient evidence surfaces as P1 (not P0) when first-hand is honest", () => {
    const data = mutateReview(clonePage("nike-vomero-18"), {
      evidenceIds: [],
      status: "draft",
      summary:
        "A soft daily trainer for easy miles when you want max cushion without a race-day plate.",
    });
    const article = assessReviewArticle({
      ...data,
      evidence: [],
      hasPersonalTest: false,
    });
    expect(article.findings.some((f) => f.code === "first-hand-claim")).toBe(
      false,
    );
    expect(
      article.findings.some((f) => f.code === "evidence" && f.severity === "P1"),
    ).toBe(true);
  });

  it("duplicative classifier still distinguishes high peer similarity", () => {
    expect(
      classifyUniqueness({
        maxPeerSimilarity: 0.91,
        scaffoldHits: 6,
        uniqueSignalRatio: 0.1,
      }),
    ).toBe("DUPLICATIVE");
    expect(
      classifyUniqueness({
        maxPeerSimilarity: 0.75,
        scaffoldHits: 2,
        uniqueSignalRatio: 0.4,
      }),
    ).toBe("NEEDS_DIFFERENTIATION");
  });
});

describe("Fix 85 source-seed residue vs enriched", () => {
  it("site:audit does not raise CONTENT-002 BLOCKER when enriched sample is clean", () => {
    resetIssueCounters();
    const issues = auditContentQuality();
    const enriched = issues.find((i) => i.id === "CONTENT-002");
    expect(enriched).toBeTruthy();
    expect(enriched!.severity === "BLOCKER").toBe(false);
    expect(["INFO", "LOW"]).toContain(enriched!.severity);

    const source = issues.find((i) => i.id === "CONTENT-002-SOURCE");
    if (source) {
      expect(source.severity).toBe("LOW");
    }

    const articleP0 = issues.find((i) => i.id === "CONTENT-ARTICLE-P0");
    expect(articleP0).toBeTruthy();
    expect(articleP0!.severity).not.toBe("BLOCKER");
  });

  it("flagships stay INDEXABLE without genuine article P0", () => {
    for (const slug of [
      "nike-vomero-18",
      "asics-novablast-6",
      "brooks-glycerin-22",
      "garmin-forerunner-970",
      "hoka-clifton-10",
    ]) {
      const data = getReviewPageData(slug, PROD);
      expect(data, slug).toBeTruthy();
      const elig = getLaunchEligibility(
        { kind: "review", entity: data!.review },
        PROD,
      );
      expect(isIndexableEligibility(elig), slug).toBe(true);
      const p0 = assessReviewArticle(data!).findings.filter(
        (f) => f.severity === "P0",
      );
      expect(p0, `${slug}: ${p0.map((f) => f.code).join(",")}`).toEqual([]);
    }
  });

  it("held reviews are not required to be article-clean", () => {
    const held = getReviews(PROD).filter(
      (r) =>
        !isIndexableEligibility(
          getLaunchEligibility({ kind: "review", entity: r }, PROD),
        ),
    );
    expect(held.length).toBeGreaterThan(0);
    // Smoke: held estate exists; no assertion that they must fail article audit.
    expect(held[0]!.slug).toBeTruthy();
  });
});
