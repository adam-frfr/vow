"use client";

import { useState } from "react";

export function RsvpForm({
  slug,
  disabled,
  askMeal,
  mealOptions,
  maxGuests,
}: {
  slug?: string;
  disabled: boolean;
  askMeal: boolean;
  mealOptions: string[];
  maxGuests: number;
}) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    if (disabled || !slug) {
      setError("This is a preview. RSVPs open once the site is published.");
      return;
    }
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const res = await fetch(`/api/rsvp/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        email: f.get("email") || undefined,
        attending,
        guests: Number(f.get("guests") || 1),
        meal: f.get("meal") || undefined,
        message: f.get("message") || undefined,
        website: f.get("website") || "", // honeypot
      }),
    }).catch(() => null);
    if (res?.ok) setState("done");
    else {
      setState("error");
      setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="inv-thanks">
        <div className="inv-script" style={{ fontSize: "2.6rem", color: "var(--accent)" }}>
          Thank you
        </div>
        <p style={{ marginTop: "1rem" }}>{attending ? "We can't wait to celebrate with you." : "You'll be missed. Thank you for letting us know."}</p>
      </div>
    );
  }

  return (
    <form className="inv-form" onSubmit={submit} noValidate={disabled}>
      <label>
        Full name
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" maxLength={200} autoComplete="email" />
      </label>
      <div className="inv-choice" role="group" aria-label="Attendance">
        <button type="button" aria-pressed={attending === true} onClick={() => setAttending(true)}>
          Joyfully accepts
        </button>
        <button type="button" aria-pressed={attending === false} onClick={() => setAttending(false)}>
          Regretfully declines
        </button>
      </div>
      {attending && (
        <>
          <label>
            Number of guests
            <select name="guests" defaultValue="1">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {askMeal && mealOptions.length > 0 && (
            <label>
              Meal preference
              <select name="meal" defaultValue="">
                <option value="">Choose…</option>
                {mealOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
      <label>
        A note for the couple
        <textarea name="message" rows={3} maxLength={1000} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px" }} />
      {error && <p className="inv-error">{error}</p>}
      <button className="inv-btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
