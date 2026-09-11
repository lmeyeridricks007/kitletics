import { clsx, type ClassValue } from "clsx";

/** Merge class names with clsx. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a price in the given currency. */
export function formatPrice(
  amount: number,
  currency = "EUR",
  locale = "nl-NL",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** Slugify a display string. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
