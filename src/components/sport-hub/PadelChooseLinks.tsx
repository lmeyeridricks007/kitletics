import Link from "next/link";
import { Container } from "@/components/layout/Container";

/** Player-level lanes — Best Guides + Finder, not invented taxonomy URLs. */
const BY_PLAYER = [
  { label: "Beginner", href: "/best/padel-rackets-beginners" },
  { label: "Intermediate", href: "/best/padel-rackets-intermediate" },
  { label: "Advanced", href: "/best/padel-rackets-advanced" },
] as const;

const BY_STYLE = [
  { label: "Control", href: "/best/padel-rackets-control" },
  { label: "All-round", href: "/best/padel-rackets-all-round" },
  { label: "Power", href: "/best/padel-rackets-power" },
  { label: "Comfort", href: "/best/padel-rackets-comfort" },
] as const;

const BY_SHAPE = [
  {
    label: "Round",
    href: "/guides/padel-racket-shapes-explained",
    note: "Forgiveness first",
  },
  {
    label: "Teardrop",
    href: "/guides/round-vs-teardrop-vs-diamond-padel-rackets",
    note: "Balanced attack",
  },
  {
    label: "Diamond",
    href: "/guides/round-vs-teardrop-vs-diamond-padel-rackets",
    note: "Finishing power",
  },
] as const;

const EQUIPMENT = [
  { label: "Choose padel balls", href: "/guides/how-to-choose-padel-balls" },
  { label: "Find the right bag", href: "/guides/how-to-choose-a-padel-bag" },
  { label: "Grip vs overgrip", href: "/guides/padel-grip-vs-overgrip" },
  { label: "Padel gear essentials", href: "/guides/complete-padel-gear-checklist" },
  { label: "Balls", href: "/padel/balls" },
  { label: "Bags", href: "/padel/bags" },
  { label: "Grips", href: "/padel/grips" },
  { label: "Accessories", href: "/padel/accessories" },
] as const;

function LinkRow({
  title,
  items,
}: {
  title: string;
  items: readonly { label: string; href: string; note?: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        {title}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="inline-flex items-baseline gap-1.5 border border-border bg-white px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-accent/60 hover:bg-[#fbfef0]"
          >
            {item.label}
            {item.note ? (
              <span className="text-[11px] font-normal text-muted">
                · {item.note}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Padel hub decision lanes — mirrors RunningFitLinks intent without gender fit.
 * Links only to Best Guides / destination pages that already exist.
 */
export function PadelChooseLinks() {
  return (
    <section className="border-b border-border bg-surface-muted/40">
      <Container size="wide" className="py-6 sm:py-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase">
              Choose your lane
            </p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Player · style · shape · equipment
            </h2>
            <p className="mt-1 max-w-xl text-[14px] text-muted">
              Start from how you play — then open Best picks, shape guides, or
              court equipment. Prefer the Finder when you want a ranked racket
              shortlist.
            </p>
          </div>
          <Link
            href="/tools/padel-racket-finder"
            className="mt-3 inline-flex items-center self-start bg-accent px-4 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90 sm:mt-0"
          >
            Open Racket Finder
          </Link>
        </div>

        <div className="mt-6 grid gap-6 border-t border-border/70 pt-5 lg:grid-cols-2 xl:grid-cols-4">
          <LinkRow title="Choose by player" items={BY_PLAYER} />
          <LinkRow title="Choose by play style" items={BY_STYLE} />
          <LinkRow title="Racket shapes" items={BY_SHAPE} />
          <LinkRow title="Court equipment" items={EQUIPMENT} />
        </div>
      </Container>
    </section>
  );
}
