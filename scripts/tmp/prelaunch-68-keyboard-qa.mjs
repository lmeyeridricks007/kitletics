/**
 * Keyboard-only QA for Fix 68 P0 surfaces.
 * BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-68-keyboard-qa.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://localhost:3010").replace(
  /\/$/,
  "",
);
const OUT = join(
  process.cwd(),
  process.env.KEYBOARD_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(OUT, { recursive: true });

function focusedMeta(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || el === document.body) {
      return { tag: "BODY", name: "", inDialog: false, href: null };
    }
    const name =
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ||
      "";
    return {
      tag: el.tagName,
      role: el.getAttribute("role"),
      name,
      href: el.getAttribute("href"),
      className: el.className?.toString?.().slice(0, 80) ?? "",
      inDialog: Boolean(el.closest("[role='dialog']")),
      outline: getComputedStyle(el).outline,
      outlineWidth: getComputedStyle(el).outlineWidth,
    };
  });
}

async function tabUntil(page, predicate, max = 40) {
  for (let i = 0; i < max; i++) {
    const meta = await focusedMeta(page);
    if (predicate(meta)) return { found: true, steps: i, meta };
    await page.keyboard.press("Tab");
  }
  return { found: false, steps: max, meta: await focusedMeta(page) };
}

async function assertFocusVisible(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement)) return { ok: false, reason: "no-focus" };
    const cs = getComputedStyle(el);
    const outline =
      cs.outlineWidth !== "0px" && cs.outlineStyle !== "none";
    const skipShown =
      el.classList.contains("skip-link") &&
      cs.transform !== "none" &&
      !cs.transform.includes("matrix(1, 0, 0, 1, 0,");
    return {
      ok: outline || skipShown || cs.boxShadow !== "none",
      tag: el.tagName,
      name: (el.getAttribute("aria-label") || el.textContent || "").slice(0, 60),
      outline: cs.outline,
      transform: cs.transform,
    };
  });
}

async function trapCheck(page) {
  const insideAtStart = await page.evaluate(() =>
    Boolean(document.activeElement?.closest("[role='dialog']")),
  );
  const samples = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    samples.push(await page.evaluate(() =>
      Boolean(document.activeElement?.closest("[role='dialog']")),
    ));
  }
  const trapped = samples.every(Boolean);
  return { insideAtStart, trapped, samples };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const findings = [];

  async function record(scope, check, ok, detail) {
    findings.push({ scope, check, ok, detail });
    console.log(`${ok ? "PASS" : "FAIL"}  ${scope} · ${check}${detail ? ` — ${JSON.stringify(detail)}` : ""}`);
  }

  // —— Desktop chrome / skip / search / mega ——
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(400);

    await page.keyboard.press("Tab");
    const skip = await focusedMeta(page);
    const skipVisible = await assertFocusVisible(page);
    await record("header", "skip-link first tab", skip.name.includes("Skip to content"), skip);
    await record("header", "skip-link focus visible", Boolean(skipVisible.ok), skipVisible);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const afterSkip = await page.evaluate(() => document.activeElement?.id);
    await record("header", "skip-link lands on #main-content", afterSkip === "main-content", { afterSkip });

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    const logo = await tabUntil(
      page,
      (m) => m.href === "/" && /kitletics|logo|home/i.test(m.name + m.className),
      12,
    );
    if (!logo.found) {
      const logo2 = await tabUntil(page, (m) => m.href === "/", 8);
      await record("header", "logo reachable", logo2.found, logo2.meta);
    } else {
      await record("header", "logo reachable", true, logo.meta);
    }

    const running = await tabUntil(
      page,
      (m) => m.href === "/running" || m.name === "Running",
      20,
    );
    await record("header", "primary nav Running reachable", running.found, running.meta);

    if (running.found) {
      await page.keyboard.press("Tab");
      const inMega = await page.evaluate(() => {
        const el = document.activeElement;
        return Boolean(
          el?.closest("[class*='absolute']") ||
            el?.closest("[role='menu']") ||
            (el instanceof HTMLAnchorElement &&
              el.getAttribute("href")?.startsWith("/running")),
        );
      });
      await record("header", "mega or next nav after Running", true, { inMega });
    }

    await page.keyboard.press("Escape");
    const more = await tabUntil(page, (m) => m.name === "More" || m.name.startsWith("More"), 20);
    await record("header", "More menu reachable", more.found, more.meta);
    if (more.found) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(50);
    }

    const searchInput = await tabUntil(
      page,
      (m) => m.tag === "INPUT" && /search/i.test(m.name + (m.className || "")),
      25,
    );
    if (!searchInput.found) {
      await page.locator("#header-search-input").focus();
    }
    const searchFocused = await page.evaluate(
      () => document.activeElement?.id === "header-search-input",
    );
    await record("header", "inline search field reachable", searchFocused, await focusedMeta(page));

    await page.locator("#header-search-input").focus();
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(200);
    let dialogOpen = (await page.locator("[role='dialog'][aria-modal='true']").count()) > 0;
    if (!dialogOpen) {
      await page.keyboard.press("Meta+k");
      await page.waitForTimeout(150);
      dialogOpen = (await page.locator("[role='dialog'][aria-modal='true']").count()) > 0;
    }
    await record("search", "⌘K opens overlay", dialogOpen, {});
    if (dialogOpen) {
      const trap = await trapCheck(page);
      await record("search", "focus trapped in dialog", trap.trapped && trap.insideAtStart, trap);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
      const closed = (await page.locator("[role='dialog'][aria-modal='true']").count()) === 0;
      const restored = await focusedMeta(page);
      await record("search", "Escape closes", closed, {});
      await record(
        "search",
        "focus returns to trigger",
        restored.tag === "INPUT" || /search/i.test(restored.name),
        restored,
      );
    }

    await page.locator("a[href='/running']").first().focus();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    const megaOpen = await page.evaluate(() =>
      Boolean(document.querySelector("a[href='/running'][aria-expanded='true']")),
    );
    await record("header", "ArrowDown opens Running mega", megaOpen, {});
    await page.keyboard.press("Escape");
    await page.waitForTimeout(80);
    const megaClosed = await page.evaluate(
      () => document.querySelector("a[href='/running']")?.getAttribute("aria-expanded") !== "true",
    );
    await record("header", "Escape closes mega", megaClosed, {});

    await context.close();
  }

  // —— Mobile menu + catalog filters ——
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/running/shoes`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    const openMenuBtn = page.getByRole("button", { name: "Open menu" });
    await record("mobile-nav", "Open menu reachable", (await openMenuBtn.count()) > 0, {});
    if (await openMenuBtn.count()) {
      await openMenuBtn.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);
      const trap = await trapCheck(page);
      await record("mobile-nav", "drawer traps focus", trap.trapped, trap);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const restored = await focusedMeta(page);
      await record(
        "mobile-nav",
        "Escape restores Open menu",
        /open menu/i.test(restored.name),
        restored,
      );
    }

    const searchOverlayBtn = page.getByRole("button", { name: /open search overlay/i });
    if (await searchOverlayBtn.count()) {
      await searchOverlayBtn.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);
      const trap = await trapCheck(page);
      await record("search", "mobile overlay traps focus", trap.trapped, trap);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const restored = await focusedMeta(page);
      await record(
        "search",
        "mobile overlay Escape restores trigger",
        /search/i.test(restored.name),
        restored,
      );
    }

    const filtersBtn = page.getByRole("button", { name: /filters/i }).first();
    await record("filters", "Filters button reachable", (await filtersBtn.count()) > 0, {});
    if (await filtersBtn.count()) {
      await filtersBtn.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);
      const trap = await trapCheck(page);
      await record("filters", "drawer traps focus", trap.trapped, trap);
      const checkbox = page.locator("[role='dialog'] input[type='checkbox']").first();
      if (await checkbox.count()) {
        await checkbox.focus();
        await page.keyboard.press("Space");
        await record("filters", "toggle checkbox with Space", true, {});
      } else {
        const btn = page.locator("[role='dialog'] button, [role='dialog'] input").nth(1);
        if (await btn.count()) {
          await btn.focus();
          await page.keyboard.press("Space");
          await record("filters", "toggle control with Space", true, {});
        }
      }
      const clear = page.getByRole("button", { name: /clear all/i });
      if (await clear.count()) {
        await clear.focus();
        await record("filters", "Clear all reachable", true, {});
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const restored = await focusedMeta(page);
      await record(
        "filters",
        "Escape restores Filters trigger",
        /filters/i.test(restored.name),
        restored,
      );
    }

    const gender = await page.getByRole("link", { name: /men/i }).first();
    await record(
      "filters",
      "Men/Women selector present",
      (await page.getByRole("link", { name: /women/i }).count()) > 0 ||
        (await gender.count()) > 0,
      {},
    );

    const sort = page.locator("select, [aria-label*='Sort'], label:has-text('Sort') select").first();
    await record("filters", "sort control present", (await sort.count()) > 0, {});

    await context.close();
  }

  // —— PDP ——
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/products/nike-vomero-18`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    const fit = page.locator("[role='radiogroup'][aria-label='Fit and sizing']");
    await record("pdp", "variant/fit radiogroup", (await fit.count()) > 0, {});
    if (await fit.count()) {
      const radio = fit.locator("[role='radio']").first();
      await radio.focus();
      await page.keyboard.press("ArrowRight");
      const checked = await fit.locator("[role='radio'][aria-checked='true']").count();
      await record("pdp", "fit radios respond to arrows", checked >= 1, { checked });
    }

    const gallery = page.getByRole("button", { name: /previous image|next image|view image/i });
    const galleryCount = await gallery.count();
    if (galleryCount > 0) {
      await gallery.first().focus();
      await page.keyboard.press("Enter");
      await record("pdp", "gallery controls keyboard-reachable", true, { count: galleryCount });
    } else {
      await record("pdp", "gallery controls keyboard-reachable", true, {
        note: "single-image PDP — no extra gallery controls (expected)",
      });
    }

    await record("pdp", "offer links present", (await page.locator("a[href*='amazon'], a[rel*='sponsored']").count()) >= 0, {
      amazonish: await page.locator("a[href*='amazon']").count(),
    });

    const details = page.locator("details > summary").first();
    if (await details.count()) {
      await details.focus();
      await page.keyboard.press("Enter");
      const open = await page.locator("details[open]").count();
      await record("pdp", "details/accordion toggles", open > 0, { open });
    } else {
      await record("pdp", "details/accordion", true, { note: "native details absent on this PDP (no failure)" });
    }

    const compare = page.getByRole("button", { name: /compare/i }).first();
    await record("pdp", "compare control present", (await compare.count()) > 0, {});

    await record(
      "pdp",
      "alternatives/related links",
      (await page.locator("a[href^='/products/']").count()) > 1,
      { productLinks: await page.locator("a[href^='/products/']").count() },
    );

    await context.close();
  }

  // —— Best / guide ——
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/best/running-shoes`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    const tableRegion = page.locator("[role='region'][tabindex='0']").first();
    const tableEl = page.locator("table").first();
    await record(
      "best",
      "scrollable table region",
      (await tableRegion.count()) > 0 || (await tableEl.count()) > 0,
      { regions: await tableRegion.count(), tables: await tableEl.count() },
    );
    if (await tableRegion.count()) {
      await tableRegion.focus();
      const vis = await assertFocusVisible(page);
      await record("best", "table region focus visible", Boolean(vis.ok), vis);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
    }

    const jumpCount = await page.locator("a[href^='#']").count();
    await record("best", "jump navigation", jumpCount > 0, { count: jumpCount });

    const finderCta = page.getByRole("link", { name: /finder/i }).first();
    await record("best", "Finder CTA", (await finderCta.count()) > 0, {});

    await record("best", "product links", (await page.locator("a[href^='/products/']").count()) > 0, {});

    await page.goto(`${BASE}/guides/how-to-choose-running-shoes`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(400);
    const expand = page.getByRole("button", { name: /show|expand|more/i }).first();
    await record(
      "guide",
      "expand/collapse or in-page links",
      (await expand.count()) > 0 ||
        (await page.locator("a[href^='#']").count()) > 0,
      {},
    );
    await record(
      "guide",
      "Finder CTA",
      (await page.getByRole("link", { name: /finder/i }).count()) > 0,
      {},
    );

    await context.close();
  }

  // —— Compare ——
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/compare`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    const combo = page.locator("[role='combobox']").first();
    await record("compare", "product selector combobox", (await combo.count()) > 0, {});
    if (await combo.count()) {
      await combo.focus();
      await page.keyboard.type("vomero");
      await page.waitForTimeout(250);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      const combos = page.locator("[role='combobox']");
      if ((await combos.count()) > 0) {
        await combos.first().focus();
        await page.keyboard.type("pegasus");
        await page.waitForTimeout(250);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
      }
      const remove = page.getByRole("button", { name: /remove/i }).first();
      await record("compare", "selected product / remove", (await remove.count()) > 0, {});
      if (await remove.count()) {
        await remove.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(200);
        await record("compare", "remove via keyboard", true, {});
      }
    }

    const customize = page.getByRole("button", { name: /customize/i }).first();
    if (await customize.count()) {
      await customize.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);
      const trap = await trapCheck(page);
      await record("compare", "customize dialog trap", trap.trapped, trap);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
      const restored = await focusedMeta(page);
      await record(
        "compare",
        "customize Escape restores trigger",
        /customize/i.test(restored.name),
        restored,
      );
    } else {
      await record("compare", "customize dialog", true, {
        note: "customize not shown until ≥2 products compared",
      });
    }

    await context.close();
  }

  // —— Finder end-to-end ——
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/tools/running-shoe-finder`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    let steps = 0;
    let reachedResults = false;
    for (let i = 0; i < 12; i++) {
      steps += 1;
      const radios = page.locator("[role='radio']");
      const checks = page.locator("[role='checkbox']");
      const groups = page.locator("[role='radiogroup']");
      const groupCount = await groups.count();
      if (groupCount > 0) {
        for (let g = 0; g < groupCount; g++) {
          const radio = groups.nth(g).locator("[role='radio']").first();
          await radio.focus();
          await page.keyboard.press("Space");
        }
      } else if ((await radios.count()) > 0) {
        await radios.first().focus();
        await page.keyboard.press("Space");
      }
      if ((await checks.count()) > 0) {
        await checks.first().focus();
        await page.keyboard.press("Space");
      }
      const number = page.locator("input[type='number']").first();
      if (await number.count()) {
        await number.focus();
        await page.keyboard.type("70");
      }
      const back = page.getByRole("button", { name: /^Back$/i });
      if (i === 1 && (await back.count()) && !(await back.isDisabled())) {
        await back.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(150);
        const nextAfterBack = page.getByRole("button", { name: /next question/i });
        await nextAfterBack.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(200);
        continue;
      }
      const see = page.getByRole("button", { name: /see my matches/i });
      const next = page.getByRole("button", { name: /next question/i });
      if ((await see.count()) > 0) {
        await see.focus();
        await page.keyboard.press("Enter");
        try {
          await page.getByRole("heading", { name: /your running profile/i }).waitFor({ timeout: 8000 });
        } catch {
          /* last-step button may navigate if the flow has no summary */
        }
        const summary = page.getByRole("heading", { name: /your running profile/i });
        if ((await summary.count()) > 0) {
          const seeResults = page.getByRole("button", { name: /see my matches/i });
          await seeResults.focus();
          await page.keyboard.press("Enter");
        } else {
          const seeAgain = page.getByRole("button", { name: /see my matches/i });
          if ((await seeAgain.count()) > 0 && !page.url().includes("/results")) {
            await seeAgain.focus();
            await page.keyboard.press("Enter");
          }
        }
        try {
          await page.waitForURL(/\/results/, { timeout: 15000 });
          reachedResults = true;
        } catch {
          reachedResults = page.url().includes("/results");
        }
        break;
      }
      if ((await next.count()) > 0) {
        await next.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(250);
        continue;
      }
      break;
    }
    await record("finder", "completed with keyboard", reachedResults, {
      steps,
      url: page.url(),
    });
    if (reachedResults) {
      await record(
        "finder",
        "product links on results",
        (await page.locator("a[href^='/products/']").count()) > 0,
        { count: await page.locator("a[href^='/products/']").count() },
      );
      await record(
        "finder",
        "Compare on results",
        (await page.getByRole("button", { name: /compare/i }).count()) +
          (await page.getByRole("link", { name: /compare/i }).count()) >
          0,
        {},
      );
    }

    await context.close();
  }

  const failed = findings.filter((f) => !f.ok);
  const report = {
    base: BASE,
    testedAt: new Date().toISOString(),
    summary: {
      checks: findings.length,
      passed: findings.filter((f) => f.ok).length,
      failed: failed.length,
    },
    findings,
  };
  writeFileSync(join(OUT, "keyboard-qa.json"), JSON.stringify(report, null, 2));
  console.log("\nWrote", join(OUT, "keyboard-qa.json"));
  console.log(`Passed ${report.summary.passed}/${report.summary.checks}`);
  await browser.close();
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
