/**
 * Accessibility smoke contracts for critical surfaces.
 * Complements future axe/playwright crawls — keeps A11Y-001 tooling present in CI.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("a11y smoke — critical surfaces", () => {
  it("root layout includes a keyboard-visible skip link", () => {
    const layout = read("src/app/layout.tsx");
    const skip = read("src/components/layout/SkipLink.tsx");
    expect(skip).toMatch(/Skip to content/);
    expect(skip).toMatch(/href=["']#main-content["']/);
    expect(layout).toMatch(/<SkipLink \/>/);
    expect(layout).toMatch(/id=["']main-content["']/);
  });

  it("primary nav exposes a navigation landmark", () => {
    const src = read("src/components/layout/DesktopNav.tsx");
    expect(src).toMatch(/<nav\b/);
    expect(src).toMatch(/aria-label=["']Primary["']/);
  });

  it("header client controls have accessible names", () => {
    const src = read("src/components/layout/SiteHeaderClient.tsx");
    expect(src).toMatch(/aria-label=["']Open menu["']/);
    expect(/aria-label=["']Open search/.test(src)).toBe(true);
  });

  it("search dialog has accessible names", () => {
    const src = read("src/components/search/SearchDialog.tsx");
    expect(src).toMatch(/aria-labelledby=/);
    expect(src).toMatch(/aria-label=["']Search results["']/);
  });

  it("compare tray / builder keep interactive controls labeled", () => {
    const blob = [
      "src/components/compare/CompareBuilder.tsx",
      "src/components/compare/GlobalCompareTray.tsx",
    ]
      .filter((p) => existsSync(join(root, p)))
      .map(read)
      .join("\n");
    expect(blob.length).toBeGreaterThan(0);
    expect(/aria-label|<button\b/.test(blob)).toBe(true);
  });

  it("finder questions expose labels / fieldsets", () => {
    const src = read("src/components/finder/FinderQuestion.tsx");
    expect(src).toMatch(/<fieldset\b/);
    expect(/aria-label=/.test(src)).toBe(true);
  });

  it("staging a11y baseline ledger exists for SiteQualityAgent", () => {
    const rel = "data/staging/site-quality/a11y-baseline.json";
    expect(existsSync(join(root, rel))).toBe(true);
    const baseline = JSON.parse(read(rel)) as {
      status?: string;
      method?: string;
      summary?: { measured?: number };
    };
    expect(baseline.status).toBe("measured");
    expect(/axe/i.test(baseline.method ?? "")).toBe(true);
    expect((baseline.summary?.measured ?? 0) >= 4).toBe(true);
  });
});
