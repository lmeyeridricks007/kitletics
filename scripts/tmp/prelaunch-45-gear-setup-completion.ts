/**
 * Editorial 45 — gear setup completion assessor.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getGearSetups } from "@/repositories/editorial";
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { getGearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";
import { getSportById } from "@/repositories";
import { DEFAULT_REGION } from "@/domain/shared/types";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

type Verdict = "READY" | "NOT_READY";

const setups = getGearSetups({ isDev: false });

const rows = setups.map((s) => {
  const pub = canPublishGearSetup(s);
  const data = getGearSetupPageData(s.slug, {
    isDev: false,
    region: DEFAULT_REGION,
  });
  const sport = getSportById(s.sportId);
  const core = s.items.filter((i) => {
    const imp = i.importance ?? (i.optional ? "optional" : "required");
    return imp === "required" || imp === "recommended";
  });
  const systemOk = core.every(
    (i) =>
      Boolean(i.whyNeeded) &&
      Boolean(i.systemRole) &&
      Boolean(i.tradeOffs) &&
      Boolean(i.canOmit || i.cheaperAlternative || i.upgradePath),
  );
  const gaps: string[] = [];
  if (!pub.ok) gaps.push(...pub.reasons.map((r) => `publish:${r}`));
  if (!s.scenario || s.scenario.length < 40) gaps.push("thin_scenario");
  if ((s.whyReasons?.length ?? 0) < 2) gaps.push("thin_why");
  if (!systemOk) gaps.push("incomplete_system_explanation");
  if ((s.compatibilityNotes?.length ?? 0) < 1) gaps.push("no_compatibility");
  if ((s.checklist?.length ?? 0) < 3) gaps.push("thin_checklist");
  if (!data?.indexable) gaps.push("not_indexable");

  const verdict: Verdict =
    gaps.length === 0 && pub.ok && Boolean(data?.indexable)
      ? "READY"
      : "NOT_READY";

  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    sportSlug: sport?.slug ?? s.sportId,
    items: s.items.length,
    scenarioPreview: s.scenario?.slice(0, 120),
    compatibilityNotes: s.compatibilityNotes?.length ?? 0,
    budgetTiersShown: data?.budgetTiers.length ?? 0,
    showBudgetRange: data?.showBudgetRange ?? false,
    knownTotal: data?.knownTotal ?? null,
    systemOk,
    gaps,
    verdict,
  };
});

const missingScenarios = [
  {
    slug: "cold-weather-running-kit",
    note: "Example scenario named in brief — not in current estate; do not invent without apparel/layer products + decision depth.",
  },
];

const report = {
  generatedAt: new Date().toISOString(),
  criteria: {
    ready:
      "concrete scenario · whyReasons≥2 · system fields on core items · compatibility · checklist≥3 · canPublish · indexable",
    budget:
      "budgetRange shown only when known offer total sits near declared band; budgetTiers only when evidence supports",
  },
  totals: {
    setups: rows.length,
    ready: rows.filter((r) => r.verdict === "READY").length,
    notReady: rows.filter((r) => r.verdict === "NOT_READY").length,
  },
  missingFromEstate: missingScenarios,
  rows: rows.sort((a, b) =>
    a.verdict.localeCompare(b.verdict) || a.slug.localeCompare(b.slug),
  ),
};

writeFileSync(
  join(OUT, "45-gear-setup-completion.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report.totals, null, 2));
for (const r of report.rows) {
  console.log(`${r.verdict} ${r.sportSlug}/${r.slug} gaps=${r.gaps.join("|") || "—"}`);
}
