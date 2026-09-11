import {
  getBuyingGuides,
  getBestGuides,
  getProducts,
  getReviews,
} from "@/repositories";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { audienceSignalsAreThin } from "@/lib/review/audience-signals";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { assessReviewArticle } from "@/lib/review/assess-review-article-quality";
import { reviewDecisionCopyText } from "@/lib/review/quality-contract";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
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
  let junkVoiceEnriched = 0;
  let articleP0 = 0;
  let articleP0Sampled = 0;

  for (const r of reviews) {
    if (audienceSignalsAreThin(r)) thinAudienceSource += 1;
    if (
      isReportOrJunkVoice(r.summary) ||
      r.sections.some((s) => isReportOrJunkVoice(s.body))
    ) {
      junkVoiceSource += 1;
    }
  }

  // Fix 85: publication voice + article P0 on INDEXABLE enriched pages (prod).
  const sample: typeof reviews = [];
  for (const r of reviews) {
    if (sample.length >= 15) break;
    if (
      !isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      )
    ) {
      continue;
    }
    sample.push(r);
  }
  for (const r of sample) {
    try {
      const data = getReviewPageData(r.slug, PROD);
      if (!data) continue;
      articleP0Sampled += 1;
      const decision = reviewDecisionCopyText(data.review);
      if (isReportOrJunkVoice(decision)) junkVoiceEnriched += 1;
      const article = assessReviewArticle(data);
      if (article.findings.some((f) => f.severity === "P0")) articleP0 += 1;
    } catch {
      // skip assemble failures
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

  // CONTENT-002 — enriched decision-copy junk is release-critical; source residue is LOW.
  if (junkVoiceEnriched > 0) {
    issues.push(
      issue("CONTENT", "BLOCKER", "review", {
        idSuffix: "002",
        evidence: `${junkVoiceEnriched}/${articleP0Sampled} sampled INDEXABLE enriched reviews match junk/report voice on decision copy`,
        whyItMatters:
          "User-visible buying-guide copy must not read like a research report",
        recommendedFix: "npm run reviews:rewrite-voice -- --write; re-enrich",
        canAutoFix: false,
        owner: "Editorial",
        effort: "M",
        impact: "Critical",
      }),
    );
  } else {
    issues.push(
      issue("CONTENT", "INFO", "review", {
        idSuffix: "002",
        evidence: `0/${articleP0Sampled} sampled INDEXABLE enriched reviews match junk/report voice on decision copy`,
        whyItMatters: "Buying-guide voice is the review standard",
        recommendedFix:
          "Keep using npm run reviews:rewrite-voice -- --write after backfills",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

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

  // CONTENT-ARTICLE-P0 — article P0 ≡ release BLOCKER on enriched INDEXABLE sample.
  if (articleP0 > 0) {
    issues.push(
      issue("CONTENT", "BLOCKER", "review", {
        idSuffix: "ARTICLE-P0",
        evidence: `${articleP0}/${articleP0Sampled} sampled INDEXABLE enriched reviews have article-audit P0 findings`,
        whyItMatters:
          "Article P0 means release-critical enriched-page gaps (verdict, audience, decision-copy voice, first-hand, media, disclosure, length)",
        recommendedFix: "npm run reviews:article-audit",
        canAutoFix: false,
        owner: "Editorial",
        impact: "Critical",
      }),
    );
  } else if (articleP0Sampled > 0) {
    issues.push(
      issue("CONTENT", "INFO", "review", {
        idSuffix: "ARTICLE-P0",
        evidence: `0/${articleP0Sampled} sampled INDEXABLE enriched reviews have article-audit P0 findings`,
        whyItMatters: "Flagship reviews must meet publishable article quality",
        recommendedFix: "npm run reviews:article-audit",
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

  return issues;
}
