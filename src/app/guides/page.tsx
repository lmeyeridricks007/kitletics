import type { Metadata } from "next";
import { GuidesHubPage } from "@/components/guides-hub/GuidesHubPage";
import { getCachedGuidesHubData } from "@/lib/performance/cached-hubs";
import { siteConfig } from "@/content/config";
import { getSportBySlug } from "@/repositories";

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ sport?: string; topic?: string; domain?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sport: sportSlug, domain, topic } = await searchParams;
  const { NOINDEX_FOLLOW } = await import("@/lib/seo/query-state");

  if (domain === "shoes") {
    return {
      title: "Shoe Guides & Buying Advice",
      description:
        "Practical shoe guides covering running and training footwear, with explainers, comparisons and decision tools.",
      alternates: {
        canonical: `${siteConfig.url}/guides?domain=shoes`,
      },
      robots: topic ? NOINDEX_FOLLOW : undefined,
    };
  }
  const sport = sportSlug ? getSportBySlug(sportSlug) : undefined;

  if (sport?.slug === "running") {
    return {
      title: "Running Gear Guides & Buying Advice",
      description:
        "Practical running gear guides covering shoes, watches, hydration and more, with explainers, comparisons and decision tools.",
      alternates: {
        canonical: `${siteConfig.url}/guides?sport=running`,
      },
      robots: topic ? NOINDEX_FOLLOW : undefined,
    };
  }

  if (sport) {
    return {
      title: `${sport.name} Gear Guides & Buying Advice`,
      description: `Practical ${sport.name.toLowerCase()} gear guides — buying advice, explainers, comparisons and decision tools.`,
      alternates: {
        canonical: `${siteConfig.url}/guides?sport=${sport.slug}`,
      },
      robots: topic ? NOINDEX_FOLLOW : undefined,
    };
  }

  return {
    title: "Gear Guides & Buying Advice",
    description:
      "Practical buying guides, explainers and comparison advice to help you understand sports gear before you buy.",
    alternates: { canonical: `${siteConfig.url}/guides` },
    robots: topic ? NOINDEX_FOLLOW : undefined,
  };
}

export default async function GuidesIndexPage({ searchParams }: PageProps) {
  const { sport: sportSlug, topic, domain } = await searchParams;
  const shoesDomain = domain === "shoes";
  const data = await getCachedGuidesHubData({
    sportSlug: shoesDomain ? undefined : sportSlug,
    domain: shoesDomain ? "shoes" : undefined,
  });

  // Optional topic focus — filter topic sections without inventing SEO pages
  const filtered =
    topic && data.topics.some((t) => t.topic.slug === topic)
      ? {
          ...data,
          topics: data.topics.filter((t) => t.topic.slug === topic),
        }
      : data;

  return <GuidesHubPage data={filtered} />;
}
