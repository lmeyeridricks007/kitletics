import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewsIndexClient } from "@/components/reviews-hub/ReviewsIndexClient";
import { getReviewsIndexShellData } from "@/lib/review/get-reviews-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Expert research and personally tested product reviews — organised by category, not a blog feed.",
  alternates: { canonical: `${siteConfig.url}/reviews` },
};

export default function ReviewsIndexPage() {
  const data = getReviewsIndexShellData();
  return (
    <Suspense fallback={null}>
      <ReviewsIndexClient data={data} />
    </Suspense>
  );
}
