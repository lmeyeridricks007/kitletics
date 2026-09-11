import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

export function ShoesHowYouRun({
  howYouRun,
}: {
  howYouRun: ShoesCategoryPageData["howYouRun"];
}) {
  return (
    <section className="border-t border-border bg-white py-9 sm:py-10">
      <Container size="wide">
        <h2 className="heading-section mb-5">{howYouRun.title}</h2>

        <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {howYouRun.items.map((item) => (
            <article
              key={item.id}
              className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white sm:w-auto"
            >
              <Link
                href={item.href}
                className="relative block aspect-[5/4] overflow-hidden bg-[#eceeef]"
              >
                {item.image ? (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes={IMAGE_SIZES.useCaseChip}
                    quality={IMAGE_QUALITY.card}
                    loading="lazy"
                    className={
                      item.image.presentation === "contain"
                        ? "object-contain p-4"
                        : "object-cover"
                    }
                  />
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-br from-[#e8eaec] to-[#d5d8db]" />
                )}
              </Link>
              <div className="flex flex-1 flex-col px-3 py-2.5">
                <h3 className="text-[13px] font-bold text-foreground">
                  {item.label}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-2 text-[12px] font-medium text-link hover:underline"
                >
                  View shoes →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {howYouRun.chips.map((chip) => (
            <Link
              key={chip.id}
              href={chip.href}
              className="rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-muted"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
