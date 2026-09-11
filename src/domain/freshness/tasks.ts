import { createHash } from "node:crypto";
import type {
  MaintenanceEvent,
  MaintenanceEventType,
  MaintenanceOwnership,
  MaintenancePriority,
  MaintenanceTask,
  MaintenanceTaskType,
  EntityTypeForMaintenance,
  ChangeClassification,
} from "@/domain/freshness/types";

export function eventDedupeKey(
  type: MaintenanceEventType,
  entityId: string | undefined,
  detailKey = "",
): string {
  return `${type}:${entityId ?? "none"}:${detailKey}`;
}

export function taskDedupeKey(
  type: MaintenanceTaskType,
  entityId: string,
): string {
  return `${type}:${entityId}`;
}

export function makeEventId(dedupeKey: string): string {
  const h = createHash("sha1").update(dedupeKey).digest("hex").slice(0, 10);
  return `mevt-${h}`;
}

export function makeTaskId(dedupeKey: string): string {
  const h = createHash("sha1").update(dedupeKey).digest("hex").slice(0, 10);
  return `mtask-${h}`;
}

export function createEvent(input: {
  type: MaintenanceEventType;
  entityType: EntityTypeForMaintenance;
  entityId?: string;
  source?: string;
  details?: Record<string, unknown>;
  confidence?: "high" | "medium" | "low";
  detailKey?: string;
  detectedAt?: string;
}): MaintenanceEvent {
  const dedupeKey = eventDedupeKey(
    input.type,
    input.entityId,
    input.detailKey ?? "",
  );
  return {
    id: makeEventId(dedupeKey),
    type: input.type,
    entityType: input.entityType,
    entityId: input.entityId,
    source: input.source,
    detectedAt: input.detectedAt ?? new Date().toISOString(),
    details: input.details ?? {},
    confidence: input.confidence ?? "high",
    status: "open",
    dedupeKey,
  };
}

export function createTask(input: {
  type: MaintenanceTaskType;
  priority: MaintenancePriority;
  entityType: EntityTypeForMaintenance;
  entityId: string;
  title: string;
  reason: string;
  suggestedAction: string;
  ownership: MaintenanceOwnership;
  eventIds?: string[];
  affectedEntityIds?: string[];
  evidenceIds?: string[];
  changeClassification?: ChangeClassification;
  dueAt?: string;
  metadata?: Record<string, unknown>;
  dryRunProposed?: boolean;
}): MaintenanceTask {
  const dedupeKey = taskDedupeKey(input.type, input.entityId);
  return {
    id: makeTaskId(dedupeKey),
    type: input.type,
    priority: input.priority,
    entityType: input.entityType,
    entityId: input.entityId,
    title: input.title,
    reason: input.reason,
    evidenceIds: input.evidenceIds,
    eventIds: input.eventIds ?? [],
    suggestedAction: input.suggestedAction,
    status: "open",
    ownership: input.ownership,
    createdAt: new Date().toISOString(),
    dueAt: input.dueAt,
    affectedEntityIds: input.affectedEntityIds ?? [input.entityId],
    dedupeKey,
    changeClassification: input.changeClassification,
    dryRunProposed: input.dryRunProposed,
    metadata: input.metadata,
  };
}

/**
 * Merge tasks with the same dedupeKey — aggregate triggers instead of duplicates.
 */
export function upsertTask(
  existing: MaintenanceTask[],
  incoming: MaintenanceTask,
): MaintenanceTask[] {
  const idx = existing.findIndex((t) => t.dedupeKey === incoming.dedupeKey);
  if (idx === -1) return [...existing, incoming];

  const prev = existing[idx];
  if (prev.status === "resolved" || prev.status === "dismissed") {
    // Re-open only if new higher-priority trigger
    if (priorityRank(incoming.priority) < priorityRank(prev.priority)) {
      const merged = mergeTasks(prev, incoming);
      merged.status = "open";
      const copy = [...existing];
      copy[idx] = merged;
      return copy;
    }
    return existing;
  }

  const merged = mergeTasks(prev, incoming);
  const copy = [...existing];
  copy[idx] = merged;
  return copy;
}

function mergeTasks(a: MaintenanceTask, b: MaintenanceTask): MaintenanceTask {
  const eventIds = [...new Set([...a.eventIds, ...b.eventIds])];
  const affected = [...new Set([...a.affectedEntityIds, ...b.affectedEntityIds])];
  const priority =
    priorityRank(a.priority) <= priorityRank(b.priority)
      ? a.priority
      : b.priority;
  return {
    ...a,
    priority,
    eventIds,
    affectedEntityIds: affected,
    reason: a.reason.includes(b.reason) ? a.reason : `${a.reason}; ${b.reason}`,
    metadata: {
      ...a.metadata,
      ...b.metadata,
      triggerCount: eventIds.length,
    },
  };
}

function priorityRank(p: MaintenancePriority): number {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[p];
}

export function upsertEvent(
  existing: MaintenanceEvent[],
  incoming: MaintenanceEvent,
): MaintenanceEvent[] {
  if (existing.some((e) => e.dedupeKey === incoming.dedupeKey)) {
    return existing;
  }
  return [...existing, incoming];
}

export function queueCounts(
  tasks: MaintenanceTask[],
): Record<MaintenancePriority, number> {
  const counts: Record<MaintenancePriority, number> = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
  };
  for (const t of tasks) {
    if (t.status === "open" || t.status === "needs-review" || t.status === "researching") {
      counts[t.priority] += 1;
    }
  }
  return counts;
}
