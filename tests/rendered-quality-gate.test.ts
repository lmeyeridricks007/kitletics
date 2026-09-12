import { describe, expect, it } from "vitest";
import { inspectPages, runRenderedQualityGate } from "@/lib/rendered-quality/run";
import { issuesFromRenderedReport } from "@/domain/site-quality/audits/rendered-quality";
import { resetIssueCounters } from "@/domain/site-quality/issues";
import type { RenderedQualityReport, VisiblePage } from "@/lib/rendered-quality/types";
import {
  FIXTURE_CONCATENATED_METHODOLOGY,
  FIXTURE_MACHINE_BUY_IF,
  FIXTURE_NOVABLAST_SKU_STAMP,
  FIXTURE_PADEL_RUNNING_WATCH_IMAGE,
  FIXTURE_SKYLINE_WATCH_GUIDE,
  FIXTURE_WRONG_PRODUCT_CARD,
} from "@/lib/rendered-quality/fixtures";
import { enumerateIndexableUrls } from "@/lib/rendered-quality/enumerate";
import { inspectPublicContentCorruption } from "@/lib/review/public-content-corruption";

describe("rendered quality regression fixtures", () => {
  it("blocks Novablast skuStamp leaks", () => {
    const issues = inspectPages([FIXTURE_NOVABLAST_SKU_STAMP]);
    expect(issues.some((i) => i.severity === "BLOCKER" && i.issueClass === "TOKEN_LEAK")).toBe(
      true,
    );
  });

  it("blocks concatenated methodology tokens", () => {
    const issues = inspectPages([FIXTURE_CONCATENATED_METHODOLOGY]);
    expect(
      issues.some(
        (i) =>
          i.severity === "BLOCKER" &&
          (i.issueClass === "TOKEN_LEAK" || i.issue.includes("concatenated")),
      ),
    ).toBe(true);
    expect(
      inspectPublicContentCorruption(FIXTURE_CONCATENATED_METHODOLOGY.components[0]!.text),
    ).toContain("concatenated_token");
  });

  it("blocks machine Buy If templates", () => {
    const issues = inspectPages([FIXTURE_MACHINE_BUY_IF]);
    expect(
      issues.some(
        (i) => i.issueClass === "DECISION_COPY" && i.issue.includes("MACHINE_LIKE"),
      ),
    ).toBe(true);
  });

  it("hard-fails a padel image on a running-watch guide", () => {
    const issues = inspectPages([FIXTURE_PADEL_RUNNING_WATCH_IMAGE]);
    expect(
      issues.some(
        (i) => i.severity === "BLOCKER" && i.issueClass === "IMAGE_SEMANTIC",
      ),
    ).toBe(true);
  });

  it("hard-fails a skyline photo as a watch-guide primary", () => {
    const issues = inspectPages([FIXTURE_SKYLINE_WATCH_GUIDE]);
    expect(
      issues.some(
        (i) => i.severity === "BLOCKER" && i.issueClass === "IMAGE_SEMANTIC",
      ),
    ).toBe(true);
  });

  it("hard-fails a wrong-product card image", () => {
    const issues = inspectPages([FIXTURE_WRONG_PRODUCT_CARD]);
    expect(issues.some((i) => i.issue === "wrong_product_card")).toBe(true);
  });

  it("does not treat abbreviated Supercomp heroes as a different product", () => {
    const page: VisiblePage = {
      ...FIXTURE_WRONG_PRODUCT_CARD,
      path: "/products/new-balance-fuelcell-supercomp-elite-v4",
      url: "https://kitletics.com/products/new-balance-fuelcell-supercomp-elite-v4",
      entity: {
        kind: "product",
        id: "prod-sc-elite-v4",
        slug: "new-balance-fuelcell-supercomp-elite-v4",
      },
      images: [
        {
          src: "/images/running/products/sc-elite-v4-hero.jpg",
          alt: "Supercomp Elite v4",
          component: "pdp.hero",
          placement: "primary",
        },
      ],
    };
    const issues = inspectPages([page]);
    expect(issues.some((i) => i.issue === "wrong_product_card")).toBe(false);
  });
});

describe("rendered quality enumeration", () => {
  it("enumerates every indexable sitemap URL (no 15-page sample)", () => {
    const urls = enumerateIndexableUrls();
    expect(urls.length).toBeGreaterThan(100);
    expect(urls.some((u) => u.path.startsWith("/reviews/"))).toBe(true);
    expect(urls.some((u) => u.path.startsWith("/products/"))).toBe(true);
  });
});

describe("cross-surface + launch contract", () => {
  it("one upstream leak is one root cause and flags every placement URL", () => {
    const review = FIXTURE_NOVABLAST_SKU_STAMP;
    const pdp: VisiblePage = {
      ...FIXTURE_NOVABLAST_SKU_STAMP,
      path: "/products/asics-novablast-6",
      url: "https://kitletics.com/products/asics-novablast-6",
      template: "product",
      entity: { kind: "product", id: "prod-novablast-6", slug: "asics-novablast-6" },
      source: review.entity,
    };
    const { report } = runRenderedQualityGate({ pages: [review, pdp] });
    expect(report.blockerUrls).toBe(2);
    expect(
      report.issues.some(
        (i) =>
          i.placements?.includes(review.url) && i.placements.includes(pdp.url),
      ),
    ).toBe(true);
  });

  it("HIGH content-sanity does not make launch NOT READY; missing report does", () => {
    resetIssueCounters();
    expect(
      issuesFromRenderedReport(null).some(
        (i) => i.id === "RENDERED-ESTATE" && i.severity === "BLOCKER",
      ),
    ).toBe(true);

    resetIssueCounters();
    const visual = {
      requiredForRelease: true as const,
      path: "docs/remediation/data/image-semantic-visual/summary.json",
      present: true,
      blockerCount: 0,
      status: "PASS" as const,
    };
    const highOnly: RenderedQualityReport = {
      generatedAt: "2026-09-12T00:00:00.000Z",
      principle: "QUALITY = WHAT THE USER RECEIVES",
      indexableUrls: 2,
      assembledUrls: 2,
      unassembledUrls: 0,
      cleanUrls: 1,
      blockerUrls: 0,
      highUrls: 1,
      contentCorruption: 1,
      decisionCopyFailures: 0,
      imageSemanticFailures: 0,
      uniquenessFailures: 0,
      releaseReady: true,
      releaseReason: "No BLOCKER rendered-quality findings",
      urls: [],
      issues: [
        {
          id: "RQ-1",
          severity: "HIGH",
          gate: "content-sanity",
          issueClass: "CONTENT_SANITY",
          issue: "keyword_stuffing",
          component: "body",
          url: "https://kitletics.com/reviews/x",
          template: "review",
          entity: { kind: "review", id: "r", slug: "x" },
          rootCause: "stuffing",
          excerpt: "daily trainer",
        },
      ],
      rootCauses: [],
      visualReport: visual,
    };
    const mapped = issuesFromRenderedReport(highOnly);
    expect(mapped.some((i) => i.severity === "BLOCKER")).toBe(false);
    expect(
      mapped.some((i) => i.id === "RENDERED-CORRUPTION" && i.severity === "HIGH"),
    ).toBe(true);
  });
});
