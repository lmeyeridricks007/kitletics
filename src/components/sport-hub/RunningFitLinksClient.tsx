"use client";

import Link from "next/link";
import {
  writePreferredSizing,
  type AudienceFit,
} from "@/lib/product/audience";
import { cn } from "@/lib/utils";

function chipClass(selected: boolean): string {
  return cn(
    "border px-3 py-1.5 text-[12px] font-bold tracking-[0.06em] uppercase transition-colors",
    selected
      ? "border-accent bg-accent text-accent-foreground"
      : "border-border bg-white text-foreground hover:border-foreground",
  );
}

export function RunningFitLinksClient({
  options,
  activeGender,
}: {
  options: {
    value: AudienceFit | "all";
    label: string;
    href: string;
  }[];
  activeGender?: AudienceFit;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Shop running gear by fit"
    >
      {options.map((opt) => {
        const selected =
          opt.value === "all" ? !activeGender : activeGender === opt.value;
        return (
          <Link
            key={opt.value}
            href={opt.href}
            aria-current={selected ? "true" : undefined}
            onClick={() => {
              writePreferredSizing(
                opt.value === "all" ? undefined : opt.value,
              );
            }}
            className={chipClass(selected)}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
