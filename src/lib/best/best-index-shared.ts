export const BEST_SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
]);

export type BestIndexCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  recCount: number;
  image: { src: string; alt: string };
  sportId: string;
  sportSlug: string | null;
  sportName: string;
  categoryId: string;
  updatedAt: string;
};

export type BestIndexShellData = {
  cards: BestIndexCard[];
};
