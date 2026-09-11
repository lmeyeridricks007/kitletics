import { HyroxRaceCalculatorClient } from "@/components/hyrox/HyroxRaceCalculatorClient";
import { HyroxRaceKitBuilderClient } from "@/components/hyrox/HyroxRaceKitBuilderClient";
import { JsonLdScript, webApplicationJsonLd } from "@/lib/seo/jsonld";

export function renderHyroxRaceCalculatorPage(tool: {
  name: string;
  description: string;
  slug: string;
}) {
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: tool.name,
          description: tool.description,
          url: `/tools/${tool.slug}`,
        })}
      />
      <HyroxRaceCalculatorClient />
    </>
  );
}

export function renderHyroxRaceKitBuilderPage(tool: {
  name: string;
  description: string;
  slug: string;
}) {
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: tool.name,
          description: tool.description,
          url: `/tools/${tool.slug}`,
        })}
      />
      <HyroxRaceKitBuilderClient />
    </>
  );
}
