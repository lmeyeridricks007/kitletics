import { getProductBySlug, getAllProductRelationships } from "@/repositories";
import { assessEditorialReadiness } from "@/domain/launch";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };
const SLUGS = [
  "salomon-adv-skin-5",
  "nathan-vaporair-4",
  "osprey-duro-lt",
  "uswe-pace-8",
  "compressport-ultrun-s-pack",
  "nnormal-race-vest",
  "hydrapak-softflask-speed-500",
  "oakley-radar-ev-path",
  "oakley-sutro-lite",
  "smith-attack-mag",
  "julbo-ultimate",
  "tifosi-rail",
  "tifosi-vogel",
  "goodr-circle-gs",
  "ledlenser-neo9r",
  "biolite-headlamp-800-pro",
  "sis-beta-fuel-gel",
  "precision-pf30-gel",
  "neversecond-c30-gel",
  "clif-bar-original",
  "naak-ultra-energy-bar",
  "powerbar-energize",
  "precision-pf30-drink-mix",
  "neversecond-c30-sports-drink",
  "nike-dri-fit-miler-men",
  "janji-run-tee-men",
  "patagonia-capilene-cool-daily-men",
  "salomon-soft-flask-500",
  "oakley-encoder",
  "petzl-swift-rl",
];

let fail = 0;
for (const slug of SLUGS) {
  const p = getProductBySlug(slug, PROD);
  if (!p) {
    console.log(JSON.stringify({ slug, error: "NO PRODUCT" }));
    fail++;
    continue;
  }
  const gate = canPublishAlternativesPage(p, getAllProductRelationships());
  const ed = assessEditorialReadiness({ kind: "alternatives", entity: p }, PROD);
  const data = getAlternativesPageData(slug, PROD);
  const row = {
    slug,
    gateOk: gate.ok,
    reasons: gate.reasons,
    ready: ed.ready,
    gaps: ed.gaps,
    altCount: data?.alternatives.length ?? 0,
  };
  if (!gate.ok || !ed.ready) {
    fail++;
    console.log(JSON.stringify(row));
  }
}
console.log(JSON.stringify({ checked: SLUGS.length, fail }));
