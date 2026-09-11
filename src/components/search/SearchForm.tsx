"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  placeholder?: string;
  action?: string;
  defaultQuery?: string;
  className?: string;
  /** Extra query params preserved on submit (e.g. sport filter on /brands). */
  hiddenFields?: { name: string; value: string }[];
}

export function SearchForm({
  placeholder = "Search…",
  action = "/search",
  defaultQuery = "",
  className,
  hiddenFields = [],
}: SearchFormProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    const query = q.trim();
    if (query) params.set("q", query);
    for (const field of hiddenFields) {
      if (field.value) params.set(field.name, field.value);
    }
    const qs = params.toString();
    router.push(qs ? `${action}?${qs}` : action);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex w-full max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm",
        className,
      )}
      role="search"
    >
      <Search className="size-4 text-subtle" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
        aria-label={placeholder}
      />
      {hiddenFields.map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}
      <button
        type="submit"
        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
      >
        Search
      </button>
    </form>
  );
}
