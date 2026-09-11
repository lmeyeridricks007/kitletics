import {
  Check,
  MinusCircle,
  Star,
  UserX,
  Users,
} from "lucide-react";
import { LinkifiedText } from "@/components/editorial/LinkifiedText";
import type { CatalogMentionOptions } from "@/lib/editorial/catalog-mentions";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

function splitSummary(summary: string): string[] {
  const trimmed = summary.trim();
  if (!trimmed) return [];
  if (trimmed.includes("\n\n")) {
    return trimmed
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length < 2) return [trimmed];
  const mid = Math.ceil(sentences.length / 2);
  const first = sentences.slice(0, mid).join("").trim();
  const second = sentences.slice(mid).join("").trim();
  return [first, second].filter(Boolean);
}

function AudienceList({
  title,
  items,
  icon: Icon,
  iconClass,
  mentionOptions,
}: {
  title: string;
  items: string[];
  icon: typeof Users;
  iconClass: string;
  mentionOptions?: CatalogMentionOptions;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className={`size-4 shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden />
        <h3 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
          {title}
        </h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-[14px] leading-snug text-muted">
            <LinkifiedText text={item} options={mentionOptions} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewSummaryBlock({
  data,
  mentionOptions,
}: {
  data: ReviewPageData;
  mentionOptions?: CatalogMentionOptions;
}) {
  const { review, glanceRows, bottomLine } = data;
  const paragraphs = splitSummary(review.summary);

  return (
    <section id="summary" className={SCROLL}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <h2 className="heading-section">Review summary</h2>
          <div className="mt-4 space-y-4">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="text-[15px] leading-relaxed text-muted">
                <LinkifiedText text={p} options={mentionOptions} />
              </p>
            ))}
          </div>

          <div className="mt-6 flex gap-3 rounded-md bg-accent-muted px-4 py-3.5 sm:px-5">
            <Star
              className="mt-0.5 size-4 shrink-0 text-accent-ink"
              strokeWidth={1.75}
              aria-hidden
            />
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">
                The bottom line
              </p>
              <p className="mt-1 text-[15px] leading-snug font-medium text-foreground">
                <LinkifiedText text={bottomLine} options={mentionOptions} />
              </p>
            </div>
          </div>

          {data.fitSizingDisclosure ? (
            <p className="mt-5 border-l-2 border-border pl-3.5 text-[13px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Fit / sizing. </span>
              {data.fitSizingDisclosure}
            </p>
          ) : null}

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <AudienceList
              title="Who this review is for"
              items={review.whoShouldBuy}
              icon={Users}
              iconClass="text-success"
              mentionOptions={mentionOptions}
            />
            <AudienceList
              title="Who it's not for"
              items={review.whoShouldAvoid}
              icon={UserX}
              iconClass="text-subtle"
              mentionOptions={mentionOptions}
            />
            <AudienceList
              title="Pros"
              items={review.pros}
              icon={Check}
              iconClass="text-success"
              mentionOptions={mentionOptions}
            />
            <AudienceList
              title="Cons"
              items={review.cons}
              icon={MinusCircle}
              iconClass="text-danger"
              mentionOptions={mentionOptions}
            />
          </div>
        </div>

        {glanceRows.length > 0 && (
          <aside className="lg:sticky lg:top-[calc(var(--site-chrome-height)+3.5rem)]">
            <div className="rounded-lg border border-border bg-white p-5">
              <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                At a glance
              </p>
              <dl className="mt-4 divide-y divide-border">
                {glanceRows.map((row) => {
                  const items = row.items?.filter(Boolean) ?? [];
                  if (items.length > 0) {
                    return (
                      <div key={row.key} className="py-3 first:pt-0 last:pb-0">
                        <dt className="text-[11px] font-bold tracking-[0.1em] text-subtle uppercase">
                          {row.label}
                        </dt>
                        <dd className="mt-2">
                          <ul className="space-y-2">
                            {items.map((item) => (
                              <li
                                key={item}
                                className="flex gap-2 text-[13px] leading-snug text-foreground"
                              >
                                <Check
                                  className="mt-0.5 size-3.5 shrink-0 text-accent-ink"
                                  strokeWidth={2.5}
                                  aria-hidden
                                />
                                <span>
                                  <LinkifiedText
                                    text={item}
                                    options={mentionOptions}
                                  />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.key}
                      className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                    >
                      <dt className="shrink-0 text-[13px] text-muted">
                        {row.label}
                      </dt>
                      <dd className="text-right text-[13px] font-semibold text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
