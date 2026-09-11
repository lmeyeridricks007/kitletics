"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/** Inline header search field — active on /search with query state. */
export function HeaderSearchField({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === "/search" ? searchParams.get("q") ?? "" : "";
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const q = value.trim().replace(/\s+/g, " ");
    // Never send free-form query text (PII risk) — length + presence only
    track("search", {
      page_type: "search",
      has_query: q.length > 0,
      query_length: q.length,
    });
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function clear() {
    setValue("");
    if (pathname === "/search") router.push("/search");
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "hidden h-10 w-[min(100vw,280px)] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 md:inline-flex",
        className,
      )}
    >
      <label htmlFor="header-search-input" className="sr-only">
        Search Kitletics
      </label>
      <input
        id="header-search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, sports, guides..."
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="inline-flex size-6 shrink-0 items-center justify-center text-white/55 hover:text-white"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="inline-flex size-6 shrink-0 items-center justify-center text-white/55 hover:text-white"
      >
        <Search className="size-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}
