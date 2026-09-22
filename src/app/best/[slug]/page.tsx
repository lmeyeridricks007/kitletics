import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BestGuideDetailPage } from "@/components/best/BestGuideDetailPage";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getBestGuideBySlug } from "@/repositories";
import { bestGuideMetadata } from "@/lib/seo/metadata";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { CatalogPriceIsland } from "@/components/commerce/CatalogPriceIsland";
import { getBestGuideCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
import {
  getLaunchEligibility,
  isLaunchPreviewContext,
} from "@/domain/launch";
import {
  enforceLaunchEligibility,
  withLaunchRobots,
} from "@/lib/launch/apply-eligibility";
import { LaunchEligibilityDebug } from "@/components/launch/LaunchEligibilityDebug";

/**
 * Canonical best guide — on-demand ISR.
 * Editorial HTML is DEFAULT_REGION (NL). Regional card prices hydrate from
 * GET /api/best/[slug]/commerce/[region]. Do not read cookies here.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

function guidePublishOptions() {
  return { isDev: process.env.NODE_ENV !== "production" } as const;
}

const getCachedGuide = cache((slug: string) =>
  getBestGuideBySlug(slug, guidePublishOptions()),
);

const getCachedGuidePageData = cache((slug: string) =>
  getBestGuidePageData(slug, {
    region: DEFAULT_REGION,
    ...guidePublishOptions(),
  }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCachedGuide(slug);
  if (!guide) return { title: "Best guide" };
  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide });
  return withLaunchRobots(bestGuideMetadata(guide), elig);
}

export default async function BestGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getCachedGuide(slug);
  if (!guide) notFound();

  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide });
  enforceLaunchEligibility(elig);

  const data = getCachedGuidePageData(slug);
  if (!data) notFound();

  const initialMap = getBestGuideCatalogPrices(slug, DEFAULT_REGION) ?? {
    region: DEFAULT_REGION,
    regionLabel: "Netherlands",
    currency: "EUR",
    products: {},
  };

  return (
    <>
      <CatalogPriceIsland
        endpoint={`/api/best/${encodeURIComponent(slug)}/commerce`}
        initialMap={initialMap}
      >
        <BestGuideDetailPage data={data} />
      </CatalogPriceIsland>
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
