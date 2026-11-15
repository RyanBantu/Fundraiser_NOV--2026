import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { salesCollection } from "@/lib/mongodb";
import { jsonError, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

const IdParam = z.string().min(8).max(64).regex(/^[A-Za-z0-9-]+$/);

/** Delete one sale by its Mongo _id or by its clientId (the tracker uses clientId). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = IdParam.safeParse(id);
  if (!parsed.success) return jsonError(400, "Invalid sale id");

  try {
    const col = await salesCollection();
    const filter = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { clientId: id };
    const res = await col.deleteOne(filter);
    // Deleting something already gone is fine (another device may have removed it).
    return NextResponse.json({ ok: true, deleted: res.deletedCount });
  } catch (err) {
    return serverError(err);
  }
}
