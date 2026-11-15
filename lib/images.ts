import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { MENU, type ItemId } from "./menu";

export type PhotoMap = Record<ItemId, boolean>;

/** Which menu photos actually exist in /public. Missing food photos fall back to SVG art. */
export function availablePhotos(): PhotoMap {
  return Object.fromEntries(
    MENU.map((m) => [m.id, existsSync(path.join(process.cwd(), "public", m.image))]),
  ) as PhotoMap;
}
