import { cn } from "@/lib/utils";
import { siteConfig } from "@/content/config";

interface ProductImageFallbackProps {
  label?: string;
  categoryLabel?: string;
  className?: string;
}

/** Neutral product placeholder — never a fake product photo. */
export function ProductImageFallback({
  label,
  categoryLabel,
  className,
}: ProductImageFallbackProps) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-surface-muted via-charcoal-50 to-white p-6 text-center",
        className,
      )}
    >
      <svg
        width="28"
        height="28"
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
        />
        <path
          d="M10 3.5L18 11L10 18.5"
          stroke="var(--accent)"
          strokeWidth="3.2"
          strokeLinecap="square"
        />
      </svg>
      <div className="space-y-1">
        <p className="text-[10px] font-medium tracking-[0.2em] text-subtle uppercase">
          {siteConfig.displayName}
        </p>
        {categoryLabel && (
          <p className="text-xs font-medium text-muted">{categoryLabel}</p>
        )}
        {label && (
          <p className="font-display text-sm font-semibold text-foreground">
            {label}
          </p>
        )}
        <p className="text-[11px] text-subtle">Product image unavailable</p>
      </div>
    </div>
  );
}
