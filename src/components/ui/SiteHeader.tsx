import Link from "next/link";
import { getUser } from "@/lib/auth";

export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const user = await getUser();
  const tone = overlay ? "text-white" : "text-ink";
  return (
    <header className={`${overlay ? "absolute inset-x-0 top-0 z-20" : "border-b border-line bg-ivory/90 backdrop-blur sticky top-0 z-20"}`}>
      <div className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-5 ${tone}`}>
        <Link href="/" className="font-serif text-2xl tracking-wide">
          Vow
        </Link>
        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          <Link href="/themes" className="hover:opacity-70">
            Themes
          </Link>
          {user ? (
            <Link href="/dashboard" className="hover:opacity-70">
              My sites
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden hover:opacity-70 sm:inline">
                Log in
              </Link>
              <Link
                href="/signup"
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${overlay ? "bg-white text-ink" : "bg-ink text-white"}`}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
