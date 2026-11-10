import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Back soon", robots: { index: false } };

/** Shown to everyone but admins while maintenance mode is on (see middleware). */
export default function Maintenance() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="eyebrow">Vow</p>
      <h1 className="mt-3 font-serif text-5xl">We&apos;ll be right back</h1>
      <p className="mt-4 max-w-md text-stone">We&apos;re making a few improvements. Wedding sites and RSVPs will be back shortly; nothing you saved is lost.</p>
      <Link href="/login" className="mt-8 text-xs text-stone underline">
        Admin sign in
      </Link>
    </main>
  );
}
