"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { ConsentState } from "@/lib/analytics";
import {
  consentStateFromStorage,
  defaultConsentState,
  readConsentCookieFromDocument,
  writeConsentCookie,
} from "@/lib/analytics";

type Props = {
  onConsentChange: (state: ConsentState) => void;
  /** When analytics is disabled entirely, render nothing. */
  active: boolean;
};

/**
 * Minimal first-party analytics consent banner (EU default deny).
 * Not a second CMP — Kitletics had no prior cookie banner.
 */
export function ConsentBanner({ onConsentChange, active }: Props) {
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    const stored = readConsentCookieFromDocument();
    if (stored) {
      onConsentChange(consentStateFromStorage(stored));
      setVisible(false);
      return;
    }
    onConsentChange(defaultConsentState("denied"));
    setVisible(true);
  }, [active, onConsentChange]);

  if (!active || !visible) return null;

  function accept() {
    writeConsentCookie("granted");
    onConsentChange(defaultConsentState("granted"));
    setVisible(false);
  }

  function reject() {
    writeConsentCookie("denied");
    onConsentChange(defaultConsentState("denied"));
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1 text-sm text-foreground">
          <p id={titleId} className="font-medium">
            Analytics cookies
          </p>
          <p className="text-muted">
            We use privacy-friendly analytics to understand which guides and
            products help athletes decide. No ads personalization.{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/40"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
