"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Global floating compare tray — hidden on /compare itself */
export function GlobalCompareTray() {
  const tray = useCompareTray();
  const pathname = usePathname();

  if (!tray.hydrated) return null;
  if (tray.count === 0) return null;
  if (pathname?.startsWith("/compare")) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur",
      )}
      role="region"
      aria-label="Compare selection"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            Compare ({tray.count}/{tray.max})
          </p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {tray.items.map((item) => (
              <li
                key={item.slug}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs"
              >
                <span className="max-w-[10rem] truncate">
                  {item.brandName ? `${item.brandName} ` : ""}
                  {item.name}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => tray.removeProduct(item.slug, "tray")}
                  className="rounded p-0.5 text-subtle hover:bg-surface-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => tray.clear("tray")}>
            Clear
          </Button>
          <ButtonLink
            href={tray.compareHref}
            size="sm"
            className={cn(tray.count < 2 && "pointer-events-none opacity-50")}
            aria-disabled={tray.count < 2}
          >
            {tray.count < 2 ? "Add one more" : `Compare ${tray.count}`}
          </ButtonLink>
        </div>
      </div>
      {tray.count === 1 && (
        <p className="mx-auto mt-2 max-w-6xl text-xs text-muted">
          Add one more product to compare.{" "}
          <Link href="/compare" className="text-accent hover:underline">
            Open Compare
          </Link>
        </p>
      )}
    </div>
  );
}
