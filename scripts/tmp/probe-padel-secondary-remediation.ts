/**
 * Probe Courtquick identity + raw schema leaks in public padel editorial text.
 */
import { getProductBySlug, getReviewBySlug, getBestGuides } from "@/repositories";
import { isRawPublicSpecKey } from "@/lib/specs/public-label";

const PROD = { isDev: false as const };

const p = getProductBySlug("adidas-courtquick-padel", PROD);
const r = getReviewBySlug("adidas-courtquick-padel", PROD);
process.stdout.write(
  `product ${p?.slug} | ${p?.fullName} | ${p?.id}\n`,
);
process.stdout.write(
  `review ${r?.slug} | ${r?.title} | productId=${r?.productId}\n`,
);
process.stdout.write(
  `legacy product ${getProductBySlug("adidas-courtstabil-padel", PROD)?.slug || "none"}\n`,
);
process.stdout.write(
  `legacy review ${getReviewBySlug("adidas-courtstabil-padel", PROD)?.slug || "none"}\n`,
);

const RAW_KEYS = [
  "genderFit",
  "widthOptions",
  "weightMin",
  "weightMax",
  "frameMaterial",
  "faceMaterial",
  "coreType",
  "racketCapacity",
  "thermalCompartments",
  "playerLevel",
  "playStyle",
  "courtSurface",
  "freshnessStatus",
  "ballsPerCan",
  "cansPerBox",
  "feltMaterial",
  "intendedConditions",
];

let leaks = 0;
for (const g of getBestGuides(PROD).filter((x) => /padel/i.test(x.slug))) {
  const publicFields = [
    g.title,
    g.subtitle,
    g.shortDescription,
    g.intro,
    g.whatMattersIntro,
    ...(g.quickTake ?? []),
    ...((g.selectionCriteria ?? []).map((c) => `${c.label} ${c.description}`)),
    ...((g.picks ?? []).map((pk) => `${pk.summary ?? ""} ${pk.reason ?? ""}`)),
  ].join("\n");
  for (const key of RAW_KEYS) {
    if (new RegExp(`\\b${key}\\b`).test(publicFields)) {
      process.stdout.write(`LEAK ${g.slug} :: ${key}\n`);
      leaks++;
    }
  }
  if (isRawPublicSpecKey(publicFields)) {
    // already counted per-key; note detector hit
  }
}
process.stdout.write(`raw key public leaks in best guides: ${leaks}\n`);
