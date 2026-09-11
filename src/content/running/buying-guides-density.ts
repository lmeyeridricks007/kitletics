import type { BuyingGuide } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import { RUNNING_DENSITY_PLANS } from "@/lib/guides/explainers/running-density-plans";

const pub = publishedMeta();

const TOPIC_BY_SLUG: Record<string, { topicIds: string[]; categoryId: string; guideType: BuyingGuide["guideType"] }> = {
  "optical-wrist-hr-vs-chest-strap": {
    topicIds: ["topic-wearables"],
    categoryId: "cat-hrm",
    guideType: "comparison",
  },
  "running-watch-battery-life-explained": {
    topicIds: ["topic-wearables"],
    categoryId: "cat-gps-watches",
    guideType: "explainer",
  },
  "maps-navigation-running-watches": {
    topicIds: ["topic-wearables"],
    categoryId: "cat-gps-watches",
    guideType: "explainer",
  },
  "beginner-vs-advanced-running-watch": {
    topicIds: ["topic-wearables"],
    categoryId: "cat-gps-watches",
    guideType: "decision",
  },
  "soft-flasks-vs-bladders-explained": {
    topicIds: ["topic-hydration"],
    categoryId: "cat-hydration",
    guideType: "comparison",
  },
  "how-to-choose-running-belt": {
    topicIds: ["topic-hydration"],
    categoryId: "cat-running-belts",
    guideType: "buying",
  },
  "handheld-bottles-for-running": {
    topicIds: ["topic-hydration"],
    categoryId: "cat-hydration",
    guideType: "buying",
  },
  "hydration-for-marathon-training": {
    topicIds: ["topic-hydration", "topic-training-racing"],
    categoryId: "cat-hydration",
    guideType: "decision",
  },
  "how-to-choose-running-socks": {
    topicIds: ["topic-apparel-accessories"],
    categoryId: "cat-running-socks",
    guideType: "buying",
  },
  "running-jackets-explained": {
    topicIds: ["topic-apparel-accessories"],
    categoryId: "cat-running-clothing",
    guideType: "explainer",
  },
  "hot-weather-running-apparel": {
    topicIds: ["topic-apparel-accessories"],
    categoryId: "cat-running-clothing",
    guideType: "decision",
  },
  "winter-layering-for-runners": {
    topicIds: ["topic-apparel-accessories"],
    categoryId: "cat-running-clothing",
    guideType: "setup",
  },
  "shoe-jobs-by-session-type": {
    topicIds: ["topic-training-racing", "topic-running-shoes"],
    categoryId: "cat-running-shoes",
    guideType: "decision",
  },
  "first-marathon-gear-checklist": {
    topicIds: ["topic-training-racing"],
    categoryId: "cat-running-shoes",
    guideType: "setup",
  },
  "trail-race-kit-essentials": {
    topicIds: ["topic-training-racing"],
    categoryId: "cat-hydration",
    guideType: "setup",
  },
  "beginner-running-gear-stack": {
    topicIds: ["topic-training-racing"],
    categoryId: "cat-running-shoes",
    guideType: "setup",
  },
  "when-to-use-a-massage-gun": {
    topicIds: ["topic-recovery"],
    categoryId: "cat-recovery-gear",
    guideType: "decision",
  },
  "recovery-sandals-for-runners": {
    topicIds: ["topic-recovery"],
    categoryId: "cat-recovery-gear",
    guideType: "buying",
  },
  "anti-chafe-for-runners": {
    topicIds: ["topic-apparel-accessories"],
    categoryId: "cat-accessories",
    guideType: "buying",
  },
};

const RELATED_GUIDES_BY_SLUG: Record<string, string[]> = {
  "soft-flasks-vs-bladders-explained": [
    "guide-choose-hydration-vest",
    "guide-vest-vs-belt",
    "guide-density-how-to-choose-running-belt",
    "guide-density-handheld-bottles-for-running",
  ],
  "running-jackets-explained": [
    "guide-density-winter-layering-for-runners",
    "guide-density-hot-weather-running-apparel",
  ],
  "winter-layering-for-runners": [
    "guide-density-running-jackets-explained",
    "guide-density-hot-weather-running-apparel",
  ],
  "when-to-use-a-massage-gun": [
    "guide-massage-guns-explained",
    "guide-foam-rolling-runners",
    "guide-recovery-tools-evidence",
  ],
  "anti-chafe-for-runners": [
    "guide-density-how-to-choose-running-socks",
    "guide-density-beginner-running-gear-stack",
  ],
};

/**
 * BuyingGuide seeds generated from density long-form plans.
 * Hub registration lives in guide-hub-config.ts.
 */
export const runningDensityBuyingGuides: BuyingGuide[] = RUNNING_DENSITY_PLANS.map(
  (plan, index) => {
    const meta = TOPIC_BY_SLUG[plan.slug];
    if (!meta) {
      throw new Error(`Missing topic meta for density guide ${plan.slug}`);
    }
    const relatedProductIds = [
      ...new Set(
        [
          ...(plan.productExampleRoles?.map((r) => r.productId) ?? []),
          ...(plan.examples?.items.map((i) => i.productId) ?? []),
          ...(plan.compareProductIds ?? []),
        ].filter(Boolean),
      ),
    ];

    return {
      id: `guide-density-${plan.slug}`,
      slug: plan.slug,
      title: plan.displayTitle,
      subtitle: plan.deck,
      shortDescription: plan.deck,
      sportId: "sport-running",
      categoryId: meta.categoryId,
      relatedProductIds,
      relatedUseCaseIds:
        plan.slug === "anti-chafe-for-runners"
          ? ["uc-long-runs", "uc-marathon", "uc-ultra", "uc-half"]
          : [],
      quickAnswer: plan.quickAnswerBullets.join(" "),
      sections: [
        {
          id: "s-def",
          heading: plan.definition.title,
          body: plan.definition.paragraphs.join("\n\n"),
        },
        ...(plan.factors
          ? [
              {
                id: "s-factors",
                heading: plan.factors.title,
                body: plan.factors.cards
                  .map(
                    (c) =>
                      `${c.title}: ${c.whatItIs} ${c.howItChanges} ${c.whatYouNotice}`,
                  )
                  .join("\n\n"),
              },
            ]
          : []),
        ...(plan.mistakes
          ? [
              {
                id: "s-mistakes",
                heading: "Common mistakes",
                body: plan.mistakes.map((m) => `${m.title}: ${m.body}`).join("\n\n"),
              },
            ]
          : []),
      ],
      faqIds: [],
      authorId: "author-kitletics-editorial",
      relatedBestGuideIds:
        plan.slug === "anti-chafe-for-runners"
          ? ["best-running-anti-chafe"]
          : [],
      relatedToolSlugs:
        plan.slug === "anti-chafe-for-runners"
          ? ["running-accessories-finder"]
          : [],
      relatedGuideIds: RELATED_GUIDES_BY_SLUG[plan.slug] ?? [],
      guideType: meta.guideType,
      topicIds: meta.topicIds,
      priority: 40 + index,
      hubImageSrc: plan.heroImageSrc,
      hubImageAlt: plan.heroImageAlt,
      seoTitle: `${plan.displayTitle} | Kitletics`,
      seoDescription: plan.deck,
      ...pub,
    };
  },
);
