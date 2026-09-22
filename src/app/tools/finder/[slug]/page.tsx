import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getFinderDefinition } from "@/domain/finders/repository";
import { getToolBySlug } from "@/repositories";
import { siteConfig } from "@/content/config";
import { getToolHref } from "@/lib/tools/href";
import { FINDER_TOOL_SLUGS, isFinderToolSlug } from "@/lib/tools/finder-slugs";
import { renderFinderToolPage } from "@/app/tools/[slug]/render-finder";
import { DEFAULT_REGION } from "@/domain/shared/types";

/**
 * Canonical finder landing — ISR NL HTML.
 * Share/edit/region wizard state is client-side.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return FINDER_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.seoTitle ?? tool.name,
    description: tool.seoDescription ?? tool.description,
    alternates: { canonical: `${siteConfig.url}/tools/${tool.slug}` },
  };
}

/**
 * Internal Finder route (rewritten from `/tools/<slug>`).
 * Must not import Home Gym / calculator / Hyrox clients.
 */
export default async function FinderToolPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isFinderToolSlug(slug)) notFound();

  const tool = getToolBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!tool || tool.status !== "published") notFound();

  const canonicalHref = getToolHref(tool);
  if (canonicalHref !== `/tools/${slug}`) {
    permanentRedirect(canonicalHref);
  }

  if (!getFinderDefinition(slug, DEFAULT_REGION)) notFound();

  const view = await renderFinderToolPage({
    slug,
    region: DEFAULT_REGION,
    searchParams: {},
  });
  if (!view) notFound();
  return view;
}
