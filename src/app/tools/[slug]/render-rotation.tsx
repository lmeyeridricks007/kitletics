import { RotationFlow } from "@/components/rotation/RotationFlow";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  JsonLdScript,
  webApplicationJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/jsonld";
import { decodeRotationShareState } from "@/domain/shoe-rotation/share-state";
import { buildCompareProductIndex } from "@/lib/comparison/product-index";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function renderShoeRotationPlannerPage(input: {
  slug: string;
  toolDescription: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { slug, toolDescription, searchParams: sp } = input;
  const s = firstParam(sp.s);
  const edit = firstParam(sp.edit);
  const owned = firstParam(sp.owned);
  let initialResponses = undefined;
  let startAtSummary = false;
  if (s) {
    const decoded = decodeRotationShareState(s);
    if (decoded.ok) {
      initialResponses = decoded.responses;
      startAtSummary = edit === "1";
    }
  }
  const index = buildCompareProductIndex({ isDev: false }).filter(
    (i) => i.categoryId === "cat-running-shoes",
  );
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            {
              label: "Shoe Rotation Planner",
              href: `/tools/${slug}`,
            },
          ]),
          webApplicationJsonLd({
            name: "Running Shoe Rotation Planner",
            description: toolDescription,
            url: `/tools/${slug}`,
          }),
        ]}
      />
      <div className="border-b border-border bg-mesh">
        <Container className="py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Shoe Rotation Planner" },
            ]}
          />
        </Container>
      </div>
      <RotationFlow
        productIndex={index}
        initialResponses={initialResponses}
        startAtSummary={startAtSummary}
        preselectOwnedId={owned}
      />
    </>
  );
}
