"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(node: HTMLElement): HTMLElement[] {
  return [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.closest("[inert]")) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  });
}

/**
 * Dialog/drawer keyboard contract: move focus in, trap Tab, Escape closes,
 * restore focus to the trigger.
 */
export function useModalFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void,
): void {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!open) return;
    const node = containerRef.current;
    if (!node) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const list = focusableIn(node);
    (list[0] ?? node).focus();

    function onKey(event: KeyboardEvent) {
      const panel = containerRef.current;
      if (!panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(panel);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, containerRef]);
}

export function handleRovingRadioKeyDown<T extends string>(
  event: ReactKeyboardEvent<HTMLElement>,
  values: T[],
  current: T | undefined,
  onChange: (next: T) => void,
): void {
  if (
    event.key !== "ArrowRight" &&
    event.key !== "ArrowDown" &&
    event.key !== "ArrowLeft" &&
    event.key !== "ArrowUp"
  ) {
    return;
  }
  if (values.length === 0) return;
  event.preventDefault();
  const i =
    current != null && values.includes(current)
      ? values.indexOf(current)
      : 0;
  const dir =
    event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const nextIndex = (i + dir + values.length) % values.length;
  const next = values[nextIndex];
  if (!next) return;
  onChange(next);
  const radios = event.currentTarget.querySelectorAll<HTMLElement>(
    '[role="radio"]',
  );
  radios[nextIndex]?.focus();
}
