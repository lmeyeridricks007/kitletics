import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type { DiscoveryCandidate } from "@/domain/onboarding/types";
import { discoverBrandCatalog } from "@/domain/onboarding/orchestrator";
import { findExistingProductCandidate } from "@/domain/onboarding/identity";
import type {
  BrandMonitorResult,
  MaintenanceEvent,
  MaintenanceTask,
} from "@/domain/freshness/types";
import { createEvent, createTask, upsertEvent, upsertTask } from "@/domain/freshness/tasks";
import { isSuppressed } from "@/domain/freshness/storage";
import type { DependencyIndex } from "@/domain/freshness/impact";

/**
 * Brand catalog monitor — reuses Prompt 19 discovery.
 * Never auto-publishes Products. Missing manufacturer URL ≠ discontinued.
 */
export function monitorBrandCatalog(input: {
  brand: Brand;
  sportId?: string;
  category?: string;
  knownLineup: DiscoveryCandidate[];
  products: Product[];
  brands: Brand[];
  families: ProductFamily[];
  dryRun?: boolean;
  limit?: number;
}): {
  result: BrandMonitorResult;
  events: MaintenanceEvent[];
  tasks: MaintenanceTask[];
} {
  const session = discoverBrandCatalog(
    {
      brand: input.brand.name,
      sport: input.sportId,
      category: input.category,
      dryRun: true,
      limit: input.limit ?? 20,
      knownLineup: input.knownLineup,
    },
    {
      products: input.products,
      brands: input.brands,
      families: input.families,
    },
  );

  const result: BrandMonitorResult = {
    brandId: input.brand.id,
    brandName: input.brand.name,
    sportId: input.sportId,
    newProducts: [],
    unchanged: [],
    possibleLifecycleChange: [],
    missingOfficialPage: [],
    noAction: [],
    suppressed: [],
  };

  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const c of session.discoveryCandidates ?? []) {
    const modelKey = c.modelName.toLowerCase().replace(/\s+/g, "-");
    const suppressed = isSuppressed(modelKey, input.brand.id);
    if (suppressed) {
      result.suppressed.push({ model: c.modelName, reason: suppressed.reason });
      continue;
    }

    if (c.kind === "existing") {
      result.unchanged.push({
        productId: c.existingProductId!,
        name: c.fullName,
      });
      result.noAction.push({ productId: c.existingProductId! });
      continue;
    }

    if (c.kind === "new" || c.kind === "new-generation") {
      result.newProducts.push({
        model: c.modelName,
        generation: c.generation,
        priority: c.priority,
      });

      const eventType =
        c.kind === "new-generation"
          ? "NEW_GENERATION_DISCOVERED"
          : "NEW_PRODUCT_DISCOVERED";

      const event = createEvent({
        type: eventType,
        entityType: "product",
        entityId: `candidate:${input.brand.id}:${modelKey}`,
        details: {
          brand: input.brand.name,
          model: c.modelName,
          generation: c.generation,
          family: c.familyName,
          autoPublish: false,
        },
        detailKey: modelKey,
      });
      events = upsertEvent(events, event);

      tasks = upsertTask(
        tasks,
        createTask({
          type: "product-onboarding",
          priority: c.priority === "HIGH" ? "P1" : c.priority === "MEDIUM" ? "P2" : "P3",
          entityType: "product",
          entityId: event.entityId!,
          title: `Onboard candidate: ${input.brand.name} ${c.modelName}`,
          reason: c.reason,
          suggestedAction:
            "Invoke Prompt 19 product:onboard — do NOT auto-publish",
          ownership: "catalog",
          eventIds: [event.id],
          dryRunProposed: input.dryRun,
          changeClassification: "editorial-impacting",
        }),
      );

      if (c.kind === "new-generation" && c.familyName) {
        const family = input.families.find(
          (f) =>
            f.brandId === input.brand.id &&
            f.name.toLowerCase() === c.familyName!.toLowerCase(),
        );
        if (family) {
          for (const pid of family.productIds) {
            const prev = input.products.find((p) => p.id === pid);
            if (!prev) continue;
            if (prev.lifecycleStatus === "current") {
              result.possibleLifecycleChange.push({
                productId: prev.id,
                reason: `Possible previous-generation after ${c.modelName} — verify manufacturer status; do not auto-obsolete`,
              });
              const lifeEvt = createEvent({
                type: "PRODUCT_STATUS_CHANGED",
                entityType: "product",
                entityId: prev.id,
                details: {
                  hint: "previous-generation-candidate",
                  newGeneration: c.modelName,
                  autoObsolete: false,
                },
                detailKey: `lifecycle:${prev.id}`,
              });
              events = upsertEvent(events, lifeEvt);
              tasks = upsertTask(
                tasks,
                createTask({
                  type: "lifecycle-review",
                  priority: "P1",
                  entityType: "product",
                  entityId: prev.id,
                  title: `Lifecycle review: ${prev.fullName}`,
                  reason: lifeEvt.details.hint as string,
                  suggestedAction:
                    "Verify manufacturer status before changing lifecycle; previous gen may remain commercially useful",
                  ownership: "catalog",
                  eventIds: [lifeEvt.id, event.id],
                  changeClassification: "editorial-impacting",
                }),
              );
            }
          }
        }
      }
    }

    if (c.kind === "ambiguous") {
      tasks = upsertTask(
        tasks,
        createTask({
          type: "product-onboarding",
          priority: "P2",
          entityType: "product",
          entityId: `ambiguous:${input.brand.id}:${modelKey}`,
          title: `Ambiguous identity: ${c.modelName}`,
          reason: c.reason,
          suggestedAction: "Human identity resolution before onboarding",
          ownership: "catalog",
        }),
      );
    }
  }

  // Flag catalog products without homepage evidence path (lifecycle review, not discontinue)
  for (const p of input.products.filter((x) => x.brandId === input.brand.id)) {
    if (p.lifecycleStatus === "current" && !p.images?.length) {
      result.missingOfficialPage.push({
        productId: p.id,
        reason:
          "No Product images on file — media/lifecycle review; do not auto-discontinue from missing manufacturer page alone",
      });
    }
  }

  return { result, events, tasks };
}

export function applyNewGenerationGuideImpact(input: {
  newModel: string;
  previousProductIds: string[];
  guides: { id: string; title: string; recommendations?: { productId: string; rank: number }[] }[];
  index: DependencyIndex;
  dryRun?: boolean;
}): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const prevId of input.previousProductIds) {
    const impact = input.index.getEntityImpact(prevId, "generation");
    for (const guideId of impact.guides) {
      const guide = input.guides.find((g) => g.id === guideId);
      const evt = createEvent({
        type: "GUIDE_DEPENDENCY_CHANGED",
        entityType: "best-guide",
        entityId: guideId,
        details: {
          trigger: `New generation candidate ${input.newModel}`,
          previousProductId: prevId,
          autoReplaceWinner: false,
        },
        detailKey: `${guideId}:${prevId}`,
      });
      events = upsertEvent(events, evt);
      tasks = upsertTask(
        tasks,
        createTask({
          type: "guide-review",
          priority: "P1",
          entityType: "best-guide",
          entityId: guideId,
          title: `Guide review: ${guide?.title ?? guideId}`,
          reason: `Potential impact from ${input.newModel}; current pick may reference previous generation`,
          suggestedAction:
            "Research new Product and reassess — do NOT automatically replace winner",
          ownership: "editorial",
          eventIds: [evt.id],
          affectedEntityIds: [guideId, prevId],
          changeClassification: "editorial-impacting",
          dryRunProposed: input.dryRun,
        }),
      );
    }

    for (const cmpId of impact.comparisons) {
      const evt = createEvent({
        type: "RELATIONSHIP_CHANGED",
        entityType: "comparison",
        entityId: cmpId,
        details: { previousProductId: prevId, newModel: input.newModel },
        detailKey: `cmp:${cmpId}`,
      });
      events = upsertEvent(events, evt);
      tasks = upsertTask(
        tasks,
        createTask({
          type: "comparison-review",
          priority: "P2",
          entityType: "comparison",
          entityId: cmpId,
          title: `Comparison review after new generation`,
          reason: `${input.newModel} may affect comparison involving ${prevId}`,
          suggestedAction: "Create new-vs-previous ComparisonCandidate; recompute objective specs",
          ownership: "editorial",
          eventIds: [evt.id],
        }),
      );
    }
  }

  return { events, tasks };
}

export function detectDuplicateIdentityNoise(
  products: Product[],
  brands: Brand[],
  families: ProductFamily[],
  candidate: { brandName: string; modelName: string; fullName: string },
): boolean {
  const match = findExistingProductCandidate(products, brands, families, {
    ...candidate,
    aliases: [candidate.modelName, candidate.fullName],
  });
  return match.kind === "exact" || match.kind === "probable";
}
