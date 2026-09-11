import {
  BadgeCheck,
  RefreshCw,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { SportHubPageData } from "@/lib/sport-hub/types";

const ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  RefreshCw,
  Tag,
  Sparkles,
};

export function SportTrustRow({
  benefits,
}: {
  benefits: SportHubPageData["benefits"];
}) {
  return (
    <section className="border-y border-border bg-white py-10">
      <Container size="wide">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const Icon = ICONS[b.icon] ?? BadgeCheck;
            return (
              <li key={b.title} className="space-y-2.5">
                <Icon className="size-5 text-foreground" strokeWidth={1.5} />
                <h3 className="font-display text-[15px] font-bold text-foreground">
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {b.description}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
