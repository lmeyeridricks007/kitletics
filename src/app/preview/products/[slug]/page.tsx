import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getSessionForStagedSlug,
  renderSessionReportMarkdown,
} from "@/domain/onboarding/staging";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staged Product Preview",
  robots: { index: false, follow: false },
};

/**
 * Development/editor preview of staged onboarding Products.
 * Production always 404 — staged content must never leak publicly.
 */
export default async function StagedProductPreviewPage({ params }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { slug } = await params;
  const session = getSessionForStagedSlug(slug);
  if (!session?.candidateProduct) {
    notFound();
  }

  const report = renderSessionReportMarkdown(session);
  const product = session.candidateProduct;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide text-amber-700">
        Staging preview — not published
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{product.fullName}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {product.id} · {product.slug} · session {session.id} · {session.status}
      </p>
      <pre className="mt-8 overflow-x-auto whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm">
        {report}
      </pre>
    </main>
  );
}
