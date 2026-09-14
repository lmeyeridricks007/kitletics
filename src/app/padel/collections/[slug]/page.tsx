import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  PADEL_COLLECTION_SLUGS,
  getPadelCollectionPageData,
} from "@/lib/padel-collections";
import { siteConfig } from "@/content/config";
import { canFeatureProduct } from "@/lib/product/media";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PADEL_COLLECTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getPadelCollectionPageData(slug);
  if (!data) return { title: "Collection" };
  return {
    title: `${data.title} Collection | Kitletics`,
    description: data.summary,
    alternates: { canonical: `${siteConfig.url}${data.path}` },
  };
}

export default async function PadelCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getPadelCollectionPageData(slug);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[var(--kl-surface,#f7f7f5)]">
      <section className="border-b border-black/10 bg-[var(--kl-ink,#0a0a0a)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav className="text-xs text-white/50">
            <Link href="/padel" className="hover:text-white">
              Padel
            </Link>
            <span className="mx-2">/</span>
            <Link href="/padel/collections" className="hover:text-white">
              Collections
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{data.family.name}</span>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--kl-lime,#c8f542)]">
            {data.brand?.name ?? "Padel"} · Collection
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
            {data.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/75">{data.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {data.brand ? (
              <Link
                href={`/brands/${data.brand.slug}`}
                className="rounded-sm bg-[var(--kl-lime,#c8f542)] px-4 py-2 text-sm font-semibold text-black"
              >
                {data.brand.name} brand hub
              </Link>
            ) : null}
            <Link
              href="/padel/rackets"
              className="rounded-sm border border-white/30 px-4 py-2 text-sm text-white"
            >
              All rackets
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50">
          Rackets in this family
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.rackets.map((p) => {
            const img = canFeatureProduct(p) ? p.images?.[0] : undefined;
            return (
              <li key={p.id}>
                <Link
                  href={`/products/${p.slug}`}
                  className="flex h-full flex-col border border-black/10 bg-white p-4 transition hover:border-black/30"
                >
                  <div className="relative mb-4 aspect-square w-full bg-[var(--kl-surface,#f7f7f5)]">
                    {img?.src ? (
                      <Image
                        src={img.src}
                        alt={img.alt ?? p.fullName ?? p.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <h3 className="text-base font-semibold">{p.fullName ?? p.name}</h3>
                  {p.shortDescription ? (
                    <p className="mt-2 line-clamp-2 text-sm text-black/65">
                      {p.shortDescription}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {data.related.length > 0 ? (
        <section className="mx-auto max-w-6xl border-t border-black/10 px-4 py-12 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50">
            Verified companion kit
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-black/65">
            Bags and accessories linked only when the catalog relationship is
            verified — no invented cross-sell.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {data.related.map((row) => (
              <li key={row.productId}>
                <Link
                  href={`/products/${row.product.slug}`}
                  className="block border border-black/10 bg-white p-5 transition hover:border-black/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                    {row.role}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {row.product.fullName ?? row.product.name}
                  </h3>
                  <p className="mt-2 text-sm text-black/65">{row.note}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
