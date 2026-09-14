import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";
import {
  knownPriceEur,
  knownWeightMinG,
} from "@/lib/padel-racket-database/quality";
import {
  PADEL_RESEARCH_STORIES,
  type PadelResearchRequiredMetric,
  type PadelResearchStoryDefinition,
  type PadelResearchStorySlug,
} from "@/lib/padel-research/stories";

export interface MetricCoverage {
  metric: PadelResearchRequiredMetric;
  known: number;
  total: number;
  coverage: number;
  distinctClasses?: number;
}

export interface StoryReadiness {
  slug: PadelResearchStorySlug;
  title: string;
  ready: boolean;
  reasons: string[];
  metrics: MetricCoverage[];
}

function metricCoverage(
  records: PadelRacketDatabaseRecord[],
  metric: PadelResearchRequiredMetric,
): MetricCoverage {
  const total = records.length;
  if (metric === "shape") {
    const known = records.filter((r) => r.shape).length;
    const classes = new Set(
      records.map((r) => r.shape).filter((v): v is string => Boolean(v)),
    );
    return {
      metric,
      known,
      total,
      coverage: total ? known / total : 0,
      distinctClasses: classes.size,
    };
  }
  if (metric === "balance") {
    const known = records.filter((r) => r.balance).length;
    const classes = new Set(
      records.map((r) => r.balance).filter((v): v is string => Boolean(v)),
    );
    return {
      metric,
      known,
      total,
      coverage: total ? known / total : 0,
      distinctClasses: classes.size,
    };
  }
  if (metric === "weightMin") {
    const known = records.filter((r) => knownWeightMinG(r) !== undefined).length;
    return {
      metric,
      known,
      total,
      coverage: total ? known / total : 0,
    };
  }
  const known = records.filter((r) => knownPriceEur(r) !== undefined).length;
  return {
    metric,
    known,
    total,
    coverage: total ? known / total : 0,
  };
}

function assessOne(
  story: PadelResearchStoryDefinition,
  records: PadelRacketDatabaseRecord[],
  readyBySlug: Map<PadelResearchStorySlug, boolean>,
): StoryReadiness {
  const metrics = story.requiredMetrics.map((m) =>
    metricCoverage(records, m),
  );
  const reasons: string[] = [];
  let ready = true;

  // Dependent stories (e.g. market-2026) gate via child story readiness.
  if (!story.requiresStoriesReady?.length) {
    for (const m of metrics) {
      if (m.known < story.minCoverage) {
        ready = false;
        reasons.push(
          `${m.metric}: ${m.known} known (need ≥${story.minCoverage})`,
        );
      }
      if (
        story.minDistinctClasses != null &&
        m.metric === "shape" &&
        (m.distinctClasses ?? 0) < story.minDistinctClasses
      ) {
        ready = false;
        reasons.push(
          `shape classes: ${m.distinctClasses ?? 0} (need ≥${story.minDistinctClasses})`,
        );
      }
    }
  }

  if (story.requiresStoriesReady) {
    for (const dep of story.requiresStoriesReady) {
      if (!readyBySlug.get(dep)) {
        ready = false;
        reasons.push(`depends on ${dep} being ready`);
      }
    }
  }

  if (ready) {
    reasons.push("Coverage thresholds met for this Kitletics cohort.");
  }

  return {
    slug: story.slug,
    title: story.title,
    ready,
    reasons,
    metrics,
  };
}

/**
 * Assess whether each research story may publish findings.
 * Prices story is independent; market-2026 requires shapes + weight ready.
 */
export function assessPadelResearchStoryReadiness(
  records: PadelRacketDatabaseRecord[],
): StoryReadiness[] {
  const readyBySlug = new Map<PadelResearchStorySlug, boolean>();
  // First pass without dependency checks for independent stories
  const independent = PADEL_RESEARCH_STORIES.filter(
    (s) => !s.requiresStoriesReady?.length,
  );
  for (const story of independent) {
    const result = assessOne(story, records, readyBySlug);
    readyBySlug.set(story.slug, result.ready);
  }
  const dependent = PADEL_RESEARCH_STORIES.filter(
    (s) => (s.requiresStoriesReady?.length ?? 0) > 0,
  );
  for (const story of dependent) {
    const result = assessOne(story, records, readyBySlug);
    readyBySlug.set(story.slug, result.ready);
  }

  return PADEL_RESEARCH_STORIES.map((story) =>
    assessOne(story, records, readyBySlug),
  );
}

export function getStoryReadiness(
  records: PadelRacketDatabaseRecord[],
  slug: PadelResearchStorySlug,
): StoryReadiness | undefined {
  return assessPadelResearchStoryReadiness(records).find((r) => r.slug === slug);
}
