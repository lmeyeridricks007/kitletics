#!/usr/bin/env tsx
/**
 * Axe accessibility crawl for critical Kitletics surfaces.
 *
 * Prerequisites: production (or preview) server on BASE_URL
 *   npm run build && npm run start
 *
 * Usage:
 *   npm run site:a11y-baseline
 *   BASE_URL=http://127.0.0.1:3000 npm run site:a11y-baseline
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

type Surface = {
  id: string;
  label: string;
  path: string;
  /** Optional interaction before axe runs */
  prepare?: (page: Page) => Promise<void>;
};

const SURFACES: Surface[] = [
  {
    id: "header",
    label: "Header / primary nav",
    path: "/",
  },
  {
    id: "search",
    label: "Search",
    path: "/search?q=vomero",
  },
  {
    id: "filters",
    label: "Search filters",
    path: "/search?q=running+shoes",
  },
  {
    id: "compare",
    label: "Compare builder",
    path: "/compare",
  },
  {
    id: "finder",
    label: "Running shoe finder",
    path: "/tools/running-shoe-finder",
  },
];

type SurfaceResult = {
  id: string;
  label: string;
  path: string;
  url: string;
  status: "measured" | "failed";
  violations: Array<{
    id: string;
    impact: string | null | undefined;
    description: string;
    helpUrl?: string;
    nodes: number;
  }>;
  passes: number;
  incomplete: number;
  error?: string;
};

async function main() {
  try {
    const res = await fetch(BASE, { redirect: "follow" });
    if (!res.ok && res.status >= 500) {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch (err) {
    console.error(
      `Cannot reach ${BASE}. Start the server first:\n  npm run build && npm run start\n`,
      err,
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const results: SurfaceResult[] = [];

  for (const surface of SURFACES) {
    const url = `${BASE}${surface.path}`;
    const page = await context.newPage();
    console.log(`Scanning ${surface.id} (${surface.path}) …`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(500);
      if (surface.prepare) await surface.prepare(page);

      // Open search overlay from header when on home (header surface)
      if (surface.id === "header") {
        const searchBtn = page.getByRole("button", { name: /search/i }).first();
        if (await searchBtn.isVisible().catch(() => false)) {
          // Keep closed for landmark scan; header itself is the subject
        }
      }

      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      results.push({
        id: surface.id,
        label: surface.label,
        path: surface.path,
        url,
        status: "measured",
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
        passes: axe.passes.length,
        incomplete: axe.incomplete.length,
      });
      console.log(
        `  violations=${axe.violations.length} passes=${axe.passes.length}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  FAIL ${surface.id}:`, message.slice(0, 300));
      results.push({
        id: surface.id,
        label: surface.label,
        path: surface.path,
        url,
        status: "failed",
        violations: [],
        passes: 0,
        incomplete: 0,
        error: message.slice(0, 500),
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const measured = results.filter((r) => r.status === "measured");
  const critical = measured.flatMap((r) =>
    r.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
  );

  const baseline = {
    generatedAt: new Date().toISOString(),
    method: "axe-core + playwright",
    baseUrl: BASE,
    tooling: "npm run site:a11y-baseline",
    scope: SURFACES.map((s) => s.id),
    notes:
      "Lab axe crawl (wcag2a/aa + 2.1). Complements tests/a11y-smoke.test.ts source contracts. Manual keyboard QA still required.",
    surfaces: results,
    summary: {
      measured: measured.length,
      failed: results.length - measured.length,
      totalViolations: measured.reduce((n, r) => n + r.violations.length, 0),
      seriousOrCritical: critical.length,
    },
    status: measured.length >= 4 ? "measured" : "incomplete",
  };

  const outDir = join(process.cwd(), "data/staging/site-quality");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "a11y-baseline.json");
  writeFileSync(outPath, JSON.stringify(baseline, null, 2));
  console.log(
    `\nWrote ${outPath} (${measured.length}/${SURFACES.length} measured, ${baseline.summary.totalViolations} violations)`,
  );

  if (measured.length < 4) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
