import type {
  FreshnessEvaluation,
  FreshnessPolicy,
  FreshnessStatus,
  MaintenancePriority,
  ChangeClassification,
} from "@/domain/freshness/types";
import { HIGH_IMPACT_FIELDS } from "@/domain/freshness/types";
import { getPolicy } from "@/domain/freshness/policies";

export function daysBetween(iso: string, now = new Date()): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / (1000 * 60 * 60 * 24);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/**
 * Age-based freshness only. Event-driven invalidation is applied separately
 * via eventForcedStatus — age alone does not equal "wrong".
 */
export function evaluateFreshness(
  input: {
    lastVerifiedAt?: string;
    categoryId?: string;
    field?: string;
    entityType: FreshnessPolicy["entityType"];
    conflicting?: boolean;
    eventForcedStatus?: FreshnessStatus;
  },
  now = new Date(),
  policy?: FreshnessPolicy,
): FreshnessEvaluation {
  const p =
    policy ??
    getPolicy(input.entityType, {
      categoryId: input.categoryId,
      field: input.field,
    });

  if (input.conflicting) {
    return {
      status: "conflicting",
      lastVerifiedAt: input.lastVerifiedAt,
      nextReviewAt: now.toISOString(),
      reasons: ["Open source conflict"],
      priority: "P1",
      policyId: p.id,
    };
  }

  if (input.eventForcedStatus) {
    return {
      status: input.eventForcedStatus,
      lastVerifiedAt: input.lastVerifiedAt,
      nextReviewAt: now.toISOString(),
      reasons: ["Event-driven invalidation"],
      priority: priorityForStatus(input.eventForcedStatus),
      policyId: p.id,
      ageDays: input.lastVerifiedAt
        ? daysBetween(input.lastVerifiedAt, now)
        : undefined,
    };
  }

  if (!input.lastVerifiedAt) {
    return {
      status: "unknown",
      reasons: ["No lastVerifiedAt"],
      priority: "P2",
      policyId: p.id,
      nextReviewAt: now.toISOString(),
    };
  }

  const age = daysBetween(input.lastVerifiedAt, now);
  let status: FreshnessStatus = "fresh";
  const reasons: string[] = [];

  if (age > p.staleAfterDays) {
    status = "stale";
    reasons.push(
      `Verified ${Math.floor(age)}d ago (stale after ${p.staleAfterDays}d)`,
    );
  } else if (age > p.reviewSoonAfterDays) {
    status = "review-soon";
    reasons.push(
      `Verified ${Math.floor(age)}d ago (review soon after ${p.reviewSoonAfterDays}d)`,
    );
  } else {
    reasons.push(
      `Verified ${Math.floor(age)}d ago (fresh for ${p.freshForDays}d)`,
    );
  }

  const nextReviewAt = addDays(input.lastVerifiedAt, p.reviewSoonAfterDays);

  return {
    status,
    lastVerifiedAt: input.lastVerifiedAt,
    nextReviewAt,
    reasons,
    priority: priorityForStatus(status),
    policyId: p.id,
    ageDays: age,
  };
}

function priorityForStatus(status: FreshnessStatus): MaintenancePriority {
  switch (status) {
    case "conflicting":
      return "P1";
    case "stale":
      return "P2";
    case "review-soon":
      return "P2";
    case "unknown":
      return "P2";
    default:
      return "P3";
  }
}

/**
 * Monitoring must NOT mutate publishedAt / updatedAt.
 * Only lastVerifiedAt advances when verification confirms no material change.
 */
export function verificationTouchFields(opts: {
  verifiedAt: string;
  materialChange: boolean;
}): { lastVerifiedAt: string } {
  void opts.materialChange;
  return { lastVerifiedAt: opts.verifiedAt };
}

export function classifySpecChange(
  field: string,
  current: unknown,
  reported: unknown,
): { classification: ChangeClassification; significant: boolean } {
  if (HIGH_IMPACT_FIELDS.has(field)) {
    if (
      typeof current === "number" &&
      typeof reported === "number" &&
      Math.abs(current - reported) < 1 &&
      field === "weight"
    ) {
      return { classification: "low-impact", significant: false };
    }
    return { classification: "recommendation-impacting", significant: true };
  }
  if (field === "shortDescription" || field === "seoDescription") {
    return { classification: "informational", significant: false };
  }
  return { classification: "low-impact", significant: true };
}

/** Editorial year helper — does not rewrite published prose */
export function getCurrentEditorialYear(now = new Date()): number {
  return now.getUTCFullYear();
}
