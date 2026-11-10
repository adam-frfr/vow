"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** A button that calls an admin API, optionally after confirming, then refreshes the page. */
export function AdminButton({
  url,
  method = "PATCH",
  body,
  confirm,
  children,
  tone = "default",
}: {
  url: string;
  method?: "PATCH" | "DELETE" | "POST";
  body?: object;
  confirm?: string;
  children: React.ReactNode;
  tone?: "default" | "danger" | "primary";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setErr("");
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      setErr((await res?.json().catch(() => null))?.error ?? "Failed");
      return;
    }
    router.refresh();
  }
  const cls =
    tone === "danger"
      ? "border-red-200 text-red-700 hover:bg-red-50"
      : tone === "primary"
        ? "border-ink bg-ink text-white hover:opacity-90"
        : "border-line bg-white hover:border-stone";
  return (
    <span className="inline-flex flex-col">
      <button type="button" disabled={busy} onClick={run} className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${cls}`}>
        {busy ? "…" : children}
      </button>
      {err && <span className="mt-0.5 text-[0.65rem] text-red-700">{err}</span>}
    </span>
  );
}
