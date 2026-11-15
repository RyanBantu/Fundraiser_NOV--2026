import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, isValidToken } from "@/lib/auth";

/** The tracker page and every sales API need the PIN cookie. The monitor display (/) stays open. */
export async function middleware(req: NextRequest) {
  if (await isValidToken(req.cookies.get(AUTH_COOKIE)?.value)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Locked — enter the tracker PIN" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/tracker/:path*", "/api/sales/:path*"],
};
