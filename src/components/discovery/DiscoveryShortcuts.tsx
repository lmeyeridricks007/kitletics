import Link from "next/link";

/** Client-safe discovery shortcuts — no catalog / card imports. */
export function DiscoveryShortcuts({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
