/**
 * Manual canary inspection for zero-debt launch validation.
 * Desktop + mobile viewports against rendered production HTML.
 *
 *   BASE_URL=http://127.0.0.1:3012 npx tsx --tsconfig tsconfig.json scripts/tmp/padel-zero-debt-canaries.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getProducts,
  getReviews,
} from "@/repositories";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3012").replace(
  /\/$/,
  "",
);
const OUT = join(process.cwd(), "docs/padel/data");
mkdirSync(OUT, { recursive: true });
const PROD = { isDev: false as const };

const TOKEN_RE =
  /\b(undefined|null|NaN|\[object Object\]|TODO:|FIXME:|lorem ipsum)\b/i;
const MACHINE_RE =
  /\b(as an AI|language model|I cannot browse|based on available information)\b/i;
const FAKE_TEST_RE =
  /\b(we (lab[- ]?tested|wear[- ]?tested|court[- ]?tested) this|our testers (logged|recorded))\b/i;
const WRONG_SPORT_SRC = /\/images\/(running|watches|home)\//;
const RAW_SCHEMA_RE =
  /\b(?:genderFit|courtFeel|customization_weight|[a-z]+_[a-z]+)\b/;

type ProductLike = {
  slug: string;
  status?: string;
  categoryId?: string;
  reviewSlug?: string;
};

function published(): ProductLike[] {
  return (getProducts(PROD) as ProductLike[]).filter(
    (p) => String(p.status).toLowerCase() === "published",
  );
}

function pickByCat(catId: string, n: number): string[] {
  return published()
    .filter((p) => p.categoryId === catId)
    .slice(0, n)
    .map((p) => `/products/${p.slug}`);
}

const rackets = pickByCat("cat-padel-rackets", 10);
const shoes = pickByCat("cat-padel-shoes", 5);
const balls = pickByCat("cat-padel-balls", 15);
const bags = pickByCat("cat-padel-bags", 20);
const grips = pickByCat("cat-padel-grips", 15);
const accessories = pickByCat("cat-padel-accessories", 15);

const reviews = (getReviews(PROD) as Array<{ slug: string; sportId?: string }>)
  .filter((r) => r.sportId === "padel" || /padel/i.test(r.slug))
  .slice(0, 5)
  .map((r) => `/reviews/${r.slug}`);

const best = (
  getBestGuides(PROD) as Array<{ slug: string; sportId?: string }>
)
  .filter((g) => /padel/i.test(g.slug) || g.sportId === "padel")
  .slice(0, 5)
  .map((g) => `/best/${g.slug}`);

const comparisons = (
  getComparisons(PROD) as Array<{ slug: string }>
)
  .filter((c) => /padel/i.test(c.slug))
  .slice(0, 5)
  .map((c) => `/compare/${c.slug}`);

const alternatives = published()
  .slice(0, 5)
  .map((p) => `/products/${p.slug}/alternatives`);

const guides = (
  getBuyingGuides(PROD) as Array<{ slug: string; sportId?: string }>
)
  .filter((g) => g.sportId === "padel" || /padel/i.test(g.slug))
  .slice(0, 5)
  .map((g) => `/guides/${g.slug}`);

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
  errors: [] as string[],
};

async function inspect(page: Page, path: string, viewport: string) {
  const row = {
    path,
    viewport,
    status: 0,
    issues: [] as string[],
  };
  try {
    const res = await page.goto(`${BASE}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    row.status = res?.status() ?? 0;
    if (row.status !== 200) {
      checks.status_non_200++;
      row.issues.push(`HTTP_${row.status}`);
    }
    await page.waitForTimeout(200);
    const visible = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("script,style,noscript")
        .forEach((n) => n.remove());
      return clone.textContent || "";
    });
    const html = await page.content();
    if (TOKEN_RE.test(visible)) {
      checks.token_leak++;
      row.issues.push("TOKEN_LEAK");
    }
    if (RAW_SCHEMA_RE.test(visible)) {
      checks.schema_leak_visible++;
      row.issues.push("SCHEMA_LEAK_VISIBLE");
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
        return Math.max(doc.scrollWidth, body?.scrollWidth ?? 0) > vw + 2;
      });
      if (ov) {
        checks.mobile_overflow++;
        row.issues.push("MOBILE_OVERFLOW");
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    row.issues.push(`ERROR:${msg.slice(0, 160)}`);
    checks.errors.push(`${viewport}:${path}`);
  }
  return row;
}

async function main() {
  const quotas = {
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
  };

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const results: Awaited<ReturnType<typeof inspect>>[] = [];
  process.stdout.write(
    `Canaries: ${PATHS.length} paths × 2 viewports against ${BASE}\n`,
  );
  process.stdout.write(JSON.stringify(quotas, null, 2) + "\n");

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
    quotas,
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
    failing: results.filter((r) => r.issues.length > 0),
  };

  writeFileSync(
    join(OUT, "PADEL-ZERO-DEBT-CANARIES.json"),
    JSON.stringify(summary, null, 2) + "\n",
  );
  process.stdout.write(
    JSON.stringify(
      { quotas: summary.quotas, checks, fail: summary.fail },
      null,
      2,
    ) + "\n",
  );
  process.exitCode = summary.fail ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
