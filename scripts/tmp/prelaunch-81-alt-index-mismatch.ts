/**
 * Fix 81 — sitemap alternatives vs page robots / data.indexable.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { getProducts } from "@/repositories";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const OUT = join(
  process.cwd(),
  process.env.ALT_MISMATCH_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(OUT, { recursive: true });
const PROD = { isDev: false as const };

function toPath(url: string): string {
  if (url === siteConfig.url || url === `${siteConfig.url}/`) return "/";
  const stripped = url.replace(siteConfig.url, "") || "/";
  return stripped.length > 1 && stripped.endsWith("/")
    ? stripped.slice(0, -1)
    : stripped;
}

function main() {
  const sitemapAlts = sitemapFn()
    .map((e) => toPath(e.url))
    .filter((p) => p.startsWith("/products/") && p.endsWith("/alternatives"));

  const rows = sitemapAlts.map((path) => {
    const slug = path.slice("/products/".length).replace(/\/alternatives$/, "");
    const product = getProducts(PROD).find((p) => p.slug === slug);
    const elig = product
      ? getLaunchEligibility({ kind: "alternatives", entity: product }, PROD)
      : null;
    const data = getAlternativesPageData(slug, PROD);
    return {
      path,
      slug,
      eligibility: elig?.disposition ?? "NO_ENTITY",
      sitemapOk: elig ? isIndexableEligibility(elig) : false,
      pageIndexable: data?.indexable ?? null,
      mismatch: Boolean(elig && isIndexableEligibility(elig) && data && !data.indexable),
    };
  });

  const mismatch = rows.filter((r) => r.mismatch);
  const report = {
    sitemapAlts: sitemapAlts.length,
    pageIndexableTrue: rows.filter((r) => r.pageIndexable === true).length,
    pageIndexableFalse: rows.filter((r) => r.pageIndexable === false).length,
    mismatchN: mismatch.length,
    mismatch: mismatch.map((r) => r.path),
  };
  writeFileSync(join(OUT, "alt-index-mismatch.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
