import Link from "next/link";
import {
  Activity,
  Battery,
  Box,
  Flag,
  Heart,
  Map,
  Route,
  Target,
  Zap,
} from "lucide-react";
import {
  GuideNumberedHeading,
  GuideSection,
  GuideTipCallout,
} from "@/components/guides/GuidePrimitives";
import type { GuideNeedCard } from "@/lib/guides/long-form-config";

const ICONS = {
  activity: Activity,
  route: Route,
  zap: Zap,
  flag: Flag,
  heart: Heart,
  target: Target,
  battery: Battery,
  map: Map,
  box: Box,
} as const;

export function GuideNeedsSection({
  number,
  needs,
  tip,
}: {
  number: number;
  needs: GuideNeedCard[];
  tip?: { title: string; body: string };
}) {
  return (
    <GuideSection id="needs">
      <GuideNumberedHeading
        number={number}
        title="Know your running needs"
        id="needs-heading"
      />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        Start with what the shoe must do most often. Different sessions pull
        different priorities — cushion, weight, response and durability.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {needs.map((card) => {
          const Icon = ICONS[card.icon] ?? Activity;
          const inner = (
            <>
              <Icon
                className="size-5 text-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="mt-3 text-[14px] font-bold">{card.title}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted">
                {card.description}
              </p>
            </>
          );
          return (
            <li key={card.id}>
              {card.href ? (
                <Link
                  href={card.href}
                  className="flex h-full flex-col border border-border bg-white p-4 hover:border-foreground/40"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex h-full flex-col border border-border bg-white p-4">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {tip && <GuideTipCallout title={tip.title} body={tip.body} />}
    </GuideSection>
  );
}
