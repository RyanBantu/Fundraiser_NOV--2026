import { salesCollection } from "@/lib/mongodb";
import { serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** All sales ever recorded (not just today), oldest first, as CSV. */
export async function GET() {
  try {
    const col = await salesCollection();
    const docs = await col.find({}).sort({ createdAt: 1, _id: 1 }).toArray();
    const lines = [
      ["time_utc", "time_ist", "item_id", "item", "pay", "amount", "client_id", "id"].join(","),
      ...docs.map((d) =>
        [
          d.createdAt.toISOString(),
          d.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          d.itemId,
          d.name,
          d.pay.toUpperCase(),
          d.price,
          d.clientId,
          d._id.toHexString(),
        ]
          .map(cell)
          .join(","),
      ),
    ];
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response("﻿" + lines.join("\n") + "\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fund-raiser-sales-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
