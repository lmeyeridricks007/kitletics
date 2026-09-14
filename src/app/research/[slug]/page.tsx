import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PadelResearchPage } from "@/components/padel-research/PadelResearchPage";
import {
  PADEL_RESEARCH_SLUGS,
  getPadelResearchPageData,
} from "@/lib/padel-research";
import { siteConfig } from "@/content/config";
import { NOINDEX_FOLLOW } from "@/lib/seo/query-state";
import {
  resolveEntityVerticalPolicy,
  verticalAllowsIndexation,
} from "@/content/launch/vertical-strategy";
import { JsonLdScript, articleJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [...PADEL_RESEARCH_SLUGS].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getPadelResearchPageData(slug);
  if (!data) return { title: "Research" };

  const vertical = resolveEntityVerticalPolicy(["sport-padel"]);
  const verticalHeld = !verticalAllowsIndexation(vertical, "sport");

  // Research follows the selective padel hub permission. Only stories whose
  // findings actually publish may index; withheld stories stay noindex.
  const robots =
    verticalHeld || !data.published ? NOINDEX_FOLLOW : undefined;

  return {
    title: `${data.title} | Kitletics Research`,
    description: data.summary,
    alternates: { canonical: `${siteConfig.url}${data.path}` },
    robots,
  };
}

export default async function PadelResearchRoute({ params }: PageProps) {
  const { slug } = await params;
  if (!PADEL_RESEARCH_SLUGS.has(slug)) notFound();
  const data = getPadelResearchPageData(slug);
  if (!data) notFound();
  return (
    <>
      <JsonLdScript
        data={articleJsonLd({
          title: data.title,
          description: data.summary,
          url: data.path,
          authorName: siteConfig.name,
          authorIsOrganization: true,
        })}
      />
      <PadelResearchPage data={data} />
    </>
  );
}
