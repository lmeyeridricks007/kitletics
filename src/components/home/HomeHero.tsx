import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomepageData } from "@/lib/home/types";
import { ShieldCheck } from "lucide-react";

export function HomeHero({ hero }: { hero: HomepageData["hero"] }) {
  const accentStart = hero.headlineAccent.indexOf(hero.accentPhrase);
  const beforeAccent =
    accentStart >= 0
      ? hero.headlineAccent.slice(0, accentStart)
      : hero.headlineAccent;
  const accent = accentStart >= 0 ? hero.accentPhrase : "";

  return (
    <section className="relative overflow-hidden bg-background-dark">
      <div className="absolute inset-0">
        <Image
          src={hero.imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] brightness-[1.18] contrast-[1.06] saturate-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/88 via-background-dark/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/45 via-transparent to-background-dark/20" />
      </div>

      <Container size="wide" className="relative">
        <div className="grid min-h-[420px] items-center gap-10 py-16 lg:min-h-[480px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:py-20">
          <div className="animate-fade-up max-w-xl space-y-6">
            <h1 className="font-display text-[clamp(2.25rem,8vw,4.25rem)] leading-[0.95] font-bold tracking-[-0.02em] break-words text-white uppercase">
              <span className="block">{hero.headlineLead}</span>
              <span className="block">
                {beforeAccent}
                {accent && <span className="text-accent">{accent}</span>}
              </span>
            </h1>            <p className="max-w-md text-[15px] leading-relaxed text-white/75">
              {hero.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-accent px-5 text-[13px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-white/70 px-5 text-[13px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:border-white hover:bg-white/5"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
            <div className="flex items-center gap-2.5 pt-2 text-sm text-white/70">
              <ShieldCheck className="size-4 text-accent" strokeWidth={1.75} />
              <span>
                Independent methodology · Structured product data · No paid
                rankings
              </span>
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
