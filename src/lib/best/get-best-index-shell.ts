import { getBestIndexData } from "@/lib/best/get-best-guide-page-data";
import { resolveUniqueBestGuideImages } from "@/lib/best/resolve-best-guide-image";
import type { BestIndexCard, BestIndexShellData } from "@/lib/best/best-index-shared";

export { BEST_SHOE_CATEGORY_IDS } from "@/lib/best/best-index-shared";
export type { BestIndexCard, BestIndexShellData } from "@/lib/best/best-index-shared";

export function getBestIndexShellData(): BestIndexShellData {
  const { guides, bySport } = getBestIndexData();
  const uniqueImages = resolveUniqueBestGuideImages(guides);
  const sportNameById = new Map(
    bySport.map((g) => [g.sport?.id ?? "other", g.sport?.name ?? "Other"]),
  );
  const sportSlugById = new Map(
    bySport.map((g) => [g.sport?.id ?? "other", g.sport?.slug ?? null]),
  );

  const cards: BestIndexCard[] = guides.map((guide) => {
    const image = uniqueImages.get(guide.id) ?? {
      src: "/images/home/guide-running-shoes.jpg",
      alt: guide.title,
    };
    return {
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      description: (guide.shortDescription ?? guide.intro).slice(0, 220),
      recCount: guide.recommendations.length,
      image,
      sportId: guide.sportId,
      sportSlug: sportSlugById.get(guide.sportId) ?? null,
      sportName: sportNameById.get(guide.sportId) ?? "Other",
      categoryId: guide.categoryId,
      updatedAt: guide.updatedAt,
    };
  });

  return { cards };
}
