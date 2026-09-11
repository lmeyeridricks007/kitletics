import type {
  FreshnessSummary,
  FreshnessStatus,
  MaintenanceJobResult,
  MaintenanceJobType,
  MaintenanceRunScope,
  MaintenanceEvent,
  MaintenanceTask,
  MaintenanceChange,
  MaintenanceSchedule,
} from "@/domain/freshness/types";
import { FRESHNESS_AGENT_VERSION } from "@/domain/freshness/types";
import { evaluateFreshness } from "@/domain/freshness/evaluation";
import {
  buildDependencyIndex,
  type DependencyCatalog,
} from "@/domain/freshness/impact";
import { queueCounts, upsertEvent, upsertTask } from "@/domain/freshness/tasks";
import {
  acquireLock,
  releaseLock,
  saveEvents,
  saveJob,
  saveReportMarkdown,
  saveTasks,
  loadTasks,
  loadEvents,
} from "@/domain/freshness/storage";
import {
  monitorBrandCatalog,
  applyNewGenerationGuideImpact,
} from "@/domain/freshness/monitoring/brand";
import {
  scanStaleProducts,
  scanStaleOffers,
  scanBrokenMedia,
  scanEvidenceHealth,
  scanGuidesDueForReview,
  processSpecChange,
  processSourceConflict,
  assertRecommendationIndependence,
} from "@/domain/freshness/monitoring/scans";
import {
  scanContentFreshness,
  scanSuperlativeClaims,
  type ContentScanTarget,
} from "@/domain/freshness/monitoring/content";
import {
  scanReviewMaintenance,
  scanGenerationReviewMaintenance,
  queueReviewTaskFromSpecChange,
  buildPriorityIndex,
} from "@/domain/freshness/monitoring/reviews";
import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import type { DiscoveryCandidate } from "@/domain/onboarding/types";
import { randomUUID } from "node:crypto";

export interface MaintenanceCatalog extends DependencyCatalog {
  brands: Brand[];
  families: ProductFamily[];
  evidence: Evidence[];
}

export interface RunMaintenanceInput {
  jobType: MaintenanceJobType;
  scope?: MaintenanceRunScope;
  dryRun?: boolean;
  now?: Date;
  brandLineups?: Record<string, DiscoveryCandidate[]>;
  brokenMediaSrcs?: string[];
  unavailableEvidenceUrls?: string[];
  contentTargets?: ContentScanTarget[];
  specChanges?: Array<{
    productId: string;
    field: string;
    reportedValue: unknown;
    source?: string;
  }>;
  sourceConflicts?: Array<{
    productId: string;
    field: string;
    values: unknown[];
  }>;
  recommendationRankings?: { before: string[]; after: string[] };
}

function emptySummary(): FreshnessSummary {
  const z = (): Record<FreshnessStatus, number> => ({
    fresh: 0,
    "review-soon": 0,
    stale: 0,
    unknown: 0,
    conflicting: 0,
  });
  return {
    products: z(),
    guides: { current: 0, reviewRequired: 0 },
    comparisons: { current: 0, reviewRequired: 0 },
    offers: { fresh: 0, stale: 0 },
    media: { broken: 0 },
    recommendations: { fresh: 0, stale: 0 },
    evidence: { fresh: 0, stale: 0 },
    newProductCandidates: 0,
    openTasks: { P0: 0, P1: 0, P2: 0, P3: 0 },
  };
}

function filterProducts(
  products: Product[],
  scope?: MaintenanceRunScope,
): Product[] {
  let list = products.filter((p) => p.status === "published");
  if (scope?.sport) {
    list = list.filter((p) =>
      p.sportIds.some((s) => s.includes(scope.sport!)),
    );
  }
  if (scope?.category) {
    list = list.filter(
      (p) =>
        p.categoryId.includes(scope.category!) ||
        p.categoryId === `cat-${scope.category}`,
    );
  }
  if (scope?.brand) {
    const b = scope.brand.toLowerCase();
    list = list.filter((p) => p.brandId.toLowerCase().includes(b));
  }
  if (scope?.product) {
    list = list.filter(
      (p) => p.id === scope.product || p.slug === scope.product,
    );
  }
  if (scope?.limit) list = list.slice(0, scope.limit);
  return list;
}

function merge(
  into: { events: MaintenanceEvent[]; tasks: MaintenanceTask[] },
  from: { events: MaintenanceEvent[]; tasks: MaintenanceTask[] },
): void {
  for (const e of from.events) into.events = upsertEvent(into.events, e);
  for (const t of from.tasks) into.tasks = upsertTask(into.tasks, t);
}

/**
 * CatalogMaintenanceAgent — coordinates freshness monitors.
 * Detects and queues; does not silently rewrite editorial recommendations
 * or auto-publish Products.
 */
export function runMaintenance(
  catalog: MaintenanceCatalog,
  input: RunMaintenanceInput,
): MaintenanceJobResult {
  const startedAt = new Date().toISOString();
  const now = input.now ?? new Date();
  const dryRun = Boolean(input.dryRun);
  const jobId = `mjob-${randomUUID().slice(0, 8)}`;
  const scope = input.scope ?? {};
  const logs: string[] = [];
  const changes: MaintenanceChange[] = [];

  const lockId = `maintenance:${input.jobType}:${scope.sport ?? "all"}`;
  if (!acquireLock(lockId, dryRun)) {
    throw new Error(`Maintenance lock held: ${lockId}`);
  }

  try {
    logs.push(
      `Starting ${input.jobType} (agent ${FRESHNESS_AGENT_VERSION}) dryRun=${dryRun}`,
    );

    let events: MaintenanceEvent[] = dryRun ? [] : loadEvents();
    let tasks: MaintenanceTask[] = dryRun ? [] : loadTasks();
    const bag = { events, tasks };

    const products = filterProducts(catalog.products, scope);
    const index = buildDependencyIndex(catalog);

    const summary = emptySummary();
    for (const p of products) {
      const fr = evaluateFreshness(
        {
          entityType: "product",
          categoryId: p.categoryId,
          lastVerifiedAt: p.lastVerifiedAt,
        },
        now,
      );
      summary.products[fr.status] += 1;
    }

    const runAll = input.jobType === "full" || input.jobType === "qa";

    if (
      runAll ||
      input.jobType === "freshness-scan" ||
      input.jobType === "product-stale"
    ) {
      merge(bag, scanStaleProducts(products, now));
      logs.push(`Stale product scan: ${products.length} products`);
    }

    if (runAll || input.jobType === "brand-monitor") {
      const brandIds = [
        ...new Set(
          products
            .map((p) => p.brandId)
            .concat(
              scope.brand
                ? catalog.brands
                    .filter(
                      (b) =>
                        b.slug.includes(scope.brand!.toLowerCase()) ||
                        b.id.includes(scope.brand!.toLowerCase()),
                    )
                    .map((b) => b.id)
                : [],
            ),
        ),
      ];
      for (const brandId of brandIds.slice(0, scope.limit ?? 10)) {
        const brand = catalog.brands.find((b) => b.id === brandId);
        if (!brand) continue;
        const lineup = input.brandLineups?.[brandId] ?? [];
        if (!lineup.length) continue;
        const mon = monitorBrandCatalog({
          brand,
          sportId: scope.sport,
          knownLineup: lineup,
          products: catalog.products,
          brands: catalog.brands,
          families: catalog.families,
          dryRun,
          limit: scope.limit,
        });
        merge(bag, mon);
        summary.newProductCandidates += mon.result.newProducts.length;

        for (const np of mon.result.newProducts.filter((n) => n.generation)) {
          const family = catalog.families.find(
            (f) =>
              f.brandId === brand.id &&
              np.model.toLowerCase().includes(f.name.toLowerCase()),
          );
          if (!family) continue;
          const guideImpact = applyNewGenerationGuideImpact({
            newModel: np.model,
            previousProductIds: family.productIds,
            guides: catalog.guides,
            index,
            dryRun,
          });
          merge(bag, guideImpact);
          const previousId = family.productIds[0];
          const previous = catalog.products.find((p) => p.id === previousId);
          if (previous) {
            // Placeholder successor identity for tasking (not a published Product yet)
            const successorStub = {
              ...previous,
              id: `pending-${brand.id}-${np.model}`.toLowerCase().replace(/\s+/g, "-"),
              name: np.model,
              fullName: `${brand.name} ${np.model}`,
              generation: np.generation,
              slug: `${brand.slug}-${np.model}`.toLowerCase().replace(/\s+/g, "-"),
            };
            merge(
              bag,
              scanGenerationReviewMaintenance({
                previousProduct: previous,
                successorProduct: successorStub,
                previousReview: catalog.reviews.find(
                  (r) => r.productId === previous.id,
                ),
              }),
            );
          }
        }
        logs.push(
          `Brand monitor ${brand.name}: +${mon.result.newProducts.length} candidates`,
        );
      }
    }

    if (
      runAll ||
      input.jobType === "offers-refresh" ||
      input.jobType === "commerce-freshness"
    ) {
      let offers = catalog.offers;
      if (scope.region) {
        offers = offers.filter((o) => String(o.region) === scope.region);
      }
      if (scope.product) {
        offers = offers.filter((o) => o.productId === scope.product);
      }
      const offerScan = scanStaleOffers(offers, now);
      merge(bag, offerScan);
      summary.offers.stale = offerScan.staleIds.length;
      summary.offers.fresh = Math.max(
        0,
        offers.length - offerScan.staleIds.length,
      );
      logs.push(
        `Offers: ${summary.offers.fresh} fresh-ish, ${summary.offers.stale} stale`,
      );

      if (input.recommendationRankings) {
        const ind = assertRecommendationIndependence({
          rankingsBefore: input.recommendationRankings.before,
          rankingsAfter: input.recommendationRankings.after,
        });
        if (!ind.ok) {
          logs.push(`INDEPENDENCE FAILURE: ${ind.reason}`);
          throw new Error(ind.reason);
        }
      }
    }

    if (runAll || input.jobType === "media-check") {
      const mediaScan = scanBrokenMedia(
        products,
        new Set(input.brokenMediaSrcs ?? []),
      );
      merge(bag, mediaScan);
      summary.media.broken = mediaScan.tasks.filter(
        (t) => t.type === "media-repair",
      ).length;
    }

    if (runAll || input.jobType === "evidence-check") {
      const evScan = scanEvidenceHealth(
        catalog.evidence,
        new Set(input.unavailableEvidenceUrls ?? []),
        now,
      );
      merge(bag, evScan);
      for (const e of catalog.evidence) {
        const fr = evaluateFreshness(
          { entityType: "evidence", lastVerifiedAt: e.verifiedAt },
          now,
        );
        if (fr.status === "fresh") summary.evidence.fresh += 1;
        else summary.evidence.stale += 1;
      }
    }

    if (runAll || input.jobType === "guides-review-due") {
      const gScan = scanGuidesDueForReview(catalog.guides, now);
      merge(bag, gScan);
      for (const g of catalog.guides.filter((x) => x.status === "published")) {
        const fr = evaluateFreshness(
          { entityType: "best-guide", lastVerifiedAt: g.lastVerifiedAt },
          now,
        );
        if (fr.status === "fresh") summary.guides.current += 1;
        else summary.guides.reviewRequired += 1;
      }
    }

    if (runAll || input.jobType === "review-maintenance") {
      const signalsFor = buildPriorityIndex({
        bestGuideProductIds: catalog.guides.flatMap((g) =>
          g.recommendations.map((r) => r.productId),
        ),
        comparisonProductIds: catalog.comparisons.flatMap((c) => c.productIds),
        gearSetupProductIds: [],
        featuredHubProductIds: [],
        finderCandidateIds: products
          .filter((p) => (p.recommendationScore ?? 0) >= 78)
          .map((p) => p.id),
        majorFamilyProductIds: catalog.families
          .filter((f) => f.productIds.length >= 2)
          .flatMap((f) => f.productIds.slice(0, 1)),
      });
      const rScan = scanReviewMaintenance({
        products,
        reviews: catalog.reviews,
        evidence: catalog.evidence,
        prioritySignals: signalsFor,
        now,
        removedEvidenceIds: input.unavailableEvidenceUrls
          ? new Set(
              catalog.evidence
                .filter(
                  (e) =>
                    e.sourceUrl &&
                    input.unavailableEvidenceUrls!.includes(e.sourceUrl),
                )
                .map((e) => e.id),
            )
          : undefined,
      });
      merge(bag, rScan);
      logs.push(
        `Review maintenance: ${rScan.tasks.length} tasks / ${rScan.events.length} events`,
      );
    }

    if (
      runAll ||
      input.jobType === "content-freshness" ||
      input.jobType === "content-claims"
    ) {
      const targets = input.contentTargets ?? [];
      if (input.jobType !== "content-claims") {
        merge(bag, scanContentFreshness(targets, now));
      }
      if (input.jobType !== "content-freshness" || runAll) {
        merge(bag, scanSuperlativeClaims(targets));
      }
    }

    for (const sc of input.specChanges ?? []) {
      const product = catalog.products.find((p) => p.id === sc.productId);
      if (!product) continue;
      const result = processSpecChange({
        product,
        field: sc.field,
        reportedValue: sc.reportedValue,
        source: sc.source,
        index,
        dryRun,
      });
      merge(bag, result);
      const review = catalog.reviews.find((r) => r.productId === product.id);
      merge(
        bag,
        queueReviewTaskFromSpecChange({
          product,
          review,
          field: sc.field,
          nextValue: sc.reportedValue,
        }),
      );
    }

    for (const conf of input.sourceConflicts ?? []) {
      merge(bag, processSourceConflict(conf));
    }

    for (const c of catalog.comparisons.filter((x) => x.status === "published")) {
      const fr = evaluateFreshness(
        { entityType: "comparison", lastVerifiedAt: c.lastVerifiedAt },
        now,
      );
      if (fr.status === "fresh") summary.comparisons.current += 1;
      else summary.comparisons.reviewRequired += 1;
    }

    events = bag.events;
    tasks = bag.tasks;
    summary.openTasks = queueCounts(tasks);

    const materialChanges = tasks.some((t) => t.status === "open");

    const finishedAt = new Date().toISOString();
    const result: MaintenanceJobResult = {
      jobId,
      jobType: input.jobType,
      startedAt,
      finishedAt,
      dryRun,
      scope,
      entitiesChecked: products.length,
      events,
      tasks,
      changes,
      summary,
      logs,
      materialChanges,
    };

    const md = renderMaintenanceReport(result);
    if (!dryRun) {
      saveTasks(tasks);
      saveEvents(events);
      saveJob(result);
      result.reportPath = saveReportMarkdown(jobId, md);
    } else {
      result.reportPath = saveReportMarkdown(`${jobId}-dry-run`, md);
    }

    logs.push(
      materialChanges
        ? `Material changes: ${events.length} events, ${tasks.length} tasks`
        : "No material changes detected.",
    );
    result.logs = [...logs];

    return result;
  } finally {
    releaseLock(lockId, dryRun);
  }
}

export function renderMaintenanceReport(result: MaintenanceJobResult): string {
  const s = result.summary;
  const lines = [
    `# Maintenance — ${result.jobId}`,
    "",
    `**Job:** ${result.jobType}`,
    `**Dry run:** ${result.dryRun}`,
    `**Scope:** ${JSON.stringify(result.scope)}`,
    `**Entities checked:** ${result.entitiesChecked}`,
    `**Material changes:** ${result.materialChanges}`,
    "",
    "## Freshness summary",
    "",
    `Products — fresh: ${s.products.fresh}, review-soon: ${s.products["review-soon"]}, stale: ${s.products.stale}, unknown: ${s.products.unknown}`,
    `Guides — current: ${s.guides.current}, review required: ${s.guides.reviewRequired}`,
    `Comparisons — current: ${s.comparisons.current}, review required: ${s.comparisons.reviewRequired}`,
    `Offers — fresh: ${s.offers.fresh}, stale: ${s.offers.stale}`,
    `Media broken: ${s.media.broken}`,
    `New Product candidates: ${s.newProductCandidates}`,
    `Open tasks — P0: ${s.openTasks.P0}, P1: ${s.openTasks.P1}, P2: ${s.openTasks.P2}, P3: ${s.openTasks.P3}`,
    "",
    "## Tasks",
  ];

  if (!result.tasks.length) {
    lines.push("_None_");
  } else {
    for (const t of result.tasks.slice(0, 50)) {
      lines.push(
        `- [${t.priority}] ${t.type} · ${t.title} — ${t.suggestedAction}`,
      );
    }
  }

  lines.push("", "## Events");
  if (!result.events.length) {
    lines.push(
      result.materialChanges ? "_None_" : "No material changes detected.",
    );
  } else {
    for (const e of result.events.slice(0, 50)) {
      lines.push(`- ${e.type} · ${e.entityType}/${e.entityId ?? "—"}`);
    }
  }

  lines.push("", "## Logs");
  for (const l of result.logs) lines.push(`- ${l}`);
  lines.push("");
  return lines.join("\n");
}

export const DEFAULT_MAINTENANCE_SCHEDULES: MaintenanceSchedule[] = [
  {
    id: "daily-offers",
    taskType: "offers-refresh",
    scope: "commerce",
    cadence: "daily",
    enabled: true,
    priority: "P2",
    description: "Offer price/availability freshness",
  },
  {
    id: "weekly-media",
    taskType: "media-check",
    scope: "catalog",
    cadence: "weekly",
    enabled: true,
    priority: "P1",
    description: "Critical Product media health",
  },
  {
    id: "weekly-brand-tier1",
    taskType: "brand-monitor",
    scope: "tier-1-brands",
    cadence: "weekly",
    enabled: true,
    priority: "P1",
    description: "Major brand Product discovery",
  },
  {
    id: "monthly-lifecycle",
    taskType: "product-stale",
    scope: "catalog",
    cadence: "monthly",
    enabled: true,
    priority: "P2",
  },
  {
    id: "quarterly-specs",
    taskType: "freshness-scan",
    scope: "catalog",
    cadence: "quarterly",
    enabled: true,
    priority: "P2",
  },
  {
    id: "monthly-guides",
    taskType: "guides-review-due",
    scope: "editorial",
    cadence: "monthly",
    enabled: true,
    priority: "P1",
  },
  {
    id: "monthly-evidence",
    taskType: "evidence-check",
    scope: "catalog",
    cadence: "monthly",
    enabled: true,
    priority: "P2",
  },
  {
    id: "monthly-reviews",
    taskType: "review-refresh",
    scope: "editorial",
    cadence: "monthly",
    enabled: true,
    priority: "P1",
    description: "Stale / missing Product Review maintenance",
  },
  {
    id: "monthly-full-qa",
    taskType: "qa",
    scope: "running",
    cadence: "monthly",
    enabled: true,
    priority: "P1",
  },
];

export type { ContentScanTarget };
