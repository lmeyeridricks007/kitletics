import { Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";

/** Decorative social marks — no hrefs until accounts are configured. */
function SocialIcons() {
  return (
    <span className="flex items-center gap-2.5" aria-hidden="true">
      <span className="inline-flex size-4 text-white/70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </span>
      <span className="inline-flex size-4 text-white/70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <rect x="2.5" y="5.5" width="19" height="13" rx="3" />
          <path
            d="M10 9.5v5l5-2.5-5-2.5z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </span>
      <span className="inline-flex size-4 text-white/70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      </span>
      <span className="inline-flex size-4 text-white/70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v2H6v4h3v7h4v-7h3.2l.8-4H13V9a1 1 0 0 1 1-1z" />
        </svg>
      </span>
    </span>
  );
}

export function NewsletterStrip() {
  return (
    <section className="bg-background-dark">
      <Container
        size="wide"
        className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
      >
        <div className="flex min-w-0 items-start gap-3 text-white lg:max-w-sm">
          <Mail
            className="mt-0.5 size-5 shrink-0 text-accent"
            strokeWidth={1.6}
            aria-hidden
          />
          <div>
            <p className="font-display text-sm font-bold tracking-[0.08em] uppercase">
              Get the best gear advice
            </p>
            <p className="mt-1 text-sm text-white/60">
              Join other athletes who get our gear updates.
            </p>
          </div>
        </div>

        <form
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          action="/contact"
          method="get"
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="h-11 flex-1 rounded-[4px] border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-[4px] bg-accent px-5 text-[12px] font-bold tracking-[0.08em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
          >
            Subscribe
          </button>
        </form>

        <div className="flex items-center gap-3 text-white/70">
          <span className="text-sm">Follow us</span>
          <SocialIcons />
        </div>
      </Container>
    </section>
  );
}
