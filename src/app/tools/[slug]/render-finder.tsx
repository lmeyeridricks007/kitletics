import { FinderFlow } from "@/components/finder/FinderFlow";
import { Suspense } from "react";
import { getFinderDefinition } from "@/domain/finders/repository";
import { decodeFinderShareState } from "@/domain/finders/share-state";
import { getProductById, getToolBySlug } from "@/repositories";
import {
  JsonLdScript,
  webApplicationJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/jsonld";
import { getFinderUiConfig } from "@/lib/finder/finder-ui-config";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { RegionCode } from "@/domain/shared/types";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Finder-only server entry — keep catalog-heavy tool clients out of this module. */
export async function renderFinderToolPage(input: {
  slug: string;
  region: RegionCode;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { slug, region, searchParams: sp } = input;
  const tool = getToolBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  const finder = getFinderDefinition(slug, region);
  if (!tool || !finder) return null;

  const uiConfig = getFinderUiConfig(finder.slug);

  const s = firstParam(sp.s);
  const edit = firstParam(sp.edit);
  const fixture = firstParam(sp.fixture);
  let initialResponses = {};
  let startAtSummary = false;
  if (s) {
    const decoded = decodeFinderShareState(s, slug);
    if (decoded.ok) {
      initialResponses = decoded.responses;
      startAtSummary = edit === "1";
    }
  }
  const enableVisualFixture =
    process.env.NODE_ENV === "development" && fixture === "visual-reference";

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: tool.name, href: `/tools/${slug}` },
          ]),
          webApplicationJsonLd({
            name: finder.title,
            description: finder.description,
            url: `/tools/${slug}`,
          }),
        ]}
      />
      <Suspense fallback={null}>
        <FinderFlow
          definition={finder}
          uiConfig={uiConfig}
          initialResponses={initialResponses}
          startAtSummary={startAtSummary}
          region={region}
          enableVisualFixture={enableVisualFixture}
          heroProducts={(uiConfig.heroProductIds ?? [])
            .map((id) => {
              const product = getProductById(id, { isDev: false });
              if (!product) return null;
              const media = getPrimaryProductMedia(product);
              if (!media) return null;
              return {
                id: product.id,
                src: media.src,
                alt: media.alt || product.fullName,
              };
            })
            .filter((x): x is NonNullable<typeof x> => Boolean(x))}
        />
      </Suspense>
    </>
  );
}
