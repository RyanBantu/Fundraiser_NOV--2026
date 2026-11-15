import type { Metadata } from "next";
import { Tracker } from "@/components/tracker/Tracker";
import { availablePhotos } from "@/lib/images";

export const metadata: Metadata = { title: "Tracker · The Bantu's Stall" };

export default function TrackerPage() {
  return <Tracker photos={availablePhotos()} />;
}
