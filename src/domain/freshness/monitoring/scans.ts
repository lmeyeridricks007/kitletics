import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import type { Evidence } from "@/domain/recommendations/types";
import type { MediaAsset } from "@/domain/shared/types";
import { getOfferFreshness } from "@/domain/commerce/ranking";
import { evaluateFreshness, classifySpecChange } from "@/domain/freshness/evaluation";
import type {
  MaintenanceEvent,
  MaintenanceTask,
  SpecChangeCandidate,
} from "@/domain/freshness/types";
import {
  HIGH_IMPACT_FIELDS,
  RECOMMENDATION_FIELD_DEPENDENCIES,
  SAFE_AUTO_APPLY_FIELDS,
} from "@/domain/freshness/types";
import { createEvent, createTask, upsertEvent, upsertTask } from "@/domain/freshness/tasks";
import type { DependencyIndex } from "@/domain/freshness/impact";

export function scanStaleProducts(
  products: Product[],
  now = new Date(),
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const p of products) {
    if (p.status !== "published") continue;
    const evalResult = evaluateFreshness(
      {
        entityType: "product",
        categoryId: p.categoryId,
        lastVerifiedAt: p.lastVerifiedAt,
      },
      now,
    );
    if (evalResult.status === "fresh") continue;

    const staleEvt = createEvent({
      type: "MANUFACTURER_PAGE_CHANGED",
      entityType: "product",
      entityId: p.id,
      details: {
        freshness: evalResult.status,
        reasons: evalResult.reasons,
        kind: "age-based-review-due",
      },
      detailKey: `age:${evalResult.status}`,
      confidence: "medium",
      detectedAt: now.toISOString(),
    });
    events = upsertEvent(events, staleEvt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "product-refresh",
        priority: evalResult.status === "stale" ? "P2" : "P3",
        entityType: "product",
        entityId: p.id,
        title: `Refresh verification: ${p.fullName}`,
        reason: evalResult.reasons.join("; "),
        suggestedAction:
          "Invoke Prompt 19 product:refresh; if unchanged, advance lastVerifiedAt only (not updatedAt/publishedAt)",
        ownership: "catalog",
        eventIds: [staleEvt.id],
      }),
    );
  }

  return { events, tasks };
}

export function processSpecChange(input: {
  product: Product;
  field: string;
  reportedValue: unknown;
  source?: string;
  contextHint?: string;
  index: DependencyIndex;
  dryRun?: boolean;
}): {
  candidate: SpecChangeCandidate;
  events: MaintenanceEvent[];
  tasks: MaintenanceTask[];
  autoApplied?: { field: string; after: unknown };
} {
  const current = input.product.specifications?.[input.field];
  const { classification, significant } = classifySpecChange(
    input.field,
    current,
    input.reportedValue,
  );

  const candidate: SpecChangeCandidate = {
    productId: input.product.id,
    field: input.field,
    currentValue: current,
    reportedValue: input.reportedValue,
    source: input.source,
    contextHint: input.contextHint,
    classification,
    action: significant
      ? "Verify context/reference size before update — do not silently overwrite"
      : "Low-significance numeric drift — optional review",
  };

  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  if (current === input.reportedValue || !significant) {
    return { candidate, events, tasks };
  }

  const evt = createEvent({
    type: "SPECIFICATION_CHANGED",
    entityType: "product",
    entityId: input.product.id,
    source: input.source,
    details: { ...candidate } as Record<string, unknown>,
    detailKey: input.field,
  });
  events = upsertEvent(events, evt);

  const impact = input.index.getEntityImpact(input.product.id, input.field);
  const deps = RECOMMENDATION_FIELD_DEPENDENCIES[input.field] ?? [];

  tasks = upsertTask(
    tasks,
    createTask({
      type: "spec-change-review",
      priority: HIGH_IMPACT_FIELDS.has(input.field) ? "P1" : "P2",
      entityType: "product",
      entityId: input.product.id,
      title: `Spec change: ${input.product.fullName} · ${input.field}`,
      reason: `CURRENT ${JSON.stringify(current)} → SOURCE REPORTS ${JSON.stringify(input.reportedValue)}`,
      suggestedAction: candidate.action,
      ownership: "catalog",
      eventIds: [evt.id],
      affectedEntityIds: [
        input.product.id,
        ...impact.recommendations,
        ...impact.guides,
      ],
      changeClassification: classification,
      dryRunProposed: input.dryRun,
      metadata: { recommendationFactors: deps, impact },
    }),
  );

  if (deps.length && impact.recommendations.length) {
    const recEvt = createEvent({
      type: "RECOMMENDATION_DEPENDENCY_CHANGED",
      entityType: "recommendation",
      entityId: impact.recommendations[0],
      details: {
        productId: input.product.id,
        field: input.field,
        recommendationIds: impact.recommendations,
      },
      detailKey: `${input.product.id}:${input.field}`,
    });
    events = upsertEvent(events, recEvt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "recommendation-review",
        priority: "P1",
        entityType: "product",
        entityId: input.product.id,
        title: `Recommendation review: ${input.product.fullName}`,
        reason: `Field ${input.field} affects recommendation factors`,
        suggestedAction:
          "Recompute deterministic factors; editorial judgment requires human review — do not fabricate",
        ownership: "catalog",
        eventIds: [recEvt.id],
        changeClassification: "recommendation-impacting",
      }),
    );
  }

  for (const gId of impact.guides) {
    tasks = upsertTask(
      tasks,
      createTask({
        type: "guide-review",
        priority: "P1",
        entityType: "best-guide",
        entityId: gId,
        title: `Guide impact from ${input.field} change`,
        reason: `${input.product.fullName} ${input.field} changed`,
        suggestedAction: "Flag for editorial review — do not auto-replace winners",
        ownership: "editorial",
        eventIds: [evt.id],
      }),
    );
  }

  let autoApplied: { field: string; after: unknown } | undefined;
  if (SAFE_AUTO_APPLY_FIELDS.has(input.field) && !input.dryRun) {
    autoApplied = { field: input.field, after: input.reportedValue };
  }

  return { candidate, events, tasks, autoApplied };
}

export function processSourceConflict(input: {
  productId: string;
  field: string;
  values: unknown[];
}): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  const evt = createEvent({
    type: "SOURCE_CONFLICT",
    entityType: "product",
    entityId: input.productId,
    details: { field: input.field, values: input.values },
    detailKey: input.field,
  });
  const task = createTask({
    type: "source-conflict",
    priority: "P1",
    entityType: "product",
    entityId: input.productId,
    title: `Source conflict: ${input.field}`,
    reason: `Conflicting values: ${input.values.map((v) => JSON.stringify(v)).join(" vs ")}`,
    suggestedAction: "Do not silently overwrite; prefer exact-context manufacturer spec",
    ownership: "catalog",
    eventIds: [evt.id],
    changeClassification: "critical",
  });
  return { events: [evt], tasks: [task] };
}

export function scanStaleOffers(
  offers: Offer[],
  now = new Date(),
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[]; staleIds: string[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];
  const staleIds: string[] = [];

  for (const o of offers) {
    if (o.status === "inactive" || o.status === "expired") continue;
    const band = getOfferFreshness(o.lastChecked, now);
    if (band !== "stale" && band !== "aging") continue;
    if (band === "stale") staleIds.push(o.id);

    const evt = createEvent({
      type: "OFFER_STALE",
      entityType: "offer",
      entityId: o.id,
      details: {
        productId: o.productId,
        band,
        lastChecked: o.lastChecked,
        productRemainsPublished: true,
      },
      detailKey: band,
      detectedAt: now.toISOString(),
    });
    events = upsertEvent(events, evt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "offer-refresh",
        priority: band === "stale" ? "P2" : "P3",
        entityType: "offer",
        entityId: o.id,
        title: `Refresh offer ${o.id}`,
        reason: `Offer freshness band: ${band}`,
        suggestedAction:
          "Refresh via commerce adapters; mark stale in UI per Prompt 17; do not unpublish Product",
        ownership: "commercial",
        eventIds: [evt.id],
        changeClassification: "commercial-impacting",
        affectedEntityIds: [o.id, o.productId],
      }),
    );
  }

  return { events, tasks, staleIds };
}

/** Affiliate commission must never alter recommendation rankings */
export function assertRecommendationIndependence(opts: {
  rankingsBefore: string[];
  rankingsAfter: string[];
}): { ok: boolean; reason?: string } {
  if (opts.rankingsBefore.join() !== opts.rankingsAfter.join()) {
    return {
      ok: false,
      reason: "Recommendation ranking changed during commercial maintenance",
    };
  }
  return { ok: true };
}

export function scanBrokenMedia(
  products: Product[],
  brokenSrcs: Set<string>,
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const p of products) {
    const hero = p.images?.[0] as MediaAsset | undefined;
    if (!hero) continue;
    if (!brokenSrcs.has(hero.src)) continue;

    const evt = createEvent({
      type: "MEDIA_BROKEN",
      entityType: "media",
      entityId: hero.id ?? `${p.id}:hero`,
      details: {
        productId: p.id,
        src: hero.src,
        usage: hero.usageType ?? "hero",
      },
      detailKey: hero.src,
    });
    events = upsertEvent(events, evt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "media-repair",
        priority: "P1",
        entityType: "product",
        entityId: p.id,
        title: `Broken hero media: ${p.fullName}`,
        reason: `URL unavailable: ${hero.src}`,
        suggestedAction:
          "MediaAgent replacement with provenance; else intentional image-unavailable fallback — never stock photo",
        ownership: "catalog",
        eventIds: [evt.id],
        changeClassification: "critical",
      }),
    );
  }

  return { events, tasks };
}

export function scanEvidenceHealth(
  evidence: Evidence[],
  unavailableUrls: Set<string>,
  now = new Date(),
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const e of evidence) {
    const url = e.sourceUrl;
    if (url && unavailableUrls.has(url)) {
      const evt = createEvent({
        type: "SOURCE_REMOVED",
        entityType: "evidence",
        entityId: e.id,
        details: {
          url,
          action:
            "Mark unavailable/superseded — do not delete; recalculate confidence",
          autoDiscontinueProduct: false,
        },
        detailKey: url,
        detectedAt: now.toISOString(),
      });
      events = upsertEvent(events, evt);
      tasks = upsertTask(
        tasks,
        createTask({
          type: "evidence-health",
          priority: "P2",
          entityType: "evidence",
          entityId: e.id,
          title: `Evidence source unavailable: ${e.id}`,
          reason: `URL returned unavailable: ${url}`,
          suggestedAction:
            "Mark evidence unavailable; if sole source for fact, lower confidence — do not invent replacement facts",
          ownership: "catalog",
          eventIds: [evt.id],
        }),
      );
      continue;
    }

    const fr = evaluateFreshness(
      {
        entityType: "evidence",
        lastVerifiedAt: e.verifiedAt,
      },
      now,
    );
    if (fr.status === "stale" || fr.status === "review-soon") {
      tasks = upsertTask(
        tasks,
        createTask({
          type: "evidence-health",
          priority: "P3",
          entityType: "evidence",
          entityId: e.id,
          title: `Evidence freshness: ${e.id}`,
          reason: fr.reasons.join("; "),
          suggestedAction: "Re-check source URL health on schedule",
          ownership: "catalog",
        }),
      );
    }
  }

  return { events, tasks };
}

export function scanGuidesDueForReview(
  guides: { id: string; title: string; lastVerifiedAt?: string; status: string }[],
  now = new Date(),
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const g of guides) {
    if (g.status !== "published") continue;
    const fr = evaluateFreshness(
      { entityType: "best-guide", lastVerifiedAt: g.lastVerifiedAt },
      now,
    );
    if (fr.status === "fresh") continue;
    const evt = createEvent({
      type: "GUIDE_DEPENDENCY_CHANGED",
      entityType: "best-guide",
      entityId: g.id,
      details: { freshness: fr.status, reasons: fr.reasons },
      detailKey: `age:${fr.status}`,
      confidence: "medium",
    });
    events = upsertEvent(events, evt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "guide-review",
        priority: fr.status === "stale" ? "P1" : "P2",
        entityType: "best-guide",
        entityId: g.id,
        title: `Guide due for review: ${g.title}`,
        reason: fr.reasons.join("; "),
        suggestedAction:
          "Editorial review; do not bump updatedAt/lastReviewedAt until actually reviewed",
        ownership: "editorial",
        eventIds: [evt.id],
      }),
    );
  }

  return { events, tasks };
}
