/**
 * Content catalog barrel.
 * UI must NOT import from here directly — use repositories.
 * Repositories and validators are the only intended consumers.
 */

export { siteConfig, SEED_DATES } from "@/content/config";
export { sports } from "@/content/taxonomy/sports";
export { disciplines } from "@/content/taxonomy/disciplines";
export { categories } from "@/content/taxonomy/categories";
export { subcategories } from "@/content/taxonomy/subcategories";
export { useCases } from "@/content/taxonomy/use-cases";
export { allSpecificationDefinitions } from "@/content/specs/definitions";
export { brands } from "@/content/brands";
export { productFamilies } from "@/content/families";
export { products } from "@/content/products";
export { retailers } from "@/content/retailers";
export { offers } from "@/content/offers";
export { evidence } from "@/content/evidence";
export { recommendations, alternatives } from "@/content/recommendations";
export { faqs } from "@/content/faqs";
export { authors } from "@/content/authors";
export { reviews } from "@/content/reviews";
export { reviewCriteriaDefinitions } from "@/content/review-criteria";
export {
  bestGuides,
  comparisons,
  buyingGuides,
  gearSetups,
} from "@/content/editorial";
export { tools } from "@/content/tools";
