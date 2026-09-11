import type { ProductLifecycleStatus } from "@/domain/products/types";

export interface CompareProductIndexItem {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  brandId: string;
  brandName: string;
  familyId?: string;
  familyName?: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  generation?: string;
  lifecycleStatus: ProductLifecycleStatus;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  keywords: string;
}

export interface CompareCategoryOption {
  id: string;
  slug: string;
  name: string;
  productCount: number;
  /** Enough products to compare (2+) */
  ready: boolean;
}
