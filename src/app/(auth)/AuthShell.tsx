/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { img } from "@/lib/themes";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={img("https://images.unsplash.com/photo-1606216794074-735e91aa2c92", 1600)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <p className="absolute bottom-10 left-10 max-w-sm font-serif text-3xl italic text-white">
          “Whatever our souls are made of, his and mine are the same.”
          <span className="mt-2 block font-sans text-xs not-italic uppercase tracking-[0.3em] text-white/80">Emily Brontë</span>
        </p>
      </div>
      <div className="flex flex-col px-6 py-8">
        <Link href="/" className="font-serif text-2xl">
          Vow
        </Link>
        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <h1 className="font-serif text-4xl">{title}</h1>
          <p className="mt-2 text-stone">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
