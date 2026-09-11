import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewCard } from "@/components/cards/ContentCards";
import {
  JsonLdScript,
} from "@/lib/seo/jsonld";
import {
  getAuthorBySlug,
  getAuthors,
  getReviewsByAuthor,
  getProductById,
  getBrandById,
} from "@/repositories";
import { siteConfig } from "@/content/config";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const EDITORIAL_DESK_ID = "author-kitletics-editorial";

function isEditorialDesk(author: { id: string; slug: string; name: string }) {
  return (
    author.id === EDITORIAL_DESK_ID ||
    author.slug === "kitletics-editorial" ||
    /kitletics editorial/i.test(author.name)
  );
}

export async function generateStaticParams() {
  return getAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author" };
  return {
    title: author.name,
    description: author.bio.slice(0, 160),
    alternates: { canonical: `${siteConfig.url}/authors/${author.slug}` },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const reviews = getReviewsByAuthor(author.id).slice(0, 24);
  const desk = isEditorialDesk(author);

  const personOrOrg = desk
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: author.name,
        url: `${siteConfig.url}/authors/${author.slug}`,
        description: author.bio,
        parentOrganization: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        url: `${siteConfig.url}/authors/${author.slug}`,
        description: author.bio,
        jobTitle: author.title,
        worksFor: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      };

  return (
    <>
      <JsonLdScript data={[personOrOrg]} />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Authors", href: "/authors" },
            { label: author.name },
          ]}
          className="mb-8"
        />
        <p className="text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">
          {desk ? "Editorial desk" : "Author"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          {author.name}
        </h1>
        {author.title && (
          <p className="mt-2 text-lg text-muted">{author.title}</p>
        )}
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">{author.bio}</p>

        <section className="mt-10 max-w-2xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Role</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {desk
                ? "Publishes product guidance, Best Guides, comparisons, and Expert Research Reviews under a transparent editorial byline. Not a fictional individual tester."
                : author.title
                  ? `${author.title} contributing to Kitletics coverage.`
                  : "Contributor to Kitletics coverage."}
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Methodology</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Work follows the{" "}
              <Link
                href="/editorial-policy"
                className="text-accent hover:underline"
              >
                editorial policy
              </Link>
              ,{" "}
              <Link
                href="/evidence-policy"
                className="text-accent hover:underline"
              >
                evidence policy
              </Link>
              , and{" "}
              <Link
                href="/scoring-methodology"
                className="text-accent hover:underline"
              >
                scoring methodology
              </Link>
              . Affiliate commission does not influence rankings.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Coverage areas</h2>
            {author.expertise.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {author.expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Not specified.</p>
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Review type</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Default published review type:{" "}
              <strong className="text-foreground">Expert Research Review</strong>
              . First-Hand and Hybrid labels require personal-test evidence —{" "}
              <Link
                href="/how-we-review"
                className="text-accent hover:underline"
              >
                how we review
              </Link>
              . Kitletics currently publishes zero first-hand reviews.
            </p>
          </div>
        </section>

        {author.disclosure && (
          <p className="mt-8 max-w-2xl border-l-2 border-border pl-4 text-sm text-muted">
            {author.disclosure}
          </p>
        )}

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">
            Sample reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Reviews attributed to this desk appear as they are published with
              an author id. Expert Research Reviews without a stored reviewer id
              still follow this desk&apos;s methodology.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => {
                const product = getProductById(review.productId);
                const brand = product
                  ? getBrandById(product.brandId)
                  : undefined;
                return (
                  <ReviewCard
                    key={review.id}
                    title={product?.name ?? review.title}
                    brandName={brand?.name}
                    review={review}
                    product={product}
                    displayScore={
                      product?.recommendationScore ?? review.score
                    }
                  />
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-12 max-w-2xl">
          <TrustRelatedNav currentPath={`/authors/${author.slug}`} />
        </div>

        <p className="mt-10 text-sm">
          <Link href="/authors" className="text-accent hover:underline">
            ← All authors
          </Link>
        </p>
      </Container>
    </>
  );
}
