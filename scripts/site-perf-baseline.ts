#!/usr/bin/env tsx
/**
 * Measure CWV-ish lab metrics with Lighthouse on representative routes.
 *
 * Prerequisites: production server on BASE_URL (default http://127.0.0.1:3000)
 *   npm run build && npm run start
 *
 * Usage:
 *   npm run site:perf-baseline
 *   BASE_URL=http://127.0.0.1:3000 npm run site:perf-baseline
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const ROUTES: Array<{ path: string; label: string }> = [
  { path: "/", label: "Home" },
  { path: "/products/nike-vomero-18", label: "Product detail" },
  { path: "/reviews/nike-vomero-18", label: "Review" },
  { path: "/best/running-shoes", label: "Best guide" },
  { path: "/tools/running-shoe-finder", label: "Finder" },
];

type LhMetrics = {
  performanceScore: number | null;
  LCP_ms: number | null;
  CLS: number | null;
  INP_ms: number | null;
  TBT_ms: number | null;
};

function runLighthouse(url: string): LhMetrics | null {
  const outPath = join(
    process.cwd(),
    "data/staging/site-quality",
    `lh-tmp-${Buffer.from(url).toString("hex").slice(0, 24)}.json`,
  );
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "lighthouse",
      url,
      "--only-categories=performance",
      "--output=json",
      `--output-path=${outPath}`,
      "--chrome-flags=--headless --no-sandbox --disable-gpu",
      "--quiet",
      "--form-factor=mobile",
      "--screenEmulation.mobile",
    ],
    {
      encoding: "utf8",
      timeout: 180_000,
      env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH ?? "" },
    },
  );
  if (result.status !== 0) {
    console.error(`Lighthouse failed for ${url}:`, result.stderr?.slice(0, 500));
    return null;
  }
  try {
    const report = JSON.parse(
      require("node:fs").readFileSync(outPath, "utf8"),
    ) as {
      categories?: { performance?: { score?: number } };
      audits?: Record<
        string,
        { numericValue?: number; score?: number | null }
      >;
    };
    const audits = report.audits ?? {};
    // CLS is already unitless; keep 3 decimals
    const clsRaw = audits["cumulative-layout-shift"]?.numericValue;
    const cls =
      typeof clsRaw === "number" ? Math.round(clsRaw * 1000) / 1000 : null;
    const lcp = audits["largest-contentful-paint"]?.numericValue;
    const inp = audits["interaction-to-next-paint"]?.numericValue;
    const tbt = audits["total-blocking-time"]?.numericValue;
    return {
      performanceScore:
        typeof report.categories?.performance?.score === "number"
          ? Math.round(report.categories.performance.score * 100)
          : null,
      LCP_ms: typeof lcp === "number" ? Math.round(lcp) : null,
      CLS: cls,
      INP_ms: typeof inp === "number" ? Math.round(inp) : null,
      TBT_ms: typeof tbt === "number" ? Math.round(tbt) : null,
    };
  } catch (err) {
    console.error(`Parse failed for ${url}`, err);
    return null;
  } finally {
    try {
      require("node:fs").unlinkSync(outPath);
    } catch {
      // ignore
    }
  }
}

async function main() {
  // Health check
  try {
    const res = await fetch(BASE, { redirect: "follow" });
    if (!res.ok && res.status >= 500) {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch (err) {
    console.error(
      `Cannot reach ${BASE}. Start production server first:\n  npm run build && npm run start\n`,
      err,
    );
    process.exit(1);
  }

  const outDir = join(process.cwd(), "data/staging/site-quality");
  mkdirSync(outDir, { recursive: true });

  const routes: Array<{
    path: string;
    label: string;
    lighthouse: LhMetrics | null;
    status: "measured" | "failed";
    url: string;
  }> = [];

  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`;
    console.log(`Measuring ${route.path} …`);
    const lighthouse = runLighthouse(url);
    routes.push({
      path: route.path,
      label: route.label,
      lighthouse,
      status: lighthouse ? "measured" : "failed",
      url,
    });
    if (lighthouse) {
      console.log(
        `  score=${lighthouse.performanceScore} LCP=${lighthouse.LCP_ms}ms CLS=${lighthouse.CLS} INP=${lighthouse.INP_ms ?? "n/a"} TBT=${lighthouse.TBT_ms}ms`,
      );
    }
  }

  const measured = routes.filter((r) => r.status === "measured" && r.lighthouse);
  const avg = (key: keyof LhMetrics) => {
    const vals = measured
      .map((r) => r.lighthouse![key])
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1000) / 1000;
  };

  const baseline = {
    generatedAt: new Date().toISOString(),
    method: "lighthouse-cli-mobile",
    baseUrl: BASE,
    notes:
      "Lab Lighthouse (mobile). INP may be null in lab — use CrUX/field for INP. Do not invent scores.",
    budgetsDoc: "docs/performance-standards.md",
    routes,
    metrics: {
      LCP: { targetMs: 2500, measured: avg("LCP_ms") },
      CLS: { target: 0.1, measured: avg("CLS") },
      INP: { targetMs: 200, measured: avg("INP_ms") },
      TBT: { targetMs: 200, measured: avg("TBT_ms"), note: "Lab proxy when INP unavailable" },
    },
  };

  const outPath = join(outDir, "perf-baseline.json");
  writeFileSync(outPath, JSON.stringify(baseline, null, 2));
  console.log(`\nWrote ${outPath} (${measured.length}/${ROUTES.length} measured)`);
  if (measured.length < 3) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
