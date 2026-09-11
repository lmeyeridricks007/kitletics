/**
 * Kitletics content validation — run via `npm run content:validate`.
 * Checks Zod schemas, referential integrity, duplicate IDs/slugs, and publish dates.
 */

import { sportSchema, disciplineSchema, productCategorySchema, productSubcategorySchema, useCaseSchema } from "@/domain/sports/schemas";
import {
  brandSchema,
  productFamilySchema,
  productSchema,
  specificationDefinitionSchema,
} from "@/domain/products/schemas";
import { retailerSchema, offerSchema } from "@/domain/commerce/schemas";
import {
  evidenceSchema,
  recommendationSchema,
  alternativeRelationshipSchema,
} from "@/domain/recommendations/schemas";
import {
  faqSchema,
  reviewSchema,
  authorSchema,
  reviewCriteriaDefinitionSchema,
  bestGuideSchema,
  comparisonSchema,
  buyingGuideSchema,
  gearSetupSchema,
} from "@/domain/editorial/schemas";
import { toolSchema } from "@/domain/tools/schemas";
import {
  runningShoesComparisonConfig,
  gpsWatchComparisonConfig,
  padelRacketComparisonConfig,
} from "@/lib/comparison/category-config";
import { getAllFinderDefinitions } from "@/domain/finders/repository";
import { getAllCalculatorDefinitions } from "@/domain/calculators/registry";
import { ROTATION_ROLES } from "@/domain/shoe-rotation/roles";

import { sports } from "@/content/taxonomy/sports";
import { disciplines } from "@/content/taxonomy/disciplines";
import { categories } from "@/content/taxonomy/categories";
import { subcategories } from "@/content/taxonomy/subcategories";
import { useCases } from "@/content/taxonomy/use-cases";
import { allSpecificationDefinitions } from "@/content/specs/definitions";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import { products } from "@/content/products";
import { retailers } from "@/content/retailers";
import { offers } from "@/content/offers";
import { evidence } from "@/content/evidence";
import { recommendations, alternatives } from "@/content/recommendations";
import { faqs } from "@/content/faqs";
import { authors } from "@/content/authors";
import { reviews } from "@/content/reviews";
import { reviewCriteriaDefinitions } from "@/content/review-criteria";
import {
  bestGuides,
  comparisons,
  buyingGuides,
  gearSetups,
} from "@/content/editorial";
import { tools } from "@/content/tools";
import { productRelationships } from "@/content/running/relationships";
import { detectRelationshipContradictions } from "@/repositories/relationships";

type Issue = { level: "error" | "warn"; message: string };

const issues: Issue[] = [];

function error(message: string) {
  issues.push({ level: "error", message });
}
function warn(message: string) {
  issues.push({ level: "warn", message });
}

function validateArray(
  label: string,
  items: unknown[],
  // Zod schemas vary by version; keep this intentionally loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: { safeParse: (v: unknown) => any },
) {
  for (let i = 0; i < items.length; i++) {
    const result = schema.safeParse(items[i]);
    if (!result.success) {
      for (const issue of result.error?.issues ?? []) {
        const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
        error(`${label}[${i}].${path}: ${issue.message}`);
      }
    }
  }
}

function checkUniqueIds(label: string, ids: string[]) {
  const counts = new Map<string, number>();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, n] of counts) {
    if (n > 1) error(`Duplicate ${label} id "${id}" defined ${n} times`);
  }
}

function checkUniqueSlugs(label: string, slugs: string[]) {
  const counts = new Map<string, number>();
  for (const slug of slugs) {
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  for (const [slug, n] of counts) {
    if (n > 1) error(`Duplicate ${label} slug "${slug}" defined ${n} times`);
  }
}

function assertRef(label: string, id: string | undefined, pool: Set<string>, optional = false) {
  if (!id) {
    if (!optional) error(`${label}: missing id`);
    return;
  }
  if (!pool.has(id)) error(`${label}: missing reference "${id}"`);
}

function isValidDate(value?: string) {
  if (!value) return true;
  return !Number.isNaN(Date.parse(value));
}

// ── Schema validation ──────────────────────────────────────────
validateArray("Sport", sports, sportSchema);
validateArray("Discipline", disciplines, disciplineSchema);
validateArray("Category", categories, productCategorySchema);
validateArray("Subcategory", subcategories, productSubcategorySchema);
validateArray("UseCase", useCases, useCaseSchema);
validateArray("SpecDef", allSpecificationDefinitions, specificationDefinitionSchema);
validateArray("Brand", brands, brandSchema);
validateArray("Family", productFamilies, productFamilySchema);
validateArray("Product", products, productSchema);
validateArray("Retailer", retailers, retailerSchema);
validateArray("Offer", offers, offerSchema);
validateArray("Evidence", evidence, evidenceSchema);
validateArray("Recommendation", recommendations, recommendationSchema);
validateArray("Alternative", alternatives, alternativeRelationshipSchema);
validateArray("FAQ", faqs, faqSchema);
validateArray("Author", authors, authorSchema);
validateArray("ReviewCriteria", reviewCriteriaDefinitions, reviewCriteriaDefinitionSchema);
validateArray("Review", reviews, reviewSchema);
validateArray("BestGuide", bestGuides, bestGuideSchema);
validateArray("Comparison", comparisons, comparisonSchema);
validateArray("BuyingGuide", buyingGuides, buyingGuideSchema);
validateArray("GearSetup", gearSetups, gearSetupSchema);
validateArray("Tool", tools, toolSchema);

// ── Unique IDs / slugs ─────────────────────────────────────────
checkUniqueIds("sport", sports.map((s) => s.id));
checkUniqueSlugs("sport", sports.map((s) => s.slug));
checkUniqueIds("discipline", disciplines.map((d) => d.id));
checkUniqueIds("category", categories.map((c) => c.id));
checkUniqueSlugs("category", categories.map((c) => c.slug));
checkUniqueIds("subcategory", subcategories.map((s) => s.id));
checkUniqueIds("useCase", useCases.map((u) => u.id));
checkUniqueIds("brand", brands.map((b) => b.id));
checkUniqueSlugs("brand", brands.map((b) => b.slug));
checkUniqueIds("family", productFamilies.map((f) => f.id));
checkUniqueIds("product", products.map((p) => p.id));
checkUniqueSlugs("product", products.map((p) => p.slug));
checkUniqueIds("retailer", retailers.map((r) => r.id));
checkUniqueIds("offer", offers.map((o) => o.id));
checkUniqueIds("evidence", evidence.map((e) => e.id));
checkUniqueIds("recommendation", recommendations.map((r) => r.id));
checkUniqueIds("author", authors.map((a) => a.id));
checkUniqueSlugs("author", authors.map((a) => a.slug));
checkUniqueIds("reviewCriteria", reviewCriteriaDefinitions.map((c) => c.id));
checkUniqueIds("review", reviews.map((r) => r.id));
checkUniqueSlugs("review", reviews.map((r) => r.slug));
checkUniqueIds("bestGuide", bestGuides.map((g) => g.id));
checkUniqueSlugs("bestGuide", bestGuides.map((g) => g.slug));
checkUniqueIds("comparison", comparisons.map((c) => c.id));
checkUniqueSlugs("comparison", comparisons.map((c) => c.slug));
checkUniqueIds("buyingGuide", buyingGuides.map((g) => g.id));
checkUniqueSlugs("buyingGuide", buyingGuides.map((g) => g.slug));
checkUniqueIds("setup", gearSetups.map((s) => s.id));
checkUniqueSlugs("setup", gearSetups.map((s) => s.slug));
checkUniqueIds("tool", tools.map((t) => t.id));
checkUniqueSlugs("tool", tools.map((t) => t.slug));

// ── Reference pools ────────────────────────────────────────────
const sportIds = new Set(sports.map((s) => s.id));
const disciplineIds = new Set(disciplines.map((d) => d.id));
const categoryIds = new Set(categories.map((c) => c.id));
const subcategoryIds = new Set(subcategories.map((s) => s.id));
const useCaseIds = new Set(useCases.map((u) => u.id));
const brandIds = new Set(brands.map((b) => b.id));
const familyIds = new Set(productFamilies.map((f) => f.id));
const productIds = new Set(products.map((p) => p.id));
const retailerIds = new Set(retailers.map((r) => r.id));
const evidenceIds = new Set(evidence.map((e) => e.id));
const offerIds = new Set(offers.map((o) => o.id));
const reviewIds = new Set(reviews.map((r) => r.id));
const authorIds = new Set(authors.map((a) => a.id));
const comparisonIds = new Set(comparisons.map((c) => c.id));
const bestGuideIds = new Set(bestGuides.map((g) => g.id));
const buyingGuideIds = new Set(buyingGuides.map((g) => g.id));
const faqIds = new Set(faqs.map((f) => f.id));
const recommendationIds = new Set(recommendations.map((r) => r.id));

for (const d of disciplines) {
  assertRef(`Discipline ${d.id} sportId`, d.sportId, sportIds);
}

for (const c of categories) {
  for (const sid of c.sportIds) {
    assertRef(`Category ${c.id} sportId`, sid, sportIds);
  }
}

for (const s of subcategories) {
  assertRef(`Subcategory ${s.id} categoryId`, s.categoryId, categoryIds);
}

for (const u of useCases) {
  if (u.sportId) assertRef(`UseCase ${u.id} sportId`, u.sportId, sportIds);
}

for (const def of allSpecificationDefinitions) {
  assertRef(`SpecDef ${def.id} categoryId`, def.categoryId, categoryIds);
}

for (const f of productFamilies) {
  assertRef(`Family ${f.id} brandId`, f.brandId, brandIds);
  assertRef(`Family ${f.id} categoryId`, f.categoryId, categoryIds);
  for (const pid of f.productIds) {
    assertRef(`Family ${f.id} productId`, pid, productIds);
  }
}

for (const p of products) {
  assertRef(`Product ${p.id} brandId`, p.brandId, brandIds);
  assertRef(`Product ${p.id} categoryId`, p.categoryId, categoryIds);
  if (p.familyId) assertRef(`Product ${p.id} familyId`, p.familyId, familyIds);
  for (const sid of p.sportIds) assertRef(`Product ${p.id} sportId`, sid, sportIds);
  for (const did of p.disciplineIds) assertRef(`Product ${p.id} disciplineId`, did, disciplineIds);
  for (const sid of p.subcategoryIds) {
    assertRef(`Product ${p.id} subcategoryId`, sid, subcategoryIds);
    const sub = subcategories.find((s) => s.id === sid);
    if (sub && sub.categoryId !== p.categoryId) {
      error(
        `Product ${p.id}: subcategory ${sid} belongs to ${sub.categoryId}, not product category ${p.categoryId}`,
      );
    }
  }
  for (const uid of p.useCaseIds) assertRef(`Product ${p.id} useCaseId`, uid, useCaseIds);
  for (const oid of p.offerIds) assertRef(`Product ${p.id} offerId`, oid, offerIds);
  for (const eid of p.evidenceIds) assertRef(`Product ${p.id} evidenceId`, eid, evidenceIds);
  for (const rid of p.relatedProductIds) assertRef(`Product ${p.id} relatedProductId`, rid, productIds);
  for (const aid of p.alternativeProductIds) assertRef(`Product ${p.id} alternativeProductId`, aid, productIds);
  if (p.reviewId) assertRef(`Product ${p.id} reviewId`, p.reviewId, reviewIds);

  if (!isValidDate(p.publishedAt)) error(`Product ${p.id}: invalid publishedAt`);
  if (!isValidDate(p.createdAt)) error(`Product ${p.id}: invalid createdAt`);
  if (p.status === "published" && !p.publishedAt) {
    error(`Product ${p.id}: published status requires publishedAt`);
  }
  if (p.status === "scheduled" && !p.scheduledFor) {
    warn(`Product ${p.id}: scheduled without scheduledFor`);
  }

  // Specification key / type / enum validation against category schema
  const defs = allSpecificationDefinitions.filter(
    (d) => d.categoryId === p.categoryId,
  );
  const defByKey = new Map(defs.map((d) => [d.key, d]));
  for (const [key, value] of Object.entries(p.specifications)) {
    const def = defByKey.get(key);
    if (!def) {
      error(`Product ${p.id}: undefined specification "${key}" for category ${p.categoryId}`);
      continue;
    }
    if (value === null) continue;
    if (def.type === "boolean" && typeof value !== "boolean") {
      error(`Product ${p.id}: spec "${key}" expected boolean`);
    }
    if (
      (def.type === "number" || def.type === "measurement") &&
      typeof value !== "number"
    ) {
      error(`Product ${p.id}: spec "${key}" expected number`);
    }
    if (def.type === "enum" && typeof value === "string" && def.enumValues) {
      if (!def.enumValues.includes(value)) {
        error(
          `Product ${p.id}: spec "${key}" value "${value}" not in enum [${def.enumValues.join(", ")}]`,
        );
      }
    }
    if (def.type === "multi-enum") {
      if (!Array.isArray(value)) {
        error(`Product ${p.id}: spec "${key}" expected multi-enum array`);
      } else if (def.enumValues) {
        for (const item of value) {
          if (typeof item === "string" && !def.enumValues.includes(item)) {
            error(
              `Product ${p.id}: spec "${key}" value "${item}" not in enum [${def.enumValues.join(", ")}]`,
            );
          }
        }
      }
    }
    if (def.type === "range") {
      if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
      ) {
        error(`Product ${p.id}: spec "${key}" expected range object`);
      }
    }
  }
}

// Spec definition integrity
for (const def of allSpecificationDefinitions) {
  assertRef(`SpecDef ${def.id} categoryId`, def.categoryId, categoryIds);
  if (
    (def.type === "enum" || def.type === "multi-enum") &&
    (!def.enumValues || def.enumValues.length === 0)
  ) {
    error(`SpecDef ${def.id}: ${def.type} requires enumValues`);
  }
  if (def.filterable && def.type === "string" && !def.enumValues) {
    warn(
      `SpecDef ${def.id}: filterable string without enumValues may produce weak facets`,
    );
  }
}

for (const sub of subcategories) {
  assertRef(`Subcategory ${sub.id} categoryId`, sub.categoryId, categoryIds);
}

const validLifecycle = new Set([
  "upcoming",
  "current",
  "previous-generation",
  "discontinued",
]);

for (const p of products) {
  if (!validLifecycle.has(p.lifecycleStatus)) {
    error(`Product ${p.id}: invalid lifecycleStatus "${p.lifecycleStatus}"`);
  }
  if (p.familyId) {
    const family = productFamilies.find((f) => f.id === p.familyId);
    if (family && family.brandId !== p.brandId) {
      error(
        `Product ${p.id}: family ${p.familyId} brand ${family.brandId} != product brand ${p.brandId}`,
      );
    }
  }
}

for (const f of productFamilies) {
  assertRef(`Family ${f.id} brandId`, f.brandId, brandIds);
  for (const pid of f.productIds) {
    const product = products.find((p) => p.id === pid);
    if (product && product.brandId !== f.brandId) {
      error(`Family ${f.id}: product ${pid} has mismatched brand`);
    }
  }
}

for (const r of recommendations) {
  assertRef(`Recommendation ${r.id} productId`, r.productId, productIds);
  assertRef(`Recommendation ${r.id} sportId`, r.sportId, sportIds);
  if (r.useCaseId) {
    assertRef(`Recommendation ${r.id} useCaseId`, r.useCaseId, useCaseIds);
  }
  for (const eid of r.evidenceIds) {
    assertRef(`Recommendation ${r.id} evidenceId`, eid, evidenceIds);
  }
}

for (const a of alternatives) {
  assertRef(`Alternative ${a.id} source`, a.sourceProductId, productIds);
  assertRef(`Alternative ${a.id} alt`, a.alternativeProductId, productIds);
  if (a.sourceProductId === a.alternativeProductId) {
    error(`Alternative ${a.id}: source and alternative are the same product`);
  }
}

for (const c of comparisons) {
  if (c.productIds.length !== new Set(c.productIds).size) {
    error(`Comparison ${c.id}: duplicate product references`);
  }
  if (c.productIds.length < 2) {
    error(`Comparison ${c.id}: needs at least 2 products`);
  }
}

for (const o of offers) {
  if (!o.currency || o.currency.length !== 3) {
    error(`Offer ${o.id}: currency must be ISO-like 3-letter code`);
  }
  if (typeof o.price !== "number" || o.price < 0) {
    error(`Offer ${o.id}: invalid price`);
  }
}

// Personal-test language gate: products must not claim personal testing
// without personal-test evidence linked
for (const p of products) {
  const claimText = `${p.shortDescription} ${p.verdict ?? ""}`.toLowerCase();
  const impliesTest =
    claimText.includes("we tested") ||
    claimText.includes("after 100 km") ||
    claimText.includes("our testing");
  if (impliesTest) {
    const hasPersonal = p.evidenceIds.some((id) => {
      const ev = evidence.find((e) => e.id === id);
      return ev?.type === "personal-test";
    });
    if (!hasPersonal) {
      error(
        `Product ${p.id}: personal-test claim without personal-test Evidence`,
      );
    }
  }
}

// Orphan products (no category) already covered; warn if no offers when published
for (const p of products) {
  if (p.status === "published" && p.offerIds.length === 0) {
    warn(`Product ${p.id}: published with no offers`);
  }
}

for (const o of offers) {
  assertRef(`Offer ${o.id} productId`, o.productId, productIds);
  assertRef(`Offer ${o.id} retailerId`, o.retailerId, retailerIds);
  if (!isValidDate(o.lastChecked)) error(`Offer ${o.id}: invalid lastChecked`);
}

for (const r of recommendations) {
  assertRef(`Recommendation ${r.id} productId`, r.productId, productIds);
  assertRef(`Recommendation ${r.id} sportId`, r.sportId, sportIds);
  if (r.useCaseId) assertRef(`Recommendation ${r.id} useCaseId`, r.useCaseId, useCaseIds);
  for (const eid of r.evidenceIds) assertRef(`Recommendation ${r.id} evidenceId`, eid, evidenceIds);
}

for (const a of alternatives) {
  assertRef(`Alternative ${a.id} source`, a.sourceProductId, productIds);
  assertRef(`Alternative ${a.id} alt`, a.alternativeProductId, productIds);
}

for (const r of reviews) {
  assertRef(`Review ${r.id} productId`, r.productId, productIds);
  if (!r.evidenceIds || r.evidenceIds.length === 0) {
    error(`Review ${r.id}: missing Evidence (at least one required)`);
  }
  for (const eid of r.evidenceIds ?? []) {
    assertRef(`Review ${r.id} evidenceId`, eid, evidenceIds);
  }
  for (const fid of r.faqIds) assertRef(`Review ${r.id} faqId`, fid, faqIds);
  for (const aid of r.alternativeProductIds) assertRef(`Review ${r.id} alt`, aid, productIds);
  for (const cid of r.comparisonIds ?? []) {
    assertRef(`Review ${r.id} comparisonId`, cid, comparisonIds);
  }
  if (r.reviewerId) assertRef(`Review ${r.id} reviewerId`, r.reviewerId, authorIds);
  if (r.status === "published" && !r.publishedAt) {
    error(`Review ${r.id}: published status requires publishedAt`);
  }
  if (r.score < 0 || r.score > 100) {
    error(`Review ${r.id}: score outside 0–100`);
  }

  const reviewEvidence = (r.evidenceIds ?? [])
    .map((id) => evidence.find((e) => e.id === id))
    .filter(Boolean);
  const hasPersonal = reviewEvidence.some((e) => e!.type === "personal-test");
  const otherEvidence = reviewEvidence.filter((e) => e!.type !== "personal-test");

  if (r.reviewType === "first-hand-test" && !hasPersonal) {
    error(`Review ${r.id}: first-hand-test requires personal-test Evidence`);
  }
  if (r.reviewType === "hybrid") {
    if (!hasPersonal) {
      error(`Review ${r.id}: hybrid requires personal-test Evidence`);
    }
    if (otherEvidence.length === 0) {
      error(`Review ${r.id}: hybrid requires at least one non-personal Evidence`);
    }
  }
  if (r.reviewType === "expert-research" && hasPersonal) {
    error(
      `Review ${r.id}: expert-research must not claim personal-test Evidence as primary method (move to hybrid)`,
    );
  }

  // Research reviews must not use personal-test language in prose
  if (r.reviewType === "expert-research") {
    const prose = `${r.summary} ${r.verdict} ${r.testingContext ?? ""} ${r.sections.map((s) => s.body).join(" ")}`.toLowerCase();
    const impliesTest =
      prose.includes("we tested") ||
      prose.includes("after 100 km") ||
      prose.includes("our testing") ||
      prose.includes("our testers");
    if (impliesTest) {
      error(
        `Review ${r.id}: expert-research contains personal-test claim language without personal-test Evidence`,
      );
    }
  }

  // Score breakdown keys should exist for product category when criteria defined
  const product = products.find((p) => p.id === r.productId);
  if (product) {
    const criteriaKeys = new Set(
      reviewCriteriaDefinitions
        .filter((c) => c.categoryId === product.categoryId)
        .map((c) => c.key),
    );
    if (criteriaKeys.size > 0) {
      for (const item of r.scoreBreakdown) {
        if (!criteriaKeys.has(item.key)) {
          warn(
            `Review ${r.id}: scoreBreakdown key "${item.key}" not in category criteria`,
          );
        }
        if (item.score < 0 || item.score > 100) {
          error(`Review ${r.id}: scoreBreakdown ${item.key} outside 0–100`);
        }
      }
    }
    if (
      product.recommendationScore !== undefined &&
      product.recommendationScore !== r.score
    ) {
      warn(
        `Review ${r.id}: score ${r.score} differs from Product.recommendationScore ${product.recommendationScore}`,
      );
    }
  }

  if (
    (r.reviewType === "first-hand-test" || r.reviewType === "hybrid") &&
    r.testingDetails &&
    !hasPersonal
  ) {
    error(`Review ${r.id}: testingDetails without personal-test Evidence`);
  }
}

for (const g of bestGuides) {
  assertRef(`BestGuide ${g.id} sportId`, g.sportId, sportIds);
  assertRef(`BestGuide ${g.id} categoryId`, g.categoryId, categoryIds);
  for (const uc of g.useCaseIds) {
    assertRef(`BestGuide ${g.id} useCaseId`, uc, useCaseIds);
  }
  for (const fid of g.faqIds) assertRef(`BestGuide ${g.id} faqId`, fid, faqIds);
  if (g.authorId) assertRef(`BestGuide ${g.id} authorId`, g.authorId, authorIds);
  for (const eid of g.evidenceIds ?? []) {
    assertRef(`BestGuide ${g.id} evidenceId`, eid, evidenceIds);
  }
  if (!g.rankingMode) error(`BestGuide ${g.id}: missing rankingMode`);
  if (!g.selectionCriteria || g.selectionCriteria.length === 0) {
    error(`BestGuide ${g.id}: selectionCriteria required`);
  }
  if (!g.recommendations?.length) {
    error(`BestGuide ${g.id}: at least one recommendation required`);
  }

  const ranks = new Set<number>();
  const awards = new Set<string>();
  for (const rec of g.recommendations) {
    assertRef(`BestGuide ${g.id} product`, rec.productId, productIds);
    const product = products.find((p) => p.id === rec.productId);
    if (product && product.status !== "published" && g.status === "published") {
      error(
        `BestGuide ${g.id}: recommendation references non-published Product ${rec.productId}`,
      );
    }
    if (product?.lifecycleStatus === "discontinued" && g.status === "published") {
      warn(
        `BestGuide ${g.id}: recommends discontinued Product ${rec.productId}`,
      );
    }
    if (!rec.rationale?.trim() && !rec.whyRecommended?.trim()) {
      error(`BestGuide ${g.id} rec ${rec.productId}: missing reason`);
    }
    if (ranks.has(rec.rank)) {
      error(`BestGuide ${g.id}: duplicate rank ${rec.rank}`);
    }
    ranks.add(rec.rank);
    if (rec.awardType) {
      if (awards.has(rec.awardType)) {
        error(`BestGuide ${g.id}: duplicate awardType ${rec.awardType}`);
      }
      awards.add(rec.awardType);
    }
    if (rec.recommendationId) {
      assertRef(`BestGuide ${g.id} recommendation`, rec.recommendationId, recommendationIds);
    }
    for (const eid of rec.evidenceIds ?? []) {
      assertRef(`BestGuide ${g.id} rec evidence`, eid, evidenceIds);
    }
    if (g.status === "published" && (!rec.evidenceIds || rec.evidenceIds.length === 0) && !rec.recommendationId) {
      warn(
        `BestGuide ${g.id} rec ${rec.productId}: no evidenceIds or recommendationId`,
      );
    }
    for (const uc of rec.useCaseIds ?? []) {
      assertRef(`BestGuide ${g.id} rec useCase`, uc, useCaseIds);
    }
    for (const pid of rec.considerInsteadProductIds ?? []) {
      assertRef(`BestGuide ${g.id} considerInstead`, pid, productIds);
    }
  }
  for (const pid of g.comparisonProductIds) {
    assertRef(`BestGuide ${g.id} comparisonProduct`, pid, productIds);
  }
  for (const note of g.consideredProducts ?? []) {
    assertRef(`BestGuide ${g.id} considered`, note.productId, productIds);
  }
  for (const rid of g.relatedGuideIds ?? []) {
    if (!bestGuideIds.has(rid)) error(`BestGuide ${g.id}: relatedGuide ${rid} missing`);
  }
  for (const bid of g.relatedBuyingGuideIds ?? []) {
    if (!buyingGuideIds.has(bid)) {
      error(`BestGuide ${g.id}: relatedBuyingGuide ${bid} missing`);
    }
  }
  for (const s of g.useCaseShortcuts ?? []) {
    assertRef(`BestGuide ${g.id} shortcut useCase`, s.useCaseId, useCaseIds);
  }
  if (g.status === "published" && !g.publishedAt) {
    error(`BestGuide ${g.id}: published status requires publishedAt`);
  }
  if (g.status === "scheduled" && !g.scheduledFor && !g.publishedAt) {
    error(`BestGuide ${g.id}: scheduled guide malformed publishedAt/scheduledFor`);
  }
}

for (const c of comparisons) {
  for (const pid of c.productIds) assertRef(`Comparison ${c.id} product`, pid, productIds);
  if (c.productIds.length !== new Set(c.productIds).size) {
    error(`Comparison ${c.id}: duplicate product references`);
  }
  if (c.winnerProductId) {
    assertRef(`Comparison ${c.id} winner`, c.winnerProductId, productIds);
    if (!c.productIds.includes(c.winnerProductId)) {
      error(`Comparison ${c.id}: winnerProductId not in comparison productIds`);
    }
  }
  if (c.categoryId) assertRef(`Comparison ${c.id} categoryId`, c.categoryId, categoryIds);

  const categorySet = new Set<string>();
  for (const pid of c.productIds) {
    const p = products.find((x) => x.id === pid);
    if (p) categorySet.add(p.categoryId);
  }
  if (categorySet.size > 1) {
    error(`Comparison ${c.id}: products from incompatible categories`);
  }
  if (c.categoryId && categorySet.size === 1 && !categorySet.has(c.categoryId)) {
    error(`Comparison ${c.id}: categoryId does not match product categories`);
  }

  for (const pick of c.recommendationsByUseCase) {
    assertRef(`Comparison ${c.id} useCase`, pick.useCaseId, useCaseIds);
    if (!c.productIds.includes(pick.productId)) {
      error(`Comparison ${c.id}: use-case pick product not in comparison`);
    }
  }

  for (const reason of c.chooseProductReasons ?? []) {
    if (!c.productIds.includes(reason.productId)) {
      error(`Comparison ${c.id}: choose reason product not in comparison`);
    }
    for (const eid of reason.evidenceIds ?? []) {
      assertRef(`Comparison ${c.id} choose evidence`, eid, evidenceIds);
    }
  }

  for (const eid of c.evidenceIds ?? []) {
    assertRef(`Comparison ${c.id} evidence`, eid, evidenceIds);
  }
  for (const fid of c.faqIds) {
    assertRef(`Comparison ${c.id} faq`, fid, faqIds);
  }

  if (c.isGenerationComparison) {
    const families = c.productIds
      .map((id) => products.find((p) => p.id === id)?.familyId)
      .filter(Boolean);
    if (new Set(families).size > 1) {
      error(`Comparison ${c.id}: generation comparison spans unrelated families`);
    }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)) {
    error(`Comparison ${c.id}: invalid slug`);
  }
}

// Duplicate canonical product pairs (same set of products)
{
  const pairMap = new Map<string, string>();
  for (const c of comparisons) {
    const key = [...c.productIds].sort().join("|");
    const existing = pairMap.get(key);
    if (existing) {
      error(
        `Comparison ${c.id}: duplicate product pair with ${existing} (canonical pair must be unique)`,
      );
    } else {
      pairMap.set(key, c.id);
    }
  }
}

for (const g of buyingGuides) {
  assertRef(`BuyingGuide ${g.id} sportId`, g.sportId, sportIds);
  if (g.categoryId) assertRef(`BuyingGuide ${g.id} categoryId`, g.categoryId, categoryIds);
  for (const pid of g.relatedProductIds) assertRef(`BuyingGuide ${g.id} product`, pid, productIds);
  for (const uc of g.relatedUseCaseIds) assertRef(`BuyingGuide ${g.id} useCase`, uc, useCaseIds);
  for (const fid of g.faqIds) assertRef(`BuyingGuide ${g.id} faqId`, fid, faqIds);
  for (const bid of g.relatedBestGuideIds ?? []) {
    if (!bestGuideIds.has(bid)) {
      error(`BuyingGuide ${g.id}: relatedBestGuide ${bid} missing`);
    }
  }
}

for (const s of gearSetups) {
  assertRef(`Setup ${s.id} sportId`, s.sportId, sportIds);
  for (const item of s.items) assertRef(`Setup ${s.id} item`, item.productId, productIds);
}

for (const t of tools) {
  for (const sid of t.sportIds) assertRef(`Tool ${t.id} sportId`, sid, sportIds);
  for (const cid of t.categoryIds) assertRef(`Tool ${t.id} categoryId`, cid, categoryIds);
}

// ── Finder definitions ─────────────────────────────────────────
{
  const finderDefs = getAllFinderDefinitions();
  const toolById = new Map(tools.map((t) => [t.id, t]));
  const toolSlugs = new Set(tools.map((t) => t.slug));

  for (const def of finderDefs) {
    if (!categoryIds.has(def.categoryId)) {
      error(`Finder ${def.id}: categoryId ${def.categoryId} missing`);
    }
    if (!sportIds.has(def.sportId)) {
      error(`Finder ${def.id}: sportId ${def.sportId} missing`);
    }
    const tool = toolById.get(def.toolId);
    if (!tool) {
      error(`Finder ${def.id}: toolId ${def.toolId} missing`);
    } else if (tool.slug !== def.slug) {
      error(
        `Finder ${def.id}: slug ${def.slug} does not match Tool slug ${tool.slug}`,
      );
    }

    const qIds = new Set<string>();
    const qKeys = new Set<string>();
    for (const q of def.questions) {
      if (qIds.has(q.id)) error(`Finder ${def.id}: duplicate question id ${q.id}`);
      qIds.add(q.id);
      if (qKeys.has(q.key)) error(`Finder ${def.id}: duplicate question key ${q.key}`);
      qKeys.add(q.key);

      const optIds = new Set<string>();
      for (const opt of q.options ?? []) {
        if (optIds.has(opt.id)) {
          error(`Finder ${def.id} question ${q.id}: duplicate option id ${opt.id}`);
        }
        optIds.add(opt.id);
      }
    }

    // Budget question options filled at runtime — allow empty in base config
    if (!qKeys.has(def.budgetKey)) {
      error(`Finder ${def.id}: budgetKey ${def.budgetKey} not in questions`);
    }
    if (!qKeys.has(def.priorityKey)) {
      error(`Finder ${def.id}: priorityKey ${def.priorityKey} not in questions`);
    }

    for (const [factor, weight] of Object.entries(def.scoringProfile.baseWeights)) {
      if (typeof weight !== "number" || Number.isNaN(weight)) {
        error(`Finder ${def.id}: invalid weight for ${factor}`);
      }
      if (weight < 0) {
        error(`Finder ${def.id}: negative weight for ${factor}`);
      }
    }

    for (const [priority, mults] of Object.entries(
      def.scoringProfile.priorityMultipliers,
    )) {
      for (const factor of Object.keys(mults)) {
        if (!(factor in def.scoringProfile.baseWeights)) {
          error(
            `Finder ${def.id}: priority "${priority}" maps unknown factor "${factor}"`,
          );
        }
      }
    }

    const rc = def.resultConfig;
    if (rc.minMatchForDisplay < 0 || rc.minMatchForDisplay > 100) {
      error(`Finder ${def.id}: invalid minMatchForDisplay`);
    }
    if (
      rc.minCoverageForTopRecommendation < 0 ||
      rc.minCoverageForTopRecommendation > 1
    ) {
      error(`Finder ${def.id}: invalid minCoverageForTopRecommendation`);
    }
    if (rc.maxResults < 1) {
      error(`Finder ${def.id}: maxResults must be >= 1`);
    }

    if (def.regionalBudgets.length === 0) {
      error(`Finder ${def.id}: regionalBudgets empty`);
    }
  }

  // Available finder tools should have a FinderDefinition
  for (const t of tools) {
    if (t.type === "finder" && t.available) {
      if (!finderDefs.some((d) => d.slug === t.slug)) {
        error(`Tool ${t.id}: available finder missing FinderDefinition`);
      }
    }
  }

  // Silence unused if toolSlugs needed later
  void toolSlugs;
}

// ── Calculator definitions ─────────────────────────────────────
{
  const calcDefs = getAllCalculatorDefinitions();
  const calcSlugs = new Set<string>();
  const toolById = new Map(tools.map((t) => [t.id, t]));

  for (const def of calcDefs) {
    if (calcSlugs.has(def.slug)) {
      error(`Calculator duplicate slug ${def.slug}`);
    }
    calcSlugs.add(def.slug);

    const tool = toolById.get(def.toolId);
    if (!tool) {
      error(`Calculator ${def.id}: toolId ${def.toolId} missing`);
    } else {
      if (tool.slug !== def.slug) {
        error(
          `Calculator ${def.id}: slug ${def.slug} does not match Tool slug ${tool.slug}`,
        );
      }
      if (tool.type !== "calculator") {
        error(`Calculator ${def.id}: Tool type is ${tool.type}, expected calculator`);
      }
    }

    for (const slug of def.relatedToolSlugs) {
      if (!tools.some((t) => t.slug === slug)) {
        error(`Calculator ${def.id}: related tool ${slug} missing`);
      }
    }
  }

  for (const t of tools) {
    if (t.type === "calculator" && t.available) {
      if (!calcDefs.some((d) => d.slug === t.slug)) {
        error(`Tool ${t.id}: available calculator missing CalculatorDefinition`);
      }
    }
  }
}

// ── Shoe rotation roles ────────────────────────────────────────
{
  const ucIds = new Set(useCases.map((u) => u.id));
  for (const role of ROTATION_ROLES) {
    for (const uc of role.useCaseIds) {
      if (!ucIds.has(uc)) {
        error(`Rotation role ${role.id}: unknown UseCase ${uc}`);
      }
    }
    for (const rel of role.relatedRoleIds) {
      if (!ROTATION_ROLES.some((r) => r.id === rel)) {
        error(`Rotation role ${role.id}: unknown related role ${rel}`);
      }
    }
  }
  const rotationTool = tools.find((t) => t.slug === "shoe-rotation-planner");
  if (rotationTool?.available && rotationTool.type !== "planner") {
    error(`Tool shoe-rotation-planner must be type planner`);
  }
}

// Family ↔ product consistency
for (const f of productFamilies) {
  for (const pid of f.productIds) {
    const product = products.find((p) => p.id === pid);
    if (product && product.familyId && product.familyId !== f.id) {
      error(`Family ${f.id} lists ${pid} but product.familyId is ${product.familyId}`);
    }
  }
}

// Compare Builder category configs — keySpecificationKeys should exist on SpecDefs
{
  for (const cfg of [
    runningShoesComparisonConfig,
    gpsWatchComparisonConfig,
    padelRacketComparisonConfig,
  ]) {
    const defs = allSpecificationDefinitions.filter(
      (d) => d.categoryId === cfg.categoryId,
    );
    const keys = new Set(defs.map((d) => d.key));
    for (const key of cfg.keySpecificationKeys) {
      if (!keys.has(key)) {
        warn(
          `ComparisonConfig ${cfg.categoryId}: keySpecificationKey "${key}" missing SpecDef`,
        );
      }
    }
  }
}

// Media references — empty src check when images present
for (const p of products) {
  for (const img of p.images) {
    if (!img.src) error(`Product ${p.id}: image missing src`);
  }
}

// Product relationship graph (Prompt 15)
{
  const productIds = new Set(products.map((p) => p.id));
  const evidenceIds = new Set(evidence.map((e) => e.id));
  const relKeys = new Set<string>();
  for (const r of productRelationships) {
    if (r.sourceProductId === r.targetProductId) {
      error(`Relationship ${r.id}: source equals target`);
    }
    if (!productIds.has(r.sourceProductId)) {
      error(`Relationship ${r.id}: unknown source ${r.sourceProductId}`);
    }
    if (!productIds.has(r.targetProductId)) {
      error(`Relationship ${r.id}: unknown target ${r.targetProductId}`);
    }
    const key = `${r.sourceProductId}|${r.targetProductId}|${r.type}`;
    if (relKeys.has(key)) {
      error(`Relationship duplicate pair+type: ${key}`);
    }
    relKeys.add(key);
    if (!r.reasons?.length) {
      warn(`Relationship ${r.id}: missing reasons`);
    }
    for (const eid of r.evidenceIds ?? []) {
      if (!evidenceIds.has(eid)) {
        warn(`Relationship ${r.id}: unknown evidence ${eid}`);
      }
    }
  }
  const contradictions = detectRelationshipContradictions(
    productRelationships.filter((r) => r.status === "approved"),
  );
  for (const c of contradictions) {
    error(`Relationship contradiction: ${c}`);
  }
  console.log(`Relationships:  ${productRelationships.length}`);
}

// ── Summary ────────────────────────────────────────────────────
const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warn");

console.log("\nKitletics content validation\n" + "─".repeat(40));
console.log(`Sports:          ${sports.length}`);
console.log(`Disciplines:     ${disciplines.length}`);
console.log(`Categories:      ${categories.length}`);
console.log(`Subcategories:   ${subcategories.length}`);
console.log(`Use cases:       ${useCases.length}`);
console.log(`Spec defs:       ${allSpecificationDefinitions.length}`);
console.log(`Brands:          ${brands.length}`);
console.log(`Families:        ${productFamilies.length}`);
console.log(`Products:        ${products.length}`);
console.log(`Offers:          ${offers.length}`);
console.log(`Authors:         ${authors.length}`);
console.log(`Reviews:         ${reviews.length}`);
console.log(`Best guides:     ${bestGuides.length}`);
console.log(`Comparisons:     ${comparisons.length}`);
console.log(`Tools:           ${tools.length}`);
console.log("─".repeat(40));

for (const issue of issues) {
  const tag = issue.level === "error" ? "ERROR" : "WARN ";
  console.log(`${tag}  ${issue.message}`);
}

console.log("─".repeat(40));
console.log(`${errors.length} error(s), ${warnings.length} warning(s)\n`);

if (errors.length > 0) {
  process.exit(1);
}
