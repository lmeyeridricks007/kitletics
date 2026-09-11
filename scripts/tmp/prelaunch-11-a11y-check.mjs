/**
 * Focused a11y + overflow check for Fix 11 P0 routes.
 * BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-11-a11y-check.mjs
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  "/",
  "/running",
  "/running/shoes",
  "/products/nike-vomero-18",
  "/reviews/nike-vomero-18",
  "/best/running-shoes",
  "/guides/how-to-choose-running-shoes",
  "/brands/nike",
  "/compare",
  "/tools/running-shoe-finder",
  "/search?q=vomero",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const path of ROUTES) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const url = `${BASE}${path}`;
    console.log("Checking", path);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(400);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        return {
          docOverflowX: doc.scrollWidth > doc.clientWidth + 1,
          bodyOverflowX: body.scrollWidth > body.clientWidth + 1,
          scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
          clientWidth: doc.clientWidth,
        };
      });

      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const serious = axe.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );

      results.push({
        path,
        status: 200,
        overflow390: overflow,
        axeSeriousOrCritical: serious.length,
        violations: serious.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          help: v.help,
        })),
      });
    } catch (e) {
      results.push({ path, error: String(e) });
    }
    await context.close();
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    routes: results.length,
    overflowRoutes: results.filter((r) => r.overflow390?.docOverflowX).map((r) => r.path),
    routesWithSeriousCritical: results.filter((r) => (r.axeSeriousOrCritical ?? 0) > 0)
      .length,
    totalSeriousCritical: results.reduce(
      (n, r) => n + (r.axeSeriousOrCritical ?? 0),
      0,
    ),
    results,
  };

  writeFileSync(
    join(OUT, "11-a11y-responsive.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify({
    overflowRoutes: summary.overflowRoutes,
    routesWithSeriousCritical: summary.routesWithSeriousCritical,
    totalSeriousCritical: summary.totalSeriousCritical,
    sample: results.map((r) => ({
      path: r.path,
      overflow: r.overflow390?.docOverflowX,
      serious: r.axeSeriousOrCritical,
      ids: r.violations?.map((v) => v.id),
    })),
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
