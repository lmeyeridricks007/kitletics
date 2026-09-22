import type { Metadata } from "next";
import { Suspense } from "react";
import { GuidesIndexClient } from "@/components/guides-hub/GuidesIndexClient";
import { getGuidesIndexShellData } from "@/lib/guides/get-guides-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Gear Guides & Buying Advice",
  description:
    "Practical buying guides, explainers and comparison advice to help you understand sports gear before you buy.",
  alternates: { canonical: `${siteConfig.url}/guides` },
};

export default function GuidesIndexPage() {
  const data = getGuidesIndexShellData();
  return (
    <Suspense fallback={null}>
      <GuidesIndexClient data={data} />
    </Suspense>
  );
}
