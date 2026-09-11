/**
 * npm run racket:commerce-qa
 */
import { offers } from "@/content/offers";
import { byCategory, offerCoverage, PADEL_RACKET, TENNIS_RACKET } from "./lib/racket-catalog-helpers";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

log("# Racket Commerce QA\n");

for (const [label, cat] of [
  ["Padel", PADEL_RACKET],
  ["Tennis", TENNIS_RACKET],
] as const) {
  const list = byCategory(cat);
  const cov = offerCoverage(cat, ["NL", "DE", "BE", "FR", "UK", "US", "ZA"]);
  log(`## ${label} (${list.length} products)`);
  for (const [r, n] of Object.entries(cov)) {
    log(`- ${r}: ${n} (${list.length ? Math.round((n / list.length) * 100) : 0}%)`);
  }
  if ((cov.NL ?? 0) < list.length * 0.7) {
    p1.push(`${label}: NL offer coverage below 70%`);
  }
  // Fake discount check
  const badSale = offers.filter(
    (o) =>
      list.some((p) => p.id === o.productId) &&
      o.originalPrice != null &&
      o.price != null &&
      o.originalPrice <= o.price,
  );
  if (badSale.length) p0.push(`${label}: ${badSale.length} fake/invalid discounts`);
}

log(`\nP0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));
if (p0.length) process.exit(1);
