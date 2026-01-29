"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function BoatCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const clamp = useMemo(() => (n: number) => (n + images.length) % images.length, [images.length]);

  const startXRef = useRef<number | null>(null);
  const lastXRef = useRef<number | null>(null);
  const isTouchingRef = useRef(false);

  function go(delta: number) {
    setIndex((prev) => clamp(prev + delta));
  }

  function onTouchStart(e: React.TouchEvent) {
    isTouchingRef.current = true;
    const x = e.touches[0]?.clientX ?? 0;
    startXRef.current = x;
    lastXRef.current = x;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isTouchingRef.current) return;
    lastXRef.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd() {
    if (!isTouchingRef.current) return;
    isTouchingRef.current = false;

    const startX = startXRef.current;
    const lastX = lastXRef.current;

    startXRef.current = null;
    lastXRef.current = null;

    if (startX == null || lastX == null) return;

    const dx = lastX - startX;
    const threshold = 40;
    if (dx > threshold) go(-1);
    if (dx < -threshold) go(1);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamp]);

  return (
    <div className="relative">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[index]}
          alt={`Silver Lady photo ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        <button
          type="button"
          aria-label="Previous image"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white backdrop-blur hover:bg-black/55 md:inline-flex"
        >
          <span className="text-xl leading-none">‹</span>
        </button>

        <button
          type="button"
          aria-label="Next image"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white backdrop-blur hover:bg-black/55 md:inline-flex"
        >
          <span className="text-xl leading-none">›</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={[
              "h-2.5 w-2.5 rounded-full transition",
              i === index ? "bg-white" : "bg-white/25 hover:bg-white/40",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="mt-3 text-center text-sm text-white/60">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
