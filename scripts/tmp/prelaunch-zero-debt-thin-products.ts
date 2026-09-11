import { getProducts } from "@/repositories";
import { assessProductLaunchQuality } from "@/domain/launch";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";

const PROD = { isDev: false as const, now: new Date("2026-09-10T16:00:00.000Z") };
for (const p of getProducts(PROD)) {
  const q = assessProductLaunchQuality(p, PROD);
  if (q.quality !== "LAUNCH_READY") {
    const sport = resolveEntityVerticalPolicy(p.sportIds ?? []).slug;
    console.log([q.quality, p.slug, p.categoryId, sport, q.reasons.join("|")].join("\t"));
  }
}
