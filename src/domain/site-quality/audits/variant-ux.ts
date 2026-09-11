import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getBestGuides,
  getProducts,
  getProductVariants,
  getReviews,
} from "@/repositories";
import {
  formatAudienceAvailability,
  getProductAudiences,
} from "@/lib/product/audience";
import { relatedSearchesForQuery } from "@/lib/search/intent";
import type { SiteIssue } from "../types";
import { issue } from "../issues";

const ROOT = process.cwd();

function fileContains(relPath: string, needle: string | RegExp): boolean {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return false;
  const text = readFileSync(abs, "utf8");
  return typeof needle === "string" ? text.includes(needle) : needle.test(text);
}

/**
 * VARIANT UX COVERAGE — Men / Women / Unisex storefront surfaces.
 * Flags regressions in search, compare, best guides, reviews, brand hubs.
 */
export function auditVariantUxCoverage(): SiteIssue[] {
  const issues: SiteIssue[] = [];

  const runningShoes = getProducts().filter(
    (p) => p.categoryId === "cat-running-shoes",
  );
  const variants = getProductVariants();
  const variantProductIds = new Set(variants.map((v) => v.productId));

  let missingAudience = 0;
  let dualAudience = 0;
  for (const p of runningShoes) {
    const audiences = getProductAudiences(
      p,
      variants.filter((v) => v.productId === p.id),
    );
    if (audiences.length === 0) missingAudience += 1;
    if (audiences.includes("men") && audiences.includes("women")) {
      dualAudience += 1;
    }
  }

  if (runningShoes.length > 0 && missingAudience > 0) {
    issues.push(
      issue("VARIANT", "HIGH", "product", {
        idSuffix: "audience-gap",
        route: "/running/shoes",
        evidence: `${missingAudience}/${runningShoes.length} running shoes lack Men/Women/Unisex audience data`,
        whyItMatters:
          "Fit/sizing filters and badges need verified audience coverage",
        recommendedFix:
          "Backfill ProductVariant.audience / genderFit via audience-variants.ts",
        canAutoFix: false,
        owner: "Editorial",
        effort: "M",
        impact: "High",
        relatedFiles: ["src/content/running/audience-variants.ts"],
      }),
    );
  }

  if (runningShoes.length >= 40 && dualAudience < runningShoes.length * 0.7) {
    issues.push(
      issue("VARIANT", "MEDIUM", "product", {
        idSuffix: "dual-coverage",
        route: "/running/shoes",
        evidence: `Only ${dualAudience}/${runningShoes.length} running shoes marked Men+Women`,
        whyItMatters: "Most road models ship in both lasts; low dual share looks incomplete",
        recommendedFix: "Verify dual-last models in audience backfill",
        canAutoFix: false,
        owner: "Editorial",
        effort: "S",
        impact: "Medium",
      }),
    );
  }

  // Search chip: women's running shoes intent
  const related = relatedSearchesForQuery("running shoes");
  const hasWomenChip = related.some(
    (r) =>
      /women/i.test(r.label) &&
      (r.href.includes("gender=women") || r.href.includes("women")),
  );
  if (!hasWomenChip) {
    issues.push(
      issue("VARIANT", "MEDIUM", "search", {
        idSuffix: "search-chip",
        route: "/search?q=running+shoes",
        evidence: "relatedSearchesForQuery('running shoes') missing Women's chip",
        whyItMatters: "Women's footwear intent should surface a fit filter path",
        recommendedFix: "Add Women's chip in src/lib/search/intent.ts",
        canAutoFix: false,
        owner: "Engineering",
        effort: "XS",
        impact: "Medium",
        relatedFiles: ["src/lib/search/intent.ts"],
      }),
    );
  }

  // Surface wiring (code presence) — catch accidental removals
  const surfaceChecks: {
    id: string;
    file: string;
    needle: string | RegExp;
    route: string;
    evidence: string;
  }[] = [
    {
      id: "compare-banner",
      file: "src/components/compare/CompareFitSizingBanner.tsx",
      needle: "Fit / sizing",
      route: "/compare",
      evidence: "Compare fit/sizing banner component missing or gutted",
    },
    {
      id: "best-badge",
      file: "src/lib/best/get-best-guide-page-data.ts",
      needle: "audienceAvailability",
      route: "/best/running-shoes",
      evidence: "Best Guide audienceAvailability field missing from page data",
    },
    {
      id: "review-disclosure",
      file: "src/lib/review/get-review-page-data.ts",
      needle: "fitSizingDisclosure",
      route: "/reviews",
      evidence: "Review fitSizingDisclosure missing from page data",
    },
    {
      id: "brand-chips",
      file: "src/lib/brand-hub/get-brand-hub-data.ts",
      needle: "fitChips",
      route: "/brands",
      evidence: "Brand hub fitChips not wired in get-brand-hub-data",
    },
    {
      id: "hub-strip",
      file: "src/components/sport-hub/RunningFitLinks.tsx",
      needle: "gender=women",
      route: "/running",
      evidence: "Running hub Men's/Women's strip missing",
    },
  ];

  for (const check of surfaceChecks) {
    if (!fileContains(check.file, check.needle)) {
      issues.push(
        issue("VARIANT", "HIGH", "product", {
          idSuffix: check.id,
          route: check.route,
          evidence: check.evidence,
          whyItMatters: "Variant UX surfaces must stay wired after refactors",
          recommendedFix: `Restore ${check.file} wiring for Men/Women fit UX`,
          canAutoFix: false,
          owner: "Engineering",
          effort: "S",
          impact: "High",
          relatedFiles: [check.file],
        }),
      );
    }
  }

  // Thin gender-split Best Guides — flag if shallow SEO landings appear
  const genderBest = getBestGuides().filter((g) => {
    const hay = `${g.slug} ${g.title} ${g.subtitle ?? ""}`.toLowerCase();
    return (
      (/women|men'?s|womens|mens/.test(hay) &&
        /running.?shoe|shoe/.test(hay)) ||
      /best-(mens|womens|men|women)-running-shoes/.test(g.slug)
    );
  });
  for (const g of genderBest) {
    const recCount = g.recommendations?.length ?? 0;
    const bodyLen =
      (g.methodologySummary?.length ?? 0) +
      (g.intro?.length ?? 0) +
      (g.subtitle?.length ?? 0) +
      (g.shortDescription?.length ?? 0) +
      (g.selectionMethodology?.length ?? 0);
    if (recCount < 5 || bodyLen < 200) {
      issues.push(
        issue("VARIANT", "MEDIUM", "best-guide", {
          idSuffix: `thin-${g.slug}`,
          route: `/best/${g.slug}`,
          evidence: `Gender-split Best Guide ${g.slug} looks thin (recs=${recCount}, prose~${bodyLen})`,
          whyItMatters:
            "Men’s/Women’s Best Guides should only ship with real editorial depth — not facet SEO shells",
          recommendedFix:
            "Deepen the guide or remove; prefer ?gender= + availability badges on shared shoe guides",
          canAutoFix: false,
          owner: "Editorial",
          effort: "L",
          impact: "Medium",
          relatedFiles: ["docs/product-variant-ux-audit.md"],
        }),
      );
    }
  }

  // Sample: footwear reviews should resolve an availability label when variants exist
  const footwearReviews = getReviews()
    .filter((r) => {
      const p = runningShoes.find((x) => x.id === r.productId);
      return Boolean(p) && variantProductIds.has(r.productId);
    })
    .slice(0, 12);
  let missingDisclosureSource = 0;
  for (const r of footwearReviews) {
    const p = runningShoes.find((x) => x.id === r.productId);
    if (!p) continue;
    const label = formatAudienceAvailability(
      getProductAudiences(
        p,
        variants.filter((v) => v.productId === p.id),
      ),
    );
    if (!label) missingDisclosureSource += 1;
  }
  if (missingDisclosureSource > 0) {
    issues.push(
      issue("VARIANT", "LOW", "review", {
        idSuffix: "review-audience",
        evidence: `${missingDisclosureSource} sampled footwear reviews lack audience labels for disclosure`,
        whyItMatters: "Review fit/sizing line needs audience data",
        recommendedFix: "Ensure variants.availabilityVerified for those models",
        canAutoFix: false,
        owner: "Editorial",
        effort: "S",
        impact: "Low",
      }),
    );
  }

  // Healthy coverage signal (INFO) when surfaces look good
  if (issues.filter((i) => i.severity !== "INFO").length === 0) {
    issues.push(
      issue("VARIANT", "INFO", "product", {
        idSuffix: "ok",
        evidence: `Variant UX coverage OK — ${dualAudience}/${runningShoes.length} dual Men+Women shoes; search/compare/best/review/brand surfaces wired`,
        whyItMatters: "Baseline for regression detection on next audit",
        recommendedFix: "No action",
        canAutoFix: false,
        status: "resolved",
        owner: "Engineering",
      }),
    );
  }

  return issues;
}
