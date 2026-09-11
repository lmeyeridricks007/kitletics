/**
 * Internal GuideQuestionMap — QA coverage only, not public UI.
 */

import { GUIDE_QUESTION_MAPS_ALL } from "@/lib/guides/guide-question-maps-all";
import type { GuideQuestionMap } from "@/lib/guides/guide-depth";

/** Hand-authored maps for core shoe explainers (kept for editorial nuance). */
const GUIDE_QUESTION_MAPS_CORE: GuideQuestionMap[] = [
  {
    guideSlug: "running-shoe-drop",
    primaryQuestion: "What is shoe drop?",
    questions: [
      {
        id: "q1",
        question: "What is shoe drop?",
        importance: "primary",
        answerCoverage: "answered",
        sectionId: "what-is",
      },
      {
        id: "q2",
        question: "How is it measured?",
        importance: "secondary",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "Does lower mean better?",
        importance: "misconception",
        answerCoverage: "answered",
      },
      {
        id: "q4",
        question: "How does drop change feel?",
        importance: "secondary",
        answerCoverage: "answered",
      },
      {
        id: "q5",
        question: "How does drop interact with stack?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q6",
        question: "What drop should I consider?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q7",
        question: "Where do I go next?",
        importance: "next-step",
        answerCoverage: "answered",
      },
    ],
  },
  {
    guideSlug: "running-shoe-cushioning",
    primaryQuestion: "What does cushioning mean in a running shoe?",
    questions: [
      {
        id: "q1",
        question: "What does cushioning mean?",
        importance: "primary",
        answerCoverage: "answered",
      },
      {
        id: "q2",
        question: "Is stack the same as soft?",
        importance: "misconception",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "What is energy return?",
        importance: "secondary",
        answerCoverage: "answered",
      },
      {
        id: "q4",
        question: "How do I choose cushion level?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q5",
        question: "Where do I go next?",
        importance: "next-step",
        answerCoverage: "answered",
      },
    ],
  },
  {
    guideSlug: "stability-shoes-explained",
    primaryQuestion: "What is a stability running shoe?",
    questions: [
      {
        id: "q1",
        question: "What is a stability shoe?",
        importance: "primary",
        answerCoverage: "answered",
      },
      {
        id: "q2",
        question: "Do I need one?",
        importance: "misconception",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "How do modern designs work?",
        importance: "secondary",
        answerCoverage: "answered",
      },
      {
        id: "q4",
        question: "How do I choose?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q5",
        question: "Where are recommendations?",
        importance: "next-step",
        answerCoverage: "answered",
      },
    ],
  },
  {
    guideSlug: "carbon-vs-nylon-plates",
    primaryQuestion: "How do carbon and nylon plates differ?",
    questions: [
      {
        id: "q1",
        question: "What does a plate do?",
        importance: "primary",
        answerCoverage: "answered",
      },
      {
        id: "q2",
        question: "Is carbon always better?",
        importance: "misconception",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "When should I use each?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q4",
        question: "Where do I go next?",
        importance: "next-step",
        answerCoverage: "answered",
      },
    ],
  },
  {
    guideSlug: "running-shoe-rotation",
    primaryQuestion: "Should I rotate running shoes?",
    questions: [
      {
        id: "q1",
        question: "Why rotate shoes?",
        importance: "primary",
        answerCoverage: "answered",
      },
      {
        id: "q2",
        question: "How many pairs do I need?",
        importance: "decision",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "Does rotation prevent injury?",
        importance: "misconception",
        answerCoverage: "answered",
      },
      {
        id: "q4",
        question: "How do I build a simple rotation?",
        importance: "decision",
        answerCoverage: "answered",
      },
    ],
  },
  {
    guideSlug: "what-is-a-daily-trainer",
    primaryQuestion: "What is a daily trainer?",
    questions: [
      {
        id: "q1",
        question: "What is a daily trainer?",
        importance: "primary",
        answerCoverage: "answered",
      },
      {
        id: "q2",
        question: "How does it differ from race shoes?",
        importance: "secondary",
        answerCoverage: "answered",
      },
      {
        id: "q3",
        question: "Should beginners start here?",
        importance: "decision",
        answerCoverage: "answered",
      },
    ],
  },
];

const bySlug = new Map<string, GuideQuestionMap>();
for (const m of GUIDE_QUESTION_MAPS_ALL) bySlug.set(m.guideSlug, m);
for (const m of GUIDE_QUESTION_MAPS_CORE) bySlug.set(m.guideSlug, m);

export const GUIDE_QUESTION_MAPS: GuideQuestionMap[] = [...bySlug.values()];

export function getGuideQuestionMap(slug: string): GuideQuestionMap | undefined {
  return bySlug.get(slug);
}
