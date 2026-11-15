import Image from "next/image";
import type { MenuItem } from "@/lib/menu";
import { FoodArt } from "./FoodArt";
import { CROSS_MODELS, FISH_MODELS, ModelArt } from "./ModelArt";

/** Where the subject sits in each photo, so object-cover crops sensibly. */
const FOCUS: Record<string, string> = {
  cross: "50% 38%",
  fish: "47% 62%",
};

export function ItemVisual({
  item,
  hasPhoto,
  sizes,
  className = "",
  imgClassName = "",
  priority = false,
}: {
  item: MenuItem;
  hasPhoto: boolean;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  if (hasPhoto) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imgClassName}`}
          style={{ objectPosition: FOCUS[item.id] ?? "50% 50%" }}
        />
      </div>
    );
  }
  if (item.id === "cross" || item.id === "fish") {
    const look = (item.id === "cross" ? CROSS_MODELS : FISH_MODELS)[0];
    return (
      <div className={`relative flex items-end justify-center overflow-hidden bg-gold-soft ${className}`}>
        <ModelArt look={look} className={`h-full ${imgClassName}`} />
      </div>
    );
  }
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-gold-soft to-paper ${className}`}>
      <FoodArt id={item.id} className={`h-[88%] w-[88%] ${imgClassName}`} />
    </div>
  );
}
