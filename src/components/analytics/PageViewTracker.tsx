"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  buildPageContext,
  track,
  trackPageView,
  viewEventForPageType,
} from "@/lib/analytics";

/**
 * Sends a single page_view per client route (App Router).
 * Relies on gtag config send_page_view: false to avoid duplicates.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    const key = `${pathname}${search}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    const ctx = buildPageContext(pathname, search);
    if (typeof document !== "undefined") {
      ctx.page_title = document.title || undefined;
      ctx.page_location = window.location.href;
    }

    trackPageView(ctx);

    const viewEvent = viewEventForPageType(ctx.page_type ?? "other");
    if (viewEvent) {
      track(viewEvent, ctx);
      if (viewEvent === "view_product" && ctx.product_slug) {
        track("view_item", {
          ...ctx,
          item_id: ctx.product_slug,
          item_name: ctx.product_slug,
        });
      }
    }
  }, [pathname, searchParams]);

  return null;
}
