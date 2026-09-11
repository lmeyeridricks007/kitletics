/**
 * Normalized guide topics for Guides Hub grouping.
 */

export interface GuideTopic {
  id: string;
  slug: string;
  label: string;
  summary: string;
  sportIds: string[];
}

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "topic-running-shoes",
    slug: "running-shoes",
    label: "Running shoes",
    summary:
      "How to choose, understand cushioning, stability, plates and rotation.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-wearables",
    slug: "wearables",
    label: "Wearables",
    summary: "GPS watches, heart-rate monitors and related training tech.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-hydration",
    slug: "hydration",
    label: "Hydration",
    summary: "Vests, belts and how to carry fluid on the run.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-apparel-accessories",
    slug: "apparel-accessories",
    label: "Apparel & accessories",
    summary: "Socks, jackets, headlamps, headphones and related run accessories.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-fuel-nutrition",
    slug: "fuel-nutrition",
    label: "Fuel & nutrition",
    summary: "Gels, drink mixes, chews and how to carry fuel on long runs.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-recovery",
    slug: "recovery",
    label: "Recovery",
    summary: "Massage tools, rollers and evidence-aware recovery gear.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-training-racing",
    slug: "training-racing",
    label: "Training & racing",
    summary: "Session types, race kits and training setups.",
    sportIds: ["sport-running"],
  },
  {
    id: "topic-fitness-equipment",
    slug: "fitness-equipment",
    label: "Fitness equipment",
    summary: "Home gym, racks, cardio machines and training gear.",
    sportIds: ["sport-fitness", "sport-hyrox"],
  },
  {
    id: "topic-racket",
    slug: "racket",
    label: "Rackets & shoes",
    summary: "Padel and tennis gear explainers and buying advice.",
    sportIds: ["sport-padel", "sport-tennis", "sport-racket"],
  },
];

export function getGuideTopicById(id: string): GuideTopic | undefined {
  return GUIDE_TOPICS.find((t) => t.id === id);
}

export function getGuideTopicsForSport(sportId: string): GuideTopic[] {
  return GUIDE_TOPICS.filter((t) => t.sportIds.includes(sportId));
}

export const GUIDE_TYPE_LABEL: Record<string, string> = {
  buying: "Buying guide",
  explainer: "Explainer",
  comparison: "Comparison",
  setup: "Setup guide",
  decision: "Decision guide",
  technical: "Technical guide",
};
