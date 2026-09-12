import {
  getBuyingGuides,
  getBestGuides,
  getProducts,
  getReviews,
} from "@/repositories";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { audienceSignalsAreThin } from "@/lib/review/audience-signals";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";
import { buildRunningShoeDatabaseQualityReport } from "@/lib/running-shoe-database/quality";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import type { SiteIssue } from "../types";
import { issue } from "../issues";

const INTERNAL_LEAK =
  /\b(Prompt\s*\d+|AI synthesis|staging\/|LLM\b|catalog pass|agent readiness)\b/i;

const PROD = { isDev: false as const };

export function auditContentQuality(): SiteIssue[] {
  const issues: SiteIssue[] = [];

  const guides = getBuyingGuides();
  let thinGuides = 0;
  let blockedGuides = 0;
  for (const g of guides) {
    const a = assessGuideQuality(g);
    if (a.status === "thin" || a.status === "needs-research") thinGuides += 1;
    if (a.status === "blocked" || a.status === "stale") blockedGuides += 1;
    const blob = `${g.title} ${g.shortDescription ?? ""} ${g.quickAnswer ?? ""} ${g.sections?.map((s) => s.body).join("\n") ?? ""}`;
    if (INTERNAL_LEAK.test(blob)) {
      issues.push(
        issue("CONTENT", "HIGH", "guide", {
          route: `/guides/${g.slug}`,
          evidence: `Internal/agent language in public guide ${g.slug}`,
          whyItMatters: "Prompt/agent terminology must never ship publicly",
          recommendedFix: "Rewrite public copy; strip internal process language",
          canAutoFix: false,
          owner: "Editorial",
          effort: "M",
          impact: "High",
        }),
      );
    }
  }
  if (thinGuides > 0) {
    issues.push(
      issue("CONTENT", "HIGH", "guide", {
        evidence: `${thinGuides}/${guides.length} buying guides assessed thin/needs-research`,
        whyItMatters: "Thin guides undermine SEO and decision quality",
        recommendedFix: "Run guides:qa depth upgrades; prioritize flagship intents",
        canAutoFix: false,
        owner: "Editorial",
        effort: "L",
        impact: "High",
      }),
    );
  }
  if (blockedGuides > 0) {
    issues.push(
      issue("CONTENT", "MEDIUM", "guide", {
        evidence: `${blockedGuides} guides blocked or stale by quality gate`,
        whyItMatters: "Blocked guides should not be featured",
        recommendedFix: "Resolve gate issues or unfeature",
        canAutoFix: false,
        owner: "Editorial",
      }),
    );
  }

  const reviews = getReviews(PROD);
  let thinAudienceSource = 0;
  let junkVoiceSource = 0;

  for (const r of reviews) {
    if (audienceSignalsAreThin(r)) thinAudienceSource += 1;
    if (
      isReportOrJunkVoice(r.summary) ||
      r.sections.some((s) => isReportOrJunkVoice(s.body))
    ) {
      junkVoiceSource += 1;
    }
  }

  // CONTENT-001 — source Buy/Skip thinness is seed hygiene (page enricher upgrades many).
  if (thinAudienceSource > 0) {
    issues.push(
      issue("CONTENT", "LOW", "review", {
        idSuffix: "001",
        evidence: `${thinAudienceSource} reviews have thin source Buy/Skip (enriched page often upgrades)`,
        whyItMatters:
          "Source-seed hygiene — not a user-facing P0 when enriched Buy/Skip are strong",
        recommendedFix:
          "npm run reviews:upgrade-audience -- --write; rewrite wave/backfill seeds",
        canAutoFix: false,
        owner: "Editorial",
        effort: "M",
        impact: "Low",
      }),
    );
  } else {
    issues.push(
      issue("CONTENT", "INFO", "review", {
        idSuffix: "001",
        evidence: "0 reviews have thin source Buy/Skip",
        whyItMatters: "Source seeds should match Vomero-standard decision lines",
        recommendedFix:
          "Keep using npm run reviews:upgrade-audience -- --write after backfills",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

  // CONTENT-002 / ARTICLE-P0 — 15-page samples cannot certify the estate.
  // Full-estate rendered quality is auditRenderedQuality (RENDERED-ESTATE).
  issues.push(
    issue("CONTENT", "INFO", "review", {
      idSuffix: "002",
      evidence:
        "Enriched decision-copy / article P0 is gated on ALL indexable URLs by npm run quality:rendered (not a 15-page sample)",
      whyItMatters:
        "Sampling 15 reviews previously declared READY while production contained public garbage",
      recommendedFix: "npm run quality:rendered",
      canAutoFix: false,
      owner: "Editorial",
      status: "resolved",
    }),
  );

  if (junkVoiceSource > 0) {
    issues.push(
      issue("CONTENT", "LOW", "review", {
        idSuffix: "002-SOURCE",
        evidence: `${junkVoiceSource} reviews still match junk/report voice on **source** fields (may not render after enrich)`,
        whyItMatters:
          "Source-seed residue is a hygiene diagnostic — not a user-facing P0 when enriched decision copy is clean",
        recommendedFix:
          "Clean seeds with npm run reviews:rewrite-voice -- --write when convenient",
        canAutoFix: false,
        owner: "Editorial",
        effort: "S",
        impact: "Low",
      }),
    );
  }

  // CONTENT-ARTICLE-P0 is owned by the rendered-quality estate gate.
  issues.push(
    issue("CONTENT", "INFO", "review", {
      idSuffix: "ARTICLE-P0",
      evidence:
        "Article P0 is no longer certified by a 15-page sample — see RENDERED-ESTATE",
      whyItMatters: "Flagship reviews must meet publishable article quality on every indexable URL",
      recommendedFix: "npm run quality:rendered",
      canAutoFix: false,
      owner: "Editorial",
      status: "resolved",
    }),
  );

  // CONTENT-CORRUPTION — uniqueness stamps / machine values on public review surfaces.
  const corruptIndexable: string[] = [];
  for (const r of reviews) {
    if (
      !isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      )
    ) {
      continue;
    }
    if (containsPublicContentCorruption(r)) {
      corruptIndexable.push(r.slug);
    }
  }
  if (corruptIndexable.length > 0) {
    issues.push(
      issue("CONTENT", "BLOCKER", "review", {
        idSuffix: "CORRUPTION",
        evidence: `${corruptIndexable.length} INDEXABLE reviews contain uniqueness-token or machine-value corruption (${corruptIndexable.slice(0, 8).join(", ")}${corruptIndexable.length > 8 ? "…" : ""})`,
        whyItMatters:
          "Uniqueness stamps (skuslug/skuid/concatenated tokens) must never appear in public or indexable review copy, including PDP review-derived content",
        recommendedFix:
          "Restore a clean source via review-source precedence or hold for editorial rewrite — do not regex-strip tokens",
        canAutoFix: false,
        owner: "Editorial",
        effort: "L",
        impact: "Critical",
      }),
    );
  } else {
    issues.push(
      issue("CONTENT", "INFO", "review", {
        idSuffix: "CORRUPTION",
        evidence:
          "0 INDEXABLE reviews contain uniqueness-token or machine-value corruption",
        whyItMatters:
          "Public review copy must never ship uniqueness stamps or concatenated spec tokens",
        recommendedFix:
          "Keep containsPublicContentCorruption as a publication BLOCKER",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

  const products = getProducts(PROD);
  const withReview = new Set(reviews.map((r) => r.productId));
  const missingReview = products.filter((p) => !withReview.has(p.id)).length;
  const coverage = products.length
    ? Math.round((withReview.size / products.length) * 100)
    : 0;
  issues.push(
    issue("CONTENT", coverage < 40 ? "HIGH" : "INFO", "review", {
      idSuffix: "003",
      evidence: `Review coverage ${withReview.size}/${products.length} products (${coverage}%); missing ${missingReview}`,
      whyItMatters: "Commercial pages convert better with honest Reviews",
      recommendedFix: "npm run reviews:agent -- --mode=audit --missing",
      canAutoFix: false,
      owner: "Editorial",
      effort: "L",
      impact: coverage < 40 ? "High" : "Medium",
      status: coverage >= 60 ? "resolved" : "open",
    }),
  );

  const best = getBestGuides(PROD);
  let thinBest = 0;
  for (const g of best) {
    const recs = g.recommendations?.length ?? 0;
    if (recs < 3 && !g.intentionallyNarrow) thinBest += 1;
  }
  if (thinBest > 0) {
    issues.push(
      issue("CONTENT", "HIGH", "best-guide", {
        evidence: `${thinBest}/${best.length} Best Guides have <3 recommendations`,
        whyItMatters: "Best Guides must be decision-complete",
        recommendedFix: "Run best-guide coverage QA; expand considered/shortlist/recs",
        canAutoFix: false,
        owner: "Editorial",
      }),
    );
  }

  issues.push(
    issue("CONTENT", "INFO", "content", {
      evidence: `Guides ${guides.length} · Reviews ${reviews.length} · Best ${best.length} · Products ${products.length}`,
      whyItMatters: "Corpus size baseline for growth",
      recommendedFix: "Track coverage over time in site-quality reports",
      canAutoFix: false,
      owner: "Content",
      status: "resolved",
    }),
  );

  // Running Shoe Database quality / freshness (same cohort as public page)
  const shoeReport = buildRunningShoeDatabaseQualityReport(
    getRunningShoeDatabaseRecords(),
  );
  if (shoeReport.statusCounts.INVALID > 0) {
    issues.push(
      issue("CONTENT", "HIGH", "content", {
        idSuffix: "SHOE-DB-INVALID",
        route: "/running/shoes/database",
        evidence: `${shoeReport.statusCounts.INVALID}/${shoeReport.populationSize} Running Shoe Database records INVALID (${shoeReport.invalidRecords
          .slice(0, 5)
          .map((r) => r.slug)
          .join(", ")}${shoeReport.invalidRecords.length > 5 ? "…" : ""})`,
        whyItMatters:
          "Impossible specs must not ship in the public database or contaminate market statistics",
        recommendedFix:
          "npm run shoe-database:qa — fix catalog specs; do not silently coerce",
        canAutoFix: false,
        owner: "Editorial",
        effort: "M",
        impact: "High",
      }),
    );
  }
  if (shoeReport.statusCounts.SUSPECT > 0) {
    issues.push(
      issue("CONTENT", "MEDIUM", "content", {
        idSuffix: "SHOE-DB-SUSPECT",
        route: "/running/shoes/database",
        evidence: `${shoeReport.statusCounts.SUSPECT}/${shoeReport.populationSize} Running Shoe Database records SUSPECT`,
        whyItMatters:
          "Suspect outliers are excluded from stats but still need human review before trust claims",
        recommendedFix:
          "npm run shoe-database:qa — review flagged geometry/price/weight",
        canAutoFix: false,
        owner: "Editorial",
        effort: "M",
        impact: "Medium",
      }),
    );
  }
  if (
    shoeReport.statusCounts.INVALID === 0 &&
    shoeReport.statusCounts.SUSPECT === 0
  ) {
    issues.push(
      issue("CONTENT", "INFO", "content", {
        idSuffix: "SHOE-DB-OK",
        route: "/running/shoes/database",
        evidence: `Running Shoe Database quality: ${shoeReport.populationSize} eligible · VALID ${shoeReport.statusCounts.VALID} · PARTIAL ${shoeReport.statusCounts.PARTIAL} · no SUSPECT/INVALID`,
        whyItMatters: "Public shoe database stats stay uncontaminated",
        recommendedFix: "npm run shoe-database:qa",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

  return issues;
}
