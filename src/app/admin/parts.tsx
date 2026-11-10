export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-stone">{label}</p>
      <p className="mt-2 font-serif text-4xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-stone">{hint}</p>}
    </div>
  );
}

export function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-stone">{children}</p>;
}

export const fmt = (d: Date | null | undefined) =>
  d ? d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const money = (cents: number, cur: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency: cur.toUpperCase() }).format(cents / 100);

export const KIND_LABEL: Record<string, string> = {
  rate_limit: "Too many requests",
  honeypot: "Bot caught (honeypot)",
  spam: "Spam message",
  blocked_login: "Suspended account tried to sign in",
  failed_login: "Wrong password",
  ai_abuse: "AI misuse",
};

export function Search({ placeholder, q }: { placeholder: string; q?: string }) {
  return (
    <form className="mb-4">
      <input name="q" defaultValue={q} placeholder={placeholder} className="field max-w-sm" />
    </form>
  );
}
