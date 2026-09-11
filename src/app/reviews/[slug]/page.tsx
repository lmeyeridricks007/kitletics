import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReviewDetailPage } from "@/components/review/ReviewDetailPage";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getReviewBySlug, getReviews, getProductById } from "@/repositories";
import { reviewMetadata } from "@/lib/seo/metadata";
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


/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const review = getReviewBySlug(slug);
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
  const review = getReviewBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!review) notFound();

  const elig = getLaunchEligibility({ kind: "review", entity: review });
  enforceLaunchEligibility(elig);

  const region = await getRequestRegion();
  const data = getReviewPageData(slug, {
    region,
    isDev: process.env.NODE_ENV !== "production",
  });
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
