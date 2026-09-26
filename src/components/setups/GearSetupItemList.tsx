import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { formatPrice, cn } from "@/lib/utils";
import type { GearSetupPageItem } from "@/lib/setups/get-gear-setup-page-data";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

function imageAspect(categoryId?: string): string {
  if (!categoryId) return "aspect-square";
  if (categoryId.includes("shoe")) return "aspect-[4/3]";
  if (categoryId.includes("watch") || categoryId.includes("hrm"))
    return "aspect-square";
  if (categoryId.includes("clothing") || categoryId.includes("apparel"))
    return "aspect-[3/4]";
  if (categoryId.includes("sunglass") || categoryId.includes("eyewear"))
    return "aspect-[5/3]";
  return "aspect-[4/3]";
}

interface GearSetupItemRowProps {
  item: GearSetupPageItem;
}

export function GearSetupItemRow({ item }: GearSetupItemRowProps) {
  const {
    product,
    brand,
    media,
    score,
    scoreLabel,
    price,
    offerCount,
    reviewSlug,
    importance,
  } = item;

  return (
    <article
      id={`item-${product.slug}`}
      className="border border-border bg-white px-3 py-3.5 sm:px-4 sm:py-4"
    >
      <div className="grid gap-4 lg:grid-cols-[auto_100px_minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(140px,0.55fr)] lg:items-center lg:gap-5">
        <div className="flex items-center gap-3 lg:block">
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-[#0b1220]"
            aria-hidden
          >
            {item.order}
          </span>
          <span className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase lg:hidden">
            {item.roleLabel}
          </span>
          {(importance === "optional" || importance === "recommended") && (
            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted lg:hidden">
              {importance}
            </span>
          )}
        </div>

        <Link
          href={item.productHref}
          className={cn(
            "relative mx-auto w-full max-w-[120px] overflow-hidden bg-surface-muted lg:mx-0",
            imageAspect(product.categoryId),
          )}
        >
          {media ? (
            <Image
              src={media.src}
              alt={media.alt || `${product.fullName} product image`}
              fill
              className="object-contain p-1.5"
              sizes="120px"
            />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-subtle">
              Image unavailable
            </span>
          )}
        </Link>

        <div className="min-w-0 space-y-2">
          <p className="hidden text-[11px] font-bold tracking-[0.14em] text-accent uppercase lg:block">
            {item.roleLabel}
            {(importance === "optional" || importance === "recommended") && (
              <span className="ml-2 font-semibold tracking-normal text-subtle normal-case">
                · {importance}
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href={item.productHref}
              className="font-display text-[17px] font-semibold text-foreground hover:text-accent"
            >
              {brand?.name ? `${brand.name} ${product.name}` : product.fullName}
            </Link>
            {typeof score === "number" && scoreLabel && (
              <span className="inline-flex items-center gap-1 rounded bg-[#0b1220] px-2 py-0.5 text-[11px] font-semibold text-white">
                <span className="text-accent">{displayScore(score)}</span>
                {scoreLabel}
              </span>
            )}
          </div>
          <p className="text-[13px] leading-snug text-muted">{item.rationale}</p>
          {(item.whyNeeded ||
            item.systemRole ||
            item.tradeOffs ||
            item.canOmit ||
            item.cheaperAlternative ||
            item.upgradePath ||
            item.compatibilityNotes) && (
            <dl className="mt-2 space-y-1.5 border-t border-border/70 pt-2 text-[12px] leading-snug text-muted">
              {item.whyNeeded && (
                <div>
                  <dt className="inline font-semibold text-foreground">Why needed. </dt>
                  <dd className="inline">{item.whyNeeded}</dd>
                </div>
              )}
              {item.systemRole && (
                <div>
                  <dt className="inline font-semibold text-foreground">Role in kit. </dt>
                  <dd className="inline">{item.systemRole}</dd>
                </div>
              )}
              {item.tradeOffs && (
                <div>
                  <dt className="inline font-semibold text-foreground">Trade-offs. </dt>
                  <dd className="inline">{item.tradeOffs}</dd>
                </div>
              )}
              {item.canOmit && (
                <div>
                  <dt className="inline font-semibold text-foreground">Can omit. </dt>
                  <dd className="inline">{item.canOmit}</dd>
                </div>
              )}
              {item.cheaperAlternative && (
                <div>
                  <dt className="inline font-semibold text-foreground">Cheaper path. </dt>
                  <dd className="inline">{item.cheaperAlternative}</dd>
                </div>
              )}
              {item.upgradePath && (
                <div>
                  <dt className="inline font-semibold text-foreground">Upgrade. </dt>
                  <dd className="inline">{item.upgradePath}</dd>
                </div>
              )}
              {item.compatibilityNotes && (
                <div>
                  <dt className="inline font-semibold text-foreground">Compatibility. </dt>
                  <dd className="inline">{item.compatibilityNotes}</dd>
                </div>
              )}
            </dl>
          )}
          <Link
            href={
              reviewSlug ? `/reviews/${reviewSlug}` : item.productHref
            }
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-accent"
          >
            {reviewSlug ? "Read review" : "View product"}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <ul className="space-y-2" aria-label={`Why ${product.fullName}`}>
          {item.strengths.map((s) => (
            <li
              key={s}
              className="flex gap-2 text-[13px] leading-snug text-foreground"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-accent"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 lg:text-right">
          {price ? (
            <p className="text-[15px] font-semibold text-foreground">
              <span className="text-[12px] font-medium text-muted">From </span>
              {formatPrice(price.price, price.currency)}
            </p>
          ) : (
            <p className="text-[13px] font-medium text-muted">
              No verified Netherlands-shipping retailer is currently available.
            </p>
          )}
          {offerCount > 0 ? (
            <Link
              href={`${item.productHref}#offers`}
              className="inline-flex w-full items-center justify-center gap-1 bg-accent px-3 py-2 text-[11px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90 lg:w-auto"
            >
              View prices ({offerCount})
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : (
            <Link
              href={item.productHref}
              className="inline-flex w-full items-center justify-center gap-1 border border-border bg-white px-3 py-2 text-[11px] font-bold tracking-wide text-foreground uppercase hover:border-foreground/40 lg:w-auto"
            >
              View product
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}
          <div className="flex justify-end">
            <AddToCompareButton
              product={{
                slug: product.slug,
                name: product.fullName,
                brandName: brand?.name,
                categoryId: product.categoryId,
                categorySlug: item.category?.slug ?? "products",
              }}
              source="gear-setup"
              variant="ghost"
              size="sm"
              labelStyle="compact"
              className="text-[12px]"
            />
          </div>
          <Link
            href={item.alternativesHref}
            className="block text-[12px] font-medium text-muted hover:text-accent"
          >
            See alternatives →
          </Link>
        </div>
      </div>
    </article>
  );
}

interface GearSetupItemListProps {
  items: GearSetupPageItem[];
  title: string;
  howWeChooseHref?: string;
}

export function GearSetupItemList({
  items,
  title,
  howWeChooseHref,
}: GearSetupItemListProps) {
  return (
    <div id="whats-included" className="scroll-mt-16 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.35rem] font-bold tracking-tight text-foreground uppercase sm:text-[1.5rem]">
            {title}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Each item is selected for a clear role in the setup.
          </p>
        </div>
        {howWeChooseHref && (
          <Link
            href={howWeChooseHref}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-accent"
          >
            How we choose
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
      <div id="why-these-picks" className="scroll-mt-16 space-y-3">
        {items.map((item) => (
          <GearSetupItemRow key={item.product.id} item={item} />
        ))}
      </div>
    </div>
  );
}
