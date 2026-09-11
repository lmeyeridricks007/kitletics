import { SportHubBestStrip } from "@/components/sport-hub/SportHubBestStrip";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportMoreBestSections({
  sections,
}: {
  sections: SportHubPageData["moreBestSections"];
}) {
  if (!sections.length) return null;

  return (
    <section className="border-t border-border bg-surface-muted/30 py-10 sm:py-12">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-14 px-4 sm:px-6 lg:px-8">
        {sections.map((section) => (
          <SportHubBestStrip
            key={section.id}
            title={section.title}
            href={section.href}
            products={section.products}
            finder={section.finder}
          />
        ))}
      </div>
    </section>
  );
}
