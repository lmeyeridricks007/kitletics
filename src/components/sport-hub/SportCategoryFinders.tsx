"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { FinderPreviewSelect } from "@/components/finder/FinderPreviewSelect";
import type { SportHubPageData } from "@/lib/sport-hub/types";

function defaultsFrom(
  finder: SportHubPageData["categoryFinders"][number],
): Record<string, string> {
  return Object.fromEntries(finder.fields.map((f) => [f.name, f.value]));
}

function FinderCard({
  finder,
}: {
  finder: SportHubPageData["categoryFinders"][number];
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => defaultsFrom(finder));

  return (
    <aside className="flex h-full flex-col rounded-xl bg-[#0e2a2a] p-5 text-white sm:p-6">
      <h3 className="font-display text-[16px] leading-tight font-bold tracking-[0.04em] uppercase sm:text-[17px]">
        {finder.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-white/65">
        {finder.description}
      </p>

      <form
        className="mt-5 grid flex-1 grid-cols-2 content-start gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(values)) {
            if (value) params.set(key, value);
          }
          const qs = params.toString();
          router.push(qs ? `${finder.ctaHref}?${qs}` : finder.ctaHref);
        }}
      >
        {finder.fields.map((field) => (
          <FinderPreviewSelect
            key={field.name}
            field={field}
            appearance="dark"
            onValueChange={(name, value) =>
              setValues((prev) => ({ ...prev, [name]: value }))
            }
          />
        ))}
        <button
          type="submit"
          className="col-span-2 mt-auto inline-flex h-11 items-center justify-center rounded-[4px] bg-accent text-[12px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
        >
          {finder.ctaLabel} →
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] text-white/55">
        Open the{" "}
        <Link
          href={finder.footnoteHref}
          className="font-medium text-[#7eb6ff] hover:underline"
        >
          {finder.footnoteLabel}
        </Link>
      </p>
    </aside>
  );
}

export function SportCategoryFinders({
  finders,
}: {
  finders: SportHubPageData["categoryFinders"];
}) {
  if (!finders.length) return null;

  return (
    <section className="border-t border-border bg-white py-10 sm:py-12">
      <Container size="wide">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Finders
            </p>
            <h2 className="mt-1 heading-section">Find gear for every category</h2>
            <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
              Same guided matching as the shoe finder — for watches, heart rate,
              hydration, apparel, fuel and more.
            </p>
          </div>
          <Link
            href="/tools?sport=running&type=finder"
            className="text-[13px] font-semibold text-link hover:text-link-hover"
          >
            Browse all finders →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {finders.map((finder) => (
            <FinderCard key={finder.id} finder={finder} />
          ))}
        </div>
      </Container>
    </section>
  );
}
