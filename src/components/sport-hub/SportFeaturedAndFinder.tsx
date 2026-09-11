import { SportHubBestStrip } from "@/components/sport-hub/SportHubBestStrip";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportFeaturedAndFinder({
  bestSection,
  finder,
}: {
  bestSection?: SportHubPageData["bestSection"];
  finder: SportHubPageData["finder"];
}) {
  if (!bestSection && !finder) return null;

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {bestSection ? (
          <SportHubBestStrip
            title={bestSection.title}
            href={bestSection.href}
            products={bestSection.products}
            finder={finder}
          />
        ) : (
          <SportHubBestStrip
            title={finder.title}
            href={finder.ctaHref}
            products={[]}
            finder={finder}
          />
        )}
      </div>
    </section>
  );
}
