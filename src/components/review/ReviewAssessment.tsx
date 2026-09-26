import Image from "next/image";
import Link from "next/link";
import type { Evidence } from "@/domain/recommendations/types";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";
import { assessmentVisual } from "@/lib/review/resolve-section-visuals";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  "personal-test": "Personal testing",
  manufacturer: "Manufacturer specifications",
  retailer: "Retailer information",
  "independent-review": "Independent reviews",
  "lab-test": "Lab testing",
  "user-feedback": "User feedback",
  "editorial-research": "Editor comparison",
};

function uniqueEvidenceTypes(evidence: Evidence[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const ev of evidence) {
    if (seen.has(ev.type)) continue;
    seen.add(ev.type);
    labels.push(EVIDENCE_TYPE_LABELS[ev.type] ?? ev.type.replace(/-/g, " "));
  }
  return labels;
}

export function ReviewAssessment({ data }: { data: ReviewPageData }) {
  if (!data.showResearchModule) return null;

  const { review, evidence, product } = data;
  const typeLabels = uniqueEvidenceTypes(evidence);
  const visual = assessmentVisual({
    seedInput: review.id,
    productSlug: product.slug,
    categoryId: product.categoryId,
    heroSrc: product.images?.[0]?.src,
    productImages: product.images,
  });

  const isWatchOrHrm = /watch|gps|hrm|heart.?rate/i.test(
    product.categoryId ?? "",
  );
  const isPadel = (product.categoryId ?? "").startsWith("cat-padel-");

  return (
    <section id="assessment" className={SCROLL}>
      <h2 className="heading-section">How we wrote this review</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        <figure className="overflow-hidden border border-border bg-surface-muted">
          <div className="relative aspect-[4/3]">
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          {visual.caption ? (
            <figcaption className="border-t border-border px-3.5 py-2.5 text-[12px] leading-snug text-muted">
              {visual.caption}
            </figcaption>
          ) : null}
        </figure>

        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-muted">
            {review.testingContext ??
              `We put this guide together by comparing published specs for the ${product.fullName} with similar products in the same job. We have not run in or used this one ourselves unless the page says we did.`}
          </p>
          {data.fitSizingDisclosure ? (
            <p className="text-[14px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Fit / sizing. </span>
              {data.fitSizingDisclosure}
            </p>
          ) : null}
          <p className="text-[15px] leading-relaxed text-muted">
            {isWatchOrHrm
              ? "We start with the numbers that shape the buy — case size, weight, display, GNSS, maps, battery claims and sensors — then place the product against alternatives that solve a similar training job. Feel claims only show up when the sources support them."
              : isPadel
                ? "We start with the numbers that shape the buy — shape, balance, weight, face, core and the level the mould is built for — then place it against rackets that solve a similar court job. Feel claims only show up when the sources support them. This is expert research, not a Kitletics hitting test."
                : "We start with the numbers that shape the buy — weight, stack, drop, surface intent, stability class and materials — then place the product against alternatives that solve a similar job. Feel claims only show up when the sources support them."}
          </p>
          {typeLabels.length > 0 && (
            <div>
              <p className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
                Sources used for this review
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-1">
                {typeLabels.map((label) => (
                  <li
                    key={label}
                    className="flex items-start gap-2 text-[14px] text-foreground before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[13px] text-subtle">
            <Link
              href="/how-we-review"
              className="font-medium text-accent-ink hover:underline"
            >
              Read how we review
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
