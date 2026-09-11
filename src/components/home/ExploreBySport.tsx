import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import {
  SPORT_NAV_ICONS,
  type SportNavIconId,
} from "@/components/icons/SportNavIcons";

/**
 * Homepage sport discovery — Day-1 promotes Running as live.
 * Held verticals stay visible as "Soon" without deep hub promotion.
 */
const SPORTS: {
  label: string;
  href: string;
  icon: SportNavIconId;
  status: "live" | "soon";
}[] = [
  { label: "Running", href: "/running", icon: "running", status: "live" },
  { label: "Fitness", href: "/gear", icon: "fitness", status: "soon" },
  { label: "Padel", href: "/gear", icon: "padel", status: "soon" },
  { label: "Tennis", href: "/gear", icon: "tennis", status: "soon" },
  { label: "Trail", href: "/running/trail", icon: "hiking", status: "live" },
  { label: "More", href: "/gear", icon: "more", status: "live" },
];

export function ExploreBySport() {
  return (
    <section className="py-12 sm:py-14">
      <Container size="wide">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="heading-section">Explore by Sport</h2>
          <Link href="/gear" className="link-accent shrink-0">
            View all sports →
          </Link>
        </div>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:flex sm:flex-wrap sm:justify-between sm:gap-y-6 md:flex-nowrap">
          {SPORTS.map((sport) => {
            const Icon = SPORT_NAV_ICONS[sport.icon];
            const live = sport.status === "live";
            return (
              <li key={sport.label} className="min-w-0 sm:w-auto">
                <Link
                  href={sport.href}
                  className="group flex flex-col items-center gap-2.5"
                >
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full border bg-white shadow-[0_1px_3px_rgb(11_15_19/0.06)] transition-colors sm:size-[68px]",
                      live
                        ? "border-accent"
                        : "border-border group-hover:border-border-strong",
                    )}
                  >
                    <Icon className="size-7 text-foreground sm:size-8" />
                  </span>
                  <span className="max-w-full truncate text-center text-[12px] font-medium text-foreground sm:text-[13px]">
                    {sport.label}
                    {!live ? (
                      <span className="mt-0.5 block text-[10px] font-normal tracking-wide text-subtle uppercase">
                        Soon
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
