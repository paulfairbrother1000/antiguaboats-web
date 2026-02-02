"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function GalleryCarousel({
  images,
  className = "",
  heightClass = "h-[520px]",
  caption = "Silver Lady • Nor-Tech Performance",
  ctaLabel = "Book Silver Lady",
  ctaHref = "/availability?charter=day",
}: {
  images: { url: string; alt?: string }[];
  className?: string;
  heightClass?: string;
  caption?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (safeImages.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setIdx((i) => (i + 1) % safeImages.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;

    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40; // px

    if (delta > threshold) {
      next(); // swipe left -> next
    } else if (delta < -threshold) {
      prev(); // swipe right -> prev
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const current = safeImages[idx];

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative overflow-hidden rounded-3xl border bg-white"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={current.url}
          alt={current.alt ?? `Image ${idx + 1}`}
          className={`${heightClass} w-full object-cover`}
        />

        {/* ✅ subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* ✅ caption (only render if provided) */}
        {caption ? (
          <div className="absolute left-5 bottom-5 flex items-center gap-3">
            <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 backdrop-blur">
              {caption}
            </div>
          </div>
        ) : null}

        {/* ✅ CTA button (only render if provided) */}
        {ctaHref && ctaLabel ? (
          <div className="absolute right-5 bottom-5">
            <Link
              href={ctaHref}
              className="inline-flex items-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-sky-700"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}

        {safeImages.length > 1 && (
          <>
            {/* Hide arrows on mobile; swipe is supported */}
            <button
              onClick={prev}
              className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-4 py-3 shadow hover:bg-white"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-4 py-3 shadow hover:bg-white"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === idx ? "bg-sky-600" : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
