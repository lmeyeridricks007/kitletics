import type { SearchEntityType, SearchHit } from "@/lib/search/types";

export function groupSearchHits(
  hits: SearchHit[],
): { type: SearchEntityType; label: string; hits: SearchHit[] }[] {
  const defaultOrder: { type: SearchEntityType; label: string }[] = [
    { type: "product", label: "Products" },
    { type: "brand", label: "Brands" },
    { type: "category", label: "Categories" },
    { type: "sport", label: "Sports" },
    { type: "discipline", label: "Disciplines" },
    { type: "best-guide", label: "Best Guides" },
    { type: "buying-guide", label: "Buying Guides" },
    { type: "review", label: "Reviews" },
    { type: "comparison", label: "Comparisons" },
    { type: "tool", label: "Tools" },
    { type: "setup", label: "Setups" },
  ];

  return defaultOrder
    .map((group) => ({
      ...group,
      hits: hits.filter((h) => h.type === group.type),
    }))
    .filter((g) => g.hits.length > 0);
}
