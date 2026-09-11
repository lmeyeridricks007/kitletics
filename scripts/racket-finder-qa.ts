/**
 * npm run racket:finder-qa — 20+ profile scenarios per sport + diversity checks
 */
import { products } from "@/content/products";
import { offers } from "@/content/offers";
import { recommendations } from "@/content/recommendations";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import { AFFILIATE_NEUTRALITY } from "@/domain/finders/scoring";
import { canPublishFinder } from "@/domain/finders/configs/racket-finders";
import {
  byCategory,
  isFinderEligible,
  isHighConfidence,
  PADEL_RACKET,
  TENNIS_RACKET,
} from "./lib/racket-catalog-helpers";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

function lowestMap(cat: string) {
  const cats = byCategory(cat).filter(isFinderEligible);
  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of cats) {
    const prices = offers
      .filter((o) => o.productId === p.id && typeof o.price === "number")
      .map((o) => o.price!);
    lowestByProduct[p.id] = prices.length
      ? { price: Math.min(...prices), currency: "EUR" }
      : undefined;
  }
  return { cats, lowestByProduct };
}

type Profile = { name: string; responses: Record<string, string | string[]> };

const PADEL_PROFILES: Profile[] = [
  { name: "beginner-control", responses: { primaryUse: "beginner", priorities: ["control", "forgiveness"], weightPreference: "light", budget: "100-180" } },
  { name: "beginner-maneuver", responses: { primaryUse: "beginner", priorities: ["maneuverability", "comfort"], weightPreference: "light", budget: "100-180" } },
  { name: "int-balanced", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["control", "value"], weightPreference: "medium", budget: "180-280" } },
  { name: "int-control", responses: { primaryUse: "intermediate", playingStyle: "control", priorities: ["control"], weightPreference: "medium", budget: "180-280" } },
  { name: "int-power", responses: { primaryUse: "intermediate", playingStyle: "power", priorities: ["power"], weightPreference: "medium", budget: "180-280" } },
  { name: "int-spin", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["spin", "control"], weightPreference: "medium", budget: "180-280" } },
  { name: "adv-power-firm", responses: { primaryUse: "advanced", playingStyle: "power", priorities: ["power"], weightPreference: "heavy", feelPreference: "firmer", budget: "280-plus" } },
  { name: "adv-control", responses: { primaryUse: "advanced", playingStyle: "control", priorities: ["control"], weightPreference: "medium", budget: "280-plus" } },
  { name: "comp-power", responses: { primaryUse: "competitive", playingStyle: "power", priorities: ["power"], weightPreference: "any", budget: "280-plus" } },
  { name: "value-int", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["value", "forgiveness"], weightPreference: "any", budget: "100-180" } },
  { name: "premium-adv", responses: { primaryUse: "advanced", playingStyle: "balanced", priorities: ["control", "power"], weightPreference: "medium", budget: "280-plus" } },
  { name: "light-pref", responses: { primaryUse: "intermediate", playingStyle: "control", priorities: ["maneuverability"], weightPreference: "light", balancePreference: "low", budget: "180-280" } },
  { name: "heavy-pref", responses: { primaryUse: "advanced", playingStyle: "power", priorities: ["power"], weightPreference: "heavy", balancePreference: "head-heavy", budget: "280-plus" } },
  { name: "soft-feel", responses: { primaryUse: "intermediate", playingStyle: "control", priorities: ["comfort", "forgiveness"], feelPreference: "softer", weightPreference: "medium", budget: "180-280" } },
  { name: "no-budget", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["control"], weightPreference: "any", budget: "280-plus" } },
  { name: "delta-power-to-control", responses: { primaryUse: "intermediate", currentEquipment: "yes", changeGoals: ["more-control", "lighter"], priorities: ["control", "maneuverability"], weightPreference: "light", budget: "180-280" } },
  { name: "figuring-out", responses: { primaryUse: "beginner", priorities: ["forgiveness", "value"], weightPreference: "medium", budget: "100-180" } },
  { name: "int-maneuver-value", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["maneuverability", "value"], weightPreference: "medium", budget: "100-180" } },
  { name: "adv-spin-power", responses: { primaryUse: "advanced", playingStyle: "power", priorities: ["spin", "power"], weightPreference: "medium", budget: "280-plus" } },
  { name: "int-balanced-mid", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["control", "power"], weightPreference: "medium", budget: "180-280" } },
];

const TENNIS_PROFILES: Profile[] = [
  { name: "beginner-forgiveness", responses: { primaryUse: "beginner", playingStyle: "balanced", priorities: ["forgiveness"], weightPreference: "light", budget: "under-150" } },
  { name: "beginner-easy", responses: { primaryUse: "beginner", playingStyle: "balanced", priorities: ["forgiveness", "value"], weightPreference: "light", budget: "under-150" } },
  { name: "int-spin", responses: { primaryUse: "intermediate", playingStyle: "spin", priorities: ["spin", "maneuverability"], weightPreference: "medium", budget: "150-250" } },
  { name: "int-power", responses: { primaryUse: "intermediate", playingStyle: "power", priorities: ["power"], weightPreference: "medium", budget: "150-250" } },
  { name: "int-control", responses: { primaryUse: "intermediate", playingStyle: "control", priorities: ["control"], weightPreference: "medium", budget: "150-250" } },
  { name: "adv-control", responses: { primaryUse: "advanced", playingStyle: "control", priorities: ["control"], weightPreference: "heavy", budget: "250-plus" } },
  { name: "adv-stability", responses: { primaryUse: "advanced", playingStyle: "control", priorities: ["control"], weightPreference: "heavy", budget: "250-plus" } },
  { name: "power-seeker", responses: { primaryUse: "intermediate", playingStyle: "power", priorities: ["power"], weightPreference: "any", budget: "150-250" } },
  { name: "easy-handling", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["maneuverability", "forgiveness"], weightPreference: "light", budget: "150-250" } },
  { name: "budget", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["value"], weightPreference: "any", budget: "under-150" } },
  { name: "premium", responses: { primaryUse: "advanced", playingStyle: "control", priorities: ["control", "spin"], weightPreference: "medium", budget: "250-plus" } },
  { name: "delta-to-spin", responses: { primaryUse: "intermediate", currentEquipment: "yes", changeGoals: ["more-spin", "lighter"], priorities: ["spin", "maneuverability"], weightPreference: "light", budget: "150-250" } },
  { name: "clash-comfort", responses: { primaryUse: "beginner", playingStyle: "balanced", priorities: ["comfort", "forgiveness"], weightPreference: "light", budget: "150-250" } },
  { name: "blade-control", responses: { primaryUse: "advanced", playingStyle: "control", priorities: ["control"], weightPreference: "medium", budget: "250-plus" } },
  { name: "aero-spin", responses: { primaryUse: "intermediate", playingStyle: "spin", priorities: ["spin"], weightPreference: "medium", budget: "150-250" } },
  { name: "ezone-forgive", responses: { primaryUse: "intermediate", playingStyle: "power", priorities: ["forgiveness", "power"], weightPreference: "medium", budget: "150-250" } },
  { name: "speed-balance", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["control", "spin"], weightPreference: "medium", budget: "150-250" } },
  { name: "no-pref-weight", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["control"], weightPreference: "any", budget: "150-250" } },
  { name: "comp-power", responses: { primaryUse: "competitive", playingStyle: "power", priorities: ["power", "spin"], weightPreference: "medium", budget: "250-plus" } },
  { name: "int-maneuver", responses: { primaryUse: "intermediate", playingStyle: "balanced", priorities: ["maneuverability"], weightPreference: "light", budget: "150-250" } },
];

function runSuite(
  label: string,
  slug: string,
  cat: string,
  profiles: Profile[],
) {
  log(`\n## ${label}\n`);
  const def = getFinderDefinition(slug);
  if (!def) {
    p0.push(`${slug} not registered`);
    return;
  }
  const { cats, lowestByProduct } = lowestMap(cat);
  const brands = new Set(cats.map((p) => p.brandId));
  const recs = recommendations.filter((r) =>
    cats.some((p) => p.id === r.productId),
  );
  const gate = canPublishFinder({
    candidateCount: cats.length,
    brandCount: brands.size,
    recommendationCount: recs.length,
  });
  log(`- candidates: ${cats.length}, brands: ${brands.size}, recs: ${recs.length}`);
  log(`- canPublishFinder: ${gate}`);
  log(`- high-confidence: ${byCategory(cat).filter(isHighConfidence).length}`);
  if (!gate) p0.push(`${label} fails canPublishFinder`);

  const topIds: string[] = [];
  let failures = 0;
  for (const profile of profiles) {
    const result = runFinder({
      definition: def,
      products: cats,
      responses: profile.responses,
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    if (result.rankedResults.length === 0) {
      log(`- FAIL ${profile.name}: no results`);
      failures += 1;
      continue;
    }
    const top = result.rankedResults[0]!.productId;
    topIds.push(top);
    log(`- ${profile.name} → ${products.find((p) => p.id === top)?.fullName ?? top} (${result.rankedResults[0]!.matchScore})`);
  }
  if (failures > 2) p0.push(`${label}: ${failures} empty Finder results`);
  else if (failures > 0) p1.push(`${label}: ${failures} empty Finder results`);

  const uniqueTops = new Set(topIds);
  log(`- unique #1 across ${profiles.length} profiles: ${uniqueTops.size}`);
  if (uniqueTops.size < 4) {
    p1.push(`${label}: low result diversity (${uniqueTops.size} unique tops)`);
  }

  // Control vs power should differ
  const control = runFinder({
    definition: def,
    products: cats,
    responses: profiles.find((p) => p.name.includes("control"))?.responses ?? {
      primaryUse: "intermediate",
      playingStyle: "control",
      priorities: ["control"],
      weightPreference: "medium",
      budget: Object.keys(def.regionalBudgets[0]?.bands[1] ?? {})[0] ?? "180-280",
    },
    region: "NL",
    lowestByProduct,
    recommendations,
  });
  const power = runFinder({
    definition: def,
    products: cats,
    responses: {
      primaryUse: "advanced",
      playingStyle: "power",
      priorities: ["power"],
      weightPreference: "heavy",
      budget: def.regionalBudgets[0]?.bands.at(-1)?.id ?? "280-plus",
    },
    region: "NL",
    lowestByProduct,
    recommendations,
  });
  if (
    control.rankedResults[0] &&
    power.rankedResults[0] &&
    control.rankedResults[0].productId === power.rankedResults[0].productId
  ) {
    p1.push(`${label}: control and power scenarios share identical #1`);
  }

  log(`- affiliate neutrality note: ${AFFILIATE_NEUTRALITY}`);
}

log("# Racket Finder QA\n");
log(`Generated: ${new Date().toISOString()}`);
runSuite("Padel", "padel-racket-finder", PADEL_RACKET, PADEL_PROFILES);
runSuite("Tennis", "tennis-racket-finder", TENNIS_RACKET, TENNIS_PROFILES);

log(`\n## Severity\n`);
log(`P0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));

if (p0.length) process.exit(1);
