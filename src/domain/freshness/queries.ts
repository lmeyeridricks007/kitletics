import type { FreshnessEvaluation } from "@/domain/freshness/types";
import { evaluateFreshness } from "@/domain/freshness/evaluation";
import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import type { Evidence } from "@/domain/recommendations/types";
import type { BestGuide } from "@/domain/editorial/types";
import { getOfferFreshness } from "@/domain/commerce/ranking";
import { loadTasks } from "@/domain/freshness/storage";

export function getStaleProducts(
  products: Product[],
  now = new Date(),
): Array<{ product: Product; evaluation: FreshnessEvaluation }> {
  return products
    .filter((p) => p.status === "published")
    .map((product) => ({
      product,
      evaluation: evaluateFreshness(
        {
          entityType: "product",
          categoryId: product.categoryId,
          lastVerifiedAt: product.lastVerifiedAt,
        },
        now,
      ),
    }))
    .filter(
      (r) =>
        r.evaluation.status === "stale" ||
        r.evaluation.status === "review-soon" ||
        r.evaluation.status === "unknown",
    );
}

export function getStaleEvidence(
  evidence: Evidence[],
  now = new Date(),
): Evidence[] {
  return evidence.filter((e) => {
    const fr = evaluateFreshness(
      { entityType: "evidence", lastVerifiedAt: e.verifiedAt },
      now,
    );
    return fr.status === "stale" || fr.status === "review-soon";
  });
}

export function getGuidesDueForReview(
  guides: BestGuide[],
  now = new Date(),
): BestGuide[] {
  return guides.filter((g) => {
    if (g.status !== "published") return false;
    const fr = evaluateFreshness(
      { entityType: "best-guide", lastVerifiedAt: g.lastVerifiedAt },
      now,
    );
    return fr.status !== "fresh";
  });
}

export function getStaleOffers(offers: Offer[], now = new Date()): Offer[] {
  return offers.filter((o) => {
    if (o.status === "inactive" || o.status === "expired") return false;
    return getOfferFreshness(o.lastChecked, now) === "stale";
  });
}

export function getOpenMaintenanceTasks() {
  return loadTasks().filter(
    (t) =>
      t.status === "open" ||
      t.status === "needs-review" ||
      t.status === "researching",
  );
}

export interface MaintenanceNotifier {
  notify(task: {
    id: string;
    priority: string;
    title: string;
    reason: string;
  }): Promise<void> | void;
}

/** No-op notifier — adapters (Slack/email/Jira) can implement later */
export const nullNotifier: MaintenanceNotifier = {
  notify() {
    /* intentional no-op */
  },
};

const notifiedKeys = new Set<string>();

export function notifyIfNeeded(
  notifier: MaintenanceNotifier,
  task: { id: string; priority: string; title: string; reason: string },
): void {
  if (task.priority !== "P0" && task.priority !== "P1") return;
  if (notifiedKeys.has(task.id)) return;
  notifiedKeys.add(task.id);
  void notifier.notify(task);
}
