"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { ToolsHubData } from "@/lib/tools/get-tools-hub-data";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";

interface ToolsRecommendationCardProps {
  recommendation: ToolsHubData["recommendation"];
}

export function ToolsRecommendationCard({
  recommendation,
}: ToolsRecommendationCardProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useModalFocus(open, panelRef, close);

  return (
    <>
      <aside className="bg-[#0b1220] p-5 text-white sm:p-6 lg:w-full lg:max-w-[300px]">
        <h2 className="font-display text-[15px] font-semibold leading-snug">
          {recommendation.title}
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-white/80">
          {recommendation.body}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-accent px-4 py-3 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
        >
          {recommendation.ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <p className="mt-3 text-center text-[11px] text-white/55">
          Free · No account required
        </p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={close}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tools-rec-title"
            tabIndex={-1}
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white p-5 shadow-xl outline-none sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase">
                  Start here
                </p>
                <h2
                  id="tools-rec-title"
                  className="mt-1 font-display text-xl font-bold text-foreground"
                >
                  What are you shopping for?
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Pick a finder — we route you to a real tool, not a generic AI
                  chat.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded p-1 text-muted hover:bg-surface-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="mt-5 space-y-2">
              {recommendation.options.map((opt) => (
                <li key={opt.href}>
                  <Link
                    href={opt.href}
                    className="flex items-center justify-between gap-3 border border-border px-4 py-3 text-[14px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                    onClick={close}
                  >
                    <span>
                      {opt.label}
                      {opt.description && (
                        <span className="mt-0.5 block text-[12px] font-normal text-muted">
                          {opt.description}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/compare"
              className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-accent"
              onClick={close}
            >
              Or compare products directly
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
