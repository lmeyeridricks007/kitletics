import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-20 sm:py-28">
      <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        That page is unavailable — it may have moved, or it is not published yet.
      </p>
      <nav
        aria-label="Helpful destinations"
        className="mt-10 flex flex-wrap gap-3"
      >
        {[
          { href: "/search", label: "Search" },
          { href: "/running", label: "Running" },
          { href: "/gear", label: "Gear" },
          { href: "/tools", label: "Tools" },
          { href: "/", label: "Home" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </Container>
  );
}
