import { JsonLdScript, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import type { SportHubPageData } from "@/lib/sport-hub/types";
import { SportHubHero } from "@/components/sport-hub/SportHubHero";
import { RunningFitLinks } from "@/components/sport-hub/RunningFitLinks";
import { PadelChooseLinks } from "@/components/sport-hub/PadelChooseLinks";
import { SportCategoryNav } from "@/components/sport-hub/SportCategoryNav";
import { SportFeaturedAndFinder } from "@/components/sport-hub/SportFeaturedAndFinder";
import { SportMoreBestSections } from "@/components/sport-hub/SportMoreBestSections";
import { SportTrustRow } from "@/components/sport-hub/SportTrustRow";
import { SportGuidesAndComparisons } from "@/components/sport-hub/SportGuidesAndComparisons";
import { SportLatestReviews } from "@/components/sport-hub/SportLatestReviews";
import { SportStarterKit } from "@/components/sport-hub/SportStarterKit";
import { SportBrands } from "@/components/sport-hub/SportBrands";
import { SportHubFooter } from "@/components/sport-hub/SportHubFooter";
import { Suspense } from "react";

export function SportHubPage({
  data,
}: {
  data: SportHubPageData;
}) {
  const crumbLd = breadcrumbJsonLd(data.breadcrumbs);

  const productLd =
    data.bestSection && data.bestSection.products.length > 0
      ? itemListJsonLd(
          data.bestSection.title,
          data.bestSection.products.map((p) => ({
            name: p.fullName,
            url: p.href,
          })),
        )
      : null;

  return (
    <div className="overflow-x-hidden bg-white" data-sport-hub={data.sportSlug}>
      <JsonLdScript data={crumbLd} />
      {productLd && <JsonLdScript data={productLd} />}

      <SportHubHero
        breadcrumbs={data.breadcrumbs}
        hero={data.hero}
        quickActions={data.quickActions}
      />
      {data.sportSlug === "running" && (
        <Suspense fallback={null}>
          <RunningFitLinks />
        </Suspense>
      )}
      {data.sportSlug === "padel" && <PadelChooseLinks />}
      <SportCategoryNav
        categories={data.shopCategories}
        groups={data.shopGroups}
      />
      <SportFeaturedAndFinder
        bestSection={data.bestSection}
        finder={data.finder}
      />
      <SportMoreBestSections sections={data.moreBestSections} />
      <SportTrustRow benefits={data.benefits} />
      <SportGuidesAndComparisons
        guides={data.guides}
        comparisons={data.comparisons}
      />
      {data.reviews && <SportLatestReviews reviews={data.reviews} />}
      {data.starterKit && <SportStarterKit starterKit={data.starterKit} />}
      <SportBrands brands={data.brands} />
      <SportHubFooter footer={data.footer} />
    </div>
  );
}
