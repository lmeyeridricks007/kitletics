import { getProductBySlug, getBrands } from "@/repositories/products";
import { getReviewBySlug } from "@/repositories/editorial";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { hasVerifiedProductHero } from "@/content/running/products/media-publish-gate";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { isAuthenticProductMedia } from "@/lib/product/media-authentic";

const PROD = { isDev: false as const };
const DEV = { isDev: true as const };
const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));
const p =
  getProductBySlug("adidas-courtquick-padel", PROD) ||
  getProductBySlug("adidas-courtquick-padel", DEV)!;
const catalog = getCatalogProductHeroMedia(p.id, p.fullName)?.[0];
const running = getRunningProductHeroMedia(p.id, p.fullName)?.[0];
const identity = evaluatePadelHeroIdentity(p, catalog ?? running, {
  brandSlug: brands[p.brandId]?.slug,
});
process.stdout.write(
  JSON.stringify(
    {
      status: p.status,
      slug: p.slug,
      catalog: catalog?.src,
      authentic: catalog ? isAuthenticProductMedia(catalog) : false,
      verifiedGate: hasVerifiedProductHero(p),
      identity,
      primary: getPrimaryProductMedia(p)?.src,
      review: getReviewBySlug("adidas-courtquick-padel", PROD)?.title,
    },
    null,
    2,
  ) + "\n",
);
