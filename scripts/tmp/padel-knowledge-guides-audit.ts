/**
 * Audit padel knowledge-center guides for quality + product ID presence.
 */
import fs from "node:fs";
import path from "node:path";
import { getBuyingGuides } from "@/repositories/editorial";
import { getProductById } from "@/repositories/products";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";

const padel = getBuyingGuides().filter((g) => g.sportId === "sport-padel");
const rows = padel.map((g) => {
  const q = assessGuideQuality(g);
  const missingProducts = g.relatedProductIds.filter((id) => !getProductById(id));
  const hasConfig = Boolean(getLongFormGuideConfig(g.slug));
  return {
    slug: g.slug,
    id: g.id,
    title: g.title,
    status: q.status,
    score: q.internalScore,
    decisionCompleteness: q.decisionCompleteness,
    issues: q.issues,
    hasConfig,
    products: g.relatedProductIds.length,
    missingProducts,
    relatedGuides: g.relatedGuideIds?.length ?? 0,
    relatedBest: g.relatedBestGuideIds?.length ?? 0,
    relatedTools: g.relatedToolSlugs?.length ?? 0,
    relatedCompare: g.relatedComparisonIds?.length ?? 0,
    sections: g.sections.length,
    words: q.wordEstimate,
    blocks: q.structuredBlockCount,
    faqs: q.faqCount,
  };
});

const out = {
  generatedAt: new Date().toISOString(),
  total: rows.length,
  byStatus: rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  ),
  missingProductHits: rows.filter((r) => r.missingProducts.length > 0),
  rows: rows.sort((a, b) => a.slug.localeCompare(b.slug)),
};

const outPath = path.join(
  process.cwd(),
  "data/staging/padel-knowledge-guides-quality.json",
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ total: out.total, byStatus: out.byStatus, missing: out.missingProductHits.length }, null, 2));
for (const r of rows.filter((x) => x.status !== "complete")) {
  console.log(`NOT COMPLETE ${r.slug}: ${r.status} issues=${r.issues.join(",") || "-"} config=${r.hasConfig} words=${r.words} blocks=${r.blocks} faqs=${r.faqs}`);
}
for (const r of out.missingProductHits) {
  console.log(`MISSING PRODUCTS ${r.slug}: ${r.missingProducts.join(", ")}`);
}
