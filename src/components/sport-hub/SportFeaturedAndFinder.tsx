import { SportHubBestStrip } from "@/components/sport-hub/SportHubBestStrip";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportFeaturedAndFinder({
  bestSection,
  finder,
}: {
  bestSection?: SportHubPageData["bestSection"];
  finder: SportHubPageData["finder"];
}) {
  const products = bestSection?.products ?? [];
  // Never render an empty product strip — that leaves a blank left column beside
  // the finder (as seen when best-guide products fail launch/media gates).
  if (products.length === 0 && !finder) return null;
  if (products.length === 0) {
    return (
      <section className="py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <SportHubBestStrip
            title={finder.title}
            href={finder.ctaHref}
            products={[]}
            finder={finder}
            hideEmptyProductColumn
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SportHubBestStrip
          title={bestSection!.title}
          href={bestSection!.href}
          products={products}
          finder={finder}
        />
      </div>
    </section>
  );
}
