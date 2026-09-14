"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isAdminGrowthPath } from "@/lib/admin/growth-gate";

/** Hide public chrome and GA4 loaders on /admin. */
export function PublicChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAdminGrowthPath(pathname)) return null;
  return <>{children}</>;
}

export function AdminPathGate({
  children,
  invert = false,
}: {
  children: ReactNode;
  invert?: boolean;
}) {
  const pathname = usePathname();
  const admin = isAdminGrowthPath(pathname);
  if (invert ? !admin : admin) return null;
  return <>{children}</>;
}
