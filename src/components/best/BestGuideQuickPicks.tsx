import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import {
  formatGuideScore,
  type GuideRecommendationBlock,
} from "@/lib/best/get-best-guide-page-data";
import { getScoreBand } from "@/lib/product/score";
import { formatPrice } from "@/lib/utils";
import { AudienceAvailability } from "@/components/catalog/ShopByFitChips";

export function BestGuideQuickPicks({
  quickPicks,
  title = "Quick Picks",
}: {
  quickPicks: GuideRecommendationBlock[];
  title?: string;
}) {
  if (quickPicks.length === 0) return null;

  return (
    <section id="quick-picks" className="scroll-mt-24 border-b border-border bg-surface py-8">
      <Container size="wide">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
              Shortlist
            </p>
            <h2 className="mt-1 heading-section">{title}</h2>
          </div>
          <Link href="#methodology" className="link-accent shrink-0">
            How we choose →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {quickPicks.map((rec) => (
            <QuickPickCard key={rec.product.id} rec={rec} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function QuickPickCard({ rec }: { rec: GuideRecommendationBlock }) {
  const score = rec.product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const href = rec.reviewSlug
    ? `/reviews/${rec.reviewSlug}`
    : `/products/${rec.product.slug}`;
  const cta = rec.reviewSlug ? "View review →" : "View product →";

  return (
    <article className="flex flex-col">
      {rec.awardLabel && (
        <span className="mb-2 inline-flex w-fit rounded-[3px] bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
          {rec.awardLabel}
        </span>
      )}

      <Link
        href={`/products/${rec.product.slug}`}
        className="relative flex aspect-[4/3] items-center justify-center border border-border bg-surface-muted"
      >
        {rec.media ? (
          <Image
            src={rec.media.src}
            alt={rec.media.alt || rec.product.fullName}
            fill
            className="object-contain p-2"
            sizes="160px"
          />
        ) : null}
      </Link>

      <div className="mt-2.5 flex flex-1 flex-col gap-1.5">
        {rec.brand?.name && (
          <p className="text-[10px] font-medium tracking-wide text-subtle uppercase">
            {rec.brand.name}
          </p>
        )}
        <Link
          href={`/products/${rec.product.slug}`}
          className="font-display text-[14px] leading-snug font-semibold text-foreground hover:text-link"
        >
          {rec.product.name}
        </Link>

        <AudienceAvailability label={rec.audienceAvailability} />

        {score !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex size-7 items-center justify-center rounded-[4px] bg-score text-[12px] font-bold text-score-foreground tabular-nums">
              {formatGuideScore(score)}
            </span>
            {band && (
              <span className="text-[12px] font-medium text-foreground">
                {band.label}
              </span>
            )}
          </div>
        )}

        {rec.lowestPrice && (
          <p className="text-[13px] font-semibold text-foreground">
            From{" "}
            {formatPrice(rec.lowestPrice.price, rec.lowestPrice.currency)}
          </p>
        )}

        <Link
          href={href}
          className="mt-auto pt-1 text-[12px] font-medium text-link hover:text-link-hover hover:underline"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
