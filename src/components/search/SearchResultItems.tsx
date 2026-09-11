import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SearchHit } from "@/lib/search/types";
import { RatingBadge } from "@/components/content/RatingBadge";
import { Badge } from "@/components/ui/Badge";
import {
  Footprints,
  Wrench,
  BookOpen,
  Scale,
  Tag,
  type LucideIcon,
} from "lucide-react";

interface ResultProps {
  hit: SearchHit;
  onSelect?: () => void;
  className?: string;
}

export function ProductSearchResult({ hit, onSelect, className }: ResultProps) {
  return (
    <Link
      href={hit.href}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-bold text-muted">
        {hit.brandName?.slice(0, 2).toUpperCase() ?? "PR"}
      </div>
      <div className="min-w-0 flex-1">
        {hit.brandName && (
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            {hit.brandName}
          </p>
        )}
        <p className="truncate text-sm font-medium text-foreground">{hit.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {hit.categoryName && (
            <span className="text-xs text-muted">{hit.categoryName}</span>
          )}
          {hit.recommendationScore !== undefined && (
            <RatingBadge score={hit.recommendationScore} />
          )}
        </div>
      </div>
    </Link>
  );
}

export function GuideSearchResult({ hit, onSelect, className }: ResultProps) {
  const label =
    hit.type === "best-guide"
      ? "Best guide"
      : hit.type === "buying-guide"
        ? "Buying guide"
        : hit.type === "review"
          ? "Review"
          : "Guide";
  return (
    <Link
      href={hit.href}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
        <BookOpen className="size-4" />
      </div>
      <div className="min-w-0">
        <Badge variant="muted" className="mb-1">
          {label}
        </Badge>
        <p className="truncate text-sm font-medium text-foreground">{hit.title}</p>
        {hit.subtitle && (
          <p className="line-clamp-1 text-xs text-muted">{hit.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function ToolSearchResult({ hit, onSelect, className }: ResultProps) {
  return (
    <Link
      href={hit.href}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-charcoal-900 text-white dark:bg-foreground dark:text-background">
        <Wrench className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{hit.title}</p>
        {hit.subtitle && (
          <p className="line-clamp-1 text-xs text-muted">{hit.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function GenericSearchResult({
  hit,
  onSelect,
  className,
  icon: Icon = Tag,
}: ResultProps & { icon?: LucideIcon }) {
  return (
    <Link
      href={hit.href}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{hit.title}</p>
        {hit.subtitle && (
          <p className="line-clamp-1 text-xs text-muted">{hit.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function SearchResultItem(props: ResultProps) {
  const { hit } = props;
  if (hit.type === "product") return <ProductSearchResult {...props} />;
  if (
    hit.type === "best-guide" ||
    hit.type === "buying-guide" ||
    hit.type === "review"
  ) {
    return <GuideSearchResult {...props} />;
  }
  if (hit.type === "tool") return <ToolSearchResult {...props} />;
  if (hit.type === "comparison") {
    return <GenericSearchResult {...props} icon={Scale} />;
  }
  if (hit.type === "sport" || hit.type === "discipline") {
    return <GenericSearchResult {...props} icon={Footprints} />;
  }
  return <GenericSearchResult {...props} />;
}
