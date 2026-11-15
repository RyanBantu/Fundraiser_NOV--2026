"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { getItem, type ItemId, type PayMethod } from "./menu";
import { computeTotals, type Sale, type SalesResponse } from "./sales";

const QUEUE_KEY = "fund-raiser:queue:v1";
const SNAPSHOT_KEY = "fund-raiser:snapshot:v1";
const POLL_MS = 4000;
const RETRY_MS = 5000;

export type SyncStatus = "synced" | "syncing" | "offline";

/** UUID v4 that also works on plain-http LAN addresses (where crypto.randomUUID is missing). */
export function makeClientId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function readJSON<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode: queue still works in memory */
  }
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401) {
    // PIN cookie missing/expired: go re-enter it. Queued sales stay in localStorage and sync after.
    window.location.assign("/unlock");
    throw new HttpError(401, "Locked");
  }
  if (!res.ok) throw new HttpError(res.status, body.error ?? `HTTP ${res.status}`);
  return body;
}

export function useSales(opts: { onError?: (msg: string) => void } = {}) {
  const onErrorRef = useRef(opts.onError);
  onErrorRef.current = opts.onError;

  const [queue, setQueueState] = useState<Sale[]>([]);
  const queueRef = useRef<Sale[]>([]);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [netOk, setNetOk] = useState(true);
  const [flushing, setFlushing] = useState(false);
  const flushingRef = useRef(false);
  const inFlightRef = useRef<string | null>(null);
  const tombstones = useRef(new Set<string>());
  const [snapshot, setSnapshot] = useState<SalesResponse | undefined>();

  const setQueue = useCallback((updater: (q: Sale[]) => Sale[]) => {
    const next = updater(queueRef.current);
    queueRef.current = next;
    setQueueState(next);
    writeJSON(QUEUE_KEY, next);
  }, []);

  // Load the offline queue + last snapshot after mount (localStorage isn't available on the server).
  useEffect(() => {
    const q = readJSON<Sale[]>(QUEUE_KEY) ?? [];
    queueRef.current = q;
    setQueueState(q);
    setSnapshot(readJSON<SalesResponse>(SNAPSHOT_KEY));
  }, []);

  const { data, mutate } = useSWR<SalesResponse>("/api/sales", (url: string) => request<SalesResponse>(url), {
    refreshInterval: POLL_MS,
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    onSuccess: (d) => {
      setNetOk(true);
      writeJSON(SNAPSHOT_KEY, d);
    },
    onError: () => setNetOk(false),
  });

  const server = data ?? snapshot;

  const flush = useCallback(async () => {
    if (flushingRef.current || queueRef.current.length === 0) return;
    flushingRef.current = true;
    setFlushing(true);
    try {
      while (queueRef.current.length > 0) {
        const sale = queueRef.current[queueRef.current.length - 1]; // oldest first
        inFlightRef.current = sale.clientId;
        try {
          const res = await request<{ sale: Sale }>("/api/sales", {
            method: "POST",
            body: JSON.stringify({ itemId: sale.itemId, pay: sale.pay, clientId: sale.clientId, createdAt: sale.createdAt }),
          });
          setNetOk(true);
          setQueue((q) => q.filter((s) => s.clientId !== sale.clientId));
          if (tombstones.current.has(sale.clientId)) {
            // Deleted while it was being sent: remove it on the server too.
            tombstones.current.delete(sale.clientId);
            await request(`/api/sales/${sale.clientId}`, { method: "DELETE" }).catch(() => {});
          } else {
            await mutate(
              (cur) =>
                cur && !cur.sales.some((s) => s.clientId === res.sale.clientId)
                  ? { ...cur, sales: [res.sale, ...cur.sales] }
                  : cur,
              { revalidate: false },
            );
          }
        } catch (err) {
          if (err instanceof HttpError && err.status >= 400 && err.status < 500 && err.status !== 401) {
            // The server will never accept this one; drop it rather than block the queue.
            setQueue((q) => q.filter((s) => s.clientId !== sale.clientId));
            onErrorRef.current?.(`Couldn't save ${sale.name}: ${err.message}`);
            continue;
          }
          setNetOk(false);
          break;
        }
      }
    } finally {
      inFlightRef.current = null;
      flushingRef.current = false;
      setFlushing(false);
      void mutate();
    }
  }, [mutate, setQueue]);

  // Retry every 5s and whenever the browser says we're back online.
  useEffect(() => {
    const id = setInterval(() => void flush(), RETRY_MS);
    const online = () => void flush();
    const offline = () => setNetOk(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    void flush();
    return () => {
      clearInterval(id);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [flush]);

  const record = useCallback(
    (itemId: ItemId, pay: PayMethod): Sale => {
      const item = getItem(itemId)!;
      const sale: Sale = {
        id: null,
        itemId,
        name: item.name,
        price: item.price,
        pay,
        createdAt: new Date().toISOString(),
        clientId: makeClientId(),
      };
      setQueue((q) => [sale, ...q]);
      void flush();
      return sale;
    },
    [flush, setQueue],
  );

  const hide = (ids: string[], on: boolean) =>
    setHidden((h) => {
      const next = new Set(h);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const remove = useCallback(
    async (sale: Sale) => {
      const queued = queueRef.current.some((s) => s.clientId === sale.clientId);
      if (queued) {
        if (inFlightRef.current === sale.clientId) tombstones.current.add(sale.clientId);
        setQueue((q) => q.filter((s) => s.clientId !== sale.clientId));
        return true;
      }
      hide([sale.clientId], true);
      try {
        await request(`/api/sales/${sale.clientId}`, { method: "DELETE" });
        await mutate();
        return true;
      } catch {
        setNetOk(false);
        onErrorRef.current?.("Couldn't delete — you're offline. Try again in a moment.");
        return false;
      } finally {
        hide([sale.clientId], false);
      }
    },
    [mutate, setQueue],
  );

  const resetDay = useCallback(async () => {
    const ids = (server?.sales ?? []).map((s) => s.clientId);
    for (const s of queueRef.current) tombstones.current.add(s.clientId);
    setQueue(() => []);
    hide(ids, true);
    try {
      await request("/api/sales", { method: "DELETE" });
      await mutate();
      return true;
    } catch {
      setNetOk(false);
      onErrorRef.current?.("Reset failed — you're offline. Nothing on the server was deleted.");
      return false;
    } finally {
      hide(ids, false);
    }
  }, [mutate, server, setQueue]);

  const sales = useMemo(() => {
    const serverSales = (server?.sales ?? []).filter((s) => !hidden.has(s.clientId));
    const known = new Set(serverSales.map((s) => s.clientId));
    const pending = queue.filter((s) => !known.has(s.clientId));
    return [...pending, ...serverSales].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [server, queue, hidden]);

  const totals = useMemo(() => computeTotals(sales), [sales]);
  const pendingIds = useMemo(() => new Set(queue.map((s) => s.clientId)), [queue]);

  const status: SyncStatus = !netOk ? "offline" : queue.length > 0 || flushing ? "syncing" : "synced";

  return { sales, totals, queueSize: queue.length, pendingIds, status, loaded: server !== undefined, record, remove, resetDay };
}
