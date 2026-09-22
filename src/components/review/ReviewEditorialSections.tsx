import Image from "next/image";
import type { ContentSection } from "@/domain/editorial/types";
import { LinkifiedText } from "@/components/editorial/LinkifiedText";
import type { CatalogMentionOptions } from "@/lib/editorial/catalog-mentions";
import { ReviewMidArticleCommerce } from "@/components/review/ReviewCommerceCtas";
import { cn } from "@/lib/utils";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

const MIN_BODY = 40;

type SectionLayout = "intro" | "split" | "compact";

function layoutFor(heading: string, index: number): SectionLayout {
  const h = heading.toLowerCase();
  if (index === 0) return "intro";
  if (/spec|tech|key spec/.test(h)) return "compact";
  return "split";
}

export function ReviewEditorialSections({
  sections,
  mentionOptions,
  productName,
}: {
  sections: ContentSection[];
  mentionOptions?: CatalogMentionOptions;
  productName?: string;
}) {
  const substantive = sections.filter((s) => s.body.trim().length >= MIN_BODY);
  if (substantive.length === 0) return null;

  const midIndex = Math.max(1, Math.floor(substantive.length / 2) - 1);

  return (
    <div className="space-y-10 sm:space-y-14">
      {substantive.map((section, index) => {
        const layout = layoutFor(section.heading, index);
        const imageLeft = layout === "split" && index % 2 === 0;
        const paragraphs = section.body
          .trim()
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean);
        const hasImage = Boolean(section.image?.src);
        const sticky = layout === "split" && index < 3;

        return (
          <div key={section.id} className="space-y-10">
            <section id={section.id} className={SCROLL}>
              <h2 className="heading-section">{section.heading}</h2>
              {layout === "intro" ? (
                <div className="mt-5 max-w-3xl space-y-5">
                  {hasImage && section.image ? (
                    <figure className="max-w-xl">
                      <div className="overflow-hidden border border-border bg-[#eef0f2]">
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={section.image.src}
                            alt={section.image.alt}
                            fill
                            className="object-contain p-4 sm:p-6"
                            sizes="(max-width: 1024px) 100vw, 42vw"
                            priority
                          />
                        </div>
                      </div>
                      {section.image.caption ? (
                        <figcaption className="mt-2 text-[12px] leading-snug text-subtle">
                          {section.image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null}
                  {paragraphs.map((para) => (
                    <p
                      key={para.slice(0, 48)}
                      className="text-[15px] leading-relaxed text-muted whitespace-pre-line"
                    >
                      <LinkifiedText text={para} options={mentionOptions} />
                    </p>
                  ))}
                </div>
              ) : (
                <div
                  className={
                    hasImage
                      ? "mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10"
                      : "mt-4 max-w-3xl"
                  }
                >
                  {hasImage && section.image ? (
                    <figure
                      className={cn(
                        imageLeft ? "order-1" : "order-1 lg:order-2",
                        sticky &&
                          "lg:sticky lg:top-[calc(var(--site-chrome-height)+3.5rem)]",
                      )}
                    >
                      <div className="overflow-hidden border border-border bg-[#eef0f2] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                        <div
                          className={
                            layout === "compact"
                              ? "relative aspect-[16/10]"
                              : "relative aspect-[16/10] lg:aspect-[4/3]"
                          }
                        >
                          <Image
                            src={section.image.src}
                            alt={section.image.alt}
                            fill
                            className={
                              layout === "compact"
                                ? "object-contain p-3 sm:p-4"
                                : "object-contain p-4 sm:p-6"
                            }
                            sizes="(max-width: 1024px) 100vw, 42vw"
                            priority={index < 2}
                          />
                        </div>
                      </div>
                      {section.image.caption ? (
                        <figcaption className="mt-2 px-0.5 text-[12px] leading-snug text-subtle">
                          {section.image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null}
                  <div
                    className={
                      hasImage
                        ? imageLeft
                          ? "order-2 space-y-3.5"
                          : "order-2 space-y-3.5 lg:order-1"
                        : "space-y-3.5"
                    }
                  >
                    {paragraphs.map((para) => (
                      <p
                        key={para.slice(0, 48)}
                        className="text-[15px] leading-relaxed text-muted whitespace-pre-line"
                      >
                        <LinkifiedText text={para} options={mentionOptions} />
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {productName && index === midIndex ? (
              <ReviewMidArticleCommerce productName={productName} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
