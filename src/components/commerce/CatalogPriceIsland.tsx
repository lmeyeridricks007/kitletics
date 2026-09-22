"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RegionCode } from "@/domain/shared/types";
import { useRegionPreference } from "@/components/region/RegionPreferenceProvider";
import {
  parseCatalogPriceMap,
  type CatalogPriceMapResponse,
  type CatalogPriceRow,
} from "@/lib/commerce/catalog-price-dto";
import { shouldFetchRegionalCommerce } from "@/lib/product/commerce-island";
import { formatPrice } from "@/lib/utils";

type CatalogPriceStatus = "ready" | "loading" | "error";

type CatalogPriceView = {
  region: RegionCode;
  status: CatalogPriceStatus;
  map: CatalogPriceMapResponse | null;
  retry: () => void;
};

const CatalogPriceContext = createContext<CatalogPriceView | null>(null);

export function useCatalogPriceView(): CatalogPriceView {
  const ctx = useContext(CatalogPriceContext);
  if (!ctx) {
    throw new Error("useCatalogPriceView must be used within CatalogPriceIsland");
  }
  return ctx;
}

export function useCatalogPriceViewOptional(): CatalogPriceView | null {
  return useContext(CatalogPriceContext);
}

export function useCatalogPrice(slug: string): CatalogPriceRow | undefined {
  const view = useCatalogPriceViewOptional();
  return view?.map?.products[slug];
}

export function CatalogPriceIsland({
  endpoint,
  initialMap,
  children,
}: {
  /** Path prefix ending before /{region}, e.g. /api/best/running-shoes/commerce */
  endpoint: string;
  initialMap: CatalogPriceMapResponse;
  children: ReactNode;
}) {
  const { region } = useRegionPreference();
  const [status, setStatus] = useState<CatalogPriceStatus>("ready");
  const [map, setMap] = useState<CatalogPriceMapResponse | null>(initialMap);
  const [retryToken, setRetryToken] = useState(0);
  const generationRef = useRef(0);

  const retry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!shouldFetchRegionalCommerce(region)) {
      generationRef.current += 1;
      setMap(initialMap);
      setStatus("ready");
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    const controller = new AbortController();
    setStatus("loading");
    setMap(null);

    const url = `${endpoint.replace(/\/$/, "")}/${region}`;
    void fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`catalog_commerce_${res.status}`);
        return parseCatalogPriceMap(await res.json());
      })
      .then((payload) => {
        if (generation !== generationRef.current) return;
        if (!payload || payload.region !== region) {
          setStatus("error");
          setMap(null);
          return;
        }
        setMap(payload);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (generation !== generationRef.current) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setMap(null);
      });

    return () => {
      controller.abort();
    };
  }, [region, endpoint, initialMap, retryToken]);

  const value = useMemo(
    () => ({ region, status, map, retry }),
    [region, status, map, retry],
  );

  return (
    <CatalogPriceContext.Provider value={value}>
      {children}
    </CatalogPriceContext.Provider>
  );
}

export function CatalogFromPrice({
  slug,
  fallback,
  from = true,
}: {
  slug: string;
  fallback?: { amount?: number; price?: number; currency: string } | null;
  from?: boolean;
}) {
  const view = useCatalogPriceViewOptional();
  if (view?.status === "loading") {
    return (
      <span className="inline-block h-3 w-14 animate-pulse rounded bg-surface-muted" />
    );
  }
  const overlay = view?.status === "ready" ? view.map?.products[slug] : undefined;
  const amount =
    overlay !== undefined
      ? overlay.lowestPrice?.amount
      : fallback?.amount ?? fallback?.price;
  const currency =
    overlay !== undefined
      ? overlay.lowestPrice?.currency
      : fallback?.currency;
  if (amount == null || !currency) return null;
  const formatted = formatPrice(amount, currency);
  return (
    <span>
      {from ? `From ${formatted}` : formatted}
    </span>
  );
}

export function CatalogPriceAmount({
  slug,
  fallback,
}: {
  slug: string;
  fallback?: { amount?: number; price?: number; currency: string } | null;
}) {
  return <CatalogFromPrice slug={slug} fallback={fallback} from={false} />;
}
