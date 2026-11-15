import { NextResponse } from "next/server";
import type { WithId } from "mongodb";
import type { SaleDoc } from "./mongodb";
import type { Sale } from "./sales";

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ ok: false, error, ...(details ? { details } : {}) }, { status });
}

export function serverError(err: unknown) {
  console.error("[api]", err);
  const msg = err instanceof Error ? err.message : "Unknown error";
  return jsonError(500, `Server error: ${msg}`);
}

export function toSale(doc: WithId<SaleDoc>): Sale {
  return {
    id: doc._id.toHexString(),
    itemId: doc.itemId,
    name: doc.name,
    price: doc.price,
    pay: doc.pay,
    createdAt: doc.createdAt.toISOString(),
    clientId: doc.clientId,
  };
}
