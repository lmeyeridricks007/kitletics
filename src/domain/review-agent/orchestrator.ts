import { randomUUID } from "node:crypto";
import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type {
  ProductReviewAuditRow,
  ReviewAgentFilters,
  ReviewAgentMode,
  ReviewAgentReport,
  ReviewAgentSession,
  ReviewCoverageStatus,
  ReviewPriority,
  StagedReviewDraft,
} from "@/domain/review-agent/types";
import { PRODUCT_REVIEW_AGENT_VERSION } from "@/domain/review-agent/types";
import { classifyEvidence } from "@/domain/review-agent/evidence";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import {
  buildPriorityIndex,
  computeReviewPriority,
} from "@/domain/review-agent/priority";
import {
  stagedDraftToReviewShape,
  synthesizeExpertResearchDraft,
} from "@/domain/review-agent/synthesize";
import {
  ensureReviewStagingDirs,
  loadCheckpoint,
  loadEditorialLocks,
  saveCheckpoint,
  saveReviewAgentSession,
  writeDiffPreview,
} from "@/domain/review-agent/staging";
import { canPublishReview } from "@/lib/review/can-publish";
import { getAuthorById } from "@/repositories/editorial";

function nowIso(): string {
  return new Date().toISOString();
}

function emptyCoverage(): Record<ReviewCoverageStatus, number> {
  return {
    complete: 0,
    "needs-refresh": 0,
    "needs-research": 0,
    "needs-editorial-review": 0,
    blocked: 0,
    "not-required": 0,
  };
}

function emptyPriority(): Record<ReviewPriority, number> {
  return { P0: 0, P1: 0, P2: 0, P3: 0 };
}

export interface ReviewAgentCatalog {
  products: Product[];
  brands: Brand[];
  families: ProductFamily[];
  reviews: Review[];
  evidence: Evidence[];
  recommendations: Recommendation[];
  bestGuideProductIds: string[];
  comparisonProductIds: string[];
  gearSetupProductIds: string[];
  featuredHubProductIds: string[];
  finderCandidateIds: string[];
  /** productId → comparison entity ids */
  comparisonIdsByProductId: Map<string, string[]>;
}

function log(
  session: ReviewAgentSession,
  stage: string,
  message: string,
  level: "info" | "warn" | "error" = "info",
  productId?: string,
): void {
  session.logs.push({
    at: nowIso(),
    stage,
    level,
    message,
    productId,
  });
  session.updatedAt = nowIso();
}

function resolveProducts(
  catalog: ReviewAgentCatalog,
  filters: ReviewAgentFilters,
): Product[] {
  let list = [...catalog.products];

  if (filters.productId) {
    list = list.filter((p) => p.id === filters.productId);
  }
  if (filters.productSlug) {
    list = list.filter((p) => p.slug === filters.productSlug);
  }
  if (filters.brandId) {
    list = list.filter((p) => p.brandId === filters.brandId);
  }
  if (filters.brandSlug) {
    const brand = catalog.brands.find((b) => b.slug === filters.brandSlug);
    list = brand ? list.filter((p) => p.brandId === brand.id) : [];
  }
  if (filters.categoryId) {
    list = list.filter((p) => p.categoryId === filters.categoryId);
  }
  if (filters.categorySlug) {
    // category slug often matches trailing segment of categoryId
    list = list.filter(
      (p) =>
        p.categoryId === `cat-${filters.categorySlug}` ||
        p.categoryId.endsWith(filters.categorySlug!),
    );
  }
  if (filters.sportId) {
    list = list.filter((p) => p.sportIds.includes(filters.sportId!));
  }
  if (filters.sportSlug) {
    const sportId = `sport-${filters.sportSlug}`;
    list = list.filter((p) => p.sportIds.includes(sportId));
  }

  if (filters.limit && filters.limit > 0) {
    list = list.slice(0, filters.limit);
  }

  return list;
}

function evidenceForProduct(
  product: Product,
  catalog: ReviewAgentCatalog,
): Evidence[] {
  const ids = new Set(product.evidenceIds);
  return catalog.evidence.filter((e) => ids.has(e.id));
}

function reviewForProduct(
  product: Product,
  catalog: ReviewAgentCatalog,
): Review | undefined {
  if (product.reviewId) {
    const byId = catalog.reviews.find((r) => r.id === product.reviewId);
    if (byId) return byId;
  }
  return catalog.reviews.find((r) => r.productId === product.id);
}

function alternativesFor(product: Product): string[] {
  const fromField = product.alternativeProductIds ?? [];
  const related = product.relatedProductIds ?? [];
  return [...new Set([...fromField, ...related])].filter((id) => id !== product.id);
}

function comparisonsFor(
  productId: string,
  comparisonIndex: Map<string, string[]>,
): string[] {
  return comparisonIndex.get(productId) ?? [];
}

/**
 * ProductReviewAgent orchestrator.
 *
 * Default: stages drafts with proposedStatus=needs-review. Never auto-publishes.
 * Never upgrades review type to first-hand without personal-test evidence.
 */
export function runProductReviewAgent(input: {
  mode: ReviewAgentMode;
  filters: ReviewAgentFilters;
  dryRun?: boolean;
  batchSize?: number;
  resumeSessionId?: string;
  catalog: ReviewAgentCatalog;
}): ReviewAgentSession {
  const dryRun = Boolean(input.dryRun);
  const batchSize = input.batchSize ?? 50;
  ensureReviewStagingDirs();

  const sessionId =
    input.resumeSessionId ?? `pra-${randomUUID().slice(0, 8)}`;
  const startedAt = nowIso();

  const report: ReviewAgentReport = {
    mode: input.mode,
    dryRun,
    agentVersion: PRODUCT_REVIEW_AGENT_VERSION,
    startedAt,
    finishedAt: startedAt,
    scanned: 0,
    byCoverage: emptyCoverage(),
    byPriority: emptyPriority(),
    byReviewType: {},
    created: 0,
    refreshed: 0,
    repaired: 0,
    needsResearch: 0,
    needsEditorialReview: 0,
    blocked: 0,
    notRequired: 0,
    failures: [],
    rows: [],
    stagedReviewIds: [],
  };

  const session: ReviewAgentSession = {
    id: sessionId,
    mode: input.mode,
    dryRun,
    status: "auditing",
    filters: input.filters,
    createdAt: startedAt,
    updatedAt: startedAt,
    report,
    stagedReviews: [],
    logs: [],
  };

  log(session, "discover", `Mode=${input.mode} dryRun=${dryRun}`);

  const signalsFor = buildPriorityIndex({
    bestGuideProductIds: input.catalog.bestGuideProductIds,
    comparisonProductIds: input.catalog.comparisonProductIds,
    gearSetupProductIds: input.catalog.gearSetupProductIds,
    featuredHubProductIds: input.catalog.featuredHubProductIds,
    finderCandidateIds: input.catalog.finderCandidateIds,
    majorFamilyProductIds: input.catalog.families
      .filter((f) => f.productIds.length >= 2)
      .flatMap((f) => f.productIds.slice(0, 1)),
  });

  let products = resolveProducts(input.catalog, input.filters);
  const already = input.resumeSessionId
    ? new Set(loadCheckpoint(input.resumeSessionId))
    : new Set<string>();
  if (already.size) {
    products = products.filter((p) => !already.has(p.id));
    log(session, "resume", `Skipping ${already.size} checkpointed products`);
  }

  const locks = loadEditorialLocks();
  const processed: string[] = [...already];

  // Pre-pass audit for missing/stale filters
  const audited: ProductReviewAuditRow[] = [];

  for (const product of products) {
    try {
      const brand = input.catalog.brands.find((b) => b.id === product.brandId);
      if (!brand) {
        report.failures.push({
          productId: product.id,
          error: "Brand not found",
        });
        continue;
      }

      const review = reviewForProduct(product, input.catalog);
      const evidence = evidenceForProduct(product, input.catalog);
      const priority = computeReviewPriority(product, signalsFor(product.id));
      const readiness = computeReviewReadiness({ product, review, evidence });
      const { status: coverage, reasons } = determineCoverageStatus({
        product,
        review,
        evidence,
        priority,
        readiness,
      });

      const ev = classifyEvidence(evidence);
      const row: ProductReviewAuditRow = {
        productId: product.id,
        productSlug: product.slug,
        productName: product.fullName,
        brandId: brand.id,
        categoryId: product.categoryId,
        sportIds: product.sportIds,
        lifecycleStatus: product.lifecycleStatus,
        priority,
        coverage,
        reviewId: review?.id,
        reviewSlug: review?.slug,
        reviewType: review?.reviewType,
        reviewStatus: review?.status,
        readiness,
        evidenceCount: ev.count,
        hasManufacturerEvidence: ev.manufacturer,
        hasIndependentEvidence: ev.independent,
        hasPersonalTest: ev.personalTest,
        reasons,
      };
      audited.push(row);
    } catch (err) {
      report.failures.push({
        productId: product.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  let workset = audited;
  if (input.filters.missingOnly) {
    workset = audited.filter(
      (r) =>
        r.coverage === "needs-research" ||
        (!r.reviewId && r.coverage !== "not-required"),
    );
  }
  if (input.filters.staleOnly) {
    workset = audited.filter((r) => r.coverage === "needs-refresh");
  }
  if (input.filters.priorities?.length) {
    const allow = new Set(input.filters.priorities);
    workset = workset.filter((r) => allow.has(r.priority));
  }

  // Sort by priority then readiness
  const order: Record<ReviewPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  workset.sort(
    (a, b) =>
      order[a.priority] - order[b.priority] ||
      (a.readiness?.score ?? 0) - (b.readiness?.score ?? 0),
  );

  report.scanned = workset.length;
  for (const row of workset) {
    report.byCoverage[row.coverage] += 1;
    report.byPriority[row.priority] += 1;
    if (row.reviewType) {
      report.byReviewType[row.reviewType] =
        (report.byReviewType[row.reviewType] ?? 0) + 1;
    }
    if (row.coverage === "needs-research") report.needsResearch += 1;
    if (row.coverage === "needs-editorial-review") report.needsEditorialReview += 1;
    if (row.coverage === "blocked") report.blocked += 1;
    if (row.coverage === "not-required") report.notRequired += 1;
  }
  report.rows = workset;

  log(
    session,
    "audit",
    `Scanned ${workset.length} products (${audited.length} matched filters before missing/stale)`,
  );

  const writeModes: ReviewAgentMode[] = [
    "generate",
    "refresh",
    "repair",
    "full",
  ];
  const shouldWrite = writeModes.includes(input.mode);

  if (input.mode === "research") {
    session.status = "researching";
    log(
      session,
      "research",
      "Research mode: reuses existing Evidence only (no live web in default agent). Mark needs-research where independent sources missing.",
    );
    for (const row of workset) {
      if (!row.hasIndependentEvidence && row.coverage === "needs-research") {
        log(
          session,
          "research",
          `Needs independent evidence: ${row.productSlug}`,
          "warn",
          row.productId,
        );
      }
    }
  }

  if (shouldWrite) {
    session.status = "synthesizing";
    let batchCount = 0;

    for (const row of workset) {
      if (batchCount >= batchSize) {
        log(session, "batch", `Batch size ${batchSize} reached; checkpointing`);
        break;
      }

      if (row.coverage === "not-required") continue;
      if (row.coverage === "blocked") continue;
      if (row.coverage === "complete" && input.mode !== "refresh" && input.mode !== "full") {
        continue;
      }
      if (input.mode === "generate" && row.reviewId) continue;
      if (input.mode === "refresh" && row.coverage !== "needs-refresh") continue;
      if (input.mode === "repair") {
        const needsRepair =
          row.coverage === "needs-editorial-review" ||
          (row.reviewId && (row.readiness?.score ?? 100) < 70);
        if (!needsRepair) continue;
      }

      try {
        const product = input.catalog.products.find((p) => p.id === row.productId)!;
        const brand = input.catalog.brands.find((b) => b.id === product.brandId)!;
        const existing = reviewForProduct(product, input.catalog) ?? null;
        const evidence = evidenceForProduct(product, input.catalog);
        const recommendations = input.catalog.recommendations.filter(
          (r) => r.productId === product.id,
        );

        if (
          input.mode === "full" ||
          input.mode === "generate" ||
          input.mode === "refresh" ||
          input.mode === "repair"
        ) {
          // Cost control: skip external research; require existing evidence
          if (
            !row.hasIndependentEvidence &&
            !row.hasManufacturerEvidence &&
            evidence.length === 0
          ) {
            log(
              session,
              "blocked",
              `Insufficient evidence to synthesize: ${row.productSlug}`,
              "warn",
              product.id,
            );
            continue;
          }

          const lock = existing ? locks.get(existing.id) : undefined;
          const draft = synthesizeExpertResearchDraft({
            product,
            brand,
            evidence,
            recommendations,
            alternativeProductIds: alternativesFor(product),
            comparisonIds: comparisonsFor(
              product.id,
              input.catalog.comparisonIdsByProductId,
            ),
            existing,
            lock: lock
              ? {
                  reviewId: lock.reviewId,
                  lockedFields: lock.lockedFields,
                  note: lock.note,
                }
              : null,
          });

          if (!draft) {
            log(
              session,
              "blocked",
              `Synthesis refused (type/evidence): ${row.productSlug}`,
              "warn",
              product.id,
            );
            report.blocked += 1;
            processed.push(product.id);
            continue;
          }

          // Quality gate against draft shape (never auto-publish)
          const gate = canPublishReview({
            review: stagedDraftToReviewShape(draft),
            product,
            author: getAuthorById(draft.reviewerId),
            evidence:
              evidence.length > 0
                ? evidence
                : input.catalog.evidence.filter((e) =>
                    draft.evidenceIds.includes(e.id),
                  ),
          });

          if (!gate.ok) {
            log(
              session,
              "quality-gate",
              `Gate issues for ${row.productSlug}: ${gate.issues.map((i) => i.code).join(", ")}`,
              "warn",
              product.id,
            );
            // Still stage for editorial if generate/full — editors may complete
            draft.proposedStatus = "needs-review";
          }

          if (!dryRun) {
            session.stagedReviews.push(draft);
            report.stagedReviewIds.push(draft.id);
            writeDiffPreview(session.id, draft, existing);
          } else {
            // dry-run: record intent without write
            report.stagedReviewIds.push(draft.id);
          }

          if (!existing) report.created += 1;
          else if (input.mode === "repair") report.repaired += 1;
          else report.refreshed += 1;

          batchCount += 1;
          processed.push(product.id);
          log(
            session,
            dryRun ? "dry-run" : "stage",
            `${existing ? "Update" : "Create"} ${draft.id} → ${draft.proposedStatus}`,
            "info",
            product.id,
          );
        }
      } catch (err) {
        report.failures.push({
          productId: row.productId,
          error: err instanceof Error ? err.message : String(err),
        });
        log(
          session,
          "error",
          err instanceof Error ? err.message : String(err),
          "error",
          row.productId,
        );
        processed.push(row.productId);
      }
    }
  }

  session.status = dryRun
    ? "staged"
    : session.stagedReviews.length
      ? "needs-review"
      : report.failures.length
        ? "failed"
        : "staged";
  report.finishedAt = nowIso();
  session.report = report;
  session.updatedAt = nowIso();

  if (!dryRun) {
    saveReviewAgentSession(session);
    saveCheckpoint(session.id, processed);
  } else {
    // Still write report-only session for dry-run visibility
    const drySession = {
      ...session,
      stagedReviews: [] as StagedReviewDraft[],
    };
    saveReviewAgentSession(drySession);
  }

  log(session, "done", `Finished with status=${session.status}`);
  return session;
}
