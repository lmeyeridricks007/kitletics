import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BacklinksNav } from "@/components/admin/growth/BacklinksNav";

export const metadata: Metadata = {
  title: "Backlink growth",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function BacklinksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Internal · not indexed
            </p>
            <h1 className="font-display text-xl font-semibold">
              Kitletics backlink & digital PR
            </h1>
          </div>
          <p className="max-w-md text-xs text-muted">
            Action queue only. No auto-send. Do not invent emails. Customer-service
            forms are not editorial.
          </p>
        </div>
        <BacklinksNav />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
