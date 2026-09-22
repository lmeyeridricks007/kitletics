import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getToolBySlug } from "@/repositories";
import {
  JsonLdScript,
  webApplicationJsonLd,
} from "@/lib/seo/jsonld";
import { siteConfig } from "@/content/config";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { getCalculatorDefinition } from "@/domain/calculators/registry";
import { getToolHref } from "@/lib/tools/href";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";

/**
 * Calculator / tool landings — ISR. Inputs are client state.
 * Do not read cookies or searchParams in this RSC.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isFinderToolSlug(slug)) {
    const tool = getToolBySlug(slug);
    if (!tool) return { title: "Tool" };
    return {
      title: tool.seoTitle ?? tool.name,
      description: tool.seoDescription ?? tool.description,
      alternates: { canonical: `${siteConfig.url}/tools/${tool.slug}` },
    };
  }
  const calc = getCalculatorDefinition(slug);
  if (calc) {
    return {
      title: calc.seoTitle ?? calc.title,
      description: calc.seoDescription ?? calc.description,
      alternates: { canonical: `${siteConfig.url}/tools/${slug}` },
    };
  }
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.seoTitle ?? tool.name,
    description: tool.seoDescription ?? tool.description,
    alternates: { canonical: `${siteConfig.url}/tools/${tool.slug}` },
  };
}

/**
 * Non-Finder tools only. Finders live at `/tools/finder/[slug]` (rewritten
 * from `/tools/<slug>`) so their client graph never includes Home Gym catalogs.
 */
export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;

  if (isFinderToolSlug(slug)) {
    notFound();
  }

  const tool = getToolBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!tool || tool.status !== "published") notFound();

  const canonicalHref = getToolHref(tool);
  if (canonicalHref !== `/tools/${slug}`) {
    permanentRedirect(canonicalHref);
  }

  const emptyParams = {} as Record<string, string | string[] | undefined>;

  if (slug === "running-pace-calculator") {
    const { renderPaceCalculatorPage } = await import("./render-calculators");
    return renderPaceCalculatorPage({ slug, searchParams: emptyParams });
  }

  if (slug === "race-time-predictor") {
    const { renderRacePredictorPage } = await import("./render-calculators");
    return renderRacePredictorPage({ slug, searchParams: emptyParams });
  }

  if (slug === "shoe-rotation-planner") {
    const { renderShoeRotationPlannerPage } = await import("./render-rotation");
    return renderShoeRotationPlannerPage({
      slug,
      toolDescription: tool.description,
      searchParams: emptyParams,
    });
  }

  if (slug === "home-gym-builder") {
    const { renderHomeGymToolPage } = await import("./render-home-gym");
    return renderHomeGymToolPage(tool);
  }

  if (slug === "hyrox-race-time-calculator") {
    const { renderHyroxRaceCalculatorPage } = await import("./render-hyrox");
    return renderHyroxRaceCalculatorPage(tool);
  }

  if (slug === "hyrox-race-kit-builder") {
    const { renderHyroxRaceKitBuilderPage } = await import("./render-hyrox");
    return renderHyroxRaceKitBuilderPage(tool);
  }

  if (slug === "one-rep-max-calculator" || slug === "plate-calculator") {
    const { renderStrengthCalculatorsPage } = await import(
      "./render-calculators"
    );
    return renderStrengthCalculatorsPage({ slug, tool });
  }

  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: tool.name,
          description: tool.description,
          url: `/tools/${tool.slug}`,
        })}
      />
      <div className="bg-mesh">
        <Container className="py-10 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: tool.name },
            ]}
            className="mb-10"
          />
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="accent" className="mb-4">
              {tool.type}
              {!tool.available ? " · Coming soon" : ""}
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {tool.name}
            </h1>
            <p className="mt-4 text-base text-muted sm:text-lg">
              {tool.description}
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
