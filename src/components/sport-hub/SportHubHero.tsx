import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Trophy,
  Scale,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { SportHubPageData } from "@/lib/sport-hub/types";

const ICONS = {
  search: Search,
  trophy: Trophy,
  compare: Scale,
  guide: BookOpen,
} as const;

export function SportHubHero({
  breadcrumbs,
  hero,
  quickActions,
}: {
  breadcrumbs: SportHubPageData["breadcrumbs"];
  hero: SportHubPageData["hero"];
  quickActions: SportHubPageData["quickActions"];
}) {
  return (
    <section className="relative overflow-hidden bg-background-dark">
      <div className="absolute inset-0">
        <Image
          src={hero.imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/90 to-background-dark/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/70 via-transparent to-background-dark/30" />
      </div>

      <Container size="wide" className="relative py-8 sm:py-10 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-xl space-y-5">
            <nav aria-label="Breadcrumb" className="text-[12px] text-white/55">
              <ol className="flex flex-wrap items-center gap-1.5">
                {breadcrumbs.map((crumb, i) => (
                  <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden>›</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-white">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/80">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <h1 className="font-display text-[clamp(2.75rem,5vw,3.75rem)] leading-none font-bold tracking-tight text-white">
              {hero.title}
            </h1>

            <p className="max-w-lg text-[15px] leading-relaxed text-white/75">
              {hero.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-white/70">
              <ShieldCheck className="size-4 text-accent" strokeWidth={1.75} />
              <span>Evidence-backed recommendations · Independent methodology</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = ICONS[action.icon];
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="rounded-md border border-white/20 bg-black/25 px-3 py-3 backdrop-blur-[2px] transition-colors hover:border-white/40 hover:bg-black/35"
                  >
                    <Icon
                      className="mb-2 size-4 text-white/80"
                      strokeWidth={1.6}
                    />
                    <p className="text-[11px] leading-tight font-bold tracking-[0.04em] text-white uppercase">
                      {action.title}
                    </p>
                    <p className="mt-1 text-[11px] text-white/55">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden min-h-[280px] lg:block" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
