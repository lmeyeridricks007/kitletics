import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductAlternativesPage } from "@/components/alternatives/ProductAlternativesPage";
import { getProducts, getProductBySlug } from "@/repositories";
import {
  alternativesCanonicalPath,
  getAlternativesPageData,
} from "@/lib/product/get-alternatives-page-data";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { siteConfig } from "@/content/config";


/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getAlternativesPageData(slug, { isDev: false });
  if (!data) return { title: "Alternatives" };

  // Fix 82 — robots consume the same canonical policy as sitemap eligibility.
  const product =
    getProductBySlug(slug, { isDev: false }) ?? data.product;
  const elig = getLaunchEligibility(
    { kind: "alternatives", entity: product },
    { isDev: false },
  );
  const indexable = isIndexableEligibility(elig);

  const titleBase = indexable
    ? `Best Alternatives to ${data.product.fullName}`
    : `Alternatives to ${data.product.fullName}`;
  const description = indexable
    ? `Compare alternatives to ${data.product.fullName}: what each does better, what you give up, and who should switch versus stay — grouped by ${data.reasonGroups.map((g) => g.reason.title).slice(0, 4).join(", ") || "decision reasons"}.`
    : `Alternatives to ${data.product.fullName} with switch / stay decision notes. Structured from Kitletics product relationships.`;
  const canonical = alternativesCanonicalPath(slug);

  return {
    title: titleBase,
    description,
    alternates: { canonical },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${titleBase} | Kitletics`,
      description,
      url: canonical,
      siteName: siteConfig.name,
    },
  };
}

export default async function ProductAlternativesRoute({ params }: PageProps) {
  const { slug } = await params;
  const data = getAlternativesPageData(slug, { isDev: false });
  if (!data) notFound();

  return <ProductAlternativesPage data={data} />;
}
