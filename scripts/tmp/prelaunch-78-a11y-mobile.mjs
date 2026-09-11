/**
 * Fix 78 — axe incomplete dump, 390 overflow, cookie/N overlay, carousel geometry.
 * BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-78-a11y-mobile.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(
  process.cwd(),
  process.env.A11Y_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "shots"), { recursive: true });

function serializeIncomplete(axe) {
  return (axe.incomplete || []).map((rule) => ({
    id: rule.id,
    impact: rule.impact,
    description: rule.description,
    help: rule.help,
    helpUrl: rule.helpUrl,
    nodes: (rule.nodes || []).map((n) => ({
      html: (n.html || "").slice(0, 400),
      target: n.target,
      failureSummary: n.failureSummary,
      any: (n.any || []).map((c) => ({
        id: c.id,
        message: c.message,
        data: c.data,
      })),
      none: (n.none || []).map((c) => ({ id: c.id, message: c.message })),
    })),
  }));
}

async function overflowDiag(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
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
          cls: (el.className || "").toString().slice(0, 140),
          id: el.id,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          overflowX: cs.overflowX,
          position: cs.position,
          transform: cs.transform,
        });
        if (offenders.length >= 18) break;
      }
    }
    const fixed = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.position === "fixed" || cs.position === "sticky";
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 120),
          id: el.id,
          text: (el.textContent || "").trim().slice(0, 40),
          left: Math.round(r.left),
          top: Math.round(r.top),
          width: Math.round(r.width),
          height: Math.round(r.height),
          z: getComputedStyle(el).zIndex,
        };
      })
      .filter((x) => x.width > 8 && x.height > 8)
      .slice(0, 25);

    const nChips = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const t = (el.textContent || "").trim();
        if (t !== "N" && t !== "n") return false;
        const r = el.getBoundingClientRect();
        return r.width > 4 && r.width < 80 && r.height > 4 && r.height < 80;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 120),
          id: el.id,
          position: cs.position,
          z: cs.zIndex,
          left: Math.round(r.left),
          top: Math.round(r.top),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      });

    const carousels = [...document.querySelectorAll("ul, div")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.overflowX === "auto" || cs.overflowX === "scroll";
      })
      .slice(0, 12)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          cls: (el.className || "").toString().slice(0, 160),
          clientW: el.clientWidth,
          scrollW: el.scrollWidth,
          rectW: Math.round(r.width),
          peek: el.scrollWidth > el.clientWidth + 2,
        };
      });

    return {
      vw,
      vh,
      scrollWidth: scrollW,
      overflowX: scrollW > vw + 2,
      leakPx: Math.max(0, scrollW - vw),
      offenders,
      fixed,
      carousels,
      nChips,
    };
  });
}

const AXE_SURFACES = [
  { id: "header", path: "/" },
  { id: "search", path: "/search?q=vomero" },
];

const PDP_PATHS = [
  "/products/asics-novablast-6",
  "/products/nike-vomero-18",
  "/products/brooks-glycerin-22",
];

const REGRESSION = [
  { id: "product", path: "/products/asics-novablast-6" },
  { id: "review", path: "/reviews/asics-novablast-6" },
  { id: "best", path: "/best/running-shoes" },
  { id: "guide", path: "/guides/how-to-choose-running-shoes" },
  { id: "finder", path: "/tools/running-shoe-finder" },
];

const VIEWS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

const axeDump = [];
for (const s of AXE_SURFACES) {
  await page.goto(BASE + s.path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(600);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  axeDump.push({
    id: s.id,
    path: s.path,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
    })),
    incomplete: serializeIncomplete(axe),
    incompleteCount: axe.incomplete.length,
  });
  console.log(
    `axe ${s.id} violations=${axe.violations.length} incomplete=${axe.incomplete.length}`,
    axe.incomplete.map((i) => i.id).join(","),
  );
}

const overflow = {};
for (const path of PDP_PATHS) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 90000 });
  overflow[path] = await overflowDiag(page);
  const slug = path.split("/").pop();
  await page.screenshot({
    path: join(OUT, "shots", `pdp-${slug}-390.png`),
    fullPage: false,
  });
  const compare = page.locator("#compare");
  if ((await compare.count()) > 0) {
    await compare.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUT, "shots", `pdp-${slug}-390-compare.png`),
      fullPage: false,
    });
  }
  console.log(
    `390 ${path} overflow=${overflow[path].overflowX} leak=${overflow[path].leakPx} carousels=${overflow[path].carousels.length}`,
  );
}

const regression = {};
for (const vp of VIEWS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const r of REGRESSION) {
    await page.goto(BASE + r.path, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(400);
    const d = await overflowDiag(page);
    const key = `${r.id}-${vp.name}`;
    regression[key] = {
      path: r.path,
      overflowX: d.overflowX,
      leakPx: d.leakPx,
      scrollWidth: d.scrollWidth,
      fixedCount: d.fixed.length,
    };
    await page.screenshot({
      path: join(OUT, "shots", `${r.id}-${vp.name}.png`),
      fullPage: false,
    });
    console.log(
      `${vp.name} ${r.id} overflow=${d.overflowX} leak=${d.leakPx} fixed=${d.fixed.length}`,
    );
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  axeDump,
  overflow,
  regression,
};
writeFileSync(join(OUT, "probe.json"), JSON.stringify(payload, null, 2));
await browser.close();
console.log("wrote", join(OUT, "probe.json"));
