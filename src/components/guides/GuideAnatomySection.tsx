import Image from "next/image";
import {
  GuideNumberedHeading,
  GuideSection,
} from "@/components/guides/GuidePrimitives";
import type { GuideAnatomyAnnotation } from "@/lib/guides/long-form-config";

export function GuideAnatomySection({
  number,
  title,
  imageSrc,
  imageAlt,
  annotations,
}: {
  number: number;
  title: string;
  imageSrc: string;
  imageAlt: string;
  annotations: GuideAnatomyAnnotation[];
}) {
  return (
    <GuideSection id="anatomy">
      <GuideNumberedHeading number={number} title={title} />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        Knowing the parts helps you interpret specs and reviews — without
        treating any single feature as a quality score.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
        <div className="relative aspect-[5/3] w-full overflow-hidden bg-surface-muted">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          {annotations.map((a) => (
            <span
              key={a.id}
              className="absolute z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground shadow"
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              aria-hidden
            >
              {a.number}
            </span>
          ))}
        </div>

        <ol className="space-y-4">
          {annotations.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {a.number}
              </span>
              <div>
                <p className="text-[14px] font-bold">{a.label}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">
                  {a.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </GuideSection>
  );
}
