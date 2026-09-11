import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/headers/PageHeaders";
import { Section } from "@/components/layout/Section";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { siteConfig } from "@/content/config";

interface TrustPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function TrustPageShell({ title, description, children }: TrustPageProps) {
  return (
    <>
      <PageHeader
        breadcrumbs={resolveBreadcrumbs({ type: "page", title })}
        title={title}
        description={description}
      />
      <Section>
        <div className="prose-kitletics mx-auto max-w-2xl space-y-4 text-muted">
          {children}
        </div>
      </Section>
    </>
  );
}

export function trustMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}${path}` },
  };
}
