import sitemapMod from "../../src/app/sitemap";
import { siteConfig } from "../../src/content/config";
import { getComparisonPageData } from "../../src/lib/comparison/get-comparison-page-data";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "../../src/domain/launch";
import { getComparisons } from "../../src/repositories/editorial";

const sitemapFn =
  typeof sitemapMod === "function"
    ? sitemapMod
    : (sitemapMod as { default: typeof sitemapMod }).default;

const paths = sitemapFn().map(
  (e: { url: string }) => e.url.replace(siteConfig.url, "") || "/",
);
const compare = paths.filter((p: string) => p.startsWith("/compare/"));
const broken = [
  "lululemon-hotty-hot-vs-janji-pace-short",
  "theragun-prime-vs-renpho-r3",
  "triggerpoint-grid-vs-grid-x",
  "oofos-ooriginal-vs-hoka-ora-recovery-slide",
];
const stillInSitemap = broken.filter((s) =>
  paths.includes(`/compare/${s}`),
);
const noPage = compare.filter(
  (p: string) =>
    !getComparisonPageData(p.replace("/compare/", ""), { isDev: false }),
);
const indexable = getComparisons({ isDev: false }).filter((c) =>
  isIndexableEligibility(
    getLaunchEligibility({ kind: "comparison", entity: c }, { isDev: false }),
  ),
);
console.log(
  JSON.stringify(
    {
      sitemapTotal: paths.length,
      compareInSitemap: compare.length,
      brokenStillInSitemap: stillInSitemap,
      compareWithoutPageData: noPage,
      indexableComps: indexable.length,
    },
    null,
    2,
  ),
);
