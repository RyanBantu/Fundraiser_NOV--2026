import { MENU, type ItemId, type PayMethod } from "./menu";

/** A sale as sent over the wire / held in the browser. */
export interface Sale {
  /** Mongo _id as a string, or null while it only exists in the offline queue. */
  id: string | null;
  itemId: ItemId;
  name: string;
  price: number;
  pay: PayMethod;
  createdAt: string; // ISO
  clientId: string;
}

export interface ItemTotal {
  id: ItemId;
  qty: number;
  amount: number;
}

export interface Totals {
  total: number;
  orders: number;
  cash: number;
  upi: number;
  byItem: ItemTotal[];
}

export interface SalesResponse {
  sales: Sale[];
  totals: Totals;
  dayStart: string;
}

export function computeTotals(sales: Pick<Sale, "itemId" | "price" | "pay">[]): Totals {
  const byItem = new Map<ItemId, ItemTotal>(
    MENU.map((m) => [m.id, { id: m.id, qty: 0, amount: 0 }]),
  );
  let total = 0;
  let cash = 0;
  let upi = 0;
  for (const s of sales) {
    total += s.price;
    if (s.pay === "cash") cash += s.price;
    else upi += s.price;
    const row = byItem.get(s.itemId);
    if (row) {
      row.qty += 1;
      row.amount += s.price;
    }
  }
  return { total, orders: sales.length, cash, upi, byItem: [...byItem.values()] };
}

/**
 * The stall runs in India, so "today" is the IST calendar day (UTC+5:30, no DST).
 * Override with STALL_UTC_OFFSET_MINUTES if the event is elsewhere.
 */
export function startOfToday(now: Date = new Date()): Date {
  const offsetMin = Number(process.env.STALL_UTC_OFFSET_MINUTES ?? 330);
  const local = new Date(now.getTime() + offsetMin * 60_000);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offsetMin * 60_000);
}
