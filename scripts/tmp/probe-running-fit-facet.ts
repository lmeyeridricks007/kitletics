import { getCatalogProducts } from "@/lib/catalog/query";

const all = getCatalogProducts({
  sportId: "sport-running",
  categoryId: "cat-running-shoes",
});
process.stdout.write(
  all.availableFilters.map((f) => `${f.key}|${f.label}|${f.options?.length ?? 0}`).join("\n") +
    `\ntotal=${all.total}\n`,
);
