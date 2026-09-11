import { ExternalLink } from "lucide-react";
import { amazonOfferHref } from "@/lib/review/amazon-offer";
import type { OfferRow } from "@/lib/product/get-product-page-data";
import type { OfferClickPlacement } from "@/domain/commerce/types";

type Variant = "primary" | "secondary" | "inline" | "banner";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 bg-[#ff9900] px-5 text-[12px] font-bold tracking-[0.06em] text-[#111] uppercase transition-opacity hover:opacity-90",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 border border-border bg-white px-5 text-[12px] font-bold tracking-[0.06em] text-foreground uppercase transition-colors hover:border-foreground/40",
  inline:
    "inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink hover:underline",
  banner:
    "inline-flex h-11 w-full items-center justify-center gap-2 bg-[#ff9900] px-5 text-[13px] font-bold tracking-[0.04em] text-[#111] transition-opacity hover:opacity-90 sm:w-auto",
};

export function ReviewAmazonCta({
  offer,
  productName,
  placement = "review",
  variant = "primary",
  label,
}: {
  offer: OfferRow;
  productName: string;
  placement?: OfferClickPlacement;
  variant?: Variant;
  label?: string;
}) {
  const href = amazonOfferHref(offer, placement);
  const text = label ?? "Check price on Amazon";

  return (
    <a
      href={href}
      rel="noopener noreferrer sponsored nofollow"
      className={VARIANT_CLASS[variant]}
      aria-label={`${text} for ${productName}`}
    >
      {text}
      {variant !== "inline" ? (
        <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
      ) : null}
    </a>
  );
}
