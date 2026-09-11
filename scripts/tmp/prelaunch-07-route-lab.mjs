/**
 * READ-ONLY Audit 07 — Playwright + axe route lab measurements.
 * Does not optimize. Writes raw JSON to /tmp/kitletics-audit07/route-lab.json
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-07-route-lab.mjs
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = "/tmp/kitletics-audit07";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: "/", pageType: "Homepage" },
  { path: "/running", pageType: "Running Hub" },
  { path: "/running/shoes", pageType: "Running Shoes" },
  { path: "/running/shoes/daily-trainers", pageType: "Running subcategory" },
  { path: "/products/nike-vomero-18", pageType: "Product Detail" },
  { path: "/reviews/nike-vomero-18", pageType: "Review" },
  { path: "/best/running-shoes", pageType: "Best Guide" },
  { path: "/guides/how-to-choose-running-shoes", pageType: "Long Guide" },
  { path: "/brands/nike", pageType: "Brand Hub" },
  { path: "/compare", pageType: "Compare" },
  { path: "/tools/running-shoe-finder", pageType: "Finder" },
  { path: "/tools/running-pace-calculator", pageType: "Calculator" },
  { path: "/search", pageType: "Search" },
];

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

async function measureRoute(browser, route, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 KitleticsAudit07/1.0",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const responses404 = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err.message || err)));
  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText ?? "unknown",
    });
  });
  page.on("response", (res) => {
    if (res.status() === 404) responses404.push(res.url());
  });

  const url = `${BASE}${route.path}`;
  const t0 = Date.now();
  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    status = res?.status() ?? 0;
  } catch (e) {
    await context.close();
    return {
      path: route.path,
      pageType: route.pageType,
      viewport: viewport.name,
      error: String(e),
      status: 0,
    };
  }
  const navMs = Date.now() - t0;

  // Collect performance + resource weights from the page
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const resources = performance.getEntriesByType("resource");

    let jsBytes = 0;
    let cssBytes = 0;
    let imgBytes = 0;
    let fontBytes = 0;
    let otherBytes = 0;
    let totalBytes = 0;
    const jsUrls = [];
    const imgUrls = [];

    for (const r of resources) {
      const size = r.transferSize || r.encodedBodySize || 0;
      totalBytes += size;
      const name = r.name || "";
      const type = r.initiatorType;
      if (type === "script" || /\.js(\?|$)/i.test(name)) {
        jsBytes += size;
        jsUrls.push({ url: name, bytes: size });
      } else if (type === "css" || /\.css(\?|$)/i.test(name)) {
        cssBytes += size;
      } else if (type === "img" || /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(name)) {
        imgBytes += size;
        imgUrls.push({ url: name, bytes: size });
      } else if (type === "font" || /\.(woff2?|ttf|otf)(\?|$)/i.test(name)) {
        fontBytes += size;
      } else {
        otherBytes += size;
      }
    }
    jsUrls.sort((a, b) => b.bytes - a.bytes);
    imgUrls.sort((a, b) => b.bytes - a.bytes);

    const fcp = paints.find((p) => p.name === "first-contentful-paint")?.startTime ?? null;

    // LCP from PerformanceObserver buffer if available
    let lcp = null;
    try {
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length) lcp = lcpEntries[lcpEntries.length - 1].startTime;
    } catch {
      /* ignore */
    }

    // CLS from layout-shift entries (lab approximation)
    let cls = 0;
    try {
      for (const e of performance.getEntriesByType("layout-shift")) {
        if (!e.hadRecentInput) cls += e.value;
      }
    } catch {
      /* ignore */
    }

    const ttfb = nav ? nav.responseStart : null;
    const domContentLoaded = nav ? nav.domContentLoadedEventEnd : null;
    const loadEvent = nav ? nav.loadEventEnd : null;

    // Structural a11y signals
    const h1s = [...document.querySelectorAll("h1")].map((el) => el.textContent?.trim() ?? "");
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().slice(0, 80),
    }));
    const landmarks = {
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      header: document.querySelectorAll("header").length,
      footer: document.querySelectorAll("footer").length,
      complementary: document.querySelectorAll('[role="complementary"], aside').length,
    };
    const images = [...document.querySelectorAll("img")];
    const missingAlt = images.filter((img) => !img.hasAttribute("alt")).length;
    const emptyAlt = images.filter((img) => img.getAttribute("alt") === "").length;
    const imgsWithoutWH = images.filter((img) => !img.getAttribute("width") && !img.getAttribute("height") && !img.style.aspectRatio).length;

    // overflow check
    const docOverflowX = document.documentElement.scrollWidth > window.innerWidth + 2;

    // Men/Women selectors presence
    const genderControls = [...document.querySelectorAll("button, a, select, [role='tab']")]
      .map((el) => (el.textContent || el.getAttribute("aria-label") || "").trim())
      .filter((t) => /^(men|women|men's|women's|unisex)$/i.test(t) || /men.?s|women.?s/i.test(t))
      .slice(0, 20);

    // forms / labels
    const inputs = [...document.querySelectorAll("input, select, textarea")].filter(
      (el) => el.type !== "hidden",
    );
    let unlabeled = 0;
    for (const el of inputs) {
      const id = el.id;
      const hasLabel =
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        el.closest("label") ||
        el.getAttribute("aria-label") ||
        el.getAttribute("aria-labelledby");
      if (!hasLabel) unlabeled++;
    }

    const tables = document.querySelectorAll("table").length;
    const dialogs = document.querySelectorAll('[role="dialog"], dialog, [data-state="open"]').length;

    // priority images
    const priorityImgs = images.filter((img) => img.getAttribute("fetchpriority") === "high").length;

    // third-party hosts
    const hosts = new Set();
    for (const r of resources) {
      try {
        const u = new URL(r.name);
        if (u.origin !== location.origin) hosts.add(u.host);
      } catch {
        /* ignore */
      }
    }

    return {
      fcp,
      lcp,
      cls: Math.round(cls * 1000) / 1000,
      ttfb,
      domContentLoaded,
      loadEvent,
      jsBytes,
      cssBytes,
      imgBytes,
      fontBytes,
      otherBytes,
      totalBytes,
      resourceCount: resources.length,
      topJs: jsUrls.slice(0, 12),
      topImages: imgUrls.slice(0, 12),
      h1s,
      headingCount: headings.length,
      headingOutline: headings.slice(0, 40),
      landmarks,
      imageCount: images.length,
      missingAlt,
      emptyAltDecorativeOk: emptyAlt,
      imgsWithoutExplicitWH: imgsWithoutWH,
      docOverflowX,
      genderControls,
      inputCount: inputs.length,
      unlabeledInputs: unlabeled,
      tables,
      dialogs,
      priorityImgs,
      thirdPartyHosts: [...hosts].sort(),
      title: document.title,
    };
  });

  // axe
  let axe = null;
  try {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    axe = {
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
        helpUrl: v.helpUrl,
        samples: v.nodes.slice(0, 3).map((n) => ({
          target: n.target,
          failureSummary: n.failureSummary?.slice(0, 200),
        })),
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      violationCount: results.violations.length,
      seriousOrCritical: results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ).length,
    };
  } catch (e) {
    axe = { error: String(e) };
  }

  await context.close();

  return {
    path: route.path,
    pageType: route.pageType,
    viewport: viewport.name,
    url,
    status,
    navMs,
    measured: metrics,
    axe,
    consoleErrors: consoleErrors.slice(0, 30),
    pageErrors: pageErrors.slice(0, 20),
    failedRequests: failedRequests.slice(0, 30),
    responses404: [...new Set(responses404)].slice(0, 30),
  };
}

async function functionalProbes(browser) {
  const results = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  async function probe(name, fn) {
    try {
      const detail = await fn();
      results.push({ name, ok: true, detail });
    } catch (e) {
      results.push({ name, ok: false, error: String(e?.message || e) });
    }
  }

  await probe("search-page-loads", async () => {
    const res = await page.goto(`${BASE}/search?q=vomero`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    return { status: res?.status(), title: await page.title() };
  });

  await probe("running-shoes-filter-query", async () => {
    const res = await page.goto(`${BASE}/running/shoes?gender=men`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const body = await page.content();
    return {
      status: res?.status(),
      hasGenderParam: page.url().includes("gender="),
      mentionsMenOrFilter: /men|filter|gender/i.test(body),
    };
  });

  await probe("running-shoes-sort", async () => {
    const res = await page.goto(`${BASE}/running/shoes?sort=price-asc`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    return { status: res?.status(), url: page.url() };
  });

  await probe("compare-hub", async () => {
    const res = await page.goto(`${BASE}/compare`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const hasBuilder = await page.locator("text=/compare|select|add product/i").first().count();
    return { status: res?.status(), hasBuilderText: hasBuilder > 0 };
  });

  await probe("finder-start", async () => {
    const res = await page.goto(`${BASE}/tools/running-shoe-finder`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    return { status: res?.status(), title: await page.title() };
  });

  await probe("product-offers-section", async () => {
    const res = await page.goto(`${BASE}/products/nike-vomero-18`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const text = await page.locator("body").innerText();
    return {
      status: res?.status(),
      mentionsOfferOrBuy: /offer|buy|amazon|price|retailer/i.test(text),
    };
  });

  await probe("internal-nav-home-to-running", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    const link = page.locator('a[href="/running"]').first();
    if ((await link.count()) === 0) throw new Error("No /running link on homepage");
    await link.click({ timeout: 10000 });
    await page.waitForURL(/\/running/, { timeout: 15000 });
    return { url: page.url() };
  });

  await probe("men-women-on-pdp", async () => {
    await page.goto(`${BASE}/products/nike-vomero-18`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const text = await page.locator("body").innerText();
    const hasGenderUI = /men'?s|women'?s|unisex|gender/i.test(text);
    return { hasGenderUI };
  });

  await context.close();
  return results;
}

async function main() {
  console.log("Connecting to", BASE);
  const health = await fetch(BASE).catch((e) => e);
  if (!(health instanceof Response) || health.status >= 500) {
    console.error("Server not healthy", health);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const routeResults = [];

  // Full metrics on desktop for all routes; mobile+tablet for subset
  const responsiveSample = [
    "/",
    "/running/shoes",
    "/products/nike-vomero-18",
    "/reviews/nike-vomero-18",
    "/compare",
    "/search",
  ];

  for (const route of ROUTES) {
    console.log("measure", route.path, "desktop");
    routeResults.push(await measureRoute(browser, route, VIEWPORTS[2]));
  }

  const responsiveResults = [];
  for (const path of responsiveSample) {
    const route = ROUTES.find((r) => r.path === path) || { path, pageType: path };
    for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
      console.log("responsive", path, vp.name);
      responsiveResults.push(await measureRoute(browser, route, vp));
    }
  }

  console.log("functional probes...");
  const functional = await functionalProbes(browser);

  await browser.close();

  const out = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    method: "playwright-chromium-lab + axe-core",
    notes: [
      "LCP/CLS from Performance API layout-shift / largest-contentful-paint entries (lab).",
      "INP not measured in this lab harness — reported as not measurable locally.",
      "Transfer sizes from Resource Timing (may be 0 for cached/disk-cache entries).",
      "No optimizations applied.",
    ],
    routes: routeResults,
    responsive: responsiveResults,
    functional,
  };

  writeFileSync(join(OUT, "route-lab.json"), JSON.stringify(out, null, 2));
  console.log("Wrote", join(OUT, "route-lab.json"));
  console.log(
    JSON.stringify(
      {
        routes: routeResults.length,
        responsive: responsiveResults.length,
        functionalOk: functional.filter((f) => f.ok).length,
        functionalFail: functional.filter((f) => !f.ok).length,
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
