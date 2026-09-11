/**
 * Fix 71 — content-density & visual polish capture.
 * Usage: BASE_URL=http://127.0.0.1:3012 node scripts/tmp/prelaunch-71-visual-polish.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3012").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data/visual-qa-71");
mkdirSync(join(OUT, "desktop"), { recursive: true });
mkdirSync(join(OUT, "mobile"), { recursive: true });
mkdirSync(join(OUT, "before"), { recursive: true });
mkdirSync(join(OUT, "after"), { recursive: true });

const ROUTES = [
  { id: "running-hub", path: "/running", kind: "hub" },
  { id: "running-gear-hub", path: "/running/gear", kind: "hub" },
  { id: "cat-shoes", path: "/running/shoes", kind: "category" },
  { id: "cat-watches", path: "/running/watches", kind: "category" },
  { id: "cat-clothing", path: "/running/clothing", kind: "category" },
  { id: "cat-packs", path: "/running/packs", kind: "category" },
  { id: "pdp-vomero", path: "/products/nike-vomero-18", kind: "product" },
  { id: "pdp-novablast", path: "/products/asics-novablast-6", kind: "product" },
  { id: "pdp-fr970", path: "/products/garmin-forerunner-970", kind: "product" },
  { id: "pdp-advskin", path: "/products/salomon-adv-skin-12", kind: "product" },
  { id: "rev-vomero", path: "/reviews/nike-vomero-18", kind: "review" },
  { id: "rev-novablast", path: "/reviews/asics-novablast-6", kind: "review" },
  { id: "rev-fr970", path: "/reviews/garmin-forerunner-970", kind: "review" },
  { id: "rev-h10", path: "/reviews/polar-h10", kind: "review" },
  { id: "rev-peregrine", path: "/reviews/saucony-peregrine-15", kind: "review" },
  { id: "best-shoes", path: "/best/running-shoes", kind: "best" },
  { id: "best-trail", path: "/best/trail-running-shoes", kind: "best" },
  { id: "best-watches", path: "/best/running-watches", kind: "best" },
  { id: "best-vests", path: "/best/running-hydration-vests", kind: "best" },
  { id: "guide-shoes", path: "/guides/how-to-choose-running-shoes", kind: "guide" },
  { id: "guide-cushion", path: "/guides/running-shoe-cushioning", kind: "guide" },
  { id: "guide-watch", path: "/guides/how-to-choose-running-watch", kind: "guide" },
  { id: "guide-vest", path: "/guides/how-to-choose-running-hydration-vest", kind: "guide" },
  { id: "cmp-nb6-ghost", path: "/compare/asics-novablast-6-vs-brooks-ghost-18", kind: "comparison" },
  { id: "cmp-fenix-970", path: "/compare/garmin-fenix-8-vs-garmin-forerunner-970", kind: "comparison" },
  { id: "cmp-kayano-adr", path: "/compare/asics-gel-kayano-32-vs-brooks-adrenaline-gts-25", kind: "comparison" },
  { id: "alt-vomero", path: "/products/nike-vomero-18/alternatives", kind: "alternatives" },
  { id: "alt-nb6", path: "/products/asics-novablast-6/alternatives", kind: "alternatives" },
  { id: "alt-fr970", path: "/products/garmin-forerunner-970/alternatives", kind: "alternatives" },
  { id: "brand-nike", path: "/brands/nike", kind: "brand" },
  { id: "brand-garmin", path: "/brands/garmin", kind: "brand" },
  { id: "brand-nnormal", path: "/brands/nnormal", kind: "brand" },
  { id: "finder-shoes", path: "/tools/running-shoe-finder", kind: "finder" },
  { id: "finder-watch", path: "/tools/running-watch-finder", kind: "finder" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function diagnose(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const clientW = doc.clientWidth;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const h1 = document.querySelector("h1");
    const headings = [...document.querySelectorAll("h1,h2,h3")].map((el) => ({
      tag: el.tagName,
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    }));
    const paras = [...document.querySelectorAll("main p, article p, .prose p")];
    const longParas = paras
      .map((p) => (p.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 420)
      .slice(0, 8)
      .map((t) => t.slice(0, 140));
    const sections = [...document.querySelectorAll("section, article")].map((el) =>
      Math.round(el.getBoundingClientRect().height),
    );
    const tables = [...document.querySelectorAll("table")].map((t) => ({
      cols: t.querySelectorAll("thead th").length || t.querySelectorAll("tr:first-child th, tr:first-child td").length,
      w: Math.round(t.getBoundingClientRect().width),
      minW: t.style.minWidth || getComputedStyle(t).minWidth,
    }));
    const amazon = [...document.querySelectorAll("a,button")]
      .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => /amazon|view on amazon|check price/i.test(t));
    const details = [...document.querySelectorAll("details")].map((el) => ({
      open: el.open,
      h: Math.round(el.getBoundingClientRect().height),
      summary: (el.querySelector("summary")?.textContent || "").trim().slice(0, 80),
    }));
    const imgs = [...document.querySelectorAll("main img")].length;
    const stickyNav = document.querySelector("nav[aria-label*='review' i], nav[aria-label*='On this' i]");
    return {
      title: document.title,
      h1: h1?.textContent?.trim()?.slice(0, 140) ?? null,
      status: document.body.innerText.includes("404") && !h1 ? "maybe-404" : "ok",
      overflowX: scrollW > clientW + 2,
      scrollWidth: scrollW,
      clientWidth: clientW,
      pageHeight: Math.round(Math.max(doc.scrollHeight, body?.scrollHeight ?? 0)),
      headingCount: headings.length,
      headings: headings.slice(0, 24),
      longParaCount: longParas.length,
      longParas,
      maxSectionH: sections.length ? Math.max(...sections) : 0,
      sectionCount: sections.length,
      tables,
      amazonCtaCount: amazon.length,
      amazonLabels: [...new Set(amazon)].slice(0, 8),
      details,
      mainImages: imgs,
      stickyNav: Boolean(stickyNav),
      bodyChars: (document.body.innerText || "").length,
    };
  });
}

async function overflowCulprits(page) {
  return page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 4) continue;
      if (r.right > docW + 6 || r.left < -6) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 100),
          right: Math.round(r.right),
          w: Math.round(r.width),
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
        });
      }
    }
    bad.sort((a, b) => b.right - a.right);
    return bad.slice(0, 8);
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const summary = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);

    for (const route of ROUTES) {
      const res = await page.goto(`${BASE}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(900);
      const diag = await diagnose(page);
      const culprits = diag.overflowX ? await overflowCulprits(page) : [];
      const shot = join(OUT, vp.name, `${route.id}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      const fullKinds = new Set(["review", "best", "guide"]);
      if (fullKinds.has(route.kind) && vp.name === "desktop") {
        await page.screenshot({
          path: join(OUT, vp.name, `${route.id}-full.png`),
          fullPage: true,
        });
      }
      summary.push({
        viewport: vp.name,
        ...route,
        http: res?.status() ?? 0,
        ...diag,
        culprits,
      });
      console.log(
        `${vp.name} ${route.id} ${res?.status()} overflow=${diag.overflowX} h=${diag.pageHeight} amazon=${diag.amazonCtaCount} longP=${diag.longParaCount}`,
      );
    }
    await ctx.close();
  }

  writeFileSync(join(OUT, "diagnostics.json"), JSON.stringify(summary, null, 2));
  const flags = summary.filter(
    (r) =>
      r.overflowX ||
      r.http >= 400 ||
      r.longParaCount >= 4 ||
      r.amazonCtaCount >= 6 ||
      r.maxSectionH > 2800,
  );
  writeFileSync(join(OUT, "flags.json"), JSON.stringify(flags, null, 2));
  console.log("wrote", OUT, "flags", flags.length);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
