import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FinderResultsView } from "@/components/finder/FinderResults";
import { getFinderResultsData } from "@/lib/finder/get-finder-results-data";
import { decodeFinderShareState } from "@/domain/finders/share-state";
import { decodeRotationShareState } from "@/domain/shoe-rotation/share-state";
import { RotationResultsView } from "@/components/rotation/RotationResults";
import { getRotationResultsData } from "@/lib/rotation/get-rotation-results-data";
import { getToolBySlug } from "@/repositories";
import { getFinderDefinition } from "@/domain/finders/repository";
import { getRequestRegion } from "@/lib/region/server";
import { Container } from "@/components/layout/Container";


/**
 * Finder / rotation results are share-state + region-dependent and noindex.
 * Keep Architecture E / controlled dynamic — do not ISR this route.
 */
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    s?: string;
    debugFinder?: string;
    debugRotation?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "shoe-rotation-planner") {
    return {
      title: "Your Shoe Rotation | Kitletics",
      robots: { index: false, follow: true },
    };
  }
  const tool = getToolBySlug(slug);
  return {
    title: tool ? `Your ${tool.name} Matches` : "Finder Matches",
    robots: { index: false, follow: true },
  };
}

export default async function ToolResultsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug, { isDev: false });
  if (!tool || tool.status !== "published") notFound();

  const { s, debugFinder, debugRotation } = await searchParams;
  const region = await getRequestRegion();
  const isDev = process.env.NODE_ENV === "development";

  if (slug === "shoe-rotation-planner") {
    if (!s) {
      return (
        <Container className="py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">No results yet</h1>
          <p className="mt-2 text-muted">
            Complete the Shoe Rotation Planner to see recommendations.
          </p>
          <Link
            href={`/tools/${slug}`}
            className="mt-6 inline-block text-accent hover:underline"
          >
            Start the planner
          </Link>
        </Container>
      );
    }
    const decoded = decodeRotationShareState(s);
    if (!decoded.ok) {
      return (
        <Container className="py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Invalid or outdated link
          </h1>
          <p className="mt-2 text-muted">{decoded.error}</p>
          <Link
            href={`/tools/${slug}`}
            className="mt-6 inline-block text-accent hover:underline"
          >
            Start a new planner session
          </Link>
        </Container>
      );
    }
    const data = getRotationResultsData({
      responses: decoded.responses,
      region,
      options: { isDev: false },
      debug: isDev && debugRotation === "true",
    });
    if (!data) notFound();
    const sharePath = `/tools/${slug}/results?s=${encodeURIComponent(s)}`;
    return (
      <RotationResultsView
        data={data}
        sharePath={sharePath}
        encodedState={s}
      />
    );
  }

  if (tool.type !== "finder") notFound();
  const definition = getFinderDefinition(slug, region);
  if (!definition) notFound();

  if (!s) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">No results yet</h1>
        <p className="mt-2 text-muted">Complete the finder to see matches.</p>
        <Link
          href={`/tools/${slug}`}
          className="mt-6 inline-block text-accent hover:underline"
        >
          Start the Finder
        </Link>
      </Container>
    );
  }

  const decoded = decodeFinderShareState(s, slug);
  if (!decoded.ok) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">
          Invalid or outdated link
        </h1>
        <p className="mt-2 text-muted">{decoded.error}</p>
        <Link
          href={`/tools/${slug}`}
          className="mt-6 inline-block text-accent hover:underline"
        >
          Start a new Finder session
        </Link>
      </Container>
    );
  }

  const data = getFinderResultsData({
    finderSlug: slug,
    responses: decoded.responses,
    region,
    options: { isDev: false },
    debug: isDev && debugFinder === "true",
  });
  if (!data) notFound();

  const sharePath = `/tools/${slug}/results?s=${encodeURIComponent(s)}`;
  return (
    <FinderResultsView data={data} sharePath={sharePath} encodedState={s} />
  );
}
