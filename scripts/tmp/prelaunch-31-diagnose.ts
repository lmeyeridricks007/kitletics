import { getUseCaseListingPageData } from "../../src/lib/use-case-listing/get-listing-page";
import { statSync, existsSync } from "fs";
import { join } from "path";

function disk(src?: string) {
  if (!src?.startsWith("/")) return 0;
  const p = join("public", src.slice(1));
  return existsSync(p) ? statSync(p).size : 0;
}

const data = getUseCaseListingPageData({
  sportSlug: "running",
  categoryPathSegment: "shoes",
  listingSlug: "daily-trainers",
  searchParams: {},
});

if (!data) {
  console.log("null");
  process.exit(1);
}

const productBytes = data.products
  .map((p) => ({
    slug: p.slug,
    src: p.image?.src,
    bytes: disk(p.image?.src),
  }))
  .sort((a, b) => b.bytes - a.bytes);

const compSrcs: { name: string; src?: string; bytes: number }[] = [];
for (const row of data.featuredComparisons) {
  for (const side of [row.productA, row.productB]) {
    compSrcs.push({
      name: side.name,
      src: side.image?.src,
      bytes: disk(side.image?.src),
    });
  }
}
const guideBytes = data.relatedGuides.map((g) => ({
  title: g.title,
  src: g.imageSrc,
  bytes: disk(g.imageSrc),
}));

console.log(
  JSON.stringify(
    {
      total: data.total,
      pageProducts: data.products.length,
      page: data.page,
      totalPages: data.totalPages,
      hero: {
        src: data.config.heroImageSrc,
        bytes: disk(data.config.heroImageSrc),
      },
      productDiskMB: +(
        productBytes.reduce((a, p) => a + p.bytes, 0) / 1e6
      ).toFixed(2),
      productTop: productBytes.slice(0, 6),
      comps: data.featuredComparisons.length,
      compDiskMB: +(compSrcs.reduce((a, p) => a + p.bytes, 0) / 1e6).toFixed(2),
      compTop: [...compSrcs].sort((a, b) => b.bytes - a.bytes).slice(0, 8),
      guides: guideBytes,
      guideDiskMB: +(guideBytes.reduce((a, g) => a + g.bytes, 0) / 1e6).toFixed(
        2,
      ),
    },
    null,
    2,
  ),
);
