import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GuidesHubCardData } from "@/lib/guides/get-guides-hub-data";

type GuideHubCardSize =
  | "featured"
  | "featured-split"
  | "start"
  | "topic"
  | "compact";

interface GuideHubCardProps {
  card: GuidesHubCardData;
  size?: GuideHubCardSize;
  priority?: boolean;
  className?: string;
  /** Optional eyebrow override (e.g. FEATURED GUIDE) */
  eyebrow?: string;
}

export function GuideHubCard({
  card,
  size = "compact",
  priority = false,
  className,
  eyebrow,
}: GuideHubCardProps) {
  const typeLabel = eyebrow ?? card.typeLabel;

  if (size === "featured-split") {
    return (
      <Link
        href={card.href}
        className={cn(
          "group grid h-full overflow-hidden rounded-lg border border-border bg-white transition-colors hover:border-foreground/25 lg:grid-cols-[1.05fr_0.95fr]",
          className,
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted lg:aspect-auto lg:min-h-[260px]">
          <Image
            src={card.imageSrc}
            alt={card.imageAlt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 28vw"
          />
        </div>
        <div className="flex flex-col justify-center p-4 sm:p-5">
          <p className="text-[10px] font-bold tracking-[0.16em] text-accent-ink uppercase">
            {typeLabel}
          </p>
          <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug tracking-tight text-foreground group-hover:text-link sm:text-[1.35rem]">
            {card.guide.title}
          </h3>
          {card.summary && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
              {card.summary}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[12px] text-subtle tabular-nums">
              {card.readingMinutes} min read
              {card.updatedLabel ? ` · ${card.updatedLabel}` : ""}
            </span>
            <span className="link-cta shrink-0 text-[13px] font-semibold">
              Read guide →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const imageAspect =
    size === "featured"
      ? "aspect-[16/9]"
      : "aspect-[16/10]";

  const useContain = size === "topic" || size === "compact";

  return (
    <Link
      href={card.href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-colors hover:border-foreground/25",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-surface-muted",
          imageAspect,
        )}
      >
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          priority={priority}
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.03]",
            useContain ? "object-contain p-3" : "object-cover",
          )}
          sizes={
            size === "featured"
              ? "(max-width: 1024px) 100vw, 48vw"
              : size === "start"
                ? "(max-width: 768px) 85vw, 25vw"
                : "(max-width: 768px) 80vw, 22vw"
          }
        />
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          size === "featured"
            ? "p-5 sm:p-6"
            : size === "compact"
              ? "p-3.5"
              : "p-4",
        )}
      >
        <p className="text-[10px] font-bold tracking-[0.16em] text-accent-ink uppercase">
          {typeLabel}
        </p>
        <h3
          className={cn(
            "mt-1.5 font-display font-semibold tracking-tight text-foreground group-hover:text-link",
            size === "featured"
              ? "text-xl sm:text-2xl leading-snug"
              : size === "start"
                ? "text-[17px] leading-snug"
                : "text-[15px] leading-snug",
          )}
        >
          {card.guide.title}
        </h3>
        {card.summary && (
          <p
            className={cn(
              "mt-2 text-muted",
              size === "featured"
                ? "line-clamp-3 text-[15px] leading-relaxed"
                : "line-clamp-2 text-sm leading-relaxed",
            )}
          >
            {card.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-[12px] text-subtle tabular-nums">
            {card.readingMinutes} min read
            {card.updatedLabel ? ` · ${card.updatedLabel}` : ""}
          </span>
          <span className="link-cta shrink-0 text-[13px] font-semibold">
            Read guide →
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact text-forward card for dense topic rails */
export function GuideHubListCard({
  card,
  className,
}: {
  card: GuidesHubCardData;
  className?: string;
}) {
  return (
    <Link
      href={card.href}
      className={cn(
        "group flex gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:border-foreground/25",
        className,
      )}
    >
      <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-md bg-surface-muted sm:h-20 sm:w-[112px]">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          className="object-contain p-1.5"
          sizes="112px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-[0.14em] text-accent-ink uppercase">
          {card.typeLabel}
        </p>
        <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug text-foreground group-hover:text-link">
          {card.guide.title}
        </h3>
        {card.summary && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">
            {card.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
