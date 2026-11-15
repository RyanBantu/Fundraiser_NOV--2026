import Image from "next/image";
import { COMBO_SAVING, FOOD_ITEMS, PENDANT_ITEMS, rupees, type MenuItem } from "@/lib/menu";
import type { PhotoMap } from "@/lib/images";
import { CROSS_MODELS, ModelArt } from "../ModelArt";

function Row({ item, photo }: { item: MenuItem; photo?: boolean }) {
  const combo = item.id === "combo";
  return (
    <li
      className={`flex items-center gap-[1vw] rounded-[1.4vh] px-[1vw] py-[0.95vh] ${
        combo ? "bg-gold/15 ring-[0.25vh] ring-gold" : ""
      }`}
    >
      {photo !== undefined && (
        <span className="relative h-[5.2vh] w-[5.2vh] shrink-0 overflow-hidden rounded-full ring-[0.25vh] ring-gold/60">
          {photo ? (
            <Image src={item.image} alt="" fill sizes="6vh" className="object-cover" />
          ) : (
            <span className="block h-full w-full bg-board-line" />
          )}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-display text-[2.55vh] leading-tight text-cream">{item.name}</span>
        {combo && (
          <span className="mt-[0.4vh] inline-block rounded-full bg-ember px-[0.9vh] py-[0.2vh] text-[1.45vh] font-bold text-cream">
            Save {rupees(COMBO_SAVING)}
          </span>
        )}
      </span>
      <span className="mx-[0.4vw] h-0 min-w-[1vw] flex-1 border-b-[0.25vh] border-dotted border-board-line" />
      <span className={`font-display text-[3.4vh] font-bold ${combo ? "text-gold" : "text-cream"}`}>
        {rupees(item.price)}
      </span>
    </li>
  );
}

export function PriceBoard({ photos }: { photos: PhotoMap }) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[2.4vh] bg-board px-[1.6vw] py-[2.6vh] text-cream shadow-[0_1.4vh_4vh_rgb(42_30_22/0.3)]">
      <h2 className="font-display text-[4.2vh] leading-none font-semibold text-gold">Price board</h2>
      <p className="mt-[0.8vh] text-[1.6vh] text-cream/60">Every rupee goes to the fund.</p>

      <h3 className="mt-[2vh] mb-[0.4vh] text-[1.5vh] font-bold tracking-[0.3em] text-cream/55 uppercase">Food &amp; drinks</h3>
      <ul className="space-y-[0.4vh]">
        {FOOD_ITEMS.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>

      <h3 className="mt-[1.8vh] mb-[0.4vh] text-[1.5vh] font-bold tracking-[0.3em] text-cream/55 uppercase">3D-printed pendants</h3>
      <ul className="space-y-[0.4vh]">
        {PENDANT_ITEMS.map((item) => (
          <Row key={item.id} item={item} photo={photos[item.id]} />
        ))}
      </ul>

      {/* models strip: the cross, worn */}
      <div className="mt-[1.4vh] flex min-h-[8vh] flex-1 items-end justify-center gap-[0.4vw] overflow-hidden rounded-[1.6vh] bg-board-2">
        {CROSS_MODELS.map((m) => (
          <ModelArt key={m.name} look={m} className="h-full max-h-[15vh] min-w-0" glow={false} />
        ))}
      </div>

      <footer className="mt-[2vh] flex items-center justify-between gap-[1vw] border-t border-board-line pt-[2vh]">
        <p className="font-display text-[2.6vh] italic text-cream">God bless — thank you!</p>
        <div className="flex gap-[0.6vw]">
          <span className="rounded-full border border-cream/30 px-[1.3vh] py-[0.5vh] text-[1.7vh] font-semibold">Cash</span>
          <span className="rounded-full bg-gold px-[1.3vh] py-[0.5vh] text-[1.7vh] font-bold text-board">UPI</span>
        </div>
      </footer>
    </aside>
  );
}
