/**
 * npm run racket:media-qa
 */
import { byCategory, mediaFlags, PADEL_RACKET, TENNIS_RACKET } from "./lib/racket-catalog-helpers";
import { products } from "@/content/products";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

log("# Racket Media QA\n");

for (const [label, cat] of [
  ["Padel", PADEL_RACKET],
  ["Tennis", TENNIS_RACKET],
] as const) {
  const flags = mediaFlags(cat);
  log(`## ${label}\n${JSON.stringify(flags, null, 2)}`);
  if (flags.missing > 0) p0.push(`${label}: ${flags.missing} missing heroes`);

  const list = byCategory(cat);
  const srcCount = new Map<string, string[]>();
  for (const p of list) {
    const src = p.images[0]?.src;
    if (!src) continue;
    const arr = srcCount.get(src) ?? [];
    arr.push(p.id);
    srcCount.set(src, arr);
  }
  // Shared SVG placeholders are intentional — flag only unlabeled identical reuse across different brands without placeholder alt
  let suspicious = 0;
  for (const [src, ids] of srcCount) {
    if (ids.length < 3) continue;
    if (src.endsWith(".svg")) continue; // known shared placeholders
    suspicious += 1;
    p1.push(`${label}: image ${src} reused by ${ids.length} products`);
  }
  log(`- suspicious non-placeholder reuse clusters: ${suspicious}`);
}

// Dummy silhouette detection
const dummy = products.filter(
  (p) =>
    (p.categoryId === PADEL_RACKET || p.categoryId === TENNIS_RACKET) &&
    (p.images[0]?.alt?.toLowerCase().includes("silhouette") ||
      p.images[0]?.src?.includes("generic-racket")),
);
if (dummy.length) p0.push(`${dummy.length} generic silhouette images`);

log(`\nP0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));
if (p0.length) process.exit(1);
