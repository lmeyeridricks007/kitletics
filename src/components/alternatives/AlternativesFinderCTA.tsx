import Image from "next/image";
import Link from "next/link";
import type { AlternativesPageData } from "@/lib/product/get-alternatives-page-data";

interface AlternativesFinderCTAProps {
  data: AlternativesPageData;
}

export function AlternativesFinderCTA({ data }: AlternativesFinderCTAProps) {
  const finder = data.finder;
  if (!finder) return null;

  return (
    <aside className="border border-border bg-white p-5 sm:p-6">
      <h2 className="text-[12px] font-bold tracking-[0.14em] text-foreground uppercase">
        Still not sure?
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Answer a few quick questions and we&apos;ll recommend the best{" "}
        {data.config.productNounPlural} for you.
      </p>
      {finder.montage.length > 0 && (
        <div className="mt-4 flex gap-2">
          {finder.montage.map((m, i) => (
            <div
              key={`${m.src}-${i}`}
              className="relative size-12 overflow-hidden bg-surface-muted"
            >
              <Image
                src={m.src}
                alt={m.alt || ""}
                fill
                className="object-contain p-0.5"
                sizes="48px"
              />
            </div>
          ))}
        </div>
      )}
      <Link
        href={finder.href}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:bg-accent-hover"
      >
        {finder.ctaLabel}
      </Link>
    </aside>
  );
}
