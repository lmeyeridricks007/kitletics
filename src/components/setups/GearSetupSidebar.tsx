import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flag, Layers, Target, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { GearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";

interface SidebarProps {
  data: GearSetupPageData;
}

export function GearSetupWhyPanel({ data }: SidebarProps) {
  return (
    <aside className="border border-border bg-white p-5">
      <h2 className="font-display text-[15px] font-bold text-foreground">
        Kit at a glance
      </h2>
      <ul className="mt-4 space-y-4">
        <li className="flex gap-3">
          <Target className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
              Goal
            </p>
            <p className="text-[13px] font-medium text-foreground">
              {data.goalLabel}
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <Flag className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
              Level
            </p>
            <p className="text-[13px] font-medium text-foreground">
              {data.experienceLevel}
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <Layers className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
              Key priorities
            </p>
            <p className="text-[13px] font-medium text-foreground">
              {data.keyPriorities.join(", ")}
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <Wallet className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
              Total price
            </p>
            <p className="text-[13px] font-medium text-foreground">
              {data.knownTotal != null
                ? data.unknownPriceCount > 0
                  ? `Known from ${formatPrice(data.knownTotal, data.currency)}`
                  : `From ${formatPrice(data.knownTotal, data.currency)}`
                : "Unavailable"}
            </p>
            {data.unknownPriceCount > 0 && (
              <p className="text-[11px] text-subtle">
                {data.unknownPriceCount} prices unavailable
              </p>
            )}
          </div>
        </li>
      </ul>
    </aside>
  );
}

export function GearSetupVariantPanel({ data }: SidebarProps) {
  if (!data.variants.length) return null;
  return (
    <aside id="make-it-your-own" className="scroll-mt-16 border border-border bg-white p-5">
      <h2 className="font-display text-[15px] font-bold text-foreground">
        Make it your own
      </h2>
      <p className="mt-1 text-[12px] text-muted">
        Related setups for different goals, budgets and experience levels.
      </p>
      <ul className="mt-4 space-y-2">
        {data.variants.map((v) => (
          <li key={v.setup.id}>
            <Link
              href={v.href}
              className="flex items-center justify-between gap-2 border border-border px-3 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <span>{v.title}</span>
              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function GearSetupRelatedGuides({ data }: SidebarProps) {
  if (!data.relatedGuides.length) return null;
  return (
    <aside className="border border-border bg-white p-5">
      <h2 className="font-display text-[15px] font-bold text-foreground">
        Related guides
      </h2>
      <ul className="mt-4 space-y-3">
        {data.relatedGuides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="group block border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <p className="text-[13px] font-semibold text-foreground group-hover:text-accent">
                {g.title}
              </p>
              {g.description && (
                <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">
                  {g.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/guides"
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-accent"
      >
        View all guides
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </aside>
  );
}

export function GearSetupFinderPanel({ data }: SidebarProps) {
  const shoeCompareHref = data.coreItems.find((i) =>
    i.product.categoryId.includes("shoe"),
  )?.compareHref;

  return (
    <div className="space-y-4">
      {data.builder ? (
        <aside className="border border-border bg-[#0b1220] p-5 text-white">
          <h2 className="font-display text-[15px] font-bold">
            Still not sure what you need?
          </h2>
          <p className="mt-2 text-[12px] text-white/75">
            Customize this setup with your budget, conditions and existing gear.
          </p>
          <Link
            href={data.builder.href}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-accent px-3 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
          >
            {data.builder.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </aside>
      ) : data.finder ? (
        <aside className="border border-border bg-[#f4ffe0] p-5">
          <h2 className="font-display text-[15px] font-bold text-foreground">
            Still not sure what you need?
          </h2>
          <p className="mt-2 text-[12px] text-muted">
            The {data.finder.tool.name} helps with footwear choices. Use Make it
            your own above for full-kit variants.
          </p>
          <Link
            href={data.finder.href}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-accent px-3 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
          >
            {data.finder.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </aside>
      ) : null}

      {shoeCompareHref && (
        <aside className="border border-border bg-[#1a2332] p-5 text-white">
          <h2 className="font-display text-[15px] font-bold">
            Compare alternatives
          </h2>
          <p className="mt-2 text-[12px] text-white/75">
            Compare race shoes in the same category — not the full kit.
          </p>
          <Link
            href={shoeCompareHref}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-accent px-3 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
          >
            Open Compare Builder
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </aside>
      )}
    </div>
  );
}

export function GearSetupAlternatives({ data }: SidebarProps) {
  const alts = data.coreItems
    .filter((i) => i.alternativeProducts.length > 0)
    .map((i) => ({
      roleLabel: i.roleLabel,
      alt: i.alternativeProducts[0],
    }));

  if (!alts.length) return null;

  return (
    <section id="alternatives" className="scroll-mt-16 space-y-4">
      <div>
        <h2 className="font-display text-[1.2rem] font-bold tracking-tight text-foreground uppercase">
          Alternatives for key items
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          One alternative per important role when needs differ.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {alts.map(({ roleLabel, alt }) => (
          <li
            key={`${roleLabel}-${alt.product.id}`}
            className="border border-border bg-white p-3"
          >
            <p className="text-[10px] font-bold tracking-[0.14em] text-accent uppercase">
              {roleLabel}
            </p>
            <Link
              href={alt.href}
              className="relative mt-2 block aspect-[4/3] overflow-hidden bg-surface-muted"
            >
              {alt.media ? (
                <Image
                  src={alt.media.src}
                  alt={alt.media.alt || alt.product.fullName}
                  fill
                  className="object-contain p-2"
                  sizes="200px"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[11px] text-subtle">
                  Image unavailable
                </span>
              )}
            </Link>
            <Link
              href={alt.href}
              className="mt-2 block text-[13px] font-semibold text-foreground hover:text-accent"
            >
              {alt.brand?.name ? `${alt.brand.name} ${alt.product.name}` : alt.product.fullName}
            </Link>
            {typeof alt.score === "number" && alt.scoreLabel && (
              <p className="text-[11px] text-muted">
                {(alt.score / 10).toFixed(1)} {alt.scoreLabel}
              </p>
            )}
            {alt.price && (
              <p className="text-[12px] font-medium text-foreground">
                From {formatPrice(alt.price.price, alt.price.currency)}
              </p>
            )}
            <Link
              href={alt.href}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-accent"
            >
              View alternative
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GearSetupNextItems({ data }: SidebarProps) {
  if (!data.nextItems.length) return null;

  return (
    <section id="what-to-buy-next" className="scroll-mt-16 space-y-4">
      <div>
        <h2 className="font-display text-[1.2rem] font-bold tracking-tight text-foreground uppercase">
          {data.nextSectionLabel}
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Useful beyond the essential race-day carry — labeled by context.
        </p>
      </div>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {data.nextItems.map((item) => (
          <li
            key={item.product.id}
            className="w-[220px] shrink-0 border border-border bg-white p-3 sm:w-auto"
          >
            <Link
              href={item.href}
              className="relative block aspect-[4/3] overflow-hidden bg-surface-muted"
            >
              {item.media ? (
                <Image
                  src={item.media.src}
                  alt={item.media.alt || item.product.fullName}
                  fill
                  className="object-contain p-2"
                  sizes="220px"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[11px] text-subtle">
                  Image unavailable
                </span>
              )}
            </Link>
            <p className="mt-2 text-[10px] font-bold tracking-[0.14em] text-accent uppercase">
              {item.roleLabel}
            </p>
            <Link
              href={item.href}
              className="mt-1 block text-[13px] font-semibold text-foreground hover:text-accent"
            >
              {item.brand?.name
                ? `${item.brand.name} ${item.product.name}`
                : item.product.fullName}
            </Link>
            {item.price ? (
              <p className="mt-1 text-[12px] text-muted">
                From {formatPrice(item.price.price, item.price.currency)}
              </p>
            ) : (
              <p className="mt-1 text-[12px] text-subtle">Price unavailable</p>
            )}
            <Link
              href={item.href}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-accent"
            >
              View options
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
