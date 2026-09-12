import Link from "next/link";
import type { RunningShoeDatasetAboutModel } from "@/lib/running-shoe-database/citation/about-dataset";
import { RunningShoeDatasetShare } from "@/components/running-shoe-database/RunningShoeDatasetShare";
import { RunningShoeDatasetCitationCopy } from "@/components/running-shoe-database/RunningShoeDatasetCitationCopy";
import { RunningShoeDatasetDownloadLink } from "@/components/running-shoe-database/RunningShoeDatasetDownloadLink";

function formatDisplayDate(isoDay: string): string {
  const d = new Date(`${isoDay}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function RunningShoeDatasetAboutSection({
  about,
}: {
  about: RunningShoeDatasetAboutModel;
}) {
  return (
    <section
      id="about-dataset"
      className="scroll-mt-24 border-t border-border bg-white"
      aria-labelledby="about-dataset-heading"
    >
      <div className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            For journalists &amp; researchers
          </p>
          <h2
            id="about-dataset-heading"
            className="mt-1 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight"
          >
            {about.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {about.shoeCount} current running shoes · {about.brandCount} brands
            · citation version {about.version}
            {about.datasetUpdatedOn
              ? ` · Dataset updated ${formatDisplayDate(about.datasetUpdatedOn)}`
              : null}
            . Not a peer-reviewed academic dataset — a structured Kitletics
            catalog extract for transparent reporting.
          </p>
          {!about.datasetUpdatedOn ? (
            <p className="mt-2 text-[13px] text-muted">
              A “Dataset updated” date is shown only when Kitletics records an
              intentional refresh stamp. Deploy time is never used as a
              freshness claim.
            </p>
          ) : null}
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border bg-[#f5f6f7] p-4">
            <dt className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              Shoes in dataset
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
              {about.shoeCount}
            </dd>
          </div>
          <div className="border border-border bg-[#f5f6f7] p-4">
            <dt className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              Brands
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
              {about.brandCount}
            </dd>
          </div>
          <div className="border border-border bg-[#f5f6f7] p-4">
            <dt className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              Price region
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold">{about.region}</dd>
          </div>
          <div className="border border-border bg-[#f5f6f7] p-4">
            <dt className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              Citation version
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold">
              {about.version}
            </dd>
          </div>
        </dl>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {about.sections.map((section) => (
            <article key={section.id} className="border-t border-border pt-6">
              <h3 className="font-display text-lg font-bold tracking-tight">
                {section.heading}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {section.body}
                {section.id === "affiliate" ? (
                  <>
                    {" "}
                    <Link
                      href="/affiliate-disclosure"
                      className="font-semibold text-link hover:text-link-hover"
                    >
                      Affiliate disclosure
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 border border-border bg-[#f5f6f7] p-5 sm:p-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            Cite this data
          </p>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
            Suggested citation
          </h3>
          <p className="mt-2 text-[13px] text-muted">
            Suggested wording for articles and reports. This is a Kitletics
            catalog product, not an academic peer-reviewed dataset.
          </p>
          <RunningShoeDatasetCitationCopy citationText={about.citationText} />
        </div>

        <div className="mt-8 grid gap-8 border-t border-border pt-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Share
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
              Share this view
            </h3>
            <p className="mt-2 mb-4 text-[13px] text-muted">
              Copies and share links use the current page URL, including active
              database filters when present.
            </p>
            <RunningShoeDatasetShare canonicalUrl={about.canonicalUrl} />
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Research extract
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
              Limited CSV download
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              A deliberately limited research file with brand, model, release
              year, weight, drop, stack, primary use, surface and launch price
              (blank until a canonical launch/MSRP field exists). Excludes
              recommendation scores, affiliate URLs and internal metadata.
            </p>
            <p className="mt-4">
              <RunningShoeDatasetDownloadLink href={about.researchCsvHref} />
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-border pt-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Press / research contact
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
              Data questions &amp; enquiries
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Use the public Kitletics contact address — no private personal
              emails. Include the product or page URL when asking about a
              specific shoe.
            </p>
            <ul className="mt-4 space-y-2 text-[14px]">
              <li>
                <a
                  href={about.contact.dataQuestionsHref}
                  className="font-semibold text-link hover:text-link-hover"
                >
                  Data questions
                </a>
              </li>
              <li>
                <a
                  href={about.contact.pressHref}
                  className="font-semibold text-link hover:text-link-hover"
                >
                  Press / research enquiries
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-semibold text-link hover:text-link-hover"
                >
                  Contact page
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Corrections
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
              Spot incorrect product data?
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Data credibility matters more than pretending the catalog is
              perfect. Tell us the product URL and what looks wrong — we use
              corrections to improve the shared catalog.
            </p>
            <p className="mt-4">
              <a
                href={about.contact.correctionsHref}
                className="inline-flex h-10 items-center border border-border bg-white px-4 text-[12px] font-bold tracking-[0.06em] uppercase hover:border-foreground/40"
              >
                Report a correction
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-[12px] text-muted">
          Brands currently represented: {about.brandNames.join(", ")}.
        </p>
      </div>
    </section>
  );
}
