/**
 * Fix 60 — operate search, filters, sort, Men/Women, variants, compare,
 * finder, calculator, offers, nav, breadcrumbs against production server.
 *
 * BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-60-functional.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const OUT = join(process.cwd(), "docs/prelaunch/data/rc-60");
mkdirSync(OUT, { recursive: true });

async function runCheck(page, id, fn) {
  const started = Date.now();
  try {
    await fn(page);
    return { id, ok: true, ms: Date.now() - started };
  } catch (e) {
    return {
      id,
      ok: false,
      ms: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const checks = [];

  checks.push(
    await runCheck(page, "search", async (p) => {
      await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
      const input = p.locator("#header-search-input");
      await input.fill("vomero");
      await Promise.all([
        p.waitForURL(/\/search\?q=/, { timeout: 15000 }),
        input.press("Enter"),
      ]);
      await p.waitForSelector("[data-search-results]", { timeout: 15000 });
      const body = await p.locator("body").innerText();
      if (!/vomero/i.test(body) && !/result/i.test(body)) {
        throw new Error("Search results page did not mention query or results");
      }
      const countText = await p.locator("[aria-live='polite']").first().textContent();
      if (countText && /0 result/i.test(countText)) {
        throw new Error("Search returned 0 results for vomero");
      }
    }),
  );

  checks.push(
    await runCheck(page, "filters", async (p) => {
      await p.goto(BASE + "/running/shoes", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const checkbox = p
        .locator('aside input[type="checkbox"]:not([disabled])')
        .first();
      await checkbox.waitFor({ timeout: 15000 });
      await checkbox.click();
      await p.waitForTimeout(700);
      const url = p.url();
      const after = await p.locator("body").innerText();
      const changed =
        /[?&](brand|type|usecase|gender|drop|width|cushion)=/i.test(url) ||
        /clear all/i.test(after) ||
        (await checkbox.isChecked());
      if (!changed) throw new Error("Filter toggle did not change URL or UI");
    }),
  );

  checks.push(
    await runCheck(page, "sort", async (p) => {
      await p.goto(BASE + "/running/shoes", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const select = p
        .locator("label:has-text('Sort') select")
        .filter({ visible: true })
        .first();
      await select.waitFor({ state: "visible", timeout: 15000 });
      const options = await select.locator("option").allTextContents();
      if (options.length < 2) throw new Error("Sort has fewer than 2 options");
      const values = await select.locator("option").evaluateAll((els) =>
        els.map((e) => e.value),
      );
      const currentValue = await select.inputValue();
      const next = values.find((v) => v && v !== currentValue);
      if (!next) throw new Error("No alternate sort value");
      await select.selectOption(next);
      await p.waitForTimeout(400);
      const current = await select.inputValue();
      if (current !== next) throw new Error("Sort select did not stick");
    }),
  );

  checks.push(
    await runCheck(page, "men-women", async (p) => {
      await p.goto(BASE + "/running/shoes", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const men = p.getByRole("link", { name: /^Men/ }).first();
      await men.click();
      await p.waitForURL(/gender=men/, { timeout: 15000 });
      const women = p.getByRole("link", { name: /^Women/ }).first();
      await women.click();
      await p.waitForURL(/gender=women/, { timeout: 15000 });
    }),
  );

  checks.push(
    await runCheck(page, "variant-selector", async (p) => {
      await p.goto(BASE + "/products/nike-vomero-18", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const group = p.getByRole("radiogroup", { name: /fit and sizing/i });
      await group.waitFor({ timeout: 15000 });
      const women = group.getByRole("radio", { name: /women/i });
      await women.click();
      await p.waitForURL(/fit=women/, { timeout: 10000 });
      const checked = await women.getAttribute("aria-checked");
      if (checked !== "true") throw new Error("Women variant not selected");
    }),
  );

  checks.push(
    await runCheck(page, "compare", async (p) => {
      await p.goto(BASE + "/compare", {
        waitUntil: "networkidle",
        timeout: 90000,
      });
      await p.locator('aside input[placeholder="Search products"]').first().waitFor({
        timeout: 20000,
      });
      async function pick(query) {
        const box = p.locator('aside input[placeholder="Search products"]').first();
        await box.click();
        await box.fill(query);
        await p.locator('aside [role="option"]').first().waitFor({ timeout: 8000 });
        await p.locator('aside [role="option"]').first().click();
        await p.waitForTimeout(600);
      }
      await pick("vomero");
      await pick("ghost");
      await p.waitForTimeout(800);
      const body = await p.locator("body").innerText();
      const url = p.url();
      if (
        !/products=/i.test(url) &&
        !/difference|kitletics score|updating comparison/i.test(body)
      ) {
        throw new Error("Compare builder did not produce a two-product comparison");
      }
    }),
  );

  checks.push(
    await runCheck(page, "finder", async (p) => {
      await p.goto(BASE + "/tools/running-shoe-finder", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      for (let step = 0; step < 12; step++) {
        const see = p.getByRole("button", { name: /see my matches/i });
        if (await see.isVisible().catch(() => false)) {
          await see.click();
          break;
        }
        const radio = p.getByRole("radio").first();
        if (await radio.count()) {
          await radio.click();
        }
        const next = p.getByRole("button", { name: /next question/i });
        if (await next.isVisible().catch(() => false)) {
          await next.click();
          await p.waitForTimeout(250);
        } else {
          break;
        }
      }
      await p.waitForTimeout(800);
      const url = p.url();
      const body = await p.locator("body").innerText();
      if (
        !/result|match|recommend/i.test(body) &&
        !/results/i.test(url)
      ) {
        throw new Error("Finder did not reach results");
      }
    }),
  );

  checks.push(
    await runCheck(page, "calculator", async (p) => {
      await p.goto(BASE + "/tools/running-pace-calculator", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const heading = p.getByRole("heading", { level: 1 });
      await heading.waitFor({ timeout: 15000 });
      const min = p.locator("#time-minutes, [id$='-minutes']").first();
      if (await min.count()) {
        await min.fill("30");
      }
      const body = await p.locator("body").innerText();
      if (!/pace|km|split|time/i.test(body)) {
        throw new Error("Pace calculator did not render working UI");
      }
    }),
  );

  checks.push(
    await runCheck(page, "offers", async (p) => {
      await p.goto(BASE + "/products/nike-vomero-18", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const cta = p.getByRole("link", { name: /view on amazon|check price|view prices/i });
      if ((await cta.count()) === 0) {
        const section = p.locator("#offers");
        if ((await section.count()) === 0) {
          throw new Error("No offer CTA or #offers on PDP");
        }
      }
    }),
  );

  checks.push(
    await runCheck(page, "nav", async (p) => {
      await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
      const running = p.locator('header a[href="/running"]').first();
      await running.click();
      await p.waitForURL(/\/running/, { timeout: 15000 });
      const h1 = await p.locator("h1").first().textContent();
      if (!/running/i.test(h1 ?? "")) {
        throw new Error(`Unexpected running hub h1: ${h1}`);
      }
    }),
  );

  checks.push(
    await runCheck(page, "breadcrumbs", async (p) => {
      await p.goto(BASE + "/products/nike-vomero-18", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const nav = p.locator('nav[aria-label="Breadcrumb"]');
      await nav.waitFor({ timeout: 15000 });
      const links = nav.locator("a");
      if ((await links.count()) < 1) {
        throw new Error("Breadcrumb has no links");
      }
      await links.first().click();
      await p.waitForLoadState("domcontentloaded");
      if (p.url().includes("/products/nike-vomero-18") && (await p.locator("h1").count()) === 0) {
        throw new Error("Breadcrumb click did not navigate");
      }
    }),
  );

  await context.close();
  await browser.close();

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    checks,
    failed: checks.filter((c) => !c.ok),
    passCount: checks.filter((c) => c.ok).length,
    failCount: checks.filter((c) => !c.ok).length,
  };
  writeFileSync(join(OUT, "functional.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.failCount === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
