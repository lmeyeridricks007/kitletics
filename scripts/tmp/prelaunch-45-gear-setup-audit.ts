/**
 * Editorial 45 — gear setup / kit audit.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getGearSetups } from "@/repositories/editorial";
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { getGearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";
import { calculateSetupPrice } from "@/lib/setups/calculate-setup-price";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getSportById } from "@/repositories";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

const setups = getGearSetups({ isDev: false });
const rows = setups.map((s) => {
  const pub = canPublishGearSetup(s);
  const data = getGearSetupPageData(s.slug, {
    isDev: false,
    region: DEFAULT_REGION,
  });
  const price = calculateSetupPrice({ items: s.items, region: DEFAULT_REGION });
  const sport = getSportById(s.sportId);
  const itemsWithSystem = s.items.filter(
    (i) =>
      (i as { whyNeeded?: string }).whyNeeded ||
      (i as { tradeOffs?: string }).tradeOffs ||
      (i.rationale && i.strengths && i.strengths.length >= 2),
  ).length;

  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    sportSlug: sport?.slug ?? s.sportId,
    items: s.items.length,
    publishOk: pub.ok,
    publishReasons: pub.reasons,
    pageBuilds: Boolean(data),
    indexable: data?.indexable ?? false,
    hasWhy: (s.whyReasons?.length ?? 0) >= 2,
    hasChecklist: (s.checklist?.length ?? 0) >= 3,
    hasGoal: Boolean(s.goalLabel),
    hasExperience: Boolean(s.experienceLevel),
    rationaleCoverage: itemsWithSystem / Math.max(1, s.items.length),
    altsCoverage:
      s.items.filter((i) => (i.alternativeProductIds?.length ?? 0) > 0).length /
      Math.max(1, s.items.length),
    budgetRange: s.budgetRange ?? null,
    knownTotal: price.knownTotal,
    unknownCount: price.unknownCount,
    knownItemCount: price.itemPrices.filter((p) => p.known).length,
    descriptionLen: s.description.length,
    scenarioHint: Boolean(
      /kit|setup|marathon|trail|beginner|hyrox|cold|race|home|garage|apartment|calisthenics|padel/i.test(
        s.slug + s.title,
      ),
    ),
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    setups: rows.length,
    publishOk: rows.filter((r) => r.publishOk).length,
    pageBuilds: rows.filter((r) => r.pageBuilds).length,
    withWhy: rows.filter((r) => r.hasWhy).length,
    withChecklist: rows.filter((r) => r.hasChecklist).length,
    withGoal: rows.filter((r) => r.hasGoal).length,
  },
  rows,
};

writeFileSync(join(OUT, "45-gear-setup-audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.totals, null, 2));
for (const r of rows) {
  console.log(
    `${r.sportSlug}/${r.slug} items=${r.items} pub=${r.publishOk} why=${r.hasWhy} goal=${r.hasGoal} ration=${r.rationaleCoverage.toFixed(2)} price=${r.knownTotal ?? "?"} unk=${r.unknownCount}`,
  );
}
