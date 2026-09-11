/**
 * Visual QA capture — desktop + mobile screenshots for Fix 24.
 * Usage: BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-24-visual-qa.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data/visual-qa-24");
mkdirSync(join(OUT, "desktop"), { recursive: true });
mkdirSync(join(OUT, "mobile"), { recursive: true });
mkdirSync(join(OUT, "nav"), { recursive: true });

const ROUTES = [
  { id: "home", path: "/" },
  { id: "running-hub", path: "/running" },
  { id: "running-shoes", path: "/running/shoes" },
  { id: "running-watches", path: "/running/watches" },
  { id: "running-clothing", path: "/running/clothing" },
  { id: "product", path: "/products/nike-vomero-18" },
  { id: "review", path: "/reviews/nike-vomero-18" },
  { id: "best", path: "/best/running-shoes" },
  { id: "guide", path: "/guides/how-to-choose-running-shoes" },
  { id: "guides-hub", path: "/guides" },
  { id: "comparison", path: "/compare/asics-novablast-6-vs-brooks-ghost-18" },
  { id: "compare-builder", path: "/compare" },
  { id: "alternatives", path: "/products/nike-vomero-18/alternatives" },
  { id: "brand", path: "/brands/nike" },
  { id: "finder", path: "/tools/running-shoe-finder" },
  { id: "finder-results", path: "/tools/running-shoe-finder/results" },
  { id: "calculator", path: "/tools/running-pace-calculator" },
  { id: "search", path: "/search" },
  { id: "tools", path: "/tools" },
  { id: "setup", path: "/setups/beginner-running-setup" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function measureOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const clientW = doc.clientWidth;
    return {
      overflowX: scrollW > clientW + 2,
      scrollWidth: scrollW,
      clientWidth: clientW,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim()?.slice(0, 120) ?? null,
    };
  });
}

async function captureContextualNav(page) {
  await page.goto(`${BASE}/running`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  const labels = await page.evaluate(() => {
    const nav =
      document.querySelector('[data-contextual-nav]') ||
      document.querySelector('nav[aria-label*="Running" i]') ||
      [...document.querySelectorAll("nav")].find((n) =>
        /overview|shoes|best|reviews/i.test(n.textContent || ""),
      );
    if (!nav) return { found: false, labels: [] };
    const links = [...nav.querySelectorAll("a")].map((a) => ({
      text: (a.textContent || "").replace(/\s+/g, " ").trim(),
      href: a.getAttribute("href"),
    }));
    return { found: true, labels: links };
  });
  // Hover Running primary to open mega if needed — also screenshot contextual bar
  await page.screenshot({
    path: join(OUT, "nav", "running-hub-contextual-desktop.png"),
    fullPage: false,
  });
  return labels;
}

async function inspectProductSignals(page) {
  await page.goto(`${BASE}/products/nike-vomero-18`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  return page.evaluate(() => {
    const text = document.body.innerText;
    const has = (re) => re.test(text);
    return {
      kitleticsReview: has(/Kitletics Review/i),
      bestFor: has(/Best for/i),
      notIdeal: has(/Not ideal|Who should skip|Skip if/i),
      pros: has(/\bPros\b/),
      tradeoffs: has(/Trade-?offs|Cons|Limitations/i),
      specs: has(/Specs|Key specs|Specifications/i),
      alternatives: has(/Alternatives/i),
      comparisons: has(/Compar/i),
      offers: has(/Buy|Amazon|Where to buy|Offers|Retailer/i),
      relatedGuides: has(/Related guide|Guides|Read next/i),
      positioning: has(/positioning|At a glance|Verdict|Bottom line|Who it's for/i),
      menWomen: has(/\bMen\b|\bWomen\b|Unisex|gender/i),
    };
  });
}

async function inspectGuidesHub(page) {
  await page.goto(`${BASE}/guides`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const cards = document.querySelectorAll(
      '[data-guide-hub-card], article, .guide-hub-card',
    ).length;
    const hasImages = document.querySelectorAll("main img").length;
    const hasEyebrows = /Start here|By topic|Featured|Guide/i.test(document.body.innerText);
    return { cardish: cards, mainImages: hasImages, hasEyebrows, title: document.title };
  });
}

async function inspectBestGuide(page) {
  await page.goto(`${BASE}/best/running-shoes`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  return page.evaluate(() => {
    const productGridCards = document.querySelectorAll(
      '[data-product-card], .product-card',
    ).length;
    const editorialBlocks = /Why it wins|Best for|Choose instead|Skip if|Editor|Recommendation/i.test(
      document.body.innerText,
    );
    const rankItems = document.querySelectorAll(
      '[data-best-pick], article, section',
    ).length;
    return {
      productGridCards,
      editorialBlocks,
      sectionCount: rankItems,
      h1: document.querySelector("h1")?.textContent?.trim(),
    };
  });
}

async function inspectMenWomen(page) {
  const shoes = await page.goto(`${BASE}/running/shoes`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(600);
  const shoesSignals = await page.evaluate(() => {
    const text = document.body.innerText;
    const genderControls = [...document.querySelectorAll("a,button,[role=radio],[role=tab]")]
      .map((el) => (el.textContent || "").trim())
      .filter((t) => /^(Men|Women|Unisex|All)$/i.test(t) || /Men'?s|Women'?s/i.test(t));
    return {
      hasMenWomenInUI: genderControls.length > 0,
      genderControls: [...new Set(genderControls)].slice(0, 12),
      hasGenderInText: /\bMen\b|\bWomen\b|Men'?s|Women'?s/i.test(text),
    };
  });

  await page.goto(`${BASE}/running/clothing`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(600);
  const clothingSignals = await page.evaluate(() => {
    const genderControls = [...document.querySelectorAll("a,button,[role=radio],[role=tab]")]
      .map((el) => (el.textContent || "").trim())
      .filter((t) => /^(Men|Women|Unisex|All)$/i.test(t) || /Men'?s|Women'?s/i.test(t));
    return {
      status: document.title,
      genderControls: [...new Set(genderControls)].slice(0, 12),
      httpOk: true,
    };
  });

  return { shoes: shoesSignals, clothing: clothingSignals, shoesStatus: shoes?.status() };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      const started = Date.now();
      let status = 0;
      let error = null;
      let meta = {};
      try {
        const res = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 90000,
        });
        status = res?.status() ?? 0;
        await page.waitForTimeout(900);
        meta = await measureOverflow(page);
        const file = join(OUT, vp.name, `${route.id}.png`);
        await page.screenshot({ path: file, fullPage: false });
        // also full-page for key editorial templates
        if (
          ["home", "guides-hub", "best", "product", "review", "running-hub"].includes(
            route.id,
          )
        ) {
          await page.screenshot({
            path: join(OUT, vp.name, `${route.id}-full.png`),
            fullPage: true,
          });
        }
      } catch (e) {
        error = String(e?.message || e);
      }
      results.push({
        viewport: vp.name,
        id: route.id,
        path: route.path,
        status,
        ms: Date.now() - started,
        error,
        ...meta,
      });
      console.log(
        `${vp.name.padEnd(8)} ${String(status).padStart(3)} ${route.id.padEnd(18)} ${route.path}${error ? " ERR " + error.slice(0, 80) : ""}`,
      );
    }
    await context.close();
  }

  // Desktop-only deep checks
  const desk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desk.newPage();
  const contextualNav = await captureContextualNav(page);
  const productSignals = await inspectProductSignals(page);
  const guidesHub = await inspectGuidesHub(page);
  const bestGuide = await inspectBestGuide(page);
  const menWomen = await inspectMenWomen(page);

  // Capture open Running primary menu if present
  try {
    await page.goto(`${BASE}/running`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(500);
    const runningTrigger = page
      .locator('header a, header button')
      .filter({ hasText: /^Running$/i })
      .first();
    if (await runningTrigger.count()) {
      await runningTrigger.hover({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(OUT, "nav", "running-primary-hover.png"),
        fullPage: false,
      });
    }
  } catch {
    /* optional */
  }

  await desk.close();
  await browser.close();

  const summary = {
    base: BASE,
    capturedAt: new Date().toISOString(),
    routes: results,
    contextualNav,
    productSignals,
    guidesHub,
    bestGuide,
    menWomen,
  };
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log("\nWrote", join(OUT, "summary.json"));
  console.log(
    "overflow failures",
    results.filter((r) => r.overflowX).map((r) => `${r.viewport}:${r.id}`),
  );
  console.log(
    "non-200",
    results.filter((r) => r.status !== 200).map((r) => `${r.viewport}:${r.id}:${r.status}`),
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
