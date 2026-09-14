/**
 * Padel Best Guide estate quality + skip decisions.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { bestGuides } from "@/content/best-guides";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { containsMachineTemplateCopy } from "@/lib/review/consumer-copy-quality";

const padel = bestGuides.filter((g) => g.sportId === "sport-padel");

const rows = padel.map((g) => {
  const q = assessBestGuideLaunchQuality(g, { isDev: true });
  const recs = g.recommendations ?? [];
  const machine = containsMachineTemplateCopy({
    intro: g.intro,
    whatMattersIntro: g.whatMattersIntro,
    buyingAdvice: g.buyingAdvice,
    recommendations: recs,
  });
  return {
    slug: g.slug,
    id: g.id,
    kind: g.guideKind ?? "category",
    recs: recs.length,
    narrow: Boolean(g.intentionallyNarrow),
    quality: q.quality,
    reasons: q.reasons.join("; "),
    machine,
    considered: g.consideredProductIds?.length ?? 0,
    shortlisted: g.shortlistedProductIds?.length ?? 0,
    evidence: g.evidenceIds?.length ?? 0,
  };
});

console.log("padel best guides", rows.length);
for (const r of rows) {
  console.log(
    `${r.quality.padEnd(12)} recs=${r.recs} considered=${r.considered} machine=${r.machine} ${r.slug} — ${r.reasons}`,
  );
}

const out = path.join(process.cwd(), "data/staging/padel-best-guides-quality.json");
writeFileSync(out, JSON.stringify(rows, null, 2));
console.log("wrote", out);
