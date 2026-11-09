/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Shown instead of the site when the couple has set a guest password. */
export function PasswordGate({ slug, image, names, style }: { slug: string; image: string; names: string; style: React.CSSProperties }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch(`/api/unlock/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) router.refresh();
    else {
      setError((await res?.json().catch(() => null))?.error ?? "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="inv" style={style}>
      <div className="inv-intro" style={{ position: "relative", minHeight: "100svh" }}>
        <img className="inv-intro-bg" src={image} alt="" />
        <div className="inv-intro-veil" />
        <form className="inv-intro-card" onSubmit={submit}>
          <p className="inv-intro-kicker">The wedding of</p>
          <p className="inv-intro-names">{names}</p>
          <p className="inv-intro-date">This invitation is private. Please enter the password from your invitation.</p>
          <input
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="off"
            aria-label="Password"
            style={{
              marginTop: "1.6rem",
              width: "100%",
              padding: ".85rem 1rem",
              font: "inherit",
              color: "var(--text)",
              background: "transparent",
              border: "1px solid color-mix(in srgb, var(--text) 30%, transparent)",
              textAlign: "center",
            }}
          />
          {error && <p className="blk-error" style={{ marginTop: ".8rem" }}>{error}</p>}
          <button className="inv-intro-btn" disabled={busy}>
            {busy ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
