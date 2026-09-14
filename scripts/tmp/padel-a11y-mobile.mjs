/**
 * Padel secondary remediation — axe (serious/critical) + mobile overflow.
 *
 *   npm run build && npm run start -- -p 3012
 *   BASE_URL=http://127.0.0.1:3012 node scripts/tmp/padel-a11y-mobile.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3012").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/padel/data");
mkdirSync(OUT, { recursive: true });

const PATHS = [
  "/padel",
  "/padel/rackets",
  "/padel/shoes",
  "/padel/balls",
  "/padel/bags",
  "/padel/grips",
  "/padel/accessories",
  "/padel/collections",
  "/padel/rackets/database",
  "/tools/padel-racket-finder",
  "/best/padel-rackets",
  "/best/padel-shoes",
  "/products/bullpadel-vertex-04",
  "/products/adidas-courtquick-padel",
  "/reviews/adidas-courtquick-padel",
  "/compare?category=padel-rackets",
  "/guides/how-to-choose-a-padel-racket",
  "/brands/bullpadel",
];

async function overflowDiag(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.position === "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right > vw + 2) {
        offenders.push({
          tag: el.tagName,
          cls: String(el.className || "").slice(0, 120),
          right: Math.round(r.right),
          vw,
        });
        if (offenders.length >= 12) break;
      }
    }
    return {
      vw,
      scrollW,
      horizontalOverflow: scrollW > vw + 2,
      offenderCount: offenders.length,
      offenders,
    };
  });
}

async function dismissOverlays(page) {
  for (const sel of [
    'button:has-text("Accept")',
    'button:has-text("Got it")',
    'button:has-text("Close")',
    '[aria-label="Close"]',
  ]) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 400 })) await btn.click({ timeout: 800 });
    } catch {
      /* ignore */
    }
  }
}

async function keyboardSmoke(page) {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const active = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName || "",
      role: el?.getAttribute?.("role") || "",
      text: (el?.textContent || "").trim().slice(0, 60),
    };
  });
  return active;
}

const results = [];
let serious = 0;
let critical = 0;
let mobileBlockers = 0;

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

for (const path of PATHS) {
  const url = `${BASE}${path}`;
  const row = {
    path,
    status: 0,
    axeSerious: 0,
    axeCritical: 0,
    axeIds: [],
    mobileOverflow: false,
    mobileOffenders: 0,
    genderFitLeak: false,
    keyboardActive: null,
    error: "",
  };

  const dPage = await desktop.newPage();
  try {
    const res = await dPage.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    row.status = res?.status() ?? 0;
    await dismissOverlays(dPage);
    await dPage.waitForTimeout(400);
    const html = await dPage.content();
    const visible = await dPage.evaluate(() => {
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
      return clone.textContent || "";
    });
    row.genderFitLeak = /\bgenderFit\b/.test(visible);
    row.genderFitInSource = /\bgenderFit\b/.test(html);
    const axe = await new AxeBuilder({ page: dPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const bad = axe.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    row.axeSerious = bad.filter((v) => v.impact === "serious").length;
    row.axeCritical = bad.filter((v) => v.impact === "critical").length;
    row.axeIds = bad.map((v) => `${v.impact}:${v.id}`);
    serious += row.axeSerious;
    critical += row.axeCritical;
    row.keyboardActive = await keyboardSmoke(dPage);
  } catch (e) {
    row.error = String(e?.message || e);
  } finally {
    await dPage.close();
  }

  const mPage = await mobile.newPage();
  try {
    await mPage.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await dismissOverlays(mPage);
    await mPage.waitForTimeout(300);
    const ov = await overflowDiag(mPage);
    row.mobileOverflow = Boolean(ov.horizontalOverflow);
    row.mobileOffenders = ov.offenderCount;
    if (row.mobileOverflow) mobileBlockers++;
    // Open mobile nav if present
    try {
      const menu = mPage.locator('button[aria-label*="Menu"], button:has-text("Menu")').first();
      if (await menu.isVisible({ timeout: 500 })) {
        await menu.click();
        await mPage.waitForTimeout(200);
      }
    } catch {
      /* ignore */
    }
  } catch (e) {
    row.error = `${row.error} | mobile: ${String(e?.message || e)}`;
  } finally {
    await mPage.close();
  }

  results.push(row);
  process.stdout.write(
    `${path} status=${row.status} serious=${row.axeSerious} critical=${row.axeCritical} overflow=${row.mobileOverflow} genderFit=${row.genderFitLeak}\n`,
  );
}

await browser.close();

const summary = {
  asOf: new Date().toISOString().slice(0, 10),
  base: BASE,
  pages: results.length,
  axeSeriousTotal: serious,
  axeCriticalTotal: critical,
  mobileOverflowPages: mobileBlockers,
  genderFitPages: results.filter((r) => r.genderFitLeak).length,
  genderFitInSourcePages: results.filter((r) => r.genderFitInSource).length,
  results,
};

writeFileSync(
  join(OUT, "PADEL-A11Y-MOBILE.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
process.stdout.write(JSON.stringify({
  axeSeriousTotal: serious,
  axeCriticalTotal: critical,
  mobileOverflowPages: mobileBlockers,
  genderFitVisiblePages: summary.genderFitPages,
  genderFitInSourcePages: summary.genderFitInSourcePages,
}, null, 2) + "\n");

if (serious > 0 || critical > 0 || mobileBlockers > 0 || summary.genderFitPages > 0) {
  process.exitCode = 1;
}
