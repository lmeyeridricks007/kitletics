"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  ["Action queue", ""],
  ["Apply now", "/apply"],
  ["Community", "/community"],
  ["Weekly", "/weekly"],
  ["Prospects", "/prospects"],
  ["Opportunities", "/opportunities"],
  ["Assets", "/assets"],
  ["Communities", "/communities"],
  ["Competitors", "/competitors"],
  ["Journalists", "/journalists"],
  ["Digital PR", "/digital-pr"],
  ["Outreach", "/outreach"],
  ["Earned Links", "/earned"],
  ["Research Ideas", "/research"],
  ["Imports", "/imports"],
  ["Settings", "/settings"],
] as const;

export function BacklinksNav() {
  const pathname = usePathname();
  const base = "/admin/growth/backlinks";
  return (
    <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
      {LINKS.map(([label, suffix]) => {
        const href = `${base}${suffix}`;
        const active =
          suffix === ""
            ? pathname === base
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
