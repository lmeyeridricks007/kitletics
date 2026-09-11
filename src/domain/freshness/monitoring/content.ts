/**
 * Deterministic content freshness / fragile-claim scanners.
 * Produce review candidates — do not auto-rewrite editorial copy.
 */

import type { MaintenanceEvent, MaintenanceTask } from "@/domain/freshness/types";
import { createEvent, createTask, upsertEvent, upsertTask } from "@/domain/freshness/tasks";
import { getCurrentEditorialYear } from "@/domain/freshness/evaluation";

const SUPERLATIVE_RE =
  /\b(best|lightest|fastest|longest|cheapest|most|least|unmatched|ultimate)\b/gi;
const PRICE_RE = /(?:€|\$|£)\s?\d{2,5}(?:[.,]\d{2})?/g;
const LIFECYCLE_LANG_RE =
  /\b(latest|brand[- ]?new|newly released|current generation|just launched)\b/gi;
const YEAR_IN_TITLE_RE = /\b(20\d{2})\b/;

export interface ContentScanTarget {
  id: string;
  entityType: "best-guide" | "review" | "comparison" | "content";
  title: string;
  body: string;
}

export function scanContentFreshness(
  targets: ContentScanTarget[],
  now = new Date(),
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];
  const year = getCurrentEditorialYear(now);

  for (const t of targets) {
    const yearMatch = t.title.match(YEAR_IN_TITLE_RE);
    if (yearMatch) {
      const titleYear = Number(yearMatch[1]);
      if (titleYear < year) {
        const evt = createEvent({
          type: "YEAR_ROLLOVER_REVIEW",
          entityType: t.entityType,
          entityId: t.id,
          details: {
            title: t.title,
            titleYear,
            currentYear: year,
            autoRename: false,
          },
          detailKey: String(titleYear),
        });
        events = upsertEvent(events, evt);
        tasks = upsertTask(
          tasks,
          createTask({
            type: "content-claim-review",
            priority: "P1",
            entityType: t.entityType,
            entityId: t.id,
            title: `Year rollover review: ${t.title}`,
            reason: `Title year ${titleYear} vs editorial year ${year}`,
            suggestedAction:
              "Schedule editorial review — do NOT auto-rename to new year",
            ownership: "editorial",
            eventIds: [evt.id],
            changeClassification: "editorial-impacting",
          }),
        );
      }
    }

    const lifecycleHits = t.body.match(LIFECYCLE_LANG_RE);
    if (lifecycleHits?.length) {
      const evt = createEvent({
        type: "FRAGMENT_LIFECYCLE_LANGUAGE",
        entityType: t.entityType,
        entityId: t.id,
        details: { hits: [...new Set(lifecycleHits.map((h) => h.toLowerCase()))] },
        detailKey: "lifecycle-lang",
        confidence: "medium",
      });
      events = upsertEvent(events, evt);
      tasks = upsertTask(
        tasks,
        createTask({
          type: "content-claim-review",
          priority: "P3",
          entityType: t.entityType,
          entityId: t.id,
          title: `Lifecycle language review: ${t.title}`,
          reason: `Decaying phrases: ${[...new Set(lifecycleHits)].join(", ")}`,
          suggestedAction:
            "Prefer lifecycle-aware rendering where natural; do not over-dynamize prose",
          ownership: "editorial",
          eventIds: [evt.id],
        }),
      );
    }

    const prices = t.body.match(PRICE_RE);
    if (prices?.length) {
      const evt = createEvent({
        type: "HARDCODED_PRICE",
        entityType: t.entityType,
        entityId: t.id,
        details: { samples: prices.slice(0, 5) },
        detailKey: "price",
        confidence: "medium",
      });
      events = upsertEvent(events, evt);
      tasks = upsertTask(
        tasks,
        createTask({
          type: "content-claim-review",
          priority: "P2",
          entityType: t.entityType,
          entityId: t.id,
          title: `Hardcoded price in editorial: ${t.title}`,
          reason: `Found ${prices.length} price-like tokens`,
          suggestedAction: "Prefer Offer engine for live prices; remove stale urgency",
          ownership: "editorial",
          eventIds: [evt.id],
          changeClassification: "commercial-impacting",
        }),
      );
    }
  }

  return { events, tasks };
}

export function scanSuperlativeClaims(
  targets: ContentScanTarget[],
): { events: MaintenanceEvent[]; tasks: MaintenanceTask[] } {
  let events: MaintenanceEvent[] = [];
  let tasks: MaintenanceTask[] = [];

  for (const t of targets) {
    const hits = t.body.match(SUPERLATIVE_RE);
    if (!hits?.length) continue;
    const unique = [...new Set(hits.map((h) => h.toLowerCase()))];
    const evt = createEvent({
      type: "SUPERLATIVE_CLAIM",
      entityType: t.entityType,
      entityId: t.id,
      details: { claims: unique },
      detailKey: unique.sort().join(","),
      confidence: "low",
    });
    events = upsertEvent(events, evt);
    tasks = upsertTask(
      tasks,
      createTask({
        type: "content-claim-review",
        priority: "P3",
        entityType: t.entityType,
        entityId: t.id,
        title: `Superlative claim review: ${t.title}`,
        reason: `Fragile claims: ${unique.join(", ")}`,
        suggestedAction:
          "Not every hit is wrong — ensure market-wide evidence still supports claim",
        ownership: "editorial",
        eventIds: [evt.id],
      }),
    );
  }

  return { events, tasks };
}
