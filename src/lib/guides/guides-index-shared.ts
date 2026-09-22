import type { GuidesHubSportConfig } from "@/lib/guides/guide-hub-config";
import type { GuideTopic } from "@/lib/guides/guide-topics";

export type CompactGuideRef = {
  id: string;
  slug: string;
  title: string;
};

export type CompactGuidesHubCard = {
  guide: CompactGuideRef;
  typeLabel: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  readingMinutes: number;
  updatedLabel?: string;
  href: string;
};

export type CompactBestGuideCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  recCount: number;
  image: { src: string; alt: string };
};

export type CompactGuideReviewCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  reviewType: "first-hand-test" | "expert-research" | "hybrid";
  score: number;
  href: string;
  productName: string;
  brandName?: string;
  image?: { src: string; alt: string };
};

export type CompactGuidesHubPageData = {
  sport?: { id: string; slug: string; name: string };
  domain?: "shoes";
  config?: Omit<GuidesHubSportConfig, "guideMeta">;
  allSportsWithGuides: { id: string; slug: string; name: string }[];
  guideCount: number;
  buyingCount: number;
  explainerCount: number;
  toolCount: number;
  featuredGuide?: CompactGuidesHubCard;
  startHereGuides: CompactGuidesHubCard[];
  topics: {
    topic: GuideTopic;
    featured?: CompactGuidesHubCard;
    guides: CompactGuidesHubCard[];
  }[];
  buyingGuides: CompactGuidesHubCard[];
  explainers: CompactGuidesHubCard[];
  decisionGuides: CompactGuidesHubCard[];
  relatedBestGuides: CompactBestGuideCard[];
  reviews: CompactGuideReviewCard[];
  tools: { id: string; slug: string; name: string }[];
  recentlyUpdated: CompactGuidesHubCard[];
  breadcrumbs: { label: string; href?: string }[];
  compareHref?: string;
};

export type GuidesIndexShellData = {
  all: CompactGuidesHubPageData;
  shoes: CompactGuidesHubPageData;
  bySport: Record<string, CompactGuidesHubPageData>;
};
