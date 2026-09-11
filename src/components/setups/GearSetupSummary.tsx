import Link from "next/link";
import { ArrowRight, Flag, Package, Target, Wallet } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { formatPrice } from "@/lib/utils";
import type { GearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";

interface GearSetupSummaryProps {
  data: GearSetupPageData;
}

export function GearSetupSummary({ data }: GearSetupSummaryProps) {
  const totalTitle =
    data.knownTotal != null
      ? data.unknownPriceCount > 0
        ? `Known total from ${formatPrice(data.knownTotal, data.currency)}`
        : `From ${formatPrice(data.knownTotal, data.currency)}`
      : "Prices unavailable";

  const totalDetail =
    data.unknownPriceCount > 0
      ? `${data.unknownPriceCount} price${data.unknownPriceCount === 1 ? "" : "s"} unavailable`
      : `Total price (${data.region})`;

  const coverageDetail = data.setup.slug.includes("race-day")
    ? "Complete race-day setup"
    : "Complete goal setup";

  const blocks = [
    {
      icon: Package,
      title: `${data.coreItemCount} essential items`,
      detail: coverageDetail,
    },
    {
      icon: Wallet,
      title: totalTitle,
      detail: totalDetail,
    },
    {
      icon: Target,
      title: data.summaryFocus[0]?.title ?? "Context focused",
      detail: data.summaryFocus[0]?.detail ?? data.goalLabel,
    },
    {
      icon: Flag,
      title: data.summaryFocus[1]?.title ?? "Ready to use",
      detail: data.summaryFocus[1]?.detail ?? data.experienceLevel,
    },
  ];

  return (
    <section className="border-b border-border bg-[#f3f4f6]">
      <Container size="wide" className="py-5 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">
              Kit summary
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {blocks.map((block) => (
                <li key={block.title} className="flex gap-3">
                  <block.icon
                    className="mt-0.5 size-5 shrink-0 text-foreground"
                    strokeWidth={1.6}
                    aria-hidden
                  />
                  <div>
                    <p className="text-[14px] font-semibold leading-snug text-foreground">
                      {block.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">{block.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-subtle">
              {data.priceNote}
            </p>
            {data.compatibilityNotes.length > 0 && (
              <div className="mt-4 max-w-3xl">
                <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                  Compatibility
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12px] text-muted">
                  {data.compatibilityNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.budgetTiers.length > 0 && (
              <div className="mt-4 max-w-3xl">
                <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                  Value paths
                </p>
                <ul className="mt-1.5 space-y-1.5 text-[12px] text-muted">
                  {data.budgetTiers.map((tier) => (
                    <li key={tier.label}>
                      <span className="font-semibold text-foreground">
                        {tier.label}.
                      </span>{" "}
                      {tier.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="shrink-0 lg:text-right">
            <Link
              href={data.customizeHref}
              className="inline-flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 text-[13px] font-bold tracking-wide text-[#0b1220] uppercase transition-opacity hover:opacity-90 lg:w-auto"
            >
              {data.customizeLabel}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
