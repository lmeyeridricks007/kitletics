import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/search/SearchResultsClient";
import { siteConfig } from "@/content/config";

/**
 * Empty search shell — ISR. Query state is client-only.
 * Do not ISR `/search?q=*`. robots.txt disallows /search.
 */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Search",
  description: "Search Kitletics products, brands, guides and tools.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/search` },
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsClient />
    </Suspense>
  );
}
