import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  className?: string;
}

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  badge,
  meta,
  actions,
  media,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn("relative overflow-hidden bg-mesh", className)}>
      <Container className="py-10 sm:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
        )}
        <div
          className={cn(
            "grid gap-10",
            media && "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center",
          )}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow && (
                <p className="text-sm font-medium tracking-wide text-accent uppercase">
                  {eyebrow}
                </p>
              )}
              {badge}
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-base text-muted sm:text-lg">
                {description}
              </p>
            )}
            {meta && <div className="pt-1">{meta}</div>}
            {actions && (
              <div className="flex flex-wrap gap-3 pt-2">{actions}</div>
            )}
          </div>
          {media && <div>{media}</div>}
        </div>
      </Container>
    </section>
  );
}

export function SportPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function CategoryPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function BrandPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function EditorialPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function ToolPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function ProductPageHeader(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

export function StatusBadge({
  status,
}: {
  status: "live" | "partial" | "coming-soon";
}) {
  if (status === "live") return <Badge variant="success">Live</Badge>;
  if (status === "partial") return <Badge variant="accent">Partial</Badge>;
  return <Badge variant="muted">Coming soon</Badge>;
}
