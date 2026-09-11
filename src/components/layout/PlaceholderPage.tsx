import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  badge?: string;
  children?: ReactNode;
}

export function PlaceholderPage({
  title,
  description,
  badge = "Foundation ready",
  children,
}: PlaceholderPageProps) {
  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: title },
          ]}
          className="mb-10"
        />
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent" className="mb-4">
            {badge}
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted sm:text-lg">{description}</p>
          {children}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/running">Go to Running</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}

export function placeholderMetadata(
  title: string,
  description: string,
): Metadata {
  return { title, description };
}
