"use client";

import { useEffect, useState } from "react";
import { COMBO_SAVING, MENU, rupees } from "@/lib/menu";
import type { PhotoMap } from "@/lib/images";
import { ItemVisual } from "../ItemVisual";
import { CROSS_MODELS, FISH_MODELS, ModelArt } from "../ModelArt";

const SLIDE_MS = 5000;

export function Carousel({ photos }: { photos: PhotoMap }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % MENU.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <section className="relative flex-[1.8] min-h-0 overflow-hidden rounded-[2.4vh] bg-paper shadow-[0_1vh_3vh_rgb(42_30_22/0.12)]">
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {MENU.map((item, i) => {
          const isPendant = item.group === "3D print";
          const models = item.id === "cross" ? CROSS_MODELS : FISH_MODELS;
          return (
            <div key={item.id} className="relative h-full w-full shrink-0" aria-hidden={i !== index}>
              {isPendant ? (
                <div className="flex h-full">
                  <ItemVisual item={item} hasPhoto={photos[item.id]} sizes="35vw" className="h-full w-[46%]" priority={i === 0} />
                  {/* Models wearing the pendant */}
                  <div className="relative flex h-full flex-1 flex-col bg-gradient-to-b from-gold-soft to-paper px-[1.4vw] pt-[2.4vh] pr-[17vh]">
                    <p className="font-sans text-[1.6vh] font-bold tracking-[0.3em] text-gold-deep uppercase">As worn by</p>
                    <p className="font-display text-[2.4vh] text-ink/80 italic">
                      {models.slice(0, item.id === "cross" ? 3 : 2).map((m) => m.name).join(" · ")}
                    </p>
                    <div className="-mr-[15vh] flex min-h-0 flex-1 items-end justify-center gap-[0.4vw]">
                      {models.slice(0, item.id === "cross" ? 3 : 2).map((m, mi) => (
                        <figure key={m.name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                          <ModelArt
                            look={m}
                            className={`w-full ${mi === 1 && models.length > 2 ? "max-h-[96%]" : "max-h-[84%]"}`}
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <ItemVisual item={item} hasPhoto={photos[item.id]} sizes="60vw" className="h-full w-full" priority={i === 0} />
              )}

              {/* caption */}
              <div
                className={`absolute bottom-0 left-0 bg-gradient-to-t from-[rgb(30_24_20/0.88)] via-[rgb(30_24_20/0.55)] to-transparent px-[2.4vw] pt-[8vh] pb-[3.2vh] text-cream ${
                  isPendant ? "w-[46%]" : "right-0"
                }`}
              >
                <p className="font-sans text-[1.6vh] font-semibold tracking-[0.28em] text-gold uppercase">
                  {isPendant ? "3D-printed pendant" : item.group}
                </p>
                <h2 className="mt-[0.6vh] font-display text-[5vh] leading-[1.02] font-semibold">{item.name}</h2>
                <p className={`mt-[0.8vh] text-[2vh] text-cream/85 ${isPendant ? "" : "max-w-[70%]"}`}>{item.blurb}</p>
              </div>

              {/* price badge */}
              <div className="absolute top-[2.4vh] right-[1.6vw] flex flex-col items-center">
                <div className="flex h-[14vh] w-[14vh] flex-col items-center justify-center rounded-full bg-gold text-board shadow-[0_1vh_2.4vh_rgb(42_30_22/0.35)] ring-[0.6vh] ring-cream/70">
                  <span className="font-display text-[5.4vh] leading-none font-bold">{rupees(item.price)}</span>
                </div>
                {item.id === "combo" && (
                  <span className="-mt-[1.4vh] rounded-full bg-ember px-[1.2vh] py-[0.5vh] text-[1.7vh] font-bold text-cream shadow">
                    Save {rupees(COMBO_SAVING)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* dots */}
      <div className="absolute right-[2vw] bottom-[3.4vh] flex gap-[0.8vh]">
        {MENU.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-label={`Show ${m.name}`}
            onClick={() => setIndex(i)}
            className={`h-[1.1vh] rounded-full transition-all duration-500 ${i === index ? "w-[3.6vh] bg-gold" : "w-[1.1vh] bg-cream/55"}`}
          />
        ))}
      </div>

      {/* progress */}
      <div className="absolute inset-x-0 bottom-0 h-[0.7vh] bg-board/40">
        <div key={index} className="progress-bar h-full bg-gold" style={{ animationDuration: `${SLIDE_MS}ms` }} />
      </div>
    </section>
  );
}
