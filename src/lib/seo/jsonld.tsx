import { siteConfig } from "@/content/config";
import type { Product } from "@/domain/products/types";
import type { Review, FAQ } from "@/domain/editorial/types";
import type { Offer } from "@/domain/commerce/types";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";

type JsonLd = Record<string, unknown>;

function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Only emit values present in data — never fabricate ratings/counts. */
export function productJsonLd(
  product: Product,
  offers: Offer[] = [],
  brandName?: string,
): JsonLd {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.fullName,
    description: product.shortDescription,
    url: abs(`/products/${product.slug}`),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: brandName ?? product.brandId,
    },
  };

  if (product.images[0] && !product.images[0].src.includes("/fallbacks/")) {
    data.image = product.images
      .filter((i) => !i.src.includes("/fallbacks/"))
      .map((i) => abs(i.src));
  }

  // Only schema Offers when price is fresh enough to be trustworthy
  const schemaOffers = offers.filter((o) => {
    if (o.availability === "unknown" || o.availability === "out-of-stock") {
      return false;
    }
    try {
      const ageMs = Date.now() - Date.parse(o.lastChecked);
      if (Number.isNaN(ageMs)) return false;
      // recent band: ≤ 72h — align with shouldDisplayNumericPrice
      return ageMs <= 72 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  if (schemaOffers.length > 0) {
    data.offers = schemaOffers.map((o) => ({
      "@type": "Offer",
      url: o.url,
      priceCurrency: o.currency,
      price: o.price,
      availability:
        o.availability === "in-stock" || o.availability === "low-stock"
          ? "https://schema.org/InStock"
          : o.availability === "preorder"
            ? "https://schema.org/PreOrder"
            : o.availability === "out-of-stock"
              ? "https://schema.org/OutOfStock"
              : undefined,
    })).filter((o) => o.availability);
  }

  return data;
}

/** Editorial desk bylines are Organizations — never fake Person experts. */
function isEditorialDeskAuthor(input?: {
  name?: string;
  slug?: string;
  id?: string;
}): boolean {
  if (!input) return false;
  return (
    input.id === "author-kitletics-editorial" ||
    input.slug === "kitletics-editorial" ||
    /kitletics editorial/i.test(input.name ?? "")
  );
}

export function reviewJsonLd(
  review: Review,
  product: Product,
  authorNameOrAuthor?: string | { name: string; slug?: string; id?: string },
): JsonLd | null {
  const authorName =
    typeof authorNameOrAuthor === "string"
      ? authorNameOrAuthor
      : authorNameOrAuthor?.name;
  const authorSlug =
    typeof authorNameOrAuthor === "object"
      ? authorNameOrAuthor?.slug
      : undefined;
  const authorId =
    typeof authorNameOrAuthor === "object"
      ? authorNameOrAuthor?.id
      : undefined;
  const desk = isEditorialDeskAuthor({
    name: authorName,
    slug: authorSlug,
    id: authorId,
  });

  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    reviewBody: review.summary,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.score,
      bestRating: 100,
      worstRating: 0,
    },
    itemReviewed: {
      "@type": "Product",
      name: product.fullName,
      url: abs(`/products/${product.slug}`),
    },
    author: authorName
      ? desk
        ? {
            "@type": "Organization",
            name: authorName,
            ...(authorSlug ? { url: abs(`/authors/${authorSlug}`) } : {}),
          }
        : {
            "@type": "Person",
            name: authorName,
            ...(authorSlug ? { url: abs(`/authors/${authorSlug}`) } : {}),
          }
      : {
          "@type": "Organization",
          name: siteConfig.name,
        },
  };

  if (review.publishedAt) data.datePublished = review.publishedAt;
  if (review.updatedAt) data.dateModified = review.updatedAt;

  return data;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: abs(item.href) } : {}),
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: abs(item.url),
    })),
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: abs(input.url),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function faqPageJsonLd(faqs: FAQ[]): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  /** When the byline is an editorial desk, emit Organization not Person */
  authorIsOrganization?: boolean;
}): JsonLd {
  const desk =
    input.authorIsOrganization ||
    isEditorialDeskAuthor({ name: input.authorName });
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: abs(input.url),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": input.authorName && !desk ? "Person" : "Organization",
      name: input.authorName ?? siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function webApplicationJsonLd(input: {
  name: string;
  description: string;
  url: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: abs(input.url),
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
  };
}

/** Homepage entity signal — no SearchAction while /search is noindex. */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: abs("/og/default.png"),
  };
}

export function webSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function JsonLdScript({
  data,
}: {
  data: JsonLd | Array<JsonLd | null> | null;
}) {
  if (!data) return null;
  const payload = (Array.isArray(data) ? data : [data]).filter(
    (item): item is JsonLd => item !== null,
  );
  if (payload.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
