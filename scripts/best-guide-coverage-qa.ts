/**
 * Best Guide coverage QA — considered ≠ recommended + decision-analysis completeness.
 *
 * Usage: npm run guides:qa  (includes this script via package.json)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBestGuides, getProductById } from "@/repositories";
import {
  getGuideCandidateUniverse,
  resolveGuideCoverage,
} from "@/lib/best/guide-coverage";
import { resolveGuideContextConfig } from "@/lib/best/guide-context-config";
import type { BestGuide } from "@/domain/editorial/types";

interface GuideCoverageRow {
  guideId: string;
  slug: string;
  title: string;
  candidateUniverse: number;
  considered: number;
  shortlisted: number;
  recommended: number;
  coveragePercent: number | null;
  hasAuthenticConsideredSet: boolean;
  intentionallyNarrow: boolean;
  issues: string[];
  decision: DecisionAnalysisStats;
}

interface DecisionAnalysisStats {
  contextConfigId: string;
  hasWhatWeLookFor: boolean;
  hasQuickTake: boolean;
  hasDecisionShortcuts: boolean;
  withWhyItFits: number;
  withTradeoffs: number;
  withBestFor: number;
  withNotIdeal: number;
  withChooseInstead: number;
  withWhyItWon: number;
  genericPhraseHits: string[];
  missingContextAnalysis: number;
}

const GENERIC_PHRASES = [
  "excellent balance of comfort and performance",
  "great all-rounder",
  "perfect for everyone",
  "best in class performance",
];

const HIGH_PRIORITY_SLUGS = new Set([
  "running-shoes-long-runs",
  "running-shoes",
  "max-cushion-running-shoes",
  "daily-trainers",
  "stability-running-shoes",
  "running-shoes-marathon",
  "running-shoes-heavy",
  "running-shoes-wide",
]);

function decisionStats(guide: BestGuide): DecisionAnalysisStats {
  const cfg = resolveGuideContextConfig({
    useCaseIds: guide.useCaseIds,
    slug: guide.slug,
  });
  let withWhyItFits = 0;
  let withTradeoffs = 0;
  let withBestFor = 0;
  let withNotIdeal = 0;
  let withChooseInstead = 0;
  let withWhyItWon = 0;
  let missingContextAnalysis = 0;
  const genericPhraseHits: string[] = [];
  const seenGeneric = new Set<string>();

  for (const rec of guide.recommendations) {
    if ((rec.whyItFits?.length ?? 0) > 0) withWhyItFits += 1;
    if ((rec.tradeoffs?.length ?? 0) > 0 || (rec.compromises?.length ?? 0) > 0) {
      withTradeoffs += 1;
    }
    if (
      (rec.bestForProfiles?.length ?? 0) > 0 ||
      (rec.useCaseIds?.length ?? 0) > 0
    ) {
      withBestFor += 1;
    }
    if (
      (rec.notIdealFor?.length ?? 0) > 0 ||
      (rec.whoShouldAvoid?.length ?? 0) > 0
    ) {
      withNotIdeal += 1;
    }
    if (
      (rec.chooseInsteadWhen?.length ?? 0) > 0 ||
      (rec.considerInsteadProductIds?.length ?? 0) > 0
    ) {
      withChooseInstead += 1;
    }
    if (rec.whyItWon?.trim()) withWhyItWon += 1;

    const matureEnough =
      (rec.whyItFits?.length ?? 0) > 0 &&
      ((rec.tradeoffs?.length ?? 0) > 0 || (rec.compromises?.length ?? 0) > 0) &&
      ((rec.bestForProfiles?.length ?? 0) > 0 ||
        (rec.useCaseIds?.length ?? 0) > 0) &&
      ((rec.notIdealFor?.length ?? 0) > 0 ||
        (rec.whoShouldAvoid?.length ?? 0) > 0) &&
      ((rec.chooseInsteadWhen?.length ?? 0) > 0 ||
        (rec.considerInsteadProductIds?.length ?? 0) > 0);

    if (!matureEnough) missingContextAnalysis += 1;

    const blob = [
      ...(rec.whyItFits ?? []),
      rec.whyRecommended ?? "",
      rec.summary ?? "",
      ...(rec.strengths ?? []),
    ]
      .join(" ")
      .toLowerCase();
    for (const phrase of GENERIC_PHRASES) {
      if (blob.includes(phrase) && !seenGeneric.has(phrase)) {
        seenGeneric.add(phrase);
        genericPhraseHits.push(phrase);
      }
    }
  }

  return {
    contextConfigId: cfg.id,
    hasWhatWeLookFor: Boolean(
      guide.whatWeLookFor?.length || cfg.factors.length > 0,
    ),
    hasQuickTake: Boolean(guide.quickTake?.length),
    hasDecisionShortcuts: Boolean(guide.decisionShortcuts?.length),
    withWhyItFits,
    withTradeoffs,
    withBestFor,
    withNotIdeal,
    withChooseInstead,
    withWhyItWon,
    genericPhraseHits,
    missingContextAnalysis,
  };
}

function auditGuides(): GuideCoverageRow[] {
  const rows: GuideCoverageRow[] = [];

  for (const guide of getBestGuides()) {
    const coverage = resolveGuideCoverage(guide);
    const universe = getGuideCandidateUniverse(guide);
    const issues: string[] = [];
    const decision = decisionStats(guide);

    if (!coverage.hasAuthenticConsideredSet) {
      issues.push("missing-authentic-considered-set");
    }

    if (
      coverage.hasAuthenticConsideredSet &&
      coverage.candidateUniverseCount >= 10 &&
      coverage.consideredCount <= coverage.recommendedCount
    ) {
      issues.push("thin-considered-vs-universe");
    }

    if (
      !guide.intentionallyNarrow &&
      coverage.candidateUniverseCount >= 10 &&
      coverage.recommendedCount <= 3
    ) {
      issues.push("low-recommendation-density");
    }

    for (const id of coverage.shortlistedProductIds) {
      if (!coverage.consideredProductIds.includes(id)) {
        issues.push(`shortlisted-not-in-considered:${id}`);
      }
    }

    if (coverage.hasAuthenticConsideredSet) {
      for (const id of coverage.recommendedProductIds) {
        if (!coverage.consideredProductIds.includes(id)) {
          issues.push(`recommended-not-in-considered:${id}`);
        }
      }
    }

    for (const id of [
      ...coverage.consideredProductIds,
      ...coverage.recommendedProductIds,
    ]) {
      const p = getProductById(id);
      if (!p || p.status !== "published") {
        issues.push(`unpublished-or-missing:${id}`);
      }
    }

    const recIds = guide.recommendations.map((r) => r.productId);
    if (new Set(recIds).size !== recIds.length) {
      issues.push("duplicate-recommendation-ids");
    }

    if (decision.missingContextAnalysis > 0) {
      issues.push(
        `missing-context-analysis:${decision.missingContextAnalysis}`,
      );
    }
    if (decision.genericPhraseHits.length > 0) {
      issues.push(`generic-copy:${decision.genericPhraseHits.join("|")}`);
    }

    // Public considered-note quality (when authentic set exists)
    if (coverage.hasAuthenticConsideredSet && guide.consideredProducts?.length) {
      const reasonCounts = new Map<string, number>();
      for (const note of guide.consideredProducts) {
        const key = note.reason.trim().toLowerCase();
        reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
        if (
          /survived screening/i.test(note.reason) ||
          /^guide recommendation$/i.test(note.reason.trim()) ||
          /^overlapping role$/i.test(note.reason.trim()) ||
          /^not selected$/i.test(note.reason.trim())
        ) {
          issues.push(`generic-considered-reason:${note.productId}`);
        }
        if (
          note.closestRecommendedProductId &&
          !coverage.recommendedProductIds.includes(
            note.closestRecommendedProductId,
          )
        ) {
          issues.push(
            `closest-rec-not-recommended:${note.productId}->${note.closestRecommendedProductId}`,
          );
        }
      }
      for (const [, count] of reasonCounts) {
        if (count > 2) {
          issues.push(`duplicate-public-reason:${count}x`);
          break;
        }
      }
    }

    rows.push({
      guideId: guide.id,
      slug: guide.slug,
      title: guide.title,
      candidateUniverse: universe.length,
      considered: coverage.consideredCount,
      shortlisted: coverage.shortlistedCount,
      recommended: coverage.recommendedCount,
      coveragePercent: coverage.coveragePercent,
      hasAuthenticConsideredSet: coverage.hasAuthenticConsideredSet,
      intentionallyNarrow: Boolean(guide.intentionallyNarrow),
      issues,
      decision,
    });
  }

  return rows.sort((a, b) => a.slug.localeCompare(b.slug));
}

function main() {
  const rows = auditGuides();
  const reportDir = join(process.cwd(), "reports");
  mkdirSync(reportDir, { recursive: true });

  const enriched = rows.filter(
    (r) =>
      r.decision.withWhyItFits === r.recommended &&
      r.decision.missingContextAnalysis === 0,
  );
  const avg = (key: "considered" | "shortlisted" | "recommended") => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => acc + r[key], 0);
    return Math.round((sum / rows.length) * 10) / 10;
  };

  const coverageMd = [
    "# Best Guide coverage report",
    "",
    "Considered ≠ recommended. Trust counts must not fall back to recommendation length.",
    "",
    "| Guide | Universe | Considered | Shortlisted | Recommended | Coverage | Issues |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...rows.map((r) => {
      const cov =
        r.coveragePercent == null ? "—" : `${r.coveragePercent}%`;
      const issues = r.issues.length ? r.issues.join(", ") : "ok";
      return `| ${r.slug} | ${r.candidateUniverse} | ${r.considered} | ${r.shortlisted} | ${r.recommended} | ${cov} | ${issues} |`;
    }),
    "",
  ].join("\n");

  const decisionMd = [
    "# Best Guide decision-analysis report",
    "",
    `Guides audited: ${rows.length}`,
    `Guides fully enriched (whyItFits + tradeoffs + bestFor + notIdeal + chooseInstead): ${enriched.length}`,
    "",
    `Average considered: ${avg("considered")}`,
    `Average shortlisted: ${avg("shortlisted")}`,
    `Average recommended: ${avg("recommended")}`,
    "",
    "| Guide | Context | whyItFits | tradeoffs | bestFor | notIdeal | chooseInstead | whyItWon | quickTake | shortcuts | Missing |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: |",
    ...rows.map((r) => {
      const d = r.decision;
      return `| ${r.slug} | ${d.contextConfigId} | ${d.withWhyItFits}/${r.recommended} | ${d.withTradeoffs}/${r.recommended} | ${d.withBestFor}/${r.recommended} | ${d.withNotIdeal}/${r.recommended} | ${d.withChooseInstead}/${r.recommended} | ${d.withWhyItWon}/${r.recommended} | ${d.hasQuickTake ? "yes" : "no"} | ${d.hasDecisionShortcuts ? "yes" : "no"} | ${d.missingContextAnalysis} |`;
    }),
    "",
  ].join("\n");

  writeFileSync(join(reportDir, "best-guide-coverage.md"), coverageMd);
  writeFileSync(join(reportDir, "best-guide-decision.md"), decisionMd);
  writeFileSync(
    join(reportDir, "best-guide-coverage.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2),
  );

  const longRuns = rows.find((r) => r.slug === "running-shoes-long-runs");
  const hardFails: string[] = [];

  if (!longRuns?.hasAuthenticConsideredSet) {
    hardFails.push("long-runs missing authentic considered set");
  }
  if (longRuns && longRuns.considered <= longRuns.recommended) {
    hardFails.push("long-runs considered <= recommended (thin considered)");
  }
  if (longRuns && longRuns.recommended < 5) {
    hardFails.push("long-runs still looks hard-capped (<5 recommendations)");
  }
  if (longRuns && longRuns.decision.missingContextAnalysis > 0) {
    hardFails.push(
      `long-runs missing context analysis on ${longRuns.decision.missingContextAnalysis} recommendations`,
    );
  }
  if (longRuns && !longRuns.decision.hasQuickTake) {
    hardFails.push("long-runs missing quickTake");
  }
  if (longRuns && !longRuns.decision.hasDecisionShortcuts) {
    hardFails.push("long-runs missing decisionShortcuts");
  }
  if (longRuns && longRuns.decision.withWhyItFits < longRuns.recommended) {
    hardFails.push("long-runs recommendations missing whyItFits");
  }
  if (
    longRuns?.issues.some((i) => i.startsWith("generic-considered-reason:"))
  ) {
    hardFails.push("long-runs has generic considered public reasons");
  }
  if (longRuns?.issues.some((i) => i.startsWith("duplicate-public-reason:"))) {
    hardFails.push("long-runs has duplicate considered public reasons");
  }

  for (const r of rows) {
    for (const issue of r.issues) {
      if (issue.startsWith("unpublished-or-missing:")) {
        hardFails.push(`${r.slug}: ${issue}`);
      }
      if (issue === "duplicate-recommendation-ids") {
        hardFails.push(`${r.slug}: ${issue}`);
      }
    }
    if (
      HIGH_PRIORITY_SLUGS.has(r.slug) &&
      r.slug !== "running-shoes-long-runs" &&
      r.decision.withWhyItFits === 0
    ) {
      console.warn(
        `WARN ${r.slug}: no recommendations have whyItFits yet`,
      );
    }
  }

  console.log(coverageMd);
  console.log(decisionMd);
  console.log(`Wrote reports/best-guide-coverage.md (${rows.length} guides)`);
  console.log(`Wrote reports/best-guide-decision.md`);

  if (hardFails.length > 0) {
    console.error("\nHard failures:");
    for (const f of hardFails) console.error(` - ${f}`);
    process.exit(1);
  }
}

main();
