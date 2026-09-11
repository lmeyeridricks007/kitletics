import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";
import { ButtonLink } from "@/components/ui/Button";

interface HeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  media?: ReactNode;
  className?: string;
}

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  media,
  className,
}: HeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-mesh", className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <Container className="relative grid min-h-[calc(100svh-var(--header-height))] items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="animate-fade-up space-y-6">
          {eyebrow && (
            <p className="text-sm font-medium tracking-wide text-accent uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-xl text-base text-muted sm:text-lg">
              {description}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {primaryCta && (
                <ButtonLink href={primaryCta.href} size="lg">
                  {primaryCta.label}
                </ButtonLink>
              )}
              {secondaryCta && (
                <ButtonLink
                  href={secondaryCta.href}
                  variant="outline"
                  size="lg"
                >
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
        {media && (
          <div className="animate-fade-up relative min-h-[320px] lg:min-h-[440px]" style={{ animationDelay: "120ms" }}>
            {media}
          </div>
        )}
      </Container>
    </section>
  );
}
