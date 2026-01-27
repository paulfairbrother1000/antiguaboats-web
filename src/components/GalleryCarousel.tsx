"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function GalleryCarousel({
  images,
  className = "",
  caption = "Silver Lady • Nor-Tech Performance",
  ctaHref = "/availability?charter=day",
  ctaLabel = "Book Silver Lady",
}: {
  images: { url: string; alt?: string }[];
  className?: string;
  caption?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  if (safeImages.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setIdx((i) => (i + 1) % safeImages.length);

  const current = safeImages[idx];

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <img
          src={current.url}
          alt={current.alt ?? `Image ${idx + 1}`}
          className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[520px]"
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>

        {/* Caption */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div className="text-white">
            <div className="text-sm font-semibold tracking-wide">{caption}</div>
            <div className="mt-1 text-xs text-white/85">
              Swipe or use arrows to browse photos
            </div>
          </div>

          {/* CTA button */}
          <Link
            href={ctaHref}
            className="pointer-events-auto inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-3 py-2 shadow hover:bg-white"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-3 py-2 shadow hover:bg-white"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots */}
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
