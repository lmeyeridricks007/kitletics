import { getBestGuides } from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessBestGuideLaunchQuality,
} from "@/domain/launch";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { writeFileSync } from "fs";

const PROD = { isDev: false as const };
const published = getBestGuides(PROD);
const rows = published.map((g) => {
  const assessed = assessBestGuideLaunchQuality(g, PROD);
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  return {
    slug: g.slug,
    status: g.status,
    sportId: g.sportId,
    assessed: assessed.quality,
    disposition: elig.disposition,
    eligQuality: elig.quality,
    reasons: elig.reasons.map((r) =>
      r.detail ? `${r.code}:${r.detail}` : r.code,
    ),
    canonicalPath: `/best/${g.slug}`,
  };
});
const indexable = rows.filter((r) =>
  isIndexableEligibility(
    getLaunchEligibility(
      {
        kind: "best-guide",
        entity: published.find((g) => g.slug === r.slug)!,
      },
      PROD,
    ),
  ),
);
const notLrButIdx = indexable.filter((r) => r.eligQuality !== "LAUNCH_READY");
const thinIdx = indexable.filter(
  (r) => r.assessed === "THIN" || r.eligQuality === "THIN",
);
const sitemap = sitemapFn().map((e) => {
  const u = e.url;
  if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
  return u.replace(siteConfig.url, "") || "/";
});
const sitemapBest = sitemap.filter((p) => p.startsWith("/best/") && p !== "/best");
const idxSlugs = new Set(indexable.map((r) => r.slug));
const sitemapSlugs = new Set(sitemapBest.map((p) => p.replace("/best/", "")));
const onlySitemap = [...sitemapSlugs].filter((s) => !idxSlugs.has(s));
const onlyElig = [...idxSlugs].filter((s) => !sitemapSlugs.has(s));

// Intent uniqueness: duplicate titles / identical primary category intents
const intentKeys = new Map<string, string[]>();
for (const r of indexable) {
  const key = r.slug.replace(/^best-/, "").toLowerCase();
  const list = intentKeys.get(key) ?? [];
  list.push(r.slug);
  intentKeys.set(key, list);
}
const duplicateIntentKeys = [...intentKeys.entries()].filter(
  ([, slugs]) => slugs.length > 1,
);

const out = {
  published: published.length,
  indexable: indexable.length,
  notLrButIdx,
  thinIdx,
  byQuality: Object.fromEntries(
    ["LAUNCH_READY", "NEEDS_MINOR_WORK", "THIN", "BLOCKED"].map((q) => [
      q,
      rows.filter((r) => r.assessed === q).length,
    ]),
  ),
  byDisposition: Object.fromEntries(
    ["INDEXABLE", "PUBLIC_NOINDEX", "HIDDEN_404"].map((d) => [
      d,
      rows.filter((r) => r.disposition === d).length,
    ]),
  ),
  sitemapBest: sitemapBest.length,
  onlySitemap,
  onlyElig,
  duplicateIntentKeys,
  heldVerticalIdx: indexable.filter((r) =>
    r.reasons.some((x) => x.includes("vertical_hold")),
  ),
  indexableSlugs: indexable.map((r) => r.slug).sort(),
  nonIndexable: rows
    .filter((r) => r.disposition !== "INDEXABLE")
    .map((r) => ({
      slug: r.slug,
      assessed: r.assessed,
      disposition: r.disposition,
      reasons: r.reasons,
    })),
};

writeFileSync(
  "docs/prelaunch/data/rc-final/28-best-verify.json",
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
