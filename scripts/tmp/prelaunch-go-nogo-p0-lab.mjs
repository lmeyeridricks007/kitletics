/**
 * Final GO/NO-GO — P0 transfer + axe lab (read-only).
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data/rc-final");
mkdirSync(OUT, { recursive: true });

const BUDGET = 2.5 * 1024 * 1024;

const ROUTES = [
  { id: "home", path: "/" },
  { id: "running", path: "/running" },
  { id: "shoes", path: "/running/shoes" },
  { id: "daily-trainers", path: "/running/shoes/daily-trainers" },
  { id: "pdp", path: "/products/nike-vomero-18" },
  { id: "best", path: "/best/running-shoes" },
  { id: "guide", path: "/guides/how-to-choose-running-shoes" },
  { id: "compare", path: "/compare" },
  { id: "finder", path: "/tools/running-shoe-finder" },
  { id: "brand", path: "/brands/nike" },
];

const NOINDEX_CHECK = [
  "/search?q=vomero",
  "/search",
  "/running/shoes?gender=men",
  "/tools/running-shoe-finder", // finder hub may be indexable; results noindex
];

function isImageUrl(url, ct) {
  if (url.includes("/_next/image")) return true;
  if ((ct || "").startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url);
}

async function measure(page, path) {
  const resources = [];
  const onResponse = async (res) => {
    try {
      const url = res.url();
      const ct = res.headers()["content-type"] || "";
      const req = res.request();
      const type = req.resourceType();
      let size = Number(res.headers()["content-length"] || 0);
      if (!size) {
        const buf = await res.body().catch(() => null);
        size = buf ? buf.length : 0;
      }
      resources.push({
        url: url.slice(0, 160),
        size,
        type,
        isImage: isImageUrl(url, ct) || type === "image",
        isJs: type === "script" || /\.js(\?|$)/i.test(url),
      });
    } catch {
      /* ignore */
    }
  };
  page.on("response", onResponse);
  const res = await page.goto(BASE + path, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(400);
  page.off("response", onResponse);

  const html = await page.content();
  const robots =
    html.match(
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
    )?.[1] ??
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i,
    )?.[1];
  const hasAggregateRating = /AggregateRating/i.test(html);
  const falseFirstHand =
    /we personally tested this product|I personally tested|first-hand lab test of this exact/i.test(
      html,
    );

  let axe = null;
  try {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    );
    axe = {
      violations: results.violations.length,
      seriousCritical: serious.length,
      seriousCriticalIds: serious.map((v) => v.id),
    };
  } catch (e) {
    axe = { error: String(e) };
  }

  const total = resources.reduce((a, r) => a + r.size, 0);
  const images = resources.filter((r) => r.isImage).reduce((a, r) => a + r.size, 0);
  const js = resources.filter((r) => r.isJs).reduce((a, r) => a + r.size, 0);

  return {
    path,
    status: res?.status() ?? 0,
    totalBytes: total,
    imageBytes: images,
    jsBytes: js,
    totalMb: Math.round((total / 1024 / 1024) * 100) / 100,
    withinBudget: total <= BUDGET,
    robots,
    noindex: /noindex/i.test(robots || ""),
    hasAggregateRating,
    falseFirstHand,
    axe,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const routes = [];
  for (const r of ROUTES) {
    console.error(`measure ${r.path}`);
    routes.push({ id: r.id, ...(await measure(page, r.path)) });
  }

  const noindexChecks = [];
  for (const path of NOINDEX_CHECK) {
    const res = await page.goto(BASE + path, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const html = await page.content();
    const robots =
      html.match(
        /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
      )?.[1] ?? "";
    noindexChecks.push({
      path,
      status: res?.status() ?? 0,
      robots,
      noindex: /noindex/i.test(robots),
    });
  }

  // Finder results path if available
  const finderResults = "/tools/running-shoe-finder/results";
  try {
    const res = await page.goto(BASE + finderResults, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const html = await page.content();
    const robots =
      html.match(
        /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
      )?.[1] ?? "";
    noindexChecks.push({
      path: finderResults,
      status: res?.status() ?? 0,
      robots,
      noindex: /noindex/i.test(robots),
    });
  } catch (e) {
    noindexChecks.push({
      path: finderResults,
      error: String(e),
      noindex: null,
    });
  }

  await context.close();
  await browser.close();

  const compare = routes.find((r) => r.id === "compare");
  const daily = routes.find((r) => r.id === "daily-trainers");
  const axeFail = routes.filter(
    (r) => (r.axe?.seriousCritical ?? 0) > 0 || r.axe?.error,
  );

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    budgetBytes: BUDGET,
    routes,
    noindexChecks,
    gates: {
      compareWithinBudget: (compare?.totalBytes ?? Infinity) <= BUDGET,
      dailyTrainersWithinBudget: (daily?.totalBytes ?? Infinity) <= BUDGET,
      axeSeriousCriticalZero: axeFail.length === 0,
      anyAggregateRating: routes.some((r) => r.hasAggregateRating),
      anyFalseFirstHand: routes.some((r) => r.falseFirstHand),
    },
  };

  writeFileSync(join(OUT, "go-nogo-p0-lab.json"), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        gates: report.gates,
        totals: routes.map((r) => ({
          id: r.id,
          mb: r.totalMb,
          okBudget: r.withinBudget,
          axeSC: r.axe?.seriousCritical,
          status: r.status,
        })),
        noindexChecks: report.noindexChecks,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
