import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /**
   * Surface tone — `on-dark` for dark heroes/chrome;
   * `default` for light editorial surfaces (muted text).
   */
  tone?: "default" | "on-dark";
}

export function Breadcrumbs({
  items,
  className,
  tone = "default",
}: BreadcrumbsProps) {
  const onDark = tone === "on-dark";

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5",
          onDark ? "text-white/60" : "text-muted",
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "size-3.5",
                    onDark ? "text-white/35" : "text-subtle",
                  )}
                  aria-hidden
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    onDark
                      ? "hover:text-white"
                      : "hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast &&
                      (onDark
                        ? "font-medium text-white/85"
                        : "font-medium text-foreground"),
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
