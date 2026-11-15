import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, AUTH_MAX_AGE, authToken, safeEqual, trackerPin } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

const Body = z.object({ pin: z.string().regex(/^\d{1,12}$/, "PIN must be digits") });

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(400, "Body must be valid JSON");
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return jsonError(400, "Enter the PIN using digits only");

  if (!safeEqual(parsed.data.pin, trackerPin())) {
    // Small delay slows down guessing.
    await new Promise((r) => setTimeout(r, 600));
    return jsonError(401, "Wrong PIN");
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await authToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}

/** Lock: clear the cookie on this device. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
