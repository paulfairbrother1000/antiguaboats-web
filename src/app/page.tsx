import Link from "next/link";
import GalleryCarousel from "@/components/GalleryCarousel";
import CharterTiles from "@/components/CharterTiles";
import { SILVER_LADY_PHOTOS } from "@/lib/silverLadyPhotos";

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="overflow-hidden rounded-3xl border shadow-sm">
            <div className="relative">
              <img
                src="/antigua-hero.jpg"
                alt="Antigua waters"
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 sm:p-12 flex items-center">
                <div className="max-w-xl text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-sky-600" />
                    Premium speed boat charters • Jolly Harbour
                  </div>

                  <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold leading-tight">
                    Fast. Private.
                    <br />
                    <span className="text-sky-300">Unforgettable.</span>
                  </h1>

                  <p className="mt-4 text-white/90 text-base sm:text-lg">
                    Premium speedboat charters from Jolly Harbour — turquoise bays, iconic beaches,
                    and sunset runs in style.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/availability?charter=day"
                      className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
                    >
                      Check Availability
                    </Link>
                    <Link
                      href="/charters"
                      className="inline-flex items-center rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
                    >
                      View Charters
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MIDDLE THIRD: FULL-WIDTH CAROUSEL */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Meet <span className="text-sky-600">Silver Lady</span>
              </h2>
              <p className="mt-2 text-slate-600">
                A premium performance boat built for comfort, speed, and the best day on the water.
              </p>
            </div>
            <Link
              href="/charters/silver-lady"
              className="hidden sm:inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View The Boat
            </Link>
          </div>

          <div className="mt-6">
            <GalleryCarousel
              images={SILVER_LADY_PHOTOS}
              heightClass="h-[520px]"
              caption="Silver Lady • Nor-Tech Performance"
              ctaHref="/availability?charter=day"
              ctaLabel="Book Silver Lady"
            />
          </div>
        </div>
      </section>

      {/* BOTTOM THIRD: CHARTER TILES */}
      <CharterTiles />
    </main>
  );
}
