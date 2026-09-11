import { getBrandHubPageData } from "@/lib/brand-hub";
import { getLaunchEligibility } from "@/domain/launch";
import { getReviews } from "@/repositories";

const PROD = { isDev: false as const };
let held = 0;
let hubs = 0;
let cards = 0;
for (const slug of [
  "puma",
  "inov-8",
  "nox",
  "bullpadel",
  "asics",
  "nike",
  "garmin",
  "rogue",
]) {
  const data = getBrandHubPageData({ brandSlug: slug });
  if (!data) {
    console.log(slug, "null");
    continue;
  }
  hubs += 1;
  for (const r of data.reviews.items) {
    cards += 1;
    const reviewSlug = r.href.replace("/reviews/", "");
    const ent = getReviews(PROD).find((x) => x.slug === reviewSlug);
    const disp = ent
      ? getLaunchEligibility({ kind: "review", entity: ent }, PROD)
          .disposition
      : "NO";
    if (disp !== "INDEXABLE") {
      held += 1;
      console.log("held card", slug, r.href, disp);
    }
  }
  console.log(
    slug,
    "reviewCards",
    data.reviews.items.length,
    "productCards",
    data.products.items.length,
  );
}
console.log({ hubs, cards, held });
