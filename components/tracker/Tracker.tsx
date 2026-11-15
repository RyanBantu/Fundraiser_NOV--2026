"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MENU, STALL_NAME, getItem, rupees, type ItemId, type PayMethod } from "@/lib/menu";
import type { PhotoMap } from "@/lib/images";
import type { Sale, Totals } from "@/lib/sales";
import { useSales, type SyncStatus } from "@/lib/useSales";
import { ItemVisual } from "../ItemVisual";
import { ConfirmModal } from "./ConfirmModal";

const PAY_KEY = "fund-raiser:pay:v1";

interface Toast {
  id: number;
  text: string;
  tone: "ok" | "warn";
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

function buildSummary(totals: Totals): string {
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const lines = totals.byItem
    .filter((r) => r.qty > 0)
    .map((r) => `${getItem(r.id)!.name} × ${r.qty} = ${rupees(r.amount)}`);
  return [
    `${STALL_NAME} — ${date}`,
    ...(lines.length ? lines : ["No sales yet"]),
    "",
    `Total: ${rupees(totals.total)}`,
    `Cash: ${rupees(totals.cash)} · UPI: ${rupees(totals.upi)}`,
    `Orders: ${totals.orders}`,
  ].join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is blocked on plain-http LAN addresses; fall back to execCommand.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function SyncDot({ status, queueSize }: { status: SyncStatus; queueSize: number }) {
  const cfg = {
    synced: { dot: "bg-leaf", label: "Synced" },
    syncing: { dot: "bg-gold animate-pulse", label: "Syncing" },
    offline: { dot: "bg-ember", label: "Offline" },
  }[status];
  return (
    <div className="flex items-center gap-2">
      {queueSize > 0 && (
        <span className="rounded-full bg-ember/10 px-2.5 py-1 text-xs font-semibold text-ember ring-1 ring-ember/25">
          {status === "offline" ? "Offline — " : ""}
          {queueSize} {queueSize === 1 ? "sale" : "sales"} waiting to sync
        </span>
      )}
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted">
        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    </div>
  );
}

export function Tracker({ photos }: { photos: PhotoMap }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const { sales, totals, queueSize, pendingIds, status, loaded, record, remove, resetDay } = useSales({
    onError: (msg) => showToast(msg, "warn"),
  });

  const [pay, setPayState] = useState<PayMethod>("cash");
  useEffect(() => {
    try {
      const p = localStorage.getItem(PAY_KEY);
      if (p === "cash" || p === "upi") setPayState(p);
    } catch {}
  }, []);
  const setPay = (p: PayMethod) => {
    setPayState(p);
    try {
      localStorage.setItem(PAY_KEY, p);
    } catch {}
  };

  const [flash, setFlash] = useState<Record<string, number>>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const tap = (id: ItemId) => {
    const sale = record(id, pay);
    setFlash((f) => ({ ...f, [id]: (f[id] ?? 0) + 1 }));
    if (navigator.vibrate) navigator.vibrate(25);
    showToast(`+ ${sale.name} · ${rupees(sale.price)} (${pay.toUpperCase()})`);
  };

  const del = async (s: Sale) => {
    if (await remove(s)) showToast(`Removed ${s.name} · ${rupees(s.price)}`, "warn");
  };

  const undoLast = () => {
    if (sales[0]) void del(sales[0]);
    else showToast("Nothing to undo", "warn");
  };

  const copySummary = async () => {
    showToast((await copyText(buildSummary(totals))) ? "Summary copied" : "Couldn't copy", "ok");
  };

  const qtyById = new Map(totals.byItem.map((r) => [r.id, r.qty]));

  return (
    <div className="min-h-dvh bg-cream pb-16">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-xl font-bold">{STALL_NAME}</h1>
            <span className="text-sm text-muted">Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <SyncDot status={status} queueSize={queueSize} />
            <Link href="/" className="hidden text-sm font-medium text-muted underline-offset-4 hover:underline sm:inline">
              Monitor ↗
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/unlock", { method: "DELETE" }).catch(() => {});
                window.location.assign("/unlock");
              }}
              className="rounded-lg px-2 py-1 text-sm font-medium text-muted ring-1 ring-line hover:text-ink"
              aria-label="Lock tracker"
            >
              🔒 Lock
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 pt-3">
        {/* Pay toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-paper p-1 ring-1 ring-line" role="radiogroup" aria-label="Payment method">
          {(["cash", "upi"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={pay === p}
              onClick={() => setPay(p)}
              className={`rounded-xl py-2.5 text-base font-bold transition ${
                pay === p ? (p === "cash" ? "bg-board text-cream shadow" : "bg-gold text-board shadow") : "text-muted"
              }`}
            >
              {p === "cash" ? "Cash" : "UPI"}
            </button>
          ))}
        </div>

        {/* Tap cards */}
        <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {MENU.map((item, i) => (
            <button
              key={`${item.id}-${flash[item.id] ?? 0}`}
              type="button"
              onClick={() => tap(item.id)}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-2.5 text-left shadow-sm ring-1 ring-line transition active:scale-[0.97] sm:flex-col sm:items-stretch sm:p-3 ${
                flash[item.id] ? "tap-flash" : ""
              } ${i === MENU.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <ItemVisual
                item={item}
                hasPhoto={photos[item.id]}
                sizes="(min-width: 640px) 20vw, 80px"
                className="h-16 w-16 shrink-0 rounded-xl sm:h-28 sm:w-full"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight font-semibold sm:text-base">{item.short}</p>
                <p className="font-display text-xl font-bold text-ember">{rupees(item.price)}</p>
              </div>
              {(qtyById.get(item.id) ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-6 rounded-full bg-board px-1.5 py-0.5 text-center text-xs font-bold text-cream">
                  {qtyById.get(item.id)}
                </span>
              )}
            </button>
          ))}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            { label: "Total earned", value: rupees(totals.total), dark: true },
            { label: "Orders", value: String(totals.orders) },
            { label: "Cash", value: rupees(totals.cash) },
            { label: "UPI", value: rupees(totals.upi) },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-3.5 ring-1 ${s.dark ? "bg-board text-cream ring-board" : "bg-white ring-line"}`}>
              <p className={`text-xs font-semibold tracking-wider uppercase ${s.dark ? "text-gold" : "text-muted"}`}>{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{loaded ? s.value : "…"}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-2">
          <button type="button" onClick={undoLast} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line active:scale-95">
            ↶ Undo last
          </button>
          <button type="button" onClick={copySummary} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line active:scale-95">
            Copy summary
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/api/sales/csv")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line active:scale-95"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-ember ring-1 ring-ember/40 active:scale-95"
          >
            Reset day
          </button>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          {/* Recent sales */}
          <section className="rounded-2xl bg-white ring-1 ring-line">
            <h2 className="border-b border-line px-4 py-3 font-display text-lg font-semibold">Recent sales</h2>
            {sales.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">{loaded ? "No sales yet today. Tap an item to record one." : "Loading…"}</p>
            ) : (
              <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
                {sales.map((s) => (
                  <li key={s.clientId} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-16 shrink-0 text-muted tabular-nums">{time(s.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {s.name}
                      {pendingIds.has(s.clientId) && <span className="ml-1.5 text-xs text-gold-deep">• unsynced</span>}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        s.pay === "cash" ? "bg-board text-cream" : "bg-gold text-board"
                      }`}
                    >
                      {s.pay.toUpperCase()}
                    </span>
                    <span className="w-14 text-right font-semibold tabular-nums">{rupees(s.price)}</span>
                    <button
                      type="button"
                      onClick={() => void del(s)}
                      aria-label={`Delete ${s.name} at ${time(s.createdAt)}`}
                      className="-mr-1 rounded-lg px-2 py-1 text-muted hover:bg-ember/10 hover:text-ember"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Breakdown */}
          <section className="rounded-2xl bg-white ring-1 ring-line">
            <h2 className="border-b border-line px-4 py-3 font-display text-lg font-semibold">Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider text-muted uppercase">
                  <th className="px-4 py-2 font-semibold">Item</th>
                  <th className="px-2 py-2 text-right font-semibold">Qty</th>
                  <th className="px-4 py-2 text-right font-semibold">₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {totals.byItem.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{getItem(r.id)!.name}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{r.qty}</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">{rupees(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink/80 font-bold">
                  <td className="px-4 py-2.5">Total</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{totals.orders}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{rupees(totals.total)}</td>
                </tr>
                <tr className="text-muted">
                  <td className="px-4 pb-3" colSpan={3}>
                    Cash {rupees(totals.cash)} · UPI {rupees(totals.upi)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        </div>
      </main>

      {toast && (
        <div
          key={toast.id}
          role="status"
          className={`toast-in fixed bottom-5 left-1/2 z-40 max-w-[92vw] rounded-full px-5 py-3 text-sm font-semibold shadow-xl ${
            toast.tone === "ok" ? "bg-board text-cream" : "bg-ember text-cream"
          }`}
        >
          {toast.text}
        </div>
      )}

      <ConfirmModal
        open={confirmReset}
        title="Reset today’s sales?"
        body={`This permanently deletes all ${totals.orders} sales (${rupees(totals.total)}) recorded today, on every device. Download the CSV first if you need a copy.`}
        confirmLabel="Yes, reset day"
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          setConfirmReset(false);
          if (await resetDay()) showToast("Day reset — fresh start", "ok");
        }}
      />
    </div>
  );
}
