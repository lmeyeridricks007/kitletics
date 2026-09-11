export { getCatalogProducts } from "@/lib/catalog/query";
export {
  parseCatalogSearchParams,
  serializeCatalogSearchParams,
  catalogHref,
  removeFilterValue,
  clearCatalogFilters,
  resolveRunningShoesEntryRedirect,
} from "@/lib/catalog/params";
export {
  assembleCategoryPage,
  getCategoryPageConfig,
  runningShoesCategoryConfig,
} from "@/lib/catalog/assemble";
export type {
  CatalogFilterState,
  CatalogQueryResult,
  CatalogProductRow,
  CatalogFacet,
  CatalogSort,
  ProductCategoryPageConfig,
  ActiveFilterChip,
} from "@/lib/catalog/types";
export type { AssembledCategoryPage } from "@/lib/catalog/assemble";
