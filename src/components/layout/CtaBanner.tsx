import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";
import { ButtonLink } from "@/components/ui/Button";

interface CtaBannerProps {
  title: string;
  description?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
  children?: ReactNode;
}

export function CtaBanner({
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: CtaBannerProps) {
  return (
    <section className={cn("py-16 sm:py-20", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-charcoal-900 px-6 py-12 text-white sm:px-12 sm:py-16 dark:bg-surface-elevated dark:border dark:border-border">
          <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl space-y-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="text-base text-white/70 sm:text-lg">{description}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href={primaryCta.href} size="lg">
                {primaryCta.label}
              </ButtonLink>
              {secondaryCta && (
                <ButtonLink
                  href={secondaryCta.href}
                  variant="outline"
                  size="lg"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40"
                >
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
