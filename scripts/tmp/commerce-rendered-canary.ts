/**
 * Bounded rendered-quality + NL price sanity after commerce remediation.
 * Not a site-wide editorial rewrite.
 */
import { enumerateIndexableUrls } from "@/lib/rendered-quality/enumerate";
import { assembleIndexableUrl } from "@/lib/rendered-quality/assemble";
import { inspectPages } from "@/lib/rendered-quality/run";
import { isRawPublicSpecKey } from "@/lib/specs/public-label";
import { classifyDecisionLine } from "@/lib/decision-copy/classify";
import { getLowestOfferPrice } from "@/repositories";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getCatalogProducts } from "@/lib/catalog/query";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";

const CANARIES = [
  "/products/asics-novablast-5",
  "/products/asics-novablast-6",
  "/reviews/asics-novablast-6",
  "/running/shoes",
  "/running/shoes/database",
  "/brands/adidas-padel",
  "/brands/bullpadel",
  "/brands/nox",
  "/brands/tyr",
];

const opts = { isDev: false as const };

function main() {
  const urls = enumerateIndexableUrls().filter((u) => CANARIES.includes(u.path));
  const pages = urls.map(assembleIndexableUrl);
  const issues = inspectPages(pages.filter((p) => p.assembled));

  const tokenLeak = issues.filter((i) => i.issueClass === "TOKEN_LEAK").length;
  const machine = issues.filter(
    (i) =>
      i.issueClass === "DECISION_COPY" &&
      (i.issue.includes("MACHINE_LIKE") || i.excerpt?.includes("MACHINE_LIKE")),
  );
  const machineLines = pages.flatMap((p) => {
    const d = p.decision;
    if (!d) return [];
    return [...d.bestFor, ...d.buyIf, ...d.skipIf].map(classifyDecisionLine);
  });
  const machineCount = machineLines.filter((c) => c === "MACHINE_LIKE").length;
  const brokenCount = machineLines.filter((c) => c === "BROKEN").length;
  const wrongSport = issues.filter(
    (i) => i.issueClass === "IMAGE_SEMANTIC" && i.issue.includes("WRONG_SPORT"),
  ).length;
  const knownFiller = pages.some((p) =>
    p.images.some((img) => img.src.includes("guide-running-shoes.jpg")),
  );
  const rawHits = pages.flatMap((p) =>
    p.components
      .filter(
        (c) =>
          isRawPublicSpecKey(c.text) &&
          !/FilterKeys|specKey|\.key$/i.test(c.id),
      )
      .map((c) => ({ path: p.path, id: c.id, excerpt: c.text.slice(0, 180) })),
  );
  const rawKeys = rawHits.length;

  const from = getLowestOfferPrice("prod-novablast-5", "NL", opts);
  const pdp = getProductPageData("asics-novablast-5", { isDev: false, region: "NL" });
  const catalog = getCatalogProducts(
    {
      sportId: "sport-running",
      categoryId: "cat-running-shoes",
      region: "NL",
      filters: { type: [], brand: [], specs: {}, useCase: [], sort: "recommended" },
      unpaginated: true,
    },
    opts,
  );
  const card = catalog.products.find((r) => r.id === "prod-novablast-5");
  const search = getSearchPageData({
    query: "novablast 5",
    type: "products",
    region: "NL",
    preview: false,
  });
  const searchCard = search.groups
    .flatMap((g) => g.products ?? [])
    .find((p) => p.id === "prod-novablast-5");
  const db = getRunningShoeDatabaseRecords("NL", opts).find(
    (r) => r.id === "prod-novablast-5",
  );

  const report = {
    assembled: pages.length,
    assembledOk: pages.filter((p) => p.assembled).length,
    tokenLeak,
    MACHINE_LIKE: machineCount,
    BROKEN: brokenCount,
    IMAGE_SEMANTIC_WRONG_SPORT: wrongSport,
    known_wrong_sport_filler: knownFiller,
    raw_public_catalog_keys: rawHits.length,
    rawHits,
    extraDecisionIssues: machine.length,
    novablast5: {
      engine: from,
      pdp: pdp?.lowestPrice,
      catalog: card?.price,
      search: searchCard?.price,
      database: db?.price,
    },
  };
  console.log(JSON.stringify(report, null, 2));
  const prices = [
    from?.price,
    pdp?.lowestPrice?.price,
    card?.price?.price,
    searchCard?.price?.amount,
    db?.price?.amount,
  ];
  const disagree = prices.some((p) => p !== from?.price);
  if (
    tokenLeak ||
    machineCount ||
    brokenCount ||
    wrongSport ||
    knownFiller ||
    rawKeys ||
    disagree
  ) {
    process.exit(1);
  }
}

main();
