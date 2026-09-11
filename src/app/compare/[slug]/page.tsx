import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import {
  getComparisonPageData,
  resolveCanonicalComparisonSlug,
} from "@/lib/comparison/get-comparison-page-data";
import { getComparisonBySlug, getComparisons } from "@/repositories";
import { comparisonMetadata } from "@/lib/seo/metadata";
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
  return getComparisons().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonical = resolveCanonicalComparisonSlug(slug);
  if (canonical) {
    return {
      title: "Comparison",
      alternates: { canonical: `/compare/${canonical}` },
      robots: { index: false, follow: false },
    };
  }
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return { title: "Comparison" };
  const elig = getLaunchEligibility({
    kind: "comparison",
    entity: comparison,
  });
  return withLaunchRobots(comparisonMetadata(comparison), elig);
}

export default async function ComparisonSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const canonical = resolveCanonicalComparisonSlug(slug, { isDev: false });
  if (canonical) {
    permanentRedirect(`/compare/${canonical}`);
  }

  const comparison = getComparisonBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!comparison) notFound();

  const elig = getLaunchEligibility({
    kind: "comparison",
    entity: comparison,
  });
  enforceLaunchEligibility(elig);

  const data = getComparisonPageData(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!data) notFound();

  return (
    <>
      <ComparisonPage data={data} />
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
