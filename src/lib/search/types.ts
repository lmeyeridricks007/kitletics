export type SearchEntityType =
  | "product"
  | "brand"
  | "sport"
  | "discipline"
  | "category"
  | "review"
  | "best-guide"
  | "comparison"
  | "buying-guide"
  | "tool"
  | "setup";

export interface SearchHit {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
  brandName?: string;
  categoryName?: string;
  recommendationScore?: number;
  icon?: string;
}

export type SearchFilter =
  | "all"
  | "products"
  | "categories"
  | "reviews"
  | "guides"
  | "comparisons"
  | "tools"
  | "brands";
