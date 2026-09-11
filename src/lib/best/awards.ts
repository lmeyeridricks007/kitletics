import type { AwardType } from "@/domain/editorial/types";

export const AWARD_LABELS: Record<AwardType, string> = {
  "best-overall": "Best Overall",
  "best-value": "Best Value",
  "best-premium": "Best Premium",
  "best-beginner": "Best for Beginners",
  "best-daily": "Best Daily Trainer",
  "best-long-run": "Best for Long Runs",
  "best-race": "Best Race Option",
  "best-cushioned": "Best Max Cushion",
  "best-stability": "Best Stability",
  "best-trail": "Best Trail",
  "best-tempo": "Best Tempo Hybrid",
  "best-lightweight": "Best Lightweight",
  "best-durable": "Best Durable",
  "best-fit": "Best Fit",
  "editors-pick": "Editor’s Pick",
};

export function getAwardLabel(
  awardType?: AwardType,
  badgeFallback?: string,
): string | undefined {
  if (awardType) return AWARD_LABELS[awardType];
  return badgeFallback;
}
