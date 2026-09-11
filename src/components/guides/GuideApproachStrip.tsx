import Image from "next/image";
import Link from "next/link";
import type { GuideProductCardData } from "@/lib/guides/get-long-form-guide-page-data";

/** Compact product visual strip shown early in explainer guides. */
export function GuideApproachStrip({
  title = "Approaches in this guide",
  products,
}: {
  title?: string;
  products: GuideProductCardData[];
}) {
  const withMedia = products.filter((p) => p.media?.src);
  if (withMedia.length === 0) return null;

  return (
    <section
      aria-label={title}
      className="scroll-mt-28 border border-border bg-white"
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <p className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
          {title}
        </p>
      </div>
      <ul className="grid gap-0 sm:grid-cols-3">
        {withMedia.slice(0, 3).map((item, index) => {
          const fullName = item.brand?.name
            ? `${item.brand.name} ${item.product.name}`
            : item.product.fullName;
          return (
            <li
              key={item.product.id}
              className={`border-border p-4 ${
                index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""
              }`}
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="group block"
              >
                <div className="relative mx-auto aspect-square max-w-[160px] bg-surface-muted/40">
                  <Image
                    src={item.media!.src}
                    alt={item.media!.alt ?? fullName}
                    fill
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="160px"
                  />
                </div>
                {item.roleLabel && (
                  <p className="mt-3 text-[10px] font-bold tracking-wide text-accent-ink uppercase">
                    {item.roleLabel}
                  </p>
                )}
                <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground group-hover:text-link">
                  {fullName}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
