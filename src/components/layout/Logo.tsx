import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/content/config";

interface LogoProps {
  className?: string;
  markOnly?: boolean;
  /** Invert wordmark for dark chrome headers */
  inverted?: boolean;
}

/** Lime chevron mark + KITLETICS wordmark matching the homepage mockup. */
export function Logo({
  className,
  markOnly = false,
  inverted = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-[15px] font-bold tracking-[0.14em] uppercase",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M3 3.5L11 11L3 18.5"
          stroke="var(--accent)"
          strokeWidth="3.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M10 3.5L18 11L10 18.5"
          stroke="var(--accent)"
          strokeWidth="3.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {!markOnly && (
        <span className="transition-opacity group-hover:opacity-90">
          {siteConfig.displayName}
        </span>
      )}
    </Link>
  );
}
