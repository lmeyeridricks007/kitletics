/**
 * Capture desktop + mobile screenshots for Running ↔ Padel parity pairs.
 * READ-ONLY visual evidence.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(
  process.cwd(),
  "docs/padel/parity-screenshots",
);

const PAIRS = [
  { name: "hub", running: "https://kitletics.com/running", padel: "https://kitletics.com/padel" },
  { name: "category", running: "https://kitletics.com/running/shoes", padel: "https://kitletics.com/padel/rackets" },
  { name: "category-shoes", running: "https://kitletics.com/running/shoes", padel: "https://kitletics.com/padel/shoes" },
  { name: "pdp", running: "https://kitletics.com/products/nike-vomero-18", padel: "https://kitletics.com/products/bullpadel-vertex-05-2026" },
  { name: "review", running: "https://kitletics.com/reviews/nike-vomero-18", padel: "https://kitletics.com/reviews/bullpadel-indiga-ctr" },
  { name: "best", running: "https://kitletics.com/best/running-shoes", padel: "https://kitletics.com/best/padel-rackets" },
  { name: "guide", running: "https://kitletics.com/guides/how-to-choose-running-shoes", padel: "https://kitletics.com/guides/how-to-choose-a-padel-racket" },
  { name: "compare", running: "https://kitletics.com/compare/nike-vomero-18-vs-brooks-ghost-17", padel: "https://kitletics.com/compare/bullpadel-vertex-05-vs-bullpadel-hack-04" },
  { name: "brand", running: "https://kitletics.com/brands/nike", padel: "https://kitletics.com/brands/bullpadel" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

export default async function run(page) {
  mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const pair of PAIRS) {
      for (const side of ["running", "padel"]) {
        const url = pair[side];
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.waitForTimeout(1500);
          const file = join(OUT, `${pair.name}__${side}__${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: false });
          results.push({ ok: true, file, url, viewport: vp.name });
        } catch (err) {
          results.push({
            ok: false,
            url,
            viewport: vp.name,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  }
  return { out: OUT, results };
}
