import { HomeGymBuilderClient } from "@/components/builders/HomeGymBuilderClient";
import { JsonLdScript, webApplicationJsonLd } from "@/lib/seo/jsonld";
import { fitnessProducts } from "@/content/fitness";
import { offers } from "@/content/offers";

/** Isolated so fitness catalog never joins Finder First Load. */
export function renderHomeGymToolPage(tool: {
  name: string;
  description: string;
  slug: string;
}) {
  const products = fitnessProducts.filter((p) => p.status === "published");
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: tool.name,
          description: tool.description,
          url: `/tools/${tool.slug}`,
        })}
      />
      <HomeGymBuilderClient products={products} offers={offers} />
    </>
  );
}
