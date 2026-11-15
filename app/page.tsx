import { Display } from "@/components/display/Display";
import { availablePhotos } from "@/lib/images";

// Customer-facing monitor. Static: never touches the database.
export const dynamic = "force-static";

export default function Home() {
  return <Display photos={availablePhotos()} />;
}
