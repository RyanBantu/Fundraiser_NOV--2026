import { NextResponse } from "next/server";
import { salesCollection } from "@/lib/mongodb";
import { startOfToday } from "@/lib/sales";
import { jsonError, serverError, toSale } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Delete the most recent sale of today. */
export async function POST() {
  try {
    const col = await salesCollection();
    const last = await col.findOneAndDelete(
      { createdAt: { $gte: startOfToday() } },
      { sort: { createdAt: -1, _id: -1 } },
    );
    if (!last) return jsonError(404, "No sales today to undo");
    return NextResponse.json({ ok: true, sale: toSale(last) });
  } catch (err) {
    return serverError(err);
  }
}
