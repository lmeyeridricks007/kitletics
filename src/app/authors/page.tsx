import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getAuthors, getReviewsByAuthor } from "@/repositories";
import { siteConfig } from "@/content/config";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";

export const metadata: Metadata = {
  title: "Authors",
  description:
    "Who writes Kitletics content. Today that is Kitletics Editorial — transparent desk attribution, not invented experts.",
  alternates: { canonical: `${siteConfig.url}/authors` },
};

export default function AuthorsIndexPage() {
  const authors = getAuthors();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Authors" },
        ]}
        className="mb-8"
      />
      <p className="text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">
        Trust
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Authors
      </h1>
      <p className="mt-4 max-w-2xl text-muted leading-relaxed">
        Kitletics does not invent a roster of celebrity testers. When content
        is produced under the editorial desk, we say so. Individual named
        authors appear here only when they exist in our repository with
        factual bios — never fabricated credentials.
      </p>

      <ul className="mt-10 space-y-6">
        {authors.map((author) => {
          const reviewCount = getReviewsByAuthor(author.id).length;
          return (
            <li
              key={author.id}
              className="border border-border bg-surface px-5 py-5"
            >
              <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                {author.title ?? "Author"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                <Link
                  href={`/authors/${author.slug}`}
                  className="hover:text-accent"
                >
                  {author.name}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {author.bio}
              </p>
              {author.expertise.length > 0 && (
                <p className="mt-3 text-xs text-subtle">
                  Coverage: {author.expertise.join(" · ")}
                </p>
              )}
              <p className="mt-3 text-sm text-muted">
                {reviewCount > 0
                  ? `${reviewCount} attributed review${reviewCount === 1 ? "" : "s"}`
                  : "Editorial desk for guides, scores, and Expert Research Reviews"}
              </p>
              <Link
                href={`/authors/${author.slug}`}
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Author profile →
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-auto mt-12 max-w-2xl">
        <TrustRelatedNav currentPath="/authors" />
      </div>
    </Container>
  );
}
