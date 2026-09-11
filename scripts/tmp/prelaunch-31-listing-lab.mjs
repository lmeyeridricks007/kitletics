/**
 * Fix 31 — use-case listing image transfer lab.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-31-listing-lab.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const OUT = join(
  process.cwd(),
  "docs/prelaunch/data/rc-final/31-listing-perf.json",
);
mkdirSync(join(process.cwd(), "docs/prelaunch/data/rc-final"), {
  recursive: true,
});

const BUDGET = 2.5 * 1024 * 1024;
const PREFER = 1.5 * 1024 * 1024;

const ROUTES = [
  "/running/shoes/daily-trainers",
  "/running/shoes",
  "/running/shoes/trail",
  "/running/shoes/stability",
  "/running/shoes/race",
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
        url: url.slice(0, 200),
        size,
        type,
        isImage: isImageUrl(url, ct) || type === "image",
        viaNextImage: url.includes("/_next/image"),
      });
    } catch {
      /* ignore */
    }
  };
  page.on("response", onResponse);
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(500);
  page.off("response", onResponse);

  const paint = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance
      .getEntriesByType("paint")
      .find((e) => e.name === "first-contentful-paint");
    let cls = 0;
    for (const e of performance.getEntriesByType("layout-shift")) {
      if (!e.hadRecentInput) cls += e.value;
    }
    return {
      ttfb: nav?.responseStart ?? null,
      fcp: fcp?.startTime ?? null,
      cls,
    };
  });

  const total = resources.reduce((a, r) => a + r.size, 0);
  const img = resources.filter((r) => r.isImage).reduce((a, r) => a + r.size, 0);
  const js = resources
    .filter((r) => r.type === "script" || r.url.includes(".js"))
    .reduce((a, r) => a + r.size, 0);
  const topImages = resources
    .filter((r) => r.isImage)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return {
    path,
    total,
    img,
    js,
    totalKB: Math.round(total / 1024),
    imgKB: Math.round(img / 1024),
    jsKB: Math.round(js / 1024),
    fcp: paint.fcp != null ? Math.round(paint.fcp) : null,
    ttfb: paint.ttfb != null ? Math.round(paint.ttfb) : null,
    cls: paint.cls,
    nextImageCount: resources.filter((r) => r.viaNextImage).length,
    rawImageCount: resources.filter(
      (r) => r.isImage && !r.viaNextImage && !r.url.includes("data:"),
    ).length,
    topImages,
    underBudget: total <= BUDGET,
    underPrefer: total <= PREFER,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({ viewport: { width: 1440, height: 900 } })
  ).newPage();

  const after = {};
  for (const path of ROUTES) {
    after[path] = await measure(page, path);
    console.error(
      path,
      after[path].totalKB + "KB",
      "img",
      after[path].imgKB + "KB",
      after[path].underBudget ? "OK" : "FAIL",
    );
  }

  const report = {
    base: BASE,
    measuredAt: new Date().toISOString(),
    budgets: { totalBytes: BUDGET, preferBytes: PREFER },
    before: {
      "/running/shoes/daily-trainers": {
        totalKB: 6478,
        imgKB: 6198,
        note: "RC perf-summary.json",
      },
    },
    after,
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        out: OUT,
        summary: Object.fromEntries(
          Object.entries(after).map(([p, m]) => [
            p,
            {
              totalKB: m.totalKB,
              imgKB: m.imgKB,
              underBudget: m.underBudget,
              underPrefer: m.underPrefer,
              rawImageCount: m.rawImageCount,
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );
  await browser.close();
  const fail = Object.values(after).some((m) => !m.underBudget);
  if (fail) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
