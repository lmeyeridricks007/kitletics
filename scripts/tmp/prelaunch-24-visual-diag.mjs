/**
 * Deep visual QA diagnostics for Fix 24.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data/visual-qa-24");
mkdirSync(join(OUT, "nav"), { recursive: true });
mkdirSync(join(OUT, "desktop"), { recursive: true });
mkdirSync(join(OUT, "mobile"), { recursive: true });

async function overflowCulprits(page) {
  return page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 2) continue;
      if (r.right > docW + 8 || r.left < -8) {
        const cs = getComputedStyle(el);
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 120),
          right: Math.round(r.right),
          left: Math.round(r.left),
          w: Math.round(r.width),
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          overflow: cs.overflowX,
        });
      }
    }
    bad.sort((a, b) => b.right - a.right);
    return bad.slice(0, 12);
  });
}

async function contextualItems(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const bar =
      document.querySelector("[data-contextual-nav]") ||
      document.querySelector('nav[aria-label="Running"]') ||
      document.querySelector('nav[aria-label*="secondary" i]') ||
      [...document.querySelectorAll("nav")].find((n) =>
        /Overview/.test(n.textContent || "") && /Shoes/.test(n.textContent || ""),
      );
    if (!bar) {
      // try sticky secondary strip
      const candidates = [...document.querySelectorAll("header ~ * a, [class*='Contextual'] a, [class*='contextual'] a")];
      return {
        found: false,
        allSecondaryish: candidates.slice(0, 40).map((a) => ({
          t: (a.textContent || "").trim(),
          href: a.getAttribute("href"),
        })),
      };
    }
    const links = [...bar.querySelectorAll("a,button")].map((a) => ({
      t: (a.textContent || "").replace(/\s+/g, " ").trim(),
      href: a.getAttribute("href"),
    }));
    return { found: true, aria: bar.getAttribute("aria-label"), links };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desk.newPage();

  const report = {};

  // Contextual nav on running + shoes
  report.navRunning = await contextualItems(page, "/running");
  await page.screenshot({ path: join(OUT, "nav", "running-page-top.png"), fullPage: false });
  report.navShoes = await contextualItems(page, "/running/shoes");

  // Dump contextual nav HTML structure
  report.navDomProbe = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("nav, [class*='ontextual'], [data-contextual-nav]")].map(
      (n) => ({
        tag: n.tagName,
        aria: n.getAttribute("aria-label"),
        data: n.getAttribute("data-contextual-nav"),
        cls: (n.className || "").toString().slice(0, 100),
        text: (n.innerText || "").replace(/\s+/g, " ").trim().slice(0, 220),
      }),
    );
    return nodes.slice(0, 20);
  });

  // Overflow culprits
  for (const path of [
    "/running/watches",
    "/compare/asics-novablast-6-vs-brooks-ghost-18",
    "/running/shoes",
    "/best/running-shoes",
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    // also mobile later
    report[`overflow_desktop_${path}`] = await overflowCulprits(page);
  }

  // Finder / compare white pages
  for (const path of ["/tools/running-shoe-finder", "/compare", "/tools/running-shoe-finder/results"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 90000 }).catch(() =>
      page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" }),
    );
    await page.waitForTimeout(1200);
    report[`page_${path}`] = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector("h1")?.textContent,
      mainText: (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 500),
      mainHtmlLen: (document.querySelector("main")?.innerHTML || "").length,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      imgCount: document.querySelectorAll("main img").length,
      errors: [...document.querySelectorAll("[data-error], .error")].map((e) => e.textContent?.slice(0, 80)),
    }));
    const id = path.replace(/\W+/g, "_").replace(/^_|_$/g, "");
    await page.screenshot({ path: join(OUT, "desktop", `diag_${id}.png`), fullPage: false });
  }

  // Product related guides
  await page.goto(`${BASE}/products/nike-vomero-18`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  report.productRelated = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h2,h3")].map((h) =>
      (h.textContent || "").trim(),
    );
    return {
      headings: headings.filter((h) =>
        /guide|related|alternatives|compare|spec|review|best for|trade|offer|buy/i.test(h),
      ),
      allH2: headings.slice(0, 40),
    };
  });

  // Setup
  await page.goto(`${BASE}/setups/beginner-running-setup`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  report.setup = {
    status: 200,
    title: await page.title(),
    h1: await page.locator("h1").first().textContent().catch(() => null),
  };
  await page.screenshot({ path: join(OUT, "desktop", "setup.png"), fullPage: false });

  await desk.close();

  // Mobile overflow
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mob.newPage();
  for (const path of [
    "/running/watches",
    "/running/shoes",
    "/running/clothing",
    "/compare/asics-novablast-6-vs-brooks-ghost-18",
    "/reviews/nike-vomero-18",
    "/best/running-shoes",
    "/products/nike-vomero-18/alternatives",
    "/brands/nike",
  ]) {
    await mp.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await mp.waitForTimeout(700);
    report[`overflow_mobile_${path}`] = await overflowCulprits(mp);
    if (path.includes("watches") || path.includes("compare/asics")) {
      const id = path.includes("watches") ? "running-watches" : "comparison";
      await mp.screenshot({ path: join(OUT, "mobile", `${id}-overflow.png`), fullPage: false });
    }
  }
  await mp.goto(`${BASE}/setups/beginner-running-setup`, { waitUntil: "domcontentloaded" });
  await mp.waitForTimeout(600);
  await mp.screenshot({ path: join(OUT, "mobile", "setup.png"), fullPage: false });
  await mob.close();
  await browser.close();

  writeFileSync(join(OUT, "diagnostics.json"), JSON.stringify(report, null, 2));
  console.log("Wrote diagnostics.json");
  console.log("navRunning", JSON.stringify(report.navRunning, null, 2).slice(0, 800));
  console.log("navDomProbe", JSON.stringify(report.navDomProbe, null, 2).slice(0, 1200));
  console.log("finder", report["page_/tools/running-shoe-finder"]);
  console.log("compare", report["page_/compare"]);
  console.log("overflow watches top", report["overflow_desktop_/running/watches"]?.slice(0, 5));
  console.log("overflow compare top", report["overflow_desktop_/compare/asics-novablast-6-vs-brooks-ghost-18"]?.slice(0, 5));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
