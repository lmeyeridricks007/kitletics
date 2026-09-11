import type { Metadata } from "next";
import { siteConfig } from "@/content/config";
import { getRequestRegion } from "@/lib/region/server";
import {
  getGearHubData,
  parseGearHubFilters,
} from "@/lib/gear-hub";
import { GearHubPage } from "@/components/gear-hub/GearHubPage";


/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sports Gear & Equipment",
  description:
    "Explore sports gear across running, fitness, racket sports and more, with tools, comparisons and buying guides.",
  alternates: {
    canonical: `${siteConfig.url}/gear`,
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GearRoutePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const region = await getRequestRegion();
  const filters = parseGearHubFilters(sp);
  const data = getGearHubData({ region, filters });

  return <GearHubPage data={data} />;
}
