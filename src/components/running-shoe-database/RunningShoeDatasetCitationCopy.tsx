"use client";

import { useState } from "react";
import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";

export function RunningShoeDatasetCitationCopy({
  citationText,
}: {
  citationText: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShoeDatabaseEvent("shoe_database_citation_copy");
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
