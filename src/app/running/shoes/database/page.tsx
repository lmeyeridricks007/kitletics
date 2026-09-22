import type { Metadata } from "next";
import { RunningShoeDatabasePage } from "@/components/running-shoe-database/RunningShoeDatabasePage";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database";
import { siteConfig } from "@/content/config";

/** Derived compact catalog view — ISR-friendly (no request cookies). */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = getRunningShoeDatabasePageData();
  const year = new Date().getFullYear();
  const count = page.total;
  const title = `Running Shoe Database ${year} | Compare ${count} Running Shoes | Kitletics`;
  const description = page.description;
  const canonical = `${siteConfig.url}${page.path}`;

  return {
    title,
    description,
    alternates: { canonical },
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
