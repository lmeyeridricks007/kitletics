import { Suspense } from "react";
import { JsonLdScript, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import type { GearHubPageData } from "@/lib/gear-hub/types";
import { GearHubHero } from "@/components/gear-hub/GearHubHero";
import { GearHubBody } from "@/components/gear-hub/GearHubBody";

export function GearHubPage({ data }: { data: GearHubPageData }) {
  const crumbLd = breadcrumbJsonLd(data.breadcrumbs);

  return (
    <div className="bg-white" data-gear-hub>
      <JsonLdScript data={crumbLd} />
      <GearHubHero breadcrumbs={data.breadcrumbs} hero={data.hero} />
      <Suspense fallback={null}>
        <GearHubBody data={data} />
      </Suspense>
    </div>
  );
}
