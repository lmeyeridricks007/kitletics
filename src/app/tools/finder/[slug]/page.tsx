import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getFinderDefinition } from "@/domain/finders/repository";
import { getToolBySlug } from "@/repositories";
import { getRequestRegion } from "@/lib/region/server";
import { siteConfig } from "@/content/config";
import { getToolHref } from "@/lib/tools/href";
import { FINDER_TOOL_SLUGS, isFinderToolSlug } from "@/lib/tools/finder-slugs";
import { renderFinderToolPage } from "@/app/tools/[slug]/render-finder";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
export default async function FinderToolPage({
  params,
  searchParams,
}: PageProps) {
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

  const region = await getRequestRegion();
  if (!getFinderDefinition(slug, region)) notFound();

  const sp = await searchParams;
  const view = await renderFinderToolPage({
    slug,
    region,
    searchParams: sp,
  });
  if (!view) notFound();
  return view;
}
