import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";

export function BestGuideLowerCards({ data }: { data: BestGuidePageData }) {
  const {
    methodologyBullets,
    methodologyImageSrc,
    buyingHelpLinks,
    buyingGuides,
    finderHref,
    finderThumbnails,
    config,
    methodologyCardTitle,
    buyingHelpTitle,
    isUseCaseGuide,
    contextConfig,
    guide,
  } = data;

  const buyingGuideHref = buyingGuides[0]
    ? `/guides/${buyingGuides[0].slug}`
    : "/guides";
  const finderLabel =
    config.finderCtaLabel ?? "Find your perfect match →";

  const contextEmphasis =
    guide.methodologySummary?.trim() ||
    contextConfig.methodologyEmphasis;

  return (
    <section className="py-8">
      <Container size="wide">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Methodology */}
          <div
            id="methodology"
            className="scroll-mt-24 border border-border bg-white p-5 sm:p-6"
          >
            <h2 className="heading-section text-[15px]">
              {methodologyCardTitle}
            </h2>
            {contextEmphasis && (
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {contextEmphasis}
              </p>
            )}
            <ul className="mt-4 space-y-2">
              {methodologyBullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 text-[13px] text-foreground"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-score"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/methodology"
              className="mt-4 inline-block text-[13px] font-medium text-link hover:underline"
            >
              Read our full methodology →
            </Link>
            {methodologyImageSrc && (
              <div className="relative mt-5 aspect-[16/10] overflow-hidden bg-surface-muted">
                <Image
                  src={methodologyImageSrc}
                  alt="Editorial research context for Kitletics scoring"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            )}
          </div>

          {/* How to choose */}
          <div className="border border-border bg-white p-5 sm:p-6">
            <h2 className="heading-section text-[15px]">
              {buyingHelpTitle}
            </h2>
            {buyingHelpLinks.length > 0 ? (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {buyingHelpLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between gap-3 py-3 text-[13px] font-medium text-foreground transition-colors hover:text-link"
                    >
                      <span>{link.label}</span>
                      <ChevronRight
                        className="size-4 shrink-0 text-subtle"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13px] text-muted">
                Start with our buying guides to match gear to your goals.
              </p>
            )}
            <Link
              href={buyingGuideHref}
              className="mt-4 inline-block text-[13px] font-medium text-link hover:underline"
            >
              Read the buying guide →
            </Link>
          </div>

          {/* Finder */}
          <div className="border border-border bg-white p-5 sm:p-6">
            <h2 className="heading-section text-[15px]">
              Find your perfect match
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {isUseCaseGuide
                ? "This guide shortlists strong options for a shared context. The finder personalises for your training, preferences and budget."
                : "Editorial rankings show strong options generally. The finder personalises for your training, preferences and budget."}
            </p>
            {finderHref ? (
              <Link
                href={finderHref}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
              >
                {finderLabel}
              </Link>
            ) : (
              <Link
                href="/tools"
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
              >
                Browse tools →
              </Link>
            )}
            {finderThumbnails.length > 0 && (
              <div className="mt-5 grid grid-cols-4 gap-2">
                {finderThumbnails.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-square overflow-hidden bg-surface-muted"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
