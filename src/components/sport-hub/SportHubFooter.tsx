import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/content/config";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportHubFooter({
  footer,
}: {
  footer: SportHubPageData["footer"];
}) {
  return (
    <footer className="bg-background-dark text-white">
      <Container
        size="wide"
        className="grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr_1fr_1fr_0.8fr]"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5">
            <Mail className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.6} />
            <div>
              <p className="font-display text-sm font-bold tracking-[0.08em] uppercase">
                Get the best gear advice
              </p>
              <p className="mt-1 text-sm text-white/55">
                Join other athletes who get our gear updates.
              </p>
            </div>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            action="/contact"
            method="get"
          >
            <label className="sr-only" htmlFor="sport-hub-email">
              Email
            </label>
            <input
              id="sport-hub-email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="h-10 flex-1 rounded-[4px] border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-[4px] bg-accent px-4 text-[11px] font-bold tracking-[0.08em] text-accent-foreground uppercase hover:bg-accent-hover"
            >
              Subscribe
            </button>
          </form>
        </div>

        <FooterCol title="Shop" links={footer.shop} />
        <FooterCol title="Tools" links={footer.tools} />
        <FooterCol title="About" links={footer.about} />

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">
            Follow us
          </p>
          <div className="flex gap-3 text-white/70" aria-hidden>
            <SocialMark />
            <SocialMark />
            <SocialMark />
            <SocialMark />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container
          size="wide"
          className="flex flex-col gap-3 py-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <ul className="flex gap-4">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialMark() {
  return <span className="inline-block size-4 rounded-sm border border-white/30" />;
}
