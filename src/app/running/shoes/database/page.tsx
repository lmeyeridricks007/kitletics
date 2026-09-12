import type { Metadata } from "next";
import { RunningShoeDatabasePage } from "@/components/running-shoe-database/RunningShoeDatabasePage";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database";
import { siteConfig } from "@/content/config";
import {
  hasNonCanonicalQueryState,
  NOINDEX_FOLLOW,
} from "@/lib/seo/query-state";

/** Derived compact catalog view — ISR-friendly (no request cookies). */
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = getRunningShoeDatabasePageData();
  const year = new Date().getFullYear();
  const count = page.total;
  const title = `Running Shoe Database ${year} | Compare ${count} Running Shoes | Kitletics`;
  const description = page.description;
  const canonical = `${siteConfig.url}${page.path}`;
  const queryBlocked = hasNonCanonicalQueryState(sp);

  return {
    title,
    description,
    alternates: { canonical },
    robots: queryBlocked ? NOINDEX_FOLLOW : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RunningShoeDatabaseRoute() {
  const data = getRunningShoeDatabasePageData();
  return <RunningShoeDatabasePage data={data} />;
}
