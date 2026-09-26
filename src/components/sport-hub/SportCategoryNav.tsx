import {
  Backpack,
  Briefcase,
  Droplets,
  Flashlight,
  Footprints,
  Headphones,
  HeartPulse,
  Layers,
  Shirt,
  Shield,
  Glasses,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { SportHubPageData } from "@/lib/sport-hub/types";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Watch,
  HeartPulse,
  Droplets,
  Backpack,
  Briefcase,
  Shirt,
  Layers,
  Headphones,
  Glasses,
  Sunglasses: Glasses,
  Flashlight,
  Shield,
  Sparkles: Headphones,
  Circle: Glasses,
  CircleDot: Flashlight,
  Tag: Shield,
};

function CategoryTile({
  href,
  icon,
  label,
  productCount,
}: {
  href: string;
  icon: string;
  label: string;
  productCount?: number;
}) {
  const Icon = ICON_MAP[icon] ?? Layers;
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border/80 bg-white px-3 py-2.5 transition-[border-color,background-color] duration-150 hover:border-accent hover:bg-accent/[0.06]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#0e2a2a]/[0.06] text-[#0e2a2a] transition-colors group-hover:bg-accent/20">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-link whitespace-normal break-words">
          {label}
        </span>
        {typeof productCount === "number" && productCount > 0 ? (
          <span className="mt-0.5 block text-[11px] tabular-nums text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-[12px] font-semibold text-link">
        View all
        <span aria-hidden className="ml-0.5">
          →
        </span>
      </span>
    </Link>
  );
}

export function SportCategoryNav({
  categories,
  groups,
}: {
  categories: SportHubPageData["shopCategories"];
  groups?: SportHubPageData["shopGroups"];
}) {
  if (groups?.length) {
    return (
      <section className="border-b border-border bg-[linear-gradient(180deg,#f4f7f6_0%,#ffffff_88%)]">
        <Container size="wide" className="py-6 sm:py-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="min-w-0 rounded-xl border border-border/70 bg-white/90 p-4 sm:p-5"
              >
                <p className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-[#0e2a2a]/65 uppercase">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-0.5 shrink-0 rounded-full bg-accent"
                  />
                  {group.label}
                </p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={`${group.id}-${item.id}`}>
                      <CategoryTile
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        productCount={item.productCount}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <div className="border-b border-border bg-[linear-gradient(180deg,#f4f7f6_0%,#ffffff_88%)]">
      <Container
        size="wide"
        className="overflow-x-auto py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex min-w-max items-stretch gap-2 px-0.5">
          {categories.map((cat) => (
            <li key={cat.id} className="w-[220px] shrink-0 sm:w-[240px]">
              <CategoryTile
                href={cat.href}
                icon={cat.icon}
                label={cat.label}
                productCount={cat.productCount}
              />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
