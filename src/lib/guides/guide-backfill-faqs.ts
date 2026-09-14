/**
 * FAQ IDs + FAQ records generated with guide depth backfill.
 * Merged into published guides at resolve time (does not wipe existing faqIds).
 */

import type { FAQ } from "@/domain/editorial/types";
import { runningRemainingFaqs } from "@/lib/guides/explainers/running-remaining-plans";
import { fitnessFaqs } from "@/lib/guides/explainers/fitness-plans";
import { hyroxFaqs } from "@/lib/guides/explainers/hyrox-plans";
import { racketFaqs } from "@/lib/guides/explainers/racket-plans";
import { padelKnowledgeFaqs } from "@/lib/guides/explainers/padel-knowledge-plans";
import { RUNNING_DENSITY_PLANS } from "@/lib/guides/explainers/running-density-plans";
import {
  runningFuelRecoveryFaqs,
  RUNNING_FUEL_RECOVERY_PLANS,
} from "@/lib/guides/explainers/running-fuel-recovery-plans";
import { faqsFromCompactPlan } from "@/lib/guides/complete-compact-plan";
import {
  runningRemainingConfigs,
  runningDensityConfigs,
  runningFuelRecoveryConfigs,
  fitnessConfigs,
  hyroxConfigs,
  racketConfigs,
  padelKnowledgeConfigs,
} from "@/lib/guides/explainers";

function asFaq(
  row: {
    id: string;
    question: string;
    answer: string;
    sportId?: string;
    categoryId?: string;
  },
): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sportId: row.sportId,
    categoryId: row.categoryId,
  };
}

const runningDensityFaqs = RUNNING_DENSITY_PLANS.flatMap(faqsFromCompactPlan);

export const GUIDE_BACKFILL_FAQS: FAQ[] = [
  ...runningRemainingFaqs.map(asFaq),
  ...runningDensityFaqs.map(asFaq),
  ...runningFuelRecoveryFaqs.map(asFaq),
  ...fitnessFaqs.map(asFaq),
  ...hyroxFaqs.map(asFaq),
  ...racketFaqs.map(asFaq),
  ...padelKnowledgeFaqs.map(asFaq),
];

/** slug → faq ids from backfill batches */
export const GUIDE_BACKFILL_FAQ_IDS: Record<string, string[]> = {};

function registerSlugFaqs(slug: string, ids: string[]) {
  GUIDE_BACKFILL_FAQ_IDS[slug] = ids;
}

// Running remaining — fixed ids from runningRemainingFaqs
const RUNNING_FAQ_MAP: Record<string, string[]> = {
  "how-to-choose-heart-rate-monitor": [
    "faq-hrm-choose-1",
    "faq-hrm-choose-2",
    "faq-hrm-choose-3",
    "faq-hrm-choose-4",
  ],
  "how-to-choose-running-hydration-vest": [
    "faq-vest-choose-1",
    "faq-vest-choose-2",
    "faq-vest-choose-3",
    "faq-vest-choose-4",
  ],
  "how-to-choose-running-headlamp": [
    "faq-headlamp-1",
    "faq-headlamp-2",
    "faq-headlamp-3",
    "faq-headlamp-4",
  ],
  "hydration-vest-vs-running-belt": [
    "faq-vest-belt-1",
    "faq-vest-belt-2",
    "faq-vest-belt-3",
    "faq-vest-belt-4",
  ],
  "multi-band-gps-running-watches": [
    "faq-multiband-1",
    "faq-multiband-2",
    "faq-multiband-3",
    "faq-multiband-4",
  ],
  "open-ear-vs-in-ear-running-headphones": [
    "faq-headphones-1",
    "faq-headphones-2",
    "faq-headphones-3",
    "faq-headphones-4",
  ],
};

for (const [slug, ids] of Object.entries(RUNNING_FAQ_MAP)) {
  registerSlugFaqs(slug, ids);
}

for (const plan of [...RUNNING_DENSITY_PLANS, ...RUNNING_FUEL_RECOVERY_PLANS]) {
  registerSlugFaqs(
    plan.slug,
    faqsFromCompactPlan(plan).map((f) => f.id),
  );
}

for (const config of [
  ...fitnessConfigs,
  ...hyroxConfigs,
  ...racketConfigs,
  ...padelKnowledgeConfigs,
]) {
  registerSlugFaqs(config.guideSlug, [
    `faq-${config.guideSlug}-1`,
    `faq-${config.guideSlug}-2`,
    `faq-${config.guideSlug}-3`,
    `faq-${config.guideSlug}-4`,
  ]);
}

export function getBackfillFaqIds(slug: string): string[] {
  return GUIDE_BACKFILL_FAQ_IDS[slug] ?? [];
}

export function mergeGuideFaqIds(existing: string[], slug: string): string[] {
  return [...new Set([...existing, ...getBackfillFaqIds(slug)])];
}

export const ALL_BACKFILL_LONG_FORM_CONFIGS = [
  ...runningRemainingConfigs,
  ...runningDensityConfigs,
  ...runningFuelRecoveryConfigs,
  ...fitnessConfigs,
  ...hyroxConfigs,
  ...racketConfigs,
  ...padelKnowledgeConfigs,
];
