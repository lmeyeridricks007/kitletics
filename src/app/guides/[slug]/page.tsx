import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LongFormGuidePage } from "@/components/guides/LongFormGuidePage";
import { getLongFormGuidePageData } from "@/lib/guides/get-long-form-guide-page-data";
import { getBuyingGuideBySlug, getBuyingGuides } from "@/repositories";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { siteConfig } from "@/content/config";
import {
  getLaunchEligibility,
  isLaunchPreviewContext,
} from "@/domain/launch";
import {
  enforceLaunchEligibility,
  withLaunchRobots,
} from "@/lib/launch/apply-eligibility";
import { LaunchEligibilityDebug } from "@/components/launch/LaunchEligibilityDebug";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBuyingGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getBuyingGuideBySlug(slug);
  if (!guide) return { title: "Guide" };

  const config = getLongFormGuideConfig(slug);
  const title = config?.displayTitle
    ? `${guide.title} | Complete Buying Guide`
    : guide.title;
  const description =
    config?.deck ??
    guide.shortDescription ??
    guide.subtitle ??
    `Learn how to choose with Kitletics.`;

  const elig = getLaunchEligibility({ kind: "buying-guide", entity: guide });
  return withLaunchRobots(
    {
      title,
      description,
      alternates: { canonical: `${siteConfig.url}/guides/${slug}` },
      openGraph: {
        title: `${title} | Kitletics`,
        description,
        url: `${siteConfig.url}/guides/${slug}`,
        siteName: siteConfig.name,
        ...(config?.heroImageSrc
          ? { images: [{ url: config.heroImageSrc }] }
          : {}),
      },
    },
    elig,
  );
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getBuyingGuideBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!guide) notFound();

  const elig = getLaunchEligibility({ kind: "buying-guide", entity: guide });
  enforceLaunchEligibility(elig);

  const data = getLongFormGuidePageData(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!data) notFound();

  return (
    <>
      <LongFormGuidePage data={data} />
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
