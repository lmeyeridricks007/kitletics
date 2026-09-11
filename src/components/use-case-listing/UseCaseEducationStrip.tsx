import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { UseCaseListingPageData } from "@/lib/use-case-listing";
import type { ListingEducationFactor } from "@/lib/use-case-listing/types";

export function UseCaseEducationStrip({
  data,
}: {
  data: UseCaseListingPageData;
}) {
  const { education } = data.config;
  const guideHref = data.educationGuideHref;

  return (
    <section className="border-t border-border bg-[#f7f4e8]">
      <Container size="wide" className="py-7 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:items-start lg:gap-10">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/80 text-accent-foreground">
              <ShoeMark />
            </span>
            <div>
              <h2 className="font-display text-[18px] font-bold text-foreground">
                {education.title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {education.body}
              </p>
              {guideHref && (
                <Link
                  href={guideHref}
                  className="mt-3 inline-block text-[13px] font-medium text-link hover:underline"
                >
                  {education.guideCtaLabel ?? "Learn more →"}
                </Link>
              )}
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {education.factors.map((factor: ListingEducationFactor, i) => (
              <li key={factor.id} className="min-w-0">
                <span className="mb-2 flex size-8 items-center justify-center text-foreground/70">
                  <FactorIcon index={i} />
                </span>
                <p className="text-[13px] font-bold text-foreground">
                  {factor.title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-muted">
                  {factor.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {(education.tradeOffs?.length || education.beginnerStart) && (
          <div className="mt-6 grid gap-4 border-t border-border/60 pt-6 sm:grid-cols-2">
            {education.beginnerStart && (
              <div>
                <p className="text-[12px] font-bold tracking-wide text-foreground uppercase">
                  Beginner start
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {education.beginnerStart}
                </p>
              </div>
            )}
            {education.tradeOffs && education.tradeOffs.length > 0 && (
              <div>
                <p className="text-[12px] font-bold tracking-wide text-foreground uppercase">
                  Trade-offs for this type
                </p>
                <ul className="mt-2 space-y-2">
                  {education.tradeOffs.map((t) => (
                    <li key={`${t.left}-${t.right}`} className="text-[13px] text-muted">
                      <span className="font-medium text-foreground">
                        {t.left} ↔ {t.right}.
                      </span>{" "}
                      {t.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

function ShoeMark() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
      <path
        d="M1.5 9.5c1.2-1.8 3.2-3 5.5-3.2 1.6-.1 2.8.4 4.1 1.1 1.1.6 2.2 1.1 3.5 1.1h4.2c.9 0 1.7.7 1.7 1.6 0 .4-.2.8-.5 1.1H3.2C2 11.2 1.2 10.4 1.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FactorIcon({ index }: { index: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (index % 4 === 0) {
    return (
      <svg {...common}>
        <path d="M4 14c2-4 5-6 8-6s6 2 8 6" />
        <path d="M8 18h8" />
      </svg>
    );
  }
  if (index % 4 === 1) {
    return (
      <svg {...common}>
        <path d="M12 4v4" />
        <path d="M8 10h8l-1.5 8h-5L8 10Z" />
      </svg>
    );
  }
  if (index % 4 === 2) {
    return (
      <svg {...common}>
        <path d="M5 15c3-1 5.5-1 7-1s4 0 7 1" />
        <path d="M7 15v-2.5C7 9 9.5 7 12 7s5 2 5 5.5V15" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  );
}
