/**
 * @vitest-environment node
 *
 * Vercel ignoreCommand: exit 0 = skip deploy, exit 1 = build.
 * Official: https://vercel.com/docs/project-configuration/vercel-json
 */
import { describe, expect, it } from "vitest";
import {
  EXIT_BUILD,
  EXIT_SKIP,
  classifyChangedFiles,
  exitCodeForDecision,
  isAlwaysBuildPath,
  isIgnorablePath,
} from "../scripts/lib/vercel-ignored-build.mjs";

describe("Vercel ignored-build exit codes", () => {
  it("skips with 0 and builds with 1 (not the inverse)", () => {
    expect(EXIT_SKIP).toBe(0);
    expect(EXIT_BUILD).toBe(1);
    expect(EXIT_SKIP).not.toBe(EXIT_BUILD);

    const skip = classifyChangedFiles(["docs/VERCEL-COST-GUARDRAILS.md"]);
    const build = classifyChangedFiles(["src/app/page.tsx"]);
    expect(exitCodeForDecision(skip)).toBe(0);
    expect(exitCodeForDecision(build)).toBe(1);
  });
});

describe("isIgnorablePath", () => {
  it("skips docs markdown, reports, cursor rules, and audit outputs", () => {
    expect(isIgnorablePath("docs/VERCEL-COST-GUARDRAILS.md")).toBe(true);
    expect(isIgnorablePath("docs/padel/PADEL-FINAL-COMPLETION-AUDIT.md")).toBe(true);
    expect(isIgnorablePath("reports/vercel-cost-audit/EXECUTIVE-SUMMARY.md")).toBe(true);
    expect(isIgnorablePath("reports/vercel-cost-remediation/WAVE-0-RESULT.md")).toBe(true);
    expect(isIgnorablePath(".cursor/rules/vercel-cost-guardrails.mdc")).toBe(true);
    expect(isIgnorablePath(".cursor/skills/review-writer/SKILL.md")).toBe(true);
    expect(isIgnorablePath("agents/product-review/voice.md")).toBe(true);
    expect(isIgnorablePath("docs/prelaunch/data/rc-81/site-quality-audit.json")).toBe(true);
    expect(isIgnorablePath("data/staging/catalog-media-audit-2026-09-04.json")).toBe(true);
    expect(isIgnorablePath("README.md")).toBe(true);
    expect(isIgnorablePath("public/images/README.md")).toBe(true);
  });

  it("does not skip application code, config, or site content", () => {
    expect(isAlwaysBuildPath("src/app/page.tsx")).toBe(true);
    expect(isIgnorablePath("src/content/reviews-wave1.ts")).toBe(false);
    expect(isIgnorablePath("src/middleware.ts")).toBe(false);
    expect(isIgnorablePath("public/vercel.svg")).toBe(false);
    expect(isIgnorablePath("package.json")).toBe(false);
    expect(isIgnorablePath("package-lock.json")).toBe(false);
    expect(isIgnorablePath("next.config.ts")).toBe(false);
    expect(isIgnorablePath("vercel.json")).toBe(false);
    expect(isIgnorablePath(".vercelignore")).toBe(false);
    expect(isIgnorablePath("scripts/vercel-ignored-build.mjs")).toBe(false);
    expect(isIgnorablePath("scripts/lib/vercel-ignored-build.mjs")).toBe(false);
    expect(isIgnorablePath("tsconfig.json")).toBe(false);
    expect(isIgnorablePath("eslint.config.mjs")).toBe(false);
  });

  it("does not skip generated data the production app actually reads", () => {
    expect(isIgnorablePath("docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json")).toBe(false);
    expect(isIgnorablePath("docs/padel/data/PADEL-COMMERCE-COVERAGE.csv")).toBe(false);
    expect(isIgnorablePath("docs/quality/data/rendered-quality-last-run.json")).toBe(false);
    expect(isIgnorablePath("docs/growth/data/ACTIONABLE-BACKLINK-QUEUE.csv")).toBe(false);
    expect(isIgnorablePath("docs/data-products/data/running-shoe-database-quality.json")).toBe(false);
  });
});

describe("classifyChangedFiles", () => {
  it("skips when every path is documentation or audit output", () => {
    const decision = classifyChangedFiles([
      "docs/foo.md",
      "reports/bar.md",
      ".cursor/rules/vercel-deploy-discipline.mdc",
      "reports/vercel-cost-audit/issues.csv",
    ]);
    expect(decision.skip).toBe(true);
    expect(decision.affecting).toEqual([]);
    expect(exitCodeForDecision(decision)).toBe(EXIT_SKIP);
  });

  it("builds when a docs-only commit also touches app-required data", () => {
    const decision = classifyChangedFiles([
      "docs/padel/PADEL-NOTES.md",
      "docs/padel/data/PADEL-SPEC-COVERAGE.csv",
    ]);
    expect(decision.skip).toBe(false);
    expect(decision.affecting).toEqual(["docs/padel/data/PADEL-SPEC-COVERAGE.csv"]);
    expect(exitCodeForDecision(decision)).toBe(EXIT_BUILD);
  });

  it("builds when src, public images, or lockfile change", () => {
    expect(classifyChangedFiles(["src/lib/foo.ts"]).skip).toBe(false);
    expect(classifyChangedFiles(["public/images/running/hero.png"]).skip).toBe(false);
    expect(classifyChangedFiles(["package-lock.json"]).skip).toBe(false);
  });

  it("does not skip an empty unknown path as application code (fail-open)", () => {
    const decision = classifyChangedFiles(["mystery/config.yaml"]);
    expect(decision.skip).toBe(false);
    expect(exitCodeForDecision(decision)).toBe(EXIT_BUILD);
  });
});
