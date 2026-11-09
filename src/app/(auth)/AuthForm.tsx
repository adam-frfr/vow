"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res?.ok) {
      const next = params.get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } else {
      setError((await res?.json().catch(() => null))?.error ?? "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input id="name" name="name" required className="field" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : undefined}
          className="field"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
        {mode === "signup" && <p className="mt-1 text-xs text-stone">At least 8 characters.</p>}
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-stone">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link className="text-ink underline" href={`/login${params.size ? `?${params}` : ""}`}>
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link className="text-ink underline" href={`/signup${params.size ? `?${params}` : ""}`}>
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
