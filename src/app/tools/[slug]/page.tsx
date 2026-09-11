import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getToolBySlug } from "@/repositories";
import {
  JsonLdScript,
  webApplicationJsonLd,
} from "@/lib/seo/jsonld";
import { getRequestRegion } from "@/lib/region/server";
import { siteConfig } from "@/content/config";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { getCalculatorDefinition } from "@/domain/calculators/registry";
import { getToolHref } from "@/lib/tools/href";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isFinderToolSlug(slug)) {
    // Public Finder URLs are rewritten to /tools/finder/[slug]; this leaf
    // must not claim Finder metadata if middleware is bypassed.
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
  const sp = await searchParams;
  const hasUserBuild =
    slug === "home-gym-builder" && Boolean(firstParam(sp.build));
  return {
    title: tool.seoTitle ?? tool.name,
    description: tool.seoDescription ?? tool.description,
    alternates: { canonical: `${siteConfig.url}/tools/${tool.slug}` },
    robots: hasUserBuild ? { index: false, follow: false } : undefined,
  };
}

/**
 * Non-Finder tools only. Finders live at `/tools/finder/[slug]` (rewritten
 * from `/tools/<slug>`) so their client graph never includes Home Gym catalogs.
 */
export default async function ToolPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  if (isFinderToolSlug(slug)) {
    // Middleware should rewrite Finders away from this route. Hard-stop if not.
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

  await getRequestRegion();
  const sp = await searchParams;

  if (slug === "running-pace-calculator") {
    const { renderPaceCalculatorPage } = await import("./render-calculators");
    return renderPaceCalculatorPage({ slug, searchParams: sp });
  }

  if (slug === "race-time-predictor") {
    const { renderRacePredictorPage } = await import("./render-calculators");
    return renderRacePredictorPage({ slug, searchParams: sp });
  }

  if (slug === "shoe-rotation-planner") {
    const { renderShoeRotationPlannerPage } = await import("./render-rotation");
    return renderShoeRotationPlannerPage({
      slug,
      toolDescription: tool.description,
      searchParams: sp,
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
