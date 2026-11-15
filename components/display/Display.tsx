"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STALL_NAME } from "@/lib/menu";
import type { PhotoMap } from "@/lib/images";
import { Carousel } from "./Carousel";
import { PendantCards } from "./PendantCards";
import { PriceBoard } from "./PriceBoard";

const IDLE_MS = 3000;

function CrossMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden>
      <rect x="8.5" y="0" width="7" height="32" rx="1.5" fill="currentColor" />
      <rect x="1" y="8" width="22" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function Display({ photos }: { photos: PhotoMap }) {
  const [idle, setIdle] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), IDLE_MS);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("mousedown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mousedown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  const showChrome = hover && !idle;

  return (
    <main
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative flex h-screen w-screen flex-col overflow-hidden bg-cream px-[2.4vw] pt-[2.2vh] pb-[2.6vh] ${idle ? "cursor-none" : ""}`}
    >
      {/* soft background glow */}
      <div className="pointer-events-none absolute -top-[30vh] -left-[10vw] h-[70vh] w-[60vw] rounded-full bg-gold-soft blur-[10vh]" />

      <header className="relative flex h-[9vh] shrink-0 items-center justify-between">
        <div className="flex items-center gap-[1.2vw]">
          <span className="flex h-[7vh] w-[7vh] items-center justify-center rounded-[1.8vh] bg-board text-gold shadow-md">
            <CrossMark className="h-[4.2vh]" />
          </span>
          <div>
            <h1 className="font-display text-[5.2vh] leading-none font-bold tracking-tight">{STALL_NAME}</h1>
            <p className="mt-[0.6vh] font-display text-[1.95vh] text-muted italic">
              “Taste and see that the Lord is good.” — Psalm 34:8
            </p>
          </div>
        </div>
        <div className="mr-[5vw] flex items-center gap-[0.8vw] rounded-full bg-white/80 px-[1.4vw] py-[1vh] shadow-sm ring-1 ring-line">
          <span className="pulse-dot h-[1.5vh] w-[1.5vh] rounded-full bg-ember" />
          <span className="text-[2vh] font-semibold">Grilling now</span>
        </div>
        <Link
          href="/tracker"
          className="absolute top-0 right-0 text-[1.4vh] font-medium text-muted/40 transition-colors hover:text-muted"
        >
          ₹ Tracker
        </Link>
      </header>

      <div className="relative mt-[2vh] grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-[1.8vw]">
        <div className="flex min-h-0 flex-col gap-[1.4vh]">
          <Carousel photos={photos} />
          <PendantCards photos={photos} />
        </div>
        <PriceBoard photos={photos} />
      </div>

      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        className={`absolute right-[1.2vw] bottom-[1.2vh] z-10 rounded-full bg-board/85 px-[1.4vh] py-[0.9vh] text-[1.6vh] font-semibold text-cream shadow-lg transition-opacity duration-300 ${
          showChrome ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        ⛶ Fullscreen
      </button>
    </main>
  );
}
