import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Tool } from "@/domain/tools/types";
import { Badge } from "@/components/ui/Badge";
import { resolveToolIcon } from "@/lib/tools/icons";
import { getToolHref } from "@/lib/tools/href";

interface ToolCardProps {
  tool: Tool;
  sportLabel?: string;
  className?: string;
  featured?: boolean;
}

export function ToolCard({
  tool,
  sportLabel,
  className,
  featured = false,
}: ToolCardProps) {
  const Icon = resolveToolIcon(tool.icon);
  const href = getToolHref(tool);
  const interactive = tool.available;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-charcoal-900 text-white dark:bg-foreground dark:text-background">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge variant="muted">{tool.type}</Badge>
          {!tool.available && <Badge variant="muted">Coming soon</Badge>}
        </div>
      </div>
      <div className="space-y-2">
        {sportLabel && (
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            {sportLabel}
          </p>
        )}
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            interactive && "group-hover:text-accent",
            featured ? "text-xl sm:text-2xl" : "text-lg",
          )}
        >
          {tool.name}
        </h3>
        <p className={cn("text-muted", featured ? "text-base" : "text-sm")}>
          {tool.shortDescription ?? tool.description}
        </p>
      </div>
      <span className="link-cta mt-auto text-sm">
        {tool.available ? "Start →" : "Coming soon"}
      </span>
    </>
  );

  if (!interactive) {
    return (
      <div
        className={cn(
          "flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-6 opacity-80",
          featured && "sm:p-8",
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-md",
        featured && "sm:p-8",
        className,
      )}
    >
      {inner}
    </Link>
  );
}
