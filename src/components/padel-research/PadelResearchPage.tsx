import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { PadelResearchPageData } from "@/lib/padel-research/get-research-page-data";

export function PadelResearchPage({ data }: { data: PadelResearchPageData }) {
  return (
    <>
      <section className="border-b border-border-dark bg-[#0b0f13] text-white">
        <Container className="py-10 sm:py-12">
          <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
            Kitletics research
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">
            {data.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
            {data.summary}
          </p>
          <dl className="mt-6 flex flex-wrap gap-6 text-[13px]">
            <div>
              <dt className="text-white/55 uppercase tracking-wide text-[10px] font-bold">
                Eligible cohort
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {data.eligibleCount} rackets
              </dd>
            </div>
            <div>
              <dt className="text-white/55 uppercase tracking-wide text-[10px] font-bold">
                Primary sample
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {data.sampleSize} known
              </dd>
            </div>
            <div>
              <dt className="text-white/55 uppercase tracking-wide text-[10px] font-bold">
                Data date
              </dt>
              <dd className="mt-0.5 font-semibold">
                {data.dataDate ?? "Not stamped"}
              </dd>
            </div>
            <div>
              <dt className="text-white/55 uppercase tracking-wide text-[10px] font-bold">
                Status
              </dt>
              <dd className="mt-0.5 font-semibold">
                {data.published ? "Published findings" : "Withheld"}
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      {!data.published && (
        <section className="border-b border-border bg-[#fff8e8]">
          <Container className="py-8">
            <p className="font-display text-xl font-bold tracking-tight">
              Not yet published — coverage insufficient
            </p>
            <p className="mt-2 max-w-2xl text-[14px] text-muted">
              {data.withheldMessage}
            </p>
            <ul className="mt-4 space-y-1 text-[13px] text-muted">
              {data.readiness.reasons.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {data.published && data.charts.length > 0 && (
        <section className="border-b border-border bg-white">
          <Container className="py-10">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Findings (Kitletics cohort)
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {data.charts.map((chart) => (
                <article
                  key={chart.id}
                  className="border border-border bg-[#f5f6f7] p-5"
                >
                  <h3 className="font-display text-lg font-bold">
                    {chart.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-muted">
                    n={chart.sampleSize} of {chart.populationSize}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {chart.rows.map((row) => (
                      <li
                        key={row.value}
                        className="flex justify-between gap-3 text-[13px]"
                      >
                        <span className="font-semibold">{row.label}</span>
                        <span className="tabular-nums text-muted">
                          {row.count} · {Math.round(row.share * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-b border-border bg-white">
        <Container className="py-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {data.methodology.title}
          </h2>
          <div className="mt-4 max-w-3xl space-y-3 text-[14px] leading-relaxed text-muted">
            {data.methodology.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f5f6f7]">
        <Container className="py-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Limitations
          </h2>
          <ul className="mt-4 max-w-3xl space-y-2 text-[14px] text-muted">
            {data.limitations.map((l) => (
              <li key={l.slice(0, 40)}>· {l}</li>
            ))}
          </ul>
          <p className="mt-6 text-[13px]">
            <Link
              href="/padel/rackets/database"
              className="font-semibold text-link hover:text-link-hover"
            >
              Open the Padel Racket Database
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
