/**
 * Tracker PIN gate. Works in both the Edge middleware and Node route handlers (Web Crypto only).
 * The cookie holds an HMAC of the PIN, so it can't be forged without knowing the PIN,
 * and changing TRACKER_PIN logs every device out.
 */
export const AUTH_COOKIE = "fr_tracker";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function trackerPin(): string {
  return process.env.TRACKER_PIN || "1001";
}

export async function authToken(pin: string = trackerPin()): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(`fund-raiser:${pin}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("tracker-unlocked"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-independent comparison so response timing doesn't leak how much matched. */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return safeEqual(token, await authToken());
}
