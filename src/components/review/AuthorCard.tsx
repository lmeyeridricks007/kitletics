import Link from "next/link";
import type { Author } from "@/domain/editorial/types";

export function AuthorCard({
  author,
  className,
}: {
  author: Author;
  className?: string;
}) {
  return (
    <aside
      className={
        className ??
        "rounded-2xl border border-border bg-surface-muted/40 p-5"
      }
    >
      <p className="text-[10px] font-medium tracking-[0.12em] text-subtle uppercase">
        By
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-foreground">
        {author.name}
      </p>
      {author.title && (
        <p className="mt-0.5 text-sm text-muted">{author.title}</p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-muted">{author.bio}</p>
      {author.expertise.length > 0 && (
        <p className="mt-3 text-xs text-subtle">
          {author.expertise.join(" · ")}
        </p>
      )}
      <Link
        href={`/authors/${author.slug}`}
        className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
      >
        View author profile →
      </Link>
    </aside>
  );
}
