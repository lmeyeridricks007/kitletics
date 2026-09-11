/**
 * /finders redirects to /tools?type=finder (see next.config.ts).
 * Kept as a thin fallback if redirects are bypassed in local tooling.
 */
import { redirect } from "next/navigation";

export default function FindersPage() {
  redirect("/tools?type=finder");
}
