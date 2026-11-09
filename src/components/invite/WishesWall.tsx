"use client";

import { useState } from "react";
import type { Wish } from "./ctx";

export function WishesWall({ slug, disabled, initial }: { slug?: string; disabled: boolean; initial: Wish[] }) {
  const [wishes, setWishes] = useState(initial);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled || !slug) {
      setError("This is a preview. The guestbook opens once the site is published.");
      return;
    }
    const form = e.currentTarget;
    const f = new FormData(form);
    setState("sending");
    setError("");
    const res = await fetch(`/api/wishes/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), message: f.get("message"), website: f.get("website") || "" }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setWishes((w) => [data.wish, ...w]);
      setState("idle");
      setSent(true);
      form.reset();
    } else {
      setState("error");
      setError(data?.error ?? "Couldn't post your note. Please try again.");
    }
  }

  return (
    <>
      {wishes.length > 0 && (
        <ul className="blk-wish-list">
          {wishes.map((w) => (
            <li key={w.id} className="blk-wish">
              <p>{w.message}</p>
              <cite>{w.name}</cite>
            </li>
          ))}
        </ul>
      )}
      {sent ? (
        <p className="blk-wish-thanks">Thank you! Your note is on the wall.</p>
      ) : (
        <form className="blk-wish-form" onSubmit={submit}>
          <label>
            <span>Your name</span>
            <input name="name" required maxLength={80} autoComplete="name" />
          </label>
          <label>
            <span>Your message</span>
            <textarea name="message" required maxLength={500} rows={3} />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px" }} />
          {error && <p className="blk-error">{error}</p>}
          <button className="blk-btn" disabled={state === "sending"}>
            {state === "sending" ? "Posting…" : "Sign the guestbook"}
          </button>
        </form>
      )}
    </>
  );
}
