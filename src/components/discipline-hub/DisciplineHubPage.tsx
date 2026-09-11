import { JsonLdScript, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import type { DisciplineHubPageData } from "@/lib/discipline-hub/types";
import { DisciplineHero } from "@/components/discipline-hub/DisciplineHero";
import { DisciplineLocalNav } from "@/components/discipline-hub/DisciplineLocalNav";
import { DisciplineHubBody } from "@/components/discipline-hub/DisciplineHubBody";

export function DisciplineHubPage({ data }: { data: DisciplineHubPageData }) {
  const crumbLd = breadcrumbJsonLd(data.breadcrumbs);

  const productLd =
    data.products && data.products.items.length > 0
      ? itemListJsonLd(
          data.products.title,
          data.products.items.map((p) => ({
            name: p.fullName,
            url: p.href,
          })),
        )
      : null;

  return (
    <div
      className="bg-white"
      data-discipline-hub={`${data.sportSlug}/${data.disciplineSlug}`}
      data-focus-mode={data.focusCard.mode}
    >
      <JsonLdScript data={crumbLd} />
      {productLd && <JsonLdScript data={productLd} />}

      <DisciplineHero
        breadcrumbs={data.breadcrumbs}
        eyebrow={data.eyebrow}
        hero={data.hero}
        pillars={data.pillars}
        focusCard={data.focusCard}
      />
      <DisciplineLocalNav items={data.localNav} />
      <DisciplineHubBody data={data} />
    </div>
  );
}
