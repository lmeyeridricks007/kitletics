import type {
  CompareCategoryOption,
  CompareProductIndexItem,
} from "@/lib/comparison/product-index-types";

export type FeaturedCompareCard = {
  id: string;
  slug: string;
  title: string;
  productIds: string[];
  shortDescription?: string;
  summary?: string;
};

export type FeaturedCompareGroup = {
  categoryId: string;
  categoryName: string;
  items: FeaturedCompareCard[];
};

export type CompareIndexShellData = {
  index: CompareProductIndexItem[];
  categories: CompareCategoryOption[];
  featured: FeaturedCompareGroup[];
};
