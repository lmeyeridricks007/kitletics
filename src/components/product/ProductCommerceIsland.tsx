"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RegionCode } from "@/domain/shared/types";
import { useRegionPreference } from "@/components/region/RegionPreferenceProvider";
import type {
  CommercePrice,
  ProductCommerceResponse,
} from "@/lib/product/product-commerce";
import {
  parseCommerceResponse,
  regionalCommercePath,
  shouldFetchRegionalCommerce,
} from "@/lib/product/commerce-island";

export type CommerceViewStatus = "ready" | "loading" | "error";

type CommerceView = {
  region: RegionCode;
  status: CommerceViewStatus;
  commerce: ProductCommerceResponse | null;
  retry: () => void;
};

const CommerceViewContext = createContext<CommerceView | null>(null);

export function useCommerceView(): CommerceView {
  const ctx = useContext(CommerceViewContext);
  if (!ctx) {
    throw new Error("useCommerceView must be used within ProductCommerceIsland");
  }
  return ctx;
}

function useCommerceViewOptional(): CommerceView | null {
  return useContext(CommerceViewContext);
}

export function ProductCommerceIsland({
  slug,
  initialCommerce,
  children,
}: {
  slug: string;
  initialCommerce: ProductCommerceResponse;
  children: ReactNode;
}) {
  const { region } = useRegionPreference();
  const [status, setStatus] = useState<CommerceViewStatus>("ready");
  const [commerce, setCommerce] = useState<ProductCommerceResponse | null>(
    initialCommerce,
  );
  const [retryToken, setRetryToken] = useState(0);
  const generationRef = useRef(0);

  const retry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!shouldFetchRegionalCommerce(region)) {
      generationRef.current += 1;
      setCommerce(initialCommerce);
      setStatus("ready");
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    const controller = new AbortController();
    setStatus("loading");
    setCommerce(null);

    void fetch(regionalCommercePath(slug, region), { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`commerce_${res.status}`);
        return parseCommerceResponse(await res.json());
      })
      .then((payload) => {
        if (generation !== generationRef.current) return;
        if (!payload || payload.region !== region) {
          setStatus("error");
          setCommerce(null);
          return;
        }
        setCommerce(payload);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (generation !== generationRef.current) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setCommerce(null);
      });

    return () => {
      controller.abort();
    };
  }, [region, slug, initialCommerce, retryToken]);

  return (
    <CommerceViewContext.Provider value={{ region, status, commerce, retry }}>
      {children}
    </CommerceViewContext.Provider>
  );
}

export function CommerceLoadingLabel() {
  return (
    <p className="text-[12px] text-muted" role="status">
      Updating regional prices…
    </p>
  );
}

export function CommerceErrorState() {
  const { retry } = useCommerceView();
  return (
    <div className="space-y-2" role="alert">
      <p className="text-sm font-medium text-foreground">
        Regional prices temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={retry}
        className="text-[12px] font-medium text-link hover:underline"
      >
        Retry
      </button>
    </div>
  );
}

export function CommercePeerPrice({
  productId,
  fallback,
  self,
}: {
  productId: string;
  fallback?: CommercePrice | null;
  self?: boolean;
}) {
  const view = useCommerceViewOptional();
  if (view?.status === "loading") {
    return (
      <span className="inline-block h-3 w-12 animate-pulse rounded bg-surface-muted" />
    );
  }
  if (view?.status === "error") return null;

  const price = self
    ? view?.commerce?.lowestPrice ?? fallback ?? null
    : view?.commerce?.peerPrices[productId] ?? fallback ?? null;
  if (!price) return null;

  return (
    <span>
      From {formatCommerceAmount(price)}
    </span>
  );
}

function formatCommerceAmount(price: CommercePrice): string {
  if (price.currency === "EUR") return `€${price.amount}`;
  if (price.currency === "GBP") return `£${price.amount}`;
  if (price.currency === "USD") return `$${price.amount}`;
  return `${price.currency} ${price.amount}`;
}
