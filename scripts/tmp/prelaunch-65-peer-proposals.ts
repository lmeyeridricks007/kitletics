/**
 * Propose catalog peers to add for thin Alternatives pages with <3 graph alts.
 * Catalog-only — no invented SKUs.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getAllProductRelationships,
  getProductById,
  getProducts,
} from "@/repositories";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { isAlternativeType } from "@/domain/relationships/types";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };

function overlap(a: string[], b: string[]): number {
  const s = new Set(a);
  return b.filter((x) => s.has(x)).length;
}

function gender(slug: string): "men" | "women" | "uni" {
  if (slug.endsWith("-women")) return "women";
  if (slug.endsWith("-men")) return "men";
  return "uni";
}

function main() {
  const rels = getAllProductRelationships();
  const products = getProducts(PROD);
  const byCat = new Map<string, typeof products>();
  for (const p of products) {
    const list = byCat.get(p.categoryId) ?? [];
    list.push(p);
    byCat.set(p.categoryId, list);
  }

  const proposals: Record<string, unknown>[] = [];

  for (const product of products) {
    const alts = rels.filter(
      (r) =>
        r.sourceProductId === product.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    if (alts.length === 0) continue;
    const gate = canPublishAlternativesPage(product, rels);
    if (gate.ok) continue;
    if (alts.length >= 3) continue;

    const existing = new Set(alts.map((r) => r.targetProductId));
    for (const id of product.alternativeProductIds ?? []) existing.add(id);

    const g = gender(product.slug);
    const ranked = (byCat.get(product.categoryId) ?? [])
      .filter((p) => {
        if (p.id === product.id) return false;
        if (p.status !== "published") return false;
        if (existing.has(p.id)) return false;
        if (p.lifecycleStatus === "discontinued") return false;
        const pg = gender(p.slug);
        if (g !== "uni" && pg !== "uni" && pg !== g) return false;
        return true;
      })
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.fullName,
        uc: overlap(product.useCaseIds, p.useCaseIds),
        sub: overlap(product.subcategoryIds, p.subcategoryIds),
        rec: p.recommendationScore ?? 0,
        val: p.valueScore ?? 0,
        lifecycle: p.lifecycleStatus,
      }))
      .sort((a, b) => b.uc - a.uc || b.sub - a.sub || b.rec - a.rec);

    const need = 3 - alts.length;
    const pick = ranked.slice(0, Math.max(need, 3));
    proposals.push({
      slug: product.slug,
      id: product.id,
      categoryId: product.categoryId,
      have: alts.length,
      existing: [...existing].map((id) => getProductById(id, PROD)?.slug),
      pick: pick.map((p) => `${p.slug} (uc=${p.uc} sub=${p.sub})`),
      pickIds: pick.slice(0, need).map((p) => p.id),
    });
  }

  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/65-alt-peer-proposals.json"),
    JSON.stringify(proposals, null, 2),
  );
  console.log("proposals", proposals.length);
  for (const p of proposals) {
    console.log(p.slug, "have", p.have, "→", (p.pick as string[]).slice(0, 3).join(" | "));
  }
}

main();
