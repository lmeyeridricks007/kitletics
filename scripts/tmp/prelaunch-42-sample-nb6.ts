import { writeFileSync } from "node:fs";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const d = getAlternativesPageData("asics-novablast-6", { isDev: false });
const out = {
  count: d?.alternatives.length,
  groups: d?.reasonGroups.map((g) => g.reason.id),
  sample: d?.alternatives.slice(0, 4).map((a) => ({
    name: a.product.name,
    reasonId: a.reasonId,
    summary: a.summary?.slice(0, 140),
    why: a.whyChoose,
    type: a.relationship.type,
  })),
};
writeFileSync(
  "docs/prelaunch/editorial/data/42-sample-nb6.json",
  JSON.stringify(out, null, 2),
);
console.log("ok", out.count);
