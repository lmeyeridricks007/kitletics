import type { Metadata } from "next";
import { PadelRacketDatabasePage } from "@/components/padel-racket-database/PadelRacketDatabasePage";
import { getPadelRacketDatabasePageData } from "@/lib/padel-racket-database";
import { siteConfig } from "@/content/config";
import {
  hasNonCanonicalQueryState,
  NOINDEX_FOLLOW,
} from "@/lib/seo/query-state";
import {
  resolveEntityVerticalPolicy,
  verticalAllowsIndexation,
} from "@/content/launch/vertical-strategy";

/** Derived compact catalog view — ISR-friendly (no request cookies). */
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function padelDatabaseHeld(): boolean {
  const policy = resolveEntityVerticalPolicy(["sport-padel"]);
  return !verticalAllowsIndexation(policy, "sport");
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPadelRacketDatabasePageData();
  const year = new Date().getFullYear();
  const count = page.total;
  const title = `Padel Racket Database ${year} | Compare ${count} Rackets | Kitletics`;
  const description = page.description;
  const canonical = `${siteConfig.url}${page.path}`;
  const queryBlocked = hasNonCanonicalQueryState(sp);
  const verticalHeld = padelDatabaseHeld();

  return {
    title,
    description,
    alternates: { canonical },
    // The clean database URL follows padel hub launch permission.
    // Filtered query states remain noindex.
    robots:
      verticalHeld || queryBlocked
        ? NOINDEX_FOLLOW
        : undefined,
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

export default function PadelRacketDatabaseRoute() {
  const data = getPadelRacketDatabasePageData();
  return <PadelRacketDatabasePage data={data} />;
}
