import { PENDANT_ITEMS, rupees } from "@/lib/menu";
import type { PhotoMap } from "@/lib/images";
import { ItemVisual } from "../ItemVisual";
import { CROSS_MODELS, FISH_MODELS, ModelArt } from "../ModelArt";

/** Two pendant cards that take turns popping (CSS-only, staggered 3s). */
export function PendantCards({ photos }: { photos: PhotoMap }) {
  return (
    <section className="grid min-h-0 flex-1 grid-cols-2 gap-[1.6vw] pt-[1.2vh]">
      {PENDANT_ITEMS.map((item, i) => {
        const model = item.id === "cross" ? CROSS_MODELS[1] : FISH_MODELS[0];
        return (
          <article
            key={item.id}
            className={`pendant-pop relative flex min-h-0 overflow-hidden rounded-[2vh] border border-line bg-white ${i === 1 ? "delay-3s" : ""}`}
          >
            <div className="relative h-full w-[38%] overflow-hidden">
              <ItemVisual
                item={item}
                hasPhoto={photos[item.id]}
                sizes="15vw"
                className="h-full w-full"
                imgClassName={`pendant-zoom ${i === 1 ? "delay-3s" : ""}`}
              />
            </div>
            <div className="relative flex min-w-0 flex-1 items-stretch">
              <div className="flex min-w-0 flex-1 flex-col justify-center py-[1.6vh] pl-[1.2vw]">
                <p className="text-[1.35vh] font-bold tracking-[0.24em] text-gold-deep uppercase">3D printed</p>
                <h3 className="mt-[0.4vh] font-display text-[2.7vh] leading-tight font-semibold">{item.name}</h3>
                <p className="mt-[1vh] font-display text-[4.2vh] leading-none font-bold text-ember">{rupees(item.price)}</p>
                <p className="mt-[0.8vh] text-[1.45vh] text-muted">Worn by {model.name}</p>
              </div>
              <div className="relative flex w-[42%] items-end justify-center bg-gradient-to-b from-cream to-gold-soft">
                <div className={`pendant-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgb(217_164_65/0.45),transparent_60%)] ${i === 1 ? "delay-3s" : ""}`} />
                <ModelArt look={model} className="relative h-[92%]" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
