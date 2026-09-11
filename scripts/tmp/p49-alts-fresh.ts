/**
 * Fresh uniqueness check for alternatives holds:
 * compare reason blobs across held products' alt relationships.
 * Clear hold when each alt has ≥2 non-template reasons and
 * max pairwise Jaccard of reason sets across held pages is low enough.
 */
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { getAllProductRelationships, getProductBySlug } from "@/repositories";
import { isAlternativeType } from "@/domain/relationships/types";
import { textSimilarity } from "@/domain/content-uniqueness/text";

const PROD = { isDev: false as const };
const rels = getAllProductRelationships();

function altBlob(productId: string): string {
  const alts = rels.filter(
    (r) =>
      r.sourceProductId === productId &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  return alts
    .map((r) => r.reasons.join(" | "))
    .sort()
    .join("\n");
}

const held = [...ALTERNATIVES_UNIQUENESS_HOLD_SLUGS].sort();
const blobs = new Map<string, string>();
for (const slug of held) {
  const p = getProductBySlug(slug, PROD);
  if (!p) continue;
  blobs.set(slug, altBlob(p.id));
}

const clearable: string[] = [];
const keep: { slug: string; maxPeer: number; peer?: string }[] = [];

for (const slug of held) {
  const text = blobs.get(slug) ?? "";
  let maxPeer = 0;
  let peer: string | undefined;
  for (const [other, ot] of blobs) {
    if (other === slug) continue;
    const s = textSimilarity(text, ot);
    if (s > maxPeer) {
      maxPeer = s;
      peer = other;
    }
  }
  // Template-ish short blobs or high peer overlap stay held
  const wordCount = text.trim().split(/\s+/).length;
  const ok =
    wordCount >= 80 &&
    maxPeer < 0.72 &&
    !/same-category alternative when you want a peer/i.test(text);
  if (ok) clearable.push(slug);
  else keep.push({ slug, maxPeer: Number(maxPeer.toFixed(3)), peer });
}

console.log(JSON.stringify({ clearable, keep, clearableCount: clearable.length, keepCount: keep.length }, null, 2));
