import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";

interface StickySidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
  /** Sidebar on the right instead of left */
  sidebarRight?: boolean;
}

export function StickySidebarLayout({
  sidebar,
  children,
  className,
  sidebarRight = false,
}: StickySidebarLayoutProps) {
  return (
    <Container
      className={cn(
        "grid gap-10 py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14",
        sidebarRight && "lg:grid-cols-[minmax(0,1fr)_240px]",
        className,
      )}
    >
      <aside
        className={cn(
          "lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start",
          sidebarRight && "lg:order-2",
        )}
      >
        {sidebar}
      </aside>
      <div className={cn(sidebarRight && "lg:order-1")}>{children}</div>
    </Container>
  );
}
