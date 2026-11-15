import { NextResponse, type NextRequest } from "next/server";
import { MongoServerError } from "mongodb";
import { z } from "zod";
import { ITEM_IDS, getItem } from "@/lib/menu";
import { salesCollection } from "@/lib/mongodb";
import { computeTotals, startOfToday, type SalesResponse } from "@/lib/sales";
import { jsonError, serverError, toSale } from "@/lib/api";

export const dynamic = "force-dynamic";

const PostBody = z.object({
  itemId: z.enum(ITEM_IDS),
  pay: z.enum(["cash", "upi"]),
  clientId: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9-]+$/, "clientId must be alphanumeric/dashes"),
  /** Optional time the sale was tapped (for sales that sat in the offline queue). */
  createdAt: z.iso.datetime().optional(),
});

export async function GET() {
  try {
    const col = await salesCollection();
    const dayStart = startOfToday();
    const docs = await col
      .find({ createdAt: { $gte: dayStart } })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();
    const sales = docs.map(toSale);
    const body: SalesResponse = { sales, totals: computeTotals(sales), dayStart: dayStart.toISOString() };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(400, "Body must be valid JSON");
  }
  const parsed = PostBody.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "Invalid sale", z.flattenError(parsed.error).fieldErrors);
  }
  const { itemId, pay, clientId } = parsed.data;
  // Price and name always come from the server-side menu, never the client.
  const item = getItem(itemId)!;

  // Accept a queued tap time only if it's plausible (not in the future, within 24h).
  const now = Date.now();
  let createdAt = new Date(now);
  if (parsed.data.createdAt) {
    const t = Date.parse(parsed.data.createdAt);
    if (t <= now + 60_000 && t >= now - 24 * 3600_000) createdAt = new Date(t);
  }

  try {
    const col = await salesCollection();
    const doc = { itemId, name: item.name, price: item.price, pay, createdAt, clientId };
    try {
      const res = await col.insertOne(doc);
      return NextResponse.json({ ok: true, sale: toSale({ ...doc, _id: res.insertedId }) }, { status: 201 });
    } catch (err) {
      // Duplicate clientId = a retry of a sale we already saved. Return the original.
      if (err instanceof MongoServerError && err.code === 11000) {
        const existing = await col.findOne({ clientId });
        if (existing) return NextResponse.json({ ok: true, duplicate: true, sale: toSale(existing) });
      }
      throw err;
    }
  } catch (err) {
    return serverError(err);
  }
}

/** Reset day: delete all of today's sales. */
export async function DELETE() {
  try {
    const col = await salesCollection();
    const res = await col.deleteMany({ createdAt: { $gte: startOfToday() } });
    return NextResponse.json({ ok: true, deleted: res.deletedCount });
  } catch (err) {
    return serverError(err);
  }
}
