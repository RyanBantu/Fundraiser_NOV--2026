"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { STALL_NAME } from "@/lib/menu";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = useCallback(
    async (value: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: value }),
        });
        if (res.ok) {
          router.replace("/tracker");
          router.refresh();
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Wrong PIN");
      } catch {
        setError("No connection — check the Wi-Fi and try again");
      }
      setPin("");
      setShake((s) => s + 1);
      setBusy(false);
    },
    [router],
  );

  const press = useCallback(
    (k: string) => {
      if (busy) return;
      if (k === "⌫") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (!/^\d$/.test(k)) return;
      setError(null);
      setPin((p) => {
        if (p.length >= PIN_LENGTH) return p;
        const next = p + k;
        if (next.length === PIN_LENGTH) void submit(next);
        return next;
      });
    },
    [busy, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("⌫");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 py-10">
      <div className="w-full max-w-xs text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-board text-gold shadow-md">
          <svg viewBox="0 0 24 32" className="h-8" aria-hidden>
            <rect x="8.5" y="0" width="7" height="32" rx="1.5" fill="currentColor" />
            <rect x="1" y="8" width="22" height="7" rx="1.5" fill="currentColor" />
          </svg>
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">{STALL_NAME}</h1>
        <p className="mt-1 text-sm text-muted">Enter the PIN to open the tracker</p>

        <div key={shake} className={`mt-7 flex justify-center gap-4 ${shake ? "pin-shake" : ""}`} aria-live="polite">
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full transition ${i < pin.length ? "scale-110 bg-board" : "bg-line"}`}
            />
          ))}
        </div>
        <p className="mt-3 h-5 text-sm font-semibold text-ember" role="alert">
          {error}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {KEYS.map((k, i) =>
            k === "" ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                type="button"
                disabled={busy}
                onClick={() => press(k)}
                aria-label={k === "⌫" ? "Delete" : k}
                className={`h-16 rounded-2xl font-display text-2xl font-semibold transition active:scale-95 disabled:opacity-50 ${
                  k === "⌫" ? "text-muted" : "bg-white shadow-sm ring-1 ring-line"
                }`}
              >
                {k}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
