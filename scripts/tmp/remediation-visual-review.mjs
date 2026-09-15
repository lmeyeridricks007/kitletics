/**
 * Visual / shopper review of representative production pages.
 * @param {import('patchright').Page} page
 */
export default async function run(page) {
  const origin = "http://127.0.0.1:3020";
  const paths = [
    "/",
    "/running",
    "/running/shoes",
    "/running/watches",
    "/best/running-watches",
    "/products/asics-novablast-6",
    "/reviews/asics-novablast-6",
    "/best/daily-trainers",
    "/guides/how-to-choose-running-watch",
    "/compare/asics-novablast-6-vs-brooks-ghost-18",
    "/products/asics-novablast-6/alternatives",
    "/brands/asics",
    "/tools/running-shoe-finder",
    "/running/shoes/database",
  ];

  const TOKEN =
    /skuslug|skuid|concatenated\s+\w+\s+token|already decided the lane|headline trait|\[object Object\]/i;

  const results = [];
  for (const path of paths) {
    const url = origin + path;
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(400);
    const data = await page.evaluate((reSource) => {
      const re = new RegExp(reSource, "i");
      const text = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim();
      const imgs = [...document.querySelectorAll("img")]
        .map((el) => ({
          src: el.currentSrc || el.getAttribute("src") || "",
          alt: el.getAttribute("alt") || "",
        }))
        .slice(0, 12);
      const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
      return {
        title: document.title,
        h1,
        statusOk: true,
        textLen: text.length,
        tokenHit: re.test(text),
        tokenExcerpt: (text.match(re) ?? [""])[0],
        padelOnWatch:
          /running watch/i.test(text) &&
          imgs.some((i) => /guide-how-to-choose/.test(i.src)),
        skyline:
          imgs.some((i) => /urban-dusk/.test(i.src)),
        excerpt: text.slice(0, 900),
        imgs,
      };
    }, TOKEN.source);
    results.push({
      path,
      http: resp?.status() ?? 0,
      ...data,
    });
  }
  return results;
}
