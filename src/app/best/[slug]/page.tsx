import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BestGuideDetailPage } from "@/components/best/BestGuideDetailPage";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getBestGuideBySlug, getBestGuides } from "@/repositories";
import { bestGuideMetadata } from "@/lib/seo/metadata";
import { getRequestRegion } from "@/lib/region/server";
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
  return getBestGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getBestGuideBySlug(slug);
  if (!guide) return { title: "Best guide" };
  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide });
  return withLaunchRobots(bestGuideMetadata(guide), elig);
}

export default async function BestGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getBestGuideBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!guide) notFound();

  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide });
  enforceLaunchEligibility(elig);

  const region = await getRequestRegion();
  const data = getBestGuidePageData(slug, {
    region,
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!data) notFound();

  return (
    <>
      <BestGuideDetailPage data={data} />
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
