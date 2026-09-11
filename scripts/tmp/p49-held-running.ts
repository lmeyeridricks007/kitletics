import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { getProductById, getReviews } from "@/repositories";
const PROD = { isDev: false as const };
let heldRunning = 0, heldOther = 0;
const samples: string[] = [];
for (const r of getReviews(PROD)) {
  if (!isContentUniquenessReviewHeld(r.slug)) continue;
  const p = getProductById(r.productId, PROD);
  const running = resolveEntityVerticalPolicy(p?.sportIds ?? []).slug === "running";
  if (running) {
    heldRunning++;
    // Quality ignoring hold? assessReviewLaunchQuality applies hold internally.
    // Check if otherwise substantive by temporarily noting decision score fields.
    samples.push(r.slug);
  } else heldOther++;
}
console.log({ heldRunning, heldOther, sample: samples.slice(0, 20) });
