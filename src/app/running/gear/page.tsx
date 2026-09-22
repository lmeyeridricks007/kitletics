import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/content/config";
import { getRunningGearHubData } from "@/lib/running-gear-hub";
import { RunningGearHubClient } from "@/components/running-gear/RunningGearHubClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Running Gear: Shop Shoes, Watches, Hydration & More",
  description:
    "Browse Kitletics running gear by category — shoes, GPS watches, hydration, packs, clothing, fuel and recovery. Start with the shoe or hydration finder.",
  alternates: {
    canonical: `${siteConfig.url}/running/gear`,
  },
};

export default function RunningGearPage() {
  const data = getRunningGearHubData();
  return (
    <Suspense fallback={null}>
      <RunningGearHubClient data={data} />
    </Suspense>
  );
}
