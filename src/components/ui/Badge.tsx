import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-surface-muted text-foreground border border-border",
  accent: "bg-accent text-accent-foreground border border-transparent",
  success: "bg-success-muted text-success border border-transparent",
  warning: "bg-warning-muted text-warning border border-transparent",
  danger: "bg-danger-muted text-danger border border-transparent",
  muted: "bg-transparent text-muted border border-border",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
