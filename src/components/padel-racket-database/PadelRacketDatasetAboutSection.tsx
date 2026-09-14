"use client";

import { useState } from "react";
import type { PadelRacketDatasetAboutModel } from "@/lib/padel-racket-database/citation/about-dataset";
import { trackRacketDatabaseEvent } from "@/lib/padel-racket-database/analytics";

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

function CitationCopy({ citationText }: { citationText: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackRacketDatabaseEvent("racket_database_citation_copy");
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="mt-3 flex flex-wrap items-start gap-3">
      <pre className="max-w-full flex-1 overflow-x-auto border border-border bg-white p-3 text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
        {citationText}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 shrink-0 items-center border border-border bg-white px-3 text-[12px] font-semibold hover:border-foreground/40"
      >
        {copied ? "Copied" : "Copy citation"}
      </button>
    </div>
  );
}

export function PadelRacketDatasetAboutSection({
  about,
}: {
  about: PadelRacketDatasetAboutModel;
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
            {about.racketCount} catalog-eligible padel rackets ·{" "}
            {about.brandCount} brands · citation version {about.version}
            {about.datasetUpdatedOn
              ? ` · Dataset updated ${formatDisplayDate(about.datasetUpdatedOn)}`
              : null}
            . Not a peer-reviewed academic dataset — a structured Kitletics
            catalog extract. Not industry-wide market share.
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
              Rackets in dataset
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
              {about.racketCount}
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
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Cite this dataset
          </h3>
          <CitationCopy citationText={about.citationText} />
          <div className="mt-4">
            <a
              href={about.researchCsvHref}
              className="inline-flex h-10 items-center border border-foreground bg-foreground px-4 text-[12px] font-bold tracking-[0.06em] text-white uppercase hover:bg-foreground/90"
              onClick={() =>
                trackRacketDatabaseEvent("racket_database_data_download", {
                  filter_type: "research_csv",
                })
              }
            >
              Download research CSV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
