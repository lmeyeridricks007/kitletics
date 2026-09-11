/**
 * Fix 30 — /compare transfer lab (empty builder + optional selected pair).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-30-compare-lab.mjs
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
  "docs/prelaunch/data/rc-final/30-compare-perf.json",
);
mkdirSync(join(process.cwd(), "docs/prelaunch/data/rc-final"), {
  recursive: true,
});

const BUDGET_TOTAL = 2.5 * 1024 * 1024;
const BUDGET_EMPTY_PREF = 1 * 1024 * 1024;

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
        url: url.slice(0, 180),
        size,
        type,
        isImage: isImageUrl(url, ct) || type === "image",
        viaNextImage: url.includes("/_next/image"),
        status: res.status(),
      });
    } catch {
      /* ignore */
    }
  };
  page.on("response", onResponse);
  const t0 = Date.now();
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
  const navMs = Date.now() - t0;
  await page.waitForTimeout(600);
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
    .slice(0, 12);

  return {
    path,
    status: 200,
    navMs,
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
    underBudget: total <= BUDGET_TOTAL,
    underEmptyPrefer: total <= BUDGET_EMPTY_PREF,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const empty = await measure(page, "/compare");
  const selected = await measure(
    page,
    "/compare?category=running-shoes&products=asics-novablast-6,asics-gel-nimbus-27",
  );
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mobile.newPage();
  const emptyMobile = await measure(mpage, "/compare");

  const report = {
    base: BASE,
    measuredAt: new Date().toISOString(),
    budgets: {
      totalBytes: BUDGET_TOTAL,
      emptyPreferBytes: BUDGET_EMPTY_PREF,
    },
    before: {
      path: "/compare",
      totalKB: 9248,
      imgKB: 8970,
      jsKB: 168,
      note: "RC final perf-extra.json",
    },
    after: { empty, selected, emptyMobile },
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        empty: {
          totalKB: empty.totalKB,
          imgKB: empty.imgKB,
          jsKB: empty.jsKB,
          fcp: empty.fcp,
          ttfb: empty.ttfb,
          cls: empty.cls,
          underBudget: empty.underBudget,
          underEmptyPrefer: empty.underEmptyPrefer,
          nextImageCount: empty.nextImageCount,
          rawImageCount: empty.rawImageCount,
        },
        selected: {
          totalKB: selected.totalKB,
          imgKB: selected.imgKB,
          underBudget: selected.underBudget,
        },
        emptyMobile: {
          totalKB: emptyMobile.totalKB,
          imgKB: emptyMobile.imgKB,
          underBudget: emptyMobile.underBudget,
        },
        out: OUT,
      },
      null,
      2,
    ),
  );

  await browser.close();
  if (!empty.underBudget || !selected.underBudget || !emptyMobile.underBudget) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
