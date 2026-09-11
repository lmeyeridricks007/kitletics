/**
 * Fix 81 — P0 transfer + axe on the launch route set (incl. Search).
 * BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-81-p0-lab.mjs
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const OUT = join(
  process.cwd(),
  process.env.P0_LAB_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(OUT, { recursive: true });

const BUDGET = 2.5 * 1024 * 1024;

const ROUTES = [
  { id: "home", path: "/" },
  { id: "running", path: "/running" },
  { id: "shoes", path: "/running/shoes" },
  { id: "daily-trainers", path: "/running/shoes/daily-trainers" },
  { id: "pdp", path: "/products/nike-vomero-18" },
  { id: "review", path: "/reviews/nike-vomero-18" },
  { id: "best", path: "/best/running-shoes" },
  { id: "guide", path: "/guides/how-to-choose-running-shoes" },
  { id: "brand", path: "/brands/nike" },
  { id: "compare", path: "/compare" },
  { id: "finder", path: "/tools/running-shoe-finder" },
  { id: "search", path: "/search?q=vomero" },
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
      incomplete: results.incomplete.length,
      incompleteIds: results.incomplete.map((v) => v.id),
    };
  } catch (e) {
    axe = { error: String(e) };
  }

  const total = resources.reduce((a, r) => a + r.size, 0);
  const images = resources
    .filter((r) => r.isImage)
    .reduce((a, r) => a + r.size, 0);
  const js = resources.filter((r) => r.isJs).reduce((a, r) => a + r.size, 0);

  return {
    path,
    status: res?.status() ?? 0,
    totalBytes: total,
    imageBytes: images,
    jsBytes: js,
    totalMb: Math.round((total / 1024 / 1024) * 100) / 100,
    imageMb: Math.round((images / 1024 / 1024) * 100) / 100,
    withinBudget: total <= BUDGET,
    robots,
    noindex: /noindex/i.test(robots || ""),
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

  await context.close();
  await browser.close();

  const overBudget = routes.filter((r) => !r.withinBudget);
  const axeFail = routes.filter(
    (r) => (r.axe?.seriousCritical ?? 0) > 0 || r.axe?.error,
  );

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    budgetBytes: BUDGET,
    budgetMb: 2.5,
    routes,
    gates: {
      allWithinBudget: overBudget.length === 0,
      zeroAxeSeriousCritical: axeFail.length === 0,
    },
    overBudget: overBudget.map((r) => ({
      id: r.id,
      path: r.path,
      totalMb: r.totalMb,
      imageMb: r.imageMb,
    })),
    axeFail: axeFail.map((r) => ({ id: r.id, path: r.path, axe: r.axe })),
  };

  writeFileSync(join(OUT, "p0-lab.json"), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        routes: routes.map((r) => ({
          id: r.id,
          status: r.status,
          totalMb: r.totalMb,
          imageMb: r.imageMb,
          withinBudget: r.withinBudget,
          noindex: r.noindex,
          axeSeriousCritical: r.axe?.seriousCritical ?? r.axe?.error,
          axeIncomplete: r.axe?.incomplete,
        })),
        gates: report.gates,
      },
      null,
      2,
    ),
  );

  process.exit(
    report.gates.allWithinBudget && report.gates.zeroAxeSeriousCritical ? 0 : 1,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
