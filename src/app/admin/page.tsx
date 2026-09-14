import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ul className="mt-6 space-y-3 text-sm">
        <li>
          <Link className="underline" href="/admin/growth/backlinks">
            Growth / backlinks
          </Link>
        </li>
        <li>
          <Link className="underline" href="/admin/catalog/padel-equipment">
            Catalog / Padel equipment coverage
          </Link>
          {" · "}
          <Link className="underline" href="/admin/catalog/padel-equipment/media">
            Media queue
          </Link>
          {" · "}
          <Link className="underline" href="/admin/catalog/padel-equipment/specs">
            Specs queue
          </Link>
          {" · "}
          <Link className="underline" href="/admin/catalog/padel-equipment/commerce">
            Commerce queue
          </Link>
        </li>
      </ul>
    </main>
  );
}
