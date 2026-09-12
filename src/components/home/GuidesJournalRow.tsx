import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomepageData } from "@/lib/home/types";

export function GuidesJournalRow({
  latestGuides,
  journalItems,
}: {
  latestGuides: HomepageData["latestGuides"];
  journalItems: HomepageData["journalItems"];
}) {
  return (
    <section className="pb-12 sm:pb-14">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="heading-section mb-6">Latest Buying Guides</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {latestGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={guide.href}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-muted">
                    <Image
                      src={guide.imageSrc}
                      alt={guide.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 rounded-[3px] bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-accent-foreground uppercase">
                      Guide
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[15px] leading-snug font-bold text-foreground group-hover:text-link">
                    {guide.title}
                  </h3>
                  {guide.updatedLabel && (
                    <p className="mt-1.5 text-xs text-muted">
                      {guide.updatedLabel}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="heading-section mb-6">From the Journal</h2>
            <ul className="space-y-5">
              {journalItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="group flex gap-4">
                    <div className="relative size-[72px] shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes="72px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="font-display text-[15px] leading-snug font-bold text-foreground group-hover:text-link">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted">
                        {[item.dateLabel, item.readingTime]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
