import {
  BadgeCheck,
  Database,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

const PILLARS = [
  {
    title: "Independent & Transparent",
    description:
      "We don't sell gear. Guidance is independent, labelled honestly, and evidence-led.",
    icon: BadgeCheck,
  },
  {
    title: "Always Up to Date",
    description:
      "Products, prices and new releases are continually reviewed.",
    icon: RefreshCw,
  },
  {
    title: "Real Prices",
    description:
      "Regional retailer offers with last-checked timestamps — not invented MSRP.",
    icon: Database,
  },
  {
    title: "Find What Fits You",
    description:
      "Smart tools match gear to your sport, goals and budget.",
    icon: Sparkles,
  },
] as const;

export function TrustRow() {
  return (
    <section className="border-y border-border bg-surface-muted py-12 sm:py-14">
      <Container size="wide">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="space-y-3">
              <pillar.icon
                className="size-6 text-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="font-display text-[15px] font-bold text-foreground">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
