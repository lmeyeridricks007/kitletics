/**
 * Visual regression capture at 390 / 768 / 1440 for semantic image remediation.
 * Usage: BASE_URL=http://127.0.0.1:3010 node scripts/tmp/image-semantic-visual-qa.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/remediation/data/image-semantic-visual");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { id: "home", path: "/" },
  { id: "guide-watch", path: "/guides/how-to-choose-running-watch" },
  { id: "best-watches", path: "/best/running-watches" },
  { id: "running-watches", path: "/running/watches" },
  { id: "best-watch-beginners", path: "/best/running-watches-beginners" },
  { id: "guide-shoes", path: "/guides/how-to-choose-running-shoes" },
  { id: "best-sunglasses", path: "/best/running-sunglasses" },
  { id: "best-safety", path: "/best/running-safety-visibility" },
  { id: "headphones", path: "/guides/open-ear-vs-in-ear-running-headphones" },
  { id: "running-hub", path: "/running" },
];

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const BANNED = /guide-how-to-choose|urban-dusk/;

async function main() {
  const browser = await chromium.launch();
  const findings = [];
  for (const vp of VIEWPORTS) {
    const dir = join(OUT, vp.name);
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });
    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(800);
      const file = join(dir, `${route.id}.png`);
      await page.screenshot({ path: file, fullPage: false });
      const srcs = await page.$$eval("img", (imgs) =>
        imgs
          .map((img) => img.getAttribute("src") || img.getAttribute("srcset") || "")
          .filter(Boolean),
      );
      const banned = srcs.filter((s) => BANNED.test(s));
      findings.push({
        viewport: vp.name,
        path: route.path,
        status: res?.status() ?? 0,
        banned,
        screenshot: file,
      });
    }
    await page.close();
  }
  await browser.close();
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(findings, null, 2));
  const leaks = findings.filter((f) => f.banned.length > 0);
  console.log(
    JSON.stringify(
      {
        captured: findings.length,
        leaks: leaks.length,
        leakSample: leaks.slice(0, 8),
      },
      null,
      2,
    ),
  );
  if (leaks.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
