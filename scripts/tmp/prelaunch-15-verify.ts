import { getBestGuides, getTools } from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { simulateDay1LaunchCounts } from "@/domain/launch/simulate-day1";
import { readFileSync } from "fs";

const PROD = { isDev: false as const };
const a03 = JSON.parse(
  readFileSync("docs/prelaunch/data/03-editorial-quality.json", "utf8"),
);
const bestLr: string[] = a03.day1Evidence.launchReadyBestRoutes;

const indexableBest = getBestGuides(PROD).filter((g) =>
  isIndexableEligibility(
    getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
  ),
);
console.log(
  "INDEXABLE best",
  indexableBest.length,
  indexableBest.map((g) => g.slug),
);
const extra = indexableBest.filter(
  (g) => !bestLr.includes(`/best/${g.slug}`),
);
const missing = bestLr.filter(
  (r) => !indexableBest.some((g) => `/best/${g.slug}` === r),
);
console.log("extra", extra.map((g) => g.slug));
console.log("missing", missing);

const heldTools = getTools(PROD).filter((t) => {
  const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
  return (
    t.available &&
    t.sportIds?.length &&
    !t.sportIds.includes("sport-running") &&
    isIndexableEligibility(elig)
  );
});
console.log(
  "held-only tools still INDEXABLE",
  heldTools.map((t) => t.slug),
);

console.log(JSON.stringify(simulateDay1LaunchCounts(), null, 2));
