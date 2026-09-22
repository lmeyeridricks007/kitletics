import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReviewDetailPage } from "@/components/review/ReviewDetailPage";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getReviewBySlug, getProductById } from "@/repositories";
import { reviewMetadata } from "@/lib/seo/metadata";
import { DEFAULT_REGION } from "@/domain/shared/types";
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
 * Canonical review — on-demand ISR.
 * Editorial HTML is DEFAULT_REGION (NL). Regional prices hydrate from
 * GET /api/products/[productSlug]/commerce/[region]. Do not read cookies here.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Empty list → first legitimate request generates, then Incremental Cache. */
export function generateStaticParams() {
  return [];
}

function reviewPublishOptions() {
  return { isDev: process.env.NODE_ENV !== "production" } as const;
}

const getCachedReview = cache((slug: string) =>
  getReviewBySlug(slug, reviewPublishOptions()),
);

const getCachedReviewPageData = cache((slug: string) =>
  getReviewPageData(slug, {
    region: DEFAULT_REGION,
    ...reviewPublishOptions(),
  }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const review = getCachedReview(slug);
  if (!review) return { title: "Review" };
  const product = getProductById(review.productId);
  const elig = getLaunchEligibility({ kind: "review", entity: review });
  return withLaunchRobots(
    reviewMetadata(review, product?.fullName ?? "Product"),
    elig,
  );
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const review = getCachedReview(slug);
  if (!review) notFound();

  const elig = getLaunchEligibility({ kind: "review", entity: review });
  enforceLaunchEligibility(elig);

  const data = getCachedReviewPageData(slug);
  if (!data) notFound();

  return (
    <>
      <ReviewDetailPage data={data} />
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
