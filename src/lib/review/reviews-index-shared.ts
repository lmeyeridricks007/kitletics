import type { ReviewType } from "@/domain/editorial/types";

export const REVIEW_HUB_MAX_PER_CATEGORY = 6;

export const REVIEW_SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
]);

export type ReviewIndexGender = "men" | "women" | "unisex";

export type ReviewIndexCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  reviewType: ReviewType;
  score: number;
  displayScore: number;
  productName: string;
  brandName?: string;
  brandSlug?: string;
  sportSlugs: string[];
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  gender: ReviewIndexGender;
  shoeTypes: { slug: string; name: string }[];
  isShoe: boolean;
  image?: { src: string; alt: string };
};

export type ReviewIndexShellData = {
  cards: ReviewIndexCard[];
};
