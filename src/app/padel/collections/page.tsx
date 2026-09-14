import type { Metadata } from "next";
import Link from "next/link";
import { listPadelCollections } from "@/lib/padel-collections";
import { siteConfig } from "@/content/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Padel Collections | Kitletics",
  description:
    "Explore verified padel racket families — AT10, Vertex, Hack, Coello, Bela, Metalbone — with companion bags and accessories only when confirmed.",
  alternates: { canonical: `${siteConfig.url}/padel/collections` },
};

export default function PadelCollectionsIndexPage() {
  const collections = listPadelCollections();

  return (
    <main className="min-h-screen bg-[var(--kl-surface,#f7f7f5)]">
      <section className="border-b border-black/10 bg-[var(--kl-ink,#0a0a0a)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--kl-lime,#c8f542)]">
            Padel · Collections
          </p>
          <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
            Racket families with verified kit links
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            AT10, Vertex, Hack, Coello, Bela and Metalbone — browse sibling
            frames, then only the bags and accessories we can verify in catalog.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/padel/rackets"
              className="rounded-sm bg-[var(--kl-lime,#c8f542)] px-4 py-2 text-sm font-semibold text-black"
            >
              All rackets
            </Link>
            <Link
              href="/padel/rackets/database"
              className="rounded-sm border border-white/40 px-4 py-2 text-sm font-medium text-white"
            >
              Racket database
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.href}
                className="group block border border-black/10 bg-white p-6 transition hover:border-black/30"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-black/70">
                  {c.brandName}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight group-hover:underline">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm text-black/80 line-clamp-3">
                  {c.description}
                </p>
                <p className="mt-4 text-xs font-medium text-black/70">
                  {c.racketCount} published racket
                  {c.racketCount === 1 ? "" : "s"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        {collections.length === 0 ? (
          <p className="text-sm text-black/70">
            Collections will appear when family products are published.
          </p>
        ) : null}
      </section>
    </main>
  );
}
