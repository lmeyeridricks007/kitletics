/**
 * Recapture changed Fix 71 routes after polish.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3012").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/prelaunch/data/visual-qa-71");
mkdirSync(join(OUT, "after"), { recursive: true });
mkdirSync(join(OUT, "desktop"), { recursive: true });
mkdirSync(join(OUT, "mobile"), { recursive: true });

const ROUTES = [
  { id: "rev-vomero", path: "/reviews/nike-vomero-18" },
  { id: "rev-novablast", path: "/reviews/asics-novablast-6" },
  { id: "pdp-novablast", path: "/products/asics-novablast-6" },
  { id: "pdp-vomero", path: "/products/nike-vomero-18" },
  { id: "best-shoes", path: "/best/running-shoes" },
  { id: "alt-nb6", path: "/products/asics-novablast-6/alternatives" },
  { id: "running-hub", path: "/running" },
  { id: "brand-nnormal", path: "/brands/nnormal" },
  { id: "finder-hrm", path: "/tools/running-hrm-finder" },
];

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const clientW = doc.clientWidth;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const amazon = [...document.querySelectorAll("a,button")]
      .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => /amazon|view on amazon|check price/i.test(t)).length;
    return {
      overflowX: scrollW > clientW + 2,
      scrollWidth: scrollW,
      clientWidth: clientW,
      pageHeight: Math.round(Math.max(doc.scrollHeight, body?.scrollHeight ?? 0)),
      amazon,
      h1: document.querySelector("h1")?.textContent?.trim()?.slice(0, 80),
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const vp of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(120000);
    for (const route of ROUTES) {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(900);
      const d = await measure(page);
      await page.screenshot({
        path: join(OUT, vp.name, `${route.id}.png`),
        fullPage: false,
      });
      await page.screenshot({
        path: join(OUT, "after", `${route.id}-${vp.name}.png`),
        fullPage: false,
      });
      console.log(
        `${vp.name} ${route.id} overflow=${d.overflowX} h=${d.pageHeight} amazon=${d.amazon}`,
      );
    }
    await ctx.close();
  }
  await browser.close();
}

main();
