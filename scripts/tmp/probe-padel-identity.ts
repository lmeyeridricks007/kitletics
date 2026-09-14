import { getProducts, getProductBySlug, getBrands } from "@/repositories";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";

const PROD = { isDev: false as const };
const DEV = { isDev: true as const };
const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));

for (const slug of [
  "kuikma-padel-paletero",
  "4on-pro-t1",
  "adidas-metalbone-bag",
  "osaka-sports-padel-bag",
  "head-hydrosorb-replacement-grip",
  "adidas-courtstabil-padel",
  "sane-core",
  "tourna-mega-tac",
  "wilson-wilson-weight-tape",
  "bullpadel-vertex-04",
  "head-padel-pro-s-balls",
  "4on-swiftgrip",
]) {
  const p = getProductBySlug(slug, DEV) || getProductBySlug(slug, PROD);
  if (!p) {
    process.stdout.write(`MISSING ${slug}\n`);
    continue;
  }
  const brand = brands[p.brandId];
  const media = getCatalogProductHeroMedia(p.id, p.fullName)?.[0] || p.images[0];
  const id = evaluatePadelHeroIdentity(p, media, { brandSlug: brand?.slug });
  const primary = getPrimaryProductMedia(p);
  process.stdout.write(
    `${slug} status=${p.status} verified=${id.verified} reasons=${id.reasons.join("|") || "ok"} primary=${primary?.src || "none"}\n`,
  );
  process.stdout.write(`  src ${media?.src}\n  source ${media?.sourceUrl}\n`);
}

const all = getProducts(DEV).filter((p) => p.categoryId.startsWith("cat-padel-"));
const pub = all.filter((p) => p.status === "published");
const draft = all.filter((p) => p.status === "draft");
process.stdout.write(
  `\npadel products ${all.length} published ${pub.length} draft ${draft.length}\n`,
);
const softPub = pub.filter((p) =>
  [
    "cat-padel-balls",
    "cat-padel-bags",
    "cat-padel-grips",
    "cat-padel-accessories",
  ].includes(p.categoryId),
);
process.stdout.write(`soft published ${softPub.length}\n`);

let fail = 0;
const failSamples: string[] = [];
for (const id of Object.keys(PADEL_SECONDARY_PRODUCT_MEDIA)) {
  const p = all.find((x) => x.id === id);
  if (!p) continue;
  const brand = brands[p.brandId];
  const media = getCatalogProductHeroMedia(id, p.fullName)?.[0];
  const ev = evaluatePadelHeroIdentity(p, media, { brandSlug: brand?.slug });
  if (!ev.verified) {
    fail++;
    if (failSamples.length < 20) {
      failSamples.push(`${p.status} ${p.slug} ${ev.reasons.join("|")}`);
    }
  }
}
process.stdout.write(`secondary identity fails (incl draft) ${fail}\n`);
for (const s of failSamples) process.stdout.write(`  ${s}\n`);
