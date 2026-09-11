import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/layout/CtaBanner";

interface ShellBase {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  related?: ReactNode;
  cta?: {
    title: string;
    description?: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  className?: string;
}

/** Standard: header → breadcrumbs → content → related → CTA → footer.
 * Header/footer come from root layout — this wraps page body regions. */
export function StandardShell({
  children,
  breadcrumbs,
  related,
  cta,
  className,
}: ShellBase) {
  return (
    <div className={cn(className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Container className="pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </Container>
      )}
      {children}
      {related}
      {cta && (
        <CtaBanner
          title={cta.title}
          description={cta.description}
          primaryCta={cta.primaryCta}
          secondaryCta={cta.secondaryCta}
        />
      )}
    </div>
  );
}

export function SidebarShell({
  children,
  sidebar,
  breadcrumbs,
  className,
}: ShellBase & { sidebar: ReactNode }) {
  return (
    <div className={cn(className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Container className="pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </Container>
      )}
      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
        <div>{children}</div>
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          {sidebar}
        </aside>
      </Container>
    </div>
  );
}

export function EditorialShell({
  children,
  breadcrumbs,
  sidebar,
  related,
  className,
}: ShellBase & { sidebar?: ReactNode }) {
  return (
    <div className={cn(className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Container className="pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </Container>
      )}
      <Container
        className={cn(
          "grid gap-10 py-10",
          sidebar && "lg:grid-cols-[minmax(0,1fr)_220px]",
        )}
      >
        <article className="min-w-0">{children}</article>
        {sidebar && (
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            {sidebar}
          </aside>
        )}
      </Container>
      {related}
    </div>
  );
}

export function ToolShell({
  children,
  breadcrumbs,
  related,
  className,
}: ShellBase) {
  return (
    <StandardShell
      breadcrumbs={breadcrumbs}
      related={related}
      className={className}
    >
      {children}
    </StandardShell>
  );
}

/** Avoid unused import lint if layout already provides chrome */
void SiteHeader;
void SiteFooter;
