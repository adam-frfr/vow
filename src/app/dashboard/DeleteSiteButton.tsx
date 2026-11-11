"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteSiteButton({ id, names }: { id: string; names: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Permanently delete the wedding site for ${names}? This will remove all photos, guest RSVPs, and guestbook notes, and cannot be undone.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/sites/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      router.refresh();
    } else {
      alert("Could not delete site. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleDelete}
      className="btn btn-light !text-red-700 hover:!border-red-300 hover:!bg-red-50 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

