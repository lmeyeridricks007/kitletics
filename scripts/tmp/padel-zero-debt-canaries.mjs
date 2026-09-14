/**
 * Manual canary inspection for zero-debt launch validation.
 * Desktop + mobile viewports; rendered HTML checks (not inventory trust).
 *
 *   BASE_URL=http://127.0.0.1:3012 node scripts/tmp/padel-zero-debt-canaries.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getProducts } = require("../../src/repositories/index.ts");
const { listBestGuides } = require("../../src/lib/best-guides/index.ts");
const { listComparisons } = require("../../src/lib/comparisons/index.ts");
const { listGuides } = require("../../src/lib/guides/index.ts");

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3012").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs/padel/data");
mkdirSync(OUT, { recursive: true });

const TOKEN_RE =
  /\b(undefined|null|NaN|\[object Object\]|TODO:|FIXME:|lorem ipsum)\b/i;
const SCHEMA_LEAK_RE =
  /\b(genderFit|@type|aggregateRating|reviewRating)\b/;
const MACHINE_RE =
  /\b(as an AI|language model|I cannot browse|based on available information)\b/i;
const FAKE_TEST_RE =
  /\b(we (lab[- ]?tested|wear[- ]?tested|court[- ]?tested) this|our testers (logged|recorded))\b/i;
const WRONG_SPORT_SRC =
  /\/images\/(running|watches|home)\//;

function isPadelPublished(p) {
  return (
    String(p.sport || "").toLowerCase() === "padel" &&
    String(p.status || "").toLowerCase() === "published"
  );
}

function catOf(p) {
  return String(p.category || p.productType || "").toLowerCase();
}

function pick(products, predicate, n) {
  return products.filter(predicate).slice(0, n).map((p) => `/products/${p.slug}`);
}

const all = getProducts().filter(isPadelPublished);
const rackets = pick(all, (p) => /racket/.test(catOf(p)), 10);
const shoes = pick(all, (p) => /shoe/.test(catOf(p)), 5);
const balls = pick(all, (p) => /ball/.test(catOf(p)), 15);
const bags = pick(all, (p) => /bag/.test(catOf(p)), 20);
const grips = pick(all, (p) => /grip|overgrip/.test(catOf(p)), 15);
const accessories = pick(
  all,
  (p) => /accessor|protect|wrist|cap|sock|towel|string/.test(catOf(p)),
  15,
);

const reviews = all
  .filter((p) => p.reviewSlug || p.hasReview)
  .slice(0, 5)
  .map((p) => `/reviews/${p.reviewSlug || p.slug}`);

let best = [];
try {
  best = listBestGuides()
    .filter((g) => /padel/i.test(g.slug || g.path || ""))
    .slice(0, 5)
    .map((g) => (g.path?.startsWith("/") ? g.path : `/best/${g.slug}`));
} catch {
  best = [
    "/best/padel-rackets",
    "/best/padel-shoes",
    "/best/beginner-padel-rackets",
    "/best/padel-bags",
    "/best/padel-balls",
  ];
}

let comparisons = [];
try {
  comparisons = listComparisons()
    .filter((c) => /padel/i.test(JSON.stringify(c)))
    .slice(0, 5)
    .map((c) => c.path || `/compare/${c.slug}`);
} catch {
  comparisons = ["/compare?category=padel-rackets"];
}

const alternatives = all.slice(0, 5).map((p) => `/products/${p.slug}/alternatives`);

let guides = [];
try {
  guides = listGuides()
    .filter((g) => /padel/i.test(g.slug || g.path || ""))
    .slice(0, 5)
    .map((g) => (g.path?.startsWith("/") ? g.path : `/guides/${g.slug}`));
} catch {
  guides = [
    "/guides/how-to-choose-a-padel-racket",
    "/guides/padel-racket-shapes",
    "/guides/padel-shoe-guide",
  ];
}

const hubs = [
  "/padel",
  "/tools/padel-racket-finder",
  "/padel/rackets/database",
  "/brands/bullpadel",
  "/padel/collections",
];

const PATHS = [
  ...new Set([
    ...rackets,
    ...shoes,
    ...balls,
    ...bags,
    ...grips,
    ...accessories,
    ...reviews,
    ...best,
    ...comparisons,
    ...alternatives,
    ...guides,
    ...hubs,
  ]),
];

const checks = {
  status_non_200: 0,
  token_leak: 0,
  schema_leak_visible: 0,
  machine_copy: 0,
  fake_testing: 0,
  wrong_sport_media: 0,
  mobile_overflow: 0,
  errors: [],
};

async function inspect(page, path, viewport) {
  const url = `${BASE}${path}`;
  const row = { path, viewport, status: 0, issues: [] };
  try {
    const res = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    row.status = res?.status() ?? 0;
    if (row.status !== 200) {
      checks.status_non_200++;
      row.issues.push(`HTTP_${row.status}`);
    }
    await page.waitForTimeout(250);
    const visible = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
      return clone.textContent || "";
    });
    const html = await page.content();
    if (TOKEN_RE.test(visible)) {
      checks.token_leak++;
      row.issues.push("TOKEN_LEAK");
    }
    if (/\bgenderFit\b/.test(visible)) {
      checks.schema_leak_visible++;
      row.issues.push("GENDERFIT_VISIBLE");
    }
    if (MACHINE_RE.test(visible)) {
      checks.machine_copy++;
      row.issues.push("MACHINE_COPY");
    }
    if (FAKE_TEST_RE.test(visible)) {
      checks.fake_testing++;
      row.issues.push("FAKE_TESTING");
    }
    if (WRONG_SPORT_SRC.test(html)) {
      checks.wrong_sport_media++;
      row.issues.push("WRONG_SPORT_MEDIA");
    }
    if (viewport === "mobile") {
      const ov = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const vw = window.innerWidth;
        const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
        return scrollW > vw + 2;
      });
      if (ov) {
        checks.mobile_overflow++;
        row.issues.push("MOBILE_OVERFLOW");
      }
    }
  } catch (e) {
    row.issues.push(`ERROR:${String(e?.message || e).slice(0, 160)}`);
    checks.errors.push(`${viewport}:${path}`);
  }
  return row;
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

const results = [];
process.stdout.write(
  `Canaries: ${PATHS.length} paths × 2 viewports against ${BASE}\n`,
);

for (const path of PATHS) {
  const dPage = await desktop.newPage();
  const d = await inspect(dPage, path, "desktop");
  await dPage.close();
  results.push(d);
  process.stdout.write(
    `D ${path} ${d.status} ${d.issues.join("|") || "ok"}\n`,
  );

  const mPage = await mobile.newPage();
  const m = await inspect(mPage, path, "mobile");
  await mPage.close();
  results.push(m);
  process.stdout.write(
    `M ${path} ${m.status} ${m.issues.join("|") || "ok"}\n`,
  );
}

await browser.close();

const summary = {
  asOf: new Date().toISOString().slice(0, 10),
  base: BASE,
  pathCount: PATHS.length,
  inspectionCount: results.length,
  quotas: {
    rackets: rackets.length,
    shoes: shoes.length,
    balls: balls.length,
    bags: bags.length,
    grips: grips.length,
    accessories: accessories.length,
    reviews: reviews.length,
    best: best.length,
    comparisons: comparisons.length,
    alternatives: alternatives.length,
    guides: guides.length,
    hubs: hubs.length,
  },
  checks,
  fail:
    checks.status_non_200 +
      checks.token_leak +
      checks.schema_leak_visible +
      checks.machine_copy +
      checks.fake_testing +
      checks.wrong_sport_media +
      checks.mobile_overflow +
      checks.errors.length >
    0,
  results: results.filter((r) => r.issues.length > 0),
};

writeFileSync(
  join(OUT, "PADEL-ZERO-DEBT-CANARIES.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
process.stdout.write(JSON.stringify({ quotas: summary.quotas, checks, fail: summary.fail }, null, 2) + "\n");
process.exitCode = summary.fail ? 1 : 0;
