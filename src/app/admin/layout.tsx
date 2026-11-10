import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  ["/admin", "Overview"],
  ["/admin/users", "Users"],
  ["/admin/sites", "Sites"],
  ["/admin/spam", "Spam & abuse"],
  ["/admin/payments", "Payments"],
  ["/admin/settings", "Settings & AI"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f4f1ec] lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/" className="font-serif text-2xl">
            Vow <span className="text-sm text-stone">admin</span>
          </Link>
          <p className="hidden truncate text-xs text-stone lg:mt-1 lg:block">{admin.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm lg:flex-col lg:px-3">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-stone hover:bg-[#f4f1ec] hover:text-ink">
              {label}
            </Link>
          ))}
          <Link href="/dashboard" className="whitespace-nowrap rounded-lg px-3 py-2 text-stone hover:bg-[#f4f1ec] hover:text-ink lg:mt-6">
            ← My sites
          </Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
    </div>
  );
}
