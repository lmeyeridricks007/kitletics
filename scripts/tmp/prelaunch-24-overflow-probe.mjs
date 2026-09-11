import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3010";

async function probe(path, width = 1440) {
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({ viewport: { width, height: 900 } })
  ).newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const outliers = [...document.querySelectorAll("body *")]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          w: Math.round(rect.width),
          right: Math.round(rect.right),
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 100),
        };
      })
      .filter((x) => x.right > docW + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 10);
    const imgs = [...document.querySelectorAll("section img, a img")]
      .slice(0, 40)
      .map((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.right <= docW + 2) return null;
        return {
          src: (img.getAttribute("src") || "").slice(0, 100),
          natW: img.naturalWidth,
          w: Math.round(rect.width),
          right: Math.round(rect.right),
          maxW: getComputedStyle(img).maxWidth,
          parentCls: (img.parentElement?.className || "").toString().slice(0, 80),
        };
      })
      .filter(Boolean);
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: docW,
      outliers,
      overflowingImgs: imgs.slice(0, 8),
    };
  });
  await browser.close();
  return r;
}

const paths = [
  ["/running/watches", 1440],
  ["/compare/asics-novablast-6-vs-brooks-ghost-18", 1440],
  ["/running/shoes", 390],
];
for (const [path, w] of paths) {
  console.log("\n===", path, w, "===");
  console.log(JSON.stringify(await probe(path, w), null, 2));
}
