/**
 * Fix 77 — transfer lab after extreme-master remediation.
 * BASE_URL=http://127.0.0.1:3010 ENFORCE=1 node scripts/tmp/prelaunch-77-image-lab.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const ENFORCE = process.env.ENFORCE === "1";
const OUT_DIR = join(process.cwd(), "docs/prelaunch/data/rc-77");
mkdirSync(OUT_DIR, { recursive: true });

const BUDGETS = {
  "/": { totalBytes: 1.5 * 1024 * 1024, imageBytes: 900 * 1024 },
  "/running/shoes": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/brands/nike": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/products/nike-vomero-18": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/products/brooks-glycerin-22": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
  "/products/on-ultra-vest-pro": {
    totalBytes: 2.5 * 1024 * 1024,
    imageBytes: 2.0 * 1024 * 1024,
  },
};

const ROUTES = Object.keys(BUDGETS);

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
        url,
        size,
        type,
        ct,
        isImage: isImageUrl(url, ct) || type === "image",
        viaNextImage: url.includes("/_next/image"),
        status: res.status(),
      });
    } catch {
      /* ignore */
    }
  };
  page.on("response", onResponse);
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(800);
  page.off("response", onResponse);

  const totalBytes = resources.reduce((a, r) => a + r.size, 0);
  const imageResources = resources.filter((r) => r.isImage);
  const imageBytes = imageResources.reduce((a, r) => a + r.size, 0);
  const brokenImages = imageResources.filter((r) => r.status >= 400);
  const nextImageCount = imageResources.filter((r) => r.viaNextImage).length;
  const rawImageCount = imageResources.length - nextImageCount;
  const topImages = [...imageResources]
    .sort((a, b) => b.size - a.size)
    .slice(0, 8)
    .map((r) => ({
      kb: Math.round(r.size / 1024),
      viaNextImage: r.viaNextImage,
      status: r.status,
      url: r.url.replace(BASE, "").slice(0, 140),
    }));

  return {
    path,
    totalBytes,
    totalMB: Number((totalBytes / 1024 / 1024).toFixed(2)),
    imageBytes,
    imageMB: Number((imageBytes / 1024 / 1024).toFixed(2)),
    imageCount: imageResources.length,
    nextImageCount,
    rawImageCount,
    brokenImages: brokenImages.length,
    topImages,
    budget: BUDGETS[path],
    withinBudget:
      totalBytes <= BUDGETS[path].totalBytes &&
      imageBytes <= BUDGETS[path].imageBytes,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

const results = [];
for (const path of ROUTES) {
  const row = await measure(page, path);
  results.push(row);
  console.log(
    `${path} total=${row.totalMB}MB images=${row.imageMB}MB next=${row.nextImageCount} raw=${row.rawImageCount} broken=${row.brokenImages} budget=${row.withinBudget ? "OK" : "OVER"}`,
  );
}

await browser.close();

const payload = {
  asOf: new Date().toISOString(),
  base: BASE,
  results,
  failures: results.filter((r) => !r.withinBudget).map((r) => r.path),
  broken: results.filter((r) => r.brokenImages > 0).map((r) => r.path),
};

writeFileSync(join(OUT_DIR, "image-lab.json"), JSON.stringify(payload, null, 2));
console.log("Wrote docs/prelaunch/data/rc-77/image-lab.json");

if (ENFORCE && (payload.failures.length || payload.broken.length)) {
  console.error("Lab failures:", payload.failures, payload.broken);
  process.exit(1);
}
