import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

interface CompareBuilderHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/** Compact white tool header — distinct from editorial PageHeader / curated compare hero. */
export function CompareBuilderHeader({
  breadcrumbs,
  title,
  description,
  actions,
  className,
}: CompareBuilderHeaderProps) {
  return (
    <header
      className={cn("border-b border-border bg-white", className)}
    >
      <Container className="py-5 sm:py-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-3" />
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-foreground sm:text-[2rem] leading-tight">
              {title}
            </h1>
            {description && (
              <p className="max-w-xl text-[14px] text-muted sm:text-[15px]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="shrink-0 sm:pt-1">{actions}</div>
          )}
        </div>
      </Container>
    </header>
  );
}
