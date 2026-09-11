/**
 * Review freshness / maintenance scans for Prompt 20.
 */
import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import type {
  MaintenanceEvent,
  MaintenanceTask,
} from "@/domain/freshness/types";
import { createEvent, createTask, upsertEvent, upsertTask } from "@/domain/freshness/tasks";
import { evaluateReviewFreshness } from "@/domain/review-agent/staleness";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import {
  computeReviewPriority,
  buildPriorityIndex,
  type PrioritySignals,
} from "@/domain/review-agent/priority";
import { assessReviewImpactFromProductChange } from "@/domain/review-agent/lifecycle";
import { classifyEvidence } from "@/domain/review-agent/evidence";

export function scanReviewMaintenance(input: {
  products: Product[];
  reviews: Review[];
  evidence: Evidence[];
  prioritySignals: (productId: string) => PrioritySignals;
  now?: Date;
  removedEvidenceIds?: Set<string>;
}): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];
  const now = input.now ?? new Date();
  const byProduct = new Map(input.reviews.map((r) => [r.productId, r]));

  for (const product of input.products) {
    if (product.status === "archived") continue;
    const review = byProduct.get(product.id);
    const evidence = input.evidence.filter((e) =>
      (review?.evidenceIds ?? product.evidenceIds).includes(e.id),
    );
    const priority = computeReviewPriority(
      product,
      input.prioritySignals(product.id),
    );
    const readiness = computeReviewReadiness({ product, review, evidence });
    const { status: coverage } = determineCoverageStatus({
      product,
      review,
      evidence,
      priority,
      readiness,
    });

    if (!review) {
      if (coverage === "not-required") continue;
      const evt = createEvent({
        type: "GUIDE_DEPENDENCY_CHANGED",
        entityType: "review",
        entityId: product.id,
        detailKey: "missing-review",
        details: { coverage, priority },
        source: "review-maintenance",
      });
      events = upsertEvent(events, evt);
      const task = createTask({
        type: "review-refresh",
        priority: priority === "P0" || priority === "P1" ? priority : "P2",
        entityType: "product",
        entityId: product.id,
        title: `Create Review: ${product.fullName}`,
        reason: `Coverage=${coverage}; no Review entity`,
        suggestedAction: `npm run reviews:agent -- --mode=full --product=${product.slug}`,
        ownership: "editorial",
        eventIds: [evt.id],
        changeClassification: "editorial-impacting",
      });
      tasks = upsertTask(tasks, task);
      continue;
    }

    // Staged / needs-review Reviews awaiting media or editorial publish
    if (review.status === "review" || review.status === "draft") {
      const evt = createEvent({
        type: "GUIDE_DEPENDENCY_CHANGED",
        entityType: "review",
        entityId: review.id,
        detailKey: `status-${review.status}`,
        details: { status: review.status, priority },
        source: "review-maintenance",
      });
      events = upsertEvent(events, evt);
      const task = createTask({
        type: "review-refresh",
        priority: priority === "P0" || priority === "P1" ? priority : "P2",
        entityType: "review",
        entityId: review.id,
        title: `Publish-ready Review: ${product.fullName}`,
        reason: `Review status=${review.status} (typically media or editorial gate)`,
        suggestedAction:
          "Fix authentic media / pass canPublishReview, then set status=published",
        ownership: "editorial",
        eventIds: [evt.id],
        changeClassification: "editorial-impacting",
      });
      tasks = upsertTask(tasks, task);
    }

    // Removed evidence sources
    if (input.removedEvidenceIds?.size) {
      const removed = review.evidenceIds.filter((id) =>
        input.removedEvidenceIds!.has(id),
      );
      if (removed.length) {
        const evt = createEvent({
          type: "SOURCE_REMOVED",
          entityType: "review",
          entityId: review.id,
          detailKey: removed.join(","),
          details: { removedEvidenceIds: removed },
          source: "review-maintenance",
        });
        events = upsertEvent(events, evt);
        const task = createTask({
          type: "review-refresh",
          priority: "P1",
          entityType: "review",
          entityId: review.id,
          title: `Revalidate Review sources: ${product.fullName}`,
          reason: `Evidence removed: ${removed.join(", ")}`,
          suggestedAction: "Replace sources and re-run claim validation — do not leave published Review dangling",
          ownership: "editorial",
          eventIds: [evt.id],
          evidenceIds: removed,
          changeClassification: "editorial-impacting",
        });
        tasks = upsertTask(tasks, task);
      }
    }

    // Staleness by category policy
    const fresh = evaluateReviewFreshness({
      categoryId: product.categoryId,
      lastVerifiedAt: review.lastVerifiedAt,
      updatedAt: review.updatedAt,
      now,
    });
    if (fresh.band === "stale" || fresh.band === "review-soon") {
      const evt = createEvent({
        type: "YEAR_ROLLOVER_REVIEW",
        entityType: "review",
        entityId: review.id,
        detailKey: fresh.band,
        details: { ageDays: fresh.ageDays, policy: fresh.policy },
        source: "review-maintenance",
      });
      events = upsertEvent(events, evt);
      const task = createTask({
        type: "review-refresh",
        priority: fresh.band === "stale" ? "P1" : "P2",
        entityType: "review",
        entityId: review.id,
        title: `Review ${fresh.band}: ${product.fullName}`,
        reason: `Review age ${Math.round(fresh.ageDays ?? 0)}d (policy stale=${fresh.policy.staleDays}d)`,
        suggestedAction: `npm run reviews:agent -- --mode=refresh --product=${product.slug}`,
        ownership: "editorial",
        eventIds: [evt.id],
        changeClassification: "editorial-impacting",
      });
      tasks = upsertTask(tasks, task);
    }

    // Invalid first-hand
    const ev = classifyEvidence(evidence);
    if (
      (review.reviewType === "first-hand-test" || review.reviewType === "hybrid") &&
      !ev.personalTest
    ) {
      const evt = createEvent({
        type: "SOURCE_CONFLICT",
        entityType: "review",
        entityId: review.id,
        detailKey: "fake-first-hand",
        details: { reviewType: review.reviewType },
        source: "review-maintenance",
      });
      events = upsertEvent(events, evt);
      const task = createTask({
        type: "review-refresh",
        priority: "P0",
        entityType: "review",
        entityId: review.id,
        title: `Downgrade invalid first-hand: ${product.fullName}`,
        reason: "first-hand/hybrid without personal-test Evidence",
        suggestedAction: "Set reviewType=expert-research after human confirm — never invent testing",
        ownership: "editorial",
        eventIds: [evt.id],
        changeClassification: "critical",
      });
      tasks = upsertTask(tasks, task);
    }
  }

  return { events, tasks };
}

export function scanGenerationReviewMaintenance(input: {
  previousProduct: Product;
  successorProduct: Product;
  previousReview?: Review | null;
}): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  const evt = createEvent({
    type: "NEW_GENERATION_DISCOVERED",
    entityType: "product",
    entityId: input.successorProduct.id,
    detailKey: input.previousProduct.id,
    details: {
      previousId: input.previousProduct.id,
      successorId: input.successorProduct.id,
    },
    source: "review-maintenance",
  });
  events = upsertEvent(events, evt);

  const specs = [
    createTask({
      type: "review-refresh",
      priority: "P0",
      entityType: "product",
      entityId: input.successorProduct.id,
      title: `Review new generation: ${input.successorProduct.fullName}`,
      reason: "Successor launched — do not copy previous Review",
      suggestedAction: "Research + stage Expert Research Review for successor",
      ownership: "editorial",
      eventIds: [evt.id],
      affectedEntityIds: [input.previousProduct.id],
      changeClassification: "editorial-impacting",
    }),
    createTask({
      type: "review-refresh",
      priority: "P1",
      entityType: "product",
      entityId: input.previousProduct.id,
      title: `Reassess previous generation Review: ${input.previousProduct.fullName}`,
      reason: input.previousReview
        ? "Previous generation still has Review — update positioning vs successor"
        : "Previous generation Review missing",
      suggestedAction: "Update lifecycle framing; check alternatives/comparisons/Best Guides",
      ownership: "editorial",
      eventIds: [evt.id],
      changeClassification: "editorial-impacting",
    }),
    createTask({
      type: "comparison-review",
      priority: "P1",
      entityType: "product",
      entityId: input.successorProduct.id,
      title: `Generation comparison candidate: ${input.previousProduct.name} vs ${input.successorProduct.name}`,
      reason: "Generation change",
      suggestedAction: "Create ComparisonCandidate for editorial — do not auto-publish",
      ownership: "editorial",
      eventIds: [evt.id],
      affectedEntityIds: [input.previousProduct.id],
      changeClassification: "editorial-impacting",
    }),
  ];
  for (const t of specs) tasks = upsertTask(tasks, t);
  return { events, tasks };
}

export function queueReviewTaskFromSpecChange(input: {
  product: Product;
  review?: Review | null;
  field: string;
  previousValue?: unknown;
  nextValue?: unknown;
}): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  const impact = assessReviewImpactFromProductChange(input);
  if (!impact.impactsReview) return { events: [], tasks: [] };

  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];
  const evt = createEvent({
    type: "SPECIFICATION_CHANGED",
    entityType: "product",
    entityId: input.product.id,
    detailKey: input.field,
    details: {
      field: input.field,
      previousValue: input.previousValue,
      nextValue: input.nextValue,
      classification: impact.classification,
    },
    source: "review-maintenance",
  });
  events = upsertEvent(events, evt);
  const task = createTask({
    type: "review-refresh",
    priority: impact.classification === "generation-maintenance" ? "P0" : "P1",
    entityType: input.review ? "review" : "product",
    entityId: input.review?.id ?? input.product.id,
    title: `Review impact: ${input.product.fullName} (${input.field})`,
    reason: impact.reasons.join("; "),
    suggestedAction: impact.suggestedAction,
    ownership: "editorial",
    eventIds: [evt.id],
    changeClassification:
      impact.classification === "generation-maintenance"
        ? "critical"
        : "editorial-impacting",
  });
  tasks = upsertTask(tasks, task);
  return { events, tasks };
}

export { buildPriorityIndex };
